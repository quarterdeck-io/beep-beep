import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL || "http://localhost:3000"))
    }

    // Check if eBay credentials are configured
    if (!process.env.EBAY_CLIENT_ID || !process.env.EBAY_CLIENT_SECRET) {
      return NextResponse.redirect(
        new URL("/ebay-connect?error=missing_credentials", process.env.NEXTAUTH_URL || "http://localhost:3000")
      )
    }

    // Build eBay OAuth authorization URL (User Consent Flow)
    // eBay uses RuName (Redirect URL name) - a registered identifier instead of actual URL
    const isSandbox = process.env.EBAY_SANDBOX === "true"
    const ruName = process.env.EBAY_RUNAME || process.env.EBAY_REDIRECT_URI
    
    // Get and validate scopes - MUST include sell.inventory scopes for listing
    const scope = process.env.EBAY_SCOPE || "https://api.ebay.com/oauth/api_scope"
    
    // Validate that required scopes are present
    // Required scopes for listing products:
    // - sell.inventory (create/update inventory items)
    // - sell.account/readwrite (manage account settings)
    // - sell.fulfillment (order fulfillment)
    const requiredScopes = [
      "sell.inventory",
      "sell.account/readwrite",
      "sell.fulfillment"
    ]
    
    const scopeArray = scope.split(" ").filter(s => s.trim())
    const hasRequiredScopes = requiredScopes.every(required => 
      scopeArray.some(s => s.includes(required))
    )
    
    if (!hasRequiredScopes) {
      console.error("Missing required eBay scopes. Current scopes:", scope)
      console.error("Required scopes:", requiredScopes)
      return NextResponse.redirect(
        new URL("/ebay-connect?error=missing_scopes", process.env.NEXTAUTH_URL || "http://localhost:3000")
      )
    }
    
    if (!ruName) {
      return NextResponse.redirect(
        new URL("/ebay-connect?error=missing_runame", process.env.NEXTAUTH_URL || "http://localhost:3000")
      )
    }
    
    // Log scopes being used (for debugging)
    console.log("eBay OAuth scopes being requested:", scope)
    
    // Use proper eBay OAuth endpoint based on environment
    const authBaseUrl = isSandbox 
      ? "https://auth.sandbox.ebay.com/oauth2/authorize"
      : "https://auth.ebay.com/oauth2/authorize"
    
    // Build OAuth URL with properly encoded scopes
    // URLSearchParams will automatically URL-encode the scope parameter
    const ebayAuthUrl = new URL(authBaseUrl)
    ebayAuthUrl.searchParams.set("client_id", process.env.EBAY_CLIENT_ID)
    ebayAuthUrl.searchParams.set("response_type", "code")
    ebayAuthUrl.searchParams.set("redirect_uri", ruName)
    // Set scope - URLSearchParams will automatically URL-encode it
    // Scopes should be space-separated in the env var, URLSearchParams will encode them properly
    ebayAuthUrl.searchParams.set("scope", scope)
    // Add timestamp to state to force new authorization
    ebayAuthUrl.searchParams.set("state", `${session.user.id}-${Date.now()}`) // Use user ID + timestamp as state
    ebayAuthUrl.searchParams.set("prompt", "login") // Force showing login and consent screen

    // Log the final URL for debugging (without sensitive data)
    console.log("eBay OAuth URL generated:", ebayAuthUrl.toString().replace(/client_id=[^&]+/, "client_id=***"))

    return NextResponse.redirect(ebayAuthUrl.toString())
  } catch (error) {
    return NextResponse.redirect(
      new URL("/ebay-connect?error=oauth_failed", process.env.NEXTAUTH_URL || "http://localhost:3000")
    )
  }
}

