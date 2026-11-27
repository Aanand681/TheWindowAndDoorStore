import { toast } from "sonner"
import {
  saveQuoteDraftDirectly,
  QuoteDraftItem,
} from "@/lib/quote-drafts-storage"
import { getSealedUnitServiceSummaryLabel, SealedUnitLineItem } from "@/lib/sealed-units-logic"
import { SealedUnitTotals } from "@/components/sealed-units/types"
import { computeEffectiveSealedUnitGrandTotal } from "@/lib/sealed-units/totals-calculator"
import {
  serializeSealedUnitSnapshot,
  createDraftSavePayload,
  SealedUnitSnapshotParams,
} from "./sealed-units-storage-helpers"

export interface ExecuteSaveSealedUnitDraftParams {
  lineItems: SealedUnitLineItem[]
  isServiceOnly: boolean
  totals: SealedUnitTotals
  serviceSqftInput: string
  attachedWindowQuote: any
  attachedDoorQuote: any
  customerName: string
  quoteNumber: string
  setQuoteNumber: (q: string) => void
  generateQuoteNumber: () => string
  quoteNotes: string
  currentSnapshotParams: SealedUnitSnapshotParams
  clearTimerAndSaveSnapshot: (snap: string) => void
}

export async function executeSaveSealedUnitDraft({
  lineItems,
  isServiceOnly,
  totals,
  serviceSqftInput,
  attachedWindowQuote,
  attachedDoorQuote,
  customerName,
  quoteNumber,
  setQuoteNumber,
  generateQuoteNumber,
  quoteNotes,
  currentSnapshotParams,
  clearTimerAndSaveSnapshot,
}: ExecuteSaveSealedUnitDraftParams): Promise<QuoteDraftItem | null> {
  const hasMeaningfulContent =
    lineItems.length > 0 ||
    (isServiceOnly && ((totals.totalSqft || 0) > 0 || serviceSqftInput.trim() !== "")) ||
    (Array.isArray(currentSnapshotParams.customMaterials) &&
      currentSnapshotParams.customMaterials.length > 0) ||
    Boolean(attachedWindowQuote) ||
    Boolean(attachedDoorQuote)

  if (!hasMeaningfulContent) {
    toast.error("Add at least one sealed unit, service sqft, or attach a quote before saving.")
    return null
  }

  if (!customerName.trim()) {
    toast.error("Customer name is required before saving a quote.")
    return null
  }

  const effectiveQuoteNumber = quoteNumber.trim() || generateQuoteNumber()
  if (!quoteNumber.trim()) {
    setQuoteNumber(effectiveQuoteNumber)
  }

  const panesCount = lineItems
    .map((l) => `${l.paneType === "triple" ? "Triple" : "Dual"} Pane`)
    .slice(0, 3)
    .join(", ")
  const summaryTypeDesc = isServiceOnly
    ? getSealedUnitServiceSummaryLabel(lineItems, totals.totalSqft)
    : lineItems.length > 0
      ? `${lineItems.length} Sealed Units (${panesCount}${lineItems.length > 3 ? "..." : ""})`
      : "0 Sealed Units"

  const payload = createDraftSavePayload({
    ...currentSnapshotParams,
    quoteNumber: effectiveQuoteNumber,
    quoteNotes,
    totals,
  })

  try {
    const effectiveTotals = computeEffectiveSealedUnitGrandTotal({
      totals,
      sealedUnitMode: currentSnapshotParams.sealedUnitMode,
      isInstallation: currentSnapshotParams.isInstallation,
      isServiceOnly,
      loyaltyDiscount: currentSnapshotParams.loyaltyDiscount,
      loyaltyDiscountLabel: currentSnapshotParams.loyaltyDiscountLabel,
      hstRate: currentSnapshotParams.hstRate,
      attachedWindowQuote,
      attachedDoorQuote,
    })

    const saved = await saveQuoteDraftDirectly({
      type: "sealed_unit",
      quoteNumber: effectiveQuoteNumber,
      customerName: customerName.trim() || "Unnamed Customer",
      itemCount: isServiceOnly && lineItems.length === 0 ? 1 : lineItems.reduce((acc, it) => acc + it.quantity, 0),
      subtotal: effectiveTotals.combinedSubtotal || 0,
      grandTotal: effectiveTotals.grandTotal || 0,
      summaryLabel: summaryTypeDesc,
      data: payload,
    })

    const snapshotString = serializeSealedUnitSnapshot({
      ...currentSnapshotParams,
      quoteNumber: effectiveQuoteNumber,
    })
    clearTimerAndSaveSnapshot(snapshotString)

    toast.success(`Sealed Unit Quote #${effectiveQuoteNumber} saved directly to database!`)
    return saved
  } catch (err) {
    console.error("Failed to save sealed unit draft to database:", err)
    toast.error("Failed to save draft to database. Please check your connection and try again.")
    return null
  }
}
