# Smart Contracts

## Overview

This directory contains Solidity smart contracts for the Secure and Immutable API Usage Logging System.

## Contracts

### APILogger.sol

The main smart contract that handles:
- API log storage (IPFS hashes)
- User registration and management
- Digital signature storage
- Billing records
- Log verification

**Key Features:**
- Immutable log records
- User-based billing system
- Log verification mechanism
- Gas-optimized operations

## Structure

```
contracts/
├── src/
│   └── APILogger.sol          # Main logging contract
├── hardhat.config.js          # Hardhat configuration
├── package.json               # Dependencies
├── deploy.js                  # Deployment script
└── README.md                  # This file
```

## Functions

### User Management
- `registerUser(userId)` - Register new user
- `deactivateUser(address)` - Deactivate user (owner only)
- `activateUser(address)` - Activate user (owner only)
- `userExists(address)` - Check if user exists
- `getOwner()` - Get contract owner

### Log Management
- `storeLog(ipfsHash, signature, userId, endpoint, statusCode, requestSize, responseSize)` - Store new log
- `getLog(logHash)` - Retrieve log details
- `getUserLogs(userId)` - Get all logs for a user
- `verifyLog(logHash)` - Mark log as verified
- `getLogCount()` - Get total log count
- `getAllLogs()` - Get all log hashes

### Billing
- `updateCostPerRequest(newCost)` - Update cost (owner only)
- `getBillingHistory(userId)` - Get user billing records
- `getUserStats(address)` - Get user statistics

## Events

- `LogCreated` - Emitted when log is stored
- `LogVerified` - Emitted when log is verified
- `UserRegistered` - Emitted when user registers
- `BillingRecorded` - Emitted when billing is recorded
- `CostUpdated` - Emitted when cost is updated

## Deployment

### Prerequisites
```bash
npm install
```

### Compile
```bash
npx hardhat compile
```

### Deploy to Testnet
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Verify on Etherscan
```bash
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

## Gas Optimization

The contract uses:
- Efficient data structures (mappings)
- Minimal storage operations
- Event-driven architecture
- Optimized loops

## Security Considerations

- Only registered and active users can store logs
- Owner-controlled parameters
- Access control modifiers
- Input validation
- Immutable records (write-once)

## Testing

```bash
npx hardhat test
```

## Contract Interaction

### Using Hardhat Console
```bash
npx hardhat console --network sepolia

const contract = await ethers.getContractAt("APILogger", "0x...");
await contract.registerUser("user123");
```

### Using Ethers.js (from backend)
```javascript
const contract = new ethers.Contract(address, ABI, signer);
await contract.storeLog(ipfsHash, signature, userId, endpoint, statusCode, reqSize, respSize);
```

## Cost Analysis

Gas usage per operation:
- Register user: ~32,000 gas
- Store log: ~95,000 gas
- Verify log: ~25,000 gas
- Get logs: ~0 gas (view function)

## Maintenance

### Updating Costs
```bash
npx hardhat run -c "
  const contract = await ethers.getContractAt('APILogger', '0x...');
  await contract.updateCostPerRequest(ethers.utils.parseEther('0.001'));
"
```

### User Management
```bash
# Deactivate user
npx hardhat run -c "await contract.deactivateUser('0x...');"

# Activate user
npx hardhat run -c "await contract.activateUser('0x...');"
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Insufficient funds | Get testnet ETH from faucet |
| Nonce too high | Reset account in MetaMask |
| Contract not found | Verify contract address |
| Reverted transaction | Check user registration status |

## Future Enhancements

- Multi-signature verification
- Batch log processing
- Upgradeable contracts (proxy pattern)
- Advanced analytics functions
- Role-based access control (RBAC)

## Security Audit

This contract should be audited by a professional security firm before mainnet deployment.

## License

MIT License
