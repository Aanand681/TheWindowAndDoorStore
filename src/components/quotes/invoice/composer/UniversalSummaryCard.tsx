import React from "react"
import { formatMoney } from "@/lib/promo-logic"
import type { InvoiceCalculationsResult } from "../types"
import { InvoiceSummaryRows } from "../tables/InvoiceSummaryRows"

export interface UniversalSummaryCardProps {
  calc: InvoiceCalculationsResult
  columnWidthPct: number
  quoteNumber?: string
}

/**
 * Ink-saver Summary card adapting automatically between compact column stacking (< 75% width)
 * and 2-pane Full Width mode (>= 75% width). Uses First Deposit / 2nd Deposit labels with outlined Total box.
 */
export function UniversalSummaryCard({
  calc,
  columnWidthPct,
  quoteNumber,
}: UniversalSummaryCardProps) {
  const {
    h2Fs,
    titleFs,
    bodyFs,
    microFs,
    rowPy,
    finalTotalCents,
    finalFirstPayment,
    finalSecondPayment,
  } = calc

  const isWideFullMode = columnWidthPct >= 75

  if (isWideFullMode) {
    return (
      <div
        style={{ padding: `${Math.max(6, rowPy * 1.35)}px` }}
        className="rounded border-[1.5px] border-[#0f172a] bg-white"
      >
        <div className="grid grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] items-center gap-3.5">
          <div className="min-w-0">
            <div
              style={{ fontSize: `${h2Fs}px` }}
              className="mb-1 border-b-2 border-[#0f172a] pb-0.5 font-bold tracking-wider text-[#0f172a] uppercase"
            >
              Summary
            </div>
            <table className="w-full border-collapse" style={{ fontSize: `${bodyFs}px` }}>
              <tbody>
                <InvoiceSummaryRows
                  calc={calc}
                  textColor="text-[#0f172a]"
                  rowPyOverride={rowPy * 0.65}
                />
              </tbody>
            </table>
          </div>

          <div className="flex min-w-0 flex-col gap-1.5">
            <div
              style={{ padding: `${Math.max(4, rowPy + 3)}px 10px` }}
              className="flex items-center justify-between rounded-[5px] border-2 border-[#0f172a] bg-white font-extrabold text-[#0f172a]"
            >
              <span style={{ fontSize: `${bodyFs}px` }} className="tracking-wide uppercase">
                Total incl. HST
              </span>
              <span
                style={{ fontSize: `${Math.round(titleFs * 0.95)}px` }}
                className="font-mono font-black"
              >
                {formatMoney(finalTotalCents)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <div
                style={{ padding: `${Math.max(3, rowPy + 1)}px 7px` }}
                className="rounded border border-[#cbd5e1] bg-white"
              >
                <div
                  style={{ fontSize: `${microFs}px` }}
                  className="font-semibold tracking-wider text-[#475569] uppercase"
                >
                  First Deposit
                </div>
                <div
                  style={{ fontSize: `${bodyFs}px` }}
                  className="mt-0.5 font-mono font-bold text-[#0f172a]"
                >
                  {formatMoney(finalFirstPayment)}
                </div>
              </div>
              <div
                style={{ padding: `${Math.max(3, rowPy + 1)}px 7px` }}
                className="rounded border border-[#cbd5e1] bg-white"
              >
                <div
                  style={{ fontSize: `${microFs}px` }}
                  className="font-semibold tracking-wider text-[#475569] uppercase"
                >
                  2nd Deposit
                </div>
                <div
                  style={{ fontSize: `${bodyFs}px` }}
                  className="mt-0.5 font-mono font-bold text-[#0f172a]"
                >
                  {formatMoney(finalSecondPayment)}
                </div>
              </div>
            </div>

            {quoteNumber && (
              <div
                style={{ fontSize: `${microFs}px` }}
                className="flex items-center justify-between rounded border border-[#e2e8f0] bg-[#f8fafc] px-2 py-0.5 font-mono text-[#475569]"
              >
                <span>OFFICE COPY</span>
                <span>{quoteNumber}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{ padding: `${Math.max(5, rowPy * 1.2)}px` }}
      className="rounded border border-[#cbd5e1] bg-white"
    >
      <div
        style={{ fontSize: `${h2Fs}px` }}
        className="mb-1 border-b-2 border-[#0f172a] pb-0.5 font-bold tracking-wider text-[#0f172a] uppercase"
      >
        Summary
      </div>

      <table className="w-full border-collapse" style={{ fontSize: `${bodyFs}px` }}>
        <tbody>
          <InvoiceSummaryRows
            calc={calc}
            textColor="text-[#0f172a]"
            rowPyOverride={rowPy * 0.6}
          />
        </tbody>
      </table>

      <div
        style={{ padding: `${Math.max(4, rowPy + 1)}px 8px` }}
        className="mt-1.5 flex items-center justify-between rounded-[5px] border-2 border-[#0f172a] bg-white font-extrabold text-[#0f172a]"
      >
        <span style={{ fontSize: `${h2Fs}px` }} className="tracking-wide uppercase">
          Total
        </span>
        <span
          style={{ fontSize: `${Math.round(titleFs * 0.9)}px` }}
          className="font-mono font-black"
        >
          {formatMoney(finalTotalCents)}
        </span>
      </div>

      <div className="mt-1.5 grid grid-cols-2 gap-1.5 border-t border-[#e2e8f0] pt-1.5">
        <div
          style={{ padding: `${Math.max(2, rowPy)}px 6px` }}
          className="rounded border border-[#cbd5e1] bg-white"
        >
          <div
            style={{ fontSize: `${microFs}px` }}
            className="font-semibold tracking-wider text-[#475569] uppercase"
          >
            First Deposit
          </div>
          <div
            style={{ fontSize: `${bodyFs}px` }}
            className="mt-0.5 font-mono font-bold text-[#0f172a]"
          >
            {formatMoney(finalFirstPayment)}
          </div>
        </div>
        <div
          style={{ padding: `${Math.max(2, rowPy)}px 6px` }}
          className="rounded border border-[#cbd5e1] bg-white"
        >
          <div
            style={{ fontSize: `${microFs}px` }}
            className="font-semibold tracking-wider text-[#475569] uppercase"
          >
            2nd Deposit
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
  )
}
