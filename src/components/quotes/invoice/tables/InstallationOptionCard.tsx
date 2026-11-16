"use client"

import React from "react"
import { formatMoney } from "@/lib/promo-logic"
import type { InvoiceCalculationsResult } from "../types"
import {
  readSessionInstallState,
  readSessionSupplyState,
  readSessionAttachedInstallOption,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

export interface InstallationOptionCardProps {
  calc: InvoiceCalculationsResult
  amountPreTaxCents?: number
}

export function InstallationOptionCard({
  calc,
  amountPreTaxCents,
}: InstallationOptionCardProps) {
  const [resolvedCents, setResolvedCents] = React.useState<number | undefined>(
    amountPreTaxCents
  )

  const isSupplyOnly = Boolean(calc.isSupplyOnly)

  React.useEffect(() => {
    if (amountPreTaxCents !== undefined && amountPreTaxCents !== 0) {
      setResolvedCents(Math.abs(amountPreTaxCents))
      return
    }
    const cachedOption = readSessionAttachedInstallOption()
    if (cachedOption?.amountPreTaxCents && cachedOption.amountPreTaxCents > 0) {
      setResolvedCents(cachedOption.amountPreTaxCents)
      return
    }

    if (isSupplyOnly) {
      const cachedInstall = readSessionInstallState()
      const installLabour =
        cachedInstall?.installLabourAmount ||
        (cachedInstall?.customLabour
          ? parseFloat(cachedInstall.customLabour) || 0
          : 0)
      const installMisc =
        cachedInstall?.installMiscAmount ||
        (cachedInstall?.customMisc
          ? parseFloat(cachedInstall.customMisc) || 0
          : 0)
      const winJCCents = calc.jcItems.reduce(
        (acc: number, curr: { label: string; amount: number }) =>
          acc + curr.amount,
        0
      )
      const supplyJC = calc.isLooseSupplyJC ? winJCCents / 100 : 0
      const installJC =
        cachedInstall?.installJCAmount ||
        (cachedInstall?.customJC ? parseFloat(cachedInstall.customJC) || 0 : 0)
      const extraJC = Math.max(0, installJC - supplyJC)
      const extraPreTax = Math.round(
        (extraJC + installLabour + installMisc) * 100
      )
      setResolvedCents(extraPreTax > 0 ? extraPreTax : 85000)
    } else {
      // In Installation mode: difference to supply is the labour + misc + extra JC
      const cachedSupply = readSessionSupplyState()
      const winJCCents = calc.jcItems.reduce(
        (acc: number, curr: { label: string; amount: number }) =>
          acc + curr.amount,
        0
      )
      const installJC = !calc.isLooseSupplyJC ? winJCCents / 100 : 0
      const supplyJC = cachedSupply?.customJC
        ? parseFloat(cachedSupply.customJC) || 0
        : cachedSupply?.supplyJCAmount !== undefined
          ? cachedSupply.supplyJCAmount
          : 0
      const extraJC = Math.max(0, installJC - supplyJC)
      const totalLabourMiscCents =
        (calc.effectiveLabourTotalCents || 0) +
        (calc.effectiveMiscTotalCents || 0) +
        Math.round(extraJC * 100)
      setResolvedCents(totalLabourMiscCents > 0 ? totalLabourMiscCents : 85000)
    }
  }, [
    amountPreTaxCents,
    calc.jcItems,
    calc.isLooseSupplyJC,
    isSupplyOnly,
    calc.effectiveLabourTotalCents,
    calc.effectiveMiscTotalCents,
  ])

  // 1. Identify product categories in quote
  const parts: string[] = []
  if (calc.hasWindows) parts.push("Windows")
  if (calc.hasSealedUnits) parts.push("Sealed Units")
  if (calc.hasDoors) parts.push("Doors")
  const productText = parts.length > 0 ? parts.join(" / ") : "Windows"

  // 2. Determine Pre-Tax Extra / Deduct Price
  const finalCents =
    resolvedCents ?? (amountPreTaxCents ? Math.abs(amountPreTaxCents) : 85000)

  const { smallFs, microFs } = calc
  const cachedSupply = readSessionSupplyState()
  const hasSupplyJC = Boolean(
    (cachedSupply?.supplyJCAmount && cachedSupply.supplyJCAmount > 0) ||
      (cachedSupply?.customJC && parseFloat(cachedSupply.customJC) > 0)
  )

  return (
    <div className="rounded border border-[#cbd5e1] bg-white p-2 text-[#0f172a] shadow-2xs">
      <div className="flex items-center gap-2">
        <div className="h-3.5 w-3.5 shrink-0 rounded-xs border-2 border-[#475569] bg-white" />
        <span
          style={{ fontSize: `${smallFs}px` }}
          className="font-bold tracking-wider text-[#0f172a] uppercase"
        >
          {isSupplyOnly
            ? "Option for Installation"
            : hasSupplyJC
              ? "Option with J&C for Supply Only"
              : "Option for Supply Only"}
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between border-t border-[#e2e8f0] pt-1">
        <span
          style={{ fontSize: `${microFs}px` }}
          className="font-medium text-[#334155]"
        >
          {isSupplyOnly
            ? `${productText} with Installation add: `
            : hasSupplyJC
              ? `${productText} with J&C for Supply Only deduct:`
              : `${productText} Only for Supply deduct:`}
        </span>
        <span
          style={{ fontSize: `${smallFs}px` }}
          className={`font-mono font-bold ${isSupplyOnly ? "text-[#0f172a]" : "text-[#0284c7]"
            }`}
        >
          {isSupplyOnly ? "+" : "-"}
          {formatMoney(finalCents)}
        </span>
      </div>
    </div>
  )
}

export default InstallationOptionCard
