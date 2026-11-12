"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { PackageCheck } from "lucide-react"
import { SealedUnitLineItem } from "@/lib/sealed-units-logic"
import { formatDoorSummarySentence } from "@/lib/doors/calculations"
import { formatWindowSummarySentence } from "@/hooks/useCalculatorWindows"
import { SealedUnitSummaryHeader } from "./summary/SealedUnitSummaryHeader"
import { SealedUnitSummaryAttachedBadges } from "./summary/SealedUnitSummaryAttachedBadges"
import { SealedUnitSummaryLedger } from "./summary/SealedUnitSummaryLedger"
import { SealedUnitSummaryActions } from "./summary/SealedUnitSummaryActions"
import { SupplyVsInstallCompareModal } from "@/components/shared/SupplyVsInstallCompareModal"

interface SealedUnitQuoteSummaryCardProps {
  lineItems: SealedUnitLineItem[]
  lineItemsCount: number
  mode?: "installation" | "supply_only" | "service_only"
  onModeChange?: (mode: "installation" | "supply_only" | "service_only") => void
  isInstallation: boolean
  labour: any
  hstRate: number
  setHstRate: (rate: number) => void
  totals: {
    totalUnits: number
    totalSqft: number
    totalBillableSqft: number
    glassBefore8PercentTotal: number
    glass8PercentSurchargeTotal: number
    glassSupplyTotal: number
    unitLabourSum: number
    baseSetupFee: number
    additionalFarFee: number
    vehicleTravelFee: number
    crewTravelFee: number
    totalAdditionalTravel: number
    totalTravelAndSetup: number
    combinedLabourTotal: number
    miscTotal: number
    serviceLabourTotal?: number
    subtotalPreTax: number
    hstAmount: number
    grandTotal: number
    effectiveLabourRate?: number
    effectiveMiscRate?: number
  }
  customerName: string
  quoteNumber: string
  quoteNotes: string
  setQuoteNotes: (notes: string) => void
  user?: any
  onOpenSubmitModal?: () => void
  onPrint: () => void
  onResetQuote?: () => void
  onSaveDraft?: () => void
  onOpenSavedQuotes?: () => void
  attachedWindowQuote?: any | null
  attachedDoorQuote?: any | null
  onOpenAttachModal?: () => void
  onRemoveAttachedWindowQuote?: () => void
  onRemoveAttachedDoorQuote?: () => void
}

