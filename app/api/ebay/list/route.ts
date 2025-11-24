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

    const body = await req.json()
    const { title, description, price, condition, imageUrl, categoryId } = body

    // Validate required fields
    if (!title || !description || !price || !condition) {
      return NextResponse.json(
        { error: "Missing required fields: title, description, price, and condition are required" },
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

    // Step 1: Create an inventory item
    const inventoryItemPayload = {
      product: {
        title: title.substring(0, 80), // eBay title limit is 80 characters
        description: description,
        imageUrls: imageUrl ? [imageUrl] : [],
        aspects: {},
      },
      condition: mapConditionToEbay(condition),
    }

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
      return NextResponse.json(
        { 
          error: errorData.errors?.[0]?.message || "Failed to create inventory item",
          details: errorData
        },
        { status: inventoryResponse.status }
      )
    }

    const inventoryData = await inventoryResponse.json()
    const sku = inventoryData.sku || `SKU-${Date.now()}`

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
    const offerPayload: any = {
      sku: sku,
      marketplaceId: "EBAY_US",
      format: "FIXED_PRICE",
      listingDescription: description,
      pricingSummary: {
        price: {
          value: parseFloat(price).toFixed(2),
          currency: "USD",
        },
      },
      categoryId: categoryId || "267",
      quantity: 1,
    }

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
        await fetch(`${baseUrl}/sell/inventory/v1/inventory_item/${sku}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        })
      } catch (cleanupError) {
        // Ignore cleanup errors
      }

      return NextResponse.json(
        { 
          error: errorData.errors?.[0]?.message || "Failed to create offer",
          details: errorData,
          hint: "You may need to set up fulfillment, payment, and return policies in your eBay account first."
        },
        { status: offerResponse.status }
      )
    }

    const offerData = await offerResponse.json()
    const offerId = offerData.offerId

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
      return NextResponse.json(
        { 
          error: errorData.errors?.[0]?.message || "Failed to publish listing",
          details: errorData,
          offerId: offerId,
          hint: "Offer created but not published. You can publish it manually from your eBay account."
        },
        { status: publishResponse.status }
      )
    }

    const publishData = await publishResponse.json()

    return NextResponse.json({
      success: true,
      message: "Product listed successfully on eBay",
      listingId: publishData.listingId,
      offerId: offerId,
      sku: sku,
      listingUrl: `https://www.ebay.com/itm/${publishData.listingId}`,
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: "Something went wrong", 
        details: error instanceof Error ? error.message : "Unknown error" 
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

