"use client"

import React from "react"
import { formatMoney } from "@/lib/promo-logic"
import type { InvoiceCalculationsResult } from "../types"
import {
  readSessionInstallState,
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

  React.useEffect(() => {
    if (!calc.isSupplyOnly) return
    if (amountPreTaxCents && amountPreTaxCents > 0) {
      setResolvedCents(amountPreTaxCents)
      return
    }
    const cachedOption = readSessionAttachedInstallOption()
    if (cachedOption?.amountPreTaxCents && cachedOption.amountPreTaxCents > 0) {
      setResolvedCents(cachedOption.amountPreTaxCents)
      return
    }
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
  }, [amountPreTaxCents, calc.jcItems, calc.isLooseSupplyJC, calc.isSupplyOnly])

  // Only render on supply quotes
  if (!calc.isSupplyOnly) return null

  // 1. Identify product categories in quote
  const parts: string[] = []
  if (calc.hasWindows) parts.push("Windows")
  if (calc.hasSealedUnits) parts.push("Sealed Units")
  if (calc.hasDoors) parts.push("Doors")
  const productText = parts.length > 0 ? parts.join(" / ") : "Windows"

  // 2. Determine Pre-Tax Extra Price
  const finalCents = resolvedCents ?? amountPreTaxCents ?? 85000

  const { smallFs, microFs } = calc

  return (
    <div className="rounded border border-[#cbd5e1] bg-white p-2 text-[#0f172a] shadow-2xs">
      <div className="flex items-center gap-2">
        <div className="h-3.5 w-3.5 shrink-0 rounded-xs border-2 border-[#475569] bg-white" />
        <span
          style={{ fontSize: `${smallFs}px` }}
          className="font-bold tracking-wider text-[#0f172a] uppercase"
        >
          Option for Installation
        </span>
      </div>
      <div className="mt-1 flex items-center justify-between border-t border-[#e2e8f0] pt-1">
        <span
          style={{ fontSize: `${microFs}px` }}
          className="font-medium text-[#334155]"
        >
          ({productText}) with Installation add:
        </span>
        <span
          style={{ fontSize: `${smallFs}px` }}
          className="font-mono font-bold text-[#0f172a]"
        >
          +{formatMoney(finalCents)}
        </span>
      </div>
    </div>
  )
}

export default InstallationOptionCard
