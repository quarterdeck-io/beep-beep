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

    // Normalize UPC for comparison
    const normalizeUPC = (upcValue: string): string => {
      if (!upcValue) return ""
      const digitsOnly = String(upcValue).replace(/\D/g, "")
      return digitsOnly
    }
    
    const normalizeUPCNoLeadingZeros = (upcValue: string): string => {
      const normalized = normalizeUPC(upcValue)
      if (!normalized) return ""
      return normalized.replace(/^0+/, "") || normalized
    }
    
    const originalUpcTrimmed = upc.trim()
    const normalizedSearchUPC = normalizeUPC(originalUpcTrimmed)
    const normalizedSearchUPCNoZeros = normalizeUPCNoLeadingZeros(originalUpcTrimmed)

    // ⚡ OPTIMIZATION 1: Use larger page size to reduce API calls
    const inventoryUrl = `${baseUrl}/sell/inventory/v1/inventory_item?limit=200&offset=0`
    
    const inventoryResponse = await fetch(inventoryUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Content-Language': 'en-US',
        'Accept-Language': 'en-US',
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
      },
    })

    if (!inventoryResponse.ok) {
      const errorText = await inventoryResponse.text().catch(() => "Unknown error")
      return NextResponse.json({
        hasDuplicates: false,
        duplicates: [],
        upc: upc,
        error: `Failed to fetch inventory: ${inventoryResponse.status}`,
        debug: errorText
      })
    }

    const inventoryData = await inventoryResponse.json()
    let inventoryItems = inventoryData.inventoryItems || []
    let next = inventoryData.next

    // ⚡ OPTIMIZATION 2: Check UPC without fetching individual items
    const checkItemForUPC = (item: any): { match: boolean; sku?: string; title?: string } => {
      const sku = item.sku
      const product = item.product
      
      if (!product) {
        return { match: false }
      }
      
      const checkValueMatch = (value: any): boolean => {
        if (!value) return false
        
        if (Array.isArray(value)) {
          for (const val of value) {
            if (checkValueMatch(val)) return true
          }
          return false
        }
        
        const valueStr = String(value).trim()
        const normalizedValue = normalizeUPC(valueStr)
        const normalizedValueNoZeros = normalizeUPCNoLeadingZeros(valueStr)
        
        const exactMatch = valueStr === originalUpcTrimmed
        const normalizedMatch = normalizedValue === normalizedSearchUPC
        const normalizedMatchNoZeros = normalizedValueNoZeros === normalizedSearchUPCNoZeros
        const digitsOnlyMatch = valueStr.replace(/\D/g, "") === originalUpcTrimmed.replace(/\D/g, "")
        
        return exactMatch || normalizedMatch || normalizedMatchNoZeros || digitsOnlyMatch
      }
      
      // Check all product identifier fields
      if (product.upc && checkValueMatch(product.upc)) {
        return { match: true, sku, title: product.title }
      }
      
      if (product.ean && checkValueMatch(product.ean)) {
        return { match: true, sku, title: product.title }
      }
      
      if (product.isbn && checkValueMatch(product.isbn)) {
        return { match: true, sku, title: product.title }
      }
      
      if (product.gtin && checkValueMatch(product.gtin)) {
        return { match: true, sku, title: product.title }
      }
      
      const productIdentifiers = product.productIdentifiers || []
      if (Array.isArray(productIdentifiers)) {
        for (const identifier of productIdentifiers) {
          if (["UPC", "UPC_A", "UPC_E", "GTIN", "EAN", "ISBN"].includes(identifier.type)) {
            const identifierValue = identifier.value || identifier.identifier
            if (identifierValue && checkValueMatch(identifierValue)) {
              return { match: true, sku, title: product.title }
            }
          }
        }
      }
      
      return { match: false }
    }

    const duplicates: Array<{ sku: string; title: string }> = []
    const MAX_DUPLICATES = 10
    const MAX_PAGES = 30 // ⚡ OPTIMIZATION 3: Limit total pages checked

    // Check first page
    for (const item of inventoryItems) {
      const result = checkItemForUPC(item)
      if (result.match && result.sku) {
        duplicates.push({
          sku: result.sku,
          title: result.title || "Unknown product"
        })
        if (duplicates.length >= MAX_DUPLICATES) break
      }
    }

    // ⚡ OPTIMIZATION 4: Early exit if duplicates found
    if (duplicates.length >= MAX_DUPLICATES) {
      return NextResponse.json({
        hasDuplicates: true,
        duplicates: duplicates,
        upc: upc
      })
    }

    // Check additional pages if needed
    let pageCount = 1
    while (next && duplicates.length < MAX_DUPLICATES && pageCount < MAX_PAGES) {
      let nextUrl = next
      if (next.startsWith('/')) {
        nextUrl = `${baseUrl}${next}`
      } else if (!next.startsWith('http://') && !next.startsWith('https://')) {
        nextUrl = `${baseUrl}/${next}`
      }
      
      const nextResponse = await fetch(nextUrl, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Content-Language': 'en-US',
          'Accept-Language': 'en-US',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
      })

      if (!nextResponse.ok) {
        break
      }

      const nextData = await nextResponse.json()
      inventoryItems = nextData.inventoryItems || []
      next = nextData.next
      pageCount++

      for (const item of inventoryItems) {
        const result = checkItemForUPC(item)
        if (result.match && result.sku) {
          duplicates.push({
            sku: result.sku,
            title: result.title || "Unknown product"
          })
          if (duplicates.length >= MAX_DUPLICATES) break
        }
      }
    }

    if (duplicates.length > 0) {
      return NextResponse.json({
        hasDuplicates: true,
        duplicates: duplicates,
        upc: upc
      })
    }

    return NextResponse.json({
      hasDuplicates: false,
      duplicates: [],
      upc: upc
    })

  } catch (error) {
    return NextResponse.json({
      hasDuplicates: false,
      duplicates: [],
      error: error instanceof Error ? error.message : "Unknown error"
    })
  }
}
