const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');
const { recordAuditLog } = require('../services/auditService');

function formatReservation(resRecord) {
  return {
    id: resRecord.id,
    _id: resRecord.id, // For backward compatibility
    book: resRecord.book ? {
      id: resRecord.book.id,
      _id: resRecord.book.id,
      title: resRecord.book.title,
      isbn: resRecord.book.isbn13,
      coverImageUrl: resRecord.book.coverImageUrl,
      image: resRecord.book.coverImageUrl
    } : null,
    user: resRecord.member && resRecord.member.user ? {
      _id: resRecord.member.user.id,
      name: `${resRecord.member.user.firstName} ${resRecord.member.user.lastName}`.trim(),
      email: resRecord.member.user.email,
      memberNumber: resRecord.member.memberNumber
    } : null,
    member: resRecord.member,
    branch: resRecord.pickupBranch ? {
      id: resRecord.pickupBranch.id,
      name: resRecord.pickupBranch.name
    } : null,
    allocatedCopy: resRecord.allocatedCopy ? {
      barcode: resRecord.allocatedCopy.barcode,
      shelf: resRecord.allocatedCopy.shelf ? resRecord.allocatedCopy.shelf.shelfCode : null
    } : null,
    queuePosition: resRecord.queuePosition,
    status: resRecord.status.toLowerCase(),
    reservedAt: resRecord.reservedAt,
    readyUntil: resRecord.readyUntil,
    fulfilledAt: resRecord.fulfilledAt,
    createdAt: resRecord.createdAt
  };
}

// @desc    Reserve a book / Place on hold
// @route   POST /api/reservations
// @access  Private (Member)
const reserveBook = asyncHandler(async (req, res) => {
  const { bookId, branchId } = req.body;

  if (!bookId) {
    res.status(400);
    throw new Error('Book ID is required');
  }

  // Find member record for current user
  let member = await prisma.member.findUnique({
    where: { userId: req.user.id }
  });

  if (!member) {
    res.status(400);
    throw new Error('Member profile not found. Please register as a library patron.');
  }

  const book = await prisma.book.findUnique({
    where: { id: bookId },
    include: { copies: true }
  });

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  // Check if any copies are AVAILABLE right now
  const availableCopies = book.copies.filter((c) => c.status === 'AVAILABLE');
  if (availableCopies.length > 0) {
    // Only block if there is no pending hold queue
    const pendingHolds = await prisma.reservation.count({
      where: { bookId, status: { in: ['PENDING', 'READY_FOR_PICKUP'] } }
    });
    if (availableCopies.length > pendingHolds) {
      res.status(400);
      throw new Error('Copies of this book are currently available on shelf. You can borrow directly!');
    }
  }

  // Check if member already has an active reservation for this book
  const existingReservation = await prisma.reservation.findFirst({
    where: {
      bookId,
      memberId: member.id,
      status: { in: ['PENDING', 'READY_FOR_PICKUP'] }
    }
  });

  if (existingReservation) {
    res.status(400);
    throw new Error(`You already have an active hold on this book (Position #${existingReservation.queuePosition}).`);
  }

  // Count existing pending holds to determine queue position
  const currentQueueLength = await prisma.reservation.count({
    where: { bookId, status: 'PENDING' }
  });

  const pickupBranchId = branchId || member.homeBranchId;

  const reservation = await prisma.reservation.create({
    data: {
      bookId,
      memberId: member.id,
      pickupBranchId,
      queuePosition: currentQueueLength + 1,
      status: 'PENDING'
    },
    include: {
      book: true,
      member: { include: { user: true } },
      pickupBranch: true
    }
  });

  await recordAuditLog({
    actorId: req.user.id,
    actorEmail: req.user.email,
    entityType: 'RESERVATION',
    entityId: reservation.id,
    action: 'RESERVATION_PLACED',
    afterState: { bookTitle: book.title, queuePosition: reservation.queuePosition },
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.status(201).json({
    success: true,
    message: `Reservation placed successfully! You are #${reservation.queuePosition} in the waitlist.`,
    data: formatReservation(reservation)
  });
});

// @desc    Cancel a reservation & re-index queue
// @route   DELETE /api/reservations/:id
// @access  Private (Owner or Staff)
const cancelReservation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const reservation = await prisma.reservation.findUnique({
    where: { id },
    include: { member: true }
  });

  if (!reservation) {
    res.status(404);
    throw new Error('Reservation not found');
  }

  const isOwner = req.user.member && req.user.member.id === reservation.memberId;
  const isStaff = req.user.roles.includes('SUPER_ADMIN') || req.user.roles.includes('LIBRARIAN') || req.user.roles.includes('CIRCULATION_STAFF');

  if (!isOwner && !isStaff) {
    res.status(403);
    throw new Error('Not authorized to cancel this reservation');
  }

  if (reservation.status !== 'PENDING' && reservation.status !== 'READY_FOR_PICKUP') {
    res.status(400);
    throw new Error(`Cannot cancel a reservation with status '${reservation.status}'`);
  }

  await prisma.$transaction(async (tx) => {
    // If a copy was already allocated, return it to AVAILABLE or next member
    if (reservation.allocatedCopyId) {
      const nextHold = await tx.reservation.findFirst({
        where: {
          bookId: reservation.bookId,
          status: 'PENDING',
          id: { not: reservation.id }
        },
        orderBy: { queuePosition: 'asc' }
      });

      if (nextHold) {
        await tx.reservation.update({
          where: { id: nextHold.id },
          data: {
            allocatedCopyId: reservation.allocatedCopyId,
            status: 'READY_FOR_PICKUP',
            readyUntil: new Date(Date.now() + 48 * 60 * 60 * 1000)
          }
        });
      } else {
        await tx.bookCopy.update({
          where: { id: reservation.allocatedCopyId },
          data: { status: 'AVAILABLE', version: { increment: 1 } }
        });
      }
    }

    // Mark cancelled
    await tx.reservation.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        allocatedCopyId: null
      }
    });

    // Re-index remaining pending reservations
    await tx.reservation.updateMany({
      where: {
        bookId: reservation.bookId,
        status: 'PENDING',
        queuePosition: { gt: reservation.queuePosition }
      },
      data: {
        queuePosition: { decrement: 1 }
      }
    });
  });

  await recordAuditLog({
    actorId: req.user.id,
    actorEmail: req.user.email,
    entityType: 'RESERVATION',
    entityId: id,
    action: 'RESERVATION_CANCELLED',
    ipAddress: req.ip,
    userAgent: req.headers['user-agent']
  });

  res.json({
    success: true,
    message: 'Reservation cancelled successfully'
  });
});

