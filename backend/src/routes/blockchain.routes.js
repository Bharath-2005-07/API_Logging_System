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

module.exports = router;
