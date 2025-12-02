import { log } from './logger'
import {
  getFulfillmentPolicyApi,
  getPaymentPolicyApi,
  getReturnPolicyApi,
  getProgramApi
} from './config'
import { ensureValidAccessToken } from './auth'
import { getCurrentConfig } from './config'

/**
 * Interface for policy response data
 */
export interface PolicyResponse {
  [key: string]: unknown
}

/**
 * Retrieves the user's configured fulfillment policies from eBay
 * @param marketplaceId - eBay marketplace identifier (default: 'EBAY_US')
 * @returns Promise resolving to array of fulfillment policies
 * @throws Error if API not initialized or request fails
 */
export async function getFulfillmentPolicies(marketplaceId = 'EBAY_US'): Promise<PolicyResponse[]> {
  log(`[EBAY-SERVICE] Getting fulfillment policies for marketplace: ${marketplaceId}`)

  const fulfillmentPolicyApi = getFulfillmentPolicyApi()
  if (!fulfillmentPolicyApi) {
    log(`[EBAY-SERVICE] Error: eBay Account API not initialized`)
    throw new Error('eBay Account API not initialized. Please call initializeEbayApi first.')
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
      `[EBAY-SERVICE] Making getFulfillmentPolicies API call with marketplaceId: ${marketplaceId}`
    )
    log(
      `[EBAY-SERVICE] FulfillmentPolicyApi apiClient: ${fulfillmentPolicyApi?.apiClient?.constructor?.name}`
    )
    log(
      `[EBAY-SERVICE] Account API client authentication state: ${JSON.stringify({
        hasAuth: !!fulfillmentPolicyApi?.apiClient?.authentications?.['api_auth'],
        tokenSet: !!fulfillmentPolicyApi?.apiClient?.authentications?.['api_auth']?.accessToken,
        tokenLength:
          fulfillmentPolicyApi?.apiClient?.authentications?.['api_auth']?.accessToken?.length || 0
      })}`
    )
    fulfillmentPolicyApi.getFulfillmentPolicies(marketplaceId, {}, (error, data, response) => {
      log(`[EBAY-SERVICE] getFulfillmentPolicies API call completed`)
      log(`[EBAY-SERVICE] Response status: ${response?.status}`)
      log(`[EBAY-SERVICE] Response headers: ${JSON.stringify(response?.headers, null, 2)}`)

      if (error) {
        log(`[EBAY-SERVICE] Error getting fulfillment policies: ${JSON.stringify(error, null, 2)}`)
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
        log(`[EBAY-SERVICE] Successfully retrieved fulfillment policies`)
        const policies = data.fulfillmentPolicies || []
        log(`[EBAY-SERVICE] Found ${policies.length} fulfillment policies`)
        resolve(policies)
      }
    })
  })
}

/**
 * Retrieves the user's configured payment policies from eBay
 * @param marketplaceId - eBay marketplace identifier (default: 'EBAY_US')
 * @returns Promise resolving to array of payment policies
 * @throws Error if API not initialized or request fails
 */
export async function getPaymentPolicies(marketplaceId = 'EBAY_US'): Promise<PolicyResponse[]> {
  log(`[EBAY-SERVICE] Getting payment policies for marketplace: ${marketplaceId}`)

  const paymentPolicyApi = getPaymentPolicyApi()
  if (!paymentPolicyApi) {
    log(`[EBAY-SERVICE] Error: eBay Account API not initialized`)
    throw new Error('eBay Account API not initialized. Please call initializeEbayApi first.')
  }

  const currentConfig = getCurrentConfig()
  // Ensure we have a valid access token
  await ensureValidAccessToken(
    currentConfig?.appID || '',
    currentConfig?.certID || '',
    currentConfig?.sandbox
  )

  return new Promise((resolve, reject) => {
    log(`[EBAY-SERVICE] Making getPaymentPolicies API call with marketplaceId: ${marketplaceId}`)
    log(
      `[EBAY-SERVICE] Account API client authentication state: ${JSON.stringify({
        hasAuth: !!paymentPolicyApi?.apiClient?.authentications?.['api_auth'],
        tokenSet: !!paymentPolicyApi?.apiClient?.authentications?.['api_auth']?.accessToken,
        tokenLength:
          paymentPolicyApi?.apiClient?.authentications?.['api_auth']?.accessToken?.length || 0
      })}`
    )
    paymentPolicyApi.getPaymentPolicies(marketplaceId, {}, (error, data, response) => {
      log(`[EBAY-SERVICE] getPaymentPolicies API call completed`)
      log(`[EBAY-SERVICE] Response status: ${response?.status}`)
      log(`[EBAY-SERVICE] Response headers: ${JSON.stringify(response?.headers, null, 2)}`)

      if (error) {
        log(`[EBAY-SERVICE] Error getting payment policies: ${JSON.stringify(error, null, 2)}`)
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
        log(`[EBAY-SERVICE] Successfully retrieved payment policies`)
        log(`[EBAY-SERVICE] Payment policies response: ${JSON.stringify(data, null, 2)}`)
        const policies = data.paymentPolicies || []
        log(`[EBAY-SERVICE] Found ${policies.length} payment policies`)
        resolve(policies)
      }
    })
  })
}

