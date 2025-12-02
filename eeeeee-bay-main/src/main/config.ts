import {
  ApiClient as BrowseApiClient,
  ItemSummaryApi,
  ItemApi
} from '../generated/buyBrowseV1/src/index.js'
import {
  ApiClient as InventoryApiClient,
  InventoryItemApi,
  OfferApi,
  LocationApi
} from '../generated/sellInventoryV1/src/index.js'
import {
  ApiClient as AccountApiClient,
  FulfillmentPolicyApi,
  PaymentPolicyApi,
  ReturnPolicyApi,
  ProgramApi
} from '../generated/sellAccountV1/src/index.js'
import { EbayConfig } from './types'
import { log } from './logger'

// API Client instances
let browseApiClient: BrowseApiClient | null = null
let inventoryApiClient: InventoryApiClient | null = null
let accountApiClient: AccountApiClient | null = null
let itemSummaryApi: ItemSummaryApi | null = null
let itemApi: ItemApi | null = null
let inventoryItemApi: InventoryItemApi | null = null
let offerApi: OfferApi | null = null
let locationApi: LocationApi | null = null
let fulfillmentPolicyApi: FulfillmentPolicyApi | null = null
let paymentPolicyApi: PaymentPolicyApi | null = null
let returnPolicyApi: ReturnPolicyApi | null = null
let programApi: ProgramApi | null = null

// Store configuration for later reference
let currentConfig: EbayConfig | null = null

/**
 * Initializes the eBay API clients with application credentials
 * Must be called before using any eBay API functions
 * @param config - eBay API configuration including app ID, sandbox mode, etc.
 * @returns Object containing initialized API client instances
 */
export function initializeEbayApi(config: EbayConfig): {
  browse: BrowseApiClient
  inventory: InventoryApiClient
} {
  log(
    `[EBAY-SERVICE] Initializing eBay API with config: appID=${config.appID}, sandbox=${config.sandbox}, siteID=${config.siteID}, certID=${config.certID ? '[PROVIDED]' : 'null'}, devID=${config.devID ? '[PROVIDED]' : 'null'}`
  )

  // Store configuration for later reference
  currentConfig = config

  // Initialize Browse API client
  const browseBasePath = config.sandbox
    ? 'https://api.sandbox.ebay.com/buy/browse/v1'
    : 'https://api.ebay.com/buy/browse/v1'

  browseApiClient = new BrowseApiClient(browseBasePath)

  // Initialize Inventory API client
  const inventoryBasePath = config.sandbox
    ? 'https://api.sandbox.ebay.com/sell/inventory/v1'
    : 'https://api.ebay.com/sell/inventory/v1'

  inventoryApiClient = new InventoryApiClient(inventoryBasePath)

  // Initialize Account API client
  const accountBasePath = config.sandbox
    ? 'https://api.sandbox.ebay.com/sell/account/v1'
    : 'https://api.ebay.com/sell/account/v1'

  accountApiClient = new AccountApiClient(accountBasePath)

  // Initialize API service instances
  itemSummaryApi = new ItemSummaryApi(browseApiClient)
  itemApi = new ItemApi(browseApiClient)
  inventoryItemApi = new InventoryItemApi(inventoryApiClient)
  offerApi = new OfferApi(inventoryApiClient)
  locationApi = new LocationApi(inventoryApiClient)
  fulfillmentPolicyApi = new FulfillmentPolicyApi(accountApiClient)
  paymentPolicyApi = new PaymentPolicyApi(accountApiClient)
  returnPolicyApi = new ReturnPolicyApi(accountApiClient)
  programApi = new ProgramApi(accountApiClient)

  log(`[EBAY-SERVICE] eBay API clients initialized successfully`)
  return { browse: browseApiClient, inventory: inventoryApiClient }
}

export function getApiConfig(): { sandbox: boolean; siteId: number } | null {
  if (!currentConfig) {
    log(`[EBAY-SERVICE] getApiConfig: API not initialized`)
    return null
  }

  const config = {
    sandbox: currentConfig.sandbox || false,
    siteId: currentConfig.siteID || 0
  }
  log(`[EBAY-SERVICE] getApiConfig: sandbox=${config.sandbox}, siteId=${config.siteId}`)
  return config
}

// Getters for API clients (used internally by other modules)
export function getBrowseApiClient(): BrowseApiClient | null {
  return browseApiClient
}

export function getInventoryApiClient(): InventoryApiClient | null {
  return inventoryApiClient
}

export function getAccountApiClient(): AccountApiClient | null {
  return accountApiClient
}

export function getItemSummaryApi(): ItemSummaryApi | null {
  return itemSummaryApi
}

export function getItemApi(): ItemApi | null {
  return itemApi
}

export function getInventoryItemApi(): InventoryItemApi | null {
  return inventoryItemApi
}

export function getOfferApi(): OfferApi | null {
  return offerApi
}

export function getLocationApi(): LocationApi | null {
  return locationApi
}

export function getFulfillmentPolicyApi(): FulfillmentPolicyApi | null {
  return fulfillmentPolicyApi
}

export function getPaymentPolicyApi(): PaymentPolicyApi | null {
  return paymentPolicyApi
}

export function getReturnPolicyApi(): ReturnPolicyApi | null {
  return returnPolicyApi
}

export function getProgramApi(): ProgramApi | null {
  return programApi
}

export function getCurrentConfig(): EbayConfig | null {
  return currentConfig
}
