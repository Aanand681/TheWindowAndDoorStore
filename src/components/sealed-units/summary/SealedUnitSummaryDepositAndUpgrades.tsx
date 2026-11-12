"use client"

import React from "react"
import { Sparkles } from "lucide-react"

export interface SealedUnitSummaryDepositAndUpgradesProps {
  displayGrandTotal: number
  firstPayment: number
  secondPayment: number
  hasAttachedDoor: boolean
  hasAttachedWindow: boolean
  attachedDoorQuote?: any
  attachedWindowQuote?: any
}

export function SealedUnitSummaryDepositAndUpgrades({
  displayGrandTotal,
  firstPayment,
  secondPayment,
  hasAttachedDoor,
  hasAttachedWindow,
  attachedDoorQuote,
  attachedWindowQuote,
}: SealedUnitSummaryDepositAndUpgradesProps) {
  return (
    <>
      {/* Grand Total & 50/50 Deposit */}
      <div className="pt-1">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-base font-bold">Total</span>
          <span className="shrink-0 font-mono text-2xl font-black tracking-tight whitespace-nowrap text-primary">
            ${displayGrandTotal.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="rounded-xl border border-border/60 bg-muted/60 p-2.5">
            <div className="mb-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              First 50% Deposit
            </div>
            <div className="font-mono text-sm font-bold whitespace-nowrap text-primary">
              ${firstPayment.toFixed(2)}
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/60 p-2.5">
            <div className="mb-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Final 50% Balance
            </div>
            <div className="font-mono text-sm font-bold whitespace-nowrap text-primary">
              ${secondPayment.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Option for door Callout */}
      {hasAttachedDoor &&
        attachedDoorQuote?.lineItems &&
        attachedDoorQuote.lineItems.some(
          (i: any) => i.upgradeOption?.enabled
        ) && (
          <div className="space-y-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Option for door:
            </div>
            <div className="space-y-1 divide-y divide-emerald-500/20">
              {attachedDoorQuote.lineItems
                .filter((i: any) => i.upgradeOption?.enabled)
                .map((item: any, idx: number) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between gap-2 pt-1 first:pt-0"
                  >
                    <span className="truncate text-[11px] text-muted-foreground">
                      {item.customDescription || item.presetLabel}:{" "}
                      <strong>{item.upgradeOption?.title}</strong>
                    </span>
                    <span className="shrink-0 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      +$
                      {Number(
                        item.upgradeOption?.subtotalDifference || 0
                      ).toFixed(2)}
                      /unit
                      {item.quantity > 1
                        ? ` (+${(Number(item.upgradeOption?.subtotalDifference || 0) * item.quantity).toFixed(2)} total)`
                        : ""}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

      {/* Attached Window Upgrade Callout */}
      {hasAttachedWindow &&
        attachedWindowQuote?.attachedUpgrade?.amountPreTaxCents > 0 && (
          <div className="space-y-1 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs">
            <div className="flex items-center justify-between font-bold text-amber-800 dark:text-amber-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                Optional Window Upgrade:
              </span>
              <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                +$
                {(
                  attachedWindowQuote.attachedUpgrade.amountPreTaxCents / 100
                ).toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {attachedWindowQuote.attachedUpgrade.title} (Optional upgrade, not
              included in total)
            </p>
          </div>
        )}
    </>
  )
}
