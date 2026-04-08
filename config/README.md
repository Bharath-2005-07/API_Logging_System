# Configuration Files

## Overview

This directory contains all configuration files for the Blockchain API Logging System.

## Files

### blockchain.config.js
Blockchain/Ethereum configuration:
- Network details
- RPC provider URLs
- Contract address
- Gas settings

### ipfs.config.js
IPFS configuration:
- Node connection details
- Infura settings
- Pin settings
- Timeout configurations

### database.config.js
MongoDB configuration:
- Connection strings
- Database name
- Replica set settings
- SSL/TLS options

## Usage

### In Backend

```javascript
const blockchainConfig = require('../config/blockchain.config');
const ipfsConfig = require('../config/ipfs.config');
const dbConfig = require('../config/database.config');
```

## Environment Variables

All configurations read from `.env`:

```env
# Blockchain
ETHEREUM_RPC_URL=...
PRIVATE_KEY=...
CONTRACT_ADDRESS=...

# IPFS
IPFS_HOST=...
IPFS_PORT=...

# Database
MONGODB_URI=...
```

## Development vs Production

### Development
- Sepolia testnet
- Local IPFS or Infura
- MongoDB local or Atlas

### Production
- Ethereum mainnet
- IPFS pinning service
- MongoDB Atlas with replication

## Notes

- Never commit `.env` files
- Always use `example` files for templates
- Update configs before deployment
- Test configurations before production
