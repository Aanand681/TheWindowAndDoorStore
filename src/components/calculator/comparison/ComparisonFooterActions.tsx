import React from "react"
import { CheckCircle2, RotateCcw, Check, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UIWindowItem } from "@/hooks/useCalculatorWindows"
import { AttachedUpgradeOption, ComparisonOverridesPayload } from "./types"

interface ComparisonFooterActionsProps {
  attachedUpgrade: AttachedUpgradeOption | null
  onClose: () => void
  appliedOption: "A" | "B"
  isComparisonStaging?: boolean
  effectiveOptionBWindows: UIWindowItem[] | null
  optionBMeta: { customerName?: string; quoteNumber?: string }
  currentWindows: UIWindowItem[]
  getOverridesPayload: () => ComparisonOverridesPayload
  onApplyOption: (
    target: "A" | "B",
    windows: UIWindowItem[],
    meta?: { customerName?: string; quoteNumber?: string },
    overrides?: ComparisonOverridesPayload
  ) => void
  onApplyAndCustomize?: (
    windows: UIWindowItem[],
    meta?: { customerName?: string; quoteNumber?: string },
    overrides?: ComparisonOverridesPayload
  ) => void
  onKeepOptionB?: () => void
}

export function ComparisonFooterActions({
  attachedUpgrade,
  onClose,
  appliedOption,
  isComparisonStaging = false,
  effectiveOptionBWindows,
  optionBMeta,
  currentWindows,
  getOverridesPayload,
  onApplyOption,
  onApplyAndCustomize,
  onKeepOptionB,
}: ComparisonFooterActionsProps) {
  const hasOptionBWindows = Boolean(
    effectiveOptionBWindows && effectiveOptionBWindows.length > 0
  )

  return (
    <div className="flex shrink-0 flex-col items-center justify-between gap-3 border-t border-border/60 bg-muted/20 p-4 sm:flex-row sm:px-6">
      <div className="flex w-full items-center gap-2 sm:w-auto">
        {attachedUpgrade && (
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Optional upgrade offer attached to PDF</span>
          </span>
        )}
      </div>

      <div className="flex w-full flex-wrap items-center justify-end gap-2.5 sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="cursor-pointer text-xs font-semibold"
        >
          Close
        </Button>

        {/* Hybrid Action: Full Workspace Edit Button */}
        {onApplyAndCustomize && hasOptionBWindows && !isComparisonStaging && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (effectiveOptionBWindows) {
                onApplyAndCustomize(
                  effectiveOptionBWindows,
                  optionBMeta,
                  getOverridesPayload()
                )
                onClose()
              }
            }}
            className="cursor-pointer gap-1.5 border-amber-500/40 text-xs font-semibold text-amber-700 shadow-xs hover:bg-amber-500/10 dark:text-amber-300"
            title="Loads Option B into calculator while preserving Base Quote A so you can adjust crew, distance, or promo"
          >
            <Pencil className="h-3.5 w-3.5 text-amber-500" />
            <span>Apply &amp; Customize in Full Calculator</span>
          </Button>
        )}

        {/* Two-Way Swapping Action Button */}
        {appliedOption === "B" || isComparisonStaging ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onApplyOption("A", currentWindows)
                onClose()
              }}
              className="cursor-pointer gap-1.5 border-primary text-xs font-bold text-primary shadow-md hover:bg-primary/10"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Apply Option A (Revert to Base)</span>
            </Button>
            {onKeepOptionB && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  onKeepOptionB()
                  onClose()
                }}
                className="cursor-pointer gap-1.5 bg-emerald-600 text-xs font-bold text-white shadow-md hover:bg-emerald-700"
              >
                <Check className="h-4 w-4" />
                <span>Keep Option B as Primary</span>
              </Button>
            )}
          </div>
        ) : (
          <Button
            variant="default"
            size="sm"
            disabled={!hasOptionBWindows}
            onClick={() => {
              if (effectiveOptionBWindows) {
                onApplyOption(
                  "B",
                  effectiveOptionBWindows,
                  optionBMeta,
                  getOverridesPayload()
                )
                onClose()
              }
            }}
            className="cursor-pointer gap-1.5 bg-amber-500 text-xs font-bold text-amber-950 shadow-md hover:bg-amber-600"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Apply Option B to Quote</span>
          </Button>
        )}
      </div>
    </div>
  )
}
