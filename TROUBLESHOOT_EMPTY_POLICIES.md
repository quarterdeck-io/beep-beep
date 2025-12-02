# Troubleshooting: Empty eBay Business Policies

## The Problem
You see "No policies found" even though you've created business policies in your eBay account.

## Step 1: Check Server Logs (Most Important!)

### How to Check:
1. Look at **Terminal 1** (where `npm start` is running)
2. Go to Settings page and click "Refresh Policies"
3. Look for these logs:

```bash
Fetching eBay policies from: https://api.ebay.com
Using marketplace: EBAY_US
Policy API responses: { fulfillment: 200, payment: 200, return: 200 }
Policies fetched: { fulfillmentCount: 0, paymentCount: 0, returnCount: 0 }
Raw fulfillment response: { ... }
Raw payment response: { ... }
Raw return response: { ... }
```

### What to Look For:

**Check the status codes:**
- `200` = Success (API is working)
- `403` = Permission denied (need to reconnect)
- `401` = Unauthorized (token expired)

**Check the raw responses:**
The raw JSON will show EXACTLY what eBay is returning!

## Common Causes & Solutions

### Cause 1: Wrong Marketplace
**Symptom:** Status 200 but count is 0

Your policies might be created for a different marketplace!

**Check which marketplace your policies are in:**
1. Go to [eBay Business Policies](https://www.ebay.com/sh/ovw/businesspolicy)
2. Look at the top - which eBay site are you on?
   - **ebay.com** = EBAY_US 🇺🇸
   - **ebay.co.uk** = EBAY_GB 🇬🇧
   - **ebay.de** = EBAY_DE 🇩🇪
   - **ebay.com.au** = EBAY_AU 🇦🇺
   - **ebay.ca** = EBAY_CA 🇨🇦

**Solution:**
Update your `env` file with the correct marketplace:

```env
EBAY_MARKETPLACE_ID="EBAY_GB"  # Change to your marketplace
```

Then restart your server!

### Cause 2: Policies Not Active
**Symptom:** Status 200 but count is 0

**Check if policies are active:**
1. Go to [eBay Business Policies](https://www.ebay.com/sh/ovw/businesspolicy)
2. Make sure each policy is:
   - ✅ **Active** (not draft)
   - ✅ **Published** (not pending)
   - ✅ Has all required fields filled

### Cause 3: Brand New Policies
**Symptom:** Just created policies, but not showing

**Solution:**
eBay might take a few minutes to make new policies available via API.
- Wait 5-10 minutes
- Click "Refresh Policies" again

### Cause 4: Missing Permissions
**Symptom:** Status 403 or 401

**Solution:**
1. Disconnect eBay account
2. Reconnect with all 7 permissions
3. Make sure you see "View and manage your account settings" permission

### Cause 5: Wrong eBay Account
**Symptom:** You're logged into eBay with different account

**Check:**
1. Which eBay account did you connect to the app?
2. Which eBay account has the business policies?
3. Are they the same?

**Solution:**
- Disconnect and reconnect with the correct eBay account

## Step 2: Check Raw API Response

The server now logs the raw response from eBay. Look for:

### Example: Successful Response
```json
{
  "fulfillmentPolicies": [
    {
      "fulfillmentPolicyId": "12345",
      "name": "Standard Shipping",
      "marketplaceId": "EBAY_US",
      ...
    }
  ]
}
```

### Example: Empty Response
```json
{
  "fulfillmentPolicies": []
}
```

### Example: Different Field Names
```json
{
  "policies": [...]  // Wrong field name
}
```

If you see different field names, let me know!

## Step 3: Manual API Test

Test the eBay API directly to see what's happening:

### Get Your Access Token
1. Look in the database or logs for your access token
2. Or use this API: `/api/ebay/check-connection`

### Test the API Manually

**PowerShell:**
```powershell
$token = "YOUR_ACCESS_TOKEN"
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
    "X-EBAY-C-MARKETPLACE-ID" = "EBAY_US"
}

# Test fulfillment policies
Invoke-RestMethod -Uri "https://api.ebay.com/sell/account/v1/fulfillment_policy?marketplace_id=EBAY_US" -Headers $headers

# Test payment policies
Invoke-RestMethod -Uri "https://api.ebay.com/sell/account/v1/payment_policy?marketplace_id=EBAY_US" -Headers $headers

# Test return policies
Invoke-RestMethod -Uri "https://api.ebay.com/sell/account/v1/return_policy?marketplace_id=EBAY_US" -Headers $headers
```

## Step 4: Check eBay Requirements

Make sure your policies meet eBay's requirements:

### Payment Policy Requirements:
- ✅ At least one payment method selected
- ✅ PayPal or managed payments enabled

### Return Policy Requirements:
- ✅ Return period specified (e.g., 30 days)
- ✅ Return shipping cost specified (buyer/seller pays)

### Fulfillment Policy Requirements:
- ✅ At least one shipping service selected
- ✅ Handling time specified
- ✅ Shipping cost specified

## Step 5: Try Different Marketplace

Test with different marketplaces to see which one works:

```env
# Try these one at a time:
EBAY_MARKETPLACE_ID="EBAY_US"
EBAY_MARKETPLACE_ID="EBAY_GB"
EBAY_MARKETPLACE_ID="EBAY_DE"
EBAY_MARKETPLACE_ID="EBAY_AU"
EBAY_MARKETPLACE_ID="EBAY_CA"
```

Restart server after each change and check the logs!

## Debugging Checklist

- [ ] Server logs show status 200 for all three APIs
- [ ] Raw responses are being logged (check Terminal 1)
- [ ] Correct marketplace ID in env file
- [ ] Policies exist in eBay account settings
- [ ] Policies are Active/Published (not draft)
- [ ] Connected to correct eBay account
- [ ] All 7 permissions granted when connecting
- [ ] Waited 5-10 minutes after creating policies
- [ ] Server restarted after changing env file

## What to Share for Help

If still not working, share:

1. **Status codes from logs:**
   ```
   Policy API responses: { fulfillment: 200, payment: 200, return: 200 }
   ```

2. **Raw response (sanitized):**
   ```json
   Raw fulfillment response: { ... }
   ```

3. **Your marketplace:**
   ```
   Using marketplace: EBAY_US
   ```

4. **Screenshot of eBay Business Policies page**

5. **Which eBay site you're using:**
   - ebay.com
   - ebay.co.uk
   - etc.

## Quick Fixes to Try

### Fix 1: Restart Everything
```bash
# Stop the server (Ctrl+C in Terminal 1)
# Restart it
npm start
# Clear browser cache
# Try again
```

### Fix 2: Change Marketplace
```env
# If you're on ebay.co.uk
EBAY_MARKETPLACE_ID="EBAY_GB"
```

### Fix 3: Reconnect eBay
1. Go to `/api/ebay/disconnect`
2. Go to `/ebay-connect`
3. Approve all 7 permissions
4. Try loading policies again

### Fix 4: Wait and Retry
- New policies might take 5-10 minutes to appear
- Click "Refresh Policies" every few minutes

## Success Indicators

You'll know it's working when you see:

**In Server Logs:**
```
Policies fetched: { fulfillmentCount: 2, paymentCount: 1, returnCount: 1 }
```

**In Browser:**
```
✓ Loaded 4 policies from eBay
```

**In Dropdowns:**
- Payment Policy: (shows your policy names)
- Return Policy: (shows your policy names)
- Fulfillment Policy: (shows your policy names)

---

**Next Step:** Share your server logs and I can help diagnose the exact issue!