/**
 * Retrieves the user's configured return policies from eBay
 * @param marketplaceId - eBay marketplace identifier (default: 'EBAY_US')
 * @returns Promise resolving to array of return policies
 * @throws Error if API not initialized or request fails
 */
export async function getReturnPolicies(marketplaceId = 'EBAY_US'): Promise<PolicyResponse[]> {
  log(`[EBAY-SERVICE] Getting return policies for marketplace: ${marketplaceId}`)

  const returnPolicyApi = getReturnPolicyApi()
  if (!returnPolicyApi) {
    log(`[EBAY-SERVICE] Error: eBay Account API not initialized`)
    throw new Error('eBay Account API not initialized. Please call initializeEbayApi first.')
  }

  const currentConfig = getCurrentConfig()
  // Ensure we have a valid access token
  await ensureValidAccessToken(
    currentConfig?.appID || '',
    currentConfig?.certID || '',
    currentConfig?.sandbox
  )

  return new Promise((resolve, reject) => {
    log(`[EBAY-SERVICE] Making getReturnPolicies API call with marketplaceId: ${marketplaceId}`)
    log(
      `[EBAY-SERVICE] Account API client authentication state: ${JSON.stringify({
        hasAuth: !!returnPolicyApi?.apiClient?.authentications?.['api_auth'],
        tokenSet: !!returnPolicyApi?.apiClient?.authentications?.['api_auth']?.accessToken,
        tokenLength:
          returnPolicyApi?.apiClient?.authentications?.['api_auth']?.accessToken?.length || 0
      })}`
    )
    returnPolicyApi.getReturnPolicies(marketplaceId, {}, (error, data, response) => {
      log(`[EBAY-SERVICE] getReturnPolicies API call completed`)
      log(`[EBAY-SERVICE] Response status: ${response?.status}`)
      log(`[EBAY-SERVICE] Response headers: ${JSON.stringify(response?.headers, null, 2)}`)

      if (error) {
        log(`[EBAY-SERVICE] Error getting return policies: ${JSON.stringify(error, null, 2)}`)
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
        log(`[EBAY-SERVICE] Successfully retrieved return policies`)
        log(`[EBAY-SERVICE] Return policies response: ${JSON.stringify(data, null, 2)}`)
        const policies = data.returnPolicies || []
        log(`[EBAY-SERVICE] Found ${policies.length} return policies`)
        resolve(policies)
      }
    })
  })
}

/**
 * Opts into a specific eBay program
 * @param programType - The type of program to opt into
 * @returns Promise resolving to the opt-in result
 * @throws Error if API not initialized or request fails
 */
export async function optInToProgram(programType: string): Promise<PolicyResponse> {
  log(`[EBAY-SERVICE] Opting into program: ${programType}`)

  const programApi = getProgramApi()
  if (!programApi) {
    log(`[EBAY-SERVICE] Error: Program API not initialized`)
    throw new Error('Program API not initialized. Please call initializeEbayApi first.')
  }

  const currentConfig = getCurrentConfig()
  // Ensure we have a valid access token
  await ensureValidAccessToken(
    currentConfig?.appID || '',
    currentConfig?.certID || '',
    currentConfig?.sandbox
  )

  return new Promise((resolve, reject) => {
    log(`[EBAY-SERVICE] Making optInToProgram API call with programType: ${programType}`)
    log(
      `[EBAY-SERVICE] Account API client authentication state: ${JSON.stringify({
        hasAuth: !!programApi?.apiClient?.authentications?.['api_auth'],
        tokenSet: !!programApi?.apiClient?.authentications?.['api_auth']?.accessToken,
        tokenLength: programApi?.apiClient?.authentications?.['api_auth']?.accessToken?.length || 0
      })}`
    )

    programApi.optInToProgram(programType, (error, data, response) => {
      log(`[EBAY-SERVICE] optInToProgram API call completed`)
      log(`[EBAY-SERVICE] Response status: ${response?.status}`)
      log(`[EBAY-SERVICE] Response headers: ${JSON.stringify(response?.headers, null, 2)}`)

      if (error) {
        log(`[EBAY-SERVICE] Error opting into program: ${JSON.stringify(error, null, 2)}`)
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
        log(`[EBAY-SERVICE] Successfully opted into program`)
        resolve(data as PolicyResponse)
      }
    })
  })
}
