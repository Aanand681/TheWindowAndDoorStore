"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DoorLineItem, DoorQuoteTotals, DoorQuotingMode } from "@/lib/doors/types"
import { computeEffectiveDoorGrandTotal } from "@/lib/doors/totals-calculator"
import { calculateUniversalPricing } from "@/lib/quotes/universal-pricing-engine"
import { writeSessionAttachedInstallOption } from "@/hooks/calculator/supply-mode/supply-session-storage"
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
import { useDoorSummaryInstallOption } from "./summary/useDoorSummaryInstallOption"

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
  customDiscount?: string
  setCustomDiscount?: (val: string) => void
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
  customerName, quoteNumber, lineItems, totals, mode, onModeChange,
  isFirstNation, onToggleFirstNation, hstRate, setHstRate, onSubmitQuote,
  onPrintPreview, isAdmin = false, customLabour = "", setCustomLabour,
  customMisc = "", setCustomMisc, customDiscount = "", setCustomDiscount,
  attachedWindowQuote, attachedSealedUnit, onRemoveAttachedWindowQuote,
  onRemoveAttachedSealedUnit, onApplyDoorHardware, isReadOnly = false,
  isReviewMode = false, className,
}: DoorQuoteSummaryCardProps) {
  const [editingField, setEditingField] = useState<"labour" | "misc" | "discount" | null>(null)
  const [tempEditVal, setTempEditVal] = useState<string>("")
  const [isCompareOpen, setIsCompareOpen] = useState(false)

  const isInstallation = mode === "installation"
  const upgradeItems = lineItems.filter((i) => i.upgradeOption?.enabled)
  const hasAttachedWindow = Boolean(attachedWindowQuote)
  const hasAttachedSU = Boolean(attachedSealedUnit)
  const hasAnyAttached = hasAttachedWindow || hasAttachedSU

  const universal = calculateUniversalPricing({
    doorQuote: { data: { totals, mode } },
    windowQuote: attachedWindowQuote,
    sealedUnitQuote: attachedSealedUnit,
    hostType: "door",
    isSupplyOnly: !isInstallation,
    isFirstNation,
    overrides: {
      customLabour,
      customMisc,
      customDiscount,
    },
  })

  const winBase = universal.winNorm?.rawBase || 0
  const winJC = universal.winNorm?.jambsAndCasing || 0
  const winJCDescription = attachedWindowQuote?.jcLabel || "Jambs & Casing"
  const winCustomMaterialsList = hasAttachedWindow
    ? (attachedWindowQuote.totals?.customMaterialsList || attachedWindowQuote.taxTotals?.customMaterials || [])
    : []
  const winCustomMaterials = universal.winNorm?.customMaterials || 0
  const winDiscount = universal.winNorm?.discount || 0
  const suGlass = universal.suNorm?.materials || 0
  const winLabour = universal.winNorm?.pureLabour || 0
  const suLabour = universal.suNorm?.pureLabour || 0
  const winMisc = universal.winNorm?.misc || 0
  const suMisc = universal.suNorm?.misc || 0
  const winSurcharge = universal.winNorm?.surcharge || 0
  const suSurcharge = universal.suNorm?.surcharge || 0

  const defaultDoorLabour = isInstallation ? (universal.doorNorm?.pureLabour || 0) + universal.travelAndSetup : 0
  const combinedLabour = universal.combinedLabour
  const defaultDoorMisc = isInstallation ? (universal.doorNorm?.misc || 0) : 0
  const combinedMisc = universal.misc

  const compareDoorLabour = customLabour !== "" ? parseFloat(customLabour) || 0 : (totals.fullInstallLabour ?? totals.combinedLabourTotal)
  const compareLabour = compareDoorLabour + winLabour + suLabour
  const compareDoorMisc = customMisc !== "" ? parseFloat(customMisc) || 0 : (totals.fullInstallMisc ?? totals.miscTotal)
  const compareMisc = compareDoorMisc + winMisc + suMisc

  const { attachedInstallOption, setAttachedInstallOption, dynamicInstallDeltaDollars } = useDoorSummaryInstallOption({
    mode, quoteNumber, lineItems, totals, compareLabour, compareMisc,
  })

  const combinedSurcharge = universal.surcharges
  const combinedSubtotal = universal.subtotal
  const combinedTax = universal.hstAmount
  const displayGrandTotal = universal.total
  const firstPayment = universal.firstPayment
  const secondPayment = universal.secondPayment

  const attSUSentence = hasAttachedSU
    ? attachedSealedUnit.lineItems && attachedSealedUnit.lineItems.length > 0
      ? formatSealedUnitSummarySentence(attachedSealedUnit.lineItems)
      : "Attached Sealed Glass Units"
    : ""

  const attWinSentence = hasAttachedWindow
    ? formatWindowSummarySentence(attachedWindowQuote.windows || []) !== "0 Windows"
      ? formatWindowSummarySentence(attachedWindowQuote.windows || [])
      : attachedWindowQuote.summarySentence || attachedWindowQuote.summaryLabel || "Attached Window Units"
    : ""

  const attLabour = winLabour + suLabour
  const attMisc = winMisc + suMisc
  const handleSetCustomLabour = (val: string) => {
    if (!setCustomLabour) return
    if (!val || val.trim() === "") { setCustomLabour(""); return }
    const num = Math.max(0, (parseFloat(val) || 0) - (hasAnyAttached ? attLabour : 0))
    setCustomLabour(num.toFixed(2))
  }
  const handleSetCustomMisc = (val: string) => {
    if (!setCustomMisc) return
    if (!val || val.trim() === "") { setCustomMisc(""); return }
    const num = Math.max(0, (parseFloat(val) || 0) - (hasAnyAttached ? attMisc : 0))
    setCustomMisc(num.toFixed(2))
  }

  return (
    <>
      <Card className={cn("relative flex flex-col gap-0 overflow-hidden border-border bg-card/80 py-0 shadow-xl backdrop-blur-xl [--card-spacing:0px]", className)}>
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
        <DoorSummaryHeader
          quoteNumber={quoteNumber} customerName={customerName} mode={mode}
          onModeChange={onModeChange} onOpenCompare={() => setIsCompareOpen(true)} isReadOnly={isReadOnly}
        />
        <CardContent className="flex flex-1 flex-col justify-between space-y-4 p-3.5 pt-3">
          <DoorSummaryAttachedBadges
            attachedWindowQuote={attachedWindowQuote} attachedSealedUnit={attachedSealedUnit}
            attachedInstallOption={attachedInstallOption} mode={mode}
            onRemoveAttachedWindowQuote={onRemoveAttachedWindowQuote}
            onRemoveAttachedSealedUnit={onRemoveAttachedSealedUnit}
            onRemoveAttachedInstallOption={() => { setAttachedInstallOption(null); writeSessionAttachedInstallOption(null) }}
            dynamicInstallDeltaDollars={dynamicInstallDeltaDollars}
          />
          <DoorSummaryLedger
            lineItems={lineItems} totals={totals} isInstallation={isInstallation}
            hasAttachedWindow={hasAttachedWindow} hasAttachedSU={hasAttachedSU}
            attachedWindowQuote={attachedWindowQuote} attachedWinSentence={attWinSentence} attachedSUSentence={attSUSentence}
            winBase={winBase} winJC={winJC} winJCDescription={winJCDescription}
            winCustomMaterialsList={winCustomMaterialsList} suGlass={suGlass}
            combinedLabour={combinedLabour} customLabour={customLabour} defaultDoorLabour={defaultDoorLabour}
            winLabour={winLabour} suLabour={suLabour} setCustomLabour={setCustomLabour ? handleSetCustomLabour : undefined}
            combinedMisc={combinedMisc} customMisc={customMisc} defaultDoorMisc={defaultDoorMisc}
            winMisc={winMisc} suMisc={suMisc} setCustomMisc={setCustomMisc ? handleSetCustomMisc : undefined}
            customDiscount={customDiscount} setCustomDiscount={setCustomDiscount}
            defaultDoorDiscount={lineItems.reduce((acc, item) => item.category !== "storm" ? acc + item.discountAmount * item.quantity : acc, 0)}
            hasAnyAttached={hasAnyAttached} combinedSurcharge={combinedSurcharge} winDiscount={winDiscount}
            combinedSubtotal={combinedSubtotal} isFirstNation={isFirstNation} onToggleFirstNation={onToggleFirstNation}
            hstRate={hstRate} setHstRate={setHstRate} combinedTax={combinedTax} displayGrandTotal={displayGrandTotal}
            firstPayment={firstPayment} secondPayment={secondPayment} editingField={editingField}
            setEditingField={setEditingField} tempEditVal={tempEditVal} setTempEditVal={setTempEditVal} isReadOnly={isReadOnly}
          />
          <DoorSummaryUpgrades upgradeItems={upgradeItems} />
          <CustomOptionsSection canModifyOptions={!isReadOnly} quoteNumber={quoteNumber} />
          <DoorSummaryActions
            isAdmin={isAdmin} canSubmit={lineItems.length > 0} isReviewMode={isReviewMode}
            onSubmitQuote={onSubmitQuote} onPrintPreview={onPrintPreview}
          />
        </CardContent>
      </Card>
      <SupplyVsInstallCompareModal
        isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} title="Door Quote Comparison"
        quoteNumber={quoteNumber} customerName={customerName} currentMode={mode === "supply_only" ? "supply" : "install"}
        currentSubtotal={combinedSubtotal} baseLabel="Door Units" baseAmount={totals.rawDoorBaseTotal + totals.stormDoorTotal}
        attachedLabel={[hasAttachedWindow ? attWinSentence : "", hasAttachedSU ? attSUSentence : ""].filter(Boolean).join(" + ") || undefined}
        attachedAmount={(hasAttachedWindow ? winBase + winJC + winCustomMaterials - winDiscount : 0) + (hasAttachedSU ? suGlass : 0)}
        labourAmount={compareLabour} miscAmount={compareMisc} surchargeAmount={combinedSurcharge}
        surchargeLabel="Surcharge (8% on materials)" discountAmount={totals.discountTotal + (winDiscount > 0 ? winDiscount : 0)}
        discountLabel="10% Discount" hardwareAmount={totals.hardwareTotal} hardwareLabel="Lockset & Hardware"
        doorItems={lineItems} standardHardwarePrice={158.0} onApplyDoorHardware={onApplyDoorHardware}
        hstRate={hstRate !== undefined ? hstRate : (isFirstNation ? 8 : 13)} onApplyMode={(m) => onModeChange(m === "supply" ? "supply_only" : "installation")}
        onToggleAttachOption={(att, c, title, hasSupplyJC, hardwareConfig, hardwareTotal) => {
          setAttachedInstallOption(att ? { enabled: true, amountPreTaxCents: c, title, hasSupplyJC, hardwareConfig, hardwareTotal } : null)
        }}
      />
    </>
  )
}
