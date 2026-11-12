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
