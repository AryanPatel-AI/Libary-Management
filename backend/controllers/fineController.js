const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');
const { recordAuditLog } = require('../services/auditService');

function formatFine(fine) {
  return {
    id: fine.id,
    _id: fine.id, // For backward compatibility
    amount: fine.amountCents / 100,
    amountCents: fine.amountCents,
    balance: fine.balanceCents / 100,
    balanceCents: fine.balanceCents,
    paid: fine.status === 'PAID',
    status: fine.status.toLowerCase(),
    reason: fine.reason,
    notes: fine.notes || '',
    assessedAt: fine.assessedAt,
    user: fine.member && fine.member.user ? {
      _id: fine.member.user.id,
      name: `${fine.member.user.firstName} ${fine.member.user.lastName}`.trim(),
      email: fine.member.user.email,
      memberNumber: fine.member.memberNumber
    } : null,
    member: fine.member,
    transaction: fine.loan ? {
      _id: fine.loan.id,
      id: fine.loan.id,
      book: fine.loan.copy && fine.loan.copy.book ? {
        title: fine.loan.copy.book.title,
        author: fine.loan.copy.book.authors ? fine.loan.copy.book.authors.map(a => a.author.name).join(', ') : '',
        isbn: fine.loan.copy.book.isbn13
      } : null,
      copy: fine.loan.copy ? { barcode: fine.loan.copy.barcode } : null,
      dueDate: fine.loan.dueAt,
      returnDate: fine.loan.returnedAt
    } : null,
    payments: fine.payments || [],
    createdAt: fine.createdAt
  };
}

// @desc    Get logged-in user's fines
// @route   GET /api/fines/my-fines
// @access  Private (Member)
const getMyFines = asyncHandler(async (req, res) => {
  const member = await prisma.member.findUnique({
    where: { userId: req.user.id }
  });

  if (!member) {
    return res.json({
      success: true,
      data: { fines: [], totalUnpaidAmount: 0, page: 1, pages: 1, total: 0 }
    });
  }

  const fines = await prisma.fine.findMany({
    where: { memberId: member.id },
    include: {
      loan: {
        include: {
          copy: {
            include: {
              book: { include: { authors: { include: { author: true } } } }
            }
          }
        }
      },
      payments: true
    },
    orderBy: { createdAt: 'desc' }
  });

  const totalUnpaidCents = fines
    .filter((f) => f.status === 'UNPAID' || f.status === 'PARTIALLY_PAID')
    .reduce((acc, f) => acc + f.balanceCents, 0);

  res.json({
    success: true,
    data: {
      fines: fines.map(formatFine),
      totalUnpaidAmount: totalUnpaidCents / 100,
      page: 1,
      pages: 1,
      total: fines.length
    }
  });
});

