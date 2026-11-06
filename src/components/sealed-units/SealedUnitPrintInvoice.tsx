'use client';

import React, { useState, useEffect } from 'react';
import {
  SealedUnitLineItem,
  SealedUnitLabourSettings,
  formatSealedUnitSummarySentence,
  getSealedUnitServiceSummaryLabel,
} from '@/lib/sealed-units-logic';
import { formatDoorItemHeading } from '@/lib/doors/calculations';

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
  attachedWindowQuote?: any | null;
  attachedDoorQuote?: any | null;
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

/**
 * REUSABLE COMMON SUMMARY LEDGER
 * Displays identical rows across all 3 templates:
 * 1. Glass Summary line (e.g. "1 dual pane su with grills") -> totals.glassBefore8PercentTotal
 * 2. Labour -> totals.combinedLabourTotal (if installation)
 * 3. Miscellaneous -> totals.miscTotal (if installation)
 * 4. Surcharge -> totals.glass8PercentSurchargeTotal
 * 5. Subtotal -> totals.subtotalPreTax
 * 6. Tax -> totals.hstAmount
 * 7. Total -> totals.grandTotal
 * 8. 50/50 Deposit Schedule
 */
interface CommonSummaryLedgerProps {
  lineItems: SealedUnitLineItem[];
  totals: any;
  isInstallation: boolean;
  isService: boolean;
  hstRate: number;
  firstPayment?: number;
  secondPayment?: number;
  attachedWindowQuote?: any | null;
  attachedDoorQuote?: any | null;
  textColor?: string;
  subtextColor?: string;
  borderColor?: string;
  totalBorderColor?: string;
}

