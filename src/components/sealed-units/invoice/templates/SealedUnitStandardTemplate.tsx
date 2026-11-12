import React from "react"
import {
  SealedUnitLineItem,
  SealedUnitLabourSettings,
} from "@/lib/sealed-units-logic"
import { SealedUnitTotals } from "../types"
import { SealedUnitSpecBadges } from "../SealedUnitSpecBadges"
import { SealedUnitSummaryLedger } from "../SealedUnitSummaryLedger"
import { SealedUnitPrintOfficeCard } from "../SealedUnitPrintOfficeCard"
import { renderRichNotes } from "../SealedUnitRichNotes"
import { SealedUnitInvoiceTable } from "../tables/SealedUnitInvoiceTable"

interface SealedUnitStandardTemplateProps {
  lineItems: SealedUnitLineItem[]
  totals: SealedUnitTotals
  isInstallation: boolean
  isService: boolean
  labour: SealedUnitLabourSettings
  hstRate: number
  customerName: string
  quoteNumber: string
  quoteDate: string
  preparedBy?: string
  quoteNotes?: string
  firstPayment: number
  secondPayment: number
  attachedWindowQuote?: any | null
  attachedDoorQuote?: any | null
}

export function SealedUnitStandardTemplate({
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
}: SealedUnitStandardTemplateProps) {
  return (
    <div className="space-y-2.5">
      {/* Header */}
      <div className="border-t-2 border-b-2 border-gray-500 py-1.5">
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="m-0 font-sans text-lg font-black tracking-tight text-black uppercase">
              The Window &amp; Door Store
            </h1>
            <div className="text-[8.5pt] font-bold tracking-wider text-gray-700 uppercase">
              {isInstallation
                ? "Sealed Unit & Glazing Quotation"
                : "Supply Only Sealed Unit Quotation"}
            </div>
          </div>
          <div className="text-right">
            <div className="font-mono text-sm font-black text-black">
              #{quoteNumber || "------"}
            </div>
            <div className="text-[7.5pt] font-semibold text-gray-700">
              {quoteDate}
            </div>
          </div>
        </div>

        <div className="mt-1 flex items-center justify-between border-t border-gray-300 pt-1 text-[8pt] text-black">
          <div>
            <span className="mr-1 text-[7pt] font-bold text-gray-600 uppercase">
              Client:
            </span>
            <span className="font-black text-black">
              {customerName || "Valued Customer"}
            </span>
          </div>
          <div>
            <span className="mr-1 text-[7pt] font-bold text-gray-600 uppercase">
              Scope:
            </span>
            <span className="font-bold text-black">
              {isService
                ? "Service Glazing"
                : isInstallation
                  ? "Full Installation & Setup"
                  : "Supply Only"}
            </span>
          </div>
          {preparedBy && (
            <div>
              <span className="mr-1 text-[7pt] font-bold text-gray-600 uppercase">
                Prepared By:
              </span>
              <span className="font-bold text-black">{preparedBy}</span>
            </div>
          )}
        </div>
      </div>

      {/* 4 Detail Cards: Treatment, Pane, Glass Fill, Glazing Spacer */}
      <SealedUnitSpecBadges lineItems={lineItems} />

      {/* Sealed Units Table */}
      <SealedUnitInvoiceTable
        lineItems={lineItems}
        totals={totals}
        isService={isService}
        isInstallation={isInstallation}
        labour={labour}
        variant="standard"
      />

      {/* FULL-WIDTH QUOTATION SUMMARY CARD */}
      <div className="space-y-2 rounded border border-gray-400 bg-gray-50/50 p-2">
        <div className="flex justify-between border-b border-gray-300 pb-0.5 font-sans text-[8pt] font-bold tracking-wider text-gray-900 uppercase">
          <span>Summary</span>
          <span className="font-mono text-[7pt] font-normal text-gray-500">
            Customer Financial Record
          </span>
        </div>

        <div className="grid grid-cols-12 items-start gap-3">
          <div className="col-span-7">
            <SealedUnitSummaryLedger
              lineItems={lineItems}
              totals={totals}
              isInstallation={isInstallation}
              isService={isService}
              hstRate={hstRate}
              firstPayment={firstPayment}
              secondPayment={secondPayment}
              attachedWindowQuote={attachedWindowQuote}
              attachedDoorQuote={attachedDoorQuote}
              textColor="text-gray-900"
              subtextColor="text-gray-700"
              borderColor="border-gray-300"
              totalBorderColor="border-gray-600"
            />
          </div>

          {/* Special Notes & Instructions */}
          <div className="col-span-5 border-l border-gray-300 pl-3">
            <div className="mb-1 border-b border-gray-300 pb-0.5 font-sans text-[7.5pt] font-bold tracking-wider text-gray-900 uppercase">
              Special Notes &amp; Instructions
            </div>
            {quoteNotes && quoteNotes.trim() ? (
              renderRichNotes(quoteNotes, 7.5)
            ) : (
              <span className="text-[7pt] text-gray-400 italic">
                Standard glazing installation terms apply.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* FULL-WIDTH OFFICE PRICING REFERENCE */}
      <SealedUnitPrintOfficeCard
        lineItems={lineItems}
        totals={totals}
        labour={labour}
        isService={isService}
      />
    </div>
  )
}
