import React from "react"
import { formatMoney } from "@/lib/promo-logic"
import type { InvoiceCalculationsResult, AttachedUpgradeOption } from "../types"
import { WindowsScheduleTable } from "../tables/WindowsScheduleTable"
import { SealedUnitsScheduleTable } from "../tables/SealedUnitsScheduleTable"
import { DoorsScheduleTable } from "../tables/DoorsScheduleTable"
import { InvoiceSummaryRows } from "../tables/InvoiceSummaryRows"
import { InvoiceBreakdownTables } from "../tables/InvoiceBreakdownTables"

export interface CardsInvoiceTemplateProps {
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

export function CardsInvoiceTemplate({
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
}: CardsInvoiceTemplateProps) {
  const {
    titleFs,
    smallFs,
    invoiceSubtitle,
    h2Fs,
    currentDate,
    bodyFs,
    microFs,
    rowPy,
    finalTotalCents,
    finalFirstPayment,
    finalSecondPayment,
  } = calc

  return (
    <>
      {/* Header: Standardized Architectural Header */}
      <div className="mb-2.5 border-t-2 border-b-2 border-[#0f172a] py-2">
        <div className="flex items-baseline justify-between">
          <div>
            <h1
              style={{ fontSize: `${titleFs}px` }}
              className="m-0 leading-none font-black tracking-tight text-[#0f172a] uppercase"
            >
              The Window &amp; Door Store
            </h1>
            <div
              style={{ fontSize: `${smallFs}px` }}
              className="mt-0.5 flex flex-wrap items-center gap-2 font-bold tracking-wider text-[#334155] uppercase"
            >
              <span>{invoiceSubtitle}</span>
            </div>
          </div>
          <div className="text-right">
            <div
              style={{ fontSize: `${h2Fs}px` }}
              className="font-mono font-black text-[#0f172a]"
            >
              {quoteNumber || "REF-QUOTE"}
            </div>
            <div
              style={{ fontSize: `${smallFs}px` }}
              className="font-semibold text-[#334155]"
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
            className="mt-1 flex flex-wrap items-center justify-between gap-2 border-t border-[#cbd5e1] pt-1 text-[#0f172a]"
          >
            <div className="flex items-center gap-3">
              {customerName && (
                <div>
                  <span className="mr-1 text-[9px] font-bold text-[#334155] uppercase">
                    Client:
                  </span>
                  <span className="font-black text-[#0f172a]">
                    {customerName}
                  </span>
                </div>
              )}
              {regionName && (
                <div>
                  <span className="mr-1 text-[9px] font-bold text-[#334155] uppercase">
                    Region:
                  </span>
                  <span className="font-bold text-[#0f172a]">{regionName}</span>
                </div>
              )}
            </div>
            {preparedBy && (
              <div>
                <span className="mr-1 text-[9px] font-bold text-[#334155] uppercase">
                  Prepared By:
                </span>
                <span className="font-bold text-[#0f172a]">{preparedBy}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Schedules */}
      <WindowsScheduleTable theme="cards" calc={calc} />
      <SealedUnitsScheduleTable theme="cards" calc={calc} />
      <DoorsScheduleTable
        theme="cards"
        calc={calc}
        globalUpcharges={globalUpcharges}
      />

      {/* Two-Column Specification & Accounting Cards */}
      <div className="grid grid-cols-[1.1fr_1.15fr] items-start gap-4 border-t-2 border-[#0f172a] pt-2">
        {/* Left Column: Scope Specifications */}
        <InvoiceBreakdownTables
          calc={calc}
          wantsUpgrade={wantsUpgrade}
          shownUpgrade={shownUpgrade}
          attachedUpgrade={attachedUpgrade}
          quoteNotes={quoteNotes}
          isDualOption={isDualOption}
        />

        {/* Right Column: Financial Summary Card */}
        <div
          className="rounded border border-[#cbd5e1] bg-white shadow-sm"
          style={{ padding: `${rowPy * 1.25}px` }}
        >
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
              <InvoiceSummaryRows
                calc={calc}
                textColor="text-[#0f172a]"
                rowPyOverride={rowPy * 0.6}
              />
            </tbody>
          </table>

          {/* Total Banner */}
          <div
            className="mt-2 flex items-center justify-between rounded-md border-2 border-[#0f172a] bg-white font-extrabold text-[#0f172a]"
            style={{ padding: `${rowPy}px` }}
          >
            <span
              style={{ fontSize: `${h2Fs}px` }}
              className="tracking-wide text-[#0f172a] uppercase"
            >
              Total
            </span>
            <span
              style={{ fontSize: `${titleFs}px` }}
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
