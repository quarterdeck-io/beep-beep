import { app, shell, BrowserWindow, ipcMain, session } from 'electron'

// Disable strict SSL checking for local development
app.commandLine.appendSwitch('--ignore-ssl-errors')
app.commandLine.appendSwitch('--ignore-certificate-errors')
import { appendFileSync } from 'fs'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import {
  initializeEbayApi,
  setAccessToken,
  searchByUPC,
  isAuthenticated,
  getApiConfig,
  exchangeCodeForToken,
  checkForDuplicate,
  getInventoryItems,
  createInventoryItem,
  createOffer,
  publishOffer,
  getNextSku,
  logout,
  createAndPublishListing,
  getFulfillmentPolicies,
  getPaymentPolicies,
  getReturnPolicies,
  optInToProgram,
  EbayConfig,
  Product
} from './ebayService'
import { OfferData } from './offers'
import { userSettingsManager } from './userSettings'

/**
 * Creates and configures the main application window
 * Sets up browser window with proper security settings and event handlers
 */
function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      nodeIntegration: true, // TODO: Security - should be false in production
      sandbox: false // TODO: Security - should be true in production
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

/**
 * Clears browser cache and storage data to prevent stale sessions
 * Used during OAuth logout to ensure clean session state
 * @param session - Electron session object to clear
 */
