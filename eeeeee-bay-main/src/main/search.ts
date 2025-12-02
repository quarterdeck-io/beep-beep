import { getItemSummaryApi, getItemApi } from './config'
import {
  Product,
  EbayItem,
  SearchPagedCollection,
  ItemSummary,
  Category,
  Image,
  SearchOptions
} from './types'
import { ensureValidAccessToken } from './auth'
import { log } from './logger'
import {
  SHIPPING_CONSTANTS,
  PRICING_CONSTANTS,
  LISTING_CONSTANTS,
  CATEGORY_CONSTANTS,
  API_CONSTANTS,
  IMAGES_CONSTANTS
} from './constants'
import { getNextSku } from './inventory'

/**
 * Searches for product information using UPC/EAN barcode
 * Queries eBay's Browse API and returns formatted product data
 * @param upc - UPC or EAN barcode string to search for
 * @param timeoutMs - Request timeout in milliseconds (default: 10000)
 * @returns Promise resolving to Product data or null if not found
 * @throws Error if API not initialized or request fails
 */
export async function searchByUPC(
  upc: string,
  timeoutMs: number = API_CONSTANTS().DEFAULT_TIMEOUT_MS
): Promise<Product | null> {
  // Clean the UPC: remove any non-digit characters (handles "UPC-123", "UPC 123", etc.)
  const cleanUpc = upc.replace(/\D/g, '')
  
  if (!cleanUpc) {
    throw new Error('Invalid UPC: must contain at least one digit')
  }
  
  log(`[EBAY-SERVICE] Searching by UPC: ${upc} (cleaned: ${cleanUpc}, timeout: ${timeoutMs}ms)`)

  const itemSummaryApi = getItemSummaryApi()
  if (!itemSummaryApi) {
    log(`[EBAY-SERVICE] Error: eBay API not initialized`)
    throw new Error('eBay API not initialized. Please call initializeEbayApi first.')
  }

  // Ensure we have a valid access token
  await ensureValidAccessToken(
    '', // These will be filled in by the auth module based on current config
    '',
    undefined
  )

  try {
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
    })

    // Search using GTIN (which includes UPC) - use cleaned UPC
    const searchPromise = new Promise<SearchPagedCollection>((resolve, reject) => {
      itemSummaryApi.search(
        {
          gtin: cleanUpc,
          limit: API_CONSTANTS().MAX_SEARCH_RESULTS.toString()
        },
        (error, data) => {
          if (error) {
            reject(error)
          } else {
            resolve(data as SearchPagedCollection)
          }
        }
      )
    })

    const searchResult = await Promise.race([searchPromise, timeoutPromise])
    log(`[EBAY-SERVICE] UPC search response payload: ${JSON.stringify(searchResult, null, 2)}`)

    if (searchResult && searchResult.itemSummaries && searchResult.itemSummaries.length > 0) {
      const item =
        searchResult.itemSummaries[Math.floor(Math.random() * searchResult.itemSummaries.length)]
      // const item = searchResult.itemSummaries[0] as ItemSummary

      // Get detailed item information to retrieve aspects
      let itemDetails: EbayItem | null = null
      try {
        if (item.itemId) {
          log(`[EBAY-SERVICE] Fetching detailed item information for itemId: ${item.itemId}`)
          itemDetails = await getItemDetails(item.itemId)
        }
      } catch (detailsError) {
        log(`[EBAY-SERVICE] Warning: Could not fetch item details: ${detailsError}`)
        // Continue without aspects if details fetch fails
      }

      const medianPricing = searchResult.itemSummaries
        .filter(
          (item: ItemSummary) =>
            item.price &&
            item.price.value &&
            !isNaN(parseFloat(item.price.value)) &&
            item.price.currency == SHIPPING_CONSTANTS().DEFAULT_CURRENCY
        )
        .map((item: ItemSummary) => parseFloat(item.price!.value))
        .sort((a: number, b: number) => a - b)
      const medianPrice =
        PRICING_CONSTANTS().USE_MEDIAN_PRICING && medianPricing.length > 0
          ? medianPricing[Math.floor(medianPricing.length / 2)]
          : medianPricing.length > 0
            ? medianPricing[0]
            : 0
      // Convert to our Product interface with all available fields
      const product: Product = {
        title: item.title || '',
        epid: item.epid,
        gtin: item.unitPricingMeasure ? [cleanUpc] : undefined,
        aspects: itemDetails?.localizedAspects
          ? itemDetails.localizedAspects.reduce(
              (acc, aspect) => {
                if (aspect.name && aspect.value) {
                  acc[aspect.name] = Array.isArray(aspect.value) ? aspect.value : [aspect.value]
                }
                return acc
              },
              {} as { [key: string]: string[] }
            )
          : undefined,
        image: item.image ? { imageUrl: item.image.imageUrl } : undefined,
        brand: item.brand,
        description: item.shortDescription,
        condition: item.condition || LISTING_CONSTANTS().DEFAULT_CONDITION,
        conditionId: item.conditionId || LISTING_CONSTANTS().DEFAULT_CONDITION_ID,
        price: item.price
          ? {
              value: medianPrice.toFixed(2),
              currency: SHIPPING_CONSTANTS().DEFAULT_CURRENCY
            }
          : undefined,
        categories: item.categories
          ? item.categories.map((cat: Category) => ({
              categoryId: cat.categoryId,
              categoryName: cat.categoryName
            }))
          : CATEGORY_CONSTANTS().AUTO_CATEGORIZE
            ? [
                {
                  categoryId: CATEGORY_CONSTANTS().FALLBACK_CATEGORY_ID,
                  categoryName: 'DVDs & Blu-ray Discs'
                }
              ]
            : undefined,
        seller: undefined, // Will be set to logged-in user when creating listings
        itemLocation: item.itemLocation
          ? {
              country: item.itemLocation.country,
              postalCode: item.itemLocation.postalCode
            }
          : undefined,
        // Use shipping options from constants only
        shippingOptions: [
          {
            shippingCost: {
              value: SHIPPING_CONSTANTS().DEFAULT_COST,
              currency: SHIPPING_CONSTANTS().DEFAULT_CURRENCY
            },
            shippingCostType: SHIPPING_CONSTANTS().DEFAULT_TYPE
          }
        ],
        itemId: item.itemId,
        itemWebUrl: item.itemWebUrl,
        additionalImages: item.additionalImages
          ? item.additionalImages
              .slice(0, IMAGES_CONSTANTS().MAX_ADDITIONAL_IMAGES)
              .map((img: Image) => ({ imageUrl: img.imageUrl }))
          : undefined,
        thumbnailImages:
          IMAGES_CONSTANTS().INCLUDE_THUMBNAILS && item.thumbnailImages
            ? item.thumbnailImages.map((img: Image) => ({ imageUrl: img.imageUrl }))
            : undefined
      }

      // Generate SKU for this product early so it can be displayed in frontend
      try {
        const sku = await getNextSku(product)
        product.sku = sku
        log(`[EBAY-SERVICE] Generated SKU for product: ${sku}`)
      } catch (skuError) {
        log(`[EBAY-SERVICE] Warning: Could not generate SKU: ${skuError}`)
        // Continue without SKU - it will be generated later during listing creation
      }

      log(`[EBAY-SERVICE] Found product: ${product.title}`)
      log(`[EBAY-SERVICE] Product aspects: ${JSON.stringify(product.aspects, null, 2)}`)
      log(`[EBAY-SERVICE] Product categories: ${JSON.stringify(product.categories, null, 2)}`)
      return product
    }

    log(`[EBAY-SERVICE] No products found for UPC: ${cleanUpc}`)
    return null
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    log(`[EBAY-SERVICE] Error searching by UPC: ${errorMessage}`)
    throw error
  }
}

