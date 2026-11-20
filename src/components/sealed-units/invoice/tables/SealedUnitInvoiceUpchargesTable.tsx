"use client"

import React from "react"
import { SealedUnitUpcharge } from "../types"

export interface SealedUnitInvoiceUpchargesTableProps {
  globalUpcharges?: SealedUnitUpcharge[]
}

export function SealedUnitInvoiceUpchargesTable({
  globalUpcharges = [],
}: SealedUnitInvoiceUpchargesTableProps) {
  const activeItems = globalUpcharges.filter(
    (u) => Math.max(0, parseFloat(String(u.price || 0)) || 0) > 0
  )

  if (activeItems.length === 0) return null

  return (
    <div className="overflow-hidden rounded border border-slate-300">
      <div className="flex items-center justify-between bg-slate-100 px-2 py-1 text-[8pt] font-bold tracking-wider text-slate-800 uppercase">
        <span>Jobsite Labour &amp; Special Site Services</span>
        <span className="text-[7pt] font-normal text-slate-500">
          {activeItems.length} item{activeItems.length > 1 ? "s" : ""}
        </span>
      </div>
      <table className="w-full border-collapse text-[7.5pt]">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
            <th className="w-8 px-1.5 py-1 text-left">#</th>
            <th className="px-1.5 py-1 text-left">Service Description</th>
            <th className="w-24 px-1.5 py-1 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 bg-white">
          {activeItems.map((u, idx) => {
            const amt = Math.max(
              0,
              parseFloat(String(u.price || 0)) || 0
            )
            return (
              <tr key={u.id || idx}>
                <td className="px-1.5 py-1 text-slate-500">{idx + 1}</td>
                <td className="px-1.5 py-1 font-semibold text-slate-900">
                  {u.label || "Add-on Labour"}
                </td>
                <td className="px-1.5 py-1 text-right font-mono font-bold text-slate-950">
                  ${amt.toFixed(2)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
export default SealedUnitInvoiceUpchargesTable
