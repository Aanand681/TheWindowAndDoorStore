"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Scale } from "lucide-react"
import { toast } from "sonner"
import { formatMoney } from "@/lib/promo-logic"
import { CachedAttachedInstallOption } from "@/hooks/calculator/supply-mode/supply-session-storage"
import { AttachedQuoteItemBadge } from "@/components/shared/AttachedQuoteItemBadge"
import { restoreAttachedQuoteDraft, QuoteType } from "@/lib/quote-drafts-storage"

export interface UnifiedAttachedBadgesProps {
  hostType: QuoteType
  attachedWindowQuote?: any | null
  onRemoveAttachedWindowQuote?: () => void
  attachedSealedUnit?: any | null
  onRemoveAttachedSealedUnit?: () => void
  attachedDoorQuote?: any | null
  onRemoveAttachedDoorQuote?: () => void
  attachedInstallOption?: CachedAttachedInstallOption | null
  onRemoveAttachedInstallOption?: () => void
  dynamicInstallDeltaCents?: number
  dynamicInstallDeltaDollars?: number
  isSupply?: boolean
  hasSupplyJC?: boolean
  includeHardwareSummary?: boolean
}

const ATTACHED_ORDER: Record<QuoteType, QuoteType[]> = {
  window: ["sealed_unit", "door"],
  door: ["window", "sealed_unit"],
  sealed_unit: ["window", "door"],
}

const QUOTE_ROUTES: Record<QuoteType, { path: string; shortLabel: string }> = {
  window: { path: "/calculator", shortLabel: "Window Quote" },
  sealed_unit: { path: "/sealed-units", shortLabel: "SU" },
  door: { path: "/doors", shortLabel: "Door Quote" },
}

export function UnifiedAttachedBadges({
  hostType,
  attachedWindowQuote,
  onRemoveAttachedWindowQuote,
  attachedSealedUnit,
  onRemoveAttachedSealedUnit,
  attachedDoorQuote,
  onRemoveAttachedDoorQuote,
  attachedInstallOption,
  onRemoveAttachedInstallOption,
  dynamicInstallDeltaCents,
  dynamicInstallDeltaDollars,
  isSupply,
  hasSupplyJC,
  includeHardwareSummary = false,
}: UnifiedAttachedBadgesProps) {
  const router = useRouter()

  const quoteByType: Record<QuoteType, { data: any; onRemove?: () => void }> = {
    window: { data: attachedWindowQuote, onRemove: onRemoveAttachedWindowQuote },
    sealed_unit: { data: attachedSealedUnit, onRemove: onRemoveAttachedSealedUnit },
    door: { data: attachedDoorQuote, onRemove: onRemoveAttachedDoorQuote },
  }

  const visibleQuotes = ATTACHED_ORDER[hostType].filter(
    (t) => Boolean(quoteByType[t].data)
  )
  const showInstallOption = Boolean(attachedInstallOption?.enabled)

  if (visibleQuotes.length === 0 && !showInstallOption) {
    return null
  }

  const isCurrentlySupply =
    isSupply !== undefined ? isSupply : attachedInstallOption?.mode !== "install"

  const installCents =
    dynamicInstallDeltaCents && dynamicInstallDeltaCents > 0
      ? dynamicInstallDeltaCents
      : dynamicInstallDeltaDollars && dynamicInstallDeltaDollars > 0
        ? Math.round(dynamicInstallDeltaDollars * 100)
        : attachedInstallOption?.amountPreTaxCents || 0

  const withSupplyJC =
    hasSupplyJC !== undefined
      ? Boolean(hasSupplyJC)
      : Boolean(attachedInstallOption?.hasSupplyJC)

  const hwTotal = includeHardwareSummary
    ? Number(attachedInstallOption?.hardwareTotal) || 0
    : 0
  const hardwareSummary = hwTotal > 0 ? ` incl. $${hwTotal.toFixed(2)} hardware` : ""

  const attachedTitle = !isCurrentlySupply
    ? withSupplyJC
      ? `Option with J&C for Supply Only (-${formatMoney(installCents)})`
      : `Option for Supply Only (-${formatMoney(installCents)})`
    : `Option for Installation (+${formatMoney(installCents)}${hardwareSummary})`

  return (
    <div className="space-y-2">
      {showInstallOption && (
        <div className="flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-500/10 p-2 text-xs text-blue-800 dark:text-blue-300">
          <span className="flex items-center gap-1.5 font-semibold">
            <Scale className="h-3.5 w-3.5 shrink-0 text-blue-600" />
            <span>Attached: {attachedTitle}</span>
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

      {visibleQuotes.map((qType) => {
        const { data, onRemove } = quoteByType[qType]
        const meta = QUOTE_ROUTES[qType]
        return (
          <AttachedQuoteItemBadge
            key={qType}
            type={qType}
            quoteNumber={data.quoteNumber}
            total={data.totals?.grandTotal || data.taxTotals?.grandTotal}
            onEdit={() => {
              const draft = restoreAttachedQuoteDraft(qType, data)
              router.push(`${meta.path}?loadDraftId=${draft.id}`)
            }}
            onDetach={() => {
              restoreAttachedQuoteDraft(qType, data)
              if (onRemove) onRemove()
              toast.info(
                `Detached ${meta.shortLabel} #${data.quoteNumber}. Restored to Saved Quotes.`
              )
            }}
          />
        )
      })}
    </div>
  )
}
