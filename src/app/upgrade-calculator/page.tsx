'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Calculator,
  Copy,
  Check,
  Info,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import SmartBackButton from '@/components/shared/SmartBackButton';
import { AppHeader } from '@/components/layout/AppHeader';
import { formatMoney, toCents, calculateUpgrade, ILabourUpgradeTier } from '@/lib/promo-logic';
import { toast } from 'sonner';

export default function LabourUpgradeCalculatorPage() {
  const [subtotalInput, setSubtotalInput] = useState<string>('12500');
  const [hstRate, setHstRate] = useState<number>(13);
  const [copiedFee, setCopiedFee] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [dbTiers, setDbTiers] = useState<ILabourUpgradeTier[]>([]);
  const [loading, setLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on initial mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Fetch active upgrade tiers from database
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.labourUpgradeTiers) && data.labourUpgradeTiers.length > 0) {
          setDbTiers(data.labourUpgradeTiers);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load settings:', err);
        setLoading(false);
      });
  }, []);

  // Parse entered subtotal to cents
  const subtotalCents = useMemo(() => {
    return toCents(subtotalInput);
  }, [subtotalInput]);

  // Calculate Labour Upgrade fee
  const upgradeResult = useMemo(() => {
    return calculateUpgrade(subtotalCents, dbTiers.length > 0 ? dbTiers : undefined);
  }, [subtotalCents, dbTiers]);

  // Active matching tier in database
  const activeTier = useMemo(() => {
    if (dbTiers.length === 0) return null;
    const amountDollars = subtotalCents / 100;
    return dbTiers.find((t) => {
      const minOk = amountDollars >= t.minAmount;
      const maxOk = t.maxAmount === null || t.maxAmount === undefined || amountDollars < t.maxAmount;
      return minOk && maxOk;
    });
  }, [subtotalCents, dbTiers]);

  // Subtotals with upgrade
  const isAvailable = subtotalCents >= 300000 && upgradeResult.charge > 0;
  const subtotalWithUpgradeCents = subtotalCents + (isAvailable ? upgradeResult.charge : 0);

  // Tax calculations
  const baseHstCents = Math.round((subtotalCents * hstRate) / 100);
  const baseTotalCents = subtotalCents + baseHstCents;

  const withUpgradeHstCents = Math.round((subtotalWithUpgradeCents * hstRate) / 100);
  const withUpgradeTotalCents = subtotalWithUpgradeCents + withUpgradeHstCents;

  // 1-Click Copy Handlers
  const handleCopyFee = () => {
    if (!isAvailable) {
      toast.error('Labour upgrade is not available for this subtotal.');
      return;
    }
    const feeText = formatMoney(upgradeResult.charge);
    navigator.clipboard.writeText(feeText);
    setCopiedFee(true);
    toast.success(`Copied ${feeText} to clipboard!`);
    setTimeout(() => setCopiedFee(false), 2000);
  };

  const handleCopySummary = () => {
    if (!isAvailable) {
      toast.error('Labour upgrade is not available for this subtotal.');
      return;
    }
    const summaryText = `Optional Labour Upgrade: +${formatMoney(upgradeResult.charge)} (${upgradeResult.rate}). Pre-tax subtotal with upgrade: ${formatMoney(subtotalWithUpgradeCents)}.`;
    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    toast.success('Copied summary breakdown to clipboard!');
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const setPreset = (amount: number) => {
    setSubtotalInput(amount.toString());
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 relative z-10 space-y-4">
        <AppHeader currentPath="/upgrade-calculator" />

        {/* Compact Sub-bar with SmartBackButton & Title */}
        <div className="flex items-center justify-between gap-4 pb-2.5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <SmartBackButton fallbackUrl="/calculator" title="Back to Calculator" />
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-4 h-4" />
              </span>
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-foreground">
                Labour Upgrade Calculator
              </h1>
            </div>
          </div>
          <div className="text-xs text-muted-foreground hidden sm:block">
            Fast pre-tax fee estimator &amp; customer breakdown
          </div>
        </div>

        {/* Main 2-Column Calculator Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Input & Quick Controls */}
          <div className="lg:col-span-5 space-y-5">
            <Card className="bg-card/60 border-border/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border/50 pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-primary" />
                  <span>Job Subtotal Amount</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  Enter the pre-tax quote subtotal after promo discounts.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-5 space-y-4">
                {/* Big Currency Input */}
                <div className="space-y-1.5">
                  <Label htmlFor="subtotalInput" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Pre-Tax Subtotal ($)
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground font-bold text-lg">
                      $
                    </div>
                    <Input
                      id="subtotalInput"
                      ref={inputRef}
                      type="number"
                      step="any"
                      min="0"
                      value={subtotalInput}
                      onChange={(e) => setSubtotalInput(e.target.value)}
                      placeholder="e.g. 12500"
                      className="pl-8 text-xl sm:text-2xl font-mono font-bold h-13 bg-background border-border/80 focus-visible:ring-emerald-500 shadow-inner"
                    />
                    {subtotalInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setSubtotalInput('');
                          inputRef.current?.focus();
                        }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Clear input"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Quick Sample Amounts
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { label: '$2.5k (N/A)', amount: 2500 },
                      { label: '$4.5k (6%)', amount: 4500 },
                      { label: '$8k (8%)', amount: 8000 },
                      { label: '$12.5k (8.5%)', amount: 12500 },
                      { label: '$18k (9%)', amount: 18000 },
                      { label: '$28k (11%)', amount: 28000 },
                    ].map((p) => (
                      <button
                        key={p.amount}
                        type="button"
                        onClick={() => setPreset(p.amount)}
                        className={cn(
                          'text-xs px-2.5 py-1 rounded-lg border font-medium transition-colors cursor-pointer',
                          subtotalInput === String(p.amount)
                            ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs'
                            : 'bg-muted/40 border-border/60 hover:bg-muted text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tax Rate Setting */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-xs font-semibold text-foreground">HST / Tax Rate</Label>
                    <p className="text-[11px] text-muted-foreground">For total with tax estimation</p>
                  </div>
                  <div className="flex items-center gap-1 p-1 bg-muted/60 rounded-xl border border-border/60 text-xs">
                    {[
                      { label: '13% HST', val: 13 },
                      { label: '8% FN', val: 8 },
                      { label: '0%', val: 0 },
                    ].map((r) => (
                      <button
                        key={r.val}
                        type="button"
                        onClick={() => setHstRate(r.val)}
                        className={cn(
                          'px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer',
                          hstRate === r.val
                            ? 'bg-background text-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Helper Note for Clerk */}
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border/70 text-xs text-muted-foreground space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <Info className="w-3.5 h-3.5 text-primary" />
                <span>Clerk Quick Guide</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Labour Upgrade coverage is an optional 5-year labour warranty offer. Quotes under $3,000 do not qualify. It does not alter base quote deposits unless explicitly accepted by the customer.
              </p>
            </div>
          </div>

          {/* Right Column: Result Hero & Breakdown */}
          <div className="lg:col-span-7 space-y-5">
            {/* Upgrade Fee Hero Card */}
            <Card
              className={cn(
                'rounded-2xl border transition-all shadow-xl overflow-hidden',
                isAvailable
                  ? 'bg-gradient-to-br from-emerald-500/15 via-background to-emerald-500/10 border-emerald-500/35'
                  : 'bg-muted/30 border-border/80'
              )}
            >
              <CardContent className="p-6 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/50">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        'p-2.5 rounded-xl text-white font-bold shadow-md',
                        isAvailable ? 'bg-emerald-600' : 'bg-muted-foreground/60'
                      )}
                    >
                      <ShieldCheck className="w-6 h-6 stroke-[2.5]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Optional Labour Upgrade Fee
                      </span>
                      <h3 className="text-lg font-black text-foreground">
                        5-Year Labour Coverage
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'text-xs px-3 py-1 rounded-full font-bold border shadow-xs',
                        isAvailable
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                          : 'bg-muted text-muted-foreground border-border'
                      )}
                    >
                      {upgradeResult.rate}
                    </span>
                  </div>
                </div>

                {/* Hero Number Display */}
                {isAvailable ? (
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Calculated Upgrade Price (Pre-Tax):
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl sm:text-5xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                        +{formatMoney(upgradeResult.charge)}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        pre-tax
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-900 dark:text-amber-200">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold">Labour Upgrade Not Available</p>
                      <p className="text-xs text-amber-800 dark:text-amber-300">
                        The minimum pre-tax subtotal to qualify for 5-year labour warranty upgrade is $3,000.00. Current subtotal is {formatMoney(subtotalCents)}.
                      </p>
                    </div>
                  </div>
                )}

                {/* 1-Click Action Buttons */}
                {isAvailable && (
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={handleCopyFee}
                      className="gap-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer"
                    >
                      {copiedFee ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedFee ? 'Copied Fee!' : 'Copy Fee (' + formatMoney(upgradeResult.charge) + ')'}</span>
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopySummary}
                      className="gap-1.5 text-xs font-semibold border-border hover:bg-muted text-foreground cursor-pointer shadow-xs"
                    >
                      {copiedSummary ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSummary ? 'Copied Breakdown!' : 'Copy Summary for Customer / Odoo'}</span>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Financial Comparison Summary */}
            <Card className="bg-card/50 border-border/80 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border/50 pb-3.5 bg-muted/20">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Quote Breakdown &amp; Comparison</span>
                  <span className="text-[11px] text-muted-foreground font-normal">
                    Comparing Base Quote vs Quote with Labour Upgrade
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-5">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  {/* Left: Base Quote */}
                  <div className="space-y-2 p-3 rounded-xl bg-muted/30 border border-border/60">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block border-b border-border/40 pb-1">
                      Base Quote (Without Upgrade)
                    </span>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Pre-Tax Subtotal:</span>
                      <span className="font-semibold text-foreground font-mono">{formatMoney(subtotalCents)}</span>
                    </div>
                    {hstRate > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>HST ({hstRate}%):</span>
                        <span className="font-semibold text-foreground font-mono">{formatMoney(baseHstCents)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-border/50 font-bold text-foreground">
                      <span>Total:</span>
                      <span className="font-mono text-sm">{formatMoney(baseTotalCents)}</span>
                    </div>
                  </div>

                  {/* Right: Quote With Upgrade */}
                  <div className="space-y-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block border-b border-emerald-500/20 pb-1">
                      With Labour Upgrade
                    </span>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Pre-Tax Subtotal:</span>
                      <span className="font-semibold text-foreground font-mono">
                        {formatMoney(subtotalWithUpgradeCents)}
                      </span>
                    </div>
                    {hstRate > 0 && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>HST ({hstRate}%):</span>
                        <span className="font-semibold text-foreground font-mono">{formatMoney(withUpgradeHstCents)}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-2 border-t border-emerald-500/20 font-bold text-emerald-600 dark:text-emerald-400">
                      <span>Total with Upgrade:</span>
                      <span className="font-mono text-sm">{formatMoney(withUpgradeTotalCents)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Reference: Active Tier Brackets Table */}
        <Card className="bg-card/40 border-border/70 backdrop-blur-xl shadow-md rounded-2xl overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-3.5 bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Active Database Labour Upgrade Brackets</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Live brackets pulled from company database settings. Highlighted row matches current input.
              </CardDescription>
            </div>
            <Link
              href="/admin/settings"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Manage in Admin Settings</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/40 uppercase tracking-wider text-[10px] text-muted-foreground border-b border-border/50">
                  <tr>
                    <th className="p-3">Job Subtotal Range</th>
                    <th className="p-3">Upgrade Rate</th>
                    <th className="p-3">Minimum Fee Floor</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Fee on Current Job</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {(dbTiers.length > 0 ? dbTiers : [
                    { id: 't0', minAmount: 0, maxAmount: 3000, ratePercent: 0, minFee: 0, isAvailable: false, label: 'Not available below $3,000' },
                    { id: 't1', minAmount: 3000, maxAmount: 5000, ratePercent: 6, minFee: 260, isAvailable: true, label: '6% (minimum $260)' },
                    { id: 't2', minAmount: 5000, maxAmount: 7500, ratePercent: 7, minFee: 0, isAvailable: true, label: '7%' },
                    { id: 't3', minAmount: 7500, maxAmount: 10000, ratePercent: 8, minFee: 0, isAvailable: true, label: '8%' },
                    { id: 't4', minAmount: 10000, maxAmount: 15000, ratePercent: 8.5, minFee: 0, isAvailable: true, label: '8.5%' },
                    { id: 't5', minAmount: 15000, maxAmount: 20000, ratePercent: 9, minFee: 0, isAvailable: true, label: '9%' },
                    { id: 't6', minAmount: 20000, maxAmount: 25000, ratePercent: 10, minFee: 0, isAvailable: true, label: '10%' },
                    { id: 't7', minAmount: 25000, maxAmount: null, ratePercent: 11, minFee: 0, isAvailable: true, label: '11%' },
                  ]).map((t) => {
                    const isRowActive = activeTier?.id === t.id;
                    const rangeLabel =
                      t.maxAmount === null
                        ? `$${t.minAmount.toLocaleString()} and above`
                        : `$${t.minAmount.toLocaleString()} – $${(t.maxAmount - 0.01).toLocaleString()}`;

                    return (
                      <tr
                        key={t.id}
                        className={cn(
                          'transition-colors',
                          isRowActive
                            ? 'bg-emerald-500/10 font-bold text-foreground'
                            : 'hover:bg-muted/30 text-muted-foreground'
                        )}
                      >
                        <td className="p-3 font-mono">
                          <span className="flex items-center gap-2">
                            {isRowActive && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                            )}
                            <span>{rangeLabel}</span>
                          </span>
                        </td>
                        <td className="p-3 font-semibold text-foreground">
                          {t.isAvailable ? `${t.ratePercent}%` : '—'}
                        </td>
                        <td className="p-3 font-mono">
                          {t.minFee > 0 ? `$${t.minFee.toFixed(2)}` : 'None'}
                        </td>
                        <td className="p-3">
                          {t.isAvailable ? (
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                              Active
                            </span>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">
                              Not available
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right font-mono font-bold">
                          {isRowActive ? (
                            isAvailable ? (
                              <span className="text-emerald-600 dark:text-emerald-400">
                                +{formatMoney(upgradeResult.charge)}
                              </span>
                            ) : (
                              <span className="text-muted-foreground italic">$0.00 (N/A)</span>
                            )
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
