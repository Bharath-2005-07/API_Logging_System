/**
 * Auth Routes
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/response');
const { validateEmail, validatePassword, validateUserId } = require('../utils/validation');
const crypto = require('crypto');

/**
 * POST /api/auth/register
 * Register new user
 */
router.post('/register', async (req, res) => {
  try {
    const { userId, email, name, password, walletAddress } = req.body;

    // Validation
    if (!validateUserId(userId)) return errorResponse(res, 'Invalid user ID', 400);
    if (!validateEmail(email)) return errorResponse(res, 'Invalid email', 400);
    if (!validatePassword(password)) return errorResponse(res, 'Password must be at least 6 characters', 400);
    if (!name) return errorResponse(res, 'Name is required', 400);

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { userId }] });
    if (existingUser) return errorResponse(res, 'User already exists', 409);

    // Create user
    const newUser = new User({
      userId,
      email,
      name,
      passwordHash: password,
      walletAddress: walletAddress || null,
      apiKey: crypto.randomBytes(16).toString('hex'),
    });

    await newUser.save();

    const token = generateToken(userId, email);

    successResponse(res, { token, user: newUser.toJSON() }, 'User registered successfully', 201);
  } catch (error) {
    errorResponse(res, error.message, 500, error);
  }
});

/**
 * POST /api/auth/login
 * User login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email and password required', 400);
    }

    const user = await User.findOne({ email }).select('+passwordHash');
    if (!user) return errorResponse(res, 'Invalid credentials', 401);

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) return errorResponse(res, 'Invalid credentials', 401);

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user.userId, user.email);

    successResponse(res, { token, user: user.toJSON() }, 'Login successful');
  } catch (error) {
    errorResponse(res, error.message, 500, error);
  }
});

module.exports = router;
