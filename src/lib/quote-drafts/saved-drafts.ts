import { QuoteDraftItem, QuoteType } from "./types"

export const SAVED_DRAFTS_STORAGE_KEY = "vwd_saved_quote_drafts_v1"
export const DRAFT_CHANGE_EVENT = "vwd_drafts_updated"

export function notifyDraftChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(DRAFT_CHANGE_EVENT))
  }
}

/**
 * Get all explicitly saved drafts from local storage, deduplicating by ID and quote number.
 */
export function getSavedDrafts(): QuoteDraftItem[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(SAVED_DRAFTS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    const seenIds = new Set<string>()
    const seenQuoteKeys = new Set<string>()
    const deduped: QuoteDraftItem[] = []

    for (const draft of parsed) {
      if (!draft || !draft.id || seenIds.has(draft.id)) continue
      seenIds.add(draft.id)

      const qNum = (draft.quoteNumber || "").trim().toLowerCase()
      if (qNum && qNum !== "untitled") {
        const key = `${draft.type || "window"}:${qNum}`
        if (seenQuoteKeys.has(key)) {
          // Already have a newer version of this quote number
          continue
        }
        seenQuoteKeys.add(key)
      }

      deduped.push(draft)
    }

    return deduped
  } catch (err) {
    console.error("Failed to parse saved drafts:", err)
    return []
  }
}

function upsertDraftInList(
  existingDrafts: QuoteDraftItem[],
  draft: QuoteDraftItem
): QuoteDraftItem[] {
  const qNum = (draft.quoteNumber || "").trim().toLowerCase()
  const otherDrafts = existingDrafts.filter((d) => {
    if (draft.id && d.id === draft.id) return false
    if (
      qNum &&
      qNum !== "untitled" &&
      d.quoteNumber &&
      d.type === draft.type &&
      d.quoteNumber.trim().toLowerCase() === qNum
    ) {
      return false
    }
    return true
  })
  return [draft, ...otherDrafts].slice(0, 50)
}

