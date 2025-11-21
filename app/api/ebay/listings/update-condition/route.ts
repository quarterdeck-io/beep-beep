import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { getEbayAccessToken, getEbayApiBaseUrl } from "@/lib/ebay-api"
import { getConditionByValue } from "@/lib/ebay-conditions"

/**
 * Update condition of an existing eBay listing
 * Production API: https://api.ebay.com/sell/inventory/v1/offer/{offerId}
 */
export async function PUT(req: Request) {
  try {
    // Check if user is authenticated
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const {
      offerId,
      condition,
      marketplaceId = "EBAY_US"
    } = body

    if (!offerId) {
      return NextResponse.json(
        { error: "Offer ID is required" },
        { status: 400 }
      )
    }

    if (!condition) {
      return NextResponse.json(
        { error: "Condition is required" },
        { status: 400 }
      )
    }

    // Validate condition
    const conditionData = getConditionByValue(condition)
    if (!conditionData) {
      return NextResponse.json(
        { error: "Invalid condition value. Valid values: NEW, NEW_OTHER, NEW_WITH_DEFECTS, MANUFACTURER_REFURBISHED, SELLER_REFURBISHED, USED_EXCELLENT, USED_VERY_GOOD, USED_GOOD, USED_ACCEPTABLE, FOR_PARTS_OR_NOT_WORKING" },
        { status: 400 }
      )
    }

    // Get access token
    const accessToken = await getEbayAccessToken(session.user.id)
    const apiBaseUrl = getEbayApiBaseUrl()

    // First, get the existing offer to preserve all other fields
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
          error: errorData.errors?.[0]?.message || "Failed to fetch existing listing",
          details: errorData.errors || errorData
        },
        { status: getResponse.status }
      )
    }

    const existingOffer = await getResponse.json()

    // Update only the condition fields
    const updatePayload = {
      ...existingOffer,
      product: {
        ...existingOffer.product,
        condition: conditionData.value,
        conditionId: conditionData.conditionId,
        aspects: {
          ...(existingOffer.product?.aspects || {}),
          Condition: [conditionData.label]
        }
      }
    }

    // Update the offer
    const updateOfferUrl = `${apiBaseUrl}/sell/inventory/v1/offer/${offerId}`
    const updateResponse = await fetch(updateOfferUrl, {
      method: "PUT",
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-EBAY-C-MARKETPLACE-ID': marketplaceId,
      },
      body: JSON.stringify(updatePayload)
    })

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({}))
      
      return NextResponse.json(
        { 
          error: errorData.errors?.[0]?.message || "Failed to update condition",
          details: errorData.errors || errorData
        },
        { status: updateResponse.status }
      )
    }

    const updatedData = await updateResponse.json()

    return NextResponse.json({
      success: true,
      offerId: updatedData.offerId,
      condition: conditionData.value,
      conditionLabel: conditionData.label,
      message: `Condition updated to "${conditionData.label}" successfully`,
      data: updatedData
    })

  } catch (error) {
    console.error("Error updating condition:", error)
    return NextResponse.json(
      { 
        error: "Something went wrong", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}