// @desc    Get all fines with filters (Admin/Staff)
// @route   GET /api/fines
// @access  Private (Staff/Admin)
const getFines = asyncHandler(async (req, res) => {
  const { status, paid, search, page = 1, limit = 20 } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const where = {};
  if (status) where.status = status.toUpperCase();
  if (paid !== undefined) {
    where.status = paid === 'true' ? 'PAID' : { in: ['UNPAID', 'PARTIALLY_PAID'] };
  }

  if (search) {
    where.member = {
      OR: [
        { memberNumber: { contains: search, mode: 'insensitive' } },
        { user: { firstName: { contains: search, mode: 'insensitive' } } },
        { user: { lastName: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ]
    };
  }

  const [total, fines] = await Promise.all([
    prisma.fine.count({ where }),
    prisma.fine.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        member: { include: { user: true, memberType: true } },
        loan: {
          include: {
            copy: {
              include: {
                book: { include: { authors: { include: { author: true } } } }
              }
            }
          }
        },
        payments: true
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  res.json({
    success: true,
    data: fines.map(formatFine),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

// @desc    Collect fine payment (Full or Partial)
// @route   POST /api/fines/:id/pay
// @access  Private (Staff or Member Self-Pay)
const payFine = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { amount, paymentMethod = 'CASH', transactionReference, notes } = req.body;

  const fine = await prisma.fine.findUnique({
    where: { id },
    include: { member: true }
  });

  if (!fine) {
    res.status(404);
    throw new Error('Fine record not found');
  }

  if (fine.status === 'PAID' || fine.status === 'WAIVED') {
    res.status(400);
    throw new Error(`Fine is already ${fine.status.toLowerCase()}`);
  }

  // Calculate payment amount in cents
  const paymentCents = amount ? Math.round(parseFloat(amount) * 100) : fine.balanceCents;

  if (paymentCents <= 0) {
    res.status(400);
    throw new Error('Payment amount must be greater than zero');
  }

  if (paymentCents > fine.balanceCents) {
    res.status(400);
    throw new Error(`Payment ($${(paymentCents / 100).toFixed(2)}) exceeds remaining fine balance ($${(fine.balanceCents / 100).toFixed(2)})`);
  }

  const updatedFine = await prisma.$transaction(async (tx) => {
    const newBalance = fine.balanceCents - paymentCents;
    const newStatus = newBalance === 0 ? 'PAID' : 'PARTIALLY_PAID';

    // 1. Record payment transaction
    await tx.finePayment.create({
      data: {
        fineId: fine.id,
        processedByUserId: req.user.id,
        amountCents: paymentCents,
        paymentMethod: paymentMethod.toUpperCase(),
        transactionReference: transactionReference || null,
        notes: notes || null
      }
    });

    // 2. Update fine balance & status
    const updated = await tx.fine.update({
      where: { id: fine.id },
      data: {
        balanceCents: newBalance,
        status: newStatus,
        resolvedAt: newStatus === 'PAID' ? new Date() : null
      },
      include: {
        member: { include: { user: true } },
        loan: { include: { copy: { include: { book: true } } } },
        payments: true
      }
    });

    // 3. Decrement member total fine balance
    await tx.member.update({
      where: { id: fine.memberId },
      data: { totalFinesDueCents: { decrement: paymentCents } }
    });

    return updated;
  });

  await recordAuditLog({
    actorId: req.user.id,
    actorEmail: req.user.email,
    entityType: 'FINE',
    entityId: fine.id,
    action: 'FINE_PAYMENT_COLLECTED',
    afterState: { paymentCents, newBalanceCents: updatedFine.balanceCents, status: updatedFine.status },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: `Payment of $${(paymentCents / 100).toFixed(2)} recorded successfully`,
    data: formatFine(updatedFine)
  });
});

// @desc    Waive a fine with justification
// @route   POST /api/fines/:id/waive
// @access  Private (Admin/Librarian)
const waiveFine = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  if (!reason || reason.trim().length < 5) {
    res.status(400);
    throw new Error('A detailed justification reason is required to waive fines');
  }

  const fine = await prisma.fine.findUnique({
    where: { id },
    include: { member: true }
  });

  if (!fine) {
    res.status(404);
    throw new Error('Fine not found');
  }

  if (fine.status === 'PAID' || fine.status === 'WAIVED') {
    res.status(400);
    throw new Error(`Fine is already ${fine.status.toLowerCase()}`);
  }

  const waivedAmount = fine.balanceCents;

  const updatedFine = await prisma.$transaction(async (tx) => {
    // 1. Record waiver payment
    await tx.finePayment.create({
      data: {
        fineId: fine.id,
        processedByUserId: req.user.id,
        amountCents: waivedAmount,
        paymentMethod: 'WAIVER',
        notes: `Waived by ${req.user.firstName} ${req.user.lastName}: ${reason.trim()}`
      }
    });

    // 2. Set balance to 0 and status WAIVED
    const updated = await tx.fine.update({
      where: { id: fine.id },
      data: {
        balanceCents: 0,
        status: 'WAIVED',
        resolvedAt: new Date(),
        notes: `${fine.notes ? fine.notes + ' | ' : ''}WAIVER REASON: ${reason.trim()}`
      },
      include: {
        member: { include: { user: true } },
        loan: { include: { copy: { include: { book: true } } } },
        payments: true
      }
    });

    // 3. Decrement member total fine
    await tx.member.update({
      where: { id: fine.memberId },
      data: { totalFinesDueCents: { decrement: waivedAmount } }
    });

    return updated;
  });

  await recordAuditLog({
    actorId: req.user.id,
    actorEmail: req.user.email,
    entityType: 'FINE',
    entityId: fine.id,
    action: 'FINE_WAIVED',
    beforeState: { balanceCents: waivedAmount },
    afterState: { status: 'WAIVED', reason: reason.trim() },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: `Fine of $${(waivedAmount / 100).toFixed(2)} waived successfully`,
    data: formatFine(updatedFine)
  });
});

module.exports = {
  getMyFines,
  getFines,
  payFine,
  waiveFine
};
