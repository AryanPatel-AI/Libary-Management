const express = require('express');
const router = express.Router();
const {
  issueBook,
  returnBook,
  renewBook,
  getTransactions,
  getMyTransactions,
  getTransactionStats
} = require('../controllers/transactionController');
const { protect, staffOrAdmin } = require('../middleware/authMiddleware');

// Circulation Actions
router.post('/issue', protect, staffOrAdmin, issueBook);
router.post('/checkout', protect, staffOrAdmin, issueBook);

router.post('/return', protect, staffOrAdmin, returnBook);
router.post('/checkin', protect, staffOrAdmin, returnBook);
router.put('/return/:id', protect, staffOrAdmin, (req, res, next) => {
  req.body.transactionId = req.params.id;
  return returnBook(req, res, next);
});

router.post('/:id/renew', protect, renewBook);
router.put('/:id/renew', protect, renewBook);

// Member Self-Service Queries
router.get('/my-books', protect, getMyTransactions);
router.get('/my-transactions', protect, getMyTransactions);

// Staff / Admin Circulation Queries
router.get('/stats', protect, staffOrAdmin, getTransactionStats);
router.get('/', protect, staffOrAdmin, getTransactions);

module.exports = router;
