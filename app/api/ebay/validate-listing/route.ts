import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET: Validate listing requirements before attempting to list
 * Checks required item specifics for the category
 */
export async function GET(req: Request) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get("categoryId")
    const aspects = searchParams.get("aspects") // JSON string of current aspects

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
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

    // Check if token is expired and refresh if necessary
    let accessToken = ebayToken.accessToken
    if (new Date() >= ebayToken.expiresAt) {
      if (!ebayToken.refreshToken) {
        return NextResponse.json(
          { error: "eBay token expired. Please reconnect your eBay account." },
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
          { error: "Failed to refresh eBay token. Please reconnect your eBay account." },
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

    // Fetch required item aspects for this category using Taxonomy API
    const isSandbox = process.env.EBAY_SANDBOX === "true"
    const baseUrl = isSandbox
      ? "https://api.sandbox.ebay.com"
      : "https://api.ebay.com"
    
    const taxonomyUrl = `${baseUrl}/sell/taxonomy/v1/category_tree/0/get_item_aspects_for_category?category_id=${categoryId}`
    
    console.log("Fetching required aspects for category:", categoryId)
    
    const taxonomyResponse = await fetch(taxonomyUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      },
    })

    if (!taxonomyResponse.ok) {
      const errorData = await taxonomyResponse.json().catch(() => ({}))
      console.error("Taxonomy API error:", errorData)
      
      // If taxonomy API fails, return what we can
      return NextResponse.json({
        valid: false,
        error: "Could not fetch category requirements",
        details: errorData,
        // Still return empty arrays so frontend can proceed
        requiredAspects: [],
        missingAspects: [],
        currentAspects: {}
      })
    }

    const taxonomyData = await taxonomyResponse.json()
    
    // Parse current aspects if provided
    let currentAspects: any = {}
    try {
      if (aspects) {
        currentAspects = JSON.parse(aspects)
      }
    } catch (e) {
      console.warn("Could not parse aspects:", e)
    }

    // Extract required aspects from taxonomy response
    const requiredAspects: string[] = []
    const aspectDefinitions = taxonomyData.aspects || []
    
    aspectDefinitions.forEach((aspect: any) => {
      // Check if aspect is required
      if (aspect.aspectConstraint?.aspectRequired === true) {
        requiredAspects.push(aspect.localizedAspectName || aspect.aspectName)
      }
    })

    // Check which required aspects are missing
    const missingAspects: string[] = []
    const aspectKeys = Object.keys(currentAspects).map(k => k.toLowerCase())
    
    requiredAspects.forEach((requiredAspect: string) => {
      const aspectKey = requiredAspect.toLowerCase()
      const hasAspect = aspectKeys.some(key => 
        key === aspectKey || 
        key.includes(aspectKey) || 
        aspectKey.includes(key)
      )
      
      if (!hasAspect) {
        missingAspects.push(requiredAspect)
      }
    })

    // Also check if aspects have values (not just keys)
    Object.keys(currentAspects).forEach((key: string) => {
      const values = currentAspects[key]
      if (Array.isArray(values) && values.length === 0) {
        const requiredKey = requiredAspects.find(req => 
          req.toLowerCase() === key.toLowerCase()
        )
        if (requiredKey && !missingAspects.includes(requiredKey)) {
          missingAspects.push(requiredKey)
        }
      }
    })

    console.log("Validation results:", {
      categoryId,
      requiredAspects,
      missingAspects,
      currentAspectKeys: Object.keys(currentAspects)
    })

    return NextResponse.json({
      valid: missingAspects.length === 0,
      categoryId,
      requiredAspects,
      missingAspects,
      currentAspects,
      aspectDefinitions: aspectDefinitions.map((a: any) => ({
        name: a.localizedAspectName || a.aspectName,
        required: a.aspectConstraint?.aspectRequired === true,
        values: a.aspectValues?.map((v: any) => v.localizedValue || v.value) || []
      }))
    })
  } catch (error) {
    console.error("Error validating listing:", error)
    return NextResponse.json(
      { 
        error: "Failed to validate listing requirements",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

