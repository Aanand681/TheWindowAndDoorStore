"use client"

import React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sparkles } from "lucide-react"
import { formatMoney } from "@/lib/promo-logic"
import { QuoteOptionCard } from "@/components/shared/summary/QuoteOptionCard"

export interface UnifiedUpgradeCalloutsProps {
  // Host Window 5-Year Free Labour Upgrade toggle
  showLabourUpgradeCheckbox?: boolean
  wantsUpgrade?: boolean
  setWantsUpgrade?: (val: boolean) => void
  upgrade?: any
  shownUpgrade?: number
  isReadOnly?: boolean
  // Host Window Comparison Option (Dual vs Triple Pane)
  attachedUpgrade?: { title: string; amountPreTaxCents: number } | null
  onRemoveAttachedUpgrade?: () => void
  // Host Door upgrades
  doorUpgradeItems?: any[]
  // Attached Door / Window upgrades
  attachedDoorQuote?: any | null
  attachedWindowQuote?: any | null
}

export function UnifiedUpgradeCallouts({
  showLabourUpgradeCheckbox = false,
  wantsUpgrade = false,
  setWantsUpgrade,
  upgrade,
  shownUpgrade = 0,
  isReadOnly = false,
  attachedUpgrade = null,
  onRemoveAttachedUpgrade,
  doorUpgradeItems = [],
  attachedDoorQuote,
  attachedWindowQuote,
}: UnifiedUpgradeCalloutsProps) {
  const attachedDoorRawItems =
    attachedDoorQuote?.lineItems || attachedDoorQuote?.items || []
  const attachedDoorUpgrades = Array.isArray(attachedDoorRawItems)
    ? attachedDoorRawItems.filter(
        (item: any) =>
          item?.upgradeOption &&
          Number(item.upgradeOption?.subtotalDifference || 0) > 0 &&
          (item.upgradeOption?.enabled === undefined ||
            Boolean(item.upgradeOption.enabled))
      )
    : []

  const hasHostUpgrade = Boolean(
    attachedUpgrade && attachedUpgrade.amountPreTaxCents !== 0
  )
  const hasWindowUpgrade = Boolean(
    attachedWindowQuote?.attachedUpgrade &&
      Number(attachedWindowQuote.attachedUpgrade.amountPreTaxCents || 0) !== 0
  )

  if (
    !showLabourUpgradeCheckbox &&
    !hasHostUpgrade &&
    doorUpgradeItems.length === 0 &&
    attachedDoorUpgrades.length === 0 &&
    !hasWindowUpgrade
  ) {
    return null
  }

  return (
    <div className="space-y-2.5">
      {hasHostUpgrade && attachedUpgrade && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
          <QuoteOptionCard
            title={attachedUpgrade.title}
            subtitle="Optional Quote Option • Not added to base total"
            amountPreTaxCents={attachedUpgrade.amountPreTaxCents}
            onRemove={
              onRemoveAttachedUpgrade && !isReadOnly
                ? onRemoveAttachedUpgrade
                : undefined
            }
            removeTitle="Remove upgrade option"
          />
        </div>
      )}
      {showLabourUpgradeCheckbox && setWantsUpgrade && (
        <div className="flex items-start space-x-2.5 rounded-xl border border-primary/15 bg-primary/5 p-3">
          <Checkbox
            id="summaryUpgrade"
            disabled={isReadOnly}
            checked={wantsUpgrade}
            onCheckedChange={(c) => setWantsUpgrade(!!c)}
            className="mt-0.5"
          />
          <div className="flex-1 space-y-0.5">
            <Label htmlFor="summaryUpgrade" className="cursor-pointer text-xs font-semibold">
              Include 5-year free labour upgrade
            </Label>
            <p className="text-[10px] text-muted-foreground">
              Optional. Shows upgrade price only; not added to final total.
            </p>
            {wantsUpgrade && upgrade && (
              <div className="flex items-center justify-between pt-1 text-xs font-semibold text-primary">
                <span>Upgrade ({upgrade?.rate})</span>
                <span className="shrink-0 font-mono whitespace-nowrap">
                  {shownUpgrade > 0 ? `+${formatMoney(shownUpgrade)}` : "+$0.00"}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {doorUpgradeItems.length > 0 && (
        <div className="space-y-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            Optional Door Upgrade:
          </div>
          <div className="space-y-1 divide-y divide-emerald-500/20">
            {doorUpgradeItems.map((item, idx) => {
              const upgradeDiff =
                (item.upgradeOption?.subtotalDifference || 0) * (item.quantity || 1)
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

      {attachedDoorUpgrades.length > 0 && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>
              Optional Door Upgrades
              {attachedDoorQuote?.quoteNumber ? ` (#${attachedDoorQuote.quoteNumber})` : ""}
            </span>
          </div>
          <div className="mt-1.5 space-y-1 divide-y divide-emerald-500/20">
            {attachedDoorUpgrades.map((item: any, idx: number) => {
              const perUnit = Number(item.upgradeOption?.subtotalDifference || 0)
              const qty = Number(item.quantity) || 1
              return (
                <div
                  key={item.id || idx}
                  className="flex items-center justify-between gap-2 pt-1 first:pt-0 text-muted-foreground"
                >
                  <span className="truncate pr-2">
                    Line {idx + 1}: {item.upgradeOption?.title || item.customDescription || item.presetLabel}
                  </span>
                  <span className="shrink-0 font-mono font-semibold text-foreground">
                    +{formatMoney(Math.round(perUnit * 100))}/unit
                    {qty > 1 ? ` (+${(perUnit * qty).toFixed(2)} total)` : ""}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {hasWindowUpgrade && attachedWindowQuote?.attachedUpgrade && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
          <QuoteOptionCard
            title={attachedWindowQuote.attachedUpgrade.title}
            subtitle="Optional Window Quote Option • Not added to base total"
            amountPreTaxCents={Number(
              attachedWindowQuote.attachedUpgrade.amountPreTaxCents || 0
            )}
          />
        </div>
      )}
    </div>
  )
}
