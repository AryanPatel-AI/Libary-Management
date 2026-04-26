const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getMostBorrowedBooks,
  getOverdueBooks,
  getMonthlyReport
} = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

// All analytics routes are admin-only
router.use(protect, admin);

router.get('/dashboard', getDashboardStats);
router.get('/popular-books', getMostBorrowedBooks);
router.get('/overdue', getOverdueBooks);
router.get('/monthly-report', getMonthlyReport);

module.exports = router;
