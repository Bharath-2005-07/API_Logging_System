/**
 * Log Routes
 */

const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
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
 * Get user logs with pagination
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const logs = await Log.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Log.countDocuments({ userId: req.user.userId });

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
      const ipfsData = await IPFSService.retrieveFile(log.ipfsHash);
      log.ipfsData = ipfsData;
    }

    successResponse(res, log);
  } catch (error) {
    errorResponse(res, error.message, 500, error);
  }
});

module.exports = router;
