'use client';

import React, { useState, useEffect } from 'react';
import {
  SealedUnitLineItem,
  SealedUnitLabourSettings,
  formatSealedUnitSummarySentence,
} from '@/lib/sealed-units-logic';

export interface SealedUnitPrintInvoiceProps {
  lineItems: SealedUnitLineItem[];
  isInstallation: boolean;
  labour: SealedUnitLabourSettings;
  hstRate: number;
  customerName: string;
  quoteNumber: string;
  quoteNotes?: string;
  preparedBy?: string;
  totals: {
    totalUnits: number;
    totalSqft: number;
    totalBillableSqft: number;
    glassBefore8PercentTotal: number;
    glass8PercentSurchargeTotal: number;
    glassSupplyTotal: number;
    unitLabourSum: number;
    baseSetupFee: number;
    additionalFarFee: number;
    vehicleTravelFee: number;
    crewTravelFee: number;
    totalAdditionalTravel: number;
    totalTravelAndSetup: number;
    combinedLabourTotal: number;
    miscTotal: number;
    subtotalPreTax: number;
    hstAmount: number;
    grandTotal: number;
  };
}

export function SealedUnitPrintInvoice({
  lineItems,
  isInstallation,
  totals,
  hstRate,
  customerName,
  quoteNumber,
  quoteNotes,
  preparedBy,
}: SealedUnitPrintInvoiceProps) {
  const [quoteDate, setQuoteDate] = useState<string>('');

  useEffect(() => {
    setQuoteDate(
      new Date().toLocaleDateString('en-CA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    );
  }, []);

  const firstPayment = Math.floor((totals.grandTotal / 2) * 100) / 100;
  const secondPayment = Math.round((totals.grandTotal - firstPayment) * 100) / 100;

  return (
    <div
      id="printable-invoice"
      className="su-print-only bg-white text-black font-sans p-4 text-[9pt] leading-tight"
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: letter portrait;
            margin: 0.2in;
          }
          html, body {
            width: 8.5in !important;
            height: auto !important;
            min-height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          #printable-invoice {
            display: block !important;
            visibility: visible !important;
            position: static !important;
            width: 8.1in !important;
            max-width: 8.1in !important;
            height: auto !important;
            margin: 0 auto !important;
            padding: 0 !important;
            box-sizing: border-box !important;
            page-break-after: avoid !important;
            break-after: avoid !important;
          }
          #printable-invoice * {
            visibility: visible !important;
          }
        }
      `,
        }}
      />

      {/* Standardized Architectural Header Matching Promo Quote Invoice */}
      <div className="border-t-2 border-b-2 border-black py-1.5 mb-2">
        <div className="flex justify-between items-baseline">
          <div>
            <h1 className="text-lg font-black tracking-tight text-black m-0 uppercase leading-none">
              The Window &amp; Door Store
            </h1>
            <div className="text-[10px] text-gray-700 font-bold uppercase tracking-wider mt-0.5">
              {isInstallation ? 'Sealed Unit & Labour Quotation' : 'Supply Only Sealed Unit Quotation'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-mono font-black text-black" suppressHydrationWarning>
              #{quoteNumber || '------'}
            </div>
            <div className="text-[10px] text-gray-700 font-semibold" suppressHydrationWarning>
              {quoteDate}
            </div>
          </div>
        </div>

        {/* Customer & Scope Bar */}
        <div className="mt-1 pt-1 border-t border-gray-300 flex justify-between items-center text-[10px] text-black flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <div>
              <span className="text-gray-600 uppercase font-bold text-[8.5px] mr-1">Client:</span>
              <span className="font-black text-black">{customerName || 'Valued Customer'}</span>
            </div>
            <div>
              <span className="text-gray-600 uppercase font-bold text-[8.5px] mr-1">Scope:</span>
              <span className="font-bold text-black">
                {isInstallation ? 'Full Installation & Setup' : 'Supply Only'}
              </span>
            </div>
          </div>
          {preparedBy && (
            <div>
              <span className="text-gray-600 uppercase font-bold text-[8.5px] mr-1">Prepared By:</span>
              <span className="font-bold text-black">{preparedBy}</span>
            </div>
          )}
        </div>
      </div>

      {/* Sealed Units Line Items Table */}
      <div className="mb-2">
        <table className="w-full text-left text-[8.5pt] border border-gray-400 border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-black font-bold text-gray-900 uppercase text-[8pt] tracking-wider">
              <th className="py-1 px-1.5 border-r border-gray-300 w-6 text-center">#</th>
              <th className="py-1 px-1.5 border-r border-gray-300">Glass Spec</th>
              <th className="py-1 px-1.5 border-r border-gray-300">Dimensions</th>
              <th className="py-1 px-1.5 border-r border-gray-300 text-center">Shape</th>
              <th className="py-1 px-1.5 border-r border-gray-300">Interior Grills</th>
              <th className="py-1 px-1.5 border-r border-gray-300 text-center w-8">Qty</th>
              <th
                className={`py-1 px-1.5 ${
                  isInstallation ? 'border-r border-gray-300' : ''
                } text-right`}
              >
                Base Price
              </th>
              {isInstallation && (
                <>
                  <th className="py-1 px-1.5 border-r border-gray-300 text-right">Labour</th>
                  <th className="py-1 px-1.5 text-right">Misc</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, idx) => {
              const grillText =
                item.rawGrillCost > 0
                  ? item.grill?.type === 'grid' && item.grill.colsCount && item.grill.rowsCount
                    ? `(${item.grill.colsCount}×${item.grill.rowsCount}) (${item.grill.color || 'White'})`
                    : item.grill?.type === '3_burst'
                    ? `(3 Burst) (${item.grill.color || 'White'})`
                    : item.grill?.type === '5_burst'
                    ? `(5 Burst) (${item.grill.color || 'White'})`
                    : item.grill?.type === 'customer_own'
                    ? '(Customer Own)'
                    : `(${item.grill?.color || 'Grills'})`
                  : null;

              const shapeText =
                item.rawShapeCost > 0
                  ? item.shape === 'rakehead_triangle'
                    ? 'Rake / Triangle'
                    : item.shape === 'roundtop_circle_octagon'
                    ? 'Round / Circle'
                    : 'Custom'
                  : null;

              return (
                <tr key={item.id} className="border-b border-gray-300 break-inside-avoid leading-tight">
                  <td className="py-1 px-1.5 border-r border-gray-300 text-center text-gray-600 font-mono text-[8pt]">
                    {idx + 1}
                  </td>
                  <td className="py-1 px-1.5 border-r border-gray-300">
                    <span className="font-bold text-gray-900">{item.combinationName}</span>{' '}
                    <span className="text-[7.5pt] text-gray-600 capitalize">
                      ({item.paneType === 'triple' ? 'Triple' : 'Dual'} • {item.thicknessMm}mm)
                    </span>
                  </td>
                  <td className="py-1 px-1.5 border-r border-gray-300 font-mono text-[8pt] whitespace-nowrap">
                    {item.widthIn}&quot; wide × {item.heightIn}&quot; high
                  </td>
                  <td className="py-1 px-1.5 border-r border-gray-300 text-center text-[8pt]">
                    {shapeText ? (
                      <span className="font-semibold text-gray-900">{shapeText}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-1 px-1.5 border-r border-gray-300 text-[8pt]">
                    {grillText ? (
                      <span className="font-semibold text-gray-900">{grillText}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="py-1 px-1.5 border-r border-gray-300 text-center font-mono font-bold text-gray-900">
                    {item.quantity}
                  </td>
                  <td
                    className={`py-1 px-1.5 ${
                      isInstallation ? 'border-r border-gray-300' : ''
                    } text-right`}
                  >
                    <div className="font-mono font-bold text-gray-900">
                      ${item.multipliedAmount.toFixed(2)}
                    </div>
                    {item.quantity > 1 && (
                      <div className="text-[6.5pt] text-gray-500 font-sans">
                        total: ${item.multipliedTotal.toFixed(2)}
                      </div>
                    )}
                  </td>
                  {isInstallation && (
                    <>
                      <td className="py-1 px-1.5 border-r border-gray-300 text-right">
                        <div className="font-mono text-gray-900">${item.unitLabour.toFixed(2)}</div>
                        {item.quantity > 1 && (
                          <div className="text-[6.5pt] text-gray-500 font-sans">
                            total: ${item.totalLabour.toFixed(2)}
                          </div>
                        )}
                      </td>
                      <td className="py-1 px-1.5 text-right">
                        <div className="font-mono text-gray-900">${item.unitMisc.toFixed(2)}</div>
                        {item.quantity > 1 && (
                          <div className="text-[6.5pt] text-gray-500 font-sans">
                            total: ${item.totalMisc.toFixed(2)}
                          </div>
                        )}
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 2-COLUMN SECTION: Office Compact Math Stack (Left - 5 cols) & Strict Quotation Summary + Notes (Right - 7 cols) */}
      <div className="break-inside-avoid grid grid-cols-12 gap-3 items-start mb-2">
        {/* LEFT COLUMN (5 cols): 2 Cards in a Row for Office Pricing Reference */}
        <div className="col-span-5 border border-gray-400 rounded p-1.5 bg-gray-50/50">
          <div className="text-[8pt] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-1 flex justify-between items-center font-sans">
            <span>Office Pricing Reference</span>
            <span className="font-mono text-[7pt] text-gray-500 font-normal">Internal Calculation</span>
          </div>

          {/* Compact arithmetic stack: exactly 2 calculations in a row */}
          <div className="grid grid-cols-2 gap-1.5">
            {lineItems.map((item, idx) => {
              const grillCost = item.rawGrillCost > 0 ? item.rawGrillCost.toFixed(2) : null;
              const shapeCost = item.rawShapeCost > 0 ? item.rawShapeCost.toFixed(2) : null;
              return (
                <div
                  key={item.id}
                  className="border border-gray-300 bg-white rounded p-1 font-mono text-[7.5pt] leading-tight text-right shadow-2xs"
                >
                  <div className="font-sans font-bold text-[7pt] text-gray-800 border-b border-gray-200 pb-0.5 mb-0.5 text-left truncate">
                    #{idx + 1} ({item.widthIn}&quot;×{item.heightIn}&quot;)
                  </div>

                  {/* Math Stack Notation */}
                  <div className="pr-0.5">{item.billableSqft}</div>
                  <div className="text-gray-700 pr-0.5">×{item.rateWithArgon.toFixed(2)}</div>
                  <div className="border-t border-gray-400 my-0.5 pt-0.5 font-semibold text-gray-900 pr-0.5">
                    {item.rawGlassCost.toFixed(2)}
                  </div>
                  {grillCost && (
                    <>
                      <div className="text-amber-900 pr-0.5">
                        +{grillCost} <span className="text-[6.5pt] font-sans">Grills</span>
                      </div>
                      <div className="border-t border-gray-400 my-0.5 pt-0.5 font-semibold text-gray-900 pr-0.5">
                        {item.rawPrice.toFixed(2)}
                      </div>
                    </>
                  )}
                  {shapeCost && !grillCost && (
                    <>
                      <div className="text-amber-900 pr-0.5">
                        +{shapeCost} <span className="text-[6.5pt] font-sans">Shape</span>
                      </div>
                      <div className="border-t border-gray-400 my-0.5 pt-0.5 font-semibold text-gray-900 pr-0.5">
                        {item.rawPrice.toFixed(2)}
                      </div>
                    </>
                  )}
                  <div className="text-gray-700 pr-0.5">27%</div>
                  <div className="border-t border-gray-400 my-0.5 pt-0.5 font-semibold text-gray-900 pr-0.5">
                    {item.subtotalAfterSurcharge.toFixed(2)}
                  </div>
                  <div className="text-gray-700 pr-0.5">2.5</div>
                  <div className="border-t-2 border-black my-0.5 pt-0.5 font-bold text-black text-[8pt] pr-0.5">
                    ${item.multipliedAmount.toFixed(2)}
                  </div>
                  <div className="text-[6pt] text-gray-500 font-sans text-right">(Unit Price)</div>
                  {item.quantity > 1 && (
                    <div className="border-t border-gray-300 mt-0.5 pt-0.5 font-bold text-black text-[7pt] pr-0.5">
                      ×{item.quantity} = ${item.multipliedTotal.toFixed(2)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN (7 cols): Strict Sequence Quotation Summary + Special Notes */}
        <div className="col-span-7 space-y-2">
          <div className="border border-gray-400 rounded p-1.5 bg-gray-50/50 text-[8pt]">
            <div className="text-[8pt] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 mb-1 font-sans">
              Quotation Summary
            </div>

            <div className="space-y-0.5 font-mono text-[7.5pt]">
              {/* 1. Unified Glass Summary Sentence */}
              <div className="flex justify-between items-baseline py-0.5">
                <span className="font-sans text-gray-900 font-medium capitalize truncate pr-1">
                  {formatSealedUnitSummarySentence(lineItems)}
                </span>
                <span className="font-bold text-gray-900 whitespace-nowrap shrink-0">
                  ${totals.glassBefore8PercentTotal.toFixed(2)}
                </span>
              </div>

              {/* 2. Labour (includes all the labour and travel charges) */}
              {isInstallation && (
                <div className="flex justify-between items-baseline py-0.5">
                  <span className="font-sans text-gray-900 pr-1">
                    Labour (includes all the labour and travel charges)
                  </span>
                  <span className="font-semibold text-gray-900 whitespace-nowrap shrink-0">
                    +${totals.combinedLabourTotal.toFixed(2)}
                  </span>
                </div>
              )}

              {/* 3. Misc */}
              {isInstallation && (
                <div className="flex justify-between items-baseline py-0.5">
                  <span className="font-sans text-gray-900">Misc</span>
                  <span className="font-semibold text-gray-900 whitespace-nowrap shrink-0">
                    +${totals.miscTotal.toFixed(2)}
                  </span>
                </div>
              )}

              {/* 4. Surcharge (8% Glass Surcharge) */}
              <div className="flex justify-between items-baseline py-0.5 text-gray-900">
                <span className="font-sans">Surcharge</span>
                <span className="font-semibold whitespace-nowrap shrink-0">
                  +${totals.glass8PercentSurchargeTotal.toFixed(2)}
                </span>
              </div>

              {/* 5. Subtotal */}
              <div className="flex justify-between items-baseline border-t border-gray-300 pt-0.5 font-bold text-gray-900">
                <span className="font-sans">Subtotal</span>
                <span className="whitespace-nowrap shrink-0">
                  ${totals.subtotalPreTax.toFixed(2)}
                </span>
              </div>

              {/* 6. Tax */}
              <div className="flex justify-between items-baseline py-0.5 text-gray-700">
                <span className="font-sans">
                  {hstRate === 8
                    ? 'Tax (8% First Nations)'
                    : hstRate === 0
                    ? 'No Tax'
                    : 'Tax (13% HST)'}
                </span>
                <span className="font-semibold whitespace-nowrap shrink-0">
                  ${totals.hstAmount.toFixed(2)}
                </span>
              </div>

              {/* 7. Total */}
              <div className="flex justify-between items-baseline border-t-2 border-black pt-0.5 font-black text-black text-[8.5pt]">
                <span className="font-sans uppercase">Total:</span>
                <span className="text-[9.5pt] whitespace-nowrap shrink-0">
                  ${totals.grandTotal.toFixed(2)}
                </span>
              </div>

              {/* 50/50 Deposit Schedule */}
              <div className="grid grid-cols-2 gap-1 pt-1 mt-0.5 border-t border-gray-200 font-sans text-center text-[7pt]">
                <div className="border border-gray-300 rounded py-0.5 px-0.5 bg-white">
                  <span className="text-gray-500 uppercase block font-bold text-[6pt]">
                    First 50%
                  </span>
                  <span className="font-mono font-bold text-black">${firstPayment.toFixed(2)}</span>
                </div>
                <div className="border border-gray-300 rounded py-0.5 px-0.5 bg-white">
                  <span className="text-gray-500 uppercase block font-bold text-[6pt]">
                    Final 50%
                  </span>
                  <span className="font-mono font-bold text-black">${secondPayment.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Special Notes & Instructions Section (Placed directly under Quote Summary) */}
          {quoteNotes && quoteNotes.trim() && (
            <div className="border border-gray-400 rounded p-1.5 bg-gray-50/50 text-xs">
              <div className="font-bold uppercase tracking-wider text-gray-900 text-[7.5pt] border-b border-gray-300 pb-0.5 mb-0.5 font-sans">
                Special Notes &amp; Instructions
              </div>
              <p className="text-gray-800 text-[7.5pt] leading-normal whitespace-pre-wrap font-sans">
                {quoteNotes.trim()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
