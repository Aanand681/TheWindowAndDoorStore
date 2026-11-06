'use client';

import React, { useState, useEffect } from 'react';
import { formatMoney, toCents } from '@/lib/promo-logic';
import { formatDoorSummarySentence, formatDoorItemHeading } from '@/lib/doors/calculations';
import { formatSealedUnitSummarySentence, getSealedUnitServiceSummaryLabel } from '@/lib/sealed-units-logic';

export type QuoteTemplateType = 'modern' | 'executive' | 'cards';

export interface QuoteInvoiceProps {
  customerName?: string;
  quoteNumber?: string;
  primaryQuoteType?: 'window' | 'sealed_unit' | 'door';
  windows?: any[];
  sealedUnits?: any[];
  doors?: any[];
  taxTotals?: any;
  quoteResult?: any;
  sealedUnitTotals?: any;
  doorTotals?: any;
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
  attachedSealedUnit?: any | null;
  attachedDoorQuote?: any | null;
  attachedWindowQuote?: any | null;
  globalUpcharges?: any[];
  isSupplyOnly?: boolean;
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
  primaryQuoteType,
  windows = [],
  sealedUnits = [],
  doors = [],
  taxTotals,
  quoteResult,
  sealedUnitTotals,
  doorTotals,
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
  attachedSealedUnit = null,
  attachedDoorQuote = null,
  attachedWindowQuote = null,
  globalUpcharges = [],
  isSupplyOnly: isSupplyOnlyProp,
}: QuoteInvoiceProps) {
  const [currentDate, setCurrentDate] = useState<string>('');

  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }));
  }, []);

  // 1. Resolve product line lists and totals across host & attached quotes
  const effectiveWindows = (windows && windows.length > 0)
    ? windows
    : (attachedWindowQuote?.windows || attachedWindowQuote?.lineItems || []);
  const hasWindows = effectiveWindows.length > 0 || (basePrice > 0) || Boolean(quoteResult?.base);

  const effectiveDoors = (doors && doors.length > 0)
    ? doors
    : (attachedDoorQuote?.lineItems || []);
  const effectiveDoorTotals = doorTotals || attachedDoorQuote?.totals || {};
  const effectiveDoorUpcharges = (globalUpcharges && globalUpcharges.length > 0)
    ? globalUpcharges
    : (attachedDoorQuote?.globalUpcharges || []);
  const hasDoors = effectiveDoors.length > 0 || Boolean(effectiveDoorTotals?.grandTotal);

  const effectiveSealedUnits = (sealedUnits && sealedUnits.length > 0)
    ? sealedUnits
    : (attachedSealedUnit?.lineItems || []);
  const effectiveSUTotals = sealedUnitTotals || attachedSealedUnit?.totals || {};
  const isAttachedSUService =
    attachedSealedUnit?.sealedUnitMode === 'service_only' ||
    attachedSealedUnit?.data?.sealedUnitMode === 'service_only' ||
    Boolean(effectiveSUTotals.isServiceOnly);
  const hasSealedUnits = effectiveSealedUnits.length > 0 || (isAttachedSUService && (effectiveSUTotals.totalSqft || 0) > 0);

  // 2. Identify primary host quote type
  const isDoorHost = primaryQuoteType === 'door' || (!primaryQuoteType && doors.length > 0 && windows.length === 0);
  const isSUHost = primaryQuoteType === 'sealed_unit' || (!primaryQuoteType && sealedUnits.length > 0 && windows.length === 0 && doors.length === 0);
  const isWindowHost = !isDoorHost && !isSUHost;

  // 3. Early return guard: if no product data exists at all
  if (!hasWindows && !hasSealedUnits && !hasDoors && !taxTotals && !doorTotals && !sealedUnitTotals) {
    return null;
  }

  // 4. Logistics & Travel Deduplication:
  // ONLY the host quote charges travel & $140 setup fee. Attached quotes are on the same site for the same customer!
  const travelItems: { label: string; amount: number }[] = [];
  if (isWindowHost && taxTotals) {
    if (taxTotals.km > 0) {
      travelItems.push({
        label: `Vehicle travel (${taxTotals.km} km @ $${taxTotals.vehicleRate?.toFixed(2) || '0.98'}/km)`,
        amount: (taxTotals.vehicle || 0) * 100,
      });
    }
    if (taxTotals.hrs > 0 && taxTotals.crew && taxTotals.crew !== 'none') {
      travelItems.push({
        label: `Crew travel (${taxTotals.crew} crew × ${taxTotals.hrs}h @ $${taxTotals.crewRate || 0}/h)`,
        amount: (taxTotals.crewTravel || 0) * 100,
      });
    }
    if (taxTotals.setup > 0) {
      travelItems.push({
        label: 'Per-job set-up fee',
        amount: (taxTotals.setup || 0) * 100,
      });
    }
    if (taxTotals.fixedSetupFee > 0) {
      travelItems.push({
        label: `Job Set Up Fee (${regionName || 'Standard'})`,
        amount: (taxTotals.fixedSetupFee || 0) * 100,
      });
    }
    if (taxTotals.baseTravelFee > 0) {
      travelItems.push({
        label: 'Base travel fee',
        amount: (taxTotals.baseTravelFee || 0) * 100,
      });
    }
  } else if (isDoorHost && effectiveDoorTotals) {
    if ((effectiveDoorTotals.baseSetupFee || 0) > 0) {
      travelItems.push({
        label: 'Per-job set-up fee',
        amount: Math.round((effectiveDoorTotals.baseSetupFee || 0) * 100),
      });
    }
    if ((effectiveDoorTotals.additionalFarFee || 0) > 0) {
      travelItems.push({
        label: 'Remote Area Travel / Setup Surcharge',
        amount: Math.round((effectiveDoorTotals.additionalFarFee || 0) * 100),
      });
    }
    if ((effectiveDoorTotals.vehicleTravelFee || 0) > 0) {
      travelItems.push({
        label: 'Vehicle travel',
        amount: Math.round((effectiveDoorTotals.vehicleTravelFee || 0) * 100),
      });
    }
    if ((effectiveDoorTotals.crewTravelFee || 0) > 0) {
      travelItems.push({
        label: 'Crew travel',
        amount: Math.round((effectiveDoorTotals.crewTravelFee || 0) * 100),
      });
    }
  } else if (isSUHost && effectiveSUTotals) {
    if ((effectiveSUTotals.baseSetupFee || 0) > 0) {
      travelItems.push({
        label: 'Per-job set-up fee',
        amount: Math.round((effectiveSUTotals.baseSetupFee || 0) * 100),
      });
    }
    if ((effectiveSUTotals.additionalFarFee || 0) > 0) {
      travelItems.push({
        label: 'Remote Area Travel / Setup Surcharge',
        amount: Math.round((effectiveSUTotals.additionalFarFee || 0) * 100),
      });
    }
    if ((effectiveSUTotals.vehicleTravelFee || 0) > 0) {
      travelItems.push({
        label: 'Vehicle travel',
        amount: Math.round((effectiveSUTotals.vehicleTravelFee || 0) * 100),
      });
    }
    if ((effectiveSUTotals.crewTravelFee || 0) > 0) {
      travelItems.push({
        label: 'Crew travel',
        amount: Math.round((effectiveSUTotals.crewTravelFee || 0) * 100),
      });
    }
  }

  const isSupplyOnly = Boolean(
    isSupplyOnlyProp !== undefined
      ? isSupplyOnlyProp
      : (taxTotals?.isSupplyOnly ||
         regionName?.toLowerCase().includes('supply') ||
         taxTotals?.regionName?.toLowerCase().includes('supply'))
  );

  const hasSupplyJamb = Boolean(
    (taxTotals?.selectedJamb && (Number(taxTotals.selectedJamb.rate) > 0 || Number(taxTotals.selectedJamb.total) > 0)) ||
    (taxTotals?.jambTot && Number(taxTotals.jambTot) > 0) ||
    (taxTotals?.jambRate && Number(taxTotals.jambRate) > 0) ||
    (taxTotals?.jambId && taxTotals.jambId !== 'none')
  );
  const hasSupplyCasing = Boolean(
    (taxTotals?.selectedCasing && (Number(taxTotals.selectedCasing.rate) > 0 || Number(taxTotals.selectedCasing.total) > 0)) ||
    (taxTotals?.casingTot && Number(taxTotals.casingTot) > 0) ||
    (taxTotals?.casingRate && Number(taxTotals.casingRate) > 0) ||
    (taxTotals?.casingId && taxTotals.casingId !== 'none')
  );
  const isLooseSupplyJC = Boolean(isSupplyOnly && (hasSupplyJamb || hasSupplyCasing));

  // Effective costs with manual override support (respects 0 without falling back to taxTotals)
  const taxJCCents = includeJCInPromo
    ? (isSupplyOnly && !isLooseSupplyJC && effectiveJC === undefined
        ? 0
        : (effectiveJC !== undefined
            ? effectiveJC
            : Math.round(Number(taxTotals?.finalJC ?? taxTotals?.jcTotal ?? taxTotals?.jc ?? 0) * 100)))
    : 0;
  const taxMiscCents = includeMiscInPromo
    ? (isSupplyOnly && effectiveMisc === undefined
        ? 0
        : (effectiveMisc !== undefined
            ? effectiveMisc
            : Math.round(Number(taxTotals?.finalMisc ?? taxTotals?.miscTotal ?? 0) * 100)))
    : 0;
  const taxLabourCents = includeLabourInPromo
    ? (isSupplyOnly && effectiveLabour === undefined
        ? 0
        : (effectiveLabour !== undefined
            ? effectiveLabour
            : Math.round(Number(taxTotals?.finalLabour ?? taxTotals?.labourTotal ?? taxTotals?.labourWindows ?? 0) * 100)))
    : 0;

  // Jamb and casing items - only present if taxJCCents > 0
  const jcItems: { label: string; amount: number }[] = [];
  if (taxJCCents > 0) {
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
    // If taxJCCents > 0 but no named jamb/casing item was in taxTotals:
    if (jcItems.length === 0) {
      jcItems.push({
        label: 'Jambs & Casings',
        amount: taxJCCents,
      });
    }
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
  const promoDiscountCents = isWindowHost
    ? (activePromo?.discount || 0)
    : (attachedWindowQuote?.totals?.promoDiscount ? Math.round(attachedWindowQuote.totals.promoDiscount * 100) : (attachedWindowQuote?.quoteResult?.promoDiscount || activePromo?.discount || 0));
  const monthlyDiscountCents = Math.round((taxTotals?.discount || 0) * 100);

  // Component line calculations for each product type
  // 1. Windows:
  const winMaterialsCents = hasWindows
    ? (quoteResult?.base || basePrice || (attachedWindowQuote?.totals?.base ? Math.round(attachedWindowQuote.totals.base * 100) : 0))
    : 0;
  const rawWinSurchargeCents = hasWindows
    ? (surcharge || (attachedWindowQuote?.totals?.surcharge ? Math.round(attachedWindowQuote.totals.surcharge * 100) : 0))
    : 0;
  const winSurchargeCents = (!isWindowHost && rawWinSurchargeCents > winMaterialsCents && winMaterialsCents > 0)
    ? Math.round(winMaterialsCents * 0.08)
    : rawWinSurchargeCents;
  const winLabourCents = hasWindows
    ? (isWindowHost
        ? taxLabourCents
        : (attachedWindowQuote?.totals?.labour ? Math.round(attachedWindowQuote.totals.labour * 100) : 0))
    : 0;
  const winMiscCents = hasWindows
    ? (isWindowHost
        ? taxMiscCents
        : (attachedWindowQuote?.totals?.misc ? Math.round(attachedWindowQuote.totals.misc * 100) : 0))
    : 0;
  const winJCCents = hasWindows
    ? (isWindowHost
        ? taxJCCents
        : (attachedWindowQuote?.totals?.jc ? Math.round(attachedWindowQuote.totals.jc * 100) : 0))
    : 0;

  // 2. Sealed Units:
  const suGlassCents = hasSealedUnits && !isAttachedSUService
    ? Math.round((effectiveSUTotals.glassBefore8PercentTotal || 0) * 100)
    : 0;
  const suSurchargeCents = hasSealedUnits && !isAttachedSUService
    ? Math.round((effectiveSUTotals.glass8PercentSurchargeTotal || 0) * 100)
    : 0;
  const suMiscCents = hasSealedUnits
    ? Math.round((effectiveSUTotals.miscTotal || 0) * 100)
    : 0;
  // Deduplication: if SU is attached, strip travel and setup fee from SU labour
  const suLabourCents = hasSealedUnits
    ? (isSUHost
        ? Math.round((effectiveSUTotals.combinedLabourTotal || 0) * 100)
        : Math.round((effectiveSUTotals.serviceLabourTotal ?? effectiveSUTotals.unitLabourSum ?? 0) * 100))
    : 0;

  // 3. Doors:
  const doorRawBaseCents = hasDoors
    ? Math.round(((effectiveDoorTotals.rawDoorBaseTotal || 0) + (effectiveDoorTotals.stormDoorTotal || 0) + (effectiveDoorTotals.hardwareTotal || 0)) * 100)
    : 0;
  const doorDiscountCents = hasDoors
    ? Math.round((effectiveDoorTotals.discountTotal || 0) * 100)
    : 0;
  const doorMaterialsCents = doorRawBaseCents;
  const doorNetMaterialsCents = Math.max(0, doorRawBaseCents - doorDiscountCents);
  const doorSurchargeCents = hasDoors
    ? Math.round((effectiveDoorTotals.surchargeTotal || 0) * 100)
    : 0;
  const doorMiscCents = hasDoors
    ? Math.round((effectiveDoorTotals.miscTotal || 0) * 100)
    : 0;
  // Deduplication: if Door is attached, strip travel and $140 setup fee from door labour
  const doorLabourCents = hasDoors
    ? (isDoorHost
        ? Math.round((effectiveDoorTotals.combinedLabourTotal || 0) * 100)
        : Math.round(((effectiveDoorTotals.unitLabourTotal || 0) + (effectiveDoorTotals.upchargesTotal || 0)) * 100))
    : 0;

  // Combined totals across all products
  const hasAnyAttached = Boolean(attachedSealedUnit || attachedDoorQuote || attachedWindowQuote);
  const effectiveMiscTotalCents = (hasWindows ? winMiscCents : 0) + (hasSealedUnits ? suMiscCents : 0) + (hasDoors ? doorMiscCents : 0);
  const effectiveLabourTotalCents = (hasWindows ? winLabourCents : 0) + (hasSealedUnits ? suLabourCents : 0) + (hasDoors ? doorLabourCents : 0);
  const effectiveSurchargeTotalCents = (hasWindows ? winSurchargeCents : 0) + (hasSealedUnits ? suSurchargeCents : 0) + (hasDoors ? doorSurchargeCents : 0);
  const totalDiscountCents = promoDiscountCents + monthlyDiscountCents;

  const combinedSubtotalCalculatedCents = Math.max(
    0,
    (hasWindows ? (winMaterialsCents - totalDiscountCents + winJCCents) : 0) +
    suGlassCents +
    doorNetMaterialsCents +
    effectiveMiscTotalCents +
    effectiveLabourTotalCents +
    effectiveSurchargeTotalCents
  );

  const finalSubtotalCents = (hasAnyAttached || isDoorHost || isSUHost)
    ? combinedSubtotalCalculatedCents
    : (afterDiscount > 0 && Math.abs(afterDiscount - combinedSubtotalCalculatedCents) <= 10 ? afterDiscount : combinedSubtotalCalculatedCents);

  let finalHstAmountCents = 0;
  let finalHstLabel = `HST (${hstRate}%)`;
  if (hstRate === 13) {
    finalHstAmountCents = Math.round(finalSubtotalCents * 0.13);
    finalHstLabel = 'HST (13%)';
  } else if (hstRate === 8) {
    // 8% Provincial Point-of-Sale Exemption on materials (5% GST on materials, 13% on labour)
    const matCents = Math.max(
      0,
      (hasWindows ? (winMaterialsCents - totalDiscountCents + winSurchargeCents + winJCCents) : 0) +
      (hasSealedUnits ? (suGlassCents + suSurchargeCents) : 0) +
      (hasDoors ? (doorNetMaterialsCents + doorSurchargeCents) : 0)
    );
    const srvCents = Math.max(0, effectiveLabourTotalCents + effectiveMiscTotalCents);
    finalHstAmountCents = Math.round(matCents * 0.05) + Math.round(srvCents * 0.13);
    finalHstLabel = 'HST (8% Exempt on Materials)';
  } else {
    finalHstAmountCents = 0;
    finalHstLabel = 'HST (0%)';
  }

  const finalTotalCents = finalSubtotalCents + finalHstAmountCents;
  const finalFirstPayment = Math.round(finalTotalCents / 2);
  const finalSecondPayment = finalTotalCents - finalFirstPayment;

  // Sealed Unit Summary Sentence
  const suSummarySentence = isAttachedSUService
    ? getSealedUnitServiceSummaryLabel(effectiveSealedUnits, effectiveSUTotals.totalSqft)
    : formatSealedUnitSummarySentence(effectiveSealedUnits);

  // Door Summary Sentence
  const doorSummarySentence = formatDoorSummarySentence(effectiveDoors);

  // Door Upgrade Items (if any door has an upgrade option enabled)
  const doorUpgradeItems = effectiveDoors.filter((d: any) => d.upgradeOption?.enabled);

  const hasJambs = Boolean(taxJCCents > 0 && hasSupplyJamb);
  const hasCasing = Boolean(taxJCCents > 0 && hasSupplyCasing);

  const jcLabel = (() => {
    if (!isWindowHost && attachedWindowQuote?.jcLabel) {
      return attachedWindowQuote.jcLabel;
    }
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
    const raw = (isWindowHost ? activePromo?.name : (attachedWindowQuote?.promoName || attachedWindowQuote?.quoteResult?.promoName || activePromo?.name))?.trim();
    if (!raw) return 'Promotion Discount';
    // If raw matches a 24-char hex Mongo ObjectId or begins with one, fall back to quoteResult or 'Promotion Discount'
    if (/^[0-9a-fA-F]{24}$/.test(raw) || /^[0-9a-fA-F]{24}/.test(raw)) {
      return attachedWindowQuote?.quoteResult?.promoName || quoteResult?.promoName || 'Promotion Discount';
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

  if (Array.isArray(effectiveWindows) && effectiveWindows.length > 0) {
    effectiveWindows.forEach((w) => {
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

  const totalWindowBaseCents = totalBaseCentsCalculated > 0 ? totalBaseCentsCalculated : (winMaterialsCents > 0 ? winMaterialsCents : 0);

  const invoiceSubtitle = (() => {
    if (hasWindows && hasDoors && hasSealedUnits) {
      return isSupplyOnly ? 'Supply Only Windows, Doors & Sealed Units Quotation' : 'Comprehensive Window, Door & Sealed Unit Proposal';
    }
    if (hasWindows && hasDoors) {
      return isSupplyOnly ? 'Supply Only Windows & Doors Quotation' : 'Window & Door Architectural Proposal';
    }
    if (hasWindows && hasSealedUnits) {
      return isSupplyOnly ? 'Supply Only Windows & Sealed Units Quotation' : 'Window & Sealed Unit Quotation';
    }
    if (hasDoors && hasSealedUnits) {
      return isSupplyOnly ? 'Supply Only Doors & Sealed Units Quotation' : 'Door & Sealed Unit Quotation';
    }
    if (hasDoors) {
      return isSupplyOnly ? 'Supply Only Door Quotation' : 'Custom Door Systems Proposal';
    }
    if (hasSealedUnits) {
      return isSupplyOnly
        ? 'Supply Only Sealed Unit Quotation'
        : (isAttachedSUService ? 'Sealed Unit Service & Glazing Proposal' : 'Sealed Glass Unit Proposal');
    }
    return isSupplyOnly ? 'Supply Only Window Quotation' : 'Window & Labour Quote';
  })();

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

  const renderWindowsTable = (theme: 'modern' | 'executive' | 'cards') => {
    if (!hasWindows || effectiveWindows.length === 0) return null;

    const isModern = theme === 'modern';
    const isExecutive = theme === 'executive';
    const isCards = theme === 'cards';

    return (
      <div className={isCards ? "mb-4 border border-[#cbd5e1] rounded bg-white shadow-sm overflow-hidden" : "mb-4"}>
        <div className={`flex items-center justify-between ${isCards ? 'p-2 bg-[#f8fafc] border-b border-[#cbd5e1]' : 'mb-1 pb-1 border-b-[1.5px] border-[#0f172a]'}`}>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: `${h2Fs}px` }} className="font-bold uppercase tracking-wider text-[#0f172a]">
              Window Specifications
            </span>
            {!isWindowHost && attachedWindowQuote?.quoteNumber && (
              <span style={{ fontSize: `${microFs}px` }} className="px-1.5 py-0.5 rounded bg-muted text-[#334155] font-mono font-medium">
                #{attachedWindowQuote.quoteNumber}
              </span>
            )}
          </div>
          <span style={{ fontSize: `${microFs}px` }} className="text-[#64748b] font-medium">
            {effectiveWindows.length} item{effectiveWindows.length > 1 ? 's' : ''}
          </span>
        </div>

        <table className="w-full border-collapse" style={{ fontSize: `${bodyFs}px` }}>
          <thead>
            <tr className={isModern ? "border-b-2 border-[#0f172a] uppercase tracking-wider text-[#0f172a] bg-white font-bold" : isExecutive ? "bg-white border-b-2 border-[#0f172a] text-[#0f172a] font-bold uppercase tracking-wider" : "border-b border-[#cbd5e1] bg-[#f8fafc] text-[#0f172a] font-semibold text-[10px] uppercase"} style={{ fontSize: `${thFs}px` }}>
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
            {effectiveWindows.map((w: any, i: number) => {
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
                    {w.w && w.h ? `${w.w}" × ${w.h}"` : (w.dimensions || 'Custom Window')}
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
    );
  };

  const renderSealedUnitsTable = (theme: 'modern' | 'executive' | 'cards') => {
    const isService = isAttachedSUService;
    const suMode = attachedSealedUnit?.sealedUnitMode || attachedSealedUnit?.data?.sealedUnitMode || (isService ? 'service_only' : (attachedSealedUnit?.isInstallation || effectiveSUTotals.isInstallation ? 'installation' : 'supply_only'));
    const isInstallation = !isService && suMode === 'installation';
    const isSupplyOnly = !isService && suMode === 'supply_only';

    const effectiveSULineItems = effectiveSealedUnits.length > 0 ? effectiveSealedUnits : (
      isService && (effectiveSUTotals.totalSqft || 0) > 0 ? [
        {
          id: 'su-service-1',
          widthIn: 'Custom Area',
          heightIn: '',
          paneType: 'dual',
          combinationName: 'On-Site Sealed Unit Service & Glazing',
          shapeDescription: 'On-Site Service',
          grillDescription: 'No Grills',
          quantity: 1,
          actualSqft: effectiveSUTotals.totalSqft || 0,
        }
      ] : []
    );

    if (!hasSealedUnits || effectiveSULineItems.length === 0) return null;

    const isModern = theme === 'modern';
    const isExecutive = theme === 'executive';
    const isCards = theme === 'cards';

    const minL = effectiveSUTotals.labourMinPerUnit ?? 120.0;
    const labourR = effectiveSUTotals.effectiveLabourRate || effectiveSUTotals.labourRatePerSqft || 14.4;
    const miscR = effectiveSUTotals.effectiveMiscRate || effectiveSUTotals.miscRatePerSqft || 2.4;

    return (
      <div className={isCards ? "mb-4 border border-[#cbd5e1] rounded bg-white shadow-sm overflow-hidden" : "mb-4"}>
        <div className={`flex items-center justify-between ${isCards ? 'p-2 bg-[#f8fafc] border-b border-[#cbd5e1]' : 'mb-1 pb-1 border-b-[1.5px] border-[#0f172a]'}`}>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: `${h2Fs}px` }} className="font-bold uppercase tracking-wider text-[#0f172a]">
              {isService ? suSummarySentence : isInstallation ? 'Sealed Units & Installation' : 'Supply Only Sealed Units'}
            </span>
            {!isSUHost && attachedSealedUnit?.quoteNumber && (
              <span style={{ fontSize: `${microFs}px` }} className="px-1.5 py-0.5 rounded bg-muted text-[#334155] font-mono font-medium">
                #{attachedSealedUnit.quoteNumber}
              </span>
            )}
          </div>
          <span style={{ fontSize: `${microFs}px` }} className="text-[#64748b] font-medium">
            {effectiveSULineItems.length} item{effectiveSULineItems.length > 1 ? 's' : ''}
          </span>
        </div>

        <table className="w-full border-collapse" style={{ fontSize: `${bodyFs}px` }}>
          <thead>
            <tr className={isModern ? "border-b-2 border-[#0f172a] text-[#0f172a]" : isExecutive ? "border-b-2 border-[#0f172a] text-[#0f172a]" : "border-b border-[#cbd5e1] bg-[#f1f5f9] text-[#0f172a]"} style={{ fontSize: `${thFs}px` }}>
              <th className="py-1 px-1.5 text-left font-bold w-[4%]">#</th>
              <th className="py-1 px-1.5 text-left font-bold w-[26%]">Glass Specs</th>
              <th className="py-1 px-1.5 text-left font-bold w-[22%]">Dimension</th>
              <th className="py-1 px-1.5 text-left font-bold w-[12%]">Grills</th>
              <th className="py-1 px-1.5 text-center font-bold w-[6%]">Qty</th>
              <th className="py-1 px-1.5 text-right font-mono font-bold w-[10%]">Base Price</th>
              <th className="py-1 px-1.5 text-right font-mono font-bold w-[10%]">Labour</th>
              <th className="py-1 px-1.5 text-right font-mono font-bold w-[10%]">Misc</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: `${bodyFs}px` }}>
            {effectiveSULineItems.map((item: any, idx: number) => {
              const qty = Math.max(1, Number(item.quantity) || 1);
              const sqft = Number(item.actualSqft) || 0;

              // 1. Base Price (Clean base price before 8% surcharge)
              const unitBasePrice = Number(item.multipliedAmount ?? (item.multipliedTotal ? item.multipliedTotal / qty : (item.finalUnitPrice ? item.finalUnitPrice / 1.08 : (item.unitBasePrice ?? 0))));
              const totalBasePrice = Number(item.multipliedTotal ?? (unitBasePrice * qty));

              // 2. Labour (with min $120 enforced)
              const unitServiceLabour = Math.max(sqft * labourR, minL);
              const totalServiceLabour = Math.round(unitServiceLabour * qty * 100) / 100;

              const unitInstallLabour = (item.unitLabour && Number(item.unitLabour) > 0)
                ? Math.max(Number(item.unitLabour), minL)
                : Math.max(sqft * labourR, minL);
              const totalInstallLabour = Math.round(unitInstallLabour * qty * 100) / 100;

              // 3. Misc
              const totalServiceMisc = Math.round(sqft * miscR * qty * 100) / 100;
              const totalInstallMisc = item.totalMisc !== undefined && item.totalMisc !== null
                ? Number(item.totalMisc)
                : Math.round(sqft * miscR * qty * 100) / 100;

              // 4. Dimension & Area
              const isCustomArea = item.widthIn === 'Custom Area' || !item.widthIn || !item.heightIn;
              const dimText = isCustomArea
                ? (sqft > 0 ? `${sqft.toFixed(2)} sq ft total` : 'Custom Glazing')
                : `${item.widthIn}" wide × ${item.heightIn}" high`;

              // 5. Grills
              const hasGrill = (item.rawGrillCost > 0) || Boolean(item.grill && item.grill.type !== 'none') || (item.grillDescription && item.grillDescription !== 'No Grills');
              const grillDimText = item.grill?.colsCount && item.grill?.rowsCount
                ? `${item.grill.colsCount} × ${item.grill.rowsCount}`
                : '';
              const grillColorText = item.grill?.color
                ? `${item.grill.color} Grills`
                : (item.grillDescription && item.grillDescription !== 'No Grills' ? item.grillDescription : 'Grills');

              // 6. Glass specs
              const paneLabel = item.paneType === 'triple' ? 'Triple Pane' : 'Dual Pane';
              const glassSpec = item.combinationName || `${paneLabel} · ${item.treatment || 'Cardinal 366'}`;

              return (
                <tr key={item.id || idx} className="border-b border-[#cbd5e1] bg-white">
                  <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 text-[#334155] font-semibold">
                    {idx + 1}
                  </td>

                  {/* Glass Specs: empty in service only */}
                  <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 text-[#1e293b]">
                    {!isService ? (
                      <>
                        <div className="font-bold text-[#0f172a]">{glassSpec}</div>
                        <div className="text-[10px] text-[#64748b] capitalize">
                          {item.treatment || 'Cardinal'} · {paneLabel} {item.thicknessMm ? `· ${item.thicknessMm}mm` : ''}
                        </div>
                      </>
                    ) : (
                      <span className="text-[#94a3b8] font-mono">—</span>
                    )}
                  </td>

                  {/* Dimension */}
                  <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 font-bold text-[#0f172a]">
                    <div className="whitespace-nowrap">{dimText}</div>
                    {sqft > 0 && !isCustomArea && (
                      <div className="text-[10px] text-[#64748b] font-normal">
                        {sqft.toFixed(2)} sqft
                      </div>
                    )}
                  </td>

                  {/* Grills */}
                  <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 text-[#334155]">
                    {!isService && hasGrill ? (
                      <div>
                        {grillDimText && (
                          <div className="font-bold text-[#0f172a] font-mono text-[11px]">
                            {grillDimText}
                          </div>
                        )}
                        <div className="text-[10px] text-amber-800 font-semibold truncate">
                          {grillColorText}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[#94a3b8] font-mono">—</span>
                    )}
                  </td>

                  {/* Qty */}
                  <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 text-center font-bold text-[#0f172a]">
                    {qty}
                  </td>

                  {/* Base Price: empty in service only */}
                  <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 text-right font-mono">
                    {!isService && totalBasePrice > 0 ? (
                      <>
                        <span className="font-bold text-[#0f172a]">${totalBasePrice.toFixed(2)}</span>
                        {qty > 1 && (
                          <span style={{ fontSize: `${microFs}px` }} className="text-[#64748b] block font-sans font-normal">
                            (${unitBasePrice.toFixed(2)} ea)
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[#94a3b8] font-mono">—</span>
                    )}
                  </td>

                  {/* Labour: min $120 enforced */}
                  <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 text-right font-mono">
                    {isService ? (
                      <>
                        <span className="font-bold text-[#0f172a]">${totalServiceLabour.toFixed(2)}</span>
                        {qty > 1 && (
                          <span style={{ fontSize: `${microFs}px` }} className="text-[#64748b] block font-sans font-normal">
                            (${unitServiceLabour.toFixed(2)} ea)
                          </span>
                        )}
                      </>
                    ) : isInstallation ? (
                      <>
                        <span className="font-bold text-[#0f172a]">${totalInstallLabour.toFixed(2)}</span>
                        {qty > 1 && (
                          <span style={{ fontSize: `${microFs}px` }} className="text-[#64748b] block font-sans font-normal">
                            (${unitInstallLabour.toFixed(2)} ea)
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-[#94a3b8] font-mono">—</span>
                    )}
                  </td>

                  {/* Misc */}
                  <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 text-right font-mono">
                    {isService ? (
                      <span className="font-medium text-[#334155]">${totalServiceMisc.toFixed(2)}</span>
                    ) : isInstallation ? (
                      <span className="font-medium text-[#334155]">${totalInstallMisc.toFixed(2)}</span>
                    ) : (
                      <span className="text-[#94a3b8] font-mono">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderDoorsTable = (theme: 'modern' | 'executive' | 'cards') => {
    if (!hasDoors || effectiveDoors.length === 0) return null;

    const isModern = theme === 'modern';
    const isExecutive = theme === 'executive';
    const isCards = theme === 'cards';

    return (
      <div className={isCards ? "mb-4 border border-[#cbd5e1] rounded bg-white shadow-sm overflow-hidden" : "mb-4"}>
        <div className={`flex items-center justify-between ${isCards ? 'p-2 bg-[#f8fafc] border-b border-[#cbd5e1]' : 'mb-1 pb-1 border-b-[1.5px] border-[#0f172a]'}`}>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: `${h2Fs}px` }} className="font-bold uppercase tracking-wider text-[#0f172a]">
              Configured Doors
            </span>
            {!isDoorHost && attachedDoorQuote?.quoteNumber && (
              <span style={{ fontSize: `${microFs}px` }} className="px-1.5 py-0.5 rounded bg-muted text-[#334155] font-mono font-medium">
                #{attachedDoorQuote.quoteNumber}
              </span>
            )}
          </div>
          <span style={{ fontSize: `${microFs}px` }} className="text-[#64748b] font-medium">
            {effectiveDoors.length} item{effectiveDoors.length > 1 ? 's' : ''}
          </span>
        </div>

        <table className="w-full border-collapse" style={{ fontSize: `${bodyFs}px` }}>
          <thead>
            <tr className={isModern ? "border-b-2 border-[#0f172a] text-[#0f172a]" : isExecutive ? "border-b-2 border-[#0f172a] text-[#0f172a]" : "border-b border-[#cbd5e1] bg-[#f1f5f9] text-[#0f172a]"}>
              <th className="py-1 px-1.5 text-left font-bold w-[5%]">#</th>
              <th className="py-1 px-1.5 text-left font-bold w-[45%]">Door Specifications</th>
              <th className="py-1 px-1.5 text-left font-bold w-[25%]">Hardware &amp; Options</th>
              <th className="py-1 px-1.5 text-center font-bold w-[10%]">Qty</th>
              <th className="py-1 px-1.5 text-right font-mono font-bold w-[15%]">Price</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: `${bodyFs}px` }}>
            {effectiveDoors.map((item: any, idx: number) => {
              const qty = Number(item.quantity) || 1;
              const unitNetPrice = (item.netBasePrice || item.inksterBasePrice || 0);
              const lineTotal = (item.totalPrice || (unitNetPrice * qty));

              return (
                <tr key={item.id || idx} className="border-b border-[#cbd5e1] bg-white">
                  <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 text-[#334155] font-semibold">
                    {idx + 1}
                  </td>
                  <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 font-bold text-[#0f172a]">
                    <div>{item.customDescription || item.presetLabel}</div>
                    {item.notes && (
                      <div className="text-[#64748b] text-[10px] font-normal">{item.notes}</div>
                    )}
                  </td>
                  <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 text-[#1e293b]">
                    <div className="capitalize">{item.hardwareType === 'standard' ? 'Standard Lockset' : item.hardwareType === 'customer' ? 'Customer Supplied' : item.customHardwareName || 'None'}</div>
                    {item.upgradeOption?.enabled && (
                      <div className="text-amber-700 font-semibold text-[10px]">
                        Option: {item.upgradeOption.title} (+{formatMoney(Math.round((item.upgradeOption.subtotalDifference || 0) * 100))})
                      </div>
                    )}
                  </td>
                  <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 text-center font-bold text-[#0f172a]">
                    {qty}
                  </td>
                  <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 text-right font-mono">
                    <span className="font-bold text-[#0f172a]">{formatMoney(Math.round(lineTotal * 100))}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Itemized Jobsite Labour & Special Site Services (if selected for doors) */}
        {effectiveDoorUpcharges.length > 0 && (
          <div className="mt-2 pt-2 border-t border-[#cbd5e1]">
            <div className="flex justify-between items-center mb-1 text-xs">
              <span style={{ fontSize: `${h2Fs}px` }} className="font-bold uppercase tracking-wider text-[#0f172a]">
                Jobsite Labour &amp; Special Site Services
              </span>
              <span style={{ fontSize: `${microFs}px` }} className="text-[#64748b] font-medium">
                {effectiveDoorUpcharges.length} service{effectiveDoorUpcharges.length > 1 ? 's' : ''}
              </span>
            </div>
            <table className="w-full border-collapse" style={{ fontSize: `${bodyFs}px` }}>
              <thead>
                <tr className={isModern ? "border-b-2 border-[#0f172a] text-[#0f172a]" : isExecutive ? "border-b-2 border-[#0f172a] text-[#0f172a]" : "border-b border-[#cbd5e1] bg-[#f1f5f9] text-[#0f172a]"}>
                  <th className="py-1 px-1.5 text-left font-bold w-[5%]">#</th>
                  <th className="py-1 px-1.5 text-left font-bold w-[55%]">Service Description</th>
                  <th className="py-1 px-1.5 text-center font-bold w-[12%]">Qty</th>
                  <th className="py-1 px-1.5 text-right font-mono font-bold w-[13%]">Rate</th>
                  <th className="py-1 px-1.5 text-right font-mono font-bold w-[15%]">Total</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: `${bodyFs}px` }}>
                {effectiveDoorUpcharges.map((u: any, uIdx: number) => {
                  const qty = Number(u.qty) || 1;
                  const rate = Number(u.rate) || 0;
                  const total = Number(u.total ?? (rate * qty));
                  return (
                    <tr key={u.upchargeId || u.id || uIdx} className="border-b border-[#cbd5e1] bg-white">
                      <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 text-[#334155] font-semibold">
                        {uIdx + 1}
                      </td>
                      <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 font-bold text-[#0f172a]">
                        {u.label}
                      </td>
                      <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 text-center font-bold text-[#0f172a]">
                        {qty}
                      </td>
                      <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 text-right font-mono text-[#334155]">
                        {formatMoney(Math.round(rate * 100))}
                      </td>
                      <td style={{ paddingTop: `${rowPy}px`, paddingBottom: `${rowPy}px` }} className="px-1.5 text-right font-mono font-bold text-[#0f172a]">
                        {formatMoney(Math.round(total * 100))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  const renderSummaryRows = (textColor: string = 'text-[#0f172a]', rowPyOverride?: number) => {
    const py = rowPyOverride ?? 1;
    return (
      <>
        {/* Line 1: [Qty] [Pane] [Color] Window (Window base glass total) */}
        {hasWindows && winMaterialsCents > 0 && renderWindowBasePriceRows(textColor)}

        {/* Line 2: [Qty] [Pane] Sealed Unit (Sealed unit glass total pre-8%) or Service */}
        {hasSealedUnits && (
          suGlassCents > 0 ? (
            <tr className="border-b border-[#e2e8f0]">
              <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className={`${textColor} font-medium capitalize`}>
                {suSummarySentence}
              </td>
              <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className={`text-right font-mono font-bold ${textColor}`}>
                {formatMoney(suGlassCents)}
              </td>
            </tr>
          ) : isAttachedSUService && hasAnyAttached ? (
            <tr className="border-b border-[#e2e8f0]">
              <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className={`${textColor} font-medium`}>
                {suSummarySentence}
              </td>
              <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className={`text-right font-mono text-[#64748b] text-[10px] font-normal`}>
                (Labour below)
              </td>
            </tr>
          ) : null
        )}

        {/* Line 3: Door Units (Itemized as Headings) */}
        {hasDoors && (
          effectiveDoors.length > 0 ? (
            effectiveDoors.map((dItem: any, dIdx: number) => {
              const q = Number(dItem.quantity) || 1;
              const heading = formatDoorItemHeading(dItem);
              const itemBaseCents = Math.round((dItem.inksterBasePrice || 0) * q * 100);
              return (
                <tr key={dItem.id || dIdx} className="border-b border-[#e2e8f0]">
                  <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className={`${textColor} font-medium`}>
                    {heading}
                  </td>
                  <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className={`text-right font-mono font-bold ${textColor}`}>
                    {formatMoney(itemBaseCents)}
                  </td>
                </tr>
              );
            })
          ) : doorMaterialsCents > 0 ? (
            <tr className="border-b border-[#e2e8f0]">
              <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className={`${textColor} font-medium capitalize`}>
                {doorSummarySentence}
              </td>
              <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className={`text-right font-mono font-bold ${textColor}`}>
                {formatMoney(doorMaterialsCents)}
              </td>
            </tr>
          ) : null
        )}

        {/* Door Hardware if any */}
        {hasDoors && Boolean((effectiveDoorTotals?.hardwareTotal || 0) > 0) && (
          <tr className="border-b border-[#e2e8f0]">
            <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className={`${textColor} font-medium`}>
              Door Lockset &amp; Hardware
            </td>
            <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className={`text-right font-mono font-bold ${textColor}`}>
              {formatMoney(Math.round(Number(effectiveDoorTotals.hardwareTotal) * 100))}
            </td>
          </tr>
        )}

        {/* Line 4: Jambs & Casing (Window only, if applicable) */}
        {winJCCents > 0 && (
          <tr className="border-b border-[#e2e8f0]">
            <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className={`${textColor} font-medium`}>
              {jcLabel}
            </td>
            <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className={`text-right font-mono font-bold ${textColor}`}>
              {formatMoney(winJCCents)}
            </td>
          </tr>
        )}

        {/* Line 5: Misc (Window misc + Sealed unit misc + Door misc) */}
        {effectiveMiscTotalCents > 0 && (
          <tr className="border-b border-[#e2e8f0]">
            <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className={`${textColor} font-medium`}>
              Miscellaneous
            </td>
            <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className={`text-right font-mono font-bold ${textColor}`}>
              {formatMoney(effectiveMiscTotalCents)}
            </td>
          </tr>
        )}

        {/* Line 6: Labour (Deduplicated combined installation & host travel) */}
        {effectiveLabourTotalCents > 0 && (
          <tr className="border-b border-[#e2e8f0]">
            <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className={`${textColor} font-medium`}>
              Labour <span style={{ fontSize: `${smallFs}px` }} className="text-[#334155]">(incl. installation &amp; travel)</span>
            </td>
            <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className={`text-right font-mono font-bold ${textColor}`}>
              {formatMoney(effectiveLabourTotalCents)}
            </td>
          </tr>
        )}

        {/* Line 7: Surcharge (Window surcharge + Sealed unit 8% surcharge + Door 8% surcharge) */}
        {effectiveSurchargeTotalCents > 0 && (
          <tr className="border-b border-[#e2e8f0]">
            <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className={`${textColor} font-medium`}>
              Surcharge
            </td>
            <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className={`text-right font-mono font-bold ${textColor}`}>
              +{formatMoney(effectiveSurchargeTotalCents)}
            </td>
          </tr>
        )}

        {/* Line 8: Discount (Window promos/discounts only) */}
        {promoDiscountCents > 0 && (
          <tr className="border-b border-[#cbd5e1] bg-white text-emerald-900 font-semibold">
            <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className="pl-1">
              <span style={{ fontSize: `${microFs}px` }} className="uppercase font-bold tracking-wider text-emerald-700 block">Promo Applied:</span>
              {resolvedPromoName}
            </td>
            <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className="text-right font-mono text-emerald-700 font-bold pr-1">
              −{formatMoney(promoDiscountCents)}
            </td>
          </tr>
        )}

        {monthlyDiscountCents > 0 && (
          <tr className="border-b border-[#e2e8f0] text-emerald-800 font-semibold">
            <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }}>Monthly Discount</td>
            <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className="text-right font-mono">
              −{formatMoney(monthlyDiscountCents)}
            </td>
          </tr>
        )}

        {/* Line 8b: Door Discount (Separate row) */}
        {doorDiscountCents > 0 && (
          <tr className="border-b border-[#cbd5e1] bg-white text-emerald-900 font-semibold">
            <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className="pl-1">
              <span style={{ fontSize: `${microFs}px` }} className="uppercase font-bold tracking-wider text-emerald-700 block">Discount Applied:</span>
              10% Door Discount (Non-Storm Doors)
            </td>
            <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className="text-right font-mono text-emerald-700 font-bold pr-1">
              −{formatMoney(doorDiscountCents)}
            </td>
          </tr>
        )}

        {/* Line 9: Subtotal (Pre-tax combined subtotal) */}
        <tr className="border-t-2 border-[#cbd5e1] border-b border-[#cbd5e1] bg-[#f8fafc]/80 font-bold text-[#0f172a]">
          <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className="text-[#0f172a]">Subtotal</td>
          <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className="text-right font-mono font-bold text-[#0f172a]">
            {formatMoney(finalSubtotalCents)}
          </td>
        </tr>

        {/* Line 10: HST */}
        <tr className="border-b border-[#cbd5e1] text-[#0f172a]">
          <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className="text-[#334155]">{finalHstLabel}</td>
          <td style={{ paddingTop: `${py}px`, paddingBottom: `${py}px` }} className="text-right font-mono text-[#0f172a]">
            {formatMoney(finalHstAmountCents)}
          </td>
        </tr>
      </>
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
          {/* Header: Modern Minimalist Header */}
          <div className="border-t-4 border-indigo-600 border-b border-slate-300 py-2.5 mb-3 bg-slate-50/50 px-2 rounded-t">
            <div className="flex justify-between items-baseline">
              <div>
                <h1 style={{ fontSize: `${titleFs}px` }} className="font-extrabold tracking-tight text-slate-900 m-0 uppercase leading-none">
                  The Window &amp; Door Store
                </h1>
                <div style={{ fontSize: `${smallFs}px` }} className="text-indigo-600 font-bold uppercase tracking-wider mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>{invoiceSubtitle}</span>
                </div>
              </div>
              <div className="text-right">
                <div style={{ fontSize: `${h2Fs}px` }} className="font-mono font-bold text-slate-900">
                  {quoteNumber || 'REF-QUOTE'}
                </div>
                <div style={{ fontSize: `${smallFs}px` }} className="text-slate-500 font-medium" suppressHydrationWarning>
                  {currentDate}
                </div>
              </div>
            </div>

            {/* Compact Inline Customer & Region Bar */}
            {(customerName || regionName || preparedBy) && (
              <div style={{ fontSize: `${bodyFs}px` }} className="mt-1 pt-1 border-t border-slate-200 flex justify-between items-center text-[#0f172a] flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  {customerName && (
                    <div>
                      <span className="text-slate-500 uppercase font-bold text-[9px] mr-1">Client:</span>
                      <span className="font-bold text-slate-900">{customerName}</span>
                    </div>
                  )}
                  {regionName && (
                    <div>
                      <span className="text-slate-500 uppercase font-bold text-[9px] mr-1">Region:</span>
                      <span className="font-semibold text-slate-800">{regionName}</span>
                    </div>
                  )}
                </div>
                {preparedBy && (
                  <div>
                    <span className="text-slate-500 uppercase font-bold text-[9px] mr-1">Prepared By:</span>
                    <span className="font-semibold text-slate-800">{preparedBy}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Schedules (Windows, Sealed Units, Doors) */}
          {renderWindowsTable('modern')}
          {renderSealedUnitsTable('modern')}
          {renderDoorsTable('modern')}

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

              {/* Optional Door Upgrade Offers */}
              {doorUpgradeItems.map((dItem: any, dIdx: number) => (
                <div key={dIdx} className="p-2 bg-white border border-[#d97706] rounded text-[#0f172a]">
                  <div style={{ fontSize: `${smallFs}px` }} className="font-bold uppercase tracking-wider flex justify-between items-center text-[#0f172a]">
                    <span>Option for Door: {dItem.upgradeOption?.title}</span>
                    <span className="font-mono text-[#b45309] font-bold">+{formatMoney(Math.round((dItem.upgradeOption?.subtotalDifference || 0) * 100))}</span>
                  </div>
                  <div style={{ fontSize: `${microFs}px` }} className="text-[#334155] mt-0.5">
                    Optional upgrade for {dItem.customDescription || dItem.presetLabel || 'Door'}. Net pre-tax difference, not included in quote total.
                  </div>
                </div>
              ))}

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
                  {renderSummaryRows('text-[#0f172a]')}
                </tbody>
              </table>

              {/* 8. Total */}
              <div className="border-2 border-[#0f172a] bg-white text-[#0f172a] rounded p-2 flex justify-between items-center font-extrabold mt-2">
                <span style={{ fontSize: `${h2Fs}px` }} className="tracking-wide uppercase text-[#0f172a]">Total</span>
                <span style={{ fontSize: `${Math.round(baseFs * 1.35)}px` }} className="font-mono font-black text-[#0f172a]">{formatMoney(finalTotalCents)}</span>
              </div>

              {/* 50% Deposit & Final 50% Balance */}
              <div className="grid grid-cols-2 gap-2 mt-2 pt-1.5 border-t border-[#cbd5e1]">
                <div className="bg-white p-1.5 rounded border border-[#cbd5e1]">
                  <div style={{ fontSize: `${microFs}px` }} className="text-[#334155] uppercase tracking-wider font-semibold">50% Deposit</div>
                  <div style={{ fontSize: `${bodyFs}px` }} className="font-mono font-bold text-[#0f172a] mt-0.5">{formatMoney(finalFirstPayment)}</div>
                </div>
                <div className="bg-white p-1.5 rounded border border-[#cbd5e1]">
                  <div style={{ fontSize: `${microFs}px` }} className="text-[#334155] uppercase tracking-wider font-semibold">Final 50% Balance</div>
                  <div style={{ fontSize: `${bodyFs}px` }} className="font-mono font-bold text-[#0f172a] mt-0.5">{formatMoney(finalSecondPayment)}</div>
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
          {/* Executive Header: Ink-Saving Architectural Corporate Header */}
          <div className="bg-white border-y-2 border-[#0f172a] py-2 px-1 mb-2.5">
            <div className="flex justify-between items-baseline">
              <div>
                <h1 style={{ fontSize: `${titleFs}px` }} className="font-black tracking-wider text-[#0f172a] m-0 uppercase leading-none">
                  The Window &amp; Door Store
                </h1>
                <div style={{ fontSize: `${smallFs}px` }} className="text-amber-800 font-bold uppercase tracking-widest mt-1">
                  <span>{invoiceSubtitle}</span>
                </div>
              </div>
              <div className="text-right">
                <div style={{ fontSize: `${h2Fs}px` }} className="font-mono font-bold text-[#0f172a]">
                  {quoteNumber || 'REF-QUOTE'}
                </div>
                <div style={{ fontSize: `${smallFs}px` }} className="text-slate-600 font-medium" suppressHydrationWarning>
                  {currentDate}
                </div>
              </div>
            </div>

            {/* Compact Inline Customer & Region Bar */}
            {(customerName || regionName || preparedBy) && (
              <div style={{ fontSize: `${bodyFs}px` }} className="mt-1.5 pt-1.5 border-t border-slate-300 flex justify-between items-center text-slate-800 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  {customerName && (
                    <div>
                      <span className="text-slate-500 uppercase font-bold text-[9px] mr-1">Client:</span>
                      <span className="font-bold text-[#0f172a]">{customerName}</span>
                    </div>
                  )}
                  {regionName && (
                    <div>
                      <span className="text-slate-500 uppercase font-bold text-[9px] mr-1">Region:</span>
                      <span className="font-semibold text-slate-700">{regionName}</span>
                    </div>
                  )}
                </div>
                {preparedBy && (
                  <div>
                    <span className="text-slate-500 uppercase font-bold text-[9px] mr-1">Prepared By:</span>
                    <span className="font-semibold text-slate-700">{preparedBy}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Product Schedules (Windows, Sealed Units, Doors) */}
          {renderWindowsTable('executive')}
          {renderSealedUnitsTable('executive')}
          {renderDoorsTable('executive')}

          {/* Bottom Grid: Balanced 2-Column Compact Scope & Accounting */}
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

                {/* Optional Door Upgrade Offers */}
                {doorUpgradeItems.map((dItem: any, dIdx: number) => (
                  <div key={dIdx} className="p-2 bg-white border border-[#d97706] rounded text-[#0f172a]">
                    <div style={{ fontSize: `${smallFs}px` }} className="font-bold uppercase tracking-wider flex justify-between items-center text-[#0f172a]">
                      <span>Option for Door: {dItem.upgradeOption?.title}</span>
                      <span className="font-mono text-[#b45309] font-bold">+{formatMoney(Math.round((dItem.upgradeOption?.subtotalDifference || 0) * 100))}</span>
                    </div>
                    <div style={{ fontSize: `${microFs}px` }} className="text-[#334155] mt-0.5">
                      Optional upgrade for {dItem.customDescription || dItem.presetLabel || 'Door'}. Net pre-tax difference, not included in quote total.
                    </div>
                  </div>
                ))}

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
                    {renderSummaryRows('text-[#0f172a]')}
                  </tbody>
                </table>

                {/* Total Banner */}
                <div className="border-2 border-[#0f172a] bg-white text-[#0f172a] rounded-md p-2 flex justify-between items-center font-extrabold mt-2">
                  <span style={{ fontSize: `${h2Fs}px` }} className="tracking-wide uppercase text-[#0f172a]">Total</span>
                  <span style={{ fontSize: `${Math.round(baseFs * 1.35)}px` }} className="font-mono font-black text-[#0f172a]">{formatMoney(finalTotalCents)}</span>
                </div>

                {/* Deposit Terms */}
                <div className="grid grid-cols-2 gap-2 mt-2 pt-1.5 border-t border-[#cbd5e1]">
                  <div className="bg-white p-1.5 rounded-md border border-[#cbd5e1]">
                    <div style={{ fontSize: `${microFs}px` }} className="text-[#334155] uppercase tracking-wider font-semibold">50% Deposit</div>
                    <div style={{ fontSize: `${bodyFs}px` }} className="font-mono font-bold text-[#0f172a] mt-0.5">{formatMoney(finalFirstPayment)}</div>
                  </div>
                  <div className="bg-white p-1.5 rounded-md border border-[#cbd5e1]">
                    <div style={{ fontSize: `${microFs}px` }} className="text-[#334155] uppercase tracking-wider font-semibold">Final 50% Balance</div>
                    <div style={{ fontSize: `${bodyFs}px` }} className="font-mono font-bold text-[#0f172a] mt-0.5">{formatMoney(finalSecondPayment)}</div>
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
                  <span>{invoiceSubtitle}</span>
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

          {/* Product Schedules (Windows, Sealed Units, Doors) */}
          {renderWindowsTable('cards')}
          {renderSealedUnitsTable('cards')}
          {renderDoorsTable('cards')}

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

          {/* Bottom Section: Balanced 2-Column Compact Scope & Accounting */}
          <div className="grid grid-cols-[1.1fr_1.15fr] items-start border-t-2 border-[#0f172a]" style={{ gap: `${cardGap * 1.5}px`, paddingTop: `${rowPy}px` }}>
            {/* Left Column: Materials, Travel & Instructions */}
              <div className="space-y-2">
                {jcItems.length > 0 && (
                  <div className="border border-[#cbd5e1] rounded p-2 bg-white">
                    <div style={{ fontSize: `${smallFs}px` }} className="font-bold text-[#0f172a] uppercase tracking-wider mb-0.5 pb-0.5 border-b border-[#cbd5e1]">
                      Jamb &amp; Casing Specifications
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

                {/* Optional Door Upgrade Offers */}
                {doorUpgradeItems.map((dItem: any, dIdx: number) => (
                  <div key={dIdx} className="p-1.5 bg-white border border-[#d97706] rounded flex justify-between items-center" style={{ fontSize: `${smallFs}px` }}>
                    <div>
                      <span className="font-bold text-[#0f172a] block">Option for Door: {dItem.upgradeOption?.title}</span>
                      <span style={{ fontSize: `${microFs}px` }} className="text-[#334155]">
                        Optional upgrade for {dItem.customDescription || dItem.presetLabel || 'Door'} (pre-tax difference)
                      </span>
                    </div>
                    <span className="font-mono font-black text-[#b45309]">+{formatMoney(Math.round((dItem.upgradeOption?.subtotalDifference || 0) * 100))}</span>
                  </div>
                ))}

                {quoteNotes && quoteNotes.trim() && (
                  <div className="p-2 bg-white border border-[#cbd5e1] rounded space-y-0.5">
                    <div style={{ fontSize: `${smallFs}px` }} className="font-bold text-[#0f172a] uppercase tracking-wider mb-0.5 pb-0.5 border-b border-[#cbd5e1]">
                      Special Instructions &amp; Project Notes
                    </div>
                    {renderFormattedNotes(quoteNotes, smallFs)}
                  </div>
                )}
              </div>

              {/* Right Column: Financial Summary */}
              <div className="border border-[#cbd5e1] rounded bg-white shadow-sm" style={{ padding: `${rowPy * 1.25}px` }}>
                <div style={{ fontSize: `${h2Fs}px` }} className="font-bold uppercase tracking-wider text-[#0f172a] mb-1 pb-0.5 border-b-2 border-[#0f172a]">
                  Summary
                </div>

                <table className="w-full border-collapse" style={{ fontSize: `${bodyFs}px` }}>
                  <tbody>
                    {renderSummaryRows('text-[#0f172a]', rowPy * 0.6)}
                  </tbody>
                </table>

                {/* Total Banner - Clean Ink-Saving Architectural Border */}
                <div className="border-2 border-[#0f172a] bg-white text-[#0f172a] rounded-md flex justify-between items-center font-extrabold mt-2" style={{ padding: `${rowPy}px` }}>
                  <span style={{ fontSize: `${h2Fs}px` }} className="tracking-wide uppercase text-[#0f172a]">Total</span>
                  <span style={{ fontSize: `${titleFs}px` }} className="font-mono font-black text-[#0f172a]">{formatMoney(finalTotalCents)}</span>
                </div>

                {/* Deposit Terms */}
                <div className="grid grid-cols-2 gap-2 mt-2 pt-1.5 border-t border-[#cbd5e1]">
                  <div className="bg-white p-1.5 rounded-md border border-[#cbd5e1]">
                    <div style={{ fontSize: `${microFs}px` }} className="text-[#334155] uppercase tracking-wider font-semibold">50% Deposit</div>
                    <div style={{ fontSize: `${bodyFs}px` }} className="font-mono font-bold text-[#0f172a] mt-0.5">{formatMoney(finalFirstPayment)}</div>
                  </div>
                  <div className="bg-white p-1.5 rounded-md border border-[#cbd5e1]">
                    <div style={{ fontSize: `${microFs}px` }} className="text-[#334155] uppercase tracking-wider font-semibold">Final 50% Balance</div>
                    <div style={{ fontSize: `${bodyFs}px` }} className="font-mono font-bold text-[#0f172a] mt-0.5">{formatMoney(finalSecondPayment)}</div>
                  </div>
                </div>
              </div>
            </div>
        </>
      )}
    </div>
  );
}
