"use client"

import React from "react"
import { PreviewModalWrapper } from "./PreviewModalWrapper"
import { CalculatorReviewModals } from "./CalculatorReviewModals"
import { CalculatorComparisonModal } from "./CalculatorComparisonModal"
import { CalculatorUtilityModals } from "./CalculatorUtilityModals"
import { CalculatorModalsGroupProps } from "./types"

export type { CalculatorModalsGroupProps }

export function CalculatorModalsGroup(props: CalculatorModalsGroupProps) {
  const {
    isPreviewOpen,
    setIsPreviewOpen,
    quoteTemplate,
    setQuoteTemplate,
    quoteFontSize,
    setQuoteFontSize,
    quoteSpacing,
    setQuoteSpacing,
    quoteNotes,
    setQuoteNotes,
    isReadOnly,
    preparedBy,
    customerName,
    quoteNumber,
    windows,
    taxTotals,
    quoteResult,
    availablePromos,
    activePromoId,
    basePrice,
    surcharge,
    wantsUpgrade,
    shownUpgrade,
    hstRate,
    total,
    beforeTaxDiscount,
    afterDiscount,
    firstPayment,
    secondPayment,
    includeLabourInPromo,
    includeMiscInPromo,
    includeJCInPromo,
    effectiveJC,
    effectiveMisc,
    effectiveLabour,
    attachedUpgrade,
    attachedSealedUnit,
    attachedDoorQuote,
    isSupplyOnly,
  } = props

  return (
    <>
      <PreviewModalWrapper
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        template={quoteTemplate}
        onTemplateChange={setQuoteTemplate}
        fontSize={quoteFontSize}
        onFontSizeChange={setQuoteFontSize}
        spacing={quoteSpacing}
        onSpacingChange={setQuoteSpacing}
        quoteNotes={quoteNotes}
        onQuoteNotesChange={isReadOnly ? undefined : setQuoteNotes}
        preparedBy={preparedBy}
        customerName={customerName}
        quoteNumber={quoteNumber}
        windows={windows}
        taxTotals={taxTotals}
        quoteResult={quoteResult}
        activePromo={
          quoteResult && (quoteResult.promoDiscount ?? 0) > 0
            ? {
                name:
                  availablePromos.find(
                    (p) =>
                      p._id === activePromoId || (p as any).id === activePromoId
                  )?.name || "Custom Promo",
                discount: quoteResult.promoDiscount ?? 0,
              }
            : null
        }
        basePrice={basePrice}
        surcharge={surcharge}
        wantsUpgrade={wantsUpgrade}
        shownUpgrade={shownUpgrade}
        hstRate={hstRate}
        total={total}
        beforeTaxDiscount={beforeTaxDiscount}
        afterDiscount={afterDiscount}
        firstPayment={firstPayment}
        secondPayment={secondPayment}
        regionName={taxTotals?.regionName || taxTotals?.city}
        includeLabourInPromo={includeLabourInPromo}
        includeMiscInPromo={includeMiscInPromo}
        includeJCInPromo={includeJCInPromo}
        effectiveJC={effectiveJC}
        effectiveMisc={effectiveMisc}
        effectiveLabour={effectiveLabour}
        attachedUpgrade={attachedUpgrade}
        attachedSealedUnit={attachedSealedUnit}
        attachedDoorQuote={attachedDoorQuote}
        isSupplyOnly={isSupplyOnly}
      />

      <CalculatorReviewModals {...props} />

      <CalculatorComparisonModal {...props} />

      <CalculatorUtilityModals {...props} />
    </>
  )
}
