/**
 * Quote Drafts Storage Engine
 * Handles saving, auto-saving, restoring, and managing multi-quote drafts
 * for both Window Calculator and Sealed Unit Calculator.
 */

export type QuoteType = 'window' | 'sealed_unit' | 'door';

export interface WindowQuoteDraftPayload {
  quoteNumber: string;
  customerName: string;
  quoteNotes: string;
  surchargeRate: number;
  windows: any[];
  activePromoId: string;
  isSupplyOnly: boolean;
  supplyJambId?: string;
  supplyJambRate?: string;
  supplyCasingId?: string;
  supplyCasingRate?: string;
  customJC?: string | number;
  customMisc?: string | number;
  customLabour?: string | number;
  includeJCInPromo?: boolean;
  includeMiscInPromo?: boolean;
  includeLabourInPromo?: boolean;
  hstRate?: number;
  attachedUpgrade?: any;
  attachedSealedUnit?: any;
  attachedDoorQuote?: any;
  wantsUpgrade?: boolean;
  subtotal: number;
  grandTotal: number;
  itemCount: number;
  effectiveBase?: number;
  effectiveSurcharge?: number;
  effectiveLabour?: number;
  effectiveMisc?: number;
  effectiveJC?: number;
  taxTotals?: any;
  quoteResult?: any;
}

export interface SealedUnitQuoteDraftPayload {
  quoteNumber: string;
  customerName: string;
  quoteNotes: string;
  lineItems: any[];
  isInstallation: boolean;
  sealedUnitMode?: 'installation' | 'supply_only' | 'service_only';
  serviceSqftInput?: string;
  serviceLabourRateInput?: string;
  serviceMiscRateInput?: string;
  travelFeeType: 'none' | 'far_std' | 'far_small' | 'custom';
  customTravelFee: string;
  showOutTownTravel: boolean;
  travelKm: string;
  crewHours: string;
  crewSize: '2' | '3';
  hstRate: number;
  attachedWindowQuote?: any;
  attachedDoorQuote?: any;
  wantsUpgrade?: boolean;
  subtotal: number;
  grandTotal: number;
  itemCount: number;
  totals?: any;
}

export interface DoorQuoteDraftPayload {
  quoteNumber: string;
  customerName: string;
  quoteNotes: string;
  mode: 'installation' | 'supply_only' | 'office_reference';
  lineItems: any[];
  globalUpcharges: any[];
  travelFeeType: 'none' | 'local_std' | 'far_std' | 'far_small' | 'custom';
  customTravelFee: string;
  showOutTownTravel: boolean;
  travelKm: string;
  crewHours: string;
  crewSize: '2' | '3';
  isFirstNation: boolean;
  customLabour?: string | number;
  customMisc?: string | number;
  attachedWindowQuote?: any;
  attachedSealedUnit?: any;
  subtotal: number;
  grandTotal: number;
  itemCount: number;
  totals?: any;
}

export interface QuoteDraftItem {
  id: string;
  type: QuoteType;
  quoteNumber: string;
  customerName: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  subtotal: number;
  grandTotal: number;
  summaryLabel: string;
  data: WindowQuoteDraftPayload | SealedUnitQuoteDraftPayload | DoorQuoteDraftPayload;
}

export interface ActiveAutoSaveDraft {
  timestamp: string;
  type: QuoteType;
  quoteNumber: string;
  customerName: string;
  itemCount: number;
  grandTotal: number;
  summaryLabel: string;
  data: WindowQuoteDraftPayload | SealedUnitQuoteDraftPayload | DoorQuoteDraftPayload;
}

const SAVED_DRAFTS_STORAGE_KEY = 'vwd_saved_quote_drafts_v1';
const AUTOSAVE_WINDOW_KEY = 'vwd_autosave_window_v1';
const AUTOSAVE_SEALED_UNIT_KEY = 'vwd_autosave_sealed_unit_v1';
const AUTOSAVE_DOOR_KEY = 'vwd_autosave_door_v1';

export const DRAFT_CHANGE_EVENT = 'vwd_drafts_updated';

function notifyDraftChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DRAFT_CHANGE_EVENT));
  }
}

/**
 * Get all explicitly saved drafts from local storage, deduplicating by ID and quote number.
 */
