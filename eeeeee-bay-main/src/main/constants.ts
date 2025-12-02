import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

// Default application constants
const DEFAULT_CONSTANTS = {
  // Shipping settings
  SHIPPING: {
    DEFAULT_COST: '4.99',
    DEFAULT_CURRENCY: 'USD',
    DEFAULT_TYPE: 'FIXED',
    FREE_SHIPPING_THRESHOLD: '35.00',
    DEFAULT_HANDLING_TIME: 3,
    DOMESTIC_DELIVERY_MIN_DAYS: 3,
    DOMESTIC_DELIVERY_MAX_DAYS: 7,
    INTERNATIONAL_DELIVERY_MIN_DAYS: 7,
    INTERNATIONAL_DELIVERY_MAX_DAYS: 21
  },

  // Pricing settings
  PRICING: {
    MARKUP_PERCENTAGE: '15.0',
    MINIMUM_PROFIT_MARGIN: '2.00',
    MAXIMUM_DISCOUNT_PERCENTAGE: '20.0',
    USE_MEDIAN_PRICING: true,
    ROUND_TO_NEAREST: '0.99'
  },

  // Listing settings
  LISTING: {
    DEFAULT_QUANTITY: 1,
    // Default to very good condition
    DEFAULT_CONDITION: 'Very Good',
    DEFAULT_CONDITION_ID: '4000',
    DEFAULT_CONDITION_DESCRIPTION:
      'Please note: any mention of a digital copy or code may be expired and/or unavailable. This does not affect the quality or functionality of the DVD.',
    MAX_TITLE_LENGTH: 80,
    INCLUDE_STOCK_PHOTOS: true
  },

  // Category settings
  CATEGORY: {
    FALLBACK_CATEGORY_ID: '617', // DVDs & Blu-ray Discs
    AUTO_CATEGORIZE: true,
    REQUIRE_CATEGORY_MATCH: false
  },

  // API settings
  API: {
    DEFAULT_TIMEOUT_MS: 10000,
    MAX_SEARCH_RESULTS: 100,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000
  },

  // Image settings
  IMAGES: {
    MAX_ADDITIONAL_IMAGES: 8,
    PREFERRED_IMAGE_SIZE: 'l225', // eBay image size
    INCLUDE_THUMBNAILS: true,
    DEFAULT_IMAGE_HOST: 'i.ebayimg.com'
  },

  // Inventory settings
  INVENTORY: {
    SKU_PREFIX: 'SKU-',
    SKU_PADDING_LENGTH: 6,
    AUTO_GENERATE_SKU: true,
    TRACK_QUANTITY: true,
    LOW_STOCK_THRESHOLD: 5
  },

  // Location settings
  LOCATION: {
    DEFAULT_KEY: 'DEFAULT_WAREHOUSE',
    DEFAULT_NAME: 'Default Warehouse',
    DEFAULT_ADDRESS_LINE_1: '123 Default Street',
    DEFAULT_CITY: 'Default City',
    DEFAULT_STATE: 'CA',
    DEFAULT_POSTAL_CODE: '90210',
    DEFAULT_COUNTRY: 'US',
    DEFAULT_TYPE: 'WAREHOUSE',
    DEFAULT_STATUS: 'ENABLED'
  },

  // eBay API settings
  EBAY: {
    MARKETPLACE_ID: 'EBAY_US',
    FORMAT_FIXED_PRICE: 'FIXED_PRICE',
    PAYMENT_POLICY_ID: 'YOUR_PAYMENT_POLICY_ID', // Placeholder - needs to be configured
    RETURN_POLICY_ID: 'YOUR_RETURN_POLICY_ID', // Placeholder - needs to be configured
    SHIPPING_POLICY_ID: 'YOUR_SHIPPING_POLICY_ID', // Placeholder - needs to be configured
    CATEGORY_ID: '617', // Fallback to DVDs & Blu-ray Discs
    DEFAULT_BRAND: 'Unbranded',
    DEFAULT_PRODUCT_TYPE: 'General',
    QUANTITY_LIMIT_PER_BUYER: 1
  }
} as const

// Type for the constants structure
export type AppConstants = typeof DEFAULT_CONSTANTS

// Cached constants after loading properties
let loadedConstants: AppConstants | null = null

/**
 * Application constants and configuration values
 * Loaded from app.properties file if available, otherwise uses defaults
 */

/**
 * Load constants from properties file if it exists, otherwise use defaults
 */
