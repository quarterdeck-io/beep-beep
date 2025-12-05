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
      
      // First, check if the list response has product data
      let product = item.product
      let fetchedFullDetails = false
      
      // Always fetch full item details to ensure we have complete product information
      // The list endpoint often doesn't include full product data
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
          fetchedFullDetails = true
          
          // Log the FULL raw product structure for debugging - this will show us exactly what eBay returns
          console.log(`📦 FULL RAW PRODUCT DATA for SKU ${sku}:`, JSON.stringify(product, null, 2))
          
          // Also log a summary
          console.log(`📦 Summary for SKU ${sku}:`, {
            title: product?.title,
            upc: product?.upc,
            ean: product?.ean,
            isbn: product?.isbn,
            gtin: product?.gtin,
            mpn: product?.mpn,
            productIdentifiers: product?.productIdentifiers,
            aspectsKeys: product?.aspects ? Object.keys(product.aspects) : null,
            allKeys: product ? Object.keys(product) : []
          })
        } else {
          const errorText = await itemResponse.text().catch(() => "")
          console.warn(`⚠️ Failed to fetch full details for SKU ${sku}:`, itemResponse.status, errorText)
          // Fall back to list data if available
          if (!product) {
            product = item.product
          }
        }
      } catch (fetchError) {
        console.warn(`⚠️ Error fetching full details for SKU ${sku}:`, fetchError)
        // Fall back to list data if available
        if (!product) {
          product = item.product
        }
      }
      
      if (!product) {
        console.log(`⚠️ No product data found for SKU ${sku}`)
        return false
      }
      
      // Log what we're checking
      console.log(`🔍 Checking UPC for SKU ${sku}:`, {
        searchingFor: originalUpcTrimmed,
        normalizedSearch: normalizedSearchUPC,
        productUpc: product.upc,
        productGtin: product.gtin,
        productEan: product.ean,
        productIsbn: product.isbn,
        productIdentifiers: product.productIdentifiers
      })
      
      // Helper to check if a value matches our search UPC
      const checkValueMatch = (value: any, fieldName: string): boolean => {
        if (!value) return false
        
        // Handle arrays
        if (Array.isArray(value)) {
          for (const val of value) {
            if (checkValueMatch(val, fieldName)) return true
          }
          return false
        }
        
        const valueStr = String(value).trim()
        const normalizedValue = normalizeUPC(valueStr)
        
        // Try multiple comparison methods - be more lenient
        const exactMatch = valueStr === originalUpcTrimmed
        const normalizedMatch = normalizedValue === normalizedSearchUPC
        const reverseNormalizedMatch = normalizeUPC(originalUpcTrimmed) === normalizedValue
        const digitsOnlyMatch = valueStr.replace(/\D/g, "") === originalUpcTrimmed.replace(/\D/g, "")
        
        const matches = exactMatch || normalizedMatch || reverseNormalizedMatch || digitsOnlyMatch
        
        if (matches) {
          console.log(`✅ UPC MATCH in ${fieldName} for SKU ${sku}:`, {
            found: valueStr,
            foundNormalized: normalizedValue,
            searching: originalUpcTrimmed,
            searchingNormalized: normalizedSearchUPC,
            matchType: exactMatch ? "exact" : normalizedMatch ? "normalized" : reverseNormalizedMatch ? "reverse-normalized" : "digits-only"
          })
        } else {
          // Log non-matches for debugging (only for first few items to avoid spam)
          if (inventoryItems.indexOf(item) < 3) {
            console.log(`❌ No match in ${fieldName} for SKU ${sku}:`, {
              found: valueStr,
              foundNormalized: normalizedValue,
              searching: originalUpcTrimmed,
              searchingNormalized: normalizedSearchUPC
            })
          }
        }
        
        return matches
      }
      
      // Check product.upc array
      if (product.upc) {
        if (checkValueMatch(product.upc, "product.upc")) {
          return true
        }
      }
      
      // Check product.ean (EAN can sometimes be the same as UPC)
      if (product.ean) {
        if (checkValueMatch(product.ean, "product.ean")) {
          return true
        }
      }
      
      // Check product.isbn (ISBN-13 can sometimes match UPC)
      if (product.isbn) {
        if (checkValueMatch(product.isbn, "product.isbn")) {
          return true
        }
      }
      
      // Check product.gtin (sometimes UPC is stored as GTIN)
      if (product.gtin) {
        if (checkValueMatch(product.gtin, "product.gtin")) {
          return true
        }
      }
      
      // Check productIdentifiers array (alternative location)
      const productIdentifiers = product.productIdentifiers || []
      if (Array.isArray(productIdentifiers) && productIdentifiers.length > 0) {
        for (const identifier of productIdentifiers) {
          // Check all identifier types that might contain UPC
          if (identifier.type === "UPC" || identifier.type === "UPC_A" || identifier.type === "UPC_E" || 
              identifier.type === "GTIN" || identifier.type === "EAN" || identifier.type === "ISBN") {
            const identifierValue = identifier.value || identifier.identifier
            if (identifierValue) {
              if (checkValueMatch(identifierValue, `productIdentifiers[${identifier.type}]`)) {
                return true
              }
            }
          }
        }
      }
      
      // Check aspects - sometimes UPC might be in item specifics
      if (product.aspects && typeof product.aspects === 'object') {
        for (const [key, value] of Object.entries(product.aspects)) {
          if (key.toLowerCase().includes('upc') || key.toLowerCase().includes('barcode') || key.toLowerCase().includes('gtin')) {
            if (checkValueMatch(value, `aspects[${key}]`)) {
              return true
            }
          }
        }
      }
      
      console.log(`❌ No UPC match found for SKU ${sku}`)
      return false
    }

    // Check first page
    for (const item of inventoryItems) {
      const isMatch = await hasMatchingUPC(item)
      if (isMatch === true) {
        const foundSku = item.sku || "Unknown"
        const foundTitle = item.product?.title || "Unknown product"
        console.log("✅ DUPLICATE FOUND! SKU:", foundSku, "UPC:", upc, "Product:", foundTitle)
        return NextResponse.json({
          isDuplicate: true,
          existingSku: foundSku,
          upc: upc,
          productTitle: foundTitle
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
          const foundSku = item.sku || "Unknown"
          const foundTitle = item.product?.title || "Unknown product"
          console.log("✅ DUPLICATE FOUND on subsequent page! SKU:", foundSku, "UPC:", upc, "Product:", foundTitle)
          return NextResponse.json({
            isDuplicate: true,
            existingSku: foundSku,
            upc: upc,
            productTitle: foundTitle
          })
        }
      }
    }

    console.log(`❌ No duplicate found for UPC: "${upc}" after checking all ${inventoryData.total || inventoryItems.length} inventory items`)
    console.log(`📊 Summary: Checked ${inventoryItems.length} items on first page${next ? ' and subsequent pages' : ''}`)
    return NextResponse.json({
      isDuplicate: false,
      existingSku: null,
      upc: upc,
      itemsChecked: inventoryData.total || inventoryItems.length
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

