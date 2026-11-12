import React from "react"
import { formatMoney, toCents } from "@/lib/promo-logic"
import type { QuoteTemplateType, InvoiceCalculationsResult } from "../types"

export interface WindowsScheduleTableProps {
  theme: QuoteTemplateType
  calc: InvoiceCalculationsResult
}

export function WindowsScheduleTable({
  theme,
  calc,
}: WindowsScheduleTableProps) {
  const {
    hasWindows,
    effectiveWindows,
    isWindowHost,
    attachedWindowQuote,
    isSupplyOnly,
    taxTotals,
    h2Fs,
    microFs,
    bodyFs,
    thFs,
    rowPy,
  } = calc

  if (!hasWindows || effectiveWindows.length === 0) return null

  const isModern = theme === "modern"
  const isExecutive = theme === "executive"
  const isCards = theme === "cards"

  return (
    <div
      className={
        isCards
          ? "mb-4 overflow-hidden rounded border border-[#cbd5e1] bg-white shadow-sm"
          : "mb-4"
      }
    >
      <div
        className={`flex items-center justify-between ${
          isCards
            ? "border-b border-[#cbd5e1] bg-[#f8fafc] p-2"
            : "mb-1 border-b-[1.5px] border-[#0f172a] pb-1"
        }`}
      >
        <div className="flex items-center gap-2">
          <span
            style={{ fontSize: `${h2Fs}px` }}
            className="font-bold tracking-wider text-[#0f172a] uppercase"
          >
            Window Specifications
          </span>
          {!isWindowHost && attachedWindowQuote?.quoteNumber && (
            <span
              style={{ fontSize: `${microFs}px` }}
              className="rounded bg-muted px-1.5 py-0.5 font-mono font-medium text-[#334155]"
            >
              #{attachedWindowQuote.quoteNumber}
            </span>
          )}
        </div>
        <span
          style={{ fontSize: `${microFs}px` }}
          className="font-medium text-[#64748b]"
        >
          {effectiveWindows.length} item{effectiveWindows.length > 1 ? "s" : ""}
        </span>
      </div>

      <table
        className="w-full border-collapse"
        style={{ fontSize: `${bodyFs}px` }}
      >
        <thead>
          <tr
            className={
              isModern
                ? "border-b-2 border-[#0f172a] bg-white font-bold tracking-wider text-[#0f172a] uppercase"
                : isExecutive
                  ? "border-b-2 border-[#0f172a] bg-white font-bold tracking-wider text-[#0f172a] uppercase"
                  : "border-b border-[#cbd5e1] bg-[#f8fafc] text-[10px] font-semibold text-[#0f172a] uppercase"
            }
            style={{ fontSize: `${thFs}px` }}
          >
            <th className="w-[5%] px-1.5 py-1 text-left">#</th>
            <th
              className={`px-1.5 py-1 text-left ${isSupplyOnly ? "w-[62%]" : "w-[30%]"}`}
            >
              Window (Size W × H)
            </th>
            <th
              className={`px-1.5 py-1 text-center ${isSupplyOnly ? "w-[10%]" : "w-[8%]"}`}
            >
              Qty
            </th>
            <th
              className={`px-1.5 py-1 text-right font-mono ${isSupplyOnly ? "w-[23%]" : "w-[19%]"}`}
            >
              Base Price
            </th>
            {!isSupplyOnly && (
              <>
                <th className="w-[19%] px-1.5 py-1 text-right font-mono">
                  Labour
                </th>
                <th className="w-[19%] px-1.5 py-1 text-right font-mono">
                  Misc
                </th>
              </>
            )}
          </tr>
        </thead>
        <tbody style={{ fontSize: `${bodyFs}px` }}>
          {effectiveWindows.map((w: any, i: number) => {
            const line = taxTotals?.lines?.[i]
            const qty = Number(w.qty) || 1
            const totalItemBaseCents = toCents(w.base)
            const unitBaseCents =
              qty > 0
                ? Math.round(totalItemBaseCents / qty)
                : totalItemBaseCents
            const itemLabDollars = line?.lab ?? 0
            const itemMiscDollars = line?.misc ?? 0

            return (
              <tr
                key={w.id || i}
                className="border-b border-[#cbd5e1] bg-white"
              >
                <td
                  style={{
                    paddingTop: `${rowPy}px`,
                    paddingBottom: `${rowPy}px`,
                  }}
                  className="px-1.5 font-semibold text-[#334155]"
                >
                  {i + 1}
                </td>
                <td
                  style={{
                    paddingTop: `${rowPy}px`,
                    paddingBottom: `${rowPy}px`,
                  }}
                  className="px-1.5 font-bold text-[#0f172a]"
                >
                  {w.w && w.h
                    ? `${w.w}" × ${w.h}"`
                    : w.dimensions || "Custom Window"}
                </td>
                <td
                  style={{
                    paddingTop: `${rowPy}px`,
                    paddingBottom: `${rowPy}px`,
                  }}
                  className="px-1.5 text-center font-bold text-[#0f172a]"
                >
                  {qty}
                </td>
                <td
                  style={{
                    paddingTop: `${rowPy}px`,
                    paddingBottom: `${rowPy}px`,
                  }}
                  className="px-1.5 text-right font-mono"
                >
                  <span className="font-bold text-[#0f172a]">
                    {formatMoney(totalItemBaseCents)}
                  </span>
                  {qty > 1 && (
                    <span
                      style={{ fontSize: `${microFs}px` }}
                      className="block font-sans font-normal text-[#334155]"
                    >
                      ({formatMoney(unitBaseCents)} ea)
                    </span>
                  )}
                </td>
                {!isSupplyOnly && (
                  <>
                    <td
                      style={{
                        paddingTop: `${rowPy}px`,
                        paddingBottom: `${rowPy}px`,
                      }}
                      className="px-1.5 text-right font-mono text-[#334155]"
                    >
                      {itemLabDollars > 0
                        ? formatMoney(itemLabDollars * 100)
                        : "—"}
                    </td>
                    <td
                      style={{
                        paddingTop: `${rowPy}px`,
                        paddingBottom: `${rowPy}px`,
                      }}
                      className="px-1.5 text-right font-mono text-[#334155]"
                    >
                      {itemMiscDollars > 0
                        ? formatMoney(itemMiscDollars * 100)
                        : "—"}
                    </td>
                  </>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
