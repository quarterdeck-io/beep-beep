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

    // Normalize UPC for comparison (trim, remove leading zeros if needed)
    const normalizeUPC = (upcValue: string): string => {
      if (!upcValue) return ""
      // Remove all non-digit characters, then remove leading zeros
      const digitsOnly = String(upcValue).replace(/\D/g, "")
      if (digitsOnly.length === 0) return ""
      // Remove leading zeros but keep at least one digit
      const normalized = digitsOnly.replace(/^0+/, "") || digitsOnly
      return normalized
    }
    
    const normalizedSearchUPC = normalizeUPC(upc)
    const originalUpcTrimmed = upc.trim()
    console.log(`🔍 Checking for duplicate UPC. Original: "${upc}", Trimmed: "${originalUpcTrimmed}", Normalized: "${normalizedSearchUPC}"`)

    // Get all inventory items from the user's eBay account
    const inventoryUrl = `${baseUrl}/sell/inventory/v1/inventory_item`
    
    console.log("📋 Fetching inventory items from:", inventoryUrl)
    
    const inventoryResponse = await fetch(inventoryUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      },
    })

    if (!inventoryResponse.ok) {
      const errorText = await inventoryResponse.text().catch(() => "Unknown error")
      console.error("❌ Failed to fetch inventory items:", inventoryResponse.status, errorText)
      // If we can't check, return no duplicate (don't block the user)
      return NextResponse.json({
        isDuplicate: false,
        existingSku: null,
        upc: upc,
        error: `Failed to fetch inventory: ${inventoryResponse.status}`
      })
    }

    const inventoryData = await inventoryResponse.json()
    let inventoryItems = inventoryData.inventoryItems || []
    let next = inventoryData.next

    console.log(`📦 Found ${inventoryItems.length} inventory items on first page, total items: ${inventoryData.total || 'unknown'}`)

    // Helper function to check if item has matching UPC
    // Note: The list endpoint may not return full product details, so we may need to fetch individual items
    const hasMatchingUPC = async (item: any): Promise<boolean> => {
      const sku = item.sku
      
      // Log item structure for debugging (only first item to avoid spam)
      if (inventoryItems.indexOf(item) === 0) {
        console.log("📦 Sample inventory item from list:", JSON.stringify({
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
      
      // First, check if the list response has product data
      let product = item.product
      
      // If product data is missing or incomplete, fetch the full item details
      if (!product || !product.upc) {
        try {
          console.log(`🔍 Fetching full details for SKU: ${sku}`)
          const itemUrl = `${baseUrl}/sell/inventory/v1/inventory_item/${sku}`
          const itemResponse = await fetch(itemUrl, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
            },
          })
          
          if (itemResponse.ok) {
            const itemData = await itemResponse.json()
            product = itemData.product
            console.log(`📦 Full item details for SKU ${sku}:`, JSON.stringify({
              upc: product?.upc,
              gtin: product?.gtin,
              productIdentifiers: product?.productIdentifiers
            }, null, 2))
          } else {
            console.warn(`⚠️ Failed to fetch full details for SKU ${sku}:`, itemResponse.status)
          }
        } catch (fetchError) {
          console.warn(`⚠️ Error fetching full details for SKU ${sku}:`, fetchError)
        }
      }
      
      if (!product) {
        return false
      }
      
      // Check product.upc array
      const productUPCs = product.upc || []
      if (Array.isArray(productUPCs) && productUPCs.length > 0) {
        for (const itemUPC of productUPCs) {
          const itemUPCStr = String(itemUPC).trim()
          const normalizedItemUPC = normalizeUPC(itemUPCStr)
          
          // Try multiple comparison methods
          if (normalizedItemUPC === normalizedSearchUPC || 
              itemUPCStr === originalUpcTrimmed ||
              normalizeUPC(originalUpcTrimmed) === normalizedItemUPC) {
            console.log(`✅ UPC MATCH in product.upc for SKU ${sku}: "${itemUPCStr}" matches "${originalUpcTrimmed}"`)
            return true
          }
        }
      }
      
      // Check productIdentifiers array (alternative location)
      const productIdentifiers = product.productIdentifiers || []
      if (Array.isArray(productIdentifiers)) {
        for (const identifier of productIdentifiers) {
          if (identifier.type === "UPC" || identifier.type === "UPC_A" || identifier.type === "UPC_E" || identifier.type === "GTIN") {
            const identifierValue = identifier.value || identifier.identifier
            if (identifierValue) {
              const identifierStr = String(identifierValue).trim()
              const normalizedIdentifierUPC = normalizeUPC(identifierStr)
              
              if (normalizedIdentifierUPC === normalizedSearchUPC || 
                  identifierStr === originalUpcTrimmed ||
                  normalizeUPC(originalUpcTrimmed) === normalizedIdentifierUPC) {
                console.log(`✅ UPC MATCH in productIdentifiers for SKU ${sku}: "${identifierStr}" matches "${originalUpcTrimmed}"`)
                return true
              }
            }
          }
        }
      }
      
      // Check product.gtin (sometimes UPC is stored as GTIN)
      const gtin = product.gtin
      if (gtin) {
        const gtinStr = String(gtin).trim()
        const normalizedGTIN = normalizeUPC(gtinStr)
        
        if (normalizedGTIN === normalizedSearchUPC || 
            gtinStr === originalUpcTrimmed ||
            normalizeUPC(originalUpcTrimmed) === normalizedGTIN) {
          console.log(`✅ UPC MATCH in product.gtin for SKU ${sku}: "${gtinStr}" matches "${originalUpcTrimmed}"`)
          return true
        }
      }
      
      return false
    }

    // Check first page
    for (const item of inventoryItems) {
      const isMatch = await hasMatchingUPC(item)
      if (isMatch === true) {
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
      console.log("📄 Fetching next page of inventory items...")
      const nextResponse = await fetch(next, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
      })

      if (!nextResponse.ok) {
        console.warn("⚠️ Failed to fetch next page of inventory items:", nextResponse.status)
        break
      }

      const nextData = await nextResponse.json()
      inventoryItems = nextData.inventoryItems || []
      next = nextData.next

      console.log(`📦 Found ${inventoryItems.length} items on this page`)

      // Check this page
      for (const item of inventoryItems) {
        const isMatch = await hasMatchingUPC(item)
        if (isMatch === true) {
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

