"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatMoney } from "@/lib/promo-logic"

interface UpgradeComparisonCardProps {
  subtotalCents: number
  hstRate: number
  baseHstCents: number
  baseTotalCents: number
  subtotalWithUpgradeCents: number
  withUpgradeHstCents: number
  withUpgradeTotalCents: number
}

export function UpgradeComparisonCard({
  subtotalCents,
  hstRate,
  baseHstCents,
  baseTotalCents,
  subtotalWithUpgradeCents,
  withUpgradeHstCents,
  withUpgradeTotalCents,
}: UpgradeComparisonCardProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border-border/80 bg-card/50 shadow-lg backdrop-blur-xl">
      <CardHeader className="border-b border-border/50 bg-muted/20 pb-3.5">
        <CardTitle className="flex items-center justify-between text-sm font-bold">
          <span>Quote Breakdown &amp; Comparison</span>
          <span className="text-[11px] font-normal text-muted-foreground">
            Comparing Base Quote vs Quote with Labour Upgrade
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-4 text-xs">
          {/* Left: Base Quote */}
          <div className="space-y-2 rounded-xl border border-border/60 bg-muted/30 p-3">
            <span className="block border-b border-border/40 pb-1 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Base Quote (Without Upgrade)
            </span>
            <div className="flex justify-between text-muted-foreground">
              <span>Pre-Tax Subtotal:</span>
              <span className="font-mono font-semibold text-foreground">
                {formatMoney(subtotalCents)}
              </span>
            </div>
            {hstRate > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>HST ({hstRate}%):</span>
                <span className="font-mono font-semibold text-foreground">
                  {formatMoney(baseHstCents)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-border/50 pt-2 font-bold text-foreground">
              <span>Total:</span>
              <span className="font-mono text-sm">
                {formatMoney(baseTotalCents)}
              </span>
            </div>
          </div>

          {/* Right: Quote With Upgrade */}
          <div className="space-y-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <span className="block border-b border-emerald-500/20 pb-1 text-[10px] font-bold tracking-wider text-emerald-600 uppercase dark:text-emerald-400">
              With Labour Upgrade
            </span>
            <div className="flex justify-between text-muted-foreground">
              <span>Pre-Tax Subtotal:</span>
              <span className="font-mono font-semibold text-foreground">
                {formatMoney(subtotalWithUpgradeCents)}
              </span>
            </div>
            {hstRate > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>HST ({hstRate}%):</span>
                <span className="font-mono font-semibold text-foreground">
                  {formatMoney(withUpgradeHstCents)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-emerald-500/20 pt-2 font-bold text-emerald-600 dark:text-emerald-400">
              <span>Total with Upgrade:</span>
              <span className="font-mono text-sm">
                {formatMoney(withUpgradeTotalCents)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
