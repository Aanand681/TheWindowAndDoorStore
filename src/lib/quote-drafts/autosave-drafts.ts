import {
  QuoteType,
  ActiveAutoSaveDraft,
  WindowQuoteDraftPayload,
  SealedUnitQuoteDraftPayload,
  DoorQuoteDraftPayload,
} from "./types"
import { getSavedDrafts } from "./saved-drafts"
import { computeCombinedQuoteFinancials } from "@/lib/calculator/pricing-engine"

export const AUTOSAVE_WINDOW_KEY = "vwd_autosave_window_v1"
export const AUTOSAVE_SEALED_UNIT_KEY = "vwd_autosave_sealed_unit_v1"
export const AUTOSAVE_DOOR_KEY = "vwd_autosave_door_v1"
export const AUTOSAVE_TTL_MS = 8 * 60 * 60 * 1000 // 8 hours in milliseconds

const getAutoSaveKey = (t: QuoteType) =>
  t === "window" ? AUTOSAVE_WINDOW_KEY : t === "sealed_unit" ? AUTOSAVE_SEALED_UNIT_KEY : AUTOSAVE_DOOR_KEY

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
    data: WindowQuoteDraftPayload | SealedUnitQuoteDraftPayload | DoorQuoteDraftPayload
  }
): void {
  if (typeof window === "undefined") return
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
    localStorage.setItem(getAutoSaveKey(type), JSON.stringify(autoSave))
  } catch (err) {
    console.error("Failed to auto-save draft:", err)
  }
}

/**
 * Validates whether an active autosave draft actually contains user-entered content.
 */
export function isDraftMeaningful(type: QuoteType, draft: ActiveAutoSaveDraft): boolean {
  if (!draft || !draft.data) return false
  const custName = (draft.customerName || (draft.data as any).customerName || "").trim()
  if (custName.length > 0) return true

  if (type === "window") {
    const windows = (draft.data as WindowQuoteDraftPayload).windows || []
    return windows.some(
      (w) => (w.base && parseFloat(String(w.base)) > 0) || (w.w && String(w.w).trim() !== "") || (w.h && String(w.h).trim() !== "")
    )
  }

  if (type === "sealed_unit") {
    const suData = draft.data as SealedUnitQuoteDraftPayload
    const lineItems = suData.lineItems || []
    if (lineItems.length > 0) return true
    return suData.sealedUnitMode === "service_only" && Boolean(suData.serviceSqftInput?.trim()) && (parseFloat(suData.serviceSqftInput || "0") || 0) > 0
  }

  if (type === "door") {
    const doorData = draft.data as DoorQuoteDraftPayload
    return (doorData.lineItems || []).length > 0
  }

  return false
}

/**
 * Get active live workspace draft if one exists and contains meaningful content.
 */
export function getActiveAutoSave(type: QuoteType): ActiveAutoSaveDraft | null {
  if (typeof window === "undefined") return null
  const key = getAutoSaveKey(type)
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || !parsed.data) return null

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
  try {
    localStorage.removeItem(getAutoSaveKey(type))
  } catch (err) {
    console.error("Failed to clear auto-save draft:", err)
  }
}

/**
 * Checks if an auto-save payload is already stored in saved drafts.
 */
export function isAutoSaveAlreadySaved(type: QuoteType, autoSave: ActiveAutoSaveDraft | null): boolean {
  if (!autoSave || !autoSave.data) return false
  const savedDrafts = getSavedDrafts()
  return savedDrafts.some((d) => {
    if (d.type !== type) return false
    if (
      d.quoteNumber && d.quoteNumber !== "Draft" && d.quoteNumber !== "Untitled" &&
      d.quoteNumber.trim().toLowerCase() === autoSave.quoteNumber?.trim().toLowerCase()
    ) {
      return true
    }
    return (
      d.customerName && d.customerName.trim().toLowerCase() === (autoSave.customerName || "").trim().toLowerCase() &&
      d.itemCount === autoSave.itemCount && Math.abs(d.grandTotal - autoSave.grandTotal) < 0.05
    )
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
  let currentTotal =
    current.grandTotal > 500 &&
    match.grandTotal > 0 &&
    Math.abs(current.grandTotal / 100 - match.grandTotal) < 0.05
      ? current.grandTotal / 100
      : current.grandTotal

  // If attached door or sealed unit is present, verify combined financials
  if (
    type === "window" &&
    (current.data?.attachedDoorQuote || current.data?.attachedSealedUnit) &&
    Math.abs((match.grandTotal ?? 0) - currentTotal) > 0.05
  ) {
    const combined = computeCombinedQuoteFinancials({
      quoteResult: current.data?.quoteResult,
      afterDiscount: current.data?.subtotal ? Math.round(Number(current.data.subtotal) * 100) : undefined,
      total: Math.round(currentTotal * 100),
      attachedSealedUnit: current.data?.attachedSealedUnit,
      attachedDoorQuote: current.data?.attachedDoorQuote,
      effectiveJC: current.data?.customJC ? Math.round(Number(current.data.customJC) * 100) : undefined,
      effectiveMisc: current.data?.customMisc ? Math.round(Number(current.data.customMisc) * 100) : undefined,
      effectiveLabour: current.data?.customLabour ? Math.round(Number(current.data.customLabour) * 100) : undefined,
      isSupplyOnly: current.data?.isSupplyOnly,
    })
    currentTotal = combined.grandTotalDollars
  }

  // Verify whether attached quotes changed
  const matchDoor = (match.data as any)?.attachedDoorQuote?.quoteNumber || (match.data as any)?.attachedDoorQuote?.id || ""
  const curDoor = current.data?.attachedDoorQuote?.quoteNumber || current.data?.attachedDoorQuote?.id || ""
  const doorChanged = matchDoor !== curDoor

  const matchSU = (match.data as any)?.attachedSealedUnit?.quoteNumber || (match.data as any)?.attachedSealedUnit?.id || ""
  const curSU = current.data?.attachedSealedUnit?.quoteNumber || current.data?.attachedSealedUnit?.id || ""
  const suChanged = matchSU !== curSU

  const totalChanged = Math.abs((match.grandTotal ?? 0) - currentTotal) > 0.05
  const matchCust = (match.customerName || "").trim().toLowerCase()
  const nameChanged = matchCust !== cust && !(matchCust === "unnamed customer" && cust === "")

  if (itemsChanged || totalChanged || nameChanged || doorChanged || suChanged) {
    return true
  }

  // Matches saved quote exactly -> CLEAN
  return false
}
