import {
  QuoteType,
  ActiveAutoSaveDraft,
  WindowQuoteDraftPayload,
  SealedUnitQuoteDraftPayload,
  DoorQuoteDraftPayload,
} from "./types"
import { getSavedDrafts } from "./saved-drafts"

export const AUTOSAVE_WINDOW_KEY = "vwd_autosave_window_v1"
export const AUTOSAVE_SEALED_UNIT_KEY = "vwd_autosave_sealed_unit_v1"
export const AUTOSAVE_DOOR_KEY = "vwd_autosave_door_v1"
export const AUTOSAVE_TTL_MS = 8 * 60 * 60 * 1000 // 8 hours in milliseconds

/**
 * Save active live workspace draft for crash recovery / lunch break recovery.
 */
export function saveActiveAutoSave(
  type: QuoteType,
  payload: {
    quoteNumber: string
    customerName: string
    itemCount: number
    grandTotal: number
    summaryLabel: string
    data:
      | WindowQuoteDraftPayload
      | SealedUnitQuoteDraftPayload
      | DoorQuoteDraftPayload
  }
): void {
  if (typeof window === "undefined") return
  const key =
    type === "window"
      ? AUTOSAVE_WINDOW_KEY
      : type === "sealed_unit"
        ? AUTOSAVE_SEALED_UNIT_KEY
        : AUTOSAVE_DOOR_KEY
  const autoSave: ActiveAutoSaveDraft = {
    timestamp: new Date().toISOString(),
    type,
    quoteNumber: payload.quoteNumber,
    customerName: payload.customerName,
    itemCount: payload.itemCount,
    grandTotal: payload.grandTotal,
    summaryLabel: payload.summaryLabel,
    data: payload.data,
  }

  try {
    localStorage.setItem(key, JSON.stringify(autoSave))
  } catch (err) {
    console.error("Failed to auto-save draft:", err)
  }
}

/**
 * Validates whether an active autosave draft actually contains user-entered content.
 * Prevents phantom "Unsaved Session" prompts when the user hasn't entered any items or values.
 */
export function isDraftMeaningful(
  type: QuoteType,
  draft: ActiveAutoSaveDraft
): boolean {
  if (!draft || !draft.data) return false
  const custName = (
    draft.customerName ||
    (draft.data as any).customerName ||
    ""
  ).trim()
  if (custName.length > 0) return true

  if (type === "window") {
    const windows = (draft.data as WindowQuoteDraftPayload).windows || []
    return windows.some(
      (w) =>
        (w.base && parseFloat(String(w.base)) > 0) ||
        (w.w && String(w.w).trim() !== "") ||
        (w.h && String(w.h).trim() !== "")
    )
  }

  if (type === "sealed_unit") {
    const suData = draft.data as SealedUnitQuoteDraftPayload
    const lineItems = suData.lineItems || []
    if (lineItems.length > 0) return true
    if (
      suData.sealedUnitMode === "service_only" &&
      suData.serviceSqftInput?.trim()
    ) {
      return (parseFloat(suData.serviceSqftInput) || 0) > 0
    }
    return false
  }

  if (type === "door") {
    const doorData = draft.data as DoorQuoteDraftPayload
    const lineItems = doorData.lineItems || []
    return lineItems.length > 0
  }

  return false
}

/**
 * Get active live workspace draft if one exists and contains meaningful content.
 */
export function getActiveAutoSave(type: QuoteType): ActiveAutoSaveDraft | null {
  if (typeof window === "undefined") return null
  const key =
    type === "window"
      ? AUTOSAVE_WINDOW_KEY
      : type === "sealed_unit"
        ? AUTOSAVE_SEALED_UNIT_KEY
        : AUTOSAVE_DOOR_KEY
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !parsed.data) return null

    // 8-hour TTL expiration check: purge stale drafts from browser memory
    if (parsed.timestamp) {
      const ageMs = Date.now() - new Date(parsed.timestamp).getTime()
      if (isNaN(ageMs) || ageMs > AUTOSAVE_TTL_MS) {
        localStorage.removeItem(key)
        return null
      }
    }

    if (!isDraftMeaningful(type, parsed)) {
      localStorage.removeItem(key)
      return null
    }
    return parsed
  } catch (err) {
    console.error("Failed to get auto-save draft:", err)
    return null
  }
}

/**
 * Clear the active auto-saved draft (e.g. after deliberate reset or submission).
 */
export function clearActiveAutoSave(type: QuoteType): void {
  if (typeof window === "undefined") return
  const key =
    type === "window"
      ? AUTOSAVE_WINDOW_KEY
      : type === "sealed_unit"
        ? AUTOSAVE_SEALED_UNIT_KEY
        : AUTOSAVE_DOOR_KEY
  try {
    localStorage.removeItem(key)
  } catch (err) {
    console.error("Failed to clear auto-save draft:", err)
  }
}

