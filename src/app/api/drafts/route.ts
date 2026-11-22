import { NextResponse } from "next/server"
import mongoose from "mongoose"
import dbConnect from "@/lib/mongodb"
import SavedQuote from "@/models/SavedQuote"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error"
import {
  findSubmittedQuoteNumbers,
  purgeOrphanedDrafts,
  formatDraftDto,
  buildDraftDocumentPayload,
} from "@/lib/server/drafts/draft-query-service"

export const dynamic = "force-dynamic"
export const revalidate = 0

const NO_CACHE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
  Pragma: "no-cache",
  Expires: "0",
}

function extractUsername(session: any): string {
  return (
    session?.user?.username ||
    session?.user?.name ||
    session?.user?.email?.split("@")[0] ||
    ""
  )
    .toLowerCase()
    .trim()
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const username = extractUsername(session)
    if (!username) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    await dbConnect()

    const submittedQuoteNumbers = await findSubmittedQuoteNumbers(username)
    await purgeOrphanedDrafts(username, submittedQuoteNumbers)

    const query: Record<string, unknown> = {
      preparedBy: { $regex: new RegExp(`^${username}$`, "i") },
      status: "DRAFT",
    }
    if (submittedQuoteNumbers.length > 0) {
      query.quoteNumber = {
        $nin: submittedQuoteNumbers.map(
          (n) => new RegExp(`^${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
        ),
      }
    }
    if (type && ["window", "door", "sealed_unit"].includes(type)) {
      query.quoteType = type
    }

    const quotes = await SavedQuote.find(query)
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(100)
      .lean()

    const formattedDrafts = quotes.map(formatDraftDto)
    return NextResponse.json(formattedDrafts, { headers: NO_CACHE_HEADERS })
  } catch (error: any) {
    return handleApiError(error, NO_CACHE_HEADERS)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    const username = extractUsername(session)
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

    const setPayload = buildDraftDocumentPayload(
      body,
      username,
      session?.user?.email || ""
    )

    const draft = await SavedQuote.findOneAndUpdate(
      {
        preparedBy: { $regex: new RegExp(`^${username}$`, "i") },
        quoteNumber: quoteNumber.trim(),
        status: "DRAFT",
      },
      {
        $set: setPayload,
        $setOnInsert: {
          createdAt: new Date(),
        },
      },
      { upsert: true, new: true, runValidators: false }
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
    const username = extractUsername(session)
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

    const baseFilter: Record<string, unknown> = {
      preparedBy: { $regex: new RegExp(`^${username}$`, "i") },
      status: "DRAFT",
    }

    if (isAll) {
      if (type && ["window", "door", "sealed_unit"].includes(type)) {
        baseFilter.quoteType = type
      }
      await SavedQuote.deleteMany(baseFilter)
    } else if (id || (quoteNumber && type)) {
      const orConditions: any[] = []
      if (id && mongoose.Types.ObjectId.isValid(id)) {
        orConditions.push({ _id: new mongoose.Types.ObjectId(id) })
      }
      if (quoteNumber && type) {
        orConditions.push({
          quoteNumber: quoteNumber.trim(),
          quoteType: type,
        })
      } else if (quoteNumber) {
        orConditions.push({ quoteNumber: quoteNumber.trim() })
      }
      if (orConditions.length > 0) {
        await SavedQuote.deleteMany({
          ...baseFilter,
          $or: orConditions,
        })
      }
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
