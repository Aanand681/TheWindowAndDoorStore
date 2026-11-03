'use client';

import React from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  SealedUnitLabourSettings,
  SealedUnitLineItem,
  formatSealedUnitSummarySentence,
} from '@/lib/sealed-units-logic';

export interface SealedUnitQuoteSummaryCardProps {
  lineItems: SealedUnitLineItem[];
  lineItemsCount: number;
  mode?: 'installation' | 'supply_only' | 'service_only';
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
  onOpenPreview?: () => void;
  onOpenSubmitModal?: () => void;
  onPrint: () => void;
  onResetQuote?: () => void;
  onSaveDraft?: () => void;
  onOpenSavedQuotes?: () => void;
}

export function SealedUnitQuoteSummaryCard({
  lineItems,
  lineItemsCount,
  mode = 'installation',
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
  onOpenPreview,
  onOpenSubmitModal,
  onPrint,
  onResetQuote,
  onSaveDraft,
  onOpenSavedQuotes,
}: SealedUnitQuoteSummaryCardProps) {
  const isService = mode === 'service_only';
  const hasContent = isService ? ((totals.totalSqft || 0) > 0 || lineItemsCount > 0) : lineItemsCount > 0;

  // 50/50 Deposit Schedule (Matching Promo Calculator)
  const firstPayment = Math.floor((totals.grandTotal / 2) * 100) / 100;
  const secondPayment = Math.round((totals.grandTotal - firstPayment) * 100) / 100;

  return (
    <div className="bg-card/60 border border-border/80 backdrop-blur-xl shadow-xl rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-border/50 py-2.5 px-3.5 bg-muted/20">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-sm font-bold flex items-center gap-1.5 text-foreground">
            <DollarSign className="w-4 h-4 text-primary" />
            <span>Customer Quotation Summary</span>
          </div>
          <div className="flex items-center gap-2">
            {isService ? (
              <span className="h-7 px-2.5 rounded-lg border border-border/80 bg-muted/60 text-[11px] font-semibold text-foreground flex items-center shadow-xs">
                13% HST (Service Rate)
              </span>
            ) : (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline">Tax Scope:</span>
                <select
                  value={hstRate}
                  onChange={(e) => setHstRate(Number(e.target.value))}
                  className="h-7 px-2 rounded-lg border border-input bg-background text-[11px] font-semibold cursor-pointer shadow-xs text-foreground"
                >
                  <option value={13}>13% HST (Standard)</option>
                  <option value={8}>8% First Nations Material Exemption</option>
                  <option value={0}>0% Tax Exempt</option>
                </select>
              </div>
            )}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground leading-tight mt-0.5" suppressHydrationWarning>
          Customer quotation breakdown for Quote #{quoteNumber || '------'} {customerName ? `• ${customerName}` : ''}
        </p>
      </div>

      <div className="p-3.5 sm:p-4">
        {!hasContent ? (
          <div className="py-8 text-center text-muted-foreground space-y-1.5">
            <PackageCheck className="w-8 h-8 mx-auto opacity-30 text-muted-foreground" />
            <div className="text-xs font-semibold">
              {isService ? 'No service square footage entered yet' : 'No items added to quote yet'}
            </div>
            <p className="text-[11px] text-muted-foreground/80 max-w-xs mx-auto">
              {isService
                ? 'Enter total service square footage above or configure glass units to compute pricing.'
                : 'Configure glass specs above and click "Add to Quote" to compute exact pricing.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start text-xs">
            {/* Left Column (7 cols): Full Itemized Financial Accounting */}
            <div className="lg:col-span-7 space-y-2.5">
              <div className="space-y-1.5 pb-2 border-b border-border/50">
                {isService ? (
                  <>
                    {/* Service Labour on Total Sqft */}
                    <div className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
                      <span className="text-muted-foreground font-medium">
                        Service Labour {totals.totalTravelAndSetup > 0 ? '(includes travel & setup charges)' : `(${(totals.totalSqft || 0).toFixed(2)} sq ft @ $${(totals.effectiveLabourRate || labour.labourRatePerSqft || 14.40).toFixed(2)}/sqft)`}
                      </span>
                      <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                        ${totals.combinedLabourTotal.toFixed(2)}
                      </span>
                    </div>

                    {/* Service Misc on Total Sqft */}
                    <div className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
                      <span className="text-muted-foreground font-medium">
                        Service Materials &amp; Misc ({(totals.totalSqft || 0).toFixed(2)} sq ft @ ${(totals.effectiveMiscRate || labour.miscRatePerSqft || 2.40).toFixed(2)}/sqft)
                      </span>
                      <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                        +${(totals.miscTotal || 0).toFixed(2)}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    {/* 1. Unified Glass Summary Sentence */}
                    <div className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
                      <span className="text-muted-foreground font-medium capitalize truncate">
                        {formatSealedUnitSummarySentence(lineItems)}
                      </span>
                      <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                        ${totals.glassBefore8PercentTotal.toFixed(2)}
                      </span>
                    </div>

                    {/* 2. Labour (includes all the labour and travel charges) */}
                    {isInstallation && (
                      <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
                        <span className="text-muted-foreground">
                          Labour (includes installation &amp; travel setup)
                        </span>
                        <span className="font-mono text-foreground font-semibold whitespace-nowrap shrink-0">
                          +${totals.combinedLabourTotal.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* 3. Misc */}
                    {isInstallation && (
                      <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
                        <span className="text-muted-foreground">Miscellaneous Glazing Supplies</span>
                        <span className="font-mono text-foreground font-semibold whitespace-nowrap shrink-0">
                          +${totals.miscTotal.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {/* 4. Surcharge (8% Glass Surcharge) */}
                    <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
                      <span className="text-muted-foreground">Glass Manufacturing Add-on Surcharge (8%)</span>
                      <span className="font-mono text-muted-foreground font-semibold whitespace-nowrap shrink-0">
                        +${totals.glass8PercentSurchargeTotal.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Subtotal */}
              <div className="flex items-center justify-between py-1 text-xs sm:text-sm border-b border-border/50 font-medium">
                <span className="text-foreground font-bold">Subtotal (Pre-Tax)</span>
                <span className="font-mono font-bold text-foreground text-sm whitespace-nowrap shrink-0">
                  ${totals.subtotalPreTax.toFixed(2)}
                </span>
              </div>

              {/* Tax */}
              <div className="flex justify-between items-center py-1 text-xs sm:text-sm border-b border-border/50">
                <span className="text-muted-foreground">
                  {hstRate === 8
                    ? 'HST (8% First Nations Material Exemption)'
                    : hstRate === 0
                    ? 'HST (0% Tax Exempt)'
                    : 'HST (13% Standard)'}
                </span>
                <span className="font-mono font-semibold text-foreground whitespace-nowrap shrink-0">
                  ${totals.hstAmount.toFixed(2)}
                </span>
              </div>

              {/* Grand Total & 50/50 Deposit Cards */}
              <div className="pt-1.5 space-y-2">
                <div className="flex justify-between items-baseline p-2.5 bg-muted/30 rounded-xl border border-border/60">
                  <span className="text-sm font-bold text-foreground">Grand Total (CAD)</span>
                  <span className="text-2xl font-black font-mono tracking-tight text-foreground whitespace-nowrap shrink-0">
                    ${totals.grandTotal.toFixed(2)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-muted/20 rounded-xl p-2 border border-border/50">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      50% Down Payment
                    </div>
                    <div className="font-mono font-bold text-foreground text-xs sm:text-sm whitespace-nowrap mt-0.5">
                      ${firstPayment.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-muted/20 rounded-xl p-2 border border-border/50">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                      50% Balance on Completion
                    </div>
                    <div className="font-mono font-bold text-foreground text-xs sm:text-sm whitespace-nowrap mt-0.5">
                      ${secondPayment.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Notes & Action Buttons */}
            <div className="lg:col-span-5 space-y-3">
              {/* Quote Notes Section */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="sealedUnitNotes"
                    className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span>Special Notes &amp; Customer Instructions</span>
                  </Label>
                  <span className="text-[10px] text-muted-foreground">Appears on Proposal</span>
                </div>
                <Textarea
                  id="sealedUnitNotes"
                  rows={3}
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="text-xs bg-background resize-none border-border/80 focus-visible:ring-1"
                />
              </div>

              {/* Action Command Center */}
              <div className="space-y-2 pt-1 border-t border-border/40">
                {/* 1. Primary Action: Interactive Preview Modal */}
                <Button
                  type="button"
                  onClick={onOpenPreview || onPrint}
                  disabled={!hasContent}
                  className="w-full h-10 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md cursor-pointer gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Preview &amp; Print Quote (Full PDF Studio)</span>
                </Button>

                {/* 2. Review / Direct Approve Action */}
                {onOpenSubmitModal && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onOpenSubmitModal}
                    disabled={!hasContent}
                    className={cn(
                      'w-full h-9 text-xs shadow-xs font-bold cursor-pointer transition-colors border',
                      user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'
                        ? 'bg-emerald-600/10 text-emerald-700 hover:bg-emerald-600/20 border-emerald-500/30 dark:text-emerald-400'
                        : 'bg-amber-600/10 text-amber-700 hover:bg-amber-600/20 border-amber-500/30 dark:text-amber-400'
                    )}
                  >
                    {user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' ? (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Approve &amp; Assign / Submit Quote
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 mr-1.5" /> Submit Quote for Review
                      </>
                    )}
                  </Button>
                )}

                {/* 3. Utility Actions: Save Draft & Reset */}
                <div className="flex items-center gap-2 pt-0.5">
                  {onSaveDraft && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onSaveDraft}
                      disabled={!hasContent}
                      className="gap-1.5 text-xs font-semibold cursor-pointer h-8 flex-1 border-border/80 hover:bg-muted"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Save Draft</span>
                    </Button>
                  )}
                  {onResetQuote && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onResetQuote}
                      disabled={!hasContent}
                      className="gap-1 text-xs cursor-pointer h-8 text-destructive hover:bg-destructive/10"
                      title="Reset Quote"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

