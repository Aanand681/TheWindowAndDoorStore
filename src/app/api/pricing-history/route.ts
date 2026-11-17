import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {
  getPricingHistory,
  recordPricingSnapshot,
  deletePricingSnapshot,
} from "@/lib/server/pricing-history/service"
import { PricingCategory } from "@/models/PricingHistory"
import { handleApiError } from "@/lib/api-error"

const VALID_CATEGORIES: PricingCategory[] = [
  "WINDOW_LABOUR",
  "DOORS",
  "SEALED_UNITS",
  "GLOBAL_SETTINGS",
]

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") as PricingCategory

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(", ")}`,
        },
        { status: 400 }
      )
    }

    const limitParam = searchParams.get("limit")
    const limit = limitParam ? parseInt(limitParam, 10) : 20

    const history = await getPricingHistory(category, limit)
    return NextResponse.json({ success: true, history })
  } catch (error: any) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as any
    if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { category, snapshot, notes } = body

    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        { error: "Valid category is required" },
        { status: 400 }
      )
    }

    if (!snapshot || typeof snapshot !== "object") {
      return NextResponse.json(
        { error: "Valid snapshot payload is required" },
        { status: 400 }
      )
    }

    const savedBy = user.name || user.email || user.username || "Admin"
    const record = await recordPricingSnapshot(
      category,
      snapshot,
      savedBy,
      notes
    )

    return NextResponse.json({ success: true, record })
  } catch (error: any) {
    return handleApiError(error)
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = session.user as any
    if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Snapshot ID is required" },
        { status: 400 }
      )
    }

    const result = await deletePricingSnapshot(id)
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to delete snapshot" },
        { status: result.status || 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Snapshot deleted successfully",
      deleted: result.deleted,
    })
  } catch (error: any) {
    return handleApiError(error)
  }
}

