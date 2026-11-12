"use client"

import React from "react"
import { DoorLineItem } from "@/lib/doors/types"
import { formatDoorSummarySentence } from "@/lib/doors/calculations"

export interface DoorInvoiceItemsTableProps {
  lineItems: DoorLineItem[]
  isInstallation: boolean
}

export function DoorInvoiceItemsTable({
  lineItems,
  isInstallation,
}: DoorInvoiceItemsTableProps) {
  const doorSentence = formatDoorSummarySentence(lineItems)

  return (
    <div className="overflow-hidden rounded border border-slate-300">
      <div className="flex justify-between border-b border-slate-300 bg-slate-100 px-3 py-1 text-[7.5pt] font-bold tracking-wider text-slate-700 uppercase">
        <span>Itemized Door Specifications</span>
        <span>{doorSentence}</span>
      </div>

      <table className="w-full border-collapse text-left text-[8pt]">
        <thead>
          <tr className="border-b border-slate-300 bg-slate-50 text-[7pt] font-bold text-slate-600 uppercase">
            <th className="w-10 border-r border-slate-300 px-2.5 py-1.5 text-center">
              Qty
            </th>
            <th className="border-r border-slate-300 px-2.5 py-1.5">
              Description &amp; Style
            </th>
            <th className="w-28 border-r border-slate-300 px-2.5 py-1.5">
              Category
            </th>
            <th className="w-32 border-r border-slate-300 px-2.5 py-1.5">
              Hardware
            </th>
            <th className="w-24 border-r border-slate-300 px-2.5 py-1.5 text-right">
              Unit Base
            </th>
            <th className="w-24 px-2.5 py-1.5 text-right">Line Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {lineItems.map((item, idx) => {
            let hwLabel = "None"
            if (item.hardwareType === "standard") {
              hwLabel = `Standard Set ($${item.hardwarePrice.toFixed(0)})`
            } else if (item.hardwareType === "customer_supplied") {
              hwLabel = `Customer ($${(item.customerHardwareFee || 80).toFixed(0)} Reinstall Labour)`
            } else if (item.hardwareType === "custom") {
              hwLabel = `${item.customHardwareName || "Custom"} ($${item.hardwarePrice.toFixed(0)})`
            }

            return (
              <React.Fragment key={item.id || idx}>
                <tr className="hover:bg-slate-50/50">
                  <td className="border-r border-slate-200 px-2.5 py-2 text-center font-mono font-bold">
                    {item.quantity}
                  </td>
                  <td className="border-r border-slate-200 px-2.5 py-2">
                    <div className="font-bold text-slate-900">
                      {item.customDescription || item.presetLabel}
                    </div>
                    <div className="text-[7pt] text-slate-500">
                      Preset: {item.presetLabel}
                    </div>
                  </td>
                  <td className="border-r border-slate-200 px-2.5 py-2 text-[7pt] font-semibold text-slate-600 uppercase">
                    {item.category}
                  </td>
                  <td className="border-r border-slate-200 px-2.5 py-2 text-[7.5pt]">
                    {hwLabel}
                  </td>
                  <td className="border-r border-slate-200 px-2.5 py-2 text-right font-mono">
                    ${item.inksterBasePrice.toFixed(2)}
                  </td>
                  <td className="px-2.5 py-2 text-right font-mono font-bold text-slate-950">
                    $
                    {(isInstallation
                      ? item.lineGrandTotal
                      : (item.lineSupplyTotal ??
                        item.lineDoorSupplyTotal +
                          item.lineHardwareTotal +
                          item.surchargeAmount * item.quantity -
                          item.discountAmount * item.quantity)
                    ).toFixed(2)}
                  </td>
                </tr>

                {/* Option of Upgrade Row */}
                {item.upgradeOption?.enabled && (
                  <tr className="border-b border-emerald-200 bg-emerald-50/70">
                    <td
                      colSpan={6}
                      className="px-3 py-1 text-[7.5pt] text-emerald-950"
                    >
                      <div className="flex items-center justify-between">
                        <span>
                          <strong className="text-emerald-900">
                            option for Door upgrade:
                          </strong>{" "}
                          {item.upgradeOption.title || item.customDescription}{" "}
                          Add
                        </span>
                        <strong className="font-mono text-emerald-800">
                          +$
                          {(
                            (item.upgradeOption.subtotalDifference || 0) *
                            (item.quantity || 1)
                          ).toFixed(2)}
                        </strong>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
