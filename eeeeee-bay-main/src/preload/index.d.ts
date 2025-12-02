import { ElectronAPI } from '@electron-toolkit/preload'
import { AppConstants } from '../main/constants'

interface EbayConfig {
  appID: string
  certID?: string
  sandbox?: boolean
  devID?: string
  siteID?: number
}

interface Product {
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

interface InventoryItem {
  sku: string
  product?: {
    upc?: string
    title?: string
    brand?: string
    mpn?: string
  }
}

interface ApiConfig {
  sandbox: boolean
  siteId: number
}

interface Policy {
  policyId?: string
  policyName?: string
  [key: string]: unknown
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      constants: AppConstants
      oauthLogin: (
        authUrl: string,
        redirectUri: string,
        clientId: string,
        clientSecret: string,
        sandbox?: boolean
      ) => Promise<string | null>
      ebayInit: (config: EbayConfig) => Promise<{ success: boolean; error?: string }>
      ebaySetToken: (token: string) => Promise<{ success: boolean; error?: string }>
      ebaySearchUpc: (upc: string) => Promise<{ success: boolean; data?: Product; error?: string }>
      ebayIsAuthenticated: () => Promise<{ success: boolean; data: boolean }>
      ebayGetConfig: () => Promise<{ success: boolean; data?: ApiConfig }>
      ebayCheckDuplicate: (
        upc: string
      ) => Promise<{ success: boolean; data?: boolean; error?: string }>
      ebayGetInventory: (
        limit?: number
      ) => Promise<{ success: boolean; data?: InventoryItem[]; error?: string }>
      ebayCreateInventoryItem: (
        sku: string,
        itemData: Record<string, unknown>
      ) => Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }>
      ebayCreateOffer: (
        offerData: Record<string, unknown>
      ) => Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }>
      ebayPublishOffer: (
        offerId: string
      ) => Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }>
      ebayGetNextSku: () => Promise<{ success: boolean; data?: string; error?: string }>
      ebayLogout: () => Promise<{ success: boolean; error?: string }>
      ebayCreateAndPublishListing: (product: Product) => Promise<{
        success: boolean
        listingId?: string
        offerId?: string
        sku?: string
        error?: string
      }>
      ebayGetFulfillmentPolicies: (marketplaceId?: string) => Promise<{
        success: boolean
        data?: Policy[]
        error?: string
      }>
      ebayGetPaymentPolicies: (marketplaceId?: string) => Promise<{
        success: boolean
        data?: Policy[]
        error?: string
      }>
      ebayGetReturnPolicies: (marketplaceId?: string) => Promise<{
        success: boolean
        data?: Policy[]
        error?: string
      }>
      ebayOptInToProgram: (programType: string) => Promise<{
        success: boolean
        data?: Record<string, unknown>
        error?: string
      }>
      userSettingsSetCurrentUser: (userId: string) => Promise<{ success: boolean; error?: string }>
      userSettingsGetEbayPolicies: () => Promise<{
        success: boolean
        data?: {
          paymentPolicyId?: string
          returnPolicyId?: string
          fulfillmentPolicyId?: string
        }
        error?: string
      }>
      userSettingsSetEbayPolicies: (policies: {
        paymentPolicyId?: string
        returnPolicyId?: string
        fulfillmentPolicyId?: string
      }) => Promise<{ success: boolean; error?: string }>
      userSettingsHasEbayPolicies: () => Promise<{
        success: boolean
        data?: boolean
        error?: string
      }>
      userSettingsClear: () => Promise<{ success: boolean; error?: string }>
      userSettingsGetInitialSku: () => Promise<{ success: boolean; data?: number; error?: string }>
      userSettingsSetInitialSku: (
        initialSku: number
      ) => Promise<{ success: boolean; error?: string }>
    }
  }
}
