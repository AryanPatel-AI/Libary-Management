const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Admin/Staff
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalBooks,
    totalCopies,
    totalAvailableCopies,
    totalMembers,
    totalLoans,
    activeIssues,
    overdueCount,
    unpaidFinesAgg,
    branchesCount
  ] = await Promise.all([
    prisma.book.count(),
    prisma.bookCopy.count(),
    prisma.bookCopy.count({ where: { status: 'AVAILABLE' } }),
    prisma.member.count(),
    prisma.loan.count(),
    prisma.loan.count({ where: { status: 'ACTIVE' } }),
    prisma.loan.count({ where: { status: 'ACTIVE', dueAt: { lt: new Date() } } }),
    prisma.fine.aggregate({
      where: { status: { in: ['UNPAID', 'PARTIALLY_PAID'] } },
      _sum: { balanceCents: true }
    }),
    prisma.branch.count({ where: { isActive: true } })
  ]);

  const totalUnpaidCents = unpaidFinesAgg._sum.balanceCents || 0;

  res.json({
    success: true,
    data: {
      totalBooks,
      totalCopies,
      totalAvailableCopies,
      totalUsers: totalMembers,
      totalTransactions: totalLoans,
      activeIssues,
      overdueBooks: overdueCount,
      totalUnpaidFines: totalUnpaidCents / 100,
      branchesCount
    }
  });
});

// @desc    Get most borrowed books
// @route   GET /api/analytics/popular-books
// @access  Admin/Staff
const getMostBorrowedBooks = asyncHandler(async (req, res) => {
  const limit = Math.min(20, Math.max(1, parseInt(req.query.limit) || 10));

  const books = await prisma.book.findMany({
    take: limit,
    include: {
      authors: { include: { author: true } },
      copies: {
        include: {
          _count: { select: { loans: true } }
        }
      }
    }
  });

  const popular = books.map((b) => {
    const borrowCount = b.copies.reduce((sum, c) => sum + c._count.loans, 0);
    return {
      _id: b.id,
      id: b.id,
      title: b.title,
      author: b.authors.map(a => a.author.name).join(', ') || 'Unknown',
      borrowCount,
      count: borrowCount,
      image: b.coverImageUrl
    };
  }).sort((a, b) => b.borrowCount - a.borrowCount);

  res.json({
    success: true,
    data: popular
  });
});

// @desc    Get borrowing trends for charts
// @route   GET /api/analytics/borrowing-trends
// @access  Admin/Staff
const getBorrowingTrends = asyncHandler(async (req, res) => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const nextD = new Date(d);
    nextD.setDate(nextD.getDate() + 1);

    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });

    const [issues, returns] = await Promise.all([
      prisma.loan.count({
        where: {
          issuedAt: { gte: d, lt: nextD }
        }
      }),
      prisma.loan.count({
        where: {
          returnedAt: { gte: d, lt: nextD }
        }
      })
    ]);

    days.push({
      date: dayName,
      fullDate: d.toISOString().split('T')[0],
      borrowed: issues,
      returned: returns,
      issues
    });
  }

  res.json({
    success: true,
    data: days
  });
});

// @desc    Get overdue loans report
// @route   GET /api/analytics/overdue
// @access  Admin/Staff
const getOverdueBooks = asyncHandler(async (req, res) => {
  const overdueLoans = await prisma.loan.findMany({
    where: {
      status: 'ACTIVE',
      dueAt: { lt: new Date() }
    },
    include: {
      copy: {
        include: {
          book: true,
          branch: true,
          shelf: true
        }
      },
      member: {
        include: {
          user: true,
          memberType: true
        }
      }
    },
    orderBy: { dueAt: 'asc' }
  });

  const formatted = overdueLoans.map((loan) => {
    const daysOverdue = Math.ceil((new Date() - new Date(loan.dueAt)) / (1000 * 60 * 60 * 24));
    return {
      id: loan.id,
      _id: loan.id,
      bookTitle: loan.copy.book.title,
      barcode: loan.copy.barcode,
      memberName: `${loan.member.user.firstName} ${loan.member.user.lastName}`.trim(),
      memberEmail: loan.member.user.email,
      memberNumber: loan.member.memberNumber,
      issuedAt: loan.issuedAt,
      dueAt: loan.dueAt,
      dueDate: loan.dueAt,
      daysOverdue,
      estimatedFine: (daysOverdue * (loan.member.memberType ? loan.member.memberType.finePerDayCents : 100)) / 100
    };
  });

  res.json({
    success: true,
    data: formatted
  });
});

// @desc    Get monthly circulation report
// @route   GET /api/analytics/monthly-report
// @access  Admin/Staff
const getMonthlyReport = asyncHandler(async (req, res) => {
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);

  const [issuedThisMonth, returnedThisMonth, newMembersThisMonth, finesCollectedAgg] = await Promise.all([
    prisma.loan.count({ where: { issuedAt: { gte: firstDay } } }),
    prisma.loan.count({ where: { returnedAt: { gte: firstDay } } }),
    prisma.member.count({ where: { joinedAt: { gte: firstDay } } }),
    prisma.finePayment.aggregate({
      where: { createdAt: { gte: firstDay } },
      _sum: { amountCents: true }
    })
  ]);

  res.json({
    success: true,
    data: {
      month: now.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      issuedThisMonth,
      returnedThisMonth,
      newMembersThisMonth,
      finesCollected: (finesCollectedAgg._sum.amountCents || 0) / 100
    }
  });
});

module.exports = {
  getDashboardStats,
  getMostBorrowedBooks,
  getBorrowingTrends,
  getOverdueBooks,
  getMonthlyReport
};
