const asyncHandler = require('express-async-handler');
const Book = require('../models/Book');

// Helper to escape regex special characters
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// @desc    Get all books (with search, filter, pagination, sort)
// @route   GET /api/books
// @access  Public
const getBooks = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build query
  let query = {};

  // Text search across title, author, category
  if (req.query.search && req.query.search.trim()) {
    const escaped = escapeRegex(req.query.search.trim());
    query.$or = [
      { title: { $regex: escaped, $options: 'i' } },
      { author: { $regex: escaped, $options: 'i' } },
      { category: { $regex: escaped, $options: 'i' } }
    ];
  }

  // Filter by category
  if (req.query.category && req.query.category.trim()) {
    query.category = { $regex: escapeRegex(req.query.category.trim()), $options: 'i' };
  }

  // Filter by author
  if (req.query.author && req.query.author.trim()) {
    query.author = { $regex: escapeRegex(req.query.author.trim()), $options: 'i' };
  }

  // Filter by availability
  if (req.query.available === 'true') {
    query.availableCopies = { $gt: 0 };
  }

  // Sort options
  let sortOption = {};
  switch (req.query.sort) {
    case 'title_asc':
      sortOption = { title: 1 };
      break;
    case 'title_desc':
      sortOption = { title: -1 };
      break;
    case 'latest':
      sortOption = { createdAt: -1 };
      break;
    case 'oldest':
      sortOption = { createdAt: 1 };
      break;
    default:
      sortOption = { createdAt: -1 };
  }

  const total = await Book.countDocuments(query);
  const books = await Book.find(query)
    .sort(sortOption)
    .skip(skip)
    .limit(limit);

  res.json({
    success: true,
    data: {
      books,
      page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public
const getBookById = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  res.json({
    success: true,
    data: book
  });
});

// @desc    Create a new book
// @route   POST /api/books
// @access  Admin
const createBook = asyncHandler(async (req, res) => {
  const { title, author, category, isbn, description, publisher, publishedYear, totalCopies } = req.body;

  // Check if ISBN already exists
  const existingBook = await Book.findOne({ isbn });
  if (existingBook) {
    res.status(400);
    throw new Error('A book with this ISBN already exists');
  }

  const book = await Book.create({
    title,
    author,
    category,
    isbn,
    description,
    publisher,
    publishedYear,
    totalCopies
  });

  res.status(201).json({
    success: true,
    data: book
  });
});

// @desc    Update a book
// @route   PUT /api/books/:id
// @access  Admin
const updateBook = asyncHandler(async (req, res) => {
  let book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  // If ISBN is being changed, check for uniqueness
  if (req.body.isbn && req.body.isbn !== book.isbn) {
    const existingBook = await Book.findOne({ isbn: req.body.isbn });
    if (existingBook) {
      res.status(400);
      throw new Error('A book with this ISBN already exists');
    }
  }

  // If totalCopies is being updated, adjust availableCopies accordingly
  if (req.body.totalCopies !== undefined) {
    const issuedCopies = book.totalCopies - book.availableCopies;
    const newTotalCopies = req.body.totalCopies;

    if (newTotalCopies < issuedCopies) {
      res.status(400);
      throw new Error(`Cannot reduce total copies below ${issuedCopies} (currently issued)`);
    }

    req.body.availableCopies = newTotalCopies - issuedCopies;
  }

  // Allowlist of updatable fields
  const allowedFields = ['title', 'author', 'category', 'isbn', 'description', 'publisher', 'publishedYear', 'totalCopies', 'availableCopies', 'image', 'isPaid', 'price'];
  const updatePayload = {};
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updatePayload[field] = req.body[field];
    }
  });

  book = await Book.findByIdAndUpdate(req.params.id, updatePayload, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    data: book
  });
});

// @desc    Delete a book
// @route   DELETE /api/books/:id
// @access  Admin
const deleteBook = asyncHandler(async (req, res) => {
  const book = await Book.findById(req.params.id);

  if (!book) {
    res.status(404);
    throw new Error('Book not found');
  }

  // Prevent deletion if copies are currently issued
  const issuedCopies = book.totalCopies - book.availableCopies;
  if (issuedCopies > 0) {
    res.status(400);
    throw new Error(`Cannot delete book. ${issuedCopies} copies are currently issued.`);
  }

  await Book.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    message: 'Book deleted successfully'
  });
});

module.exports = { getBooks, getBookById, createBook, updateBook, deleteBook };
