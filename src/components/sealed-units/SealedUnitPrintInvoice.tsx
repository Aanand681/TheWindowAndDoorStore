'use client';

import React, { useState, useEffect } from 'react';
import {
  SealedUnitLineItem,
  SealedUnitLabourSettings,
  formatSealedUnitSummarySentence,
} from '@/lib/sealed-units-logic';

export type SealedUnitTemplateType = 'window_style' | 'standard' | 'production';

export interface SealedUnitPrintInvoiceProps {
  lineItems: SealedUnitLineItem[];
  mode?: 'installation' | 'supply_only' | 'service_only';
  isInstallation: boolean;
  labour: SealedUnitLabourSettings;
  hstRate: number;
  customerName: string;
  quoteNumber: string;
  quoteNotes?: string;
  preparedBy?: string;
  template?: SealedUnitTemplateType;
  fontSize?: number; // pt, default 8.5
  spacing?: number; // multiplier, default 1.0
  orientation?: 'portrait' | 'landscape';
  isInteractivePreview?: boolean;
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
    serviceLabourTotal?: number;
    subtotalPreTax: number;
    hstAmount: number;
    grandTotal: number;
    effectiveLabourRate?: number;
    effectiveMiscRate?: number;
  };
}

/**
 * Rich Formatted Notes Parser:
 * Supports bold (<b>, <strong>, **text**), bullet points (•, -, *), and paragraph breaks cleanly.
 */
