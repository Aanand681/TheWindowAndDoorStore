import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import Promo from "@/models/Promo"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { cacheGet, cacheSet, cacheDel } from "@/lib/redis"
import { handleApiError } from "@/lib/api-error"

export const revalidate = 60

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("active") === "true"
    const cacheKey = activeOnly ? "promos:active" : "promos:all"

    const headers = {
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    }

    // 1. Check Redis Cache
    const cached = await cacheGet(cacheKey)
    if (cached) {
      return NextResponse.json(cached, { headers })
    }

    // 2. Fetch from MongoDB
    await dbConnect()
    const query = activeOnly ? { isActive: true } : {}
    const promos = await Promo.find(query).sort({ order: 1, createdAt: -1 })

    // 3. Store in Redis (1 hour TTL)
    cacheSet(cacheKey, promos, 3600).catch(() => {})

    return NextResponse.json(promos, { headers })
  } catch (error: any) {
    return handleApiError(error)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const body = await request.json()
    await dbConnect()

    const {
      name,
      type,
      isActive,
      buyQty,
      getQty,
      freeComponents,
      discountPercentage,
      applyPercentageAfterFreeParts,
      order,
    } = body

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Promo name is required." },
        { status: 400 }
      )
    }

    if (
      !type ||
      !["BOGO", "FREE_PARTS", "PERCENTAGE", "COMBO"].includes(type)
    ) {
      return NextResponse.json(
        { error: "Invalid promo type." },
        { status: 400 }
      )
    }

    const count = await Promo.countDocuments()
    const promoData: Record<string, unknown> = {
      name: name.trim(),
      type,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      order: typeof order === "number" ? order : count,
    }

    if (buyQty !== undefined) promoData.buyQty = Number(buyQty)
    if (getQty !== undefined) promoData.getQty = Number(getQty)
    if (Array.isArray(freeComponents)) promoData.freeComponents = freeComponents
    if (discountPercentage !== undefined)
      promoData.discountPercentage = Number(discountPercentage)
    if (applyPercentageAfterFreeParts !== undefined) {
      promoData.applyPercentageAfterFreeParts = Boolean(
        applyPercentageAfterFreeParts
      )
    }

    const newPromo = await Promo.create(promoData)

    // Invalidate promo caches
    cacheDel("promos:active", "promos:all").catch(() => {})

    return NextResponse.json(
      { message: "Promo created successfully", promo: newPromo },
      { status: 201 }
    )
  } catch (error: any) {
    return handleApiError(error)
  }
}
