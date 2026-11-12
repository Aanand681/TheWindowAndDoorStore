"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldCheck, AlertCircle, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatMoney } from "@/lib/promo-logic"

interface UpgradeFeeHeroCardProps {
  isAvailable: boolean
  upgradeResult: { charge: number; rate: string }
  subtotalCents: number
  handleCopyFee: () => void
  handleCopySummary: () => void
  copiedFee: boolean
  copiedSummary: boolean
}

export function UpgradeFeeHeroCard({
  isAvailable,
  upgradeResult,
  subtotalCents,
  handleCopyFee,
  handleCopySummary,
  copiedFee,
  copiedSummary,
}: UpgradeFeeHeroCardProps) {
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border shadow-xl transition-all",
        isAvailable
          ? "border-emerald-500/35 bg-gradient-to-br from-emerald-500/15 via-background to-emerald-500/10"
          : "border-border/80 bg-muted/30"
      )}
    >
      <CardContent className="space-y-5 p-6">
        <div className="flex flex-col justify-between gap-3 border-b border-border/50 pb-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2.5">
            <div
              className={cn(
                "rounded-xl p-2.5 font-bold text-white shadow-md",
                isAvailable ? "bg-emerald-600" : "bg-muted-foreground/60"
              )}
            >
              <ShieldCheck className="h-6 w-6 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                Optional Labour Upgrade Fee
              </span>
              <h3 className="text-lg font-black text-foreground">
                5-Year Labour Coverage
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-bold shadow-xs",
                isAvailable
                  ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                  : "border-border bg-muted text-muted-foreground"
              )}
            >
              {upgradeResult.rate}
            </span>
          </div>
        </div>

        {/* Hero Number Display */}
        {isAvailable ? (
          <div className="space-y-1">
            <span className="text-xs font-semibold text-muted-foreground">
              Calculated Upgrade Price (Pre-Tax):
            </span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-4xl font-black tracking-tight text-emerald-600 sm:text-5xl dark:text-emerald-400">
                +{formatMoney(upgradeResult.charge)}
              </span>
              <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
                pre-tax
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 rounded-xl border border-amber-500/25 bg-amber-500/10 p-4 text-amber-900 dark:text-amber-200">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="space-y-0.5">
              <p className="text-xs font-bold">Labour Upgrade Not Available</p>
              <p className="text-xs text-amber-800 dark:text-amber-300">
                The minimum pre-tax subtotal to qualify for 5-year labour
                warranty upgrade is $3,000.00. Current subtotal is{" "}
                {formatMoney(subtotalCents)}.
              </p>
            </div>
          </div>
        )}

        {/* 1-Click Action Buttons */}
        {isAvailable && (
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleCopyFee}
              className="cursor-pointer gap-1.5 bg-emerald-600 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
            >
              {copiedFee ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>
                {copiedFee
                  ? "Copied Fee!"
                  : "Copy Fee (" + formatMoney(upgradeResult.charge) + ")"}
              </span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              className="cursor-pointer gap-1.5 border-border text-xs font-semibold text-foreground shadow-xs hover:bg-muted"
            >
              {copiedSummary ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>
                {copiedSummary
                  ? "Copied Breakdown!"
                  : "Copy Summary for Customer / Odoo"}
              </span>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
