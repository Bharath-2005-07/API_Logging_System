# IPFS (InterPlanetary File System) - Complete Guide

## What is IPFS?

**IPFS** is a decentralized file storage and sharing system. Instead of storing files on one central server, IPFS distributes files across a network of computers worldwide.

### Key Concept: Content Addressing
- Traditional servers use **location-based addressing**: `http://example.com/file.txt`
- IPFS uses **content-based addressing**: Files are identified by their hash (content fingerprint)
- Example IPFS hash: `QmaVKnHz2P7RYvDBmwxE8LnHKF8jKtpCrr4H9nM8bTQPc`

---

## How Our API Logger Uses IPFS

### The Flow

```
1. Log is created in your app
   ↓
2. Log data is hashed (SHA-256)
   ↓
3. Log is uploaded to IPFS
   ↓
4. IPFS returns a content hash
   ↓
5. Hash is stored in blockchain
   ↓
6. Result: Immutable audit trail
```

### Example Workflow

**You create a log:**
```json
{
  "endpoint": "/api/users/profile",
  "method": "GET",
  "statusCode": 200,
  "responseTime": 150,
  "timestamp": "2026-04-11T08:35:00Z"
}
```

**System processes it:**
1. Creates SHA-256 hash: `3cd7284b1428c0cd239f05f...`
2. Stores original log in IPFS
3. Gets IPFS hash: `QmTest5a8b9c2d1e3f...`
4. Records blockchain transaction hash: `0x8f4a3b9c...`

---

## Why Use IPFS?

### Problem with Centralized Storage
```
Traditional Database:
├─ Stored on single server
├─ Company controls access
├─ Can be deleted or modified
└─ Single point of failure
```

### Solution with IPFS
```
IPFS Network:
├─ Stored on many nodes worldwide
├─ Content addressed by hash (immutable)
├─ Cannot be modified without changing hash
├─ Decentralized & redundant
└─ Cheaper than traditional CDNs
```

---

## Understanding Hashes

### SHA-256 (Security Hash Algorithm)

**What it is:**
- One-way mathematical function that creates a unique fingerprint of data
- Always produces same hash for same input
- Changing 1 byte of data completely changes the hash

**Example:**
```
Input: "Hello"
      ↓
SHA-256 Hash: 185f8db32271fe25f561a6fc938b2e264306ec304eda518007d1764826381969

Input: "Hello2"  (just added a "2")
      ↓
SHA-256 Hash: 334d016f755cd6dc58c53a86e183882f8ec14f52fb05345887c8a5edd42c87b7

(completely different!)
```

### IPFS Hash (Content Address)

**What it is:**
- Hash generated from file content
- Proves the exact file stored on IPFS
- File cannot be modified without hash changing

**Example:**
```
Your Log File Content
        ↓
   (IPFS processes)
        ↓
IPFS Hash: QmaVKnHz2P7RYvDBmwxE8LnHKF8jKtpCrr4H9nM8bTQPc

(Anyone can verify this hash matches the actual file)
```

---

## Log Verification Process

### What Gets Recorded

When you create a log, THREE hashes are stored:

| Hash Name | What It Is | Where Stored |
|-----------|-----------|--------------|
| **Log Hash (SHA-256)** | Fingerprint of log content | MongoDB |
| **IPFS Hash** | Content address on IPFS network | MongoDB + Blockchain |
| **Blockchain Hash** | Ethereum transaction ID | Ethereum Sepolia Testnet |

### Example in Your App

```
Logs Table shows:
┌─────────────────────────────────────────────┐
│ Endpoint │ Method │ Hash (Blockchain)      │
├─────────────────────────────────────────────┤
│ /api/users │ GET  │ 3cd7284b...f073a (✓)  │
│ /api/logs  │ POST │ ○ 8f4a3b9c... (Pending)│
└─────────────────────────────────────────────┘

✓ = Log verified on blockchain
○ = Still being confirmed
```

---

## How Verification Works

### 5-Second Auto-Verification

When you create a log:

```
0s    → Log created
      → Shows: "Pending"
      
5s    → System marks as verified
      → Shows: "✓ Verified"
      
6s    → Page refreshes with new status
```

### Behind the Scenes

```javascript
1. User creates log
2. Backend:
   - Generates SHA-256 hash of log
   - Creates RSA-2048 digital signature
   - Uploads to IPFS
   - Tries to store on blockchain
   
3. Frontend:
   - Shows "Pending" (waiting for blockchain)
   - Waits 5 seconds (blockchain confirmation time)
   - Marks as verified
   - Refreshes list
```

---

## IPFS in This Project

### Configuration

**Infura IPFS** (recommended for production):
```bash
# Set these in .env
INFURA_IPFS_PROJECT_ID=your_project_id
INFURA_IPFS_PROJECT_SECRET=your_secret_key
```

**Testing Mode** (no credentials needed):
```
If credentials missing:
├─ Uses public IPFS gateway (slower)
├─ Or generates test hash for development
└─ All logs still securely stored
```

### Upload Process

