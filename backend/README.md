# Backend Server

## Overview

Node.js Express backend for the API logging system. Handles user authentication, log generation, IPFS integration, and blockchain interaction.

## Features

- ✅ User authentication (JWT)
- ✅ Log generation and storage
- ✅ IPFS integration
- ✅ Smart contract interaction
- ✅ Digital signatures
- ✅ Rate limiting
- ✅ MongoDB caching
- ✅ Billing system

## Structure

```
backend/
├── src/
│   ├── models/          # MongoDB schemas
│   │   ├── User.js
│   │   ├── Log.js
│   │   └── Billing.js
│   ├── routes/          # API endpoints
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── log.routes.js
│   │   ├── billing.routes.js
│   │   ├── blockchain.routes.js
│   │   └── ipfs.routes.js
│   ├── services/        # Business logic
│   │   ├── LoggingService.js
│   │   ├── IPFSService.js
│   │   └── BlockchainService.js
│   ├── middleware/      # Express middleware
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── utils/           # Utilities
│   │   ├── database.js
│   │   ├── validation.js
│   │   ├── response.js
│   │   └── APILoggerABI.json
│   └── server.js        # Main entry point
├── package.json
└── README.md
```

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy and edit `.env`:
```bash
cp ../.env.example ../.env
```

Key variables needed:
```env
BACKEND_PORT=5000
MONGODB_URI=mongodb://localhost:27017/api-logging-db
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
CONTRACT_ADDRESS=0x...
IPFS_HOST=ipfs.infura.io
JWT_SECRET=your_secret_key
```

### 3. Start Backend

```bash
npm start          # Production mode
npm run dev        # Development with auto-reload
```

Server starts on `http://localhost:5000`

## API Endpoints

### Authentication
```
POST   /api/auth/register      # Register new user
POST   /api/auth/login         # Login user
```

### Users
```
GET    /api/users/profile      # Get user profile
PUT    /api/users/profile      # Update profile
GET    /api/users/stats        # Get statistics
```

### Logs
```
POST   /api/logs/create        # Create new log
GET    /api/logs               # Get user logs (paginated)
GET    /api/logs/:logHash      # Get specific log
```

### Billing
```
GET    /api/billing/history    # Get billing history
GET    /api/billing/current    # Get current period
```

### Blockchain
```
GET    /api/blockchain/stats   # Get stats
GET    /api/blockchain/logs    # Get blockchain logs
```

### IPFS
```
POST   /api/ipfs/upload        # Upload to IPFS
GET    /api/ipfs/retrieve/:hash # Retrieve from IPFS
```

## API Request Examples

### Register User
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "john_doe",
    "email": "john@example.com",
    "name": "John Doe",
    "password": "secure_password"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "secure_password"
  }'
```

### Create Log
```bash
curl -X POST http://localhost:5000/api/logs/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/api/users",
    "method": "GET",
    "statusCode": 200,
    "requestSize": 256,
    "responseSize": 1024,
    "responseTime": 45
  }'
```

### Get User Logs
```bash
curl -X GET "http://localhost:5000/api/logs?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Services

### LoggingService
Handles log generation, hashing, and digital signatures.

```javascript
// Generate hash
const hash = LoggingService.generateLogHash(logData);

// Create signature
const signature = LoggingService.createSignature(hash, privateKey);

// Verify signature
const isValid = LoggingService.verifySignature(hash, signature, publicKey);
```

### IPFSService
Manages IPFS interactions.

```javascript
// Upload file
const ipfsHash = await IPFSService.uploadFile(content, filename);

// Retrieve file
const content = await IPFSService.retrieveFile(ipfsHash);

// Pin file
await IPFSService.pinFile(ipfsHash);
```

### BlockchainService
Blockchain smart contract interactions.

```javascript
// Store log
const txHash = await BlockchainService.storeLog(...);

// Get log
const log = await BlockchainService.getLog(ipfsHash);

// Register user
await BlockchainService.registerUser(userId);
```

## Middleware

### Authentication
- Verifies JWT tokens
- Attaches user info to request

### Error Handler
- Centralized error handling
- Consistent error responses
- Detailed logging

## Database Models

### User
- userId (unique)
- email (unique)
- passwordHash
- walletAddress
- totalRequests
- totalCost
- apiKey

### Log
- logHash (unique)
- ipfsHash
- blockchainHash
- signature
- userId
- endpoint
- statusCode
- responseTime
- verified

### Billing
- userId
- period (startDate, endDate)
- requestCount
- totalCost
- status (pending, paid, overdue)

## Testing

```bash
npm test                 # Run tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

## Linting

```bash
npm run lint           # Check code
npm run lint:fix      # Fix issues
```

## Environmental Variables

Required:
```env
BACKEND_PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/api-logging-db
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=0x...
IPFS_HOST=ipfs.infura.io
IPFS_PORT=5001
JWT_SECRET=your_jwt_secret
```

Optional:
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
MONGODB_USERNAME=user
MONGODB_PASSWORD=pass
LOG_LEVEL=debug
```

## Rate Limiting

Default: 100 requests per 15 minutes per IP

Configurable via:
```env
RATE_LIMIT_WINDOW_MS=900000    # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "timestamp": "2026-04-05T10:30:00Z"
}
```

## Success Responses

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ },
  "timestamp": "2026-04-05T10:30:00Z"
}
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| MongoDB connection failed | Ensure MongoDB is running, check URI in .env |
| JWT verification failed | Check JWT_SECRET in .env, token format |
| IPFS upload failed | Verify IPFS credentials, network connection |
| Blockchain error | Check RPC URL, private key, contract address |
| Rate limit exceeded | Wait 15 minutes or adjust RATE_LIMIT_WINDOW_MS |

## Security Best Practices

- ✅ All passwords hashed with bcryptjs
- ✅ JWT token-based authentication
- ✅ Input validation and sanitization
- ✅ Rate limiting by IP
- ✅ Helmet security headers
- ✅ CORS properly configured

## Performance Optimization

- MongoDB indexes on frequently queried fields
- Caching layer with MongoDB
- Compression of HTTP responses
- Request size limits
- Efficient database queries

## Monitoring

Log all requests:
```bash
DEBUG=* npm start
```

## Deployment

```bash
# Production build
npm prune --production

# Deploy
NODE_ENV=production npm start
```

## Support

- Check error logs for details
- Verify all environment variables
- Ensure external services (MongoDB, IPFS, Blockchain) are accessible

## License

MIT
