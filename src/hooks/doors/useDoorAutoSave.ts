'use client';

import { useState, useEffect, useRef } from 'react';
import {
  saveActiveAutoSave,
  getActiveAutoSave,
  clearActiveAutoSave,
} from '@/lib/quote-drafts-storage';
import { formatDoorSummarySentence } from '@/lib/doors/calculations';

interface UseDoorAutoSaveProps {
  customerName: string;
  setCustomerName: (name: string) => void;
  quoteNumber: string;
  setQuoteNumber: (num: string) => void;
  mode: any;
  setMode: (mode: any) => void;
  lineItems: any[];
  setLineItems: (items: any[]) => void;
  globalUpcharges: any[];
  setGlobalUpcharges: (u: any[]) => void;
  travelFeeType: any;
  setTravelFeeType: (t: any) => void;
  customTravelFee: string;
  setCustomTravelFee: (f: string) => void;
  showOutTownTravel: boolean;
  setShowOutTownTravel: (show: boolean) => void;
  travelKm: string;
  setTravelKm: (km: string) => void;
  crewHours: string;
  setCrewHours: (h: string) => void;
  crewSize: '2' | '3';
  setCrewSize: (s: '2' | '3') => void;
  quoteNotes: string;
  setQuoteNotes: (notes: string) => void;
  isFirstNation: boolean;
  setIsFirstNation: (fn: boolean) => void;
  customLabour: string;
  setCustomLabour: (l: string) => void;
  customMisc: string;
  setCustomMisc: (m: string) => void;
  attachedWindowQuote: any;
  setAttachedWindowQuote: (q: any) => void;
  attachedSealedUnit: any;
  setAttachedSealedUnit: (u: any) => void;
  totals: any;
}

export function useDoorAutoSave({
  customerName,
  setCustomerName,
  quoteNumber,
  setQuoteNumber,
  mode,
  setMode,
  lineItems,
  setLineItems,
  globalUpcharges,
  setGlobalUpcharges,
  travelFeeType,
  setTravelFeeType,
  customTravelFee,
  setCustomTravelFee,
  showOutTownTravel,
  setShowOutTownTravel,
  travelKm,
  setTravelKm,
  crewHours,
  setCrewHours,
  crewSize,
  setCrewSize,
  quoteNotes,
  setQuoteNotes,
  isFirstNation,
  setIsFirstNation,
  customLabour,
  setCustomLabour,
  customMisc,
  setCustomMisc,
  attachedWindowQuote,
  setAttachedWindowQuote,
  attachedSealedUnit,
  setAttachedSealedUnit,
  totals,
}: UseDoorAutoSaveProps) {
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  // Load Active Auto-save Draft on Mount
  useEffect(() => {
    const autoSave = getActiveAutoSave('door');
    if (autoSave && autoSave.data) {
      const d = autoSave.data as any;
      if (d.customerName) setCustomerName(d.customerName);
      if (d.quoteNumber) setQuoteNumber(d.quoteNumber);
      if (d.mode) setMode(d.mode);
      if (Array.isArray(d.lineItems)) setLineItems(d.lineItems);
      if (Array.isArray(d.globalUpcharges)) setGlobalUpcharges(d.globalUpcharges);
      if (d.travelFeeType) setTravelFeeType(d.travelFeeType);
      if (d.customTravelFee !== undefined) setCustomTravelFee(d.customTravelFee);
      if (d.showOutTownTravel !== undefined) setShowOutTownTravel(d.showOutTownTravel);
      if (d.travelKm !== undefined) setTravelKm(d.travelKm);
      if (d.crewHours !== undefined) setCrewHours(d.crewHours);
      if (d.crewSize) setCrewSize(d.crewSize);
      if (d.quoteNotes !== undefined) setQuoteNotes(d.quoteNotes);
      if (d.isFirstNation !== undefined) setIsFirstNation(d.isFirstNation);
      if (d.customLabour !== undefined) setCustomLabour(String(d.customLabour));
      if (d.customMisc !== undefined) setCustomMisc(String(d.customMisc));
      if (d.attachedWindowQuote !== undefined) setAttachedWindowQuote(d.attachedWindowQuote);
      if (d.attachedSealedUnit !== undefined) setAttachedSealedUnit(d.attachedSealedUnit);
      if (autoSave.timestamp) {
        setLastSavedAt(
          new Date(autoSave.timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })
        );
      }
    }
    initialLoadDone.current = true;
  }, []);

  // Debounced Auto-Save
  useEffect(() => {
    if (!initialLoadDone.current) return;
    const timer = setTimeout(() => {
      if (
        lineItems.length === 0 &&
        !attachedWindowQuote &&
        !attachedSealedUnit &&
        (!customerName || customerName === 'Valued Customer')
      ) {
        clearActiveAutoSave('door');
        return;
      }

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      saveActiveAutoSave('door', {
        quoteNumber,
        customerName,
        itemCount: lineItems.length,
        grandTotal: totals.grandTotal,
        summaryLabel: formatDoorSummarySentence(lineItems),
        data: {
          quoteNumber,
          customerName,
          quoteNotes,
          mode,
          lineItems,
          globalUpcharges,
          travelFeeType,
          customTravelFee,
          showOutTownTravel,
          travelKm,
          crewHours,
          crewSize,
          isFirstNation,
          customLabour,
          customMisc,
          attachedWindowQuote,
          attachedSealedUnit,
          subtotal: totals.subtotalPreTax,
          grandTotal: totals.grandTotal,
          itemCount: lineItems.length,
          totals,
        },
      });
      setLastSavedAt(nowStr);
    }, 700);

    return () => clearTimeout(timer);
  }, [
    customerName,
    quoteNumber,
    mode,
    lineItems,
    globalUpcharges,
    travelFeeType,
    customTravelFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
    quoteNotes,
    isFirstNation,
    customLabour,
    customMisc,
    attachedWindowQuote,
    attachedSealedUnit,
    totals,
  ]);

  return {
    lastSavedAt,
    setLastSavedAt,
  };
}

