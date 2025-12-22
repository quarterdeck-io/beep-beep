import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Helper function to extract image size from eBay URL
// Returns the size in pixels, or 0 if unknown
function getImageSizeFromUrl(imageUrl: string | undefined): number {
  if (!imageUrl) return 0
  
  // Extract size from URL pattern: /s-l640.jpg -> 640
  const match = imageUrl.match(/\/s-l(\d+)\.jpg/i)
  if (match && match[1]) {
    return parseInt(match[1], 10)
  }
  
  // If no size parameter, assume it might be full resolution (but we can't be sure)
  // Return a safe value that indicates "unknown but potentially OK"
  return 999
}

// Helper function to convert eBay image URLs to higher resolution
// eBay image URLs often have size parameters like /s-l640.jpg
// We'll try to get larger versions, but if conversion fails, return null to trigger fallback
function getHighResImageUrl(imageUrl: string | undefined): { url: string; isHighRes: boolean } | null {
  if (!imageUrl) return null
  
  const currentSize = getImageSizeFromUrl(imageUrl)
  
  // If image is already 1200px or larger, it definitely meets eBay's 500px requirement
  // Use it as-is to avoid potential 404 errors from non-existent high-res URLs
  if (currentSize >= 1200) {
    console.log(`[IMAGE RESIZE] Image already ${currentSize}px (>= 1200px), using as-is: ${imageUrl}`)
    return { url: imageUrl, isHighRes: true }
  }
  
  // If image is 640px or larger, it meets the 500px requirement
  // But eBay might be strict, so let's try to get a larger version
  if (currentSize >= 640) {
    // Try to get 1200px version (more likely to exist than 1600px)
    const highResUrl = imageUrl.replace(/\/s-l\d+\.jpg/i, '/s-l1200.jpg')
    console.log(`[IMAGE RESIZE] Converting ${currentSize}px -> 1200px: ${imageUrl} -> ${highResUrl}`)
    return { url: highResUrl, isHighRes: true }
  }
  
  // If image is smaller than 640px, it might not meet requirements
  // Try to convert to 1200px, but this might fail
  if (currentSize > 0 && currentSize < 640) {
    const highResUrl = imageUrl.replace(/\/s-l\d+\.jpg/i, '/s-l1200.jpg')
    console.log(`[IMAGE RESIZE] Upscaling small image ${currentSize}px -> 1200px: ${imageUrl} -> ${highResUrl}`)
    return { url: highResUrl, isHighRes: false } // Mark as potentially unreliable
  }
  
  // If no size parameter detected, return as-is (might be full resolution)
  console.log(`[IMAGE RESIZE] No size parameter detected, using as-is: ${imageUrl}`)
  return { url: imageUrl, isHighRes: true }
}

// Helper function to process image object and get high-res URL
// Returns the image object with high-res URL, or null if conversion failed
function getHighResImage(image: any): any | null {
  if (!image || !image.imageUrl) return image
  
  const result = getHighResImageUrl(image.imageUrl)
  if (result) {
    return {
      ...image,
      imageUrl: result.url
    }
  }
  
  // If conversion failed, return null to trigger fallback
  return null
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
            const stockImageSize = getImageSizeFromUrl(stockImage.imageUrl)
            console.log(`[IMAGE FETCH] Stock image size from URL: ${stockImageSize}px`)
            
            // eBay is rejecting 640px images even though they technically meet the 500px requirement
            // So we'll only use stock images if they're already 1200px or larger
            // Otherwise, fall back to seller images which are usually already high-res from Browse API
            if (stockImageSize > 0 && stockImageSize < 1200) {
              console.log(`[IMAGE FETCH] ⚠️ Stock image too small (${stockImageSize}px < 1200px), falling back to seller images`)
              console.log(`[IMAGE FETCH] Note: eBay rejects 640px images even though they meet 500px requirement`)
              
              // Use seller images since stock images don't meet size requirements
              product.image = originalSellerImage
              product.additionalImages = originalSellerAdditionalImages
              
              product._imageSources = {
                stockImage: stockImage,
                stockImageOriginal: stockImage,
                stockAdditionalImages: stockAdditionalImages || [],
                stockAdditionalImagesOriginal: stockAdditionalImages || [],
                sellerImage: originalSellerImage,
                sellerAdditionalImages: originalSellerAdditionalImages || [],
                source: "seller_only_fallback_due_to_size",
              }
              
              console.log(`[IMAGE FETCH] ✅ USING SELLER IMAGE (stock image ${stockImageSize}px too small):`, originalSellerImage?.imageUrl || "None")
            } else {
              // Stock image is 1200px+ or unknown size, try to use it
              // Convert to high-res if needed
              const highResStockImage = getHighResImage(stockImage)
              
              if (!highResStockImage) {
                // Conversion failed, use seller images
                console.log(`[IMAGE FETCH] ⚠️ Failed to process stock image, falling back to seller images`)
                
                product.image = originalSellerImage
                product.additionalImages = originalSellerAdditionalImages
                
                product._imageSources = {
                  stockImage: stockImage,
                  stockImageOriginal: stockImage,
                  stockAdditionalImages: stockAdditionalImages || [],
                  stockAdditionalImagesOriginal: stockAdditionalImages || [],
                  sellerImage: originalSellerImage,
                  sellerAdditionalImages: originalSellerAdditionalImages || [],
                  source: "seller_only_fallback_conversion_failed",
                }
                
                console.log(`[IMAGE FETCH] ✅ USING SELLER IMAGE (conversion failed):`, originalSellerImage?.imageUrl || "None")
              } else {
              // Stock image is good, convert additional images
              const highResStockAdditionalImages = Array.isArray(stockAdditionalImages)
                ? stockAdditionalImages
                    .map((img: any) => {
                      const imgUrl = typeof img === 'string' ? { imageUrl: img } : img
                      const converted = getHighResImage(imgUrl)
                      return converted || imgUrl // Use original if conversion fails
                    })
                    .filter((img: any) => {
                      // Filter out images that are too small
                      const size = getImageSizeFromUrl(img.imageUrl)
                      return size === 0 || size >= 640
                    })
                : []
              
              console.log(`[IMAGE FETCH] High-res stock image:`, highResStockImage.imageUrl)
              console.log(`[IMAGE FETCH] High-res stock additional images: ${highResStockAdditionalImages.length} (filtered from ${stockAdditionalImages?.length || 0})`)
              
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
            }
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

