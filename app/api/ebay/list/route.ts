import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    // Check if user is authenticated
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    let body
    try {
      body = await req.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid request body. Could not parse JSON." },
        { status: 400 }
      )
    }

    let { title, description, price, condition, imageUrl, categoryId } = body

    // Validate and sanitize required fields
    const missingFields: string[] = []
    
    // Title validation
    if (!title || (typeof title === 'string' && title.trim().length === 0)) {
      missingFields.push("title")
    } else {
      title = title.trim()
    }
    
    // Description - provide default if empty
    if (!description || (typeof description === 'string' && description.trim().length === 0)) {
      description = "No description provided." // Provide a default description
    } else {
      description = description.trim()
    }
    
    // Price validation
    const priceNum = parseFloat(price)
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      missingFields.push("price (must be a valid number greater than 0)")
    }
    
    // Condition validation
    if (!condition || (typeof condition === 'string' && condition.trim().length === 0)) {
      missingFields.push("condition")
    } else {
      condition = condition.trim()
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: `Missing or invalid required fields: ${missingFields.join(", ")}`,
          received: { 
            title: title || null, 
            description: description || null, 
            price, 
            condition: condition || null 
          }
        },
        { status: 400 }
      )
    }

    // Get user's eBay access token from database
    const ebayToken = await prisma.ebayToken.findUnique({
      where: { userId: session.user.id }
    })
    
    if (!ebayToken) {
      return NextResponse.json(
        { error: "eBay account not connected. Please connect your eBay account first." },
        { status: 400 }
      )
    }

    // Check if token is expired and refresh if necessary
    let accessToken = ebayToken.accessToken
    if (new Date() >= ebayToken.expiresAt) {
      // Token is expired, try to refresh
      if (!ebayToken.refreshToken) {
        return NextResponse.json(
          { error: "eBay token expired. Please reconnect your eBay account." },
          { status: 401 }
        )
      }

      // Refresh the token
      const isSandbox = process.env.EBAY_SANDBOX === "true"
      const tokenEndpoint = isSandbox
        ? "https://api.sandbox.ebay.com/identity/v1/oauth2/token"
        : "https://api.ebay.com/identity/v1/oauth2/token"

      const refreshResponse = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(
            `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
          ).toString("base64")}`,
        },
        body: new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: ebayToken.refreshToken,
        }),
      })

      if (!refreshResponse.ok) {
        return NextResponse.json(
          { 
            error: "Failed to refresh eBay token. Please reconnect your eBay account.",
            needsReconnect: true
          },
          { status: 401 }
        )
      }

      const refreshData = await refreshResponse.json()
      accessToken = refreshData.access_token

      // Update token in database
      await prisma.ebayToken.update({
        where: { userId: session.user.id },
        data: {
          accessToken: refreshData.access_token,
          refreshToken: refreshData.refresh_token || ebayToken.refreshToken,
          expiresAt: new Date(Date.now() + (refreshData.expires_in * 1000)),
        },
      })
    }

    const isSandbox = process.env.EBAY_SANDBOX === "true"
    const baseUrl = isSandbox
      ? "https://api.sandbox.ebay.com"
      : "https://api.ebay.com"

    // Get or create SKU settings for the user
    let skuSettings: { nextSkuCounter: number; skuPrefix: string | null } = {
      nextSkuCounter: 1,
      skuPrefix: null,
    }
    let shouldIncrementCounter = false
    
    try {
      const existingSettings = await (prisma as any).skuSettings.findUnique({
        where: { userId: session.user.id }
      })

      if (existingSettings) {
        skuSettings = {
          nextSkuCounter: existingSettings.nextSkuCounter,
          skuPrefix: existingSettings.skuPrefix,
        }
        shouldIncrementCounter = true
      } else {
        // If no settings exist, create default ones
        try {
          const newSettings = await (prisma as any).skuSettings.create({
            data: {
              userId: session.user.id,
              nextSkuCounter: 1,
              skuPrefix: null,
            }
          })
          skuSettings = {
            nextSkuCounter: newSettings.nextSkuCounter,
            skuPrefix: newSettings.skuPrefix,
          }
          shouldIncrementCounter = true
        } catch (createError) {
          // If create fails, use defaults
          console.warn("Could not create SKU settings, using defaults:", createError)
        }
      }
    } catch (error) {
      // Fallback if Prisma Client types aren't updated yet
      console.warn("SKU settings not available, using default:", error)
    }

    // Generate SKU using user's settings
    const prefix = skuSettings.skuPrefix || "SKU"
    const sku = `${prefix}-${skuSettings.nextSkuCounter}`
    
    // Increment the counter for next time (we'll update it after successful listing)

    // Step 1: Create an inventory item
    // eBay requires SKU to be provided upfront
    // Note: eBay Inventory API may require product identifiers or a different structure
    // For now, we'll try a simpler approach that might work better
    const inventoryItemPayload: any = {
      sku: sku,
      condition: mapConditionToEbay(condition),
    }
    
    // Build product object - eBay requires at minimum a title
    const productObj: any = {
      title: title.substring(0, 80), // eBay title limit is 80 characters
    }
    
    // Add description if provided
    if (description && description.trim().length > 0 && description !== "No description") {
      productObj.description = description.substring(0, 50000)
    }
    
    // Add images if provided - eBay expects imageUrls array
    if (imageUrl && imageUrl.trim().length > 0) {
      productObj.imageUrls = [imageUrl]
    }
    
    inventoryItemPayload.product = productObj
    
    // Log the payload for debugging
    console.log("Creating inventory item with payload:", JSON.stringify(inventoryItemPayload, null, 2))

    const inventoryResponse = await fetch(
      `${baseUrl}/sell/inventory/v1/inventory_item`,
      {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
        body: JSON.stringify(inventoryItemPayload),
      }
    )

    if (!inventoryResponse.ok) {
      const errorData = await inventoryResponse.json().catch(() => ({}))
      const errorText = await inventoryResponse.text().catch(() => "")
      
      // Log full error for debugging
      console.error("eBay Inventory API Error:", {
        status: inventoryResponse.status,
        statusText: inventoryResponse.statusText,
        errorData,
        errorText,
        payload: inventoryItemPayload
      })
      
      const errorMessage = errorData.errors?.[0]?.message || errorData.errors?.[0]?.longMessage || errorData.message || "Failed to create inventory item"
      const errorCode = errorData.errors?.[0]?.errorId || errorData.errors?.[0]?.code
      
      // Provide more specific hints based on error code
      let hint = "Make sure your eBay account has selling privileges and the required permissions."
      
      if (errorCode === 2004) {
        hint = "Error 2004: Your OAuth token is missing the 'sell.inventory' scope. To fix this:\n1. Go to /ebay-connect page\n2. Click 'Disconnect & Revoke Access'\n3. Make sure EBAY_SCOPE environment variable includes: https://api.ebay.com/oauth/api_scope/sell.inventory\n4. Click 'Connect eBay Account' again to get a new token with correct scopes"
      } else if (errorMessage.includes("scope") || errorMessage.includes("permission")) {
        hint = "Your OAuth token is missing required scopes. Please:\n1. Disconnect your eBay account at /ebay-connect\n2. Verify EBAY_SCOPE includes: https://api.ebay.com/oauth/api_scope/sell.inventory\n3. Reconnect your eBay account"
      } else if (errorMessage.includes("seller") || errorMessage.includes("account")) {
        hint = "Your eBay seller account may not be fully set up. Please complete your seller registration on eBay first."
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          errorCode: errorCode,
          details: errorData,
          hint: hint
        },
        { status: inventoryResponse.status }
      )
    }

    const inventoryData = await inventoryResponse.json()
    // Use the SKU we provided, or fall back to the one from response
    const finalSku = inventoryData.sku || sku

    // Step 2: Try to get user's policies (optional - eBay may use defaults)
    let fulfillmentPolicyId = "default"
    let paymentPolicyId = "default"
    let returnPolicyId = "default"
    
    try {
      // Try to get the first available policy
      const policiesResponse = await fetch(
        `${baseUrl}/sell/account/v1/fulfillment_policy`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        }
      )
      
      if (policiesResponse.ok) {
        const policiesData = await policiesResponse.json()
        if (policiesData.fulfillmentPolicies && policiesData.fulfillmentPolicies.length > 0) {
          fulfillmentPolicyId = policiesData.fulfillmentPolicies[0].fulfillmentPolicyId
        }
      }
    } catch (policyError) {
      // Use defaults if policy fetch fails
    }

    // Step 3: Create an offer
    // Use a valid category ID - 267 is Movies & TV, but let's try to get a better one
    // If no categoryId provided, use a common default based on product type
    let finalCategoryId = categoryId
    if (!finalCategoryId || finalCategoryId === "") {
      // Default to Movies & TV category (267) - common for DVDs/Blu-rays
      finalCategoryId = "267"
    }
    
    const offerPayload: any = {
      sku: finalSku,
      marketplaceId: "EBAY_US",
      format: "FIXED_PRICE",
      listingDescription: description.substring(0, 50000), // eBay description limit
      pricingSummary: {
        price: {
          value: parseFloat(price).toFixed(2),
          currency: "USD",
        },
      },
      categoryId: finalCategoryId,
      quantity: 1,
    }
    
    console.log("Creating offer with payload:", JSON.stringify(offerPayload, null, 2))

    // Add listing policies if we have them
    if (fulfillmentPolicyId !== "default" || paymentPolicyId !== "default" || returnPolicyId !== "default") {
      offerPayload.listingPolicies = {
        fulfillmentPolicyId: fulfillmentPolicyId,
        paymentPolicyId: paymentPolicyId,
        returnPolicyId: returnPolicyId,
      }
    }

    const offerResponse = await fetch(
      `${baseUrl}/sell/inventory/v1/offer`,
      {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
        body: JSON.stringify(offerPayload),
      }
    )

    if (!offerResponse.ok) {
      const errorData = await offerResponse.json().catch(() => ({}))
      
      // If offer creation fails, try to clean up the inventory item
      try {
        await fetch(`${baseUrl}/sell/inventory/v1/inventory_item/${finalSku}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        })
      } catch (cleanupError) {
        // Ignore cleanup errors
      }

      const errorMessage = errorData.errors?.[0]?.message || errorData.errors?.[0]?.longMessage || "Failed to create offer"
      let hint = "You may need to set up fulfillment, payment, and return policies in your eBay account first."
      
      // Provide more specific hints based on error
      if (errorMessage.includes("policy") || errorMessage.includes("Policy")) {
        hint = "Please set up fulfillment, payment, and return policies in your eBay Seller Hub first."
      } else if (errorMessage.includes("category") || errorMessage.includes("Category")) {
        hint = "The category ID might be invalid. Please check the product category."
      } else if (errorMessage.includes("SKU") || errorMessage.includes("sku")) {
        hint = "There was an issue with the product SKU. Please try again."
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorData,
          hint: hint
        },
        { status: offerResponse.status }
      )
    }

    const offerData = await offerResponse.json()
    const offerId = offerData.offerId

    if (!offerId) {
      return NextResponse.json(
        { 
          error: "Offer created but no offer ID returned",
          details: offerData,
        },
        { status: 500 }
      )
    }

    // Step 4: Publish the offer
    const publishResponse = await fetch(
      `${baseUrl}/sell/inventory/v1/offer/${offerId}/publish`,
      {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
      }
    )

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json().catch(() => ({}))
      const errorMessage = errorData.errors?.[0]?.message || errorData.errors?.[0]?.longMessage || "Failed to publish listing"
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorData,
          offerId: offerId,
          hint: "Offer created but not published. You can publish it manually from your eBay Seller Hub."
        },
        { status: publishResponse.status }
      )
    }

    const publishData = await publishResponse.json()

    // Update SKU counter after successful listing
    if (shouldIncrementCounter) {
      try {
        await (prisma as any).skuSettings.update({
          where: { userId: session.user.id },
          data: {
            nextSkuCounter: skuSettings.nextSkuCounter + 1,
          }
        })
      } catch (error) {
        // Log error but don't fail the listing if counter update fails
        console.error("Failed to update SKU counter:", error)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Product listed successfully on eBay",
      listingId: publishData.listingId,
      offerId: offerId,
      sku: finalSku,
      listingUrl: `https://www.ebay.com/itm/${publishData.listingId}`,
    })
  } catch (error) {
    console.error("Error in eBay list endpoint:", error)
    return NextResponse.json(
      { 
        error: "Something went wrong", 
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// Helper function to map condition to eBay condition enum
function mapConditionToEbay(condition: string): string {
  const conditionMap: { [key: string]: string } = {
    "Brand New": "NEW",
    "New Other": "NEW_OTHER",
    "New with Defects": "NEW_WITH_DEFECTS",
    "Manufacturer Refurbished": "MANUFACTURER_REFURBISHED",
    "Seller Refurbished": "SELLER_REFURBISHED",
    "Used - Excellent": "USED_EXCELLENT",
    "Used - Very Good": "USED_VERY_GOOD",
    "Used - Good": "USED_GOOD",
    "Used - Acceptable": "USED_ACCEPTABLE",
    "For Parts or Not Working": "FOR_PARTS_OR_NOT_WORKING",
  }
  
  return conditionMap[condition] || "NEW"
}

