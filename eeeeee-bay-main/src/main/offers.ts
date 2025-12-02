import { log } from './logger'
import { getOfferApi, getCurrentConfig } from './config'
import { ensureValidAccessToken } from './auth'
import { createInventoryItemWithDefaults, getOrCreateDefaultLocation } from './inventory'
import { validateEbayPolicies } from './utils'
import { checkForDuplicate } from './inventory'
import { userSettingsManager } from './userSettings'
import { EBAY_CONSTANTS, SHIPPING_CONSTANTS } from './constants'
import type { Product } from './types'

type EbayApiError = {
  message?: string
  response?: {
    status?: number
    body?: {
      errors?: Array<{
        errorId?: number
        message?: string
        longMessage?: string
        parameters?: Array<{ name?: string; value?: string }>
      }>
    }
  }
  [key: string]: unknown
}

function extractEbayErrorMessage(error: unknown): string {
  if (!error || (typeof error !== 'object' && !(error instanceof Error))) {
    return String(error)
  }

  const errObj = error as EbayApiError
  const parts: string[] = []

  if (errObj.message && typeof errObj.message === 'string') {
    parts.push(errObj.message)
  } else if (error instanceof Error && error.message) {
    parts.push(error.message)
  }

  const status = errObj.response?.status
  if (typeof status === 'number') {
    parts.push(`Status ${status}`)
  }

  const apiErrors = errObj.response?.body?.errors
  if (Array.isArray(apiErrors) && apiErrors.length > 0) {
    const formattedErrors = apiErrors
      .map((apiError) => {
        const errorBits: string[] = []
        if (apiError.errorId !== undefined) {
          errorBits.push(`ID ${apiError.errorId}`)
        }
        if (apiError.message) {
          errorBits.push(apiError.message)
        }
        if (apiError.longMessage) {
          errorBits.push(apiError.longMessage)
        }
        if (apiError.parameters && apiError.parameters.length > 0) {
          const params = apiError.parameters
            .map((param) => `${param.name ?? 'param'}=${param.value ?? 'unknown'}`)
            .join(', ')
          errorBits.push(`parameters: ${params}`)
        }
        return errorBits.join(' - ')
      })
      .filter(Boolean)
      .join(' | ')

    if (formattedErrors) {
      parts.push(`Errors: ${formattedErrors}`)
    }
  }

  if (parts.length === 0) {
    try {
      parts.push(JSON.stringify(error, null, 2))
    } catch {
      parts.push(String(error))
    }
  }

  return parts.join(' | ')
}

/**
 * Interface for offer creation data
 */
export interface OfferData {
  sku: string
  marketplaceId: string
  format: string
  pricingSummary: {
    price: {
      currency: string
      value: string
    }
  }
  quantityLimitPerBuyer: number
  listingPolicies: {
    paymentPolicyId: string
    returnPolicyId: string
    fulfillmentPolicyId: string
  }
  categoryId: string
  merchantLocationKey: string
}

/**
 * Interface for listing creation result
 */
export interface ListingResult {
  listingId: string
  offerId: string
  sku: string
}

/**
 * Interface for offer creation response
 */
export interface OfferResponse {
  offerId: string
  [key: string]: unknown
}

/**
 * Interface for offer publish response
 */
export interface PublishResponse {
  listingId: string
  [key: string]: unknown
}

/**
 * Creates an offer for an inventory item
 * @param offerData - The offer data to create
 * @returns Promise resolving to the created offer
 */
