/**
 * Quote Drafts Storage Engine
 * Handles saving, auto-saving, restoring, and managing multi-quote drafts
 * for both Window Calculator and Sealed Unit Calculator.
 */

export type QuoteType = 'window' | 'sealed_unit';

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
  customJC?: number;
  customMisc?: number;
  customLabour?: number;
  includeJCInPromo?: boolean;
  includeMiscInPromo?: boolean;
  includeLabourInPromo?: boolean;
  hstRate?: number;
  attachedUpgrade?: any;
  subtotal: number;
  grandTotal: number;
  itemCount: number;
}

export interface SealedUnitQuoteDraftPayload {
  quoteNumber: string;
  customerName: string;
  quoteNotes: string;
  lineItems: any[];
  isInstallation: boolean;
  travelFeeType: 'none' | 'far_std' | 'far_small' | 'custom';
  customTravelFee: string;
  showOutTownTravel: boolean;
  travelKm: string;
  crewHours: string;
  crewSize: '2' | '3';
  hstRate: number;
  subtotal: number;
  grandTotal: number;
  itemCount: number;
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
  data: WindowQuoteDraftPayload | SealedUnitQuoteDraftPayload;
}

export interface ActiveAutoSaveDraft {
  timestamp: string;
  type: QuoteType;
  quoteNumber: string;
  customerName: string;
  itemCount: number;
  grandTotal: number;
  summaryLabel: string;
  data: WindowQuoteDraftPayload | SealedUnitQuoteDraftPayload;
}

const SAVED_DRAFTS_STORAGE_KEY = 'vwd_saved_quote_drafts_v1';
const AUTOSAVE_WINDOW_KEY = 'vwd_autosave_window_v1';
const AUTOSAVE_SEALED_UNIT_KEY = 'vwd_autosave_sealed_unit_v1';

export const DRAFT_CHANGE_EVENT = 'vwd_drafts_updated';

function notifyDraftChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DRAFT_CHANGE_EVENT));
  }
}

/**
 * Get all explicitly saved drafts from local storage.
 */
export function getSavedDrafts(): QuoteDraftItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_DRAFTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse saved drafts:', err);
    return [];
  }
}

/**
 * Save or update a quote draft in the persistent drafts registry.
 */
export function saveQuoteDraft(
  draft: Omit<QuoteDraftItem, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): QuoteDraftItem {
  if (typeof window === 'undefined') {
    throw new Error('Local storage is not available on server');
  }

  const existingDrafts = getSavedDrafts();
  const now = new Date().toISOString();

  let targetId = draft.id;
  if (!targetId) {
    targetId = `draft_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  }

  const existingIndex = existingDrafts.findIndex((d) => d.id === targetId);

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

  if (existingIndex >= 0) {
    existingDrafts[existingIndex] = fullDraft;
  } else {
    // Put newest first
    existingDrafts.unshift(fullDraft);
  }

  // Cap at 50 drafts
  const trimmed = existingDrafts.slice(0, 50);
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
    data: WindowQuoteDraftPayload | SealedUnitQuoteDraftPayload;
  }
): void {
  if (typeof window === 'undefined') return;
  const key = type === 'window' ? AUTOSAVE_WINDOW_KEY : AUTOSAVE_SEALED_UNIT_KEY;
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
 * Get active live workspace draft if one exists.
 */
export function getActiveAutoSave(type: QuoteType): ActiveAutoSaveDraft | null {
  if (typeof window === 'undefined') return null;
  const key = type === 'window' ? AUTOSAVE_WINDOW_KEY : AUTOSAVE_SEALED_UNIT_KEY;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.data) return null;
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
  const key = type === 'window' ? AUTOSAVE_WINDOW_KEY : AUTOSAVE_SEALED_UNIT_KEY;
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

