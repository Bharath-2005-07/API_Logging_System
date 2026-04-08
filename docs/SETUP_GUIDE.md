# Setup Guide

## Complete Installation & Setup Instructions

### Prerequisites

Before starting, ensure you have:

- **Node.js** v16+ ([Download](https://nodejs.org/))
- **npm** v8+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **MongoDB** (local or Atlas)
- **Hardhat** (for smart contracts)
- **MetaMask** (browser wallet)
- **Ethereum Testnet ETH** (Sepolia faucet)

### Step 1: Clone & Initialize

```bash
# Navigate to project directory
cd blockchain-api-logging

# Copy environment template
cp .env.example .env

# Edit .env with your details
nano .env  # or use your text editor
```

### Step 2: Setup Smart Contracts

```bash
cd contracts

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Create keys directory
mkdir keys

# Generate RSA keys (for signatures)
openssl genrsa -out keys/private.key 2048
openssl rsa -in keys/private.key -pubout -out keys/public.key

# Deploy to Sepolia testnet
npx hardhat run scripts/deploy.js --network sepolia

# Copy the contract address to .env
# CONTRACT_ADDRESS=0x...
```

### Step 3: Setup Backend

```bash
cd ../backend

# Install dependencies
npm install

# Configure environment
# Ensure .env has:
# - ETHEREUM_RPC_URL
# - CONTRACT_ADDRESS
# - MONGODB_URI
# - IPFS credentials
# - JWT_SECRET

# Copy keys from contracts directory
cp ../contracts/keys ./keys

# Start backend
npm start

# Backend should be running on http://localhost:5000
```

### Step 4: Setup Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Create .env file
echo "REACT_APP_BACKEND_URL=http://localhost:5000" > .env
echo "REACT_APP_CONTRACT_ADDRESS=0x..." >> .env
echo "REACT_APP_NETWORK=sepolia" >> .env

# Start development server
npm start

# App opens on http://localhost:3000
```

### Step 5: Verify Installation

#### Check Backend Health
```bash
curl http://localhost:5000/health
# Expected: { "status": "OK", ... }
```

#### Check Frontend
- Open http://localhost:3000
- Should see login page

#### Connect Wallet
1. Install MetaMask browser extension
2. Switch to Sepolia testnet
3. Register/Login on app

#### Test API
```bash
# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "testuser",
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'

# Should return token
```

## Configuration Details

### Environment Variables

#### Required (.env)
```env
# Blockchain
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=0x...deployed_address

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# IPFS
INFURA_IPFS_PROJECT_ID=your_project_id
INFURA_IPFS_PROJECT_SECRET=your_secret

# Backend
JWT_SECRET=your_very_secret_key_here
BACKEND_PORT=5000
```

#### Optional
```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=debug
NODE_ENV=development
```

### Get Testnet ETH

1. Go to [Sepolia Faucet](https://sepoliafaucet.com/)
2. Connect MetaMask wallet
3. Claim ETH (usually 0.05 ETH)
4. Wait for confirmation

### Get IPFS Credentials

1. Sign up at [Infura](https://infura.io/)
2. Create new project
3. Select IPFS from dashboard
4. Copy Project ID and Secret
5. Add to .env

### Get MongoDB

Option A: Local MongoDB
```bash
# Install MongoDB Community
# Then run:
mongod
```

Option B: MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Get connection string
4. Add to .env as MONGODB_URI

## Troubleshooting

### Issue: Backend won't start

**Solution 1**: Check dependencies
```bash
cd backend
npm install
npm audit fix
```

**Solution 2**: Check MongoDB connection
```bash
# Test with mongo shell
mongo "mongodb://localhost:27017"
```

**Solution 3**: Check port 5000
```bash
# Windows
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :5000
```

### Issue: Frontend can't connect to backend

**Solution**: Update REACT_APP_BACKEND_URL
```env
REACT_APP_BACKEND_URL=http://localhost:5000
```

Then restart frontend:
```bash
npm start
```

### Issue: Smart contract deployment fails

**Solution 1**: Check RPC URL
```bash
curl https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
```

**Solution 2**: Ensure sufficient ETH
```bash
# Check balance at Sepolia scan
# https://sepolia.etherscan.io/ 
```

**Solution 3**: Update gas price
```env
GAS_PRICE=25000000000
GAS_LIMIT=4000000
```

### Issue: IPFS upload fails

**Solution 1**: Test IPFS connection
```bash
curl https://ipfs.infura.io:5001/api/v0/version
```

**Solution 2**: Verify credentials
```bash
# Re-check in .env
INFURA_IPFS_PROJECT_ID=...
INFURA_IPFS_PROJECT_SECRET=...
```

### Issue: Rate limiting blocks requests

**Solution**: Increase limit in .env
```env
RATE_LIMIT_MAX_REQUESTS=1000
```

## Running Tests

### Smart Contracts
```bash
cd contracts
npx hardhat test
```

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## Development Workflow

### 1. Make Code Changes
- Edit files as needed
- Frontend/Backend auto-reload

### 2. Test Locally
```bash
# In separate terminals:
# Terminal 1 - Backend
cd backend && npm start

# Terminal 2 - Frontend
cd frontend && npm start

# Terminal 3 - Optional: IPFS
ipfs daemon
```

### 3. Git Workflow
```bash
git add .
git commit -m "Your changes"
git push origin main
```

## Production Deployment

### Smart Contracts (Mainnet)
```bash
cd contracts
npx hardhat run scripts/deploy.js --network mainnet
```

### Backend (Production)
```bash
cd backend
NODE_ENV=production npm start
```

### Frontend (Production Build)
```bash
cd frontend
npm run build
npm install -g serve
serve -s build
```

### Deploy to IPFS
```bash
cd frontend
npm run build
ipfs add -r build
# Get hash and access at https://ipfs.io/ipfs/HASH
```

## Performance Optimization

### Backend
```javascript
// Enable compression
app.use(compression());

// Optimize database indexes
db.logs.createIndex({ userId: 1, createdAt: -1 });
```

### Frontend
```bash
# Build optimized bundle
npm run build
# Result: 100KB gzipped
```

## Security Checklist

- [ ] Private keys never committed
- [ ] .env file in .gitignore
- [ ] JWT_SECRET is strong and random
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] Database backups scheduled

## Monitoring Setup

### Logging
```bash
# Enable debug logs
DEBUG=* npm start
```

### Error Tracking (Optional)
```bash
# Install Sentry
npm install @sentry/node
```

### Blockchain Monitoring
- Use [Etherscan](https://sepolia.etherscan.io/)
- Monitor gas prices
- Track transaction status

## Next Steps

1. **Read Documentation**
   - [ARCHITECTURE.md](./ARCHITECTURE.md)
   - [API_ENDPOINTS.md](./API_ENDPOINTS.md)

2. **Test Features**
   - Create user account
   - Generate logs
   - Verify logs
   - Check billing

3. **Customize**
   - Modify branding
   - Adjust gas limits
   - Tweak rate limiting
   - Add custom endpoints

4. **Deploy**
   - Follow production setup
   - Set up monitoring
   - Configure backups
   - Enable analytics

## Support

For issues:
1. Check this guide first
2. Search GitHub issues
3. Read error messages carefully
4. Check component READMEs
5. Review logs with DEBUG enabled

## License

MIT
