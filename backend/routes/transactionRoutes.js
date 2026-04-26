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
const { protect, admin } = require('../middleware/authMiddleware');
const { issueBookValidation, mongoIdValidation } = require('../middleware/validateRequest');

// User routes (protected)
router.post('/issue', protect, issueBookValidation, issueBook);
router.post('/buy', protect, issueBookValidation, buyBook);
router.put('/return/:id', protect, mongoIdValidation, returnBook);
router.get('/my-books', protect, getMyTransactions);

// Admin routes
router.get('/', protect, admin, getAllTransactions);
router.get('/:id', protect, admin, mongoIdValidation, getTransactionById);

module.exports = router;