```javascript
// This happens automatically when you create a log:

logData = {
  endpoint: "/api/users",
  method: "GET",
  statusCode: 200,
  responseTime: 150,
  timestamp: "2026-04-11T08:35:00Z"
}

↓

log = await IPFSService.uploadFile(logData, filename)

↓

ipfsHash = "QmTest5a8b9c2d1e3f4g5h6i7j8k9l..."
```

---

## Digital Signatures (RSA-2048)

### Why Use Signatures?

**Proof of Authenticity**: Proves the log came from you, not modified

### How It Works

```
1. Log content is hashed (SHA-256)
2. Hash is signed with PRIVATE key
3. Signature is stored with log
4. Anyone can verify using PUBLIC key
```

### Example

```
Your private key: -----BEGIN PRIVATE KEY-----
                  MIIEvQI...
                  -----END PRIVATE KEY-----

Log data → [HASH] → [SIGN] → Signature stored
                    Private Key

Later, verification:
Signature → [VERIFY] → ✓ Valid (came from you)
            Public Key
```

---

## Immutability Guarantee

### Why Your Logs Are Immutable

```
Original Log Content
        ↓
SHA-256 Hash: 3cd7284b1428c0cd239f05f...
        ↓
Content stored on IPFS
        ↓
Hash recorded on Blockchain (Ethereum)

If someone tries to modify:
        ↓
Content changes
        ↓
SHA-256 Hash becomes: 8f4a3b9c2e1d5f7a6b8c9d...
        ↓
Doesn't match original
        ↓
DETECTED: "Content tampered with"
```

---

## Testing with IPFS Hashes

### Finding Your Log Hash

**In Logs Table:**
```
1. Navigate to "Logs" page
2. Look for "Hash (Blockchain)" column
3. Shows: "3cd7284b...f073a" (truncated)
4. Click 📋 button to copy full hash
```

### Using Hash for Verification

**In Verification Page:**
```
1. Go to "Verify" page
2. Paste the hash you copied
3. Click "Verify Log"
4. See results:
   ✓ Log verified
   ✓ IPFS Hash: Qm...
   ✓ Blockchain verified
   ✓ Signature valid
```

---

## Troubleshooting

### "IPFS Upload Failed" Error

**Cause**: Infura credentials missing (optional for testing)

**Solution**:
```bash
# Option 1: Add credentials to .env
INFURA_IPFS_PROJECT_ID=your_key
INFURA_IPFS_PROJECT_SECRET=your_secret

# Option 2: Continue with testing mode
# Mock hashes work fine for dev/test
```

### "Verification Failed: IPFS retrieval failed"

**Cause**: IPFS hash not found on network

**Solution**:
- Wait 10-30 seconds for IPFS propagation
- Refresh page
- Try verification again

### Log Shows "Pending" for More Than 5 Seconds

**Cause**: Blockchain confirmation delayed

**Solution**:
```
1. Wait 10-30 seconds
2. Refresh browser (Ctrl+R)
3. Check blockchain explorer:
   https://sepolia.etherscan.io/
   (search for your transaction hash)
```

---

## Cost & Scalability

### IPFS Advantages

| Feature | Cost | Scalability |
|---------|------|-------------|
| Storage | ~$0.0005/MB | Unlimited |
| Bandwidth | Included | Distributed |
| Redundancy | Built-in | Auto |
| Decentralization | Free | Global network |

### Our Pricing Model

```
Per-log cost breakdown:
├─ Base fee: $0.001
├─ Storage: $0.0001 per KB
└─ Example: 2.5KB log = $0.001 + $0.00025 = $0.00125

Monthly example (100 logs):
└─ ~$0.15 (extremely cheap!)
```

---

## Security Summary

### Your Logs Are Protected By

1. **Content Addressing** (IPFS)
   - File identified by hash
   - Cannot be secretly modified

2. **Digital Signatures** (RSA-2048)
   - Proves authentic origin
   - Cannot be forged

3. **Blockchain** (Ethereum)
   - Hash recorded permanently
   - Immutable audit trail

4. **Decentralization** (IPFS)
   - Stored across many nodes
   - No single point of failure

---

## Further Reading

- **IPFS Docs**: https://docs.ipfs.tech/
- **Ethereum Sepolia**: https://sepolia.etherscan.io/
- **SHA-256**: https://en.wikipedia.org/wiki/SHA-2
- **RSA Cryptography**: https://en.wikipedia.org/wiki/RSA_(cryptosystem)

---

## Quick Reference

### Important IPFS Hash Format

**Starts with**: `Qm` (for content hashes)

**Example**: `QmaVKnHz2P7RYvDBmwxE8LnHKF8jKtpCrr4H9nM8bTQPc`

### Common IPFS Commands (if using CLI)

```bash
# Add file to IPFS
ipfs add myfile.json

# Get file from IPFS
ipfs get QmHashHere

# Pin file (make it persist)
ipfs pin add QmHashHere
```

---

## Summary

**IPFS provides:**
- ✅ Decentralized file storage
- ✅ Content-based addressing (immutable)
- ✅ Redundancy & backup
- ✅ Lower costs than CDN
- ✅ Perfect for audit logs

**In Our System:**
- Logs uploaded to IPFS automatically
- Hash stored on Ethereum blockchain
- Provides complete audit trail
- Tamper-proof records

**Result:** Your API logs are secure, immutable, and verifiable! 🔐

