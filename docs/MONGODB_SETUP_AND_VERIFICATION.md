# MongoDB Local Setup & Project Verification Guide

## Overview
This guide covers complete setup for running the blockchain API logging system with **local MongoDB**, .env configuration, and step-by-step verification steps.

---

## Part 1: MongoDB Local Setup

### Option A: MongoDB Community Edition (Recommended for Development)

#### Windows Installation

1. **Download MongoDB Community Server**
   - Go to: https://www.mongodb.com/try/download/community
   - Select your OS (Windows) and Download

2. **Install MongoDB**
   - Run the installer (.msi file)
   - Choose "Complete" installation
   - ✅ Check "Install MongoDB as a Service"
   - ✅ Check "Run the MongoDB service as a Network Service"
   - Install MongoDB Compass (GUI tool) - recommended

3. **Verify Installation**
   ```bash
   mongod --version
   mongo --version
   ```

4. **Start MongoDB Service**
   ```bash
   # Windows (Service auto-starts)
   # Check if running: Services app > MongoDB > Status
   
   # Or start manually in PowerShell (Admin):
   net start MongoDB
   ```

5. **Connect to MongoDB**
   ```bash
   mongosh
   # or older versions:
   mongo
   ```

#### Mac Installation

```bash
# Using Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify connection
mongosh
```

#### Linux (Ubuntu/Debian) Installation

```bash
# Add MongoDB repository
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Install MongoDB
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify connection
mongosh
```

---

## Part 2: .env Configuration

Navigate to the root folder and locate the `.env` file. Replace the following values:

### Database Configuration (MongoDB Local)

```env
# Use LOCAL MongoDB (default setup)
MONGODB_URI=mongodb://localhost:27017/api-logging-db

# If you set MongoDB username/password during installation:
# MONGODB_URI=mongodb://username:password@localhost:27017/api-logging-db

# Local MongoDB doesn't require authentication by default:
MONGODB_USERNAME=
MONGODB_PASSWORD=

# Database name
DATABASE_NAME=api-logging-db
```

### Authentication & JWT

```env
# Generate a secure JWT Secret (use a strong random string)
JWT_SECRET=your_super_secret_jwt_key_change_this_to_random_string_min_32_chars
JWT_EXPIRATION=7d
```

**Generate a JWT Secret:**
```bash
# Windows (PowerShell):
[System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -Count 32 | % {[char]$_})))

# Linux/Mac:
openssl rand -base64 32
```

### Backend Server

```env
BACKEND_PORT=5000
NODE_ENV=development
LOG_LEVEL=debug
```

### Frontend Configuration

```env
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_NETWORK=sepolia
REACT_APP_CHAIN_ID=11155111
```

### Digital Signature Keys

```env
# For local testing (keys will be generated in contracts/keys/)
SIGNING_ALGORITHM=ES256
PRIVATE_KEY_PATH=./keys/private.key
PUBLIC_KEY_PATH=./keys/public.key
```

### Ethereum/Blockchain Configuration (Sepolia Testnet)

```env
# Sepolia RPC URL - Get from:
# 1. Alchemy (https://alchemy.com) - Free tier
# 2. Infura (https://infura.io) - Free tier
# 3. QuickNode (https://quicknode.com) - Free tier
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Your MetaMask Private Key (DO NOT COMMIT THIS TO GIT!)
# Get from MetaMask > Account Details > Export Private Key
PRIVATE_KEY=your_metamask_private_key_here

# Will be updated after contract deployment
CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000
REACT_APP_CONTRACT_ADDRESS=0x0000000000000000000000000000000000000000

NETWORK=sepolia
CHAIN_ID=11155111
ETHERSCAN_API_KEY=your_etherscan_api_key_for_verification
```

### IPFS Configuration (Optional)

```env
# Using Infura IPFS (https://infura.io)
IPFS_HOST=ipfs.infura.io
IPFS_PORT=5001
IPFS_PROTOCOL=https
INFURA_IPFS_PROJECT_ID=your_infura_project_id
INFURA_IPFS_PROJECT_SECRET=your_infura_project_secret

# Or use local IPFS node:
# IPFS_HOST=localhost
# IPFS_PORT=5001
# IPFS_PROTOCOL=http
```

### Rate Limiting & Features

```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
ENABLE_MONGODB_CACHING=true
ENABLE_EMAIL_NOTIFICATIONS=false
ENABLE_RATE_LIMITING=true
ENABLE_DIGITAL_SIGNATURE=true
```

