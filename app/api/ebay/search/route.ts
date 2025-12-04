import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    // Check if user is authenticated
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const upc = searchParams.get("upc")

    if (!upc) {
      return NextResponse.json(
        { error: "UPC code is required" },
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
        const errorData = await refreshResponse.json().catch(() => ({}))
        
        // If refresh token is invalid/expired, delete the token record
        // This forces the user to reconnect, which will get fresh tokens
        if (refreshResponse.status === 400 || refreshResponse.status === 401) {
          try {
            await prisma.ebayToken.delete({
              where: { userId: session.user.id }
            })
          } catch (deleteError) {
            // Failed to delete invalid token
          }
        }
        
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

    // Make request to eBay Browse API
    const isSandbox = process.env.EBAY_SANDBOX === "true"
    const browseApiUrl = isSandbox
      ? "https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search"
      : "https://api.ebay.com/buy/browse/v1/item_summary/search"

    const ebayResponse = await fetch(
      `${browseApiUrl}?q=${encodeURIComponent(upc)}&fieldgroups=EXTENDED`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US', // You can make this configurable
        }
      }
    )
    
    if (!ebayResponse.ok) {
      const errorData = await ebayResponse.json().catch(() => ({}))
      
      return NextResponse.json(
        { 
          error: errorData.errors?.[0]?.message || "Failed to search eBay",
          details: errorData
        },
        { status: ebayResponse.status }
      )
    }

    const data = await ebayResponse.json()
    
    // Check if we have any products
    if (!data.itemSummaries || data.itemSummaries.length === 0) {
      return NextResponse.json(
        { error: "No products found for this UPC code" },
        { status: 404 }
      )
    }
    
    // Get first 10 items for mean price calculation
    const itemsForMean = data.itemSummaries.slice(0, 10)
    
    // Calculate mean price from first 10 items (filter out items without valid prices)
    const prices = itemsForMean
      .filter((item: any) => item.price?.value)
      .map((item: any) => parseFloat(item.price.value))
    
    const meanPrice = prices.length > 0
      ? (prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length).toFixed(2)
      : "0.00"
    
    // Use first product but with mean price
    const product = {
      ...data.itemSummaries[0],
      price: {
        ...data.itemSummaries[0].price,
        value: meanPrice,
        currency: data.itemSummaries[0].price?.currency || "USD"
      }
    }
    
    // Add metadata about the search for debugging
    const responseData = {
      ...product,
      _searchMetadata: {
        totalResults: data.itemSummaries.length,
        itemsUsedForMean: prices.length,
        isMeanPrice: true,
        originalPrice: data.itemSummaries[0].price?.value,
        meanPrice: meanPrice,
        searchQuery: upc
      }
    }

    return NextResponse.json(responseData)
  } catch (error) {
    return NextResponse.json(
      { error: "Something went wrong", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

