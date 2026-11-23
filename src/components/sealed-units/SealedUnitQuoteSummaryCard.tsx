"use client"

import React, { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PackageCheck } from "lucide-react"
import { SealedUnitLineItem } from "@/lib/sealed-units-logic"
import { writeSessionAttachedInstallOption } from "@/hooks/calculator/supply-mode/supply-session-storage"
import { formatDoorSummarySentence } from "@/lib/doors/calculations"
import { formatWindowSummarySentence } from "@/hooks/useCalculatorWindows"
import { calculateUniversalPricing } from "@/lib/quotes/universal-pricing-engine"
import { SealedUnitSummaryHeader } from "./summary/SealedUnitSummaryHeader"
import { SealedUnitSummaryAttachedBadges } from "./summary/SealedUnitSummaryAttachedBadges"
import { SealedUnitSummaryLedger } from "./summary/SealedUnitSummaryLedger"
import { SealedUnitSummaryActions } from "./summary/SealedUnitSummaryActions"
import { CustomOptionsSection } from "@/components/calculator/summary/CustomOptionsSection"
import { SupplyVsInstallCompareModal } from "@/components/shared/SupplyVsInstallCompareModal"
import { useSealedUnitInstallOption } from "./summary/useSealedUnitInstallOption"

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
  labour, hstRate, setHstRate, totals, customerName = "Valued Customer", quoteNumber = "SU-DRAFT",
  quoteNotes, setQuoteNotes, user, onOpenSubmitModal = () => {}, onPrint = () => {},
  attachedWindowQuote, attachedDoorQuote, onRemoveAttachedWindowQuote,
  onRemoveAttachedDoorQuote, isReadOnly = false, isReviewMode = false,
}: SealedUnitQuoteSummaryCardProps) {
  const [isCompareOpen, setIsCompareOpen] = useState(false)
  const isService = mode === "service_only"
  const hasAttachedWindow = Boolean(attachedWindowQuote)
  const hasAttachedDoor = Boolean(attachedDoorQuote)
  const hasAnyAttached = hasAttachedWindow || hasAttachedDoor
  const hasContent = isService ? (totals.totalSqft || 0) > 0 || lineItemsCount > 0 : lineItemsCount > 0 || hasAnyAttached

  const winJCDescription = attachedWindowQuote?.jcLabel || "Jambs & Casing"
  const winCustomMaterialsList = hasAttachedWindow
    ? (attachedWindowQuote.totals?.customMaterialsList || attachedWindowQuote.taxTotals?.customMaterials || [])
    : []

  const universal = calculateUniversalPricing({
    sealedUnitQuote: { data: { totals, sealedUnitMode: mode } },
    windowQuote: attachedWindowQuote,
    doorQuote: attachedDoorQuote,
    hostType: "sealed_unit",
    isSupplyOnly: !isInstallation && !isService,
    hstRate,
    isFirstNation: hstRate === 8,
  })

  const winBase = universal.winNorm?.rawBase || 0
  const winJC = universal.winNorm?.jambsAndCasing || 0
  const winCustomMaterials = universal.winNorm?.customMaterials || 0
  const winDiscount = universal.winNorm?.discount || 0
  const doorRawBase = universal.doorNorm?.rawBase || 0
  const doorDiscount = universal.doorNorm?.discount || 0
  const winLabour = universal.winNorm?.pureLabour || 0
  const doorLabour = universal.doorNorm?.pureLabour || 0
  const winMisc = universal.winNorm?.misc || 0
  const doorMisc = universal.doorNorm?.misc || 0
  const winSurcharge = universal.winNorm?.surcharge || 0
  const doorSurcharge = universal.doorNorm?.surcharge || 0

  const suMaterials = universal.suNorm?.materials || 0
  const combinedLabour = universal.combinedLabour
  const combinedMisc = universal.misc
  const compareSULabour = totals.fullInstallLabour ?? totals.combinedLabourTotal
  const compareLabour = compareSULabour + winLabour + doorLabour
  const compareSUMisc = totals.fullInstallMisc ?? totals.miscTotal
  const compareMisc = compareSUMisc + winMisc + doorMisc

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
        <SealedUnitSummaryHeader
          quoteNumber={quoteNumber} customerName={customerName} mode={mode}
          onModeChange={onModeChange} isService={isService} onOpenCompare={() => setIsCompareOpen(true)} isReadOnly={isReadOnly}
        />
        <CardContent className="flex flex-1 flex-col justify-between space-y-4 p-3.5 pt-3">
          <SealedUnitSummaryAttachedBadges
            attachedWindowQuote={attachedWindowQuote} attachedDoorQuote={attachedDoorQuote}
            attachedInstallOption={attachedInstallOption} mode={mode} isService={isService}
            onRemoveAttachedWindowQuote={onRemoveAttachedWindowQuote} onRemoveAttachedDoorQuote={onRemoveAttachedDoorQuote}
            onRemoveAttachedInstallOption={() => { setAttachedInstallOption(null); writeSessionAttachedInstallOption(null) }}
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
              winDiscount={winDiscount} doorRawBase={doorRawBase} doorDiscount={doorDiscount} isInstallation={isInstallation}
              hstRate={hstRate} setHstRate={setHstRate}
            />
          )}
          <CustomOptionsSection canModifyOptions={!isReadOnly} quoteNumber={quoteNumber} />
          <SealedUnitSummaryActions
            quoteNotes={quoteNotes} setQuoteNotes={setQuoteNotes} hasContent={hasContent}
            user={user} onOpenSubmitModal={onOpenSubmitModal} onPrint={onPrint} isReviewMode={isReviewMode}
          />
        </CardContent>
      </Card>
      <SupplyVsInstallCompareModal
        isOpen={isCompareOpen} onClose={() => setIsCompareOpen(false)} title="Sealed Unit Quote Comparison"
        quoteNumber={quoteNumber} customerName={customerName} currentMode={mode === "supply_only" ? "supply" : "install"}
        currentSubtotal={combinedSubtotal} baseLabel={isService ? "Service Total" : "Glass Units"}
        baseAmount={totals.glassBefore8PercentTotal}
        attachedLabel={[hasAttachedWindow ? attachedWinSentence : "", hasAttachedDoor ? attachedDoorSentence : ""].filter(Boolean).join(" + ") || undefined}
        attachedAmount={(hasAttachedWindow ? winBase + winJC + winCustomMaterials - winDiscount : 0) + (hasAttachedDoor ? doorRawBase - doorDiscount : 0)}
        labourAmount={compareLabour} miscAmount={compareMisc} surchargeAmount={combinedSurcharge} surchargeLabel="Surcharge"
        hstRate={hstRate} onApplyMode={(m) => onModeChange && onModeChange(m === "supply" ? "supply_only" : "installation")}
        onToggleAttachOption={(att, c, title, hasSupplyJC) => {
          const opt = att ? { enabled: true, amountPreTaxCents: c, title, hasSupplyJC } : null
          setAttachedInstallOption(opt)
          writeSessionAttachedInstallOption(opt)
        }}
      />
    </>
  )
}
