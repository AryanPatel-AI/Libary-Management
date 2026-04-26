const mongoose = require('mongoose');
const auditLogPlugin = require('../utils/auditMiddleware');

const reservationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book is required']
  },
  status: {
    type: String,
    enum: ['waiting', 'notified', 'fulfilled', 'expired', 'cancelled'],
    default: 'waiting'
  },
  position: {
    type: Number,
    default: 1
  },
  reservationDate: {
    type: Date,
    default: Date.now
  },
  notifiedAt: {
    type: Date
  },
  expiresAt: {
    type: Date
  }
}, { timestamps: true });

// Apply audit log plugin
reservationSchema.plugin(auditLogPlugin, { entityType: 'Reservation' });

// Add unique index for active reservations (prevent duplicate waiting/notified for same user/book)
reservationSchema.index(
  { user: 1, book: 1 }, 
  { 
    unique: true, 
    partialFilterExpression: { status: { $in: ['waiting', 'notified'] } } 
  }
);

module.exports = mongoose.model('Reservation', reservationSchema);
