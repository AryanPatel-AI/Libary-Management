const asyncHandler = require('express-async-handler');
const AuditLog = require('../models/AuditLog');

// @desc    Get all audit logs
// @route   GET /api/analytics/logs
// @access  Admin
const getAuditLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const logs = await AuditLog.find()
    .populate('performedBy', 'name email role')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await AuditLog.countDocuments();

  res.json({
    success: true,
    data: {
      logs,
      page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

module.exports = { getAuditLogs };
