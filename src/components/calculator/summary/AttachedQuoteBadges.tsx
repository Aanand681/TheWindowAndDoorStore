import React from "react"
import { Paperclip, Sparkles, Scale } from "lucide-react"
import { formatMoney } from "@/lib/promo-logic"
import { CachedAttachedInstallOption } from "@/hooks/calculator/supply-mode/supply-session-storage"

export interface AttachedQuoteBadgesProps {
  attachedSealedUnit?: any | null
  onRemoveAttachedSealedUnit?: () => void
  attachedDoorQuote?: any | null
  onRemoveAttachedDoorQuote?: () => void
  attachedUpgrade?: { title: string; amountPreTaxCents: number } | null
  onRemoveAttachedUpgrade?: () => void
  attachedInstallOption?: CachedAttachedInstallOption | null
  onRemoveAttachedInstallOption?: () => void
  dynamicInstallDeltaCents?: number
  isSupply?: boolean
  hasSupplyJC?: boolean
}

export function AttachedQuoteBadges({
  attachedSealedUnit,
  onRemoveAttachedSealedUnit,
  attachedDoorQuote,
  onRemoveAttachedDoorQuote,
  attachedUpgrade,
  onRemoveAttachedUpgrade,
  attachedInstallOption,
  onRemoveAttachedInstallOption,
  dynamicInstallDeltaCents,
  isSupply,
  hasSupplyJC,
}: AttachedQuoteBadgesProps) {
  if (
    !attachedSealedUnit &&
    !attachedDoorQuote &&
    !attachedUpgrade &&
    !attachedInstallOption?.enabled
  )
    return null

  const isCurrentlySupply =
    isSupply !== undefined ? isSupply : attachedInstallOption?.mode !== "install"

  const installCents =
    dynamicInstallDeltaCents && dynamicInstallDeltaCents > 0
      ? dynamicInstallDeltaCents
      : attachedInstallOption?.amountPreTaxCents || 0

  const withSupplyJC =
    hasSupplyJC !== undefined
      ? Boolean(hasSupplyJC)
      : Boolean(attachedInstallOption?.hasSupplyJC)

  const attachedTitle = !isCurrentlySupply
    ? withSupplyJC
      ? `Option with J&C for Supply Only (-${formatMoney(installCents)})`
      : `Option for Supply Only (-${formatMoney(installCents)})`
    : `Option for Installation (+${formatMoney(installCents)})`

  return (
    <>
      {/* Attached Option for Installation / Supply Badge */}
      {attachedInstallOption?.enabled && (
        <div className="mb-2 flex items-center justify-between rounded-lg border border-blue-500/30 bg-blue-500/10 p-2 text-xs text-blue-800 dark:text-blue-300">
          <span className="flex items-center gap-1.5 font-semibold">
            <Scale className="h-3.5 w-3.5 text-blue-600" />
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
      {/* Attached Comparison Upgrade / Option Badge */}
      {attachedUpgrade && attachedUpgrade.amountPreTaxCents !== 0 && (
        <div
          className={`mb-2 flex items-center justify-between rounded-lg border p-2 text-xs ${
            attachedUpgrade.amountPreTaxCents < 0
              ? "border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-300"
              : "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300"
          }`}
        >
          <span className="flex items-center gap-1.5 font-semibold">
            <Sparkles
              className={`h-3.5 w-3.5 ${
                attachedUpgrade.amountPreTaxCents < 0
                  ? "text-sky-600"
                  : "text-amber-600"
              }`}
            />
            <span>
              {attachedUpgrade.amountPreTaxCents < 0 ? "Attached Option: " : "Attached Upgrade: "}
              {attachedUpgrade.title} (
              {attachedUpgrade.amountPreTaxCents < 0 ? "-" : "+"}
              {formatMoney(Math.abs(attachedUpgrade.amountPreTaxCents))})
            </span>
          </span>
          {onRemoveAttachedUpgrade && (
            <button
              type="button"
              onClick={onRemoveAttachedUpgrade}
              className="cursor-pointer text-[11px] font-bold text-destructive hover:underline"
            >
              Detach
            </button>
          )}
        </div>
      )}

      {/* Attached Sealed Unit Badge */}
      {attachedSealedUnit && (
        <div className="mb-2 flex items-center justify-between rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2 text-xs text-emerald-800 dark:text-emerald-300">
          <span className="flex items-center gap-1.5 font-semibold">
            <Paperclip className="h-3.5 w-3.5 text-emerald-600" />
            <span>
              Combined Quote: Attached #{attachedSealedUnit.quoteNumber}
            </span>
          </span>
          {onRemoveAttachedSealedUnit && (
            <button
              type="button"
              onClick={onRemoveAttachedSealedUnit}
              className="cursor-pointer text-[11px] font-bold text-destructive hover:underline"
            >
              Detach
            </button>
          )}
        </div>
      )}

      {/* Attached Door Quote Badge */}
      {attachedDoorQuote && (
        <div className="mb-2 flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-800 dark:text-amber-300">
          <span className="flex items-center gap-1.5 font-semibold">
            <Paperclip className="h-3.5 w-3.5 text-amber-600" />
            <span>
              Combined Quote: Attached Door #{attachedDoorQuote.quoteNumber}
            </span>
          </span>
          {onRemoveAttachedDoorQuote && (
            <button
              type="button"
              onClick={onRemoveAttachedDoorQuote}
              className="cursor-pointer text-[11px] font-bold text-destructive hover:underline"
            >
              Detach
            </button>
          )}
        </div>
      )}
    </>
  )
}
