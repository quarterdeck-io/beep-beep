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

    // Log user and token info for debugging
    console.log("=== eBay Connection Info ===")
    console.log("App User ID:", session.user.id)
    console.log("App User Email:", session.user.email)
    console.log("Token Expires At:", ebayToken.expiresAt)
    console.log("Token Expired:", new Date() > ebayToken.expiresAt)
    console.log("Has Refresh Token:", !!ebayToken.refreshToken)
    
    // ⚠️ SECURITY WARNING: Showing full token for debugging only!
    // Remove or comment out before deploying to production!
    console.log("Access Token (FULL - FOR DEBUGGING ONLY):", ebayToken.accessToken)
    if (ebayToken.refreshToken) {
      console.log("Refresh Token (FULL - FOR DEBUGGING ONLY):", ebayToken.refreshToken)
    }
    
    // Decode eBay token to see user info and scopes
    try {
      // eBay tokens are not JWTs, but we can use the introspection API or just show what we know
      // For now, let's try to get user info from eBay
      const userInfoUrl = process.env.EBAY_SANDBOX === "true"
        ? "https://apiz.sandbox.ebay.com/commerce/identity/v1/user/"
        : "https://apiz.ebay.com/commerce/identity/v1/user/"
      
      console.log("Fetching eBay user info...")
      const userResponse = await fetch(userInfoUrl, {
        headers: {
          'Authorization': `Bearer ${ebayToken.accessToken}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (userResponse.ok) {
        const userData = await userResponse.json()
        console.log("eBay User Info:", {
          username: userData.username,
          userId: userData.userId,
          email: userData.email || 'N/A',
        })
      } else {
        console.log("Could not fetch eBay user info (this is normal), status:", userResponse.status)
      }
    } catch (error) {
      console.log("Error getting eBay user info:", error)
    }
    console.log("===========================")

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

    // Use marketplace from env or default to EBAY_US
    const marketplace = process.env.EBAY_MARKETPLACE_ID || 'EBAY_US'
    
    // Fetch all three policy types
    console.log("Fetching eBay policies from:", baseUrl)
    console.log("Using marketplace:", marketplace)
    
    const [fulfillmentResponse, paymentResponse, returnResponse] = await Promise.all([
      fetch(`${baseUrl}/sell/account/v1/fulfillment_policy?marketplace_id=${marketplace}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': marketplace,
        },
      }),
      fetch(`${baseUrl}/sell/account/v1/payment_policy?marketplace_id=${marketplace}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': marketplace,
        },
      }),
      fetch(`${baseUrl}/sell/account/v1/return_policy?marketplace_id=${marketplace}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': marketplace,
        },
      }),
    ])

    // Log response statuses
    console.log("Policy API responses:", {
      fulfillment: fulfillmentResponse.status,
      payment: paymentResponse.status,
      return: returnResponse.status
    })

    // Check for errors and log them
    if (!fulfillmentResponse.ok) {
      const errorData = await fulfillmentResponse.json()
      console.error("Fulfillment policy error:", errorData)
      
      // Check for scope error
      if (fulfillmentResponse.status === 403 || fulfillmentResponse.status === 401) {
        return NextResponse.json(
          { 
            error: "Missing required permissions. Please disconnect and reconnect your eBay account to grant 'sell.account' scope.",
            needsReconnect: true,
            details: errorData
          },
          { status: 403 }
        )
      }
    }

    if (!paymentResponse.ok) {
      const errorData = await paymentResponse.json()
      console.error("Payment policy error:", errorData)
      
      if (paymentResponse.status === 403 || paymentResponse.status === 401) {
        return NextResponse.json(
          { 
            error: "Missing required permissions. Please disconnect and reconnect your eBay account to grant 'sell.account' scope.",
            needsReconnect: true,
            details: errorData
          },
          { status: 403 }
        )
      }
    }

    if (!returnResponse.ok) {
      const errorData = await returnResponse.json()
      console.error("Return policy error:", errorData)
      
      if (returnResponse.status === 403 || returnResponse.status === 401) {
        return NextResponse.json(
          { 
            error: "Missing required permissions. Please disconnect and reconnect your eBay account to grant 'sell.account' scope.",
            needsReconnect: true,
            details: errorData
          },
          { status: 403 }
        )
      }
    }

    // Parse successful responses
    const fulfillmentData = fulfillmentResponse.ok ? await fulfillmentResponse.json() : { fulfillmentPolicies: [] }
    const paymentData = paymentResponse.ok ? await paymentResponse.json() : { paymentPolicies: [] }
    const returnData = returnResponse.ok ? await returnResponse.json() : { returnPolicies: [] }

    // Log what we got
    console.log("Policies fetched:", {
      fulfillmentCount: fulfillmentData.fulfillmentPolicies?.length || 0,
      paymentCount: paymentData.paymentPolicies?.length || 0,
      returnCount: returnData.returnPolicies?.length || 0
    })

    // Log raw data to debug
    console.log("Raw fulfillment response:", JSON.stringify(fulfillmentData, null, 2))
    console.log("Raw payment response:", JSON.stringify(paymentData, null, 2))
    console.log("Raw return response:", JSON.stringify(returnData, null, 2))

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

