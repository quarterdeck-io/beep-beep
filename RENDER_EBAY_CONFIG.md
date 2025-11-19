# Render.com - eBay OAuth Configuration

## 🔧 Environment Variables to Add on Render

After you push this code to GitHub and it deploys to Render, you need to add these environment variables in your Render dashboard.

### Steps:

1. Go to: https://dashboard.render.com
2. Select your **beep-beep** service
3. Click **Environment** in the left sidebar
4. Add the following environment variables:

### eBay Configuration Variables:

```bash
EBAY_SANDBOX="true"
EBAY_CLIENT_ID="your-ebay-app-id-client-id"
EBAY_CLIENT_SECRET="your-ebay-cert-id-client-secret"
EBAY_RUNAME="your-ebay-runame-from-user-tokens"
EBAY_SCOPE="https://api.ebay.com/oauth/api_scope"
```

**Note:** Replace the placeholder values with your actual credentials from the eBay Developer Portal.

### Important Notes:

- **EBAY_SANDBOX**: Set to `"true"` for testing with sandbox credentials
- **EBAY_CLIENT_ID**: Your eBay App ID (Client ID) from eBay Developer Portal
- **EBAY_CLIENT_SECRET**: Your eBay Cert ID (Client Secret) from eBay Developer Portal
- **EBAY_RUNAME**: Your registered RuName from eBay User Tokens settings
- **EBAY_SCOPE**: OAuth scopes - default scope for browsing/searching products

### eBay Developer Portal Configuration:

Make sure you've configured in eBay Developer Portal:

**Your auth accepted URL:**
```
https://beep-beep-erxw.onrender.com/api/ebay/callback
```

**Your auth declined URL:** (Optional)
```
https://beep-beep-erxw.onrender.com/ebay-connect?error=oauth_declined
```

### After Adding Variables:

1. Click **Save Changes** in Render
2. Render will automatically redeploy your application
3. Once deployment is complete, test the OAuth flow at:
   - https://beep-beep-erxw.onrender.com/ebay-connect

### Testing:

1. Visit: https://beep-beep-erxw.onrender.com
2. Log in to your account
3. Go to: https://beep-beep-erxw.onrender.com/ebay-connect
4. Click **"Connect eBay Account"**
5. You should be redirected to eBay's authorization page
6. After authorizing, you'll be redirected back with a success message

## 🔄 Switching to Production

When you're ready to use production eBay credentials:

1. Get your **Production** keys from eBay Developer Portal
2. Create a new RuName for production environment
3. Update these variables in Render:
   - `EBAY_SANDBOX="false"`
   - `EBAY_CLIENT_ID="your-production-client-id"`
   - `EBAY_CLIENT_SECRET="your-production-client-secret"`
   - `EBAY_RUNAME="your-production-runame"`

## 📚 Resources

- [eBay Developer Portal](https://developer.ebay.com)
- [eBay OAuth Documentation](https://developer.ebay.com/api-docs/static/oauth-tokens.html)
- [Render Dashboard](https://dashboard.render.com)

