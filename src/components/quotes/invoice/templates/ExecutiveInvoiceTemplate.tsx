import React from "react"
import { formatMoney } from "@/lib/promo-logic"
import type { InvoiceCalculationsResult, AttachedUpgradeOption } from "../types"
import { WindowsScheduleTable } from "../tables/WindowsScheduleTable"
import { SealedUnitsScheduleTable } from "../tables/SealedUnitsScheduleTable"
import { DoorsScheduleTable } from "../tables/DoorsScheduleTable"
import { InvoiceSummaryRows } from "../tables/InvoiceSummaryRows"
import { InvoiceBreakdownTables } from "../tables/InvoiceBreakdownTables"

export interface ExecutiveInvoiceTemplateProps {
  calc: InvoiceCalculationsResult
  customerName?: string
  quoteNumber?: string
  regionName?: string
  preparedBy?: string
  wantsUpgrade?: boolean
  shownUpgrade?: number
  attachedUpgrade?: AttachedUpgradeOption | null
  quoteNotes?: string
  globalUpcharges?: any[]
  isDualOption?: boolean
}

export function ExecutiveInvoiceTemplate({
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
  isDualOption = false,
}: ExecutiveInvoiceTemplateProps) {
  const {
    titleFs,
    smallFs,
    invoiceSubtitle,
    h2Fs,
    currentDate,
    bodyFs,
    baseFs,
    microFs,
    finalTotalCents,
    finalFirstPayment,
    finalSecondPayment,
  } = calc

  return (
    <>
      {/* Executive Header: Ink-Saving Architectural Corporate Header */}
      <div className="mb-2.5 border-y-2 border-[#0f172a] bg-white px-1 py-2">
        <div className="flex items-baseline justify-between">
          <div>
            <h1
              style={{ fontSize: `${titleFs}px` }}
              className="m-0 leading-none font-black tracking-wider text-[#0f172a] uppercase"
            >
              The Window &amp; Door Store
            </h1>
            <div
              style={{ fontSize: `${smallFs}px` }}
              className="mt-1 font-bold tracking-widest text-amber-800 uppercase"
            >
              <span>{invoiceSubtitle}</span>
            </div>
          </div>
          <div className="text-right">
            <div
              style={{ fontSize: `${h2Fs}px` }}
              className="font-mono font-bold text-[#0f172a]"
            >
              {quoteNumber || "REF-QUOTE"}
            </div>
            <div
              style={{ fontSize: `${smallFs}px` }}
              className="font-medium text-slate-600"
              suppressHydrationWarning
            >
              {currentDate}
            </div>
          </div>
        </div>

        {/* Compact Inline Customer & Region Bar */}
        {(customerName || regionName || preparedBy) && (
          <div
            style={{ fontSize: `${bodyFs}px` }}
            className="mt-1.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-300 pt-1.5 text-slate-800"
          >
            <div className="flex items-center gap-3">
              {customerName && (
                <div>
                  <span className="mr-1 text-[9px] font-bold text-slate-500 uppercase">
                    Client:
                  </span>
                  <span className="font-bold text-[#0f172a]">
                    {customerName}
                  </span>
                </div>
              )}
              {regionName && (
                <div>
                  <span className="mr-1 text-[9px] font-bold text-slate-500 uppercase">
                    Region:
                  </span>
                  <span className="font-semibold text-slate-700">
                    {regionName}
                  </span>
                </div>
              )}
            </div>
            {preparedBy && (
              <div>
                <span className="mr-1 text-[9px] font-bold text-slate-500 uppercase">
                  Prepared By:
                </span>
                <span className="font-semibold text-slate-700">
                  {preparedBy}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Schedules */}
      <WindowsScheduleTable theme="executive" calc={calc} />
      <SealedUnitsScheduleTable theme="executive" calc={calc} />
      <DoorsScheduleTable
        theme="executive"
        calc={calc}
        globalUpcharges={globalUpcharges}
      />

      {/* Bottom Grid */}
      <div className="grid grid-cols-[1.1fr_1.15fr] items-start gap-4 border-t-2 border-[#0f172a] pt-2">
        {/* Left: Project Specifications & Scope */}
        <InvoiceBreakdownTables
          calc={calc}
          wantsUpgrade={wantsUpgrade}
          shownUpgrade={shownUpgrade}
          attachedUpgrade={attachedUpgrade}
          quoteNotes={quoteNotes}
          isDualOption={isDualOption}
        />

        {/* Right: Exact Financial Summary */}
        <div>
          <div
            style={{ fontSize: `${h2Fs}px` }}
            className="mb-1 border-b-2 border-[#0f172a] pb-0.5 font-bold tracking-wider text-[#0f172a] uppercase"
          >
            Summary
          </div>
          <table
            className="w-full border-collapse"
            style={{ fontSize: `${bodyFs}px` }}
          >
            <tbody>
              <InvoiceSummaryRows calc={calc} textColor="text-[#0f172a]" />
            </tbody>
          </table>

          {/* Total Banner */}
          <div className="mt-2 flex items-center justify-between rounded-md border-2 border-[#0f172a] bg-white p-2 font-extrabold text-[#0f172a]">
            <span
              style={{ fontSize: `${h2Fs}px` }}
              className="tracking-wide text-[#0f172a] uppercase"
            >
              Total
            </span>
            <span
              style={{ fontSize: `${Math.round(baseFs * 1.35)}px` }}
              className="font-mono font-black text-[#0f172a]"
            >
              {formatMoney(finalTotalCents)}
            </span>
          </div>

          {/* Deposit Terms */}
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#cbd5e1] pt-1.5">
            <div className="rounded-md border border-[#cbd5e1] bg-white p-1.5">
              <div
                style={{ fontSize: `${microFs}px` }}
                className="font-semibold tracking-wider text-[#334155] uppercase"
              >
                50% Deposit
              </div>
              <div
                style={{ fontSize: `${bodyFs}px` }}
                className="mt-0.5 font-mono font-bold text-[#0f172a]"
              >
                {formatMoney(finalFirstPayment)}
              </div>
            </div>
            <div className="rounded-md border border-[#cbd5e1] bg-white p-1.5">
              <div
                style={{ fontSize: `${microFs}px` }}
                className="font-semibold tracking-wider text-[#334155] uppercase"
              >
                Final 50% Balance
              </div>
              <div
                style={{ fontSize: `${bodyFs}px` }}
                className="mt-0.5 font-mono font-bold text-[#0f172a]"
              >
                {formatMoney(finalSecondPayment)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
