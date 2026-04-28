const express = require('express');
const router = express.Router();
const {
  issueBook,
  returnBook,
  getMyTransactions,
  getAllTransactions,
  getTransactionById,
  buyBook
} = require('../controllers/transactionController');
const { protect, admin, adminOrLibrarian } = require('../middleware/authMiddleware');
const { issueBookValidation, mongoIdValidation } = require('../middleware/validateRequest');

// User routes (protected)
router.post('/issue', protect, issueBookValidation, issueBook);
router.post('/buy', protect, issueBookValidation, buyBook);
router.put('/return/:id', protect, mongoIdValidation, returnBook);
router.get('/my-books', protect, getMyTransactions);

// Admin/Librarian routes
router.get('/', protect, adminOrLibrarian, getAllTransactions);
router.get('/:id', protect, adminOrLibrarian, mongoIdValidation, getTransactionById);

module.exports = router;
