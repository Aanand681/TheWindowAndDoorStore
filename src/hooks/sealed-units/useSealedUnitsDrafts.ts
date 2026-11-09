'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  saveQuoteDraft,
  getSavedDrafts,
  QuoteDraftItem,
  DRAFT_CHANGE_EVENT,
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
  WorkspaceSetters,
} from './sealed-units-storage-helpers';
import { useSealedUnitsAutoSave } from './useSealedUnitsAutoSave';

export interface SealedUnitFormInputs {
  sealedUnitMode: 'installation' | 'supply_only' | 'service_only';
  isInstallation: boolean;
  isServiceOnly: boolean;
  serviceSqftInput: string;
  serviceLabourRateInput: string;
  serviceMiscRateInput: string;
  travelFeeType: 'none' | 'far_std' | 'far_small' | 'custom';
  customTravelFee: string;
  showOutTownTravel: boolean;
  travelKm: string;
  crewHours: string;
  crewSize: '2' | '3';
  hstRate: number;
}

export interface SealedUnitFormSetters {
  setSealedUnitMode: (mode: 'installation' | 'supply_only' | 'service_only') => void;
  setIsInstallation: (val: boolean) => void;
  setServiceSqftInput: (val: string) => void;
  setServiceLabourRateInput: (val: string) => void;
  setServiceMiscRateInput: (val: string) => void;
  setTravelFeeType: (val: 'none' | 'far_std' | 'far_small' | 'custom') => void;
  setCustomTravelFee: (val: string) => void;
  setShowOutTownTravel: (val: boolean) => void;
  setTravelKm: (val: string) => void;
  setCrewHours: (val: string) => void;
  setCrewSize: (val: '2' | '3') => void;
  setHstRate: (val: number) => void;
}

interface UseSealedUnitsDraftsProps {
  lineItems: SealedUnitLineItem[];
  setLineItems: React.Dispatch<React.SetStateAction<SealedUnitLineItem[]>>;
  formInputs: SealedUnitFormInputs;
  formSetters: SealedUnitFormSetters;
  totals: SealedUnitTotals;
}

