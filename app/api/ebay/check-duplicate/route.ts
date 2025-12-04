import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

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
    const upc = searchParams.get("upc")

    if (!upc) {
      return NextResponse.json(
        { error: "UPC code is required" },
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

    // Get all inventory items from the user's eBay account
    const inventoryUrl = `${baseUrl}/sell/inventory/v1/inventory_item`
    
    console.log("Checking for duplicate UPC:", upc)
    
    const inventoryResponse = await fetch(inventoryUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      },
    })

    if (!inventoryResponse.ok) {
      console.error("Failed to fetch inventory items:", inventoryResponse.status)
      // If we can't check, return no duplicate (don't block the user)
      return NextResponse.json({
        isDuplicate: false,
        existingSku: null,
        upc: upc
      })
    }

    const inventoryData = await inventoryResponse.json()
    const inventoryItems = inventoryData.inventoryItems || []

    console.log(`Found ${inventoryItems.length} inventory items, checking for UPC match...`)

    // Check each inventory item for matching UPC
    for (const item of inventoryItems) {
      const productUPCs = item.product?.upc || []
      
      // Check if this item has the same UPC
      if (productUPCs.includes(upc)) {
        console.log("DUPLICATE FOUND! SKU:", item.sku, "UPC:", upc)
        return NextResponse.json({
          isDuplicate: true,
          existingSku: item.sku,
          upc: upc,
          productTitle: item.product?.title || "Unknown product"
        })
      }
    }

    console.log("No duplicate found for UPC:", upc)
    return NextResponse.json({
      isDuplicate: false,
      existingSku: null,
      upc: upc
    })

  } catch (error) {
    console.error("Error checking for duplicate:", error)
    // On error, return no duplicate (don't block the user)
    return NextResponse.json({
      isDuplicate: false,
      existingSku: null,
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}

