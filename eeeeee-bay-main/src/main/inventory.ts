import { getInventoryItemApi, getLocationApi } from './config'
import { InventoryItem } from '../generated/sellInventoryV1/src/index.js'
import {
  Product,
  CreateInventoryItemData,
  InventoryItemsResponse,
  InventoryLocation,
  CreateInventoryLocationData
} from './types'
import { ensureValidAccessToken } from './auth'
import { log } from './logger'
import {
  INVENTORY_CONSTANTS,
  API_CONSTANTS,
  LISTING_CONSTANTS,
  LOCATION_CONSTANTS
} from './constants'
import { userSettingsManager } from './userSettings'

/**
 * Detects the media type from product data and returns appropriate SKU prefix
 * @param product - Product data to analyze
 * @returns "B" for Blu-ray, "D" for DVD, or "SKU" as fallback
 */
function getSkuPrefixForProduct(product: Product): string {
  const title = product.title?.toLowerCase() || ''
  const aspects = product.aspects || {}
  const categories = product.categories || []

  // Helper to test a string for known media keywords and return prefix
  const detectFromString = (s: string | undefined): string | null => {
    if (!s) return null
    const v = s.toLowerCase()
    if (v.includes('blu-ray') || v.includes('bluray') || v.includes('blu ray')) return 'blu'
    if (v.includes('dvd')) return 'D'
    if (v.includes(' cd ') || v.includes('compact disc') || v.includes('audio cd')) return 'cd'
    if (v.includes('cassette') || v.includes('tape') || v.includes('audio tape')) return 'tape'
    return null
  }

  // 1) Prefer product categories (most reliable)
  for (const cat of categories) {
    const name = (cat && (cat.categoryName || cat.categoryName)) || ''
    const prefix = detectFromString(name)
    if (prefix) {
      log(
        `[EBAY-INVENTORY] Detected SKU prefix "${prefix}" from category name "${name}" for product: ${product.title}`
      )
      return prefix
    }
    if (name) {
      log(
        `[EBAY-INVENTORY] Category name "${name}" did not yield a SKU prefix for product: ${product.title}`
      )
    }
  }

  // 2) Then check product aspects (structured data)
  // Try common aspect keys that may hold format information
  const aspectKeys = [
    'Format',
    'Movie/TV Title Format',
    'Media Format',
    'Media Type',
    'Format/Media'
  ]
  for (const key of aspectKeys) {
    const val = aspects[key]?.[0]
    const prefix = detectFromString(val)
    if (prefix) {
      log(
        `[EBAY-INVENTORY] Detected SKU prefix "${prefix}" from aspect "${key}" value "${val}" for product: ${product.title}`
      )
      return prefix
    }
    if (val) {
      log(
        `[EBAY-INVENTORY] Aspect "${key}" value "${val}" did not yield a SKU prefix for product: ${product.title}`
      )
    }
  }

  // 3) Finally, fall back to scanning the title (least reliable)
  const fromTitle = detectFromString(title)
  if (fromTitle) {
    log(
      `[EBAY-INVENTORY] Detected SKU prefix "${fromTitle}" from title for product: ${product.title}`
    )
    return fromTitle
  }

  log(
    `[EBAY-INVENTORY] Unable to derive SKU prefix from categories, aspects, or title for product: ${product.title}`
  )

  // Fallback to original SKU prefix
  log(
    `[EBAY-INVENTORY] Could not detect media type for product: ${product.title}, using default prefix`
  )
  return INVENTORY_CONSTANTS().SKU_PREFIX.replace('-', '') // Remove dash if present
}

/**
 * Generates the next unique SKU number for a product
 * @param product - Optional product data to determine SKU prefix
 * @returns Promise resolving to unique SKU string
 * @throws Error if user not authenticated or SKU generation fails
 */
export async function getNextSku(product?: Product): Promise<string> {
  log(`[EBAY-INVENTORY] Getting next unique SKU number`)

  const currentUser = userSettingsManager.getCurrentUser()
  if (!currentUser) {
    throw new Error('No user authenticated')
  }

  let currentCounter = userSettingsManager.getCurrentSkuCounter(currentUser)
  const initialSku = userSettingsManager.getInitialSku(currentUser)

  if (currentCounter === undefined) {
    if (initialSku === undefined) {
      throw new Error('Initial SKU not set. Please set initial SKU during login.')
    }
    currentCounter = initialSku
  }

  // Get the appropriate prefix based on product type
  const prefix = product
    ? getSkuPrefixForProduct(product)
    : INVENTORY_CONSTANTS().SKU_PREFIX.replace('-', '')

  // Try up to 10 times to find a unique SKU
  for (let attempts = 0; attempts < 10; attempts++) {
    const candidateSku = `${prefix}-${(currentCounter + attempts).toString().padStart(INVENTORY_CONSTANTS().SKU_PADDING_LENGTH, '0')}`

    // Check if this SKU already exists
    try {
      const isUnique = await checkSkuUniqueness(candidateSku)
      if (isUnique) {
        log(`[EBAY-INVENTORY] Found unique SKU: ${candidateSku}`)
        // Update the counter to this value for next time
        userSettingsManager.setCurrentSkuCounter(currentUser, currentCounter + attempts)
        return candidateSku
      }
    } catch {
      log(
        `[EBAY-INVENTORY] Warning: Could not check SKU uniqueness, using candidate: ${candidateSku}`
      )
      return candidateSku
    }
  }

  // Fallback: use timestamp-based SKU if we can't find a unique one
  const fallbackSku = `${prefix}-${Date.now()}`
  log(`[EBAY-INVENTORY] Using fallback timestamp-based SKU: ${fallbackSku}`)
  return fallbackSku
}

