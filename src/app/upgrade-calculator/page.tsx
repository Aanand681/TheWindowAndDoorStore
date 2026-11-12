"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { ShieldCheck } from "lucide-react"
import { AppHeader } from "@/components/layout/AppHeader"
import {
  formatMoney,
  toCents,
  calculateUpgrade,
  ILabourUpgradeTier,
} from "@/lib/promo-logic"
import { toast } from "sonner"
import {
  UpgradeInputCard,
  UpgradeFeeHeroCard,
  UpgradeComparisonCard,
  UpgradeBracketsTable,
} from "@/components/upgrade-calculator"

export default function LabourUpgradeCalculatorPage() {
  const [subtotalInput, setSubtotalInput] = useState<string>("12500")
  const [hstRate, setHstRate] = useState<number>(13)
  const [copiedFee, setCopiedFee] = useState(false)
  const [copiedSummary, setCopiedSummary] = useState(false)
  const [dbTiers, setDbTiers] = useState<ILabourUpgradeTier[]>([])
  const [_loading, setLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (
          Array.isArray(data.labourUpgradeTiers) &&
          data.labourUpgradeTiers.length > 0
        ) {
          setDbTiers(data.labourUpgradeTiers)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load settings:", err)
        setLoading(false)
      })
  }, [])

  const subtotalCents = useMemo(() => {
    return toCents(subtotalInput)
  }, [subtotalInput])

  const upgradeResult = useMemo(() => {
    return calculateUpgrade(
      subtotalCents,
      dbTiers.length > 0 ? dbTiers : undefined
    )
  }, [subtotalCents, dbTiers])

  const activeTier = useMemo(() => {
    if (dbTiers.length === 0) return null
    const amountDollars = subtotalCents / 100
    return dbTiers.find((t) => {
      const minOk = amountDollars >= t.minAmount
      const maxOk =
        t.maxAmount === null ||
        t.maxAmount === undefined ||
        amountDollars < t.maxAmount
      return minOk && maxOk
    })
  }, [subtotalCents, dbTiers])

  const isAvailable = subtotalCents >= 300000 && upgradeResult.charge > 0
  const subtotalWithUpgradeCents =
    subtotalCents + (isAvailable ? upgradeResult.charge : 0)

  const baseHstCents = Math.round((subtotalCents * hstRate) / 100)
  const baseTotalCents = subtotalCents + baseHstCents

  const withUpgradeHstCents = Math.round(
    (subtotalWithUpgradeCents * hstRate) / 100
  )
  const withUpgradeTotalCents = subtotalWithUpgradeCents + withUpgradeHstCents

  const handleCopyFee = () => {
    if (!isAvailable) {
      toast.error("Labour upgrade is not available for this subtotal.")
      return
    }
    const feeText = formatMoney(upgradeResult.charge)
    navigator.clipboard.writeText(feeText)
    setCopiedFee(true)
    toast.success(`Copied ${feeText} to clipboard!`)
    setTimeout(() => setCopiedFee(false), 2000)
  }

  const handleCopySummary = () => {
    if (!isAvailable) {
      toast.error("Labour upgrade is not available for this subtotal.")
      return
    }
    const summaryText = `Optional Labour Upgrade: +${formatMoney(upgradeResult.charge)} (${upgradeResult.rate}). Pre-tax subtotal with upgrade: ${formatMoney(subtotalWithUpgradeCents)}.`
    navigator.clipboard.writeText(summaryText)
    setCopiedSummary(true)
    toast.success("Copied summary breakdown to clipboard!")
    setTimeout(() => setCopiedSummary(false), 2000)
  }

  const setPreset = (amount: number) => {
    setSubtotalInput(amount.toString())
    inputRef.current?.focus()
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="relative z-10 mx-auto w-full max-w-[1650px] space-y-4 px-4 pt-5 pb-10 sm:px-6 sm:pt-6 lg:px-8">
        <AppHeader currentPath="/upgrade-calculator" />

        <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="rounded-md border border-emerald-500/20 bg-emerald-500/10 p-1 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <h1 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
              Labour Upgrade Calculator
            </h1>
          </div>
          <div className="hidden text-xs text-muted-foreground sm:block">
            Fast pre-tax fee estimator & customer breakdown
          </div>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          <div className="space-y-5 lg:col-span-5">
            <UpgradeInputCard
              subtotalInput={subtotalInput}
              setSubtotalInput={setSubtotalInput}
              inputRef={inputRef}
              setPreset={setPreset}
              hstRate={hstRate}
              setHstRate={setHstRate}
            />
          </div>

          <div className="space-y-5 lg:col-span-7">
            <UpgradeFeeHeroCard
              isAvailable={isAvailable}
              upgradeResult={upgradeResult}
              subtotalCents={subtotalCents}
              handleCopyFee={handleCopyFee}
              handleCopySummary={handleCopySummary}
              copiedFee={copiedFee}
              copiedSummary={copiedSummary}
            />

            <UpgradeComparisonCard
              subtotalCents={subtotalCents}
              hstRate={hstRate}
              baseHstCents={baseHstCents}
              baseTotalCents={baseTotalCents}
              subtotalWithUpgradeCents={subtotalWithUpgradeCents}
              withUpgradeHstCents={withUpgradeHstCents}
              withUpgradeTotalCents={withUpgradeTotalCents}
            />
          </div>
        </div>

        <UpgradeBracketsTable
          dbTiers={dbTiers}
          activeTier={activeTier}
          isAvailable={isAvailable}
          upgradeResult={upgradeResult}
        />
      </div>
    </div>
  )
}
