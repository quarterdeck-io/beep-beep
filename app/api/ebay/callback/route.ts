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
      console.error("eBay OAuth error:", error)
      return NextResponse.redirect(
        new URL("/ebay-connect?error=oauth_declined", process.env.NEXTAUTH_URL || "http://localhost:3000")
      )
    }

    const session = await auth()
    
    if (!session || session.user.id !== state) {
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
    const tokenResponse = await fetch("https://api.sandbox.ebay.com/identity/v1/oauth2/token", {
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
        redirect_uri: process.env.EBAY_REDIRECT_URI || `${process.env.NEXTAUTH_URL}/api/ebay/callback`,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error("Token exchange failed:", errorData)
      return NextResponse.redirect(
        new URL("/ebay-connect?error=token_exchange_failed", process.env.NEXTAUTH_URL || "http://localhost:3000")
      )
    }

    const tokenData = await tokenResponse.json()

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
    console.error("eBay callback error:", error)
    return NextResponse.redirect(
      new URL("/ebay-connect?error=callback_failed", process.env.NEXTAUTH_URL || "http://localhost:3000")
    )
  }
}