/**
 * Checks if a SKU is unique by querying existing inventory items
 * @param sku - SKU to check for uniqueness
 * @returns Promise resolving to true if SKU is unique, false if it exists
 */
async function checkSkuUniqueness(sku: string): Promise<boolean> {
  const inventoryItemApi = getInventoryItemApi()
  if (!inventoryItemApi) {
    throw new Error('eBay API not initialized')
  }

  return new Promise((resolve, reject) => {
    // Try to get the specific inventory item by SKU
    inventoryItemApi.getInventoryItem(sku, (error) => {
      if (error) {
        // If we get a 404, the SKU doesn't exist (unique)
        if (error.response?.status === 404) {
          resolve(true)
        } else {
          // Other errors should be treated as failures to check
          reject(error)
        }
      } else {
        // SKU exists, not unique
        resolve(false)
      }
    })
  })
}

/**
 * Checks for duplicate items in inventory and active offers
 * @param upc - UPC/GTIN to check for duplicates
 * @param timeoutMs - Request timeout in milliseconds (default: 10000)
 * @returns Promise resolving to true if duplicate found
 * @throws Error if API not initialized or request fails
 */
export async function checkForDuplicate(
  upc: string,
  timeoutMs: number = API_CONSTANTS().DEFAULT_TIMEOUT_MS
): Promise<string | undefined> {
  log(
    `[EBAY-INVENTORY] Checking for duplicate item with UPC/GTIN: ${upc} (timeout: ${timeoutMs}ms)`
  )

  const inventoryItemApi = getInventoryItemApi()
  if (!inventoryItemApi) {
    log(`[EBAY-INVENTORY] Error: eBay API not initialized`)
    throw new Error('eBay API not initialized. Please call initializeEbayApi first.')
  }

  try {
    // Create a timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Request timeout after ${timeoutMs}ms`)), timeoutMs)
    })

    // Get ALL inventory items using pagination
    const getAllItems = async (): Promise<InventoryItem[]> => {
      const allItems: InventoryItem[] = []
      let offset = 0
      const limit = 200 // Max per API call

      // Paginate through all inventory items
      while (true) {
        const pagePromise = new Promise<InventoryItemsResponse>((pageResolve, pageReject) => {
          inventoryItemApi!.getInventoryItems({ limit, offset }, (error, data) => {
            if (error) {
              pageReject(error)
            } else {
              pageResolve(data as InventoryItemsResponse)
            }
          })
        })

        const pageData = await pagePromise
        const items = pageData.inventoryItems || []

        allItems.push(...items)

        log(
          `[EBAY-INVENTORY] Retrieved ${items.length} items (offset: ${offset}, total so far: ${allItems.length})`
        )

        // If we got less than the limit, we've reached the end
        if (items.length < limit) {
          break
        }

        offset += limit
      }

      log(`[EBAY-INVENTORY] Duplicate check - retrieved ${allItems.length} total inventory items`)
      return allItems
    }

    const itemsPromise = getAllItems()

    const items = await Promise.race([itemsPromise, timeoutPromise])

    // Check if any existing item has the same UPC/GTIN
    const duplicateItem = items.find((item: InventoryItem) => {
      // Check multiple possible UPC fields and formats
      const itemUpc = item.product?.upc
      const itemGtin = (item.product as { gtin?: string[] })?.gtin
      const itemEan = (item.product as { ean?: string[] })?.ean

      // Handle UPC as string or array
      const itemUpcValue = Array.isArray(itemUpc) ? itemUpc[0] : itemUpc
      const itemGtinValue = Array.isArray(itemGtin) ? itemGtin[0] : itemGtin
      const itemEanValue = Array.isArray(itemEan) ? itemEan[0] : itemEan

      return (
        (itemUpcValue && itemUpcValue === upc) ||
        (itemGtinValue && itemGtinValue === upc) ||
        (itemEanValue && itemEanValue === upc)
      )
    })

    const isDuplicate = duplicateItem !== undefined
    if (isDuplicate) {
      log(
        `[EBAY-INVENTORY] Duplicate found - existing item SKU: ${duplicateItem.sku} has UPC: ${duplicateItem.product?.upc}`
      )
      return duplicateItem.sku
    } else {
      log(`[EBAY-INVENTORY] No duplicate found for UPC: ${upc}`)
      return undefined
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    log(`[EBAY-INVENTORY] Error checking for duplicate: ${errorMessage}`)
    throw error
  }
}

