# Smart Contract Documentation

## APILogger Contract

Solidity smart contract implementing the immutable API logging system.

## Contract Overview

The `APILogger` contract serves as the blockchain storage layer for API logs. It stores IPFS hashes and digital signatures, ensuring immutability and verifiability of logs.

## Data Structures

### APILog Struct
```solidity
struct APILog {
    bytes32 ipfsHash;           // IPFS hash of the log
    bytes signature;             // Digital signature of the log
    uint256 timestamp;          // When the log was created
    address loggedBy;           // User address
    string userId;              // User ID
    string endpoint;            // API endpoint
    uint256 statusCode;         // HTTP status code
    uint256 requestSize;        // Request size in bytes
    uint256 responseSize;       // Response size in bytes
    bool verified;              // Verification status
}
```

### APIUser Struct
```solidity
struct APIUser {
    address userAddress;        // Wallet address
    string userId;              // User ID
    uint256 totalRequests;      // Total API calls logged
    uint256 totalCost;          // Total cost in wei
    bool isActive;              // User status
    uint256 createdAt;          // Registration timestamp
}
```

## Key Functions

### User Management

#### registerUser(userId)
Register a new user on the blockchain.

**Parameters:**
- `userId`: Unique user identifier (string)

**Returns:** None

**Events:** `UserRegistered`

**Example:**
```solidity
contract.registerUser("user123");
```

#### deactivateUser(userAddress)
Deactivate a user (owner only).

**Parameters:**
- `userAddress`: Address to deactivate

**Returns:** None

### Log Storage

#### storeLog(ipfsHash, signature, userId, endpoint, statusCode, requestSize, responseSize)
Store a new API log on the blockchain.

**Parameters:**
- `ipfsHash`: IPFS hash of the log
- `signature`: Digital signature
- `userId`: User identifier
- `endpoint`: API endpoint
- `statusCode`: HTTP status code
- `requestSize`: Request size
- `responseSize`: Response size

**Returns:** `bytes32` - Log hash

**Events:** `LogCreated`, `BillingRecorded`

**Cost:** ~95,000 gas

#### getLog(logHash)
Retrieve log details from blockchain.

**Parameters:**
- `logHash`: Hash of the log

**Returns:** `APILog` struct

**Cost:** 0 gas (view function)

#### getUserLogs(userId)
Get all logs for a user.

**Parameters:**
- `userId`: User identifier

**Returns:** Array of log hashes

**Cost:** 0 gas (view function)

### Verification

#### verifyLog(logHash)
Mark a log as verified.

**Parameters:**
- `logHash`: Hash to verify

**Returns:** None

**Events:** `LogVerified`

## Events

### LogCreated
```solidity
event LogCreated(
    bytes32 indexed logHash,
    string indexed userId,
    string endpoint,
    uint256 timestamp
);
```

Emitted when a new log is stored.

### LogVerified
```solidity
event LogVerified(bytes32 indexed logHash, bool isValid);
```

Emitted when a log is verified.

### UserRegistered
```solidity
event UserRegistered(address indexed userAddress, string userId);
```

Emitted when a user registers.

### BillingRecorded
```solidity
event BillingRecorded(string indexed userId, uint256 cost);
```

Emitted when a log is stored (billing event).

## Gas Costs (Sepolia)

| Operation | Gas | Cost (20 Gwei) |
|-----------|-----|----------------|
| registerUser | 32,000 | 0.00064 ETH |
| storeLog | 95,000 | 0.0019 ETH |
| verifyLog | 25,000 | 0.0005 ETH |
| getLog | 0 | 0 ETH |
| getUserLogs | 0 | 0 ETH |

## Security Features

✅ Access control via modifiers  
✅ Immutable log records  
✅ User activation/deactivation  
✅ Input validation  
✅ Owner-controlled parameters  

## Deployment

### Sepolia Testnet
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Mainnet
```bash
npx hardhat run scripts/deploy.js --network mainnet
```

## Verification

### Verify on Etherscan
```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

## Usage Examples

### Register User
```javascript
const tx = await contract.registerUser("john_doe");
await tx.wait();
```

### Store Log
```javascript
const tx = await contract.storeLog(
    ipfsHash,
    signature,
    "john_doe",
    "/api/users",
    200,
    256,
    1024
);

const receipt = await tx.wait();
console.log("Log stored in tx:", receipt.hash);
```

### Get User Logs
```javascript
const logs = await contract.getUserLogs("john_doe");
console.log("User logs:", logs);
```

### Verify Log
```javascript
const log = await contract.getLog(logHash);
console.log("Log verified:", log.verified);