export async function getItemDetails(itemId: string): Promise<EbayItem> {
  log(`[EBAY-SERVICE] Getting item details for: ${itemId}`)

  const itemApi = getItemApi()
  if (!itemApi) {
    log(`[EBAY-SERVICE] Error: eBay API not initialized`)
    throw new Error('eBay API not initialized. Please call initializeEbayApi first.')
  }

  // Ensure we have a valid access token
  await ensureValidAccessToken('', '', undefined)

  return new Promise((resolve, reject) => {
    itemApi.getItem(itemId, {}, (error, data) => {
      if (error) {
        log(`[EBAY-SERVICE] Error getting item details: ${error}`)
        reject(error)
      } else {
        log(`[EBAY-SERVICE] Successfully retrieved item details`)
        log(`[EBAY-SERVICE] Item details response payload: ${JSON.stringify(data, null, 2)}`)
        resolve(data)
      }
    })
  })
}

export async function searchItems(
  query: string,
  options: SearchOptions = {}
): Promise<SearchPagedCollection> {
  log(`[EBAY-SERVICE] Searching items with query: ${query}`)

  const itemSummaryApi = getItemSummaryApi()
  if (!itemSummaryApi) {
    log(`[EBAY-SERVICE] Error: eBay API not initialized`)
    throw new Error('eBay API not initialized. Please call initializeEbayApi first.')
  }

  // Ensure we have a valid access token
  await ensureValidAccessToken('', '', undefined)

  return new Promise((resolve, reject) => {
    const searchOptions = {
      q: query,
      limit: options.limit || '50',
      offset: options.offset || '0',
      ...options
    }

    itemSummaryApi.search(searchOptions, (error, data) => {
      if (error) {
        log(`[EBAY-SERVICE] Error searching items: ${error}`)
        reject(error)
      } else {
        log(`[EBAY-SERVICE] Successfully searched items`)
        resolve(data as SearchPagedCollection)
      }
    })
  })
}
