"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { CachedAttachedInstallOption } from "@/hooks/calculator/supply-mode/supply-session-storage"
import { AttachedQuoteItemBadge } from "@/components/shared/AttachedQuoteItemBadge"
import { restoreAttachedQuoteDraft } from "@/lib/quote-drafts-storage"

export interface SealedUnitSummaryAttachedBadgesProps {
  attachedWindowQuote?: any | null
  attachedDoorQuote?: any | null
  attachedInstallOption?: CachedAttachedInstallOption | null
  onRemoveAttachedWindowQuote?: () => void
  onRemoveAttachedDoorQuote?: () => void
  onRemoveAttachedInstallOption?: () => void
  dynamicInstallDeltaDollars?: number
  isService?: boolean
  mode?: string
}

export function SealedUnitSummaryAttachedBadges({
  attachedWindowQuote,
  attachedDoorQuote,
  attachedInstallOption,
  onRemoveAttachedWindowQuote,
  onRemoveAttachedDoorQuote,
  onRemoveAttachedInstallOption,
  dynamicInstallDeltaDollars,
  mode,
}: SealedUnitSummaryAttachedBadgesProps) {
  const router = useRouter()

  const hasAnyAttached = Boolean(
    attachedWindowQuote || attachedDoorQuote || attachedInstallOption?.enabled
  )
  if (!hasAnyAttached) return null

  const isCurrentlySupply =
    mode !== undefined
      ? mode === "supply_only"
      : attachedInstallOption?.mode !== "install"

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
                ? "Option for Installation Attached (+$"
                : attachedInstallOption?.hasSupplyJC
                  ? "Option with J&C for Supply Only Attached (-$"
                  : "Option for Supply Only Attached (-$"}
              {displayDollars.toFixed(2)})
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

      {attachedDoorQuote && (
        <AttachedQuoteItemBadge
          type="door"
          quoteNumber={attachedDoorQuote.quoteNumber}
          total={
            attachedDoorQuote.totals?.grandTotal ||
            attachedDoorQuote.taxTotals?.grandTotal
          }
          onEdit={() => {
            const draft = restoreAttachedQuoteDraft("door", attachedDoorQuote)
            router.push(`/doors?loadDraftId=${draft.id}`)
          }}
          onDetach={() => {
            restoreAttachedQuoteDraft("door", attachedDoorQuote)
            if (onRemoveAttachedDoorQuote) onRemoveAttachedDoorQuote()
            toast.info(
              `Detached Door Quote #${attachedDoorQuote.quoteNumber}. Restored to Saved Quotes.`
            )
          }}
        />
      )}
    </div>
  )
}
