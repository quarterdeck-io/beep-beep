import { userSettingsManager } from './userSettings'
import { getBrowseApiClient, getInventoryApiClient, getAccountApiClient } from './config'
import { log } from './logger'

// Store current user's seller information
let currentSeller: {
  username: string
  feedbackPercentage?: string
  feedbackScore?: number
} | null = null

// Temporary storage for OAuth tokens during authentication flow
let pendingOAuthTokens: {
  accessToken: string
  refreshToken?: string
  tokenExpiry?: number
} | null = null

export function setCurrentSeller(seller: {
  username: string
  feedbackPercentage?: string
  feedbackScore?: number
}): void {
  currentSeller = seller
  log(`[EBAY-SERVICE] Current seller set: ${seller.username}`)
}

export function getCurrentSeller(): {
  username: string
  feedbackPercentage?: string
  feedbackScore?: number
} | null {
  return currentSeller
}

export function setAccessToken(token: string): void {
  log(`[EBAY-SERVICE] Setting access token (length: ${token.length})`)

  const browseApiClient = getBrowseApiClient()
  const inventoryApiClient = getInventoryApiClient()
  const accountApiClient = getAccountApiClient()

  if (browseApiClient && inventoryApiClient && accountApiClient) {
    // Set OAuth2 access token for Browse API
    browseApiClient.authentications['api_auth'].accessToken = token
    log(
      `[EBAY-SERVICE] Browse API token set: ${!!browseApiClient.authentications['api_auth'].accessToken}`
    )

    // Set OAuth2 access token for Inventory API
    inventoryApiClient.authentications['api_auth'].accessToken = token
    log(
      `[EBAY-SERVICE] Inventory API token set: ${!!inventoryApiClient.authentications['api_auth'].accessToken}`
    )

    // Set OAuth2 access token for Account API
    accountApiClient.authentications['api_auth'].accessToken = token
    log(
      `[EBAY-SERVICE] Account API token set: ${!!accountApiClient.authentications['api_auth'].accessToken}`
    )

    log(`[EBAY-SERVICE] Access token set successfully for all APIs`)

    // Store the access token in user settings if we have a current user
    const currentUser = userSettingsManager.getCurrentUser()
    if (currentUser) {
      // If we have pending tokens from OAuth flow, save them now
      if (pendingOAuthTokens) {
        userSettingsManager.setOAuthTokens(currentUser, pendingOAuthTokens)
        log(`[EBAY-SERVICE] Saved pending OAuth tokens for user: ${currentUser}`)
        pendingOAuthTokens = null
      } else {
        // Otherwise just update the access token
        const existingTokens = userSettingsManager.getOAuthTokens(currentUser)
        userSettingsManager.setOAuthTokens(currentUser, {
          ...existingTokens,
          accessToken: token
        })
        log(`[EBAY-SERVICE] Updated access token in user settings for user: ${currentUser}`)
      }
    }
  } else {
    log(`[EBAY-SERVICE] Warning: eBay API clients not initialized, cannot set token`)
    log(`[EBAY-SERVICE] Browse client initialized: ${!!browseApiClient}`)
    log(`[EBAY-SERVICE] Inventory client initialized: ${!!inventoryApiClient}`)
    log(`[EBAY-SERVICE] Account client initialized: ${!!accountApiClient}`)
  }
}

