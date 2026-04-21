# Smart Contracts

## Overview

Solidity contract for immutable API log proof anchoring on Ethereum Sepolia.

Main file:
- src/APILogger.sol

## Current Core Functions

- registerUser
- storeLog
- verifyLog
- getLog
- getUserLogs
- getUserStats
- getLogCount
- getAllLogs

## Notes for Current Backend Integration

- Backend converts IPFS CID to deterministic bytes32 key before contract calls.
- Backend signer wallet must be registered before storeLog succeeds.
- Signature passed to contract is bytes and must be valid BytesLike.

## Build and Deploy

```bash
npm install
npx hardhat compile
npx hardhat run scripts/deploy.js --network sepolia
```

After deploy:
1. Update CONTRACT_ADDRESS in root .env
2. Update REACT_APP_CONTRACT_ADDRESS in root .env
3. Sync backend ABI file if contract changed

## Quick Verification

1. Create a log from UI.
2. Copy transaction hash.
3. Open:
   https://sepolia.etherscan.io/tx/<txHash>
4. Confirm status is Success.
