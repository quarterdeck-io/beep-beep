import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Helper function to convert eBay image URLs to higher resolution
// eBay image URLs often have size parameters like /s-l640.jpg
// We'll try to get larger versions (1600px) or remove size restrictions
function getHighResImageUrl(imageUrl: string | undefined): string | undefined {
  if (!imageUrl) return undefined
  
  // Try to convert to higher resolution version
  // Pattern: https://i.ebayimg.com/images/g/XXX/s-l640.jpg -> s-l1600.jpg
  if (imageUrl.includes('/s-l')) {
    // Replace size parameter with larger version (1600px minimum for eBay requirements)
    // eBay requires at least 500px, but 1600px is safer and commonly available
    const highResUrl = imageUrl.replace(/\/s-l\d+\.jpg/i, '/s-l1600.jpg')
    console.log(`[IMAGE RESIZE] Converting ${imageUrl} -> ${highResUrl}`)
    return highResUrl
  }
  
  // If URL has other size patterns, try to remove them
  // Pattern: .../images/g/XXX/s-l225.jpg or similar
  if (imageUrl.match(/\/s-\w+\.jpg/i)) {
    // Try to get full resolution by removing size parameter
    // This might not always work, but worth trying
    const fullResUrl = imageUrl.replace(/\/s-\w+\.jpg/i, '.jpg')
    console.log(`[IMAGE RESIZE] Attempting full-res by removing size param: ${imageUrl} -> ${fullResUrl}`)
    return fullResUrl
  }
  
  // If no size parameter, return as-is (might already be full resolution)
  return imageUrl
}

