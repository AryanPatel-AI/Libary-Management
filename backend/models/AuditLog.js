const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['CREATE', 'UPDATE', 'DELETE', 'ISSUE', 'RETURN', 'RESERVE', 'LOGIN']
  },
  entityType: {
    type: String,
    required: true,
    enum: ['Book', 'User', 'Transaction', 'Reservation']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed
  }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