export function useSealedUnitsDrafts(props: UseSealedUnitsDraftsProps) {
  const { lineItems, setLineItems, formInputs, formSetters, totals } = props;
  const {
    sealedUnitMode,
    isInstallation,
    isServiceOnly,
    serviceSqftInput,
    serviceLabourRateInput,
    serviceMiscRateInput,
    travelFeeType,
    customTravelFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
    hstRate,
  } = formInputs;

  const router = useRouter();
  const generateQuoteNumber = () => Math.floor(100000 + Math.random() * 900000).toString();

  const [quoteNumber, setQuoteNumber] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [quoteNotes, setQuoteNotes] = useState<string>('');

  const [isSavedQuotesOpen, setIsSavedQuotesOpen] = useState<boolean>(false);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState<boolean>(false);
  const [attachedWindowQuote, setAttachedWindowQuote] = useState<any | null>(null);
  const [attachedDoorQuote, setAttachedDoorQuote] = useState<any | null>(null);
  const [savedDraftsCount, setSavedDraftsCount] = useState<number>(0);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  const setters: WorkspaceSetters = useMemo(
    () => ({
      setQuoteNumber,
      setCustomerName,
      setQuoteNotes,
      setLineItems,
      setAttachedWindowQuote,
      setAttachedDoorQuote,
      ...formSetters,
    }),
    [setLineItems, formSetters]
  );

  const currentSnapshotParams = useMemo(
    () => ({
      quoteNumber,
      customerName,
      lineItems,
      sealedUnitMode,
      isInstallation,
      serviceSqftInput,
      serviceLabourRateInput,
      serviceMiscRateInput,
      travelFeeType,
      customTravelFee,
      showOutTownTravel,
      travelKm,
      crewHours,
      crewSize,
      hstRate,
      attachedWindowQuote,
      attachedDoorQuote,
    }),
    [
      quoteNumber,
      customerName,
      lineItems,
      sealedUnitMode,
      isInstallation,
      serviceSqftInput,
      serviceLabourRateInput,
      serviceMiscRateInput,
      travelFeeType,
      customTravelFee,
      showOutTownTravel,
      travelKm,
      crewHours,
      crewSize,
      hstRate,
      attachedWindowQuote,
      attachedDoorQuote,
    ]
  );

  const loadDraftIntoWorkspace = useCallback(
    (draft: QuoteDraftItem) => {
      if (draft.type === 'window') {
        router.push(`/calculator?loadDraftId=${draft.id}`);
        return;
      }

      const d = draft.data as any;
      if (!d) return;

      applyDraftDataToWorkspace(d, setters);
      toast.success(`Loaded Sealed Unit Quote #${draft.quoteNumber}`);
    },
    [router, setters]
  );

  const autoSave = useSealedUnitsAutoSave({
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
  });

  const handleSaveDraft = useCallback(() => {
    const hasMeaningfulContent =
      lineItems.length > 0 ||
      (isServiceOnly && ((totals.totalSqft || 0) > 0 || serviceSqftInput.trim() !== '')) ||
      Boolean(attachedWindowQuote) ||
      Boolean(attachedDoorQuote);

    if (!hasMeaningfulContent) {
      toast.error('Add at least one sealed unit, service sqft, or attach a quote before saving.');
      return;
    }

    if (!customerName.trim()) {
      toast.error('Customer name is required before saving a quote.');
      return;
    }

    const effectiveQuoteNumber = quoteNumber.trim() || generateQuoteNumber();
    if (!quoteNumber.trim()) {
      setQuoteNumber(effectiveQuoteNumber);
    }

    const panesCount = lineItems
      .map((l) => `${l.paneType === 'triple' ? 'Triple' : 'Dual'} Pane`)
      .slice(0, 3)
      .join(', ');
    const summaryTypeDesc = isServiceOnly
      ? getSealedUnitServiceSummaryLabel(lineItems, totals.totalSqft)
      : lineItems.length > 0
      ? `${lineItems.length} Sealed Units (${panesCount}${lineItems.length > 3 ? '...' : ''})`
      : '0 Sealed Units';

    const payload = createDraftSavePayload({
      ...currentSnapshotParams,
      quoteNumber: effectiveQuoteNumber,
      quoteNotes,
      totals,
    });

    saveQuoteDraft({
      type: 'sealed_unit',
      quoteNumber: effectiveQuoteNumber,
      customerName: customerName.trim() || 'Unnamed Customer',
      itemCount: isServiceOnly && lineItems.length === 0 ? 1 : lineItems.reduce((acc, it) => acc + it.quantity, 0),
      subtotal: totals.subtotalPreTax || 0,
      grandTotal: totals.grandTotal || 0,
      summaryLabel: summaryTypeDesc,
      data: payload,
    });

    const snapshotString = serializeSealedUnitSnapshot({
      ...currentSnapshotParams,
      quoteNumber: effectiveQuoteNumber,
    });
    autoSave.clearTimerAndSaveSnapshot(snapshotString);

    toast.success(`Sealed Unit Quote #${effectiveQuoteNumber} saved to drafts!`);
  }, [
    lineItems,
    isServiceOnly,
    totals,
    attachedWindowQuote,
    attachedDoorQuote,
    customerName,
    quoteNumber,
    currentSnapshotParams,
    quoteNotes,
    autoSave,
  ]);

  useEffect(() => {
    const updateCount = () => {
      const all = getSavedDrafts();
      setSavedDraftsCount(all.filter((d) => d.type === 'sealed_unit').length);
    };
    updateCount();
    window.addEventListener(DRAFT_CHANGE_EVENT, updateCount);
    return () => window.removeEventListener(DRAFT_CHANGE_EVENT, updateCount);
  }, []);

  const handleResetWorkspace = () => {
    setLineItems([]);
    setAttachedWindowQuote(null);
    setAttachedDoorQuote(null);
    setCustomerName('');
    setQuoteNumber(generateQuoteNumber());
    setQuoteNotes('');
    setShowResetModal(false);
    autoSave.clearTimerAndSaveSnapshot('');
    autoSave.setLastSavedAt(null);
    toast.success('Sealed Unit quote reset. Workspace is fresh and ready.');
  };

  return {
    quoteNumber,
    setQuoteNumber,
    generateQuoteNumber,
    customerName,
    setCustomerName,
    quoteNotes,
    setQuoteNotes,
    isSavedQuotesOpen,
    setIsSavedQuotesOpen,
    isAttachModalOpen,
    setIsAttachModalOpen,
    attachedWindowQuote,
    setAttachedWindowQuote,
    attachedDoorQuote,
    setAttachedDoorQuote,
    savedDraftsCount,
    lastSavedAt: autoSave.lastSavedAt,
    showResetModal,
    setShowResetModal,
    loadDraftIntoWorkspace,
    handleSaveDraft,
    handleResetWorkspace,
  };
}
