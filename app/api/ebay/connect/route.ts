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
    const scope = process.env.EBAY_SCOPE || "https://api.ebay.com/oauth/api_scope"
    
    if (!ruName) {
      return NextResponse.redirect(
        new URL("/ebay-connect?error=missing_runame", process.env.NEXTAUTH_URL || "http://localhost:3000")
      )
    }
    
    // Use proper eBay OAuth endpoint based on environment
    const authBaseUrl = isSandbox 
      ? "https://auth.sandbox.ebay.com/oauth2/authorize"
      : "https://auth.ebay.com/oauth2/authorize"
    
    const ebayAuthUrl = new URL(authBaseUrl)
    ebayAuthUrl.searchParams.set("client_id", process.env.EBAY_CLIENT_ID)
    ebayAuthUrl.searchParams.set("response_type", "code")
    ebayAuthUrl.searchParams.set("redirect_uri", ruName)
    ebayAuthUrl.searchParams.set("scope", scope)
    ebayAuthUrl.searchParams.set("state", session.user.id) // Use user ID as state for security
    ebayAuthUrl.searchParams.set("prompt", "login consent") // Force showing consent screen

    return NextResponse.redirect(ebayAuthUrl.toString())
  } catch (error) {
    return NextResponse.redirect(
      new URL("/ebay-connect?error=oauth_failed", process.env.NEXTAUTH_URL || "http://localhost:3000")
    )
  }
}

