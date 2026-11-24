import SavedQuote from "@/models/SavedQuote"
import { detectQuoteChanges } from "@/lib/quote-diff"
import { formatReviewerName } from "@/lib/format-reviewer"
import { validateQuoteUpdateFields } from "./quote-update-validation"

export interface BuildQuoteUpdatePayloadResult {
  error?: string
  statusCode?: number
  updateData?: any
  newStatus?: string
  isReviewAction?: boolean
}

export async function buildQuoteUpdatePayload(p: {
  id: string
  body: any
  existingQuote: any
  reviewerUsername: string
  userRole: string
}): Promise<BuildQuoteUpdatePayloadResult> {
  const { id, body, existingQuote, reviewerUsername, userRole } = p

  const validationError = validateQuoteUpdateFields(body, reviewerUsername)
  if (validationError) return validationError

  const updateData: any = {}

  const scalarFields = [
    "status",
    "reviewerNotes",
    "windows",
    "taxTotals",
    "quoteResult",
    "quoteNotes",
    "surchargeRate",
    "activePromoId",
    "customerName",
    "quoteNumber",
    "preparerNotes",
    "assignedTo",
    "customJC",
    "customMisc",
    "customLabour",
    "customDiscount",
    "customDiscountLabel",
    "discountType",
    "loyaltyPoints",
    "loyaltyGrossAmount",
    "loyaltyTierId",
    "includeJCInPromo",
    "includeMiscInPromo",
    "includeLabourInPromo",
    "attachedUpgrade",
    "attachedSealedUnit",
    "attachedDoorQuote",
    "attachedWindowQuote",
    "attachedInstallOption",
    "customOptions",
    "selectedRegionId",
    "regionName",
    "travelFeeType",
    "customTravelFee",
    "showOutTownTravel",
    "travelKm",
    "crewHours",
    "crewSize",
    "extraLabour",
    "globalUpcharges",
    "hstRate",
    "isFirstNation",
    "supplyJambId",
    "supplyJambRate",
    "supplyCasingId",
    "supplyCasingRate",
    "wantsUpgrade",
    "isSupplyOnly",
    "isServiceOnly",
    "quoteSummaryTotal",
  ]

  for (const field of scalarFields) {
    if (body[field] !== undefined) {
      if (field === "quoteSummaryTotal") {
        const raw = Number(body.quoteSummaryTotal ?? 0)
        updateData.quoteSummaryTotal =
          raw > 0 &&
          raw < 100000 &&
          ((body.taxTotals?.grandTotal &&
            Math.abs(raw - Number(body.taxTotals.grandTotal)) < 0.01) ||
            raw < 10000)
            ? Math.round(raw * 100)
            : Math.round(raw)
      } else {
        updateData[field] = body[field]
      }
    }
  }

  if (Array.isArray(body.reviewChanges))
    updateData.reviewChanges = body.reviewChanges
  if (body.isStarred !== undefined)
    updateData.isStarred = Boolean(body.isStarred)

  // Odoo Post-Approval Workflow Fields
  if (body.odooAssignedTo !== undefined) {
    updateData.odooAssignedTo = body.odooAssignedTo
    if (body.odooAssignedTo && !existingQuote.odooStatus) {
      updateData.odooStatus = "PENDING_ENTRY"
    }
  }
  if (body.odooStatus !== undefined) updateData.odooStatus = body.odooStatus
  if (body.odooCompletedAt !== undefined) {
    updateData.odooCompletedAt = body.odooCompletedAt
      ? new Date(body.odooCompletedAt)
      : null
  }
  if (body.odooCompletedBy !== undefined)
    updateData.odooCompletedBy = body.odooCompletedBy

  if (body.odooStatus === "COMPLETED") {
    const orderNumber = (
      body.odooOrderNumber !== undefined
        ? body.odooOrderNumber
        : existingQuote.odooOrderNumber || ""
    ).trim()
    if (!orderNumber) {
      return {
        error: "Odoo Sales Order # is required to complete order entry.",
        statusCode: 400,
      }
    }

    const duplicateSo = await SavedQuote.findOne({
      _id: { $ne: id },
      odooOrderNumber: {
        $regex: new RegExp(
          `^${orderNumber.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
          "i"
        ),
      },
    })
    if (duplicateSo) {
      return {
        error: `Odoo Sales Order #${orderNumber} is already assigned to Quote #${duplicateSo.quoteNumber} (${duplicateSo.customerName}). Please enter a unique Sales Order #.`,
        statusCode: 400,
      }
    }

    updateData.odooOrderNumber = orderNumber
    updateData.odooStatus = "COMPLETED"
    if (existingQuote.odooStatus !== "COMPLETED") {
      updateData.odooCompletedAt = new Date()
      updateData.odooCompletedBy = reviewerUsername || "Clerk"
    }
  } else if (body.odooOrderNumber !== undefined) {
    updateData.odooOrderNumber = body.odooOrderNumber
  }

  // 1. Establish baseline from initialSnapshot or existing quote values
  const baseline = existingQuote.initialSnapshot || {
    windows: existingQuote.windows,
    taxTotals: existingQuote.taxTotals,
    quoteResult: existingQuote.quoteResult,
    quoteNotes: existingQuote.quoteNotes,
    surchargeRate: existingQuote.surchargeRate,
    activePromoId: existingQuote.activePromoId,
    customJC: existingQuote.customJC,
    customMisc: existingQuote.customMisc,
    customLabour: existingQuote.customLabour,
    includeJCInPromo: existingQuote.includeJCInPromo,
    includeMiscInPromo: existingQuote.includeMiscInPromo,
    includeLabourInPromo: existingQuote.includeLabourInPromo,
    attachedUpgrade: existingQuote.attachedUpgrade,
    attachedSealedUnit: existingQuote.attachedSealedUnit,
    attachedDoorQuote: existingQuote.attachedDoorQuote,
    attachedWindowQuote: existingQuote.attachedWindowQuote,
    attachedInstallOption: existingQuote.attachedInstallOption,
    customOptions: existingQuote.customOptions,
    selectedRegionId: existingQuote.selectedRegionId,
    regionName: existingQuote.regionName,
    travelFeeType: existingQuote.travelFeeType,
    customTravelFee: existingQuote.customTravelFee,
    showOutTownTravel: existingQuote.showOutTownTravel,
    travelKm: existingQuote.travelKm,
    crewHours: existingQuote.crewHours,
    crewSize: existingQuote.crewSize,
    extraLabour: existingQuote.extraLabour,
    globalUpcharges: existingQuote.globalUpcharges,
    hstRate: existingQuote.hstRate,
    isFirstNation: existingQuote.isFirstNation,
    supplyJambId: existingQuote.supplyJambId,
    supplyJambRate: existingQuote.supplyJambRate,
    supplyCasingId: existingQuote.supplyCasingId,
    supplyCasingRate: existingQuote.supplyCasingRate,
    quoteSummaryTotal: existingQuote.quoteSummaryTotal,
  }

  if (!existingQuote.initialSnapshot) {
    updateData.initialSnapshot = baseline
  }

  // 2. Build target state for comparison
  const targetState = {
    ...(typeof existingQuote.toObject === "function"
      ? existingQuote.toObject()
      : existingQuote),
    ...updateData,
  }

  const effectiveEditor = formatReviewerName(reviewerUsername, userRole)
  updateData.lastEditedBy = effectiveEditor
  updateData.lastEditedAt = new Date()
  updateData.updatedAt = new Date()

  // 3. Automatically detect changes against baseline with role-aware lifecycle
  const newStatus = updateData.status || body.status
  const isPreparerRevision =
    existingQuote.status === "RETURNED" && newStatus !== "PENDING_REVIEW"
  const isResubmission =
    newStatus === "PENDING_REVIEW" && existingQuote.status === "RETURNED"

  if (isPreparerRevision) {
    // Preparer actively revising returned quote - working edits are not reviewer modifications
    updateData.reviewChanges = []
  } else if (isResubmission) {
    // Quote resubmitted for review - start fresh with new snapshot and clean reviewChanges
    updateData.reviewChanges = []
    updateData.initialSnapshot = targetState
    updateData.reviewerNotes = ""
  } else {
    // Reviewer audit diff against baseline
    const autoDetectedChanges = detectQuoteChanges(baseline, targetState)
    updateData.reviewChanges = autoDetectedChanges

    if (autoDetectedChanges.length > 0) {
      updateData.reviewedBy = effectiveEditor
      updateData.reviewedAt = new Date()
      updateData.reviewedByRole = userRole || "ADMIN"
      if (
        body.status === "APPROVED" ||
        body.status === "MODIFIED" ||
        updateData.status === "APPROVED"
      ) {
        updateData.status = "MODIFIED"
      }
    } else {
      // Reverted to match baseline - clear diff and revert MODIFIED back to APPROVED
      if (updateData.status === "MODIFIED" || body.status === "MODIFIED") {
        updateData.status = "APPROVED"
      }
    }
  }

  const isApproval =
    (newStatus === "APPROVED" || newStatus === "MODIFIED") &&
    existingQuote.status === "PENDING_REVIEW"

  if (isApproval) {
    const assignedClerk = (
      body.odooAssignedTo !== undefined
        ? body.odooAssignedTo
        : updateData.odooAssignedTo || existingQuote.odooAssignedTo || ""
    ).trim()
    if (!assignedClerk) {
      return {
        error: "Please select an Odoo clerk before approving the quote.",
        statusCode: 400,
      }
    }
    updateData.odooAssignedTo = assignedClerk
    if (!existingQuote.odooStatus) {
      updateData.odooStatus = "PENDING_ENTRY"
    }
  }

  const isReviewAction = Boolean(
    body.status &&
    ["APPROVED", "MODIFIED", "RETURNED"].includes(body.status) &&
    (existingQuote.status === "PENDING_REVIEW" ||
      body.status === "RETURNED" ||
      body.status !== existingQuote.status)
  )

  if (isReviewAction) {
    updateData.reviewedAt = new Date()
    updateData.reviewedBy = effectiveEditor
    updateData.reviewedByRole = userRole || "ADMIN"
  }

  return { updateData, newStatus, isReviewAction }
}
