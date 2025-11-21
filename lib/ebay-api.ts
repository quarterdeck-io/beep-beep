import { prisma } from "./prisma"

/**
 * Get eBay access token for the current user, refreshing if necessary
 * Production API only
 */
export async function getEbayAccessToken(userId: string): Promise<string> {
  const ebayToken = await prisma.ebayToken.findUnique({
    where: { userId }
  })

  if (!ebayToken) {
    throw new Error("eBay account not connected. Please connect your eBay account first.")
  }

  // Check if token is expired and refresh if necessary
  let accessToken = ebayToken.accessToken
  if (new Date() >= ebayToken.expiresAt) {
    if (!ebayToken.refreshToken) {
      throw new Error("eBay token expired. Please reconnect your eBay account.")
    }

    // Refresh the token - Production only
    const isSandbox = process.env.EBAY_SANDBOX === "true"
    const tokenEndpoint = isSandbox
      ? "https://api.sandbox.ebay.com/identity/v1/oauth2/token"
      : "https://api.ebay.com/identity/v1/oauth2/token"

    const refreshResponse = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: ebayToken.refreshToken,
      }),
    })

    if (!refreshResponse.ok) {
      // If refresh token is invalid/expired, delete the token record
      if (refreshResponse.status === 400 || refreshResponse.status === 401) {
        try {
          await prisma.ebayToken.delete({
            where: { userId }
          })
        } catch (deleteError) {
          // Failed to delete invalid token
        }
      }

      throw new Error("Failed to refresh eBay token. Please reconnect your eBay account.")
    }

    const refreshData = await refreshResponse.json()
    accessToken = refreshData.access_token

    // Update token in database
    await prisma.ebayToken.update({
      where: { userId },
      data: {
        accessToken: refreshData.access_token,
        refreshToken: refreshData.refresh_token || ebayToken.refreshToken,
        expiresAt: new Date(Date.now() + (refreshData.expires_in * 1000)),
      },
    })
  }

  return accessToken
}

/**
 * Get eBay API base URL
 * Supports both sandbox and production based on EBAY_SANDBOX env var
 */
export function getEbayApiBaseUrl(): string {
  const isSandbox = process.env.EBAY_SANDBOX === "true"
  return isSandbox
    ? "https://api.sandbox.ebay.com"
    : "https://api.ebay.com"
}
