"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Sparkles } from "lucide-react"

interface DoorUpgradeSectionProps {
  hasUpgradeOption: boolean
  setHasUpgradeOption: (val: boolean) => void
  upgradeTitle: string
  setUpgradeTitle: (val: string) => void
  upgradeInksterPrice: string
  setUpgradeInksterPrice: (val: string) => void
  upgradeDiff: {
    baseNetPrice: number
    optionNetPrice: number
    subtotalDifference: number
    totalDifference: number
  } | null
  parsedQuantity: number
}

export function DoorUpgradeSection({
  hasUpgradeOption,
  setHasUpgradeOption,
  upgradeTitle,
  setUpgradeTitle,
  upgradeInksterPrice,
  setUpgradeInksterPrice,
  upgradeDiff,
  parsedQuantity,
}: DoorUpgradeSectionProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/70 bg-card/40">
      <div className="flex items-center justify-between p-2.5 text-xs font-semibold">
        <label className="flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={hasUpgradeOption}
            onChange={(e) => setHasUpgradeOption(e.target.checked)}
            className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
          />
          <span className="flex items-center gap-1.5 font-bold">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            Option for door
          </span>
        </label>
        {hasUpgradeOption && upgradeDiff && (
          <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            +
            {upgradeDiff.subtotalDifference >= 0
              ? `$${upgradeDiff.subtotalDifference.toFixed(2)}`
              : `-$${Math.abs(upgradeDiff.subtotalDifference).toFixed(2)}`}
            /unit
            {parsedQuantity > 1
              ? ` (+${(upgradeDiff.subtotalDifference * parsedQuantity).toFixed(2)} total)`
              : ""}
          </span>
        )}
      </div>

      {hasUpgradeOption && (
        <div className="mt-1.5 space-y-2.5 border-t border-border/40 bg-muted/20 p-2.5 pt-0">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Option Description</Label>
              <Input
                value={upgradeTitle}
                onChange={(e) => setUpgradeTitle(e.target.value)}
                placeholder="Option title / description"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Option Inkster Price ($)</Label>
              <div className="relative">
                <span className="absolute top-1/2 left-2.5 -translate-y-1/2 text-xs text-muted-foreground">
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  value={upgradeInksterPrice}
                  onChange={(e) => setUpgradeInksterPrice(e.target.value)}
                  placeholder="0.00"
                  className="h-8 pl-6 text-right font-mono text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {upgradeDiff && (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs text-foreground">
              <div className="text-[10px] text-muted-foreground">
                Base: ${upgradeDiff.baseNetPrice.toFixed(2)} | Option: $
                {upgradeDiff.optionNetPrice.toFixed(2)}
              </div>
              <div className="text-right">
                <div className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Upgrade Diff: +${upgradeDiff.subtotalDifference.toFixed(2)}
                  /unit
                  {parsedQuantity > 1 ? (
                    <span className="ml-1 text-primary">
                      (+$
                      {(
                        upgradeDiff.subtotalDifference * parsedQuantity
                      ).toFixed(2)}{" "}
                      for {parsedQuantity} doors)
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
