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

    // Delete the eBay token for this user
    await prisma.ebayToken.deleteMany({
      where: { userId: session.user.id }
    })

    return NextResponse.json({ 
      success: true,
      message: "eBay account disconnected successfully"
    })
  } catch (error) {
    console.error("eBay disconnect error:", error)
    
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

