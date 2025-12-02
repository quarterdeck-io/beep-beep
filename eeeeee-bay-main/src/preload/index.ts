import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { getConstants } from '../main/constants'

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
}

// Custom APIs for renderer
const api = {
  constants: getConstants(),
  oauthLogin: async (
    authUrl: string,
    redirectUri: string,
    clientId: string,
    clientSecret: string,
    sandbox: boolean = false
  ) => {
    return await ipcRenderer.invoke('oauth-login', {
      authUrl,
      redirectUri,
      clientId,
      clientSecret,
      sandbox
    })
  },
  ebayInit: async (config: EbayConfig) => {
    return await ipcRenderer.invoke('ebay-init', config)
  },
  ebaySetToken: async (token: string) => {
    return await ipcRenderer.invoke('ebay-set-token', token)
  },
  ebaySearchUpc: async (upc: string) => {
    return await ipcRenderer.invoke('ebay-search-upc', upc)
  },
  ebayIsAuthenticated: async () => {
    return await ipcRenderer.invoke('ebay-is-authenticated')
  },
  ebayGetConfig: async () => {
    return await ipcRenderer.invoke('ebay-get-config')
  },
  ebayCheckDuplicate: async (upc: string) => {
    return await ipcRenderer.invoke('ebay-check-duplicate', upc)
  },
  ebayGetInventory: async (limit?: number) => {
    return await ipcRenderer.invoke('ebay-get-inventory', limit)
  },
  ebayCreateInventoryItem: async (sku: string, itemData: Record<string, unknown>) => {
    return await ipcRenderer.invoke('ebay-create-inventory-item', sku, itemData)
  },
  ebayCreateOffer: async (offerData: Record<string, unknown>) => {
    return await ipcRenderer.invoke('ebay-create-offer', offerData)
  },
  ebayPublishOffer: async (offerId: string) => {
    return await ipcRenderer.invoke('ebay-publish-offer', offerId)
  },
  ebayGetNextSku: async () => {
    return await ipcRenderer.invoke('ebay-get-next-sku')
  },
  ebayLogout: async () => {
    return await ipcRenderer.invoke('ebay-logout')
  },
  ebayCreateAndPublishListing: async (product: Product) => {
    return await ipcRenderer.invoke('ebay-create-and-publish-listing', product)
  },
  ebayGetFulfillmentPolicies: async (marketplaceId?: string) => {
    return await ipcRenderer.invoke('ebay-get-fulfillment-policies', marketplaceId)
  },
  ebayGetPaymentPolicies: async (marketplaceId?: string) => {
    return await ipcRenderer.invoke('ebay-get-payment-policies', marketplaceId)
  },
  ebayGetReturnPolicies: async (marketplaceId?: string) => {
    return await ipcRenderer.invoke('ebay-get-return-policies', marketplaceId)
  },
  ebayOptInToProgram: async (programType: string) => {
    return await ipcRenderer.invoke('ebay-opt-in-to-program', programType)
  },
  userSettingsSetCurrentUser: async (userId: string) => {
    return await ipcRenderer.invoke('user-settings-set-current-user', userId)
  },
  userSettingsGetEbayPolicies: async () => {
    return await ipcRenderer.invoke('user-settings-get-ebay-policies')
  },
  userSettingsSetEbayPolicies: async (policies: {
    paymentPolicyId?: string
    returnPolicyId?: string
    fulfillmentPolicyId?: string
  }) => {
    return await ipcRenderer.invoke('user-settings-set-ebay-policies', policies)
  },
  userSettingsHasEbayPolicies: async () => {
    return await ipcRenderer.invoke('user-settings-has-ebay-policies')
  },
  userSettingsClear: async () => {
    return await ipcRenderer.invoke('user-settings-clear')
  },
  userSettingsGetInitialSku: async () => {
    return await ipcRenderer.invoke('user-settings-get-initial-sku')
  },
  userSettingsSetInitialSku: async (initialSku: number) => {
    return await ipcRenderer.invoke('user-settings-set-initial-sku', initialSku)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
