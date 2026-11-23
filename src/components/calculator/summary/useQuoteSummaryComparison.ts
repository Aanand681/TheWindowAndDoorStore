"use client"

import React from "react"
import { toCents } from "@/lib/promo-logic"
import {
  readSessionSupplyState,
  readSessionInstallState,
  readSessionAttachedInstallOption,
  writeSessionAttachedInstallOption,
  ATTACHED_INSTALL_CHANGE_EVENT,
  type CachedAttachedInstallOption,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

export interface UseQuoteSummaryComparisonParams {
  isSupply: boolean
  quoteNumber?: string
  reviewQuoteId?: string
  summaryWindowGroups?: any[]
  quoteResult?: any
  taxTotals?: any
  taxJC?: number
  taxLabour?: number
  taxMisc?: number
  effectiveJCCents: number
  effectiveLabourCents: number
  effectiveMiscCents: number
  hasSupplyJC: boolean
}

export function useQuoteSummaryComparison({
  isSupply,
  quoteNumber,
  reviewQuoteId,
  summaryWindowGroups,
  quoteResult,
  taxTotals,
  taxJC,
  taxLabour,
  taxMisc,
  effectiveJCCents,
  effectiveLabourCents,
  effectiveMiscCents,
  hasSupplyJC,
}: UseQuoteSummaryComparisonParams) {
  const [isCompareOpen, setIsCompareOpen] = React.useState<boolean>(false)
  const [attachedInstallOption, setAttachedInstallOption] =
    React.useState<CachedAttachedInstallOption | null>(null)

  React.useEffect(() => {
    const sync = () =>
      setAttachedInstallOption(readSessionAttachedInstallOption())
    sync()
    window.addEventListener(ATTACHED_INSTALL_CHANGE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(ATTACHED_INSTALL_CHANGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [isSupply, quoteNumber, reviewQuoteId])

  const windowGroupsBaseTotal = React.useMemo(() => {
    if (summaryWindowGroups && summaryWindowGroups.length > 0) {
      return (
        summaryWindowGroups.reduce((acc, g) => acc + (g.baseCents || 0), 0) /
        100
      )
    }
    return (quoteResult?.base || 0) / 100
  }, [summaryWindowGroups, quoteResult?.base])

  const supplyJCAmount = React.useMemo(() => {
    if (isSupply) {
      if (hasSupplyJC) {
        if (effectiveJCCents > 0) return effectiveJCCents / 100
        if (taxTotals?.jcLabourCents && taxTotals.jcLabourCents > 0)
          return taxTotals.jcLabourCents / 100
      }
      return 0
    }
    const cachedSupply = readSessionSupplyState()
    if (
      !cachedSupply ||
      (cachedSupply.jambId === "none" && cachedSupply.casingId === "none")
    )
      return 0
    if (cachedSupply.customJC) return toCents(cachedSupply.customJC) / 100
    if (
      cachedSupply.supplyJCAmount !== undefined &&
      cachedSupply.supplyJCAmount > 0
    ) {
      return cachedSupply.supplyJCAmount
    }
    return 0
  }, [isSupply, hasSupplyJC, effectiveJCCents, taxTotals])

  const installJCAmount = React.useMemo(() => {
    if (!isSupply) return effectiveJCCents / 100
    const c = readSessionInstallState()
    if (c?.customJC) return toCents(c.customJC) / 100
    if (
      taxTotals?.fullInstallJCCents !== undefined &&
      taxTotals.fullInstallJCCents > 0
    )
      return taxTotals.fullInstallJCCents / 100
    if (c?.installJCAmount !== undefined && c.installJCAmount > 0)
      return c.installJCAmount
    return (
      (taxTotals?.jcLabourCents
        ? taxTotals.jcLabourCents / 100
        : (taxJC || 0) / 100)
    )
  }, [isSupply, effectiveJCCents, taxTotals, taxJC])

  const compareLabourAmount = React.useMemo(() => {
    if (!isSupply) return effectiveLabourCents / 100
    const c = readSessionInstallState()
    if (c?.customLabour) return toCents(c.customLabour) / 100
    if (
      taxTotals?.fullInstallLabourCents !== undefined &&
      taxTotals.fullInstallLabourCents > 0
    )
      return taxTotals.fullInstallLabourCents / 100
    if (c?.installLabourAmount !== undefined && c.installLabourAmount > 0)
      return c.installLabourAmount
    return (taxLabour || 0) / 100
  }, [isSupply, effectiveLabourCents, taxLabour, taxTotals])

  const compareMiscAmount = React.useMemo(() => {
    if (!isSupply) return effectiveMiscCents / 100
    const c = readSessionInstallState()
    if (c?.customMisc) return toCents(c.customMisc) / 100
    if (
      taxTotals?.fullInstallMiscCents !== undefined &&
      taxTotals.fullInstallMiscCents > 0
    )
      return taxTotals.fullInstallMiscCents / 100
    if (c?.installMiscAmount !== undefined && c.installMiscAmount > 0)
      return c.installMiscAmount
    return (taxMisc || 0) / 100
  }, [isSupply, effectiveMiscCents, taxMisc, taxTotals])

  const dynamicInstallDeltaCents = React.useMemo(() => {
    const effectiveSupplyJC =
      !isSupply && !attachedInstallOption?.hasSupplyJC ? 0 : supplyJCAmount
    const extraJC = Math.max(0, installJCAmount - effectiveSupplyJC)
    return Math.round(
      (compareLabourAmount + compareMiscAmount + extraJC) * 100
    )
  }, [
    compareLabourAmount,
    compareMiscAmount,
    installJCAmount,
    supplyJCAmount,
    isSupply,
    attachedInstallOption?.hasSupplyJC,
  ])

  React.useEffect(() => {
    if (attachedInstallOption?.enabled && dynamicInstallDeltaCents > 0) {
      const current = readSessionAttachedInstallOption()
      const isSupplyJCPresent = supplyJCAmount > 0
      if (
        current?.enabled &&
        (current.amountPreTaxCents !== dynamicInstallDeltaCents ||
          current.hasSupplyJC !== isSupplyJCPresent)
      ) {
        const updated = {
          ...current,
          amountPreTax: dynamicInstallDeltaCents / 100,
          amountPreTaxCents: dynamicInstallDeltaCents,
          hasSupplyJC: isSupplyJCPresent,
        }
        writeSessionAttachedInstallOption(updated)
        setAttachedInstallOption(updated)
      }
    }
  }, [dynamicInstallDeltaCents, supplyJCAmount, attachedInstallOption?.enabled])

  return {
    isCompareOpen,
    setIsCompareOpen,
    attachedInstallOption,
    setAttachedInstallOption,
    windowGroupsBaseTotal,
    supplyJCAmount,
    installJCAmount,
    compareLabourAmount,
    compareMiscAmount,
    dynamicInstallDelta: dynamicInstallDeltaCents / 100,
    dynamicInstallDeltaCents,
  }
}
