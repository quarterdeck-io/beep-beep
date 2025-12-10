import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { sku } = body

    if (!sku || typeof sku !== "string") {
      return NextResponse.json(
        { error: "SKU is required" },
        { status: 400 }
      )
    }

    // Get user's eBay access token
    const ebayToken = await prisma.ebayToken.findUnique({
      where: { userId: session.user.id }
    })
    
    if (!ebayToken) {
      return NextResponse.json(
        { error: "eBay account not connected" },
        { status: 400 }
      )
    }

    let accessToken = ebayToken.accessToken
    
    // Check if token is expired and refresh if necessary
    if (new Date() >= ebayToken.expiresAt) {
      if (!ebayToken.refreshToken) {
        return NextResponse.json(
          { error: "eBay token expired" },
          { status: 401 }
        )
      }

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
          { error: "Failed to refresh token" },
          { status: 401 }
        )
      }

      const refreshData = await refreshResponse.json()
      accessToken = refreshData.access_token

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

    // First, get the existing offer to find the offer ID
    // We need to search for offers by SKU
    const offersUrl = `${baseUrl}/sell/inventory/v1/offer?sku=${encodeURIComponent(sku)}&limit=1`
    
    const offersResponse = await fetch(offersUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Language': 'en-US',
        'Accept-Language': 'en-US',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      },
    })

    if (!offersResponse.ok) {
      const errorData = await offersResponse.json().catch(() => ({}))
      return NextResponse.json(
        { error: `Failed to find offer for SKU: ${offersResponse.status}`, details: errorData },
        { status: offersResponse.status }
      )
    }

    const offersData = await offersResponse.json()
    const offers = offersData.offers || []
    
    if (offers.length === 0) {
      return NextResponse.json(
        { error: "No active offer found for this SKU" },
        { status: 404 }
      )
    }

    const offer = offers[0]
    const offerId = offer.offerId
    const offerStatus = offer.status
    
    console.log(`[INVENTORY] Found offer - ID: ${offerId}, Status: ${offerStatus}`)
    
    if (!offerId) {
      return NextResponse.json(
        { error: "Offer ID not found" },
        { status: 404 }
      )
    }

    // Get the current offer details to preserve all fields
    const getOfferUrl = `${baseUrl}/sell/inventory/v1/offer/${offerId}`
    const getOfferResponse = await fetch(getOfferUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Language': 'en-US',
        'Accept-Language': 'en-US',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      },
    })

    if (!getOfferResponse.ok) {
      const errorData = await getOfferResponse.json().catch(() => ({}))
      return NextResponse.json(
        { error: `Failed to get offer details: ${getOfferResponse.status}`, details: errorData },
        { status: getOfferResponse.status }
      )
    }

    const currentOffer = await getOfferResponse.json()
    
    // Get current quantity and increase by 1
    const currentQuantity = currentOffer.availableQuantity || 1
    const newQuantity = currentQuantity + 1

    console.log(`[INVENTORY] Current quantity: ${currentQuantity}, New quantity: ${newQuantity}`)
    console.log(`[INVENTORY] Current offer structure:`, JSON.stringify(currentOffer, null, 2))

    // Build update payload with only the fields that can be updated
    // eBay requires specific fields for offer updates - must match the structure from GET
    const updatePayload: any = {
      sku: currentOffer.sku,
      marketplaceId: currentOffer.marketplaceId || "EBAY_US",
      format: currentOffer.format || "FIXED_PRICE",
      availableQuantity: newQuantity,
      listingDescription: currentOffer.listingDescription || "",
      listingDuration: currentOffer.listingDuration || "GTC",
      pricingSummary: currentOffer.pricingSummary,
      categoryId: currentOffer.categoryId,
    }

    // Add optional fields only if they exist in the original offer
    if (currentOffer.includeCatalogProductDetails !== undefined) {
      updatePayload.includeCatalogProductDetails = currentOffer.includeCatalogProductDetails
    }

    // Add listing policies if they exist
    if (currentOffer.listingPolicies) {
      updatePayload.listingPolicies = currentOffer.listingPolicies
    }

    // Add merchant location key if it exists (required for publishing)
    if (currentOffer.merchantLocationKey) {
      updatePayload.merchantLocationKey = currentOffer.merchantLocationKey
    }

    // Add aspects if they exist
    if (currentOffer.product) {
      updatePayload.product = currentOffer.product
    }

    console.log(`[INVENTORY] Update payload (keys only):`, Object.keys(updatePayload))
    console.log(`[INVENTORY] Update payload (full):`, JSON.stringify(updatePayload, null, 2))

    const updateUrl = `${baseUrl}/sell/inventory/v1/offer/${offerId}`
    const updateResponse = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Language': 'en-US',
        'Accept-Language': 'en-US',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      },
      body: JSON.stringify(updatePayload),
    })

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text().catch(() => "")
      let errorData = {}
      try {
        errorData = JSON.parse(errorText)
      } catch {
        errorData = { message: errorText }
      }
      console.error(`[INVENTORY] Failed to update offer:`, updateResponse.status, errorData)
      return NextResponse.json(
        { error: `Failed to update inventory: ${updateResponse.status}`, details: errorData },
        { status: updateResponse.status }
      )
    }

    // eBay returns 204 No Content on successful update, so no JSON to parse
    console.log(`[INVENTORY] ✅ Offer update successful (status: ${updateResponse.status})`)
    
    // Verify the update was successful by fetching the updated offer
    const verifyResponse = await fetch(getOfferUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Language': 'en-US',
        'Accept-Language': 'en-US',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      },
    })
    
    if (verifyResponse.ok) {
      const verifiedOffer = await verifyResponse.json()
      const verifiedQuantity = verifiedOffer.availableQuantity
      console.log(`[INVENTORY] Verified offer quantity after update:`, verifiedQuantity)
      if (verifiedQuantity !== newQuantity) {
        console.warn(`[INVENTORY] ⚠️ WARNING: Quantity mismatch! Expected ${newQuantity}, got ${verifiedQuantity}`)
        // Still continue to publish, but note the discrepancy
      } else {
        console.log(`[INVENTORY] ✅ Quantity verified: ${verifiedQuantity}`)
      }
    } else {
      console.warn(`[INVENTORY] ⚠️ Could not verify update (status: ${verifyResponse.status})`)
    }

    // Publish the updated offer
    const publishUrl = `${baseUrl}/sell/inventory/v1/offer/${offerId}/publish`
    const publishResponse = await fetch(publishUrl, {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Language': 'en-US',
        'Accept-Language': 'en-US',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      },
    })

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json().catch(() => ({}))
      console.error(`[INVENTORY] Failed to publish offer:`, publishResponse.status, errorData)
      // Even if publish fails, the quantity was updated
      return NextResponse.json(
        { 
          success: true,
          newQuantity: newQuantity,
          warning: "Inventory updated but failed to publish. You may need to publish manually.",
          details: errorData 
        },
        { status: 200 }
      )
    }

    const publishResult = await publishResponse.json().catch(() => ({}))
    console.log(`[INVENTORY] Publish response:`, publishResult)
    console.log(`[INVENTORY] ✅ Successfully increased inventory to ${newQuantity} and published`)

    return NextResponse.json({
      success: true,
      newQuantity: newQuantity,
      message: "Inventory increased and published successfully",
      listingId: publishResult.listingId || null
    })

  } catch (error) {
    console.error("Error increasing inventory:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

