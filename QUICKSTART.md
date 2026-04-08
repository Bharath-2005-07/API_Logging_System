# Quick Start Commands

## ⚡ Fastest Way to Get Running

**See complete guide with demo commands**: [STARTUP_AND_DEMO_GUIDE.md](./STARTUP_AND_DEMO_GUIDE.md)

## One-Command Setup (Linux/Mac)

```bash
bash setup.sh
```

## Windows: Step-by-Step Setup

### 1️⃣ Smart Contracts Setup
```bash
cd contracts
npm install
npx hardhat compile

# Generate keys for signatures
mkdir keys
openssl genrsa -out keys/private.key 2048
openssl rsa -in keys/private.key -pubout -out keys/public.key

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia
# Copy the contract address to .env
cd ..
```

### 2️⃣ Backend Setup
```bash
cd backend
npm install

# Copy keys
cp -r ../contracts/keys ./

# Update .env with:
# - ETHEREUM_RPC_URL
# - CONTRACT_ADDRESS
# - JWT_SECRET
# - MONGODB_URI
# - IPFS credentials

npm start
# Server: http://localhost:5000
cd ..
```

### 3️⃣ Frontend Setup
```bash
cd frontend
npm install

# Create .env
echo "REACT_APP_BACKEND_URL=http://localhost:5000" > .env
echo "REACT_APP_NETWORK=sepolia" >> .env

npm start
# App: http://localhost:3000
```

## Docker Setup

```bash
# Build and run all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down
```

## Running the Full Stack

### Terminal 1 - Backend
```bash
cd backend
npm start
```

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

### Terminal 3 - Optional: IPFS
```bash
ipfs daemon
```

## Helpful Commands

### Test API
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

# Get token from response and use:
export TOKEN="your_token_here"

# Create log
curl -X POST http://localhost:5000/api/logs/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/api/test",
    "method": "GET",
    "statusCode": 200,
    "requestSize": 100,
    "responseSize": 200,
    "responseTime": 50
  }'

# Get logs
curl http://localhost:5000/api/logs \
  -H "Authorization: Bearer $TOKEN"
```

### Deploy Smart Contract
```bash
cd contracts

# Sepolia Testnet
npx hardhat run scripts/deploy.js --network sepolia

# Mainnet (⚠️ use real money!)
npx hardhat run scripts/deploy.js --network mainnet

# Verify on Etherscan
npx hardhat verify --network sepolia ADDRESS_HERE
```

### Database Management
```bash
# Backup MongoDB
mongodump --uri="mongodb://localhost:27017" --out=./backup

# Restore MongoDB
mongorestore --uri="mongodb://localhost:27017" ./backup
```

### Build for Production
```bash
# Frontend
cd frontend
npm run build
# Output: build/ folder

# Backend (no special build needed, just NODE_ENV=production)
cd backend
NODE_ENV=production npm start

# Deploy frontend to IPFS
cd frontend
npm run build
ipfs add -r build
```

## Verification Checklist

- [ ] MongoDB running and connected
- [ ] Smart contract deployed (address in .env)
- [ ] IPFS credentials configured
- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:3000
- [ ] Can register a new user
- [ ] Can login with credentials
- [ ] Can create a log
- [ ] Can view logs in dashboard
- [ ] Can verify log authenticity

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000    # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 PID     # Mac/Linux
taskkill /PID PID /F  # Windows
```

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongosh

# If not installed, install MongoDB Community
# macOS: brew install mongodb-community
# Ubuntu: sudo apt-get install -y mongodb-org
```

### Smart Contract Deployment Failed
```bash
# Check RPC URL
curl https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# Check wallet has ETH
# Get from: https://sepoliafaucet.com/

# Check gas price
# https://sepolia.etherscan.io/gas
```

### IPFS Issues
```bash
# Test Infura IPFS
curl https://ipfs.infura.io:5001/api/v0/version

# Use local IPFS
ipfs daemon

# Or use Pinata
# Sign up at: https://pinata.cloud/
```

## Environment Variables Needed

```env
# Blockchain
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_wallet_private_key
CONTRACT_ADDRESS=0x...deployed_address

# IPFS (Infura)
INFURA_IPFS_PROJECT_ID=your_id
INFURA_IPFS_PROJECT_SECRET=your_secret

# Database
MONGODB_URI=mongodb://localhost:27017/api-logging-db
# Or Atlas: mongodb+srv://user:pass@cluster.mongodb.net/db

# Backend
JWT_SECRET=your_very_secret_key
BACKEND_PORT=5000

# Frontend
REACT_APP_BACKEND_URL=http://localhost:5000
```

## Performance Tips

1. **Database Indexing**: Automatically created on startup
2. **Caching**: MongoDB caches logs for faster retrieval  
3. **Compression**: HTTP compression enabled for responses
4. **Rate Limiting**: Enabled to prevent abuse
5. **IPFS Pinning**: Files pinned for persistence

## Getting Help

1. **Read Documentation**: Check `docs/` folder
2. **Check Component READMEs**: backend/, frontend/, contracts/
3. **Enable Debug Logging**: `DEBUG=* npm start`
4. **Review Error Messages**: Check console/logs
5. **GitHub Issues**: Open an issue with details

## Next Steps After Setup

1. ✅ Complete setup above
2. 📚 Read [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
3. 🔍 Review [API_ENDPOINTS.md](./docs/API_ENDPOINTS.md)
4. 🧪 Test with cURL examples
5. 🚀 Deploy to production
6. 📊 Set up monitoring

Good luck! 🚀