function loadConstants(): AppConstants {
  if (loadedConstants) {
    return loadedConstants
  }

  const propertiesPath = join(__dirname, '../../app.properties')
  let constants = { ...DEFAULT_CONSTANTS }

  if (existsSync(propertiesPath)) {
    try {
      const propertiesContent = readFileSync(propertiesPath, 'utf8')
      const properties = parseProperties(propertiesContent)
      constants = mergeProperties(constants, properties)
      console.log(`[CONSTANTS] Loaded properties from ${propertiesPath}`)
    } catch (error) {
      console.warn(`[CONSTANTS] Failed to load properties file: ${error}`)
      console.log(`[CONSTANTS] Using default constants`)
    }
  } else {
    console.log(`[CONSTANTS] No properties file found, using defaults`)
  }

  loadedConstants = constants
  return constants
}

/**
 * Parse properties file content into key-value pairs
 */
function parseProperties(content: string): Record<string, string> {
  const properties: Record<string, string> = {}

  const lines = content.split('\n')
  for (const line of lines) {
    const trimmed = line.trim()

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) {
      continue
    }

    const equalIndex = trimmed.indexOf('=')
    if (equalIndex > 0) {
      const key = trimmed.substring(0, equalIndex).trim()
      const value = trimmed.substring(equalIndex + 1).trim()
      properties[key] = value
    }
  }

  return properties
}

/**
 * Merge properties into constants structure
 */
function mergeProperties(
  constants: AppConstants,
  properties: Record<string, string>
): AppConstants {
  const result = JSON.parse(JSON.stringify(constants)) // Deep copy

  for (const [key, value] of Object.entries(properties)) {
    const parts = key.split('.')
    if (parts.length === 2) {
      const [section, property] = parts
      const upperSection = section.toUpperCase()
      const upperProperty = property.toUpperCase()

      if (result[upperSection] && upperProperty in result[upperSection]) {
        // Handle type conversion
        const originalValue = result[upperSection][upperProperty]
        if (typeof originalValue === 'boolean') {
          result[upperSection][upperProperty] = value.toLowerCase() === 'true'
        } else if (typeof originalValue === 'number') {
          const numValue = parseFloat(value)
          if (!isNaN(numValue)) {
            result[upperSection][upperProperty] = numValue
          }
        } else {
          result[upperSection][upperProperty] = value
        }
      }
    }
  }

  return result
}

/**
 * Get application constants (loads from properties file on first call)
 */
export function getConstants(): AppConstants {
  return loadConstants()
}

/**
 * Reload constants (useful for testing or runtime config changes)
 */
export function reloadConstants(): AppConstants {
  loadedConstants = null
  return loadConstants()
}

/**
 * Get a specific constant value with dot notation
 * @param path - Dot-separated path to the constant (e.g., 'SHIPPING.DEFAULT_COST')
 * @returns The constant value
 * @throws Error if the path is not found
 * @example
 * ```typescript
 * getConstant('SHIPPING.DEFAULT_COST') // returns '4.99'
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getConstant(path: string): any {
  const constants = getConstants()
  const parts = path.split('.')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = constants
  for (const part of parts) {
    if (current && typeof current === 'object' && part.toUpperCase() in current) {
      current = current[part.toUpperCase()]
    } else {
      throw new Error(`Constant path not found: ${path}`)
    }
  }

  return current
}

// Export individual constant sections for convenience
export const SHIPPING_CONSTANTS = (): typeof DEFAULT_CONSTANTS.SHIPPING => getConstants().SHIPPING
export const PRICING_CONSTANTS = (): typeof DEFAULT_CONSTANTS.PRICING => getConstants().PRICING
export const LISTING_CONSTANTS = (): typeof DEFAULT_CONSTANTS.LISTING => getConstants().LISTING
export const CATEGORY_CONSTANTS = (): typeof DEFAULT_CONSTANTS.CATEGORY => getConstants().CATEGORY
export const API_CONSTANTS = (): typeof DEFAULT_CONSTANTS.API => getConstants().API
export const IMAGES_CONSTANTS = (): typeof DEFAULT_CONSTANTS.IMAGES => getConstants().IMAGES
export const INVENTORY_CONSTANTS = (): typeof DEFAULT_CONSTANTS.INVENTORY =>
  getConstants().INVENTORY
export const LOCATION_CONSTANTS = (): typeof DEFAULT_CONSTANTS.LOCATION => getConstants().LOCATION
export const EBAY_CONSTANTS = (): typeof DEFAULT_CONSTANTS.EBAY => getConstants().EBAY
