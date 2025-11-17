# Next Steps - Complete eBay Integration

Your Beep Beep application is now fully set up with authentication, database, and UI! Here's what you need to do next to complete the eBay integration.

## ✅ What's Already Done

1. ✅ Next.js 16 app with TypeScript and Tailwind CSS
2. ✅ User authentication (signup/login) with NextAuth.js
3. ✅ PostgreSQL database with Prisma ORM
4. ✅ Protected routes middleware
5. ✅ Dashboard, eBay Connect, and Product Search pages
6. ✅ Beautiful, responsive UI with dark mode
7. ✅ Deployment configuration for Render

## 🔧 To Complete: eBay OAuth Integration

### Step 1: Get eBay API Credentials

1. Go to https://developer.ebay.com
2. Sign in or create an account
3. Navigate to "My Account" → "Application Keys"
4. Create a new application:
   - **Application Title**: Beep Beep Product Search
   - **Application Type**: Web Application
   - **Grant Type**: Authorization Code Grant (for OAuth 2.0)
5. Save your **Client ID** and **Client Secret**

### Step 2: Configure OAuth Redirect URI

In your eBay application settings:
- **Development**: `http://localhost:3000/api/ebay/callback`
- **Production**: `https://your-domain.onrender.com/api/ebay/callback`

### Step 3: Add Credentials to Environment Variables

Update your `.env.local`:

```env
EBAY_CLIENT_ID="your_actual_client_id_here"
EBAY_CLIENT_SECRET="your_actual_client_secret_here"
EBAY_REDIRECT_URI="http://localhost:3000/api/ebay/callback"
```

### Step 4: Implement eBay OAuth Flow

Create the OAuth connection API routes:

#### File: `app/api/ebay/connect/route.ts`

```typescript
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const ebayAuthUrl = new URL("https://auth.ebay.com/oauth2/authorize")
  ebayAuthUrl.searchParams.set("client_id", process.env.EBAY_CLIENT_ID!)
  ebayAuthUrl.searchParams.set("response_type", "code")
  ebayAuthUrl.searchParams.set("redirect_uri", process.env.EBAY_REDIRECT_URI!)
  ebayAuthUrl.searchParams.set("scope", "https://api.ebay.com/oauth/api_scope")
  ebayAuthUrl.searchParams.set("state", session.user.id) // Use user ID as state

  return NextResponse.redirect(ebayAuthUrl.toString())
}
```

#### File: `app/api/ebay/callback/route.ts`

```typescript
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  const session = await auth()
  
  if (!session || session.user.id !== state) {
    return NextResponse.redirect("/dashboard?error=unauthorized")
  }

  if (!code) {
    return NextResponse.redirect("/dashboard?error=no_code")
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
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
        redirect_uri: process.env.EBAY_REDIRECT_URI!,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to get access token")
    }

    const tokenData = await tokenResponse.json()

    // Save token to database
    await prisma.ebayToken.upsert({
      where: { userId: session.user.id },
      update: {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      },
      create: {
        userId: session.user.id,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      },
    })

    return NextResponse.redirect("/ebay-connect?success=true")
  } catch (error) {
    console.error("eBay OAuth error:", error)
    return NextResponse.redirect("/ebay-connect?error=token_exchange_failed")
  }
}
```

### Step 5: Update eBay Connect Page

Update `app/ebay-connect/page.tsx` to trigger the OAuth flow:

```typescript
const handleConnect = async () => {
  setConnecting(true)
  setMessage("")
  
  try {
    // Redirect to OAuth flow
    window.location.href = "/api/ebay/connect"
  } catch (error) {
    setMessage("Failed to connect to eBay. Please try again.")
    setConnecting(false)
  }
}
```

### Step 6: Implement Product Search

Update `app/api/ebay/search/route.ts` with actual eBay API call:

```typescript
export async function GET(req: Request) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const upc = searchParams.get("upc")

    if (!upc) {
      return NextResponse.json({ error: "UPC code is required" }, { status: 400 })
    }

    // Get user's eBay access token from database
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
    if (new Date() > ebayToken.expiresAt) {
      // TODO: Implement token refresh logic
      return NextResponse.json(
        { error: "eBay token expired. Please reconnect your account." },
        { status: 401 }
      )
    }

    // Search eBay using Browse API
    const ebayResponse = await fetch(
      `https://api.ebay.com/buy/browse/v1/item_summary/search?q=${encodeURIComponent(upc)}&fieldgroups=EXTENDED`,
      {
        headers: {
          'Authorization': `Bearer ${ebayToken.accessToken}`,
          'Content-Type': 'application/json',
        }
      }
    )
    
    if (!ebayResponse.ok) {
      const errorData = await ebayResponse.json()
      throw new Error(errorData.error?.message || 'eBay API error')
    }
    
    const data = await ebayResponse.json()
    
    // Return the first matching product
    return NextResponse.json(data.itemSummaries?.[0] || null)
  } catch (error) {
    console.error("eBay search error:", error)
    return NextResponse.json(
      { error: "Failed to search eBay" },
      { status: 500 }
    )
  }
}
```

### Step 7: Update Product Search Page

Update `app/product-search/page.tsx` to make actual API call:

```typescript
const handleSearch = async (e: React.FormEvent) => {
  e.preventDefault()
  setError("")
  setProductData(null)
  setLoading(true)

  try {
    const res = await fetch(`/api/ebay/search?upc=${encodeURIComponent(upc)}`)
    const data = await res.json()
    
    if (!res.ok) {
      throw new Error(data.error || "Failed to search product")
    }
    
    if (!data) {
      throw new Error("No product found with this UPC")
    }
    
    setProductData(data)
  } catch (err: any) {
    setError(err.message || "Failed to search product")
  } finally {
    setLoading(false)
  }
}
```

## 🚀 Testing Your Integration

1. **Start the app**: `npm run dev`
2. **Create an account**: Go to http://localhost:3000 and sign up
3. **Connect eBay**: Navigate to "Connect eBay" and authorize
4. **Search products**: Try searching with a UPC like `885909950805`

## 📝 Additional Enhancements

### Token Refresh

Implement automatic token refresh in a separate function:

```typescript
async function refreshEbayToken(userId: string) {
  const ebayToken = await prisma.ebayToken.findUnique({
    where: { userId }
  })

  if (!ebayToken?.refreshToken) {
    throw new Error("No refresh token available")
  }

  const response = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
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

  const data = await response.json()

  await prisma.ebayToken.update({
    where: { userId },
    data: {
      accessToken: data.access_token,
      expiresAt: new Date(Date.now() + data.expires_in * 1000),
    },
  })

  return data.access_token
}
```

## 📚 Resources

- **eBay API Documentation**: https://developer.ebay.com/api-docs/buy/browse/overview.html
- **eBay OAuth Guide**: https://developer.ebay.com/api-docs/static/oauth-tokens.html
- **NextAuth.js Docs**: https://next-auth.js.org/
- **Prisma Docs**: https://www.prisma.io/docs

## ❓ Need Help?

- Check eBay API logs in your developer dashboard
- Use Prisma Studio to view database records: `npx prisma studio`
- Check browser console and Next.js logs for errors
- Test API endpoints with Postman or similar tools

Good luck with your eBay integration! 🎉