export async function createOffer(offerData: OfferData): Promise<OfferResponse> {
  log(`[EBAY-SERVICE] Creating offer`)

  const offerApi = getOfferApi()
  if (!offerApi) {
    log(`[EBAY-SERVICE] Error: eBay API not initialized`)
    throw new Error('eBay API not initialized. Please call initializeEbayApi first.')
  }

  const currentConfig = getCurrentConfig()
  // Ensure we have a valid access token
  await ensureValidAccessToken(
    currentConfig?.appID || '',
    currentConfig?.certID || '',
    currentConfig?.sandbox
  )

  return new Promise((resolve, reject) => {
    log(
      `[EBAY-SERVICE] Making createOffer API call with offer data: ${JSON.stringify(offerData, null, 2)}`
    )
    offerApi.createOffer('en-US', 'application/json', offerData, (error, data, response) => {
      log(`[EBAY-SERVICE] createOffer API call completed`)
      log(`[EBAY-SERVICE] Response status: ${response?.status}`)
      log(`[EBAY-SERVICE] Response headers: ${JSON.stringify(response?.headers, null, 2)}`)

      if (error) {
        log(`[EBAY-SERVICE] Error creating offer: ${JSON.stringify(error, null, 2)}`)
        log(`[EBAY-SERVICE] Error type: ${error.constructor.name}`)
        if (error.response) {
          log(`[EBAY-SERVICE] Error response status: ${error.response.status}`)
          log(
            `[EBAY-SERVICE] Error response headers: ${JSON.stringify(error.response.headers, null, 2)}`
          )
          log(`[EBAY-SERVICE] Error response body: ${JSON.stringify(error.response.body, null, 2)}`)
        }
        reject(error)
      } else {
        log(`[EBAY-SERVICE] Successfully created offer`)
        resolve(data as OfferResponse)
      }
    })
  })
}

/**
 * Publishes an offer to create a live listing
 * @param offerId - The ID of the offer to publish
 * @returns Promise resolving to the publish result
 */
export async function publishOffer(offerId: string): Promise<PublishResponse> {
  log(`[EBAY-SERVICE] Publishing offer: ${offerId}`)

  const offerApi = getOfferApi()
  if (!offerApi) {
    log(`[EBAY-SERVICE] Error: eBay API not initialized`)
    throw new Error('eBay API not initialized. Please call initializeEbayApi first.')
  }

  const currentConfig = getCurrentConfig()
  // Ensure we have a valid access token
  await ensureValidAccessToken(
    currentConfig?.appID || '',
    currentConfig?.certID || '',
    currentConfig?.sandbox
  )

  return new Promise((resolve, reject) => {
    offerApi.publishOffer(offerId, (error, data, response) => {
      log(`[EBAY-SERVICE] publishOffer API call completed`)
      log(`[EBAY-SERVICE] Response status: ${response?.status}`)
      log(`[EBAY-SERVICE] Response headers: ${JSON.stringify(response?.headers, null, 2)}`)

      if (error) {
        log(`[EBAY-SERVICE] Error publishing offer: ${JSON.stringify(error, null, 2)}`)
        log(`[EBAY-SERVICE] Error type: ${error.constructor.name}`)
        if (error.response) {
          log(`[EBAY-SERVICE] Error response status: ${error.response.status}`)
          log(
            `[EBAY-SERVICE] Error response headers: ${JSON.stringify(error.response.headers, null, 2)}`
          )
          log(`[EBAY-SERVICE] Error response body: ${JSON.stringify(error.response.body, null, 2)}`)
        }
        reject(error)
      } else {
        log(`[EBAY-SERVICE] Successfully published offer`)
        resolve(data as PublishResponse)
      }
    })
  })
}

/**
 * Creates and publishes a complete eBay listing in a single operation
 * Handles inventory item creation, offer setup, and publishing
 * @param product - Complete product data including title, price, images, etc.
 * @returns Promise resolving to listing creation result with IDs
 * @throws Error if policies not configured, duplicate found, or API errors
 */
