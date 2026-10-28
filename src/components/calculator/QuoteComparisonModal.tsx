'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Sparkles,
  X,
  FileUp,
  CheckCircle2,
  RefreshCw,
  ArrowUpRight,
  TrendingDown,
  RotateCcw,
  Sliders,
  ChevronDown,
  ChevronUp,
  Pencil,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  formatMoney,
  toCents,
  calculatePromo,
  parseInches,
  DBPromo,
} from '@/lib/promo-logic';
import { readPdfItems, parseManufacturerPdfItems, extractPdfMetadata } from '@/lib/pdf-parser';
import { UIWindowItem } from '@/hooks/useCalculatorWindows';
import { toast } from 'sonner';

export interface AttachedUpgradeOption {
  title: string;
  amountPreTaxCents: number;
}

export interface QuoteComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  // Option A (Base Quote)
  currentWindows: UIWindowItem[];
  customerName: string;
  quoteNumber: string;
  surchargeRate: number;
  isSupplyOnly: boolean;
  supplyJambId: string;
  supplyJambName: string;
  supplyJambRate: string;
  supplyCasingId: string;
  supplyCasingName: string;
  supplyCasingRate: string;
  effectiveJC: number;
  effectiveMisc: number;
  effectiveLabour: number;
  availablePromos: DBPromo[];
  activePromoId: string;
  hstRate: number;
  quoteResultA: any;
  afterDiscountA: number;
  totalA: number;
  firstPaymentA: number;
  secondPaymentA: number;
  // Two-way Option Swapping & Full Workspace Staging
  appliedOption: 'A' | 'B';
  isComparisonStaging?: boolean;
  onApplyOption: (
    target: 'A' | 'B',
    windows: UIWindowItem[],
    meta?: { customerName?: string; quoteNumber?: string },
    overrides?: {
      jambId?: string;
      jambRate?: string;
      casingId?: string;
      casingRate?: string;
      extraLabour?: string;
    }
  ) => void;
  onApplyAndCustomize?: (
    windows: UIWindowItem[],
    meta?: { customerName?: string; quoteNumber?: string },
    overrides?: {
      jambId?: string;
      jambRate?: string;
      casingId?: string;
      casingRate?: string;
      extraLabour?: string;
    }
  ) => void;
  onKeepOptionB?: () => void;
  // Attached Upgrade on PDF
  attachedUpgrade: AttachedUpgradeOption | null;
  onAttachUpgrade: (upgrade: AttachedUpgradeOption | null) => void;
}

function getWindowsSummarySentence(windows: UIWindowItem[]): string {
  let dW = 0, tW = 0, dP = 0, tP = 0;
  windows.forEach((w) => {
    const q = Math.max(1, Number(w.qty) || 1);
    const isTriple = Number(w.triple) > 0 || toCents(w.triple) > 0;
    const isPainted = w.color && w.color.toLowerCase() === 'painted';
    if (isPainted) {
      if (isTriple) tP += q;
      else dP += q;
    } else {
      if (isTriple) tW += q;
      else dW += q;
    }
  });
  const totalQty = dW + tW + dP + tP;
  if (totalQty === 0) return '0 windows';

  const parts: string[] = [];
  if (dW > 0 && tW > 0) parts.push(`${dW} dual & ${tW} triple pane white`);
  else if (dW > 0) parts.push(`${dW} dual pane white`);
  else if (tW > 0) parts.push(`${tW} triple pane white`);

  if (dP > 0 && tP > 0) parts.push(`${dP} dual & ${tP} triple pane painted`);
  else if (dP > 0) parts.push(`${dP} dual pane painted`);
  else if (tP > 0) parts.push(`${tP} triple pane painted`);

  return `${totalQty} window${totalQty === 1 ? '' : 's'} (${parts.join(', ')})`;
}

