# Input Testing Guide

## Quick Testing of All Features

### 1. **Register & Login**
1. Go to **Register** page
2. Enter credentials:
   - Email: `test@example.com`
   - Password: `Test123!`
   - Confirm Password: `Test123!`
3. Click **Register**
4. You'll be redirected to login
5. Login with same credentials

### 2. **Create a Log**
1. Go to **Logs** page
2. Fill the **Create Log** form:
   - **Endpoint**: `/api/users/profile` (or any endpoint path)
   - **Method**: `GET` (or POST, PUT, DELETE)
   - **Status Code**: `200`
   - **Response Time (ms)**: `150`
   - **Response Size (KB)**: `2.5`
   - **Description**: `Fetched user profile` (optional)
3. Click **Create Log**
4. Success message appears: "Log created successfully! Verifying..."
5. ⏳ **Wait 5 seconds** → Status changes to **"✓ Verified"**

### 3. **Filter Logs**
1. On **Logs** page, use filters:
   - **Endpoint**: Type `/api` to search
   - **Method**: Select `GET`, `POST`, etc.
   - **Status**: Select `200`, `400`, `500`
2. Logs table updates in real-time

### 4. **View Log Hash**
1. On **Logs** page, each log shows a **Hash** column
2. The hash is truncated: `0x8f4a...3b4c` (click 📋 button to copy full hash)
3. **Blockchain Hash**: The transaction hash proving log is on Ethereum
4. **Log Hash**: SHA-256 hash of the log content (shown if not yet on blockchain)
5. Use this hash for verification

### 5. **Verify a Log**
1. Go to **Verification** page
2. In the **Logs** page, copy the log hash from the table
3. Paste it in Verification page input
4. Click **Verify Log**
5. See results:
   - ✅ **Verified on Blockchain** - Log is immutable on Ethereum
   - **IPFS Hash**: `Qm...` - File stored on distributed storage
   - **Timestamp**: When the log was created
   - **Original Size**: Size of the log file

### 6. **Check Billing**
1. Go to **Billing** page
2. See:
   - **Current Month Cost**: Total charges so far
   - **Cost Breakdown**:
     - Base cost per log: `$0.001`
     - Storage cost: `$0.0005 per KB`
   - **Billing History**: Table of past periods
3. Each log creation adds to your current month bill

### 7. **Dashboard Overview**
1. Go to **Dashboard**
2. See statistics:
   - **Total Logs**: Number of logs created
   - **Current Month Bills**: Active charge
   - **Verified Logs**: Logs on blockchain
   - **Recent Activity**: Last 5 logs

---

## Hash Chaining & User Isolation

### What is Hash Chaining?

**Hash Chaining** is a blockchain concept where each log can reference the previous log's hash, creating an unbreakable chain:

```
Log 1 created:
└─ Hash A: 3cd7284b1428c0cd239f05f...
   (stored on Ethereum)

Log 2 created:
└─ Hash B: 8f4a3b9c2e1d5f7a6b8c9d...
   References: Hash A (previous log)
   (stored on Ethereum)

Log 3 created:
└─ Hash C: 5a2b3c4d5e6f7g8h9i10j...
   References: Hash B (previous log)
   (stored on Ethereum)

Chain: A → B → C → ...
```

### Per-User Hash Chains

Each user has their **own separate hash chain**:

**User: bhargav@07**
```
bhargav's logs:
└─ Log 1 → Hash A1
└─ Log 2 → Hash A2 (references A1)
└─ Log 3 → Hash A3 (references A2)
```

**User: test@example.com**
```
test's logs:
└─ Log 1 → Hash B1
└─ Log 2 → Hash B2 (references B1)
└─ Log 3 → Hash B3 (references B2)
```

### Why User Isolation?

| Feature | Benefit |
|---------|---------|
| **Privacy** | Only see your own logs |
| **Security** | Can't tamper with others' logs |
| **Compliance** | Data isolation per customer |
| **Audit Trail** | Individual user accountability |

---

## Example Test Data - Hash Chaining

### Test Scenario: Create Multiple Logs (Shows Hash Chain)

**User: bhargav@07**

#### Step 1: Create First Log (Base of Chain)
```
Endpoint: /api/users/profile
Method: GET
Status: 200
Response Time: 150ms
Response Size: 2.5 KB
```

**Result:**
```
Log Entry 1:
├─ Hash: 3cd7284b1428c0cd239f05f...
├─ Status: ✓ Verified
└─ Chain Position: BASE (first log)
```

