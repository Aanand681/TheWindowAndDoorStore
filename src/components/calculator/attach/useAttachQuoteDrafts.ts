'use client';

import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  getSavedDrafts,
  QuoteDraftItem,
  QuoteType,
  DRAFT_CHANGE_EVENT,
} from '@/lib/quote-drafts-storage';
import {
  calculateSealedUnitTotals,
  formatSealedUnitSummarySentence,
  getSealedUnitServiceSummaryLabel,
} from '@/lib/sealed-units-logic';
import { formatWindowSummarySentence } from '@/hooks/useCalculatorWindows';
import { formatDoorSummarySentence } from '@/lib/doors/calculations';

export interface UseAttachQuoteDraftsProps {
  isOpen: boolean;
  currentQuoteType?: QuoteType;
  attachedWindowQuote?: any | null;
  attachedSealedUnit?: any | null;
  attachedDoorQuote?: any | null;
  onAttachWindow?: (data: any) => void;
  onAttachSealedUnit?: (data: any) => void;
  onAttachDoor?: (data: any) => void;
  onAttach?: (data: any) => void;
}

export function useAttachQuoteDrafts({
  isOpen,
  currentQuoteType = 'window',
  attachedWindowQuote,
  attachedSealedUnit,
  attachedDoorQuote,
  onAttachWindow,
  onAttachSealedUnit,
  onAttachDoor,
  onAttach,
}: UseAttachQuoteDraftsProps) {
  const [drafts, setDrafts] = useState<QuoteDraftItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'window' | 'sealed_unit' | 'door'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadDrafts = () => {
    const all = getSavedDrafts();
    setDrafts(all.filter((d) => d.type !== currentQuoteType));
  };

  useEffect(() => {
    if (isOpen) {
      loadDrafts();
      setSearchQuery('');
      setActiveTab('all');
    }
  }, [isOpen, currentQuoteType]);

  useEffect(() => {
    window.addEventListener(DRAFT_CHANGE_EVENT, loadDrafts);
    return () => window.removeEventListener(DRAFT_CHANGE_EVENT, loadDrafts);
  }, [currentQuoteType]);

  const filteredDrafts = useMemo(() => {
    let list = drafts;
    if (activeTab !== 'all') {
      list = list.filter((d) => d.type === activeTab);
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (d) =>
        d.quoteNumber?.toLowerCase().includes(q) ||
        d.customerName?.toLowerCase().includes(q) ||
        d.summaryLabel?.toLowerCase().includes(q)
    );
  }, [drafts, activeTab, searchQuery]);

  const windowDraftsCount = useMemo(
    () => drafts.filter((d) => d.type === 'window').length,
    [drafts]
  );
  const sealedUnitCount = useMemo(
    () => drafts.filter((d) => d.type === 'sealed_unit').length,
    [drafts]
  );
  const doorCount = useMemo(
    () => drafts.filter((d) => d.type === 'door').length,
    [drafts]
  );

  const isDraftAttached = (draft: QuoteDraftItem) => {
    if (draft.type === 'window') {
      return attachedWindowQuote?.quoteNumber === draft.quoteNumber;
    }
    if (draft.type === 'sealed_unit') {
      return attachedSealedUnit?.quoteNumber === draft.quoteNumber;
    }
    if (draft.type === 'door') {
      return attachedDoorQuote?.quoteNumber === draft.quoteNumber;
    }
    return false;
  };

  const handleAttachItem = (draft: QuoteDraftItem) => {
    const rawData = (draft.data as any) || {};

    if (draft.type === 'door') {
      const lineItems = rawData.lineItems || [];
      const doorSentence = formatDoorSummarySentence(lineItems);
      const payload = {
        quoteNumber: draft.quoteNumber,
        customerName: draft.customerName,
        itemCount: draft.itemCount,
        type: 'door',
        lineItems,
        summaryLabel: doorSentence,
        summarySentence: doorSentence,
        totals: rawData.totals || {
          grandTotal: draft.grandTotal,
          subtotalPreTax: draft.subtotal,
          rawDoorBaseTotal: draft.subtotal,
          stormDoorTotal: 0,
          hardwareTotal: 0,
          materialsTotal: draft.subtotal,
          combinedLabourTotal: 0,
          miscTotal: 0,
          surchargeTotal: 0,
          discountTotal: 0,
          hstAmount: draft.grandTotal - draft.subtotal,
          depositAmount: Math.round(draft.grandTotal * 0.5 * 100) / 100,
        },
        isInstallation: rawData.mode === 'installation',
        globalUpcharges: rawData.globalUpcharges || [],
        hstRate: rawData.isFirstNation ? 8 : 13,
      };

      if (onAttachDoor) onAttachDoor(payload);
      else if (onAttach) onAttach(payload);
      toast.success(`Attached Door Quote #${draft.quoteNumber}!`);
    } else if (draft.type === 'sealed_unit') {
      const lineItems = rawData.lineItems || (draft as any).lineItems || [];
      const calculatedTotals =
        rawData.totals ||
        calculateSealedUnitTotals({
          lineItems,
          isInstallation: Boolean(rawData.isInstallation),
          travelFeeType: rawData.travelFeeType || 'none',
          customTravelFee: rawData.customTravelFee,
          showOutTownTravel: Boolean(rawData.showOutTownTravel),
          travelKm: rawData.travelKm,
          crewHours: rawData.crewHours,
          crewSize: rawData.crewSize || '2',
          hstRate: rawData.hstRate ?? 13,
        });

      const isService = rawData.sealedUnitMode === 'service_only';
      const summarySentence = isService
        ? getSealedUnitServiceSummaryLabel(lineItems, calculatedTotals.totalSqft)
        : formatSealedUnitSummarySentence(lineItems);

      const payload = {
        quoteNumber: draft.quoteNumber,
        customerName: draft.customerName,
        itemCount: draft.itemCount,
        type: 'sealed_unit',
        lineItems,
        summaryLabel: summarySentence,
        summarySentence,
        totals: calculatedTotals,
        isInstallation: Boolean(rawData.isInstallation),
        sealedUnitMode: rawData.sealedUnitMode,
        hstRate: rawData.hstRate ?? 13,
      };

      if (onAttachSealedUnit) onAttachSealedUnit(payload);
      else if (onAttach) onAttach(payload);
      toast.success(`Attached Sealed Unit Quote #${draft.quoteNumber}!`);
    } else if (draft.type === 'window') {
      const rawRate = Number(rawData.surchargeRate ?? 8);
      const decimalRate = rawRate > 1 ? rawRate / 100 : rawRate;
      const baseDollars = Number(
        rawData.effectiveBase ??
          (rawData.quoteResult?.base ? rawData.quoteResult.base / 100 : rawData.subtotal || draft.subtotal || 0)
      );

      let surchargeDollars: number;
      if (
        rawData.effectiveSurcharge !== undefined &&
        rawData.effectiveSurcharge !== null &&
        Number(rawData.effectiveSurcharge) <= baseDollars
      ) {
        surchargeDollars = Number(rawData.effectiveSurcharge);
      } else if (rawData.quoteResult?.surcharge && rawData.quoteResult.surcharge / 100 <= baseDollars) {
        surchargeDollars = rawData.quoteResult.surcharge / 100;
      } else {
        surchargeDollars = Math.round(baseDollars * decimalRate * 100) / 100;
      }

      const labourDollars =
        rawData.effectiveLabour ??
        (rawData.customLabour !== undefined
          ? rawData.customLabour
          : Number(rawData.taxTotals?.finalLabour ?? rawData.taxTotals?.labourTotal ?? 0));
      const miscDollars =
        rawData.effectiveMisc ??
        (rawData.customMisc !== undefined
          ? rawData.customMisc
          : Number(rawData.taxTotals?.finalMisc ?? rawData.taxTotals?.miscTotal ?? 0));
      const jcDollars =
        rawData.effectiveJC ??
        (rawData.customJC !== undefined
          ? rawData.customJC
          : Number(rawData.taxTotals?.finalJC ?? rawData.taxTotals?.jcTotal ?? 0));
      const promoDiscountDollars =
        (rawData.quoteResult?.promoDiscount ? rawData.quoteResult.promoDiscount / 100 : 0) ||
        rawData.promoDiscount ||
        0;
      const promoName = rawData.quoteResult?.promoName || rawData.activePromoName || '';
      const hasJamb = Boolean(
        rawData.taxTotals?.selectedJamb &&
          (Number(rawData.taxTotals.selectedJamb.total) > 0 || Number(rawData.taxTotals.selectedJamb.rate) > 0)
      );
      const hasCasing = Boolean(
        rawData.taxTotals?.selectedCasing &&
          (Number(rawData.taxTotals.selectedCasing.total) > 0 || Number(rawData.taxTotals.selectedCasing.rate) > 0)
      );
      const jcLabel =
        hasJamb && hasCasing ? 'Jambs & Casing' : hasJamb ? 'Jambs Only' : hasCasing ? 'Casing Only' : 'Jambs & Casing';

      const windowSentence = formatWindowSummarySentence(rawData.windows || []);
      const finalSentence =
        windowSentence !== '0 Windows' ? windowSentence : draft.summaryLabel || 'Windows & Glazing';

      const payload = {
        quoteNumber: draft.quoteNumber,
        customerName: draft.customerName,
        itemCount: draft.itemCount,
        type: 'window',
        windows: rawData.windows || [],
        summaryLabel: finalSentence,
        summarySentence: finalSentence,
        jcLabel: jcDollars > 0 ? jcLabel : '',
        promoName: promoDiscountDollars > 0 ? promoName : '',
        totals: {
          subtotal: draft.subtotal,
          grandTotal: draft.grandTotal,
          base: baseDollars,
          surcharge: surchargeDollars,
          labour: labourDollars,
          misc: miscDollars,
          jc: jcDollars,
          promoDiscount: promoDiscountDollars,
        },
        taxTotals: rawData.taxTotals,
        quoteResult: rawData.quoteResult,
        surchargeRate: decimalRate,
        hstRate: rawData.hstRate ?? 13,
        isSupplyOnly: Boolean(rawData.isSupplyOnly),
      };

      if (onAttachWindow) onAttachWindow(payload);
      else if (onAttach) onAttach(payload);
      toast.success(`Attached Window Quote #${draft.quoteNumber}!`);
    }
  };

  return {
    drafts,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filteredDrafts,
    windowDraftsCount,
    sealedUnitCount,
    doorCount,
    isDraftAttached,
    handleAttachItem,
  };
}

