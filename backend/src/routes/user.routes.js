/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * GET /api/users/profile
 * Get current user profile
 */
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) return errorResponse(res, 'User not found', 404);

    successResponse(res, user.toJSON(), 'Profile retrieved');
  } catch (error) {
    errorResponse(res, error.message, 500, error);
  }
});

/**
 * PUT /api/users/profile
 * Update user profile
 */
router.put('/profile', async (req, res) => {
  try {
    const { name, walletAddress, profile } = req.body;

    const updatedUser = await User.findOneAndUpdate(
      { userId: req.user.userId },
      {
        ...(name && { name }),
        ...(walletAddress && { walletAddress }),
        ...(profile && { profile }),
      },
      { new: true }
    );

    successResponse(res, updatedUser.toJSON(), 'Profile updated');
  } catch (error) {
    errorResponse(res, error.message, 500, error);
  }
});

/**
 * GET /api/users/stats
 * Get user statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.user.userId });
    if (!user) return errorResponse(res, 'User not found', 404);

    successResponse(res, {
      userId: user.userId,
      totalRequests: user.totalRequests,
      totalCost: user.totalCost,
      registeredAt: user.registeredAt,
      lastLogin: user.lastLogin,
    });
  } catch (error) {
    errorResponse(res, error.message, 500, error);
  }
});

module.exports = router;
