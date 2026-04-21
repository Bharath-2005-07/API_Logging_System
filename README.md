# Secure and Immutable API Usage Logging System

## Overview

This project captures API activity and protects each log with:
1. SHA-256 content hashing
2. RSA digital signatures
3. IPFS payload storage
4. Ethereum Sepolia on-chain anchoring

Current data flow:

Client -> Backend -> Hash + Signature -> IPFS CID -> Smart Contract -> MongoDB Cache -> Frontend Verification

## Current Implementation Status

Implemented and working:
- JWT authentication (register/login)
- Log create/list/filter for authenticated users
- Per-user hash chaining (`previousHash`, `chainIndex`)
- Logs table columns for:
  - Log hash
  - Previous hash (Genesis for first log)
  - On-chain transaction hash
  - Explorer link (Sepolia)
- Log verification by log hash
  - Primary: IPFS payload integrity check
  - Fallback: decode stored `storeLog(...)` transaction input from `blockchainHash`
- Chain verification endpoint for per-user link integrity
- Billing with usage pricing:
  - $2 base per request
  - +$5 additional for POST requests
- Payment flow with accumulated `amountPaid` and correct pending/paid transitions

## Important Behavior Notes

- `logHash` is used for tamper verification.
- `blockchainHash` (tx hash) is used to prove the on-chain transaction exists.
- A newly created log is initially pending verification until verify is executed.
- Billing total cost increases on usage creation; payment marks dues as paid.

## Project Structure

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
- MongoDB
- Sepolia RPC URL and funded wallet

### Environment

Configure root `.env` at minimum:

```env
ETHEREUM_RPC_URL=https://...
PRIVATE_KEY=0x...
CONTRACT_ADDRESS=0x...
REACT_APP_CONTRACT_ADDRESS=0x...
REACT_APP_BACKEND_URL=http://localhost:5000
MONGODB_URI=mongodb://localhost:27017/api-logging-db
JWT_SECRET=change_this
```

### Install

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../contracts && npm install
```

### Run

```bash
# terminal 1
cd backend
npm start

# terminal 2
cd frontend
npm start
```

## Verification and Tamper Demo

1. Create 2-3 logs from Logs page.
2. Verify one `logHash` in Verify page (should pass if untampered).
3. Edit one stored log field in MongoDB (example: `statusCode`).
4. Verify same `logHash` again (should fail tamper checks).
5. Optional chain test:
   - Modify `previousHash` for a later log.
   - Call `GET /api/logs/chain/verify`.
   - Expect `chainValid: false` and broken links listed.

## Billing Logic (Current)

- Usage generates billable cost immediately.
- Payment updates `amountPaid` and reduces outstanding balance.
- Status is `paid` only when outstanding balance is zero.
- If new usage is added after payment, status returns to `pending` until fully settled.

## Troubleshooting

- Verify fails with IPFS retrieval errors:
  - Ensure IPFS credentials are configured for retrievable CIDs.
  - For older/non-retrievable CIDs, fallback uses blockchain transaction input decoding.
- Missing transaction hash in logs:
  - Check Sepolia wallet balance and contract config.
- Port conflict on backend (`EADDRINUSE:5000`):
  - Free port 5000 and restart backend.

## Documentation

Detailed docs are available in `docs/`:
- `docs/ARCHITECTURE.md`
- `docs/API_ENDPOINTS.md`
- `docs/SMART_CONTRACT.md`
- `docs/SETUP_GUIDE.md`

## Security Note

Do not commit real secrets in `.env`.
Rotate exposed secrets immediately (wallet key, RPC key, IPFS credentials).

---

Version: 1.0.0
Last Updated: April 21, 2026
Status: Active Development / Demo Ready