function createDraftPayload(
  draft: Omit<QuoteDraftItem, "id" | "createdAt" | "updatedAt"> & {
    id?: string
  },
  existingDrafts: QuoteDraftItem[]
): QuoteDraftItem {
  const now = new Date().toISOString()
  const qNum = (draft.quoteNumber || "").trim().toLowerCase()
  const existing = existingDrafts.find((d) => {
    if (draft.id && d.id === draft.id) return true
    if (
      qNum &&
      qNum !== "untitled" &&
      d.quoteNumber &&
      d.type === draft.type &&
      d.quoteNumber.trim().toLowerCase() === qNum
    ) {
      return true
    }
    return false
  })

  const targetId =
    draft.id ||
    existing?.id ||
    `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

  return {
    id: targetId,
    type: draft.type,
    quoteNumber: draft.quoteNumber || "Untitled",
    customerName: draft.customerName || "Unnamed Customer",
    createdAt: existing ? existing.createdAt : now,
    updatedAt: now,
    itemCount: draft.itemCount || 0,
    subtotal: draft.subtotal || 0,
    grandTotal: draft.grandTotal || 0,
    summaryLabel:
      draft.summaryLabel ||
      (draft.type === "window"
        ? "Window Quote"
        : draft.type === "door"
          ? "Door Quote"
          : "Sealed Unit Quote"),
    data: draft.data,
  }
}

/**
 * Save or update a quote draft in the persistent drafts registry.
 * Guarantees that 1 quote is only saved once (updates existing record in-place).
 */
export function saveQuoteDraft(
  draft: Omit<QuoteDraftItem, "id" | "createdAt" | "updatedAt"> & {
    id?: string
  }
): QuoteDraftItem {
  if (typeof window === "undefined") {
    throw new Error("Local storage is not available on server")
  }

  const existingDrafts = getSavedDrafts()
  const fullDraft = createDraftPayload(draft, existingDrafts)
  const trimmed = upsertDraftInList(existingDrafts, fullDraft)

  try {
    localStorage.setItem(SAVED_DRAFTS_STORAGE_KEY, JSON.stringify(trimmed))
    notifyDraftChange()

    // Asynchronously sync to database
    fetch("/api/drafts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fullDraft),
    }).catch(() => {})
  } catch (err) {
    console.error("Failed to save draft to localStorage:", err)
  }

  return fullDraft
}

/**
 * Delete a saved quote draft by ID.
 */
export function deleteQuoteDraft(id: string): void {
  if (typeof window === "undefined") return
  const existingDrafts = getSavedDrafts()
  const target = existingDrafts.find((d) => d.id === id)
  const filtered = existingDrafts.filter((d) => d.id !== id)
  try {
    localStorage.setItem(SAVED_DRAFTS_STORAGE_KEY, JSON.stringify(filtered))
    notifyDraftChange()

    // Delete from database
    const params = new URLSearchParams()
    if (id) params.set("id", id)
    if (target?.quoteNumber) params.set("quoteNumber", target.quoteNumber)
    if (target?.type) params.set("type", target.type)

    fetch(`/api/drafts?${params.toString()}`, { method: "DELETE" }).catch(
      () => {}
    )
  } catch (err) {
    console.error("Failed to delete draft from localStorage:", err)
  }
}

/**
 * Delete all saved quote drafts (or all drafts of a specific type).
 */
export function clearAllQuoteDrafts(type?: QuoteType | "all"): void {
  if (typeof window === "undefined") return
  try {
    if (!type || type === "all") {
      localStorage.removeItem(SAVED_DRAFTS_STORAGE_KEY)
    } else {
      const existingDrafts = getSavedDrafts()
      const remaining = existingDrafts.filter((d) => d.type !== type)
      localStorage.setItem(SAVED_DRAFTS_STORAGE_KEY, JSON.stringify(remaining))
    }
    notifyDraftChange()

    // Asynchronously delete all matching drafts from database
    const param =
      type && type !== "all"
        ? `all=true&type=${encodeURIComponent(type)}`
        : `all=true`
    fetch(`/api/drafts?${param}`, { method: "DELETE" }).catch(() => {})
  } catch (err) {
    console.error("Failed to clear all drafts from localStorage:", err)
  }
}

/**
 * Direct awaited save to MongoDB: uploads to MongoDB first, then upon confirmation
 * updates the persistent saved drafts registry in localStorage and notifies listeners.
 * If the database request fails, throws an error so the quote is NOT saved into the
 * "Saved Quotes" list prematurely.
 */
export async function saveQuoteDraftDirectly(
  draft: Omit<QuoteDraftItem, "id" | "createdAt" | "updatedAt"> & {
    id?: string
  }
): Promise<QuoteDraftItem> {
  if (typeof window === "undefined") {
    throw new Error("Local storage is not available on server")
  }

  const existingDrafts = getSavedDrafts()
  const candidateDraft = createDraftPayload(draft, existingDrafts)

  // 1. Upload to MongoDB FIRST
  const res = await fetch("/api/drafts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(candidateDraft),
  })

  if (!res.ok) {
    throw new Error(
      `Failed to upload quote draft to database (status ${res.status})`
    )
  }

  const result = await res.json()
  const mongoId = result?.draft?._id
    ? String(result.draft._id)
    : result?.draft?.id || candidateDraft.id

  const savedRecord: QuoteDraftItem = {
    ...candidateDraft,
    id: mongoId,
    updatedAt: result?.draft?.updatedAt || candidateDraft.updatedAt,
  }

  // 2. ONLY upon successful database confirmation: update the Saved Quotes registry
  const updatedDrafts = upsertDraftInList(existingDrafts, savedRecord)
  try {
    localStorage.setItem(SAVED_DRAFTS_STORAGE_KEY, JSON.stringify(updatedDrafts))
    notifyDraftChange()
  } catch (err) {
    console.error("Failed to write saved draft to localStorage:", err)
  }

  return savedRecord
}

/**
 * Sync remote database drafts with local storage.
 * Fetches user-owned drafts from MongoDB (single source of truth) and updates local storage.
 */
export async function syncRemoteDrafts(): Promise<QuoteDraftItem[]> {
  if (typeof window === "undefined") return []
  try {
    const res = await fetch("/api/drafts")
    if (!res.ok) return getSavedDrafts()
    const serverDrafts = await res.json()
    if (!Array.isArray(serverDrafts)) return getSavedDrafts()

    const serverDraftItems: QuoteDraftItem[] = serverDrafts.map((d: any) => ({
      id: d._id ? String(d._id) : d.id,
      type: d.type,
      quoteNumber: d.quoteNumber,
      customerName: d.customerName,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      itemCount: d.itemCount,
      subtotal: d.subtotal,
      grandTotal: d.grandTotal,
      summaryLabel: d.summaryLabel,
      data: d.data,
    }))

    // MongoDB is single source of truth: authoritative sync overwrites local storage
    localStorage.setItem(
      SAVED_DRAFTS_STORAGE_KEY,
      JSON.stringify(serverDraftItems.slice(0, 50))
    )
    notifyDraftChange()
    return serverDraftItems
  } catch {
    return getSavedDrafts()
  }
}
