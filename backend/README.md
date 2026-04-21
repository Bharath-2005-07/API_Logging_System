# Backend Server

## Overview

Express backend for auth, log generation, IPFS upload, on-chain anchoring, billing, and verification.

## Current Highlights

- JWT auth routes
- User profile/stats routes
- Log creation flow with:
  - SHA-256 log hash
  - RSA signature
  - IPFS CID upload
  - Sepolia smart contract write
- Per-user chain fields in log records:
  - previousHash
  - chainIndex
- Chain verification endpoint
- Billing with current pricing

## Start

```bash
npm install
npm start
```

Server default: http://localhost:5000

## Required Environment (root .env)

```env
BACKEND_PORT=5000
MONGODB_URI=mongodb://localhost:27017/api-logging-db
JWT_SECRET=...
ETHEREUM_RPC_URL=...
PRIVATE_KEY=0x...
CONTRACT_ADDRESS=0x...
```

## Main APIs

### Auth
- POST /api/auth/register
- POST /api/auth/login

### Users
- GET /api/users/profile
- PUT /api/users/profile
- GET /api/users/stats

### Logs
- POST /api/logs/create
- GET /api/logs
- GET /api/logs/:logHash
- POST /api/logs/:logHash/verify
- GET /api/logs/chain/verify

### Billing
- GET /api/billing/current-month
- GET /api/billing/current
- GET /api/billing/history
- POST /api/billing/payment

### Blockchain
- GET /api/blockchain/stats
- GET /api/blockchain/logs
- GET /api/blockchain/verify/:ipfsHash

## Log Create Response (current)

```json
{
  "logHash": "...",
  "previousHash": "... or null",
  "chainIndex": 0,
  "ipfsHash": "...",
  "blockchainHash": "... or null",
  "signature": "..."
}
```

## Chain Verification Response (current)

GET /api/logs/chain/verify returns:

- chainValid
- totalLogs
- brokenCount
- head
- brokenLinks[]

## Notes

- If blockchainHash is null, on-chain anchoring failed or is pending.
- Use log hash for Verify page; use transaction hash for Etherscan.

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