#### Step 2: Create Second Log (Links to First)
```
Endpoint: /api/logs/create
Method: POST
Status: 201
Response Time: 250ms
Response Size: 5 KB
```

**Result:**
``
Log Entry 2:
├─ Hash: 8f4a3b9c2e1d5f7a6b8c9d...
├─ References: 3cd7284b1428... (previous log)
├─ Status: ✓ Verified
└─ Chain Position: LINK (references Log 1)
```

#### Step 3: Create Third Log (Continues Chain)
```
Endpoint: /api/billing
Method: GET
Status: 200
Response Time: 100ms
Response Size: 1.2 KB
```

**Result:**
```
Log Entry 3:
├─ Hash: 5a2b3c4d5e6f7g8h9i10j...
├─ References: 8f4a3b9c2e1d... (previous log)
├─ Status: ✓ Verified
└─ Chain Position: LINK (references Log 2)
```

### Table View (Chronological)

```
┌────────────────────────────────────────────────────────────────┐
│          API Logs - bhargav@07's Chain                        │
├────────────────────────────────────────────────────────────────┤
│ Date       │ Endpoint      │ Hash         │ Status   │ Position│
├────────────────────────────────────────────────────────────────┤
│ Apr 11,    │ /api/billing  │ 5a2b...     │ ✓ Verf   │ Link 3→2│
│ 02:50 PM   │               │             │          │         │
├────────────────────────────────────────────────────────────────┤
│ Apr 11,    │ /api/logs     │ 8f4a...     │ ✓ Verf   │ Link 2→1│
│ 02:49 PM   │               │             │          │         │
├────────────────────────────────────────────────────────────────┤
│ Apr 11,    │ /api/users    │ 3cd7...     │ ✓ Verf   │ BASE (1)│
│ 02:48 PM   │               │             │          │         │
└────────────────────────────────────────────────────────────────┘
```

### Blockchain View (On Ethereum Sepolia)
```
Transaction 1: Hash 3cd7284b... stored
  └─ User: bhargav@07
  └─ Verified: ✓

Transaction 2: Hash 8f4a3b9c... stored (references 3cd7284b)
  └─ User: bhargav@07
  └─ Verified: ✓

Transaction 3: Hash 5a2b3c4d... stored (references 8f4a3b9c)
  └─ User: bhargav@07
  └─ Verified: ✓
```

---

## Important Concepts

### User Isolation in Action

**Scenario: Two Users Create Logs**

```
bhargav@07 creates logs:
✓ Can see: Own logs (3 logs)
✗ Cannot see: test@example.com's logs
✗ Cannot modify: test@example.com's hashes

test@example.com creates logs:
✓ Can see: Own logs (5 logs)
✗ Cannot see: bhargav@07's logs
✗ Cannot modify: bhargav@07's hashes
```

**This means:**
1. When you login as **one user**, you only see **your own logs**
2. If you logout and login as **another user**, you see **that user's logs only**
3. Hashes are unique **per user's chain**
4. No user can tamper with another user's logs

---

## Does Status Code Affect Logging?

### All Status Codes Get Logged & Chained

**YES** - Every status code (200, 404, 500, etc.) gets logged and chained:

**Example Scenario:**
```
Log 1: GET /api/users → 200 (Success)
  └─ Hash A: 3cd7284b...
  └─ Stored ✓

Log 2: GET /api/invalid → 404 (Not Found)
  └─ Hash B: 8f4a3b9c...
  └─ References: Hash A (previous log)
  └─ Stored ✓ (chained!)

Log 3: POST /api/server → 500 (Server Error)
  └─ Hash C: 5a2b3c4d...
  └─ References: Hash B (previous log)
  └─ Stored ✓ (chained!)
```

### Why Log All Status Codes?

| Status | Purpose | Logged? | Chained? |
|--------|---------|---------|----------|
| **2xx (Success)** | Successful requests | ✓ Yes | ✓ Yes |
| **3xx (Redirect)** | Redirect responses | ✓ Yes | ✓ Yes |
| **4xx (Client Error)** | Bad requests, 404, etc. | ✓ Yes | ✓ Yes |
| **5xx (Server Error)** | Server failures | ✓ Yes | ✓ Yes |

**All are part of your audit trail!**

### Real-World Scenario

You're debugging an API issue:
```
Log 1: GET /api/data → 200 (works)
Log 2: GET /api/data → 404 (broken!)
Log 3: GET /api/data → 200 (fixed!)

