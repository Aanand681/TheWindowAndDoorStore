"use client"

import React, { useCallback, useSyncExternalStore } from "react"
import type { QuoteTemplateType, QuoteInvoiceProps } from "./invoice/types"
import { useInvoiceCalculations } from "@/hooks/quotes/useInvoiceCalculations"
import { UniversalInvoiceTemplate } from "./invoice/templates/UniversalInvoiceTemplate"
import {
  computeSmartAutoLayout,
  getSavedQuoteLayoutSnapshot,
  subscribeSavedQuoteLayout,
} from "@/lib/quotes/invoice-layout-engine"
import { deriveSmartLayoutInput } from "./invoice/composer/useInvoiceComposerState"

export type { QuoteTemplateType, QuoteInvoiceProps }

export default function QuoteInvoice(props: QuoteInvoiceProps) {
  const {
    customerName,
    quoteNumber,
    fontSize = 11.5,
    spacing = 1.0,
    isInteractivePreview = false,
    quoteNotes = "",
    preparedBy = "",
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
    attachedInstallOption = null,
    customOptions = null,
    savedLayout,
    composer = null,
  } = props

  const getLocalSnapshot = useCallback(() => getSavedQuoteLayoutSnapshot(), [])
  const localSavedLayout = useSyncExternalStore(
    subscribeSavedQuoteLayout,
    getLocalSnapshot,
    () => null
  )
  const effectiveSavedLayout = savedLayout !== undefined ? savedLayout : localSavedLayout

  // Compute baseline calculations first so we can check sparse auto-fit typography cleanly when printing directly
  const baseCalc = useInvoiceCalculations({
    ...props,
    template: "cards",
    fontSize,
    spacing,
  })

  const resolvedPrintFontSize = isInteractivePreview
    ? fontSize
    : effectiveSavedLayout?.fontSize ??
      (() => {
        const smart = computeSmartAutoLayout(
          deriveSmartLayoutInput(baseCalc, {
            isDualOption,
            wantsUpgrade,
            shownUpgrade,
            attachedUpgrade,
            customOptions,
            quoteNotes,
          })
        )
        return smart.mode === "spacious" &&
          (Math.abs(fontSize - 11.5) < 0.01 || Math.abs(fontSize - 8.5) < 0.01)
          ? smart.suggestedFontSize
          : fontSize
      })()

  const resolvedPrintSpacing = isInteractivePreview
    ? spacing
    : effectiveSavedLayout?.spacing ?? spacing

  const calc = useInvoiceCalculations({
    ...props,
    template: "cards",
    fontSize: resolvedPrintFontSize,
    spacing: resolvedPrintSpacing,
  })

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
    Boolean(sealedUnitTotals?.totalSqft) ||
    Boolean(Number(sealedUnitTotals?.serviceLabourTotal) > 0) ||
    Boolean(Number(sealedUnitTotals?.grandTotal) > 0)

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

  const containerClass = isInteractivePreview
    ? "w-full max-w-[8in] mx-auto bg-white text-[#1c2430] p-4 shadow-xl border border-border/40 select-none print:shadow-none print:border-none print:p-0 print:m-0"
    : "background-quote-invoice hidden print:block w-full max-w-[8in] mx-auto bg-white text-[#1c2430] p-4 text-[11.5px] leading-tight select-none"

  return (
    <div
      id="printable-invoice"
      className={containerClass}
      style={{ fontSize: `${resolvedPrintFontSize}px` }}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: letter portrait;
            margin: 0.25in;
          }
          html, body {
            width: 8.5in !important;
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
            width: 8in !important;
            max-width: 8in !important;
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
          .no-print {
            display: none !important;
          }
          #printable-invoice table {
            page-break-inside: auto;
            break-inside: auto;
          }
          #printable-invoice tr,
          #printable-invoice thead,
          #printable-invoice tfoot,
          .print-avoid-break {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `,
        }}
      />

      <UniversalInvoiceTemplate
        calc={calc}
        customerName={customerName}
        quoteNumber={quoteNumber}
        regionName={regionName}
        preparedBy={preparedBy}
        wantsUpgrade={wantsUpgrade}
        shownUpgrade={shownUpgrade}
        attachedUpgrade={attachedUpgrade}
        quoteNotes={quoteNotes}
        globalUpcharges={globalUpcharges}
        isDualOption={isDualOption}
        attachedInstallOption={attachedInstallOption}
        customOptions={customOptions}
        isInteractivePreview={isInteractivePreview}
        savedLayout={effectiveSavedLayout}
        composer={composer}
      />
    </div>
  )
}