export function SealedUnitQuoteSummaryCard({
  lineItems,
  lineItemsCount,
  mode = "installation",
  onModeChange,
  isInstallation,
  labour,
  hstRate,
  setHstRate,
  totals,
  customerName,
  quoteNumber,
  quoteNotes,
  setQuoteNotes,
  user,
  onOpenSubmitModal,
  onPrint,
  attachedWindowQuote,
  attachedDoorQuote,
  onRemoveAttachedWindowQuote,
  onRemoveAttachedDoorQuote,
}: SealedUnitQuoteSummaryCardProps) {
  const [isCompareOpen, setIsCompareOpen] = React.useState(false)
  const isService = mode === "service_only"
  const hasAttachedWindow = Boolean(attachedWindowQuote)
  const hasAttachedDoor = Boolean(attachedDoorQuote)
  const hasAnyAttached = hasAttachedWindow || hasAttachedDoor
  const hasContent = isService
    ? (totals.totalSqft || 0) > 0 || lineItemsCount > 0
    : lineItemsCount > 0 || hasAnyAttached

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
  const doorRawBase = hasAttachedDoor
    ? (attachedDoorQuote.totals?.rawDoorBaseTotal || 0) +
      (attachedDoorQuote.totals?.stormDoorTotal || 0) +
      (attachedDoorQuote.totals?.hardwareTotal || 0)
    : 0
  const doorDiscount = hasAttachedDoor
    ? attachedDoorQuote.totals?.discountTotal || 0
    : 0

  const winLabour = hasAttachedWindow
    ? attachedWindowQuote.totals?.labour || 0
    : 0
  const doorLabour = hasAttachedDoor
    ? (attachedDoorQuote.totals?.unitLabourTotal || 0) +
      (attachedDoorQuote.totals?.upchargesTotal || 0)
    : 0
  const winMisc = hasAttachedWindow ? attachedWindowQuote.totals?.misc || 0 : 0
  const doorMisc = hasAttachedDoor
    ? attachedDoorQuote.totals?.miscTotal || 0
    : 0
  const rawWinSurcharge = hasAttachedWindow
    ? attachedWindowQuote.totals?.surcharge || 0
    : 0
  const winSurcharge =
    rawWinSurcharge > winBase && winBase > 0
      ? Math.round(winBase * 0.08 * 100) / 100
      : rawWinSurcharge
  const doorSurcharge = hasAttachedDoor
    ? attachedDoorQuote.totals?.surchargeTotal || 0
    : 0

  const suMaterials = isService ? 0 : totals.glassBefore8PercentTotal
  const combinedLabour = totals.combinedLabourTotal + winLabour + doorLabour
  const combinedMisc = totals.miscTotal + winMisc + doorMisc
  const combinedSurcharge =
    totals.glass8PercentSurchargeTotal + winSurcharge + doorSurcharge
  const combinedSubtotal = hasAnyAttached
    ? Math.round(
        (suMaterials +
          (winBase - winDiscount) +
          winJC +
          (doorRawBase - doorDiscount) +
          combinedLabour +
          combinedMisc +
          combinedSurcharge) *
          100
      ) / 100
    : totals.subtotalPreTax

  let combinedTax = totals.hstAmount
  if (hasAnyAttached) {
    if (hstRate === 8) {
      const mat =
        totals.glassBefore8PercentTotal +
        totals.glass8PercentSurchargeTotal +
        (winBase - winDiscount + winSurcharge + winJC) +
        (doorRawBase - doorDiscount + doorSurcharge)
      const srv = combinedLabour + combinedMisc
      combinedTax = Math.round((mat * 0.05 + srv * 0.13) * 100) / 100
    } else if (hstRate === 13) {
      combinedTax = Math.round(combinedSubtotal * 0.13 * 100) / 100
    } else {
      combinedTax = 0
    }
  }

  const displayGrandTotal = hasAnyAttached
    ? Math.round((combinedSubtotal + combinedTax) * 100) / 100
    : totals.grandTotal
  const firstPayment = Math.floor((displayGrandTotal / 2) * 100) / 100
  const secondPayment =
    Math.round((displayGrandTotal - firstPayment) * 100) / 100

  const attachedDoorSentence = hasAttachedDoor
    ? attachedDoorQuote.lineItems && attachedDoorQuote.lineItems.length > 0
      ? formatDoorSummarySentence(attachedDoorQuote.lineItems)
      : "Attached Door Units"
    : ""

  const attachedWinSentence = hasAttachedWindow
    ? formatWindowSummarySentence(attachedWindowQuote.windows || []) !==
      "0 Windows"
      ? formatWindowSummarySentence(attachedWindowQuote.windows || [])
      : attachedWindowQuote.summarySentence ||
        attachedWindowQuote.summaryLabel ||
        `Attached Window Units (#${attachedWindowQuote.quoteNumber})`
    : ""

  return (
    <>
      <Card className="relative flex flex-col gap-0 overflow-hidden border-border bg-card/80 py-0 shadow-xl backdrop-blur-xl [--card-spacing:0px]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
        <SealedUnitSummaryHeader
          quoteNumber={quoteNumber}
          customerName={customerName}
          mode={mode}
          onModeChange={onModeChange}
          isService={isService}
          onOpenCompare={() => setIsCompareOpen(true)}
        />

        <CardContent className="flex flex-1 flex-col justify-between space-y-4 p-3.5 pt-3">
          <SealedUnitSummaryAttachedBadges
            attachedWindowQuote={attachedWindowQuote}
            attachedDoorQuote={attachedDoorQuote}
            onRemoveAttachedWindowQuote={onRemoveAttachedWindowQuote}
            onRemoveAttachedDoorQuote={onRemoveAttachedDoorQuote}
          />

          {!hasContent ? (
            <div className="space-y-1.5 py-8 text-center text-muted-foreground">
              <PackageCheck className="mx-auto h-8 w-8 text-muted-foreground opacity-30" />
              <div className="text-xs font-semibold">
                {isService
                  ? "No service square footage entered yet"
                  : "No items added to quote yet"}
              </div>
              <p className="mx-auto max-w-xs text-[11px] text-muted-foreground/80">
                {isService
                  ? "Enter total service square footage above or configure glass units on the left to compute pricing."
                  : 'Configure glass specs on the left and click "Add to Quote" to compute exact pricing.'}
              </p>
            </div>
          ) : (
            <SealedUnitSummaryLedger
              isService={isService}
              lineItems={lineItems}
              lineItemsCount={lineItemsCount}
              totals={totals}
              labour={labour}
              combinedLabour={combinedLabour}
              combinedMisc={combinedMisc}
              combinedSurcharge={combinedSurcharge}
              combinedSubtotal={combinedSubtotal}
              combinedTax={combinedTax}
              displayGrandTotal={displayGrandTotal}
              firstPayment={firstPayment}
              secondPayment={secondPayment}
              hasAttachedWindow={hasAttachedWindow}
              hasAttachedDoor={hasAttachedDoor}
              hasAnyAttached={hasAnyAttached}
              attachedWindowQuote={attachedWindowQuote}
              attachedDoorQuote={attachedDoorQuote}
              attachedWinSentence={attachedWinSentence}
              attachedDoorSentence={attachedDoorSentence}
              winBase={winBase}
              winJC={winJC}
              winJCDescription={winJCDescription}
              winDiscount={winDiscount}
              doorRawBase={doorRawBase}
              doorDiscount={doorDiscount}
              isInstallation={isInstallation}
              hstRate={hstRate}
              setHstRate={setHstRate}
            />
          )}

          <SealedUnitSummaryActions
            quoteNotes={quoteNotes}
            setQuoteNotes={setQuoteNotes}
            hasContent={hasContent}
            user={user}
            onOpenSubmitModal={onOpenSubmitModal}
            onPrint={onPrint}
          />
        </CardContent>
      </Card>

      <SupplyVsInstallCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        title="Sealed Unit Quote Comparison"
        quoteNumber={quoteNumber}
        customerName={customerName}
        currentMode={mode === "supply_only" ? "supply" : "install"}
        baseLabel={isService ? "Service Total" : "Glass Units"}
        baseAmount={totals.glassBefore8PercentTotal}
        attachedLabel={
          hasAttachedWindow
            ? attachedWinSentence
            : hasAttachedDoor
              ? attachedDoorSentence
              : undefined
        }
        attachedAmount={
          (hasAttachedWindow ? winBase + winJC - winDiscount : 0) +
          (hasAttachedDoor ? doorRawBase - doorDiscount : 0)
        }
        labourAmount={combinedLabour}
        miscAmount={combinedMisc}
        surchargeAmount={combinedSurcharge}
        surchargeLabel="Surcharge (8% on glass)"
        hstRate={hstRate}
        onApplyMode={(m) =>
          onModeChange &&
          onModeChange(m === "supply" ? "supply_only" : "installation")
        }
      />
    </>
  )
}
