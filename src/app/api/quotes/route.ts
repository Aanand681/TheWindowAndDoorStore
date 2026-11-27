import { NextResponse } from "next/server"
import dbConnect from "@/lib/mongodb"
import SavedQuote from "@/models/SavedQuote"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { getQuotesBadgeCounts } from "@/lib/server/quotes/quotes-badge-counter"
import { createQuoteService } from "@/lib/server/quotes/quote-create-service"
import { handleApiError } from "@/lib/api-error"
import {
  containsCaseInsensitiveRegex,
  exactCaseInsensitiveRegex,
} from "@/lib/regex"

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
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const currentUser = session.user.username || session.user.name || ""
    const { searchParams } = new URL(request.url)

    const status = searchParams.get("status")
    const assignedTo = searchParams.get("assignedTo")
    const preparedBy = searchParams.get("preparedBy")
    const search = searchParams.get("search")
    const countOnly = searchParams.get("countOnly") === "true"

    if (countOnly) {
      const badgeData = await getQuotesBadgeCounts(session, currentUser)
      return NextResponse.json(badgeData, { headers: NO_CACHE_HEADERS })
    }

    await dbConnect()

    const filter: any = {}

    // 1. Enforce strict draft isolation: drafts belong exclusively in /api/drafts
    if (status && status !== "all") {
      filter.status = status
    } else {
      filter.status = { $ne: "DRAFT" }
    }

    if (assignedTo) {
      filter.assignedTo = { $regex: exactCaseInsensitiveRegex(assignedTo) }
    }

    if (preparedBy) {
      filter.preparedBy = { $regex: exactCaseInsensitiveRegex(preparedBy) }
    }

    // 2. Strict Reviewer Isolation:
    // If a quote is PENDING_REVIEW and assigned to a specific admin,
    // it must ONLY be visible to that assigned reviewer or the preparer who submitted it.
    const currentUserRegex = exactCaseInsensitiveRegex(currentUser)
    const reviewerPrivacyFilter = {
      $or: [
        { status: { $ne: "PENDING_REVIEW" } },
        { assignedTo: { $regex: currentUserRegex } },
        { preparedBy: { $regex: currentUserRegex } },
        ...(currentUser?.toLowerCase() === "admin"
          ? [
              { assignedTo: "Admin" },
              { assignedTo: { $exists: false } },
              { assignedTo: "" },
            ]
          : []),
      ],
    }

    if (filter.status === "PENDING_REVIEW") {
      filter.$or = [
        { assignedTo: { $regex: currentUserRegex } },
        { preparedBy: { $regex: currentUserRegex } },
        ...(currentUser?.toLowerCase() === "admin"
          ? [
              { assignedTo: "Admin" },
              { assignedTo: { $exists: false } },
              { assignedTo: "" },
            ]
          : []),
      ]
    } else {
      filter.$and = filter.$and
        ? [...filter.$and, reviewerPrivacyFilter]
        : [reviewerPrivacyFilter]
    }

    if (search) {
      const sRegex = containsCaseInsensitiveRegex(search.trim())
      const searchFilter = {
        $or: [
          { customerName: sRegex },
          { quoteNumber: sRegex },
          { preparedBy: sRegex },
        ],
      }
      filter.$and = filter.$and
        ? [...filter.$and, searchFilter]
        : [searchFilter]
    }

    const quotes = await SavedQuote.find(filter)
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(100)

    return NextResponse.json(quotes, { headers: NO_CACHE_HEADERS })
  } catch (error: any) {
    return handleApiError(error, NO_CACHE_HEADERS)
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    await dbConnect()

    return await createQuoteService(request, session, body, NO_CACHE_HEADERS)
  } catch (error: any) {
    return handleApiError(error, NO_CACHE_HEADERS)
  }
}
