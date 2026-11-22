import SavedQuote from "@/models/SavedQuote"
import { formatWindowSummarySentence } from "@/lib/calculator/format-window-summary"
import { formatDoorSummarySentence } from "@/lib/doors/formatters"

export async function findSubmittedQuoteNumbers(
  username: string
): Promise<string[]> {
  const submittedQuoteDocs = await SavedQuote.find({
    preparedBy: { $regex: new RegExp(`^${username}$`, "i") },
    status: { $ne: "DRAFT" },
  })
    .select(
      "quoteNumber attachedDoorQuote.quoteNumber attachedWindowQuote.quoteNumber attachedSealedUnit.quoteNumber"
    )
    .lean()

  const submittedQuoteNumbersSet = new Set<string>()
  for (const q of submittedQuoteDocs as any[]) {
    if (q.quoteNumber) {
      const n = String(q.quoteNumber).trim().toLowerCase()
      if (n && n !== "untitled") submittedQuoteNumbersSet.add(n)
    }
    if (q.attachedDoorQuote?.quoteNumber) {
      const n = String(q.attachedDoorQuote.quoteNumber).trim().toLowerCase()
      if (n && n !== "untitled") submittedQuoteNumbersSet.add(n)
    }
    if (q.attachedWindowQuote?.quoteNumber) {
      const n = String(q.attachedWindowQuote.quoteNumber).trim().toLowerCase()
      if (n && n !== "untitled") submittedQuoteNumbersSet.add(n)
    }
    if (q.attachedSealedUnit?.quoteNumber) {
      const n = String(q.attachedSealedUnit.quoteNumber).trim().toLowerCase()
      if (n && n !== "untitled") submittedQuoteNumbersSet.add(n)
    }
  }

  return Array.from(submittedQuoteNumbersSet)
}

