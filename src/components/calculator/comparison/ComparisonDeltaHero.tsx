"use client"

import React from "react"
import { CheckCircle2, ArrowUpRight, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatMoney } from "@/lib/promo-logic"
import { ComparisonDelta, OptionBFinancials } from "./types"

export interface ComparisonDeltaHeroProps {
  delta: ComparisonDelta | null
  optionBFinancials: OptionBFinancials | null
}

export function ComparisonDeltaHero({
  delta,
  optionBFinancials,
}: ComparisonDeltaHeroProps) {
  if (!delta || !optionBFinancials) return null

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-sm transition-all sm:p-5",
        delta.isUpgrade
          ? "border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-primary/5 to-amber-500/10"
          : delta.isSavings
            ? "border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10"
            : "border-border bg-muted/40"
      )}
    >
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <div
            className={cn(
              "shrink-0 rounded-2xl p-3 shadow-xs",
              delta.isUpgrade
                ? "bg-amber-500 text-amber-950"
                : delta.isSavings
                  ? "bg-emerald-500 text-emerald-950"
                  : "bg-muted text-foreground"
            )}
          >
            {delta.isUpgrade ? (
              <ArrowUpRight className="h-6 w-6 stroke-[2.5]" />
            ) : delta.isSavings ? (
              <TrendingDown className="h-6 w-6 stroke-[2.5]" />
            ) : (
              <CheckCircle2 className="h-6 w-6" />
            )}
          </div>
          <div>
            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              {delta.isUpgrade
                ? "Upgrade Cost Difference (Pre-Tax)"
                : delta.isSavings
                  ? "Cost Savings Difference (Pre-Tax)"
                  : "Exact Price Match"}
            </span>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground sm:text-3xl">
                {delta.preTax >= 0 ? "+" : ""}
                {formatMoney(delta.preTax)}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                pre-tax
              </span>
            </div>
          </div>
        </div>

        {/* Right side status badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Option B Pre-Tax:{" "}
            <strong className="text-foreground">
              {formatMoney(optionBFinancials.afterDiscount)}
            </strong>
          </span>
        </div>
      </div>
    </div>
  )
}
