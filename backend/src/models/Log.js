/**
 * Log Model
 * Represents API logs in MongoDB (cache)
 */

const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  logHash: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  ipfsHash: {
    type: String,
    required: true,
  },
  blockchainHash: {
    type: String,
    default: null,
  },
  signature: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
    index: true,
  },
  endpoint: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    required: true,
  },
  statusCode: {
    type: Number,
    required: true,
  },
  requestSize: {
    type: Number,
    default: 0,
  },
  responseSize: {
    type: Number,
    default: 0,
  },
  responseTime: {
    type: Number,
    default: 0,
  },
  userAgent: String,
  ipAddress: String,
  verified: {
    type: Boolean,
    default: false,
  },
  verifiedAt: {
    type: Date,
    default: null,
  },
  metadata: {
    type: Object,
    default: {},
  },
}, {
  timestamps: true,
  indexes: [
    { userId: 1, createdAt: -1 },
    { endpoint: 1, createdAt: -1 },
    { statusCode: 1 },
  ],
});

module.exports = mongoose.model('Log', logSchema);
