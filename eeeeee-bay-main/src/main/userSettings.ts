import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, existsSync, mkdirSync, unlinkSync } from 'fs'

interface UserSettings {
  ebayPolicies?: {
    paymentPolicyId?: string
    returnPolicyId?: string
    fulfillmentPolicyId?: string
  }
  preferences?: {
    autoPublish?: boolean
    defaultCategory?: string
    markupPercentage?: number
    initialSku?: number
    currentSkuCounter?: number
  }
  oauthTokens?: {
    accessToken?: string
    refreshToken?: string
    tokenExpiry?: number // timestamp when token expires
  }
}

/**
 * Manages user-specific settings and preferences
 * Stores data in JSON files within the Electron userData directory
 */
class UserSettingsManager {
  private userDataPath: string
  private currentUserId: string | null = null
  private settingsCache: Map<string, UserSettings> = new Map()

  constructor() {
    this.userDataPath = join(app.getPath('userData'), 'user-settings')
    this.ensureDirectoryExists()
  }

  private ensureDirectoryExists(): void {
    if (!existsSync(this.userDataPath)) {
      mkdirSync(this.userDataPath, { recursive: true })
    }
  }

  private getSettingsFilePath(userId: string): string {
    return join(this.userDataPath, `${userId}.json`)
  }

  private loadSettings(userId: string): UserSettings {
    if (this.settingsCache.has(userId)) {
      return this.settingsCache.get(userId)!
    }

    const filePath = this.getSettingsFilePath(userId)
    let settings: UserSettings = {}

    if (existsSync(filePath)) {
      try {
        const data = readFileSync(filePath, 'utf8')
        settings = JSON.parse(data)
      } catch (error) {
        console.warn(`Failed to load user settings for ${userId}:`, error)
        settings = {}
      }
    }

    this.settingsCache.set(userId, settings)
    return settings
  }

  private saveSettings(userId: string, settings: UserSettings): void {
    const filePath = this.getSettingsFilePath(userId)
    try {
      writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf8')
      this.settingsCache.set(userId, settings)
    } catch (error) {
      console.error(`Failed to save user settings for ${userId}:`, error)
      throw error
    }
  }

  /**
   * Sets the current authenticated user for settings management
   * @param userId - Unique user identifier
   */
  setCurrentUser(userId: string): void {
    this.currentUserId = userId
  }

  clearCurrentUser(): void {
    this.currentUserId = null
  }

  getCurrentUser(): string | null {
    return this.currentUserId
  }

  getUserSettings(userId?: string): UserSettings {
    const targetUserId = userId || this.currentUserId
    if (!targetUserId) {
      throw new Error('No user ID specified and no current user set')
    }
    return this.loadSettings(targetUserId)
  }

  updateUserSettings(userId: string, updates: Partial<UserSettings>): UserSettings {
    const currentSettings = this.loadSettings(userId)
    const newSettings = {
      ...currentSettings,
      ...updates,
      ebayPolicies: {
        ...currentSettings.ebayPolicies,
        ...updates.ebayPolicies
      },
      preferences: {
        ...currentSettings.preferences,
        ...updates.preferences
      }
    }
    this.saveSettings(userId, newSettings)
    return newSettings
  }

  /**
   * Retrieves the user's configured eBay policies
   * @param userId - Optional user ID (uses current user if not specified)
   * @returns Object containing policy IDs or empty object if not configured
   */
  getEbayPolicies(userId?: string): {
    paymentPolicyId?: string
    returnPolicyId?: string
    fulfillmentPolicyId?: string
  } {
    const settings = this.getUserSettings(userId)
    return settings.ebayPolicies || {}
  }

  setEbayPolicies(
    userId: string,
    policies: {
      paymentPolicyId?: string
      returnPolicyId?: string
      fulfillmentPolicyId?: string
    }
  ): void {
    this.updateUserSettings(userId, {
      ebayPolicies: policies
    })
  }

  hasEbayPolicies(userId?: string): boolean {
    const policies = this.getEbayPolicies(userId)
    return !!(policies.paymentPolicyId && policies.returnPolicyId && policies.fulfillmentPolicyId)
  }

  /**
   * Retrieves the user's initial SKU number
   * @param userId - Optional user ID (uses current user if not specified)
   * @returns Initial SKU number or undefined if not set
   */
  getInitialSku(userId?: string): number | undefined {
    const settings = this.getUserSettings(userId)
    return settings.preferences?.initialSku
  }

  setInitialSku(userId: string, initialSku: number): void {
    this.updateUserSettings(userId, {
      preferences: {
        ...this.getUserSettings(userId).preferences,
        initialSku
      }
    })
  }

  getCurrentSkuCounter(userId?: string): number | undefined {
    const settings = this.getUserSettings(userId)
    return settings.preferences?.currentSkuCounter
  }

  setCurrentSkuCounter(userId: string, counter: number): void {
    this.updateUserSettings(userId, {
      preferences: {
        ...this.getUserSettings(userId).preferences,
        currentSkuCounter: counter
      }
    })
  }

  /**
   * Stores OAuth tokens for the user
   * @param userId - User ID
   * @param tokens - OAuth token data
   */
  setOAuthTokens(
    userId: string,
    tokens: {
      accessToken?: string
      refreshToken?: string
      tokenExpiry?: number
    }
  ): void {
    this.updateUserSettings(userId, {
      oauthTokens: {
        ...this.getUserSettings(userId).oauthTokens,
        ...tokens
      }
    })
  }

  /**
   * Retrieves stored OAuth tokens for the user
   * @param userId - Optional user ID (uses current user if not specified)
   * @returns OAuth token data or empty object if not set
   */
  getOAuthTokens(userId?: string): {
    accessToken?: string
    refreshToken?: string
    tokenExpiry?: number
  } {
    const settings = this.getUserSettings(userId)
    return settings.oauthTokens || {}
  }

  /**
   * Checks if the stored access token is expired or will expire soon
   * @param userId - Optional user ID (uses current user if not specified)
   * @param bufferMinutes - Minutes before expiry to consider token expired (default: 5)
   * @returns true if token is expired or will expire soon
   */
  isAccessTokenExpired(userId?: string, bufferMinutes: number = 5): boolean {
    const tokens = this.getOAuthTokens(userId)
    if (!tokens.tokenExpiry) return true

    const bufferMs = bufferMinutes * 60 * 1000
    const now = Date.now()
    return now >= tokens.tokenExpiry - bufferMs
  }

  // Clear all settings for a user (useful for logout)
  clearUserSettings(userId: string): void {
    const filePath = this.getSettingsFilePath(userId)
    if (existsSync(filePath)) {
      try {
        unlinkSync(filePath)
      } catch (error) {
        console.warn(`Failed to delete settings file for ${userId}:`, error)
      }
    }
    this.settingsCache.delete(userId)
  }
}

// Export singleton instance
export const userSettingsManager = new UserSettingsManager()
export default userSettingsManager
