# Fix: eBay OAuth Scope Error (Error 2004)

## Problem
You're getting this error when trying to list products:
```
Error 2004: This usually means your OAuth token doesn't have the 'sell.inventory' scope
```

## Root Cause
Your eBay account was connected **before** the `EBAY_SCOPE` environment variable was set correctly on Render. The token you have doesn't include the required `sell.inventory` scope.

## Solution

### Step 1: Update EBAY_SCOPE on Render

1. Go to **Render Dashboard** → Your Web Service → **Environment** tab
2. Find the `EBAY_SCOPE` environment variable
3. Update it to include all required scopes:

```bash
EBAY_SCOPE="https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory.readonly https://api.ebay.com/oauth/api_scope/sell.inventory"
```

**Important:** Make sure it includes:
- `https://api.ebay.com/oauth/api_scope` (for browsing/searching)
- `https://api.ebay.com/oauth/api_scope/sell.inventory.readonly` (read inventory)
- `https://api.ebay.com/oauth/api_scope/sell.inventory` (create/update inventory - **REQUIRED for listing**)

4. Click **Save Changes**
5. Wait for Render to redeploy (or manually trigger a redeploy)

### Step 2: Disconnect Your eBay Account

1. Go to your app: `https://your-app.onrender.com/ebay-connect`
2. Click **"Disconnect & Revoke Access"** button
3. Wait for the confirmation message

### Step 3: Reconnect Your eBay Account

1. On the same `/ebay-connect` page, click **"Connect eBay Account"**
2. You'll be redirected to eBay's authorization page
3. **Review the permissions** - you should see "Sell Inventory" permission listed
4. Click **"Agree"** to authorize
5. You'll be redirected back and should see "Successfully connected!"

### Step 4: Test Listing

1. Go to `/product-search`
2. Search for a product
3. Try to list it on eBay
4. The error should be gone!

## Verification

To verify your scopes are correct:

1. Check Render environment variables - `EBAY_SCOPE` should include `sell.inventory`
2. After reconnecting, check the browser console or Render logs - you should see:
   ```
   eBay OAuth scopes being requested: https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory.readonly https://api.ebay.com/oauth/api_scope/sell.inventory
   ```

## Why This Happens

- eBay OAuth tokens are created with specific scopes when you first authorize
- If you connected your account before `EBAY_SCOPE` was set correctly, your token doesn't have the required permissions
- You **must disconnect and reconnect** to get a new token with the correct scopes
- Simply updating `EBAY_SCOPE` won't update your existing token

## Prevention

For future deployments, make sure `EBAY_SCOPE` is set correctly **before** users connect their eBay accounts.

## Still Having Issues?

1. **Check Render logs** during the OAuth flow to see what scopes are being requested
2. **Verify in eBay Developer Portal** that your app has the required scopes enabled
3. **Check eBay Seller Account** - make sure your eBay account has selling privileges enabled

