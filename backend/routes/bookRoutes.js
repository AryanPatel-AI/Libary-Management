const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  verifyAccess,
  getLibraryStats
} = require('../controllers/bookController');
const { protect, admin, adminOrLibrarian } = require('../middleware/authMiddleware');
const { bookValidation, bookUpdateValidation, mongoIdValidation } = require('../middleware/validateRequest');

// Public routes
router.get('/', getBooks);
router.get('/stats/public', getLibraryStats);
router.get('/:id', mongoIdValidation, getBookById);

// Protected routes
router.get('/:id/verify-access', protect, mongoIdValidation, verifyAccess);

// Admin/Librarian routes
router.post('/', protect, adminOrLibrarian, bookValidation, createBook);
router.put('/:id', protect, adminOrLibrarian, mongoIdValidation, bookUpdateValidation, updateBook);
router.delete('/:id', protect, adminOrLibrarian, mongoIdValidation, deleteBook);

module.exports = router;
