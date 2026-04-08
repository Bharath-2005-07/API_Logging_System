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

## Audit Status

⚠️ This contract has NOT been professionally audited. Before mainnet deployment, conduct a professional security audit.

## License

MIT
