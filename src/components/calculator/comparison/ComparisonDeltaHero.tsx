import React from "react"
import {
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  TrendingDown,
} from "lucide-react"
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

interface ComparisonDeltaHeroProps {
  delta: ComparisonDelta | null
  optionBFinancials: OptionBFinancials | null
  attachedUpgrade: AttachedUpgradeOption | null
  customUpgradeTitle: string
  detectedUpgradeTitle: string
  onUpgradeTitleChange: (title: string) => void
  onToggleAttachUpgrade: () => void
}

export function ComparisonDeltaHero({
  delta,
  optionBFinancials,
  attachedUpgrade,
  customUpgradeTitle,
  detectedUpgradeTitle,
  onUpgradeTitleChange,
  onToggleAttachUpgrade,
}: ComparisonDeltaHeroProps) {
  if (!delta || !optionBFinancials) return null

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 shadow-md transition-all sm:p-5",
        delta.isUpgrade
          ? "border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-primary/5 to-amber-500/10"
          : delta.isSavings
            ? "border-emerald-500/30 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10"
            : "border-border bg-muted/40"
      )}
    >
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <div
            className={cn(
              "shrink-0 rounded-2xl p-3 shadow-sm",
              delta.isUpgrade
                ? "bg-amber-500 text-amber-950"
                : delta.isSavings
                  ? "bg-emerald-500 text-emerald-950"
                  : "bg-muted text-foreground"
            )}
          >
            {delta.isUpgrade ? (
              <ArrowUpRight className="h-6 w-6 stroke-[2.5]" />
            ) : delta.isSavings ? (
              <TrendingDown className="h-6 w-6 stroke-[2.5]" />
            ) : (
              <CheckCircle2 className="h-6 w-6" />
            )}
          </div>
          <div>
            <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
              {delta.isUpgrade
                ? "Upgrade Cost Difference (Pre-Tax)"
                : delta.isSavings
                  ? "Cost Savings Difference (Pre-Tax)"
                  : "Exact Price Match"}
            </span>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-2xl font-black text-foreground sm:text-3xl">
                {delta.preTax >= 0 ? "+" : ""}
                {formatMoney(delta.preTax)}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                pre-tax
              </span>
            </div>
          </div>
        </div>

        {/* Attach to Quote PDF Action & Editable Upgrade Description */}
        {delta.preTax > 0 && (
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-end">
            <div className="flex w-full flex-col gap-1 sm:w-80">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="upgradeTitleInput"
                  className="text-[11px] font-semibold text-muted-foreground"
                >
                  Upgrade Description on Quote PDF
                </Label>
                <span className="text-[10px] font-medium text-amber-600 dark:text-amber-400">
                  Editable
                </span>
              </div>
              <Input
                id="upgradeTitleInput"
                value={customUpgradeTitle || detectedUpgradeTitle}
                onChange={(e) => onUpgradeTitleChange(e.target.value)}
                placeholder="e.g. Triple Pane (Solar Shield), Brick Mould..."
                className="h-8 bg-background text-xs font-medium"
              />
              {/* Quick Presets */}
              <div className="mt-0.5 flex flex-wrap gap-1">
                {UPGRADE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onUpgradeTitleChange(preset)}
                    className="cursor-pointer rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant={attachedUpgrade ? "default" : "outline"}
              size="sm"
              onClick={onToggleAttachUpgrade}
              className={cn(
                "h-8 shrink-0 cursor-pointer gap-1.5 text-xs font-bold shadow-xs",
                attachedUpgrade
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "border-amber-500/40 text-amber-600 hover:border-amber-500 hover:bg-amber-500/10 dark:text-amber-400"
              )}
            >
              {attachedUpgrade ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-white" />
                  <span>Attached to Quote PDF</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-amber-500" />
                  <span>Attach Upgrade to Quote PDF</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
