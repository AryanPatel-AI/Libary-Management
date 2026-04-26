const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
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
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['issued', 'returned', 'overdue'],
    default: 'issued'
  },
  fine: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const auditLogPlugin = require('../utils/auditMiddleware');

// Calculate fine before saving if returned late
transactionSchema.pre('save', function(next) {
  if (this.status === 'returned' && this.returnDate > this.dueDate) {
    const daysLate = Math.ceil((this.returnDate - this.dueDate) / (1000 * 60 * 60 * 24));
    this.fine = daysLate * 10; // $10 per day late
  }
  next();
});

// Calculate fine before findOneAndUpdate if status is set to 'returned'
transactionSchema.pre('findOneAndUpdate', async function(next) {
  const update = this.getUpdate();
  if (update.status === 'returned' && update.returnDate) {
    const doc = await this.model.findOne(this.getQuery());
    if (doc && update.returnDate > doc.dueDate) {
      const daysLate = Math.ceil((update.returnDate - doc.dueDate) / (1000 * 60 * 60 * 24));
      update.fine = daysLate * 10;
    }
  }
  next();
});

// Apply audit log plugin
transactionSchema.plugin(auditLogPlugin, { entityType: 'Transaction' });

// Index for quick lookups
transactionSchema.index({ user: 1, status: 1 });
transactionSchema.index({ book: 1, status: 1 });
transactionSchema.index({ dueDate: 1, status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
