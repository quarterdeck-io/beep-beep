import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ connected: false }, { status: 200 })
    }

    // Check if user has an eBay token
    const ebayToken = await prisma.ebayToken.findUnique({
      where: { userId: session.user.id }
    })

    return NextResponse.json({ 
      connected: !!ebayToken,
      hasToken: !!ebayToken,
      expiresAt: ebayToken?.expiresAt 
    })
  } catch (error) {
    return NextResponse.json({ connected: false }, { status: 200 })
  }
}