function CommonSummaryLedger({
  lineItems,
  totals,
  isInstallation,
  isService,
  hstRate,
  attachedWindowQuote,
  attachedDoorQuote,
  textColor = 'text-gray-900',
  subtextColor = 'text-gray-700',
  borderColor = 'border-gray-300',
  totalBorderColor = 'border-gray-600',
}: CommonSummaryLedgerProps) {
  const hasAttachedWindow = Boolean(attachedWindowQuote);
  const hasAttachedDoor = Boolean(attachedDoorQuote);
  const hasAnyAttached = hasAttachedWindow || hasAttachedDoor;

  const winBase = hasAttachedWindow ? (attachedWindowQuote.totals?.base || attachedWindowQuote.totals?.subtotal || 0) : 0;
  const winJC = hasAttachedWindow ? (attachedWindowQuote.totals?.jc ?? attachedWindowQuote.jcDollars ?? 0) : 0;
  const winJCDescription = attachedWindowQuote?.jcLabel || 'Jambs & Casing';
  const winDiscount = hasAttachedWindow
    ? (attachedWindowQuote.totals?.promoDiscount || attachedWindowQuote.quoteResult?.promoDiscount || attachedWindowQuote.data?.promoDiscount || 0) / (attachedWindowQuote.quoteResult?.promoDiscount ? 100 : 1)
    : 0;
  const winPromoName = attachedWindowQuote?.promoName || attachedWindowQuote?.quoteResult?.promoName || 'Window Promo';
  const doorDiscount = hasAttachedDoor ? (attachedDoorQuote.totals?.discountTotal || 0) : 0;
  const doorMat = hasAttachedDoor
    ? ((attachedDoorQuote.totals?.rawDoorBaseTotal || 0) + (attachedDoorQuote.totals?.stormDoorTotal || 0) + (attachedDoorQuote.totals?.hardwareTotal || 0) - doorDiscount)
    : 0;

  const winLabour = hasAttachedWindow ? (attachedWindowQuote.totals?.labour || 0) : 0;
  const doorLabour = hasAttachedDoor ? (attachedDoorQuote.totals?.combinedLabourTotal || 0) : 0;
  const winMisc = hasAttachedWindow ? (attachedWindowQuote.totals?.misc || 0) : 0;
  const doorMisc = hasAttachedDoor ? (attachedDoorQuote.totals?.miscTotal || 0) : 0;
  const rawWinSurcharge = hasAttachedWindow ? (attachedWindowQuote.totals?.surcharge || 0) : 0;
  const winSurcharge = (rawWinSurcharge > winBase && winBase > 0)
    ? Math.round(winBase * 0.08 * 100) / 100
    : rawWinSurcharge;
  const doorSurcharge = hasAttachedDoor ? (attachedDoorQuote.totals?.surchargeTotal || 0) : 0;

  const suMaterials = isService ? 0 : totals.glassBefore8PercentTotal;
  const combinedLabour = totals.combinedLabourTotal + winLabour + doorLabour;
  const combinedMisc = (totals.miscTotal || 0) + winMisc + doorMisc;
  const combinedSurcharge = totals.glass8PercentSurchargeTotal + winSurcharge + doorSurcharge;
  const combinedSubtotal = hasAnyAttached
    ? Math.round((suMaterials + (winBase - winDiscount) + winJC + doorMat + combinedLabour + combinedMisc + combinedSurcharge) * 100) / 100
    : totals.subtotalPreTax;

  let combinedTax = totals.hstAmount;
  if (hasAnyAttached) {
    if (hstRate === 8) {
      const mat = totals.glassBefore8PercentTotal + totals.glass8PercentSurchargeTotal + (winBase - winDiscount + winJC + winSurcharge) + (doorMat + doorSurcharge);
      const srv = combinedLabour + combinedMisc;
      combinedTax = Math.round((mat * 0.05 + srv * 0.13) * 100) / 100;
    } else if (hstRate === 13) {
      combinedTax = Math.round(combinedSubtotal * 0.13 * 100) / 100;
    } else {
      combinedTax = 0;
    }
  }

  const grandTotal = hasAnyAttached ? (combinedSubtotal + combinedTax) : totals.grandTotal;
  const fp = Math.floor((grandTotal / 2) * 100) / 100;
  const sp = Math.round((grandTotal - fp) * 100) / 100;

  return (
    <div className={`space-y-1 font-mono text-[7.5pt] ${textColor}`}>
      {!isService ? (
        <>
          {/* 1. Unified Glass Summary Sentence */}
          {lineItems.length > 0 && (
            <div className="flex justify-between items-baseline py-0.5">
              <span className="font-sans font-medium capitalize truncate max-w-[200px]">
                {formatSealedUnitSummarySentence(lineItems)}
              </span>
              <span className="font-bold">${totals.glassBefore8PercentTotal.toFixed(2)}</span>
            </div>
          )}

          {/* Attached Window Units */}
          {hasAttachedWindow && (
            <div className="flex justify-between items-baseline py-0.5">
              <span className="font-sans font-medium truncate max-w-[200px]">
                {attachedWindowQuote.summarySentence || attachedWindowQuote.summaryLabel || `Attached Windows (#${attachedWindowQuote.quoteNumber})`}
              </span>
              <span className="font-bold">+${winBase.toFixed(2)}</span>
            </div>
          )}

          {/* Attached Window Jambs & Casing */}
          {hasAttachedWindow && winJC > 0 && (
            <div className="flex justify-between items-baseline py-0.5">
              <span className="font-sans font-medium truncate max-w-[200px]">
                {winJCDescription}
              </span>
              <span className="font-bold">+${winJC.toFixed(2)}</span>
            </div>
          )}

          {/* Attached Door Units (Itemized as Headings) */}
          {hasAttachedDoor && (
            attachedDoorQuote?.lineItems && attachedDoorQuote.lineItems.length > 0 ? (
              attachedDoorQuote.lineItems.map((dItem: any, dIdx: number) => {
                const q = dItem.quantity || 1;
                const heading = formatDoorItemHeading(dItem);
                const itemBase = (dItem.inksterBasePrice || 0) * q;
                return (
                  <div key={dItem.id || dIdx} className="flex justify-between items-baseline py-0.5">
                    <span className="font-sans font-medium truncate max-w-[200px]">
                      {heading}
                    </span>
                    <span className="font-bold">+${itemBase.toFixed(2)}</span>
                  </div>
                );
              })
            ) : (
              <div className="flex justify-between items-baseline py-0.5">
                <span className="font-sans font-medium truncate max-w-[200px]">
                  Attached Doors (#{attachedDoorQuote.quoteNumber})
                </span>
                <span className="font-bold">+${doorMat.toFixed(2)}</span>
              </div>
            )
          )}

          {/* 2. Labour (installation or attached) */}
          {(isInstallation || hasAnyAttached) && (
            <div className="flex justify-between items-baseline py-0.5">
              <span className="font-sans">Labour {hasAnyAttached ? '(all quotes)' : ''}</span>
              <span className="font-semibold">+${combinedLabour.toFixed(2)}</span>
            </div>
          )}

          {/* 3. Miscellaneous */}
          {(isInstallation || hasAnyAttached) && (
            <div className="flex justify-between items-baseline py-0.5">
              <span className="font-sans">Miscellaneous {hasAnyAttached ? '(all quotes)' : ''}</span>
              <span className="font-semibold">+${combinedMisc.toFixed(2)}</span>
            </div>
          )}

          {/* 4. Surcharge (8%) */}
          <div className="flex justify-between items-baseline py-0.5">
            <span className="font-sans">Surcharge {hasAnyAttached ? '(8% on materials)' : '(8%)'}</span>
            <span className="font-semibold">+${combinedSurcharge.toFixed(2)}</span>
          </div>

          {/* Window Promo Discount */}
          {winDiscount > 0 && (
            <div className="flex justify-between items-baseline py-0.5 text-emerald-700 font-semibold">
              <span className="font-sans truncate max-w-[200px]">
                Promo ({winPromoName})
              </span>
              <span className="font-bold">-${winDiscount.toFixed(2)}</span>
            </div>
          )}

          {/* Door Discount */}
          {doorDiscount > 0 && (
            <div className="flex justify-between items-baseline py-0.5 text-emerald-700 font-semibold">
              <span className="font-sans truncate max-w-[200px]">
                10% Door Discount
              </span>
              <span className="font-bold">-${doorDiscount.toFixed(2)}</span>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Service Mode with Dynamic Units Count, e.g. "1 Sealed Unit Service (Labour)" */}
          <div className="flex justify-between items-baseline py-0.5">
            <span className="font-sans font-medium">{getSealedUnitServiceSummaryLabel(lineItems, totals.totalSqft)} (Labour)</span>
            <span className="font-bold">${combinedLabour.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-baseline py-0.5">
            <span className="font-sans">Miscellaneous (Supplies)</span>
            <span className="font-semibold">+${combinedMisc.toFixed(2)}</span>
          </div>
        </>
      )}

      {/* 5. Subtotal */}
      <div className={`flex justify-between items-baseline border-t ${borderColor} pt-0.5 font-bold`}>
        <span className="font-sans">Subtotal</span>
        <span>${combinedSubtotal.toFixed(2)}</span>
      </div>

      {/* 6. Tax */}
      <div className={`flex justify-between items-baseline py-0.5 ${subtextColor}`}>
        <span className="font-sans">
          {hstRate === 8 ? 'HST (8% First Nations)' : hstRate === 0 ? 'Tax (Exempt)' : 'HST (13%)'}
        </span>
        <span>${combinedTax.toFixed(2)}</span>
      </div>

      {/* 7. Total */}
      <div className={`flex justify-between items-baseline border-t-2 ${totalBorderColor} pt-0.5 font-black text-[9pt]`}>
        <span className="font-sans uppercase">Total:</span>
        <span>${grandTotal.toFixed(2)}</span>
      </div>

      {/* 8. 50/50 Deposit */}
      <div className={`grid grid-cols-2 gap-1.5 pt-1 mt-0.5 border-t ${borderColor} font-sans text-center text-[7pt]`}>
        <div className="border border-gray-300 rounded py-0.5 px-1 bg-white">
          <span className="text-gray-500 uppercase block font-bold text-[6pt]">First 50%</span>
          <span className="font-mono font-bold">${fp.toFixed(2)}</span>
        </div>
        <div className="border border-gray-300 rounded py-0.5 px-1 bg-white">
          <span className="text-gray-500 uppercase block font-bold text-[6pt]">Final 50%</span>
          <span className="font-mono font-bold">${sp.toFixed(2)}</span>
        </div>
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
  attachedWindowQuote,
  attachedDoorQuote,
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
                  <th className="py-1.5 px-2">Glass Specs</th>
                  <th className="py-1.5 px-2">Dimension</th>
                  <th className="py-1.5 px-2">Grills</th>
                  <th className="py-1.5 px-2 text-center w-10">Qty</th>
                  <th className="py-1.5 px-2 text-right">Base Price</th>
                  <th className="py-1.5 px-2 text-right">Labour</th>
                  <th className="py-1.5 px-2 text-right">Misc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {lineItems.length === 0 && isService ? (
                  <tr>
                    <td className="py-2 px-2 text-center text-slate-500 font-mono">1</td>
                    <td className="py-2 px-2 font-mono text-slate-400">—</td>
                    <td className="py-2 px-2 font-mono font-bold text-slate-900">{(totals.totalSqft || 0).toFixed(2)} sq ft total</td>
                    <td className="py-2 px-2 text-slate-400 font-mono">—</td>
                    <td className="py-2 px-2 text-center font-bold font-mono">1</td>
                    <td className="py-2 px-2 text-right text-slate-400 font-mono">—</td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-slate-900">${(totals.serviceLabourTotal || 0).toFixed(2)}</td>
                    <td className="py-2 px-2 text-right font-mono text-slate-700">${(totals.miscTotal || 0).toFixed(2)}</td>
                  </tr>
                ) : (
                  lineItems.map((item, idx) => {
                    const minL = labour.labourMinPerUnit ?? 120.0;
                    const labourR = totals.effectiveLabourRate || labour.labourRatePerSqft || 14.4;
                    const miscR = totals.effectiveMiscRate || labour.miscRatePerSqft || 2.4;
                    const unitServiceLabour = Math.max(item.actualSqft * labourR, minL);
                    const totalItemServiceLabour = Math.round(unitServiceLabour * item.quantity * 100) / 100;
                    const totalItemServiceMisc = Math.round(item.actualSqft * miscR * item.quantity * 100) / 100;

                    const unitInstallLabour = item.unitLabour > 0 ? Math.max(item.unitLabour, minL) : Math.max(item.actualSqft * labourR, minL);
                    const totalInstallLabour = Math.round(unitInstallLabour * item.quantity * 100) / 100;

                    const hasGrill = item.rawGrillCost > 0 || Boolean(item.grill);
                    const grillDimText = item.grill?.colsCount && item.grill?.rowsCount
                      ? `${item.grill.colsCount} × ${item.grill.rowsCount}`
                      : '';

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-1.5 px-2 text-center text-slate-500 font-mono font-bold">{idx + 1}</td>

                        {/* Glass Specs: empty in service only */}
                        <td className="py-1.5 px-2">
                          {!isService ? (
                            <>
                              <div className="font-bold text-slate-900">{item.combinationName}</div>
                              <div className="text-[7pt] text-slate-500 capitalize">
                                {item.treatment} · {item.paneType === 'triple' ? 'Triple Pane' : 'Dual Pane'} · {item.thicknessMm}mm
                              </div>
                            </>
                          ) : (
                            <span className="text-slate-400 font-mono">—</span>
                          )}
                        </td>

                        {/* Dimension: e.g. 31" wide x 78" high  16.79 sqft */}
                        <td className="py-1.5 px-2 font-mono">
                          <div className="font-bold text-slate-900 whitespace-nowrap">
                            {item.widthIn}&quot; wide × {item.heightIn}&quot; high
                          </div>
                          <div className="text-[7pt] text-slate-500 font-sans">
                            {item.actualSqft.toFixed(2)} sqft {!isService && item.billableSqft !== Math.round(item.actualSqft) ? `(${item.billableSqft} billable)` : ''}
                          </div>
                        </td>

                        {/* Grills: e.g. 3x5 / Brass grills */}
                        <td className="py-1.5 px-2">
                          {!isService && hasGrill ? (
                            <div>
                              {grillDimText ? (
                                <div className="font-bold text-slate-900 font-mono text-[7.5pt]">
                                  {grillDimText}
                                </div>
                              ) : null}
                              <div className="text-[7pt] text-amber-800 font-semibold truncate">
                                {item.grill?.color ? `${item.grill.color} Grills` : (item.grillDescription || 'Grills')}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-400 font-mono">—</span>
                          )}
                        </td>

                        {/* Qty */}
                        <td className="py-1.5 px-2 text-center font-mono font-bold text-slate-900">{item.quantity}</td>

                        {/* Base Price: empty in service only */}
                        <td className="py-1.5 px-2 text-right font-mono">
                          {!isService ? (
                            <>
                              <div className="font-bold text-slate-950">${Number(item.multipliedTotal ?? (item.multipliedAmount ? item.multipliedAmount * item.quantity : item.lineGlassTotal || 0)).toFixed(2)}</div>
                              <div className="text-[6.5pt] text-slate-500">${Number(item.multipliedAmount || (item.multipliedTotal ? item.multipliedTotal / item.quantity : item.finalUnitPrice || 0)).toFixed(2)}/ea</div>
                            </>
                          ) : (
                            <span className="text-slate-400 font-mono">—</span>
                          )}
                        </td>

                        {/* Labour: min $120 enforced */}
                        <td className="py-1.5 px-2 text-right font-mono">
                          {isService ? (
                            <>
                              <div className="font-bold text-slate-900">${totalItemServiceLabour.toFixed(2)}</div>
                              <div className="text-[6.5pt] text-slate-500">${unitServiceLabour.toFixed(2)}/ea</div>
                            </>
                          ) : isInstallation ? (
                            <>
                              <div className="font-bold text-slate-900">${totalInstallLabour.toFixed(2)}</div>
                              <div className="text-[6.5pt] text-slate-500">${unitInstallLabour.toFixed(2)}/ea</div>
                            </>
                          ) : (
                            <span className="text-slate-400 font-mono">—</span>
                          )}
                        </td>

                        {/* Misc */}
                        <td className="py-1.5 px-2 text-right font-mono">
                          {isService ? (
                            <span className="font-medium text-slate-700">${totalItemServiceMisc.toFixed(2)}</span>
                          ) : isInstallation ? (
                            <span className="font-medium text-slate-700">${Number(item.totalMisc || 0).toFixed(2)}</span>
                          ) : (
                            <span className="text-slate-400 font-mono">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* FULL-WIDTH QUOTATION SUMMARY CARD */}
          <div className="border border-slate-300 rounded p-2.5 bg-slate-50/50 space-y-2">
            <div className="text-[8pt] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1 flex justify-between font-sans">
              <span>Summary</span>
              <span className="font-mono text-[7.5pt] font-bold text-slate-600">
                {isService ? 'Service Pricing' : `${lineItems.reduce((acc, i) => acc + i.quantity, 0)} Units Total`}
              </span>
            </div>

            <div className="grid grid-cols-12 gap-3 items-start">
              {/* Financial Lines Ledger (Left 7 cols) */}
              <div className="col-span-7">
                <CommonSummaryLedger
                  lineItems={lineItems}
                  totals={totals}
                  isInstallation={isInstallation}
                  isService={isService}
                  hstRate={hstRate}
                  firstPayment={firstPayment}
                  secondPayment={secondPayment}
                  attachedWindowQuote={attachedWindowQuote}
                  attachedDoorQuote={attachedDoorQuote}
                  textColor="text-slate-900"
                  subtextColor="text-slate-700"
                  borderColor="border-slate-300"
                  totalBorderColor="border-slate-600"
                />
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
                <th className="py-1 px-1.5 border-r border-gray-300">Glass Specs</th>
                <th className="py-1 px-1.5 border-r border-gray-300">Dimension</th>
                <th className="py-1 px-1.5 border-r border-gray-300">Grills</th>
                <th className="py-1 px-1.5 border-r border-gray-300 text-center w-8">Qty</th>
                <th className="py-1 px-1.5 border-r border-gray-300 text-right">Base Price</th>
                <th className="py-1 px-1.5 border-r border-gray-300 text-right">Labour</th>
                <th className="py-1 px-1.5 text-right">Misc</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.length === 0 && isService ? (
                <tr className="border-b border-gray-300">
                  <td className="py-1 px-1.5 border-r border-gray-300 text-center font-mono">1</td>
                  <td className="py-1 px-1.5 border-r border-gray-300 text-gray-400 font-mono">—</td>
                  <td className="py-1 px-1.5 border-r border-gray-300 font-mono font-bold text-gray-900">{(totals.totalSqft || 0).toFixed(2)} sq ft total</td>
                  <td className="py-1 px-1.5 border-r border-gray-300 text-gray-400 font-mono">—</td>
                  <td className="py-1 px-1.5 border-r border-gray-300 text-center font-bold font-mono">1</td>
                  <td className="py-1 px-1.5 border-r border-gray-300 text-right text-gray-400 font-mono">—</td>
                  <td className="py-1 px-1.5 border-r border-gray-300 text-right font-mono font-bold text-gray-900">${(totals.serviceLabourTotal || 0).toFixed(2)}</td>
                  <td className="py-1 px-1.5 text-right font-mono text-gray-700">${(totals.miscTotal || 0).toFixed(2)}</td>
                </tr>
              ) : (
                lineItems.map((item, idx) => {
                  const minL = labour.labourMinPerUnit ?? 120.0;
                  const labourR = totals.effectiveLabourRate || labour.labourRatePerSqft || 14.4;
                  const miscR = totals.effectiveMiscRate || labour.miscRatePerSqft || 2.4;
                  const unitServiceLabour = Math.max(item.actualSqft * labourR, minL);
                  const totalItemServiceLabour = Math.round(unitServiceLabour * item.quantity * 100) / 100;
                  const totalItemServiceMisc = Math.round(item.actualSqft * miscR * item.quantity * 100) / 100;

                  const unitInstallLabour = item.unitLabour > 0 ? Math.max(item.unitLabour, minL) : Math.max(item.actualSqft * labourR, minL);
                  const totalInstallLabour = Math.round(unitInstallLabour * item.quantity * 100) / 100;

                  const hasGrill = item.rawGrillCost > 0 || Boolean(item.grill);
                  const grillDimText = item.grill?.colsCount && item.grill?.rowsCount
                    ? `${item.grill.colsCount} × ${item.grill.rowsCount}`
                    : '';

                  return (
                    <tr key={item.id} className="border-b border-gray-300">
                      <td className="py-1 px-1.5 border-r border-gray-300 text-center font-mono">{idx + 1}</td>
                      <td className="py-1 px-1.5 border-r border-gray-300">
                        {!isService ? (
                          <>
                            <div className="font-bold text-gray-900">{item.combinationName}</div>
                            <div className="text-[7pt] text-gray-500 capitalize">
                              {item.treatment} · {item.paneType === 'triple' ? 'Triple Pane' : 'Dual Pane'} · {item.thicknessMm}mm
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="py-1 px-1.5 border-r border-gray-300 font-mono">
                        <div className="font-bold text-gray-900 whitespace-nowrap">
                          {item.widthIn}&quot; wide × {item.heightIn}&quot; high
                        </div>
                        <div className="text-[7pt] text-gray-500 font-sans">
                          {item.actualSqft.toFixed(2)} sqft {!isService && item.billableSqft !== Math.round(item.actualSqft) ? `(${item.billableSqft} billable)` : ''}
                        </div>
                      </td>
                      <td className="py-1 px-1.5 border-r border-gray-300">
                        {!isService && hasGrill ? (
                          <div>
                            {grillDimText ? (
                              <div className="font-bold text-gray-900 font-mono text-[7.5pt]">
                                {grillDimText}
                              </div>
                            ) : null}
                            <div className="text-[7pt] text-amber-800 font-semibold truncate">
                              {item.grill?.color ? `${item.grill.color} Grills` : (item.grillDescription || 'Grills')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="py-1 px-1.5 border-r border-gray-300 text-center font-bold font-mono">{item.quantity}</td>
                      <td className="py-1 px-1.5 border-r border-gray-300 text-right font-mono">
                        {!isService ? (
                          <>
                            <div className="font-bold text-gray-900">${Number(item.multipliedTotal ?? (item.multipliedAmount ? item.multipliedAmount * item.quantity : item.lineGlassTotal || 0)).toFixed(2)}</div>
                            <div className="text-[6.5pt] text-gray-500">${Number(item.multipliedAmount || (item.multipliedTotal ? item.multipliedTotal / item.quantity : item.finalUnitPrice || 0)).toFixed(2)}/ea</div>
                          </>
                        ) : (
                          <span className="text-gray-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="py-1 px-1.5 border-r border-gray-300 text-right font-mono">
                        {isService ? (
                          <>
                            <div className="font-bold text-gray-900">${totalItemServiceLabour.toFixed(2)}</div>
                            <div className="text-[6.5pt] text-gray-500">${unitServiceLabour.toFixed(2)}/ea</div>
                          </>
                        ) : isInstallation ? (
                          <>
                            <div className="font-bold text-gray-900">${totalInstallLabour.toFixed(2)}</div>
                            <div className="text-[6.5pt] text-gray-500">${unitInstallLabour.toFixed(2)}/ea</div>
                          </>
                        ) : (
                          <span className="text-gray-400 font-mono">—</span>
                        )}
                      </td>
                      <td className="py-1 px-1.5 text-right font-mono">
                        {isService ? (
                          <span className="font-medium text-gray-700">${totalItemServiceMisc.toFixed(2)}</span>
                        ) : isInstallation ? (
                          <span className="font-medium text-gray-700">${Number(item.totalMisc || 0).toFixed(2)}</span>
                        ) : (
                          <span className="text-gray-400 font-mono">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>

          {/* FULL-WIDTH QUOTATION SUMMARY CARD */}
          <div className="border border-gray-400 rounded p-2 bg-gray-50/50 space-y-2">
            <div className="text-[8pt] font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-0.5 flex justify-between font-sans">
              <span>Summary</span>
              <span className="font-mono text-[7pt] text-gray-500 font-normal">Customer Financial Record</span>
            </div>

            <div className="grid grid-cols-12 gap-3 items-start">
              <div className="col-span-7">
                <CommonSummaryLedger
                  lineItems={lineItems}
                  totals={totals}
                  isInstallation={isInstallation}
                  isService={isService}
                  hstRate={hstRate}
                  firstPayment={firstPayment}
                  secondPayment={secondPayment}
                  attachedWindowQuote={attachedWindowQuote}
                  attachedDoorQuote={attachedDoorQuote}
                  textColor="text-gray-900"
                  subtextColor="text-gray-700"
                  borderColor="border-gray-300"
                  totalBorderColor="border-gray-600"
                />
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
              <span>Summary</span>
              <span className="font-mono text-[7pt] text-zinc-600">Client Billing Record</span>
            </div>

            <div className="grid grid-cols-12 gap-3 items-start">
              {/* Special Notes & Site Instructions (LEFT 5 cols) */}
              <div className="col-span-5 border-r border-zinc-300 pr-3">
                <span className="text-[7pt] uppercase font-bold text-zinc-500 block mb-1 font-sans">
                  Special Notes &amp; Site Instructions
                </span>
                {quoteNotes && quoteNotes.trim() ? (
                  renderRichNotes(quoteNotes, 7.5)
                ) : (
                  <span className="text-zinc-400 text-[7pt] italic">No special instructions recorded.</span>
                )}
              </div>

              {/* Financial Lines Ledger (RIGHT 7 cols) */}
              <div className="col-span-7 pl-1">
                <CommonSummaryLedger
                  lineItems={lineItems}
                  totals={totals}
                  isInstallation={isInstallation}
                  isService={isService}
                  hstRate={hstRate}
                  firstPayment={firstPayment}
                  secondPayment={secondPayment}
                  attachedWindowQuote={attachedWindowQuote}
                  attachedDoorQuote={attachedDoorQuote}
                  textColor="text-zinc-900"
                  subtextColor="text-zinc-700"
                  borderColor="border-zinc-300"
                  totalBorderColor="border-zinc-600"
                />
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