export async function exchangeCodeForToken(
  code: string,
  redirectUri: string,
  clientId: string,
  clientSecret: string,
  sandbox: boolean = true
): Promise<string> {
  log(
    `[EBAY-SERVICE] Exchanging authorization code for token: sandbox=${sandbox}, redirectUri=${redirectUri}, clientId=${clientId}, code length=${code.length}`
  )

  const tokenUrl = sandbox
    ? 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'
    : 'https://api.ebay.com/identity/v1/oauth2/token'

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: redirectUri
  })

  log(`[EBAY-SERVICE] Making POST request to ${tokenUrl} with params: ${params.toString()}`)

  const requestPayload = {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  }
  log(
    `[EBAY-SERVICE] Token exchange request payload: ${JSON.stringify({ ...requestPayload, headers: { ...requestPayload.headers, Authorization: '[REDACTED]' } })}`
  )

  const response = await fetch(tokenUrl, requestPayload)

  if (!response.ok) {
    const errorText = await response.text()
    log(`[EBAY-SERVICE] Token exchange failed: ${response.status} ${errorText}`)
    throw new Error(`Token exchange failed: ${response.status} ${errorText}`)
  }

  const tokenData = await response.json()
  log(
    `[EBAY-SERVICE] Token exchange successful, received access token (length: ${tokenData.access_token?.length || 0})`
  )

  // Store tokens temporarily for later saving when current user is set
  if (tokenData.access_token) {
    const tokenExpiry = tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : undefined
    pendingOAuthTokens = {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiry: tokenExpiry
    }
    log(`[EBAY-SERVICE] Stored OAuth tokens temporarily for later saving`)
  }

  // Store tokens in user settings if we have a current user
  // Note: Current user may not be set yet during OAuth flow, tokens will be saved later
  const currentUser = userSettingsManager.getCurrentUser()
  if (currentUser && tokenData.access_token) {
    const tokenExpiry = tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : undefined

    userSettingsManager.setOAuthTokens(currentUser, {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      tokenExpiry: tokenExpiry
    })

    log(`[EBAY-SERVICE] Stored OAuth tokens for user: ${currentUser}`)
    // Clear pending tokens since they're now saved
    pendingOAuthTokens = null
  } else {
    log(`[EBAY-SERVICE] Current user not set yet, tokens stored temporarily`)
  }

  return tokenData.access_token
}

/**
 * Ensures a valid access token is available, refreshing if necessary
 * @param clientId - eBay application client ID
 * @param clientSecret - eBay application client secret
 * @param sandbox - Whether to use sandbox environment (default: true)
 * @returns Promise resolving to valid access token
 * @throws Error if no tokens available or refresh fails
 */
export async function ensureValidAccessToken(
  clientId: string,
  clientSecret: string,
  sandbox: boolean = true
): Promise<string> {
  try {
    log(`[EBAY-SERVICE] Ensuring valid access token`)

    const currentUser = userSettingsManager.getCurrentUser()
    log(`[EBAY-SERVICE] Current user: ${currentUser || 'null'}`)

    if (!currentUser) {
      log(`[EBAY-SERVICE] ERROR: No user authenticated`)
      throw new Error('No user authenticated')
    }

    const tokens = userSettingsManager.getOAuthTokens(currentUser)
    log(
      `[EBAY-SERVICE] Stored tokens - access: ${!!tokens.accessToken}, refresh: ${!!tokens.refreshToken}, expiry: ${tokens.tokenExpiry}`
    )

    // Debug: Log actual token values (truncated for security)
    log(
      `[EBAY-SERVICE] Access token exists: ${!!tokens.accessToken} (length: ${tokens.accessToken?.length || 0})`
    )
    log(
      `[EBAY-SERVICE] Refresh token exists: ${!!tokens.refreshToken} (length: ${tokens.refreshToken?.length || 0})`
    )
    log(
      `[EBAY-SERVICE] Token expiry: ${tokens.tokenExpiry} (is expired: ${userSettingsManager.isAccessTokenExpired(currentUser)})`
    )

    // If we have a stored access token and it's not expired, use it
    if (tokens.accessToken && !userSettingsManager.isAccessTokenExpired(currentUser)) {
      log(`[EBAY-SERVICE] Using existing valid access token`)
      setAccessToken(tokens.accessToken)
      return tokens.accessToken
    }

    // If we have a refresh token, try to refresh
    if (tokens.refreshToken) {
      log(`[EBAY-SERVICE] Access token expired or missing, attempting refresh`)
      try {
        const newToken = await refreshAccessToken(clientId, clientSecret, sandbox)
        log(`[EBAY-SERVICE] Token refresh successful`)
        return newToken
      } catch (error) {
        log(`[EBAY-SERVICE] Token refresh failed: ${error}`)
        throw new Error(`Failed to refresh access token: ${error}`)
      }
    }

    // No valid tokens available
    log(`[EBAY-SERVICE] ERROR: No valid access token available and no refresh token to obtain one`)
    throw new Error('No valid access token available and no refresh token to obtain one')
  } catch (error) {
    log(`[EBAY-SERVICE] CRITICAL ERROR in ensureValidAccessToken: ${error}`)
    throw error
  }
}

/**
 * Refreshes the access token using the stored refresh token
 * @param clientId - eBay application client ID
 * @param clientSecret - eBay application client secret
 * @param sandbox - Whether to use sandbox environment (default: true)
 * @returns Promise resolving to new access token
 * @throws Error if no refresh token available or refresh fails
 */
