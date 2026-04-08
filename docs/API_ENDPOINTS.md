# API Endpoints Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

All endpoints (except `/auth/*`) require JWT token:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Endpoints

### Authentication

#### Register User
```
POST /auth/register
Content-Type: application/json

{
  "userId": "john_doe",
  "email": "john@example.com",
  "name": "John Doe",
  "password": "secure_password"
}

Response (201):
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "userId": "john_doe",
      "email": "john@example.com",
      "name": "John Doe"
    }
  }
}
```

#### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "secure_password"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "user": { ... }
  }
}
```

### Users

#### Get Profile
```
GET /users/profile
Authorization: Bearer TOKEN

Response (200):
{
  "success": true,
  "message": "Profile retrieved",
  "data": {
    "_id": "...",
    "userId": "john_doe",
    "email": "john@example.com",
    "name": "John Doe",
    "totalRequests": 150,
    "totalCost": 150000,
    "registeredAt": "2026-04-05T..."
  }
}
```

#### Update Profile
```
PUT /users/profile
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "name": "John Smith",
  "walletAddress": "0x...",
  "profile": {
    "company": "ACME Inc",
    "industry": "Tech",
    "country": "USA"
  }
}

Response (200):
{
  "success": true,
  "message": "Profile updated",
  "data": { ... }
}
```

#### Get Statistics
```
GET /users/stats
Authorization: Bearer TOKEN

Response (200):
{
  "success": true,
  "data": {
    "userId": "john_doe",
    "totalRequests": 150,
    "totalCost": 150000,
    "registeredAt": "2026-04-05T...",
    "lastLogin": "2026-04-05T..."
  }
}
```

### Logs

#### Create Log
```
POST /logs/create
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "endpoint": "/api/users",
  "method": "GET",
  "statusCode": 200,
  "requestSize": 256,
  "responseSize": 1024,
  "responseTime": 45,
  "metadata": {
    "userId": "user123",
    "operationType": "READ"
  }
}

Response (201):
{
  "success": true,
  "message": "Log created and stored",
  "data": {
    "logHash": "abc123...",
    "ipfsHash": "QmXxxx...",
    "blockchainHash": "0x...",
    "signature": "sig..."
  }
}
```

#### Get Logs (Paginated)
```
GET /logs?page=1&limit=10
Authorization: Bearer TOKEN

Response (200):
{
  "success": true,
  "message": "Logs retrieved",
  "data": [
    {
      "_id": "...",
      "logHash": "...",
      "ipfsHash": "...",
      "endpoint": "/api/users",
      "method": "GET",
      "statusCode": 200,
      "verified": true,
      "createdAt": "2026-04-05T..."
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages": 15
  }
}
```

#### Get Log Details
```
GET /logs/:logHash
Authorization: Bearer TOKEN

Response (200):
{
  "success": true,
  "data": {
    "_id": "...",
    "logHash": "...",
    "ipfsHash": "QmXxxx...",
    "blockchainHash": "0x...",
    "signature": "sig...",
    "endpoint": "/api/users",
    "method": "GET",
    "statusCode": 200,
    "requestSize": 256,
    "responseSize": 1024,
    "responseTime": 45,
    "verified": true,
    "ipfsData": { /* full log data from IPFS */ }
  }
}
```

### Billing

#### Get Billing History
```
GET /billing/history?page=1&limit=10
Authorization: Bearer TOKEN

Response (200):
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "userId": "john_doe",
      "period": {
        "startDate": "2026-04-01T...",
        "endDate": "2026-04-30T..."
      },
      "requestCount": 5000,
      "totalCost": 5000000,
      "status": "paid",
      "createdAt": "2026-04-05T..."
    }
  ],
  "pagination": { ... }
}
```

#### Get Current Billing Period
```
GET /billing/current
Authorization: Bearer TOKEN

Response (200):
{
  "success": true,
  "data": {
    "_id": "...",
    "userId": "john_doe",
    "period": {
      "startDate": "2026-04-01T...",
      "endDate": "2026-04-30T..."
    },
    "requestCount": 3500,
    "totalCost": 3500000,
    "status": "pending",
    "costPerRequest": 0.001
  }
}
```

### Blockchain

#### Get Statistics
```
GET /blockchain/stats
Authorization: Bearer TOKEN

Response (200):
{
  "success": true,
  "data": {
    "logCount": "10000",
    "userStats": {
      "userId": "john_doe",
      "totalRequests": "150",
      "totalCost": "150000",
      "isActive": true
    }
  }
}
```

#### Get User Logs from Blockchain
```
GET /blockchain/logs
Authorization: Bearer TOKEN

Response (200):
{
  "success": true,
  "data": [
    "0xabc...",
    "0xdef...",
    ...
  ]
}
```

### IPFS

#### Upload File
```
POST /ipfs/upload
Authorization: Bearer TOKEN
Content-Type: application/json

{
  "content": "{\"data\": \"log data\"}",
  "filename": "log.json"
}

Response (201):
{
  "success": true,
  "message": "File uploaded to IPFS",
  "data": {
    "ipfsHash": "QmXxxx..."
  }
}
```

#### Retrieve File
```
GET /ipfs/retrieve/:hash
Authorization: Bearer TOKEN

Response (200):
{
  "success": true,
  "message": "File retrieved from IPFS",
  "data": {
    "content": "{\"data\": \"log data\"}"
  }
}
```

## Error Responses

### 400 Bad Request
```
{
  "success": false,
  "message": "Invalid input data",
  "timestamp": "2026-04-05T..."
}
```

### 401 Unauthorized
```
{
  "success": false,
  "message": "Access token required",
  "timestamp": "2026-04-05T..."
}
```

### 403 Forbidden
```
{
  "success": false,
  "message": "Invalid or expired token",
  "timestamp": "2026-04-05T..."
}
```

### 404 Not Found
```
{
  "success": false,
  "message": "Log not found",
  "timestamp": "2026-04-05T..."
}
```

### 429 Too Many Requests
```
{
  "success": false,
  "message": "Too many requests from this IP, please try again later",
  "timestamp": "2026-04-05T..."
}
```

### 500 Internal Server Error
```
{
  "success": false,
  "message": "Internal server error",
  "timestamp": "2026-04-05T..."
}
```

## Rate Limiting

- **Default**: 100 requests per 15 minutes per IP
- **Headers**: 
  - `X-RateLimit-Limit`: 100
  - `X-RateLimit-Remaining`: 99
  - `X-RateLimit-Reset`: timestamp

## Response Format

All successful responses follow:
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { /* response data */ },
  "timestamp": "2026-04-05T10:30:00Z"
}
```

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Server Error |

## cURL Examples

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "john_doe",
    "email": "john@example.com",
    "name": "John Doe",
    "password": "password123"
  }'
```

### Create Log
```bash
curl -X POST http://localhost:5000/api/logs/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "endpoint": "/api/users",
    "method": "GET",
    "statusCode": 200,
    "requestSize": 256,
    "responseSize": 1024,
    "responseTime": 45
  }'
```

### Get Logs
```bash
curl -X GET "http://localhost:5000/api/logs?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```
