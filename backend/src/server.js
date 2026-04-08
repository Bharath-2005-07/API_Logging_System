/**
 * Main Backend Server
 * Handles API requests, log generation, IPFS storage, and blockchain interaction
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');

// Route imports
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const logRoutes = require('./routes/log.routes');
const billingRoutes = require('./routes/billing.routes');
const blockchainRoutes = require('./routes/blockchain.routes');
const ipfsRoutes = require('./routes/ipfs.routes');

// Middleware imports
const errorHandler = require('./middleware/errorHandler');
const { authenticateToken } = require('./middleware/auth');
const { connectDatabase } = require('./utils/database');
const path = require('path');

// Load environment variables from root .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(mongoSanitize());

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined'));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/logs', authenticateToken, logRoutes);
app.use('/api/billing', authenticateToken, billingRoutes);
app.use('/api/blockchain', authenticateToken, blockchainRoutes);
app.use('/api/ipfs', authenticateToken, ipfsRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Error Handler
app.use(errorHandler);

// Start Server
const server = app.listen(PORT, async () => {
  // Connect to MongoDB
  await connectDatabase();
  
  console.log(`
╔════════════════════════════════════════════════╗
║   API Logging System - Backend Server Started   ║
║   Port: ${PORT}                                    ║
║   Environment: ${process.env.NODE_ENV || 'development'}           ║
║   Time: ${new Date().toISOString()}  ║
╚════════════════════════════════════════════════╝
  `);
});

// Graceful Shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;
