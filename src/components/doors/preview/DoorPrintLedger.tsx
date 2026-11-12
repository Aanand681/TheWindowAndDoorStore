"use client"

import React from "react"
import { DoorLineItem, DoorQuoteTotals } from "@/lib/doors/types"
import { formatDoorItemHeading } from "@/lib/doors/calculations"

export interface DoorPrintLedgerProps {
  lineItems: DoorLineItem[]
  totals: DoorQuoteTotals
  isFirstNation: boolean
  hasAttachedWindow: boolean
  hasAttachedSU: boolean
  attachedWindowQuote?: any
  winBase: number
  winJC: number
  winJCDescription: string
  suGlass: number
  combinedLabour: number
  combinedMisc: number
  combinedSurcharge: number
  winDiscount: number
  winPromoName: string
  combinedSubtotal: number
  combinedTax: number
  finalGrandTotal: number
  firstPayment: number
  secondPayment: number
}

export function DoorPrintLedger({
  lineItems,
  totals,
  isFirstNation: _isFirstNation,
  hasAttachedWindow,
  hasAttachedSU,
  attachedWindowQuote,
  winBase,
  winJC,
  winJCDescription,
  suGlass,
  combinedLabour,
  combinedMisc,
  combinedSurcharge,
  winDiscount,
  winPromoName,
  combinedSubtotal,
  combinedTax,
  finalGrandTotal,
  firstPayment,
  secondPayment,
}: DoorPrintLedgerProps) {
  return (
    <div className="space-y-1.5 rounded border border-slate-300 bg-slate-50 p-3 text-[8pt]">
      <div className="border-b border-slate-300 pb-1 text-[7.5pt] font-bold tracking-wider text-slate-900 uppercase">
        Summary
      </div>

      {lineItems.length > 0 ? (
        lineItems.map((item, idx) => {
          const qty = item.quantity || 1
          const heading = formatDoorItemHeading(item)
          const itemBaseTotal = item.inksterBasePrice * qty
          return (
            <div
              key={item.id || idx}
              className="flex justify-between text-[7.5pt]"
            >
              <span className="max-w-[200px] truncate text-slate-600">
                {heading}:
              </span>
              <span className="shrink-0 font-mono font-semibold">
                ${itemBaseTotal.toFixed(2)}
              </span>
            </div>
          )
        })
      ) : (
        <div className="flex justify-between text-[7.5pt]">
          <span className="text-slate-600">Door Units:</span>
          <span className="font-mono font-semibold">$0.00</span>
        </div>
      )}

      {hasAttachedWindow && (
        <div className="flex justify-between text-[7.5pt]">
          <span className="max-w-[200px] truncate text-slate-600">
            {attachedWindowQuote.summarySentence ||
              attachedWindowQuote.summaryLabel ||
              "Attached Window Glass"}
            :
          </span>
          <span className="shrink-0 font-mono font-semibold">
            +${winBase.toFixed(2)}
          </span>
        </div>
      )}

      {hasAttachedWindow && winJC > 0 && (
        <div className="flex justify-between text-[7.5pt]">
          <span className="max-w-[200px] truncate text-slate-600">
            {winJCDescription}:
          </span>
          <span className="shrink-0 font-mono font-semibold">
            +${winJC.toFixed(2)}
          </span>
        </div>
      )}

      {hasAttachedSU && (
        <div className="flex justify-between text-[7.5pt]">
          <span className="max-w-[200px] truncate text-slate-600">
            Attached Sealed Glass:
          </span>
          <span className="shrink-0 font-mono font-semibold">
            +${suGlass.toFixed(2)}
          </span>
        </div>
      )}

      <div className="flex justify-between text-[7.5pt]">
        <span className="text-slate-600">Labour:</span>
        <span className="font-mono font-semibold">
          ${combinedLabour.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between text-[7.5pt]">
        <span className="text-slate-600">Miscellaneous:</span>
        <span className="font-mono font-semibold">
          ${combinedMisc.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between text-[7.5pt]">
        <span className="text-slate-600">Surcharge:</span>
        <span className="font-mono font-semibold">
          ${combinedSurcharge.toFixed(2)}
        </span>
      </div>

      <div className="flex justify-between text-[7.5pt] font-semibold text-emerald-700">
        <span>10% Door Discount:</span>
        <span className="font-mono">-${totals.discountTotal.toFixed(2)}</span>
      </div>

      {winDiscount > 0 && (
        <div className="flex justify-between text-[7.5pt] font-semibold text-emerald-700">
          <span className="max-w-[200px] truncate">
            Promo ({winPromoName}):
          </span>
          <span className="shrink-0 font-mono">-${winDiscount.toFixed(2)}</span>
        </div>
      )}

      {totals.hardwareTotal > 0 && (
        <div className="flex justify-between text-[7.5pt]">
          <span className="text-slate-600">Hardware &amp; Lockset:</span>
          <span className="font-mono font-semibold">
            ${totals.hardwareTotal.toFixed(2)}
          </span>
        </div>
      )}

      <div className="flex justify-between border-t border-slate-300 pt-1 text-[8.5pt] font-bold">
        <span>Subtotal:</span>
        <span className="font-mono">${combinedSubtotal.toFixed(2)}</span>
      </div>

      {totals.materialExemption && totals.materialExemption > 0 ? (
        <>
          <div className="flex justify-between text-[7.5pt] text-slate-600">
            <span>13% HST (on all):</span>
            <span className="font-mono font-semibold">
              +$
              {(
                totals.hstBase ??
                combinedTax + (totals.materialExemption || 0)
              ).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-[7.5pt] font-semibold text-emerald-700">
            <span>8% Tax Rebate (Material Exemption):</span>
            <span className="font-mono">
              -${totals.materialExemption.toFixed(2)}
            </span>
          </div>
        </>
      ) : (
        <div className="flex justify-between text-[7.5pt] text-slate-600">
          <span>{combinedTax === 0 ? "HST (0% Exempt)" : "13% HST"}:</span>
          <span className="font-mono font-semibold">
            ${combinedTax.toFixed(2)}
          </span>
        </div>
      )}

      {/* Total incl. HST */}
      <div className="flex items-baseline justify-between border-t-2 border-slate-900 pt-1.5 text-[11pt] font-black text-slate-950">
        <span className="text-[8pt] uppercase">Total:</span>
        <span className="font-mono">${finalGrandTotal.toFixed(2)}</span>
      </div>

      {/* Side-by-side First 50% and Final 50% deposit boxes */}
      <div className="mt-1 grid grid-cols-2 gap-1.5 border-t border-slate-300 pt-1.5 text-center text-[7pt]">
        <div className="rounded border border-slate-300 bg-white px-1.5 py-1">
          <span className="block text-[6pt] font-bold text-slate-500 uppercase">
            First 50%
          </span>
          <span className="font-mono font-bold text-slate-900">
            ${firstPayment.toFixed(2)}
          </span>
        </div>
        <div className="rounded border border-slate-300 bg-white px-1.5 py-1">
          <span className="block text-[6pt] font-bold text-slate-500 uppercase">
            Final 50%
          </span>
          <span className="font-mono font-bold text-slate-900">
            ${secondPayment.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}
