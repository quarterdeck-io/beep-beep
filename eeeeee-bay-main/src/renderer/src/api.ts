/**
 * Initiates eBay OAuth login flow
 * Opens eBay authorization page in a popup and handles the OAuth code exchange
 * @param clientId - eBay application client ID
 * @param scope - OAuth scopes to request (space-separated)
 * @param port - Local server port for OAuth callback (default: 3000)
 * @param sandbox - Whether to use eBay sandbox environment
 * @returns Promise resolving to access token or null on failure
 * @throws Error if client secret is missing or OAuth login unavailable
 */
export async function ebayOAuthLogin(
  clientId: string,
  scope: string = 'https://api.ebay.com/oauth/api_scope',
  port: number = 3000,
  sandbox: boolean = false
): Promise<string | null> {
  const redirectUri = import.meta.env.VITE_EBAY_CALLBACK_URL || `https://localhost:${port}/callback`
  const authUrl = `https://auth.${sandbox ? 'sandbox.' : ''}ebay.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}&prompt=consent`

  // Get client secret from environment variables
  const clientSecret = import.meta.env.VITE_EBAY_CLIENT_SECRET || ''
  if (!clientSecret) {
    throw new Error('Missing eBay Client Secret in .env')
  }

  if (window.api && typeof window.api.oauthLogin === 'function') {
    return await window.api.oauthLogin(authUrl, redirectUri, clientId, clientSecret, sandbox)
  } else {
    throw new Error('OAuth login is only available in the Electron app.')
  }
}

/**
 * Initializes the eBay API client with application credentials
 * Must be called before making any eBay API calls
 * @returns Promise resolving to initialization result
 */
export async function initEbay(): Promise<{ success: boolean; error?: string }> {
  const config = {
    appID: import.meta.env.VITE_EBAY_CLIENT_ID,
    certID: import.meta.env.VITE_EBAY_CLIENT_SECRET,
    sandbox: import.meta.env.VITE_EBAY_SANDBOX === 'true',
    siteID: 0
  }
  return await window.api.ebayInit(config)
}

interface ProductResult {
  upc?: string
  title?: string
  price?: string
  currency?: string
  image?: string
  condition?: string
  conditionId?: string
  category?: string
  categoryId?: string
  categories?: Array<{ categoryId: string; categoryName: string }>
  brand?: string
  mpn?: string
  sku?: string // Pre-generated SKU from backend
  quantity?: number
  description?: string
  shippingOptions?: unknown[]
  marketingPrice?: unknown
  additionalImages?: unknown[]
  aspects?: Record<string, unknown>
  gtin?: string[]
  isDuplicate?: boolean
  log?: string
}

/**
 * Searches for product information by UPC barcode
 * Queries eBay's catalog API and returns formatted product data
 * @param upc - UPC or EAN barcode string to search for
 * @returns Promise resolving to product data or error message
 */
