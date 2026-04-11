/**
 * Billing Routes
 */

const express = require('express');
const router = express.Router();
const Billing = require('../models/Billing');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

/**
 * GET /api/billing/current-month
 * Get current month billing
 */
router.get('/current-month', async (req, res) => {
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
        period: { startDate: startOfMonth, endDate: endOfMonth },
        requestCount: 0,
        totalCost: 0,
        status: 'pending',
        costPerRequest: 0.001,
      });
      await billing.save();
      console.log(`[BILLING] Created new billing record for user ${req.user.userId}`);
    }

    console.log(`[BILLING] Current month billing for user ${req.user.userId}: ${billing.requestCount} requests, $${(billing.totalCost / 100).toFixed(2)}`);
    successResponse(res, billing, 'Current month billing retrieved');
  } catch (error) {
    errorResponse(res, error.message, 500, error);
  }
});

/**
 * GET /api/billing/current
 * Get current billing period (alias for current-month)
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
        period: { startDate: startOfMonth, endDate: endOfMonth },
        requestCount: 0,
        totalCost: 0,
        status: 'pending',
        costPerRequest: 0.001,
      });
      await billing.save();
      console.log(`[BILLING] Created new billing record for user ${req.user.userId}`);
    }

    console.log(`[BILLING] Current billing for user ${req.user.userId}: ${billing.requestCount} requests, $${(billing.totalCost / 100).toFixed(2)}`);
    successResponse(res, billing, 'Current billing retrieved');
  } catch (error) {
    errorResponse(res, error.message, 500, error);
  }
});

/**
 * GET /api/billing/history
 * Get billing history with pagination
 */
router.get('/history', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const billingRecords = await Billing.find({ userId: req.user.userId })
      .sort({ 'period.startDate': -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await Billing.countDocuments({ userId: req.user.userId });

    console.log(`[BILLING] Retrieved history for user ${req.user.userId}: ${billingRecords.length} records (page ${page}, total: ${totalCount})`);

    paginatedResponse(res, billingRecords, page, limit, totalCount, 'Billing history retrieved');
  } catch (error) {
    console.error(`[BILLING] History error: ${error.message}`);
    errorResponse(res, error.message, 500, error);
  }
});

/**
 * POST /api/billing/payment
 * Process payment for a billing period
 */
router.post('/payment', async (req, res) => {
  try {
    const { billingId, amountPaid } = req.body;

    if (!billingId || !amountPaid || amountPaid <= 0) {
      return errorResponse(res, 'Invalid billing ID or payment amount', 400);
    }

    const billing = await Billing.findOne({ _id: billingId, userId: req.user.userId });
    if (!billing) {
      return errorResponse(res, 'Billing record not found', 404);
    }

    const totalCost = billing.totalCost; // in cents
    const amountPaidCents = Math.round(amountPaid * 100); // convert to cents
    
    let remaining = 0;
    let refund = 0;

    if (amountPaidCents >= totalCost) {
      // Paid full amount or more
      refund = amountPaidCents - totalCost;
      remaining = 0;
      billing.status = 'paid';
      billing.paymentStatus = 'paid';
      billing.amountPaid = totalCost; // Only record the actual cost paid
    } else {
      // Partial payment
      remaining = totalCost - amountPaidCents;
      billing.amountPaid = amountPaidCents;
      billing.status = 'pending';
      billing.paymentStatus = 'pending';
    }

    billing.updatedAt = new Date();
    await billing.save();

    console.log(`[BILLING] Payment processed - User: ${req.user.userId}, Paid: $${(amountPaidCents / 100).toFixed(2)}, Cost: $${(totalCost / 100).toFixed(2)}, Refund: $${(refund / 100).toFixed(2)}, Remaining: $${(remaining / 100).toFixed(2)}`);

    successResponse(res, {
      amountPaid: amountPaidCents / 100,
      totalCost: totalCost / 100,
      refundAmount: refund / 100,
      remaining: remaining / 100,
      status: billing.status,
      message: refund > 0 ? `Refund of $${(refund / 100).toFixed(2)} will be processed` : (remaining > 0 ? `Remaining balance: $${(remaining / 100).toFixed(2)}` : 'Payment complete')
    }, 'Payment processed successfully');
  } catch (error) {
    console.error(`[BILLING] Payment error: ${error.message}`);
    errorResponse(res, error.message, 500, error);
  }
});

module.exports = router;
