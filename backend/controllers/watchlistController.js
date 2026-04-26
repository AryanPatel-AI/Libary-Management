const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Add book to watchlist
// @route   POST /api/watchlist/:id
// @access  Private
const addToWatchlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.watchlist.some(id => id.toString() === req.params.id)) {
    res.status(400);
    throw new Error('Book already in watchlist');
  }

  user.watchlist.push(req.params.id);
  await user.save();

  res.status(200).json({ message: 'Added to watchlist' });
});

// @desc    Remove book from watchlist
// @route   DELETE /api/watchlist/:id
// @access  Private
const removeFromWatchlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.watchlist = user.watchlist.filter(
    (bookId) => bookId.toString() !== req.params.id
  );
  
  await user.save();

  res.status(200).json({ message: 'Removed from watchlist' });
});

// @desc    Get user watchlist
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('watchlist');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.status(200).json(user.watchlist);
});

module.exports = {
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist
};