// Mark as verified
const tx = await contract.verifyLog(logHash);
await tx.wait();
```

## Storage Layout

The contract uses the following storage optimization:

```
Slot 0: owner (address)
Slot 1: costPerRequest (uint256)
Slot 2: logCount (uint256)
Slot 3+: mappings (logs, users, userLogs, userBillingHistory)
```

## Potential Upgrades

- [ ] Implement ERC1155 for log tokens
- [ ] Add multi-signature verification
- [ ] Implement upgradeable proxy pattern
- [ ] Add role-based access control
- [ ] Batch operations support
- [ ] Advanced analytics tracking

---

## File Locations

### Smart Contract Source
```
contracts/src/APILogger.sol           ← Main contract file
```

### Compiled Contract Files
```
contracts/artifacts/src/APILogger.sol/
  ├── APILogger.json                 ← Full ABI export
  └── APILogger.dbg.json             ← Debug information
```

### ABI (Application Binary Interface)
```
backend/src/utils/APILoggerABI.json   ← ABI used by backend for interaction
```

### Deployment & Configuration
```
contracts/hardhat.config.js           ← Hardhat configuration
contracts/package.json                ← Contract dependencies
config/blockchain.config.js           ← Dynamic contract initialization
```

---

## Backend Integration

### Files That Import the Contract

#### 1. **BlockchainService.js** (Primary Integration)
**Location:** `backend/src/services/BlockchainService.js`

**What it does:**
- Initializes Ethers.js provider and signer
- Creates contract instance using ABI
- Calls contract functions
- Handles gas transactions

**Key imports:**
```javascript
const { ethers } = require('ethers');
const APILoggerABI = require('../utils/APILoggerABI.json');
```

**Key methods that interact with contract:**
```javascript
async storeLog(ipfsHash, signature, userId, endpoint, statusCode, requestSize, responseSize)
  → Calls: contract.storeLog()
  → Action: Stores log on blockchain

async verifyLog(ipfsHash)
  → Calls: contract.verifyLog()
  → Action: Marks log as verified

async registerUser(userId)
  → Calls: contract.registerUser()
  → Action: Registers user on blockchain

async getUserStats(address)
  → Calls: contract.getUserStats()
  → Action: Retrieves user stats (requests, cost)
```

#### 2. **log.routes.js** (Uses BlockchainService)
**Location:** `backend/src/routes/log.routes.js`

**What it does:**
- Receives API log requests
- Calls BlockchainService methods
- Creates MongoDB cache records

**Integration flow:**
```
POST /api/logs/create (user request)
  ↓
LoggingService.generateLogHash()      (generate hash)
  ↓
LoggingService.createSignature()      (create digital signature)
  ↓
IPFSService.uploadFile()              (upload to IPFS)
  ↓
BlockchainService.storeLog()          (call contract.storeLog())
  ↓
Log.save()                            (save to MongoDB)
```

**Specific code line:**
```javascript
const blockchainHash = await BlockchainService.storeLog(
  ipfsHash,
  signature,
  req.user.userId,
  endpoint,
  statusCode,
  requestSize,
  responseSize
);
```

#### 3. **Verification Route** (Also uses BlockchainService)
**Location:** `backend/src/routes/log.routes.js:/api/logs/:logHash/verify`

**Integration flow:**
```
POST /api/logs/:logHash/verify (auto-verify after 5 seconds)
  ↓
BlockchainService.verifyLog()         (call contract.verifyLog())
  ↓
Log.updateOne()                       (update MongoDB status)
```

---

## Data Flow: Complete Transaction Chain

```
┌─────────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                           │
│                   LogsPage/BillingPage                          │
└──────────────────────────┬──────────────────────────────────────┘
                          │
                    POST /api/logs/create
                    (endpoint, statusCode, sizes)
                          │
          ┌───────────────┴────────────────┐
          ↓                                ↓
