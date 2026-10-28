'use client';

import React, { useState, useEffect } from 'react';
import { formatMoney, toCents } from '@/lib/promo-logic';

export type QuoteTemplateType = 'modern' | 'executive' | 'cards';

export interface QuoteInvoiceProps {
  customerName?: string;
  quoteNumber?: string;
  windows: any[];
  taxTotals?: any;
  quoteResult?: any;
  activePromo?: { name: string; discount: number } | null;
  basePrice?: number; // cents
  surcharge?: number; // cents
  wantsUpgrade?: boolean;
  shownUpgrade?: number; // cents
  hstRate?: number;
  total?: number; // cents
  beforeTaxDiscount?: number; // cents
  afterDiscount?: number; // cents
  firstPayment?: number; // cents
  secondPayment?: number; // cents
  regionName?: string;
  includeLabourInPromo?: boolean;
  includeMiscInPromo?: boolean;
  includeJCInPromo?: boolean;
  effectiveJC?: number; // cents (custom or calculated)
  effectiveMisc?: number; // cents (custom or calculated)
  effectiveLabour?: number; // cents (custom or calculated)
  template?: QuoteTemplateType;
  fontSize?: number; // px, default 11.5
  spacing?: number; // multiplier, default 1.0
  isInteractivePreview?: boolean;
  quoteNotes?: string;
  preparedBy?: string;
  orientation?: 'portrait' | 'landscape';
  attachedUpgrade?: { title: string; amountPreTaxCents: number } | null;
}

function renderFormattedNotes(notes: string, noteFs: number = 9.5) {
  if (!notes || !notes.trim()) return null;

  // 1. Normalize line breaks across HTML tags:
  // - Remove trailing <br> before closing block tags e.g. <br></div>, <br></p>
  // - Replace <br> with \n
  // - Replace closing block tags (</div>, </p>, </li>) with \n
  // - Replace opening block tags that follow content with \n so unclosed first lines break cleanly
  // - Remove remaining block tags
  // - Replace non-breaking space &nbsp; with regular space
  let cleaned = notes
    .replace(/<br\s*\/?>\s*<\/(div|p|li)>/gi, '</$1>')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(div|p|li)>/gi, '\n')
    .replace(/([^\n])<(div|p|li)[^>]*>/gi, '$1\n')
    .replace(/<(div|p|li)[^>]*>/gi, '')
    .replace(/&nbsp;/gi, ' ');

  // 2. Split by newlines and preserve intentional blank lines (spacing between paragraphs)
  const rawLines = cleaned.split('\n');

  // Strip leading and trailing blank lines
  let start = 0;
  while (start < rawLines.length && !rawLines[start].trim()) {
    start++;
  }
  let end = rawLines.length - 1;
  while (end >= 0 && !rawLines[end].trim()) {
    end--;
  }

  const lines: string[] = [];
  for (let i = start; i <= end; i++) {
    lines.push(rawLines[i].trim());
  }

  if (lines.length === 0) return null;

  return (
    <div className="space-y-0.5 text-[#0f172a] leading-snug font-sans" style={{ fontSize: `${noteFs}px` }}>
      {lines.map((line, idx) => {
        if (!line) {
          // Intentional blank line between paragraphs
          return <div key={idx} className="h-1.5" />;
        }

        // Strip any lingering HTML tags except <b> and <strong>
        const stripped = line.replace(/<(?!\/?(b|strong)\b)[^>]+>/gi, '').trim();
        if (!stripped) return null;

        // Check for bullet point at the start (even if wrapped in <b> or <strong>)
        const isBullet = /^(<b>|<strong>)?\s*(•|-|\*)\s*/i.test(stripped);
        let cleanText = stripped;
        if (isBullet) {
          cleanText = cleanText.replace(/^(<b>|<strong>)\s*(•|-|\*)\s*/i, '$1');
          cleanText = cleanText.replace(/^(•|-|\*)\s*/, '');
        }

        // Parse **bold text**, <b>bold text</b>, and <strong>bold text</strong>
        const parts = cleanText.split(/(\*\*[^*]+\*\*|<b>.*?<\/b>|<strong>.*?<\/strong>)/gi);
        const parsedContent = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={pIdx} className="font-bold text-[#0f172a] print:text-black">
                {part.slice(2, -2)}
              </strong>
            );
          }
          if (part.toLowerCase().startsWith('<b>') && part.toLowerCase().endsWith('</b>')) {
            return (
              <strong key={pIdx} className="font-bold text-[#0f172a] print:text-black">
                {part.slice(3, -4)}
              </strong>
            );
          }
          if (part.toLowerCase().startsWith('<strong>') && part.toLowerCase().endsWith('</strong>')) {
            return (
              <strong key={pIdx} className="font-bold text-[#0f172a] print:text-black">
                {part.slice(8, -9)}
              </strong>
            );
          }
          return <span key={pIdx}>{part}</span>;
        });

        if (isBullet) {
          return (
            <div key={idx} className="flex items-start gap-1.5 pl-0.5 leading-snug">
              <span className="text-[#0f172a] print:text-black font-bold select-none">•</span>
              <div className="flex-1 leading-snug">{parsedContent}</div>
            </div>
          );
        }

        return <div key={idx} className="leading-snug">{parsedContent}</div>;
      })}
    </div>
  );
}

