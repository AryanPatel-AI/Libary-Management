const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true
  }
}, { timestamps: true });

// Prevent multiple reviews from the same user for the same book
reviewSchema.index({ user: 1, book: 1 }, { unique: true });

// Update book rating after saving a review
reviewSchema.post('save', async function() {
  const Book = mongoose.model('Book');
  const stats = await this.constructor.aggregate([
    { $match: { book: this.book } },
    { $group: { _id: '$book', rating: { $avg: '$rating' }, numReviews: { $sum: 1 } } }
  ]);

  if (stats.length > 0) {
    await Book.findByIdAndUpdate(this.book, {
      rating: stats[0].rating,
      numReviews: stats[0].numReviews
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
