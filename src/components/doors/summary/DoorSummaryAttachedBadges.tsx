"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { CachedAttachedInstallOption } from "@/hooks/calculator/supply-mode/supply-session-storage"
import { AttachedQuoteItemBadge } from "@/components/shared/AttachedQuoteItemBadge"
import { restoreAttachedQuoteDraft } from "@/lib/quote-drafts-storage"

export interface DoorSummaryAttachedBadgesProps {
  attachedWindowQuote?: any | null
  attachedSealedUnit?: any | null
  attachedInstallOption?: CachedAttachedInstallOption | null
  onRemoveAttachedWindowQuote?: () => void
  onRemoveAttachedSealedUnit?: () => void
  onRemoveAttachedInstallOption?: () => void
  dynamicInstallDeltaDollars?: number
  mode?: string
}

export function DoorSummaryAttachedBadges({
  attachedWindowQuote,
  attachedSealedUnit,
  attachedInstallOption,
  onRemoveAttachedWindowQuote,
  onRemoveAttachedSealedUnit,
  onRemoveAttachedInstallOption,
  dynamicInstallDeltaDollars,
  mode,
}: DoorSummaryAttachedBadgesProps) {
  const router = useRouter()

  const hasAnyAttached = Boolean(
    attachedWindowQuote || attachedSealedUnit || attachedInstallOption?.enabled
  )
  if (!hasAnyAttached) return null

  const isCurrentlySupply =
    mode !== undefined
      ? mode === "supply_only"
      : attachedInstallOption?.mode !== "install"

  const hwTotal = Number(attachedInstallOption?.hardwareTotal) || 0
  const hardwareSummary =
    hwTotal > 0 ? ` incl. $${hwTotal.toFixed(2)} hardware` : ""

  const displayDollars =
    dynamicInstallDeltaDollars && dynamicInstallDeltaDollars > 0
      ? dynamicInstallDeltaDollars
      : attachedInstallOption?.amountPreTaxCents &&
          attachedInstallOption.amountPreTaxCents > 0
        ? attachedInstallOption.amountPreTaxCents / 100
        : 0

  return (
    <div className="space-y-1.5 pb-1">
      {attachedInstallOption?.enabled && (
        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 p-2 text-xs text-primary">
          <span className="flex items-center gap-1.5 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            <span>
              {isCurrentlySupply
                ? `Option for Installation Attached (+$${displayDollars.toFixed(2)}${hardwareSummary})`
                : attachedInstallOption?.hasSupplyJC
                  ? `Option with J&C for Supply Only Attached (-$${displayDollars.toFixed(2)})`
                  : `Option for Supply Only Attached (-$${displayDollars.toFixed(2)})`}
            </span>
          </span>
          {onRemoveAttachedInstallOption && (
            <button
              type="button"
              onClick={onRemoveAttachedInstallOption}
              className="cursor-pointer text-[11px] font-bold text-destructive hover:underline"
            >
              Detach
            </button>
          )}
        </div>
      )}
      {attachedWindowQuote && (
        <AttachedQuoteItemBadge
          type="window"
          quoteNumber={attachedWindowQuote.quoteNumber}
          total={
            attachedWindowQuote.totals?.grandTotal ||
            attachedWindowQuote.taxTotals?.grandTotal
          }
          onEdit={() => {
            const draft = restoreAttachedQuoteDraft(
              "window",
              attachedWindowQuote
            )
            router.push(`/calculator?loadDraftId=${draft.id}`)
          }}
          onDetach={() => {
            restoreAttachedQuoteDraft("window", attachedWindowQuote)
            if (onRemoveAttachedWindowQuote) onRemoveAttachedWindowQuote()
            toast.info(
              `Detached Window Quote #${attachedWindowQuote.quoteNumber}. Restored to Saved Quotes.`
            )
          }}
        />
      )}

      {attachedSealedUnit && (
        <AttachedQuoteItemBadge
          type="sealed_unit"
          quoteNumber={attachedSealedUnit.quoteNumber}
          total={
            attachedSealedUnit.totals?.grandTotal ||
            attachedSealedUnit.taxTotals?.grandTotal
          }
          onEdit={() => {
            const draft = restoreAttachedQuoteDraft(
              "sealed_unit",
              attachedSealedUnit
            )
            router.push(`/sealed-units?loadDraftId=${draft.id}`)
          }}
          onDetach={() => {
            restoreAttachedQuoteDraft("sealed_unit", attachedSealedUnit)
            if (onRemoveAttachedSealedUnit) onRemoveAttachedSealedUnit()
            toast.info(
              `Detached Sealed Unit #${attachedSealedUnit.quoteNumber}. Restored to Saved Quotes.`
            )
          }}
        />
      )}
    </div>
  )
}
