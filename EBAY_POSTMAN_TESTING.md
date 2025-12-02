# eBay API Postman Testing Guide

## Overview
This guide provides the exact API endpoints and payloads used when clicking "List on eBay" button.

## Prerequisites

### 1. Get Your Access Token
You need a valid eBay access token. Get it from your database:

```sql
SELECT accessToken, refreshToken, expiresAt FROM "EbayToken" WHERE "userId" = 'YOUR_USER_ID';
```

Or check your application logs when listing a product.

### 2. Environment Variables
- **Sandbox Base URL**: `https://api.sandbox.ebay.com`
- **Production Base URL**: `https://api.ebay.com`
- **Current Environment**: Check your `.env` file for `EBAY_SANDBOX=true` or `false`

---

## API Calls Sequence

### Step 1: Create Inventory Item

**Endpoint:**
```
POST {baseUrl}/sell/inventory/v1/inventory_item
```

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN_HERE",
  "Content-Type": "application/json",
  "X-EBAY-C-MARKETPLACE-ID": "EBAY_US"
}
```

**Body (Example):**
```json
{
  "sku": "SKU-1",
  "condition": "NEW",
  "product": {
    "title": "Brand New PlayStation 5 Console",
    "description": "Brand new PS5 console in sealed box",
    "imageUrls": ["https://example.com/image.jpg"]
  }
}
```

**Response (Success):**
```json
{
  "sku": "SKU-1",
  "locale": "en_US",
  "product": {
    "title": "Brand New PlayStation 5 Console",
    "description": "Brand new PS5 console in sealed box",
    "imageUrls": ["https://example.com/image.jpg"]
  },
  "condition": "NEW"
}
```

---

### Step 2: Get Business Policies (Optional)

**Endpoint:**
```
GET {baseUrl}/sell/account/v1/fulfillment_policy
```

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN_HERE",
  "Content-Type": "application/json",
  "X-EBAY-C-MARKETPLACE-ID": "EBAY_US"
}
```

**Response (Success):**
```json
{
  "fulfillmentPolicies": [
    {
      "fulfillmentPolicyId": "123456789",
      "name": "Standard Shipping",
      "marketplaceId": "EBAY_US"
    }
  ]
}
```

---

### Step 3: Create Offer

**Endpoint:**
```
POST {baseUrl}/sell/inventory/v1/offer
```

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN_HERE",
  "Content-Type": "application/json",
  "X-EBAY-C-MARKETPLACE-ID": "EBAY_US"
}
```

**Body (Example):**
```json
{
  "sku": "SKU-1",
  "marketplaceId": "EBAY_US",
  "format": "FIXED_PRICE",
  "listingDescription": "Brand new PS5 console in sealed box. Never opened. Ships fast!",
  "pricingSummary": {
    "price": {
      "value": "499.99",
      "currency": "USD"
    }
  },
  "categoryId": "267",
  "quantity": 1,
  "listingPolicies": {
    "fulfillmentPolicyId": "YOUR_FULFILLMENT_POLICY_ID",
    "paymentPolicyId": "YOUR_PAYMENT_POLICY_ID",
    "returnPolicyId": "YOUR_RETURN_POLICY_ID"
  }
}
```

**Response (Success):**
```json
{
  "offerId": "987654321",
  "sku": "SKU-1",
  "marketplaceId": "EBAY_US",
  "format": "FIXED_PRICE",
  "listingDescription": "Brand new PS5 console in sealed box. Never opened. Ships fast!",
  "pricingSummary": {
    "price": {
      "value": "499.99",
      "currency": "USD"
    }
  },
  "categoryId": "267",
  "quantity": 1,
  "status": "UNPUBLISHED"
}
```

---

### Step 4: Publish Offer

**Endpoint:**
```
POST {baseUrl}/sell/inventory/v1/offer/{offerId}/publish
```

Replace `{offerId}` with the offer ID from Step 3.

**Headers:**
```json
{
  "Authorization": "Bearer YOUR_ACCESS_TOKEN_HERE",
  "Content-Type": "application/json",
  "X-EBAY-C-MARKETPLACE-ID": "EBAY_US"
}
```

**Body:**
```json
{}
```
(Empty body, but still required)

**Response (Success):**
```json
{
  "offerId": "987654321",
  "listingId": "123456789012",
  "statusCode": 200,
  "warnings": []
}
```

---

## Common Errors

### Error 2004 - Missing Scopes
```json
{
  "errors": [
    {
      "errorId": 2004,
      "domain": "OAuth",
      "category": "APPLICATION",
      "message": "Insufficient permissions to fulfill the request.",
      "longMessage": "The access token provided does not have permissions to fulfill the request."
    }
  ]
}
```

**Solution:** Reconnect with correct scopes: `https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.inventory`

### Error 401 - Invalid/Expired Token
```json
{
  "errors": [
    {
      "errorId": 1001,
      "domain": "OAuth",
      "category": "APPLICATION",
      "message": "Invalid access token."
    }
  ]
}
```

**Solution:** Refresh your access token using the refresh token.

---

## Condition Values Mapping

```
"Brand New" → "NEW"
"New Other" → "NEW_OTHER"
"New with Defects" → "NEW_WITH_DEFECTS"
"Manufacturer Refurbished" → "MANUFACTURER_REFURBISHED"
"Seller Refurbished" → "SELLER_REFURBISHED"
"Used - Excellent" → "USED_EXCELLENT"
"Used - Very Good" → "USED_VERY_GOOD"
"Used - Good" → "USED_GOOD"
"Used - Acceptable" → "USED_ACCEPTABLE"
"For Parts or Not Working" → "FOR_PARTS_OR_NOT_WORKING"
```

---

## Testing with Postman

1. **Create a new collection** called "eBay Inventory API"
2. **Add environment variables**:
   - `baseUrl`: `https://api.sandbox.ebay.com` or `https://api.ebay.com`
   - `accessToken`: Your token from database
   - `sku`: `TEST-SKU-1`
   
3. **Run requests in order**: 
   - Create Inventory Item → Create Offer → Publish Offer

4. **Check for errors** in the response body

---

## Quick Test Request

Here's a minimal working example for Step 1 (Create Inventory Item):

```bash
curl -X POST "https://api.sandbox.ebay.com/sell/inventory/v1/inventory_item" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-EBAY-C-MARKETPLACE-ID: EBAY_US" \
  -d '{
    "sku": "TEST-001",
    "condition": "NEW",
    "product": {
      "title": "Test Product",
      "description": "Test Description",
      "imageUrls": ["https://via.placeholder.com/500"]
    }
  }'
```

---

## Your Application's Internal API

**Your App Endpoint:**
```
POST http://localhost:3000/api/ebay/list
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "Cookie": "YOUR_SESSION_COOKIE"
}
```

**Body:**
```json
{
  "title": "Brand New PlayStation 5 Console",
  "description": "Brand new PS5 console in sealed box",
  "price": "499.99",
  "condition": "Brand New",
  "imageUrl": "https://example.com/image.jpg",
  "categoryId": "267"
}
```

**Note:** You need to be authenticated (have a valid session cookie) to call this endpoint.

---

## Need Your Actual Token?

Run this in your database to see your current token:

```sql
SELECT 
  "userId", 
  "accessToken", 
  LEFT("refreshToken", 20) || '...' as "refreshToken_preview",
  "expiresAt",
  CASE 
    WHEN "expiresAt" > NOW() THEN 'Valid'
    ELSE 'Expired'
  END as status
FROM "EbayToken";
```

Then use the `accessToken` value in your Postman requests.

