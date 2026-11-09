import { QuoteDraftItem, QuoteType } from './types';

export const SAVED_DRAFTS_STORAGE_KEY = 'vwd_saved_quote_drafts_v1';
export const DRAFT_CHANGE_EVENT = 'vwd_drafts_updated';

export function notifyDraftChange() {
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

