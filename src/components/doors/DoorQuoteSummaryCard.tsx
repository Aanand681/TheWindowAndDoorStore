'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  DoorLineItem,
  DoorQuoteTotals,
  DoorQuotingMode,
} from '@/lib/doors/types';
import { formatDoorSummarySentence, formatDoorItemHeading } from '@/lib/doors/calculations';
import { formatSealedUnitSummarySentence } from '@/lib/sealed-units-logic';
import { formatWindowSummarySentence } from '@/hooks/useCalculatorWindows';
import {
  Printer,
  Sparkles,
  ShieldCheck,
  Send,
  Wrench,
  PackageCheck,
  Paperclip,
  Pencil,
  RotateCcw,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DoorQuoteSummaryCardProps {
  customerName?: string;
  quoteNumber?: string;
  lineItems: DoorLineItem[];
  totals: DoorQuoteTotals;
  mode: DoorQuotingMode;
  onModeChange: (mode: DoorQuotingMode) => void;
  isFirstNation: boolean;
  onToggleFirstNation: (val: boolean) => void;
  onSubmitQuote: () => void;
  onPrintPreview: () => void;
  isAdmin?: boolean;
  customLabour?: string;
  setCustomLabour?: (val: string) => void;
  customMisc?: string;
  setCustomMisc?: (val: string) => void;
  attachedWindowQuote?: any | null;
  attachedSealedUnit?: any | null;
  onOpenAttachModal?: () => void;
  onRemoveAttachedWindowQuote?: () => void;
  onRemoveAttachedSealedUnit?: () => void;
  className?: string;
}

export function DoorQuoteSummaryCard({
  customerName,
  quoteNumber,
  lineItems,
  totals,
  mode,
  onModeChange,
  isFirstNation,
  onToggleFirstNation,
  onSubmitQuote,
  onPrintPreview,
  isAdmin = false,
  customLabour = '',
  setCustomLabour,
  customMisc = '',
  setCustomMisc,
  attachedWindowQuote,
  attachedSealedUnit,
  onOpenAttachModal,
  onRemoveAttachedWindowQuote,
  onRemoveAttachedSealedUnit,
  className,
}: DoorQuoteSummaryCardProps) {
  const [editingField, setEditingField] = useState<'labour' | 'misc' | null>(null);
  const [tempEditVal, setTempEditVal] = useState<string>('');
  const isInstallation = mode === 'installation';
  const doorSentence = formatDoorSummarySentence(lineItems);
  const upgradeItems = lineItems.filter((i) => i.upgradeOption?.enabled);

  const hasAttachedWindow = Boolean(attachedWindowQuote);
  const hasAttachedSU = Boolean(attachedSealedUnit);
  const hasAnyAttached = hasAttachedWindow || hasAttachedSU;

  const winBase = hasAttachedWindow ? (attachedWindowQuote.totals?.base || attachedWindowQuote.totals?.subtotal || 0) : 0;
  const winJC = hasAttachedWindow ? (attachedWindowQuote.totals?.jc ?? attachedWindowQuote.jcDollars ?? 0) : 0;
  const winJCDescription = attachedWindowQuote?.jcLabel || 'Jambs & Casing';
  const winDiscount = hasAttachedWindow
    ? (attachedWindowQuote.totals?.promoDiscount || attachedWindowQuote.quoteResult?.promoDiscount || attachedWindowQuote.data?.promoDiscount || 0) / (attachedWindowQuote.quoteResult?.promoDiscount ? 100 : 1)
    : 0;
  const suGlass = hasAttachedSU ? (attachedSealedUnit.totals?.glassBefore8PercentTotal || 0) : 0;
  const winLabour = hasAttachedWindow ? (attachedWindowQuote.totals?.labour || 0) : 0;
  // Deduplication: Host door quote keeps its setup and travel. Attached SU has travel and setup stripped!
  const suLabour = hasAttachedSU ? (attachedSealedUnit.totals?.serviceLabourTotal ?? attachedSealedUnit.totals?.unitLabourSum ?? 0) : 0;
  const winMisc = hasAttachedWindow ? (attachedWindowQuote.totals?.misc || 0) : 0;
  const suMisc = hasAttachedSU ? (attachedSealedUnit.totals?.miscTotal || 0) : 0;
  const rawWinSurcharge = hasAttachedWindow ? (attachedWindowQuote.totals?.surcharge || 0) : 0;
  const winSurcharge = (rawWinSurcharge > winBase && winBase > 0)
    ? Math.round(winBase * 0.08 * 100) / 100
    : rawWinSurcharge;
  const suSurcharge = hasAttachedSU ? (attachedSealedUnit.totals?.glass8PercentSurchargeTotal || 0) : 0;

  const netDoorMaterials = (totals.rawDoorBaseTotal + totals.stormDoorTotal + totals.hardwareTotal - totals.discountTotal);
  
  const defaultDoorLabour = isInstallation ? totals.combinedLabourTotal : 0;
  const effectiveDoorLabour = customLabour !== '' ? (parseFloat(customLabour) || 0) : defaultDoorLabour;
  const combinedLabour = effectiveDoorLabour + winLabour + suLabour;

  const defaultDoorMisc = isInstallation ? totals.miscTotal : 0;
  const effectiveDoorMisc = customMisc !== '' ? (parseFloat(customMisc) || 0) : defaultDoorMisc;
  const combinedMisc = effectiveDoorMisc + winMisc + suMisc;

  const combinedSurcharge = totals.surchargeTotal + winSurcharge + suSurcharge;
  const combinedSubtotal = hasAnyAttached || customLabour !== '' || customMisc !== ''
    ? Math.round((netDoorMaterials + (winBase - winDiscount) + winJC + suGlass + combinedLabour + combinedMisc + combinedSurcharge) * 100) / 100
    : totals.subtotalPreTax;

  let combinedTax = totals.hstAmount;
  if (hasAnyAttached || customLabour !== '' || customMisc !== '') {
    if (isFirstNation) {
      const mat = (netDoorMaterials + totals.surchargeTotal) +
        ((winBase - winDiscount) + winSurcharge + winJC) + (suGlass + suSurcharge);
      const srv = combinedLabour + combinedMisc;
      combinedTax = Math.round((mat * 0.05 + srv * 0.13) * 100) / 100;
    } else {
      combinedTax = Math.round(combinedSubtotal * 0.13 * 100) / 100;
    }
  }

  const combinedGrandTotal = hasAnyAttached || customLabour !== '' || customMisc !== ''
    ? Math.round((combinedSubtotal + combinedTax) * 100) / 100
    : totals.grandTotal;

  const renderEditableRow = (
    field: 'labour' | 'misc',
    label: string,
    amount: number,
    customVal: string,
    defaultAmount: number,
    setter?: (val: string) => void,
    suffix?: string
  ) => {
    const isEditing = editingField === field;
    const isCustom = customVal !== '';

    if (isEditing && setter) {
      return (
        <div key={field} className="flex items-center justify-between gap-2 p-1.5 rounded-lg bg-primary/10 border border-primary/30 my-1 animate-in fade-in duration-150">
          <span className="font-semibold text-primary text-[11px] shrink-0">
            Edit {label}:
          </span>
          <div className="flex items-center gap-1.5 ml-auto">
            <span className="text-xs font-mono text-muted-foreground">$</span>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={tempEditVal}
              onChange={(e) => setTempEditVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setter(tempEditVal);
                  setEditingField(null);
                  toast.success(`Updated ${label} to $${Number(tempEditVal || 0).toFixed(2)}`);
                } else if (e.key === 'Escape') {
                  setEditingField(null);
                }
              }}
              className="h-6 w-24 text-xs font-mono text-right px-1.5 py-0 bg-background"
              autoFocus
            />
            <Button
              type="button"
              size="sm"
              variant="default"
              onClick={() => {
                setter(tempEditVal);
                setEditingField(null);
                toast.success(`Updated ${label} to $${Number(tempEditVal || 0).toFixed(2)}`);
              }}
              className="h-6 px-2 text-[10px] font-bold cursor-pointer"
            >
              Save
            </Button>
            {isCustom && (
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setter('');
                  setEditingField(null);
                  toast.info(`Reset ${label} to default ($${defaultAmount.toFixed(2)})`);
                }}
                className="h-6 px-1.5 text-[10px] cursor-pointer"
                title="Reset to default calculated price"
              >
                Reset
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => setEditingField(null)}
              className="h-6 px-1 text-[10px] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div key={field} className="flex items-center justify-between text-xs py-0.5 group">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-muted-foreground truncate">
            {label} {suffix && <span className="text-[10px] text-muted-foreground/70">{suffix}</span>}
          </span>
          {isCustom && (
            <span className="text-[9px] bg-primary/15 text-primary font-bold px-1.5 py-0.5 rounded shrink-0">
              custom
            </span>
          )}
          {isCustom && setter && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setter('');
                toast.info(`Reset ${label} to default ($${defaultAmount.toFixed(2)})`);
              }}
              className="h-5 px-1.5 text-[10px] font-semibold text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
              title="Reset to default calculated price"
            >
              <RotateCcw className="w-2.5 h-2.5 mr-0.5" />
              Reset
            </Button>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <span className={cn(
            "font-mono whitespace-nowrap",
            amount === 0 ? "text-muted-foreground text-xs" : (isCustom ? "font-bold text-primary" : "text-foreground font-medium")
          )}>
            ${amount.toFixed(2)}
          </span>
          {setter && isInstallation && (
            <button
              type="button"
              onClick={() => {
                setEditingField(field);
                setTempEditVal(isCustom ? customVal : amount.toFixed(2));
              }}
              className="p-0.5 rounded hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer"
              title={`Edit ${label} price`}
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    );
  };

  const displayGrandTotal = (hasAnyAttached || customLabour !== '' || customMisc !== '')
    ? Math.round((combinedSubtotal + combinedTax) * 100) / 100
    : totals.grandTotal;
  const firstPayment = Math.floor((displayGrandTotal / 2) * 100) / 100;
  const secondPayment = Math.round((displayGrandTotal - firstPayment) * 100) / 100;

  const attachedSUSentence = hasAttachedSU
    ? (attachedSealedUnit.lineItems && attachedSealedUnit.lineItems.length > 0
        ? formatSealedUnitSummarySentence(attachedSealedUnit.lineItems)
        : 'Attached Sealed Glass Units')
    : '';

  const attachedWinSentence = hasAttachedWindow
    ? (formatWindowSummarySentence(attachedWindowQuote.windows || []) !== '0 Windows'
        ? formatWindowSummarySentence(attachedWindowQuote.windows || [])
        : (attachedWindowQuote.summarySentence || attachedWindowQuote.summaryLabel || 'Attached Window Units'))
    : '';

  return (
    <Card className={cn('bg-card/80 backdrop-blur-xl border-border shadow-xl flex flex-col py-0 gap-0 overflow-hidden relative [--card-spacing:0px]', className)}>
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
      {/* Header with Title on Left, Mode Selector on Right */}
      <CardHeader className="p-3.5 pb-2.5 border-b border-border/50">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-bold flex items-center gap-1.5 truncate">
              <span className="truncate">Door Quote Summary</span>
            </CardTitle>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate" suppressHydrationWarning>
              Itemized summary for Quote #{quoteNumber || '------'} {customerName ? `• ${customerName}` : ''}
            </p>
          </div>

          {/* Compact Scope Selector in Header - Fixed on Right Corner */}
          <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5 shrink-0">
            <button
              type="button"
              onClick={() => onModeChange('installation')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                mode === 'installation'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Wrench className="w-3 h-3" />
              <span>Install</span>
            </button>
            <button
              type="button"
              onClick={() => onModeChange('supply_only')}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                mode === 'supply_only'
                  ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <PackageCheck className="w-3 h-3" />
              <span>Supply Only</span>
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 pt-3 space-y-4 flex-1 flex flex-col justify-between">
        {/* Attached Badges */}
        {hasAnyAttached && (
          <div className="space-y-1.5 pb-1">
            {attachedWindowQuote && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Combined Quote: Attached Window #{attachedWindowQuote.quoteNumber}</span>
                </span>
                {onRemoveAttachedWindowQuote && (
                  <button
                    type="button"
                    onClick={onRemoveAttachedWindowQuote}
                    className="text-[11px] font-bold text-destructive hover:underline cursor-pointer"
                  >
                    Detach
                  </button>
                )}
              </div>
            )}

            {attachedSealedUnit && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-800 dark:text-blue-300">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                  <span>Combined Quote: Attached Sealed Unit #{attachedSealedUnit.quoteNumber}</span>
                </span>
                {onRemoveAttachedSealedUnit && (
                  <button
                    type="button"
                    onClick={onRemoveAttachedSealedUnit}
                    className="text-[11px] font-bold text-destructive hover:underline cursor-pointer"
                  >
                    Detach
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Unified Line Item Breakdown Sequence */}
        <div className="space-y-2 text-xs sm:text-sm">
          {/* 1. Itemized Door Line Items (Treated as Headings) */}
          {lineItems.length > 0 ? (
            lineItems.map((item, idx) => {
              const qty = item.quantity || 1;
              const heading = formatDoorItemHeading(item);
              const itemBaseTotal = item.inksterBasePrice * qty;

              return (
                <div
                  key={item.id || idx}
                  className="flex items-start justify-between gap-2 pb-1.5 border-b border-border/30"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-foreground text-xs sm:text-sm">
                      {heading}
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Preset: {item.presetLabel} • ${item.inksterBasePrice.toFixed(2)}/ea
                    </div>
                  </div>
                  <div className="font-mono font-semibold text-xs sm:text-sm shrink-0">
                    ${itemBaseTotal.toFixed(2)}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="flex items-start justify-between gap-2 pb-1.5 border-b border-border/30">
              <div className="min-w-0">
                <div className="font-semibold text-foreground text-xs sm:text-sm">
                  Door Units
                </div>
                <div className="text-[11px] text-muted-foreground">
                  No doors configured yet
                </div>
              </div>
              <div className="font-mono font-semibold text-xs sm:text-sm shrink-0">
                $0.00
              </div>
            </div>
          )}

          {/* Attached Window Base if present */}
          {hasAttachedWindow && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate">{attachedWinSentence}</span>
              <span className="font-mono font-medium">+${winBase.toFixed(2)}</span>
            </div>
          )}

          {/* Attached Window Jambs & Casing if present */}
          {hasAttachedWindow && winJC > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate">{winJCDescription}</span>
              <span className="font-mono font-medium">+${winJC.toFixed(2)}</span>
            </div>
          )}

          {/* Attached Sealed Unit Glass if present */}
          {hasAttachedSU && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground truncate">{attachedSUSentence}</span>
              <span className="font-mono font-medium">+${suGlass.toFixed(2)}</span>
            </div>
          )}

          {/* 2. Labour */}
          {isInstallation && renderEditableRow(
            'labour',
            'Labour',
            combinedLabour,
            customLabour,
            defaultDoorLabour + winLabour + suLabour,
            setCustomLabour,
            hasAnyAttached ? '(all quotes)' : undefined
          )}

          {/* 3. Miscellaneous Materials */}
          {isInstallation && renderEditableRow(
            'misc',
            'Miscellaneous',
            combinedMisc,
            customMisc,
            defaultDoorMisc + winMisc + suMisc,
            setCustomMisc,
            hasAnyAttached ? '(all quotes)' : undefined
          )}

          {/* 4. Surcharge */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Surcharge (8% on materials)</span>
            <span className="font-mono font-medium">
              ${combinedSurcharge.toFixed(2)}
            </span>
          </div>

          {/* 5. 10% Discount */}
          {totals.discountTotal > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                10% Discount (Non-Storm Doors)
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                -${totals.discountTotal.toFixed(2)}
              </span>
            </div>
          )}

          {/* Attached Window Promo Discount (Shown Separately) */}
          {winDiscount > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                Promo Discount ({attachedWindowQuote?.promoName || attachedWindowQuote?.quoteResult?.promoName || 'Attached Window Promo'})
              </span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                -${winDiscount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Hardware line if applicable */}
          {totals.hardwareTotal > 0 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Lockset &amp; Hardware</span>
              <span className="font-mono font-medium">
                ${totals.hardwareTotal.toFixed(2)}
              </span>
            </div>
          )}

          {/* Divider */}
          <div className="pt-1 border-t border-border/60" />

          {/* 6. Subtotal */}
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Subtotal</span>
            <span className="font-mono text-base font-bold text-foreground">
              ${combinedSubtotal.toFixed(2)}
            </span>
          </div>

          {/* Tax Section matching Promo Summary */}
          <div className="pt-1 space-y-1.5 border-t border-border/40">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                {isFirstNation ? '5% GST (First Nations Material Exemption)' : '13% HST'}
              </span>
              <span className="font-mono font-medium">
                ${combinedTax.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs pt-0.5">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="doorFirstNationCheckbox"
                  checked={isFirstNation}
                  onCheckedChange={(c) => onToggleFirstNation(Boolean(c))}
                />
                <Label
                  htmlFor="doorFirstNationCheckbox"
                  className="cursor-pointer text-muted-foreground font-normal text-xs"
                >
                  8% First Nations Material Exemption
                </Label>
              </div>
              <span className={cn('font-mono text-xs', isFirstNation ? 'text-emerald-500 font-semibold' : 'text-muted-foreground opacity-40 line-through')}>
                {isFirstNation ? '-8% PST' : 'Standard'}
              </span>
            </div>
          </div>

          {/* Total incl. HST (matching Promo Summary Card typography) */}
          <div className="pt-2">
            <div className="flex justify-between items-baseline mb-2.5">
              <span className="text-base font-bold text-foreground">Total incl. HST</span>
              <span className="text-2xl font-black font-mono tracking-tight text-primary whitespace-nowrap shrink-0">
                ${displayGrandTotal.toFixed(2)}
              </span>
            </div>

            {/* Side-by-side 50/50 Deposit Schedule (matching Promo Summary) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-muted/60 rounded-xl p-2.5 border border-border/60 text-center sm:text-left">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
                  First 50%
                </div>
                <div className="font-mono font-bold text-primary text-base whitespace-nowrap">
                  ${firstPayment.toFixed(2)}
                </div>
              </div>
              <div className="bg-muted/60 rounded-xl p-2.5 border border-border/60 text-center sm:text-left">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
                  Final 50%
                </div>
                <div className="font-mono font-bold text-primary text-base whitespace-nowrap">
                  ${secondPayment.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Option for door Callout for Record Keeping */}
        {upgradeItems.length > 0 && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5 text-xs">
            <div className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              Option for door:
            </div>
            <div className="space-y-1 divide-y divide-emerald-500/20">
              {upgradeItems.map((item, idx) => (
                <div key={item.id || idx} className="pt-1 first:pt-0 flex items-center justify-between gap-2">
                  <span className="truncate text-muted-foreground text-[11px]">
                    {item.customDescription || item.presetLabel}: <strong>{item.upgradeOption?.title}</strong>
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0 text-xs">
                    +${item.upgradeOption?.subtotalDifference.toFixed(2)}/unit
                    {item.quantity > 1 ? ` (+${((item.upgradeOption?.subtotalDifference || 0) * item.quantity).toFixed(2)} total)` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Attached Window Upgrade Callout (if attached window has upgrade offer) */}
        {hasAttachedWindow && attachedWindowQuote?.attachedUpgrade?.amountPreTaxCents > 0 && (
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1 text-xs">
            <div className="font-bold flex items-center justify-between text-amber-800 dark:text-amber-300">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Optional Window Upgrade:
              </span>
              <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                +${(attachedWindowQuote.attachedUpgrade.amountPreTaxCents / 100).toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {attachedWindowQuote.attachedUpgrade.title} (Optional upgrade, not included in total)
            </p>
          </div>
        )}

        {/* Action Buttons: Submit / Approve on top, Preview & Print below */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          {/* Button 1: Submit / Approve & Assign Quote */}
          <Button
            type="button"
            onClick={onSubmitQuote}
            disabled={lineItems.length === 0}
            className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-sm text-xs sm:text-sm cursor-pointer"
          >
            {isAdmin ? (
              <>
                <ShieldCheck className="w-4 h-4" />
                Approve &amp; Assign Quote
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Submit Quote for Review
              </>
            )}
          </Button>

          {/* Button 2: Preview & Print Door Quote (Solid Black) */}
          <Button
            type="button"
            onClick={onPrintPreview}
            disabled={lineItems.length === 0}
            className="w-full h-10 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold gap-2 shadow-sm text-xs sm:text-sm cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Preview &amp; Print Door Quote
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