export async function purgeOrphanedDrafts(
  username: string,
  submittedQuoteNumbers: string[]
): Promise<void> {
  if (submittedQuoteNumbers.length === 0) return

  await SavedQuote.deleteMany({
    preparedBy: { $regex: new RegExp(`^${username}$`, "i") },
    status: "DRAFT",
    quoteNumber: {
      $in: submittedQuoteNumbers.map(
        (n) => new RegExp(`^${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i")
      ),
    },
  })
}

export function formatDraftSummary(
  quoteType: string,
  windows: any[],
  existingSummary?: string
): string {
  const resolved = (existingSummary || "").trim()
  if (resolved) return resolved

  const items = Array.isArray(windows) ? windows : []
  if (quoteType === "door") {
    return formatDoorSummarySentence(items)
  }
  if (quoteType === "sealed_unit") {
    return items.length > 0
      ? `${items.length} Sealed Unit${items.length > 1 ? "s" : ""}`
      : "Sealed Unit Quote"
  }
  return formatWindowSummarySentence(items)
}

export function formatDraftDto(d: any): Record<string, any> {
  const quoteType = d.quoteType || "window"
  const windows = Array.isArray(d.windows) ? d.windows : []
  const resolvedSummary = formatDraftSummary(quoteType, windows, d.summaryLabel)

  return {
    _id: d._id,
    id: String(d._id),
    type: quoteType,
    quoteNumber: d.quoteNumber,
    customerName: d.customerName,
    itemCount: windows.length,
    subtotal: d.taxTotals?.subtotalPreTax || d.taxTotals?.subtotal || 0,
    grandTotal: d.quoteSummaryTotal || d.taxTotals?.grandTotal || 0,
    summaryLabel: resolvedSummary,
    data: {
      ...d,
      quoteNumber: d.quoteNumber,
      customerName: d.customerName,
      windows,
      lineItems: windows,
      summaryLabel: resolvedSummary,
      taxTotals: d.taxTotals,
      totals: d.taxTotals,
      quoteResult: d.quoteResult,
      quoteNotes: d.quoteNotes,
      surchargeRate: d.surchargeRate,
      activePromoId: d.activePromoId,
      customJC: d.customJC,
      customMisc: d.customMisc,
      customLabour: d.customLabour,
      includeJCInPromo: d.includeJCInPromo,
      includeMiscInPromo: d.includeMiscInPromo,
      includeLabourInPromo: d.includeLabourInPromo,
      attachedUpgrade: d.attachedUpgrade,
      attachedDoorQuote: d.attachedDoorQuote,
      attachedSealedUnit: d.attachedSealedUnit,
      attachedWindowQuote: d.attachedWindowQuote,
      attachedInstallOption: d.attachedInstallOption ?? null,
      customOptions: Array.isArray(rawDataCustomOptions(d.customOptions))
        ? d.customOptions
        : [],
      supplyJambId: d.supplyJambId,
      supplyJambRate: d.supplyJambRate,
      supplyCasingId: d.supplyCasingId,
      supplyCasingRate: d.supplyCasingRate,
      wantsUpgrade: d.wantsUpgrade,
      isSupplyOnly: d.isSupplyOnly,
      isServiceOnly: d.isServiceOnly,
      isInstallation: d.isInstallation,
      selectedRegionId:
        d.selectedRegionId || d.taxTotals?.selectedRegionId || "",
      regionName: d.regionName || d.taxTotals?.regionName || "",
      travelFeeType: d.travelFeeType,
      customTravelFee: d.customTravelFee,
      showOutTownTravel: d.showOutTownTravel,
      travelKm: d.travelKm,
      crewHours: d.crewHours,
      crewSize: d.crewSize,
      hstRate: d.hstRate ?? d.taxTotals?.hstRate,
      sealedUnitMode: d.sealedUnitMode,
      mode: d.mode,
      serviceSqftInput: d.serviceSqftInput,
      serviceLabourRateInput: d.serviceLabourRateInput,
      serviceMiscRateInput: d.serviceMiscRateInput,
      globalUpcharges: d.globalUpcharges,
      isFirstNation: d.isFirstNation,
      quoteSummaryTotal: d.quoteSummaryTotal,
      grandTotal: d.quoteSummaryTotal || d.taxTotals?.grandTotal || 0,
    },
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  }
}

function rawDataCustomOptions(opts: any): any[] {
  return Array.isArray(opts) ? opts : []
}

export function buildDraftDocumentPayload(
  body: any,
  username: string,
  userEmail: string
): Record<string, any> {
  const { type, quoteNumber, customerName } = body
  const rawData = body.data || {}
  const windowsData =
    rawData.windows ||
    rawData.lineItems ||
    (Array.isArray(body.windows) ? body.windows : [])
  const totalAmount =
    Number(body.grandTotal) ||
    Number(rawData.grandTotal) ||
    Number(rawData.taxTotals?.grandTotal) ||
    0

  const effectiveSummaryLabel = formatDraftSummary(
    type,
    windowsData,
    body.summaryLabel || rawData.summaryLabel
  )

  return {
    quoteNumber: quoteNumber.trim(),
    customerName: customerName.trim(),
    quoteType: type,
    status: "DRAFT",
    preparedBy: username,
    preparedByEmail: userEmail,
    assignedTo: "Admin",
    summaryLabel: effectiveSummaryLabel,
    windows: windowsData,
    taxTotals: rawData.taxTotals || rawData.totals || null,
    quoteResult: rawData.quoteResult || null,
    quoteNotes: rawData.quoteNotes || "",
    surchargeRate: rawData.surchargeRate ?? 8,
    activePromoId: rawData.activePromoId || "none",
    customJC: rawData.customJC,
    customMisc: rawData.customMisc,
    customLabour: rawData.customLabour,
    includeJCInPromo: rawData.includeJCInPromo ?? true,
    includeMiscInPromo: rawData.includeMiscInPromo ?? true,
    includeLabourInPromo: rawData.includeLabourInPromo ?? true,
    attachedUpgrade: rawData.attachedUpgrade,
    attachedDoorQuote: rawData.attachedDoorQuote,
    attachedSealedUnit: rawData.attachedSealedUnit,
    attachedWindowQuote: rawData.attachedWindowQuote,
    attachedInstallOption: rawData.attachedInstallOption ?? null,
    customOptions: Array.isArray(rawData.customOptions)
      ? rawData.customOptions
      : [],
    supplyJambId: rawData.supplyJambId,
    supplyJambRate: rawData.supplyJambRate,
    supplyCasingId: rawData.supplyCasingId,
    supplyCasingRate: rawData.supplyCasingRate,
    wantsUpgrade: rawData.wantsUpgrade,
    isSupplyOnly: rawData.isSupplyOnly,
    isServiceOnly: rawData.isServiceOnly,
    isInstallation: rawData.isInstallation,
    selectedRegionId: rawData.selectedRegionId || rawData.regionId || "",
    regionName: rawData.regionName || "",
    travelFeeType: rawData.travelFeeType,
    customTravelFee: rawData.customTravelFee,
    showOutTownTravel: rawData.showOutTownTravel,
    travelKm: rawData.travelKm,
    crewHours: rawData.crewHours,
    crewSize: rawData.crewSize,
    hstRate: rawData.hstRate,
    sealedUnitMode: rawData.sealedUnitMode,
    mode: rawData.mode,
    serviceSqftInput: rawData.serviceSqftInput,
    serviceLabourRateInput: rawData.serviceLabourRateInput,
    serviceMiscRateInput: rawData.serviceMiscRateInput,
    globalUpcharges: rawData.globalUpcharges,
    isFirstNation: rawData.isFirstNation,
    quoteSummaryTotal: totalAmount,
  }
}
