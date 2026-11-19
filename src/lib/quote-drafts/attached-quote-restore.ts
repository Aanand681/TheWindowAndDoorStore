import { QuoteDraftItem, QuoteType } from "./types"
import { getSavedDrafts, saveQuoteDraft } from "./saved-drafts"

/**
 * Re-saves an attached quote payload into the persistent drafts registry
 * so it is immediately restored and visible in Saved Quotes.
 */
export function restoreAttachedQuoteDraft(
  type: QuoteType,
  attachedQuote: any
): QuoteDraftItem {
  if (!attachedQuote) {
    throw new Error("No attached quote provided to restore")
  }

  const existingDrafts = getSavedDrafts()
  const qNum = (attachedQuote.quoteNumber || "").trim().toLowerCase()

  // 1. Check if a draft with this exact quoteNumber or id already exists
  const existing = existingDrafts.find((d) => {
    if (attachedQuote.id && d.id === attachedQuote.id) return true
    if (attachedQuote.draftId && d.id === attachedQuote.draftId) return true
    if (
      qNum &&
      qNum !== "untitled" &&
      d.quoteNumber &&
      d.type === type &&
      d.quoteNumber.trim().toLowerCase() === qNum
    ) {
      return true
    }
    return false
  })

  // If already in drafts and has full payload, return it
  if (existing && existing.data) {
    return existing
  }

  // 2. If raw draft was preserved, save it directly
  if (attachedQuote.rawDraft) {
    return saveQuoteDraft(attachedQuote.rawDraft)
  }

  // 3. Otherwise reconstruct a clean draft payload
  const lineItems =
    attachedQuote.lineItems ||
    attachedQuote.windows ||
    attachedQuote.data?.lineItems ||
    attachedQuote.data?.windows ||
    []

  const subtotal = Number(
    attachedQuote.totals?.subtotalPreTax ??
      attachedQuote.taxTotals?.subtotalPreTax ??
      attachedQuote.subtotal ??
      attachedQuote.totals?.materialsTotal ??
      0
  )

  const grandTotal = Number(
    attachedQuote.totals?.grandTotal ??
      attachedQuote.taxTotals?.grandTotal ??
      attachedQuote.grandTotal ??
      0
  )

  const summaryLabel =
    attachedQuote.summaryLabel ||
    attachedQuote.summarySentence ||
    (type === "door"
      ? "Door Quote"
      : type === "window"
        ? "Window Quote"
        : "Sealed Unit Quote")

  const targetQuoteNumber = attachedQuote.quoteNumber || "Untitled"
  const targetCustomerName = attachedQuote.customerName || "Customer"

  const draftData =
    attachedQuote.data ||
    (type === "door"
      ? {
          lineItems,
          totals: attachedQuote.totals || {},
          taxTotals: attachedQuote.taxTotals || {},
          mode: attachedQuote.mode || (attachedQuote.isSupplyOnly ? "supply_only" : "installation"),
          customerName: targetCustomerName,
          quoteNumber: targetQuoteNumber,
        }
      : type === "sealed_unit"
        ? {
            lineItems,
            totals: attachedQuote.totals || {},
            taxTotals: attachedQuote.taxTotals || {},
            customerName: targetCustomerName,
            quoteNumber: targetQuoteNumber,
          }
        : {
            windows: lineItems,
            taxTotals: attachedQuote.taxTotals || {},
            quoteResult: attachedQuote.quoteResult || {},
            customerName: targetCustomerName,
            quoteNumber: targetQuoteNumber,
          })

  return saveQuoteDraft({
    id: existing?.id || attachedQuote.draftId || attachedQuote.id,
    type,
    quoteNumber: targetQuoteNumber,
    customerName: targetCustomerName,
    itemCount: Array.isArray(lineItems) ? lineItems.length : 1,
    subtotal,
    grandTotal,
    summaryLabel,
    data: draftData,
  })
}
