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

    // Normalize UPC for comparison (remove non-digits, handle leading zeros)
    const normalizeUPC = (upcValue: string): string => {
      if (!upcValue) return ""
      // Remove all non-digit characters
      const digitsOnly = String(upcValue).replace(/\D/g, "")
      if (digitsOnly.length === 0) return ""
      // Remove leading zeros but keep at least one digit
      const normalized = digitsOnly.replace(/^0+/, "") || digitsOnly
      return normalized
    }
    
    const normalizedSearchUPC = normalizeUPC(upc)
    const originalUpcTrimmed = upc.trim()
    
    console.log(`🔍 Checking for duplicate UPC. Original: "${upc}", Normalized: "${normalizedSearchUPC}"`)

    // Get all inventory items from the user's eBay account
    const inventoryUrl = `${baseUrl}/sell/inventory/v1/inventory_item`
    
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
      // If we can't check, return no duplicates (don't block the user)
      return NextResponse.json({
        hasDuplicates: false,
        duplicates: [],
        upc: upc
      })
    }

    const inventoryData = await inventoryResponse.json()
    let inventoryItems = inventoryData.inventoryItems || []
    let next = inventoryData.next

    console.log(`📦 Found ${inventoryItems.length} inventory items on first page`)

    // Helper function to check if item has matching UPC
    const hasMatchingUPC = async (item: any): Promise<{ match: boolean; sku?: string; title?: string }> => {
      const sku = item.sku
      
      // Fetch full item details to get complete product information
      let product = item.product
      
      try {
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
        } else {
          // Fall back to list data if available
          if (!product) {
            product = item.product
          }
        }
      } catch (fetchError) {
        // Fall back to list data if available
        if (!product) {
          product = item.product
        }
      }
      
      if (!product) {
        return { match: false }
      }
      
      // Helper to check if a value matches our search UPC
      const checkValueMatch = (value: any): boolean => {
        if (!value) return false
        
        // Handle arrays
        if (Array.isArray(value)) {
          for (const val of value) {
            if (checkValueMatch(val)) return true
          }
          return false
        }
        
        const valueStr = String(value).trim()
        const normalizedValue = normalizeUPC(valueStr)
        
        // Try multiple comparison methods
        const exactMatch = valueStr === originalUpcTrimmed
        const normalizedMatch = normalizedValue === normalizedSearchUPC
        const digitsOnlyMatch = valueStr.replace(/\D/g, "") === originalUpcTrimmed.replace(/\D/g, "")
        
        return exactMatch || normalizedMatch || digitsOnlyMatch
      }
      
      // Check product.upc array
      if (product.upc && checkValueMatch(product.upc)) {
        return { match: true, sku, title: product.title || item.product?.title }
      }
      
      // Check product.ean
      if (product.ean && checkValueMatch(product.ean)) {
        return { match: true, sku, title: product.title || item.product?.title }
      }
      
      // Check product.isbn
      if (product.isbn && checkValueMatch(product.isbn)) {
        return { match: true, sku, title: product.title || item.product?.title }
      }
      
      // Check product.gtin
      if (product.gtin && checkValueMatch(product.gtin)) {
        return { match: true, sku, title: product.title || item.product?.title }
      }
      
      // Check productIdentifiers array
      const productIdentifiers = product.productIdentifiers || []
      if (Array.isArray(productIdentifiers) && productIdentifiers.length > 0) {
        for (const identifier of productIdentifiers) {
          if (identifier.type === "UPC" || identifier.type === "UPC_A" || identifier.type === "UPC_E" || 
              identifier.type === "GTIN" || identifier.type === "EAN" || identifier.type === "ISBN") {
            const identifierValue = identifier.value || identifier.identifier
            if (identifierValue && checkValueMatch(identifierValue)) {
              return { match: true, sku, title: product.title || item.product?.title }
            }
          }
        }
      }
      
      return { match: false }
    }

    const duplicates: Array<{ sku: string; title: string }> = []

    // Check first page
    for (const item of inventoryItems) {
      const result = await hasMatchingUPC(item)
      if (result.match && result.sku) {
        duplicates.push({
          sku: result.sku,
          title: result.title || "Unknown product"
        })
      }
    }

    // If there are more pages, check them too
    while (next && duplicates.length < 10) { // Limit to first 10 duplicates
      const nextResponse = await fetch(next, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
      })

      if (!nextResponse.ok) {
        break
      }

      const nextData = await nextResponse.json()
      inventoryItems = nextData.inventoryItems || []
      next = nextData.next

      // Check this page
      for (const item of inventoryItems) {
        const result = await hasMatchingUPC(item)
        if (result.match && result.sku) {
          duplicates.push({
            sku: result.sku,
            title: result.title || "Unknown product"
          })
          if (duplicates.length >= 10) break // Limit to first 10 duplicates
        }
      }
    }

    if (duplicates.length > 0) {
      console.log(`✅ Found ${duplicates.length} duplicate(s) for UPC: "${upc}"`)
      return NextResponse.json({
        hasDuplicates: true,
        duplicates: duplicates,
        upc: upc
      })
    }

    console.log(`❌ No duplicates found for UPC: "${upc}"`)
    return NextResponse.json({
      hasDuplicates: false,
      duplicates: [],
      upc: upc
    })

  } catch (error) {
    console.error("Error checking for duplicate:", error)
    // On error, return no duplicates (don't block the user)
    return NextResponse.json({
      hasDuplicates: false,
      duplicates: [],
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
