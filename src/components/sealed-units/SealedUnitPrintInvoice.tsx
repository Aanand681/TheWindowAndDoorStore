"use client"

import React, { useState, useEffect } from "react"
import {
  SealedUnitTemplateType,
  SealedUnitPrintInvoiceProps,
} from "./invoice/types"
import { renderRichNotes } from "./invoice/SealedUnitRichNotes"
import { SealedUnitWindowStyleTemplate } from "./invoice/templates/SealedUnitWindowStyleTemplate"
import { SealedUnitStandardTemplate } from "./invoice/templates/SealedUnitStandardTemplate"
import { SealedUnitProductionTemplate } from "./invoice/templates/SealedUnitProductionTemplate"

export type { SealedUnitTemplateType, SealedUnitPrintInvoiceProps }
export { renderRichNotes }

export function SealedUnitPrintInvoice({
  lineItems,
  mode = "installation",
  isInstallation,
  labour,
  totals,
  hstRate,
  customerName,
  quoteNumber,
  quoteNotes,
  preparedBy,
  template = "window_style",
  fontSize = 8.5,
  spacing = 1.0,
  orientation = "portrait",
  isInteractivePreview = false,
  attachedWindowQuote,
  attachedDoorQuote,
}: SealedUnitPrintInvoiceProps) {
  const isService = mode === "service_only"
  const [quoteDate, setQuoteDate] = useState<string>("")

  useEffect(() => {
    setQuoteDate(
      new Date().toLocaleDateString("en-CA", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    )
  }, [])

  const firstPayment = Math.floor((totals.grandTotal / 2) * 100) / 100
  const secondPayment =
    Math.round((totals.grandTotal - firstPayment) * 100) / 100

  // Dynamic style scaling
  const scaleStyle: React.CSSProperties = {
    fontSize: `${fontSize}pt`,
    lineHeight: spacing,
  }

  const sharedProps = {
    lineItems,
    totals,
    isInstallation,
    isService,
    labour,
    hstRate,
    customerName,
    quoteNumber,
    quoteDate,
    preparedBy,
    quoteNotes,
    firstPayment,
    secondPayment,
    attachedWindowQuote,
    attachedDoorQuote,
  }

  return (
    <div
      id="printable-invoice"
      className={
        isInteractivePreview
          ? "w-full bg-white p-4 font-sans text-[8.5pt] leading-tight text-black select-text sm:p-6 print:m-0 print:border-none print:p-0 print:shadow-none"
          : "background-quote-invoice su-print-only bg-white p-4 font-sans text-[8.5pt] leading-tight text-black"
      }
      style={scaleStyle}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: letter ${orientation};
            margin: 0.25in;
          }
          html, body {
            width: ${orientation === "landscape" ? "11in" : "8.5in"} !important;
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
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            margin: 0 !important;
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

      {template === "window_style" ? (
        <SealedUnitWindowStyleTemplate {...sharedProps} />
      ) : template === "standard" ? (
        <SealedUnitStandardTemplate {...sharedProps} />
      ) : (
        <SealedUnitProductionTemplate {...sharedProps} />
      )}
    </div>
  )
}
