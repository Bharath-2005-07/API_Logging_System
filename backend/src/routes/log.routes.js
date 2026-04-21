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

    // Build per-user chain context.
    const previousLog = await Log.findOne({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .select('logHash chainIndex');

    const previousHash = previousLog ? previousLog.logHash : null;
    const chainIndex = previousLog ? (previousLog.chainIndex || 0) + 1 : 0;

    // Create log object
    const logData = {
      endpoint,
      method,
      statusCode,
      requestSize,
      responseSize,
      responseTime,
      userId: req.user.userId,
      previousHash,
      chainIndex,
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
      previousHash,
      chainIndex,
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
        paymentStatus: 'pending',
        amountPaid: 0,
        costPerRequest: 2.00, // Updated base cost
      });
    } else {
      billing.requestCount += 1;
      billing.totalCost += costInCents;

      const paidSoFar = billing.amountPaid || 0;
      const outstanding = billing.totalCost - paidSoFar;

      // New usage should only stay paid when there is no outstanding balance.
      if (outstanding > 0) {
        billing.status = 'pending';
        billing.paymentStatus = 'pending';
      } else {
        billing.status = 'paid';
        billing.paymentStatus = 'paid';
      }
    }

    await billing.save();
    console.log(`[BILLING] Updated billing for user ${req.user.userId}: method=${method}, cost=$${logCost.toFixed(2)}, total=$${(billing.totalCost / 100).toFixed(2)}`);

    successResponse(res, {
      logHash,
      previousHash,
      chainIndex,
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
 * GET /api/logs/chain/verify
 * Verify per-user previousHash chain integrity
 */
router.get('/chain/verify', async (req, res) => {
  try {
    const logs = await Log.find({ userId: req.user.userId })
      .sort({ createdAt: 1 })
      .select('logHash previousHash chainIndex createdAt endpoint method');

    const brokenLinks = [];

    for (let i = 0; i < logs.length; i += 1) {
      const current = logs[i];
      const prev = i > 0 ? logs[i - 1] : null;

      const expectedPreviousHash = prev ? prev.logHash : null;
      const expectedIndex = i;

      const linkMatches = (current.previousHash || null) === expectedPreviousHash;
      const indexMatches = (current.chainIndex || 0) === expectedIndex;

      if (!linkMatches || !indexMatches) {
        brokenLinks.push({
          logHash: current.logHash,
          previousHash: current.previousHash,
          expectedPreviousHash,
          chainIndex: current.chainIndex,
          expectedChainIndex: expectedIndex,
          createdAt: current.createdAt,
          endpoint: current.endpoint,
          method: current.method,
        });
      }
    }

    successResponse(res, {
      chainValid: brokenLinks.length === 0,
      totalLogs: logs.length,
      brokenCount: brokenLinks.length,
      head: logs.length ? logs[logs.length - 1].logHash : null,
      brokenLinks,
    }, 'Chain verification completed');
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

    const { publicKey } = await LoggingService.loadKeys();
    const signatureValid = LoggingService.verifySignature(log.logHash, log.signature, publicKey);
    let ipfsAvailable = false;
    let hashMatches = false;
    let dbMatchesIpfs = false;
    let recomputedHash = null;

    let onChainAvailable = false;
    let transactionMined = false;
    let onChainIpfsMatches = false;
    let dbMatchesOnChain = false;
    let signatureOnChainMatches = false;
    let verificationSource = 'none';

    try {
      const ipfsData = await IPFSService.retrieveFile(log.ipfsHash);
      const canonicalIpfsData = typeof ipfsData === 'string' ? JSON.parse(ipfsData) : ipfsData;
      recomputedHash = LoggingService.generateLogHash(canonicalIpfsData);
      ipfsAvailable = true;

      hashMatches = recomputedHash === log.logHash && log.logHash === req.params.logHash;

      // Detect cache tampering by comparing DB fields with canonical IPFS payload.
      dbMatchesIpfs = (
        String(log.endpoint) === String(canonicalIpfsData.endpoint) &&
        String(log.method) === String(canonicalIpfsData.method) &&
        Number(log.statusCode) === Number(canonicalIpfsData.statusCode) &&
        Number(log.requestSize) === Number(canonicalIpfsData.requestSize) &&
        Number(log.responseSize) === Number(canonicalIpfsData.responseSize) &&
        Number(log.responseTime || 0) === Number(canonicalIpfsData.responseTime || 0) &&
        String(log.userId) === String(canonicalIpfsData.userId) &&
        String(log.previousHash || '') === String(canonicalIpfsData.previousHash || '') &&
        Number(log.chainIndex || 0) === Number(canonicalIpfsData.chainIndex || 0)
      );

      verificationSource = 'ipfs';
    } catch (ipfsError) {
      console.warn(`[VERIFY] IPFS retrieval failed for ${log.ipfsHash}, using on-chain fallback: ${ipfsError.message}`);

      const onChainLog = log.blockchainHash
        ? await BlockchainService.getStoredLogFromTransaction(log.blockchainHash)
        : null;

      const expectedOnChainKey = BlockchainService.toOnChainIpfsKey(log.ipfsHash);
      const onChainKey = onChainLog && onChainLog.ipfsHash ? String(onChainLog.ipfsHash) : '';

      onChainAvailable = Boolean(onChainLog);
      transactionMined = onChainAvailable && Number(onChainLog.txStatus || 0) === 1;

      onChainIpfsMatches = onChainAvailable && onChainKey.toLowerCase() === String(expectedOnChainKey).toLowerCase();

      dbMatchesOnChain = onChainAvailable && (
        String(log.userId) === String(onChainLog.userId || '') &&
        String(log.endpoint) === String(onChainLog.endpoint || '') &&
        Number(log.statusCode) === Number(onChainLog.statusCode || 0) &&
        Number(log.requestSize) === Number(onChainLog.requestSize || 0) &&
        Number(log.responseSize) === Number(onChainLog.responseSize || 0)
      );

      const normalizedDbSignature = BlockchainService.normalizeBytesSignature(log.signature);
      const normalizedOnChainSignature = onChainAvailable
        ? BlockchainService.normalizeBytesSignature(onChainLog.signature)
        : null;

      signatureOnChainMatches = Boolean(normalizedOnChainSignature) && normalizedDbSignature === normalizedOnChainSignature;
      verificationSource = 'blockchain-tx-fallback';
    }

    const isValid = signatureValid && (
      (ipfsAvailable && hashMatches && dbMatchesIpfs) ||
      (!ipfsAvailable && onChainAvailable && transactionMined && onChainIpfsMatches && dbMatchesOnChain && signatureOnChainMatches)
    );

    log.verified = isValid;
    log.verifiedAt = isValid ? new Date() : null;
    await log.save();

    successResponse(res, {
      isValid,
      verified: isValid,
      verificationSource,
      checks: {
        hashMatches,
        signatureValid,
        dbMatchesIpfs,
        ipfsAvailable,
        onChainAvailable,
        transactionMined,
        onChainIpfsMatches,
        dbMatchesOnChain,
        signatureOnChainMatches,
      },
      recomputedHash,
      log,
    }, isValid ? 'Log verified successfully' : 'Log tampering detected');
  } catch (error) {
    console.error(`[VERIFY] Error verifying log: ${error.message}`);
    errorResponse(res, error.message, 500, error);
  }
});

module.exports = router;
