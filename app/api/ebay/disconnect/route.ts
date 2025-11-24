import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST() {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get the token before deleting (to revoke it on eBay's side)
    const ebayToken = await prisma.ebayToken.findFirst({
      where: { userId: session.user.id }
    })

    // Try to revoke the token on eBay's side
    if (ebayToken?.accessToken) {
      try {
        const isSandbox = process.env.EBAY_SANDBOX === "true"
        const revokeEndpoint = isSandbox
          ? "https://api.sandbox.ebay.com/identity/v1/oauth2/revoke"
          : "https://api.ebay.com/identity/v1/oauth2/revoke"

        await fetch(revokeEndpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(
              `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
            ).toString("base64")}`,
          },
          body: new URLSearchParams({
            token: ebayToken.accessToken,
            token_type_hint: "access_token",
          }),
        })
      } catch (revokeError) {
        // If revocation fails, continue with local deletion
        console.error("Failed to revoke token on eBay:", revokeError)
      }
    }

    // Delete the eBay token for this user
    await prisma.ebayToken.deleteMany({
      where: { userId: session.user.id }
    })

    return NextResponse.json({ 
      success: true,
      message: "eBay account disconnected and authorization revoked successfully"
    })
  } catch (error) {
    // If token doesn't exist, that's fine - consider it disconnected
    if (error instanceof Error && error.message.includes("Record to delete does not exist")) {
      return NextResponse.json({ 
        success: true,
        message: "eBay account disconnected successfully"
      })
    }
    
    return NextResponse.json(
      { error: "Failed to disconnect eBay account" },
      { status: 500 }
    )
  }
}

