import { NextResponse } from "next/server"
import SavedQuote from "@/models/SavedQuote"
import User from "@/models/User"
import Notification from "@/models/Notification"
import { triggerPusherEvent } from "@/lib/pusher-server"
import { sendQuoteReviewRequestedEmail, getAppUrl } from "@/lib/email"
import { cacheDelPattern } from "@/lib/redis"

export async function createQuoteService(
  request: Request,
  session: any,
  body: any,
  headers: Record<string, string>
) {
  const currentUsername = session.user.username || session.user.name || ""
  const {
    quoteNumber,
    customerName,
    assignedTo,
    preparerNotes,
    windows,
    taxTotals,
    quoteResult,
    quoteNotes,
    surchargeRate,
    activePromoId,
    customJC,
    customMisc,
    customLabour,
    includeJCInPromo,
    includeMiscInPromo,
    includeLabourInPromo,
    attachedUpgrade,
    attachedSealedUnit,
    attachedDoorQuote,
    attachedWindowQuote,
    attachedInstallOption,
    customOptions,
    selectedRegionId,
    regionName,
    travelFeeType,
    customTravelFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
    extraLabour,
    globalUpcharges,
    hstRate,
    isFirstNation,
    supplyJambId,
    supplyJambRate,
    supplyCasingId,
    supplyCasingRate,
    wantsUpgrade,
    isSupplyOnly,
    isServiceOnly,
    quoteSummaryTotal,
    odooAssignedTo,
    directApprove,
  } = body

  const rawSummaryTotal = Number(body.quoteSummaryTotal ?? 0)
  const normalizedSummaryTotal =
    rawSummaryTotal > 0 &&
    rawSummaryTotal < 100000 &&
    ((body.taxTotals?.grandTotal &&
      Math.abs(rawSummaryTotal - Number(body.taxTotals.grandTotal)) < 0.01) ||
      rawSummaryTotal < 10000)
      ? Math.round(rawSummaryTotal * 100)
      : Math.round(rawSummaryTotal)

  if (!quoteNumber || typeof quoteNumber !== "string" || !quoteNumber.trim()) {
    return NextResponse.json(
      { error: "Quote Number is required" },
      { status: 400, headers }
    )
  }

  if (quoteNumber.length > 60) {
    return NextResponse.json(
      { error: "Quote Number cannot exceed 60 characters" },
      { status: 400, headers }
    )
  }

  if (
    !customerName ||
    typeof customerName !== "string" ||
    !customerName.trim()
  ) {
    return NextResponse.json(
      { error: "Customer Name is required" },
      { status: 400, headers }
    )
  }

  if (customerName.length > 200) {
    return NextResponse.json(
      { error: "Customer Name cannot exceed 200 characters" },
      { status: 400, headers }
    )
  }

  if (
    quoteNotes &&
    typeof quoteNotes === "string" &&
    quoteNotes.length > 10000
  ) {
    return NextResponse.json(
      { error: "Quote Notes cannot exceed 10,000 characters" },
      { status: 400, headers }
    )
  }

  if (
    preparerNotes &&
    typeof preparerNotes === "string" &&
    preparerNotes.length > 10000
  ) {
    return NextResponse.json(
      { error: "Preparer Notes cannot exceed 10,000 characters" },
      { status: 400, headers }
    )
  }

  if (windows && Array.isArray(windows) && windows.length > 200) {
    return NextResponse.json(
      { error: "A quote cannot contain more than 200 window items" },
      { status: 400, headers }
    )
  }

  const cleanQuoteNumber = quoteNumber.trim()
  const cleanCustomerName = customerName.trim()

  const safeRegex = (str: string) =>
    new RegExp(`^${str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")

  // Look up emails for preparer, assigned reviewer, and odoo clerk
  const [preparerUser, reviewerUser, clerkUser] = await Promise.all([
    currentUsername ? User.findOne({ username: safeRegex(currentUsername) }) : null,
    assignedTo
      ? User.findOne({
          username: safeRegex(assignedTo),
        })
      : null,
    odooAssignedTo
      ? User.findOne({
          username: safeRegex(odooAssignedTo),
        })
      : null,
  ])

  const isDirectApprove = Boolean(directApprove)
  const isUserAdmin =
    session.user.role === "ADMIN" ||
    session.user.role === "SUPERADMIN" ||
    preparerUser?.role === "ADMIN" ||
    preparerUser?.role === "SUPERADMIN"

  if (isDirectApprove && !isUserAdmin) {
    return NextResponse.json(
      { error: "Only administrators can directly approve quotes." },
      { status: 403, headers }
    )
  }

  if (!isDirectApprove) {
    const targetReviewer = reviewerUser?.username || assignedTo || ""
    if (
      !targetReviewer.trim() ||
      targetReviewer.toLowerCase() === currentUsername.toLowerCase()
    ) {
      return NextResponse.json(
        {
          error:
            "You cannot submit a quote for review to yourself. Please select another team member.",
        },
        { status: 400, headers }
      )
    }
  }

  const determinedQuoteType =
    body.quoteType ||
    (windows && Array.isArray(windows) && windows.some((w: any) => w.doorPresetId)
      ? "door"
      : taxTotals?.isSealedUnitQuote
        ? "sealed_unit"
        : "window")

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

  const quotePayload = {
    quoteNumber: cleanQuoteNumber,
    customerName: cleanCustomerName,
    quoteType: determinedQuoteType,
    status: isDirectApprove ? ("APPROVED" as const) : ("PENDING_REVIEW" as const),
    approvedBy: isDirectApprove ? currentUsername : undefined,
    approvedAt: isDirectApprove ? new Date() : undefined,
    preparedBy: currentUsername,
    preparedByName:
      preparerUser?.name || preparerUser?.username || currentUsername,
    preparedByEmail: preparerUser?.email || session.user.email || "",
    assignedTo: isDirectApprove
      ? currentUsername
      : reviewerUser?.username || assignedTo,
    assignedToEmail: isDirectApprove
      ? preparerUser?.email || ""
      : reviewerUser?.email || "",
    odooAssignedTo: isDirectApprove
      ? clerkUser?.username || odooAssignedTo || ""
      : undefined,
    odooStatus: isDirectApprove && odooAssignedTo ? ("PENDING_ENTRY" as const) : undefined,
    preparerNotes,
    windows,
    taxTotals,
    quoteResult,
    quoteNotes,
    surchargeRate,
    activePromoId,
    customJC,
    customMisc,
    customLabour,
    includeJCInPromo,
    includeMiscInPromo,
    includeLabourInPromo,
    attachedUpgrade,
    attachedSealedUnit,
    attachedDoorQuote,
    attachedWindowQuote,
    attachedInstallOption,
    customOptions,
    selectedRegionId,
    regionName,
    travelFeeType,
    customTravelFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
    extraLabour,
    globalUpcharges,
    hstRate,
    isFirstNation,
    supplyJambId,
    supplyJambRate,
    supplyCasingId,
    supplyCasingRate,
    wantsUpgrade,
    isSupplyOnly,
    isServiceOnly,
    quoteSummaryTotal: normalizedSummaryTotal,
    isStarred: false,
    initialSnapshot: {
      windows,
      taxTotals,
      quoteResult,
      quoteNotes,
      surchargeRate,
      activePromoId,
      customJC,
      customMisc,
      customLabour,
      includeJCInPromo,
      includeMiscInPromo,
      includeLabourInPromo,
      attachedUpgrade,
      attachedSealedUnit,
      attachedDoorQuote,
      attachedWindowQuote,
      attachedInstallOption,
      customOptions,
      selectedRegionId,
      regionName,
      travelFeeType,
      customTravelFee,
      showOutTownTravel,
      travelKm,
      crewHours,
      crewSize,
      extraLabour,
      globalUpcharges,
      hstRate,
      isFirstNation,
      supplyJambId,
      supplyJambRate,
      supplyCasingId,
      supplyCasingRate,
      wantsUpgrade,
      isSupplyOnly,
      isServiceOnly,
      quoteSummaryTotal: normalizedSummaryTotal,
    },
  }

  let newQuote: any
  if (existingQuote) {
    Object.assign(existingQuote, quotePayload)
    existingQuote.updatedAt = new Date()
    newQuote = await existingQuote.save()
  } else {
    newQuote = await SavedQuote.create(quotePayload)
  }

  // Purge any remaining DRAFT records for this quoteNumber AND any attached quotes
  // so they are absorbed and never linger as unsubmitted drafts under Saved Quotes
  try {
    const quoteNumbersToPurge = [cleanQuoteNumber]
    if (attachedDoorQuote?.quoteNumber) {
      quoteNumbersToPurge.push(String(attachedDoorQuote.quoteNumber).trim())
    }
    if (attachedWindowQuote?.quoteNumber) {
      quoteNumbersToPurge.push(String(attachedWindowQuote.quoteNumber).trim())
    }
    if (attachedSealedUnit?.quoteNumber) {
      quoteNumbersToPurge.push(String(attachedSealedUnit.quoteNumber).trim())
    }

    await SavedQuote.deleteMany({
      preparedBy: { $regex: new RegExp(`^${currentUsername}$`, "i") },
      quoteNumber: {
        $in: quoteNumbersToPurge.map(
          (n) => new RegExp(`^${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
        ),
      },
      status: "DRAFT",
      _id: { $ne: newQuote._id },
    })
  } catch (err) {
    console.error("Failed to purge duplicate draft records:", err)
  }

  if (isDirectApprove && odooAssignedTo) {
    const clerkUsername = clerkUser?.username || odooAssignedTo
    try {
      const clerkNotif = await Notification.create({
        recipientUsername: clerkUsername,
        senderUsername: currentUsername,
        type: "QUOTE_ODOO_ASSIGNED",
        title: `Quote #${quoteNumber} Ready for Odoo`,
        message: `${currentUsername} approved Quote #${quoteNumber} (${customerName}) and assigned it to you for Odoo entry.`,
        quoteId: newQuote._id.toString(),
        quoteNumber,
        customerName,
        isRead: false,
      })
      await triggerPusherEvent(
        `user-${clerkUsername.toLowerCase()}`,
        "notification",
        clerkNotif
      )
      await triggerPusherEvent("global-quotes", "QUOTE_COUNT_UPDATED", {
        quoteNumber,
      })
    } catch (err) {
      console.error("Failed to notify Odoo clerk on direct approve:", err)
    }
  } else if (!isDirectApprove) {
    const reviewerUsername = reviewerUser?.username || assignedTo
    if (
      reviewerUsername &&
      reviewerUsername.toLowerCase() !== currentUsername.toLowerCase()
    ) {
      try {
        const createdNotif = await Notification.create({
          recipientUsername: reviewerUsername,
          senderUsername: currentUsername,
          type: "QUOTE_SUBMITTED",
          title: `New Quote #${quoteNumber} for Review`,
          message: `${currentUsername} submitted quote #${quoteNumber} (${customerName}) for your review.`,
          quoteId: newQuote._id.toString(),
          quoteNumber,
          customerName,
          isRead: false,
        })

        await triggerPusherEvent(
          `user-${reviewerUsername.toLowerCase()}`,
          "notification",
          createdNotif
        )
        await triggerPusherEvent("global-quotes", "QUOTE_COUNT_UPDATED", {
          quoteNumber,
        })

        if (
          reviewerUser?.email &&
          (reviewerUser as any)?.receiveQuoteEmails !== false &&
          (reviewerUser as any)?.muteNotifications !== true
        ) {
          sendQuoteReviewRequestedEmail({
            toEmail: reviewerUser.email,
            reviewerName: reviewerUsername,
            preparerName: currentUsername,
            quoteNumber,
            customerName,
            preparerNotes,
            appUrl: getAppUrl(request),
          }).catch((emailErr) =>
            console.error("Failed to send reviewer email:", emailErr)
          )
        }
      } catch (notifErr) {
        console.error("Failed to create reviewer notification:", notifErr)
      }
    }
  }

  cacheDelPattern("quotes:badge:*").catch(() => {})

  return NextResponse.json(
    { message: "Quote submitted for review successfully", quote: newQuote },
    { status: 201, headers }
  )
}