export function QuoteComparisonModal({
  isOpen,
  onClose,
  currentWindows,
  customerName,
  quoteNumber,
  surchargeRate,
  isSupplyOnly,
  supplyJambId,
  supplyJambName,
  supplyJambRate,
  supplyCasingId,
  supplyCasingName,
  supplyCasingRate,
  effectiveJC,
  effectiveMisc,
  effectiveLabour,
  availablePromos,
  activePromoId,
  hstRate,
  quoteResultA,
  afterDiscountA,
  totalA,
  firstPaymentA,
  secondPaymentA,
  appliedOption,
  isComparisonStaging = false,
  onApplyOption,
  onApplyAndCustomize,
  onKeepOptionB,
  attachedUpgrade,
  onAttachUpgrade,
}: QuoteComparisonModalProps) {
  const [mounted, setMounted] = useState(false);
  const [optionBFile, setOptionBFile] = useState<File | null>(null);
  const [optionBWindows, setOptionBWindows] = useState<UIWindowItem[] | null>(null);
  const [optionBMeta, setOptionBMeta] = useState<{ customerName?: string; quoteNumber?: string }>({});
  const [isParsing, setIsParsing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // In-Modal Quick Overrides for Option B
  const [showOverrides, setShowOverrides] = useState(false);
  const [overrideJambId, setOverrideJambId] = useState<string>('inherit');
  const [overrideJambRate, setOverrideJambRate] = useState<string>('');
  const [overrideCasingId, setOverrideCasingId] = useState<string>('inherit');
  const [overrideCasingRate, setOverrideCasingRate] = useState<string>('');

  const [dbJambs, setDbJambs] = useState<any[]>([]);
  const [dbCasings, setDbCasings] = useState<any[]>([]);
  const [extraLinPerWindow, setExtraLinPerWindow] = useState<number>(2.17);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch settings for jamb/casing rate inheritance
  useEffect(() => {
    if (isOpen) {
      fetch('/api/settings')
        .then((r) => r.json())
        .then((d) => {
          if (d?.jambs?.length) setDbJambs(d.jambs);
          if (d?.casings?.length) setDbCasings(d.casings);
        })
        .catch(() => {});

      fetch('/api/regions')
        .then((r) => r.json())
        .then((regions) => {
          if (Array.isArray(regions)) {
            const supply = regions.find(
              (r: any) => r.isSupplyOnly || r.name?.toLowerCase().includes('supply')
            );
            if (supply && supply.extraLinPerWindow !== undefined) {
              setExtraLinPerWindow(Number(supply.extraLinPerWindow) || 2.17);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
      return () => {
        document.body.classList.remove('overflow-hidden');
      };
    }
  }, [isOpen]);

  // Handle PDF parsing for Option B with duplicate check
  const processOptionBFile = async (file: File) => {
    if (!file) return;
    try {
      setIsParsing(true);
      toast.info('Parsing upgrade PDF...');
      const items = await readPdfItems(file);
      const meta = extractPdfMetadata(items);

      const parsed = parseManufacturerPdfItems(items).map((w) => ({
        id: w.id,
        qty: String(w.qty),
        base: w.base ? (w.base / 100).toString() : '',
        argon: w.argon ? (w.argon / 100).toString() : '',
        solar: w.solar ? (w.solar / 100).toString() : '',
        triple: w.triple ? (w.triple / 100).toString() : '',
        w: w.w || '',
        h: w.h || '',
        color: w.color || 'White',
      }));

      if (parsed.length === 0) {
        toast.error('No valid window configurations found in the uploaded PDF.');
        return;
      }

      // Check if identical to current quote
      const isDuplicate =
        parsed.length === currentWindows.length &&
        parsed.every((pw, idx) => {
          const cw = currentWindows[idx];
          if (!cw) return false;
          return (
            String(pw.qty || '1') === String(cw.qty || '1') &&
            String(pw.base || '') === String(cw.base || '') &&
            String(pw.triple || '') === String(cw.triple || '') &&
            String(pw.argon || '') === String(cw.argon || '') &&
            String(pw.solar || '') === String(cw.solar || '') &&
            String(pw.w || '').trim() === String(cw.w || '').trim() &&
            String(pw.h || '').trim() === String(cw.h || '').trim() &&
            String(pw.color || 'White').toLowerCase() === String(cw.color || 'White').toLowerCase()
          );
        });

      if (isDuplicate) {
        toast.error(
          'This PDF has identical window configurations to Option A. Please select an upgraded quote (e.g. Triple Pane or Painted) to compare.'
        );
        return;
      }

      setOptionBMeta(meta);
      setOptionBFile(file);
      setOptionBWindows(parsed);
      toast.success(`Parsed ${parsed.length} window(s) from ${file.name}`);
    } catch (err: any) {
      toast.error(`Failed to parse PDF: ${err.message || 'Unknown error'}`);
    } finally {
      setIsParsing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processOptionBFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type === 'application/pdf') {
      processOptionBFile(file);
    } else {
      toast.error('Please drop a valid PDF file.');
    }
  };

  // Resolve Option A's selected jamb and casing labels for display
  const resolvedOptionAJambLabel = useMemo(() => {
    if (!supplyJambId || supplyJambId === 'none') return 'None';
    const match = dbJambs.find((j) => j.id === supplyJambId);
    return match?.label || match?.name || supplyJambName || 'None';
  }, [supplyJambId, supplyJambName, dbJambs]);

  const resolvedOptionACasingLabel = useMemo(() => {
    if (!supplyCasingId || supplyCasingId === 'none') return 'None';
    const match = dbCasings.find((c) => c.id === supplyCasingId);
    return match?.label || match?.name || supplyCasingName || 'None';
  }, [supplyCasingId, supplyCasingName, dbCasings]);

  const selectedOverrideJambDisplay = useMemo(() => {
    if (overrideJambId === 'inherit') {
      return `Same as Option A (${resolvedOptionAJambLabel})`;
    }
    if (overrideJambId === 'none') {
      return 'None';
    }
    const match = dbJambs.find((j) => j.id === overrideJambId);
    return match?.label || match?.name || 'Select jamb';
  }, [overrideJambId, resolvedOptionAJambLabel, dbJambs]);

  const selectedOverrideCasingDisplay = useMemo(() => {
    if (overrideCasingId === 'inherit') {
      return `Same as Option A (${resolvedOptionACasingLabel})`;
    }
    if (overrideCasingId === 'none') {
      return 'None';
    }
    const match = dbCasings.find((c) => c.id === overrideCasingId);
    return match?.label || match?.name || 'Select casing';
  }, [overrideCasingId, resolvedOptionACasingLabel, dbCasings]);

  // Determine effective jamb and casing rates for Option B (supporting in-modal override)
  const effectiveJambRateB = useMemo(() => {
    const jId = overrideJambId === 'inherit' ? supplyJambId : overrideJambId;
    if (jId === 'none') return 0;
    if (jId === 'custom') return Number(overrideJambId === 'inherit' ? supplyJambRate : overrideJambRate) || 0;
    const match = dbJambs.find((j) => j.id === jId);
    return match ? Number(match.rate) : 0;
  }, [overrideJambId, overrideJambRate, supplyJambId, supplyJambRate, dbJambs]);

  const effectiveCasingRateB = useMemo(() => {
    const cId = overrideCasingId === 'inherit' ? supplyCasingId : overrideCasingId;
    if (cId === 'none') return 0;
    if (cId === 'custom') return Number(overrideCasingId === 'inherit' ? supplyCasingRate : overrideCasingRate) || 0;
    const match = dbCasings.find((c) => c.id === cId);
    return match ? Number(match.rate) : 0;
  }, [overrideCasingId, overrideCasingRate, supplyCasingId, supplyCasingRate, dbCasings]);

  // Option B Financial Calculations
  const optionBFinancials = useMemo(() => {
    if (!optionBWindows || optionBWindows.length === 0) return null;

    const validWindows = optionBWindows.map((w) => ({
      id: w.id,
      qty: Math.max(1, Number(w.qty) || 1),
      base: toCents(w.base),
      argon: toCents(w.argon),
      solar: toCents(w.solar),
      triple: toCents(w.triple),
      w: w.w || '',
      h: w.h || '',
      color: w.color || 'White',
    }));

    // Option B JC calculation: strictly handle 'none', 'inherit', and overrides
    let jcTotalCents = 0;
    let linearFeet = 0;

    if (overrideJambId === 'none' && overrideCasingId === 'none') {
      jcTotalCents = 0;
    } else if (overrideJambId === 'inherit' && overrideCasingId === 'inherit') {
      jcTotalCents = effectiveJC;
    } else {
      optionBWindows.forEach((w) => {
        const W = parseInches(w.w);
        const H = parseInches(w.h);
        const q = Math.max(1, Number(w.qty) || 1);
        if (W && H) {
          linearFeet += ((W * 2 + H * 2) / 12) * q + q * extraLinPerWindow;
        }
      });
      linearFeet = Math.round(linearFeet * 100) / 100;
      const combinedRate = effectiveJambRateB + effectiveCasingRateB;
      jcTotalCents = Math.round(linearFeet * combinedRate * 100);
    }

    // Promo calculation matching Option A
    const selectedPromo =
      availablePromos.find((p) => p._id === activePromoId) ||
      availablePromos.find((p) => p.isActive) || {
        _id: 'none',
        name: 'Standard Price',
        type: 'PERCENTAGE',
        isActive: true,
      };

    const promoResult = calculatePromo(selectedPromo as any, validWindows, surchargeRate);

    const beforeTaxDiscount =
      promoResult.base +
      promoResult.surcharge +
      jcTotalCents +
      effectiveMisc +
      effectiveLabour;

    const promoDiscount = promoResult.promoDiscount || 0;
    const afterDiscount = Math.max(0, beforeTaxDiscount - promoDiscount);

    let hst = 0;
    if (hstRate === 13) {
      hst = Math.round(afterDiscount * 0.13);
    } else if (hstRate === 8) {
      const material = Math.max(
        0,
        promoResult.base + promoResult.surcharge - promoDiscount + jcTotalCents
      );
      const service = Math.max(0, afterDiscount - material);
      hst = Math.round(material * 0.05) + Math.round(service * 0.13);
    }

    const total = afterDiscount + hst;
    const firstPayment = Math.floor(total / 2);
    const secondPayment = total - firstPayment;

    return {
      validWindows,
      base: promoResult.base,
      surcharge: promoResult.surcharge,
      promoDiscount,
      jc: jcTotalCents,
      linearFeet,
      labour: effectiveLabour,
      beforeTaxDiscount,
      afterDiscount,
      hst,
      total,
      firstPayment,
      secondPayment,
      promoResult,
    };
  }, [
    optionBWindows,
    surchargeRate,
    isSupplyOnly,
    extraLinPerWindow,
    effectiveJambRateB,
    effectiveCasingRateB,
    effectiveJC,
    effectiveMisc,
    effectiveLabour,
    availablePromos,
    activePromoId,
    hstRate,
  ]);

  // Delta calculations (focusing on pre-tax)
  const delta = useMemo(() => {
    if (!optionBFinancials) return null;
    const preTax = optionBFinancials.afterDiscount - afterDiscountA;
    const tax = optionBFinancials.hst - (totalA - afterDiscountA);
    const total = optionBFinancials.total - totalA;
    const payment = Math.floor(total / 2);

    return {
      preTax,
      tax,
      total,
      payment,
      isUpgrade: preTax > 0,
      isSavings: preTax < 0,
      isEqual: preTax === 0,
    };
  }, [optionBFinancials, afterDiscountA, totalA]);

  // Auto-detect upgrade title for PDF invoice
  const detectedUpgradeTitle = useMemo(() => {
    if (!optionBWindows) return 'Upgrade to Premium Windows';
    let tripleDiff = 0;
    let paintedDiff = 0;
    optionBWindows.forEach((wb, i) => {
      const wa = currentWindows[i];
      const isTripleB = Number(wb.triple) > 0 || toCents(wb.triple) > 0;
      const isTripleA = wa && (Number(wa.triple) > 0 || toCents(wa.triple) > 0);
      if (isTripleB && !isTripleA) tripleDiff += Number(wb.qty) || 1;

      const isPaintedB = wb.color?.toLowerCase() === 'painted';
      const isPaintedA = wa && wa.color?.toLowerCase() === 'painted';
      if (isPaintedB && !isPaintedA) paintedDiff += Number(wb.qty) || 1;
    });

    if (tripleDiff > 0 && paintedDiff > 0) return 'Upgrade to Triple Pane & Painted Windows';
    if (tripleDiff > 0) return 'Upgrade to Triple Pane Windows';
    if (paintedDiff > 0) return 'Upgrade to Painted Windows';
    return 'Optional Window Upgrade';
  }, [optionBWindows, currentWindows]);

  const handleToggleAttachUpgrade = () => {
    if (!delta || delta.preTax <= 0) {
      toast.error('Optional upgrade can only be attached when there is an upgrade price difference.');
      return;
    }

    if (attachedUpgrade) {
      onAttachUpgrade(null);
      toast.info('Removed optional upgrade offer from quote PDF.');
    } else {
      onAttachUpgrade({
        title: detectedUpgradeTitle,
        amountPreTaxCents: delta.preTax,
      });
      toast.success(`Attached "${detectedUpgradeTitle} adds ${formatMoney(delta.preTax)}" to quote PDF!`);
    }
  };

  const getOverridesPayload = () => ({
    jambId: overrideJambId === 'inherit' ? supplyJambId : overrideJambId,
    jambRate: overrideJambId === 'inherit' ? supplyJambRate : overrideJambRate,
    casingId: overrideCasingId === 'inherit' ? supplyCasingId : overrideCasingId,
    casingRate: overrideCasingId === 'inherit' ? supplyCasingRate : overrideCasingRate,
  });

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-5xl my-auto max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5 bg-muted/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Dual PDF Upgrade &amp; Option Comparison
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider border border-amber-500/30">
                  Phase 3 Hybrid
                </span>
                {isComparisonStaging && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold uppercase tracking-wider border border-primary/30">
                    Live Staging Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Compare base quote with upgraded manufacturer PDF to calculate &Delta; pre-tax upgrade cost.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Delta Hero Card — Showing Pre-Tax Difference Without HST */}
          {delta && optionBFinancials && (
            <div
              className={cn(
                'rounded-2xl p-4 sm:p-5 border transition-all shadow-md',
                delta.isUpgrade
                  ? 'bg-gradient-to-r from-amber-500/10 via-primary/5 to-amber-500/10 border-amber-500/30'
                  : delta.isSavings
                  ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 border-emerald-500/30'
                  : 'bg-muted/40 border-border'
              )}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div
                    className={cn(
                      'p-3 rounded-2xl shrink-0 shadow-sm',
                      delta.isUpgrade
                        ? 'bg-amber-500 text-amber-950'
                        : delta.isSavings
                        ? 'bg-emerald-500 text-emerald-950'
                        : 'bg-muted text-foreground'
                    )}
                  >
                    {delta.isUpgrade ? (
                      <ArrowUpRight className="w-6 h-6 stroke-[2.5]" />
                    ) : delta.isSavings ? (
                      <TrendingDown className="w-6 h-6 stroke-[2.5]" />
                    ) : (
                      <CheckCircle2 className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      {delta.isUpgrade
                        ? 'Upgrade Cost Difference (Pre-Tax)'
                        : delta.isSavings
                        ? 'Cost Savings Difference (Pre-Tax)'
                        : 'Exact Price Match'}
                    </span>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-2xl sm:text-3xl font-black text-foreground">
                        {delta.preTax >= 0 ? '+' : ''}
                        {formatMoney(delta.preTax)}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        pre-tax
                      </span>
                    </div>
                  </div>
                </div>

                {/* Attach to Quote PDF Action */}
                {delta.preTax > 0 && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant={attachedUpgrade ? 'default' : 'outline'}
                      size="sm"
                      onClick={handleToggleAttachUpgrade}
                      className={cn(
                        'gap-1.5 text-xs font-bold shadow-xs cursor-pointer',
                        attachedUpgrade
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500'
                      )}
                    >
                      {attachedUpgrade ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>Attached to Quote PDF</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>Attach Upgrade to Quote PDF</span>
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Side-by-Side Comparison Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Column 1: Option A (Base Quote) */}
            <div className="bg-muted/20 border border-border/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                      Option A (Base)
                    </span>
                    {appliedOption === 'A' && (
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        ✓ Active in Quote
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {quoteNumber || 'Base'}
                  </span>
                </div>

                <div className="mt-3 space-y-1">
                  <p className="text-sm font-bold text-foreground truncate">
                    {customerName || 'Base Customer Quote'}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {getWindowsSummarySentence(currentWindows)}
                  </p>
                </div>

                {/* Financial breakdown */}
                <div className="mt-4 pt-4 border-t border-border/60 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Manufacturer Base:</span>
                    <span className="font-semibold text-foreground">
                      {formatMoney(quoteResultA?.base || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Surcharge ({surchargeRate}%):</span>
                    <span className="font-semibold text-foreground">
                      {formatMoney(quoteResultA?.surcharge || 0)}
                    </span>
                  </div>
                  {effectiveJC > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Supply Jambs &amp; Casing:</span>
                      <span className="font-semibold text-foreground">
                        {formatMoney(effectiveJC)}
                      </span>
                    </div>
                  )}
                  {effectiveLabour > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Labour &amp; Installation:</span>
                      <span className="font-semibold text-foreground">
                        {formatMoney(effectiveLabour)}
                      </span>
                    </div>
                  )}
                  {(quoteResultA?.promoDiscount || 0) > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                      <span>Promo Discount:</span>
                      <span>-{formatMoney(quoteResultA.promoDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-2 border-t border-border/50 font-semibold text-foreground">
                    <span>Pre-Tax Subtotal:</span>
                    <span className="text-primary font-bold">{formatMoney(afterDiscountA)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>HST ({hstRate}%):</span>
                    <span className="font-semibold text-foreground">
                      {formatMoney(totalA - afterDiscountA)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Total Card */}
              <div className="bg-card border border-border/80 rounded-xl p-3 shadow-xs">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs uppercase font-bold text-muted-foreground">
                    Option A Total
                  </span>
                  <span className="text-lg font-black text-foreground">
                    {formatMoney(totalA)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-muted-foreground mt-1 pt-1 border-t border-border/40">
                  <span>Deposits (50/50):</span>
                  <span>
                    {formatMoney(firstPaymentA)} / {formatMoney(secondPaymentA)}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: Option B (Upgraded PDF Quote) */}
            <div className="bg-muted/20 border border-border/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      Option B (Upgraded)
                    </span>
                    {appliedOption === 'B' && (
                      <span className="text-[11px] font-semibold text-amber-500">
                        ✓ Active in Quote
                      </span>
                    )}
                  </div>
                  {optionBMeta.quoteNumber && (
                    <span className="text-xs font-bold text-foreground">
                      {optionBMeta.quoteNumber}
                    </span>
                  )}
                </div>

                {/* Upload State vs Loaded State */}
                {!optionBWindows ? (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'mt-4 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 min-h-[220px]',
                      isDragging
                        ? 'border-amber-500 bg-amber-500/10 scale-[0.99]'
                        : 'border-border/80 hover:border-amber-500/50 hover:bg-muted/40'
                    )}
                  >
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      ref={fileInputRef}
                      onChange={handleFileInputChange}
                      className="hidden"
                    />
                    <div className="p-3 rounded-full bg-amber-500/10 text-amber-500 mb-1">
                      <FileUp className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-bold text-foreground">
                      {isParsing ? 'Parsing PDF Quote...' : 'Upload Upgraded Manufacturer PDF'}
                    </p>
                    <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
                      Drag &amp; drop the upgraded PDF quote here (e.g. Triple Pane, Painted, Brickmould), or click to browse.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="mt-3 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-bold text-foreground truncate">
                          {optionBMeta.customerName || customerName || 'Upgraded Quote'}
                        </p>
                        {/* High-visibility Change PDF button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-8 px-3 text-xs font-semibold bg-background border-border hover:bg-muted text-foreground shadow-xs gap-1.5 shrink-0 cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                          <span>Change PDF</span>
                        </Button>
                        <input
                          type="file"
                          accept=".pdf,application/pdf"
                          ref={fileInputRef}
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {getWindowsSummarySentence(optionBWindows)}
                      </p>
                    </div>

                    {/* Quick In-Modal Overrides Collapsible (Jambs & Casing) */}
                    <div className="mt-3 pt-3 border-t border-border/60">
                      <button
                        type="button"
                        onClick={() => setShowOverrides(!showOverrides)}
                        className="flex items-center justify-between w-full py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Customize Option B Add-ons (Jambs &amp; Casing)</span>
                        </span>
                        {showOverrides ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {showOverrides && (
                        <div className="mt-2.5 p-3 rounded-xl bg-card border border-border/70 space-y-2.5 animate-in fade-in duration-150">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {/* Option B Jamb Override */}
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                                Option B Jamb Extension
                              </Label>
                              <Select
                                value={overrideJambId}
                                onValueChange={(val) => setOverrideJambId(val || 'inherit')}
                              >
                                <SelectTrigger className="w-full h-9 text-xs bg-background min-w-0 font-medium">
                                  <SelectValue placeholder="Select jamb">
                                    <span className="truncate block text-left">
                                      {selectedOverrideJambDisplay}
                                    </span>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="w-full min-w-[280px] sm:min-w-[340px] max-w-[420px]">
                                  <SelectItem value="inherit" className="py-2 cursor-pointer">
                                    <span className="leading-snug">Same as Option A ({resolvedOptionAJambLabel})</span>
                                  </SelectItem>
                                  <SelectItem value="none" className="py-2 cursor-pointer">
                                    None
                                  </SelectItem>
                                  {dbJambs.map((j) => (
                                    <SelectItem key={j.id} value={j.id} className="py-2 cursor-pointer">
                                      <span className="leading-snug">{j.label || j.name}</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Option B Casing Override */}
                            <div className="space-y-1">
                              <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                                Option B Casing Style
                              </Label>
                              <Select
                                value={overrideCasingId}
                                onValueChange={(val) => setOverrideCasingId(val || 'inherit')}
                              >
                                <SelectTrigger className="w-full h-9 text-xs bg-background min-w-0 font-medium">
                                  <SelectValue placeholder="Select casing">
                                    <span className="truncate block text-left">
                                      {selectedOverrideCasingDisplay}
                                    </span>
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="w-full min-w-[280px] sm:min-w-[340px] max-w-[420px]">
                                  <SelectItem value="inherit" className="py-2 cursor-pointer">
                                    <span className="leading-snug">Same as Option A ({resolvedOptionACasingLabel})</span>
                                  </SelectItem>
                                  <SelectItem value="none" className="py-2 cursor-pointer">
                                    None
                                  </SelectItem>
                                  {dbCasings.map((c) => (
                                    <SelectItem key={c.id} value={c.id} className="py-2 cursor-pointer">
                                      <span className="leading-snug">{c.label || c.name}</span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Financial breakdown for Option B */}
                    {optionBFinancials && (
                      <div className="mt-4 pt-4 border-t border-border/60 space-y-2 text-xs">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Manufacturer Base:</span>
                          <span className="font-semibold text-foreground">
                            {formatMoney(optionBFinancials.base)}
                          </span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Surcharge ({surchargeRate}%):</span>
                          <span className="font-semibold text-foreground">
                            {formatMoney(optionBFinancials.surcharge)}
                          </span>
                        </div>
                        {optionBFinancials.jc > 0 && (
                          <div className="flex justify-between text-muted-foreground">
                            <span>Supply Jambs &amp; Casing:</span>
                            <span className="font-semibold text-foreground">
                              {formatMoney(optionBFinancials.jc)}
                            </span>
                          </div>
                        )}
                        {optionBFinancials.labour > 0 && (
                          <div className="flex justify-between text-muted-foreground">
                            <span>Labour &amp; Installation:</span>
                            <span className="font-semibold text-foreground">
                              {formatMoney(optionBFinancials.labour)}
                            </span>
                          </div>
                        )}
                        {optionBFinancials.promoDiscount > 0 && (
                          <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                            <span>Promo Discount:</span>
                            <span>-{formatMoney(optionBFinancials.promoDiscount)}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 border-t border-border/50 font-semibold text-foreground">
                          <span>Pre-Tax Subtotal:</span>
                          <span className="text-amber-500 font-bold">
                            {formatMoney(optionBFinancials.afterDiscount)}
                          </span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>HST ({hstRate}%):</span>
                          <span className="font-semibold text-foreground">
                            {formatMoney(optionBFinancials.hst)}
                          </span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Total Card for Option B */}
              {optionBFinancials && (
                <div className="bg-card border border-border/80 rounded-xl p-3 shadow-xs">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs uppercase font-bold text-muted-foreground">
                      Option B Total
                    </span>
                    <span className="text-lg font-black text-amber-500">
                      {formatMoney(optionBFinancials.total)}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-muted-foreground mt-1 pt-1 border-t border-border/40">
                    <span>Deposits (50/50):</span>
                    <span>
                      {formatMoney(optionBFinancials.firstPayment)} /{' '}
                      {formatMoney(optionBFinancials.secondPayment)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Window Differences Table */}
          {optionBWindows && (
            <div className="border border-border/70 rounded-2xl overflow-hidden shadow-xs bg-muted/10">
              <div className="px-4 py-2.5 bg-muted/40 border-b border-border/60 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  Window-by-Window Configuration Diff ({optionBWindows.length} items)
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Comparison between Option A &amp; Option B line items
                </span>
              </div>
              <div className="overflow-x-auto max-h-56">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/60 text-muted-foreground uppercase text-[10px] tracking-wider sticky top-0">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Qty</th>
                      <th className="p-2.5">Dimensions</th>
                      <th className="p-2.5">Option A Specs</th>
                      <th className="p-2.5">Option B Specs</th>
                      <th className="p-2.5 text-right">Base Diff (&Delta;)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {optionBWindows.map((wb, idx) => {
                      const wa = currentWindows[idx];
                      const isTripleA = wa && (Number(wa.triple) > 0 || toCents(wa.triple) > 0);
                      const isTripleB = Number(wb.triple) > 0 || toCents(wb.triple) > 0;
                      const isPaintedA = wa && wa.color?.toLowerCase() === 'painted';
                      const isPaintedB = wb.color?.toLowerCase() === 'painted';

                      const baseA = wa ? toCents(wa.base) : 0;
                      const baseB = toCents(wb.base);
                      const diffBase = baseB - baseA;

                      const specDiff = isTripleB !== isTripleA || isPaintedB !== isPaintedA;

                      return (
                        <tr
                          key={wb.id || idx}
                          className={cn(
                            'hover:bg-muted/40 transition-colors',
                            specDiff && 'bg-amber-500/5'
                          )}
                        >
                          <td className="p-2.5 font-bold text-muted-foreground">{idx + 1}</td>
                          <td className="p-2.5 font-semibold text-foreground">{wb.qty || '1'}</td>
                          <td className="p-2.5 text-muted-foreground">
                            {wb.w && wb.h ? `${wb.w}″ × ${wb.h}″` : '—'}
                          </td>
                          <td className="p-2.5 text-muted-foreground">
                            {wa ? (
                              <span>
                                {isTripleA ? 'Triple Pane' : 'Dual Pane'} •{' '}
                                {wa.color || 'White'}
                              </span>
                            ) : (
                              <span className="italic text-muted-foreground">New line item</span>
                            )}
                          </td>
                          <td className="p-2.5 font-semibold text-foreground">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1',
                                specDiff && 'text-amber-600 dark:text-amber-400 font-bold'
                              )}
                            >
                              {isTripleB ? 'Triple Pane' : 'Dual Pane'} • {wb.color || 'White'}
                            </span>
                          </td>
                          <td className="p-2.5 text-right font-bold">
                            {diffBase !== 0 ? (
                              <span
                                className={
                                  diffBase > 0
                                    ? 'text-amber-600 dark:text-amber-400'
                                    : 'text-emerald-600 dark:text-emerald-400'
                                }
                              >
                                {diffBase > 0 ? '+' : ''}
                                {formatMoney(diffBase)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions — Hybrid Mode */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:px-6 border-t border-border/60 bg-muted/20 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {attachedUpgrade && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Optional upgrade offer attached to PDF</span>
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs font-semibold cursor-pointer"
            >
              Close
            </Button>

            {/* Hybrid Action: Full Workspace Edit Button */}
            {onApplyAndCustomize && optionBWindows && optionBWindows.length > 0 && !isComparisonStaging && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onApplyAndCustomize(optionBWindows, optionBMeta, getOverridesPayload());
                  onClose();
                }}
                className="gap-1.5 text-xs font-semibold border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 cursor-pointer shadow-xs"
                title="Loads Option B into calculator while preserving Base Quote A so you can adjust crew, distance, or promo"
              >
                <Pencil className="w-3.5 h-3.5 text-amber-500" />
                <span>Apply &amp; Customize in Full Calculator</span>
              </Button>
            )}

            {/* Two-Way Swapping Action Button */}
            {appliedOption === 'B' || isComparisonStaging ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onApplyOption('A', currentWindows);
                    onClose();
                  }}
                  className="gap-1.5 text-xs font-bold cursor-pointer border-primary text-primary hover:bg-primary/10 shadow-md"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Apply Option A (Revert to Base)</span>
                </Button>
                {onKeepOptionB && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      onKeepOptionB();
                      onClose();
                    }}
                    className="gap-1.5 text-xs font-bold cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
                  >
                    <Check className="w-4 h-4" />
                    <span>Keep Option B as Primary</span>
                  </Button>
                )}
              </div>
            ) : (
              <Button
                variant="default"
                size="sm"
                disabled={!optionBWindows || optionBWindows.length === 0}
                onClick={() => {
                  if (optionBWindows) {
                    onApplyOption('B', optionBWindows, optionBMeta, getOverridesPayload());
                    onClose();
                  }
                }}
                className="gap-1.5 text-xs font-bold cursor-pointer bg-amber-500 hover:bg-amber-600 text-amber-950 shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Apply Option B to Quote</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
