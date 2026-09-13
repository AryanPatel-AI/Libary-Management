const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');
const { getEffectivePolicy, calculateOverdueFine } = require('../services/policyEngine');
const { recordAuditLog } = require('../services/auditService');

/**
 * Format loan record for response
 */
function formatLoan(loan) {
  const isOverdue = loan.status === 'ACTIVE' && new Date() > new Date(loan.dueAt);
  return {
    id: loan.id,
    _id: loan.id, // For backward compatibility
    user: loan.member && loan.member.user ? {
      _id: loan.member.user.id,
      name: `${loan.member.user.firstName} ${loan.member.user.lastName}`.trim(),
      email: loan.member.user.email,
      memberNumber: loan.member.memberNumber
    } : null,
    member: loan.member ? {
      id: loan.member.id,
      memberNumber: loan.member.memberNumber,
      memberType: loan.member.memberType ? loan.member.memberType.name : 'STUDENT'
    } : null,
    book: loan.copy && loan.copy.book ? {
      _id: loan.copy.book.id,
      id: loan.copy.book.id,
      title: loan.copy.book.title,
      isbn: loan.copy.book.isbn13,
      coverImageUrl: loan.copy.book.coverImageUrl,
      image: loan.copy.book.coverImageUrl
    } : null,
    copy: loan.copy ? {
      id: loan.copy.id,
      barcode: loan.copy.barcode,
      accessionNumber: loan.copy.accessionNumber,
      status: loan.copy.status,
      shelf: loan.copy.shelf ? loan.copy.shelf.shelfCode : null,
      branch: loan.copy.branch ? loan.copy.branch.name : null
    } : null,
    issueDate: loan.issuedAt,
    issuedAt: loan.issuedAt,
    dueDate: loan.dueAt,
    dueAt: loan.dueAt,
    returnDate: loan.returnedAt,
    returnedAt: loan.returnedAt,
    renewedCount: loan.renewedCount,
    status: isOverdue ? 'overdue' : (loan.status === 'ACTIVE' ? 'issued' : loan.status.toLowerCase()),
    fine: loan.fines && loan.fines.length > 0 ? (loan.fines.reduce((acc, f) => acc + f.amountCents, 0) / 100) : 0,
    fines: loan.fines || [],
    createdAt: loan.createdAt,
    updatedAt: loan.updatedAt
  };
}

