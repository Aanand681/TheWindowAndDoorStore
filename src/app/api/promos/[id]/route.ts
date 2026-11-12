import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Promo from "@/models/Promo"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { cacheDel } from "@/lib/redis"
import { handleApiError } from "@/lib/api-error"

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const role = session.user.role
    if (role !== "SUPERADMIN" && role !== "ADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { id } = await params
    if (!id || typeof id !== "string" || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid promo ID format" },
        { status: 400 }
      )
    }

    const body = await request.json()
    await dbConnect()

    const updateData: Record<string, unknown> = {}

    if (role === "ADMIN") {
      if (body.isActive !== undefined)
        updateData.isActive = Boolean(body.isActive)
      if (body.order !== undefined) updateData.order = Number(body.order)
    } else {
      // SUPERADMIN full update with strict schema allowlist
      if (
        body.name !== undefined &&
        typeof body.name === "string" &&
        body.name.trim()
      ) {
        updateData.name = body.name.trim()
      }
      if (
        body.type &&
        ["BOGO", "FREE_PARTS", "PERCENTAGE", "COMBO"].includes(body.type)
      ) {
        updateData.type = body.type
      }
      if (body.isActive !== undefined)
        updateData.isActive = Boolean(body.isActive)
      if (body.buyQty !== undefined) updateData.buyQty = Number(body.buyQty)
      if (body.getQty !== undefined) updateData.getQty = Number(body.getQty)
      if (Array.isArray(body.freeComponents))
        updateData.freeComponents = body.freeComponents
      if (body.discountPercentage !== undefined) {
        updateData.discountPercentage = Number(body.discountPercentage)
      }
      if (body.applyPercentageAfterFreeParts !== undefined) {
        updateData.applyPercentageAfterFreeParts = Boolean(
          body.applyPercentageAfterFreeParts
        )
      }
      if (body.order !== undefined) updateData.order = Number(body.order)
    }

    const updatedPromo = await Promo.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    )

    if (!updatedPromo) {
      return NextResponse.json({ error: "Promo not found" }, { status: 404 })
    }

    cacheDel("promos:active", "promos:all").catch(() => {})

    return NextResponse.json({
      message: "Promo updated successfully",
      promo: updatedPromo,
    })
  } catch (error: any) {
    return handleApiError(error)
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const { id } = await params
    if (!id || typeof id !== "string" || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return NextResponse.json(
        { error: "Invalid promo ID format" },
        { status: 400 }
      )
    }

    await dbConnect()

    const deletedPromo = await Promo.findByIdAndDelete(id)

    if (!deletedPromo) {
      return NextResponse.json({ error: "Promo not found" }, { status: 404 })
    }

    cacheDel("promos:active", "promos:all").catch(() => {})

    return NextResponse.json({ message: "Promo deleted successfully" })
  } catch (error: any) {
    return handleApiError(error)
  }
}