function clearCacheAndStorage(session: Electron.Session): void {
  // Remove cached data to avoid stale sessions
  session.clearCache()
  session.clearStorageData({
    storages: ['cookies', 'localstorage', 'indexdb', 'cachestorage']
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Logging helper
  const logPath = join(__dirname, '../../eeeeee-bay.log')
  function log(msg: string): void {
    const line = `[${new Date().toISOString()}] ${msg}\n`
    try {
      appendFileSync(logPath, line)
    } catch {
      /* ignore */
    }
  }

  /**
   * OAuth login IPC handler
   * Opens eBay OAuth authorization URL in a popup window and handles the authorization code flow
   * @param _event - IPC event (unused)
   * @param params - OAuth parameters including auth URL, redirect URI, and credentials
   * @returns Promise resolving to access token string or null on failure
   */
  ipcMain.handle(
    'oauth-login',
    async (
      _event,
      {
        authUrl,
        redirectUri,
        clientId,
        clientSecret,
        sandbox
      }: {
        authUrl: string
        redirectUri: string
        clientId: string
        clientSecret: string
        sandbox: boolean
      }
    ): Promise<string | null> => {
      log(`[OAUTH] Starting OAuth login with URL: ${authUrl}`)
      log(`[OAUTH] Redirect URI: ${redirectUri}`)
      log(`[OAUTH] Client ID: ${clientId}`)
      log(`[OAUTH] Sandbox mode: ${sandbox}`)

      // Validate required parameters
      if (!redirectUri) {
        const error = 'redirectUri is required but was undefined'
        log(`[OAUTH] Error: ${error}`)
        throw new Error(error)
      }

      const authCode = await new Promise<string | null>((resolve) => {
        const popup = new BrowserWindow({
          width: 500,
          height: 700,
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            webSecurity: false,
            allowRunningInsecureContent: true,
            experimentalFeatures: true
          }
        })

        // Remove cached data to avoid stale sessions
        // clearCacheAndStorage(popup.webContents.session) // Removed - now only on user logout

        // Configure session to handle certificates and network requests
        const session = popup.webContents.session

        // Disable certificate validation for all hosts during OAuth
        session.setCertificateVerifyProc((_request, callback) => {
          // Accept all certificates during OAuth flow
          log('[OAUTH] Bypassing certificate validation for OAuth flow')
          callback(0) // 0 means accept the certificate
        })

        // Set user agent to avoid blocking
        session.setUserAgent(
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        )

        // Handle permission requests
        session.setPermissionRequestHandler((_webContents, _permission, callback) => {
          // Allow all permissions for OAuth flow
          callback(true)
        })

        // Add debugging for popup window
        popup.webContents.on('did-start-loading', () => {
          log('[OAUTH] Popup started loading')
        })

        popup.webContents.on('did-finish-load', () => {
          log(`[OAUTH] Popup finished loading: ${popup.webContents.getURL()}`)
        })

        popup.webContents.on(
          'did-fail-load',
          (_event, errorCode, errorDescription, validatedURL) => {
            log(
              `[OAUTH] Popup failed to load: ${errorCode} - ${errorDescription} - ${validatedURL}`
            )
          }
        )

        popup.webContents.on('will-redirect', (event, url) => {
          log(`[OAUTH] Popup redirecting to: ${url}`)
          // Check if redirected to the configured callback URL
          if (url.startsWith(redirectUri)) {
            log('[OAUTH] Detected callback redirect, preventing navigation and extracting code')
            event.preventDefault()
            const urlObj = new URL(url)
            const code = urlObj.searchParams.get('code')
            const error = urlObj.searchParams.get('error')
            if (error) {
              log(`[OAUTH] OAuth error: ${error}`)
              resolve(null)
            } else if (code) {
              log('[OAUTH] Extracted authorization code from redirect URL')
              resolve(code)
            } else {
              log('[OAUTH] No code or error in redirect URL')
              resolve(null)
            }
            popup.close()
          }
        })

        log(`[OAUTH] Opening popup with authUrl: ${authUrl}`)
        popup.loadURL(authUrl)
        popup.on('closed', () => {
          log('[OAUTH] OAuth popup closed by user')
          resolve(null)
        })
      })

      // If we got an authorization code, exchange it for an access token
      if (authCode) {
        try {
          log('[OAUTH] Exchanging authorization code for access token')
          const accessToken = await exchangeCodeForToken(
            authCode,
            redirectUri,
            clientId,
            clientSecret,
            sandbox
          )
          log('[OAUTH] Successfully received access token')
          return accessToken
        } catch (error: unknown) {
          log(`[OAUTH] Token exchange failed: ${(error as Error).message}`)
          return null
        }
      }

      return null
    }
  )

  /**
   * eBay API initialization IPC handler
   * Initializes the eBay API client with provided configuration
   * @param _event - IPC event (unused)
   * @param config - eBay API configuration including app ID, sandbox mode, etc.
   * @returns Promise resolving to success result with API initialization status
   */
  ipcMain.handle('ebay-init', async (_event, config: EbayConfig) => {
    try {
      initializeEbayApi(config)
      log(`[EBAY] API initialized - sandbox: ${config.sandbox}, siteId: ${config.siteID}`)
      return { success: true }
    } catch (error: unknown) {
      log(`[EBAY] API initialization failed: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('ebay-set-token', async (_event, token: string) => {
    try {
      setAccessToken(token)
      log('[EBAY] Access token set')
      return { success: true }
    } catch (error: unknown) {
      log(`[EBAY] Failed to set token: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  })

  /**
   * eBay UPC search IPC handler
   * Searches for product information using UPC/EAN barcode
   * @param _event - IPC event (unused)
   * @param upc - UPC or EAN barcode string to search for
   * @returns Promise resolving to search result with product data or error
   */
  ipcMain.handle('ebay-search-upc', async (_event, upc: string) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Please authenticate first')
      }
      log(`[EBAY] Searching for UPC: ${upc}`)
      const result = await searchByUPC(upc)
      log(`[EBAY] Search result: ${result ? 'found' : 'not found'}`)
      return { success: true, data: result }
    } catch (error: unknown) {
      log(`[EBAY] Search failed: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('ebay-is-authenticated', async () => {
    const authenticated = isAuthenticated()
    return { success: true, data: authenticated }
  })

  ipcMain.handle('ebay-get-config', async () => {
    const config = getApiConfig()
    return { success: true, data: config }
  })

  ipcMain.handle('ebay-check-duplicate', async (_event, upc: string) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Please authenticate first')
      }
      log(`[EBAY] Checking for duplicate UPC: ${upc}`)
      const isDuplicate = await checkForDuplicate(upc)
      log(`[EBAY] Duplicate check result: ${isDuplicate}`)
      return { success: true, data: isDuplicate }
    } catch (error: unknown) {
      log(`[EBAY] Duplicate check failed: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('ebay-get-inventory', async (_event, limit: number = 100) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Please authenticate first')
      }
      log(`[EBAY] Getting inventory items (limit: ${limit})`)
      const items = await getInventoryItems(limit)
      log(`[EBAY] Retrieved ${items.length} inventory items`)
      return { success: true, data: items }
    } catch (error: unknown) {
      log(`[EBAY] Failed to get inventory: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(
    'ebay-create-inventory-item',
    async (_event, sku: string, itemData: Record<string, unknown>) => {
      try {
        if (!isAuthenticated()) {
          throw new Error('Please authenticate first')
        }
        log(`[EBAY] Creating inventory item with SKU: ${sku}`)
        const result = await createInventoryItem(sku, itemData)
        log(`[EBAY] Successfully created inventory item`)
        return { success: true, data: result }
      } catch (error: unknown) {
        log(`[EBAY] Failed to create inventory item: ${(error as Error).message}`)
        return { success: false, error: (error as Error).message }
      }
    }
  )

  ipcMain.handle('ebay-create-offer', async (_event, offerData: Record<string, unknown>) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Please authenticate first')
      }
      log(`[EBAY] Creating offer`)
      const result = await createOffer(offerData as unknown as OfferData)
      log(`[EBAY] Successfully created offer`)
      return { success: true, data: result }
    } catch (error: unknown) {
      log(`[EBAY] Failed to create offer: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('ebay-publish-offer', async (_event, offerId: string) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Please authenticate first')
      }
      log(`[EBAY] Publishing offer: ${offerId}`)
      const result = await publishOffer(offerId)
      log(`[EBAY] Successfully published offer`)
      return { success: true, data: result }
    } catch (error: unknown) {
      log(`[EBAY] Failed to publish offer: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('ebay-get-next-sku', async () => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Please authenticate first')
      }
      log(`[EBAY] Getting next SKU`)
      const sku = await getNextSku()
      log(`[EBAY] Next SKU: ${sku}`)
      return { success: true, data: sku }
    } catch (error: unknown) {
      log(`[EBAY] Failed to get next SKU: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('ebay-logout', async () => {
    try {
      log(`[EBAY] Logging out`)
      logout()
      // Clear user settings on logout
      const currentUser = userSettingsManager.getCurrentUser()
      if (currentUser) {
        userSettingsManager.clearUserSettings(currentUser)
        userSettingsManager.clearCurrentUser()
      }
      // Clear browser cache and storage data on user logout
      clearCacheAndStorage(session.defaultSession)
      log(`[EBAY] Logout successful`)
      return { success: true }
    } catch (error: unknown) {
      log(`[EBAY] Logout failed: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  })

  /**
   * Create and publish eBay listing IPC handler
   * Creates inventory item, offer, and publishes the listing in a single operation
   * @param _event - IPC event (unused)
   * @param product - Complete product data including title, price, images, etc.
   * @returns Promise resolving to success result with listing creation status
   */
  ipcMain.handle(
    'ebay-create-and-publish-listing',
    async (_event, product: Record<string, unknown>) => {
      try {
        if (!isAuthenticated()) {
          throw new Error('Please authenticate first')
        }
        log(`[EBAY] Creating and publishing listing`)
        const result = await createAndPublishListing(product as unknown as Product)
        log(`[EBAY] Listing created and published successfully`)
        return { success: true, ...result }
      } catch (error: unknown) {
        log(`[EBAY] Create and publish listing failed: ${(error as Error).message}`)
        return { success: false, error: (error as Error).message }
      }
    }
  )

  ipcMain.handle('ebay-get-fulfillment-policies', async (_event, marketplaceId?: string) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Please authenticate first')
      }
      log(`[EBAY] Getting fulfillment policies for marketplace: ${marketplaceId || 'EBAY_US'}`)
      const policies = await getFulfillmentPolicies(marketplaceId)
      log(`[EBAY] Retrieved ${policies.length} fulfillment policies`)
      return { success: true, data: policies }
    } catch (error: unknown) {
      log(`[EBAY] Failed to get fulfillment policies: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('ebay-get-payment-policies', async (_event, marketplaceId?: string) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Please authenticate first')
      }
      log(`[EBAY] Getting payment policies for marketplace: ${marketplaceId || 'EBAY_US'}`)
      const policies = await getPaymentPolicies(marketplaceId)
      log(`[EBAY] Retrieved ${policies.length} payment policies`)
      return { success: true, data: policies }
    } catch (error: unknown) {
      log(`[EBAY] Failed to get payment policies: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('ebay-get-return-policies', async (_event, marketplaceId?: string) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Please authenticate first')
      }
      log(`[EBAY] Getting return policies for marketplace: ${marketplaceId || 'EBAY_US'}`)
      const policies = await getReturnPolicies(marketplaceId)
      log(`[EBAY] Retrieved ${policies.length} return policies`)
      return { success: true, data: policies }
    } catch (error: unknown) {
      log(`[EBAY] Failed to get return policies: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('ebay-opt-in-to-program', async (_event, programType: string) => {
    try {
      if (!isAuthenticated()) {
        throw new Error('Please authenticate first')
      }
      log(`[EBAY] Opting into program: ${programType}`)
      const result = await optInToProgram(programType)
      log(`[EBAY] Successfully opted into program`)
      return { success: true, data: result }
    } catch (error: unknown) {
      log(`[EBAY] Failed to opt into program: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  })

  // User settings IPC handlers
  ipcMain.handle('user-settings-set-current-user', async (_event, userId: string) => {
    try {
      log(`[USER-SETTINGS] Setting current user: ${userId}`)
      userSettingsManager.setCurrentUser(userId)

      // Import the pending tokens function
      const { getPendingOAuthTokens, clearPendingOAuthTokens } = await import('./auth')
      const pendingTokens = getPendingOAuthTokens()
      if (pendingTokens) {
        userSettingsManager.setOAuthTokens(userId, pendingTokens)
        log(`[USER-SETTINGS] Saved pending OAuth tokens for user: ${userId}`)
        clearPendingOAuthTokens()
      }

      return { success: true }
    } catch (error: unknown) {
      log(`[USER-SETTINGS] Failed to set current user: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('user-settings-get-ebay-policies', async () => {
    try {
      const policies = userSettingsManager.getEbayPolicies()
      log(`[USER-SETTINGS] Retrieved eBay policies`)
      return { success: true, data: policies }
    } catch (error: unknown) {
      log(`[USER-SETTINGS] Failed to get eBay policies: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(
    'user-settings-set-ebay-policies',
    async (_event, policies: Record<string, unknown>) => {
      try {
        const currentUser = userSettingsManager.getCurrentUser()
        if (!currentUser) {
          throw new Error('No current user set')
        }
        log(`[USER-SETTINGS] Setting eBay policies for user: ${currentUser}`)
        userSettingsManager.setEbayPolicies(currentUser, policies)
        return { success: true }
      } catch (error: unknown) {
        log(`[USER-SETTINGS] Failed to set eBay policies: ${(error as Error).message}`)
        return { success: false, error: (error as Error).message }
      }
    }
  )

  ipcMain.handle('user-settings-has-ebay-policies', async () => {
    try {
      const hasPolicies = userSettingsManager.hasEbayPolicies()
      log(`[USER-SETTINGS] Checking if user has eBay policies: ${hasPolicies}`)
      return { success: true, data: hasPolicies }
    } catch (error: unknown) {
      log(`[USER-SETTINGS] Failed to check eBay policies: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('user-settings-clear', async () => {
    try {
      const currentUser = userSettingsManager.getCurrentUser()
      if (currentUser) {
        log(`[USER-SETTINGS] Clearing settings for user: ${currentUser}`)
        userSettingsManager.clearUserSettings(currentUser)
      }
      return { success: true }
    } catch (error: unknown) {
      log(`[USER-SETTINGS] Failed to clear user settings: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('user-settings-get-initial-sku', async () => {
    try {
      const initialSku = userSettingsManager.getInitialSku()
      log(`[USER-SETTINGS] Retrieved initial SKU: ${initialSku}`)
      return { success: true, data: initialSku }
    } catch (error: unknown) {
      log(`[USER-SETTINGS] Failed to get initial SKU: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle('user-settings-set-initial-sku', async (_event, initialSku: number) => {
    try {
      const currentUser = userSettingsManager.getCurrentUser()
      if (!currentUser) {
        throw new Error('No current user set')
      }
      log(`[USER-SETTINGS] Setting initial SKU for user: ${currentUser} to ${initialSku}`)
      userSettingsManager.setInitialSku(currentUser, initialSku)
      return { success: true }
    } catch (error: unknown) {
      log(`[USER-SETTINGS] Failed to set initial SKU: ${(error as Error).message}`)
      return { success: false, error: (error as Error).message }
    }
  })

  createWindow()

  app.on('activate', function () {
    // NO OP
  })
})

// Quit when all windows are closed
app.on('window-all-closed', () => {
  app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