export default function QuoteInvoice({
  customerName,
  quoteNumber,
  windows = [],
  taxTotals,
  quoteResult,
  activePromo,
  basePrice = 0,
  surcharge = 0,
  wantsUpgrade = false,
  shownUpgrade = 0,
  hstRate = 13,
  total = 0,
  beforeTaxDiscount = 0,
  afterDiscount = 0,
  firstPayment = 0,
  secondPayment = 0,
  regionName,
  includeLabourInPromo = true,
  includeMiscInPromo = true,
  includeJCInPromo = true,
  effectiveJC,
  effectiveMisc,
  effectiveLabour,
  template = 'modern',
  fontSize = 11.5,
  spacing = 1.0,
  isInteractivePreview = false,
  quoteNotes = '',
  preparedBy = '',
  orientation = 'portrait',
  attachedUpgrade = null,
}: QuoteInvoiceProps) {
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }));
  }, []);

  if (!taxTotals && windows.length === 0) return null;

  // Travel items - only non-zero items that employee actually entered
  const travelItems: { label: string; amount: number }[] = [];
  if (taxTotals?.km > 0) {
    travelItems.push({
      label: `Vehicle travel (${taxTotals.km} km @ $${taxTotals.vehicleRate?.toFixed(2) || '0.98'}/km)`,
      amount: (taxTotals.vehicle || 0) * 100,
    });
  }
  if (taxTotals?.hrs > 0 && taxTotals?.crew && taxTotals.crew !== 'none') {
    travelItems.push({
      label: `Crew travel (${taxTotals.crew} crew × ${taxTotals.hrs}h @ $${taxTotals.crewRate || 0}/h)`,
      amount: (taxTotals.crewTravel || 0) * 100,
    });
  }
  if (taxTotals?.setup > 0) {
    travelItems.push({
      label: 'Per-job set-up fee',
      amount: (taxTotals.setup || 0) * 100,
    });
  }
  if (taxTotals?.fixedSetupFee > 0) {
    travelItems.push({
      label: `Job Set Up Fee (${regionName || 'Standard'})`,
      amount: (taxTotals.fixedSetupFee || 0) * 100,
    });
  }
  if (taxTotals?.baseTravelFee > 0) {
    travelItems.push({
      label: 'Base travel fee',
      amount: (taxTotals.baseTravelFee || 0) * 100,
    });
  }

  // Jamb and casing items
  const jcItems: { label: string; amount: number }[] = [];
  if (taxTotals?.selectedJamb && (taxTotals.selectedJamb.total > 0 || taxTotals.selectedJamb.rate > 0)) {
    jcItems.push({
      label: taxTotals.selectedJamb.name,
      amount: (taxTotals.selectedJamb.total || 0) * 100,
    });
  }
  if (taxTotals?.selectedCasing && (taxTotals.selectedCasing.total > 0 || taxTotals.selectedCasing.rate > 0)) {
    jcItems.push({
      label: taxTotals.selectedCasing.name,
      amount: (taxTotals.selectedCasing.total || 0) * 100,
    });
  }

  // Extras / Add-ons - only if qty > 0
  const extrasList = taxTotals?.selectedAddons || [];

  type DetailedExtraItem = {
    key: string;
    label: string;
    qty: number;
    amount: number; // in cents
  };

  const detailedExtrasList: DetailedExtraItem[] = [];
  extrasList.forEach((a: any, idx: number) => {
    const isDripEdge = (a.id && String(a.id).toLowerCase().includes('drip')) ||
                       (a.label && String(a.label).toLowerCase().includes('drip'));
    const labCents = Math.round((Number(a.lab) || 0) * 100);
    const miscCents = Math.round((Number(a.misc) || 0) * 100);

    if (labCents > 0 && miscCents > 0) {
      detailedExtrasList.push({
        key: `${a.id || idx}-lab`,
        label: `${a.label} — Labour`,
        qty: a.qty || 1,
        amount: labCents,
      });
      detailedExtrasList.push({
        key: `${a.id || idx}-misc`,
        label: `${a.label} — Materials / Misc`,
        qty: a.qty || 1,
        amount: miscCents,
      });
    } else if (labCents > 0) {
      detailedExtrasList.push({
        key: `${a.id || idx}-lab`,
        label: `${a.label} — Labour`,
        qty: a.qty || 1,
        amount: labCents,
      });
    } else if (miscCents > 0) {
      detailedExtrasList.push({
        key: `${a.id || idx}-misc`,
        label: `${a.label} — Materials / Misc`,
        qty: a.qty || 1,
        amount: miscCents,
      });
    } else {
      const combinedCents = Math.round(((Number(a.lab) || 0) + (Number(a.misc) || 0)) * 100);
      detailedExtrasList.push({
        key: `${a.id || idx}-all`,
        label: a.label,
        qty: a.qty || 1,
        amount: combinedCents,
      });
    }
  });

  const taxJCCents = includeJCInPromo
    ? (effectiveJC !== undefined && effectiveJC > 0
        ? effectiveJC
        : Math.round(Number(taxTotals?.finalJC ?? taxTotals?.jcTotal ?? taxTotals?.jc ?? 0) * 100))
    : 0;
  const taxMiscCents = includeMiscInPromo
    ? (effectiveMisc !== undefined && effectiveMisc > 0
        ? effectiveMisc
        : Math.round(Number(taxTotals?.finalMisc ?? taxTotals?.miscTotal ?? 0) * 100))
    : 0;
  const taxLabourCents = includeLabourInPromo
    ? (effectiveLabour !== undefined && effectiveLabour > 0
        ? effectiveLabour
        : Math.round(Number(taxTotals?.finalLabour ?? taxTotals?.labourTotal ?? taxTotals?.labourWindows ?? 0) * 100))
    : 0;
  const promoDiscountCents = activePromo?.discount || 0;
  const monthlyDiscountCents = Math.round((taxTotals?.discount || 0) * 100);

  // Compute exact subtotal from component lines:
  const lineItemsSubtotalCents = Math.max(0,
    basePrice +
    surcharge +
    taxJCCents +
    taxMiscCents +
    taxLabourCents -
    promoDiscountCents -
    monthlyDiscountCents
  );

  const subtotalCents = (afterDiscount > 0 && Math.abs(afterDiscount - lineItemsSubtotalCents) <= 10)
    ? afterDiscount
    : lineItemsSubtotalCents;

  let hstAmountCents = 0;
  let hstLabel = `HST (${hstRate}%)`;
  if (hstRate === 13) {
    hstAmountCents = Math.round(subtotalCents * 0.13);
    hstLabel = 'HST (13%)';
  } else if (hstRate === 8) {
    // 8% Provincial Point-of-Sale Exemption on materials (5% GST on materials, 13% on labour)
    const matCents = Math.max(0, (basePrice + surcharge - (activePromo?.discount || 0)) + taxJCCents);
    const srvCents = Math.max(0, subtotalCents - matCents);
    hstAmountCents = Math.round(matCents * 0.05) + Math.round(srvCents * 0.13);
    hstLabel = 'HST (8% Exempt on Materials)';
  }
  const displayTotalCents = (total > 0 && Math.abs(total - (subtotalCents + hstAmountCents)) <= 10)
    ? total
    : (subtotalCents + hstAmountCents);

  const displayFirstPayment = (firstPayment > 0 && Math.abs(firstPayment - Math.floor(displayTotalCents / 2)) <= 5)
    ? firstPayment
    : Math.floor(displayTotalCents / 2);
  const displaySecondPayment = displayTotalCents - displayFirstPayment;

  const isSupplyOnly = Boolean(
    taxTotals?.isSupplyOnly ||
    regionName?.toLowerCase().includes('supply') ||
    taxTotals?.regionName?.toLowerCase().includes('supply')
  );

  const hasJambs = Boolean(
    (taxTotals?.selectedJamb && (Number(taxTotals.selectedJamb.rate) > 0 || Number(taxTotals.selectedJamb.total) > 0)) ||
    (taxTotals?.jambTot && Number(taxTotals.jambTot) > 0) ||
    (taxTotals?.jambRate && Number(taxTotals.jambRate) > 0) ||
    (taxTotals?.jambId && taxTotals.jambId !== 'none')
  );

  const hasCasing = Boolean(
    (taxTotals?.selectedCasing && (Number(taxTotals.selectedCasing.rate) > 0 || Number(taxTotals.selectedCasing.total) > 0)) ||
    (taxTotals?.casingTot && Number(taxTotals.casingTot) > 0) ||
    (taxTotals?.casingRate && Number(taxTotals.casingRate) > 0) ||
    (taxTotals?.casingId && taxTotals.casingId !== 'none')
  );

  const jcLabel = (() => {
    if (hasJambs && !hasCasing) {
      return isSupplyOnly ? 'Jambs Only (Loose)' : 'Jambs Only';
    }
    if (!hasJambs && hasCasing) {
      return isSupplyOnly ? 'Casing Only (Loose)' : 'Casing Only';
    }
    return isSupplyOnly ? 'Jambs & Casing (Loose)' : 'Jambs and Casings';
  })();

  // Clean promo name to prevent raw MongoDB ObjectIDs from displaying on print/invoices
  const resolvedPromoName = (() => {
    const raw = activePromo?.name?.trim();
    if (!raw) return 'Promotion Discount';
    // If raw matches a 24-char hex Mongo ObjectId or begins with one, fall back to quoteResult or 'Promotion Discount'
    if (/^[0-9a-fA-F]{24}$/.test(raw) || /^[0-9a-fA-F]{24}/.test(raw)) {
      return quoteResult?.promoName || 'Promotion Discount';
    }
    return raw;
  })();

  // Proportional Font Scaling System:
  // Scales titles, headings, table cells, and notes in sync with the font slider
  const baseFs = fontSize; // default 11.5px
  const titleFs = Math.max(14, Math.round(baseFs * 1.55));
  const h2Fs = Math.max(10.5, Math.round(baseFs * 1.1 * 10) / 10);
  const thFs = Math.max(9, Math.round(baseFs * 0.92 * 10) / 10);
  const bodyFs = baseFs;
  const smallFs = Math.max(8.5, Math.round(baseFs * 0.85 * 10) / 10);
  const microFs = Math.max(7.5, Math.round(baseFs * 0.76 * 10) / 10);

  // Spacing helpers
  const rowPy = Math.max(2, Math.round(4 * spacing));
  const cardGap = Math.max(4, Math.round(6 * spacing));
  const sectionMb = Math.max(6, Math.round(10 * spacing));


  // Window Pane Breakdown (Dual Pane vs. Triple Pane & White vs. Painted)
  type WindowGroup = {
    key: string;
    pane: 'Dual' | 'Triple';
    color: 'White' | 'Painted';
    qty: number;
    baseCents: number;
  };

  let dW = 0; // dual white
  let tW = 0; // triple white
  let dP = 0; // dual painted
  let tP = 0; // triple painted
  let totalBaseCentsCalculated = 0;

  if (Array.isArray(windows) && windows.length > 0) {
    windows.forEach((w) => {
      const q = Math.max(1, Number(w.qty) || 1);
      const itemBase = toCents(w.base);
      const isTriple = Number(w.triple) > 0 || toCents(w.triple) > 0;
      const isPainted = w.color && w.color.toLowerCase() === 'painted';

      if (isPainted) {
        if (isTriple) tP += q;
        else dP += q;
      } else {
        if (isTriple) tW += q;
        else dW += q;
      }
      totalBaseCentsCalculated += itemBase;
    });
  }

  const totalQty = dW + tW + dP + tP;
  let paintedPart = '';
  if (dP > 0 && tP > 0) {
    paintedPart = `${dP} dual & ${tP} triple pane painted`;
  } else if (dP > 0) {
    paintedPart = `${dP} dual pane painted`;
  } else if (tP > 0) {
    paintedPart = `${tP} triple pane painted`;
  }

  let whitePart = '';
  if (dW > 0 && tW > 0) {
    whitePart = `${dW} dual & ${tW} triple pane white`;
  } else if (dW > 0) {
    whitePart = `${dW} dual pane white`;
  } else if (tW > 0) {
    whitePart = `${tW} triple pane white`;
  }

  const plural = totalQty > 1 ? 'windows' : 'window';
  let windowSummarySentence = '';
  if (paintedPart && whitePart) {
    const separator = paintedPart.includes('&') || whitePart.includes('&') ? ', ' : ' and ';
    windowSummarySentence = `${paintedPart}${separator}${whitePart} ${plural}`;
  } else if (paintedPart) {
    windowSummarySentence = `${paintedPart} ${plural}`;
  } else if (whitePart) {
    windowSummarySentence = `${whitePart} ${plural}`;
  } else {
    windowSummarySentence = 'Base price of windows';
  }

  const totalWindowBaseCents = totalBaseCentsCalculated > 0 ? totalBaseCentsCalculated : (basePrice > 0 ? basePrice : 0);

  const renderWindowBasePriceRows = (textColor: string = 'text-[#0f172a]') => {
    return (
      <tr className="border-b border-[#e2e8f0]">
        <td className={`py-1 ${textColor} font-medium capitalize`}>
          {windowSummarySentence}
        </td>
        <td className={`py-1 text-right font-mono font-bold ${textColor}`}>
          {formatMoney(totalWindowBaseCents)}
        </td>
      </tr>
    );
  };

  const isLandscape = orientation === 'landscape';

  // Outer container classes
  const containerClass = isInteractivePreview
    ? `w-full ${isLandscape ? 'max-w-[10.5in]' : 'max-w-[8in]'} mx-auto bg-white text-[#1c2430] p-4 shadow-xl border border-border/40 select-none print:shadow-none print:border-none print:p-0 print:m-0`
    : `background-quote-invoice hidden print:block w-full ${isLandscape ? 'max-w-[10.5in]' : 'max-w-[8in]'} mx-auto bg-white text-[#1c2430] p-4 text-[11.5px] leading-tight select-none`;

  return (
    <div
      id="printable-invoice"
      className={containerClass}
      style={{ fontSize: `${fontSize}px` }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        @media print {
          @page {
            size: letter ${isLandscape ? 'landscape' : 'portrait'};
            margin: 0.25in;
          }
          html, body {
            width: ${isLandscape ? '11in' : '8.5in'} !important;
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
            width: ${isLandscape ? '10.5in' : '8in'} !important;
            max-width: ${isLandscape ? '10.5in' : '8in'} !important;
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
      ` }} />

      {/* ============================================================== */}
      {/* TEMPLATE A: MODERN JOB CARD (STREAMLINED LIST)                 */}
      {/* ============================================================== */}
      {template === 'modern' && (
        <>
          {/* Header: Standardized Architectural Header */}
          <div className="border-t-2 border-b-2 border-[#0f172a] py-2 mb-2.5">
            <div className="flex justify-between items-baseline">
              <div>
                <h1 style={{ fontSize: `${titleFs}px` }} className="font-black tracking-tight text-[#0f172a] m-0 uppercase leading-none">
                  The Window &amp; Door Store
                </h1>
                <div style={{ fontSize: `${smallFs}px` }} className="text-[#334155] font-bold uppercase tracking-wider mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>{isSupplyOnly ? 'Supply Only Window Quotation' : 'Window & Labour Quote'}</span>
                </div>
              </div>
              <div className="text-right">
                <div style={{ fontSize: `${h2Fs}px` }} className="font-mono font-black text-[#0f172a]">
                  {quoteNumber || 'REF-QUOTE'}
                </div>
                <div style={{ fontSize: `${smallFs}px` }} className="text-[#334155] font-semibold" suppressHydrationWarning>
                  {currentDate}
                </div>
              </div>
            </div>

            {/* Compact Inline Customer & Region Bar */}
            {(customerName || regionName || preparedBy) && (
              <div style={{ fontSize: `${bodyFs}px` }} className="mt-1 pt-1 border-t border-[#cbd5e1] flex justify-between items-center text-[#0f172a] flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  {customerName && (
                    <div>
                      <span className="text-[#334155] uppercase font-bold text-[9px] mr-1">Client:</span>
                      <span className="font-black text-[#0f172a]">{customerName}</span>
                    </div>
                  )}
                  {regionName && (
                    <div>
                      <span className="text-[#334155] uppercase font-bold text-[9px] mr-1">Region:</span>
                      <span className="font-bold text-[#0f172a]">{regionName}</span>
                    </div>
                  )}
                </div>
                {preparedBy && (
                  <div>
                    <span className="text-[#334155] uppercase font-bold text-[9px] mr-1">Prepared By:</span>
                    <span className="font-bold text-[#0f172a]">{preparedBy}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Windows Table (Single-line per window) */}
          <div style={{ marginBottom: `${sectionMb}px` }}>
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-[#0f172a] uppercase tracking-wider text-[#0f172a] bg-white font-bold" style={{ fontSize: `${thFs}px` }}>
                  <th className="py-1 px-1.5 text-left w-[5%]">#</th>
                  <th className={`py-1 px-1.5 text-left ${isSupplyOnly ? 'w-[62%]' : 'w-[30%]'}`}>Window (Size W × H)</th>
                  <th className={`py-1 px-1.5 text-center ${isSupplyOnly ? 'w-[10%]' : 'w-[8%]'}`}>Qty</th>
                  <th className={`py-1 px-1.5 text-right font-mono ${isSupplyOnly ? 'w-[23%]' : 'w-[19%]'}`}>Base Price</th>
                  {!isSupplyOnly && (
                    <>
                      <th className="py-1 px-1.5 text-right font-mono w-[19%]">Labour</th>
                      <th className="py-1 px-1.5 text-right font-mono w-[19%]">Misc</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody style={{ fontSize: `${bodyFs}px` }}>
                {windows.map((w, i) => {
                  const line = taxTotals?.lines?.[i];
                  const qty = Number(w.qty) || 1;
                  const totalItemBaseCents = toCents(w.base);
                  const unitBaseCents = qty > 0 ? Math.round(totalItemBaseCents / qty) : totalItemBaseCents;
                  const itemLabDollars = line?.lab ?? 0;
                  const itemMiscDollars = line?.misc ?? 0;

                  return (
                    <tr key={w.id || i} className="border-b border-[#cbd5e1] bg-white">
                      <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 text-[#334155] font-semibold">{i + 1}</td>
                      <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 font-bold text-[#0f172a]">
                        {w.w && w.h ? `${w.w}" × ${w.h}"` : 'Custom Window'}
                      </td>
                      <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 text-center font-bold text-[#0f172a]">{qty}</td>
                      <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 text-right font-mono">
                        <span className="font-bold text-[#0f172a]">{formatMoney(totalItemBaseCents)}</span>
                        {qty > 1 && (
                          <span style={{ fontSize: `${microFs}px` }} className="text-[#334155] block font-sans font-normal">({formatMoney(unitBaseCents)} ea)</span>
                        )}
                      </td>
                      {!isSupplyOnly && (
                        <>
                          <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 text-right font-mono text-[#334155]">
                            {itemLabDollars > 0 ? formatMoney(itemLabDollars * 100) : '—'}
                          </td>
                          <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 text-right font-mono text-[#334155]">
                            {itemMiscDollars > 0 ? formatMoney(itemMiscDollars * 100) : '—'}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Two-Column Layout (Left: Details / Right: Financial Summary) */}
          <div className="grid grid-cols-[1.1fr_1.15fr] gap-4 items-start border-t border-[#cbd5e1] pt-2">

            {/* Left Column */}
            <div className="space-y-2">
              {/* Travel & Set-up Breakdown */}
              {travelItems.length > 0 && (
                <div>
                  <div style={{ fontSize: `${smallFs}px` }} className="font-bold uppercase tracking-wider text-[#0f172a] mb-0.5 pb-0.5 border-b border-[#cbd5e1]">
                    Travel &amp; Set-up Details
                  </div>
                  <table className="w-full border-collapse" style={{ fontSize: `${smallFs}px` }}>
                    <tbody>
                      {travelItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#e2e8f0]">
                          <td className="py-0.5 text-[#1e293b] font-medium">{item.label}</td>
                          <td className="py-0.5 text-right font-mono font-bold text-[#0f172a]">{formatMoney(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Jamb & Casing Breakdown */}
              {jcItems.length > 0 && (
                <div>
                  <div style={{ fontSize: `${smallFs}px` }} className="font-bold uppercase tracking-wider text-[#0f172a] mb-0.5 pb-0.5 border-b border-[#cbd5e1]">
                    Jamb &amp; Casing Specifications
                  </div>
                  <table className="w-full border-collapse" style={{ fontSize: `${smallFs}px` }}>
                    <tbody>
                      {jcItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#e2e8f0]">
                          <td className="py-0.5 text-[#1e293b] font-medium">{item.label}</td>
                          <td className="py-0.5 text-right font-mono font-bold text-[#0f172a]">{formatMoney(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Extras Breakdown */}
              {detailedExtrasList.length > 0 && (
                <div>
                  <div style={{ fontSize: `${smallFs}px` }} className="font-bold uppercase tracking-wider text-[#0f172a] mb-0.5 pb-0.5 border-b border-[#cbd5e1]">
                    Extras &amp; Add-ons
                  </div>
                  <table className="w-full border-collapse" style={{ fontSize: `${smallFs}px` }}>
                    <tbody>
                      {detailedExtrasList.map((item) => (
                        <tr key={item.key} className="border-b border-[#e2e8f0]">
                          <td className="py-0.5 text-[#1e293b] font-medium">{item.label} (×{item.qty})</td>
                          <td className="py-0.5 text-right font-mono font-bold text-[#0f172a]">{formatMoney(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Optional 5-Year Labour Upgrade Callout */}
              {wantsUpgrade && shownUpgrade > 0 && !isSupplyOnly && (
                <div className="p-2 bg-white border border-emerald-600 rounded text-[#0f172a]">
                  <div style={{ fontSize: `${smallFs}px` }} className="font-bold uppercase tracking-wider flex justify-between items-center text-[#0f172a]">
                    <span>Optional 5-Year Labour Upgrade</span>
                    <span className="font-mono text-emerald-700 font-bold">+{formatMoney(shownUpgrade)}</span>
                  </div>
                  <div style={{ fontSize: `${microFs}px` }} className="text-[#334155] mt-0.5">
                    Optional extended labour warranty coverage. Not included in quote total.
                  </div>
                </div>
              )}

              {/* Optional Window Upgrade Offer */}
              {attachedUpgrade && attachedUpgrade.amountPreTaxCents > 0 && (
                <div className="p-2 bg-white border border-[#d97706] rounded text-[#0f172a]">
                  <div style={{ fontSize: `${smallFs}px` }} className="font-bold uppercase tracking-wider flex justify-between items-center text-[#0f172a]">
                    <span>Optional Upgrade Offer</span>
                    <span className="font-mono text-[#b45309] font-bold">+{formatMoney(attachedUpgrade.amountPreTaxCents)}</span>
                  </div>
                  <div style={{ fontSize: `${microFs}px` }} className="text-[#334155] mt-0.5">
                    {attachedUpgrade.title} adds {formatMoney(attachedUpgrade.amountPreTaxCents)}
                  </div>
                </div>
              )}

              {/* Optional Employee Quote Notes */}
              {quoteNotes && quoteNotes.trim() && (
                <div className="p-2 bg-white border border-[#cbd5e1] rounded text-[#0f172a] space-y-0.5">
                  <div style={{ fontSize: `${smallFs}px` }} className="font-bold text-[#0f172a] uppercase tracking-wider mb-0.5 pb-0.5 border-b border-[#cbd5e1]">
                    Special Instructions &amp; Notes
                  </div>
                  {renderFormattedNotes(quoteNotes, smallFs)}
                </div>
              )}
            </div>

            {/* Right Column: Financial Summary */}
            <div>
              <div style={{ fontSize: `${h2Fs}px` }} className="font-bold uppercase tracking-wider text-[#0f172a] mb-1 pb-0.5 border-b-[1.5px] border-[#0f172a]">
                Summary
              </div>

              <table className="w-full border-collapse" style={{ fontSize: `${bodyFs}px` }}>
                <tbody>
                  {renderWindowBasePriceRows('text-[#0f172a]')}

                  {taxJCCents > 0 && (
                    <tr className="border-b border-[#e2e8f0]">
                      <td className="py-1 text-[#0f172a] font-medium">
                        {jcLabel}
                      </td>
                      <td className="py-1 text-right font-mono font-bold text-[#0f172a]">{formatMoney(taxJCCents)}</td>
                    </tr>
                  )}

                  {taxMiscCents > 0 && (
                    <tr className="border-b border-[#e2e8f0]">
                      <td className="py-1 text-[#0f172a] font-medium">Miscellaneous</td>
                      <td className="py-1 text-right font-mono font-bold text-[#0f172a]">{formatMoney(taxMiscCents)}</td>
                    </tr>
                  )}

                  {taxLabourCents > 0 && (
                    <tr className="border-b border-[#e2e8f0]">
                      <td className="py-1 text-[#0f172a] font-medium">
                        Labour <span style={{ fontSize: `${smallFs}px` }} className="text-[#334155]">(incl. installation &amp; travel)</span>
                      </td>
                      <td className="py-1 text-right font-mono font-bold text-[#0f172a]">{formatMoney(taxLabourCents)}</td>
                    </tr>
                  )}

                  {surcharge > 0 && (
                    <tr className="border-b border-[#e2e8f0]">
                      <td className="py-1 text-[#0f172a] font-medium">Surcharge</td>
                      <td className="py-1 text-right font-mono font-bold text-[#0f172a]">+{formatMoney(surcharge)}</td>
                    </tr>
                  )}

                  {promoDiscountCents > 0 && (
                    <tr className="border-b border-[#cbd5e1] bg-white text-emerald-900 font-semibold">
                      <td className="py-1 pl-1">
                        <span style={{ fontSize: `${microFs}px` }} className="uppercase font-bold tracking-wider text-emerald-700 block">Promo Applied:</span>
                        {resolvedPromoName}
                      </td>
                      <td className="py-1 text-right font-mono text-emerald-700 font-bold pr-1">
                        −{formatMoney(promoDiscountCents)}
                      </td>
                    </tr>
                  )}

                  {monthlyDiscountCents > 0 && (
                    <tr className="border-b border-[#e2e8f0] text-emerald-800 font-semibold">
                      <td className="py-1">Monthly Discount</td>
                      <td className="py-1 text-right font-mono">−{formatMoney(monthlyDiscountCents)}</td>
                    </tr>
                  )}

                  <tr className="border-t-2 border-[#cbd5e1] border-b border-[#cbd5e1] bg-[#f8fafc]/80 font-bold text-[#0f172a]">
                    <td className="py-1 text-[#0f172a]">Subtotal</td>
                    <td className="py-1 text-right font-mono font-bold text-[#0f172a]">{formatMoney(subtotalCents)}</td>
                  </tr>

                  {hstRate > 0 && (
                    <tr className="border-b border-[#cbd5e1]">
                      <td className="py-1 text-[#334155] font-medium">{hstLabel}</td>
                      <td className="py-1 text-right font-mono font-bold text-[#0f172a]">{formatMoney(hstAmountCents)}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* 8. Total */}
              <div className="border-2 border-[#0f172a] bg-white text-[#0f172a] rounded p-2 flex justify-between items-center font-extrabold mt-2">
                <span style={{ fontSize: `${h2Fs}px` }} className="tracking-wide uppercase text-[#0f172a]">Total</span>
                <span style={{ fontSize: `${Math.round(baseFs * 1.35)}px` }} className="font-mono font-black text-[#0f172a]">{formatMoney(displayTotalCents)}</span>
              </div>

              {/* 50% Deposit & Final 50% Balance */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-1.5 border-t border-[#cbd5e1]">
                <div className="bg-white p-1.5 rounded border border-[#cbd5e1]">
                  <div style={{ fontSize: `${microFs}px` }} className="text-[#334155] uppercase tracking-wider font-semibold">50% Deposit</div>
                  <div style={{ fontSize: `${bodyFs}px` }} className="font-mono font-bold text-[#0f172a] mt-0.5">{formatMoney(displayFirstPayment)}</div>
                </div>
                <div className="bg-white p-1.5 rounded border border-[#cbd5e1]">
                  <div style={{ fontSize: `${microFs}px` }} className="text-[#334155] uppercase tracking-wider font-semibold">Final 50% Balance</div>
                  <div style={{ fontSize: `${bodyFs}px` }} className="font-mono font-bold text-[#0f172a] mt-0.5">{formatMoney(displaySecondPayment)}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* TEMPLATE B: EXECUTIVE OFFICE LEDGER (SPACE-EFFICIENT OFFICE)   */}
      {/* ============================================================== */}
      {template === 'executive' && (
        <>
          {/* Executive Header: Compact, Architectural Office Ledger */}
          <div className="border-t-2 border-b-2 border-[#0f172a] py-2 mb-2.5">
            <div className="flex justify-between items-baseline">
              <div>
                <h1 style={{ fontSize: `${titleFs}px` }} className="font-black tracking-tight text-[#0f172a] m-0 uppercase leading-none">
                  The Window &amp; Door Store
                </h1>
                <div style={{ fontSize: `${smallFs}px` }} className="text-[#334155] font-bold uppercase tracking-wider mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>{isSupplyOnly ? 'Supply Only Window Quotation' : 'Window & Labour Quote'}</span>
                </div>
              </div>
              <div className="text-right">
                <div style={{ fontSize: `${h2Fs}px` }} className="font-mono font-black text-[#0f172a]">
                  {quoteNumber || 'REF-QUOTE'}
                </div>
                <div style={{ fontSize: `${smallFs}px` }} className="text-[#334155] font-semibold" suppressHydrationWarning>
                  {currentDate}
                </div>
              </div>
            </div>

            {/* Compact Inline Customer & Region Bar */}
            {(customerName || regionName || preparedBy) && (
              <div style={{ fontSize: `${bodyFs}px` }} className="mt-1 pt-1 border-t border-[#cbd5e1] flex justify-between items-center text-[#0f172a] flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  {customerName && (
                    <div>
                      <span className="text-[#334155] uppercase font-bold text-[9px] mr-1">Client:</span>
                      <span className="font-black text-[#0f172a]">{customerName}</span>
                    </div>
                  )}
                  {regionName && (
                    <div>
                      <span className="text-[#334155] uppercase font-bold text-[9px] mr-1">Region:</span>
                      <span className="font-bold text-[#0f172a]">{regionName}</span>
                    </div>
                  )}
                </div>
                {preparedBy && (
                  <div>
                    <span className="text-[#334155] uppercase font-bold text-[9px] mr-1">Prepared By:</span>
                    <span className="font-bold text-[#0f172a]">{preparedBy}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Itemized Windows Schedule - Compact Architectural Ledger Table */}
          <div style={{ marginBottom: `${sectionMb}px` }}>
            <table className="w-full border-collapse border border-[#cbd5e1]">
              <thead>
                <tr className="bg-white border-b-2 border-[#0f172a] text-[#0f172a] font-bold uppercase tracking-wider" style={{ fontSize: `${thFs}px` }}>
                  <th className="py-1 px-2 text-left border-r border-[#cbd5e1] w-[5%]">#</th>
                  <th className={`py-1 px-2 text-left border-r border-[#cbd5e1] ${isSupplyOnly ? 'w-[62%]' : 'w-[30%]'}`}>Window Size (W × H)</th>
                  <th className={`py-1 px-2 text-center border-r border-[#cbd5e1] ${isSupplyOnly ? 'w-[10%]' : 'w-[8%]'}`}>Qty</th>
                  <th className={`py-1 px-2 text-right font-mono ${!isSupplyOnly ? 'border-r border-[#cbd5e1]' : ''} ${isSupplyOnly ? 'w-[23%]' : 'w-[19%]'}`}>Base Price</th>
                  {!isSupplyOnly && (
                    <>
                      <th className="py-1 px-2 text-right border-r border-[#cbd5e1] font-mono w-[19%]">Labour</th>
                      <th className="py-1 px-2 text-right font-mono w-[19%]">Misc</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody style={{ fontSize: `${bodyFs}px` }}>
                {windows.map((w, i) => {
                  const line = taxTotals?.lines?.[i];
                  const qty = Number(w.qty) || 1;
                  const totalItemBaseCents = toCents(w.base);
                  const itemLabDollars = line?.lab ?? 0;
                  const itemMiscDollars = line?.misc ?? 0;

                  return (
                    <tr key={w.id || i} className="border-b border-[#cbd5e1] bg-white">
                      <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-2 text-[#334155] font-mono font-bold border-r border-[#cbd5e1]">
                        {i + 1}
                      </td>
                      <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-2 font-bold text-[#0f172a] border-r border-[#cbd5e1]">
                        {w.w && w.h ? `${w.w}" × ${w.h}"` : 'Standard'}
                      </td>
                      <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-2 text-center font-bold text-[#0f172a] border-r border-[#cbd5e1]">
                        {qty}
                      </td>
                      <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className={`px-2 text-right font-mono font-bold text-[#0f172a] ${!isSupplyOnly ? 'border-r border-[#cbd5e1]' : ''}`}>
                        {formatMoney(totalItemBaseCents)}
                      </td>
                      {!isSupplyOnly && (
                        <>
                          <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-2 text-right font-mono text-[#334155] border-r border-[#cbd5e1]">
                            {itemLabDollars > 0 ? formatMoney(itemLabDollars * 100) : '—'}
                          </td>
                          <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-2 text-right font-mono text-[#334155]">
                            {itemMiscDollars > 0 ? formatMoney(itemMiscDollars * 100) : '—'}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Bottom Grid: Same Compact Scope & Accounting as Modern List, Distinct Ledger Design */}
          <div className="grid grid-cols-[1.1fr_1.15fr] gap-4 items-start border-t-2 border-[#0f172a] pt-2">
            {/* Left: Project Specifications & Scope */}
            <div className="space-y-2">
              {travelItems.length > 0 && (
                <div>
                  <div style={{ fontSize: `${smallFs}px` }} className="font-bold uppercase tracking-wider text-[#0f172a] mb-0.5 pb-0.5 border-b border-[#cbd5e1]">
                    Travel &amp; Logistics Details
                  </div>
                  <table className="w-full border-collapse" style={{ fontSize: `${smallFs}px` }}>
                    <tbody>
                      {travelItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#e2e8f0]">
                          <td className="py-0.5 text-[#1e293b] font-medium">{item.label}</td>
                          <td className="py-0.5 text-right font-mono font-bold text-[#0f172a]">{formatMoney(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {jcItems.length > 0 && (
                <div>
                  <div style={{ fontSize: `${smallFs}px` }} className="font-bold uppercase tracking-wider text-[#0f172a] mb-0.5 pb-0.5 border-b border-[#cbd5e1]">
                    Jambs &amp; Casing
                  </div>
                  <table className="w-full border-collapse" style={{ fontSize: `${smallFs}px` }}>
                    <tbody>
                      {jcItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-[#e2e8f0]">
                          <td className="py-0.5 text-[#1e293b] font-medium">{item.label}</td>
                          <td className="py-0.5 text-right font-mono font-bold text-[#0f172a]">{formatMoney(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {detailedExtrasList.length > 0 && (
                <div>
                  <div style={{ fontSize: `${smallFs}px` }} className="font-bold uppercase tracking-wider text-[#0f172a] mb-0.5 pb-0.5 border-b border-[#cbd5e1]">
                    Extras &amp; Add-ons
                  </div>
                  <table className="w-full border-collapse" style={{ fontSize: `${smallFs}px` }}>
                    <tbody>
                      {detailedExtrasList.map((item) => (
                        <tr key={item.key} className="border-b border-[#e2e8f0]">
                          <td className="py-0.5 text-[#1e293b] font-medium">{item.label} (×{item.qty})</td>
                          <td className="py-0.5 text-right font-mono font-bold text-[#0f172a]">{formatMoney(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {wantsUpgrade && shownUpgrade > 0 && !isSupplyOnly && (
                <div className="p-2 bg-white border border-emerald-600 rounded text-[#0f172a]">
                  <div style={{ fontSize: `${smallFs}px` }} className="font-bold uppercase tracking-wider flex justify-between items-center text-[#0f172a]">
                    <span>Optional 5-Year Labour Upgrade</span>
                    <span className="font-mono text-emerald-700 font-bold">+{formatMoney(shownUpgrade)}</span>
                  </div>
                  <div style={{ fontSize: `${microFs}px` }} className="text-[#334155] mt-0.5">
                    Optional extended labour warranty coverage. Not included in quote total.
                  </div>
                </div>
              )}

              {/* Optional Window Upgrade Offer */}
              {attachedUpgrade && attachedUpgrade.amountPreTaxCents > 0 && (
                <div className="p-2 bg-white border border-[#d97706] rounded text-[#0f172a]">
                  <div style={{ fontSize: `${smallFs}px` }} className="font-bold uppercase tracking-wider flex justify-between items-center text-[#0f172a]">
                    <span>Optional Upgrade Offer</span>
                    <span className="font-mono text-[#b45309] font-bold">+{formatMoney(attachedUpgrade.amountPreTaxCents)}</span>
                  </div>
                  <div style={{ fontSize: `${microFs}px` }} className="text-[#334155] mt-0.5">
                    {attachedUpgrade.title} adds {formatMoney(attachedUpgrade.amountPreTaxCents)}
                  </div>
                </div>
              )}

              {quoteNotes && quoteNotes.trim() && (
                <div className="p-2 bg-white border border-[#cbd5e1] rounded text-[#0f172a] space-y-0.5">
                  <div style={{ fontSize: `${smallFs}px` }} className="font-bold text-[#0f172a] uppercase tracking-wider mb-0.5 pb-0.5 border-b border-[#cbd5e1]">
                    Special Instructions &amp; Project Notes
                  </div>
                  {renderFormattedNotes(quoteNotes, smallFs)}
                </div>
              )}
            </div>

            {/* Right: Exact Financial Summary */}
            <div>
              <div style={{ fontSize: `${h2Fs}px` }} className="font-bold uppercase tracking-wider text-[#0f172a] mb-1 pb-0.5 border-b-2 border-[#0f172a]">
                Summary
              </div>
              <table className="w-full border-collapse" style={{ fontSize: `${bodyFs}px` }}>
                <tbody>
                  {renderWindowBasePriceRows('text-[#0f172a]')}
                  {taxJCCents > 0 && (
                    <tr className="border-b border-[#e2e8f0]">
                      <td className="py-1 text-[#0f172a] font-medium">
                        {jcLabel}
                      </td>
                      <td className="py-1 text-right font-mono font-bold text-[#0f172a]">{formatMoney(taxJCCents)}</td>
                    </tr>
                  )}
                  {taxMiscCents > 0 && (
                    <tr className="border-b border-[#e2e8f0]">
                      <td className="py-1 text-[#0f172a] font-medium">Miscellaneous</td>
                      <td className="py-1 text-right font-mono font-bold text-[#0f172a]">{formatMoney(taxMiscCents)}</td>
                    </tr>
                  )}
                  {taxLabourCents > 0 && (
                    <tr className="border-b border-[#e2e8f0]">
                      <td className="py-1 text-[#0f172a] font-medium">Labour <span style={{ fontSize: `${smallFs}px` }} className="text-[#334155]">(incl. installation &amp; travel)</span></td>
                      <td className="py-1 text-right font-mono font-bold text-[#0f172a]">{formatMoney(taxLabourCents)}</td>
                    </tr>
                  )}
                  {surcharge > 0 && (
                    <tr className="border-b border-[#e2e8f0]">
                      <td className="py-1 text-[#0f172a] font-medium">Surcharge</td>
                      <td className="py-1 text-right font-mono font-bold text-[#0f172a]">+{formatMoney(surcharge)}</td>
                    </tr>
                  )}
                  {promoDiscountCents > 0 && (
                    <tr className="border-b border-[#cbd5e1] bg-white text-emerald-900 font-semibold">
                      <td className="py-1 pl-1">
                        <span style={{ fontSize: `${microFs}px` }} className="uppercase font-bold text-emerald-700 block">Promo Applied:</span>
                        {resolvedPromoName}
                      </td>
                      <td className="py-1 text-right font-mono text-emerald-700 font-bold pr-1">−{formatMoney(promoDiscountCents)}</td>
                    </tr>
                  )}
                  {monthlyDiscountCents > 0 && (
                    <tr className="border-b border-[#e2e8f0] text-emerald-800 font-semibold">
                      <td className="py-1">Monthly Discount</td>
                      <td className="py-1 text-right font-mono">−{formatMoney(monthlyDiscountCents)}</td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-[#cbd5e1] border-b border-[#cbd5e1] bg-[#f8fafc]/80 font-bold text-[#0f172a]">
                    <td className="py-1 text-[#0f172a]">Subtotal</td>
                    <td className="py-1 text-right font-mono font-bold text-[#0f172a]">{formatMoney(subtotalCents)}</td>
                  </tr>

                  {hstRate > 0 && (
                    <tr className="border-b border-[#cbd5e1]">
                      <td className="py-1 text-[#334155] font-medium">{hstLabel}</td>
                      <td className="py-1 text-right font-mono font-bold text-[#0f172a]">{formatMoney(hstAmountCents)}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Total Banner */}
              <div className="border-2 border-[#0f172a] bg-white text-[#0f172a] rounded-md p-2 flex justify-between items-center font-extrabold mt-2">
                <span style={{ fontSize: `${h2Fs}px` }} className="tracking-wide uppercase text-[#0f172a]">Total</span>
                <span style={{ fontSize: `${Math.round(baseFs * 1.35)}px` }} className="font-mono font-black text-[#0f172a]">{formatMoney(displayTotalCents)}</span>
              </div>

              {/* Deposit Terms */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-1.5 border-t border-[#cbd5e1]">
                <div className="bg-white p-1.5 rounded-md border border-[#cbd5e1]">
                  <div style={{ fontSize: `${microFs}px` }} className="text-[#334155] uppercase tracking-wider font-semibold">50% Deposit</div>
                  <div style={{ fontSize: `${bodyFs}px` }} className="font-mono font-bold text-[#0f172a] mt-0.5">{formatMoney(displayFirstPayment)}</div>
                </div>
                <div className="bg-white p-1.5 rounded-md border border-[#cbd5e1]">
                  <div style={{ fontSize: `${microFs}px` }} className="text-[#334155] uppercase tracking-wider font-semibold">Final 50% Balance</div>
                  <div style={{ fontSize: `${bodyFs}px` }} className="font-mono font-bold text-[#0f172a] mt-0.5">{formatMoney(displaySecondPayment)}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* TEMPLATE C: SPECIFICATION PROPOSAL & ARCHITECTURAL SCHEDULE    */}
      {/* ============================================================== */}
      {template === 'cards' && (
        <>
          {/* Header: Standardized Architectural Header */}
          <div className="border-t-2 border-b-2 border-[#0f172a] py-2 mb-2.5">
            <div className="flex justify-between items-baseline">
              <div>
                <h1 style={{ fontSize: `${titleFs}px` }} className="font-black tracking-tight text-[#0f172a] m-0 uppercase leading-none">
                  The Window &amp; Door Store
                </h1>
                <div style={{ fontSize: `${smallFs}px` }} className="text-[#334155] font-bold uppercase tracking-wider mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>{isSupplyOnly ? 'Supply Only Window Quotation' : 'Window & Labour Quote'}</span>
                </div>
              </div>
              <div className="text-right">
                <div style={{ fontSize: `${h2Fs}px` }} className="font-mono font-black text-[#0f172a]">
                  {quoteNumber || 'REF-QUOTE'}
                </div>
                <div style={{ fontSize: `${smallFs}px` }} className="text-[#334155] font-semibold" suppressHydrationWarning>
                  {currentDate}
                </div>
              </div>
            </div>

            {/* Compact Inline Customer & Region Bar */}
            {(customerName || regionName || preparedBy) && (
              <div style={{ fontSize: `${bodyFs}px` }} className="mt-1 pt-1 border-t border-[#cbd5e1] flex justify-between items-center text-[#0f172a] flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  {customerName && (
                    <div>
                      <span className="text-[#334155] uppercase font-bold text-[9px] mr-1">Client:</span>
                      <span className="font-black text-[#0f172a]">{customerName}</span>
                    </div>
                  )}
                  {regionName && (
                    <div>
                      <span className="text-[#334155] uppercase font-bold text-[9px] mr-1">Region:</span>
                      <span className="font-bold text-[#0f172a]">{regionName}</span>
                    </div>
                  )}
                </div>
                {preparedBy && (
                  <div>
                    <span className="text-[#334155] uppercase font-bold text-[9px] mr-1">Prepared By:</span>
                    <span className="font-bold text-[#0f172a]">{preparedBy}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Itemized Window Specification Schedule */}
          <div style={{ marginBottom: `${Math.max(6, sectionMb - 4)}px` }}>
            <table className="w-full border-collapse border border-[#cbd5e1] text-left">
              <thead>
                <tr className="bg-[#f8fafc] border-b-2 border-[#0f172a] text-[#0f172a] uppercase font-bold" style={{ fontSize: `${thFs}px` }}>
                  <th style={{ paddingTop: `${rowPy * 0.75}px`, paddingBottom: `${rowPy * 0.75}px` }} className="px-2 w-[5%] text-center border-r border-[#cbd5e1]">#</th>
                  <th style={{ paddingTop: `${rowPy * 0.75}px`, paddingBottom: `${rowPy * 0.75}px` }} className={`px-2.5 border-r border-[#cbd5e1] ${isSupplyOnly ? 'w-[62%]' : 'w-[30%]'}`}>Window Size (W × H)</th>
                  <th style={{ paddingTop: `${rowPy * 0.75}px`, paddingBottom: `${rowPy * 0.75}px` }} className={`px-2 text-center border-r border-[#cbd5e1] ${isSupplyOnly ? 'w-[10%]' : 'w-[8%]'}`}>Qty</th>
                  <th style={{ paddingTop: `${rowPy * 0.75}px`, paddingBottom: `${rowPy * 0.75}px` }} className={`px-2.5 text-right font-mono ${!isSupplyOnly ? 'border-r border-[#cbd5e1]' : ''} ${isSupplyOnly ? 'w-[23%]' : 'w-[19%]'}`}>Base Price</th>
                  {!isSupplyOnly && (
                    <>
                      <th style={{ paddingTop: `${rowPy * 0.75}px`, paddingBottom: `${rowPy * 0.75}px` }} className="px-2.5 text-right font-mono border-r border-[#cbd5e1] w-[19%]">Labour</th>
                      <th style={{ paddingTop: `${rowPy * 0.75}px`, paddingBottom: `${rowPy * 0.75}px` }} className="px-2.5 text-right font-mono w-[19%]">Misc</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody style={{ fontSize: `${bodyFs}px` }}>
                {windows.map((w, i) => {
                  const line = taxTotals?.lines?.[i];
                  const qty = Number(w.qty) || 1;
                  const totalItemBaseCents = toCents(w.base);
                  const itemLabDollars = line?.lab ?? 0;
                  const itemMiscDollars = line?.misc ?? 0;

                  return (
                    <tr key={w.id || i} className={`border-b border-[#cbd5e1] ${i % 2 === 1 ? 'bg-[#fcfdfd]' : 'bg-white'}`}>
                      <td style={{ paddingTop: `${rowPy * 0.75}px`, paddingBottom: `${rowPy * 0.75}px` }} className="px-2 text-center font-bold text-[#64748b] border-r border-[#cbd5e1]">
                        {String(i + 1).padStart(2, '0')}
                      </td>
                      <td style={{ paddingTop: `${rowPy * 0.75}px`, paddingBottom: `${rowPy * 0.75}px` }} className="px-2.5 border-r border-[#cbd5e1]">
                        <span className="font-bold text-[#0f172a] leading-tight">
                          {w.w && w.h ? `${w.w}" × ${w.h}"` : 'Custom Sized Window Unit'}
                        </span>
                      </td>
                      <td style={{ paddingTop: `${rowPy * 0.75}px`, paddingBottom: `${rowPy * 0.75}px` }} className="px-2 text-center font-bold text-[#0f172a] border-r border-[#cbd5e1]">
                        <span className="px-1.5 py-0.5 rounded bg-[#f1f5f9] text-[#0f172a] font-mono text-[11px]">
                          {qty}
                        </span>
                      </td>
                      <td style={{ paddingTop: `${rowPy * 0.75}px`, paddingBottom: `${rowPy * 0.75}px` }} className={`px-2.5 text-right font-mono font-bold text-[#0f172a] ${!isSupplyOnly ? 'border-r border-[#cbd5e1]' : ''}`}>
                        {formatMoney(totalItemBaseCents)}
                      </td>
                      {!isSupplyOnly && (
                        <>
                          <td style={{ paddingTop: `${rowPy * 0.75}px`, paddingBottom: `${rowPy * 0.75}px` }} className="px-2.5 text-right font-mono text-[#0f172a] border-r border-[#cbd5e1]">
                            {formatMoney(itemLabDollars * 100)}
                          </td>
                          <td style={{ paddingTop: `${rowPy * 0.75}px`, paddingBottom: `${rowPy * 0.75}px` }} className="px-2.5 text-right font-mono text-[#0f172a]">
                            {formatMoney(itemMiscDollars * 100)}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Project Extras & Hardware (if any) */}
          {detailedExtrasList.length > 0 && !isSupplyOnly && (
            <div style={{ marginBottom: `${Math.max(6, sectionMb - 4)}px` }}>
              <div style={{ fontSize: `${smallFs}px` }} className="font-bold text-[#0f172a] uppercase tracking-wider mb-1 flex items-center justify-between border-b border-[#cbd5e1] pb-0.5">
                <span>Extras &amp; Add-ons</span>
                <span className="text-[#64748b] font-normal">{detailedExtrasList.length} item{detailedExtrasList.length > 1 ? 's' : ''}</span>
              </div>
              <table className="w-full border-collapse border border-[#cbd5e1] text-left" style={{ fontSize: `${smallFs}px` }}>
                <thead>
                  <tr className="bg-[#f8fafc] border-b border-[#cbd5e1] text-[#0f172a] font-semibold text-[10px] uppercase">
                    <th style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }} className="px-2.5">Item Description</th>
                    <th style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }} className="px-2 text-center w-16">Qty</th>
                    <th style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }} className="px-2.5 text-right font-mono w-28">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {detailedExtrasList.map((item) => (
                    <tr key={item.key} className="border-b border-[#f1f5f9] bg-white">
                      <td style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }} className="px-2.5 font-medium text-[#0f172a]">{item.label}</td>
                      <td style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }} className="px-2 text-center font-mono text-[#334155]">{item.qty || 1}</td>
                      <td style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }} className="px-2.5 text-right font-mono font-bold text-[#0f172a]">
                        {formatMoney(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bottom Grid: Project Specifications & Financial Summary */}
          <div className="grid grid-cols-[1.1fr_1.15fr] items-start border-t-2 border-[#0f172a]" style={{ gap: `${cardGap * 1.5}px`, paddingTop: `${rowPy}px` }}>
            {/* Left: Materials, Travel & Instructions */}
            <div className="space-y-2">
              {jcItems.length > 0 && (
                <div className="border border-[#cbd5e1] rounded p-2 bg-white">
                  <div style={{ fontSize: `${smallFs}px` }} className="font-bold text-[#0f172a] uppercase tracking-wider mb-0.5 pb-0.5 border-b border-[#cbd5e1]">
                    {isSupplyOnly ? 'Jamb & Casing Materials' : 'Jamb & Casing Specification'}
                  </div>
                  <table className="w-full border-collapse" style={{ fontSize: `${smallFs}px` }}>
                    <tbody>
                      {jcItems.map((j, idx) => (
                        <tr key={idx} className="border-b border-[#f1f5f9] last:border-0">
                          <td style={{ paddingTop: `${rowPy * 0.5}px`, paddingBottom: `${rowPy * 0.5}px` }} className="text-[#1e293b] font-medium">{j.label}</td>
                          <td style={{ paddingTop: `${rowPy * 0.5}px`, paddingBottom: `${rowPy * 0.5}px` }} className="text-right font-mono font-bold text-[#0f172a]">{formatMoney(j.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {travelItems.length > 0 && !isSupplyOnly && (
                <div className="border border-[#cbd5e1] rounded p-2 bg-white">
                  <div style={{ fontSize: `${smallFs}px` }} className="font-bold text-[#0f172a] uppercase tracking-wider mb-0.5 pb-0.5 border-b border-[#cbd5e1]">
                    Travel &amp; Logistics
                  </div>
                  <table className="w-full border-collapse" style={{ fontSize: `${smallFs}px` }}>
                    <tbody>
                      {travelItems.map((t, idx) => (
                        <tr key={idx} className="border-b border-[#f1f5f9] last:border-0">
                          <td style={{ paddingTop: `${rowPy * 0.5}px`, paddingBottom: `${rowPy * 0.5}px` }} className="text-[#1e293b] font-medium">{t.label}</td>
                          <td style={{ paddingTop: `${rowPy * 0.5}px`, paddingBottom: `${rowPy * 0.5}px` }} className="text-right font-mono font-bold text-[#0f172a]">{formatMoney(t.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {wantsUpgrade && shownUpgrade > 0 && !isSupplyOnly && (
                <div className="p-1.5 bg-white border border-emerald-500 rounded flex justify-between items-center" style={{ fontSize: `${smallFs}px` }}>
                  <div>
                    <span className="font-bold text-[#0f172a] block">Optional 5-Year Labour Warranty Upgrade:</span>
                    <span style={{ fontSize: `${microFs}px` }} className="text-[#64748b]">(Optional — not included in quote total)</span>
                  </div>
                  <span className="font-mono font-black text-emerald-700">+{formatMoney(shownUpgrade)}</span>
                </div>
              )}

              {/* Optional Window Upgrade Offer */}
              {attachedUpgrade && attachedUpgrade.amountPreTaxCents > 0 && (
                <div className="p-1.5 bg-white border border-[#d97706] rounded flex justify-between items-center" style={{ fontSize: `${smallFs}px` }}>
                  <div>
                    <span className="font-bold text-[#0f172a] block">Optional Upgrade Offer:</span>
                    <span style={{ fontSize: `${microFs}px` }} className="text-[#334155]">
                      {attachedUpgrade.title} adds {formatMoney(attachedUpgrade.amountPreTaxCents)}
                    </span>
                  </div>
                  <span className="font-mono font-black text-[#b45309]">+{formatMoney(attachedUpgrade.amountPreTaxCents)}</span>
                </div>
              )}

              {quoteNotes && quoteNotes.trim() && (
                <div className="p-2 bg-white border border-[#cbd5e1] rounded space-y-0.5">
                  <div style={{ fontSize: `${smallFs}px` }} className="font-bold text-[#0f172a] uppercase tracking-wider mb-0.5 pb-0.5 border-b border-[#cbd5e1]">
                    Special Instructions &amp; Project Notes
                  </div>
                  {renderFormattedNotes(quoteNotes, smallFs)}
                </div>
              )}
            </div>

            {/* Right: Financial Summary */}
            <div className="border border-[#cbd5e1] rounded bg-white shadow-sm" style={{ padding: `${rowPy * 1.25}px` }}>
              <div style={{ fontSize: `${h2Fs}px` }} className="font-bold uppercase tracking-wider text-[#0f172a] mb-1 pb-0.5 border-b-2 border-[#0f172a]">
                Summary
              </div>

              <table className="w-full border-collapse" style={{ fontSize: `${bodyFs}px` }}>
                <tbody>
                  {renderWindowBasePriceRows('text-[#0f172a]')}
                  {taxJCCents > 0 && (
                    <tr className="border-b border-[#e2e8f0]">
                      <td style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }} className="text-[#0f172a] font-medium">
                        {jcLabel}
                      </td>
                      <td style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }} className="text-right font-mono font-bold text-[#0f172a]">{formatMoney(taxJCCents)}</td>
                    </tr>
                  )}
                  {taxMiscCents > 0 && (
                    <tr className="border-b border-[#e2e8f0]">
                      <td style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }} className="text-[#0f172a] font-medium">Miscellaneous</td>
                      <td style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }} className="text-right font-mono font-bold text-[#0f172a]">{formatMoney(taxMiscCents)}</td>
                    </tr>
                  )}
                  {taxLabourCents > 0 && (
                    <tr className="border-b border-[#e2e8f0]">
                      <td style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }} className="text-[#0f172a] font-medium">
                        Labour <span style={{ fontSize: `${smallFs}px` }} className="text-[#334155]">(incl. installation &amp; travel)</span>
                      </td>
                      <td style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }} className="text-right font-mono font-bold text-[#0f172a]">{formatMoney(taxLabourCents)}</td>
                    </tr>
                  )}
                  {surcharge > 0 && (
                    <tr className="border-b border-[#e2e8f0]">
                      <td style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }} className="text-[#0f172a] font-medium">Surcharge</td>
                      <td style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }} className="text-right font-mono font-bold text-[#0f172a]">+{formatMoney(surcharge)}</td>
                    </tr>
                  )}
                  {promoDiscountCents > 0 && (
                    <tr className="border-b border-[#cbd5e1] bg-white text-emerald-900 font-semibold">
                      <td style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }} className="pl-1">
                        <span style={{ fontSize: `${microFs}px` }} className="uppercase font-bold tracking-wider text-emerald-700 block">Promo Applied:</span>
                        {resolvedPromoName}
                      </td>
                      <td style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }} className="text-right font-mono text-emerald-700 font-bold pr-1">−{formatMoney(promoDiscountCents)}</td>
                    </tr>
                  )}
                  {monthlyDiscountCents > 0 && (
                    <tr className="border-b border-[#e2e8f0] text-emerald-800 font-semibold">
                      <td style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }}>Monthly Discount</td>
                      <td style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }} className="text-right font-mono font-bold">−{formatMoney(monthlyDiscountCents)}</td>
                    </tr>
                  )}
                  <tr className="border-t-2 border-[#cbd5e1] border-b border-[#cbd5e1] bg-[#f8fafc]/80 font-bold text-[#0f172a]">
                    <td style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }} className="text-[#0f172a]">Subtotal</td>
                    <td style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }} className="text-right font-mono font-bold text-[#0f172a]">{formatMoney(subtotalCents)}</td>
                  </tr>

                  {hstRate > 0 && (
                    <tr className="border-b border-[#cbd5e1]">
                      <td style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }} className="text-[#334155] font-medium">{hstLabel}</td>
                      <td style={{ paddingTop: `${rowPy * 0.6}px`, paddingBottom: `${rowPy * 0.6}px` }} className="text-right font-mono font-bold text-[#0f172a]">{formatMoney(hstAmountCents)}</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* Total Banner - Clean Ink-Saving Architectural Border */}
              <div className="border-2 border-[#0f172a] bg-white text-[#0f172a] rounded-md flex justify-between items-center font-extrabold mt-2" style={{ padding: `${rowPy}px` }}>
                <span style={{ fontSize: `${h2Fs}px` }} className="tracking-wide uppercase text-[#0f172a]">Total</span>
                <span style={{ fontSize: `${titleFs}px` }} className="font-mono font-black text-[#0f172a]">{formatMoney(displayTotalCents)}</span>
              </div>

              {/* Deposit Terms */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-1.5 border-t border-[#cbd5e1]">
                <div className="bg-white p-1.5 rounded-md border border-[#cbd5e1]">
                  <div style={{ fontSize: `${microFs}px` }} className="text-[#334155] uppercase tracking-wider font-semibold">50% Deposit</div>
                  <div style={{ fontSize: `${bodyFs}px` }} className="font-mono font-bold text-[#0f172a] mt-0.5">{formatMoney(displayFirstPayment)}</div>
                </div>
                <div className="bg-white p-1.5 rounded-md border border-[#cbd5e1]">
                  <div style={{ fontSize: `${microFs}px` }} className="text-[#334155] uppercase tracking-wider font-semibold">Final 50% Balance</div>
                  <div style={{ fontSize: `${bodyFs}px` }} className="font-mono font-bold text-[#0f172a] mt-0.5">{formatMoney(displaySecondPayment)}</div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
