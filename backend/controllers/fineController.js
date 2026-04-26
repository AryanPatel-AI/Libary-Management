const asyncHandler = require('express-async-handler');
const Fine = require('../models/Fine');

// @desc    Get logged-in user's fines
// @route   GET /api/fines/my-fines
// @access  Private
const getMyFines = asyncHandler(async (req, res) => {
  const DEFAULT_LIMIT = 10;
  const MAX_LIMIT = 100;

  let page = Number.parseInt(req.query.page, 10);
  if (!Number.isFinite(page) || page < 1) {
    page = 1;
  }

  let limit = Number.parseInt(req.query.limit, 10);
  if (!Number.isFinite(limit) || limit <= 0) {
    limit = DEFAULT_LIMIT;
  } else if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  const skip = (page - 1) * limit;

  let query = { user: req.user._id };

  // Filter by paid status
  if (req.query.paid !== undefined) {
    query.paid = req.query.paid === 'true';
  }

  const total = await Fine.countDocuments(query);
  const fines = await Fine.find(query)
    .populate({
      path: 'transaction',
      populate: {
        path: 'book',
        select: 'title author isbn'
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Calculate total unpaid amount
  const totalUnpaid = await Fine.aggregate([
    { $match: { user: req.user._id, paid: false } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  res.json({
    success: true,
    data: {
      fines,
      totalUnpaidAmount: totalUnpaid.length > 0 ? totalUnpaid[0].total : 0,
      page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get all fines (admin)
// @route   GET /api/fines
// @access  Admin
const getAllFines = asyncHandler(async (req, res) => {
  const DEFAULT_LIMIT = 20;
  const MAX_LIMIT = 100;

  let page = Number.parseInt(req.query.page, 10);
  if (!Number.isFinite(page) || page < 1) {
    page = 1;
  }

  let limit = Number.parseInt(req.query.limit, 10);
  if (!Number.isFinite(limit) || limit <= 0) {
    limit = DEFAULT_LIMIT;
  } else if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  const skip = (page - 1) * limit;

  let query = {};

  // Filter by paid status
  if (req.query.paid !== undefined) {
    query.paid = req.query.paid === 'true';
  }

  // Filter by user
  if (req.query.userId) {
    query.user = req.query.userId;
  }

  const total = await Fine.countDocuments(query);
  const fines = await Fine.find(query)
    .populate('user', 'name email')
    .populate({
      path: 'transaction',
      populate: {
        path: 'book',
        select: 'title author isbn'
      }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  // Calculate total unpaid amount across all users
  const totalUnpaid = await Fine.aggregate([
    { $match: { paid: false } },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  res.json({
    success: true,
    data: {
      fines,
      totalUnpaidAmount: totalUnpaid.length > 0 ? totalUnpaid[0].total : 0,
      page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Mark a fine as paid
// @route   PUT /api/fines/:id/pay
// @access  Admin
const payFine = asyncHandler(async (req, res) => {
  const fine = await Fine.findById(req.params.id)
    .populate('user', 'name email')
    .populate({
      path: 'transaction',
      populate: {
        path: 'book',
        select: 'title author'
      }
    });

  if (!fine) {
    res.status(404);
    throw new Error('Fine not found');
  }

  if (fine.paid) {
    res.status(400);
    throw new Error('This fine has already been paid');
  }

  fine.paid = true;
  fine.paidDate = new Date();
  await fine.save();

  res.json({
    success: true,
    message: `Fine of ₹${fine.amount} marked as paid`,
    data: fine
  });
});

module.exports = { getMyFines, getAllFines, payFine };
