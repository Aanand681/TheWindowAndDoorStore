'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { formatMoney } from '@/lib/promo-logic';
import { SummaryTaxSection } from './SummaryTaxSection';
import { SummaryDepositSchedule } from './SummaryDepositSchedule';

export interface StandardLedgerSectionProps {
  summaryWindowGroups: any[];
  quoteResult: any;
  renderEditableRow: (
    field: 'jc' | 'labour' | 'misc',
    label: string,
    amountCents: number,
    customVal: string,
    defaultCents: number,
    setter: (val: string) => void,
    suffix?: string
  ) => React.ReactNode;
  jcSummaryLabel: string;
  effectiveJCCents: number;
  effectiveLabourCents: number;
  effectiveMiscCents: number;
  customJC: string;
  customMisc: string;
  customLabour: string;
  taxJC: number;
  taxMisc: number;
  taxLabour: number;
  setCustomJC: (val: string) => void;
  setCustomMisc: (val: string) => void;
  setCustomLabour: (val: string) => void;
  isSupplyOnly: boolean;
  surchargeRate: number;
  afterDiscount: number;
  total: number;
  firstPayment: number;
  secondPayment: number;
  hstRate: number;
  setHstRate: (val: number) => void;
  isReadOnly?: boolean;
}

export function StandardLedgerSection({
  summaryWindowGroups,
  quoteResult,
  renderEditableRow,
  jcSummaryLabel,
  effectiveJCCents,
  effectiveLabourCents,
  effectiveMiscCents,
  customJC,
  customMisc,
  customLabour,
  taxJC,
  taxMisc,
  taxLabour,
  setCustomJC,
  setCustomMisc,
  setCustomLabour,
  isSupplyOnly,
  surchargeRate,
  afterDiscount,
  total,
  firstPayment,
  secondPayment,
  hstRate,
  setHstRate,
  isReadOnly = false,
}: StandardLedgerSectionProps) {
  return (
    <>
      {/* Window configurations */}
      <div className="space-y-1.5 pb-2.5 border-b border-border/50">
        {summaryWindowGroups.length > 0 ? (
          summaryWindowGroups.map((g) => (
            <div key={g.key} className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
              <span className="text-muted-foreground font-medium truncate capitalize">{g.label}</span>
              <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                {formatMoney(g.baseCents)}
              </span>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
            <span className="text-muted-foreground font-medium">Base window price</span>
            <span className="font-mono font-semibold whitespace-nowrap shrink-0">
              {formatMoney(quoteResult?.base || 0)}
            </span>
          </div>
        )}

        {/* Jambs & Casing */}
        {renderEditableRow(
          'jc',
          jcSummaryLabel,
          effectiveJCCents,
          customJC,
          taxJC,
          (val) => setCustomJC(val)
        )}

        {/* Labour - Completely hidden on Supply Only */}
        {!isSupplyOnly &&
          renderEditableRow(
            'labour',
            'Labour',
            effectiveLabourCents,
            customLabour,
            taxLabour,
            (val) => setCustomLabour(val)
          )}

        {/* Miscellaneous - Completely hidden on Supply Only */}
        {!isSupplyOnly &&
          renderEditableRow(
            'misc',
            'Miscellaneous',
            effectiveMiscCents,
            customMisc,
            taxMisc,
            (val) => setCustomMisc(val)
          )}

        {/* Surcharge */}
        <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
          <span className="text-muted-foreground">Surcharge ({surchargeRate}%)</span>
          <span className="font-mono text-muted-foreground whitespace-nowrap shrink-0">
            +{formatMoney(quoteResult?.surcharge || 0)}
          </span>
        </div>

        {/* Promo discount */}
        {(quoteResult?.promoDiscount || 0) > 0 && (
          <>
            <div className="flex items-center justify-between text-xs sm:text-sm py-0.5 font-medium text-emerald-500">
              <span>Promo discount</span>
              <span className="font-mono whitespace-nowrap shrink-0">
                -{formatMoney(quoteResult?.promoDiscount || 0)}
              </span>
            </div>
            {quoteResult?.text && (
              <p className="text-[11px] text-muted-foreground flex items-start gap-1.5 my-1.5 bg-muted/50 p-2.5 rounded-lg border border-border/60">
                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
                <span>{quoteResult.text}</span>
              </p>
            )}
          </>
        )}
      </div>

      {/* Subtotal (After Discount) */}
      <div className="pb-2.5 border-b border-border/50 text-xs sm:text-sm">
        <div className="flex items-center justify-between font-medium">
          <span className="text-foreground">Subtotal</span>
          <span className="font-mono font-bold text-primary whitespace-nowrap shrink-0">
            {formatMoney(afterDiscount)}
          </span>
        </div>
      </div>

      {/* Tax Section */}
      <SummaryTaxSection
        hstRate={hstRate}
        setHstRate={setHstRate}
        taxCents={total - afterDiscount}
        isReadOnly={isReadOnly}
        idPrefix="promo"
      />

      {/* Total & Deposit Schedule */}
      <SummaryDepositSchedule
        totalCents={total}
        firstPaymentCents={firstPayment}
        secondPaymentCents={secondPayment}
      />
    </>
  );
}