// @desc    Get user reservations
// @route   GET /api/reservations/my-reservations
// @access  Private (Member)
const getMyReservations = asyncHandler(async (req, res) => {
  const member = await prisma.member.findUnique({
    where: { userId: req.user.id }
  });

  if (!member) {
    return res.json({ success: true, data: [] });
  }

  const reservations = await prisma.reservation.findMany({
    where: { memberId: member.id },
    include: {
      book: true,
      pickupBranch: true,
      allocatedCopy: { include: { shelf: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json({
    success: true,
    data: reservations.map(formatReservation)
  });
});

// @desc    Get all reservations with filters
// @route   GET /api/reservations
// @access  Private (Staff/Admin)
const getAllReservations = asyncHandler(async (req, res) => {
  const { status, bookId, page = 1, limit = 20 } = req.query;

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.max(1, Math.min(100, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;

  const where = {};
  if (status) where.status = status.toUpperCase();
  if (bookId) where.bookId = bookId;

  const [total, reservations] = await Promise.all([
    prisma.reservation.count({ where }),
    prisma.reservation.findMany({
      where,
      skip,
      take: limitNum,
      include: {
        book: true,
        member: { include: { user: true } },
        pickupBranch: true,
        allocatedCopy: { include: { shelf: true } }
      },
      orderBy: [{ status: 'asc' }, { queuePosition: 'asc' }]
    })
  ]);

  res.json({
    success: true,
    data: reservations.map(formatReservation),
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      pages: Math.ceil(total / limitNum)
    }
  });
});

module.exports = {
  reserveBook,
  cancelReservation,
  getMyReservations,
  getAllReservations
};