export function renderRichNotes(notes?: string, baseFs: number = 7.5) {
  if (!notes || !notes.trim()) return null;

  const cleaned = notes
    .replace(/<br\s*\/?>\s*<\/(div|p|li)>/gi, '</$1>')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(div|p|li)>/gi, '\n')
    .replace(/([^\n])<(div|p|li)[^>]*>/gi, '$1\n')
    .replace(/&nbsp;/gi, ' ');

  const rawLines = cleaned.split('\n');
  const lines: string[] = [];
  for (const line of rawLines) {
    const trimmed = line.trim();
    if (trimmed) lines.push(trimmed);
  }

  if (lines.length === 0) return null;

  return (
    <div className="space-y-1 text-gray-800 leading-snug font-sans" style={{ fontSize: `${baseFs}pt` }}>
      {lines.map((line, idx) => {
        const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');
        const textContent = isBullet ? line.replace(/^[•\-*]\s*/, '') : line;

        return (
          <div key={idx} className={isBullet ? 'flex items-start gap-1.5 pl-1' : ''}>
            {isBullet && <span className="text-gray-900 font-bold select-none shrink-0">•</span>}
            <div
              className={isBullet ? 'flex-1' : ''}
              dangerouslySetInnerHTML={{
                __html: textContent
                  .replace(/<(?!\/?(b|strong|i|em)\b)[^>]+>/gi, '')
                  .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                  .replace(/\*(.*?)\*/g, '<i>$1</i>'),
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

/**
 * REUSABLE TOP SPECIFICATION BADGES
 * Displayed across all 3 templates with labels:
 * Treatment, Pane, Glass Fill, Glazing Spacer
 * Ink-friendly (white background, thin border, zero black ink block)
 */
function TopSpecBadges({ lineItems }: { lineItems: SealedUnitLineItem[] }) {
  const treatments = Array.from(new Set(lineItems.map(it => it.treatment).filter(Boolean)));
  const treatmentLabel = treatments.length > 1
    ? 'Mixed'
    : treatments[0] === 'tempered'
      ? 'Tempered'
      : treatments[0] === 'annealed'
        ? 'Annealed'
        : 'Standard';

  const panes = Array.from(new Set(lineItems.map(it => it.paneType).filter(Boolean)));
  const paneLabel = panes.length > 1
    ? 'Mixed'
    : panes[0] === 'triple'
      ? 'Triple Pane'
      : 'Dual Pane';

  const glassFillLabel = 'Argon 90%';

  const spacers = Array.from(new Set(lineItems.map(it => `${it.thicknessMm || 3}mm Intercept`).filter(Boolean)));
  const spacerLabel = spacers.length > 1 ? spacers.join(', ') : (spacers[0] || '3mm Intercept');

  return (
    <div className="grid grid-cols-4 gap-1.5 text-center text-[7pt] font-mono">
      <div className="border border-gray-300 rounded p-1 bg-white">
        <span className="text-[6pt] text-gray-500 font-sans uppercase block">Treatment</span>
        <span className="font-bold text-gray-900 uppercase">{treatmentLabel}</span>
      </div>
      <div className="border border-gray-300 rounded p-1 bg-white">
        <span className="text-[6pt] text-gray-500 font-sans uppercase block">Pane</span>
        <span className="font-bold text-gray-900 uppercase">{paneLabel}</span>
      </div>
      <div className="border border-gray-300 rounded p-1 bg-white">
        <span className="text-[6pt] text-gray-500 font-sans uppercase block">Glass Fill</span>
        <span className="font-bold text-gray-900">{glassFillLabel}</span>
      </div>
      <div className="border border-gray-300 rounded p-1 bg-white">
        <span className="text-[6pt] text-gray-500 font-sans uppercase block">Glazing Spacer</span>
        <span className="font-bold text-gray-900">{spacerLabel}</span>
      </div>
    </div>
  );
}

export function SealedUnitPrintInvoice({
  lineItems,
  mode = 'installation',
  isInstallation,
  labour,
  totals,
  hstRate,
  customerName,
  quoteNumber,
  quoteNotes,
  preparedBy,
  template = 'window_style',
  fontSize = 8.5,
  spacing = 1.0,
  orientation = 'portrait',
  isInteractivePreview = false,
}: SealedUnitPrintInvoiceProps) {
  const isService = mode === 'service_only';
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

  // Dynamic style scaling
  const scaleStyle: React.CSSProperties = {
    fontSize: `${fontSize}pt`,
    lineHeight: spacing,
  };

  return (
    <div
      id="printable-invoice"
      className={
        isInteractivePreview
          ? 'bg-white text-black font-sans p-4 sm:p-6 text-[8.5pt] leading-tight select-text w-full print:p-0 print:m-0 print:border-none print:shadow-none'
          : 'background-quote-invoice su-print-only bg-white text-black font-sans p-4 text-[8.5pt] leading-tight'
      }
      style={scaleStyle}
    >
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: letter ${orientation};
            margin: 0.25in;
          }
          html, body {
            width: ${orientation === 'landscape' ? '11in' : '8.5in'} !important;
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
            width: 100% !important;
            max-width: 100% !important;
            height: auto !important;
            margin: 0 !important;
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

      {template === 'window_style' ? (
        /* =========================================================================
           TEMPLATE 1: WINDOW STYLE PROPOSAL (INK-FRIENDLY ARCHITECTURAL)
           ========================================================================= */
        <div className="space-y-2.5">
          {/* Header */}
          <div className="border-b-2 border-slate-600 pb-2 flex justify-between items-end">
            <div>
              <div className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">Official Quotation Proposal</div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 m-0 uppercase font-sans">
                The Window &amp; Door Store
              </h1>
              <p className="text-[8.5pt] text-slate-600 font-medium mt-0.5">
                Precision Sealed Unit Fabrication &amp; Glazing Services
              </p>
            </div>
            <div className="text-right">
              <div className="inline-block border border-slate-400 px-2.5 py-1 rounded bg-slate-50">
                <div className="text-[7pt] uppercase font-bold text-slate-500">Quote Reference</div>
                <div className="text-base font-mono font-black text-slate-900">
                  #{quoteNumber || '------'}
                </div>
              </div>
              <div className="text-[7.5pt] text-slate-600 font-semibold mt-0.5">
                Issued: {quoteDate}
              </div>
            </div>
          </div>

          {/* Client & Scope Metadata Card */}
          <div className="grid grid-cols-12 gap-2 bg-slate-50/70 border border-slate-300 rounded p-2 text-[8pt]">
            <div className="col-span-6 sm:col-span-5">
              <span className="text-slate-500 uppercase font-bold text-[7pt] block">Prepared For:</span>
              <span className="text-slate-900 font-black text-[9pt] block">{customerName || 'Valued Customer'}</span>
            </div>
            <div className="col-span-3 sm:col-span-4">
              <span className="text-slate-500 uppercase font-bold text-[7pt] block">Service Scope:</span>
              <span className="font-bold text-slate-800 block">
                {isService ? 'Service Glazing' : isInstallation ? 'Supply & Installation' : 'Supply Only'}
              </span>
            </div>
            <div className="col-span-3 text-right">
              <span className="text-slate-500 uppercase font-bold text-[7pt] block">Prepared By:</span>
              <span className="font-bold text-slate-900">{preparedBy || 'Staff Estimator'}</span>
            </div>
          </div>

          {/* 4 Detail Cards: Treatment, Pane, Glass Fill, Glazing Spacer */}
          <TopSpecBadges lineItems={lineItems} />

          {/* Line Items Table (1-4 Sealed Units) - Ink-friendly headers */}
          <div className="border border-slate-300 rounded overflow-hidden">
            <table className="w-full text-left text-[8pt] border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-900 border-b-2 border-slate-400 font-bold uppercase text-[7.5pt] tracking-wider">
                  <th className="py-1.5 px-2 text-center w-7">#</th>
                  <th className="py-1.5 px-2">Glass Combination &amp; Treatment</th>
                  <th className="py-1.5 px-2">Dimensions &amp; Area</th>
                  <th className="py-1.5 px-2">Geometry &amp; Grills</th>
                  <th className="py-1.5 px-2 text-center w-10">Qty</th>
                  {!isService ? (
                    <>
                      <th className="py-1.5 px-2 text-right">Unit Price</th>
                      <th className="py-1.5 px-2 text-right">Total Price</th>
                    </>
                  ) : (
                    <th className="py-1.5 px-2 text-right">Service Area</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {lineItems.length === 0 && isService ? (
                  <tr>
                    <td className="py-2 px-2 text-center text-slate-500 font-mono">1</td>
                    <td className="py-2 px-2 font-bold text-slate-900">On-Site Sealed Unit Service &amp; Glazing</td>
                    <td className="py-2 px-2 font-mono">{(totals.totalSqft || 0).toFixed(2)} sq ft total</td>
                    <td className="py-2 px-2 text-slate-400">—</td>
                    <td className="py-2 px-2 text-center font-bold">1</td>
                    <td className="py-2 px-2 text-right font-mono font-bold">{(totals.totalSqft || 0).toFixed(2)} sq ft</td>
                  </tr>
                ) : (
                  lineItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-slate-50/50">
                      <td className="py-1.5 px-2 text-center text-slate-500 font-mono font-bold">{idx + 1}</td>
                      <td className="py-1.5 px-2">
                        <div className="font-bold text-slate-900">{item.combinationName}</div>
                        <div className="text-[7pt] text-slate-500 capitalize">
                          {item.treatment} · {item.paneType === 'triple' ? 'Triple Pane' : 'Dual Pane'} · {item.thicknessMm}mm
                        </div>
                      </td>
                      <td className="py-1.5 px-2 font-mono">
                        <div className="font-bold text-slate-900">{item.widthIn}&quot; × {item.heightIn}&quot;</div>
                        <div className="text-[7pt] text-slate-500 font-sans">
                          {item.actualSqft.toFixed(2)} sqft {isService ? '' : `(${item.billableSqft} billable)`}
                        </div>
                      </td>
                      <td className="py-1.5 px-2">
                        {item.rawShapeCost > 0 && (
                          <span className="font-semibold text-slate-800 text-[7pt] block">{item.shapeDescription}</span>
                        )}
                        {item.rawGrillCost > 0 ? (
                          <span className="font-medium text-slate-700 text-[7pt] block">{item.grillDescription}</span>
                        ) : (
                          <span className="text-slate-400 text-[7.5pt]">Standard</span>
                        )}
                      </td>
                      <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-900">{item.quantity}</td>
                      {!isService ? (
                        <>
                          <td className="py-1.5 px-2 text-right font-mono text-slate-800">${item.finalUnitPrice.toFixed(2)}</td>
                          <td className="py-1.5 px-2 text-right font-mono font-bold text-slate-950">${item.lineGlassTotal.toFixed(2)}</td>
                        </>
                      ) : (
                        <td className="py-1.5 px-2 text-right font-mono font-bold">{(item.actualSqft * item.quantity).toFixed(2)} sqft</td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* FULL-WIDTH QUOTATION SUMMARY CARD */}
          <div className="border border-slate-300 rounded p-2.5 bg-slate-50/50 space-y-2">
            <div className="text-[8pt] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex justify-between">
              <span>Customer Quotation Summary</span>
              <span className="font-mono text-[7.5pt] font-bold text-slate-600">
                {isService ? 'Service Pricing' : `${lineItems.reduce((acc, i) => acc + i.quantity, 0)} Units Total`}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-3 items-start">
              {/* Financial Lines Ledger (Left 7 cols) */}
              <div className="col-span-7 space-y-1 font-mono text-[8pt]">
                {!isService ? (
                  <>
                    <div className="flex justify-between items-baseline py-0.5">
                      <span className="font-sans text-slate-900 font-medium">
                        {formatSealedUnitSummarySentence(lineItems)}
                      </span>
                      <span className="font-bold text-slate-900">${totals.glassBefore8PercentTotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between items-baseline py-0.5 text-slate-700">
                      <span className="font-sans">Vitro Glass Surcharge (8%)</span>
                      <span className="font-semibold">+${totals.glass8PercentSurchargeTotal.toFixed(2)}</span>
                    </div>

                    {isInstallation && (
                      <>
                        <div className="flex justify-between items-baseline py-0.5">
                          <span className="font-sans text-slate-900 font-medium">Installation Glazing Labour &amp; Travel</span>
                          <span className="font-semibold text-slate-900">+${totals.combinedLabourTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-baseline py-0.5 text-slate-700">
                          <span className="font-sans">Glazing Supplies &amp; Misc Materials</span>
                          <span className="font-semibold">+${totals.miscTotal.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-baseline py-0.5">
                      <span className="font-sans text-slate-900 font-medium">
                        Service Labour ({(totals.totalSqft || 0).toFixed(1)} sqft @ ${(totals.effectiveLabourRate || 14.40).toFixed(2)})
                      </span>
                      <span className="font-bold text-slate-900">${(totals.serviceLabourTotal || 0).toFixed(2)}</span>
                    </div>
                    {totals.totalTravelAndSetup > 0 && (
                      <div className="flex justify-between items-baseline py-0.5 text-slate-700">
                        <span className="font-sans">Travel &amp; Setup Surcharge</span>
                        <span className="font-semibold">+${totals.totalTravelAndSetup.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline py-0.5 text-slate-700">
                      <span className="font-sans">Service Materials &amp; Misc</span>
                      <span className="font-semibold">+${(totals.miscTotal || 0).toFixed(2)}</span>
                    </div>
                  </>
                )}

                <div className="border-t border-slate-300 pt-1 flex justify-between font-bold text-slate-900">
                  <span className="font-sans">Subtotal:</span>
                  <span>${totals.subtotalPreTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between py-0.5 text-slate-700">
                  <span className="font-sans">
                    {isService ? 'HST (13% Service Tax)' : hstRate === 8 ? 'HST (8% Exempt on Materials)' : hstRate === 0 ? 'Tax (0% Exempt)' : 'HST (13%)'}
                  </span>
                  <span>${totals.hstAmount.toFixed(2)}</span>
                </div>

                <div className="border-t-2 border-slate-600 pt-1 flex justify-between font-black text-slate-950 text-[9.5pt]">
                  <span className="font-sans uppercase">Total Proposal Amount:</span>
                  <span>${totals.grandTotal.toFixed(2)}</span>
                </div>

                {/* Deposit Schedule */}
                <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-slate-200 text-center font-sans">
                  <div className="border border-slate-200 bg-white rounded p-1">
                    <span className="text-[6.5pt] uppercase font-bold text-slate-500 block">First 50% Deposit</span>
                    <span className="font-mono font-bold text-slate-900">${firstPayment.toFixed(2)}</span>
                  </div>
                  <div className="border border-slate-200 bg-white rounded p-1">
                    <span className="text-[6.5pt] uppercase font-bold text-slate-500 block">Final 50% on Completion</span>
                    <span className="font-mono font-bold text-slate-900">${secondPayment.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Rich Customer Notes (Right 5 cols) */}
              <div className="col-span-5 border-l border-slate-200 pl-3 space-y-1">
                <span className="text-[7pt] uppercase font-bold text-slate-500 block tracking-wider font-sans">
                  Special Notes &amp; Instructions
                </span>
                {quoteNotes && quoteNotes.trim() ? (
                  renderRichNotes(quoteNotes, 7.5)
                ) : (
                  <p className="text-[7pt] text-slate-400 italic">No special instructions recorded on this proposal.</p>
                )}
              </div>
            </div>
          </div>

          {/* FULL-WIDTH OFFICE PRICING REFERENCE (PLACED DOWN BELOW THE SUMMARY CARD) */}
          <OfficePricingReferenceCard
            lineItems={lineItems}
            totals={totals}
            labour={labour}
            isService={isService}
          />
        </div>
      ) : template === 'standard' ? (
        /* =========================================================================
           TEMPLATE 2: STANDARD HIGH-DENSITY ARCHITECTURAL (RESTRUCTURED FULL WIDTH)
           ========================================================================= */
        <div className="space-y-2.5">
          {/* Header */}
          <div className="border-t-2 border-b-2 border-gray-500 py-1.5">
            <div className="flex justify-between items-baseline">
              <div>
                <h1 className="text-lg font-black tracking-tight text-black m-0 uppercase font-sans">
                  The Window &amp; Door Store
                </h1>
                <div className="text-[8.5pt] text-gray-700 font-bold uppercase tracking-wider">
                  {isInstallation ? 'Sealed Unit & Glazing Quotation' : 'Supply Only Sealed Unit Quotation'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono font-black text-black">#{quoteNumber || '------'}</div>
                <div className="text-[7.5pt] text-gray-700 font-semibold">{quoteDate}</div>
              </div>
            </div>

            <div className="mt-1 pt-1 border-t border-gray-300 flex justify-between items-center text-[8pt] text-black">
              <div>
                <span className="text-gray-600 uppercase font-bold text-[7pt] mr-1">Client:</span>
                <span className="font-black text-black">{customerName || 'Valued Customer'}</span>
              </div>
              <div>
                <span className="text-gray-600 uppercase font-bold text-[7pt] mr-1">Scope:</span>
                <span className="font-bold text-black">
                  {isService ? 'Service Glazing' : isInstallation ? 'Full Installation & Setup' : 'Supply Only'}
                </span>
              </div>
              {preparedBy && (
                <div>
                  <span className="text-gray-600 uppercase font-bold text-[7pt] mr-1">Prepared By:</span>
                  <span className="font-bold text-black">{preparedBy}</span>
                </div>
              )}
            </div>
          </div>

          {/* 4 Detail Cards: Treatment, Pane, Glass Fill, Glazing Spacer */}
          <TopSpecBadges lineItems={lineItems} />

          {/* Sealed Units Table */}
          <table className="w-full text-left text-[8pt] border border-gray-400 border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b-2 border-gray-400 font-bold text-gray-900 uppercase text-[7.5pt]">
                <th className="py-1 px-1.5 border-r border-gray-300 w-6 text-center">#</th>
                <th className="py-1 px-1.5 border-r border-gray-300">Glass Spec</th>
                <th className="py-1 px-1.5 border-r border-gray-300">Dimensions</th>
                <th className="py-1 px-1.5 border-r border-gray-300 text-center">Shape</th>
                <th className="py-1 px-1.5 border-r border-gray-300">Interior Grills</th>
                <th className="py-1 px-1.5 border-r border-gray-300 text-center w-8">Qty</th>
                {!isService ? (
                  <>
                    <th className="py-1 px-1.5 border-r border-gray-300 text-right">Unit Price</th>
                    <th className="py-1 px-1.5 text-right">Glass Total</th>
                  </>
                ) : (
                  <th className="py-1 px-1.5 text-right">Service Sqft</th>
                )}
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item, idx) => (
                <tr key={item.id} className="border-b border-gray-300">
                  <td className="py-1 px-1.5 border-r border-gray-300 text-center font-mono">{idx + 1}</td>
                  <td className="py-1 px-1.5 border-r border-gray-300 font-bold">{item.combinationName}</td>
                  <td className="py-1 px-1.5 border-r border-gray-300 font-mono">
                    {item.widthIn}&quot; × {item.heightIn}&quot; ({item.actualSqft.toFixed(2)} sqft)
                  </td>
                  <td className="py-1 px-1.5 border-r border-gray-300 text-center text-[7pt]">
                    {item.rawShapeCost > 0 ? item.shapeDescription : '—'}
                  </td>
                  <td className="py-1 px-1.5 border-r border-gray-300 text-[7pt]">
                    {item.rawGrillCost > 0 ? item.grillDescription : '—'}
                  </td>
                  <td className="py-1 px-1.5 border-r border-gray-300 text-center font-bold">{item.quantity}</td>
                  {!isService ? (
                    <>
                      <td className="py-1 px-1.5 border-r border-gray-300 text-right font-mono">${item.finalUnitPrice.toFixed(2)}</td>
                      <td className="py-1 px-1.5 text-right font-mono font-bold">${item.lineGlassTotal.toFixed(2)}</td>
                    </>
                  ) : (
                    <td className="py-1 px-1.5 text-right font-mono">{(item.actualSqft * item.quantity).toFixed(2)} sqft</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          {/* FULL-WIDTH QUOTATION SUMMARY CARD */}
          <div className="border border-gray-400 rounded p-2 bg-gray-50/50 space-y-2">
            <div className="text-[8pt] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 flex justify-between font-sans">
              <span>Quotation Summary</span>
              <span className="font-mono text-[7pt] text-gray-500 font-normal">Customer Financial Record</span>
            </div>

            <div className="grid grid-cols-12 gap-3 items-start">
              <div className="col-span-7 space-y-1 font-mono text-[7.5pt]">
                {!isService ? (
                  <>
                    <div className="flex justify-between items-baseline py-0.5">
                      <span className="font-sans text-gray-900 font-medium">{formatSealedUnitSummarySentence(lineItems)}</span>
                      <span className="font-bold text-gray-900">${totals.glassBefore8PercentTotal.toFixed(2)}</span>
                    </div>
                    {isInstallation && (
                      <>
                        <div className="flex justify-between items-baseline py-0.5">
                          <span className="font-sans text-gray-900">Labour (installation &amp; setup)</span>
                          <span className="font-semibold text-gray-900">+${totals.combinedLabourTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-baseline py-0.5">
                          <span className="font-sans text-gray-900">Misc Supplies</span>
                          <span className="font-semibold text-gray-900">+${totals.miscTotal.toFixed(2)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-baseline py-0.5 text-gray-900">
                      <span className="font-sans">Surcharge (8%)</span>
                      <span className="font-semibold">+${totals.glass8PercentSurchargeTotal.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex justify-between items-baseline py-0.5">
                      <span className="font-sans text-gray-900 font-medium">Service Glazing Labour</span>
                      <span className="font-bold text-gray-900">${(totals.serviceLabourTotal || 0).toFixed(2)}</span>
                    </div>
                    {totals.totalTravelAndSetup > 0 && (
                      <div className="flex justify-between items-baseline py-0.5">
                        <span className="font-sans text-gray-700">Travel Surcharge</span>
                        <span>+${totals.totalTravelAndSetup.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-baseline py-0.5">
                      <span className="font-sans text-gray-700">Misc Service Supplies</span>
                      <span>+${(totals.miscTotal || 0).toFixed(2)}</span>
                    </div>
                  </>
                )}

                <div className="flex justify-between items-baseline border-t border-gray-300 pt-0.5 font-bold text-gray-900">
                  <span className="font-sans">Subtotal</span>
                  <span>${totals.subtotalPreTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-baseline py-0.5 text-gray-700">
                  <span className="font-sans">
                    {isService ? 'Tax (13% HST)' : hstRate === 8 ? 'Tax (8% Exempt on Materials)' : hstRate === 0 ? 'No Tax' : 'Tax (13% HST)'}
                  </span>
                  <span>${totals.hstAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-baseline border-t-2 border-gray-600 pt-0.5 font-black text-black text-[9pt]">
                  <span className="font-sans uppercase">Total:</span>
                  <span>${totals.grandTotal.toFixed(2)}</span>
                </div>

                {/* 50/50 Deposit */}
                <div className="grid grid-cols-2 gap-1.5 pt-1 mt-0.5 border-t border-gray-200 font-sans text-center text-[7pt]">
                  <div className="border border-gray-300 rounded py-0.5 px-1 bg-white">
                    <span className="text-gray-500 uppercase block font-bold text-[6pt]">First 50%</span>
                    <span className="font-mono font-bold text-black">${firstPayment.toFixed(2)}</span>
                  </div>
                  <div className="border border-gray-300 rounded py-0.5 px-1 bg-white">
                    <span className="text-gray-500 uppercase block font-bold text-[6pt]">Final 50%</span>
                    <span className="font-mono font-bold text-black">${secondPayment.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Special Notes & Instructions (Right 5 cols) */}
              <div className="col-span-5 border-l border-gray-300 pl-3">
                <div className="font-bold uppercase tracking-wider text-gray-900 text-[7.5pt] border-b border-gray-300 pb-0.5 mb-1 font-sans">
                  Special Notes &amp; Instructions
                </div>
                {quoteNotes && quoteNotes.trim() ? (
                  renderRichNotes(quoteNotes, 7.5)
                ) : (
                  <span className="text-gray-400 text-[7pt] italic">Standard glazing installation terms apply.</span>
                )}
              </div>
            </div>
          </div>

          {/* FULL-WIDTH OFFICE PRICING REFERENCE (PLACED DOWN BELOW THE SUMMARY CARD) */}
          <OfficePricingReferenceCard
            lineItems={lineItems}
            totals={totals}
            labour={labour}
            isService={isService}
          />
        </div>
      ) : (
        /* =========================================================================
           TEMPLATE 3: PRODUCTION & GLAZING WORK ORDER (INK-FRIENDLY WORK ORDER)
           ========================================================================= */
        <div className="space-y-2.5">
          {/* Production Header */}
          <div className="border-b-2 border-zinc-600 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <div className="inline-block border border-zinc-400 bg-zinc-50 text-zinc-900 font-mono text-[7pt] uppercase px-2 py-0.5 rounded font-bold mb-1">
                  Glazing &amp; Fabrication Work Order
                </div>
                <h1 className="text-lg font-black tracking-tight text-zinc-900 uppercase">
                  The Window &amp; Door Store
                </h1>
                <div className="text-[8pt] text-zinc-600 font-medium">
                  Client: <strong className="text-zinc-900">{customerName || 'Direct Client'}</strong> · Scope:{' '}
                  <strong className="text-zinc-900">{isService ? 'Service Only' : isInstallation ? 'Supply & Install' : 'Supply Only'}</strong>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono font-bold text-zinc-500">JOB ORDER #</div>
                <div className="text-lg font-mono font-black text-zinc-950">#{quoteNumber || '------'}</div>
                <div className="text-[7.5pt] text-zinc-500 font-semibold">{quoteDate}</div>
              </div>
            </div>

            {/* 4 Detail Cards: Treatment, Pane, Glass Fill, Glazing Spacer */}
            <div className="mt-2">
              <TopSpecBadges lineItems={lineItems} />
            </div>
          </div>

          {/* Cutting Schedule Table - Ink friendly header */}
          <div className="border border-zinc-300 rounded overflow-hidden">
            <table className="w-full text-left text-[8pt] border-collapse">
              <thead>
                <tr className="bg-zinc-100 text-zinc-900 border-b-2 border-zinc-400 font-mono text-[7pt] uppercase tracking-wider font-bold">
                  <th className="py-1 px-1.5 text-center w-7">Cut</th>
                  <th className="py-1 px-1.5">Glass Assembly</th>
                  <th className="py-1 px-1.5">Exact Dimensions</th>
                  <th className="py-1 px-1.5">Area</th>
                  <th className="py-1 px-1.5">Internal Grills &amp; Hubs</th>
                  <th className="py-1 px-1.5 text-center w-8">Qty</th>
                  {!isService ? (
                    <th className="py-1 px-1.5 text-right">Job Subtotal</th>
                  ) : (
                    <th className="py-1 px-1.5 text-right">Service Sqft</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 font-mono text-[7.5pt]">
                {lineItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-zinc-50">
                    <td className="py-1 px-1.5 text-center font-bold text-zinc-700">{idx + 1}</td>
                    <td className="py-1 px-1.5 font-sans">
                      <div className="font-bold text-zinc-900">{item.combinationName}</div>
                      <div className="text-[6.5pt] text-zinc-500 font-mono">
                        {item.treatment} · {item.paneType} · {item.thicknessMm}mm
                      </div>
                    </td>
                    <td className="py-1 px-1.5 font-bold text-zinc-900">
                      {item.widthIn}&quot; × {item.heightIn}&quot;
                    </td>
                    <td className="py-1 px-1.5 text-zinc-700">
                      {item.actualSqft.toFixed(2)} sqft
                    </td>
                    <td className="py-1 px-1.5 font-sans">
                      {item.rawGrillCost > 0 ? (
                        <span className="inline-block bg-amber-50 border border-amber-300 text-amber-900 text-[6.5pt] font-semibold px-1 py-0.2 rounded">
                          {item.grillDescription}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-[7pt]">No Grills</span>
                      )}
                    </td>
                    <td className="py-1 px-1.5 text-center font-bold text-zinc-900">{item.quantity}</td>
                    {!isService ? (
                      <td className="py-1 px-1.5 text-right font-bold text-zinc-900">
                        ${item.lineGlassTotal.toFixed(2)}
                      </td>
                    ) : (
                      <td className="py-1 px-1.5 text-right font-bold">
                        {(item.actualSqft * item.quantity).toFixed(2)} sqft
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FULL-WIDTH COMMERCIAL QUOTATION SUMMARY */}
          <div className="border border-zinc-300 rounded p-2 bg-zinc-50/70 space-y-2">
            <div className="text-[7.5pt] font-bold uppercase tracking-wider text-zinc-900 border-b border-zinc-300 pb-0.5 flex justify-between font-sans">
              <span>Commercial Quotation &amp; Field Instructions</span>
              <span className="font-mono text-[7pt] text-zinc-600">Client Billing Record</span>
            </div>

            <div className="grid grid-cols-12 gap-3 items-start">
              <div className="col-span-7 space-y-1 font-mono text-[7.5pt]">
                <div className="flex justify-between items-baseline py-0.5">
                  <span className="font-sans text-zinc-800">Glass Manufacturing Supply Total</span>
                  <span className="font-bold text-zinc-950">${totals.glassSupplyTotal.toFixed(2)}</span>
                </div>
                {isInstallation && (
                  <div className="flex justify-between items-baseline py-0.5">
                    <span className="font-sans text-zinc-800">Glazing Installation Labour &amp; Setup</span>
                    <span className="font-semibold text-zinc-950">+${(totals.combinedLabourTotal + totals.miscTotal).toFixed(2)}</span>
                  </div>
                )}
                {isService && (
                  <div className="flex justify-between items-baseline py-0.5">
                    <span className="font-sans text-zinc-800">Service Labour &amp; Travel</span>
                    <span className="font-bold text-zinc-950">${totals.combinedLabourTotal.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between items-baseline border-t border-zinc-300 pt-0.5 font-bold text-zinc-900">
                  <span className="font-sans">Pre-Tax Subtotal</span>
                  <span>${totals.subtotalPreTax.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-baseline py-0.5 text-zinc-700">
                  <span className="font-sans">HST ({hstRate}%)</span>
                  <span>${totals.hstAmount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between items-baseline border-t-2 border-zinc-600 pt-0.5 font-black text-zinc-950 text-[9pt]">
                  <span className="font-sans uppercase">Total Amount:</span>
                  <span>${totals.grandTotal.toFixed(2)}</span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 pt-1 mt-0.5 border-t border-zinc-200 text-center text-[7pt] font-sans">
                  <div className="border border-zinc-300 rounded p-1 bg-white">
                    <span className="text-[6pt] text-zinc-500 font-bold uppercase block">Deposit (50%)</span>
                    <span className="font-mono font-bold text-zinc-900">${firstPayment.toFixed(2)}</span>
                  </div>
                  <div className="border border-zinc-300 rounded p-1 bg-white">
                    <span className="text-[6pt] text-zinc-500 font-bold uppercase block">Balance on Delivery</span>
                    <span className="font-mono font-bold text-zinc-900">${secondPayment.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Special Field Notes */}
              <div className="col-span-5 border-l border-zinc-300 pl-3">
                <span className="text-[7pt] uppercase font-bold text-zinc-500 block mb-1 font-sans">
                  Special Notes &amp; Site Instructions
                </span>
                {quoteNotes && quoteNotes.trim() ? (
                  renderRichNotes(quoteNotes, 7.5)
                ) : (
                  <span className="text-zinc-400 text-[7pt] italic">No special instructions recorded.</span>
                )}
              </div>
            </div>
          </div>

          {/* FULL-WIDTH OFFICE PRICING REFERENCE (PLACED DOWN BELOW THE SUMMARY CARD) */}
          <OfficePricingReferenceCard
            lineItems={lineItems}
            totals={totals}
            labour={labour}
            isService={isService}
          />
        </div>
      )}
    </div>
  );
}

/**
 * REUSABLE FULL-WIDTH OFFICE PRICING REFERENCE CARD
 * Spans 100% width down below the customer quotation summary across all 3 templates.
 * Contains the clean Vitro line item math cards and service breakdown without bottom audit box.
 */
interface OfficePricingReferenceCardProps {
  lineItems: SealedUnitLineItem[];
  totals: any;
  labour: SealedUnitLabourSettings;
  isService: boolean;
}

function OfficePricingReferenceCard({
  lineItems,
  totals,
  labour,
  isService,
}: OfficePricingReferenceCardProps) {
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
              <span>${(totals.effectiveLabourRate || labour.labourRatePerSqft || 14.40).toFixed(2)}/sqft</span>
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
                <div className="border-t border-gray-300 my-0.5 pt-0.5 font-bold text-gray-950 pr-0.5">
                  ${item.multipliedAmount.toFixed(2)}
                </div>
                <div className="text-gray-600 pr-0.5">+8% addon (${item.surcharge8PercentAmount.toFixed(2)})</div>
                <div className="border-t-2 border-gray-600 my-0.5 pt-0.5 font-black text-black text-[7.5pt] pr-0.5">
                  ${item.finalUnitPrice.toFixed(2)} ea
                </div>
                {item.quantity > 1 && (
                  <div className="border-t border-gray-300 mt-0.5 pt-0.5 font-bold text-black text-[7pt] pr-0.5">
                    ×{item.quantity} = ${item.lineGlassTotal.toFixed(2)}
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
