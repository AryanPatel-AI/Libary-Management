const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Helper to escape regex special characters
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get all users (with pagination and search)
// @route   GET /api/users
// @access  Admin
const getUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  let query = {};

  // Search by name or email
  if (req.query.search && req.query.search.trim()) {
    const escaped = escapeRegex(req.query.search.trim());
    query.$or = [
      { name: { $regex: escaped, $options: 'i' } },
      { email: { $regex: escaped, $options: 'i' } }
    ];
  }

  // Filter by role
  if (req.query.role) {
    query.role = req.query.role;
  }

  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: {
      users,
      page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get single user by ID (with their active transactions)
// @route   GET /api/users/:id
// @access  Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Get user's active transactions
  const activeTransactions = await Transaction.find({
    user: req.params.id,
    status: 'issued'
  }).populate('book', 'title author isbn');

  res.json({
    success: true,
    data: {
      user,
      activeTransactions,
      activeBookCount: activeTransactions.length
    }
  });
});

// @desc    Update user (role, details)
// @route   PUT /api/users/:id
// @access  Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent admin from demoting themselves
  if (req.user._id.toString() === req.params.id && req.body.role && req.body.role !== 'admin') {
    res.status(400);
    throw new Error('Cannot change your own admin role');
  }

  // Update allowed fields
  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;

  if (req.body.role) {
    user.role = req.body.role;
  }

  if (req.body.email && req.body.email !== user.email) {
    const emailTaken = await User.findOne({ email: req.body.email });
    if (emailTaken) {
      res.status(400);
      throw new Error('Email is already in use');
    }
    user.email = req.body.email;
  }

  try {
    user.$locals.userId = req.user._id;
    const updatedUser = await user.save();

    res.json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        membershipDate: updatedUser.membershipDate
      }
    });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400);
      throw new Error('Email is already in use');
    }
    throw error;
  }
});

// @desc    Delete a user
// @route   DELETE /api/users/:id
// @access  Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Prevent self-deletion
  if (req.user._id.toString() === req.params.id) {
    res.status(400);
    throw new Error('Cannot delete your own account');
  }

  // Check for active book issues
  const activeIssues = await Transaction.countDocuments({
    user: req.params.id,
    status: 'issued'
  });

  if (activeIssues > 0) {
    res.status(400);
    throw new Error(`Cannot delete user. They have ${activeIssues} active book(s) issued.`);
  }

  await User.findByIdAndDelete(req.params.id, { userId: req.user._id });

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

module.exports = { getUsers, getUserById, updateUser, deleteUser };
