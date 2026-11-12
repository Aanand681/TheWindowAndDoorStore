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

interface SealedUnitWindowStyleTemplateProps {
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

export function SealedUnitWindowStyleTemplate({
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
}: SealedUnitWindowStyleTemplateProps) {
  return (
    <div className="space-y-2.5">
      {/* Header */}
      <div className="flex items-end justify-between border-b-2 border-slate-600 pb-2">
        <div>
          <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
            Official Quotation Proposal
          </div>
          <h1 className="m-0 font-sans text-xl font-black tracking-tight text-slate-900 uppercase">
            The Window &amp; Door Store
          </h1>
          <p className="mt-0.5 text-[8.5pt] font-medium text-slate-600">
            Precision Sealed Unit Fabrication &amp; Glazing Services
          </p>
        </div>
        <div className="text-right">
          <div className="inline-block rounded border border-slate-400 bg-slate-50 px-2.5 py-1">
            <div className="text-[7pt] font-bold text-slate-500 uppercase">
              Quote Reference
            </div>
            <div className="font-mono text-base font-black text-slate-900">
              #{quoteNumber || "------"}
            </div>
          </div>
          <div className="mt-0.5 text-[7.5pt] font-semibold text-slate-600">
            Issued: {quoteDate}
          </div>
        </div>
      </div>

      {/* Client & Scope Metadata Card */}
      <div className="grid grid-cols-12 gap-2 rounded border border-slate-300 bg-slate-50/70 p-2 text-[8pt]">
        <div className="col-span-6 sm:col-span-5">
          <span className="block text-[7pt] font-bold text-slate-500 uppercase">
            Prepared For:
          </span>
          <span className="block text-[9pt] font-black text-slate-900">
            {customerName || "Valued Customer"}
          </span>
        </div>
        <div className="col-span-3 sm:col-span-4">
          <span className="block text-[7pt] font-bold text-slate-500 uppercase">
            Service Scope:
          </span>
          <span className="block font-bold text-slate-800">
            {isService
              ? "Service Glazing"
              : isInstallation
                ? "Supply & Installation"
                : "Supply Only"}
          </span>
        </div>
        <div className="col-span-3 text-right">
          <span className="block text-[7pt] font-bold text-slate-500 uppercase">
            Prepared By:
          </span>
          <span className="font-bold text-slate-900">
            {preparedBy || "Staff Estimator"}
          </span>
        </div>
      </div>

      {/* 4 Detail Cards: Treatment, Pane, Glass Fill, Glazing Spacer */}
      <SealedUnitSpecBadges lineItems={lineItems} />

      {/* Line Items Table */}
      <SealedUnitInvoiceTable
        lineItems={lineItems}
        totals={totals}
        isService={isService}
        isInstallation={isInstallation}
        labour={labour}
        variant="window_style"
      />

      {/* FULL-WIDTH QUOTATION SUMMARY CARD */}
      <div className="space-y-2 rounded border border-slate-300 bg-slate-50/50 p-2.5">
        <div className="flex justify-between border-b border-slate-300 pb-1 font-sans text-[8pt] font-black tracking-wider text-slate-900 uppercase">
          <span>Summary</span>
          <span className="font-mono text-[7.5pt] font-bold text-slate-600">
            {isService
              ? "Service Pricing"
              : `${lineItems.reduce((acc, i) => acc + i.quantity, 0)} Units Total`}
          </span>
        </div>

        <div className="grid grid-cols-12 items-start gap-3">
          {/* Financial Lines Ledger */}
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
              textColor="text-slate-900"
              subtextColor="text-slate-700"
              borderColor="border-slate-300"
              totalBorderColor="border-slate-600"
            />
          </div>

          {/* Rich Customer Notes */}
          <div className="col-span-5 space-y-1 border-l border-slate-200 pl-3">
            <span className="block font-sans text-[7pt] font-bold tracking-wider text-slate-500 uppercase">
              Special Notes &amp; Instructions
            </span>
            {quoteNotes && quoteNotes.trim() ? (
              renderRichNotes(quoteNotes, 7.5)
            ) : (
              <p className="text-[7pt] text-slate-400 italic">
                No special instructions recorded on this proposal.
              </p>
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
