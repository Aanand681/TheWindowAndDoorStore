"use client"

import React from "react"
import { Sparkles } from "lucide-react"
import { DoorLineItem } from "@/lib/doors/types"

export interface DoorSummaryUpgradesProps {
  upgradeItems: DoorLineItem[]
  hasAttachedWindow: boolean
  attachedWindowQuote?: any
}

export function DoorSummaryUpgrades({
  upgradeItems,
  hasAttachedWindow,
  attachedWindowQuote,
}: DoorSummaryUpgradesProps) {
  const hasWindowUpgrade =
    hasAttachedWindow &&
    attachedWindowQuote?.attachedUpgrade?.amountPreTaxCents > 0

  if (upgradeItems.length === 0 && !hasWindowUpgrade) return null

  return (
    <>
      {/* Option of Upgrade Callout */}
      {upgradeItems.length > 0 && (
        <div className="space-y-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            option for Door upgrade:
          </div>
          <div className="space-y-1 divide-y divide-emerald-500/20">
            {upgradeItems.map((item, idx) => {
              const upgradeDiff =
                (item.upgradeOption?.subtotalDifference || 0) *
                (item.quantity || 1)
              const label =
                item.upgradeOption?.title ||
                item.customDescription ||
                item.presetLabel
              return (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between gap-2 pt-1 first:pt-0"
                >
                  <span className="truncate text-xs font-medium text-foreground">
                    {label} Add
                  </span>
                  <span className="shrink-0 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    +${upgradeDiff.toFixed(2)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Attached Window Upgrade Callout */}
      {hasWindowUpgrade && (
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
