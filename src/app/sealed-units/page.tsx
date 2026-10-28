'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Layers,
  Calculator,
  Plus,
  Trash2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Info,
  AlertCircle,
  Truck,
  Wrench,
  DollarSign,
  PackageCheck,
  Printer,
  ChevronDown,
  ChevronUp,
  Grid,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import SmartBackButton from '@/components/shared/SmartBackButton';
import { AppHeader } from '@/components/layout/AppHeader';
import {
  GlassTreatment,
  PaneType,
  ComboPricing,
  SealedUnitFormulaConstants,
  SealedUnitLabourSettings,
  ThicknessBreak,
  SealedUnitLineItem,
  GrillType,
  GrillProfile,
  GrillItemConfig,
  SealedUnitGrillSettings,
  DEFAULT_SEALED_UNIT_COMBOS,
  DEFAULT_FORMULA_CONSTANTS,
  DEFAULT_LABOUR_SETTINGS,
  DEFAULT_THICKNESS_BREAKS,
  DEFAULT_GRILL_SETTINGS,
  calculateGrillRawCost,
  parseInchesInput,
  inchesToSqft,
  calculateSealedUnitItem,
} from '@/lib/sealed-units-logic';
import { formatMoney } from '@/lib/promo-logic';
import { toast } from 'sonner';

