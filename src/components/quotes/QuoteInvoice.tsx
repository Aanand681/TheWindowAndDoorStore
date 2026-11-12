"use client"

import React from "react"
import type { QuoteTemplateType, QuoteInvoiceProps } from "./invoice/types"
import { useInvoiceCalculations } from "@/hooks/quotes/useInvoiceCalculations"
import { ModernInvoiceTemplate } from "./invoice/templates/ModernInvoiceTemplate"
import { ExecutiveInvoiceTemplate } from "./invoice/templates/ExecutiveInvoiceTemplate"
import { CardsInvoiceTemplate } from "./invoice/templates/CardsInvoiceTemplate"

export type { QuoteTemplateType, QuoteInvoiceProps }

export default function QuoteInvoice(props: QuoteInvoiceProps) {
  const {
    customerName,
    quoteNumber,
    template = "modern",
    fontSize = 11.5,
    isInteractivePreview = false,
    quoteNotes = "",
    preparedBy = "",
    orientation = "portrait",
    attachedUpgrade = null,
    wantsUpgrade = false,
    shownUpgrade = 0,
    regionName,
    globalUpcharges = [],
    windows = [],
    sealedUnits = [],
    doors = [],
    taxTotals,
    doorTotals,
    sealedUnitTotals,
    attachedWindowQuote,
    attachedSealedUnit,
    attachedDoorQuote,
    basePrice = 0,
    quoteResult,
    isDualOption = false,
  } = props

  // 1. Perform consolidated invoice calculations (must be called unconditionally)
  const calc = useInvoiceCalculations(props)

  // 2. Early return guard: if no product data exists at all
  const hasWindows =
    windows.length > 0 ||
    basePrice > 0 ||
    Boolean(quoteResult?.base) ||
    Boolean(
      attachedWindowQuote?.windows?.length ||
      attachedWindowQuote?.lineItems?.length
    )
  const hasDoors =
    doors.length > 0 ||
    Boolean(doorTotals?.grandTotal) ||
    Boolean(attachedDoorQuote?.lineItems?.length)
  const hasSealedUnits =
    sealedUnits.length > 0 ||
    Boolean(attachedSealedUnit?.lineItems?.length) ||
    Boolean(sealedUnitTotals?.totalSqft)

  if (
    !hasWindows &&
    !hasSealedUnits &&
    !hasDoors &&
    !taxTotals &&
    !doorTotals &&
    !sealedUnitTotals &&
    !attachedWindowQuote &&
    !attachedSealedUnit &&
    !attachedDoorQuote
  ) {
    return null
  }

  const isLandscape = orientation === "landscape"

  // 3. Outer container classes
  const containerClass = isInteractivePreview
    ? `w-full ${isLandscape ? "max-w-[10.5in]" : "max-w-[8in]"} mx-auto bg-white text-[#1c2430] p-4 shadow-xl border border-border/40 select-none print:shadow-none print:border-none print:p-0 print:m-0`
    : `background-quote-invoice hidden print:block w-full ${isLandscape ? "max-w-[10.5in]" : "max-w-[8in]"} mx-auto bg-white text-[#1c2430] p-4 text-[11.5px] leading-tight select-none`

  const templateProps = {
    calc,
    customerName,
    quoteNumber,
    regionName,
    preparedBy,
    wantsUpgrade,
    shownUpgrade,
    attachedUpgrade,
    quoteNotes,
    globalUpcharges,
    isDualOption,
  }

  return (
    <div
      id="printable-invoice"
      className={containerClass}
      style={{ fontSize: `${fontSize}px` }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: letter ${isLandscape ? "landscape" : "portrait"};
            margin: 0.25in;
          }
          html, body {
            width: ${isLandscape ? "11in" : "8.5in"} !important;
            height: auto !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-invoice {
            display: block !important;
            visibility: visible !important;
            position: static !important;
            width: ${isLandscape ? "10.5in" : "8in"} !important;
            max-width: ${isLandscape ? "10.5in" : "8in"} !important;
            height: auto !important;
            margin: 0 auto !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          #printable-invoice * {
            visibility: visible !important;
          }
        }
      `,
        }}
      />

      {template === "modern" && <ModernInvoiceTemplate {...templateProps} />}
      {template === "executive" && (
        <ExecutiveInvoiceTemplate {...templateProps} />
      )}
      {template === "cards" && <CardsInvoiceTemplate {...templateProps} />}
    </div>
  )
}
