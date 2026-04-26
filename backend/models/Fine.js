const mongoose = require('mongoose');

const fineSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: [true, 'Transaction is required']
  },
  amount: {
    type: Number,
    required: [true, 'Fine amount is required'],
    min: [0, 'Fine amount cannot be negative']
  },
  paid: {
    type: Boolean,
    default: false
  },
  paidDate: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Index for quick lookups
fineSchema.index({ user: 1, paid: 1 });

module.exports = mongoose.model('Fine', fineSchema);
