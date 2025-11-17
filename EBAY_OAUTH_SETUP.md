# eBay OAuth Setup Guide

## Important: RuName vs Regular URL

eBay OAuth **does NOT use regular callback URLs** like most OAuth providers. Instead, they use something called a **RuName (Redirect URL name)** - a registered identifier.

## Differences from Standard OAuth

### Standard OAuth (Google, GitHub, etc.)
```
redirect_uri=http://localhost:3000/api/callback
```

### eBay OAuth
```
redirect_uri=Your_App_Name-YourDev-Sandbox-runame
```

## How to Get Your RuName

### 1. Go to eBay Developer Portal
- Sandbox: https://developer.ebay.com/my/auth/?env=sandbox&index=0
- Production: https://developer.ebay.com/my/auth/?env=production&index=0

### 2. Create a User Token (OAuth)
1. Select your application
2. Click on "User Tokens"
3. Click "Get a Token from eBay via Your Application"

### 3. Register Your Callback URL
1. You'll see a section for "Redirect URIs" or "Auth Accepted URL"
2. Add your actual callback URL: `http://localhost:3000/api/ebay/callback` (for local dev)
3. For production: `https://your-domain.com/api/ebay/callback`
4. **eBay will generate a RuName** for this URL (e.g., `Your_App-YourDev-Sandbo-runame`)

### 4. Copy Your RuName
The RuName will look something like:
- Sandbox: `Beep_Beep-DanishMa-Sandbox-runame`
- Production: `Beep_Beep-DanishMa-Producti-runame`

## Environment Variables Setup

Based on your old project, here's how to configure your `.env.local`:

### For Development (Sandbox)
```bash
EBAY_SANDBOX="true"
EBAY_CLIENT_ID="your-sandbox-client-id"
EBAY_CLIENT_SECRET="your-sandbox-client-secret"
EBAY_RUNAME="Your_App-YourDev-Sandbox-runame"
EBAY_SCOPE="https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory.readonly"
```

### For Production
```bash
EBAY_SANDBOX="false"
EBAY_CLIENT_ID="your-production-client-id"
EBAY_CLIENT_SECRET="your-production-client-secret"
EBAY_RUNAME="Your_App-YourDev-Production-runame"
EBAY_SCOPE="https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory.readonly https://api.ebay.com/oauth/api_scope/sell.inventory"
```

## OAuth Scopes

Different scopes grant different permissions:

### Basic (Read-Only)
- `https://api.ebay.com/oauth/api_scope` - Browse/search products

### Selling Scopes
- `https://api.ebay.com/oauth/api_scope/sell.inventory` - Manage inventory
- `https://api.ebay.com/oauth/api_scope/sell.inventory.readonly` - Read inventory
- `https://api.ebay.com/oauth/api_scope/sell.account` - Manage account settings
- `https://api.ebay.com/oauth/api_scope/sell.marketing` - Marketing campaigns
- `https://api.ebay.com/oauth/api_scope/sell.fulfillment` - Order fulfillment
- `https://api.ebay.com/oauth/api_scope/sell.analytics.readonly` - Analytics data

## Common Issues

### 1. "Invalid redirect_uri"
- **Cause**: Using a regular URL instead of RuName
- **Fix**: Get your RuName from eBay Developer Portal and use that

### 2. "Invalid request parameters"
- **Cause**: Wrong OAuth endpoint or missing RuName
- **Fix**: Use `https://auth.ebay.com/oauth2/authorize` (production) or `https://auth.sandbox.ebay.com/oauth2/authorize` (sandbox)

### 3. "Scope not allowed"
- **Cause**: Your app isn't configured for the requested scopes
- **Fix**: Enable required scopes in your eBay app settings

## Testing Your Setup

1. **Get your credentials** from eBay Developer Portal
2. **Register callback URL** and get your RuName
3. **Update `.env.local`** with all required values
4. **Restart your dev server**: `npm run dev`
5. **Test OAuth flow**: Visit `/ebay-connect` and click "Connect eBay Account"

## Resources

- [eBay OAuth Documentation](https://developer.ebay.com/api-docs/static/oauth-tokens.html)
- [Authorization Code Grant Flow](https://developer.ebay.com/api-docs/static/oauth-authorization-code-grant.html)
- [eBay Scopes Reference](https://developer.ebay.com/api-docs/static/oauth-scopes.html)

