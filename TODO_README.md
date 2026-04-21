# Working README - Architecture, Functionality, and Demo Guide

This document explains what the project does, why each framework/tool is used, how the major code modules work, and how to present the system clearly in a viva/demo.

## 1. Project Objective

Build a secure API usage logging system where each log can be:
1. hashed and signed for integrity and authenticity
2. stored off-chain in IPFS for content retrieval
3. anchored on blockchain for tamper-evident proof
4. viewed and verified from a web dashboard

## 2. Why These Tools/Frameworks Were Chosen

### Backend
1. Node.js + Express:
- simple REST API development
- easy middleware chain for auth, rate-limit, sanitization
- large ecosystem for blockchain/IPFS integrations

2. Mongoose + MongoDB:
- stores app-facing structured log records and billing
- supports indexes for filtered dashboard queries
- caches metadata even when external services are slow

3. Ethers.js:
- sends transactions and reads smart contract state on Sepolia
- clean interface for signer/provider/contract operations

4. Crypto + bcrypt + JWT:
- SHA-256 for log digest
- RSA signatures for authenticity proof
- bcrypt for password hashing
- JWT for stateless API auth

### Frontend
1. React:
- reusable page components (Dashboard, Logs, Billing, Verify)
- predictable state updates and API-driven UI

2. Axios:
- centralized API request logic and auth headers
- error handling for backend messages

### Web3 / Storage
1. Solidity + Hardhat:
- APILogger contract for immutable anchoring
- Hardhat for compile/deploy/test and Sepolia integration

2. Sepolia Testnet:
- real blockchain behavior without mainnet cost

3. IPFS (Pinata/Infura path):
- decentralized content storage and retrieval by CID

## 3. High-Level Data Flow

1. user creates log request from frontend
2. backend builds log payload and computes SHA-256 hash
3. backend signs hash with RSA private key
4. backend uploads payload to IPFS and gets CID
5. backend converts CID to deterministic on-chain key and calls smart contract
6. backend stores final record in MongoDB (with hash, CID, signature, tx hash)
7. frontend shows logs and verification status

## 4. Important Backend Code and Purpose

### 4.1 Log creation pipeline
File: backend/src/routes/log.routes.js

Purpose:
1. validates request payload
2. creates canonical log object
3. generates hash and signature
4. uploads to IPFS
5. anchors proof on blockchain
6. stores final record in MongoDB
7. updates monthly billing

### 4.2 Cryptographic service
File: backend/src/services/LoggingService.js

Purpose:
1. generate SHA-256 log hash
2. create RSA signature from hash
3. verify signature during validation
4. load key files used by signing pipeline

### 4.3 Blockchain service
File: backend/src/services/BlockchainService.js

Purpose:
1. initialize provider/signer/contract
2. convert app-level IPFS CID to on-chain bytes32 key (keccak256 over CID string)
3. ensure signer wallet is registered once on contract
4. store log proof and return transaction hash
5. fetch and verify on-chain logs

Note:
Contract stores bytes32 keys. The backend now deterministically maps CID string to bytes32 key for compatibility.

### 4.4 IPFS service
File: backend/src/services/IPFSService.js

Purpose:
1. support Pinata JWT/API key upload path
2. keep Infura-style path for compatibility
3. provide fallback behavior for test mode
4. retrieve/pin/file stats utilities

## 5. Solidity Contract Explanation

File: contracts/src/APILogger.sol

### 5.1 Core structs
1. APILog:
- on-chain log proof record (ipfsHash key, signature, timestamp, userId, endpoint, sizes, verified flag)

2. APIUser:
- registered address identity and aggregated usage stats

3. BillingRecord:
- on-chain billing history model (optional analytics use)

### 5.2 Key functions
1. registerUser(string userId):
- registers wallet identity for access control

2. storeLog(bytes32 ipfsKey, ...):
- writes immutable proof record
- emits LogCreated and BillingRecorded events

3. verifyLog(bytes32 key):
- marks an existing on-chain proof as verified

4. getLog/getUserLogs/getLogCount:
- read methods used for verification and dashboard stats

### 5.3 Security controls
1. onlyOwner modifier for admin operations
2. onlyRegisteredUser modifier before storing logs
3. require checks on empty user/endpoint/hash inputs

## 6. Data Models and Their Purpose

### 6.1 User model
File: backend/src/models/User.js

Purpose:
1. account identity and login credentials
2. password hashing and secure compare
3. optional wallet mapping and usage stats

### 6.2 Log model
File: backend/src/models/Log.js

Purpose:
1. primary app-side log record
2. stores logHash, ipfsHash, signature, blockchainHash
3. tracks verification state and metadata
4. indexed for fast filtering in dashboard

### 6.3 Billing model
File: backend/src/models/Billing.js

Purpose:
1. monthly request count and cost summary
2. payment status/amount tracking
3. history view for billing page

## 7. Verification Modes and What They Prove

1. App-level verify:
- confirms log exists in DB and signature check passes

2. IPFS verify:
- CID retrieval confirms decentralized content storage

3. Blockchain verify:
- transaction hash + on-chain lookup proves immutable anchoring

A log is fully verified only when all three are successful.

## 8. Environment Variables and Why They Exist

### Blockchain
1. ETHEREUM_RPC_URL: blockchain node endpoint
2. PRIVATE_KEY: signer wallet for transactions
3. CONTRACT_ADDRESS: deployed contract used by backend
4. REACT_APP_CONTRACT_ADDRESS: frontend contract reference

### IPFS
1. PINATA_JWT or PINATA_API_KEY/PINATA_API_SECRET: upload auth
2. INFURA_IPFS_PROJECT_ID/SECRET: legacy/alternative path

### App Security
1. JWT_SECRET: auth token signing
2. PRIVATE_KEY_PATH/PUBLIC_KEY_PATH: RSA signing keys for logs

## 9. End-to-End Demo Steps (Teacher-Friendly)

1. start MongoDB
2. start backend and frontend
3. register/login
4. create log
5. show generated logHash, ipfsHash, signature, blockchainHash
6. open Verify page and verify by logHash
7. open Sepolia explorer with blockchainHash transaction
8. explain each trust layer (DB + IPFS + chain)

## 10. Common Questions and Suggested Answers

1. Why blockchain if DB already exists?
- DB gives query speed; blockchain gives tamper-evident immutable proof.

2. Why IPFS?
- Stores full log content decentralized while chain keeps compact proof key.

3. Why signatures?
- Proves authenticity and prevents undetected modification.

4. Why Sepolia not mainnet?
- same technical workflow with lower cost for academic demo.

## 11. Current Completion Status Checklist

1. authentication flow working
2. log creation + hashing + signing working
3. IPFS upload configured via Pinata path
4. billing updates per log working
5. on-chain anchoring path implemented with CID-to-bytes32 mapping
6. verify route available for app and blockchain lookup

## 12. Post-Demo Security Actions

1. rotate wallet private key
2. rotate RPC keys
3. rotate Pinata/Infura credentials
4. never commit real .env secrets

End of document.