const asyncHandler = require('express-async-handler');
const Reservation = require('../models/Reservation');
const Book = require('../models/Book');
const emailService = require('../utils/emailService');

// @desc    Reserve a book
// @route   POST /api/reservations
// @access  Private
const reserveBook = asyncHandler(async (req, res) => {
  const { bookId } = req.body;

  if (!bookId || !require('mongoose').Types.ObjectId.isValid(bookId)) {
    res.status(400);
    throw new Error('Invalid book ID');
  }

  const book = await Book.findById(bookId);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  // Check if book actually has copies available. 
  // If it does, they should issue it unless it's already "locked" for someone else.
  if (book.availableCopies > 0) {
    // Check if there are notified reservations (book is locked for them)
    const notifiedReservations = await Reservation.countDocuments({
      book: bookId,
      status: 'notified'
    });

    if (book.availableCopies > notifiedReservations) {
      res.status(400);
      throw new Error('Book is currently available, you can issue it directly.');
    }
  }

  // Check if user already has an active reservation (waiting or notified)
  const existingReservation = await Reservation.findOne({
    user: req.user._id,
    book: bookId,
    status: { $in: ['waiting', 'notified'] }
  });

  if (existingReservation) {
    res.status(400);
    throw new Error(`You already have a ${existingReservation.status} reservation for this book.`);
  }

  // Calculate position (count existing 'waiting' reservations)
  const waitingCount = await Reservation.countDocuments({
    book: bookId,
    status: 'waiting'
  });

  const reservation = await Reservation.create({
    user: req.user._id,
    book: bookId,
    status: 'waiting',
    position: waitingCount + 1
  });

  // Dispatch Email Notification
  try {
    await emailService.sendReservationConfirmation(req.user.email, req.user.name, book.title);
  } catch (emailError) {
    console.error('Failed to send reservation confirmation email:', emailError);
  }

  res.status(201).json({
    success: true,
    data: reservation
  });
});

// @desc    Cancel a reservation
// @route   DELETE /api/reservations/:id
// @access  Private
const cancelReservation = asyncHandler(async (req, res) => {
  const reservation = await Reservation.findById(req.params.id);

  if (!reservation) {
    res.status(404);
    throw new Error('Reservation not found');
  }

  // Verify owner
  if (reservation.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to cancel this reservation');
  }

  const wasWaiting = reservation.status === 'waiting';
  const wasNotified = reservation.status === 'notified';
  const bookId = reservation.book;

  reservation.status = 'cancelled';
  await reservation.save();

  const { updateWaitlistPositions, processNextReservation } = require('../utils/reservationUtils');

  if (wasWaiting) {
    // Re-calculate positions for others
    await updateWaitlistPositions(bookId);
  } else if (wasNotified) {
    // If it was notified (locked), we need to trigger the next person
    await processNextReservation(bookId);
  }

  res.json({
    success: true,
    message: 'Reservation cancelled successfully'
  });
});

// @desc    Get user's reservations
// @route   GET /api/reservations/my
// @access  Private
const getMyReservations = asyncHandler(async (req, res) => {
  const reservations = await Reservation.find({ user: req.user._id })
    .populate('book', 'title author image')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: reservations
  });
});

// @desc    Get all reservations (admin)
// @route   GET /api/reservations
// @access  Admin
const getAllReservations = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query = {};

  if (req.query.status) {
    query.status = req.query.status;
  }

  const total = await Reservation.countDocuments(query);
  const reservations = await Reservation.find(query)
    .populate('user', 'name email')
    .populate('book', 'title author image')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: {
      reservations,
      page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

module.exports = { reserveBook, cancelReservation, getMyReservations, getAllReservations };