### Optional: Email Configuration (for notifications)

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password  # Use Gmail App Password, not actual password
ENABLE_EMAIL_NOTIFICATIONS=false  # Keep false if not using
```

---

## Part 3: Initial Project Setup

### Step 1: Install Dependencies

```bash
# From root directory
cd blockchain-api-logging

# Backend
cd backend
npm install
cd ..

# Frontend
cd frontend
npm install
cd ..

# Contracts (already done if you fixed the dependency)
cd contracts
npm install --legacy-peer-deps
cd ..
```

### Step 2: Generate RSA Keys for Signatures

```bash
cd contracts

# Create keys directory
mkdir keys

# Generate RSA keys
openssl genrsa -out keys/private.key 2048
openssl rsa -in keys/private.key -pubout -out keys/public.key

# Verify keys were created
ls -la keys/
```

### Step 3: Deploy Smart Contract (Sepolia Testnet)

```bash
# From contracts directory
cd contracts

# Compile contracts
npx hardhat compile

# Deploy to Sepolia
# NOTE: Make sure you have Sepolia ETH in your MetaMask wallet
npx hardhat run scripts/deploy.js --network sepolia

# Copy the deployed contract address and update .env
# REPLACE THE 0x0000... WITH ACTUAL ADDRESS FROM DEPLOYMENT OUTPUT
```

### Step 4: Copy Keys to Backend

```bash
# From project root
cp contracts/keys backend/keys -r

# Or manually copy the keys/private.key and keys/public.key files
```

---

## Part 4: Step-by-Step Verification

### ✅ Step 1: Verify MongoDB Local Connection

```bash
# Open a terminal and start MongoDB
mongosh

# In MongoDB shell, run:
show dbs
use api-logging-db
db.users.insertOne({ name: "test", email: "test@example.com" })
db.users.find()

# Should show your inserted document
```

Or using MongoDB Compass GUI:
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Should see connection successful
4. Navigate to `api-logging-db` database

### ✅ Step 2: Verify Backend Server Starts

```bash
cd backend
npm start

# Expected output:
# ✅ MongoDB connected
# ✅ Server running on http://localhost:5000
# ✅ Environment loaded from .env
```

**Common Issues & Fixes:**
| Error | Fix |
|-------|-----|
| `MongoServerError: connect ECONNREFUSED` | MongoDB not running. Run `mongosh` or start the service |
| `dotenv config error` | .env file missing or not in correct location |
| `Cannot find module 'mongoose'` | Run `npm install` in backend folder |

### ✅ Step 3: Verify Backend API Health Check

```bash
# In another terminal:
curl http://localhost:5000/health

# Or open browser:
http://localhost:5000/health

# Expected response (if endpoint exists):
# { "status": "OK" }
```

### ✅ Step 4: Test Authentication Routes

```bash
# Register a new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!",
    "name": "Test User"
  }'

# Expected response:
# { "message": "User registered successfully", "userId": "..." }
```

### ✅ Step 5: Verify Frontend Server Starts

```bash
cd frontend
npm start

# Frontend should open at http://localhost:3000
# You should see login page without errors in console
```

### ✅ Step 6: Test Full Authentication Flow

1. **Open Frontend**: http://localhost:3000
2. **Register**: Click Register, fill in email/password
3. **Check MongoDB**: 
   ```bash
   mongosh
   db.users.find()
   ```
   Should see registered user
4. **Login**: Use your credentials
5. **Verify JWT Token**: Check browser DevTools > Application > Cookies/LocalStorage for auth token

### ✅ Step 7: Database Verification

```bash
# Connect to MongoDB
mongosh

# Check collections created
use api-logging-db
show collections

# Should show:
# - users (from registration)
# - logs (for API logging)
# - billing (for billing data)
```

---

## Part 5: Running the Project Next Time

### Quick Start (All Services)

```bash
# Terminal 1: Start MongoDB (if not running as service)
mongosh
# OR if running as service, just verify with: mongosh

# Terminal 2: Start Backend
cd blockchain-api-logging/backend
npm start

# Terminal 3: Start Frontend
cd blockchain-api-logging/frontend
npm start

# Frontend automatically opens at http://localhost:3000
```

### Using npm concurrently (Single Terminal)

```bash
# From root directory, install concurrently
npm install -g concurrently

# Create startup script in root:
# OR run manually:
concurrently "cd backend && npm start" "cd frontend && npm start"
```

### Using Docker (Optional)

```bash
# From root directory
docker-compose up

