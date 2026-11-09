import React from 'react';
import { formatMoney } from '@/lib/promo-logic';
import { UIWindowItem } from '@/hooks/useCalculatorWindows';
import { getWindowsSummarySentence } from './comparison-helpers';

interface ComparisonOptionACardProps {
  currentWindows: UIWindowItem[];
  customerName: string;
  quoteNumber: string;
  surchargeRate: number;
  effectiveJC: number;
  effectiveLabour: number;
  hstRate: number;
  quoteResultA: any;
  afterDiscountA: number;
  totalA: number;
  firstPaymentA: number;
  secondPaymentA: number;
  appliedOption: 'A' | 'B';
}

export function ComparisonOptionACard({
  currentWindows,
  customerName,
  quoteNumber,
  surchargeRate,
  effectiveJC,
  effectiveLabour,
  hstRate,
  quoteResultA,
  afterDiscountA,
  totalA,
  firstPaymentA,
  secondPaymentA,
  appliedOption,
}: ComparisonOptionACardProps) {
  return (
    <div className="bg-muted/20 border border-border/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
              Option A (Base)
            </span>
            {appliedOption === 'A' && (
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                ✓ Active in Quote
              </span>
            )}
          </div>
          <span className="text-xs font-bold text-foreground">
            {quoteNumber || 'Base'}
          </span>
        </div>

        <div className="mt-3 space-y-1">
          <p className="text-sm font-bold text-foreground truncate">
            {customerName || 'Base Customer Quote'}
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {getWindowsSummarySentence(currentWindows)}
          </p>
        </div>

        {/* Financial breakdown */}
        <div className="mt-4 pt-4 border-t border-border/60 space-y-2 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Manufacturer Base:</span>
            <span className="font-semibold text-foreground">
              {formatMoney(quoteResultA?.base || 0)}
            </span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Surcharge ({surchargeRate}%):</span>
            <span className="font-semibold text-foreground">
              {formatMoney(quoteResultA?.surcharge || 0)}
            </span>
          </div>
          {effectiveJC > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Supply Jambs &amp; Casing:</span>
              <span className="font-semibold text-foreground">
                {formatMoney(effectiveJC)}
              </span>
            </div>
          )}
          {effectiveLabour > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Labour &amp; Installation:</span>
              <span className="font-semibold text-foreground">
                {formatMoney(effectiveLabour)}
              </span>
            </div>
          )}
          {(quoteResultA?.promoDiscount || 0) > 0 && (
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
              <span>Promo Discount:</span>
              <span>-{formatMoney(quoteResultA.promoDiscount)}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-border/50 font-semibold text-foreground">
            <span>Pre-Tax Subtotal:</span>
            <span className="text-primary font-bold">{formatMoney(afterDiscountA)}</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>HST ({hstRate}%):</span>
            <span className="font-semibold text-foreground">
              {formatMoney(totalA - afterDiscountA)}
            </span>
          </div>
        </div>
      </div>

      {/* Total Card */}
      <div className="bg-card border border-border/80 rounded-xl p-3 shadow-xs">
        <div className="flex items-baseline justify-between">
          <span className="text-xs uppercase font-bold text-muted-foreground">
            Option A Total
          </span>
          <span className="text-lg font-black text-foreground">
            {formatMoney(totalA)}
          </span>
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground mt-1 pt-1 border-t border-border/40">
          <span>Deposits (50/50):</span>
          <span>
            {formatMoney(firstPaymentA)} / {formatMoney(secondPaymentA)}
          </span>
        </div>
      </div>
    </div>
  );
}

