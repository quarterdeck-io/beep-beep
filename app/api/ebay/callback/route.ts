import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    // Check for OAuth errors
    if (error) {
      return NextResponse.redirect(
        new URL("/ebay-connect?error=oauth_declined", process.env.NEXTAUTH_URL || "http://localhost:3000")
      )
    }

    const session = await auth()
    
    // Extract user ID from state (format: userId-timestamp)
    const userIdFromState = state?.split("-")[0]
    
    if (!session || !userIdFromState || session.user.id !== userIdFromState) {
      return NextResponse.redirect(
        new URL("/ebay-connect?error=unauthorized", process.env.NEXTAUTH_URL || "http://localhost:3000")
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL("/ebay-connect?error=no_code", process.env.NEXTAUTH_URL || "http://localhost:3000")
      )
    }

    // Exchange authorization code for access token
    const isSandbox = process.env.EBAY_SANDBOX === "true"
    const tokenEndpoint = isSandbox
      ? "https://api.sandbox.ebay.com/identity/v1/oauth2/token"
      : "https://api.ebay.com/identity/v1/oauth2/token"
    
    const ruName = process.env.EBAY_RUNAME || process.env.EBAY_REDIRECT_URI
    
    if (!ruName) {
      return NextResponse.redirect(
        new URL("/ebay-connect?error=misconfigured", process.env.NEXTAUTH_URL || "http://localhost:3000")
      )
    }
    
    const tokenResponse = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: ruName,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}))
      console.error("eBay token exchange failed:", errorData)
      return NextResponse.redirect(
        new URL("/ebay-connect?error=token_exchange_failed", process.env.NEXTAUTH_URL || "http://localhost:3000")
      )
    }

    const tokenData = await tokenResponse.json()

    // Log the scopes that were granted (for verification)
    // Note: eBay doesn't always return scopes in token response, but we log what we requested
    console.log("eBay token exchange successful. Scopes requested:", process.env.EBAY_SCOPE)
    console.log("Token expires in:", tokenData.expires_in, "seconds")

    // Save tokens to database
    await prisma.ebayToken.upsert({
      where: { userId: session.user.id },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
      },
      create: {
        userId: session.user.id,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000)),
      },
    })

    return NextResponse.redirect(
      new URL("/ebay-connect?success=true", process.env.NEXTAUTH_URL || "http://localhost:3000")
    )
  } catch (error) {
    return NextResponse.redirect(
      new URL("/ebay-connect?error=callback_failed", process.env.NEXTAUTH_URL || "http://localhost:3000")
    )
  }
}

