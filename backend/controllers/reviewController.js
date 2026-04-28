const Review = require('../models/Review');
const Book = require('../models/Book');
const asyncHandler = require('express-async-handler');

// @desc    Add review to a book
// @route   POST /api/reviews
// @access  Private
const addReview = asyncHandler(async (req, res) => {
  const { bookId, rating, comment } = req.body;

  const book = await Book.findById(bookId);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  const alreadyReviewed = await Review.findOne({
    user: req.user._id,
    book: bookId
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Book already reviewed');
  }

  const review = await Review.create({
    user: req.user._id,
    book: bookId,
    rating: Number(rating),
    comment
  });

  res.status(201).json(review);
});

// @desc    Get reviews for a book
// @route   GET /api/reviews/book/:bookId
// @access  Public
const getBookReviews = asyncHandler(async (req, res) => {
  const reviews = await Review.find({ book: req.params.bookId })
    .populate('user', 'name avatar')
    .sort('-createdAt');

  res.json(reviews);
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
const deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  // Check if user is the owner of the review or an admin
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(401);
    throw new Error('Not authorized to delete this review');
  }

  await review.deleteOne();
  res.json({ message: 'Review removed' });
});

module.exports = {
  addReview,
  getBookReviews,
  deleteReview
};