/**
 * Creates an inventory item in eBay's inventory
 * @param sku - Unique SKU for the inventory item
 * @param itemData - Inventory item data
 * @returns Promise resolving to creation result
 * @throws Error if API not initialized or creation fails
 */
export async function createInventoryItem(
  sku: string,
  itemData: CreateInventoryItemData
): Promise<unknown> {
  log(`[EBAY-INVENTORY] Creating inventory item with SKU: ${sku}`)

  const inventoryItemApi = getInventoryItemApi()
  if (!inventoryItemApi) {
    log(`[EBAY-INVENTORY] Error: eBay API not initialized`)
    throw new Error('eBay API not initialized. Please call initializeEbayApi first.')
  }

  // Ensure we have a valid access token
  await ensureValidAccessToken('', '', undefined)

  return new Promise((resolve, reject) => {
    inventoryItemApi!.createOrReplaceInventoryItem(
      'en-US', // contentLanguage
      sku, // sku
      'application/json', // contentType
      itemData, // inventoryItem
      (error, data) => {
        if (error) {
          log(`[EBAY-INVENTORY] Error creating inventory item: ${JSON.stringify(error, null, 2)}`)
          if (error.response) {
            log(`[EBAY-INVENTORY] Error response status: ${error.response.status}`)
            log(
              `[EBAY-INVENTORY] Error response body: ${JSON.stringify(error.response.body, null, 2)}`
            )
          }
          reject(error)
        } else {
          log(`[EBAY-INVENTORY] Successfully created inventory item`)
          resolve(data)
        }
      }
    )
  })
}

/**
 * Creates an inventory item with default values for a product
 * @param product - Product data to create inventory item for
 * @param quantity - Quantity to set (default: 1)
 * @returns Promise resolving to { sku: string, result: any }
 * @throws Error if creation fails
 */
export async function createInventoryItemWithDefaults(
  product: Product,
  quantity: number = LISTING_CONSTANTS().DEFAULT_QUANTITY
): Promise<{ sku: string; result: unknown }> {
  // Import utilities dynamically to avoid circular dependencies
  const { generateOptimizedTitle, mapConditionIdToEnum, shouldIncludeImages } = await import(
    './utils'
  )

  // Use pre-generated SKU if available, otherwise generate a new one
  const sku = product.sku || (await getNextSku(product))

  // Use current seller information if available
  const productWithSeller = {
    ...product,
    seller: null // Will be set by the calling function if needed
  }

  const inventoryItem = {
    availability: {
      shipToLocationAvailability: {
        quantity: quantity
      }
    },
    condition: mapConditionIdToEnum(LISTING_CONSTANTS().DEFAULT_CONDITION_ID),
    conditionDescription: LISTING_CONSTANTS().DEFAULT_CONDITION_DESCRIPTION,
    product: {
      title: generateOptimizedTitle(productWithSeller.title),
      description: productWithSeller.description || productWithSeller.title,
      aspects: productWithSeller.aspects,
      brand:
        productWithSeller.brand &&
        productWithSeller.epid &&
        productWithSeller.epid !== productWithSeller.gtin?.[0]
          ? productWithSeller.brand
          : undefined, // Only set brand if we also have a valid MPN
      mpn:
        productWithSeller.epid &&
        productWithSeller.epid !== productWithSeller.gtin?.[0] &&
        productWithSeller.brand
          ? productWithSeller.epid
          : undefined, // Only set MPN if we also have brand
      imageUrls:
        shouldIncludeImages() && productWithSeller.image ? [productWithSeller.image.imageUrl] : [],
      upc: productWithSeller.gtin ? [productWithSeller.gtin[0]] : undefined
    }
  }

  log(`[EBAY-INVENTORY] Creating inventory item for seller: Unknown`)
  log(`[EBAY-INVENTORY] Inventory item data: ${JSON.stringify(inventoryItem, null, 2)}`)

  const result = await createInventoryItem(sku, inventoryItem)
  return { sku, result }
}

/**
 * Retrieves inventory items from eBay
 * @param limit - Maximum number of items to retrieve (default: 50)
 * @returns Promise resolving to array of inventory items
 * @throws Error if API not initialized or request fails
 */
