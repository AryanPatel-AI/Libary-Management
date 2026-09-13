const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getMostBorrowedBooks,
  getBorrowingTrends,
  getOverdueBooks,
  getMonthlyReport,
  exportReport
} = require('../controllers/analyticsController');
const { protect, staffOrAdmin } = require('../middleware/authMiddleware');

// All analytics routes are staff/admin accessible
router.use(protect, staffOrAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/popular-books', getMostBorrowedBooks);
router.get('/borrowing-trends', getBorrowingTrends);
router.get('/overdue', getOverdueBooks);
router.get('/monthly-report', getMonthlyReport);
router.get('/export/:type', exportReport);
router.get('/logs', require('../controllers/logController').getAuditLogs);

module.exports = router;