# All services start automatically
# Backend: http://localhost:5000
# Frontend: http://localhost:3000
# MongoDB: localhost:27017 (internal network)
```

---

## Part 6: Important Environment Variables Summary

### Must Replace Before Running

| Variable | Value | Where to Get |
|----------|-------|--------------|
| `MONGODB_URI` | `mongodb://localhost:27017/api-logging-db` | Local MongoDB connection |
| `JWT_SECRET` | Random 32+ character string | Generate with OpenSSL |
| `ETHEREUM_RPC_URL` | Alchemy/Infura/QuickNode URL | https://alchemy.com (free) |
| `PRIVATE_KEY` | MetaMask private key | MetaMask > Account Details |
| `CONTRACT_ADDRESS` | Deploy output address | After running hardhat deploy |
| `REACT_APP_BACKEND_URL` | `http://localhost:5000` | Local backend URL |

### Optional (Can Leave Default)

- `EMAIL_SERVICE` - Only if using email notifications
- `INFURA_IPFS_*` - Only if using IPFS
- `ENABLE_EMAIL_NOTIFICATIONS` - Default: false

---

## Part 7: Database Backup & Reset

### Export MongoDB Database

```bash
# Export all data
mongodump --uri mongodb://localhost:27017/api-logging-db --out ./backup

# Restore from backup
mongorestore --uri mongodb://localhost:27017/api-logging-db ./backup/api-logging-db
```

### Reset Database (Delete All Data)

```bash
# WARNING: This deletes all data!
mongosh
use api-logging-db
db.dropDatabase()
```

---

## Part 8: Troubleshooting

### MongoDB Not Starting

```bash
# Windows - Check if service is running
Get-Service MongoDB

# Start service
Start-Service MongoDB

# Or start mongod directly
mongod
```

### "Cannot connect to MongoDB"

```bash
# Verify MongoDB is running
mongosh
# If connection refused, try:
mongod --dbpath "C:\data\db"  # Windows
mongod --dbpath /data/db      # Mac/Linux
```

### Port Already in Use

```bash
# Backend port 5000 in use
# Kill process or change port in .env:
BACKEND_PORT=5001
```

### Keys Not Found Error

```bash
# Make sure keys directory exists
ls contracts/keys/
# If missing, regenerate:
openssl genrsa -out contracts/keys/private.key 2048
openssl rsa -in contracts/keys/private.key -pubout -out contracts/keys/public.key
```

---

## Part 9: Security Checklist

Before deploying to production:

- [ ] Change `JWT_SECRET` to a secure random value
- [ ] Set `NODE_ENV=production`
- [ ] Enable `ENABLE_RATE_LIMITING=true`
- [ ] Use MongoDB Atlas (not local) with authentication
- [ ] Set up HTTPS/SSL certificates
- [ ] Enable `ENABLE_DIGITAL_SIGNATURE=true`
- [ ] Never commit `.env` file with real keys to Git
- [ ] Use environment variables from CI/CD platform
- [ ] Enable CORS restrictions to specific domains
- [ ] Set up database backups and monitoring

---

## Part 10: Development Workflow

### Daily Startup

```bash
# 1. Start MongoDB (if not running as service)
mongosh

# 2. Open project in VS Code
code .

# 3. Terminal 1: Backend
cd backend && npm start

# 4. Terminal 2: Frontend  
cd frontend && npm start

# 5. Browser automatically opens http://localhost:3000
```

### Development Tools

```bash
# MongoDB GUI
# Open MongoDB Compass (installed with MongoDB)

# API Testing
# Use Postman: https://postman.com
# Or install: npm install -g insomnia

# Smart Contract Testing
cd contracts
npm run test

# Check Gas Usage
npm run gas-report
```

---

## Quick Reference

| Task | Command | Location |
|------|---------|----------|
| Start MongoDB | `mongosh` | Terminal |
| Start Backend | `npm start` | `blockchain-api-logging/backend` |
| Start Frontend | `npm start` | `blockchain-api-logging/frontend` |
| Compile Contracts | `npx hardhat compile` | `blockchain-api-logging/contracts` |
| Deploy Contracts | `npx hardhat run scripts/deploy.js --network sepolia` | `blockchain-api-logging/contracts` |
| View Database | Open MongoDB Compass | GUI App |
| Test Backend API | Postman / curl | Any Terminal |

---

## Need Help?

- **MongoDB Issues**: https://docs.mongodb.com/manual/
- **Node.js Help**: https://nodejs.org/docs/
- **Hardhat Docs**: https://hardhat.org/docs
- **Solidity Docs**: https://docs.soliditylang.org/
- **React Docs**: https://react.dev

---

**Last Updated**: April 2026  
**Version**: 1.0