// Helper function to process image object and get high-res URL
function getHighResImage(image: any): any {
  if (!image) return image
  
  const highResUrl = getHighResImageUrl(image.imageUrl)
  if (highResUrl && highResUrl !== image.imageUrl) {
    return {
      ...image,
      imageUrl: highResUrl
    }
  }
  
  return image
}

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
    
    // Select a RANDOM product from the search results
    const randomIndex = Math.floor(Math.random() * data.itemSummaries.length)
    const selectedProduct = data.itemSummaries[randomIndex]
    
    // Use the random product but replace its price with the mean price
    let product: any = {
      ...selectedProduct,
      price: {
        ...selectedProduct.price,
        value: meanPrice,
        currency: selectedProduct.price?.currency || "USD"
      }
    }

    // Try to enrich with eBay catalog (stock) images.
    // If this fails for any reason, we silently fall back to the existing
    // Browse API images (seller images), preserving legacy behaviour.
    
    // Preserve original seller images for reference/debugging
    const originalSellerImage = product.image
    const originalSellerAdditionalImages = product.additionalImages || []
    
    console.log(`[IMAGE FETCH] UPC: ${upc} - Starting image fetch process`)
    console.log(`[IMAGE FETCH] Seller image from Browse API:`, originalSellerImage?.imageUrl || "None")
    console.log(`[IMAGE FETCH] Seller additional images:`, originalSellerAdditionalImages.length)
    
    try {
      const isSandbox = process.env.EBAY_SANDBOX === "true"
      const catalogApiUrl = isSandbox
        ? "https://api.sandbox.ebay.com/commerce/catalog/v1_beta/product_summary/search"
        : "https://api.ebay.com/commerce/catalog/v1_beta/product_summary/search"

      console.log(`[IMAGE FETCH] Attempting to fetch stock image from Catalog API...`)
      console.log(`[IMAGE FETCH] Catalog API URL: ${catalogApiUrl}`)

      const catalogResponse = await fetch(
        `${catalogApiUrl}?q=${encodeURIComponent(upc)}&fieldgroups=FULL`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
            "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
          },
        }
      )

      console.log(`[IMAGE FETCH] Catalog API response status: ${catalogResponse.status} ${catalogResponse.statusText}`)

      if (catalogResponse.ok) {
        const catalogData = await catalogResponse.json().catch(() => ({} as any))
        const productSummaries = (catalogData as any).productSummaries

        console.log(`[IMAGE FETCH] Catalog API returned ${productSummaries?.length || 0} product summaries`)

        if (Array.isArray(productSummaries) && productSummaries.length > 0) {
          const catalogProduct = productSummaries[0] as any
          const stockImage = catalogProduct.image
          const stockAdditionalImages = catalogProduct.additionalImages

          console.log(`[IMAGE FETCH] Stock image from catalog:`, stockImage?.imageUrl || "None")
          console.log(`[IMAGE FETCH] Stock additional images:`, stockAdditionalImages?.length || 0)

          if (stockImage?.imageUrl) {
            // Convert stock images to high resolution for eBay listing requirements (min 500px)
            const highResStockImage = getHighResImage(stockImage)
            const highResStockAdditionalImages = Array.isArray(stockAdditionalImages)
              ? stockAdditionalImages.map((img: any) => {
                  const imgUrl = typeof img === 'string' ? { imageUrl: img } : img
                  return getHighResImage(imgUrl)
                })
              : []
            
            console.log(`[IMAGE FETCH] High-res stock image:`, highResStockImage.imageUrl)
            console.log(`[IMAGE FETCH] High-res stock additional images:`, highResStockAdditionalImages.length)
            
            // Prefer stock image for primary display and listing.
            product.image = highResStockImage
            product.additionalImages =
              highResStockAdditionalImages.length > 0
                ? highResStockAdditionalImages
                : originalSellerAdditionalImages

            // Attach metadata so the frontend/debug view can see both sources.
            product._imageSources = {
              stockImage: highResStockImage, // Store high-res version
              stockImageOriginal: stockImage, // Store original for reference
              stockAdditionalImages: highResStockAdditionalImages,
              stockAdditionalImagesOriginal: stockAdditionalImages || [],
              sellerImage: originalSellerImage,
              sellerAdditionalImages: originalSellerAdditionalImages || [],
              source: "stock_preferred_with_seller_fallback",
            }
            
            console.log(`[IMAGE FETCH] ✅ USING HIGH-RES STOCK IMAGE: ${highResStockImage.imageUrl}`)
            console.log(`[IMAGE FETCH] Additional images: ${product.additionalImages.length} (${highResStockAdditionalImages.length > 0 ? 'high-res stock' : 'seller fallback'})`)
          } else {
            console.log(`[IMAGE FETCH] ⚠️ Catalog API returned product but no stock image URL found`)
            // Set metadata to show we tried but no stock image available
            product._imageSources = {
              stockImage: null,
              stockAdditionalImages: [],
              sellerImage: originalSellerImage,
              sellerAdditionalImages: originalSellerAdditionalImages || [],
              source: "seller_only",
            }
            console.log(`[IMAGE FETCH] ✅ USING SELLER IMAGE (no stock image available):`, originalSellerImage?.imageUrl || "None")
          }
        } else {
          console.log(`[IMAGE FETCH] ⚠️ Catalog API returned no product summaries`)
          // Set metadata to show we tried but no products found
          product._imageSources = {
            stockImage: null,
            stockAdditionalImages: [],
            sellerImage: originalSellerImage,
            sellerAdditionalImages: originalSellerAdditionalImages || [],
            source: "seller_only",
          }
          console.log(`[IMAGE FETCH] ✅ USING SELLER IMAGE (no catalog products found):`, originalSellerImage?.imageUrl || "None")
        }
      } else {
        const errorText = await catalogResponse.text().catch(() => "Unknown error")
        console.log(`[IMAGE FETCH] ❌ Catalog API error: ${catalogResponse.status} - ${errorText.substring(0, 200)}`)
        // Set metadata to show catalog API failed
        product._imageSources = {
          stockImage: null,
          stockAdditionalImages: [],
          sellerImage: originalSellerImage,
          sellerAdditionalImages: originalSellerAdditionalImages || [],
          source: "seller_only",
        }
        console.log(`[IMAGE FETCH] ✅ USING SELLER IMAGE (catalog API failed):`, originalSellerImage?.imageUrl || "None")
      }
    } catch (error) {
      console.log(`[IMAGE FETCH] ❌ Exception while fetching stock image:`, error instanceof Error ? error.message : String(error))
      // Set metadata to show exception occurred
      product._imageSources = {
        stockImage: null,
        stockAdditionalImages: [],
        sellerImage: originalSellerImage,
        sellerAdditionalImages: originalSellerAdditionalImages || [],
        source: "seller_only",
      }
      console.log(`[IMAGE FETCH] ✅ USING SELLER IMAGE (exception occurred):`, originalSellerImage?.imageUrl || "None")
    }
    
    console.log(`[IMAGE FETCH] Final image source: ${product._imageSources?.source || "unknown"}`)
    console.log(`[IMAGE FETCH] Final primary image URL: ${product.image?.imageUrl || "None"}`)
    
    // Add metadata about the search for debugging
    const responseData = {
      ...product,
      _searchMetadata: {
        totalResults: data.itemSummaries.length,
        selectedIndex: randomIndex,
        itemsUsedForMean: prices.length,
        isMeanPrice: true,
        originalPrice: selectedProduct.price?.value,
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

