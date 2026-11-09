'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { UIWindowItem } from '@/hooks/useCalculatorWindows';
import {
  CalculatorSnapshotA,
  ComparisonOverrides,
  captureCalculatorSnapshot,
  restoreCalculatorSnapshot,
  applyComparisonOverrides,
} from './comparison/comparison-helpers';

export interface UseCalculatorComparisonProps {
  windows: UIWindowItem[];
  setWindows: (windows: UIWindowItem[]) => void;
  surchargeRate: number;
  setSurchargeRate: (rate: number) => void;
  isSupplyOnly: boolean;
  setIsSupplyOnly: (val: boolean) => void;
  supplyJambId: string;
  setSupplyJambId: (val: string) => void;
  supplyJambName: string;
  setSupplyJambName: (val: string) => void;
  supplyJambRate: string;
  setSupplyJambRate: (val: string) => void;
  supplyCasingId: string;
  setSupplyCasingId: (val: string) => void;
  supplyCasingName: string;
  setSupplyCasingName: (val: string) => void;
  supplyCasingRate: string;
  setSupplyCasingRate: (val: string) => void;
  taxTotals: any;
  setTaxTotals: (val: any) => void;
  customJC: string;
  setCustomJC: (val: string) => void;
  customMisc: string;
  setCustomMisc: (val: string) => void;
  customLabour: string;
  setCustomLabour: (val: string) => void;
  activePromoId: string;
  setActivePromoId: (id: string) => void;
  setLockedPromoId: (id: string | null) => void;
  hstRate: number;
  setHstRate: (rate: number) => void;
  customerName: string;
  setCustomerName: (name: string) => void;
  quoteNumber: string;
  setQuoteNumber: (num: string) => void;
  quoteResult: any;
  afterDiscount: number;
  total: number;
  firstPayment: number;
  secondPayment: number;
}

export function useCalculatorComparison(props: UseCalculatorComparisonProps) {
  const {
    windows,
    setWindows,
    setLockedPromoId,
    customerName,
    setCustomerName,
    quoteNumber,
    setQuoteNumber,
    customLabour,
    setCustomLabour,
    setSupplyJambId,
    setSupplyJambRate,
    setSupplyCasingId,
    setSupplyCasingRate,
  } = props;

  const [appliedOption, setAppliedOption] = useState<'A' | 'B'>('A');
  const [baseWindowsA, setBaseWindowsA] = useState<UIWindowItem[] | null>(null);
  const [isComparisonStaging, setIsComparisonStaging] = useState<boolean>(false);
  const [baseSnapshotA, setBaseSnapshotA] = useState<CalculatorSnapshotA | null>(null);

  const captureSnapshotA = useCallback(() => {
    return captureCalculatorSnapshot(props);
  }, [props]);

  const handleRevertToBase = useCallback(() => {
    if (baseSnapshotA) {
      restoreCalculatorSnapshot(baseSnapshotA, props);
    } else if (baseWindowsA && baseWindowsA.length > 0) {
      setWindows(baseWindowsA);
    }
    setIsComparisonStaging(false);
    setAppliedOption('A');
    setBaseSnapshotA(null);
    setLockedPromoId(null);
    toast.info('Reverted to Base Quote (Option A).');
  }, [baseSnapshotA, baseWindowsA, props, setWindows, setLockedPromoId]);

  const handleKeepOptionB = useCallback(() => {
    setIsComparisonStaging(false);
    setAppliedOption('A');
    setBaseSnapshotA(null);
    setBaseWindowsA(null);
    toast.success('Kept Option B as the active quote.');
  }, []);

  const handleApplyAndCustomize = useCallback(
    (
      optionWindows: UIWindowItem[],
      meta?: { customerName?: string; quoteNumber?: string },
      overrides?: ComparisonOverrides
    ) => {
      if (!baseSnapshotA) {
        setBaseSnapshotA(captureSnapshotA());
      }
      setBaseWindowsA(windows);
      setIsComparisonStaging(true);
      setAppliedOption('B');

      setWindows(optionWindows);
      if (meta?.customerName && !customerName) setCustomerName(meta.customerName);
      if (meta?.quoteNumber && !quoteNumber) setQuoteNumber(meta.quoteNumber);

      if (overrides) {
        applyComparisonOverrides(overrides, customLabour, {
          setSupplyJambId,
          setSupplyJambRate,
          setSupplyCasingId,
          setSupplyCasingRate,
          setCustomLabour,
        });
      }

      setLockedPromoId(null);
      toast.success('Loaded Option B into calculator. Base Quote A is safely preserved.');
    },
    [
      baseSnapshotA,
      captureSnapshotA,
      windows,
      customerName,
      quoteNumber,
      customLabour,
      setWindows,
      setCustomerName,
      setQuoteNumber,
      setSupplyJambId,
      setSupplyJambRate,
      setSupplyCasingId,
      setSupplyCasingRate,
      setCustomLabour,
      setLockedPromoId,
    ]
  );

  const handleApplyOption = useCallback(
    (
      target: 'A' | 'B',
      optionWindows: UIWindowItem[],
      meta?: { customerName?: string; quoteNumber?: string },
      overrides?: ComparisonOverrides
    ) => {
      if (target === 'B') {
        if (!baseSnapshotA) {
          setBaseSnapshotA(captureSnapshotA());
        }
        setBaseWindowsA(windows);
        setWindows(optionWindows);
        setAppliedOption('B');
        if (meta?.customerName && !customerName) {
          setCustomerName(meta.customerName);
        }
        if (meta?.quoteNumber && !quoteNumber) {
          setQuoteNumber(meta.quoteNumber);
        }
        if (overrides) {
          applyComparisonOverrides(overrides, customLabour, {
            setSupplyJambId,
            setSupplyJambRate,
            setSupplyCasingId,
            setSupplyCasingRate,
            setCustomLabour,
          });
        }
        setLockedPromoId(null);
        toast.success('Applied Option B to quote.');
      } else {
        handleRevertToBase();
      }
    },
    [
      baseSnapshotA,
      captureSnapshotA,
      windows,
      customerName,
      quoteNumber,
      customLabour,
      setWindows,
      setCustomerName,
      setQuoteNumber,
      setSupplyJambId,
      setSupplyJambRate,
      setSupplyCasingId,
      setSupplyCasingRate,
      setCustomLabour,
      setLockedPromoId,
      handleRevertToBase,
    ]
  );

  return {
    appliedOption,
    setAppliedOption,
    baseWindowsA,
    setBaseWindowsA,
    isComparisonStaging,
    setIsComparisonStaging,
    baseSnapshotA,
    setBaseSnapshotA,
    handleRevertToBase,
    handleKeepOptionB,
    handleApplyAndCustomize,
    handleApplyOption,
  };
}
