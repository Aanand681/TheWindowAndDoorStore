"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PackageCheck } from "lucide-react"
import { SealedUnitLineItem } from "@/lib/sealed-units-logic"
import { writeSessionAttachedInstallOption } from "@/hooks/calculator/supply-mode/supply-session-storage"
import { formatDoorSummarySentence } from "@/lib/doors/calculations"
import { formatWindowSummarySentence } from "@/hooks/useCalculatorWindows"
import { calculateUniversalPricing } from "@/lib/quotes/universal-pricing-engine"
import { UnifiedSummaryHeader } from "@/components/shared/summary/UnifiedSummaryHeader"
import { UnifiedAttachedBadges } from "@/components/shared/summary/UnifiedAttachedBadges"
import { SealedUnitSummaryLedger } from "./summary/SealedUnitSummaryLedger"
import { UnifiedUpgradeCallouts } from "@/components/shared/summary/UnifiedUpgradeCallouts"
import { UnifiedSummaryActions } from "@/components/shared/summary/UnifiedSummaryActions"
import { CustomOptionsSection } from "@/components/calculator/summary/CustomOptionsSection"
import { SupplyVsInstallCompareModal } from "@/components/shared/SupplyVsInstallCompareModal"
import { useSealedUnitInstallOption } from "./summary/useSealedUnitInstallOption"
import { computeDeduplicatedInstallCompareAmounts } from "@/lib/quotes/supply-install-delta"

interface SealedUnitQuoteSummaryCardProps {
  lineItemsCount: number
  lineItems: SealedUnitLineItem[]
  mode?: "supply_only" | "installation" | "service_only"
  onModeChange?: (mode: "supply_only" | "installation" | "service_only") => void
  isInstallation: boolean
  labour?: any
  hstRate: number
  setHstRate?: (rate: number) => void
  totals: any
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
  customerName?: string
  quoteNumber?: string
  quoteNotes: string
  setQuoteNotes: (notes: string) => void
  user?: any
  onOpenSubmitModal?: () => void
  onPrint?: () => void
  onResetQuote?: () => void
  onSaveDraft?: () => void
  onOpenSavedQuotes?: () => void
  attachedWindowQuote?: any | null
  attachedDoorQuote?: any | null
  onOpenAttachModal?: () => void
  onRemoveAttachedWindowQuote?: () => void
  onRemoveAttachedDoorQuote?: () => void
  isReadOnly?: boolean
  isReviewMode?: boolean
}