export default function SealedUnitsCalculatorPage() {
  // Database Settings State
  const [combos, setCombos] = useState<ComboPricing[]>(DEFAULT_SEALED_UNIT_COMBOS);
  const [formula, setFormula] = useState<SealedUnitFormulaConstants>(DEFAULT_FORMULA_CONSTANTS);
  const [labour, setLabour] = useState<SealedUnitLabourSettings>(DEFAULT_LABOUR_SETTINGS);
  const [thicknessBreaks, setThicknessBreaks] = useState<ThicknessBreak[]>(DEFAULT_THICKNESS_BREAKS);
  const [grills, setGrills] = useState<SealedUnitGrillSettings>(DEFAULT_GRILL_SETTINGS);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Line Item Builder State
  const [treatment, setTreatment] = useState<GlassTreatment>('annealed');
  const [selectedComboId, setSelectedComboId] = useState<string>('ann_clear');
  const [selectedPane, setSelectedPane] = useState<PaneType>('dual');
  const [widthInput, setWidthInput] = useState<string>('30');
  const [heightInput, setHeightInput] = useState<string>('40');
  const [qtyInput, setQtyInput] = useState<string>('1');

  // Interior Grill Builder State
  const [grillType, setGrillType] = useState<GrillType>('none');
  const [grillProfile, setGrillProfile] = useState<GrillProfile>('5/8" x 1/4"');
  const [grillColor, setGrillColor] = useState<string>('White');
  const [grillSquares, setGrillSquares] = useState<string>('6');
  const [grillTIntersections, setGrillTIntersections] = useState<string>('0');
  const [grillBentHubs, setGrillBentHubs] = useState<string>('0');

  // Quote State
  const [lineItems, setLineItems] = useState<SealedUnitLineItem[]>([]);
  const [isInstallation, setIsInstallation] = useState<boolean>(true); // Supply Only vs Installation
  const [setupFeeType, setSetupFeeType] = useState<'default' | 'far_std' | 'far_small' | 'none'>('default');
  const [customSetupFee, setCustomSetupFee] = useState<string>('');
  const [showOutTownTravel, setShowOutTownTravel] = useState<boolean>(false);
  const [travelKm, setTravelKm] = useState<string>('0');
  const [crewHours, setCrewHours] = useState<string>('0');
  const [crewSize, setCrewSize] = useState<'2' | '3'>('3');
  const [hstRate, setHstRate] = useState<number>(13); // 13% HST, 8%, 0%
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  const widthRef = useRef<HTMLInputElement>(null);

  // Fetch live settings from database on mount
  useEffect(() => {
    fetch('/api/sealed-units/settings')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.combos) && data.combos.length > 0) {
          setCombos(data.combos);
        }
        if (data.formula) setFormula(data.formula);
        if (data.labour) setLabour(data.labour);
        if (Array.isArray(data.thicknessBreaks)) setThicknessBreaks(data.thicknessBreaks);
        if (data.grills) setGrills(data.grills);
        setLoadingSettings(false);
      })
      .catch((err) => {
        console.error('Failed to load sealed unit settings:', err);
        setLoadingSettings(false);
      });
  }, []);

  // Filter combos by treatment (Annealed vs Tempered)
  const availableCombos = useMemo(() => {
    return combos.filter((c) => c.treatment === treatment);
  }, [combos, treatment]);

  // Keep selected combo valid when switching treatment
  useEffect(() => {
    if (!availableCombos.some((c) => c.id === selectedComboId)) {
      if (availableCombos.length > 0) {
        setSelectedComboId(availableCombos[0].id);
      }
    }
  }, [treatment, availableCombos, selectedComboId]);

  // Selected combo object
  const activeCombo = useMemo(() => {
    return combos.find((c) => c.id === selectedComboId) || availableCombos[0] || combos[0];
  }, [combos, selectedComboId, availableCombos]);

  // Check if current combo supports Dual pane (e.g. 2-lites combos have no dual price)
  const hasDualPane = useMemo(() => {
    if (!activeCombo) return true;
    const pricesObj = (activeCombo.prices as any) || {};
    return Object.values(pricesObj).some(
      (t: any) => t && t.dual !== null && t.dual !== undefined && t.dual !== '' && Number(t.dual) > 0
    );
  }, [activeCombo]);

  // Auto-switch to Triple if Dual is not available on selected combo
  useEffect(() => {
    if (!hasDualPane && selectedPane === 'dual') {
      setSelectedPane('triple');
    }
  }, [hasDualPane, selectedPane]);

  // Computed Live Area Preview (Enforcing ceiling rounding: 12.01 -> 13)
  const computedAreaPreview = useMemo(() => {
    try {
      const w = parseInchesInput(widthInput, 'width');
      const h = parseInchesInput(heightInput, 'height');
      const sqft = inchesToSqft(w, h);
      const roundedSqft = Math.ceil(sqft);
      const billableSqft = Math.max(formula.minSqft || 4.0, roundedSqft);
      return {
        sqft,
        roundedSqft,
        billableSqft,
        isUnderMin: sqft < formula.minSqft,
        valid: true,
      };
    } catch {
      return { sqft: 0, roundedSqft: 0, billableSqft: 0, isUnderMin: false, valid: false };
    }
  }, [widthInput, heightInput, formula.minSqft]);

  // Live Grill Cost Preview
  const activeGrillPreview = useMemo(() => {
    return calculateGrillRawCost(
      {
        type: grillType,
        profile: grillProfile,
        color: grillColor,
        squaresCount: parseInt(grillSquares, 10) || 0,
        tIntersectionsCount: parseInt(grillTIntersections, 10) || 0,
        bentHubsCount: parseInt(grillBentHubs, 10) || 0,
      },
      grills
    );
  }, [grillType, grillProfile, grillColor, grillSquares, grillTIntersections, grillBentHubs, grills]);

  // Add Item Handler
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!activeCombo) throw new Error('Please select a glass combination.');
      const w = parseInchesInput(widthInput, 'width');
      const h = parseInchesInput(heightInput, 'height');
      const qty = parseInt(qtyInput, 10);
      if (!qty || qty < 1) throw new Error('Quantity must be at least 1.');

      const newItem = calculateSealedUnitItem({
        combo: activeCombo,
        paneType: selectedPane,
        widthIn: w,
        heightIn: h,
        quantity: qty,
        formula,
        thicknessBreaks,
        labourSettings: labour,
        grill: {
          type: grillType,
          profile: grillProfile,
          color: grillColor,
          squaresCount: parseInt(grillSquares, 10) || 0,
          tIntersectionsCount: parseInt(grillTIntersections, 10) || 0,
          bentHubsCount: parseInt(grillBentHubs, 10) || 0,
        },
        grillSettings: grills,
      });

      setLineItems((prev) => [...prev, newItem]);
      toast.success(
        `Added ${activeCombo.name} (${newItem.thicknessMm}mm) to quote.`
      );

      // Reset dimensions for fast entry
      setWidthInput('');
      setHeightInput('');
      setQtyInput('1');
      widthRef.current?.focus();
    } catch (err: any) {
      toast.error(err.message || 'Invalid dimensions or pricing error.');
    }
  };

  const handleRemoveItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetQuote = () => {
    if (lineItems.length === 0) return;
    if (confirm('Are you sure you want to reset all line items?')) {
      setLineItems([]);
      toast.info('Quote reset.');
    }
  };

  // --- Aggregate Financial Calculations ---
  const totals = useMemo(() => {
    const totalUnits = lineItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalSqft = lineItems.reduce((acc, item) => acc + item.actualSqft * item.quantity, 0);
    const totalBillableSqft = lineItems.reduce((acc, item) => acc + item.billableSqft * item.quantity, 0);
    const glassSupplyTotal = lineItems.reduce((acc, item) => acc + item.lineGlassTotal, 0);

    // Installation Labour & Misc
    const labourTotal = isInstallation
      ? lineItems.reduce((acc, item) => acc + item.totalLabour, 0)
      : 0;

    const miscTotal = isInstallation
      ? lineItems.reduce((acc, item) => acc + item.totalMisc, 0)
      : 0;

    // Setup Fee calculation
    let setupFee = 0;
    if (isInstallation) {
      if (setupFeeType === 'default') {
        setupFee = labour.setupFeeDefault || 140.0;
      } else if (setupFeeType === 'far_std') {
        setupFee = labour.setupFeeFarStandard || 727.5;
      } else if (setupFeeType === 'far_small') {
        setupFee = labour.setupFeeFarSmall || 363.5;
      } else {
        setupFee = Number(customSetupFee) || 0;
      }
    }

    // Out-of-town vehicle & crew travel
    let vehicleTravelFee = 0;
    let crewTravelFee = 0;
    if (isInstallation && showOutTownTravel) {
      const km = Number(travelKm) || 0;
      vehicleTravelFee = Math.round(km * (labour.vehicleRatePerKm || 0.98) * 100) / 100;

      const hrs = Number(crewHours) || 0;
      const hourlyRate =
        crewSize === '2' ? labour.crewHourly2Men || 150 : labour.crewHourly3Men || 200;
      crewTravelFee = Math.round(hrs * hourlyRate * 100) / 100;
    }

    const totalTravelAndSetup = setupFee + vehicleTravelFee + crewTravelFee;
    const subtotalPreTax = glassSupplyTotal + labourTotal + miscTotal + totalTravelAndSetup;
    const hstAmount = Math.round((subtotalPreTax * hstRate) / 100 * 100) / 100;
    const grandTotal = subtotalPreTax + hstAmount;

    return {
      totalUnits,
      totalSqft,
      totalBillableSqft,
      glassSupplyTotal,
      labourTotal,
      miscTotal,
      setupFee,
      vehicleTravelFee,
      crewTravelFee,
      totalTravelAndSetup,
      subtotalPreTax,
      hstAmount,
      grandTotal,
    };
  }, [
    lineItems,
    isInstallation,
    setupFeeType,
    customSetupFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
    labour,
    hstRate,
  ]);

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    if (lineItems.length === 0) {
      toast.error('Add at least one line item first.');
      return;
    }

    const modeText = isInstallation ? 'Supply & Installation' : 'Supply Only';
    let text = `========================================\n`;
    text += `THE WINDOW & DOOR STORE — SEALED UNIT QUOTE\n`;
    text += `Scope: ${modeText}\n`;
    text += `Date: ${new Date().toLocaleDateString('en-CA')}\n`;
    text += `========================================\n\n`;
    text += `LINE ITEMS (${lineItems.length}):\n`;

    lineItems.forEach((item, idx) => {
      text += `${idx + 1}. ${item.combinationName} [${item.treatment.toUpperCase()}] — ${item.paneType.toUpperCase()}\n`;
      text += `   Size: ${item.widthIn}" × ${item.heightIn}" (${item.actualSqft.toFixed(2)} sqft → ${item.billableSqft} sqft billed) | ${item.thicknessMm}mm\n`;
      if (item.rawGrillCost > 0) {
        text += `   Grill: ${item.grillDescription}\n`;
      }
      text += `   Qty: ${item.quantity} × $${item.finalUnitPrice.toFixed(2)} = $${item.lineGlassTotal.toFixed(2)}\n`;
      if (isInstallation) {
        text += `   Labour: $${item.totalLabour.toFixed(2)} | Misc: $${item.totalMisc.toFixed(2)}\n`;
      }
      text += `\n`;
    });

    text += `----------------------------------------\n`;
    text += `Glass Supply Total: $${totals.glassSupplyTotal.toFixed(2)}\n`;
    if (isInstallation) {
      text += `Installation Labour: $${totals.labourTotal.toFixed(2)}\n`;
      text += `Misc Supplies: $${totals.miscTotal.toFixed(2)}\n`;
      text += `Setup & Travel: $${totals.totalTravelAndSetup.toFixed(2)}\n`;
    }
    text += `Subtotal (Pre-Tax): $${totals.subtotalPreTax.toFixed(2)}\n`;
    if (hstRate > 0) {
      text += `HST (${hstRate}%): $${totals.hstAmount.toFixed(2)}\n`;
    }
    text += `GRAND TOTAL: $${totals.grandTotal.toFixed(2)}\n`;
    text += `========================================\n`;

    navigator.clipboard.writeText(text);
    setCopiedSummary(true);
    toast.success('Quote summary copied to clipboard!');
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 relative z-10 space-y-4">
        <AppHeader currentPath="/sealed-units" />

        {/* Compact Sub-bar with SmartBackButton & Title */}
        <div className="flex items-center justify-between gap-4 pb-2.5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <SmartBackButton fallbackUrl="/calculator" title="Back to Calculator" />
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                <Layers className="w-4 h-4" />
              </span>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Sealed Unit Price Calculator
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/sealed-units"
              className="text-xs font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors px-2.5 py-1.5 rounded-lg border border-border/60 hover:bg-muted/40"
            >
              <span>Admin Rates</span>
            </Link>
          </div>
        </div>

        {/* Main 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* LEFT COLUMN (5 cols): Unit Specification / Line Item Builder */}
          <div className="lg:col-span-5 space-y-5">
            <Card className="bg-card/60 border-border/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border/50 pb-4 bg-muted/20">
                <CardTitle className="text-base font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-primary" />
                    New Glass Line Item
                  </span>
                  <span className="text-[11px] font-normal text-muted-foreground">
                    Min 4 sq ft billing
                  </span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Select glass treatment, combination, dimensions, and quantity.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5 space-y-5">
                <form onSubmit={handleAddItem} className="space-y-4">
                  {/* Glass Treatment: Annealed vs Tempered */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Glass Treatment
                    </Label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setTreatment('annealed')}
                        className={cn(
                          'p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2',
                          treatment === 'annealed'
                            ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                            : 'bg-muted/30 border-border/70 text-muted-foreground hover:bg-muted/60'
                        )}
                      >
                        <Layers className="w-4 h-4" />
                        <span>Annealed Glass</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTreatment('tempered')}
                        className={cn(
                          'p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2',
                          treatment === 'tempered'
                            ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                            : 'bg-muted/30 border-border/70 text-muted-foreground hover:bg-muted/60'
                        )}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Tempered Glass</span>
                      </button>
                    </div>
                  </div>

                  {/* Combination Selector */}
                  <div className="space-y-1.5">
                    <Label htmlFor="comboSelect" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Sealed Unit Combination
                    </Label>
                    <select
                      id="comboSelect"
                      value={selectedComboId}
                      onChange={(e) => setSelectedComboId(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-background border border-border/80 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                    >
                      {availableCombos.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Pane Type: Dual vs Triple */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Pane Type
                      </Label>
                      {!hasDualPane && (
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                          *2-Lites only available in Triple
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={!hasDualPane}
                        onClick={() => setSelectedPane('dual')}
                        className={cn(
                          'p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                          !hasDualPane && 'opacity-40 cursor-not-allowed bg-muted/20 border-dashed',
                          selectedPane === 'dual' && hasDualPane
                            ? 'bg-primary/15 border-primary text-primary shadow-xs'
                            : 'bg-muted/30 border-border/70 text-muted-foreground hover:bg-muted/60'
                        )}
                      >
                        Dual Pane
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedPane('triple')}
                        className={cn(
                          'p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
                          selectedPane === 'triple'
                            ? 'bg-primary/15 border-primary text-primary shadow-xs'
                            : 'bg-muted/30 border-border/70 text-muted-foreground hover:bg-muted/60'
                        )}
                      >
                        Triple Pane
                      </button>
                    </div>
                  </div>

                  {/* Dimensions: Width × Height */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Dimensions (Inches)
                      </Label>
                      <span className="text-[10px] text-muted-foreground">Width × Height</span>
                    </div>
                    <div className="grid grid-cols-5 gap-2 items-center">
                      <div className="col-span-2">
                        <Input
                          ref={widthRef}
                          type="text"
                          placeholder="e.g. 30 1/2"
                          value={widthInput}
                          onChange={(e) => setWidthInput(e.target.value)}
                          className="text-sm font-mono font-bold bg-background h-10"
                        />
                      </div>
                      <div className="text-center font-bold text-muted-foreground">×</div>
                      <div className="col-span-2">
                        <Input
                          type="text"
                          placeholder="e.g. 40"
                          value={heightInput}
                          onChange={(e) => setHeightInput(e.target.value)}
                          className="text-sm font-mono font-bold bg-background h-10"
                        />
                      </div>
                    </div>
                    {/* Live Area Feedback with Ceiling Rounding */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      {computedAreaPreview.valid ? (
                        <span className="font-mono text-muted-foreground">
                          Actual: <strong className="text-foreground">{computedAreaPreview.sqft.toFixed(2)}</strong> sq ft
                          <span className="mx-1.5 text-muted-foreground/40">|</span>
                          Billed: <strong className="text-primary font-bold">{computedAreaPreview.billableSqft.toFixed(1)}</strong> sq ft
                          {computedAreaPreview.isUnderMin ? (
                            <span className="text-amber-600 dark:text-amber-400 font-semibold ml-1.5">
                              (4.0 sq ft min)
                            </span>
                          ) : computedAreaPreview.roundedSqft > computedAreaPreview.sqft ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold ml-1.5">
                              (rounded up to {computedAreaPreview.roundedSqft})
                            </span>
                          ) : null}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/60 text-[11px]">
                          Accepts fractions (30 1/2) or decimals (30.5)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Interior Metal Grills */}
                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                        <Grid className="w-3.5 h-3.5 text-primary" />
                        <span>Interior Metal Grills</span>
                      </Label>
                      {grillType !== 'none' && (
                        <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          +${activeGrillPreview.rawCost.toFixed(2)} raw grill
                        </span>
                      )}
                    </div>

                    {/* Grill Type Selector Buttons */}
                    <div className="grid grid-cols-5 gap-1 text-[11px]">
                      {[
                        { id: 'none', label: 'None' },
                        { id: 'grid', label: 'Grid' },
                        { id: '3_burst', label: '3 Burst' },
                        { id: '5_burst', label: '5 Burst' },
                        { id: 'customer_own', label: 'Own Grills' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => {
                            setGrillType(t.id as GrillType);
                            if (t.id === '3_burst' || t.id === '5_burst') {
                              setGrillColor('white');
                            } else if (t.id === 'grid') {
                              setGrillColor('White');
                            }
                          }}
                          className={cn(
                            'py-1.5 px-1 rounded-lg border font-bold text-center transition-all cursor-pointer truncate',
                            grillType === t.id
                              ? 'bg-primary/15 border-primary text-primary shadow-xs'
                              : 'bg-muted/30 border-border/70 text-muted-foreground hover:bg-muted/60'
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    {/* Detailed Config based on Grill Type */}
                    {grillType === 'grid' && (
                      <div className="space-y-2.5 p-3 rounded-xl bg-muted/20 border border-border/60 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Profile</Label>
                            <select
                              value={grillProfile}
                              onChange={(e) => {
                                const p = e.target.value as GrillProfile;
                                setGrillProfile(p);
                                if (p === '8mm x 18mm Georgian') setGrillColor('White');
                                else if (p === '3/8" x 1/4"' && grillColor === 'Black/White') setGrillColor('White');
                              }}
                              className="w-full h-8 px-2 rounded-lg bg-background border border-border text-xs font-semibold"
                            >
                              <option value='5/8" x 1/4"'>5/8&quot; × 1/4&quot;</option>
                              <option value='3/8" x 1/4"'>3/8&quot; × 1/4&quot;</option>
                              <option value='8mm x 18mm Georgian'>8mm × 18mm Georgian</option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Color</Label>
                            <select
                              value={grillColor}
                              onChange={(e) => setGrillColor(e.target.value)}
                              className="w-full h-8 px-2 rounded-lg bg-background border border-border text-xs font-semibold"
                            >
                              <option value="White">White ($5.50/sq)</option>
                              {grillProfile !== '8mm x 18mm Georgian' && (
                                <>
                                  <option value="Brass">Brass ($6.50/sq)</option>
                                  <option value="Pewter">Pewter ($6.50/sq)</option>
                                  <option value="Brushed Chrome">Brushed Chrome ($6.50/sq)</option>
                                  <option value="Black">Black ($6.50/sq)</option>
                                </>
                              )}
                              {grillProfile === '5/8" x 1/4"' && (
                                <option value="Black/White">Black / White ($11.00/sq)</option>
                              )}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Squares Count</Label>
                            <Input
                              type="number"
                              min="1"
                              value={grillSquares}
                              onChange={(e) => setGrillSquares(e.target.value)}
                              placeholder="6"
                              className="h-8 text-xs font-mono font-bold bg-background"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">T-Conn ($5.50 ea)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={grillTIntersections}
                              onChange={(e) => setGrillTIntersections(e.target.value)}
                              placeholder="0"
                              className="h-8 text-xs font-mono bg-background"
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Bent Hubs ($110 ea)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={grillBentHubs}
                              onChange={(e) => setGrillBentHubs(e.target.value)}
                              placeholder="0"
                              className="h-8 text-xs font-mono bg-background"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {(grillType === '3_burst' || grillType === '5_burst') && (
                      <div className="space-y-2.5 p-3 rounded-xl bg-muted/20 border border-border/60 text-xs">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Color Style</Label>
                            <select
                              value={grillColor}
                              onChange={(e) => setGrillColor(e.target.value)}
                              className="w-full h-8 px-2 rounded-lg bg-background border border-border text-xs font-semibold"
                            >
                              <option value="white">
                                White ({grillType === '3_burst' ? '$34.00' : '$36.00'})
                              </option>
                              <option value="brassPewter">
                                Brass or Pewter ({grillType === '3_burst' ? '$48.00' : '$64.00'})
                              </option>
                              <option value="brushedChrome">
                                Brushed Chrome ({grillType === '3_burst' ? '$53.00' : '$64.00'})
                              </option>
                              <option value="black">
                                Black ({grillType === '3_burst' ? '$53.00' : '$64.00'})
                              </option>
                            </select>
                          </div>
                          <div>
                            <Label className="text-[10px] font-bold text-muted-foreground uppercase">Bent Hubs ($110 ea)</Label>
                            <Input
                              type="number"
                              min="0"
                              value={grillBentHubs}
                              onChange={(e) => setGrillBentHubs(e.target.value)}
                              placeholder="0"
                              className="h-8 text-xs font-mono bg-background"
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          *Available in foam spacer units only.
                        </p>
                      </div>
                    )}

                    {grillType === 'customer_own' && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 space-y-1">
                        <p className="font-bold flex items-center justify-between">
                          <span>Customer&rsquo;s Own Grills</span>
                          <span className="font-mono">$33.00 / unit</span>
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          **No warranty on customer&rsquo;s own painted or used grills.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Quantity */}
                  <div className="space-y-1.5">
                    <Label htmlFor="qty" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Quantity
                    </Label>
                    <Input
                      id="qty"
                      type="number"
                      min="1"
                      value={qtyInput}
                      onChange={(e) => setQtyInput(e.target.value)}
                      className="text-sm font-mono font-bold bg-background h-10 max-w-[120px]"
                    />
                  </div>

                  {/* Submit / Add Button */}
                  <div className="pt-2 flex items-center gap-2">
                    <Button
                      type="submit"
                      className="flex-1 gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md h-10 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Calculate &amp; Add Item</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setWidthInput('');
                        setHeightInput('');
                        setQtyInput('1');
                        widthRef.current?.focus();
                      }}
                      className="h-10 text-xs cursor-pointer"
                    >
                      Clear
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Quick Pricing Formula Note */}
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Info className="w-3.5 h-3.5 text-primary" />
                <span>Shop Formula Breakdown</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Unit Price = (Base Rate + Argon $0.60) × Area + 27% Surcharge × 2.5 Multiplier + 8% Final Addon.
                Glass thickness (3mm, 4mm, 5mm, 6mm) automatically ladders based on total square footage.
              </p>
            </div>
          </div>

          {/* RIGHT COLUMN (7 cols): Installation & Tax Calculator + Financial Breakdown */}
          <div className="lg:col-span-7 space-y-5">
            {/* Scope Toggle: Supply Only vs Installation */}
            <Card className="bg-card/60 border-border/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border/50 pb-3.5 bg-muted/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Wrench className="w-4 h-4 text-emerald-500" />
                      <span>Installation &amp; Labour Settings</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Replaces manual calculations with official shop labour &amp; travel rules.
                    </CardDescription>
                  </div>
                  {/* Scope Selector */}
                  <div className="flex items-center gap-1 p-1 bg-muted rounded-xl border border-border text-xs">
                    <button
                      type="button"
                      onClick={() => setIsInstallation(false)}
                      className={cn(
                        'px-3 py-1 rounded-lg font-bold transition-all cursor-pointer',
                        !isInstallation
                          ? 'bg-background text-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      Supply Only
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsInstallation(true)}
                      className={cn(
                        'px-3 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5',
                        isInstallation
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Wrench className="w-3 h-3" />
                      <span>Installation</span>
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {isInstallation ? (
                  <div className="space-y-4">
                    {/* Labour & Misc Rates Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                          Installation Labour
                        </span>
                        <div className="font-mono font-bold text-sm text-foreground mt-0.5">
                          ${labour.labourRatePerSqft.toFixed(2)}/sqft
                        </div>
                        <span className="text-[10px] text-muted-foreground">Min $120.00 / window</span>
                      </div>
                      <div className="p-3 rounded-xl bg-muted/30 border border-border/60">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                          Misc Supplies
                        </span>
                        <div className="font-mono font-bold text-sm text-foreground mt-0.5">
                          ${labour.miscRatePerSqft.toFixed(2)}/sqft
                        </div>
                        <span className="text-[10px] text-muted-foreground">Caulking, shims, foam</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                        <span className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400 block">
                          Labour on Current Quote
                        </span>
                        <div className="font-mono font-bold text-base text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {formatMoney(Math.round(totals.labourTotal * 100))}
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {totals.totalUnits} window{totals.totalUnits !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>

                    {/* Setup Fee Selector */}
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-primary" />
                          <span>Job Setup / Travel Base Fee</span>
                        </Label>
                        <span className="text-[11px] text-muted-foreground">
                          Select standard local or far area job
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setSetupFeeType('default')}
                          className={cn(
                            'p-2.5 rounded-xl border text-center transition-all cursor-pointer space-y-0.5',
                            setupFeeType === 'default'
                              ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs'
                              : 'bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted'
                          )}
                        >
                          <span className="block text-[11px]">Standard Local</span>
                          <span className="font-mono font-bold text-xs">
                            ${labour.setupFeeDefault.toFixed(2)}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSetupFeeType('far_std')}
                          className={cn(
                            'p-2.5 rounded-xl border text-center transition-all cursor-pointer space-y-0.5',
                            setupFeeType === 'far_std'
                              ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs'
                              : 'bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted'
                          )}
                        >
                          <span className="block text-[11px]">Far Area (Std)</span>
                          <span className="font-mono font-bold text-xs">
                            ${labour.setupFeeFarStandard.toFixed(2)}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSetupFeeType('far_small')}
                          className={cn(
                            'p-2.5 rounded-xl border text-center transition-all cursor-pointer space-y-0.5',
                            setupFeeType === 'far_small'
                              ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs'
                              : 'bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted'
                          )}
                        >
                          <span className="block text-[11px]">Far Area (Small)</span>
                          <span className="font-mono font-bold text-xs">
                            ${labour.setupFeeFarSmall.toFixed(2)}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSetupFeeType('none')}
                          className={cn(
                            'p-2.5 rounded-xl border text-center transition-all cursor-pointer space-y-0.5',
                            setupFeeType === 'none'
                              ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs'
                              : 'bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted'
                          )}
                        >
                          <span className="block text-[11px]">None / Waived</span>
                          <span className="font-mono font-bold text-xs">$0.00</span>
                        </button>
                      </div>
                    </div>

                    {/* Optional Out-of-Town Mileage & Crew Hours Accordion */}
                    <div className="pt-2 border-t border-border/50">
                      <button
                        type="button"
                        onClick={() => setShowOutTownTravel(!showOutTownTravel)}
                        className="w-full flex items-center justify-between text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer py-1"
                      >
                        <span className="flex items-center gap-1.5">
                          <Truck className="w-3.5 h-3.5 text-primary" />
                          <span>Out-of-Town Mileage &amp; Travel Hours (Optional)</span>
                        </span>
                        {showOutTownTravel ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {showOutTownTravel && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 mt-1 text-xs bg-muted/20 p-3 rounded-xl border border-border/50 animate-in fade-in">
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                              Vehicle Travel (Both Ways KM)
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              value={travelKm}
                              onChange={(e) => setTravelKm(e.target.value)}
                              placeholder="0"
                              className="h-8 text-xs font-mono bg-background"
                            />
                            <span className="text-[10px] text-muted-foreground">@ $0.98/km</span>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                              Crew Travel (Total Hours)
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              step="0.5"
                              value={crewHours}
                              onChange={(e) => setCrewHours(e.target.value)}
                              placeholder="0"
                              className="h-8 text-xs font-mono bg-background"
                            />
                            <span className="text-[10px] text-muted-foreground">Travel time</span>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] uppercase font-bold text-muted-foreground">
                              Crew Size
                            </Label>
                            <select
                              value={crewSize}
                              onChange={(e: any) => setCrewSize(e.target.value)}
                              className="w-full h-8 px-2 rounded-md bg-background border border-border text-xs font-semibold"
                            >
                              <option value="2">2-Man Crew ($150/hr)</option>
                              <option value="3">3-Man Crew ($200/hr)</option>
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-muted/30 border border-border text-xs text-muted-foreground space-y-1 text-center">
                    <PackageCheck className="w-6 h-6 text-primary mx-auto mb-1" />
                    <p className="font-bold text-foreground">Supply Only Mode Selected</p>
                    <p className="text-[11px]">
                      Installation labour, miscellaneous hardware, and travel fees are bypassed. Only glass sealed unit manufacturing supply is quoted.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quote Financial Totals Card */}
            <Card className="bg-card/60 border-border/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border/50 pb-3 bg-muted/20">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    <span>Quote Summary &amp; Taxes</span>
                  </CardTitle>
                  {/* Tax Rate Selector */}
                  <div className="flex items-center gap-1 p-0.5 bg-muted rounded-lg border border-border text-[11px]">
                    {[
                      { label: '13% HST', rate: 13 },
                      { label: '8% FN', rate: 8 },
                      { label: '0%', rate: 0 },
                    ].map((t) => (
                      <button
                        key={t.rate}
                        type="button"
                        onClick={() => setHstRate(t.rate)}
                        className={cn(
                          'px-2 py-0.5 rounded-md font-bold transition-all cursor-pointer',
                          hstRate === t.rate
                            ? 'bg-background text-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-3 text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Glass Supply ({totals.totalUnits} units, {totals.totalSqft.toFixed(2)} sqft):</span>
                    <span className="font-mono font-semibold text-foreground">
                      ${totals.glassSupplyTotal.toFixed(2)}
                    </span>
                  </div>

                  {isInstallation && (
                    <>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Installation Labour:</span>
                        <span className="font-mono font-semibold text-foreground">
                          ${totals.labourTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Misc Supplies (${labour.miscRatePerSqft.toFixed(2)}/sqft):</span>
                        <span className="font-mono font-semibold text-foreground">
                          ${totals.miscTotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-muted-foreground">
                        <span>Job Setup &amp; Travel Fee:</span>
                        <span className="font-mono font-semibold text-foreground">
                          ${totals.totalTravelAndSetup.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between pt-2 border-t border-border font-bold text-foreground">
                    <span>Subtotal (Pre-Tax):</span>
                    <span className="font-mono text-sm">${totals.subtotalPreTax.toFixed(2)}</span>
                  </div>

                  {hstRate > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>HST ({hstRate}%):</span>
                      <span className="font-mono font-semibold text-foreground">
                        ${totals.hstAmount.toFixed(2)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-baseline pt-3 border-t border-border/80">
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider text-muted-foreground block">
                        Grand Total
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {isInstallation ? 'Glass + Labour + Travel' : 'Glass Supply Only'}
                      </span>
                    </div>
                    <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                      ${totals.grandTotal.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* 1-Click Action Buttons */}
                <div className="flex flex-wrap items-center gap-2 pt-3">
                  <Button
                    type="button"
                    onClick={handleCopySummary}
                    disabled={lineItems.length === 0}
                    className="gap-1.5 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md cursor-pointer flex-1"
                  >
                    {copiedSummary ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedSummary ? 'Copied to Clipboard!' : 'Copy Breakdown for Odoo / Customer'}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => window.print()}
                    disabled={lineItems.length === 0}
                    className="gap-1.5 text-xs cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* BOTTOM SECTION: Quote Line Items Table */}
        <Card className="bg-card/60 border-border/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-3.5 bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Layers className="w-4 h-4 text-primary" />
                <span>Quote Line Items ({lineItems.length})</span>
              </CardTitle>
              <CardDescription className="text-xs">
                All configured sealed unit items in the current quote.
              </CardDescription>
            </div>
            {lineItems.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetQuote}
                className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer self-start sm:self-auto"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Quote</span>
              </Button>
            )}
          </CardHeader>
          <CardContent className="p-0">
            {lineItems.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground space-y-2">
                <Layers className="w-8 h-8 mx-auto opacity-40" />
                <p className="text-sm font-semibold">No line items added yet.</p>
                <p className="text-xs">
                  Configure dimensions and combinations on the left, then click &ldquo;Calculate &amp; Add Item&rdquo;.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/40 uppercase tracking-wider text-[10px] text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="p-3 w-8">#</th>
                      <th className="p-3">Combination</th>
                      <th className="p-3">Pane</th>
                      <th className="p-3">Size (in)</th>
                      <th className="p-3 text-right">Area (sqft)</th>
                      <th className="p-3 text-center">Thickness</th>
                      <th className="p-3 text-right">Unit Price</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3 text-right">Glass Total</th>
                      {isInstallation && <th className="p-3 text-right">Labour</th>}
                      <th className="p-3 w-10 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 font-mono">
                    {lineItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 text-muted-foreground">{idx + 1}</td>
                        <td className="p-3 font-sans text-foreground">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap font-semibold">
                              <span>{item.combinationName}</span>
                              <span
                                className={cn(
                                  'text-[9px] px-1.5 py-0.2 rounded font-bold uppercase',
                                  item.treatment === 'tempered'
                                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                    : 'bg-muted text-muted-foreground'
                                )}
                              >
                                {item.treatment}
                              </span>
                            </div>
                            {item.rawGrillCost > 0 && (
                              <div className="flex items-center gap-1 text-[11px] text-primary font-medium">
                                <Grid className="w-3 h-3 text-primary shrink-0" />
                                <span>{item.grillDescription}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-sans capitalize text-muted-foreground">
                          {item.paneType}
                        </td>
                        <td className="p-3 text-foreground font-semibold">
                          {item.widthIn}&quot; × {item.heightIn}&quot;
                        </td>
                        <td className="p-3 text-right">
                          <div className="font-mono">
                            <span className="font-bold text-foreground">{item.billableSqft.toFixed(1)}</span>
                            <span className="text-[10px] block text-muted-foreground">
                              act: {item.actualSqft.toFixed(2)}
                              {item.billableSqft > item.actualSqft && (
                                <span className="text-amber-600 dark:text-amber-400 font-semibold ml-1">
                                  {item.actualSqft < 4 ? '(min 4)' : '(ceil)'}
                                </span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span className="px-2 py-0.5 rounded bg-muted/60 text-[11px] font-bold text-foreground">
                            {item.thicknessMm}mm
                          </span>
                        </td>
                        <td className="p-3 text-right text-foreground font-semibold">
                          ${item.finalUnitPrice.toFixed(2)}
                        </td>
                        <td className="p-3 text-center font-bold text-foreground">{item.quantity}</td>
                        <td className="p-3 text-right font-bold text-foreground">
                          ${item.lineGlassTotal.toFixed(2)}
                        </td>
                        {isInstallation && (
                          <td className="p-3 text-right text-emerald-600 dark:text-emerald-400 font-semibold">
                            ${item.totalLabour.toFixed(2)}
                          </td>
                        )}
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors cursor-pointer"
                            title="Remove line item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {/* Table Footer with Summary */}
                  <tfoot className="bg-muted/30 font-bold border-t border-border/60 text-xs">
                    <tr>
                      <td colSpan={4} className="p-3 text-foreground font-sans">
                        Total ({totals.totalUnits} units):
                      </td>
                      <td className="p-3 text-right font-mono">{totals.totalSqft.toFixed(2)} sqft</td>
                      <td colSpan={2} className="p-3"></td>
                      <td className="p-3 text-center font-mono">{totals.totalUnits}</td>
                      <td className="p-3 text-right font-mono text-foreground">
                        ${totals.glassSupplyTotal.toFixed(2)}
                      </td>
                      {isInstallation && (
                        <td className="p-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                          ${totals.labourTotal.toFixed(2)}
                        </td>
                      )}
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