Chain: A → B → C
Proof: You can show exactly when it broke and was fixed
```

This is **powerful** for audit trails and debugging! 🔍

---

## Billing Status Explanation

### "Pending" Status Meaning

**NOT**: "Waiting for verification"
**MEANS**: "Payment not yet made" (unpaid invoice)

```
Log Verification Status:
├─ While verifying: ○ Pending
└─ After 5 seconds: ✓ Verified

Billing Payment Status:
├─ Invoice created: ⏳ Pending (unpaid)
├─ Payment made: ✓ Paid
├─ Past due date: ⚠️ Overdue
└─ Payment failed: ✕ Failed
```

### Cost Calculation Details

**Per Log Cost:**
```
Base Cost        = $0.001 (0.1 cents)
Storage Cost     = Response Size (KB) × $0.0001
Total Per Log    = Base + Storage

Example for 6.84 KB log:
Storage Cost = 6.84 × $0.0001 = $0.000684
Total        = $0.001 + $0.000684 = $0.001684
Display      = $0.00 (rounded in UI for clarity)
```

### Billing Refresh

**Billing updates automatically every 5 seconds:**
```
Timeline:
1s   → Create log
       Billing updated in database

5s   → View Billing page
       Shows cost automatically

10s  → Creates additional logs
       Billing refreshes to show total
```

**If cost shows $0.00:**
- Refresh page (Ctrl+R)
- Wait 5 seconds (auto-refresh kicks in)
- Check backend logs for errors

---

## Auto-Verification Timeline

### What Happens When You Create a Log

```
Timeline:
0s    → Log created
        Message: "Creating..."

1s    → Created in database
        Message: "Log created successfully! Verifying..."

5s    → System auto-verifies
        Hash confirmed on blockchain
        Message: "Log verified successfully! ✓"

6s    → Page refreshes
        Status column shows: "✓ Verified"
```

### In Your Logs Table

```
BEFORE (at 2s):          AFTER (at 7s):
Status: ○ Pending        Status: ✓ Verified
```

---

## Example Test Data

**Test Logs to Create (In Order):**
```
1. GET /api/users/profile → 200 → 150ms → 2.5KB
2. POST /api/logs/create → 201 → 250ms → 5KB  
3. GET /api/billing → 200 → 100ms → 1.2KB
4. POST /api/invalid → 404 → 50ms → 0.8KB
5. DELETE /api/users/account → 500 → 800ms → 3KB
```

**Create Progress:**
- Log 1: Creates base of chain
- Log 2: References Log 1
- Log 3: References Log 2
- Log 4: References Log 3
- Log 5: References Log 4

**Expected Results:**
```
✓ All 5 logs appear in table
✓ Total cost: (5 × $0.001) + (5 × $0.0005 × avg_size) ≈ $0.015
✓ Each log linked to previous
✓ Full audit trail created
✓ Blockchain immutability verified
```

---

## Troubleshooting

**No logs appear**:
- Refresh page (Ctrl+R)
- Check browser console for errors
- Verify you're logged in

**Hash not showing**:
- Wait 5-10 seconds for blockchain confirmation
- Refresh the page
- Check if browser has network issues

**Verification fails**:
- Copy hash exactly (including `0x` prefix)
- Check Ethereum Sepolia testnet is accessible
- Verify log is recent (< 1 minute old)

**Still shows "Pending" after 5 seconds**:
- Page may need manual refresh
- Check browser console: F12 → Console tab
- Verify backend is running: `npm start`

**Can't see other user's logs**:
- This is **correct behavior** (user isolation)
- Each user only sees their own logs
- Login as that user to see their logs

---

## API Cost Examples

| Endpoint | Method | Calls | Avg Size | Cost |
|----------|--------|-------|----------|------|
| `/api/users` | GET | 10 | 2KB | $0.015 |
| `/api/logs/create` | POST | 5 | 5KB | $0.0325 |
| `/api/billing` | GET | 3 | 1KB | $0.0065 |

**Total for month**: $0.054

---

## All Features at a Glance

✅ Create unlimited logs per user  
✅ Hash chaining (each log references previous)  
✅ User isolation (secure, private logs)  
✅ Blockchain verification (Ethereum Sepolia)  
✅ IPFS storage for logs  
✅ Automatic billing calculation  
✅ Filter logs by method/endpoint/status  
✅ View verified blockchain status  
✅ Track monthly costs  
✅ Auto-verification after 5 seconds  

Ready to start testing!

