# Secure And Immutable API Usage Logging System - Detailed Flow, Solidity Notes, Team Split, and Demo Runbook

## 1. Project Summary

This project is a full-stack logging platform that captures API usage events and secures them through multiple trust layers:

1. Application layer integrity: SHA-256 hash + RSA signature
2. Storage layer integrity: IPFS content addressing (CID)
3. Audit layer integrity: on-chain anchoring in Ethereum Sepolia

The system is designed so API consumers and providers can verify that a log was created and not tampered with.

## 2. High-Level Architecture

### 2.1 Main Components

1. Frontend (React):
- User login and registration
- Create/view/verify logs
- Billing display

2. Backend (Node.js + Express):
- Auth, validation, business logic
- Hash/signature generation
- IPFS upload and retrieval
- Blockchain contract interaction
- MongoDB persistence and billing updates

3. Smart Contract (Solidity on Sepolia):
- Immutable proof storage
- User registration and stats
- Log verification state

4. MongoDB:
- Application-side log records
- User records
- Billing records

5. IPFS (Pinata/Infura path):
- Off-chain log payload storage
- CID-based retrieval

### 2.2 End-to-End Flow

1. User logs in and creates a log in UI
2. Backend builds canonical payload
3. Backend generates log hash (SHA-256)
4. Backend signs hash using RSA private key
5. Backend uploads payload to IPFS and receives CID
6. Backend anchors proof on smart contract
7. Backend saves full metadata in MongoDB
8. UI displays log status and verification indicators

## 3. Important Solidity Code and Purpose

File: contracts/src/APILogger.sol

Below are the key contract sections and why they matter.

### 3.1 APILog Struct

Purpose:
- Defines immutable proof fields stored on-chain
- Captures who logged it, when, and request metadata

Key fields:
- ipfsHash (bytes32 key on chain)
- signature (bytes)
- timestamp (block timestamp)
- userId, endpoint, statusCode, requestSize, responseSize
- verified flag

Why important:
- It is the source of truth for blockchain-level log proof.

### 3.2 registerUser

Purpose:
- Registers a blockchain identity before allowing log writes

Why important:
- Enforces access control via onlyRegisteredUser
- Prevents arbitrary non-registered writes

### 3.3 storeLog

Purpose:
- Writes log proof to blockchain
- Emits events for audit trail

What it does:
1. Validates inputs
2. Stores APILog in mapping
3. Updates per-user and global counters
4. Emits LogCreated and BillingRecorded

Why important:
- This is the core immutable anchoring operation.

### 3.4 verifyLog

Purpose:
- Marks a log as verified on-chain

Why important:
- Supports explicit verification state for audits.

### 3.5 Read Functions: getLog, getUserLogs, getLogCount, getUserStats

Purpose:
- On-chain query methods for proof retrieval and dashboard stats

Why important:
- Enables transparent validation by backend/UI.

## 4. Backend Critical Modules and Their Purpose

### 4.1 Log Route

File: backend/src/routes/log.routes.js

Purpose:
- Orchestrates end-to-end create-log flow

Core responsibilities:
1. Build log payload
2. Generate hash and signature
3. Upload to IPFS
4. Store proof on blockchain
5. Persist in MongoDB
6. Update billing

### 4.2 Logging Service

File: backend/src/services/LoggingService.js

Purpose:
- Cryptographic operations

Functions:
1. generateLogHash
2. createSignature
3. verifySignature
4. key loading helpers

### 4.3 Blockchain Service

File: backend/src/services/BlockchainService.js

Purpose:
- Contract interaction wrapper

Important behavior:
1. Initializes provider/signer/contract
2. Converts IPFS CID strings to deterministic on-chain bytes32 key
3. Ensures signer address is registered on-chain
4. Stores and reads log proofs

### 4.4 IPFS Service

File: backend/src/services/IPFSService.js

Purpose:
- Upload and retrieval from IPFS

Current support:
1. Pinata JWT/API auth path
2. Legacy Infura path
3. Controlled fallback behavior for testing

## 5. Data Models and Their Purpose

### 5.1 User Model

File: backend/src/models/User.js

