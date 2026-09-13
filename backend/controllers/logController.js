const asyncHandler = require('express-async-handler');
const prisma = require('../config/prisma');

// @desc    Get all audit logs with pagination & filtering
// @route   GET /api/analytics/logs OR GET /api/audit-logs
// @access  Admin/Auditor
const getAuditLogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const { entityType, action } = req.query;
  const where = {};
  if (entityType) where.entityType = entityType;
  if (action) where.action = action;

  const [total, rawLogs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      include: {
        actor: { select: { id: true, firstName: true, lastName: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  const formattedLogs = rawLogs.map((log) => ({
    _id: String(log.id),
    id: String(log.id),
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    performedBy: log.actor ? {
      name: `${log.actor.firstName} ${log.actor.lastName}`.trim(),
      email: log.actor.email
    } : {
      name: log.actorEmail || 'System Worker',
      email: log.actorEmail || 'system@internal'
    },
    beforeState: log.beforeState,
    afterState: log.afterState,
    details: log.action,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    timestamp: log.createdAt,
    createdAt: log.createdAt
  }));

  res.json({
    success: true,
    data: {
      logs: formattedLogs,
      page,
      pages: Math.ceil(total / limit),
      total
    }
  });
});

module.exports = { getAuditLogs };
