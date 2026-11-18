"use client"

import React from "react"
import { formatMoney } from "@/lib/promo-logic"
import type { InvoiceCalculationsResult } from "../types"
import {
  readSessionInstallState,
  readSessionSupplyState,
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
  type CustomQuoteOption,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

export interface QuoteOptionEntry {
  id: string
  title: string
  isDeduct: boolean
  amountCents: number
}

export interface QuoteUnifiedOptionsSectionProps {
  calc: InvoiceCalculationsResult
  isDualOption?: boolean
  attachedInstallOption?: {
    enabled?: boolean
    amountPreTaxCents?: number
    title?: string
    hasSupplyJC?: boolean
    hardwareTotal?: number
    hardwareQty?: number
    hardwareConfig?: any
    hardwareBreakdown?: any[]
  } | null
  wantsUpgrade?: boolean
  shownUpgrade?: number
  attachedUpgrade?: { title: string; amountPreTaxCents: number } | null
  doorUpgradeItems?: any[]
  customOptions?: CustomQuoteOption[]
  fontSize?: number
}

export function QuoteUnifiedOptionsSection({
  calc,
  isDualOption = false,
  attachedInstallOption = null,
  wantsUpgrade = false,
  shownUpgrade = 0,
  attachedUpgrade = null,
  doorUpgradeItems = [],
  customOptions,
  fontSize,
}: QuoteUnifiedOptionsSectionProps) {
  const isSupplyOnly = Boolean(calc.isSupplyOnly)
  const smallFs = fontSize ? fontSize * 0.95 : calc.smallFs || 10
  const microFs = fontSize ? fontSize * 0.85 : calc.microFs || 9

  // 1. Dynamic calculation for Dual Option (Supply on Install / Install on Supply)
  const [dualOptionCents, setDualOptionCents] = React.useState<number>(85000)

  React.useEffect(() => {
    if (!isDualOption) return

    const sessionOpt = readSessionAttachedInstallOption()
    if (
      attachedInstallOption?.amountPreTaxCents &&
      attachedInstallOption.amountPreTaxCents > 0
    ) {
      setDualOptionCents(attachedInstallOption.amountPreTaxCents)
      return
    }
    if (sessionOpt?.amountPreTaxCents && sessionOpt.amountPreTaxCents > 0) {
      setDualOptionCents(sessionOpt.amountPreTaxCents)
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
      setDualOptionCents(extraPreTax > 0 ? extraPreTax : 85000)
    } else {
      // In Installation mode: difference to supply is labour + misc + extra JC
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
      setDualOptionCents(
        totalLabourMiscCents > 0 ? totalLabourMiscCents : 85000
      )
    }
  }, [
    isDualOption,
    isSupplyOnly,
    attachedInstallOption,
    calc.jcItems,
    calc.isLooseSupplyJC,
    calc.effectiveLabourTotalCents,
    calc.effectiveMiscTotalCents,
  ])

  // 2. Identify product text for Dual Option
  const parts: string[] = []
  if (calc.hasWindows) parts.push("Windows")
  if (calc.hasSealedUnits) parts.push("Sealed Units")
  if (calc.hasDoors) parts.push("Doors")
  const productText = parts.length > 0 ? parts.join(" / ") : "Windows"

  // 3. Assemble all active options
  const entries: QuoteOptionEntry[] = []

  // Option A: Attached Comparison Upgrade (e.g. Triple pane upgrade)
  if (attachedUpgrade && attachedUpgrade.amountPreTaxCents !== 0) {
    entries.push({
      id: "attached-upgrade",
      title: attachedUpgrade.title,
      isDeduct: attachedUpgrade.amountPreTaxCents < 0,
      amountCents: Math.abs(attachedUpgrade.amountPreTaxCents),
    })
  }

  // Option B: Dual Option (Installation of windows / Supply only)
  if (isDualOption) {
    const sessionOpt = readSessionAttachedInstallOption()
    const finalAmountCents =
      attachedInstallOption &&
        Number(attachedInstallOption.amountPreTaxCents) > 0
        ? Number(attachedInstallOption.amountPreTaxCents)
        : sessionOpt?.amountPreTaxCents && sessionOpt.amountPreTaxCents > 0
          ? sessionOpt.amountPreTaxCents
          : dualOptionCents

    const cachedSupply = readSessionSupplyState()
    const hasSupplyJC =
      attachedInstallOption?.hasSupplyJC !== undefined
        ? attachedInstallOption.hasSupplyJC
        : sessionOpt?.hasSupplyJC !== undefined
          ? sessionOpt.hasSupplyJC
          : Boolean(
            (cachedSupply?.supplyJCAmount &&
              cachedSupply.supplyJCAmount > 0) ||
            (cachedSupply?.customJC &&
              parseFloat(cachedSupply.customJC) > 0)
          )

    let hardwareNote = ""
    if (isSupplyOnly) {
      const hwConfig =
        attachedInstallOption?.hardwareConfig || sessionOpt?.hardwareConfig
      const hwQty =
        attachedInstallOption?.hardwareQty ||
        sessionOpt?.hardwareQty ||
        hwConfig?.totalQty

      if (hwQty && hwQty > 0) {
        hardwareNote = ` (incl. ${hwQty} locksets & deadbolts)`
      } else {
        const hwBreakdown =
          attachedInstallOption?.hardwareBreakdown ||
          sessionOpt?.hardwareBreakdown
        const activeHw = Array.isArray(hwBreakdown)
          ? hwBreakdown.filter((h: any) => {
              const hType = h.hardwareType || h.type
              const hCost =
                Number(h.price !== undefined ? h.price : h.amount) || 0
              return hType !== "none" && hCost > 0
            })
          : []

        if (activeHw.length > 0) {
          hardwareNote = ` (incl. ${activeHw.length} locksets & deadbolts)`
        }
      }
    }

    const finalTitle = isSupplyOnly
      ? `${productText} with Installation${hardwareNote}`
      : hasSupplyJC
        ? `${productText} with J&C for Supply Only`
        : `${productText} for Supply Only`

    entries.push({
      id: "dual-install-supply",
      title: finalTitle,
      isDeduct: !isSupplyOnly,
      amountCents: finalAmountCents,
    })
  }

  // Option C: Door Upgrades
  doorUpgradeItems.forEach((dItem: any, idx: number) => {
    const diff = dItem.upgradeOption?.subtotalDifference || 0
    const qty = dItem.quantity || 1
    const cents = Math.round(diff * 100 * qty)
    if (cents !== 0) {
      entries.push({
        id: `door-upgrade-${dItem.id || idx}`,
        title:
          dItem.upgradeOption?.title ||
          dItem.customDescription ||
          "Door Upgrade",
        isDeduct: cents < 0,
        amountCents: Math.abs(cents),
      })
    }
  })

  // Option D: 5-Year Labour Upgrade
  if (wantsUpgrade && shownUpgrade > 0 && !isSupplyOnly) {
    entries.push({
      id: "five-year-warranty",
      title: "5-Year Labour Upgrade",
      isDeduct: false,
      amountCents: shownUpgrade,
    })
  }

  // Option E: Custom User Options (from props or session storage)
  const effectiveCustomOptions =
    Array.isArray(customOptions) && customOptions.length > 0
      ? customOptions
      : readSessionCustomOptions()
  effectiveCustomOptions.forEach((cOpt) => {
    if (cOpt.title && cOpt.amountPreTaxCents !== 0) {
      entries.push({
        id: cOpt.id,
        title: cOpt.title,
        isDeduct: cOpt.amountPreTaxCents < 0,
        amountCents: Math.abs(cOpt.amountPreTaxCents),
      })
    }
  })

  if (entries.length === 0) return null

  return (
    <div className="rounded border border-[#cbd5e1] bg-white p-2 text-[#0f172a] shadow-2xs">
      <div
        style={{ fontSize: `${smallFs}px` }}
        className="mb-1 border-b border-[#e2e8f0] pb-1 font-bold tracking-wider text-[#0f172a] uppercase"
      >
        Options
      </div>
      <div className="space-y-1 pt-0.5">
        {entries.map((opt) => (
          <div
            key={opt.id}
            className="flex items-center justify-between text-[#0f172a]"
          >
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 shrink-0 rounded-xs border border-[#475569] bg-white" />
              <span
                style={{ fontSize: `${microFs}px` }}
                className="font-medium text-[#334155]"
              >
                {opt.title}
              </span>
            </div>
            <span
              style={{ fontSize: `${smallFs}px` }}
              className={`font-mono font-bold ${opt.isDeduct ? "text-[#0284c7]" : "text-[#0f172a]"
                }`}
            >
              {opt.isDeduct ? "-" : "+"}
              {formatMoney(opt.amountCents)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuoteUnifiedOptionsSection

