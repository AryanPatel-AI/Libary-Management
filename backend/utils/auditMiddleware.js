const AuditLog = require('../models/AuditLog');

function sanitizeDocument(doc, excludeFields = ['password', 'verificationToken', 'verificationTokenExpire']) {
  const sanitized = { ...doc };
  excludeFields.forEach(field => delete sanitized[field]);
  return sanitized;
}

module.exports = function auditLogPlugin(schema, options) {
  const entityType = options?.entityType || 'Unknown';
  const excludeFields = options?.excludeFields || ['password', 'verificationToken', 'verificationTokenExpire'];

  // Pre-save hook to capture if document is new
  schema.pre('save', function(next) {
    this.$locals = this.$locals || {};
    this.$locals.wasNew = this.isNew;
    next();
  });

  // Hook for saving documents (CREATE or UPDATE)
  schema.post('save', async function (doc, next) {
    try {
      // In a real express app, performedBy should be passed via `doc.$locals.userId` or a cls-hooked context.
      // For this implementation, if a user performs the action, it must be attached to the doc before save.
      const action = doc.$locals?.wasNew ? 'CREATE' : 'UPDATE';
      const performedBy = doc.$locals?.userId || doc.user || 'SYSTEM';

      if (performedBy) {
        await AuditLog.create({
          action,
          entityType,
          entityId: doc._id,
          performedBy,
          details: { snapshot: sanitizeDocument(doc.toObject(), excludeFields) }
        });
      }
      next();
    } catch (error) {
      console.error('AuditLog Error:', error);
      next(error);
    }
  });

  // Hook for deleting documents
  schema.post('findOneAndDelete', async function (doc, next) {
    try {
      if (doc) {
        // Find performedBy from the query options if passed
        const performedBy = this.getOptions().userId || doc.user || doc._id;

        if (performedBy) {
          await AuditLog.create({
            action: 'DELETE',
            entityType,
            entityId: doc._id,
            performedBy,
            details: { snapshot: doc.toObject() }
          });
        }
      }
      next();
    } catch (error) {
      console.error('AuditLog Error:', error);
      next(error);
    }
  });
};
