/**
 * Blockchain Routes
 */

const express = require('express');
const router = express.Router();
const { successResponse, errorResponse } = require('../utils/response');
const BlockchainService = require('../services/BlockchainService');

/**
 * GET /api/blockchain/stats
 * Get blockchain statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const logCount = await BlockchainService.getLogCount();
    const userStats = await BlockchainService.getUserStats(req.user.userId);

    successResponse(res, { logCount, userStats });
  } catch (error) {
    errorResponse(res, error.message, 500, error);
  }
});

/**
 * GET /api/blockchain/logs
 * Get user logs from blockchain
 */
router.get('/logs', async (req, res) => {
  try {
    const logs = await BlockchainService.getUserLogs(req.user.userId);
    successResponse(res, logs);
  } catch (error) {
    errorResponse(res, error.message, 500, error);
  }
});

/**
 * GET /api/blockchain/verify/:ipfsHash
 * Verify whether log exists on-chain for provided IPFS hash/CID
 */
router.get('/verify/:ipfsHash', async (req, res) => {
  try {
    const { ipfsHash } = req.params;
    const onChainKey = BlockchainService.toOnChainIpfsKey(ipfsHash);
    const log = await BlockchainService.getLog(ipfsHash);

    if (!log) {
      return successResponse(res, {
        exists: false,
        onChainKey,
      }, 'Log not found on blockchain');
    }

    successResponse(res, {
      exists: true,
      onChainKey,
      ipfsHashOnChain: log.ipfsHash ? log.ipfsHash.toString() : null,
      userId: log.userId,
      endpoint: log.endpoint,
      statusCode: Number(log.statusCode),
      requestSize: Number(log.requestSize),
      responseSize: Number(log.responseSize),
      verified: log.verified,
      timestamp: Number(log.timestamp),
      transactionHash: null,
      blockNumber: null,
    }, 'Log found on blockchain');
  } catch (error) {
    errorResponse(res, error.message, 500, error);
  }
});

module.exports = router;
