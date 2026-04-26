const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Amount must be a positive value']
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  paymentId: {
    type: String
  },
  orderDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const auditLogPlugin = require('../utils/auditMiddleware');
orderSchema.plugin(auditLogPlugin, { entityType: 'Order' });

module.exports = mongoose.model('Order', orderSchema);
