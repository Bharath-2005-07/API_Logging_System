#!/bin/bash

# Secure and Immutable API Usage Logging System
# Setup Script for Linux/Mac

set -e

echo "🚀 Starting API Logging System Setup..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${YELLOW}✓ Checking prerequisites...${NC}"

if ! command -v node &> /dev/null; then
  echo -e "${RED}✗ Node.js not found. Please install Node.js v16+${NC}"
  exit 1
fi

if ! command -v npm &> /dev/null; then
  echo -e "${RED}✗ npm not found. Please install npm${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Node.js and npm found${NC}"

# Setup environment
echo -e "${YELLOW}Setting up environment...${NC}"
if [ ! -f .env ]; then
  cp .env.example .env
  echo -e "${GREEN}✓ Created .env file (EDIT with your credentials!)${NC}"
else
  echo -e "${YELLOW}! .env already exists${NC}"
fi

# Setup Smart Contracts
echo -e "${YELLOW}Setting up Smart Contracts...${NC}"
cd contracts
npm install
echo -e "${GREEN}✓ Smart Contracts dependencies installed${NC}"

# Compile contracts
npx hardhat compile
echo -e "${GREEN}✓ Smart Contracts compiled${NC}"

# Create keys directory
mkdir -p keys
if [ ! -f keys/private.key ]; then
  echo -e "${YELLOW}Generating RSA keys...${NC}"
  openssl genrsa -out keys/private.key 2048 2>/dev/null
  openssl rsa -in keys/private.key -pubout -out keys/public.key 2>/dev/null
  echo -e "${GREEN}✓ RSA keys generated${NC}"
else
  echo -e "${YELLOW}! RSA keys already exist${NC}"
fi

cd ..

# Setup Backend
echo -e "${YELLOW}Setting up Backend...${NC}"
cd backend
npm install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# Copy keys
cp -r ../contracts/keys ./ 2>/dev/null || true

cd ..

# Setup Frontend
echo -e "${YELLOW}Setting up Frontend...${NC}"
cd frontend
npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# Update .env file path
if [ ! -f .env ]; then
  echo "REACT_APP_BACKEND_URL=http://localhost:5000" > .env
  echo "REACT_APP_NETWORK=sepolia" >> .env
  echo -e "${GREEN}✓ Frontend .env created${NC}"
fi

cd ..

# Summary
echo ""
echo -e "${GREEN}═════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✓ Setup Complete!${NC}"
echo -e "${GREEN}═════════════════════════════════════════════════${NC}"
echo ""
echo "Next steps:"
echo ""
echo "1. Edit .env file with your credentials:"
echo "   - ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY"
echo "   - PRIVATE_KEY=your_wallet_private_key"
echo "   - INFURA_IPFS_PROJECT_ID=your_id"
echo "   - INFURA_IPFS_PROJECT_SECRET=your_secret"
echo ""
echo "2. Deploy Smart Contracts:"
echo "   cd contracts && npx hardhat run scripts/deploy.js --network sepolia"
echo ""
echo "3. Start Backend (Terminal 1):"
echo "   cd backend && npm start"
echo ""
echo "4. Start Frontend (Terminal 2):"
echo "   cd frontend && npm start"
echo ""
echo "5. Open http://localhost:3000 in browser"
echo ""
echo "📚 Documentation: https://github.com/yourusername/blockchain-api-logging"
echo "⚠️  IMPORTANT: Get Sepolia ETH from https://sepoliafaucet.com/"
echo ""
