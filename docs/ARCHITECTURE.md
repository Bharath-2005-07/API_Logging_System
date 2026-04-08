# System Architecture

## Overview

The Secure and Immutable API Usage Logging System uses a decentralized architecture combining blockchain, IPFS, and traditional backend services.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Client Layer                               │
├─────────────────────────────────────────────────────────────────────┤
│  - Web Frontend (React, Vue, etc.)                                   │
│  - Mobile Apps                                                       │
│  - Third-party Integrations                                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        API Server Layer                              │
├─────────────────────────────────────────────────────────────────────┤
│  Node.js + Express                                                   │
│  - Authentication (JWT)                                              │
│  - Route Handling                                                    │
│  - Rate Limiting                                                     │
│  - Request Validation                                                │
└────────┬──────────────────────┬──────────────────┬──────────────────┘
         │                      │                  │
         ▼                      ▼                  ▼
   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
   │ Log Service  │    │IPFS Service  │    │ Blockchain   │
   │              │    │              │    │ Service      │
   │ - Hash logs  │    │ - Upload     │    │ - Store hash │
   │ - Sign logs  │    │ - Retrieve   │    │ - Verify     │
   │ - Verify sig │    │ - Pin files  │    │ - Register   │
   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘
          │                   │                   │
          ▼                   ▼                   ▼
   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
   │  MongoDB     │    │    IPFS      │    │  Blockchain  │
   │              │    │   Network    │    │              │
   │ - User Data  │    │              │    │ - Smart      │
   │ - Logs Cache │    │ - Immutable  │    │   Contracts  │
   │ - Billing    │    │ - Distributed│    │ - Transaction│
   │ - Metadata   │    │ - Redundant  │    │ - Merkle     │
   └──────────────┘    └──────────────┘    └──────────────┘
```

## Components

### Frontend Layer

**Technology**: React, JavaScript, Web3.js

**Responsibilities**:
- User interface
- Authentication UI
- Log viewing
- Verification interface
- Wallet integration

**Features**:
- Responsive design
- PWA capabilities
- Offline support
- MetaMask integration

### Backend Layer

**Technology**: Node.js, Express, JWT

**Responsibilities**:
- API routing
- Authentication
- Rate limiting
- Input validation
- Error handling

**Services**:

#### 1. Logging Service
- Generate log hashes (SHA-256)
- Create digital signatures (RSA/ECDSA)
- Verify signatures
- Manage keys

#### 2. IPFS Service
- Upload logs to IPFS
- Retrieve logs from IPFS
- Pin important files
- Handle file encryption

#### 3. Blockchain Service
- Store IPFS hashes
- Record timestamps
- Store signatures
- Manage smart contract calls

### Data Layer

**Technologies**: MongoDB, IPFS, Ethereum Blockchain

#### MongoDB
- Primary cache
- User management
- Billing records
- Metadata storage
- Query optimization

#### IPFS
- Decentralized storage
- Content addressing
- Distributed redundancy
- Permanent pinning

#### Blockchain
- Immutable records
- Smart contracts
- Cryptographic proofs
- Public verification

## Data Flow

### 1. Log Creation Flow

```
Client Request
    │
    ▼
Backend Validation
    │
    ▼
Log Object Creation
    │
    ▼
Hash Generation (SHA-256)
    │
    ▼
Digital Signature Creation (RSA/ECDSA)
    │
    ▼
IPFS Upload (returns IPFS hash)
    │
    ▼
Blockchain Storage (stores IPFS hash + signature)
    │
    ▼
MongoDB Caching (for quick retrieval)
    │
    ▼
Return Transaction Hash
```

### 2. Log Verification Flow

```
Verify Request (IPFS hash or log ID)
    │
    ▼
Query Blockchain (retrieve IPFS hash + signature)
    │
    ▼
Retrieve from IPFS (get original log)
    │
    ▼
Verify Digital Signature
    │
    ▼
Confirm Timestamp Validity
    │
    ▼
Return Verification Result
```

### 3. Authentication Flow

```
Login Credentials
    │
    ▼
Database Lookup
    │
    ▼
Password Verification (bcryptjs)
    │
    ▼
JWT Token Generation
    │
    ▼
Token Return to Client
    │
    ▼
Client Stores Token (localStorage)
    │
    ▼
Token Sent with All Requests
    │
    ▼
Token Verification Middleware
    │
    ▼
Request Processing
```

## Security Architecture

### Network Security
- HTTPS/TLS encryption
- CORS configuration
- Rate limiting (per IP)
- Request validation
- Input sanitization

### Application Security
- JWT authentication
- Password hashing (bcryptjs)
- Digital signatures (RSA/ECDSA)
- Access control
- Error handling

### Data Security
- End-to-end encryption
- IPFS content addressing
- Blockchain immutability
- Private key management
- Key rotation policies

## Scalability Considerations

### Horizontal Scaling
- Stateless API servers
- Load balancing
- Database sharding
- IPFS pinning cluster

### Vertical Scaling
- Database indexes
- Caching strategies
- Query optimization
- Connection pooling

### Performance
- Response compression
- Request batching
- Async processing
- CDN for static content

## Deployment Architecture

### Development
```
Local Machine
├── Backend (Node.js)
├── Frontend (React Dev Server)
├── MongoDB (Local or Container)
└── IPFS (Local or Testnet)
```

### Production
```
Cloud Infrastructure (AWS/GCP/Azure)
├── Load Balancer
│   └── API Servers (Multiple)
├── PostgreSQL/MongoDB (Cluster)
├── IPFS Pinning Service (Infura/Pinata)
├── Blockchain RPC (Infura/Alchemy)
└── CDN (Frontend + Static Assets)
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React | UI Framework |
| Frontend State | Redux/Context | State Management |
| Frontend Blockchain | Web3.js/Ethers | Blockchain Interaction |
| Backend | Node.js | Runtime |
| Backend Framework | Express | Web Framework |
| Backend Database | MongoDB | Data Storage |
| Authentication | JWT | Token-based Auth |
| Hashing | SHA-256 | Log Hashing |
| Signature | RSA/ECDSA | Digital Signatures |
| Decentralized Storage | IPFS | Log Storage |
| Blockchain | Ethereum | Smart Contracts |
| Language | Solidity | Smart Contracts |
| Testing | Jest/Mocha | Unit Tests |
| DevOps | Docker | Containerization |

## Integration Points

### External Services
1. **Infura** - Blockchain RPC + IPFS
2. **Alchemy** - Blockchain RPC
3. **MongoDB Atlas** - Database as a Service
4. **AWS S3** - Frontend hosting (optional)
5. **Etherscan** - Contract verification

### APIs
- Blockchain RPC (for transactions)
- IPFS API (for file operations)
- MongoDB Driver (for queries)
- Express REST (for client requests)

## Monitoring & Logging

### Logging Strategy
- Application logs (Winston/Pino)
- Blockchain transaction logs
- IPFS operation logs
- Database query logs
- Frontend error logs (Sentry)

### Monitoring
- API response times
- Error rates
- Database performance
- Blockchain gas costs
- IPFS pin status

## Disaster Recovery

### Backup Strategy
- MongoDB automatic backups
- IPFS pinning redundancy
- Contract code verification
- Private key vaults
- Database snapshots

### Recovery Time
- API: < 5 minutes
- Database: < 30 minutes
- Smart contracts: N/A (immutable)
- IPFS: < 1 minute (pin another node)
