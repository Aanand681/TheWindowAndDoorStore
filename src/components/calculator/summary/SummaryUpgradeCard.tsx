"use client"

import React from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Sparkles } from "lucide-react"
import { formatMoney } from "@/lib/promo-logic"
import { CustomOptionsSection } from "./CustomOptionsSection"

export interface SummaryUpgradeCardProps {
  wantsUpgrade: boolean
  setWantsUpgrade: (val: boolean) => void
  isReadOnly?: boolean
  isReviewerOrAdmin?: boolean
  isOdooCompleted?: boolean
  upgrade?: any
  shownUpgrade?: number
  attachedDoorQuote?: any | null
  attachedUpgrade?: { title: string; amountPreTaxCents: number } | null
  reviewQuote?: any
  quoteNumber?: string
}

export function SummaryUpgradeCard({
  wantsUpgrade,
  setWantsUpgrade,
  isReadOnly = false,
  isReviewerOrAdmin = false,
  isOdooCompleted = false,
  upgrade,
  shownUpgrade = 0,
  attachedDoorQuote,
  reviewQuote,
  quoteNumber,
}: SummaryUpgradeCardProps) {
  const canModifyOptions =
    !isReadOnly || Boolean(isReviewerOrAdmin && !isOdooCompleted)

  return (
    <div className="mt-3 space-y-2.5">
      {/* 5-year free labour upgrade checkbox (placed right after 50/50 deposits) */}
      <div className="flex items-start space-x-2.5 rounded-xl border border-primary/15 bg-primary/5 p-3">
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
                {shownUpgrade > 0
                  ? `+${formatMoney(shownUpgrade)}`
                  : "+$0.00"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Attached Door Quote Optional Upgrade Items */}
      {attachedDoorQuote?.items &&
        attachedDoorQuote.items.some(
          (item: any) =>
            item.upgradeOption &&
            Number(item.upgradeOption?.subtotalDifference || 0) > 0
        ) && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 shrink-0 text-primary" />
              <div className="font-semibold text-foreground">
                Optional Door Upgrades from #{attachedDoorQuote.quoteNumber}
              </div>
            </div>
            <div className="mt-2 space-y-1.5 pt-1">
              {attachedDoorQuote.items
                .filter(
                  (item: any) =>
                    item.upgradeOption &&
                    Number(item.upgradeOption?.subtotalDifference || 0) > 0
                )
                .map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-muted-foreground"
                  >
                    <span className="truncate pr-2">
                      Line {idx + 1}: {item.upgradeOption?.title}
                    </span>
                    <span className="shrink-0 font-mono font-medium text-foreground">
                      +
                      {formatMoney(
                        Math.round(
                          Number(
                            item.upgradeOption?.subtotalDifference || 0
                          ) * 100
                        )
                      )}
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

      {/* Custom Quote Options & Inline Add/Edit */}
      <CustomOptionsSection
        canModifyOptions={canModifyOptions}
        reviewQuote={reviewQuote}
        quoteNumber={quoteNumber}
      />
    </div>
  )
}