┌──────────────────────────────────┐  ┌──────────────────┐
│    LOG.ROUTES.JS                 │  │  IPFS SERVICE    │
│  (Backend Handler)               │  │  (uploadFile)    │
│                                  │  │                  │
│ 1. Parse request                 │  │ Stores JSON log  │
│ 2. Create log object             │  │ Returns: IPFS    │
│ 3. Generate hash                 │  │ hash             │
│ 4. Create signature              │  │                  │
│ 5. Call BlockchainService        │  └──────────────────┘
└──────────────┬───────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────────┐
│         BLOCKCHAIN SERVICE                               │
│   (backend/src/services/BlockchainService.js)            │
│                                                          │
│ Constructor initializes:                                │
│  • Ethers.js provider (RPC URL)                         │
│  • Signer (private key from .env)                       │
│  • Contract instance (address + ABI)                    │
└──────────────┬───────────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────────┐
│    CONTRACT INSTANCE (ethers.Contract)                  │
│    ├── contractAddress: from .env                       │
│    ├── ABI: from APILoggerABI.json                      │
│    └── signer: wallet with private key                  │
└──────────────┬───────────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────────┐
│   SMART CONTRACT ON ETHEREUM (Sepolia Testnet)          │
│   APILogger.sol (Deployed at CONTRACT_ADDRESS)          │
│                                                          │
│   contract.storeLog() execution:                        │
│   ├── Validates inputs                                  │
│   ├── Creates APILog struct                             │
│   ├── Saves: logs[ipfsHash] = newLog                   │
│   ├── Updates: users[sender].totalRequests++           │
│   ├── Emits: LogCreated event                          │
│   ├── Emits: BillingRecorded event                     │
│   └── Returns: transaction receipt                      │
└──────────────┬───────────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────────┐
│           TRANSACTION CONFIRMATION                       │
│                                                          │
│ • Gas used, tx hash, block number recorded              │
│ • Data immutably stored on blockchain                   │
│ • Blockchain state updated permanently                  │
└──────────────┬───────────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────────┐
│        BACK TO BACKEND (log.routes.js)                  │
│                                                          │
│ 1. Receive tx receipt from Blockchain Service           │
│ 2. Get blockchain transaction hash                      │
│ 3. Save Log to MongoDB:                                 │
│    ├── logHash                                          │
│    ├── ipfsHash                                         │
│    ├── blockchainHash (tx hash)                         │
│    ├── signature                                        │
│    └── status: "pending"                               │
│                                                          │
│ 4. Update Billing (MongoDB):                            │
│    ├── Add cost: $0.001 + ($0.0001 × responseSize)    │
│    └── Increment request count                          │
└──────────────┬───────────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────────┐
│          RESPONSE TO FRONTEND                            │
│                                                          │
│ {                                                        │
│   logHash: "abc123...",                                 │
│   ipfsHash: "QmXXX...",                                │
│   blockchainHash: "0xTxHash...",                       │
│   status: "pending",                                    │
│   timestamp: "2026-04-11T..."                          │
│ }                                                        │
└──────────────┬───────────────────────────────────────────┘
               │
         [5-Second Wait]
               │
               ↓
┌──────────────────────────────────────────────────────────┐
│    AUTO-VERIFY (Frontend calls after 5 seconds)         │
│                                                          │
│  POST /api/logs/:logHash/verify                        │
└──────────────┬───────────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────────┐
│      BLOCKCHAIN SERVICE (verifyLog method)              │
│                                                          │
│  contract.verifyLog(ipfsHash)                           │
│  → Calls contract on Ethereum                           │
│  → Updates logs[ipfsHash].verified = true               │
│  → Emits LogVerified event                              │
└──────────────┬───────────────────────────────────────────┘
               │
               ↓
┌──────────────────────────────────────────────────────────┐
│       UPDATE MONGODB & FRONTEND                          │
│                                                          │
│ • Log status: "pending" → "verified"                   │
│ • Frontend auto-refreshes logs table                    │
│ • Shows "Verified" badge next to log                   │
└──────────────────────────────────────────────────────────┘
```

---

## How Components Interact

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND                                 │
│  (React: LogsPage.js, BillingPage.js, VerificationPage.js)     │
│                          │                                       │
│                   Axios HTTP Calls                              │
└──────────────────────────┬──────────────────────────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        │                                     │
        ↓                                     ↓
┌────────────────────┐            ┌────────────────────┐
│   Backend Express  │            │  Backend Express   │
│  (log.routes.js)   │            │(billing.routes.js) │
│                    │            │                    │
│ POST /create       │            │ GET /current-month │
│ GET /list          │            │ POST /payment      │
│ POST /verify       │            │ GET /history       │
└────────┬───────────┘            └────────┬───────────┘
         │                                  │
         │        ┌────────────────────────┘
         │        │
         ↓        ↓
    ┌─────────────────────────┐
    │   BlockchainService     │    ← CENTRAL INTEGRATION
    │                         │
    │ • Manages ethers.js     │
    │ • Creates contract      │
    │ • Calls contract methods│
    │ • Handles transactions  │
    └────────┬────────────────┘
             │
             ↓
    ┌─────────────────────────┐
    │  Smart Contract ABI     │
    │  (APILoggerABI.json)    │
    └────────┬────────────────┘
             │
             ↓
    ┌─────────────────────────────────┐
    │  Ethereum Network (Sepolia)     │
    │  APILogger Smart Contract       │
    │  (Deployed at CONTRACT_ADDRESS) │
    │                                 │
    │  - Stores logs immutably        │
    │  - Verifies logs                │
    │  - Tracks user stats            │
    │  - Manages billing records      │
    └─────────────────────────────────┘
```

