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

interface SealedUnitProductionTemplateProps {
  lineItems: SealedUnitLineItem[]
  totals: SealedUnitTotals
  isInstallation: boolean
  isService: boolean
  labour: SealedUnitLabourSettings
  hstRate: number
  customerName: string
  quoteNumber: string
  quoteDate: string
  quoteNotes?: string
  firstPayment: number
  secondPayment: number
  attachedWindowQuote?: any | null
  attachedDoorQuote?: any | null
}

export function SealedUnitProductionTemplate({
  lineItems,
  totals,
  isInstallation,
  isService,
  labour,
  hstRate,
  customerName,
  quoteNumber,
  quoteDate,
  quoteNotes,
  firstPayment,
  secondPayment,
  attachedWindowQuote,
  attachedDoorQuote,
}: SealedUnitProductionTemplateProps) {
  return (
    <div className="space-y-2.5">
      {/* Production Header */}
      <div className="border-b-2 border-zinc-600 pb-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1 inline-block rounded border border-zinc-400 bg-zinc-50 px-2 py-0.5 font-mono text-[7pt] font-bold text-zinc-900 uppercase">
              Glazing &amp; Fabrication Work Order
            </div>
            <h1 className="text-lg font-black tracking-tight text-zinc-900 uppercase">
              The Window &amp; Door Store
            </h1>
            <div className="text-[8pt] font-medium text-zinc-600">
              Client:{" "}
              <strong className="text-zinc-900">
                {customerName || "Direct Client"}
              </strong>{" "}
              · Scope:{" "}
              <strong className="text-zinc-900">
                {isService
                  ? "Service Only"
                  : isInstallation
                    ? "Supply & Install"
                    : "Supply Only"}
              </strong>
            </div>
          </div>

          <div className="text-right">
            <div className="font-mono text-xs font-bold text-zinc-500">
              JOB ORDER #
            </div>
            <div className="font-mono text-lg font-black text-zinc-950">
              #{quoteNumber || "------"}
            </div>
            <div className="text-[7.5pt] font-semibold text-zinc-500">
              {quoteDate}
            </div>
          </div>
        </div>

        {/* 4 Detail Cards: Treatment, Pane, Glass Fill, Glazing Spacer */}
        <div className="mt-2">
          <SealedUnitSpecBadges lineItems={lineItems} />
        </div>
      </div>

      {/* Cutting Schedule Table */}
      <div className="overflow-hidden rounded border border-zinc-300">
        <table className="w-full border-collapse text-left text-[8pt]">
          <thead>
            <tr className="border-b-2 border-zinc-400 bg-zinc-100 font-mono text-[7pt] font-bold tracking-wider text-zinc-900 uppercase">
              <th className="w-7 px-1.5 py-1 text-center">Cut</th>
              <th className="px-1.5 py-1">Glass Assembly</th>
              <th className="px-1.5 py-1">Exact Dimensions</th>
              <th className="px-1.5 py-1">Area</th>
              <th className="px-1.5 py-1">Internal Grills &amp; Hubs</th>
              <th className="w-8 px-1.5 py-1 text-center">Qty</th>
              {!isService ? (
                <th className="px-1.5 py-1 text-right">Job Subtotal</th>
              ) : (
                <th className="px-1.5 py-1 text-right">Service Sqft</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 font-mono text-[7.5pt]">
            {lineItems.map((item, idx) => (
              <tr key={item.id} className="hover:bg-zinc-50">
                <td className="px-1.5 py-1 text-center font-bold text-zinc-700">
                  {idx + 1}
                </td>
                <td className="px-1.5 py-1 font-sans">
                  <div className="font-bold text-zinc-900">
                    {item.combinationName}
                  </div>
                  <div className="font-mono text-[6.5pt] text-zinc-500">
                    {item.treatment} · {item.paneType} · {item.thicknessMm}mm
                  </div>
                </td>
                <td className="px-1.5 py-1 font-bold text-zinc-900">
                  {item.widthIn}&quot; × {item.heightIn}&quot;
                </td>
                <td className="px-1.5 py-1 text-zinc-700">
                  {item.actualSqft.toFixed(2)} sqft
                </td>
                <td className="px-1.5 py-1 font-sans">
                  {item.rawGrillCost > 0 ? (
                    <span className="py-0.2 inline-block rounded border border-amber-300 bg-amber-50 px-1 text-[6.5pt] font-semibold text-amber-900">
                      {item.grillDescription}
                    </span>
                  ) : (
                    <span className="text-[7pt] text-zinc-400">No Grills</span>
                  )}
                </td>
                <td className="px-1.5 py-1 text-center font-bold text-zinc-900">
                  {item.quantity}
                </td>
                {!isService ? (
                  <td className="px-1.5 py-1 text-right font-bold text-zinc-900">
                    ${item.lineGlassTotal.toFixed(2)}
                  </td>
                ) : (
                  <td className="px-1.5 py-1 text-right font-bold">
                    {(item.actualSqft * item.quantity).toFixed(2)} sqft
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FULL-WIDTH COMMERCIAL QUOTATION SUMMARY */}
      <div className="space-y-2 rounded border border-zinc-300 bg-zinc-50/70 p-2">
        <div className="flex justify-between border-b border-zinc-300 pb-0.5 font-sans text-[7.5pt] font-bold tracking-wider text-zinc-900 uppercase">
          <span>Summary</span>
          <span className="font-mono text-[7pt] text-zinc-600">
            Client Billing Record
          </span>
        </div>

        <div className="grid grid-cols-12 items-start gap-3">
          {/* Special Notes & Site Instructions (LEFT 5 cols) */}
          <div className="col-span-5 border-r border-zinc-300 pr-3">
            <span className="mb-1 block font-sans text-[7pt] font-bold text-zinc-500 uppercase">
              Special Notes &amp; Site Instructions
            </span>
            {quoteNotes && quoteNotes.trim() ? (
              renderRichNotes(quoteNotes, 7.5)
            ) : (
              <span className="text-[7pt] text-zinc-400 italic">
                No special instructions recorded.
              </span>
            )}
          </div>

          {/* Financial Lines Ledger (RIGHT 7 cols) */}
          <div className="col-span-7 pl-1">
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
              textColor="text-zinc-900"
              subtextColor="text-zinc-700"
              borderColor="border-zinc-300"
              totalBorderColor="border-zinc-600"
            />
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
