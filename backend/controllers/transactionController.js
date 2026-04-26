const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');
const Fine = require('../models/Fine');
const calculateFine = require('../utils/calculateFine');
const emailService = require('../utils/emailService');

// @desc    Issue a book to the logged-in user
// @route   POST /api/transactions/issue
// @access  Private
const issueBook = asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  const userId = req.user._id;
  const maxBooks = parseInt(process.env.MAX_BOOKS_PER_USER) || 5;
  const loanDays = parseInt(process.env.LOAN_PERIOD_DAYS) || 14;

  // 1. Pre-checks (Non-atomic, but acceptable for most use cases)
  const activeIssues = await Transaction.countDocuments({
    user: userId,
    status: 'issued'
  });

  if (activeIssues >= maxBooks) {
    res.status(400);
    throw new Error(`You have reached the maximum limit of ${maxBooks} books`);
  }

  const alreadyIssued = await Transaction.findOne({
    user: userId,
    book: bookId,
    status: 'issued'
  });

  if (alreadyIssued) {
    res.status(400);
    throw new Error('You already have this book issued');
  }

  // --- Reservation Logic Start ---
  const Reservation = require('../models/Reservation');
  const reservation = await Reservation.findOne({
    user: userId,
    book: bookId,
    status: 'notified'
  });

  // If NO reservation, check if the book is "locked" for someone else
  if (!reservation) {
    const bookData = await Book.findById(bookId);
    const notifiedCount = await Reservation.countDocuments({
      book: bookId,
      status: 'notified'
    });

    if (bookData.availableCopies <= notifiedCount) {
      res.status(400);
      throw new Error('All available copies are currently reserved by other users');
    }
  }
  // --- Reservation Logic End ---

  // 2. Atomically decrement available copies
  // We only decrement if there's no reservation. If there IS a reservation, 
  // the copy was already "held" (not incremented during return).
  if (!reservation) {
    const book = await Book.findOneAndUpdate(
      { _id: bookId, availableCopies: { $gt: 0 } },
      { $inc: { availableCopies: -1 } },
      { new: true }
    );

    if (!book) {
      res.status(400);
      throw new Error('Book no longer available');
    }
  } else {
    // Fulfill the reservation
    reservation.status = 'fulfilled';
    await reservation.save();
  }

  // 3. Calculate due date
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + loanDays);

  // 4. Create transaction
  const transaction = await Transaction.create({
    user: userId,
    book: bookId,
    dueDate
  });

  // Populate for response
  const populatedTransaction = await Transaction.findById(transaction._id)
    .populate('book', 'title author isbn')
    .populate('user', 'name email');

  // Dispatch Order Confirmation Email
  try {
    const book = await Book.findById(bookId);
    await emailService.sendOrderConfirmation(req.user.email, req.user.name, book.title, dueDate);
  } catch (emailError) {
    console.error('Failed to send order confirmation email:', emailError);
  }

  res.status(201).json({
    success: true,
    message: 'Book issued successfully',
    data: populatedTransaction
  });
});

// @desc    Return a book
// @route   PUT /api/transactions/return/:id
// @access  Private
const returnBook = asyncHandler(async (req, res) => {
  const transactionId = req.params.id;

  // 1. Find the active transaction
  const transaction = await Transaction.findById(transactionId);

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  // Verify the transaction belongs to the logged-in user
  if (transaction.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to return this book');
  }

  if (transaction.status === 'returned') {
    res.status(400);
    throw new Error('This book has already been returned');
  }

  // 2. Atomically update transaction status to returned
  const returnDate = new Date();
  const fineAmount = calculateFine(transaction.dueDate, returnDate);

  const updatedTransaction = await Transaction.findOneAndUpdate(
    { _id: transactionId, status: 'borrowed' },
    { $set: { status: 'returned', returnDate, fine: fineAmount } },
    { new: true }
  );

  if (!updatedTransaction) {
    res.status(400);
    throw new Error('Book has already been returned or transaction not in borrowed status');
  }

  // 3. Handle Reservation Waitlist
  const { processNextReservation } = require('../utils/reservationUtils');
  const reservationProcessed = await processNextReservation(transaction.book);

  // If no reservation was processed, increment available copies
  if (!reservationProcessed) {
    await Book.updateOne({ _id: transaction.book }, { $inc: { availableCopies: 1 } });
  } else {
    console.log(`[Reservation] Book ${transaction.book} held for next user in waitlist.`);
  }

  // 4. Create fine record if applicable
  if (fineAmount > 0) {
    await Fine.create({
      user: transaction.user,
      transaction: transaction._id,
      amount: fineAmount,
      reason: 'Overdue return'
    });
  }

  // Populate for response
  const populatedTransaction = await Transaction.findById(updatedTransaction._id)
    .populate('book', 'title author isbn')
    .populate('user', 'name email');

  res.json({
    success: true,
    message: fineAmount > 0
      ? `Book returned with a fine of ₹${fineAmount}`
      : 'Book returned successfully',
    data: {
      transaction: populatedTransaction,
      fine: fineRecord
    }
  });
});

// @desc    Get logged-in user's transactions
// @route   GET /api/transactions/my-books
// @access  Private
const getMyTransactions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = { user: req.user._id };

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  const total = await Transaction.countDocuments(query);
  const transactions = await Transaction.find(query)
    .populate('book', 'title author isbn category')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: {
      transactions,
      page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get all transactions (admin)
// @route   GET /api/transactions
// @access  Admin
const getAllTransactions = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  let query = {};

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  }

  // Filter by user
  if (req.query.userId) {
    query.user = req.query.userId;
  }

  // Filter by book
  if (req.query.bookId) {
    query.book = req.query.bookId;
  }

  const total = await Transaction.countDocuments(query);
  const transactions = await Transaction.find(query)
    .populate('book', 'title author isbn')
    .populate('user', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: {
      transactions,
      page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get single transaction by ID (admin)
// @route   GET /api/transactions/:id
// @access  Admin
const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('book', 'title author isbn category totalCopies availableCopies')
    .populate('user', 'name email role phone');

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  res.json({
    success: true,
    data: transaction
  });
});

// @desc    Buy a book (mock payment)
// @route   POST /api/transactions/buy
// @access  Private
const buyBook = asyncHandler(async (req, res) => {
  const { bookId } = req.body;
  const userId = req.user._id;

  const book = await Book.findById(bookId);
  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  if (!book.isPaid) {
    res.status(400);
    throw new Error('This book is free to read');
  }

  // Update user purchasedBooks atomically
  const updateResult = await User.updateOne(
    { _id: userId },
    { $addToSet: { purchasedBooks: bookId } }
  );

  if (updateResult.modifiedCount === 0) {
    res.status(400);
    throw new Error('You have already purchased this book');
  }

  res.status(200).json({
    success: true,
    message: 'Book purchased successfully'
  });
});

module.exports = {
  issueBook,
  returnBook,
  getMyTransactions,
  getAllTransactions,
  getTransactionById,
  buyBook
};
