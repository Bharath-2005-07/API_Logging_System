# Secure and Immutable API Usage Logging System

## 📋 Overview

A decentralized API logging system leveraging **Blockchain** and **IPFS** to ensure immutability, transparency, and trustless verification of API usage logs. This system eliminates centralized trust issues by recording API usage on an immutable blockchain and storing logs on IPFS.

```
Client → Backend → Log Creation → Digital Signature → IPFS Storage → Blockchain Hash Storage → Dashboard Verification
```

## 🎯 Key Features

✅ **Immutable Logs** - Tamper-proof API usage records  
✅ **Digital Signatures** - Ensure authenticity of logs  
✅ **Decentralized Storage** - IPFS for distributed log storage  
✅ **Blockchain Integration** - Smart contracts for log hashes  
✅ **Billing System** - Track API usage and costs  
✅ **Rate Limiting** - Prevent abuse  
✅ **Dashboard Analytics** - Real-time visualization and verification  
✅ **Trustless Verification** - Independent third-party verification  

## 🏗️ Architecture

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
┌──────▼──────────────────────────────┐
│         Backend (Node.js)            │
│  - API Endpoint Handler              │
│  - Log Generation                    │
│  - Digital Signature Creation        │
│  - Rate Limiting & Auth              │
└──────┬──────────────────────────────┘
       │
┌──────▼──────────────────────────────┐
│      Log Processing Service          │
│  - Hash Log Content                  │
│  - Create Digital Signature          │
│  - Prepare for Storage               │
└──────┬──────────────────────────────┘
       │
┌──────▼──────────────────────────────┐
│   IPFS (Decentralized Storage)       │
│  - Store Log Files                   │
│  - Return IPFS Hash                  │
└──────┬──────────────────────────────┘
       │
┌──────▼──────────────────────────────┐
│    Blockchain (Smart Contract)       │
│  - Store IPFS Hash                   │
│  - Store Timestamp                   │
│  - Store Digital Signature           │
└──────┬──────────────────────────────┘
       │
┌──────▼──────────────────────────────┐
│   Dashboard (React Frontend)         │
│  - View Logs                         │
│  - Verify Authenticity               │
│  - Analytics & Billing               │
│  - Rate Limiting Overview            │
└──────────────────────────────────────┘
```

## 📁 Project Structure

```
blockchain-api-logging/
├── contracts/                 # Solidity Smart Contracts
│   ├── src/
│   │   └── APILogger.sol
│   ├── hardhat.config.js
│   └── README.md
├── backend/                   # Node.js Backend
│   ├── src/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── server.js
│   ├── package.json
│   └── README.md
├── frontend/                  # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   └── App.js
│   ├── package.json
│   └── README.md
├── config/                    # Configuration Files
│   ├── blockchain.config.js
│   ├── ipfs.config.js
│   ├── database.config.js
│   └── README.md
├── docs/                      # Documentation
│   ├── ARCHITECTURE.md
│   ├── API_ENDPOINTS.md
│   ├── SMART_CONTRACT.md
│   └── SETUP_GUIDE.md
├── .env.example               # Environment Variables Template
├── docker-compose.yml         # Docker Setup
└── README.md                  # This File
```

## 🚀 Quick Start

### Prerequisites

- Node.js v16+ and npm
- Hardhat (for smart contracts)
- IPFS node (local or Infura)
- Ethereum testnet (Sepolia/Goerli)
- MongoDB (optional, for caching)
- Git

### 1. Clone & Setup

```bash
cd blockchain-api-logging

# Copy environment variables
cp .env.example .env
# Edit .env with your credentials
```

### 2. Deploy Smart Contracts

```bash
cd contracts
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
# Copy contract address to .env
```

### 3. Start Backend

```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```

### 4. Start Frontend

```bash
cd frontend
npm install
npm start
# App opens on http://localhost:3000
```

## 🔧 Configuration

Edit `.env` file with:

```env
# Blockchain
ETHEREUM_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=your_private_key
CONTRACT_ADDRESS=0x...
NETWORK=sepolia

# IPFS
IPFS_HOST=your-infura-ipfs.infura.ipfs.io
IPFS_PORT=5001
IPFS_PROTOCOL=https

# Backend
BACKEND_PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key

# MongoDB (Optional)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db

