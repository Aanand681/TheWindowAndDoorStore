import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import QuoteDraft from "@/models/QuoteDraft"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error"

export const dynamic = "force-dynamic"
export const revalidate = 0

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const username = (
      session?.user?.username ||
      session?.user?.name ||
      session?.user?.email?.split("@")[0] ||
      ""
    )
      .toLowerCase()
      .trim()
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    await dbConnect()

    const query: Record<string, unknown> = { username }
    if (type && ["window", "door", "sealed_unit"].includes(type)) {
      query.type = type
    }

    const drafts = await QuoteDraft.find(query)
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(100)
      .lean()

    return NextResponse.json(drafts, { headers: NO_CACHE_HEADERS })
  } catch (error: any) {
    return handleApiError(error, NO_CACHE_HEADERS)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const username = (
      session?.user?.username ||
      session?.user?.name ||
      session?.user?.email?.split("@")[0] ||
      ""
    )
      .toLowerCase()
      .trim()
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    const { type, quoteNumber, customerName } = body

    if (!type || !["window", "door", "sealed_unit"].includes(type)) {
      return NextResponse.json({ error: "Invalid quote type" }, { status: 400 })
    }

    if (
      !quoteNumber ||
      typeof quoteNumber !== "string" ||
      !quoteNumber.trim()
    ) {
      return NextResponse.json(
        { error: "Quote number is required" },
        { status: 400 }
      )
    }

    if (
      !customerName ||
      typeof customerName !== "string" ||
      !customerName.trim()
    ) {
      return NextResponse.json(
        { error: "Customer name is required" },
        { status: 400 }
      )
    }

    await dbConnect()

    const draft = await QuoteDraft.findOneAndUpdate(
      { username, type, quoteNumber: quoteNumber.trim() },
      {
        $set: {
          username,
          type,
          quoteNumber: quoteNumber.trim(),
          customerName: customerName.trim(),
          itemCount: Number(body.itemCount) || 0,
          subtotal: Number(body.subtotal) || 0,
          grandTotal: Number(body.grandTotal) || 0,
          summaryLabel: String(body.summaryLabel || ""),
          data: body.data || {},
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    return NextResponse.json(
      { success: true, draft },
      { headers: NO_CACHE_HEADERS }
    )
  } catch (error: any) {
    return handleApiError(error, NO_CACHE_HEADERS)
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const username = (
      session?.user?.username ||
      session?.user?.name ||
      session?.user?.email?.split("@")[0] ||
      ""
    )
      .toLowerCase()
      .trim()
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    const quoteNumber = searchParams.get("quoteNumber")
    const type = searchParams.get("type")
    const isAll =
      searchParams.get("all") === "true" ||
      searchParams.get("clearAll") === "true"

    await dbConnect()

    if (isAll) {
      const filter: Record<string, unknown> = { username }
      if (type && ["window", "door", "sealed_unit"].includes(type)) {
        filter.type = type
      }
      await QuoteDraft.deleteMany(filter)
    } else if (id) {
      await QuoteDraft.deleteOne({ _id: id, username })
    } else if (
      quoteNumber &&
      type &&
      ["window", "door", "sealed_unit"].includes(type)
    ) {
      await QuoteDraft.deleteOne({
        quoteNumber: quoteNumber.trim(),
        type: type as "window" | "sealed_unit" | "door",
        username,
      })
    } else {
      return NextResponse.json(
        { error: "Missing draft identifier" },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true }, { headers: NO_CACHE_HEADERS })
  } catch (error: any) {
    return handleApiError(error, NO_CACHE_HEADERS)
  }
}
