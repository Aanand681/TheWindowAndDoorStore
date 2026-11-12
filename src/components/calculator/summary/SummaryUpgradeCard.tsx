"use client"

import React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sparkles } from "lucide-react"
import { formatMoney } from "@/lib/promo-logic"

export interface SummaryUpgradeCardProps {
  wantsUpgrade: boolean
  setWantsUpgrade: (val: boolean) => void
  isReadOnly?: boolean
  upgrade?: any
  shownUpgrade?: number
  attachedDoorQuote?: any | null
  attachedUpgrade?: { title: string; amountPreTaxCents: number } | null
}

export function SummaryUpgradeCard({
  wantsUpgrade,
  setWantsUpgrade,
  isReadOnly = false,
  upgrade,
  shownUpgrade = 0,
  attachedDoorQuote,
  attachedUpgrade,
}: SummaryUpgradeCardProps) {
  return (
    <>
      {/* Option Callout for Attached Comparison Window Upgrade */}
      {attachedUpgrade && attachedUpgrade.amountPreTaxCents > 0 && (
        <div className="mt-3 space-y-1 rounded-xl border border-amber-500/30 bg-amber-500/10 p-2.5 text-xs">
          <div className="flex items-center justify-between font-bold text-amber-800 dark:text-amber-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              Optional Window Upgrade:
            </span>
            <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
              +{formatMoney(attachedUpgrade.amountPreTaxCents)}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {attachedUpgrade.title} (Optional upgrade from comparison, not
            included in total)
          </p>
        </div>
      )}

      {/* 5-year free labour upgrade checkbox (placed right after 50/50 deposits) */}
      <div className="mt-3 flex items-start space-x-2.5 rounded-xl border border-primary/15 bg-primary/5 p-3">
        <Checkbox
          id="summaryUpgrade"
          disabled={isReadOnly}
          checked={wantsUpgrade}
          onCheckedChange={(c) => setWantsUpgrade(!!c)}
          className="mt-0.5"
        />
        <div className="flex-1 space-y-0.5">
          <Label
            htmlFor="summaryUpgrade"
            className="cursor-pointer text-xs font-semibold"
          >
            Include 5-year free labour upgrade
          </Label>
          <p className="text-[10px] text-muted-foreground">
            Optional. Shows upgrade price only; not added to final total.
          </p>
          {wantsUpgrade && upgrade && (
            <div className="flex items-center justify-between pt-1 text-xs font-semibold text-primary">
              <span>Upgrade ({upgrade?.rate})</span>
              <span className="shrink-0 font-mono whitespace-nowrap">
                {formatMoney(shownUpgrade)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Option for door Callout for Attached Door Quote */}
      {attachedDoorQuote?.lineItems &&
        attachedDoorQuote.lineItems.some(
          (i: any) => i.upgradeOption?.enabled
        ) && (
          <div className="mt-3 space-y-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs">
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
                        ? ` (+${(
                            Number(
                              item.upgradeOption?.subtotalDifference || 0
                            ) * item.quantity
                          ).toFixed(2)} total)`
                        : ""}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
    </>
  )
}
