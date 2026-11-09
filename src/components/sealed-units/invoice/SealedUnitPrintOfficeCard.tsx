import React from 'react';
import { SealedUnitLineItem, SealedUnitLabourSettings } from '@/lib/sealed-units-logic';
import { SealedUnitTotals } from './types';

interface SealedUnitPrintOfficeCardProps {
  lineItems: SealedUnitLineItem[];
  totals: SealedUnitTotals;
  labour: SealedUnitLabourSettings;
  isService: boolean;
}

export function SealedUnitPrintOfficeCard({
  lineItems,
  totals,
  labour,
  isService,
}: SealedUnitPrintOfficeCardProps) {
  return (
    <div className="border border-gray-400 rounded p-2 bg-gray-50/70 text-[7.5pt] space-y-1.5 break-inside-avoid">
      <div className="flex justify-between items-center border-b border-gray-300 pb-0.5">
        <div className="flex items-center gap-2">
          <span className="text-[7.5pt] font-black uppercase tracking-wider text-gray-900 font-sans">
            Office Pricing Reference &amp; Internal Calculations
          </span>
          <span className="text-[6.5pt] px-1.5 py-0.2 rounded font-bold bg-amber-50 text-amber-900 border border-amber-300 uppercase">
            Internal Office Reference
          </span>
        </div>
        <span className="font-mono text-[6.5pt] text-gray-500">
          Vitro Pricing Sheet · Formula Audit
        </span>
      </div>

      {isService ? (
        /* Service Work Office Reference */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[7pt]">
          <div className="border border-gray-300 bg-white rounded p-1.5">
            <div className="font-bold text-gray-900 border-b border-gray-200 pb-0.5 uppercase font-sans text-[6.5pt]">
              Glazing Labour Setup
            </div>
            <div className="flex justify-between py-0.5">
              <span className="font-sans text-gray-600">Total Sq Ft:</span>
              <span className="font-bold text-gray-900">{(totals.totalSqft || 0).toFixed(2)} sqft</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="font-sans text-gray-600">Labour Rate:</span>
              <span>${(totals.effectiveLabourRate || labour.labourRatePerSqft || 14.4).toFixed(2)}/sqft</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-0.5 font-bold">
              <span className="font-sans">Service Labour:</span>
              <span>${(totals.serviceLabourTotal || 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="border border-gray-300 bg-white rounded p-1.5">
            <div className="font-bold text-gray-900 border-b border-gray-200 pb-0.5 uppercase font-sans text-[6.5pt]">
              Travel &amp; Logistics
            </div>
            <div className="flex justify-between py-0.5">
              <span className="font-sans text-gray-600">Base Setup Fee:</span>
              <span>${totals.baseSetupFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span className="font-sans text-gray-600">Additional Travel:</span>
              <span>+${totals.totalAdditionalTravel.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-gray-200 pt-0.5 font-bold">
              <span className="font-sans">Total Travel &amp; Setup:</span>
              <span>${totals.totalTravelAndSetup.toFixed(2)}</span>
            </div>
          </div>

          <div className="border border-gray-300 bg-white rounded p-1.5">
            <div className="font-bold text-gray-900 border-b border-gray-200 pb-0.5 uppercase font-sans text-[6.5pt]">
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {lineItems.map((item, idx) => {
            const grillCost = item.rawGrillCost > 0 ? item.rawGrillCost.toFixed(2) : null;
            const shapeCost = item.rawShapeCost > 0 ? item.rawShapeCost.toFixed(2) : null;

            return (
              <div
                key={item.id}
                className="border border-gray-300 bg-white rounded p-1 font-mono text-[7pt] leading-tight text-right shadow-2xs"
              >
                <div className="font-sans font-bold text-[6.5pt] text-gray-900 border-b border-gray-200 pb-0.5 mb-0.5 text-left truncate">
                  #{idx + 1} ({item.widthIn}&quot;×{item.heightIn}&quot;)
                </div>

                <div className="pr-0.5">{item.billableSqft} sqft billed</div>
                <div className="text-gray-600 pr-0.5">× ${item.rateWithArgon.toFixed(2)} rate</div>
                <div className="border-t border-gray-300 my-0.5 pt-0.5 font-semibold text-gray-900 pr-0.5">
                  ${item.rawGlassCost.toFixed(2)}
                </div>
                {grillCost && (
                  <div className="text-amber-900 pr-0.5">
                    +${grillCost} <span className="text-[6pt] font-sans">Grills</span>
                  </div>
                )}
                {shapeCost && (
                  <div className="text-amber-900 pr-0.5">
                    +${shapeCost} <span className="text-[6pt] font-sans">Shape</span>
                  </div>
                )}
                <div className="text-gray-600 pr-0.5">+27% surcharge</div>
                <div className="border-t border-gray-300 my-0.5 pt-0.5 font-semibold text-gray-900 pr-0.5">
                  ${item.subtotalAfterSurcharge.toFixed(2)}
                </div>
                <div className="text-gray-600 pr-0.5">×2.5 multiplier</div>
                <div className="border-t-2 border-gray-600 my-0.5 pt-0.5 font-black text-black text-[7.5pt] pr-0.5">
                  ${item.multipliedAmount.toFixed(2)} ea
                </div>
                {item.quantity > 1 && (
                  <div className="border-t border-gray-300 mt-0.5 pt-0.5 font-bold text-black text-[7pt] pr-0.5">
                    ×{item.quantity} = ${(item.multipliedAmount * item.quantity).toFixed(2)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

