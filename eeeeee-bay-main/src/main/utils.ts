import { PRICING_CONSTANTS, LISTING_CONSTANTS } from './constants'
import { userSettingsManager } from './userSettings'

// Utility functions using constants
export function applyPriceMarkup(basePrice: number): number {
  const markup = parseFloat(PRICING_CONSTANTS().MARKUP_PERCENTAGE) / 100
  const markedUpPrice = basePrice * (1 + markup)
  const minimumPrice = basePrice + parseFloat(PRICING_CONSTANTS().MINIMUM_PROFIT_MARGIN)
  return Math.max(markedUpPrice, minimumPrice)
}

export function roundPriceToNearest(price: number): string {
  const roundTo = parseFloat(PRICING_CONSTANTS().ROUND_TO_NEAREST)
  if (roundTo === 0.99) {
    return (Math.floor(price) + 0.99).toFixed(2)
  }
  const factor = 1 / roundTo
  return (Math.round(price * factor) / factor).toFixed(2)
}

export function generateOptimizedTitle(originalTitle: string): string {
  const maxLength = LISTING_CONSTANTS().MAX_TITLE_LENGTH || 80
  if (originalTitle.length <= maxLength) {
    return originalTitle
  }
  return originalTitle.substring(0, maxLength - 3) + '...'
}

export function shouldIncludeImages(): boolean {
  return LISTING_CONSTANTS().INCLUDE_STOCK_PHOTOS || false
}

/**
 * Map eBay condition ID to condition enum string
 */
export function mapConditionIdToEnum(conditionId: string | number): string {
  const id = typeof conditionId === 'string' ? parseInt(conditionId, 10) : conditionId

  switch (id) {
    case 1000:
      return 'NEW'
    case 2000:
      return 'CERTIFIED_REFURBISHED'
    case 2500:
      return 'SELLER_REFURBISHED'
    case 3000:
      return 'USED_EXCELLENT'
    case 4000:
      return 'USED_VERY_GOOD'
    case 5000:
      return 'USED_GOOD'
    case 6000:
      return 'USED_ACCEPTABLE'
    case 7000:
      return 'FOR_PARTS_OR_NOT_WORKING'
    default:
      return 'USED_VERY_GOOD'
  }
}

export function validateEbayPolicies(): { valid: boolean; missing: string[] } {
  const currentUser = userSettingsManager.getCurrentUser()
  if (!currentUser) {
    return { valid: false, missing: ['USER_NOT_AUTHENTICATED'] }
  }

  const policies = userSettingsManager.getEbayPolicies(currentUser)
  const missing: string[] = []

  // Check for missing policy IDs
  if (!policies.paymentPolicyId) {
    missing.push('PAYMENT_POLICY_ID')
  } else if (
    policies.paymentPolicyId === 'YOUR_PAYMENT_POLICY_ID' ||
    policies.paymentPolicyId.startsWith('YOUR_')
  ) {
    missing.push('PAYMENT_POLICY_ID_INVALID')
  }

  if (!policies.returnPolicyId) {
    missing.push('RETURN_POLICY_ID')
  } else if (
    policies.returnPolicyId === 'YOUR_RETURN_POLICY_ID' ||
    policies.returnPolicyId.startsWith('YOUR_')
  ) {
    missing.push('RETURN_POLICY_ID_INVALID')
  }

  if (!policies.fulfillmentPolicyId) {
    missing.push('FULFILLMENT_POLICY_ID')
  } else if (
    policies.fulfillmentPolicyId === 'YOUR_FULFILLMENT_POLICY_ID' ||
    policies.fulfillmentPolicyId.startsWith('YOUR_')
  ) {
    missing.push('FULFILLMENT_POLICY_ID_INVALID')
  }

  return {
    valid: missing.length === 0,
    missing
  }
}