Purpose:
- Authentication identity and profile
- Password hashing and secure compare

### 5.2 Log Model

File: backend/src/models/Log.js

Purpose:
- Application-side record of each log
- Includes logHash, ipfsHash, signature, blockchainHash, verified state

### 5.3 Billing Model

File: backend/src/models/Billing.js

Purpose:
- Monthly usage and cost tracking
- Payment status and historical billing

## 6. Equal 3-Member Implementation Split

Use this split in report/viva to show balanced contribution.

### Member 1: Smart Contract + Blockchain Integration

Scope:
1. APILogger.sol implementation and updates
2. Hardhat compile/deploy configuration
3. Blockchain service integration in backend
4. Sepolia deployment and contract address management

Deliverables:
1. Solidity contract source
2. Deployment flow and contract ABI
3. On-chain proof write/read support

### Member 2: Backend Security + API + Data Layer

Scope:
1. Auth routes and JWT middleware
2. Log route orchestration
3. LoggingService cryptography (hash/sign/verify)
4. MongoDB models and billing logic
5. Error handling and input validation

Deliverables:
1. Stable REST APIs
2. Cryptographic log generation pipeline
3. Billing and data persistence

### Member 3: Frontend + Verification UX + Demo Orchestration

Scope:
1. React pages and navigation
2. API integration in UI
3. Log creation and verification workflow UX
4. Status displays for IPFS/blockchain/verification
5. End-to-end demo scripts and validation checklist

Deliverables:
1. User-facing dashboard and pages
2. Verify flow UI
3. Demo-ready presentation path

## 7. Next Steps To Create Logs and Verify

### 7.1 Prerequisites

1. MongoDB running locally
2. Backend started on port 5000
3. Frontend started on port 3000
4. .env has valid values for:
- ETHEREUM_RPC_URL
- PRIVATE_KEY
- CONTRACT_ADDRESS
- REACT_APP_CONTRACT_ADDRESS
- IPFS credentials (Pinata/Infura path)
- JWT_SECRET

### 7.2 Create a Log (UI)

1. Open http://localhost:3000
2. Login
3. Go to Logs page
4. Enter endpoint/method/status/size/time fields
5. Click Create Log

Expected result:
1. New row appears in logs table
2. Log record includes log hash and signature
3. IPFS hash is real CID (not test placeholder)
4. Blockchain hash appears when on-chain write succeeds

### 7.3 Verify Log (UI)

1. Copy Log Hash from the created entry
2. Go to Verify page
3. Paste log hash
4. Submit verification

Expected result:
1. Log found
2. Signature valid
3. IPFS data retrieval status shown
4. Blockchain status shown when available

### 7.4 Verify On Explorer (Blockchain Proof)

1. Copy blockchain transaction hash from log
2. Open Sepolia explorer URL:
- https://sepolia.etherscan.io/tx/<transaction_hash>
3. Confirm transaction status is success

### 7.5 Verify IPFS Content

1. Copy IPFS CID from log
2. Open gateway URL:
- https://gateway.pinata.cloud/ipfs/<cid>
3. Confirm payload content matches created log

## 8. Troubleshooting Quick Guide

1. No blockchain hash:
- Check backend terminal for blockchain error
- Validate CONTRACT_ADDRESS and signer funds
- Confirm contract/backend parameter compatibility

2. IPFS upload failed:
- Validate IPFS credentials
- Check backend service auth path
- Confirm no fallback-only test mode in final demo

3. Port issues:
- Free port 5000/3000 and restart processes

4. Stale env values:
- Restart backend and frontend after every .env change

## 9. Teacher Viva Talking Points

1. Why blockchain + DB together:
- DB gives fast app queries
- Blockchain gives immutable proof

2. Why IPFS:
- Decentralized content storage
- CID naturally detects tampering

3. Why signatures:
- Proves authenticity of generated log

4. Why Sepolia:
- Real EVM behavior with testnet cost profile

## 10. Security Reminder

1. Never keep real secrets in public docs or screenshots
2. Rotate exposed keys after demo:
- Wallet private key
- RPC keys
- IPFS provider keys

End of document.
