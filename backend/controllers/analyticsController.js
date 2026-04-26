const asyncHandler = require('express-async-handler');
const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');
const Fine = require('../models/Fine');

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalBooks,
    totalUsers,
    totalTransactions,
    activeIssues,
    overdueCount,
    totalFinesUnpaid
  ] = await Promise.all([
    Book.countDocuments(),
    User.countDocuments(),
    Transaction.countDocuments(),
    Transaction.countDocuments({ status: 'issued' }),
    Transaction.countDocuments({
      status: 'issued',
      dueDate: { $lt: new Date() }
    }),
    Fine.aggregate([
      { $match: { paid: false } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ])
  ]);

  // Calculate total available books
  const availableBooks = await Book.aggregate([
    { $group: { _id: null, total: { $sum: '$availableCopies' } } }
  ]);

  res.json({
    success: true,
    data: {
      totalBooks,
      totalUsers,
      totalTransactions,
      activeIssues,
      overdueBooks: overdueCount,
      totalAvailableCopies: availableBooks.length > 0 ? availableBooks[0].total : 0,
      totalUnpaidFines: totalFinesUnpaid.length > 0 ? totalFinesUnpaid[0].total : 0
    }
  });
});

// @desc    Get most borrowed books
// @route   GET /api/analytics/popular-books
// @access  Admin
const getMostBorrowedBooks = asyncHandler(async (req, res) => {
  let limit = Number.parseInt(req.query.limit, 10);
  if (!Number.isFinite(limit) || limit < 1) {
    limit = 10;
  } else if (limit > 100) {
    limit = 100;
  }

  const popularBooks = await Transaction.aggregate([
    {
      $group: {
        _id: '$book',
        borrowCount: { $sum: 1 }
      }
    },
    { $sort: { borrowCount: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'books',
        localField: '_id',
        foreignField: '_id',
        as: 'bookDetails'
      }
    },
    { $unwind: '$bookDetails' },
    {
      $project: {
        _id: 0,
        bookId: '$_id',
        title: '$bookDetails.title',
        author: '$bookDetails.author',
        category: '$bookDetails.category',
        isbn: '$bookDetails.isbn',
        borrowCount: 1
      }
    }
  ]);

  res.json({
    success: true,
    data: popularBooks
  });
});

// @desc    Get all overdue books
// @route   GET /api/analytics/overdue
// @access  Admin
const getOverdueBooks = asyncHandler(async (req, res) => {
  const overdueTransactions = await Transaction.find({
    status: 'issued',
    dueDate: { $lt: new Date() }
  })
    .populate('book', 'title author isbn')
    .populate('user', 'name email phone')
    .sort({ dueDate: 1 });

  // Calculate days overdue for each
  const now = new Date();
  const overdueData = overdueTransactions.map((t) => {
    const diffTime = now.getTime() - new Date(t.dueDate).getTime();
    const daysOverdue = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const estimatedFine = daysOverdue * (parseInt(process.env.FINE_PER_DAY) || 5);

    return {
      transactionId: t._id,
      book: t.book,
      user: t.user,
      issueDate: t.issueDate,
      dueDate: t.dueDate,
      daysOverdue,
      estimatedFine
    };
  });

  res.json({
    success: true,
    data: {
      count: overdueData.length,
      overdueBooks: overdueData
    }
  });
});

// @desc    Get monthly report (issues per month)
// @route   GET /api/analytics/monthly-report
// @access  Admin
const getMonthlyReport = asyncHandler(async (req, res) => {
  const yearParam = req.query.year;
  if (!/^\d{4}$/.test(yearParam)) {
    return res.status(400).json({ success: false, message: 'Invalid year format. Must be a 4-digit year.' });
  }
  const year = Number(yearParam);
  if (!Number.isInteger(year) || year < 1970 || year > new Date().getFullYear()) {
    return res.status(400).json({ success: false, message: 'Year must be between 1970 and current year.' });
  }

  const monthlyData = await Transaction.aggregate([
    {
      $match: {
        issueDate: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31T23:59:59`)
        }
      }
    },
    {
      $group: {
        _id: { month: { $month: '$issueDate' } },
        totalIssues: { $sum: 1 },
        totalReturns: {
          $sum: { $cond: [{ $eq: ['$status', 'returned'] }, 1, 0] }
        },
        totalFines: { $sum: '$fine' }
      }
    },
    { $sort: { '_id.month': 1 } },
    {
      $project: {
        _id: 0,
        month: '$_id.month',
        totalIssues: 1,
        totalReturns: 1,
        totalFines: 1
      }
    }
  ]);

  // Fill in missing months with zeros
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fullReport = months.map((name, index) => {
    const found = monthlyData.find((m) => m.month === index + 1);
    return {
      month: index + 1,
      monthName: name,
      totalIssues: found ? found.totalIssues : 0,
      totalReturns: found ? found.totalReturns : 0,
      totalFines: found ? found.totalFines : 0
    };
  });

  res.json({
    success: true,
    data: {
      year,
      report: fullReport
    }
  });
});

module.exports = {
  getDashboardStats,
  getMostBorrowedBooks,
  getOverdueBooks,
  getMonthlyReport
};