### Key Integration Points

#### 1. **BlockchainService Initialization** (on backend startup)
```javascript
// backend/src/services/BlockchainService.js
constructor() {
  this.provider = new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL);
  this.signer = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
  this.contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    APILoggerABI,  ← Loads from utils/APILoggerABI.json
    this.signer
  );
}
```

#### 2. **Contract Call Example** (storing a log)
```javascript
// In BlockchainService.storeLog()
const tx = await this.contract.storeLog(
  ipfsHash,      // bytes32
  signature,     // bytes (RSA signature)
  userId,        // string
  endpoint,      // string
  statusCode,    // uint256
  requestSize,   // uint256
  responseSize   // uint256
);

const receipt = await tx.wait();  // Wait for blockchain confirmation
return receipt.hash;  // Return transaction hash
```

#### 3. **Monitoring Contract Events** (optional for real-time updates)
```javascript
// Could be implemented for real-time notifications
contract.on("LogCreated", (logHash, userId, endpoint, timestamp) => {
  console.log("Log created on blockchain:", logHash);
  // Could trigger frontend notification
});
```

---

## Environment Configuration

### Required `.env` Variables (Backend)

```env
# Blockchain Configuration
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=0x... (64 hex chars)
CONTRACT_ADDRESS=0x... (deployed contract address)

# IPFS Configuration
IPFS_HOST=ipfs.infura.io
IPFS_PORT=5001
IPFS_PROTOCOL=https

# Other Services
MONGODB_URI=mongodb://...
JWT_SECRET=...
```

### Contract Deployment

1. **Compile**: `npx hardhat compile` (generates artifacts & ABI)
2. **Deploy**: `npx hardhat run scripts/deploy.js --network sepolia`
3. **Copy ABI**: Contract address & ABI copied to backend config
4. **Update .env**: `CONTRACT_ADDRESS` set in backend .env

---

## Security & Validation

### Smart Contract Validations
```solidity
require(_ipfsHash != 0, "IPFS hash cannot be zero");
require(bytes(_userId).length > 0, "User ID cannot be empty");
require(users[msg.sender].isActive, "User not registered");
```

### Backend Validations (BlockchainService)
```javascript
if (!this.contract) {
  console.warn('Contract not initialized');
  return null;  // Gracefully handle if contract unavailable
}
```

### Gasless Operations
- **View functions** (getLog, getUserLogs, getUserStats): 0 gas
- **State-changing** (storeLog, verifyLog, registerUser): Pay gas

---

## Summary: Complete Integration Path

| Component | Location | Role | Interacts With |
|-----------|----------|------|-----------------|
| **APILogger.sol** | `contracts/src/` | Smart contract on blockchain | BlockchainService |
| **APILoggerABI.json** | `backend/src/utils/` | Contract interface | BlockchainService |
| **BlockchainService.js** | `backend/src/services/` | Ethereum interaction gateway | log.routes.js, Blockchain |
| **log.routes.js** | `backend/src/routes/` | API endpoints | BlockchainService, MongoDB |
| **billing.routes.js** | `backend/src/routes/` | Billing endpoints | BlockchainService, MongoDB |
| **LogsPage.js** | `frontend/src/pages/` | Frontend UI | log.routes.js |
| **BillingPage.js** | `frontend/src/pages/` | Billing UI | billing.routes.js |

**Complete flow**: Frontend → Express Routes → BlockchainService → Smart Contract (Ethereum) → Gas transaction → Blockchain state updated → Response back to Frontend

## Audit Status

⚠️ This contract has NOT been professionally audited. Before mainnet deployment, conduct a professional security audit.

## License

MIT
