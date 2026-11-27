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
  type QuoteOptionScope,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

export interface QuoteOptionEntry {
  id: string
  title: string
  isDeduct: boolean
  amountCents: number
}

export interface QuoteOptionsCheckInput {
  isSupplyOnly?: boolean
  isDualOption?: boolean
  wantsUpgrade?: boolean
  shownUpgrade?: number
  attachedUpgrade?: { title: string; amountPreTaxCents: number } | null
  doorUpgradeItems?: any[]
  customOptions?: CustomQuoteOption[]
  optionScope?: QuoteOptionScope
}

/**
 * Shared predicate determining whether the Options card has any active selectable items.
 */
export function hasQuoteOptionEntries({
  isSupplyOnly = false,
  isDualOption = false,
  wantsUpgrade = false,
  shownUpgrade = 0,
  attachedUpgrade = null,
  doorUpgradeItems = [],
  customOptions,
  optionScope,
}: QuoteOptionsCheckInput): boolean {
  if (attachedUpgrade && attachedUpgrade.amountPreTaxCents !== 0) return true
  if (isDualOption) return true
  if (
    doorUpgradeItems.some(
      (item: any) =>
        (item?.upgradeOption?.subtotalDifference || 0) * (item?.quantity || 1) !== 0
    )
  ) {
    return true
  }
  if (wantsUpgrade && shownUpgrade > 0 && !isSupplyOnly) return true
  const effectiveCustom =
    Array.isArray(customOptions) && customOptions.length > 0
      ? customOptions
      : readSessionCustomOptions(optionScope)
  return effectiveCustom.some((opt) => Boolean(opt.title && opt.amountPreTaxCents !== 0))
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
  variant?: "card" | "universal"
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
  variant = "card",
}: QuoteUnifiedOptionsSectionProps) {
  const isSupplyOnly = Boolean(calc.isSupplyOnly)
  const smallFs = fontSize ? fontSize * 0.95 : calc.smallFs || 10
  const microFs = fontSize ? fontSize * 0.85 : calc.microFs || 9

  const calcScope = calc.isDoorHost
    ? ("door" as const)
    : calc.isSUHost
      ? ("sealed_unit" as const)
      : ("window" as const)

  // 1. Dynamic calculation for Dual Option (Supply on Install / Install on Supply)
  const dualOptionCents = React.useMemo(() => {
    if (!isDualOption) return 0

    const sessionOpt = readSessionAttachedInstallOption(calcScope)
    if (
      attachedInstallOption?.amountPreTaxCents &&
      attachedInstallOption.amountPreTaxCents > 0
    ) {
      return attachedInstallOption.amountPreTaxCents
    }
    if (sessionOpt?.amountPreTaxCents && sessionOpt.amountPreTaxCents > 0) {
      return sessionOpt.amountPreTaxCents
    }

    const dedupLabCents = calc.compareInstallLabourCents || 0
    const dedupMiscCents = calc.compareInstallMiscCents || 0
    const dedupJCCents = calc.compareInstallJCCents || 0
    const winJCCents = calc.jcItems.reduce(
      (acc: number, curr: { label: string; amount: number }) => acc + curr.amount,
      0
    )

    if (isSupplyOnly) {
      const cachedInstall = readSessionInstallState()
      const installLabCents =
        dedupLabCents > 0
          ? dedupLabCents
          : Math.round(
              (cachedInstall?.installLabourAmount ||
                (cachedInstall?.customLabour
                  ? parseFloat(cachedInstall.customLabour) || 0
                  : 0)) * 100
            )
      const installMiscCents =
        dedupMiscCents > 0
          ? dedupMiscCents
          : Math.round(
              (cachedInstall?.installMiscAmount ||
                (cachedInstall?.customMisc
                  ? parseFloat(cachedInstall.customMisc) || 0
                  : 0)) * 100
            )
      const supplyJCCents = calc.isLooseSupplyJC ? winJCCents : 0
      const installJCCents =
        dedupJCCents > 0
          ? dedupJCCents
          : Math.round(
              (cachedInstall?.installJCAmount ||
                (cachedInstall?.customJC ? parseFloat(cachedInstall.customJC) || 0 : 0)) *
                100
            )
      const extraJCCents = Math.max(0, installJCCents - supplyJCCents)
      const totalCents = installLabCents + installMiscCents + extraJCCents
      return totalCents > 0 ? totalCents : 85000
    }

    const cachedSupply = readSessionSupplyState()
    const installJCCents = !calc.isLooseSupplyJC ? winJCCents : 0
    const supplyJCCents = Math.round(
      (cachedSupply?.customJC
        ? parseFloat(cachedSupply.customJC) || 0
        : cachedSupply?.supplyJCAmount !== undefined
          ? cachedSupply.supplyJCAmount
          : 0) * 100
    )
    const extraJCCents = Math.max(0, installJCCents - supplyJCCents)
    const labCents = calc.effectiveLabourTotalCents || dedupLabCents
    const miscCents = calc.effectiveMiscTotalCents || dedupMiscCents
    const totalLabourMiscCents = labCents + miscCents + extraJCCents
    return totalLabourMiscCents > 0 ? totalLabourMiscCents : 85000
  }, [
    calcScope,
    isDualOption,
    isSupplyOnly,
    attachedInstallOption,
    calc.compareInstallLabourCents,
    calc.compareInstallMiscCents,
    calc.compareInstallJCCents,
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

  // Option E: Custom User Options (from props or scoped session storage)
  const effectiveCustomOptions =
    Array.isArray(customOptions) && customOptions.length > 0
      ? customOptions
      : readSessionCustomOptions(calcScope)
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

  if (variant === "universal") {
    return (
      <div className="divide-y divide-[#e2e8f0] overflow-hidden rounded border border-[#cbd5e1] bg-white">
        {entries.map((opt) => (
          <div
            key={opt.id}
            style={{ padding: `${Math.max(2, calc.rowPy)}px 7px` }}
            className="flex items-center justify-between gap-2 bg-[#fffbeb] text-[#78350f]"
          >
            <div className="flex min-w-0 items-center gap-1.5">
              <div className="h-2.5 w-2.5 shrink-0 rounded-[2px] border border-[#92400e] bg-white" />
              <span
                style={{ fontSize: `${smallFs}px` }}
                className="font-semibold text-[#78350f]"
              >
                {opt.title}
              </span>
            </div>
            <span
              style={{ fontSize: `${smallFs}px` }}
              className={`shrink-0 font-mono font-bold ${
                opt.isDeduct ? "text-[#0284c7]" : "text-[#78350f]"
              }`}
            >
              {opt.isDeduct ? "-" : "+"}
              {formatMoney(opt.amountCents)}
            </span>
          </div>
        ))}
      </div>
    )
  }

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