// @desc    Issue book / Fast checkout at circulation desk
// @route   POST /api/transactions/issue OR POST /api/circulation/checkout
// @access  Private (Staff/Admin)
const issueBook = asyncHandler(async (req, res) => {
  const { barcode, copyId, memberNumber, memberId, userId } = req.body;

  if (!barcode && !copyId) {
    res.status(400);
    throw new Error('Please provide copy barcode or copy ID');
  }

  if (!memberNumber && !memberId && !userId) {
    res.status(400);
    throw new Error('Please provide member number or member ID');
  }

  // 1. Resolve Member Record
  let member;
  if (memberNumber) {
    member = await prisma.member.findUnique({
      where: { memberNumber: memberNumber.trim() },
      include: { user: true, memberType: true, homeBranch: true }
    });
  } else if (memberId) {
    member = await prisma.member.findUnique({
      where: { id: memberId },
      include: { user: true, memberType: true, homeBranch: true }
    });
  } else if (userId) {
    member = await prisma.member.findUnique({
      where: { userId },
      include: { user: true, memberType: true, homeBranch: true }
    });
  }

  if (!member) {
    res.status(404);
    throw new Error('Library member not found. Please verify member card or number.');
  }

  // Check member status
  if (member.status !== 'ACTIVE') {
    res.status(403);
    throw new Error(`Member account is currently ${member.status.toLowerCase()}. Checkout not permitted.`);
  }

  if (new Date() > new Date(member.expiresAt)) {
    res.status(403);
    throw new Error('Membership has expired. Please renew membership before borrowing.');
  }

  // Check outstanding fines block threshold ($10 / 1000 cents)
  if (member.totalFinesDueCents > 1000) {
    res.status(403);
    throw new Error(`Outstanding fines exceed limit ($${(member.totalFinesDueCents / 100).toFixed(2)} due). Fines must be settled first.`);
  }

  // 2. Fetch circulation policy
  const policy = await getEffectivePolicy(member.memberTypeId, member.homeBranchId);

  // Check active loan limit
  const activeLoansCount = await prisma.loan.count({
    where: { memberId: member.id, status: 'ACTIVE' }
  });

  if (activeLoansCount >= policy.maxLoans) {
    res.status(400);
    throw new Error(`Borrowing limit reached. Member cannot borrow more than ${policy.maxLoans} books.`);
  }

  // 3. Concurrency-safe atomic checkout inside transaction
  const result = await prisma.$transaction(async (tx) => {
    // Find copy
    const copyQuery = barcode ? { barcode: barcode.trim().toUpperCase() } : { id: copyId };
    const copy = await tx.bookCopy.findUnique({
      where: copyQuery,
      include: { book: true, branch: true }
    });

    if (!copy) {
      throw new Error(`Book copy ${barcode || copyId} not found`);
    }

    // If copy is RESERVED, verify it is reserved for this specific member
    if (copy.status === 'RESERVED') {
      const activeReservation = await tx.reservation.findFirst({
        where: { allocatedCopyId: copy.id, status: 'READY_FOR_PICKUP' }
      });
      if (activeReservation && activeReservation.memberId !== member.id) {
        throw new Error('This copy is currently held for another member in the reservation queue.');
      }
    } else if (copy.status !== 'AVAILABLE') {
      throw new Error(`Book copy is not available (Current status: ${copy.status}).`);
    }

    // Calculate due date
    const dueAt = new Date();
    dueAt.setDate(dueAt.getDate() + policy.loanPeriodDays);

    // Create active loan
    const loan = await tx.loan.create({
      data: {
        copyId: copy.id,
        memberId: member.id,
        issuedByUserId: req.user.id,
        dueAt,
        status: 'ACTIVE'
      }
    });

    // Mark copy as ON_LOAN with atomic concurrency check
    const allowedStatuses = copy.status === 'RESERVED' ? ['RESERVED'] : ['AVAILABLE'];
    const lockResult = await tx.bookCopy.updateMany({
      where: {
        id: copy.id,
        status: { in: allowedStatuses }
      },
      data: {
        status: 'ON_LOAN',
        version: { increment: 1 }
      }
    });

    if (lockResult.count === 0) {
      throw new Error('Book copy is no longer available (concurrently acquired by another session).');
    }

    // If this fulfills an active reservation for this member, mark it fulfilled
    await tx.reservation.updateMany({
      where: {
        bookId: copy.bookId,
        memberId: member.id,
        status: { in: ['PENDING', 'READY_FOR_PICKUP'] }
      },
      data: {
        status: 'FULFILLED',
        fulfilledAt: new Date(),
        allocatedCopyId: null
      }
    });

    return await tx.loan.findUnique({
      where: { id: loan.id },
      include: {
        copy: { include: { book: true, branch: true, shelf: true } },
        member: { include: { user: true, memberType: true } },
        fines: true
      }
    });
  });

  await recordAuditLog({
    actorId: req.user.id,
    actorEmail: req.user.email,
    entityType: 'LOAN',
    entityId: result.id,
    action: 'BOOK_ISSUED',
    afterState: { copyBarcode: result.copy.barcode, memberNumber: member.memberNumber, dueAt: result.dueAt },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.status(201).json({
    success: true,
    message: `Book '${result.copy.book.title}' successfully issued to ${member.user.firstName} ${member.user.lastName}`,
    data: formatLoan(result)
  });
});

// @desc    Return book / Fast checkin at circulation desk
// @route   POST /api/transactions/return OR POST /api/circulation/checkin
// @access  Private (Staff/Admin)
const returnBook = asyncHandler(async (req, res) => {
  const { barcode, copyId, transactionId } = req.body;

  if (!barcode && !copyId && !transactionId) {
    res.status(400);
    throw new Error('Please provide copy barcode, copy ID, or transaction ID');
  }

  const returnResult = await prisma.$transaction(async (tx) => {
    // 1. Locate active loan
    let loan;
    if (transactionId) {
      loan = await tx.loan.findUnique({
        where: { id: transactionId },
        include: {
          copy: { include: { book: true, branch: true } },
          member: { include: { user: true, memberType: true } }
        }
      });
    } else {
      const copy = await tx.bookCopy.findUnique({
        where: barcode ? { barcode: barcode.trim().toUpperCase() } : { id: copyId }
      });

      if (!copy) {
        throw new Error(`Book copy not found`);
      }

      loan = await tx.loan.findFirst({
        where: { copyId: copy.id, status: 'ACTIVE' },
        include: {
          copy: { include: { book: true, branch: true } },
          member: { include: { user: true, memberType: true } }
        }
      });
    }

    if (!loan || loan.status !== 'ACTIVE') {
      throw new Error('No active loan found for this book copy');
    }

    // 2. Calculate overdue fines via Policy Engine
    const policy = await getEffectivePolicy(loan.member.memberTypeId, loan.copy.branchId);
    const returnDate = new Date();
    const fineCalculation = calculateOverdueFine(loan.dueAt, returnDate, policy);

    let assessedFine = null;
    if (fineCalculation.fineCents > 0) {
      assessedFine = await tx.fine.create({
        data: {
          loanId: loan.id,
          memberId: loan.memberId,
          assessedByUserId: req.user.id,
          amountCents: fineCalculation.fineCents,
          balanceCents: fineCalculation.fineCents,
          status: 'UNPAID',
          reason: 'OVERDUE',
          notes: `Late return by ${fineCalculation.billableDays} days (Due: ${loan.dueAt.toISOString().split('T')[0]})`
        }
      });

      // Update member total fines due
      await tx.member.update({
        where: { id: loan.memberId },
        data: { totalFinesDueCents: { increment: fineCalculation.fineCents } }
      });
    }

    // 3. Mark loan RETURNED
    const updatedLoan = await tx.loan.update({
      where: { id: loan.id },
      data: {
        status: 'RETURNED',
        returnedAt: returnDate,
        returnedByUserId: req.user.id
      },
      include: {
        copy: { include: { book: true, branch: true, shelf: true } },
        member: { include: { user: true, memberType: true } },
        fines: true
      }
    });

    // 4. Check Reservation Queue for this book
    const nextReservation = await tx.reservation.findFirst({
      where: {
        bookId: loan.copy.bookId,
        status: 'PENDING'
      },
      orderBy: { queuePosition: 'asc' },
      include: { member: { include: { user: true } } }
    });

    if (nextReservation) {
      // Allocate this copy to the reserving member for pickup within 48 hours
      const readyUntil = new Date(Date.now() + 48 * 60 * 60 * 1000);
      await tx.reservation.update({
        where: { id: nextReservation.id },
        data: {
          allocatedCopyId: loan.copyId,
          status: 'READY_FOR_PICKUP',
          readyUntil
        }
      });

      // Set copy to RESERVED
      await tx.bookCopy.update({
        where: { id: loan.copyId },
        data: { status: 'RESERVED', version: { increment: 1 } }
      });

      // Create notification for member
      await tx.notification.create({
        data: {
          userId: nextReservation.member.userId,
          title: '📖 Book Ready for Pickup!',
          message: `Your reserved book '${loan.copy.book.title}' is now ready for pickup at ${loan.copy.branch.name}. Please collect it by ${readyUntil.toLocaleDateString()}.`,
          channel: 'IN_APP',
          eventType: 'RESERVATION_READY',
          payload: { bookId: loan.copy.bookId, copyBarcode: loan.copy.barcode, readyUntil }
        }
      });
    } else {
      // Return copy to AVAILABLE
      await tx.bookCopy.update({
        where: { id: loan.copyId },
        data: { status: 'AVAILABLE', version: { increment: 1 } }
      });
    }

    return {
      loan: updatedLoan,
      fine: assessedFine,
      nextReservation
    };
  });

  await recordAuditLog({
    actorId: req.user.id,
    actorEmail: req.user.email,
    entityType: 'LOAN',
    entityId: returnResult.loan.id,
    action: 'BOOK_RETURNED',
    afterState: {
      copyBarcode: returnResult.loan.copy.barcode,
      fineAssessedCents: returnResult.fine ? returnResult.fine.amountCents : 0,
      reservedForNextMember: Boolean(returnResult.nextReservation)
    },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: returnResult.fine
      ? `Book returned. Overdue fine assessed: $${(returnResult.fine.amountCents / 100).toFixed(2)}`
      : 'Book successfully returned with no fines',
    data: formatLoan(returnResult.loan),
    fineAssessed: returnResult.fine ? (returnResult.fine.amountCents / 100) : 0,
    reservationTriggered: Boolean(returnResult.nextReservation)
  });
});

// @desc    Renew an active book loan
// @route   POST /api/transactions/:id/renew
// @access  Private (Staff/Member self-renew)
const renewBook = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const loan = await prisma.loan.findUnique({
    where: { id },
    include: {
      copy: { include: { book: true, branch: true } },
      member: { include: { user: true, memberType: true } }
    }
  });

  if (!loan || loan.status !== 'ACTIVE') {
    res.status(404);
    throw new Error('Active loan not found');
  }

  // Authorization check: Staff/Admin or the member who owns this loan
  const isOwner = req.user.member && req.user.member.id === loan.memberId;
  const isStaff = req.user.roles.includes('SUPER_ADMIN') || req.user.roles.includes('LIBRARIAN') || req.user.roles.includes('CIRCULATION_STAFF');

  if (!isOwner && !isStaff) {
    res.status(403);
    throw new Error('Not authorized to renew this loan');
  }

  // Check if renewal limit reached
  const policy = await getEffectivePolicy(loan.member.memberTypeId, loan.copy.branchId);
  if (loan.renewedCount >= policy.maxRenewals) {
    res.status(400);
    throw new Error(`Maximum renewals (${policy.maxRenewals}) reached for this book.`);
  }

  // Check if book has a pending reservation waitlist
  const pendingHold = await prisma.reservation.findFirst({
    where: { bookId: loan.copy.bookId, status: 'PENDING' }
  });

  if (pendingHold) {
    res.status(400);
    throw new Error('Cannot renew: Other patrons are waiting in the reservation queue for this book.');
  }

  // Renew loan
  const newDueDate = new Date(loan.dueAt);
  newDueDate.setDate(newDueDate.getDate() + policy.loanPeriodDays);

  const renewedLoan = await prisma.loan.update({
    where: { id },
    data: {
      dueAt: newDueDate,
      renewedCount: { increment: 1 }
    },
    include: {
      copy: { include: { book: true, branch: true, shelf: true } },
      member: { include: { user: true, memberType: true } },
      fines: true
    }
  });

  await recordAuditLog({
    actorId: req.user.id,
    actorEmail: req.user.email,
    entityType: 'LOAN',
    entityId: id,
    action: 'BOOK_RENEWED',
    afterState: { newDueDate, renewedCount: renewedLoan.renewedCount },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: `Loan renewed successfully. New due date: ${newDueDate.toLocaleDateString()}`,
    data: formatLoan(renewedLoan)
  });
});

