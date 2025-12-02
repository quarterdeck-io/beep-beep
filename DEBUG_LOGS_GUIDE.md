# Debug Logs Guide - eBay Policies

## What's Being Logged

When you click "Refresh Policies", the server will now show comprehensive debugging information in **Terminal 1**.

## Log Output Explained

### 1. Connection Info
```
=== eBay Connection Info ===
App User ID: clxxxxx
App User Email: your-email@example.com
Token Expires At: 2025-12-02T18:30:00.000Z
Token Expired: false
Has Refresh Token: true
Access Token (partial): v^1.1#i^1.#...#p^3#r^0...
```

**What this tells us:**
- ✅ Which user in YOUR app is making the request
- ✅ When the eBay token expires
- ✅ Whether the token is still valid
- ✅ Whether we can refresh the token
- ✅ Partial token for verification (not full token for security)

### 2. eBay User Info (Optional)
```
Fetching eBay user info...
eBay User Info: {
  username: 'your_ebay_username',
  userId: '12345678',
  email: 'N/A'
}
===========================
```

**What this tells us:**
- ✅ Which eBay account is connected
- ✅ The eBay user ID
- ✅ Confirms token is valid and working

**Note:** This might fail (that's normal), we'll still get policy info.

### 3. Policy Fetch Info
```
Fetching eBay policies from: https://api.ebay.com
Using marketplace: EBAY_US
Policy API responses: { fulfillment: 200, payment: 200, return: 200 }
Policies fetched: { fulfillmentCount: 2, paymentCount: 1, returnCount: 1 }
```

**What this tells us:**
- ✅ Production vs Sandbox URL
- ✅ Which marketplace we're querying
- ✅ HTTP status codes for each policy type
- ✅ How many policies were found

### 4. Raw API Responses
```
Raw fulfillment response: {
  "total": 2,
  "fulfillmentPolicies": [
    {
      "fulfillmentPolicyId": "123456789",
      "name": "Standard Shipping",
      "description": "Ships within 1 business day",
      "marketplaceId": "EBAY_US",
      ...
    }
  ]
}
```

**What this tells us:**
- ✅ Exact data eBay is returning
- ✅ Policy IDs, names, and details
- ✅ Which marketplace each policy belongs to
- ✅ Whether the data structure matches expectations

## How to Use This Info

### Step 1: Restart Server
```powershell
# In Terminal 1, press Ctrl+C
npm start
```

### Step 2: Trigger Logs
1. Go to `http://localhost:3000/settings`
2. Click **"Refresh Policies"** button
3. **Immediately switch to Terminal 1**

### Step 3: Read the Logs

Copy the ENTIRE log output and check:

#### ✅ Check Token Status
```
Token Expired: false  ← Should be FALSE
Has Refresh Token: true  ← Should be TRUE
```

If token is expired, it will try to refresh automatically.

#### ✅ Check Marketplace
```
Using marketplace: EBAY_US  ← Should match where your policies are
```

**Common marketplaces:**
- `EBAY_US` = ebay.com (United States)
- `EBAY_GB` = ebay.co.uk (United Kingdom)
- `EBAY_DE` = ebay.de (Germany)
- `EBAY_AU` = ebay.com.au (Australia)
- `EBAY_CA` = ebay.ca (Canada)

#### ✅ Check Status Codes
```
Policy API responses: { fulfillment: 200, payment: 200, return: 200 }
```

**Status codes:**
- `200` = ✅ Success
- `403` = ❌ Permission denied (missing scope)
- `401` = ❌ Unauthorized (invalid token)
- `404` = ❌ Not found (wrong marketplace?)
- `500` = ❌ Server error

#### ✅ Check Policy Counts
```
Policies fetched: { fulfillmentCount: 2, paymentCount: 1, returnCount: 1 }
```

If all zeros but status is 200:
- **Most likely cause:** Wrong marketplace
- **Solution:** Update `EBAY_MARKETPLACE_ID` in env file

#### ✅ Check Raw Responses

Look at the `Raw fulfillment response` section:

**Empty array:**
```json
{
  "fulfillmentPolicies": [],
  "total": 0
}
```
→ No policies found for this marketplace

**Has policies:**
```json
{
  "fulfillmentPolicies": [
    {
      "fulfillmentPolicyId": "123456789",
      "name": "Standard Shipping",
      "marketplaceId": "EBAY_US"
    }
  ],
  "total": 1
}
```
→ Policy found! Check the `marketplaceId` field

## Common Issues & Solutions

### Issue 1: Wrong Marketplace
**Log shows:**
```
Using marketplace: EBAY_US
Policies fetched: { fulfillmentCount: 0, paymentCount: 0, returnCount: 0 }
```

**Solution:**
1. Check which eBay site you created policies on
2. Update env file:
```env
EBAY_MARKETPLACE_ID="EBAY_GB"  # or your correct marketplace
```
3. Restart server

### Issue 2: Permission Denied (403)
**Log shows:**
```
Policy API responses: { fulfillment: 403, payment: 403, return: 403 }
```

**Solution:**
1. Disconnect eBay account: `/api/ebay/disconnect`
2. Reconnect: `/ebay-connect`
3. Grant all 7 permissions
4. Try again

### Issue 3: Token Expired
**Log shows:**
```
Token Expired: true
```

**Solution:**
It should auto-refresh. If not:
1. Disconnect and reconnect eBay account
2. Try again

### Issue 4: Wrong eBay Account
**Log shows:**
```
eBay User Info: {
  username: 'wrong_account',
  userId: '12345678'
}
```

**Solution:**
1. Disconnect current account
2. Reconnect with the correct eBay account
3. Make sure policies exist in THAT account

## What to Share for Help

If you need help debugging, share:

### 1. Full Connection Info
```
=== eBay Connection Info ===
... (entire section)
===========================
```

### 2. Marketplace Info
```
Using marketplace: EBAY_US
```

### 3. Status Codes
```
Policy API responses: { ... }
```

### 4. Raw Responses
```
Raw fulfillment response: { ... }
```

### 5. Additional Context
- Which eBay website you created policies on (ebay.com, ebay.co.uk, etc.)
- Screenshot of your business policies page
- Whether policies are Active/Published

## Success Example

Here's what a successful log looks like:

```
=== eBay Connection Info ===
App User ID: clxxxxx
App User Email: user@example.com
Token Expires At: 2025-12-02T18:30:00.000Z
Token Expired: false
Has Refresh Token: true
Access Token (partial): v^1.1#i^1...
Fetching eBay user info...
eBay User Info: {
  username: 'my_ebay_store',
  userId: '987654321',
  email: 'N/A'
}
===========================
Fetching eBay policies from: https://api.ebay.com
Using marketplace: EBAY_US
Policy API responses: { fulfillment: 200, payment: 200, return: 200 }
Policies fetched: { fulfillmentCount: 2, paymentCount: 1, returnCount: 1 }
Raw fulfillment response: {
  "total": 2,
  "fulfillmentPolicies": [
    {
      "fulfillmentPolicyId": "123456789",
      "name": "Standard Shipping",
      "marketplaceId": "EBAY_US",
      ...
    },
    {
      "fulfillmentPolicyId": "987654321",
      "name": "Express Shipping",
      "marketplaceId": "EBAY_US",
      ...
    }
  ]
}
... (more policies)
```

**This means:**
- ✅ Token is valid
- ✅ Connected to correct eBay account
- ✅ Correct marketplace
- ✅ Policies found successfully
- ✅ Dropdowns should populate!

## Quick Checklist

Before sharing logs, verify:

- [ ] Server restarted after env changes
- [ ] Clicked "Refresh Policies" button
- [ ] Copied full log output from Terminal 1
- [ ] Checked which eBay site policies are on
- [ ] Confirmed policies are Active/Published
- [ ] Connected to correct eBay account

---

**Ready to Debug!** Restart your server and share the log output! 🔍

