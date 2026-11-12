import React from "react"
import {
  SealedUnitLineItem,
  SealedUnitLabourSettings,
} from "@/lib/sealed-units-logic"
import { SealedUnitTotals } from "./types"

interface SealedUnitPrintOfficeCardProps {
  lineItems: SealedUnitLineItem[]
  totals: SealedUnitTotals
  labour: SealedUnitLabourSettings
  isService: boolean
}

export function SealedUnitPrintOfficeCard({
  lineItems,
  totals,
  labour,
  isService,
}: SealedUnitPrintOfficeCardProps) {
  return (
    <div className="break-inside-avoid space-y-1.5 rounded border border-gray-400 bg-gray-50/70 p-2 text-[7.5pt]">
      <div className="flex items-center justify-between border-b border-gray-300 pb-0.5">
        <div className="flex items-center gap-2">
          <span className="font-sans text-[7.5pt] font-black tracking-wider text-gray-900 uppercase">
            Office Pricing Reference &amp; Internal Calculations
          </span>
          <span className="py-0.2 rounded border border-amber-300 bg-amber-50 px-1.5 text-[6.5pt] font-bold text-amber-900 uppercase">
            Internal Office Reference
          </span>
        </div>
        <span className="font-mono text-[6.5pt] text-gray-500">
          Vitro Pricing Sheet · Formula Audit
        </span>
      </div>

      {isService ? (
        /* Service Work Office Reference */
        <div className="grid grid-cols-1 gap-2 font-mono text-[7pt] sm:grid-cols-3">
          <div className="rounded border border-gray-300 bg-white p-1.5">
            <div className="border-b border-gray-200 pb-0.5 font-sans text-[6.5pt] font-bold text-gray-900 uppercase">
              Glazing Labour Setup
            </div>
            <div className="flex justify-between py-0.5">
              <span className="font-sans text-gray-600">Total Sq Ft:</span>
              <span className="font-bold text-gray-900">
                {(totals.totalSqft || 0).toFixed(2)} sqft
              </span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="font-sans text-gray-600">Labour Rate:</span>
              <span>
                $
                {(
                  totals.effectiveLabourRate ||
                  labour.labourRatePerSqft ||
                  14.4
                ).toFixed(2)}
                /sqft
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-0.5 font-bold">
              <span className="font-sans">Service Labour:</span>
              <span>${(totals.serviceLabourTotal || 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="rounded border border-gray-300 bg-white p-1.5">
            <div className="border-b border-gray-200 pb-0.5 font-sans text-[6.5pt] font-bold text-gray-900 uppercase">
              Travel &amp; Logistics
            </div>
            <div className="flex justify-between py-0.5">
              <span className="font-sans text-gray-600">Base Setup Fee:</span>
              <span>${totals.baseSetupFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="font-sans text-gray-600">
                Additional Travel:
              </span>
              <span>+${totals.totalAdditionalTravel.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-0.5 font-bold">
              <span className="font-sans">Total Travel &amp; Setup:</span>
              <span>${totals.totalTravelAndSetup.toFixed(2)}</span>
            </div>
          </div>

          <div className="rounded border border-gray-300 bg-white p-1.5">
            <div className="border-b border-gray-200 pb-0.5 font-sans text-[6.5pt] font-bold text-gray-900 uppercase">
              Financial Summary
            </div>
            <div className="flex justify-between py-0.5">
              <span className="font-sans text-gray-600">Misc Supplies:</span>
              <span>${(totals.miscTotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="font-sans text-gray-600">Total Labour:</span>
              <span>${totals.combinedLabourTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-600 pt-0.5 font-black text-black">
              <span className="font-sans">Pre-Tax Service:</span>
              <span>${totals.subtotalPreTax.toFixed(2)}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Vitro Manufacturing Math Stack Cards across the full width */
        <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
          {lineItems.map((item, idx) => {
            const grillCost =
              item.rawGrillCost > 0 ? item.rawGrillCost.toFixed(2) : null
            const shapeCost =
              item.rawShapeCost > 0 ? item.rawShapeCost.toFixed(2) : null

            return (
              <div
                key={item.id}
                className="rounded border border-gray-300 bg-white p-1 text-right font-mono text-[7pt] leading-tight shadow-2xs"
              >
                <div className="mb-0.5 truncate border-b border-gray-200 pb-0.5 text-left font-sans text-[6.5pt] font-bold text-gray-900">
                  #{idx + 1} ({item.widthIn}&quot;×{item.heightIn}&quot;)
                </div>

                <div className="pr-0.5">{item.billableSqft} sqft billed</div>
                <div className="pr-0.5 text-gray-600">
                  × ${item.rateWithArgon.toFixed(2)} rate
                </div>
                <div className="my-0.5 border-t border-gray-300 pt-0.5 pr-0.5 font-semibold text-gray-900">
                  ${item.rawGlassCost.toFixed(2)}
                </div>
                {grillCost && (
                  <div className="pr-0.5 text-amber-900">
                    +${grillCost}{" "}
                    <span className="font-sans text-[6pt]">Grills</span>
                  </div>
                )}
                {shapeCost && (
                  <div className="pr-0.5 text-amber-900">
                    +${shapeCost}{" "}
                    <span className="font-sans text-[6pt]">Shape</span>
                  </div>
                )}
                <div className="pr-0.5 text-gray-600">+27% surcharge</div>
                <div className="my-0.5 border-t border-gray-300 pt-0.5 pr-0.5 font-semibold text-gray-900">
                  ${item.subtotalAfterSurcharge.toFixed(2)}
                </div>
                <div className="pr-0.5 text-gray-600">×2.5 multiplier</div>
                <div className="my-0.5 border-t-2 border-gray-600 pt-0.5 pr-0.5 text-[7.5pt] font-black text-black">
                  ${item.multipliedAmount.toFixed(2)} ea
                </div>
                {item.quantity > 1 && (
                  <div className="mt-0.5 border-t border-gray-300 pt-0.5 pr-0.5 text-[7pt] font-bold text-black">
                    ×{item.quantity} = $
                    {(item.multipliedAmount * item.quantity).toFixed(2)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