# Frontend
REACT_APP_BACKEND_URL=http://localhost:5000
REACT_APP_CONTRACT_ADDRESS=0x...
```

## 📡 Workflow

### 1. API Call Logging
```
Client makes API request → Backend receives request
```

### 2. Log Generation
```
Backend generates log with:
- User ID
- Endpoint
- Timestamp
- Response Status
- Request/Response Size
```

### 3. Digital Signature
```
Private key signs the log → Ensures authenticity
Timestamp added → Prevents timestamp manipulation
```

### 4. IPFS Storage
```
Log uploaded to IPFS → Returns IPFS hash
IPFS hash is immutable → Points to exact log version
```

### 5. Blockchain Recording
```
IPFS hash + signature stored in smart contract
Transaction hash recorded → Proof of blockchain inclusion
```

### 6. Verification
```
Dashboard retrieves IPFS hash from blockchain
Downloads log from IPFS
Verifies digital signature
Confirms authenticity
```

## 💻 Key Commands

### Smart Contracts
```bash
cd contracts
npx hardhat compile          # Compile contracts
npx hardhat test            # Run tests
npx hardhat deploy          # Deploy to testnet
npx hardhat verify          # Verify on Etherscan
```

### Backend
```bash
cd backend
npm install                 # Install dependencies
npm start                   # Start development server
npm run dev                # Start with nodemon
npm test                    # Run tests
npm run lint               # Run ESLint
```

### Frontend
```bash
cd frontend
npm install                # Install dependencies
npm start                  # Start development server
npm run build              # Build for production
npm test                   # Run tests
npm run deploy             # Deploy to IPFS
```

### Full Stack
```bash
# Start all services (requires separate terminals or pm2)
npm run start:all         # Not available yet - use individual commands

# Or use Docker
docker-compose up -d      # Start all services with Docker
docker-compose down       # Stop all services
```

## 🔐 Security Features

- **Digital Signatures** - RSA or ECDSA signing
- **Rate Limiting** - Prevent DDoS attacks
- **Authentication** - JWT token validation
- **Immutability** - Blockchain + IPFS combination
- **Encryption** - TLS/SSL for transport security
- **Input Validation** - Sanitization of all inputs

## 📊 Technologies Used

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Smart Contracts | Solidity | Immutable log recording |
| Backend | Node.js + Express | API handling & log generation |
| Frontend | React + Web3.js | Dashboard & verification |
| Storage | IPFS | Decentralized log storage |
| Database | Blockchain | Primary log hash storage |
| Caching | MongoDB | Optional log caching |
| Blockchain | Ethereum | Immutable proof |

## 📚 Documentation

See detailed documentation in `/docs`:
- [Architecture Overview](docs/ARCHITECTURE.md)
- [API Endpoints](docs/API_ENDPOINTS.md)
- [Smart Contracts](docs/SMART_CONTRACT.md)
- [Setup Guide](docs/SETUP_GUIDE.md)

## 🧪 Testing

### Unit Tests
```bash
cd contracts && npm test      # Smart contract tests
cd ../backend && npm test     # Backend tests
cd ../frontend && npm test    # Frontend tests
```

### Integration Tests
```bash
npm run test:integration      # Full stack integration tests
```

## 📈 Scalability & Performance

- **IPFS** handles distributed storage across nodes
- **Blockchain** records only IPFS hashes (small size)
- **MongoDB** caching reduces blockchain queries
- **Rate limiting** prevents overload
- **Batching** reduces transaction costs

## 🛠️ Troubleshooting

| Issue | Solution |
|-------|----------|
| Contract deployment fails | Check Ethereum RPC URL and private key |
| IPFS connection error | Verify IPFS node is running or Infura credentials |
| Log verification fails | Ensure signature matches log hash |
| Frontend can't connect | Check backend URL in .env |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/YourFeature`)
3. Commit changes (`git commit -m 'Add YourFeature'`)
4. Push to branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## 📝 License

MIT License - See LICENSE file

## 📞 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Read the documentation in `/docs`
- Check existing solutions in TROUBLESHOOTING

## 🎓 Learning Resources

- [Solidity Documentation](https://docs.soliditylang.org/)
- [Hardhat Guide](https://hardhat.org/getting-started/)
- [Web3.js Documentation](https://web3js.readthedocs.io/)
- [IPFS Documentation](https://docs.ipfs.io/)
- [React Documentation](https://react.dev/)
- [Express.js Guide](https://expressjs.com/)

## 🔗 Useful Links

- [Ethereum Sepolia Testnet](https://sepolia.etherscan.io/)
- [Infura IPFS](https://infura.io/product/ipfs)
- [MetaMask Wallet](https://metamask.io/)
- [Hardhat Documentation](https://hardhat.org/)

---

**Version**: 1.0.0  
**Last Updated**: April 5, 2026  
**Status**: Production Ready
