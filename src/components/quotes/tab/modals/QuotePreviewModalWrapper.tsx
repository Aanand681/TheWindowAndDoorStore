"use client"

import React from "react"
import QuotePreviewModal from "../../QuotePreviewModal"
import { computeQuotePricing } from "../quote-pricing-helper"
import type { QuoteTemplateType } from "@/components/quotes/invoice/types"

interface QuotePreviewModalWrapperProps {
  previewQuote: any
  setPreviewQuote: (val: any) => void
  isPreviewOpen: boolean
  setIsPreviewOpen: (val: boolean) => void
  previewTemplate: QuoteTemplateType
  setPreviewTemplate: (val: QuoteTemplateType) => void
  previewFontSize: number
  setPreviewFontSize: (val: number) => void
  previewSpacing: number
  setPreviewSpacing: (val: number) => void
  previewNotes: string
  setPreviewNotes: (val: string) => void
  canReview: boolean
  currentUser: any
}

export function QuotePreviewModalWrapper({
  previewQuote,
  setPreviewQuote,
  isPreviewOpen,
  setIsPreviewOpen,
  previewTemplate,
  setPreviewTemplate,
  previewFontSize,
  setPreviewFontSize,
  previewSpacing,
  setPreviewSpacing,
  previewNotes,
  setPreviewNotes,
  canReview,
  currentUser,
}: QuotePreviewModalWrapperProps) {
  if (!previewQuote) return null

  const financials = computeQuotePricing(previewQuote)
  if (!financials) return null

  const isDoor =
    previewQuote.quoteType === "door" ||
    (Array.isArray(previewQuote.windows) &&
      previewQuote.windows.some((w: any) => Boolean(w.doorPresetId)))

  const isSU =
    previewQuote.quoteType === "sealed_unit" ||
    Boolean(previewQuote.taxTotals?.isSealedUnitQuote)

  const isSupplyOnly = Boolean(
    previewQuote.isSupplyOnly ||
    previewQuote.taxTotals?.isSupplyOnly ||
    previewQuote.mode === "supply_only" ||
    previewQuote.sealedUnitMode === "supply_only"
  )

  const hasAttachedInstallOption = Boolean(
    previewQuote.attachedInstallOption?.enabled
  )

  return (
    <QuotePreviewModal
      isOpen={isPreviewOpen}
      onClose={() => {
        setIsPreviewOpen(false)
        setPreviewQuote(null)
      }}
      customerName={previewQuote.customerName}
      quoteNumber={previewQuote.quoteNumber}
      windows={previewQuote.windows || []}
      doors={isDoor ? previewQuote.windows || [] : undefined}
      sealedUnits={isSU ? previewQuote.windows || [] : undefined}
      taxTotals={previewQuote.taxTotals}
      doorTotals={isDoor ? previewQuote.taxTotals : undefined}
      sealedUnitTotals={isSU ? previewQuote.taxTotals : undefined}
      quoteResult={previewQuote.quoteResult}
      activePromo={
        financials.promoDiscount > 0
          ? {
              name: previewQuote.quoteResult?.promoName || "Applied Promo",
              discount: financials.promoDiscount,
            }
          : null
      }
      basePrice={financials.basePrice}
      surcharge={financials.surcharge}
      wantsUpgrade={Boolean(previewQuote.wantsUpgrade)}
      shownUpgrade={0}
      hstRate={financials.hstRate}
      total={financials.total}
      beforeTaxDiscount={financials.beforeTaxDiscount}
      afterDiscount={financials.afterDiscount}
      firstPayment={financials.firstPayment}
      secondPayment={financials.secondPayment}
      regionName={
        previewQuote.taxTotals?.regionName || previewQuote.taxTotals?.city
      }
      includeLabourInPromo={financials.includeLabourInPromo}
      includeMiscInPromo={financials.includeMiscInPromo}
      includeJCInPromo={financials.includeJCInPromo}
      effectiveJC={financials.effectiveJC}
      effectiveMisc={financials.effectiveMisc}
      effectiveLabour={financials.effectiveLabour}
      isSupplyOnly={isSupplyOnly}
      isDualOption={hasAttachedInstallOption}
      attachedInstallOption={previewQuote.attachedInstallOption || null}
      customOptions={previewQuote.customOptions || []}
      attachedUpgrade={previewQuote.attachedUpgrade || null}
      attachedDoorQuote={previewQuote.attachedDoorQuote || null}
      attachedSealedUnit={previewQuote.attachedSealedUnit || null}
      attachedWindowQuote={previewQuote.attachedWindowQuote || null}
      template={previewTemplate}
      fontSize={previewFontSize}
      spacing={previewSpacing}
      quoteNotes={previewNotes}
      preparedBy={previewQuote.preparedByName || previewQuote.preparedBy}
      onTemplateChange={setPreviewTemplate}
      onFontSizeChange={setPreviewFontSize}
      onSpacingChange={setPreviewSpacing}
      onQuoteNotesChange={
        !canReview &&
        previewQuote?.odooAssignedTo?.toLowerCase() ===
          currentUser?.username?.toLowerCase()
          ? undefined
          : setPreviewNotes
      }
    />
  )
}
