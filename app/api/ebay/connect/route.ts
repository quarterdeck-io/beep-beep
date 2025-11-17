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
    // Format: https://signin.sandbox.ebay.com/authorize?client_id=...&response_type=code&redirect_uri=...&scope=...
    const redirectUri = process.env.EBAY_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/ebay/callback`
    
    const ebayAuthUrl = new URL("https://signin.sandbox.ebay.com/authorize")
    ebayAuthUrl.searchParams.set("client_id", process.env.EBAY_CLIENT_ID)
    ebayAuthUrl.searchParams.set("response_type", "code")
    ebayAuthUrl.searchParams.set("redirect_uri", redirectUri)
    ebayAuthUrl.searchParams.set("scope", "https://api.ebay.com/oauth/api_scope")
    ebayAuthUrl.searchParams.set("state", session.user.id) // Use user ID as state for security

    return NextResponse.redirect(ebayAuthUrl.toString())
  } catch (error) {
    console.error("eBay OAuth connect error:", error)
    return NextResponse.redirect(
      new URL("/ebay-connect?error=oauth_failed", process.env.NEXTAUTH_URL || "http://localhost:3000")
    )
  }
}

