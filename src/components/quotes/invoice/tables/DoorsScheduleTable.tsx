import React from "react"
import { formatMoney } from "@/lib/promo-logic"
import type { QuoteTemplateType, InvoiceCalculationsResult } from "../types"

export interface DoorsScheduleTableProps {
  theme: QuoteTemplateType
  calc: InvoiceCalculationsResult
  globalUpcharges?: any[]
  universal?: boolean
  compactSide?: boolean
}

export function DoorsScheduleTable({
  theme,
  calc,
  globalUpcharges: _globalUpcharges = [],
  universal = false,
  compactSide = false,
}: DoorsScheduleTableProps) {
  const {
    hasDoors,
    effectiveDoors,
    isDoorHost,
    attachedDoorQuote,
    h2Fs,
    microFs,
    bodyFs,
    thFs,
    rowPy,
  } = calc

  if (!hasDoors || effectiveDoors.length === 0) return null

  const isModern = !universal && theme === "modern"
  const isExecutive = !universal && theme === "executive"
  const isCards = universal || theme === "cards"

  return (
    <div
      className={
        universal
          ? "overflow-hidden rounded border border-[#cbd5e1] bg-white"
          : isCards
            ? "mb-4 overflow-hidden rounded border border-[#cbd5e1] bg-white shadow-sm"
            : "mb-4"
      }
    >
      {!universal && (
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
              Configured Doors
            </span>
            {!isDoorHost && attachedDoorQuote?.quoteNumber && (
              <span
                style={{ fontSize: `${microFs}px` }}
                className="rounded bg-muted px-1.5 py-0.5 font-mono font-medium text-[#334155]"
              >
                #{attachedDoorQuote.quoteNumber}
              </span>
            )}
          </div>
          <span
            style={{ fontSize: `${microFs}px` }}
            className="font-medium text-[#64748b]"
          >
            {effectiveDoors.length} item{effectiveDoors.length > 1 ? "s" : ""}
          </span>
        </div>
      )}

      <table
        className="w-full border-collapse"
        style={{ fontSize: `${bodyFs}px` }}
      >
        <thead>
          <tr
            className={
              isModern || isExecutive
                ? "border-b-2 border-[#0f172a] text-[#0f172a]"
                : "border-b border-[#cbd5e1] bg-[#f8fafc] font-semibold text-[#0f172a] uppercase"
            }
            style={{ fontSize: `${thFs}px` }}
          >
            <th className="w-[6%] px-1.5 py-1 text-left font-bold">#</th>
            <th
              className={`px-1.5 py-1 text-left font-bold ${compactSide ? "w-[62%]" : "w-[68%]"}`}
            >
              <span>Configured Doors</span>
              {universal && !isDoorHost && attachedDoorQuote?.quoteNumber && (
                <span
                  style={{ fontSize: `${microFs}px` }}
                  className="ml-1.5 font-mono font-normal text-[#64748b]"
                >
                  #{attachedDoorQuote.quoteNumber}
                </span>
              )}
            </th>
            <th className="w-[9%] px-1.5 py-1 text-center font-bold">Qty</th>
            <th
              className={`px-1.5 py-1 text-right font-mono font-bold ${compactSide ? "w-[23%]" : "w-[17%]"}`}
            >
              Price
            </th>
          </tr>
        </thead>
        <tbody style={{ fontSize: `${bodyFs}px` }}>
          {effectiveDoors.map((item: any, idx: number) => {
            const qty = Number(item.quantity) || 1
            const unitNetPrice = item.netBasePrice || item.inksterBasePrice || 0
            const lineTotal = item.totalPrice || unitNetPrice * qty

            return (
              <tr
                key={item.id || idx}
                className="border-b border-[#e2e8f0] bg-white last:border-b-0"
              >
                <td
                  style={{
                    paddingTop: `${rowPy}px`,
                    paddingBottom: `${rowPy}px`,
                  }}
                  className="px-1.5 font-mono font-semibold text-[#64748b]"
                >
                  {idx + 1}
                </td>
                <td
                  style={{
                    paddingTop: `${rowPy}px`,
                    paddingBottom: `${rowPy}px`,
                  }}
                  className="px-1.5 font-bold text-[#0f172a]"
                >
                  <div>{item.customDescription || item.presetLabel}</div>
                  {item.notes && (
                    <div
                      style={{ fontSize: `${microFs}px` }}
                      className="font-normal text-[#64748b]"
                    >
                      {item.notes}
                    </div>
                  )}
                </td>
                <td
                  style={{
                    paddingTop: `${rowPy}px`,
                    paddingBottom: `${rowPy}px`,
                  }}
                  className="px-1.5 text-center font-mono font-bold text-[#0f172a]"
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
                    {formatMoney(Math.round(lineTotal * 100))}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
