# TODO README - Project Demo Setup and Validation

This file is a future reference checklist for running and demonstrating the project reliably.

## 1. Goal

Prepare the project for demonstration of:
- secure API logging
- tamper resistance
- transparency and verification
- immutable proof via blockchain

## 2. Accounts Required (Demo Only)

Create these once:
1. MetaMask wallet (demo wallet only, not personal main wallet)
2. Alchemy account (Sepolia RPC URL)
3. Infura account (IPFS Project ID and Secret)
4. Sepolia faucet access (for test ETH)

Optional:
1. Etherscan account and API key (for contract verification)

## 3. One-Time Local Preparation

From project root:
1. Install backend dependencies
- cd backend
- npm install

2. Install frontend dependencies
- cd ..\frontend
- npm install

3. Install contract dependencies
- cd ..\contracts
- npm install

4. Generate RSA signing keys
- node generate-keys.js

5. Copy generated keys to backend folder
- source: contracts\keys\private.key
- source: contracts\keys\public.key
- destination: backend\keys\private.key
- destination: backend\keys\public.key

## 4. Environment Configuration

Update root .env with real values.

Required for blockchain and IPFS demo:
1. ETHEREUM_RPC_URL = your Alchemy Sepolia URL
2. PRIVATE_KEY = your demo wallet private key (0x prefixed, for backend runtime)
3. CONTRACT_ADDRESS = deployed Sepolia contract address
4. INFURA_IPFS_PROJECT_ID = your Infura project id
5. INFURA_IPFS_PROJECT_SECRET = your Infura project secret
6. REACT_APP_CONTRACT_ADDRESS = same as CONTRACT_ADDRESS
7. REACT_APP_BACKEND_URL = http://localhost:5000
8. JWT_SECRET = strong random string
9. MONGODB_URI = mongodb://localhost:27017/api-logging-db
10. PRIVATE_KEY_PATH = ./keys/private.key
11. PUBLIC_KEY_PATH = ./keys/public.key

Important:
- If frontend or backend is already running, restart both after changing .env.

## 5. Deploy Smart Contract (Sepolia)

From project root:
1. Go to contracts
- cd contracts

2. Compile contract
- npx hardhat compile

3. Deploy from hardhat console
- npx hardhat console --network sepolia

4. In console run:
- const F = await ethers.getContractFactory("APILogger")
- const c = await F.deploy()
- await c.waitForDeployment()
- await c.getAddress()

5. Copy the deployed address and update:
- CONTRACT_ADDRESS in .env
- REACT_APP_CONTRACT_ADDRESS in .env

## 6. Run Project

Start MongoDB first, then backend, then frontend.

1. Backend terminal
- cd backend
- npm start

2. Frontend terminal
- cd frontend
- npm start

## 7. Demo Validation Flow

Follow this exact flow during presentation:
1. Register user
2. Login user
3. Create log
4. Confirm response includes:
- logHash
- ipfsHash
- blockchainHash
- signature
5. Open verification page and verify the same log
6. Open Sepolia explorer using blockchainHash and show transaction proof

## 8. Quick Troubleshooting

If backend fails:
1. Check MongoDB is running
2. Check .env values are not placeholders
3. Check backend\keys\private.key and backend\keys\public.key exist
4. Check CONTRACT_ADDRESS is not zero address for blockchain demo
5. Check wallet has Sepolia ETH for gas

If frontend fails:
1. Check REACT_APP_BACKEND_URL in .env
2. Ensure backend is running on that URL
3. Restart frontend after any .env change

If blockchain features are disabled:
1. Verify PRIVATE_KEY format for backend runtime is 0x prefixed
2. Verify ETHEREUM_RPC_URL is valid and active
3. Verify CONTRACT_ADDRESS is a deployed contract

If IPFS upload fails:
1. Verify INFURA_IPFS_PROJECT_ID and INFURA_IPFS_PROJECT_SECRET
2. Check network connectivity

## 9. When You Must Update Values

Update .env again only when:
1. Contract is redeployed (address changes)
2. Wallet key is rotated
3. RPC key or IPFS credentials are rotated/revoked
4. You switch machine, provider, or port setup

## 10. Free-Tier Limit Notes

Expect these limitations on free plans:
1. RPC request and throughput limits
2. Faucet claim rate limits
3. IPFS upload/pinning/bandwidth limits

If limits are hit:
1. Wait for reset window or
2. Use another project key or
3. Upgrade provider plan

## 11. Pre-Demo Final Checklist

1. MongoDB running
2. Backend running
3. Frontend running
4. .env has real values, no placeholders
5. Contract deployed and address updated
6. Wallet funded with Sepolia ETH
7. One successful create-log and verify-log test done

End of file.