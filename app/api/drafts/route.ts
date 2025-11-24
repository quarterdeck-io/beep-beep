import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Retrieve all drafts for the user
export async function GET(req: Request) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const drafts = await prisma.draftListing.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    })

    return NextResponse.json({ drafts })
  } catch (error) {
    console.error("Error fetching drafts:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch drafts", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}

// POST - Create a new draft
export async function POST(req: Request) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { title, description, price, condition, imageUrl, categoryId, upc, productData } = body

    // Validate required fields
    if (!title || !price || !condition) {
      return NextResponse.json(
        { error: "Title, price, and condition are required" },
        { status: 400 }
      )
    }

    const draft = await prisma.draftListing.create({
      data: {
        userId: session.user.id,
        title: title.trim(),
        description: description?.trim() || "",
        price: price.toString(),
        condition: condition.trim(),
        imageUrl: imageUrl || null,
        categoryId: categoryId || null,
        upc: upc || null,
        productData: productData || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Draft saved successfully",
      draft,
    })
  } catch (error) {
    console.error("Error saving draft:", error)
    return NextResponse.json(
      { 
        error: "Failed to save draft", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}

