import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    // Check if user is authenticated
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    let body
    try {
      body = await req.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: "Invalid request body. Could not parse JSON." },
        { status: 400 }
      )
    }

    let { 
      title, 
      description, 
      price, 
      condition, 
      imageUrl, 
      categoryId, 
      upc, 
      ean, 
      isbn, 
      mpn, 
      brand, 
      aspects,
      // Additional fields from Browse API
      epid,  // eBay Product ID for better catalog matching
      additionalImages,  // Array of additional image URLs
      itemWebUrl,  // Original eBay listing URL (for reference)
      categories,  // Category information from Browse API
      conditionId  // Condition ID from Browse API
    } = body

    // Validate and sanitize required fields
    const missingFields: string[] = []
    
    // Title validation
    if (!title || (typeof title === 'string' && title.trim().length === 0)) {
      missingFields.push("title")
    } else {
      title = title.trim()
    }
    
    // Description - provide default if empty
    if (!description || (typeof description === 'string' && description.trim().length === 0)) {
      description = "No description provided." // Provide a default description
    } else {
      description = description.trim()
    }
    
    // Price validation
    const priceNum = parseFloat(price)
    if (!price || isNaN(priceNum) || priceNum <= 0) {
      missingFields.push("price (must be a valid number greater than 0)")
    }
    
    // Condition validation
    if (!condition || (typeof condition === 'string' && condition.trim().length === 0)) {
      missingFields.push("condition")
    } else {
      condition = condition.trim()
    }
    
    // Image validation - eBay requires at least one image
    const hasImage = (imageUrl && imageUrl.trim().length > 0) || 
                     (additionalImages && Array.isArray(additionalImages) && additionalImages.length > 0)
    if (!hasImage) {
      missingFields.push("image (at least one product image is required)")
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: `Missing or invalid required fields: ${missingFields.join(", ")}`,
          received: { 
            title: title || null, 
            description: description || null, 
            price, 
            condition: condition || null,
            hasImage
          }
        },
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
    
    // Log access token for testing/debugging
    const isSandbox = process.env.EBAY_SANDBOX === "true"
    console.log("=".repeat(80))
    console.log("eBay ACCESS TOKEN FOR POSTMAN TESTING:")
    console.log("Environment:", isSandbox ? "SANDBOX" : "PRODUCTION")
    console.log("Access Token:", accessToken)
    console.log("Token Expires At:", ebayToken.expiresAt)
    console.log("Token Status:", new Date() >= ebayToken.expiresAt ? "EXPIRED (will refresh)" : "VALID")
    console.log("=".repeat(80))
    
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
        const refreshErrorData = await refreshResponse.json().catch(() => ({}))
        console.error("Token refresh failed:", refreshErrorData)
        
        // Only delete token if refresh fails with 400/401 (invalid/expired refresh token)
        // Don't delete for other errors (network issues, etc.)
        if (refreshResponse.status === 400 || refreshResponse.status === 401) {
          try {
            await prisma.ebayToken.delete({
              where: { userId: session.user.id }
            })
            console.log("Token deleted after failed refresh")
          } catch (deleteError) {
            console.error("Failed to delete token after refresh failure:", deleteError)
          }
          return NextResponse.json(
            { 
              error: "Failed to refresh eBay token. Please reconnect your eBay account.",
              needsReconnect: true
            },
            { status: 401 }
          )
        }
        
        // For other errors, don't delete token - just return error
        return NextResponse.json(
          { 
            error: "Failed to refresh eBay token. Please try again.",
            details: refreshErrorData
          },
          { status: refreshResponse.status }
        )
      }

      const refreshData = await refreshResponse.json()
      accessToken = refreshData.access_token
      
      // Log new access token after refresh
      console.log("=".repeat(80))
      console.log("eBay TOKEN REFRESHED - NEW ACCESS TOKEN:")
      console.log("New Access Token:", accessToken)
      console.log("New Expires At:", new Date(Date.now() + (refreshData.expires_in * 1000)))
      console.log("=".repeat(80))

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

    const isSandboxEnv = process.env.EBAY_SANDBOX === "true"
    const baseUrl = isSandboxEnv
      ? "https://api.sandbox.ebay.com"
      : "https://api.ebay.com"
    
    // Log API details for Postman testing
    console.log("=".repeat(80))
    console.log("eBay API DETAILS FOR POSTMAN:")
    console.log("Base URL:", baseUrl)
    console.log("Marketplace:", "EBAY_US")
    console.log("Current Access Token:", accessToken)
    console.log("=".repeat(80))

    // Get or create SKU settings for the user
    let skuSettings: { nextSkuCounter: number; skuPrefix: string | null } = {
      nextSkuCounter: 1,
      skuPrefix: null,
    }
    let shouldIncrementCounter = false
    
    try {
      const existingSettings = await (prisma as any).skuSettings.findUnique({
        where: { userId: session.user.id }
      })

      if (existingSettings) {
        skuSettings = {
          nextSkuCounter: existingSettings.nextSkuCounter,
          skuPrefix: existingSettings.skuPrefix,
        }
        shouldIncrementCounter = true
      } else {
        // If no settings exist, create default ones
        try {
          const newSettings = await (prisma as any).skuSettings.create({
            data: {
              userId: session.user.id,
              nextSkuCounter: 1,
              skuPrefix: null,
            }
          })
          skuSettings = {
            nextSkuCounter: newSettings.nextSkuCounter,
            skuPrefix: newSettings.skuPrefix,
          }
          shouldIncrementCounter = true
        } catch (createError) {
          // If create fails, use defaults
          console.warn("Could not create SKU settings, using defaults:", createError)
        }
      }
    } catch (error) {
      // Fallback if Prisma Client types aren't updated yet
      console.warn("SKU settings not available, using default:", error)
    }

    // Generate SKU using user's settings with timestamp for uniqueness
    const prefix = skuSettings.skuPrefix || "SKU"
    const timestamp = Date.now().toString().slice(-6) // Last 6 digits of timestamp for uniqueness
    const sku = `${prefix}-${skuSettings.nextSkuCounter}-${timestamp}`
    
    console.log("Generated unique SKU:", sku)
    
    // Increment the counter for next time (we'll update it after successful listing)

    // Step 1: Create an inventory item
    // Build product object - eBay requires at minimum a title
    const productObj: any = {
      title: title.substring(0, 80), // eBay title limit is 80 characters
    }
    
    // Add eBay Product ID (ePID) for better catalog matching - highest priority
    if (epid && epid.trim().length > 0) {
      productObj.epid = epid.trim()
      console.log("Using eBay Product ID (ePID) for catalog matching:", epid)
    }
    
    // Add description if provided
    if (description && description.trim().length > 0 && description !== "No description") {
      productObj.description = description.substring(0, 50000)
    }
    
    // Add images if provided - eBay expects imageUrls array
    const allImages: string[] = []
    if (imageUrl && imageUrl.trim().length > 0) {
      allImages.push(imageUrl.trim())
    }
    // Add additional images from Browse API if available
    if (additionalImages && Array.isArray(additionalImages)) {
      additionalImages.forEach((img: any) => {
        const imgUrl = typeof img === 'string' ? img : img?.imageUrl
        if (imgUrl && imgUrl.trim().length > 0 && !allImages.includes(imgUrl)) {
          allImages.push(imgUrl.trim())
        }
      })
    }
    if (allImages.length > 0) {
      productObj.imageUrls = allImages.slice(0, 12) // eBay allows up to 12 images
      console.log(`Added ${allImages.length} images to product (max 12)`)
    }
    
    // Add product identifiers (UPC, EAN, ISBN, etc.) if provided
    // Priority order: UPC > EAN > ISBN
    if (upc && upc.trim().length > 0) {
      productObj.upc = [upc.trim()]
    }
    if (ean && ean.trim().length > 0) {
      productObj.ean = [ean.trim()]
    }
    if (isbn && isbn.trim().length > 0) {
      productObj.isbn = [isbn.trim()]
    }
    if (mpn && mpn.trim().length > 0) {
      productObj.mpn = mpn.trim()
    }
    if (brand && brand.trim().length > 0) {
      productObj.brand = brand.trim()
    }
    
    // Add product aspects (category-specific attributes) if provided
    if (aspects && typeof aspects === 'object' && Object.keys(aspects).length > 0) {
      productObj.aspects = aspects
      console.log("Product aspects included:", Object.keys(aspects).join(", "))
    }
    
    // Build inventory payload (SKU is in URL, not body!)
    const inventoryItemPayload: any = {
      product: productObj,
      condition: mapConditionToEbay(condition),
      availability: {
        shipToLocationAvailability: {
          quantity: 1
        }
      }
    }
    
    // Log the payload for debugging
    console.log("Creating inventory item with payload:", JSON.stringify(inventoryItemPayload, null, 2))
    
    // Log complete request details for Postman
    const inventoryUrl = `${baseUrl}/sell/inventory/v1/inventory_item/${sku}`
    console.log("=".repeat(80))
    console.log("API CALL #1: CREATE INVENTORY ITEM")
    console.log("URL:", inventoryUrl)
    console.log("Method: PUT")
    console.log("Headers:", JSON.stringify({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Language': 'en-US',
      'Accept-Language': 'en-US',
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
    }, null, 2))
    console.log("Body:", JSON.stringify(inventoryItemPayload, null, 2))
    console.log("=".repeat(80))

    const inventoryResponse = await fetch(
      inventoryUrl,
      {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Content-Language': 'en-US',
          'Accept-Language': 'en-US',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
        body: JSON.stringify(inventoryItemPayload),
      }
    )

    // Check for 401 Unauthorized - token might be invalid
    if (inventoryResponse.status === 401) {
      console.error("401 Unauthorized from eBay Inventory API - token may be invalid")
      // Don't delete token immediately - might be a temporary issue
      // Only delete if we get error 2004 specifically
    }

    // Check for 204 No Content (success with no body)
    if (inventoryResponse.status === 204) {
      console.log("✅ Inventory item created successfully (204 No Content)")
    } else if (!inventoryResponse.ok) {
      const errorData = await inventoryResponse.json().catch(() => ({}))
      const errorText = await inventoryResponse.text().catch(() => "")
      
      // Log full error for debugging
      console.error("eBay Inventory API Error:", {
        status: inventoryResponse.status,
        statusText: inventoryResponse.statusText,
        errorData,
        errorText,
        payload: inventoryItemPayload
      })
      
      const errorMessage = errorData.errors?.[0]?.message || errorData.errors?.[0]?.longMessage || errorData.message || "Failed to create inventory item"
      const errorCode = errorData.errors?.[0]?.errorId || errorData.errors?.[0]?.code
      
      // Provide more specific hints based on error code
      let hint = "Make sure your eBay account has selling privileges and the required permissions."
      let needsReconnect = false
      
      // Error 2004 specifically means "OAuth token is missing required scopes"
      if (errorCode === 2004) {
        console.error("Error 2004 detected: Token missing sell.inventory scope.")
        console.error("Full error details:", JSON.stringify(errorData, null, 2))
        console.error("Current EBAY_SCOPE:", process.env.EBAY_SCOPE)
        needsReconnect = true
        hint = "Error 2004: Your eBay token is missing the 'sell.inventory' scope required for listing. Please disconnect and revoke access, then reconnect your eBay account from the eBay Connect page. Make sure EBAY_SCOPE includes 'sell.inventory' before reconnecting."
      } else if (inventoryResponse.status === 401 && errorCode !== 2004) {
        // 401 but not error 2004 - might be token expired or invalid, but don't delete automatically
        console.error("401 Unauthorized but not error 2004. Error code:", errorCode)
        console.error("Full error details:", JSON.stringify(errorData, null, 2))
        hint = `Authentication error (${errorCode || 'unknown'}): ${errorMessage}. Please try again. If this persists, you may need to reconnect your eBay account.`
      } else if (errorCode === 2001 || errorCode === 2002 || errorCode === 2003) {
        // Other OAuth-related errors that might indicate token issues
        // But don't delete token automatically - let user try again or reconnect manually
        console.error(`OAuth error ${errorCode}:`, errorMessage)
        hint = `eBay API Error ${errorCode}: ${errorMessage}. If this persists, please try disconnecting and reconnecting your eBay account.`
      } else if (errorMessage.includes("seller") || errorMessage.includes("account")) {
        hint = "Your eBay seller account may not be fully set up. Please complete your seller registration on eBay first."
      } else {
        // For other errors, don't delete the token - just show the error
        console.error("Other error (not deleting token):", {
          status: inventoryResponse.status,
          errorCode,
          errorMessage,
          errorData
        })
        hint = errorMessage
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          errorCode: errorCode,
          details: errorData,
          hint: hint,
          needsReconnect: needsReconnect,
          rawEbayError: errorData, // Full raw error from eBay
          ebayErrorMessage: errorData.errors?.[0] || errorData // First error or full error object
        },
        { status: inventoryResponse.status }
      )
    }

    // Handle response - 204 returns no body
    let inventoryData: any = {}
    if (inventoryResponse.status !== 204) {
      inventoryData = await inventoryResponse.json().catch(() => ({}))
    }
    // Use the SKU we provided (since 204 returns no body)
    const finalSku = inventoryData.sku || sku

    // Step 2: Get user's inventory location (required for publishing)
    let merchantLocationKey = ""
    
    try {
      console.log("Fetching inventory locations...")
      const locationsResponse = await fetch(
        `${baseUrl}/sell/inventory/v1/location`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Content-Language': 'en-US',
            'Accept-Language': 'en-US',
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        }
      )
      
      if (locationsResponse.ok) {
        const locationsData = await locationsResponse.json()
        if (locationsData.locations && locationsData.locations.length > 0) {
          merchantLocationKey = locationsData.locations[0].merchantLocationKey
          console.log("Found inventory location:", merchantLocationKey)
        } else {
          console.warn("No inventory locations found for user")
        }
      } else {
        console.error("Failed to fetch inventory locations:", locationsResponse.status)
      }
    } catch (locationError) {
      console.error("Error fetching inventory locations:", locationError)
    }
    
    // If no location found, we cannot publish the listing
    if (!merchantLocationKey || merchantLocationKey === "") {
      return NextResponse.json(
        { 
          error: "No inventory location found. Please set up your inventory location in eBay Seller Hub first.",
          hint: "Go to eBay Seller Hub → Account → Business Policies → Locations and create a location with your address.",
          needsSetup: true,
          setupUrl: "https://www.ebay.com/sh/locationsettings"
        },
        { status: 400 }
      )
    }

    // Step 3: Get user's saved policies or fetch from eBay
    let fulfillmentPolicyId = "default"
    let paymentPolicyId = "default"
    let returnPolicyId = "default"
    
    try {
      // First, try to get user's saved policy preferences from database
      const savedPolicies = await (prisma as any).ebayBusinessPolicies.findUnique({
        where: { userId: session.user.id }
      })

      if (savedPolicies) {
        // Use saved policies if available
        if (savedPolicies.fulfillmentPolicyId) {
          fulfillmentPolicyId = savedPolicies.fulfillmentPolicyId
        }
        if (savedPolicies.paymentPolicyId) {
          paymentPolicyId = savedPolicies.paymentPolicyId
        }
        if (savedPolicies.returnPolicyId) {
          returnPolicyId = savedPolicies.returnPolicyId
        }
        console.log("Using saved policies:", { fulfillmentPolicyId, paymentPolicyId, returnPolicyId })
      } else {
        // Fall back to fetching policies from eBay
        console.log("No saved policies found, fetching from eBay...")
        
        // Fetch Fulfillment Policy
        try {
          const fulfillmentResponse = await fetch(
            `${baseUrl}/sell/account/v1/fulfillment_policy`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Content-Language': 'en-US',
                'Accept-Language': 'en-US',
                'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
              },
            }
          )
          
          if (fulfillmentResponse.ok) {
            const data = await fulfillmentResponse.json()
            if (data.fulfillmentPolicies && data.fulfillmentPolicies.length > 0) {
              fulfillmentPolicyId = data.fulfillmentPolicies[0].fulfillmentPolicyId
              console.log("Found fulfillment policy:", fulfillmentPolicyId)
            }
          }
        } catch (err) {
          console.error("Failed to fetch fulfillment policy:", err)
        }
        
        // Fetch Payment Policy
        try {
          const paymentResponse = await fetch(
            `${baseUrl}/sell/account/v1/payment_policy`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Content-Language': 'en-US',
                'Accept-Language': 'en-US',
                'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
              },
            }
          )
          
          if (paymentResponse.ok) {
            const data = await paymentResponse.json()
            if (data.paymentPolicies && data.paymentPolicies.length > 0) {
              paymentPolicyId = data.paymentPolicies[0].paymentPolicyId
              console.log("Found payment policy:", paymentPolicyId)
            }
          }
        } catch (err) {
          console.error("Failed to fetch payment policy:", err)
        }
        
        // Fetch Return Policy
        try {
          const returnResponse = await fetch(
            `${baseUrl}/sell/account/v1/return_policy`,
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Content-Language': 'en-US',
                'Accept-Language': 'en-US',
                'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
              },
            }
          )
          
          if (returnResponse.ok) {
            const data = await returnResponse.json()
            if (data.returnPolicies && data.returnPolicies.length > 0) {
              returnPolicyId = data.returnPolicies[0].returnPolicyId
              console.log("Found return policy:", returnPolicyId)
            }
          }
        } catch (err) {
          console.error("Failed to fetch return policy:", err)
        }
      }
    } catch (policyError) {
      console.error("Error fetching policies:", policyError)
      // Use defaults if policy fetch fails
    }

    // Step 4: Create an offer
    // Try to get category from Browse API data first, then fallback
    let finalCategoryId = categoryId
    
    // If we have categories array from Browse API, use the primary category
    if (!finalCategoryId && categories && Array.isArray(categories) && categories.length > 0) {
      // Browse API returns categories with categoryId
      const primaryCategory = categories[0]
      if (primaryCategory && primaryCategory.categoryId) {
        finalCategoryId = primaryCategory.categoryId
        console.log("Using category from Browse API:", primaryCategory.categoryName || primaryCategory.categoryId)
      }
    }
    
    // If still no category, use default
    if (!finalCategoryId || finalCategoryId === "") {
      // Default to Movies & TV category (267) - common for DVDs/Blu-rays
      finalCategoryId = "267"
      console.warn("No category provided, using default category 267 (Movies & TV)")
    }
    
    const offerPayload: any = {
      sku: finalSku,
      marketplaceId: "EBAY_US",
      format: "FIXED_PRICE",
      listingDescription: description.substring(0, 50000), // eBay description limit
      listingDuration: "GTC", // Good 'Til Cancelled - recommended for fixed price
      includeCatalogProductDetails: true, // Use eBay catalog data when available
      pricingSummary: {
        price: {
          value: parseFloat(price).toFixed(2),
          currency: "USD",
        },
      },
      categoryId: finalCategoryId,
      availableQuantity: 1, // Explicit quantity (recommended)
      merchantLocationKey: merchantLocationKey, // Required for publishing
    }
    
    // Add listing policies if we have them
    if (fulfillmentPolicyId !== "default" || paymentPolicyId !== "default" || returnPolicyId !== "default") {
      offerPayload.listingPolicies = {
        fulfillmentPolicyId: fulfillmentPolicyId,
        paymentPolicyId: paymentPolicyId,
        returnPolicyId: returnPolicyId,
      }
    }
    
    console.log("Offer payload includes:", {
      listingDuration: offerPayload.listingDuration,
      includeCatalogProductDetails: offerPayload.includeCatalogProductDetails,
      categoryId: finalCategoryId,
      hasEpid: !!epid,
      imageCount: allImages.length
    })
    
    // Log complete request details for Postman
    const offerUrl = `${baseUrl}/sell/inventory/v1/offer`
    console.log("=".repeat(80))
    console.log("API CALL #4: CREATE OFFER")
    console.log("URL:", offerUrl)
    console.log("Method: POST")
    console.log("Headers:", JSON.stringify({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Language': 'en-US',
      'Accept-Language': 'en-US',
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
    }, null, 2))
    console.log("Body:", JSON.stringify(offerPayload, null, 2))
    console.log("=".repeat(80))

    const offerResponse = await fetch(
      offerUrl,
      {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Content-Language': 'en-US',
          'Accept-Language': 'en-US',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
        body: JSON.stringify(offerPayload),
      }
    )

    // Check for 401 Unauthorized - token might be invalid
    if (offerResponse.status === 401) {
      console.error("401 Unauthorized from eBay Offer API - token may be invalid")
      const errorData = await offerResponse.json().catch(() => ({}))
      const errorCode = errorData.errors?.[0]?.errorId || errorData.errors?.[0]?.code
      
      if (errorCode === 2004) {
        console.error("Error 2004 in offer creation - token missing required scopes.")
        return NextResponse.json(
          { 
            error: "Your eBay token is missing the required 'sell.inventory' scope for creating offers. Please disconnect and reconnect your eBay account.",
            errorCode: 2004,
            needsReconnect: true,
          },
          { status: 401 }
        )
      }
    }

    if (!offerResponse.ok) {
      const errorData = await offerResponse.json().catch(() => ({}))
      const errorCode = errorData.errors?.[0]?.errorId
      
      // Error 25002: Offer already exists - try to update existing offer instead
      if (errorCode === 25002) {
        console.log("Offer already exists, attempting to update existing offer...")
        const existingOfferId = errorData.errors?.[0]?.parameters?.find((p: any) => p.name === "offerId")?.value
        
        if (existingOfferId) {
          console.log("Found existing offer ID:", existingOfferId)
          
          // Try to update the existing offer
          const updateUrl = `${baseUrl}/sell/inventory/v1/offer/${existingOfferId}`
          console.log("Updating existing offer:", updateUrl)
          
          const updateResponse = await fetch(updateUrl, {
            method: "PUT",
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Content-Language': 'en-US',
              'Accept-Language': 'en-US',
              'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
            },
            body: JSON.stringify(offerPayload),
          })
          
          if (updateResponse.ok) {
            console.log("✅ Existing offer updated successfully")
            // Use the existing offer ID to publish
            const offerId = existingOfferId
            
            // Continue to Step 5: Publish the offer
            const publishUrl = `${baseUrl}/sell/inventory/v1/offer/${offerId}/publish`
            console.log("=".repeat(80))
            console.log("API CALL #5: PUBLISH OFFER (existing)")
            console.log("URL:", publishUrl)
            console.log("=".repeat(80))
            
            const publishResponse = await fetch(publishUrl, {
              method: "POST",
              headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Content-Language': 'en-US',
                'Accept-Language': 'en-US',
                'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
              },
            })
            
            if (!publishResponse.ok) {
              const publishErrorData = await publishResponse.json().catch(() => ({}))
              const publishErrorMessage = publishErrorData.errors?.[0]?.message || "Failed to publish existing offer"
              return NextResponse.json(
                { 
                  error: publishErrorMessage,
                  details: publishErrorData,
                  offerId: offerId,
                  hint: "Offer updated but not published. You can publish it manually from your eBay Seller Hub.",
                },
                { status: publishResponse.status }
              )
            }
            
            const publishData = await publishResponse.json()
            
            // Update SKU counter after successful listing
            if (shouldIncrementCounter) {
              try {
                await (prisma as any).skuSettings.update({
                  where: { userId: session.user.id },
                  data: {
                    nextSkuCounter: skuSettings.nextSkuCounter + 1,
                  }
                })
              } catch (error) {
                console.error("Failed to update SKU counter:", error)
              }
            }
            
            return NextResponse.json({
              success: true,
              message: "Product listing updated and published successfully on eBay",
              listingId: publishData.listingId,
              offerId: offerId,
              sku: finalSku,
              listingUrl: `https://www.ebay.com/itm/${publishData.listingId}`,
              updated: true, // Flag to indicate this was an update, not new listing
            })
          } else {
            const updateErrorData = await updateResponse.json().catch(() => ({}))
            console.error("Failed to update existing offer:", updateErrorData)
            
            // If update fails, suggest deleting and trying again
            return NextResponse.json(
              { 
                error: "An offer already exists for this SKU and could not be updated. Please try a different product or wait a moment.",
                details: updateErrorData,
                existingOfferId: existingOfferId,
                hint: "The SKU is already in use. Either list a different product or contact support to remove the existing offer.",
              },
              { status: 409 } // 409 Conflict
            )
          }
        }
      }
      
      // If offer creation fails for other reasons, try to clean up the inventory item
      try {
        await fetch(`${baseUrl}/sell/inventory/v1/inventory_item/${finalSku}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
          },
        })
      } catch (cleanupError) {
        // Ignore cleanup errors
      }

      const errorMessage = errorData.errors?.[0]?.message || errorData.errors?.[0]?.longMessage || "Failed to create offer"
      let hint = "You may need to set up fulfillment, payment, and return policies in your eBay account first."
      
      // Provide more specific hints based on error
      if (errorMessage.includes("policy") || errorMessage.includes("Policy")) {
        hint = "Please set up fulfillment, payment, and return policies in your eBay Seller Hub first."
      } else if (errorMessage.includes("category") || errorMessage.includes("Category")) {
        hint = "The category ID might be invalid. Please check the product category."
      } else if (errorMessage.includes("SKU") || errorMessage.includes("sku")) {
        hint = "There was an issue with the product SKU. Please try again."
      }

      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorData,
          hint: hint,
          rawEbayError: errorData, // Full raw error from eBay
          ebayErrorMessage: errorData.errors?.[0] || errorData // First error or full error object
        },
        { status: offerResponse.status }
      )
    }

    const offerData = await offerResponse.json()
    const offerId = offerData.offerId

    if (!offerId) {
      return NextResponse.json(
        { 
          error: "Offer created but no offer ID returned",
          details: offerData,
        },
        { status: 500 }
      )
    }

    // Step 5: Publish the offer
    const publishUrl = `${baseUrl}/sell/inventory/v1/offer/${offerId}/publish`
    console.log("=".repeat(80))
    console.log("API CALL #5: PUBLISH OFFER")
    console.log("URL:", publishUrl)
    console.log("Method: POST")
    console.log("Headers:", JSON.stringify({
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Content-Language': 'en-US',
      'Accept-Language': 'en-US',
      'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
    }, null, 2))
    console.log("Body: {} (empty)")
    console.log("=".repeat(80))
    
    const publishResponse = await fetch(
      publishUrl,
      {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Content-Language': 'en-US',
          'Accept-Language': 'en-US',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
      }
    )

    // Check for 401 Unauthorized - token might be invalid
    if (publishResponse.status === 401) {
      console.error("401 Unauthorized from eBay Publish API - token may be invalid")
      const errorData = await publishResponse.json().catch(() => ({}))
      const errorCode = errorData.errors?.[0]?.errorId || errorData.errors?.[0]?.code
      
      if (errorCode === 2004) {
        console.error("Error 2004 in publish - token missing required scopes.")
        return NextResponse.json(
          { 
            error: "Your eBay token is missing the required 'sell.inventory' scope for publishing listings. Please disconnect and reconnect your eBay account.",
            errorCode: 2004,
            needsReconnect: true,
          },
          { status: 401 }
        )
      }
    }

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json().catch(() => ({}))
      const errorMessage = errorData.errors?.[0]?.message || errorData.errors?.[0]?.longMessage || "Failed to publish listing"
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorData,
          offerId: offerId,
          hint: "Offer created but not published. You can publish it manually from your eBay Seller Hub.",
          rawEbayError: errorData, // Full raw error from eBay
          ebayErrorMessage: errorData.errors?.[0] || errorData // First error or full error object
        },
        { status: publishResponse.status }
      )
    }

    const publishData = await publishResponse.json()

    // Update SKU counter after successful listing
    if (shouldIncrementCounter) {
      try {
        await (prisma as any).skuSettings.update({
          where: { userId: session.user.id },
          data: {
            nextSkuCounter: skuSettings.nextSkuCounter + 1,
          }
        })
      } catch (error) {
        // Log error but don't fail the listing if counter update fails
        console.error("Failed to update SKU counter:", error)
      }
    }

    return NextResponse.json({
      success: true,
      message: "Product listed successfully on eBay",
      listingId: publishData.listingId,
      offerId: offerId,
      sku: finalSku,
      listingUrl: `https://www.ebay.com/itm/${publishData.listingId}`,
    })
  } catch (error) {
    console.error("Error in eBay list endpoint:", error)
    return NextResponse.json(
      { 
        error: "Something went wrong", 
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

// Helper function to map condition to eBay condition enum
function mapConditionToEbay(condition: string): string {
  const conditionMap: { [key: string]: string } = {
    "Brand New": "NEW",
    "New Other": "NEW_OTHER",
    "New with Defects": "NEW_WITH_DEFECTS",
    "Manufacturer Refurbished": "MANUFACTURER_REFURBISHED",
    "Seller Refurbished": "SELLER_REFURBISHED",
    "Used - Excellent": "USED_EXCELLENT",
    "Used - Very Good": "USED_VERY_GOOD",
    "Used - Good": "USED_GOOD",
    "Used - Acceptable": "USED_ACCEPTABLE",
    "For Parts or Not Working": "FOR_PARTS_OR_NOT_WORKING",
  }
  
  return conditionMap[condition] || "NEW"
}

