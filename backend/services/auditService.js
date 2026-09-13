const prisma = require('../config/prisma');

/**
 * Records an immutable audit log entry into PostgreSQL.
 * Will not throw or crash the main request transaction if audit logging fails.
 */
async function recordAuditLog({
  actorId = null,
  actorEmail = null,
  entityType,
  entityId,
  action,
  beforeState = null,
  afterState = null,
  ipAddress = null,
  userAgent = null
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        actorId,
        actorEmail,
        entityType: String(entityType),
        entityId: String(entityId),
        action: String(action),
        beforeState: beforeState ? JSON.parse(JSON.stringify(beforeState)) : null,
        afterState: afterState ? JSON.parse(JSON.stringify(afterState)) : null,
        ipAddress: ipAddress ? String(ipAddress).slice(0, 45) : null,
        userAgent: userAgent ? String(userAgent).slice(0, 500) : null
      }
    });
  } catch (error) {
    console.error(`⚠️ [AuditLog Error] Failed to write audit log for ${entityType}:${entityId}:`, error.message);
    return null;
  }
}

module.exports = {
  recordAuditLog
};
