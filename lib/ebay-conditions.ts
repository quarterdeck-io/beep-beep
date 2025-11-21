/**
 * eBay Condition Mappings for Production
 * Maps condition display names to eBay API condition values
 */

export interface ConditionOption {
  value: string
  label: string
  conditionId: string
  description?: string
}

export const EBAY_CONDITIONS: ConditionOption[] = [
  {
    value: "NEW",
    label: "Brand New",
    conditionId: "1000",
    description: "A brand-new, unused, unopened, unwrapped item in its original packaging"
  },
  {
    value: "NEW_OTHER",
    label: "New Other",
    conditionId: "1500",
    description: "A new item with no wear, but missing the original packaging or tags"
  },
  {
    value: "NEW_WITH_DEFECTS",
    label: "New with Defects",
    conditionId: "1750",
    description: "A new item with defects, but still in original packaging"
  },
  {
    value: "MANUFACTURER_REFURBISHED",
    label: "Manufacturer Refurbished",
    conditionId: "2000",
    description: "An item that has been restored to working order by the manufacturer"
  },
  {
    value: "SELLER_REFURBISHED",
    label: "Seller Refurbished",
    conditionId: "2500",
    description: "An item that has been restored to working order by the seller"
  },
  {
    value: "USED_EXCELLENT",
    label: "Used - Excellent",
    conditionId: "3000",
    description: "An item that has been used previously but is in excellent condition"
  },
  {
    value: "USED_VERY_GOOD",
    label: "Used - Very Good",
    conditionId: "4000",
    description: "An item that has been used previously but is in very good condition"
  },
  {
    value: "USED_GOOD",
    label: "Used - Good",
    conditionId: "5000",
    description: "An item that has been used previously but is in good condition"
  },
  {
    value: "USED_ACCEPTABLE",
    label: "Used - Acceptable",
    conditionId: "6000",
    description: "An item that has been used previously and shows wear, but is still functional"
  },
  {
    value: "FOR_PARTS_OR_NOT_WORKING",
    label: "For Parts or Not Working",
    conditionId: "7000",
    description: "An item that does not function as intended or is missing parts"
  }
]

/**
 * Get condition by value
 */
export function getConditionByValue(value: string): ConditionOption | undefined {
  return EBAY_CONDITIONS.find(condition => condition.value === value)
}

/**
 * Get condition by condition ID
 */
export function getConditionById(conditionId: string): ConditionOption | undefined {
  return EBAY_CONDITIONS.find(condition => condition.conditionId === conditionId)
}

/**
 * Get default condition (Brand New)
 */
export function getDefaultCondition(): ConditionOption {
  return EBAY_CONDITIONS[0]
}
