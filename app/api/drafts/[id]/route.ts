import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Retrieve a specific draft
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const draft = await prisma.draftListing.findFirst({
      where: {
        id: params.id,
        userId: session.user.id, // Ensure user can only access their own drafts
      },
    })

    if (!draft) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ draft })
  } catch (error) {
    console.error("Error fetching draft:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch draft", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}

// PUT - Update a draft
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { title, description, price, condition, imageUrl, categoryId, productData } = body

    // Check if draft exists and belongs to user
    const existingDraft = await prisma.draftListing.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingDraft) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      )
    }

    const draft = await prisma.draftListing.update({
      where: { id: params.id },
      data: {
        title: title?.trim() || existingDraft.title,
        description: description?.trim() || existingDraft.description,
        price: price?.toString() || existingDraft.price,
        condition: condition?.trim() || existingDraft.condition,
        imageUrl: imageUrl || existingDraft.imageUrl,
        categoryId: categoryId || existingDraft.categoryId,
        productData: productData || existingDraft.productData,
      },
    })

    return NextResponse.json({
      success: true,
      message: "Draft updated successfully",
      draft,
    })
  } catch (error) {
    console.error("Error updating draft:", error)
    return NextResponse.json(
      { 
        error: "Failed to update draft", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete a draft
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if draft exists and belongs to user
    const existingDraft = await prisma.draftListing.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!existingDraft) {
      return NextResponse.json(
        { error: "Draft not found" },
        { status: 404 }
      )
    }

    await prisma.draftListing.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: "Draft deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting draft:", error)
    return NextResponse.json(
      { 
        error: "Failed to delete draft", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}

