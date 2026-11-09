'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  saveActiveAutoSave,
  getActiveAutoSave,
  clearActiveAutoSave,
  getSavedDrafts,
} from '@/lib/quote-drafts-storage';
import {
  SealedUnitLineItem,
  getSealedUnitServiceSummaryLabel,
} from '@/lib/sealed-units-logic';
import { SealedUnitTotals } from '@/components/sealed-units/invoice/types';
import {
  serializeSealedUnitSnapshot,
  applyDraftDataToWorkspace,
  createDraftSavePayload,
  SealedUnitSnapshotParams,
  WorkspaceSetters,
} from './sealed-units-storage-helpers';

interface UseSealedUnitsAutoSaveProps {
  currentSnapshotParams: SealedUnitSnapshotParams;
  quoteNotes: string;
  totals: SealedUnitTotals;
  lineItems: SealedUnitLineItem[];
  isServiceOnly: boolean;
  serviceSqftInput: string;
  attachedWindowQuote: any;
  attachedDoorQuote: any;
  setters: WorkspaceSetters;
  loadDraftIntoWorkspace: (draft: any) => void;
}

export function useSealedUnitsAutoSave({
  currentSnapshotParams,
  quoteNotes,
  totals,
  lineItems,
  isServiceOnly,
  serviceSqftInput,
  attachedWindowQuote,
  attachedDoorQuote,
  setters,
  loadDraftIntoWorkspace,
}: UseSealedUnitsAutoSaveProps) {
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const lastSavedSnapshotRef = useRef<string>('');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const restoreAutoSaveIntoWorkspace = useCallback(
    (recovered: any) => {
      const d = recovered.data as any;
      if (!d) return;

      applyDraftDataToWorkspace(d, setters);
      if (recovered.timestamp) {
        setLastSavedAt(new Date(recovered.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    },
    [setters]
  );

  // Check URL query param and auto-save on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const draftId = urlParams.get('loadDraftId');
      if (draftId) {
        const allDrafts = getSavedDrafts();
        const match = allDrafts.find((d) => d.id === draftId);
        if (match && match.type === 'sealed_unit') {
          loadDraftIntoWorkspace(match);
          window.history.replaceState({}, '', '/sealed-units');
          return;
        }
      }
    }

    const recovered = getActiveAutoSave('sealed_unit');
    if (recovered && recovered.data && (recovered.itemCount > 0 || recovered.customerName)) {
      restoreAutoSaveIntoWorkspace(recovered);
    }
  }, [loadDraftIntoWorkspace, restoreAutoSaveIntoWorkspace]);

  // Debounced auto-save effect
  useEffect(() => {
    const hasMeaningfulContent =
      lineItems.length > 0 ||
      (isServiceOnly && (serviceSqftInput.trim() !== '' || (totals.totalSqft || 0) > 0)) ||
      Boolean(attachedWindowQuote) ||
      Boolean(attachedDoorQuote);

    if (!hasMeaningfulContent) {
      clearActiveAutoSave('sealed_unit');
      return;
    }

    const currentSnapshot = serializeSealedUnitSnapshot(currentSnapshotParams);
    if (currentSnapshot === lastSavedSnapshotRef.current) {
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      const summaryLabel = isServiceOnly
        ? getSealedUnitServiceSummaryLabel(lineItems, totals.totalSqft)
        : `${lineItems.length} Sealed Units`;

      const payload = createDraftSavePayload({
        ...currentSnapshotParams,
        quoteNotes,
        totals,
      });

      saveActiveAutoSave('sealed_unit', {
        quoteNumber: currentSnapshotParams.quoteNumber || 'Draft',
        customerName: currentSnapshotParams.customerName || '',
        itemCount: isServiceOnly ? ((totals.totalSqft || 0) > 0 ? 1 : 0) : lineItems.length,
        grandTotal: totals.grandTotal || 0,
        summaryLabel,
        data: payload,
      });
      setLastSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [
    lineItems,
    isServiceOnly,
    serviceSqftInput,
    totals,
    attachedWindowQuote,
    attachedDoorQuote,
    currentSnapshotParams,
    quoteNotes,
  ]);

  const clearTimerAndSaveSnapshot = (snapshotString: string) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    clearActiveAutoSave('sealed_unit');
    lastSavedSnapshotRef.current = snapshotString;
  };

  return {
    lastSavedAt,
    setLastSavedAt,
    clearTimerAndSaveSnapshot,
  };
}