export async function getInventoryItems(
  limit: number = API_CONSTANTS().MAX_SEARCH_RESULTS
): Promise<InventoryItem[]> {
  log(`[EBAY-INVENTORY] Getting inventory items (limit: ${limit})`)

  const inventoryItemApi = getInventoryItemApi()
  if (!inventoryItemApi) {
    log(`[EBAY-INVENTORY] Error: eBay API not initialized`)
    throw new Error('eBay API not initialized. Please call initializeEbayApi first.')
  }

  return new Promise((resolve, reject) => {
    inventoryItemApi!.getInventoryItems({ limit }, (error, data) => {
      if (error) {
        log(`[EBAY-INVENTORY] Error getting inventory items: ${error}`)
        reject(error)
      } else {
        resolve(data.inventoryItems || [])
      }
    })
  })
}

/**
 * Retrieves inventory locations from eBay
 * @returns Promise resolving to array of inventory locations
 * @throws Error if API not initialized or request fails
 */
export async function getInventoryLocations(): Promise<InventoryLocation[]> {
  log(`[EBAY-INVENTORY] Getting inventory locations`)

  const locationApi = getLocationApi()
  if (!locationApi) {
    log(`[EBAY-INVENTORY] Error: Location API not initialized`)
    throw new Error('Location API not initialized. Please call initializeEbayApi first.')
  }

  return new Promise((resolve, reject) => {
    locationApi!.getInventoryLocations({}, (error, data) => {
      if (error) {
        log(`[EBAY-INVENTORY] Error getting inventory locations: ${error}`)
        reject(error)
      } else {
        log(`[EBAY-INVENTORY] Successfully retrieved inventory locations`)
        resolve(data.locations || [])
      }
    })
  })
}

/**
 * Creates an inventory location in eBay
 * @param merchantLocationKey - Unique key for the location
 * @param locationData - Location data to create
 * @returns Promise resolving to creation result
 * @throws Error if API not initialized or creation fails
 */
export async function createInventoryLocation(
  merchantLocationKey: string,
  locationData: CreateInventoryLocationData
): Promise<InventoryLocation> {
  log(`[EBAY-INVENTORY] Creating inventory location: ${merchantLocationKey}`)

  const locationApi = getLocationApi()
  if (!locationApi) {
    log(`[EBAY-INVENTORY] Error: Location API not initialized`)
    throw new Error('Location API not initialized. Please call initializeEbayApi first.')
  }

  return new Promise((resolve, reject) => {
    log(`[EBAY-INVENTORY] Location data: ${JSON.stringify(locationData, null, 2)}`)
    locationApi!.createInventoryLocation(
      merchantLocationKey,
      'application/json',
      locationData,
      (error, data) => {
        if (error) {
          log(
            `[EBAY-INVENTORY] Error creating inventory location: ${JSON.stringify(error, null, 2)}`
          )
          if (error.response) {
            log(`[EBAY-INVENTORY] Error response status: ${error.response.status}`)
            log(
              `[EBAY-INVENTORY] Error response body: ${JSON.stringify(error.response.body, null, 2)}`
            )
          }
          reject(error)
        } else {
          log(`[EBAY-INVENTORY] Successfully created inventory location`)
          resolve(data)
        }
      }
    )
  })
}

/**
 * Gets or creates a default inventory location
 * @returns Promise resolving to merchant location key
 * @throws Error if location operations fail
 */
export async function getOrCreateDefaultLocation(): Promise<string> {
  log(`[EBAY-INVENTORY] Getting or creating default inventory location`)

  try {
    const locations = await getInventoryLocations()
    if (locations.length > 0) {
      const locationKey = locations[0].merchantLocationKey
      log(`[EBAY-INVENTORY] Using existing location: ${locationKey}`)
      return locationKey
    }

    // Create a default warehouse location using constants
    const defaultLocationKey = LOCATION_CONSTANTS().DEFAULT_KEY
    const defaultLocationData = {
      location: {
        address: {
          addressLine1: LOCATION_CONSTANTS().DEFAULT_ADDRESS_LINE_1,
          city: LOCATION_CONSTANTS().DEFAULT_CITY,
          stateOrProvince: LOCATION_CONSTANTS().DEFAULT_STATE,
          postalCode: LOCATION_CONSTANTS().DEFAULT_POSTAL_CODE,
          country: LOCATION_CONSTANTS().DEFAULT_COUNTRY
        }
      },
      locationTypes: [LOCATION_CONSTANTS().DEFAULT_TYPE],
      name: LOCATION_CONSTANTS().DEFAULT_NAME,
      merchantLocationStatus: LOCATION_CONSTANTS().DEFAULT_STATUS
    }

    await createInventoryLocation(defaultLocationKey, defaultLocationData)
    log(`[EBAY-INVENTORY] Created default location: ${defaultLocationKey}`)
    return defaultLocationKey
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    log(`[EBAY-INVENTORY] Error getting or creating default location: ${errorMessage}`)
    throw error
  }
}
