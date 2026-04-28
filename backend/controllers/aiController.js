const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const asyncHandler = require('express-async-handler');

// @desc    Get book recommendations for a user
// @route   GET /api/ai/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
  // 1. Get user's borrowing history
  const history = await Transaction.find({ user: req.user._id })
    .populate('book', 'category tags')
    .sort('-createdAt')
    .limit(10);

  if (history.length === 0) {
    // If no history, return most popular books
    const popularBooks = await Book.find()
      .sort('-rating -numReviews')
      .limit(6);
    return res.json(popularBooks);
  }

  // 2. Extract categories and tags from history
  const categories = history.map(t => t.book.category);
  const tags = history.flatMap(t => t.book.tags || []);

  // 3. Find books in similar categories/tags that user hasn't read
  const readBookIds = history.map(t => t.book._id);

  const recommendations = await Book.find({
    _id: { $nin: readBookIds },
    $or: [
      { category: { $in: categories } },
      { tags: { $in: tags } }
    ]
  })
  .sort('-rating')
  .limit(6);

  res.json(recommendations);
});

// @desc    Semantic search for books (Basic implementation using text index)
// @route   GET /api/ai/search
// @access  Public
const semanticSearch = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    res.status(400);
    throw new Error('Please provide a search query');
  }

  const books = await Book.find(
    { $text: { $search: query } },
    { score: { $meta: 'textScore' } }
  )
  .sort({ score: { $meta: 'textScore' } })
  .limit(10);

  res.json(books);
});

// @desc    Chat assistant (Basic rule-based response)
// @route   POST /api/ai/chat
// @access  Private
const chatAssistant = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const userMessage = message.toLowerCase();

  let response = "";

  if (userMessage.includes("recommend") || userMessage.includes("suggest")) {
    response = "I can suggest some books for you! Check out the recommendations section in your dashboard.";
  } else if (userMessage.includes("how to borrow")) {
    response = "To borrow a book, simply click on a book card and click the 'Issue Book' button. You can keep it for 14 days.";
  } else if (userMessage.includes("due date") || userMessage.includes("return")) {
    response = "You can view your due dates in your profile dashboard under 'Issued Books'.";
  } else if (userMessage.includes("fine")) {
    response = "Fines are calculated at $10 per day for overdue books.";
  } else {
    response = "I'm the Patel & Co. Knowledge Assistant. How can I help you today? You can ask about book recommendations, how to borrow, or about due dates.";
  }

  res.json({ response });
});

module.exports = {
  getRecommendations,
  semanticSearch,
  chatAssistant
};
