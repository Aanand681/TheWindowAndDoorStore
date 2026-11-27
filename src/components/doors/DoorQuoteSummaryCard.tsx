"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { DoorLineItem, DoorQuoteTotals, DoorQuotingMode } from "@/lib/doors/types"
import { calculateUniversalPricing } from "@/lib/quotes/universal-pricing-engine"
import { writeSessionAttachedInstallOption } from "@/hooks/calculator/supply-mode/supply-session-storage"
import { formatSealedUnitSummarySentence } from "@/lib/sealed-units-logic"
import { formatWindowSummarySentence } from "@/hooks/useCalculatorWindows"
import { cn } from "@/lib/utils"
import { UnifiedSummaryHeader } from "@/components/shared/summary/UnifiedSummaryHeader"
import { UnifiedAttachedBadges } from "@/components/shared/summary/UnifiedAttachedBadges"
import { DoorSummaryLedger } from "./summary/DoorSummaryLedger"
import { UnifiedUpgradeCallouts } from "@/components/shared/summary/UnifiedUpgradeCallouts"
import { UnifiedSummaryActions } from "@/components/shared/summary/UnifiedSummaryActions"
import { CustomOptionsSection } from "@/components/calculator/summary/CustomOptionsSection"
import { SupplyVsInstallCompareModal } from "@/components/shared/SupplyVsInstallCompareModal"
import { useDoorSummaryInstallOption } from "./summary/useDoorSummaryInstallOption"
import { computeDeduplicatedInstallCompareAmounts } from "@/lib/quotes/supply-install-delta"

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
  customDiscountLabel?: string
  setCustomDiscountLabel?: (val: string) => void
  loyaltyDiscount?: string
  setLoyaltyDiscount?: (val: string) => void
  loyaltyDiscountLabel?: string
  setLoyaltyDiscountLabel?: (val: string) => void
  discountType?: "none" | "custom" | "loyalty"
  setDiscountType?: (val: "none" | "custom" | "loyalty") => void
  loyaltyPoints?: number
  setLoyaltyPoints?: (val: number) => void
  loyaltyGrossAmount?: number
  setLoyaltyGrossAmount?: (val: number) => void
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
  customDiscountLabel = "", setCustomDiscountLabel,
  loyaltyDiscount = "", setLoyaltyDiscount,
  loyaltyDiscountLabel = "", setLoyaltyDiscountLabel,
  discountType = "none", setDiscountType,
  loyaltyPoints = 0, setLoyaltyPoints,
  loyaltyGrossAmount = 0, setLoyaltyGrossAmount,
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

  const resolvedHstRate = hstRate !== undefined ? hstRate : (isFirstNation ? 8 : 13)
  const universal = calculateUniversalPricing({
    doorQuote: { data: { totals, mode } },
    windowQuote: attachedWindowQuote,
    sealedUnitQuote: attachedSealedUnit,
    hostType: "door",
    isSupplyOnly: !isInstallation,
    hstRate: resolvedHstRate,
    isFirstNation: resolvedHstRate === 8 || isFirstNation,
    overrides: {
      customLabour,
      customMisc,
      customDiscount,
      customDiscountLabel,
      loyaltyDiscount,
      loyaltyDiscountLabel,
    },
  })

  const winBase = universal.winNorm?.rawBase || 0
  const winJC = universal.winNorm?.jambsAndCasing || 0
  const winJCDescription = attachedWindowQuote?.jcLabel || "Jambs & Casing"
  const winCustomMaterialsList = hasAttachedWindow
    ? (attachedWindowQuote.totals?.customMaterialsList || attachedWindowQuote.taxTotals?.customMaterials || [])
    : []
  const winCustomMaterials = universal.winNorm?.customMaterials || 0
  const suCustomMaterialsList = hasAttachedSU
    ? (attachedSealedUnit.totals?.customMaterialsList || attachedSealedUnit.totals?.customMaterials || [])
    : []
  const suCustomMaterials = universal.suNorm?.customMaterials || 0
  const winDiscount = universal.winNorm?.discount || 0
  const winLoyaltyDiscount = universal.winNorm?.loyaltyDiscount || 0
  const suDiscount = universal.suNorm?.discount || 0
  const suLoyaltyDiscount = universal.suNorm?.loyaltyDiscount || 0
  const suGlass = universal.suNorm?.rawBase || 0
  const winLabour = universal.winNorm?.pureLabour || 0
  const suLabour = universal.suNorm?.pureLabour || 0
  const winMisc = universal.winNorm?.misc || 0
  const suMisc = universal.suNorm?.misc || 0

  const defaultDoorLabour = isInstallation ? (universal.doorNorm?.pureLabour || 0) + universal.travelAndSetup : 0
  const combinedLabour = universal.combinedLabour
  const defaultDoorMisc = isInstallation ? (universal.doorNorm?.misc || 0) : 0
  const combinedMisc = universal.misc

  const dedupCompare = computeDeduplicatedInstallCompareAmounts({
    hasWindows: hasAttachedWindow,
    isWinSupplyOnly: Boolean(attachedWindowQuote?.isSupplyOnly),
    attachedWindowQuote,
    hasDoors: true,
    isDoorSupplyOnly: !isInstallation,
    doorTotals: totals,
    doorOverrideLabourDollars: customLabour !== "" ? parseFloat(customLabour) || 0 : undefined,
    doorOverrideMiscDollars: customMisc !== "" ? parseFloat(customMisc) || 0 : undefined,
    hasSealedUnits: hasAttachedSU,
    isSUSupplyOnly: Boolean(attachedSealedUnit?.sealedUnitMode === "supply_only" || attachedSealedUnit?.isSupplyOnly),
    attachedSealedUnit,
  })
  const compareLabour = dedupCompare.compareLabourAmount
  const compareMisc = dedupCompare.compareMiscAmount

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
        <UnifiedSummaryHeader
          mode={mode === "supply_only" ? "supply_only" : "installation"}
          onModeChange={(m) =>
            onModeChange(m === "supply_only" ? "supply_only" : "installation")
          }
          onOpenCompare={() => setIsCompareOpen(true)}
          isReadOnly={isReadOnly}
        />
        <CardContent className="space-y-4 px-5 pt-3.5 pb-5 sm:px-6">
          <UnifiedAttachedBadges
            hostType="door"
            attachedWindowQuote={attachedWindowQuote}
            attachedSealedUnit={attachedSealedUnit}
            attachedInstallOption={attachedInstallOption}
            isSupply={mode === "supply_only"}
            includeHardwareSummary={true}
            onRemoveAttachedWindowQuote={onRemoveAttachedWindowQuote}
            onRemoveAttachedSealedUnit={onRemoveAttachedSealedUnit}
            onRemoveAttachedInstallOption={() => {
              setAttachedInstallOption(null)
              writeSessionAttachedInstallOption(null, "door")
            }}
            dynamicInstallDeltaDollars={dynamicInstallDeltaDollars}
          />
          <DoorSummaryLedger
            lineItems={lineItems} totals={totals} isInstallation={isInstallation}
            hasAttachedWindow={hasAttachedWindow} hasAttachedSU={hasAttachedSU}
            attachedWindowQuote={attachedWindowQuote} attachedSealedUnit={attachedSealedUnit}
            winNorm={universal.winNorm} suNorm={universal.suNorm}
            attachedWinSentence={attWinSentence} attachedSUSentence={attSUSentence}
            winBase={winBase} winJC={winJC} winJCDescription={winJCDescription}
            winCustomMaterialsList={winCustomMaterialsList}
            suCustomMaterialsList={suCustomMaterialsList}
            suCustomMaterials={suCustomMaterials}
            winCustomMaterials={winCustomMaterials}
            suGlass={suGlass}
            combinedLabour={combinedLabour} customLabour={customLabour} defaultDoorLabour={defaultDoorLabour}
            winLabour={winLabour} suLabour={suLabour} setCustomLabour={setCustomLabour ? handleSetCustomLabour : undefined}
            combinedMisc={combinedMisc} customMisc={customMisc} defaultDoorMisc={defaultDoorMisc}
            winMisc={winMisc} suMisc={suMisc} setCustomMisc={setCustomMisc ? handleSetCustomMisc : undefined}
            customDiscount={customDiscount} setCustomDiscount={setCustomDiscount}
            customDiscountLabel={customDiscountLabel} setCustomDiscountLabel={setCustomDiscountLabel}
            loyaltyDiscount={loyaltyDiscount} setLoyaltyDiscount={setLoyaltyDiscount}
            loyaltyDiscountLabel={loyaltyDiscountLabel} setLoyaltyDiscountLabel={setLoyaltyDiscountLabel}
            discountType={discountType} setDiscountType={setDiscountType}
            loyaltyPoints={loyaltyPoints} setLoyaltyPoints={setLoyaltyPoints}
            loyaltyGrossAmount={loyaltyGrossAmount} setLoyaltyGrossAmount={setLoyaltyGrossAmount}
            defaultDoorDiscount={lineItems.reduce((acc, item) => item.category !== "storm" ? acc + item.discountAmount * item.quantity : acc, 0)}
            hasAnyAttached={hasAnyAttached} combinedSurcharge={combinedSurcharge}
            winDiscount={winDiscount} winLoyaltyDiscount={winLoyaltyDiscount}
            suDiscount={suDiscount} suLoyaltyDiscount={suLoyaltyDiscount}
            combinedSubtotal={combinedSubtotal} isFirstNation={isFirstNation} onToggleFirstNation={onToggleFirstNation}
            hstRate={hstRate} setHstRate={setHstRate} combinedTax={combinedTax} displayGrandTotal={displayGrandTotal}
            firstPayment={firstPayment} secondPayment={secondPayment} editingField={editingField}
            setEditingField={setEditingField} tempEditVal={tempEditVal} setTempEditVal={setTempEditVal} isReadOnly={isReadOnly}
            combinedHstBase={universal.hstBase} combinedMaterialExemption={universal.materialExemption}
          />
          <UnifiedUpgradeCallouts
            doorUpgradeItems={upgradeItems}
            attachedWindowQuote={attachedWindowQuote}
          />
          <CustomOptionsSection scope="door" canModifyOptions={!isReadOnly} quoteNumber={quoteNumber} />
          <UnifiedSummaryActions
            isAdmin={isAdmin}
            canSubmit={lineItems.length > 0 || (totals.customMaterialsTotal || 0) > 0 || hasAnyAttached}
            isReviewMode={isReviewMode}
            onSubmitQuote={onSubmitQuote}
            onPrintPreview={onPrintPreview}
          />
        </CardContent>
      </Card>
      <SupplyVsInstallCompareModal
        isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} title="Door Quote Comparison"
        quoteNumber={quoteNumber} customerName={customerName} currentMode={mode === "supply_only" ? "supply" : "install"}
        currentSubtotal={combinedSubtotal} baseLabel="Door Units" baseAmount={totals.rawDoorBaseTotal + totals.stormDoorTotal}
        materialsAmount={totals.customMaterialsTotal || 0} materialsLabel="Additional Materials"
        attachedLabel={[hasAttachedWindow ? attWinSentence : "", hasAttachedSU ? attSUSentence : ""].filter(Boolean).join(" + ") || undefined}
        attachedAmount={(hasAttachedWindow ? winBase + winJC + winCustomMaterials - winDiscount - winLoyaltyDiscount : 0) + (hasAttachedSU ? suGlass + suCustomMaterials - suDiscount - suLoyaltyDiscount : 0)}
        labourAmount={compareLabour} miscAmount={compareMisc} surchargeAmount={combinedSurcharge}
        surchargeLabel="Surcharge (8% on materials)" discountAmount={totals.discountTotal + winDiscount + winLoyaltyDiscount + suDiscount + suLoyaltyDiscount}
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