export function SealedUnitQuoteSummaryCard({
  lineItemsCount, lineItems, mode = "installation", onModeChange, isInstallation,
  labour, hstRate, setHstRate, totals,
  loyaltyDiscount = "", setLoyaltyDiscount, loyaltyDiscountLabel = "", setLoyaltyDiscountLabel,
  discountType = "none", setDiscountType, loyaltyPoints = 0, setLoyaltyPoints,
  loyaltyGrossAmount = 0, setLoyaltyGrossAmount,
  customerName = "Valued Customer", quoteNumber = "SU-DRAFT",
  user, onOpenSubmitModal = () => {}, onPrint = () => {},
  attachedWindowQuote, attachedDoorQuote, onRemoveAttachedWindowQuote,
  onRemoveAttachedDoorQuote, isReadOnly = false, isReviewMode = false,
}: SealedUnitQuoteSummaryCardProps) {
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const isService = mode === "service_only"
  const hasAttachedWindow = Boolean(attachedWindowQuote)
  const hasAttachedDoor = Boolean(attachedDoorQuote)
  const hasAnyAttached = hasAttachedWindow || hasAttachedDoor
  const hasCustomMaterials = (totals.customMaterialsTotal || 0) > 0 || (Array.isArray(totals.customMaterials) && totals.customMaterials.length > 0)
  const hasContent = isService ? (totals.totalSqft || 0) > 0 || lineItemsCount > 0 || hasCustomMaterials : lineItemsCount > 0 || hasCustomMaterials || hasAnyAttached
  const loyaltyDiscountNum = Math.max(0, parseFloat(String(loyaltyDiscount)) || 0)

  const winJCDescription = attachedWindowQuote?.jcLabel || "Jambs & Casing"
  const winCustomMaterialsList = hasAttachedWindow
    ? (attachedWindowQuote.totals?.customMaterialsList || attachedWindowQuote.taxTotals?.customMaterials || [])
    : []
  const doorCustomMaterialsList = hasAttachedDoor
    ? (attachedDoorQuote.totals?.customMaterialsList || attachedDoorQuote.totals?.customMaterials || attachedDoorQuote.customMaterials || [])
    : []

  const universal = calculateUniversalPricing({
    sealedUnitQuote: { data: { totals, sealedUnitMode: mode } },
    windowQuote: attachedWindowQuote,
    doorQuote: attachedDoorQuote,
    hostType: "sealed_unit",
    isSupplyOnly: !isInstallation && !isService,
    hstRate,
    isFirstNation: hstRate === 8,
    overrides: {
      loyaltyDiscount,
      loyaltyDiscountLabel,
    },
  })

  const winBase = universal.winNorm?.rawBase || 0
  const winJC = universal.winNorm?.jambsAndCasing || 0
  const winCustomMaterials = universal.winNorm?.customMaterials || 0
  const doorCustomMaterials = universal.doorNorm?.customMaterials || 0
  const winDiscount = universal.winNorm?.discount || 0
  const winLoyaltyDiscount = universal.winNorm?.loyaltyDiscount || 0
  const doorRawBase = universal.doorNorm?.rawBase || 0
  const doorDiscount = universal.doorNorm?.discount || 0
  const doorLoyaltyDiscount = universal.doorNorm?.loyaltyDiscount || 0

  const combinedLabour = universal.combinedLabour
  const combinedMisc = universal.misc
  const dedupCompare = computeDeduplicatedInstallCompareAmounts({
    hasWindows: hasAttachedWindow,
    isWinSupplyOnly: Boolean(attachedWindowQuote?.isSupplyOnly),
    attachedWindowQuote,
    hasDoors: hasAttachedDoor,
    isDoorSupplyOnly: Boolean(attachedDoorQuote?.mode === "supply_only" || attachedDoorQuote?.isSupplyOnly),
    attachedDoorQuote,
    hasSealedUnits: true,
    isSUSupplyOnly: !isInstallation && !isService,
    suTotals: totals,
  })
  const compareLabour = dedupCompare.compareLabourAmount
  const compareMisc = dedupCompare.compareMiscAmount

  const { attachedInstallOption, setAttachedInstallOption, dynamicInstallDeltaDollars } = useSealedUnitInstallOption({
    mode, quoteNumber, compareLabour, compareMisc,
  })

  const combinedSurcharge = universal.surcharges
  const combinedSubtotal = universal.subtotal
  const combinedTax = universal.hstAmount
  const displayGrandTotal = universal.total
  const firstPayment = universal.firstPayment
  const secondPayment = universal.secondPayment

  const attachedDoorSentence = hasAttachedDoor
    ? attachedDoorQuote.lineItems && attachedDoorQuote.lineItems.length > 0
      ? formatDoorSummarySentence(attachedDoorQuote.lineItems)
      : "Attached Door Units"
    : ""

  const attachedWinSentence = hasAttachedWindow
    ? formatWindowSummarySentence(attachedWindowQuote.windows || []) !== "0 Windows"
      ? formatWindowSummarySentence(attachedWindowQuote.windows || [])
      : attachedWindowQuote.summarySentence || attachedWindowQuote.summaryLabel || `Attached Window Units (#${attachedWindowQuote.quoteNumber})`
    : ""

  return (
    <>
      <Card className="relative flex flex-col gap-0 overflow-hidden border-border bg-card/80 py-0 shadow-xl backdrop-blur-xl [--card-spacing:0px]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
        <UnifiedSummaryHeader
          mode={mode}
          showModeToggle={Boolean(onModeChange)}
          showServiceOption={true}
          isService={isService}
          onModeChange={onModeChange}
          onOpenCompare={!isService ? () => setIsCompareOpen(true) : undefined}
          isReadOnly={isReadOnly}
        />
        <CardContent className="space-y-4 px-5 pt-3.5 pb-5 sm:px-6">
          <UnifiedAttachedBadges
            hostType="sealed_unit"
            attachedWindowQuote={attachedWindowQuote}
            attachedDoorQuote={attachedDoorQuote}
            attachedInstallOption={attachedInstallOption}
            isSupply={mode === "supply_only"}
            onRemoveAttachedWindowQuote={onRemoveAttachedWindowQuote}
            onRemoveAttachedDoorQuote={onRemoveAttachedDoorQuote}
            onRemoveAttachedInstallOption={() => {
              setAttachedInstallOption(null)
              writeSessionAttachedInstallOption(null, "sealed_unit")
            }}
            dynamicInstallDeltaDollars={dynamicInstallDeltaDollars}
          />
          {!hasContent ? (
            <div className="space-y-1.5 py-8 text-center text-muted-foreground">
              <PackageCheck className="mx-auto h-8 w-8 text-muted-foreground opacity-30" />
              <div className="text-xs font-semibold">{isService ? "No service square footage entered yet" : "No items added to quote yet"}</div>
              <p className="mx-auto max-w-xs text-[11px] text-muted-foreground/80">
                {isService ? "Enter total service square footage above or configure glass units on the left to compute pricing." : 'Configure glass specs on the left and click "Add to Quote" to compute exact pricing.'}
              </p>
            </div>
          ) : (
            <SealedUnitSummaryLedger
              isService={isService} lineItems={lineItems} lineItemsCount={lineItemsCount} totals={totals} labour={labour}
              combinedLabour={combinedLabour} combinedMisc={combinedMisc} combinedSurcharge={combinedSurcharge}
              combinedSubtotal={combinedSubtotal} combinedTax={combinedTax} displayGrandTotal={displayGrandTotal}
              firstPayment={firstPayment} secondPayment={secondPayment} hasAttachedWindow={hasAttachedWindow}
              hasAttachedDoor={hasAttachedDoor} hasAnyAttached={hasAnyAttached} attachedWindowQuote={attachedWindowQuote}
              attachedDoorQuote={attachedDoorQuote} attachedWinSentence={attachedWinSentence} attachedDoorSentence={attachedDoorSentence}
              winBase={winBase} winJC={winJC} winJCDescription={winJCDescription} winCustomMaterialsList={winCustomMaterialsList}
              doorCustomMaterialsList={doorCustomMaterialsList}
              winDiscount={winDiscount} winLoyaltyDiscount={winLoyaltyDiscount} doorRawBase={doorRawBase} doorDiscount={doorDiscount} doorLoyaltyDiscount={doorLoyaltyDiscount} winNorm={universal.winNorm} doorNorm={universal.doorNorm} isInstallation={isInstallation}
              winCustomMaterials={winCustomMaterials} doorCustomMaterials={doorCustomMaterials}
              loyaltyDiscount={loyaltyDiscount} setLoyaltyDiscount={setLoyaltyDiscount}
              loyaltyDiscountLabel={loyaltyDiscountLabel} setLoyaltyDiscountLabel={setLoyaltyDiscountLabel}
              discountType={discountType} setDiscountType={setDiscountType}
              loyaltyPoints={loyaltyPoints} setLoyaltyPoints={setLoyaltyPoints}
              loyaltyGrossAmount={loyaltyGrossAmount} setLoyaltyGrossAmount={setLoyaltyGrossAmount}
              isReadOnly={isReadOnly}
              hstRate={hstRate} setHstRate={setHstRate}
              combinedHstBase={universal.hstBase} combinedMaterialExemption={universal.materialExemption}
            />
          )}
          <UnifiedUpgradeCallouts
            attachedDoorQuote={attachedDoorQuote}
            attachedWindowQuote={attachedWindowQuote}
          />
          <CustomOptionsSection scope="sealed_unit" canModifyOptions={!isReadOnly} quoteNumber={quoteNumber} />
          <UnifiedSummaryActions
            isAdmin={user?.role === "ADMIN" || user?.role === "SUPERADMIN"}
            canSubmit={hasContent}
            isReviewMode={isReviewMode}
            onSubmitQuote={onOpenSubmitModal}
            onPrintPreview={onPrint || (() => {})}
            adminSubmitLabel="Approve & Assign / Submit Quote"
            nonAdminClassName="bg-amber-600 hover:bg-amber-700"
          />
        </CardContent>
      </Card>
      <SupplyVsInstallCompareModal
        isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} title="Sealed Unit Quote Comparison"
        quoteNumber={quoteNumber} customerName={customerName} currentMode={mode === "supply_only" ? "supply" : "install"}
        currentSubtotal={combinedSubtotal} baseLabel={isService ? "Service Total" : "Glass Units"}
        baseAmount={totals.glassBefore8PercentTotal}
        materialsAmount={totals.customMaterialsTotal || 0} materialsLabel="Additional Materials"
        attachedLabel={[hasAttachedWindow ? attachedWinSentence : "", hasAttachedDoor ? attachedDoorSentence : ""].filter(Boolean).join(" + ") || undefined}
        attachedAmount={(hasAttachedWindow ? winBase + winJC + winCustomMaterials - winDiscount - winLoyaltyDiscount : 0) + (hasAttachedDoor ? doorRawBase + doorCustomMaterials - doorDiscount - doorLoyaltyDiscount : 0)}
        labourAmount={compareLabour} miscAmount={compareMisc} surchargeAmount={combinedSurcharge} surchargeLabel="Surcharge"
        discountAmount={loyaltyDiscountNum} discountLabel={loyaltyDiscountLabel || "Additional Discount"}
        hstRate={hstRate} onApplyMode={(m) => onModeChange && onModeChange(m === "supply" ? "supply_only" : "installation")}
        onToggleAttachOption={(att, c, title, hasSupplyJC) => {
          const opt = att ? { enabled: true, amountPreTaxCents: c, title, hasSupplyJC } : null
          setAttachedInstallOption(opt)
          writeSessionAttachedInstallOption(opt, "sealed_unit")
        }}
      />
    </>
  )
}
