import { deleteQuoteDraft, getSavedDrafts } from "./saved-drafts"

export interface PurgeSubmittedDraftsParams {
  mainQuoteNumber: string
  mainType: "window" | "door" | "sealed_unit"
  attachedDoorQuote?: any | null
  attachedWindowQuote?: any | null
  attachedSealedUnit?: any | null
}

/**
 * Purges the main quote draft AND any absorbed child quote drafts from both
 * local storage and MongoDB when a quote is submitted or approved.
 */
export function purgeSubmittedDrafts({
  mainQuoteNumber,
  mainType,
  attachedDoorQuote,
  attachedWindowQuote,
  attachedSealedUnit,
}: PurgeSubmittedDraftsParams): void {
  try {
    const quoteNumbersToPurge = new Set<string>([
      mainQuoteNumber.trim().toLowerCase(),
    ])
    if (attachedDoorQuote?.quoteNumber) {
      quoteNumbersToPurge.add(
        String(attachedDoorQuote.quoteNumber).trim().toLowerCase()
      )
    }
    if (attachedWindowQuote?.quoteNumber) {
      quoteNumbersToPurge.add(
        String(attachedWindowQuote.quoteNumber).trim().toLowerCase()
      )
    }
    if (attachedSealedUnit?.quoteNumber) {
      quoteNumbersToPurge.add(
        String(attachedSealedUnit.quoteNumber).trim().toLowerCase()
      )
    }

    const drafts = getSavedDrafts()
    for (const d of drafts) {
      const dn = (d.quoteNumber || "").trim().toLowerCase()
      if (dn && quoteNumbersToPurge.has(dn)) {
        deleteQuoteDraft(d.id)
      }
    }

    fetch(
      `/api/drafts?quoteNumber=${encodeURIComponent(mainQuoteNumber.trim())}&type=${mainType}`,
      { method: "DELETE" }
    ).catch(() => {})

    if (attachedDoorQuote?.quoteNumber) {
      fetch(
        `/api/drafts?quoteNumber=${encodeURIComponent(String(attachedDoorQuote.quoteNumber).trim())}&type=door`,
        { method: "DELETE" }
      ).catch(() => {})
    }
    if (attachedWindowQuote?.quoteNumber) {
      fetch(
        `/api/drafts?quoteNumber=${encodeURIComponent(String(attachedWindowQuote.quoteNumber).trim())}&type=window`,
        { method: "DELETE" }
      ).catch(() => {})
    }
    if (attachedSealedUnit?.quoteNumber) {
      fetch(
        `/api/drafts?quoteNumber=${encodeURIComponent(String(attachedSealedUnit.quoteNumber).trim())}&type=sealed_unit`,
        { method: "DELETE" }
      ).catch(() => {})
    }
  } catch (err) {
    console.error("Failed to purge submitted drafts:", err)
  }
}
