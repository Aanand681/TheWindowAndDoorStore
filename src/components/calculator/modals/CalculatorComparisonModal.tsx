'use client';

import React from 'react';
import { toCents } from '@/lib/promo-logic';
import { ComparisonModalWrapper } from './index';
import { CalculatorComparisonModalProps } from './types';

export function CalculatorComparisonModal({
  isCompareModalOpen,
  setIsCompareModalOpen,
  baseSnapshotA,
  appliedOption,
  baseWindowsA,
  windows,
  customerName,
  quoteNumber,
  surchargeRate,
  isSupplyOnly,
  supplyJambId,
  supplyJambName,
  supplyJambRate,
  supplyCasingId,
  supplyCasingName,
  supplyCasingRate,
  customJC,
  effectiveJC,
  effectiveMisc,
  effectiveLabour,
  availablePromos,
  activePromoId,
  hstRate,
  quoteResult,
  afterDiscount,
  total,
  firstPayment,
  secondPayment,
  taxTotals,
  isComparisonStaging,
  handleApplyOption,
  handleApplyAndCustomize,
  handleKeepOptionB,
  attachedUpgrade,
  setAttachedUpgrade,
}: CalculatorComparisonModalProps) {
  const stagedOptionB =
    isComparisonStaging && baseSnapshotA
      ? {
          windows,
          quoteResult,
          afterDiscount,
          total,
          firstPayment,
          secondPayment,
          effectiveJC: isSupplyOnly ? (customJC ? toCents(customJC) : 0) : effectiveJC,
          effectiveMisc: isSupplyOnly ? 0 : effectiveMisc,
          effectiveLabour: isSupplyOnly ? 0 : effectiveLabour,
          activePromoId,
          supplyJambId: isSupplyOnly
            ? supplyJambId
            : taxTotals?.selectedJamb?.id || taxTotals?.jambId,
          supplyJambName: isSupplyOnly
            ? supplyJambName
            : taxTotals?.selectedJamb?.name || taxTotals?.jambName,
          supplyJambRate: isSupplyOnly
            ? supplyJambRate
            : String(taxTotals?.selectedJamb?.rate || taxTotals?.jambRate || ''),
          supplyCasingId: isSupplyOnly
            ? supplyCasingId
            : taxTotals?.selectedCasing?.id || taxTotals?.casingId,
          supplyCasingName: isSupplyOnly
            ? supplyCasingName
            : taxTotals?.selectedCasing?.name || taxTotals?.casingName,
          supplyCasingRate: isSupplyOnly
            ? supplyCasingRate
            : String(taxTotals?.selectedCasing?.rate || taxTotals?.casingRate || ''),
          customerName,
          quoteNumber,
        }
      : undefined;

  return (
    <ComparisonModalWrapper
      isOpen={isCompareModalOpen}
      onClose={() => setIsCompareModalOpen(false)}
      currentWindows={
        baseSnapshotA
          ? baseSnapshotA.windows
          : appliedOption === 'B' && baseWindowsA
          ? baseWindowsA
          : windows
      }
      customerName={baseSnapshotA ? baseSnapshotA.customerName : customerName}
      quoteNumber={baseSnapshotA ? baseSnapshotA.quoteNumber : quoteNumber}
      surchargeRate={baseSnapshotA ? baseSnapshotA.surchargeRate : surchargeRate}
      isSupplyOnly={baseSnapshotA ? baseSnapshotA.isSupplyOnly : isSupplyOnly}
      supplyJambId={
        baseSnapshotA
          ? baseSnapshotA.supplyJambId
          : isSupplyOnly
          ? supplyJambId
          : taxTotals?.selectedJamb?.id || taxTotals?.jambId || 'none'
      }
      supplyJambName={
        baseSnapshotA
          ? baseSnapshotA.supplyJambName
          : isSupplyOnly
          ? supplyJambName
          : taxTotals?.selectedJamb?.name || taxTotals?.jambName || ''
      }
      supplyJambRate={
        baseSnapshotA
          ? baseSnapshotA.supplyJambRate
          : isSupplyOnly
          ? supplyJambRate
          : String(taxTotals?.selectedJamb?.rate || taxTotals?.jambRate || '')
      }
      supplyCasingId={
        baseSnapshotA
          ? baseSnapshotA.supplyCasingId
          : isSupplyOnly
          ? supplyCasingId
          : taxTotals?.selectedCasing?.id || taxTotals?.casingId || 'none'
      }
      supplyCasingName={
        baseSnapshotA
          ? baseSnapshotA.supplyCasingName
          : isSupplyOnly
          ? supplyCasingName
          : taxTotals?.selectedCasing?.name || taxTotals?.casingName || ''
      }
      supplyCasingRate={
        baseSnapshotA
          ? baseSnapshotA.supplyCasingRate
          : isSupplyOnly
          ? supplyCasingRate
          : String(taxTotals?.selectedCasing?.rate || taxTotals?.casingRate || '')
      }
      effectiveJC={
        baseSnapshotA
          ? baseSnapshotA.taxTotals?.jcLabourCents ??
            (baseSnapshotA.customJC ? toCents(baseSnapshotA.customJC) : 0)
          : effectiveJC
      }
      effectiveMisc={
        baseSnapshotA
          ? baseSnapshotA.taxTotals?.miscLabourCents ??
            (baseSnapshotA.customMisc ? toCents(baseSnapshotA.customMisc) : 0)
          : effectiveMisc
      }
      effectiveLabour={
        baseSnapshotA
          ? baseSnapshotA.taxTotals?.standardLabourCents ??
            (baseSnapshotA.customLabour ? toCents(baseSnapshotA.customLabour) : 0)
          : effectiveLabour
      }
      availablePromos={availablePromos}
      activePromoId={baseSnapshotA ? baseSnapshotA.activePromoId : activePromoId}
      hstRate={baseSnapshotA ? baseSnapshotA.hstRate : hstRate}
      quoteResultA={baseSnapshotA ? baseSnapshotA.quoteResult : quoteResult}
      afterDiscountA={baseSnapshotA ? baseSnapshotA.afterDiscount : afterDiscount}
      totalA={baseSnapshotA ? baseSnapshotA.total : total}
      firstPaymentA={baseSnapshotA ? baseSnapshotA.firstPayment : firstPayment}
      secondPaymentA={baseSnapshotA ? baseSnapshotA.secondPayment : secondPayment}
      appliedOption={appliedOption}
      isComparisonStaging={isComparisonStaging}
      stagedOptionB={stagedOptionB}
      onApplyOption={handleApplyOption}
      onApplyAndCustomize={handleApplyAndCustomize}
      onKeepOptionB={handleKeepOptionB}
      attachedUpgrade={attachedUpgrade}
      onAttachUpgrade={setAttachedUpgrade}
    />
  );
}

