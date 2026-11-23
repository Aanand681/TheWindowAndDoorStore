import { NextResponse } from "next/server"
import SavedQuote from "@/models/SavedQuote"
import User from "@/models/User"
import {
  normalizeQuoteSummaryTotal,
  validateQuoteCreateInput,
} from "./quote-create-validation"
import {
  determineQuoteType,
  buildQuotePayload,
  purgeAbsorbedDrafts,
} from "./quote-create-payload-builder"
import { dispatchQuoteNotifications } from "./quote-create-notifications"

export async function createQuoteService(
  request: Request,
  session: any,
  body: any,
  headers: Record<string, string>
) {
  const currentUsername = session.user.username || session.user.name || ""
  const { quoteNumber, customerName, assignedTo, odooAssignedTo, directApprove } = body

  const rawSummaryTotal = Number(body.quoteSummaryTotal ?? 0)
  const normalizedSummaryTotal = normalizeQuoteSummaryTotal(
    rawSummaryTotal,
    body.taxTotals?.grandTotal
  )

  const safeRegex = (str: string) =>
    new RegExp(`^${str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")

  // Look up emails for preparer, assigned reviewer, and odoo clerk
  const [preparerUser, reviewerUser, clerkUser] = await Promise.all([
    currentUsername ? User.findOne({ username: safeRegex(currentUsername) }) : null,
    assignedTo ? User.findOne({ username: safeRegex(assignedTo) }) : null,
    odooAssignedTo ? User.findOne({ username: safeRegex(odooAssignedTo) }) : null,
  ])

  const validation = validateQuoteCreateInput(
    body,
    currentUsername,
    session,
    preparerUser,
    reviewerUser
  )
  if (!validation.isValid) {
    return NextResponse.json(
      { error: validation.error },
      { status: validation.status || 400, headers }
    )
  }

  const cleanQuoteNumber = quoteNumber.trim()
  const cleanCustomerName = customerName.trim()
  const isDirectApprove = Boolean(directApprove)
  const determinedQuoteType = determineQuoteType(body)

  // Check if an existing DRAFT, PENDING_REVIEW, or RETURNED quote exists for this user and quoteNumber to update in-place
  const existingQuote = await SavedQuote.findOne(
    {
      preparedBy: { $regex: new RegExp(`^${currentUsername}$`, "i") },
      quoteNumber: cleanQuoteNumber,
      status: { $in: ["DRAFT", "PENDING_REVIEW", "RETURNED"] },
    },
    null,
    { sort: { updatedAt: -1, createdAt: -1 } }
  )

  const quotePayload = buildQuotePayload(
    cleanQuoteNumber,
    cleanCustomerName,
    determinedQuoteType,
    isDirectApprove,
    currentUsername,
    preparerUser,
    session,
    reviewerUser,
    clerkUser,
    body,
    normalizedSummaryTotal
  )

  let newQuote: any
  if (existingQuote) {
    Object.assign(existingQuote, quotePayload)
    existingQuote.updatedAt = new Date()
    newQuote = await existingQuote.save()
  } else {
    newQuote = await SavedQuote.create(quotePayload)
  }

  // Purge any remaining DRAFT records for this quoteNumber AND any attached quotes
  await purgeAbsorbedDrafts(cleanQuoteNumber, currentUsername, body, newQuote._id)

  // Dispatch background real-time Pusher events, email notifications, and cache invalidation
  await dispatchQuoteNotifications({
    isDirectApprove,
    odooAssignedTo,
    clerkUser,
    reviewerUser,
    assignedTo,
    currentUsername,
    quoteNumber: cleanQuoteNumber,
    customerName: cleanCustomerName,
    preparerNotes: body.preparerNotes,
    newQuoteId: newQuote._id.toString(),
    request,
  })

  return NextResponse.json(
    { message: "Quote submitted for review successfully", quote: newQuote },
    { status: 201, headers }
  )
}
