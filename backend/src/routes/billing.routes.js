/**
 * Billing Routes
 */

const express = require('express');
const router = express.Router();
const Billing = require('../models/Billing');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

/**
 * GET /api/billing/history
 * Get user billing history
 */
router.get('/history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const records = await Billing.find({ userId: req.user.userId })
      .sort({ 'period.startDate': -1 })
      .skip(skip)
      .limit(limit);

    const total = await Billing.countDocuments({ userId: req.user.userId });

    paginatedResponse(res, records, total, page, limit, 'Billing history retrieved');
  } catch (error) {
    errorResponse(res, error.message, 500, error);
  }
});

/**
 * GET /api/billing/current
 * Get current billing period
 */
router.get('/current', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    let billing = await Billing.findOne({
      userId: req.user.userId,
      'period.startDate': { $gte: startOfMonth },
      'period.endDate': { $lte: endOfMonth },
    });

    if (!billing) {
      billing = new Billing({
        userId: req.user.userId,
        period: { startDate, endOfMonth },
        requestCount: 0,
        totalCost: 0,
      });
      await billing.save();
    }

    successResponse(res, billing);
  } catch (error) {
    errorResponse(res, error.message, 500, error);
  }
});

module.exports = router;
