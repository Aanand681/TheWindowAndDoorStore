import React from "react"
import { formatMoney } from "@/lib/promo-logic"
import type { InvoiceCalculationsResult, AttachedUpgradeOption } from "../types"
import { WindowsScheduleTable } from "../tables/WindowsScheduleTable"
import { SealedUnitsScheduleTable } from "../tables/SealedUnitsScheduleTable"
import { DoorsScheduleTable } from "../tables/DoorsScheduleTable"
import { InvoiceSummaryRows } from "../tables/InvoiceSummaryRows"
import { InvoiceBreakdownTables } from "../tables/InvoiceBreakdownTables"

export interface ModernInvoiceTemplateProps {
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

export function ModernInvoiceTemplate({
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
}: ModernInvoiceTemplateProps) {
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
      {/* Header: Modern Minimalist Header */}
      <div className="mb-3 rounded-t border-t-4 border-b border-indigo-600 border-slate-300 bg-slate-50/50 px-2 py-2.5">
        <div className="flex items-baseline justify-between">
          <div>
            <h1
              style={{ fontSize: `${titleFs}px` }}
              className="m-0 leading-none font-extrabold tracking-tight text-slate-900 uppercase"
            >
              The Window &amp; Door Store
            </h1>
            <div
              style={{ fontSize: `${smallFs}px` }}
              className="mt-0.5 flex flex-wrap items-center gap-2 font-bold tracking-wider text-indigo-600 uppercase"
            >
              <span>{invoiceSubtitle}</span>
            </div>
          </div>
          <div className="text-right">
            <div
              style={{ fontSize: `${h2Fs}px` }}
              className="font-mono font-bold text-slate-900"
            >
              {quoteNumber || "REF-QUOTE"}
            </div>
            <div
              style={{ fontSize: `${smallFs}px` }}
              className="font-medium text-slate-500"
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
            className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-1 text-[#0f172a]"
          >
            <div className="flex items-center gap-3">
              {customerName && (
                <div>
                  <span className="mr-1 text-[9px] font-bold text-slate-500 uppercase">
                    Client:
                  </span>
                  <span className="font-bold text-slate-900">
                    {customerName}
                  </span>
                </div>
              )}
              {regionName && (
                <div>
                  <span className="mr-1 text-[9px] font-bold text-slate-500 uppercase">
                    Region:
                  </span>
                  <span className="font-semibold text-slate-800">
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
                <span className="font-semibold text-slate-800">
                  {preparedBy}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Schedules */}
      <WindowsScheduleTable theme="modern" calc={calc} />
      <SealedUnitsScheduleTable theme="modern" calc={calc} />
      <DoorsScheduleTable
        theme="modern"
        calc={calc}
        globalUpcharges={globalUpcharges}
      />

      {/* Two-Column Specification & Accounting Breakdown */}
      <div className="grid grid-cols-[1.1fr_1.15fr] items-start gap-4 border-t border-[#cbd5e1] pt-2">
        {/* Left Column: Details & Extras */}
        <InvoiceBreakdownTables
          calc={calc}
          wantsUpgrade={wantsUpgrade}
          shownUpgrade={shownUpgrade}
          attachedUpgrade={attachedUpgrade}
          quoteNotes={quoteNotes}
          isDualOption={isDualOption}
        />

        {/* Right Column: Financial Summary */}
        <div>
          <div
            style={{ fontSize: `${h2Fs}px` }}
            className="mb-1 border-b-[1.5px] border-[#0f172a] pb-0.5 font-bold tracking-wider text-[#0f172a] uppercase"
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

          {/* Total */}
          <div className="mt-2 flex items-center justify-between rounded border-2 border-[#0f172a] bg-white p-2 font-extrabold text-[#0f172a]">
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

          {/* 50% Deposit & Final 50% Balance */}
          <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#cbd5e1] pt-1.5">
            <div className="rounded border border-[#cbd5e1] bg-white p-1.5">
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
            <div className="rounded border border-[#cbd5e1] bg-white p-1.5">
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
