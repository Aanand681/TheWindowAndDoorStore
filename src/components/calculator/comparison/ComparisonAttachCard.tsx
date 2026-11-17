"use client"

import React from "react"
import { CheckCircle2, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatMoney } from "@/lib/promo-logic"
import {
  AttachedUpgradeOption,
  ComparisonDelta,
  OptionBFinancials,
} from "./types"
import { UPGRADE_PRESETS } from "./comparison-helpers"

export interface ComparisonAttachCardProps {
  delta: ComparisonDelta | null
  optionBFinancials: OptionBFinancials | null
  attachedUpgrade: AttachedUpgradeOption | null
  customUpgradeTitle: string
  detectedUpgradeTitle: string
  onUpgradeTitleChange: (title: string) => void
  onToggleAttachUpgrade: () => void
}

export function ComparisonAttachCard({
  delta,
  optionBFinancials,
  attachedUpgrade,
  customUpgradeTitle,
  detectedUpgradeTitle,
  onUpgradeTitleChange,
  onToggleAttachUpgrade,
}: ComparisonAttachCardProps) {
  if (!delta || !optionBFinancials || delta.preTax === 0) return null

  const isDeduct = delta.preTax < 0

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-sm transition-all sm:p-5",
        attachedUpgrade
          ? "border-emerald-500/40 bg-emerald-500/5 ring-1 ring-emerald-500/20"
          : isDeduct
            ? "border-sky-500/30 bg-sky-500/5"
            : "border-amber-500/30 bg-amber-500/5"
      )}
    >
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        {/* Left: Option Description Input & Presets */}
        <div className="w-full flex-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <Label
              htmlFor="upgradeTitleInput"
              className="text-xs font-bold text-foreground"
            >
              {isDeduct
                ? "Option / Deduct Description on Quote PDF"
                : "Option / Upgrade Description on Quote PDF"}
            </Label>
            <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
              Printed on customer quote
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Input
              id="upgradeTitleInput"
              value={customUpgradeTitle || detectedUpgradeTitle}
              onChange={(e) => onUpgradeTitleChange(e.target.value)}
              placeholder={
                isDeduct
                  ? "e.g. Dual Pane Option, Vinyl Casing..."
                  : "e.g. Triple Pane Upgrade, Option with Jambs & Casing..."
              }
              className="h-9 bg-background text-xs font-medium"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] font-semibold text-muted-foreground">
              Presets:
            </span>
            {UPGRADE_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => onUpgradeTitleChange(preset)}
                className="cursor-pointer rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Prominent Attach Button matching SupplyVsInstall layout */}
        <div className="flex w-full shrink-0 flex-col items-end gap-1.5 lg:w-auto">
          <Button
            type="button"
            variant={attachedUpgrade ? "default" : "outline"}
            size="default"
            onClick={onToggleAttachUpgrade}
            className={cn(
              "h-10 w-full cursor-pointer gap-2 px-5 text-xs font-bold shadow-sm sm:w-auto",
              attachedUpgrade
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : isDeduct
                  ? "border-sky-500/50 bg-sky-500/10 text-sky-700 hover:bg-sky-500/20 dark:text-sky-300"
                  : "border-amber-500/50 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 dark:text-amber-300"
            )}
          >
            {attachedUpgrade ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-white" />
                <span>Attached to Quote PDF (Click to Remove)</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>
                  Attach {isDeduct ? "Deduct Option" : "Upgrade Option"} to PDF (
                  {isDeduct ? "-" : "+"}
                  {formatMoney(Math.abs(delta.preTax))})
                </span>
              </>
            )}
          </Button>

          <span className="text-[11px] text-muted-foreground">
            {attachedUpgrade
              ? "This optional upgrade card will appear on the printed quote PDF."
              : "Option will display as an optional add/deduct card on the PDF."}
          </span>
        </div>
      </div>
    </div>
  )
}

