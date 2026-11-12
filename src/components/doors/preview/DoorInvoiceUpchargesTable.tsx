"use client"

import React from "react"
import { DoorSelectedUpcharge, DoorQuoteTotals } from "@/lib/doors/types"

export interface DoorInvoiceUpchargesTableProps {
  isInstallation: boolean
  globalUpcharges: DoorSelectedUpcharge[]
  totals: DoorQuoteTotals
}

export function DoorInvoiceUpchargesTable({
  isInstallation,
  globalUpcharges,
  totals,
}: DoorInvoiceUpchargesTableProps) {
  if (!isInstallation) return null

  return (
    <>
      {globalUpcharges.length > 0 && (
        <div className="overflow-hidden rounded border border-slate-300">
          <div className="flex items-center justify-between bg-slate-100 px-2 py-1 text-[8pt] font-bold tracking-wider text-slate-800 uppercase">
            <span>Jobsite Labour &amp; Special Site Services</span>
            <span className="text-[7pt] font-normal text-slate-500">
              {globalUpcharges.length} item
              {globalUpcharges.length > 1 ? "s" : ""}
            </span>
          </div>
          <table className="w-full border-collapse text-[7.5pt]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-700">
                <th className="w-8 px-1.5 py-1 text-left">#</th>
                <th className="px-1.5 py-1 text-left">Service Description</th>
                <th className="w-12 px-1.5 py-1 text-center">Qty</th>
                <th className="w-20 px-1.5 py-1 text-right">Rate</th>
                <th className="w-20 px-1.5 py-1 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {globalUpcharges.map((u, idx) => (
                <tr key={u.upchargeId || idx}>
                  <td className="px-1.5 py-1 text-slate-500">{idx + 1}</td>
                  <td className="px-1.5 py-1 font-semibold text-slate-900">
                    {u.label}
                  </td>
                  <td className="px-1.5 py-1 text-center font-mono">{u.qty}</td>
                  <td className="px-1.5 py-1 text-right font-mono text-slate-600">
                    ${Number(u.rate || 0).toFixed(2)}
                  </td>
                  <td className="px-1.5 py-1 text-right font-mono font-bold text-slate-950">
                    ${Number(u.total || 0).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Site Mobilization Notice */}
      {totals.totalTravelAndSetup > 0 && (
        <div className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 p-1.5 text-[7.5pt]">
          <div>
            <span className="font-bold text-slate-700">
              Site Setup &amp; Mobilization:
            </span>{" "}
            <span className="font-mono font-semibold">
              ${totals.totalTravelAndSetup.toFixed(2)}
            </span>
            {totals.additionalFarFee > 0 && (
              <span className="ml-1 text-slate-500">
                ($140 Base + ${totals.additionalFarFee.toFixed(2)} remote)
              </span>
            )}
          </div>
        </div>
      )}
    </>
  )
}
