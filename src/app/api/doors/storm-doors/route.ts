import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"
import dbConnect from "@/lib/mongodb"
import StormDoorSettings from "@/models/StormDoorSettings"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { cacheGet, cacheSet, cacheDel } from "@/lib/redis"
import { DEFAULT_STORM_DOORS_DATA } from "@/lib/doors/storm-door-catalog"
import { recordPricingSnapshot } from "@/lib/server/pricing-history/service"
import { triggerPusherEvent } from "@/lib/pusher-server"

export const dynamic = "force-dynamic"
export const revalidate = 0

const CACHE_KEY = "doors:storm-doors"

export async function GET() {
  try {
    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    }
    const cached = (await cacheGet(CACHE_KEY)) as any
    if (cached) return NextResponse.json(cached, { headers })

    await dbConnect()
    let settings = await StormDoorSettings.findOne({})

    if (!settings) {
      settings = await StormDoorSettings.create(DEFAULT_STORM_DOORS_DATA)
    }

    const plain = settings.toObject
      ? settings.toObject({ flattenMaps: true })
      : settings

    if (!plain.models || plain.models.length === 0) {
      plain.models = DEFAULT_STORM_DOORS_DATA.models
    }
    if (!plain.addons || plain.addons.length === 0) {
      plain.addons = DEFAULT_STORM_DOORS_DATA.addons
    }
    if (!plain.rules) {
      plain.rules = DEFAULT_STORM_DOORS_DATA.rules
    }

    cacheSet(CACHE_KEY, plain, 300).catch(() => {})
    return NextResponse.json(plain, { headers })
  } catch (error) {
    console.error("Error fetching storm door catalog:", error)
    return NextResponse.json(DEFAULT_STORM_DOORS_DATA)
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const role = session.user.role
    const canAccessAdmin =
      session.user.canAccessAdmin || role === "SUPERADMIN" || role === "ADMIN"

    if (!canAccessAdmin) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const body = await request.json()
    await dbConnect()

    let settings = await StormDoorSettings.findOne({})
    if (!settings) {
      settings = new StormDoorSettings(DEFAULT_STORM_DOORS_DATA)
    }

    if (Array.isArray(body.models)) settings.models = body.models
    if (Array.isArray(body.addons)) settings.addons = body.addons
    if (body.rules) settings.rules = { ...settings.rules, ...body.rules }

    await settings.save()

    await cacheDel(CACHE_KEY).catch(() => {})
    await cacheDel("doors:settings").catch(() => {})

    revalidatePath("/api/doors/storm-doors")
    revalidatePath("/admin/storm-doors")
    revalidatePath("/doors")

    recordPricingSnapshot(
      "DOORS",
      settings.toObject ? settings.toObject() : settings,
      session.user.email || "admin",
      "Updated Storm Door catalog & add-ons pricing"
    ).catch(() => {})

    triggerPusherEvent("pricing-updates", "storm-doors-updated", {
      updatedAt: new Date().toISOString(),
      updatedBy: session.user.name || session.user.email,
    }).catch(() => {})

    return NextResponse.json({
      success: true,
      settings: settings.toObject ? settings.toObject() : settings,
    })
  } catch (error: any) {
    console.error("Error updating storm door settings:", error)
    return NextResponse.json(
      { error: error.message || "Failed to save storm door settings" },
      { status: 500 }
    )
  }
}
