import SavedQuote from "@/models/SavedQuote"
import { exactCaseInsensitiveRegex } from "@/lib/regex"

export function determineQuoteType(body: any): "window" | "door" | "sealed_unit" {
  if (body.quoteType) return body.quoteType
  if (body.windows && Array.isArray(body.windows) && body.windows.some((w: any) => w.doorPresetId)) {
    return "door"
  }
  if (body.taxTotals?.isSealedUnitQuote) {
    return "sealed_unit"
  }
  return "window"
}

export function buildQuotePayload(
  cleanQuoteNumber: string,
  cleanCustomerName: string,
  quoteType: string,
  isDirectApprove: boolean,
  currentUsername: string,
  preparerUser: any,
  session: any,
  reviewerUser: any,
  clerkUser: any,
  body: any,
  normalizedSummaryTotal: number
): Record<string, any> {
  const snapshotData = {
    windows: body.windows,
    taxTotals: body.taxTotals,
    quoteResult: body.quoteResult,
    quoteNotes: body.quoteNotes,
    surchargeRate: body.surchargeRate,
    activePromoId: body.activePromoId,
    customJC: body.customJC,
    customMisc: body.customMisc,
    customLabour: body.customLabour,
    customDiscount: body.customDiscount,
    customDiscountLabel: body.customDiscountLabel,
    loyaltyDiscount: body.loyaltyDiscount,
    loyaltyDiscountLabel: body.loyaltyDiscountLabel,
    discountType: body.discountType,
    loyaltyPoints: body.loyaltyPoints,
    loyaltyGrossAmount: body.loyaltyGrossAmount,
    loyaltyTierId: body.loyaltyTierId,
    customMaterials: Array.isArray(body.customMaterials)
      ? body.customMaterials
      : Array.isArray(body.taxTotals?.customMaterials)
        ? body.taxTotals.customMaterials
        : [],
    includeJCInPromo: body.includeJCInPromo,
    includeMiscInPromo: body.includeMiscInPromo,
    includeLabourInPromo: body.includeLabourInPromo,
    attachedUpgrade: body.attachedUpgrade,
    attachedSealedUnit: body.attachedSealedUnit,
    attachedDoorQuote: body.attachedDoorQuote,
    attachedWindowQuote: body.attachedWindowQuote,
    attachedInstallOption: body.attachedInstallOption,
    customOptions: body.customOptions,
    selectedRegionId: body.selectedRegionId,
    regionName: body.regionName,
    travelFeeType: body.travelFeeType,
    customTravelFee: body.customTravelFee,
    showOutTownTravel: body.showOutTownTravel,
    travelKm: body.travelKm,
    crewHours: body.crewHours,
    crewSize: body.crewSize,
    extraLabour: body.extraLabour,
    globalUpcharges: body.globalUpcharges,
    hstRate: body.hstRate,
    isFirstNation: body.isFirstNation,
    supplyJambId: body.supplyJambId,
    supplyJambRate: body.supplyJambRate,
    supplyCasingId: body.supplyCasingId,
    supplyCasingRate: body.supplyCasingRate,
    wantsUpgrade: body.wantsUpgrade,
    isSupplyOnly: body.isSupplyOnly,
    isServiceOnly: body.isServiceOnly,
    quoteSummaryTotal: normalizedSummaryTotal,
  }

  return {
    quoteNumber: cleanQuoteNumber,
    customerName: cleanCustomerName,
    quoteType,
    status: isDirectApprove ? ("APPROVED" as const) : ("PENDING_REVIEW" as const),
    approvedBy: isDirectApprove ? currentUsername : undefined,
    approvedAt: isDirectApprove ? new Date() : undefined,
    preparedBy: currentUsername,
    preparedByName: preparerUser?.name || preparerUser?.username || currentUsername,
    preparedByEmail: preparerUser?.email || session.user.email || "",
    assignedTo: isDirectApprove ? currentUsername : reviewerUser?.username || body.assignedTo,
    assignedToEmail: isDirectApprove ? preparerUser?.email || "" : reviewerUser?.email || "",
    odooAssignedTo: isDirectApprove ? clerkUser?.username || body.odooAssignedTo || "" : undefined,
    odooStatus: isDirectApprove && body.odooAssignedTo ? ("PENDING_ENTRY" as const) : undefined,
    preparerNotes: body.preparerNotes,
    ...snapshotData,
    isStarred: false,
    initialSnapshot: snapshotData,
  }
}

export async function purgeAbsorbedDrafts(
  cleanQuoteNumber: string,
  currentUsername: string,
  body: any,
  createdQuoteId: any
): Promise<void> {
  try {
    const quoteNumbersToPurge = [cleanQuoteNumber]
    if (body.attachedDoorQuote?.quoteNumber) {
      quoteNumbersToPurge.push(String(body.attachedDoorQuote.quoteNumber).trim())
    }
    if (body.attachedWindowQuote?.quoteNumber) {
      quoteNumbersToPurge.push(String(body.attachedWindowQuote.quoteNumber).trim())
    }
    if (body.attachedSealedUnit?.quoteNumber) {
      quoteNumbersToPurge.push(String(body.attachedSealedUnit.quoteNumber).trim())
    }

    await SavedQuote.deleteMany({
      preparedBy: { $regex: exactCaseInsensitiveRegex(currentUsername) },
      quoteNumber: {
        $in: quoteNumbersToPurge.map((n) => exactCaseInsensitiveRegex(n)),
      },
      status: "DRAFT",
      _id: { $ne: createdQuoteId },
    })
  } catch (err) {
    console.error("Failed to purge duplicate draft records:", err)
  }
}
