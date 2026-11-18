"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import {
  DoorLineItem,
  DoorQuoteTotals,
  DoorQuotingMode,
} from "@/lib/doors/types"
import { computeEffectiveDoorGrandTotal } from "@/lib/doors/totals-calculator"
import {
  readSessionAttachedInstallOption,
  writeSessionAttachedInstallOption,
  readSessionDoorHardwareConfig,
  ATTACHED_INSTALL_CHANGE_EVENT,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import { formatSealedUnitSummarySentence } from "@/lib/sealed-units-logic"
import { formatWindowSummarySentence } from "@/hooks/useCalculatorWindows"
import { cn } from "@/lib/utils"
import { DoorSummaryHeader } from "./summary/DoorSummaryHeader"
import { DoorSummaryAttachedBadges } from "./summary/DoorSummaryAttachedBadges"
import { DoorSummaryLedger } from "./summary/DoorSummaryLedger"
import { DoorSummaryUpgrades } from "./summary/DoorSummaryUpgrades"
import { DoorSummaryActions } from "./summary/DoorSummaryActions"
import { CustomOptionsSection } from "@/components/calculator/summary/CustomOptionsSection"
import { SupplyVsInstallCompareModal } from "@/components/shared/SupplyVsInstallCompareModal"

interface DoorQuoteSummaryCardProps {
  customerName?: string
  quoteNumber?: string
  lineItems: DoorLineItem[]
  totals: DoorQuoteTotals
  mode: DoorQuotingMode
  onModeChange: (mode: DoorQuotingMode) => void
  isFirstNation: boolean
  onToggleFirstNation: (val: boolean) => void
  hstRate?: number
  setHstRate?: (val: number) => void
  onSubmitQuote: () => void
  onPrintPreview: () => void
  isAdmin?: boolean
  customLabour?: string
  setCustomLabour?: (val: string) => void
  customMisc?: string
  setCustomMisc?: (val: string) => void
  attachedWindowQuote?: any | null
  attachedSealedUnit?: any | null
  onOpenAttachModal?: () => void
  onRemoveAttachedWindowQuote?: () => void
  onRemoveAttachedSealedUnit?: () => void
  onApplyDoorHardware?: (config: any) => void
  isReadOnly?: boolean
  isReviewMode?: boolean
  className?: string
}

export function DoorQuoteSummaryCard({
  customerName,
  quoteNumber,
  lineItems,
  totals,
  mode,
  onModeChange,
  isFirstNation,
  onToggleFirstNation,
  hstRate,
  setHstRate,
  onSubmitQuote,
  onPrintPreview,
  isAdmin = false,
  customLabour = "",
  setCustomLabour,
  customMisc = "",
  setCustomMisc,
  attachedWindowQuote,
  attachedSealedUnit,
  onRemoveAttachedWindowQuote,
  onRemoveAttachedSealedUnit,
  onApplyDoorHardware,
  isReadOnly = false,
  isReviewMode = false,
  className,
}: DoorQuoteSummaryCardProps) {
  const [editingField, setEditingField] = useState<"labour" | "misc" | null>(
    null
  )
  const [tempEditVal, setTempEditVal] = useState<string>("")
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const [attachedInstallOption, setAttachedInstallOption] = useState<{
    enabled: boolean
    amountPreTaxCents: number
    hardwareTotal?: number
    hardwareBreakdown?: any[]
  } | null>(null)

  useEffect(() => {
    const sync = () =>
      setAttachedInstallOption(readSessionAttachedInstallOption())
    sync()
    window.addEventListener(ATTACHED_INSTALL_CHANGE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(ATTACHED_INSTALL_CHANGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [mode, quoteNumber])
  const isInstallation = mode === "installation"
  const upgradeItems = lineItems.filter((i) => i.upgradeOption?.enabled)

  const hasAttachedWindow = Boolean(attachedWindowQuote)
  const hasAttachedSU = Boolean(attachedSealedUnit)
  const hasAnyAttached = hasAttachedWindow || hasAttachedSU

  const winBase = hasAttachedWindow
    ? attachedWindowQuote.totals?.base ||
      attachedWindowQuote.totals?.subtotal ||
      0
    : 0
  const winJC = hasAttachedWindow
    ? (attachedWindowQuote.totals?.jc ?? attachedWindowQuote.jcDollars ?? 0)
    : 0
  const winJCDescription = attachedWindowQuote?.jcLabel || "Jambs & Casing"
  const winDiscount = hasAttachedWindow
    ? (attachedWindowQuote.totals?.promoDiscount ||
        attachedWindowQuote.quoteResult?.promoDiscount ||
        attachedWindowQuote.data?.promoDiscount ||
        0) / (attachedWindowQuote.quoteResult?.promoDiscount ? 100 : 1)
    : 0
  const suGlass = hasAttachedSU
    ? attachedSealedUnit.totals?.glassBefore8PercentTotal || 0
    : 0
  const winLabour = hasAttachedWindow
    ? attachedWindowQuote.totals?.labour || 0
    : 0
  const suLabour = hasAttachedSU
    ? (attachedSealedUnit.totals?.serviceLabourTotal ??
      attachedSealedUnit.totals?.unitLabourSum ??
      0)
    : 0
  const winMisc = hasAttachedWindow ? attachedWindowQuote.totals?.misc || 0 : 0
  const suMisc = hasAttachedSU ? attachedSealedUnit.totals?.miscTotal || 0 : 0
  const rawWinSurcharge = hasAttachedWindow
    ? attachedWindowQuote.totals?.surcharge || 0
    : 0
  const winSurcharge =
    rawWinSurcharge > winBase && winBase > 0
      ? Math.round(winBase * 0.08 * 100) / 100
      : rawWinSurcharge
  const suSurcharge = hasAttachedSU
    ? attachedSealedUnit.totals?.glass8PercentSurchargeTotal || 0
    : 0

  const netDoorMaterials =
    totals.rawDoorBaseTotal +
    totals.stormDoorTotal +
    totals.hardwareTotal -
    totals.discountTotal

  const defaultDoorLabour = isInstallation ? totals.combinedLabourTotal : 0
  const effectiveDoorLabour =
    customLabour !== "" ? parseFloat(customLabour) || 0 : defaultDoorLabour
  const combinedLabour = effectiveDoorLabour + winLabour + suLabour

  const defaultDoorMisc = isInstallation ? totals.miscTotal : 0
  const effectiveDoorMisc =
    customMisc !== "" ? parseFloat(customMisc) || 0 : defaultDoorMisc
  const combinedMisc = effectiveDoorMisc + winMisc + suMisc

  const compareDoorLabour =
    customLabour !== ""
      ? parseFloat(customLabour) || 0
      : (totals.fullInstallLabour ?? totals.combinedLabourTotal)
  const compareLabour = compareDoorLabour + winLabour + suLabour

  const compareDoorMisc =
    customMisc !== ""
      ? parseFloat(customMisc) || 0
      : (totals.fullInstallMisc ?? totals.miscTotal)
  const compareMisc = compareDoorMisc + winMisc + suMisc

  const supplyHardwareDollars = useMemo(() => {
    return lineItems.reduce((acc, item) => {
      if (item.category === "storm") return acc
      const q = item.quantity || 1
      const price =
        mode === "supply_only"
          ? item.lineHardwareTotal || 0
          : item.supplyHardwareType && item.supplyHardwareType !== "none"
            ? (item.supplyHardwarePrice || 0) * q
            : 0
      return acc + price
    }, 0)
  }, [lineItems, mode])

  const installHardwareDollars = useMemo(() => {
    if (attachedInstallOption?.hardwareTotal !== undefined) {
      return Number(attachedInstallOption.hardwareTotal) || 0
    }
    const saved = readSessionDoorHardwareConfig()
    if (saved?.totalPrice !== undefined) {
      return Number(saved.totalPrice) || 0
    }
    if (mode === "installation") {
      return totals.hardwareTotal || 0
    }
    const nonStormCount = lineItems.reduce(
      (acc, it) => acc + (it.category === "storm" ? 0 : it.quantity || 1),
      0
    )
    return Math.round(nonStormCount * 158.0 * 100) / 100
  }, [
    attachedInstallOption,
    mode,
    totals.hardwareTotal,
    lineItems,
  ])

  const dynamicInstallDeltaDollars = useMemo(() => {
    const netHardware = Math.max(
      0,
      installHardwareDollars - supplyHardwareDollars
    )
    return (
      Math.round(
        (compareLabour + compareMisc + netHardware) * 100
      ) / 100
    )
  }, [compareLabour, compareMisc, installHardwareDollars, supplyHardwareDollars])

  useEffect(() => {
    if (attachedInstallOption?.enabled && dynamicInstallDeltaDollars > 0) {
      const current = readSessionAttachedInstallOption()
      const newCents = Math.round(dynamicInstallDeltaDollars * 100)
      if (current?.enabled && current.amountPreTaxCents !== newCents) {
        const updated = {
          ...current,
          amountPreTaxCents: newCents,
        }
        writeSessionAttachedInstallOption(updated)
        setAttachedInstallOption(updated)
      }
    }
  }, [dynamicInstallDeltaDollars, attachedInstallOption?.enabled])

  const combinedSurcharge = totals.surchargeTotal + winSurcharge + suSurcharge
  const {
    combinedSubtotal,
    combinedTax,
    grandTotal: displayGrandTotal,
  } = computeEffectiveDoorGrandTotal({
    totals,
    mode,
    customLabour,
    customMisc,
    isFirstNation,
    attachedWindowQuote,
    attachedSealedUnit,
  })
  const firstPayment = Math.floor((displayGrandTotal / 2) * 100) / 100
  const secondPayment =
    Math.round((displayGrandTotal - firstPayment) * 100) / 100

  const attachedSUSentence = hasAttachedSU
    ? attachedSealedUnit.lineItems && attachedSealedUnit.lineItems.length > 0
      ? formatSealedUnitSummarySentence(attachedSealedUnit.lineItems)
      : "Attached Sealed Glass Units"
    : ""

  const attachedWinSentence = hasAttachedWindow
    ? formatWindowSummarySentence(attachedWindowQuote.windows || []) !==
      "0 Windows"
      ? formatWindowSummarySentence(attachedWindowQuote.windows || [])
      : attachedWindowQuote.summarySentence ||
        attachedWindowQuote.summaryLabel ||
        "Attached Window Units"
    : ""

  return (
    <>
      <Card
        className={cn(
          "relative flex flex-col gap-0 overflow-hidden border-border bg-card/80 py-0 shadow-xl backdrop-blur-xl [--card-spacing:0px]",
          className
        )}
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
        <DoorSummaryHeader
          quoteNumber={quoteNumber}
          customerName={customerName}
          mode={mode}
          onModeChange={onModeChange}
          onOpenCompare={() => setIsCompareOpen(true)}
          isReadOnly={isReadOnly}
        />

        <CardContent className="flex flex-1 flex-col justify-between space-y-4 p-3.5 pt-3">
          <DoorSummaryAttachedBadges
            attachedWindowQuote={attachedWindowQuote}
            attachedSealedUnit={attachedSealedUnit}
            attachedInstallOption={attachedInstallOption}
            mode={mode}
            onRemoveAttachedWindowQuote={onRemoveAttachedWindowQuote}
            onRemoveAttachedSealedUnit={onRemoveAttachedSealedUnit}
            onRemoveAttachedInstallOption={() => {
              setAttachedInstallOption(null)
              writeSessionAttachedInstallOption(null)
            }}
            dynamicInstallDeltaDollars={dynamicInstallDeltaDollars}
          />

          <DoorSummaryLedger
            lineItems={lineItems}
            totals={totals}
            isInstallation={isInstallation}
            hasAttachedWindow={hasAttachedWindow}
            hasAttachedSU={hasAttachedSU}
            attachedWindowQuote={attachedWindowQuote}
            attachedWinSentence={attachedWinSentence}
            attachedSUSentence={attachedSUSentence}
            winBase={winBase}
            winJC={winJC}
            winJCDescription={winJCDescription}
            suGlass={suGlass}
            combinedLabour={combinedLabour}
            customLabour={customLabour}
            defaultDoorLabour={defaultDoorLabour}
            winLabour={winLabour}
            suLabour={suLabour}
            setCustomLabour={setCustomLabour}
            combinedMisc={combinedMisc}
            customMisc={customMisc}
            defaultDoorMisc={defaultDoorMisc}
            winMisc={winMisc}
            suMisc={suMisc}
            setCustomMisc={setCustomMisc}
            hasAnyAttached={hasAnyAttached}
            combinedSurcharge={combinedSurcharge}
            winDiscount={winDiscount}
            combinedSubtotal={combinedSubtotal}
            isFirstNation={isFirstNation}
            onToggleFirstNation={onToggleFirstNation}
            hstRate={hstRate}
            setHstRate={setHstRate}
            combinedTax={combinedTax}
            displayGrandTotal={displayGrandTotal}
            firstPayment={firstPayment}
            secondPayment={secondPayment}
            editingField={editingField}
            setEditingField={setEditingField}
            tempEditVal={tempEditVal}
            setTempEditVal={setTempEditVal}
            isReadOnly={isReadOnly}
          />

          <DoorSummaryUpgrades
            upgradeItems={upgradeItems}
          />

          <CustomOptionsSection
            canModifyOptions={!isReadOnly}
            quoteNumber={quoteNumber}
          />

          <DoorSummaryActions
            isAdmin={isAdmin}
            canSubmit={lineItems.length > 0}
            isReviewMode={isReviewMode}
            onSubmitQuote={onSubmitQuote}
            onPrintPreview={onPrintPreview}
          />
        </CardContent>
      </Card>

      <SupplyVsInstallCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        title="Door Quote Comparison"
        quoteNumber={quoteNumber}
        customerName={customerName}
        currentMode={mode === "supply_only" ? "supply" : "install"}
        currentSubtotal={combinedSubtotal}
        baseLabel="Door Units"
        baseAmount={totals.rawDoorBaseTotal + totals.stormDoorTotal}
        attachedLabel={
          hasAttachedWindow
            ? attachedWinSentence
            : hasAttachedSU
              ? attachedSUSentence
              : undefined
        }
        attachedAmount={
          (hasAttachedWindow ? winBase + winJC - winDiscount : 0) +
          (hasAttachedSU ? suGlass : 0)
        }
        labourAmount={compareLabour}
        miscAmount={compareMisc}
        surchargeAmount={combinedSurcharge}
        surchargeLabel="Surcharge (8% on materials)"
        discountAmount={
          totals.discountTotal + (winDiscount > 0 ? winDiscount : 0)
        }
        discountLabel="10% Discount"
        hardwareAmount={totals.hardwareTotal}
        hardwareLabel="Lockset & Hardware"
        doorItems={lineItems}
        standardHardwarePrice={158.0}
        onApplyDoorHardware={onApplyDoorHardware}
        hstRate={isFirstNation ? 5 : 13}
        onApplyMode={(m) =>
          onModeChange(m === "supply" ? "supply_only" : "installation")
        }
        onToggleAttachOption={(
          att,
          c,
          title,
          hasSupplyJC,
          hardwareConfig,
          hardwareTotal
        ) => {
          const opt = att
            ? {
                enabled: true,
                amountPreTaxCents: c,
                title,
                hasSupplyJC,
                hardwareConfig,
                hardwareTotal,
              }
            : null
          setAttachedInstallOption(opt)
        }}
      />
    </>
  )
}
