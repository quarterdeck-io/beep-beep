# How to Change Condition in eBay API (Production)

## Overview

This guide explains how to update the condition of an existing eBay listing using the eBay Inventory API in production.

## API Endpoints

### 1. Get Listing Details
**GET** `/api/ebay/listings/get?offerId={offerId}`

Retrieves the current listing details including condition.

**Example:**
```bash
curl -X GET "http://localhost:3000/api/ebay/listings/get?offerId=123456789" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "offerId": "123456789",
    "product": {
      "condition": "NEW",
      "conditionId": "1000",
      "title": "Product Title",
      ...
    }
  },
  "condition": "NEW",
  "conditionId": "1000"
}
```

### 2. Update Condition
**PUT** `/api/ebay/listings/update-condition`

Updates the condition of an existing listing.

**Request Body:**
```json
{
  "offerId": "123456789",
  "condition": "USED_GOOD",
  "marketplaceId": "EBAY_US"
}
```

**Example:**
```bash
curl -X PUT "http://localhost:3000/api/ebay/listings/update-condition" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "offerId": "123456789",
    "condition": "USED_GOOD"
  }'
```

**Response:**
```json
{
  "success": true,
  "offerId": "123456789",
  "condition": "USED_GOOD",
  "conditionLabel": "Used - Good",
  "message": "Condition updated to \"Used - Good\" successfully"
}
```

## Available Condition Values

| Value | Label | Condition ID | Description |
|-------|-------|--------------|-------------|
| `NEW` | Brand New | 1000 | A brand-new, unused, unopened item |
| `NEW_OTHER` | New Other | 1500 | New item missing original packaging |
| `NEW_WITH_DEFECTS` | New with Defects | 1750 | New item with defects |
| `MANUFACTURER_REFURBISHED` | Manufacturer Refurbished | 2000 | Restored by manufacturer |
| `SELLER_REFURBISHED` | Seller Refurbished | 2500 | Restored by seller |
| `USED_EXCELLENT` | Used - Excellent | 3000 | Used in excellent condition |
| `USED_VERY_GOOD` | Used - Very Good | 4000 | Used in very good condition |
| `USED_GOOD` | Used - Good | 5000 | Used in good condition |
| `USED_ACCEPTABLE` | Used - Acceptable | 6000 | Used with wear but functional |
| `FOR_PARTS_OR_NOT_WORKING` | For Parts or Not Working | 7000 | Not functioning or missing parts |

## How It Works

1. **Get Current Listing**: First, fetch the existing listing to preserve all other fields
2. **Update Condition**: Modify only the condition-related fields:
   - `product.condition` - The condition value (e.g., "NEW", "USED_GOOD")
   - `product.conditionId` - The condition ID (e.g., "1000", "5000")
   - `product.aspects.Condition` - The condition label for display
3. **Send Update**: Send the updated payload to eBay Inventory API

## eBay API Endpoint

The update uses eBay's Inventory API:
- **Production**: `PUT https://api.ebay.com/sell/inventory/v1/offer/{offerId}`
- **Sandbox**: `PUT https://api.sandbox.ebay.com/sell/inventory/v1/offer/{offerId}`

## Required OAuth Scopes

To update listings, you need:
- `https://api.ebay.com/oauth/api_scope/sell.inventory` - Full inventory management
- Or `https://api.ebay.com/oauth/api_scope/sell.inventory.readonly` - Read-only (won't work for updates)

## JavaScript/TypeScript Example

```typescript
// Update condition
async function updateCondition(offerId: string, condition: string) {
  const response = await fetch('/api/ebay/listings/update-condition', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      offerId,
      condition, // e.g., "USED_GOOD"
    }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Failed to update condition');
  }

  return data;
}

// Usage
await updateCondition('123456789', 'USED_GOOD');
```

## Important Notes

1. **Offer ID Required**: You need the `offerId` from your listing, not the `listingId`
2. **Category Restrictions**: Some categories may not support all condition values
3. **Active Listings**: If the listing is already published, you may need to end it first, update, then relist
4. **Validation**: eBay validates the condition against category requirements
5. **Production Only**: This implementation uses production eBay API endpoints

## Error Handling

Common errors:
- `400 Bad Request`: Invalid condition value or offer ID
- `401 Unauthorized`: Token expired or invalid
- `404 Not Found`: Offer ID doesn't exist
- `409 Conflict`: Listing is in a state that prevents updates

## Testing

1. Get a valid `offerId` from one of your listings
2. Call the get endpoint to see current condition
3. Update the condition using a valid condition value
4. Verify the change by getting the listing again

