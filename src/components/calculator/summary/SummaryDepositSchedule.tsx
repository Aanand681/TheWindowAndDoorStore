"use client"

import React from "react"
import { formatMoney } from "@/lib/promo-logic"

export interface SummaryDepositScheduleProps {
  totalCents: number
  firstPaymentCents: number
  secondPaymentCents: number
}

export function SummaryDepositSchedule({
  totalCents,
  firstPaymentCents,
  secondPaymentCents,
}: SummaryDepositScheduleProps) {
  return (
    <div className="pt-2">
      <div className="mb-3 flex items-baseline justify-between">
        <span className="text-base font-bold">Total incl. HST</span>
        <span className="shrink-0 font-mono text-2xl font-black tracking-tight whitespace-nowrap text-primary">
          {formatMoney(totalCents)}
        </span>
      </div>

      {/* Deposit Schedule */}
      <div className="mb-1 text-[11px] font-semibold text-muted-foreground">
        Deposit Schedule (50 / 50)
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border/60 bg-muted/60 p-2.5">
          <div className="mb-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            First 50%
          </div>
          <div className="font-mono text-sm font-bold whitespace-nowrap text-primary sm:text-base">
            {formatMoney(firstPaymentCents)}
          </div>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/60 p-2.5">
          <div className="mb-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
            Final 50%
          </div>
          <div className="font-mono text-sm font-bold whitespace-nowrap text-primary sm:text-base">
            {formatMoney(secondPaymentCents)}
          </div>
        </div>
      </div>
    </div>
  )
}