/**
 * Checks if an auto-save payload is already stored in saved drafts.
 * Prevents false "Unsaved Quote Recovered" alerts when the user has already explicitly saved the quote.
 */
export function isAutoSaveAlreadySaved(
  type: QuoteType,
  autoSave: ActiveAutoSaveDraft | null
): boolean {
  if (!autoSave || !autoSave.data) return false
  const savedDrafts = getSavedDrafts()
  return savedDrafts.some((d) => {
    if (d.type !== type) return false
    // Check quote number match (if not generic default)
    if (
      d.quoteNumber &&
      d.quoteNumber !== "Draft" &&
      d.quoteNumber !== "Untitled" &&
      d.quoteNumber.trim().toLowerCase() ===
        autoSave.quoteNumber?.trim().toLowerCase()
    ) {
      return true
    }
    // Check customer name + itemCount + grandTotal match
    if (
      d.customerName &&
      d.customerName.trim().toLowerCase() ===
        (autoSave.customerName || "").trim().toLowerCase() &&
      d.itemCount === autoSave.itemCount &&
      Math.abs(d.grandTotal - autoSave.grandTotal) < 0.05
    ) {
      return true
    }
    return false
  })
}

/**
 * Checks if the current workspace has meaningful unsaved changes compared to the persisted database/local drafts.
 * If the workspace is empty or already matches a saved quote, returns false (clean).
 * If there are unsaved edits, returns true (dirty).
 */
export function isWorkspaceDirtyOrUnsaved(
  type: QuoteType,
  current: {
    id?: string
    quoteNumber?: string
    customerName?: string
    itemCount: number
    grandTotal: number
    data?: any
  }
): boolean {
  if (!current) return false

  const cust = (current.customerName || "").trim().toLowerCase()
  const qNum = (current.quoteNumber || "").trim().toLowerCase()

  // 1. If customerName and items are completely empty, workspace is fresh/clean
  if (type === "window") {
    const windows = (current.data?.windows || []) as any[]
    const hasMeaningfulWindows = windows.some(
      (w) =>
        (w.base && parseFloat(String(w.base)) > 0) ||
        (w.w && String(w.w).trim() !== "") ||
        (w.h && String(w.h).trim() !== "")
    )
    const hasAttached = Boolean(
      current.data?.attachedSealedUnit ||
        current.data?.attachedDoorQuote ||
        current.data?.attachedUpgrade
    )
    if (!cust && !hasMeaningfulWindows && !hasAttached) {
      return false
    }
  } else if (type === "door") {
    const lineItems = (current.data?.lineItems || []) as any[]
    const hasAttached = Boolean(
      current.data?.attachedWindowQuote ||
        current.data?.attachedSealedUnit
    )
    if (!cust && lineItems.length === 0 && !hasAttached) {
      return false
    }
  } else if (type === "sealed_unit") {
    const lineItems = (current.data?.lineItems || []) as any[]
    const hasAttached = Boolean(
      current.data?.attachedWindowQuote ||
        current.data?.attachedDoorQuote
    )
    if (!cust && lineItems.length === 0 && !hasAttached) {
      return false
    }
  }

  // 2. Look for matching saved draft (prefer explicit loadedDraftId if present)
  const savedDrafts = getSavedDrafts()
  let match = current.id ? savedDrafts.find((d) => d.id === current.id) : undefined
  if (!match) {
    match = savedDrafts.find((d) => {
      if (d.type !== type) return false
      if (
        qNum &&
        qNum !== "draft" &&
        qNum !== "untitled" &&
        (d.quoteNumber || "").trim().toLowerCase() === qNum
      ) {
        return true
      }
      if (cust && (d.customerName || "").trim().toLowerCase() === cust) {
        return true
      }
      return false
    })
  }

  if (!match) {
    // Meaningful content entered, but not saved -> DIRTY
    return true
  }

  // 3. Verify if content was modified since it was saved
  const itemsChanged = (match.itemCount ?? 0) !== current.itemCount

  // Normalize cents vs dollars (e.g. if current grandTotal is passed in cents)
  const currentTotal =
    current.grandTotal > 500 &&
    match.grandTotal > 0 &&
    Math.abs(current.grandTotal / 100 - match.grandTotal) < 0.05
      ? current.grandTotal / 100
      : current.grandTotal

  const totalChanged =
    Math.abs((match.grandTotal ?? 0) - currentTotal) > 0.05
  const nameChanged = (match.customerName || "").trim().toLowerCase() !== cust

  if (itemsChanged || totalChanged || nameChanged) {
    return true
  }

  // Matches saved quote exactly -> CLEAN
  return false
}
