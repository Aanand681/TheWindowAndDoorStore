import React from "react"
import { formatMoney } from "@/lib/promo-logic"
import type { QuoteTemplateType, InvoiceCalculationsResult } from "../types"

export interface DoorsScheduleTableProps {
  theme: QuoteTemplateType
  calc: InvoiceCalculationsResult
  globalUpcharges?: any[]
}

export function DoorsScheduleTable({
  theme,
  calc,
  globalUpcharges = [],
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

  const effectiveDoorUpcharges =
    globalUpcharges && globalUpcharges.length > 0
      ? globalUpcharges
      : attachedDoorQuote?.globalUpcharges || []

  if (!hasDoors || effectiveDoors.length === 0) return null

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

      <table
        className="w-full border-collapse"
        style={{ fontSize: `${bodyFs}px` }}
      >
        <thead>
          <tr
            className={
              isModern
                ? "border-b-2 border-[#0f172a] text-[#0f172a]"
                : isExecutive
                  ? "border-b-2 border-[#0f172a] text-[#0f172a]"
                  : "border-b border-[#cbd5e1] bg-[#f1f5f9] text-[#0f172a]"
            }
          >
            <th className="w-[5%] px-1.5 py-1 text-left font-bold">#</th>
            <th className="w-[45%] px-1.5 py-1 text-left font-bold">
              Door Specifications
            </th>
            <th className="w-[25%] px-1.5 py-1 text-left font-bold">
              Hardware &amp; Options
            </th>
            <th className="w-[10%] px-1.5 py-1 text-center font-bold">Qty</th>
            <th className="w-[15%] px-1.5 py-1 text-right font-mono font-bold">
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
                className="border-b border-[#cbd5e1] bg-white"
              >
                <td
                  style={{
                    paddingTop: `${rowPy}px`,
                    paddingBottom: `${rowPy}px`,
                  }}
                  className="px-1.5 font-semibold text-[#334155]"
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
                    <div className="text-[10px] font-normal text-[#64748b]">
                      {item.notes}
                    </div>
                  )}
                </td>
                <td
                  style={{
                    paddingTop: `${rowPy}px`,
                    paddingBottom: `${rowPy}px`,
                  }}
                  className="px-1.5 text-[#1e293b]"
                >
                  <div className="capitalize">
                    {item.hardwareType === "standard"
                      ? "Standard Lockset"
                      : item.hardwareType === "customer"
                        ? "Customer Supplied"
                        : item.customHardwareName || "None"}
                  </div>
                  {item.upgradeOption?.enabled && (
                    <div className="text-[10px] font-semibold text-amber-700">
                      Option: {item.upgradeOption.title} (+
                      {formatMoney(
                        Math.round(
                          (item.upgradeOption.subtotalDifference || 0) * 100
                        )
                      )}
                      )
                    </div>
                  )}
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
                    {formatMoney(Math.round(lineTotal * 100))}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Itemized Jobsite Labour & Special Site Services (if selected for doors) */}
      {effectiveDoorUpcharges.length > 0 && (
        <div className="mt-2 border-t border-[#cbd5e1] pt-2">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span
              style={{ fontSize: `${h2Fs}px` }}
              className="font-bold tracking-wider text-[#0f172a] uppercase"
            >
              Jobsite Labour &amp; Special Site Services
            </span>
            <span
              style={{ fontSize: `${microFs}px` }}
              className="font-medium text-[#64748b]"
            >
              {effectiveDoorUpcharges.length} service
              {effectiveDoorUpcharges.length > 1 ? "s" : ""}
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
                    ? "border-b-2 border-[#0f172a] text-[#0f172a]"
                    : isExecutive
                      ? "border-b-2 border-[#0f172a] text-[#0f172a]"
                      : "border-b border-[#cbd5e1] bg-[#f1f5f9] text-[#0f172a]"
                }
              >
                <th className="w-[5%] px-1.5 py-1 text-left font-bold">#</th>
                <th className="w-[55%] px-1.5 py-1 text-left font-bold">
                  Service Description
                </th>
                <th className="w-[12%] px-1.5 py-1 text-center font-bold">
                  Qty
                </th>
                <th className="w-[13%] px-1.5 py-1 text-right font-mono font-bold">
                  Rate
                </th>
                <th className="w-[15%] px-1.5 py-1 text-right font-mono font-bold">
                  Total
                </th>
              </tr>
            </thead>
            <tbody style={{ fontSize: `${bodyFs}px` }}>
              {effectiveDoorUpcharges.map((u: any, uIdx: number) => {
                const qty = Number(u.qty) || 1
                const rate = Number(u.rate) || 0
                const total = Number(u.total ?? rate * qty)
                return (
                  <tr
                    key={u.upchargeId || u.id || uIdx}
                    className="border-b border-[#cbd5e1] bg-white"
                  >
                    <td
                      style={{
                        paddingTop: `${rowPy}px`,
                        paddingBottom: `${rowPy}px`,
                      }}
                      className="px-1.5 font-semibold text-[#334155]"
                    >
                      {uIdx + 1}
                    </td>
                    <td
                      style={{
                        paddingTop: `${rowPy}px`,
                        paddingBottom: `${rowPy}px`,
                      }}
                      className="px-1.5 font-bold text-[#0f172a]"
                    >
                      {u.label}
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
                      className="px-1.5 text-right font-mono text-[#334155]"
                    >
                      {formatMoney(Math.round(rate * 100))}
                    </td>
                    <td
                      style={{
                        paddingTop: `${rowPy}px`,
                        paddingBottom: `${rowPy}px`,
                      }}
                      className="px-1.5 text-right font-mono font-bold text-[#0f172a]"
                    >
                      {formatMoney(Math.round(total * 100))}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
