/**
 * Billing Model
 * Represents billing records
 */

const mongoose = require('mongoose');

const billingSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true,
  },
  period: {
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  requestCount: {
    type: Number,
    default: 0,
  },
  totalCost: {
    type: Number,
    default: 0,
  },
  costPerRequest: {
    type: Number,
    default: 2.00, // Updated to $2 per request
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'cancelled'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'overdue', 'cancelled'],
    default: 'pending',
  },
  amountPaid: {
    type: Number,
    default: 0,
  },
  invoiceNumber: String,
  paymentMethod: {
    type: String,
    enum: ['crypto', 'card', 'bank_transfer'],
  },
  transactionHash: String,
  notes: String,
}, {
  timestamps: true,
});

billingSchema.index({ userId: 1, 'period.startDate': -1 });

module.exports = mongoose.model('Billing', billingSchema);