export async function searchProductByUpc(upc: string): Promise<ProductResult | { log: string }> {
  try {
    const result = await window.api.ebaySearchUpc(upc)
    if (result.success) {
      if (result.data) {
        // Use the SKU that was pre-generated in the backend, or fallback to old method
        let sku = result.data.sku
        if (!sku) {
          // Fallback: generate SKU using old method if backend didn't provide one
          const skuResult = await window.api.ebayGetNextSku()
          sku = skuResult.success
            ? skuResult.data
            : `${window.api.constants.INVENTORY.SKU_PREFIX}${upc}`
        }

        // Check for duplicates by UPC
        const duplicateResult = await window.api.ebayCheckDuplicate(upc)
        const isDuplicate = duplicateResult.success ? duplicateResult.data : false

        return {
          upc,
          title: result.data.title,
          price: result.data.price?.value || '',
          currency: result.data.price?.currency || window.api.constants.SHIPPING.DEFAULT_CURRENCY,
          image: result.data.image?.imageUrl || '',
          condition: result.data.condition || '',
          conditionId: result.data.conditionId || '',
          category: result.data.categories?.[0]?.categoryName || '',
          categoryId: result.data.categories?.[0]?.categoryId || '',
          categories: result.data.categories || [],
          brand: result.data.brand || '',
          mpn: result.data.epid || '', // Use epid as MPN if available
          sku: sku,
          quantity: window.api.constants.LISTING.DEFAULT_QUANTITY, // Default quantity
          description: result.data.description || result.data.title || '',
          shippingOptions: result.data.shippingOptions || [],
          marketingPrice: result.data.marketingPrice,
          additionalImages: result.data.additionalImages || [],
          aspects: result.data.aspects,
          gtin: result.data.gtin,
          isDuplicate: isDuplicate,
          log: `Found product: ${result.data.title}${isDuplicate ? ' (DUPLICATE DETECTED!)' : ''}`
        }
      } else {
        return { log: `No products found for UPC: ${upc}. Please check the barcode and try again.` }
      }
    } else {
      // Provide more user-friendly error messages
      let errorMessage = 'An error occurred while searching for the product.'
      if (result.error?.includes('timeout')) {
        errorMessage = 'Search timed out. Please check your internet connection and try again.'
      } else if (result.error?.includes('network') || result.error?.includes('fetch')) {
        errorMessage = 'Network error. Please check your internet connection and try again.'
      } else if (result.error?.includes('401') || result.error?.includes('403')) {
        errorMessage = 'Authentication error. Please log out and log back in.'
      } else if (result.error?.includes('429')) {
        errorMessage = 'Too many requests. Please wait a moment and try again.'
      }
      return { log: `Error: ${errorMessage}` }
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { log: `Unexpected error: ${errorMessage}` }
  }
}

interface ListingInput {
  title: string
  description: string
  price: number
  upc?: string
  brand?: string
  conditionId?: string
  categories?: Array<{ categoryId: string; categoryName: string }>
  image?: string
  aspects?: Record<string, unknown>
}

interface ListingResult {
  success: boolean
  listingId?: string
  offerId?: string
  sku?: string
  error?: string
  log: string
}

interface ApiResult<T = void> {
  success: boolean
  data?: T
  error?: string
}

/**
 * Creates and publishes a complete eBay listing
 * Handles inventory creation, offer setup, and publishing in a single operation
 * @param listing - Complete listing data including title, price, images, etc.
 * @returns Promise resolving to listing creation result with success/error status
 */
export async function createAndPublishListing(listing: ListingInput): Promise<ListingResult> {
  try {
    // Convert listing data to Product interface
    const product: Record<string, unknown> = {
      title: listing.title,
      description: listing.description,
      price: {
        value: listing.price.toString(),
        currency: window.api.constants.SHIPPING.DEFAULT_CURRENCY
      },
      gtin: listing.upc ? [listing.upc] : undefined,
      brand: listing.brand || window.api.constants.EBAY.DEFAULT_BRAND,
      conditionId: listing.conditionId || window.api.constants.LISTING.DEFAULT_CONDITION_ID,
      categories: listing.categories || [
        {
          categoryId: window.api.constants.EBAY.CATEGORY_ID,
          categoryName: 'DVDs & Blu-ray Discs'
        }
      ],
      image: listing.image ? { imageUrl: listing.image } : undefined,
      aspects: listing.aspects ? JSON.parse(JSON.stringify(listing.aspects)) : undefined
    }

    // Use the centralized eBay service function
    const result = await window.api.ebayCreateAndPublishListing(JSON.parse(JSON.stringify(product)))

    // Check if the operation was successful
    if (!result.success) {
      const errorText = result.error || 'Listing creation failed. Check logs for details.'
      return {
        success: false,
        error: errorText,
        log: `Failed to create listing: ${errorText}`
      }
    }

    return {
      success: true,
      listingId: result.listingId,
      offerId: result.offerId,
      sku: result.sku,
      log: `Successfully created and published listing with ID: ${result.listingId}`
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const fallbackMessage = errorMessage || 'Listing creation failed. Check logs for details.'
    return {
      success: false,
      error: fallbackMessage,
      log: `Failed to create listing: ${fallbackMessage}`
    }
  }
}

// User settings API functions
/**
 * Sets the current authenticated user for settings management
 * @param userId - Unique user identifier
 * @returns Promise resolving to operation result
 */
export async function setCurrentUser(userId: string): Promise<ApiResult> {
  try {
    const result = await window.api.userSettingsSetCurrentUser(userId)
    if (result.success) {
      return { success: true }
    } else {
      return { success: false, error: result.error }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { success: false, error: errorMessage }
  }
}

/**
 * Retrieves the user's configured eBay policies
 * @returns Promise resolving to policy data or error
 */
export async function getEbayPolicies(): Promise<ApiResult<unknown>> {
  try {
    const result = await window.api.userSettingsGetEbayPolicies()
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      return { success: false, error: result.error }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { success: false, error: errorMessage }
  }
}

export async function setEbayPolicies(policies: {
  paymentPolicyId?: string
  returnPolicyId?: string
  fulfillmentPolicyId?: string
}): Promise<ApiResult> {
  try {
    const result = await window.api.userSettingsSetEbayPolicies(policies)
    if (result.success) {
      return { success: true }
    } else {
      return { success: false, error: result.error }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { success: false, error: errorMessage }
  }
}

export async function hasEbayPolicies(): Promise<ApiResult<boolean>> {
  try {
    const result = await window.api.userSettingsHasEbayPolicies()
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      return { success: false, error: result.error }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { success: false, error: errorMessage }
  }
}

export async function clearUserSettings(): Promise<ApiResult> {
  try {
    const result = await window.api.userSettingsClear()
    if (result.success) {
      return { success: true }
    } else {
      return { success: false, error: result.error }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { success: false, error: errorMessage }
  }
}

export async function getInitialSku(): Promise<ApiResult<number>> {
  try {
    const result = await window.api.userSettingsGetInitialSku()
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      return { success: false, error: result.error }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { success: false, error: errorMessage }
  }
}

export async function setInitialSku(initialSku: number): Promise<ApiResult> {
  try {
    const result = await window.api.userSettingsSetInitialSku(initialSku)
    if (result.success) {
      return { success: true }
    } else {
      return { success: false, error: result.error }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { success: false, error: errorMessage }
  }
}

export async function getFulfillmentPolicies(marketplaceId?: string): Promise<ApiResult<unknown>> {
  try {
    const result = await window.api.ebayGetFulfillmentPolicies(marketplaceId)
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      return { success: false, error: result.error }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { success: false, error: errorMessage }
  }
}

export async function getPaymentPolicies(marketplaceId?: string): Promise<ApiResult<unknown>> {
  try {
    const result = await window.api.ebayGetPaymentPolicies(marketplaceId)
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      return { success: false, error: result.error }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { success: false, error: errorMessage }
  }
}

export async function getReturnPolicies(marketplaceId?: string): Promise<ApiResult<unknown>> {
  try {
    const result = await window.api.ebayGetReturnPolicies(marketplaceId)
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      return { success: false, error: result.error }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { success: false, error: errorMessage }
  }
}

export async function optInToProgram(programType: string): Promise<ApiResult<unknown>> {
  try {
    const result = await window.api.ebayOptInToProgram(programType)
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      return { success: false, error: result.error }
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return { success: false, error: errorMessage }
  }
}
