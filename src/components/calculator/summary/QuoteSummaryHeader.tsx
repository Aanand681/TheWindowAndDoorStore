import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Wrench, PackageCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuoteSummaryHeaderProps {
  quoteResult?: { promoName?: string; promoDiscount?: number } | null;
  quoteNumber?: string;
  customerName?: string;
  isSupplyOnly?: boolean;
  setIsSupplyOnly?: (val: boolean) => void;
  isReadOnly?: boolean;
}

export function QuoteSummaryHeader({
  quoteResult,
  quoteNumber,
  customerName,
  isSupplyOnly = false,
  setIsSupplyOnly,
  isReadOnly = false,
}: QuoteSummaryHeaderProps) {
  return (
    <CardHeader className="p-3.5 pb-2.5 border-b border-border/50">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <CardTitle className="text-base font-bold flex items-center gap-1.5 truncate">
            <Calculator className="w-4 h-4 text-primary shrink-0" />
            <span className="truncate">Promo Summary</span>
          </CardTitle>
          <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
            {quoteResult?.promoName && (quoteResult.promoDiscount || 0) > 0 ? (
              <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 truncate">
                {quoteResult.promoName}
              </span>
            ) : (
              <p className="text-[11px] text-muted-foreground leading-tight truncate">
                {quoteNumber ? `Quote #${quoteNumber}` : 'Window Calculation Summary'}{' '}
                {customerName ? `• ${customerName}` : ''}
              </p>
            )}
          </div>
        </div>

        {/* Segmented Install vs Supply Only Toggle */}
        {setIsSupplyOnly && (
          <div
            className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5 shrink-0"
            title={isReadOnly ? 'Toggle disabled in review mode' : undefined}
          >
            <button
              type="button"
              disabled={isReadOnly}
              onClick={() => setIsSupplyOnly(false)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                !isSupplyOnly
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Wrench className="w-3 h-3" />
              <span>Install</span>
            </button>
            <button
              type="button"
              disabled={isReadOnly}
              onClick={() => setIsSupplyOnly(true)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                isSupplyOnly
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <PackageCheck className="w-3 h-3" />
              <span>Supply Only</span>
            </button>
          </div>
        )}
      </div>
    </CardHeader>
  );
}

