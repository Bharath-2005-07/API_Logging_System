# Testing and Validation README

This guide is a repeatable checklist for running, testing, and validating the project from scratch.

## 1. Objective

Validate that the system can:
1. Start all services successfully
2. Create user accounts and authenticate
3. Create logs with hash/signature
4. Upload logs to IPFS
5. Anchor log proof on blockchain
6. Verify logs from UI and API

## 2. Prerequisites

1. Node.js 18+ and npm installed
2. MongoDB running locally
3. Sepolia wallet funded with test ETH
4. Valid RPC URL and contract address in environment
5. Valid IPFS credentials configured (Pinata/Infura path)

## 3. Environment Configuration

Open root .env and confirm these are set:

1. ETHEREUM_RPC_URL
2. PRIVATE_KEY
3. CONTRACT_ADDRESS
4. REACT_APP_CONTRACT_ADDRESS
5. MONGODB_URI
6. REACT_APP_BACKEND_URL
7. FRONTEND_URL
8. IPFS credentials

IPFS path currently supports:
1. PINATA_JWT, or
2. PINATA_API_KEY and PINATA_API_SECRET, or
3. INFURA_IPFS_PROJECT_ID and INFURA_IPFS_PROJECT_SECRET

## 4. First-Time Install Commands

From project root run in order:

1. Contracts install

```powershell
cd contracts
npm install
```

2. Backend install

```powershell
cd ..\backend
npm install
```

3. Frontend install

```powershell
cd ..\frontend
npm install
```

4. Return to root

```powershell
cd ..
```

## 5. Key Setup (if needed)

Generate RSA keys used for log signatures:

```powershell
cd contracts
node generate-keys.js
Copy-Item .\keys\private.key ..\backend\keys\private.key -Force
Copy-Item .\keys\public.key ..\backend\keys\public.key -Force
cd ..
```

## 6. Smart Contract Validation (optional if already deployed)

1. Compile:

```powershell
cd contracts
npx hardhat compile
```

2. Deploy to Sepolia:

```powershell
npx hardhat console --network sepolia
```

In console:

```javascript
const F = await ethers.getContractFactory("APILogger")
const c = await F.deploy()
await c.waitForDeployment()
await c.getAddress()
```

3. Update .env values:
1. CONTRACT_ADDRESS
2. REACT_APP_CONTRACT_ADDRESS

4. Return to root:

```powershell
cd ..
```

## 7. Start Services

Start in separate terminals.

1. Backend:

```powershell
cd backend
npm start
```

2. Frontend:

```powershell
cd frontend
npm start
```

## 8. Health Checks

1. Backend health:
- Open http://localhost:5000/health
- Expect status OK JSON

2. Frontend health:
- Open http://localhost:3000
- Login/Register page should load

## 9. Functional Validation (UI Path)

1. Register a new user
2. Login
3. Go to Logs page
4. Create a log entry
5. Confirm a new row appears
6. Open Verify page and verify by Log Hash

Expected:
1. Log found in database
2. Signature valid
3. IPFS hash present
4. Blockchain proof fields populated when chain write succeeds

## 10. Functional Validation (API Path)

Use an API client (Postman or curl).

1. Register

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"userId":"testuser1","email":"test1@example.com","name":"Test User","password":"password123"}'
```

2. Login and copy token

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com","password":"password123"}'
```

3. Create log

```bash
curl -X POST http://localhost:5000/api/logs/create \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"google.com","method":"GET","statusCode":200,"requestSize":100,"responseSize":1000,"responseTime":200}'
```

4. List logs

```bash
curl -X GET "http://localhost:5000/api/logs?page=1&limit=10" \
  -H "Authorization: Bearer <TOKEN>"
```

5. Verify blockchain mapping key endpoint

```bash
curl -X GET "http://localhost:5000/api/blockchain/verify/<IPFS_HASH_OR_CID>" \
  -H "Authorization: Bearer <TOKEN>"
```

## 11. Proof Validation Checklist

For a fully validated log record, confirm all of these:

1. Log hash exists and is 64 hex chars
2. Signature exists and verify flow passes
3. IPFS CID is real (not fallback test prefix)
4. Blockchain transaction hash exists
5. Transaction opens on Sepolia explorer

Explorer URL format:

1. https://sepolia.etherscan.io/tx/<TRANSACTION_HASH>
https://gateway.pinata.cloud/ipfs/
https://ipfs.io/ipfs/

## 12. Common Failure Cases and Fixes

1. Port in use (5000/3000)

```powershell
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

2. IPFS fallback used (test hash)
- Check IPFS credentials in .env
- Restart backend after env change

3. Blockchain write fails
- Check wallet has Sepolia ETH
- Check contract address is correct
- Check PRIVATE_KEY format

4. Frontend not picking env updates
- Stop frontend and restart npm start

5. Backend not picking env updates
- Stop backend and restart npm start

## 13. Regression Test After Any Code Change

Run this minimum set:

1. Start backend and frontend
2. Register and login
3. Create one log
4. Verify log from Verify page
5. Validate IPFS CID and blockchain hash fields
6. Open blockchain tx in explorer if available

## 14. Demo-Day Short Script

1. Show /health endpoint
2. Login
3. Create log
4. Show generated hash/signature/CID/tx hash
5. Verify log in Verify page
6. Open tx hash on Sepolia explorer

End of file.
