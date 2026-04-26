const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');
const { protect, admin } = require('../middleware/authMiddleware');
const { bookValidation, bookUpdateValidation, mongoIdValidation } = require('../middleware/validateRequest');

// Public routes
router.get('/', getBooks);
router.get('/:id', mongoIdValidation, getBookById);

// Admin-only routes
router.post('/', protect, admin, bookValidation, createBook);
router.put('/:id', protect, admin, mongoIdValidation, bookUpdateValidation, updateBook);
router.delete('/:id', protect, admin, mongoIdValidation, deleteBook);

module.exports = router;
