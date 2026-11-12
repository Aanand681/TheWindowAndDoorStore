"use client"

import React from "react"
import QuoteInvoice, {
  QuoteTemplateType,
} from "@/components/quotes/QuoteInvoice"
import { readSessionAttachedInstallOption } from "@/hooks/calculator/supply-mode/supply-session-storage"

export interface CalculatorPrintInvoiceProps {
  isPreviewOpen: boolean
  customerName: string
  quoteNumber: string
  windows: any[]
  taxTotals: any
  quoteResult: any
  availablePromos: any[]
  activePromoId: string
  wantsUpgrade: boolean
  shownUpgrade: number
  hstRate: number
  total: number
  beforeTaxDiscount: number
  afterDiscount: number
  firstPayment: number
  secondPayment: number
  includeLabourInPromo: boolean
  includeMiscInPromo: boolean
  includeJCInPromo: boolean
  effectiveJC: number
  effectiveMisc: number
  effectiveLabour: number
  template: QuoteTemplateType
  fontSize: number
  spacing: number
  quoteNotes: string
  preparedBy: string
  attachedUpgrade: any
  attachedSealedUnit: any
  attachedDoorQuote: any
  isSupplyOnly: boolean
}

export function CalculatorPrintInvoice({
  isPreviewOpen,
  customerName,
  quoteNumber,
  windows,
  taxTotals,
  quoteResult,
  availablePromos,
  activePromoId,
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
  template,
  fontSize,
  spacing,
  quoteNotes,
  preparedBy,
  attachedUpgrade,
  attachedSealedUnit,
  attachedDoorQuote,
  isSupplyOnly,
}: CalculatorPrintInvoiceProps) {
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (isPreviewOpen) return null

  return (
    <QuoteInvoice
      customerName={customerName}
      quoteNumber={quoteNumber}
      windows={windows}
      taxTotals={taxTotals}
      quoteResult={quoteResult}
      activePromo={
        quoteResult && quoteResult.promoDiscount > 0
          ? {
              name:
                availablePromos.find(
                  (p) =>
                    p._id === activePromoId || (p as any).id === activePromoId
                )?.name || "Custom Promo",
              discount: quoteResult.promoDiscount,
            }
          : null
      }
      basePrice={quoteResult?.base || 0}
      surcharge={quoteResult?.surcharge || 0}
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
      template={template}
      fontSize={fontSize}
      spacing={spacing}
      quoteNotes={quoteNotes}
      preparedBy={preparedBy}
      attachedUpgrade={attachedUpgrade}
      attachedSealedUnit={attachedSealedUnit}
      attachedDoorQuote={attachedDoorQuote}
      isSupplyOnly={isSupplyOnly}
      isDualOption={Boolean(
        mounted &&
        isSupplyOnly &&
        (attachedUpgrade?.title?.toLowerCase().includes("installation") ||
          attachedUpgrade?.title?.toLowerCase().includes("option") ||
          readSessionAttachedInstallOption()?.enabled)
      )}
    />
  )
}
