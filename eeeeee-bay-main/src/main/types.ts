/* eslint-disable @typescript-eslint/no-explicit-any */

// Import generated eBay API clients
import { SearchPagedCollection, TypedNameValue } from '../generated/buyBrowseV1/src/index.js'
import { InventoryItem } from '../generated/sellInventoryV1/src/index.js'

export interface EbayConfig {
  appID: string
  certID?: string
  sandbox?: boolean
  devID?: string
  siteID?: number
}

export interface Product {
  title: string
  epid?: string
  gtin?: string[]
  aspects?: {
    [key: string]: string[]
  }
  image?: {
    imageUrl: string
  }
  brand?: string
  description?: string
  condition?: string
  conditionId?: string
  price?: {
    value: string
    currency: string
  }
  marketingPrice?: {
    originalPrice?: {
      value: string
      currency: string
    }
    discountAmount?: {
      value: string
      currency: string
    }
    discountPercentage?: string
  }
  categories?: Array<{
    categoryId: string
    categoryName: string
  }>
  seller?: {
    username: string
    feedbackPercentage: string
    feedbackScore: number
  }
  itemLocation?: {
    country: string
    postalCode?: string
  }
  shippingOptions?: Array<{
    shippingCost?: {
      value: string
      currency: string
    }
    shippingCostType?: string
    minEstimatedDeliveryDate?: string
    maxEstimatedDeliveryDate?: string
  }>
  itemId?: string
  itemWebUrl?: string
  additionalImages?: Array<{
    imageUrl: string
  }>
  thumbnailImages?: Array<{
    imageUrl: string
  }>
  sku?: string // Pre-generated SKU for this product
}

// Custom interface for eBay Item with aspects
export interface EbayItem {
  itemId?: string
  title?: string
  localizedAspects?: TypedNameValue[]
  [key: string]: unknown
}

// Custom type for creating inventory items (excludes sku which is passed as path parameter)
export interface CreateInventoryItemData {
  availability?: {
    shipToLocationAvailability?: {
      quantity?: number
    }
  }
  condition?: string
  conditionDescription?: string
  product?: {
    title?: string
    description?: string
    aspects?: { [key: string]: string[] }
    brand?: string
    mpn?: string
    imageUrls?: string[]
    upc?: string[]
  }
}

// Re-export types from generated APIs for convenience
export type { SearchPagedCollection, TypedNameValue, InventoryItem }

// Additional interfaces for eBay API responses
export interface ItemSummary {
  itemId?: string
  title?: string
  price?: {
    value: string
    currency: string
  }
  image?: {
    imageUrl: string
  }
  additionalImages?: Array<{
    imageUrl: string
  }>
  thumbnailImages?: Array<{
    imageUrl: string
  }>
  itemWebUrl?: string
  categories?: Category[]
  condition?: string
  conditionId?: string
  brand?: string
  epid?: string
  unitPricingMeasure?: {
    unit: string
    quantity: number
  }
  itemLocation?: {
    country: string
    postalCode?: string
  }
  shortDescription?: string
  [key: string]: unknown
}

export interface Category {
  categoryId: string
  categoryName: string
}

export interface Image {
  imageUrl: string
}

export interface SearchOptions {
  limit?: string
  offset?: string
  [key: string]: unknown
}

export interface InventoryLocation {
  merchantLocationKey: string
  name?: string
  locationTypes?: string[]
  merchantLocationStatus?: string
  location?: {
    address?: {
      addressLine1?: string
      city?: string
      stateOrProvince?: string
      postalCode?: string
      country?: string
    }
  }
}

export interface CreateInventoryLocationData {
  location?: {
    address?: {
      addressLine1?: string
      city?: string
      stateOrProvince?: string
      postalCode?: string
      country?: string
    }
  }
  locationTypes?: string[]
  name?: string
  merchantLocationStatus?: string
}

export interface InventoryLocationsResponse {
  locations?: InventoryLocation[]
}

export interface InventoryItemsResponse {
  inventoryItems?: InventoryItem[]
  total?: number
}

export interface OffersResponse {
  offers?: Array<{
    sku?: string
    offerId?: string
    [key: string]: unknown
  }>
}
