import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET: Fetch available eBay business policies
export async function GET() {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if user has connected eBay account
    const ebayToken = await prisma.ebayToken.findUnique({
      where: { userId: session.user.id }
    })

    if (!ebayToken) {
      return NextResponse.json(
        { error: "eBay account not connected" },
        { status: 400 }
      )
    }

    // Check if token is expired
    let accessToken = ebayToken.accessToken
    if (new Date() > ebayToken.expiresAt) {
      // Token expired, try to refresh
      if (!ebayToken.refreshToken) {
        return NextResponse.json(
          { error: "eBay token expired. Please reconnect your eBay account." },
          { status: 401 }
        )
      }

      // Refresh the token
      const isSandbox = process.env.EBAY_SANDBOX === "true"
      const tokenUrl = isSandbox
        ? "https://api.sandbox.ebay.com/identity/v1/oauth2/token"
        : "https://api.ebay.com/identity/v1/oauth2/token"

      const credentials = Buffer.from(
        `${process.env.EBAY_CLIENT_ID}:${process.env.EBAY_CLIENT_SECRET}`
      ).toString('base64')

      const refreshResponse = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${credentials}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: ebayToken.refreshToken,
        }),
      })

      if (!refreshResponse.ok) {
        return NextResponse.json(
          { error: "Failed to refresh eBay token. Please reconnect your eBay account." },
          { status: 401 }
        )
      }

      const refreshData = await refreshResponse.json()
      accessToken = refreshData.access_token

      // Update token in database
      await prisma.ebayToken.update({
        where: { userId: session.user.id },
        data: {
          accessToken: refreshData.access_token,
          refreshToken: refreshData.refresh_token || ebayToken.refreshToken,
          expiresAt: new Date(Date.now() + (refreshData.expires_in * 1000)),
        },
      })
    }

    const isSandbox = process.env.EBAY_SANDBOX === "true"
    const baseUrl = isSandbox
      ? "https://api.sandbox.ebay.com"
      : "https://api.ebay.com"

    // Fetch all three policy types
    const [fulfillmentResponse, paymentResponse, returnResponse] = await Promise.all([
      fetch(`${baseUrl}/sell/account/v1/fulfillment_policy`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
      }),
      fetch(`${baseUrl}/sell/account/v1/payment_policy`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
      }),
      fetch(`${baseUrl}/sell/account/v1/return_policy`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
      }),
    ])

    // Parse responses
    const fulfillmentData = fulfillmentResponse.ok ? await fulfillmentResponse.json() : { fulfillmentPolicies: [] }
    const paymentData = paymentResponse.ok ? await paymentResponse.json() : { paymentPolicies: [] }
    const returnData = returnResponse.ok ? await returnResponse.json() : { returnPolicies: [] }

    // Format the policies for frontend consumption
    const policies = {
      fulfillmentPolicies: (fulfillmentData.fulfillmentPolicies || []).map((policy: any) => ({
        id: policy.fulfillmentPolicyId,
        name: policy.name,
        description: policy.description,
      })),
      paymentPolicies: (paymentData.paymentPolicies || []).map((policy: any) => ({
        id: policy.paymentPolicyId,
        name: policy.name,
        description: policy.description,
      })),
      returnPolicies: (returnData.returnPolicies || []).map((policy: any) => ({
        id: policy.returnPolicyId,
        name: policy.name,
        description: policy.description,
      })),
    }

    return NextResponse.json(policies)
  } catch (error) {
    console.error("Error fetching eBay policies:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch eBay policies",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

