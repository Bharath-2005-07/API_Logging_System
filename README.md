# Secure and Immutable API Usage Logging System

## Overview

This project captures API activity and secures each record through:
1. SHA-256 log hashing
2. RSA signature generation
3. IPFS storage of payload data
4. On-chain anchoring on Ethereum Sepolia

Current flow:

Client → Backend → Hash + Signature → IPFS CID → Smart Contract → MongoDB cache → Frontend verification

## Implemented Features (Current)

- JWT auth (register/login)
- Logs create/list/filter/verify
- Log hash display in UI
- Previous hash display in UI
- Sepolia tx hash display + direct "View on Sepolia" explorer link
- Blockchain service with CID → bytes32 deterministic conversion
- Billing with method pricing:
  - $2 per request base
  - +$5 for POST requests
- Billing history and payment processing
- Verify page for log hash based verification

## Current Project Structure

```text
blockchain-api-logging/
├── backend/
├── frontend/
├── contracts/
├── config/
├── docs/
└── README.md
```

## Quick Start

### Prerequisites

- Node.js 16+
- npm 8+
- MongoDB running locally
- Sepolia RPC key + funded wallet

### 1) Environment setup

Create/update root .env with at least:

```env
ETHEREUM_RPC_URL=https://...
PRIVATE_KEY=0x...
CONTRACT_ADDRESS=0x...
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_BACKEND_URL=http://localhost:5000
MONGODB_URI=mongodb://localhost:27017/api-logging-db
JWT_SECRET=change_this
```

### 2) Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../contracts && npm install
```

### 3) Start services

```bash
# terminal 1
cd backend
npm start

# terminal 2
cd frontend
npm start
```

## Verification Steps (Current)

1. Login and create a new log from Logs page.
2. Confirm row shows:
   - Log Hash
   - Previous Hash (Genesis for first log)
   - On-chain Tx
3. Click "View on Sepolia" and verify tx status is Success.
4. Copy Log Hash and verify from Verify page.

## Troubleshooting

- `No tx hash` in UI:
  - Ensure backend wallet has Sepolia ETH
  - Ensure CONTRACT_ADDRESS is correct and deployed
  - Ensure signer is registered in contract
- `EADDRINUSE: 5000`:
  - Kill process using port 5000 and restart backend
- Verify page says hash invalid:
  - Use Log Hash (SHA-256), not transaction hash

## Security Note

Do not commit real secrets in `.env`.
If secrets were exposed, rotate them immediately:
- wallet private key
- RPC key
- IPFS credentials
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
