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

    // Normalize UPC for comparison (trim, remove leading zeros if needed)
    const normalizeUPC = (upcValue: string): string => {
      if (!upcValue) return ""
      return upcValue.trim().replace(/^0+/, "") || upcValue.trim() // Remove leading zeros but keep if all zeros
    }
    
    const normalizedSearchUPC = normalizeUPC(upc)
    console.log(`Checking for duplicate UPC. Original: "${upc}", Normalized: "${normalizedSearchUPC}"`)

    const inventoryData = await inventoryResponse.json()
    let inventoryItems = inventoryData.inventoryItems || []
    let next = inventoryData.next

    console.log(`Found ${inventoryItems.length} inventory items on first page, checking for UPC match...`)

    // Helper function to check if item has matching UPC
    const hasMatchingUPC = (item: any): boolean => {
      // Log item structure for debugging (only first item to avoid spam)
      if (inventoryItems.indexOf(item) === 0) {
        console.log("📦 Sample inventory item structure:", JSON.stringify({
          sku: item.sku,
          product: {
            title: item.product?.title,
            upc: item.product?.upc,
            gtin: item.product?.gtin,
            productIdentifiers: item.product?.productIdentifiers,
            hasProduct: !!item.product
          }
        }, null, 2))
      }
      
      // Check product.upc array
      const productUPCs = item.product?.upc || []
      if (Array.isArray(productUPCs) && productUPCs.length > 0) {
        console.log(`🔍 Checking product.upc array for SKU ${item.sku}:`, productUPCs)
        for (const itemUPC of productUPCs) {
          const normalizedItemUPC = normalizeUPC(String(itemUPC))
          if (normalizedItemUPC === normalizedSearchUPC || String(itemUPC).trim() === upc.trim()) {
            console.log(`✅ UPC match found in product.upc: "${itemUPC}" (normalized: "${normalizedItemUPC}") matches "${upc}" (normalized: "${normalizedSearchUPC}")`)
            return true
          }
        }
      }
      
      // Check productIdentifiers array (alternative location)
      const productIdentifiers = item.product?.productIdentifiers || []
      if (Array.isArray(productIdentifiers)) {
        for (const identifier of productIdentifiers) {
          if (identifier.type === "UPC" || identifier.type === "UPC_A" || identifier.type === "UPC_E") {
            const identifierValue = identifier.value || identifier.identifier
            if (identifierValue) {
              const normalizedIdentifierUPC = normalizeUPC(String(identifierValue))
              if (normalizedIdentifierUPC === normalizedSearchUPC || String(identifierValue).trim() === upc.trim()) {
                console.log(`UPC match found in productIdentifiers: "${identifierValue}" (normalized: "${normalizedIdentifierUPC}") matches "${upc}" (normalized: "${normalizedSearchUPC}")`)
                return true
              }
            }
          }
        }
      }
      
      // Check product.gtin (sometimes UPC is stored as GTIN)
      const gtin = item.product?.gtin
      if (gtin) {
        const normalizedGTIN = normalizeUPC(String(gtin))
        if (normalizedGTIN === normalizedSearchUPC || String(gtin).trim() === upc.trim()) {
          console.log(`UPC match found in product.gtin: "${gtin}" (normalized: "${normalizedGTIN}") matches "${upc}" (normalized: "${normalizedSearchUPC}")`)
          return true
        }
      }
      
      return false
    }

    // Check first page
    for (const item of inventoryItems) {
      if (hasMatchingUPC(item)) {
        console.log("✅ DUPLICATE FOUND! SKU:", item.sku, "UPC:", upc, "Product:", item.product?.title || "Unknown")
        return NextResponse.json({
          isDuplicate: true,
          existingSku: item.sku,
          upc: upc,
          productTitle: item.product?.title || "Unknown product"
        })
      }
    }

    // If there are more pages, check them too
    while (next) {
      console.log("Fetching next page of inventory items...")
      const nextResponse = await fetch(next, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
      })

      if (!nextResponse.ok) {
        console.warn("Failed to fetch next page of inventory items")
        break
      }

      const nextData = await nextResponse.json()
      inventoryItems = nextData.inventoryItems || []
      next = nextData.next

      // Check this page
      for (const item of inventoryItems) {
        if (hasMatchingUPC(item)) {
          console.log("✅ DUPLICATE FOUND on subsequent page! SKU:", item.sku, "UPC:", upc, "Product:", item.product?.title || "Unknown")
          return NextResponse.json({
            isDuplicate: true,
            existingSku: item.sku,
            upc: upc,
            productTitle: item.product?.title || "Unknown product"
          })
        }
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

