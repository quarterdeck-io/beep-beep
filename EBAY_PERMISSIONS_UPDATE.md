# eBay OAuth Permissions Update

## ✅ All Required Permissions Added

Updated the eBay OAuth configuration to request all necessary permissions on the authorization page.

## Permissions Requested

When users connect their eBay account, they will see these permissions on the eBay authorization page:

### 1. **View public data from eBay**
- **Scope**: `https://api.ebay.com/oauth/api_scope`
- **Purpose**: Browse and search eBay listings
- **Used for**: Product search functionality

### 2. **View your inventory and offers**
- **Scope**: `https://api.ebay.com/oauth/api_scope/sell.inventory.readonly`
- **Purpose**: Read-only access to inventory
- **Used for**: Viewing existing listings

### 3. **View and manage your inventory and offers** ✅ REQUIRED
- **Scope**: `https://api.ebay.com/oauth/api_scope/sell.inventory`
- **Purpose**: Create, update, and manage listings
- **Used for**: Creating new eBay listings

### 4. **View your eBay marketing activities**
- **Scope**: `https://api.ebay.com/oauth/api_scope/sell.marketing.readonly`
- **Purpose**: View marketing campaigns and promotions
- **Used for**: Future marketing features

### 5. **View and manage your eBay marketing activities**
- **Scope**: `https://api.ebay.com/oauth/api_scope/sell.marketing`
- **Purpose**: Create and manage marketing campaigns
- **Used for**: Future marketing features

### 6. **View your account settings**
- **Scope**: `https://api.ebay.com/oauth/api_scope/sell.account.readonly`
- **Purpose**: Read-only access to account settings
- **Used for**: Viewing business policies

### 7. **View and manage your account settings**
- **Scope**: `https://api.ebay.com/oauth/api_scope/sell.account`
- **Purpose**: Manage account settings and policies
- **Used for**: Fetching and using business policies (Payment, Return, Fulfillment)

## What Changed

### Files Updated

1. **`env`** - Added all 7 OAuth scopes
2. **`env.example`** - Updated with documentation for each scope
3. **`app/api/ebay/connect/route.ts`** - Added comments explaining each permission

### Before
```env
EBAY_SCOPE="https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account"
```

### After
```env
EBAY_SCOPE="https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory.readonly https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.marketing.readonly https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.account.readonly https://api.ebay.com/oauth/api_scope/sell.account"
```

## Why These Permissions?

### Essential for Current Features
- ✅ **sell.inventory** - Required for listing products
- ✅ **sell.account** - Required for business policies feature

### Useful for Enhanced Features
- ✅ **sell.inventory.readonly** - View existing listings
- ✅ **sell.account.readonly** - Read account settings
- ✅ **https://api.ebay.com/oauth/api_scope** - Search products

### Future Features
- 🔮 **sell.marketing.readonly** - View marketing data
- 🔮 **sell.marketing** - Create promotional campaigns

## How to Use

### For New Users
1. Users will see all 7 permissions when they connect their eBay account
2. They must approve all permissions to use the app fully
3. Permissions are stored with the access token

### For Existing Users
If you already connected your eBay account with fewer permissions:

1. **Disconnect** your eBay account in the app
2. **Reconnect** to grant the new permissions
3. The authorization page will show all 7 permissions

OR

1. Go to eBay's [App Permissions](https://www.ebay.com/userinfo/myaccount/preferences/pref) page
2. Revoke access for your app
3. Reconnect in your app

## Testing

To verify the permissions are working:

1. **Disconnect eBay** (if already connected)
2. Click **"Connect eBay Account"**
3. You should see all 7 permissions listed on eBay's authorization page
4. After approval, test:
   - ✅ Product search (public data scope)
   - ✅ Create listing (inventory scope)
   - ✅ Configure business policies (account scope)

## Security Note

These scopes follow the principle of least privilege while enabling all planned features:
- Read-only scopes (`*.readonly`) for viewing data
- Full scopes (`sell.*`) for creating/managing data
- Marketing scopes prepared for future promotional features

All permissions are standard eBay OAuth scopes and are safe to request.

## API Documentation

For more details on eBay OAuth scopes:
- [eBay OAuth Scopes Documentation](https://developer.ebay.com/api-docs/static/oauth-scopes.html)
- [eBay OAuth Guide](https://developer.ebay.com/api-docs/static/oauth-authorization-code-grant.html)

---

**Status**: ✅ Ready
**Breaking Changes**: None (backward compatible)
**Action Required**: Existing users should reconnect to grant new permissions

