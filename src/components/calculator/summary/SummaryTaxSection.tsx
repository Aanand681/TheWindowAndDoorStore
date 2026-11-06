'use client';

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/lib/promo-logic';

export interface SummaryTaxSectionProps {
  hstRate: number;
  setHstRate: (val: number) => void;
  taxCents: number;
  isReadOnly?: boolean;
  idPrefix?: string;
}

export function SummaryTaxSection({
  hstRate,
  setHstRate,
  taxCents,
  isReadOnly = false,
  idPrefix = 'promo',
}: SummaryTaxSectionProps) {
  const checkboxId = `${idPrefix}HstExemption`;

  return (
    <div className="pt-1 pb-2.5 space-y-1.5 border-b border-border/50">
      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="text-muted-foreground">
          {hstRate === 8 ? '5% GST (First Nations Material Exemption)' : '13% HST'}
        </span>
        <span className="font-mono font-semibold text-foreground whitespace-nowrap shrink-0">
          {formatMoney(taxCents)}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs pt-0.5">
        <div className="flex items-center gap-2">
          <Checkbox
            id={checkboxId}
            disabled={isReadOnly}
            checked={hstRate === 8}
            onCheckedChange={(c) => setHstRate(c ? 8 : 13)}
          />
          <Label
            htmlFor={checkboxId}
            className="cursor-pointer text-muted-foreground font-normal text-xs"
            title="Point-of-Sale Exemption: 8% provincial tax exempt on materials; 13% on labour"
          >
            8% First Nations Material Exemption
          </Label>
        </div>
        <span
          className={cn(
            'font-mono text-xs',
            hstRate === 8
              ? 'text-emerald-500 font-semibold'
              : 'text-muted-foreground opacity-40 line-through'
          )}
        >
          {hstRate === 8 ? '-8% PST' : 'Standard'}
        </span>
      </div>
    </div>
  );
}