export async function createAndPublishListing(product: Product): Promise<ListingResult> {
  log(`[EBAY-SERVICE] Creating and publishing listing for product: ${product.title}`)

  try {
    // Validate that policies are configured
    const policyValidation = validateEbayPolicies()
    if (!policyValidation.valid) {
      throw new Error(`Missing required eBay policies: ${policyValidation.missing.join(', ')}`)
    }

    // Check for duplicates first
    if (product.gtin && product.gtin.length > 0) {
      try {
        const isDuplicateSku = await checkForDuplicate(product.gtin[0])
        if (isDuplicateSku) {
          throw new Error(
            `Duplicate item (SKU: ${isDuplicateSku}) found for UPC: ${product.gtin[0]}`
          )
        }
      } catch (error) {
        log(`[EBAY-SERVICE] Warning: Could not check for duplicates: ${error}`)
        // Continue anyway, as duplicate check failure shouldn't block listing
      }
    }

    // Create inventory item using centralized logic
    const wasSkuPreGenerated = !!product.sku
    const inventoryResult = await createInventoryItemWithDefaults(product)
    let sku = inventoryResult.sku

    // Get or create a default location for the offer
    const merchantLocationKey = await getOrCreateDefaultLocation()

    // Create offer - with retry logic for existing offers
    const currentUser = userSettingsManager.getCurrentUser()
    if (!currentUser) {
      throw new Error('User not authenticated')
    }

    const userPolicies = userSettingsManager.getEbayPolicies(currentUser)
    if (
      !userPolicies.paymentPolicyId ||
      !userPolicies.returnPolicyId ||
      !userPolicies.fulfillmentPolicyId
    ) {
      throw new Error(
        'Missing required eBay policies. Please configure payment, return, and fulfillment policies.'
      )
    }

    const offerData: OfferData = {
      sku: sku,
      marketplaceId: EBAY_CONSTANTS().MARKETPLACE_ID,
      format: EBAY_CONSTANTS().FORMAT_FIXED_PRICE,
      pricingSummary: {
        price: {
          currency: SHIPPING_CONSTANTS().DEFAULT_CURRENCY,
          value: product.price?.value || '0.00'
        }
      },
      quantityLimitPerBuyer: EBAY_CONSTANTS().QUANTITY_LIMIT_PER_BUYER,
      listingPolicies: {
        paymentPolicyId: userPolicies.paymentPolicyId,
        returnPolicyId: userPolicies.returnPolicyId,
        fulfillmentPolicyId: userPolicies.fulfillmentPolicyId
      },
      categoryId: product.categories?.[0]?.categoryId || EBAY_CONSTANTS().CATEGORY_ID,
      merchantLocationKey: merchantLocationKey
    }

    let offerResult
    let offerId
    try {
      offerResult = await createOffer(offerData)
      offerId = offerResult.offerId
    } catch (error: unknown) {
      // Check if this is an "offer already exists" error
      const apiError = error as {
        response?: {
          body?: {
            errors?: Array<{ errorId: number; parameters?: Array<{ name: string; value: string }> }>
          }
        }
      }
      if (apiError.response?.body?.errors?.[0]?.errorId === 25002) {
        // Extract the existing offer ID from the error
        const existingOfferId = apiError.response.body.errors[0].parameters?.find(
          (p) => p.name === 'offerId'
        )?.value

        if (existingOfferId) {
          log(
            `[EBAY-SERVICE] Offer already exists for SKU ${sku}, using existing offer ID: ${existingOfferId}`
          )
          offerId = existingOfferId
        } else {
          // If we can't get the offer ID, we need to generate a new SKU and try again
          log(`[EBAY-SERVICE] Offer exists but no offer ID found, generating new SKU and retrying`)
          // Clear the pre-generated SKU to force a new one
          const productForRetry = { ...product, sku: undefined }
          const newInventoryResult = await createInventoryItemWithDefaults(productForRetry)
          const newSku = newInventoryResult.sku

          const newOfferData = { ...offerData, sku: newSku }
          const newOfferResult = await createOffer(newOfferData)
          offerId = newOfferResult.offerId
          // Update the SKU we're using
          sku = newSku
        }
      } else {
        // Re-throw if it's a different error
        throw error
      }
    }

    // Publish offer
    const publishResult = await publishOffer(offerId)

    // Increment SKU counter after successful listing (only if SKU was newly generated)
    if (!wasSkuPreGenerated) {
      const userId = userSettingsManager.getCurrentUser()
      if (userId) {
        const currentCounter = userSettingsManager.getCurrentSkuCounter(userId) || 0
        userSettingsManager.setCurrentSkuCounter(userId, currentCounter + 1)
        log(`[EBAY-SERVICE] Incremented SKU counter to ${currentCounter + 1}`)
      }
    } else {
      log(`[EBAY-SERVICE] Using pre-generated SKU, not incrementing counter`)
    }

    log(
      `[EBAY-SERVICE] Successfully created and published listing with ID: ${publishResult.listingId}`
    )
    return {
      listingId: publishResult.listingId,
      offerId: offerId,
      sku: sku
    }
  } catch (error) {
    const errorMessage = extractEbayErrorMessage(error)
    log(`[EBAY-SERVICE] Error creating and publishing listing: ${errorMessage}`)
    try {
      log(
        `[EBAY-SERVICE] Raw createAndPublishListing error payload: ${JSON.stringify(error, null, 2)}`
      )
    } catch {
      log('[EBAY-SERVICE] Raw createAndPublishListing error payload could not be serialized')
    }
    throw new Error(errorMessage)
  }
}
