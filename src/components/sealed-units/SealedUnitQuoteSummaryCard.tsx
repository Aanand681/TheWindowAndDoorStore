'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  DollarSign,
  PackageCheck,
  Printer,
  RotateCcw,
  FileText,
  Send,
  ShieldCheck,
  Bookmark,
  FolderOpen,
  Paperclip,
  Sparkles,
  Wrench,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import QuoteNotesEditor from '@/components/quotes/QuoteNotesEditor';
import { cn } from '@/lib/utils';
import {
  SealedUnitLabourSettings,
  SealedUnitLineItem,
  formatSealedUnitSummarySentence,
  getSealedUnitServiceSummaryLabel,
} from '@/lib/sealed-units-logic';
import { formatDoorSummarySentence, formatDoorItemHeading } from '@/lib/doors/calculations';
import { formatWindowSummarySentence } from '@/hooks/useCalculatorWindows';

export interface SealedUnitQuoteSummaryCardProps {
  lineItems: SealedUnitLineItem[];
  lineItemsCount: number;
  mode?: 'installation' | 'supply_only' | 'service_only';
  onModeChange?: (mode: 'installation' | 'supply_only' | 'service_only') => void;
  isInstallation: boolean;
  labour: SealedUnitLabourSettings;
  hstRate: number;
  setHstRate: (r: number) => void;
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
  customerName: string;
  quoteNumber: string;
  quoteNotes: string;
  setQuoteNotes: (notes: string) => void;
  user?: any;
  onOpenSubmitModal?: () => void;
  onPrint: () => void;
  onResetQuote?: () => void;
  onSaveDraft?: () => void;
  onOpenSavedQuotes?: () => void;
  attachedWindowQuote?: any | null;
  attachedDoorQuote?: any | null;
  onOpenAttachModal?: () => void;
  onRemoveAttachedWindowQuote?: () => void;
  onRemoveAttachedDoorQuote?: () => void;
}