export function getSavedDrafts(): QuoteDraftItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_DRAFTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const seenIds = new Set<string>();
    const seenQuoteKeys = new Set<string>();
    const deduped: QuoteDraftItem[] = [];

    for (const draft of parsed) {
      if (!draft || !draft.id || seenIds.has(draft.id)) continue;
      seenIds.add(draft.id);

      const qNum = (draft.quoteNumber || '').trim().toLowerCase();
      if (qNum && qNum !== 'untitled') {
        const key = `${draft.type || 'window'}:${qNum}`;
        if (seenQuoteKeys.has(key)) {
          // Already have a newer version of this quote number
          continue;
        }
        seenQuoteKeys.add(key);
      }

      deduped.push(draft);
    }

    return deduped;
  } catch (err) {
    console.error('Failed to parse saved drafts:', err);
    return [];
  }
}

/**
 * Save or update a quote draft in the persistent drafts registry.
 * Guarantees that 1 quote is only saved once (updates existing record in-place).
 */
export function saveQuoteDraft(
  draft: Omit<QuoteDraftItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): QuoteDraftItem {
  if (typeof window === 'undefined') {
    throw new Error('Local storage is not available on server');
  }

  const existingDrafts = getSavedDrafts();
  const now = new Date().toISOString();
  const qNum = (draft.quoteNumber || '').trim().toLowerCase();

  // Find existing draft by ID or by quoteNumber + type to ensure 1 quote is only saved once
  const existingIndex = existingDrafts.findIndex((d) => {
    if (draft.id && d.id === draft.id) return true;
    if (
      qNum &&
      qNum !== 'untitled' &&
      d.quoteNumber &&
      d.type === draft.type &&
      d.quoteNumber.trim().toLowerCase() === qNum
    ) {
      return true;
    }
    return false;
  });

  let targetId = draft.id;
  if (!targetId) {
    if (existingIndex >= 0) {
      targetId = existingDrafts[existingIndex].id;
    } else {
      targetId = `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    }
  }

  const fullDraft: QuoteDraftItem = {
    id: targetId,
    type: draft.type,
    quoteNumber: draft.quoteNumber || 'Untitled',
    customerName: draft.customerName || 'Unnamed Customer',
    createdAt: existingIndex >= 0 ? existingDrafts[existingIndex].createdAt : now,
    updatedAt: now,
    itemCount: draft.itemCount || 0,
    subtotal: draft.subtotal || 0,
    grandTotal: draft.grandTotal || 0,
    summaryLabel: draft.summaryLabel || (draft.type === 'window' ? 'Window Quote' : 'Sealed Unit Quote'),
    data: draft.data,
  };

  // Filter out any other records that had the same ID or same quoteNumber + type
  const otherDrafts = existingDrafts.filter((d, idx) => {
    if (idx === existingIndex) return false;
    if (draft.id && d.id === draft.id) return false;
    if (
      qNum &&
      qNum !== 'untitled' &&
      d.quoteNumber &&
      d.type === draft.type &&
      d.quoteNumber.trim().toLowerCase() === qNum
    ) {
      return false;
    }
    return true;
  });

  // Put the updated or newly created draft at the front
  const updatedDrafts = [fullDraft, ...otherDrafts];

  // Cap at 50 drafts
  const trimmed = updatedDrafts.slice(0, 50);
  try {
    localStorage.setItem(SAVED_DRAFTS_STORAGE_KEY, JSON.stringify(trimmed));
    notifyDraftChange();
  } catch (err) {
    console.error('Failed to save draft to localStorage:', err);
  }

  return fullDraft;
}

/**
 * Delete a saved quote draft by ID.
 */
export function deleteQuoteDraft(id: string): void {
  if (typeof window === 'undefined') return;
  const existingDrafts = getSavedDrafts();
  const filtered = existingDrafts.filter((d) => d.id !== id);
  try {
    localStorage.setItem(SAVED_DRAFTS_STORAGE_KEY, JSON.stringify(filtered));
    notifyDraftChange();
  } catch (err) {
    console.error('Failed to delete draft from localStorage:', err);
  }
}

/**
 * Delete all saved quote drafts (or all drafts of a specific type).
 */
export function clearAllQuoteDrafts(type?: QuoteType | 'all'): void {
  if (typeof window === 'undefined') return;
  try {
    if (!type || type === 'all') {
      localStorage.removeItem(SAVED_DRAFTS_STORAGE_KEY);
    } else {
      const existingDrafts = getSavedDrafts();
      const remaining = existingDrafts.filter((d) => d.type !== type);
      localStorage.setItem(SAVED_DRAFTS_STORAGE_KEY, JSON.stringify(remaining));
    }
    notifyDraftChange();
  } catch (err) {
    console.error('Failed to clear all drafts from localStorage:', err);
  }
}

/**
 * Get a saved quote draft by ID.
 */
export function getQuoteDraftById(id: string): QuoteDraftItem | null {
  const existing = getSavedDrafts();
  return existing.find((d) => d.id === id) || null;
}

/**
 * Save active live workspace draft for crash recovery / lunch break recovery.
 */
export function saveActiveAutoSave(
  type: QuoteType,
  payload: {
    quoteNumber: string;
    customerName: string;
    itemCount: number;
    grandTotal: number;
    summaryLabel: string;
    data: WindowQuoteDraftPayload | SealedUnitQuoteDraftPayload | DoorQuoteDraftPayload;
  }
): void {
  if (typeof window === 'undefined') return;
  const key =
    type === 'window'
      ? AUTOSAVE_WINDOW_KEY
      : type === 'sealed_unit'
      ? AUTOSAVE_SEALED_UNIT_KEY
      : AUTOSAVE_DOOR_KEY;
  const autoSave: ActiveAutoSaveDraft = {
    timestamp: new Date().toISOString(),
    type,
    quoteNumber: payload.quoteNumber,
    customerName: payload.customerName,
    itemCount: payload.itemCount,
    grandTotal: payload.grandTotal,
    summaryLabel: payload.summaryLabel,
    data: payload.data,
  };

  try {
    localStorage.setItem(key, JSON.stringify(autoSave));
  } catch (err) {
    console.error('Failed to auto-save draft:', err);
  }
}

/**
 * Validates whether an active autosave draft actually contains user-entered content.
 * Prevents phantom "Unsaved Session" prompts when the user hasn't entered any items or values.
 */
function isDraftMeaningful(type: QuoteType, draft: ActiveAutoSaveDraft): boolean {
  if (!draft || !draft.data) return false;
  const custName = (draft.customerName || (draft.data as any).customerName || '').trim();
  if (custName.length > 0) return true;

  if (type === 'window') {
    const windows = (draft.data as WindowQuoteDraftPayload).windows || [];
    return windows.some(
      (w) =>
        (w.base && parseFloat(w.base) > 0) ||
        (w.w && w.w.trim() !== '') ||
        (w.h && w.h.trim() !== '')
    );
  }

  if (type === 'sealed_unit') {
    const suData = draft.data as SealedUnitQuoteDraftPayload;
    const lineItems = suData.lineItems || [];
    if (lineItems.length > 0) return true;
    if (suData.sealedUnitMode === 'service_only' && suData.serviceSqftInput?.trim()) {
      return (parseFloat(suData.serviceSqftInput) || 0) > 0;
    }
    return false;
  }

  if (type === 'door') {
    const doorData = draft.data as DoorQuoteDraftPayload;
    const lineItems = doorData.lineItems || [];
    return lineItems.length > 0;
  }

  return false;
}

/**
 * Get active live workspace draft if one exists and contains meaningful content.
 */
export function getActiveAutoSave(type: QuoteType): ActiveAutoSaveDraft | null {
  if (typeof window === 'undefined') return null;
  const key =
    type === 'window'
      ? AUTOSAVE_WINDOW_KEY
      : type === 'sealed_unit'
      ? AUTOSAVE_SEALED_UNIT_KEY
      : AUTOSAVE_DOOR_KEY;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.data) return null;
    if (!isDraftMeaningful(type, parsed)) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed;
  } catch (err) {
    console.error('Failed to get auto-save draft:', err);
    return null;
  }
}

/**
 * Clear the active auto-saved draft (e.g. after deliberate reset or submission).
 */
export function clearActiveAutoSave(type: QuoteType): void {
  if (typeof window === 'undefined') return;
  const key =
    type === 'window'
      ? AUTOSAVE_WINDOW_KEY
      : type === 'sealed_unit'
      ? AUTOSAVE_SEALED_UNIT_KEY
      : AUTOSAVE_DOOR_KEY;
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Failed to clear auto-save draft:', err);
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
  if (!autoSave || !autoSave.data) return false;
  const savedDrafts = getSavedDrafts();
  return savedDrafts.some((d) => {
    if (d.type !== type) return false;
    // Check quote number match (if not generic default)
    if (
      d.quoteNumber &&
      d.quoteNumber !== 'Draft' &&
      d.quoteNumber !== 'Untitled' &&
      d.quoteNumber.trim().toLowerCase() === autoSave.quoteNumber?.trim().toLowerCase()
    ) {
      return true;
    }
    // Check customer name + itemCount + grandTotal match
    if (
      d.customerName &&
      d.customerName.trim().toLowerCase() === (autoSave.customerName || '').trim().toLowerCase() &&
      d.itemCount === autoSave.itemCount &&
      Math.abs(d.grandTotal - autoSave.grandTotal) < 0.05
    ) {
      return true;
    }
    return false;
  });
}

