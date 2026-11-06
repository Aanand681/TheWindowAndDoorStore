'use client';

import React from 'react';
import { formatMoney } from '@/lib/promo-logic';

export interface SummaryDepositScheduleProps {
  totalCents: number;
  firstPaymentCents: number;
  secondPaymentCents: number;
}

export function SummaryDepositSchedule({
  totalCents,
  firstPaymentCents,
  secondPaymentCents,
}: SummaryDepositScheduleProps) {
  return (
    <div className="pt-2">
      <div className="flex justify-between items-baseline mb-3">
        <span className="text-base font-bold">Total incl. HST</span>
        <span className="text-2xl font-black font-mono tracking-tight text-primary whitespace-nowrap shrink-0">
          {formatMoney(totalCents)}
        </span>
      </div>

      {/* Deposit Schedule */}
      <div className="text-[11px] text-muted-foreground font-semibold mb-1">
        Deposit Schedule (50 / 50)
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/60 rounded-xl p-2.5 border border-border/60">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
            First 50%
          </div>
          <div className="font-mono font-bold text-primary text-sm sm:text-base whitespace-nowrap">
            {formatMoney(firstPaymentCents)}
          </div>
        </div>
        <div className="bg-muted/60 rounded-xl p-2.5 border border-border/60">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
            Final 50%
          </div>
          <div className="font-mono font-bold text-primary text-sm sm:text-base whitespace-nowrap">
            {formatMoney(secondPaymentCents)}
          </div>
        </div>
      </div>
    </div>
  );
}

