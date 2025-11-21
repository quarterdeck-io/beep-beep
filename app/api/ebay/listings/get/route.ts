import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getEbayAccessToken, getEbayApiBaseUrl } from "@/lib/ebay-api"

/**
 * Get an existing eBay listing by offer ID
 * Production API: https://api.ebay.com/sell/inventory/v1/offer/{offerId}
 */
export async function GET(req: Request) {
  try {
    // Check if user is authenticated
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const offerId = searchParams.get("offerId")
    const marketplaceId = searchParams.get("marketplaceId") || "EBAY_US"

    if (!offerId) {
      return NextResponse.json(
        { error: "Offer ID is required" },
        { status: 400 }
      )
    }

    // Get access token
    const accessToken = await getEbayAccessToken(session.user.id)
    const apiBaseUrl = getEbayApiBaseUrl()

    // Get the offer
    const getOfferUrl = `${apiBaseUrl}/sell/inventory/v1/offer/${offerId}`
    const getResponse = await fetch(getOfferUrl, {
      method: "GET",
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-EBAY-C-MARKETPLACE-ID': marketplaceId,
      }
    })

    if (!getResponse.ok) {
      const errorData = await getResponse.json().catch(() => ({}))
      return NextResponse.json(
        { 
          error: errorData.errors?.[0]?.message || "Failed to fetch listing",
          details: errorData.errors || errorData
        },
        { status: getResponse.status }
      )
    }

    const offerData = await getResponse.json()

    return NextResponse.json({
      success: true,
      data: offerData,
      condition: offerData.product?.condition,
      conditionId: offerData.product?.conditionId
    })

  } catch (error) {
    console.error("Error fetching listing:", error)
    return NextResponse.json(
      { 
        error: "Something went wrong", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}