export async function refreshAccessToken(
  clientId: string,
  clientSecret: string,
  sandbox: boolean = true
): Promise<string> {
  log(`[EBAY-SERVICE] Refreshing access token: sandbox=${sandbox}`)

  const currentUser = userSettingsManager.getCurrentUser()
  if (!currentUser) {
    throw new Error('No user authenticated')
  }

  const tokens = userSettingsManager.getOAuthTokens(currentUser)
  if (!tokens.refreshToken) {
    throw new Error('No refresh token available')
  }

  const tokenUrl = sandbox
    ? 'https://api.sandbox.ebay.com/identity/v1/oauth2/token'
    : 'https://api.ebay.com/identity/v1/oauth2/token'

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: tokens.refreshToken
  })

  log(`[EBAY-SERVICE] Making POST request to ${tokenUrl} for token refresh`)

  const requestPayload = {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  }

  const response = await fetch(tokenUrl, requestPayload)

  if (!response.ok) {
    const errorText = await response.text()
    log(`[EBAY-SERVICE] Token refresh failed: ${response.status} ${errorText}`)
    throw new Error(`Token refresh failed: ${response.status} ${errorText}`)
  }

  const tokenData = await response.json()
  log(
    `[EBAY-SERVICE] Token refresh successful, received new access token (length: ${tokenData.access_token?.length || 0})`
  )

  // Update stored tokens
  const tokenExpiry = tokenData.expires_in ? Date.now() + tokenData.expires_in * 1000 : undefined

  userSettingsManager.setOAuthTokens(currentUser, {
    accessToken: tokenData.access_token,
    refreshToken: tokenData.refresh_token || tokens.refreshToken, // Keep old refresh token if not provided
    tokenExpiry: tokenExpiry
  })

  log(`[EBAY-SERVICE] Updated stored OAuth tokens for user: ${currentUser}`)

  // Set the new access token on API clients
  setAccessToken(tokenData.access_token)

  return tokenData.access_token
}

export function isAuthenticated(): boolean {
  const browseApiClient = getBrowseApiClient()
  const inventoryApiClient = getInventoryApiClient()
  const accountApiClient = getAccountApiClient()

  const browseAuthenticated =
    browseApiClient !== null &&
    browseApiClient.authentications['api_auth'].accessToken !== undefined
  const inventoryAuthenticated =
    inventoryApiClient !== null &&
    inventoryApiClient.authentications['api_auth'].accessToken !== undefined
  const accountAuthenticated =
    accountApiClient !== null &&
    accountApiClient.authentications['api_auth'].accessToken !== undefined
  const authenticated = browseAuthenticated && inventoryAuthenticated && accountAuthenticated
  log(
    `[EBAY-SERVICE] Authentication check: ${authenticated} (Browse: ${browseAuthenticated}, Inventory: ${inventoryAuthenticated}, Account: ${accountAuthenticated})`
  )
  return authenticated
}

export function getPendingOAuthTokens(): {
  accessToken: string
  refreshToken?: string
  tokenExpiry?: number
} | null {
  return pendingOAuthTokens
}

export function clearPendingOAuthTokens(): void {
  pendingOAuthTokens = null
}

export function logout(): void {
  log(`[EBAY-SERVICE] Logging out - clearing tokens and seller information`)

  const browseApiClient = getBrowseApiClient()
  const inventoryApiClient = getInventoryApiClient()
  const accountApiClient = getAccountApiClient()

  if (browseApiClient) {
    browseApiClient.authentications['api_auth'].accessToken = undefined
  }
  if (inventoryApiClient) {
    inventoryApiClient.authentications['api_auth'].accessToken = undefined
  }
  if (accountApiClient) {
    accountApiClient.authentications['api_auth'].accessToken = undefined
  }

  // Clear stored OAuth tokens
  const currentUser = userSettingsManager.getCurrentUser()
  if (currentUser) {
    userSettingsManager.setOAuthTokens(currentUser, {
      accessToken: undefined,
      refreshToken: undefined,
      tokenExpiry: undefined
    })
    log(`[EBAY-SERVICE] Cleared stored OAuth tokens for user: ${currentUser}`)
  }

  // Clear current seller information
  currentSeller = null

  log(`[EBAY-SERVICE] Logout complete`)
}
