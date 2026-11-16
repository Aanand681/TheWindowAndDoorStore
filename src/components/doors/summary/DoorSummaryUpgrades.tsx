"use client"

import React from "react"
import { Sparkles } from "lucide-react"
import { DoorLineItem } from "@/lib/doors/types"

export interface DoorSummaryUpgradesProps {
  upgradeItems: DoorLineItem[]
}

export function DoorSummaryUpgrades({
  upgradeItems,
}: DoorSummaryUpgradesProps) {
  if (upgradeItems.length === 0) return null

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
    </>
  )
}