// @desc    Get all loans / circulation records with filters & search
// @route   GET /api/transactions
// @access  Private (Staff/Admin)
const getTransactions = asyncHandler(async (req, res) => {
  const { status, memberId, barcode, page = 1, limit = 20 } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const where = {};
  if (status === 'issued' || status === 'ACTIVE') where.status = 'ACTIVE';
  else if (status === 'returned' || status === 'RETURNED') where.status = 'RETURNED';
  else if (status === 'overdue') {
    where.status = 'ACTIVE';
    where.dueAt = { lt: new Date() };
  }

  if (memberId) where.memberId = memberId;
  if (barcode) where.copy = { barcode: barcode.trim().toUpperCase() };

  const [total, loans] = await Promise.all([
    prisma.loan.count({ where }),
    prisma.loan.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        copy: { include: { book: true, branch: true, shelf: true } },
        member: { include: { user: true, memberType: true } },
        fines: true
      },
      orderBy: { issuedAt: 'desc' }
    })
  ]);

  res.json({
    success: true,
    data: loans.map(formatLoan),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// @desc    Get current user's loans & history
// @route   GET /api/transactions/my-transactions
// @access  Private (Member)
const getMyTransactions = asyncHandler(async (req, res) => {
  // Find member record for current user
  const member = await prisma.member.findUnique({
    where: { userId: req.user.id }
  });

  if (!member) {
    return res.json({ success: true, data: [] });
  }

  const loans = await prisma.loan.findMany({
    where: { memberId: member.id },
    include: {
      copy: { include: { book: true, branch: true, shelf: true } },
      member: { include: { user: true, memberType: true } },
      fines: true
    },
    orderBy: { issuedAt: 'desc' }
  });

  res.json({
    success: true,
    data: loans.map(formatLoan)
  });
});

// @desc    Get dashboard circulation statistics
// @route   GET /api/transactions/stats
// @access  Private (Staff/Admin)
const getTransactionStats = asyncHandler(async (req, res) => {
  const [totalIssued, activeLoans, overdueLoans, totalReturned] = await Promise.all([
    prisma.loan.count(),
    prisma.loan.count({ where: { status: 'ACTIVE' } }),
    prisma.loan.count({ where: { status: 'ACTIVE', dueAt: { lt: new Date() } } }),
    prisma.loan.count({ where: { status: 'RETURNED' } })
  ]);

  res.json({
    success: true,
    data: {
      totalIssued,
      activeLoans,
      overdueLoans,
      totalReturned
    }
  });
});

module.exports = {
  issueBook,
  returnBook,
  renewBook,
  getTransactions,
  getMyTransactions,
  getTransactionStats
};
