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

    // Update the offer with new quantity (preserve all other fields)
    const updatePayload = {
      ...currentOffer,
      availableQuantity: newQuantity,
    }

    // Remove fields that shouldn't be in update request
    delete updatePayload.offerId
    delete updatePayload.listingId
    delete updatePayload.status
    delete updatePayload.marketplaceId // This is set in the URL path

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
      const errorData = await updateResponse.json().catch(() => ({}))
      return NextResponse.json(
        { error: `Failed to update inventory: ${updateResponse.status}`, details: errorData },
        { status: updateResponse.status }
      )
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

    return NextResponse.json({
      success: true,
      newQuantity: newQuantity,
      message: "Inventory increased and published successfully"
    })

  } catch (error) {
    console.error("Error increasing inventory:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

