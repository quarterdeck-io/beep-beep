import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET: Fetch current seller note editing setting for the user
export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let settings = await (prisma as any).sellerNoteSettings.findUnique({
      where: { userId: session.user.id },
    })

    // Create default settings if missing
    if (!settings) {
      settings = await (prisma as any).sellerNoteSettings.create({
        data: {
          userId: session.user.id,
          enableSellerNoteEditing: false,
        },
      })
    }

    return NextResponse.json({
      enableSellerNoteEditing: settings.enableSellerNoteEditing,
    })
  } catch (error) {
    console.error("Error fetching seller note settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch seller note settings" },
      { status: 500 }
    )
  }
}

// POST: Update seller note editing setting
export async function POST(req: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { enableSellerNoteEditing } = body

    if (enableSellerNoteEditing !== undefined && typeof enableSellerNoteEditing !== "boolean") {
      return NextResponse.json(
        { error: "enableSellerNoteEditing must be a boolean value" },
        { status: 400 }
      )
    }

    const updated = await (prisma as any).sellerNoteSettings.upsert({
      where: { userId: session.user.id },
      update: {
        ...(enableSellerNoteEditing !== undefined && { enableSellerNoteEditing }),
      },
      create: {
        userId: session.user.id,
        enableSellerNoteEditing: enableSellerNoteEditing !== undefined ? enableSellerNoteEditing : false,
      },
    })

    return NextResponse.json({
      success: true,
      enableSellerNoteEditing: updated.enableSellerNoteEditing,
    })
  } catch (error) {
    console.error("Error updating seller note settings:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json(
      { error: "Failed to update seller note settings", details: errorMessage },
      { status: 500 }
    )
  }
}

