/**
 * Log Routes
 */

const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const Billing = require('../models/Billing');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const LoggingService = require('../services/LoggingService');
const IPFSService = require('../services/IPFSService');
const BlockchainService = require('../services/BlockchainService');

/**
 * POST /api/logs/create
 * Create and store a log
 */
router.post('/create', async (req, res) => {
  try {
    const { endpoint, method, statusCode, requestSize, responseSize, responseTime, metadata } = req.body;

    // Create log object
    const logData = {
      endpoint,
      method,
      statusCode,
      requestSize,
      responseSize,
      responseTime,
      userId: req.user.userId,
      timestamp: new Date().toISOString(),
      ...metadata,
    };

    // Generate hash
    const logHash = LoggingService.generateLogHash(logData);

    // Create signature
    const { privateKey } = await LoggingService.loadKeys();
    const signature = LoggingService.createSignature(logHash, privateKey);

    // Upload to IPFS
    const ipfsHash = await IPFSService.uploadFile(JSON.stringify(logData), `${logHash}.json`);

    // Store on blockchain
    const blockchainHash = await BlockchainService.storeLog(
      ipfsHash,
      signature,
      req.user.userId,
      endpoint,
      statusCode,
      requestSize,
      responseSize
    );

    // Save to MongoDB cache
    const newLog = new Log({
      logHash,
      ipfsHash,
      blockchainHash,
      signature,
      userId: req.user.userId,
      endpoint,
      method,
      statusCode,
      requestSize,
      responseSize,
      responseTime,
      metadata,
    });

    await newLog.save();

    // Update billing for this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    let billing = await Billing.findOne({
      userId: req.user.userId,
      'period.startDate': { $gte: startOfMonth },
      'period.endDate': { $lte: endOfMonth },
    });

    // Calculate cost: $2 per request + $5 for POST requests
    let baseCost = 2.00; // $2 per request
    let methodCost = method.toUpperCase() === 'POST' ? 5.00 : 0; // $5 for POST, $0 for others
    const logCost = baseCost + methodCost; // Total cost for this log
    const costInCents = Math.round(logCost * 100); // Convert to cents

    if (!billing) {
      billing = new Billing({
        userId: req.user.userId,
        period: { startDate: startOfMonth, endDate: endOfMonth },
        requestCount: 1,
        totalCost: costInCents, // Store in cents
        status: 'pending',
        costPerRequest: 2.00, // Updated base cost
      });
    } else {
      billing.requestCount += 1;
      billing.totalCost += costInCents;
    }

    await billing.save();
    console.log(`[BILLING] Updated billing for user ${req.user.userId}: method=${method}, cost=$${logCost.toFixed(2)}, total=$${(billing.totalCost / 100).toFixed(2)}`);

    successResponse(res, {
      logHash,
      ipfsHash,
      blockchainHash,
      signature,
    }, 'Log created and stored', 201);
  } catch (error) {
    errorResponse(res, error.message, 500, error);
  }
});

/**
 * GET /api/logs
 * Get user logs with pagination and filtering
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter query
    const filter = { userId: req.user.userId };
    
    if (req.query.endpoint) {
      filter.endpoint = { $regex: req.query.endpoint, $options: 'i' };
    }
    
    if (req.query.method) {
      filter.method = req.query.method;
    }
    
    if (req.query.statusCode) {
      const statusCode = parseInt(req.query.statusCode);
      // Handle status code ranges (2, 3, 4, 5 for 2xx, 3xx, 4xx, 5xx)
      if (statusCode >= 2 && statusCode <= 5) {
        const minCode = statusCode * 100;
        const maxCode = minCode + 99;
        filter.statusCode = { $gte: minCode, $lte: maxCode };
      } else {
        filter.statusCode = statusCode;
      }
    }

    const logs = await Log.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Log.countDocuments(filter);

    paginatedResponse(res, logs, total, page, limit, 'Logs retrieved');
  } catch (error) {
    errorResponse(res, error.message, 500, error);
  }
});

/**
 * GET /api/logs/:logHash
 * Get specific log details
 */
router.get('/:logHash', async (req, res) => {
  try {
    const log = await Log.findOne({ logHash: req.params.logHash, userId: req.user.userId });
    if (!log) return errorResponse(res, 'Log not found', 404);

    // Try to retrieve from IPFS if not verified
    if (!log.verified) {
      try {
        const ipfsData = await IPFSService.retrieveFile(log.ipfsHash);
        log.ipfsData = ipfsData;
      } catch (ipfsError) {
        // If IPFS retrieval fails (e.g., mock hash in testing), continue without it
        console.warn(`[IPFS] Could not retrieve file ${log.ipfsHash}: ${ipfsError.message}`);
        // Don't fail - return log data even if IPFS retrieval failed
        log.ipfsData = null;
      }
    }

    successResponse(res, log);
  } catch (error) {
    errorResponse(res, error.message, 500, error);
  }
});

/**
 * POST /api/logs/:logHash/verify
 * Auto-verify a log (mark as verified after blockchain confirmation)
 */
router.post('/:logHash/verify', async (req, res) => {
  try {
    console.log(`[VERIFY] Attempting to verify log: ${req.params.logHash} for user: ${req.user.userId}`);
    
    const log = await Log.findOne({ logHash: req.params.logHash, userId: req.user.userId });
    if (!log) {
      console.log(`[VERIFY] Log not found: ${req.params.logHash}`);
      return errorResponse(res, 'Log not found', 404);
    }

    if (!log.verified) {
      log.verified = true;
      log.verifiedAt = new Date();
      await log.save();
      console.log(`[VERIFY] Log verified successfully: ${req.params.logHash}`);
    } else {
      console.log(`[VERIFY] Log already verified: ${req.params.logHash}`);
    }

    successResponse(res, { verified: true, log }, 'Log verified');
  } catch (error) {
    console.error(`[VERIFY] Error verifying log: ${error.message}`);
    errorResponse(res, error.message, 500, error);
  }
});

module.exports = router;