export function SealedUnitQuoteSummaryCard({
  lineItems,
  lineItemsCount,
  mode = 'installation',
  onModeChange,
  isInstallation,
  labour,
  hstRate,
  setHstRate,
  totals,
  customerName,
  quoteNumber,
  quoteNotes,
  setQuoteNotes,
  user,
  onOpenSubmitModal,
  onPrint,
  onResetQuote,
  onSaveDraft,
  onOpenSavedQuotes,
  attachedWindowQuote,
  attachedDoorQuote,
  onOpenAttachModal,
  onRemoveAttachedWindowQuote,
  onRemoveAttachedDoorQuote,
}: SealedUnitQuoteSummaryCardProps) {
  const isService = mode === 'service_only';
  const hasAttachedWindow = Boolean(attachedWindowQuote);
  const hasAttachedDoor = Boolean(attachedDoorQuote);
  const hasAnyAttached = hasAttachedWindow || hasAttachedDoor;
  const hasContent = isService ? ((totals.totalSqft || 0) > 0 || lineItemsCount > 0) : (lineItemsCount > 0 || hasAnyAttached);

  const winBase = hasAttachedWindow ? (attachedWindowQuote.totals?.base || attachedWindowQuote.totals?.subtotal || 0) : 0;
  const winJC = hasAttachedWindow ? (attachedWindowQuote.totals?.jc ?? attachedWindowQuote.jcDollars ?? 0) : 0;
  const winJCDescription = attachedWindowQuote?.jcLabel || 'Jambs & Casing';
  const winDiscount = hasAttachedWindow
    ? (attachedWindowQuote.totals?.promoDiscount || attachedWindowQuote.quoteResult?.promoDiscount || attachedWindowQuote.data?.promoDiscount || 0) / (attachedWindowQuote.quoteResult?.promoDiscount ? 100 : 1)
    : 0;
  const doorRawBase = hasAttachedDoor
    ? ((attachedDoorQuote.totals?.rawDoorBaseTotal || 0) + (attachedDoorQuote.totals?.stormDoorTotal || 0) + (attachedDoorQuote.totals?.hardwareTotal || 0))
    : 0;
  const doorDiscount = hasAttachedDoor
    ? (attachedDoorQuote.totals?.discountTotal || 0)
    : 0;

  const winLabour = hasAttachedWindow ? (attachedWindowQuote.totals?.labour || 0) : 0;
  // Deduplication: Host SU keeps its setup & travel. Attached door has setup and travel stripped!
  const doorLabour = hasAttachedDoor ? ((attachedDoorQuote.totals?.unitLabourTotal || 0) + (attachedDoorQuote.totals?.upchargesTotal || 0)) : 0;
  const winMisc = hasAttachedWindow ? (attachedWindowQuote.totals?.misc || 0) : 0;
  const doorMisc = hasAttachedDoor ? (attachedDoorQuote.totals?.miscTotal || 0) : 0;
  const rawWinSurcharge = hasAttachedWindow ? (attachedWindowQuote.totals?.surcharge || 0) : 0;
  const winSurcharge = (rawWinSurcharge > winBase && winBase > 0)
    ? Math.round(winBase * 0.08 * 100) / 100
    : rawWinSurcharge;
  const doorSurcharge = hasAttachedDoor ? (attachedDoorQuote.totals?.surchargeTotal || 0) : 0;

  const suMaterials = isService ? 0 : totals.glassBefore8PercentTotal;
  const combinedLabour = totals.combinedLabourTotal + winLabour + doorLabour;
  const combinedMisc = totals.miscTotal + winMisc + doorMisc;
  const combinedSurcharge = totals.glass8PercentSurchargeTotal + winSurcharge + doorSurcharge;
  const combinedSubtotal = hasAnyAttached
    ? Math.round((suMaterials + (winBase - winDiscount) + winJC + (doorRawBase - doorDiscount) + combinedLabour + combinedMisc + combinedSurcharge) * 100) / 100
    : totals.subtotalPreTax;

  let combinedTax = totals.hstAmount;
  if (hasAnyAttached) {
    if (hstRate === 8) {
      const mat = totals.glassBefore8PercentTotal + totals.glass8PercentSurchargeTotal + ((winBase - winDiscount) + winSurcharge + winJC) + ((doorRawBase - doorDiscount) + doorSurcharge);
      const srv = combinedLabour + combinedMisc;
      combinedTax = Math.round((mat * 0.05 + srv * 0.13) * 100) / 100;
    } else if (hstRate === 13) {
      combinedTax = Math.round(combinedSubtotal * 0.13 * 100) / 100;
    } else {
      combinedTax = 0;
    }
  }

  const displayGrandTotal = hasAnyAttached ? Math.round((combinedSubtotal + combinedTax) * 100) / 100 : totals.grandTotal;
  const firstPayment = Math.floor((displayGrandTotal / 2) * 100) / 100;
  const secondPayment = Math.round((displayGrandTotal - firstPayment) * 100) / 100;

  const attachedDoorSentence = hasAttachedDoor
    ? (attachedDoorQuote.lineItems && attachedDoorQuote.lineItems.length > 0
        ? formatDoorSummarySentence(attachedDoorQuote.lineItems)
        : 'Attached Door Units')
    : '';

  const attachedWinSentence = hasAttachedWindow
    ? (formatWindowSummarySentence(attachedWindowQuote.windows || []) !== '0 Windows'
        ? formatWindowSummarySentence(attachedWindowQuote.windows || [])
        : (attachedWindowQuote.summarySentence || attachedWindowQuote.summaryLabel || `Attached Window Units (#${attachedWindowQuote.quoteNumber})`))
    : '';

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-border shadow-xl flex flex-col py-0 gap-0 overflow-hidden relative [--card-spacing:0px]">
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
      {/* Header */}
      <CardHeader className="p-3.5 pb-2.5 border-b border-border/50">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base font-bold flex items-center gap-1.5 truncate">
              <span className="truncate">Sealed Unit Summary</span>
            </CardTitle>
            <p className="text-[11px] text-muted-foreground leading-tight mt-0.5 truncate" suppressHydrationWarning>
              Itemized summary for Quote #{quoteNumber || '------'} {customerName ? `• ${customerName}` : ''}
            </p>
          </div>
          {/* 3-Button Scope Selector in Header - Fixed on Right Corner: Supply Only, Install, Service Only */}
          {onModeChange ? (
            <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5 shrink-0">
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
                onClick={() => onModeChange('service_only')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                  mode === 'service_only'
                    ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Wrench className="w-3 h-3" />
                <span>Service Only</span>
              </button>
            </div>
          ) : (
            isService && (
              <span className="h-7 px-2.5 rounded-lg border border-border/80 bg-muted/60 text-[11px] font-semibold text-foreground flex items-center shadow-xs">
                Service Only
              </span>
            )
          )}
        </div>
      </CardHeader>

      <CardContent className="p-3.5 pt-3 space-y-4 flex-1 flex flex-col justify-between">
        {/* Active Multi-Quote Attachment Badges */}
        {hasAnyAttached && (
          <div className="space-y-1.5 pb-1">
            {attachedWindowQuote && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Paperclip className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
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

            {attachedDoorQuote && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-300">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Paperclip className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Combined Quote: Attached Door #{attachedDoorQuote.quoteNumber}</span>
                </span>
                {onRemoveAttachedDoorQuote && (
                  <button
                    type="button"
                    onClick={onRemoveAttachedDoorQuote}
                    className="text-[11px] font-bold text-destructive hover:underline cursor-pointer"
                  >
                    Detach
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {!hasContent ? (
          <div className="py-8 text-center text-muted-foreground space-y-1.5">
            <PackageCheck className="w-8 h-8 mx-auto opacity-30 text-muted-foreground" />
            <div className="text-xs font-semibold">
              {isService ? 'No service square footage entered yet' : 'No items added to quote yet'}
            </div>
            <p className="text-[11px] text-muted-foreground/80 max-w-xs mx-auto">
              {isService
                ? 'Enter total service square footage above or configure glass units on the left to compute pricing.'
                : 'Configure glass specs on the left and click "Add to Quote" to compute exact pricing.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            {/* Strict Sequence - Styled exactly like Promo Summary without bullets */}
            <div className="space-y-1.5 pb-2.5 border-b border-border/50">
              {isService ? (
                <>
                  {/* Service Labour with Dynamic Units Count, e.g. "1 Sealed Unit Service (Labour)" */}
                  <div className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
                    <span className="text-muted-foreground font-medium">
                      {getSealedUnitServiceSummaryLabel(lineItems, totals.totalSqft)} (Labour)
                    </span>
                    <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                      ${combinedLabour.toFixed(2)}
                    </span>
                  </div>

                  {/* Service Misc on Total Sqft */}
                  <div className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
                    <span className="text-muted-foreground font-medium">
                      Service Materials &amp; Misc ({(totals.totalSqft || 0).toFixed(2)} sq ft @ ${(totals.effectiveMiscRate || labour.miscRatePerSqft || 2.40).toFixed(2)}/sqft)
                    </span>
                    <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                      +${combinedMisc.toFixed(2)}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {/* 1. Unified Glass Summary Sentence */}
                  {lineItemsCount > 0 && (
                    <div className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
                      <span className="text-muted-foreground font-medium capitalize truncate">
                        {formatSealedUnitSummarySentence(lineItems)}
                      </span>
                      <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                        ${totals.glassBefore8PercentTotal.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Attached Window Glass */}
                  {hasAttachedWindow && (
                    <div className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
                      <span className="text-muted-foreground font-medium truncate">
                        {attachedWinSentence}
                      </span>
                      <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                        +${winBase.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Attached Window Jambs & Casing if present */}
                  {hasAttachedWindow && winJC > 0 && (
                    <div className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
                      <span className="text-muted-foreground font-medium truncate">
                        {winJCDescription}
                      </span>
                      <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                        +${winJC.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* Attached Door Units (Itemized as headings) */}
                  {hasAttachedDoor && (
                    attachedDoorQuote?.lineItems && attachedDoorQuote.lineItems.length > 0 ? (
                      attachedDoorQuote.lineItems.map((dItem: any, dIdx: number) => {
                        const q = dItem.quantity || 1;
                        const heading = formatDoorItemHeading(dItem);
                        const itemBaseTotal = (dItem.inksterBasePrice || 0) * q;
                        return (
                          <div key={dItem.id || dIdx} className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
                            <span className="text-muted-foreground font-medium truncate">
                              {heading}
                            </span>
                            <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                              +${itemBaseTotal.toFixed(2)}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
                        <span className="text-muted-foreground font-medium truncate">
                          {attachedDoorSentence}
                        </span>
                        <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                          +${doorRawBase.toFixed(2)}
                        </span>
                      </div>
                    )
                  )}

                  {/* Attached Door Hardware if any */}
                  {hasAttachedDoor && Boolean(attachedDoorQuote?.totals?.hardwareTotal > 0) && (
                    <div className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
                      <span className="text-muted-foreground font-medium truncate">Door Lockset &amp; Hardware</span>
                      <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                        +${Number(attachedDoorQuote.totals.hardwareTotal).toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* 2. Labour (includes all the labour and travel charges) */}
                  {(isInstallation || hasAnyAttached) && (
                    <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
                      <span className="text-muted-foreground">
                        Labour {hasAnyAttached ? '(all quotes combined)' : '(includes all the labour and the travel charges)'}
                      </span>
                      <span className="font-mono text-foreground font-semibold whitespace-nowrap shrink-0">
                        +${combinedLabour.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* 3. Misc */}
                  {(isInstallation || hasAnyAttached) && (
                    <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
                      <span className="text-muted-foreground">
                        Misc {hasAnyAttached ? '(all quotes combined)' : ''}
                      </span>
                      <span className="font-mono text-foreground font-semibold whitespace-nowrap shrink-0">
                        +${combinedMisc.toFixed(2)}
                      </span>
                    </div>
                  )}

                  {/* 4. Surcharge (8% Materials Surcharge) */}
                  <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
                    <span className="text-muted-foreground">
                      Surcharge {hasAnyAttached ? '(8% on materials)' : '(8% Glass Surcharge)'}
                    </span>
                    <span className="font-mono text-muted-foreground font-semibold whitespace-nowrap shrink-0">
                      +${combinedSurcharge.toFixed(2)}
                    </span>
                  </div>

                  {/* 5. Separate Discount Rows */}
                  {winDiscount > 0 && (
                    <div className="flex items-center justify-between text-xs sm:text-sm py-0.5 font-medium text-emerald-600 dark:text-emerald-400">
                      <span>Promo Discount ({attachedWindowQuote?.promoName || attachedWindowQuote?.quoteResult?.promoName || 'Window Promo'})</span>
                      <span className="font-mono whitespace-nowrap shrink-0">-${winDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  {doorDiscount > 0 && (
                    <div className="flex items-center justify-between text-xs sm:text-sm py-0.5 font-medium text-emerald-600 dark:text-emerald-400">
                      <span>10% Door Discount (non-storm doors)</span>
                      <span className="font-mono whitespace-nowrap shrink-0">-${doorDiscount.toFixed(2)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* 6. Subtotal of this amount */}
            <div className="pb-2.5 border-b border-border/50 text-xs sm:text-sm">
              <div className="flex items-center justify-between font-medium">
                <span className="text-foreground font-bold">Subtotal</span>
                <span className="font-mono font-bold text-primary whitespace-nowrap shrink-0">
                  ${combinedSubtotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Tax Section matching Door & Promo Summary */}
            <div className="pt-1 pb-2.5 space-y-1.5 border-b border-border/50">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-muted-foreground">
                  {isService
                    ? '13% HST (Service Rate)'
                    : hstRate === 8
                    ? '5% GST (First Nations Material Exemption)'
                    : hstRate === 0
                    ? 'No Tax'
                    : '13% HST'}
                </span>
                <span className="font-mono font-semibold text-foreground whitespace-nowrap shrink-0">
                  ${combinedTax.toFixed(2)}
                </span>
              </div>

              {!isService && (
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="suFirstNationCheckbox"
                      checked={hstRate === 8}
                      onCheckedChange={(c) => setHstRate(c ? 8 : 13)}
                    />
                    <Label
                      htmlFor="suFirstNationCheckbox"
                      className="cursor-pointer text-muted-foreground font-normal text-xs"
                    >
                      8% First Nations Material Exemption
                    </Label>
                  </div>
                  <span className={cn('font-mono text-xs', hstRate === 8 ? 'text-emerald-500 font-semibold' : 'text-muted-foreground opacity-40 line-through')}>
                    {hstRate === 8 ? '-8% PST' : 'Standard'}
                  </span>
                </div>
              )}
            </div>

            {/* 8. Total */}
            <div className="pt-1">
              <div className="flex justify-between items-baseline mb-2">
                <span className="text-base font-bold">Total</span>
                <span className="text-2xl font-black font-mono tracking-tight text-primary whitespace-nowrap shrink-0">
                  ${displayGrandTotal.toFixed(2)}
                </span>
              </div>

              {/* 50/50 Deposit Schedule (Matching Door & Promo Summary) */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div className="bg-muted/60 rounded-xl p-2.5 border border-border/60">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
                    First 50% Deposit
                  </div>
                  <div className="font-mono font-bold text-primary text-sm whitespace-nowrap">
                    ${firstPayment.toFixed(2)}
                  </div>
                </div>
                <div className="bg-muted/60 rounded-xl p-2.5 border border-border/60">
                  <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">
                    Final 50% Balance
                  </div>
                  <div className="font-mono font-bold text-primary text-sm whitespace-nowrap">
                    ${secondPayment.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Option for door Callout (if attached door quote has upgrade options) */}
            {hasAttachedDoor && attachedDoorQuote?.lineItems && attachedDoorQuote.lineItems.some((i: any) => i.upgradeOption?.enabled) && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1.5 text-xs">
                <div className="font-bold flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300">
                  <Sparkles className="w-3.5 h-3.5" />
                  Option for door:
                </div>
                <div className="space-y-1 divide-y divide-emerald-500/20">
                  {attachedDoorQuote.lineItems.filter((i: any) => i.upgradeOption?.enabled).map((item: any, idx: number) => (
                    <div key={item.id || idx} className="pt-1 first:pt-0 flex items-center justify-between gap-2">
                      <span className="truncate text-muted-foreground text-[11px]">
                        {item.customDescription || item.presetLabel}: <strong>{item.upgradeOption?.title}</strong>
                      </span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 shrink-0 text-xs">
                        +${Number(item.upgradeOption?.subtotalDifference || 0).toFixed(2)}/unit
                        {item.quantity > 1 ? ` (+${(Number(item.upgradeOption?.subtotalDifference || 0) * item.quantity).toFixed(2)} total)` : ''}
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

            {/* Quote Notes Section */}
            <div className="pt-2 border-t border-border/50 space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="sealedUnitNotes"
                  className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-primary" />
                  <span>Special Notes &amp; Instructions</span>
                </Label>
                <span className="text-[10px] text-muted-foreground">Printed on PDF quotation</span>
              </div>
              <QuoteNotesEditor
                id="sealedUnitNotes"
                value={quoteNotes}
                onChange={setQuoteNotes}
                placeholder="Enter special site notes, instructions, or employee comments with bold text and bullets..."
              />
            </div>

            {/* Action Buttons: Submit / Approve & Assign, Preview & Print */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              {onOpenSubmitModal && (
                <Button
                  type="button"
                  variant="default"
                  onClick={onOpenSubmitModal}
                  disabled={!hasContent}
                  className={cn(
                    'w-full h-10 text-xs shadow-md font-bold text-white cursor-pointer transition-colors',
                    user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  )}
                >
                  {user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' ? (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2" /> Approve &amp; Assign / Submit Quote
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" /> Submit Quote for Review
                    </>
                  )}
                </Button>
              )}

              <Button
                type="button"
                onClick={onPrint}
                disabled={!hasContent}
                className="w-full h-10 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-bold gap-2 shadow-sm text-xs sm:text-sm cursor-pointer transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Preview &amp; Print Quote</span>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
