'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Calculator,
  Receipt,
  Info,
  RotateCcw,
  ShieldCheck,
  Send,
  Save,
  Edit3,
  CheckCircle2,
  ClipboardCheck,
  Printer,
  Share2,
  AlertCircle,
  Eye,
  Download,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatMoney } from '@/lib/promo-logic';
import QuoteNotesEditor from '@/components/quotes/QuoteNotesEditor';
import { toast } from 'sonner';

export interface QuoteSummaryCardProps {
  quoteResult: any;
  summaryWindowGroups: any[];
  surchargeRate: number;
  taxTotals: any;
  taxJC: number;
  taxMisc: number;
  taxLabour: number;
  customJC: string;
  setCustomJC: (val: string) => void;
  customMisc: string;
  setCustomMisc: (val: string) => void;
  customLabour: string;
  setCustomLabour: (val: string) => void;
  includeJCInPromo: boolean;
  setIncludeJCInPromo: (val: boolean) => void;
  includeMiscInPromo: boolean;
  setIncludeMiscInPromo: (val: boolean) => void;
  includeLabourInPromo: boolean;
  setIncludeLabourInPromo: (val: boolean) => void;
  wantsUpgrade: boolean;
  setWantsUpgrade: (val: boolean) => void;
  upgrade: any;
  shownUpgrade: number;
  beforeTaxDiscount: number;
  afterDiscount: number;
  hstRate: number;
  setHstRate: (val: number) => void;
  total: number;
  firstPayment: number;
  secondPayment: number;
  quoteNotes: string;
  setQuoteNotes: (val: string) => void;
  isReadOnly: boolean;
  user: any;
  reviewQuote: any;
  isEditMode: boolean;
  setIsEditMode: (val: boolean) => void;
  canEditApprovedQuote: boolean;
  canEditCurrentQuote: boolean;
  isReviewerOrAdmin: boolean;
  reviewActionLoading: boolean;
  staffList: any[];
  clerkList: any[];
  quoteNumber: string;
  customerName: string;
  assignedReviewer: string;
  setAssignedReviewer: (val: string) => void;
  selectedOdooClerk: string;
  setSelectedOdooClerk: (val: string) => void;
  setShowSubmitModal: (val: boolean) => void;
  handleResubmitReturnedQuote: () => void;
  handleSaveQuotePrices: () => void;
  handleExitReview: () => void;
  handleCancelEdits: () => void;
  setOdooOrderNumberInput: (val: string) => void;
  setShowCompleteOdooModal: (val: boolean) => void;
  setIsPreviewOpen: (val: boolean) => void;
  handleApproveReviewQuote: () => void;
  setReassignTo: (val: string) => void;
  setReassignNotes: (val: string) => void;
  setShowReassignModal: (val: boolean) => void;
  handleReturnReviewQuote: () => void;
}

export function QuoteSummaryCard({
  quoteResult,
  summaryWindowGroups,
  surchargeRate,
  taxTotals,
  taxJC,
  taxMisc,
  taxLabour,
  customJC,
  setCustomJC,
  customMisc,
  setCustomMisc,
  customLabour,
  setCustomLabour,
  includeJCInPromo,
  setIncludeJCInPromo,
  includeMiscInPromo,
  setIncludeMiscInPromo,
  includeLabourInPromo,
  setIncludeLabourInPromo,
  wantsUpgrade,
  setWantsUpgrade,
  upgrade,
  shownUpgrade,
  beforeTaxDiscount,
  afterDiscount,
  hstRate,
  setHstRate,
  total,
  firstPayment,
  secondPayment,
  quoteNotes,
  setQuoteNotes,
  isReadOnly,
  user,
  reviewQuote,
  isEditMode,
  setIsEditMode,
  canEditApprovedQuote,
  canEditCurrentQuote,
  isReviewerOrAdmin,
  reviewActionLoading,
  staffList,
  clerkList,
  quoteNumber,
  customerName,
  assignedReviewer,
  setAssignedReviewer,
  selectedOdooClerk,
  setSelectedOdooClerk,
  setShowSubmitModal,
  handleResubmitReturnedQuote,
  handleSaveQuotePrices,
  handleExitReview,
  handleCancelEdits,
  setOdooOrderNumberInput,
  setShowCompleteOdooModal,
  setIsPreviewOpen,
  handleApproveReviewQuote,
  setReassignTo,
  setReassignNotes,
  setShowReassignModal,
  handleReturnReviewQuote,
}: QuoteSummaryCardProps) {
  return (
    <div className="lg:col-span-4 space-y-6 sticky top-8 h-fit pb-12">
      <Card className="bg-card/80 border-border backdrop-blur-xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Promo Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {quoteResult ? (
            <>
              <div className="space-y-3">
                {summaryWindowGroups.length > 0 ? (
                  <div className="space-y-1.5 pb-2 border-b border-border/50">
                    {summaryWindowGroups.map((g) => (
                      <div key={g.key} className="flex justify-between text-xs sm:text-sm">
                        <span className="text-muted-foreground font-medium">
                          {g.qty} {g.pane} pane {g.color} window{g.qty > 1 ? 's' : ''}
                        </span>
                        <span className="font-mono">{formatMoney(g.baseCents)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Base window price</span>
                    <span className="font-mono">{formatMoney(quoteResult.base)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Surcharge ({surchargeRate}%)</span>
                  <span className="font-mono">+{formatMoney(quoteResult.surcharge)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-emerald-500">
                  <span>Promo discount</span>
                  <span className="font-mono">-{formatMoney(quoteResult.promoDiscount)}</span>
                </div>
              </div>
              <div className="pt-4 border-t border-border">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base font-semibold">Total</span>
                  <span className="text-2xl font-bold font-mono tracking-tight text-primary">
                    {formatMoney(quoteResult.base + quoteResult.surcharge - quoteResult.promoDiscount)}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground flex items-start gap-1.5 mt-4 bg-muted p-3 rounded-lg border border-border">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                  <span>{quoteResult.text}</span>
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Enter valid window base prices to see the summary.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card/80 border-border backdrop-blur-xl shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl flex items-center gap-2">
            <Receipt className="w-5 h-5 text-primary" />
            Tax Calculation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Base price of windows</Label>
              <div className="h-9 px-3 py-2 bg-background border border-border rounded-md font-mono text-sm opacity-70">
                {formatMoney(quoteResult?.base || 0)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 flex flex-col justify-end">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      disabled={isReadOnly}
                      id="incJc"
                      checked={includeJCInPromo}
                      onCheckedChange={(c) => setIncludeJCInPromo(!!c)}
                    />
                    <Label htmlFor="incJc" className="text-xs text-muted-foreground cursor-pointer">
                      Include J &amp; C
                    </Label>
                  </div>
                  {!isReadOnly && customJC !== '' && (
                    <button
                      type="button"
                      onClick={() => setCustomJC('')}
                      title="Reset to calculated"
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer select-none no-underline"
                    >
                      <RotateCcw className="w-2.5 h-2.5 cursor-pointer" />
                      <span className="cursor-pointer">Reset</span>
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-xs text-muted-foreground font-mono pointer-events-none">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={(taxJC / 100).toFixed(2)}
                    value={customJC}
                    onChange={(e) => setCustomJC(e.target.value)}
                    disabled={isReadOnly || !includeJCInPromo}
                    className={`h-9 pl-6 pr-3 font-mono text-sm bg-background ${
                      !includeJCInPromo ? 'opacity-30 line-through' : ''
                    }`}
                  />
                </div>
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      disabled={isReadOnly}
                      id="incMisc"
                      checked={includeMiscInPromo}
                      onCheckedChange={(c) => setIncludeMiscInPromo(!!c)}
                    />
                    <Label htmlFor="incMisc" className="text-xs text-muted-foreground cursor-pointer">
                      Include Misc
                    </Label>
                  </div>
                  {!isReadOnly && customMisc !== '' && (
                    <button
                      type="button"
                      onClick={() => setCustomMisc('')}
                      title="Reset to calculated"
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer select-none no-underline"
                    >
                      <RotateCcw className="w-2.5 h-2.5 cursor-pointer" />
                      <span className="cursor-pointer">Reset</span>
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-xs text-muted-foreground font-mono pointer-events-none">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder={(taxMisc / 100).toFixed(2)}
                    value={customMisc}
                    onChange={(e) => setCustomMisc(e.target.value)}
                    disabled={isReadOnly || !includeMiscInPromo}
                    className={`h-9 pl-6 pr-3 font-mono text-sm bg-background ${
                      !includeMiscInPromo ? 'opacity-30 line-through' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Checkbox
                    disabled={isReadOnly}
                    id="incLab"
                    checked={includeLabourInPromo}
                    onCheckedChange={(c) => setIncludeLabourInPromo(!!c)}
                  />
                  <Label htmlFor="incLab" className="text-xs text-muted-foreground cursor-pointer">
                    Include Labour
                  </Label>
                </div>
                {!isReadOnly && customLabour !== '' && (
                  <button
                    type="button"
                    onClick={() => setCustomLabour('')}
                    title="Reset to calculated"
                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer select-none no-underline"
                  >
                    <RotateCcw className="w-2.5 h-2.5 cursor-pointer" />
                    <span className="cursor-pointer">Reset</span>
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <span className="absolute left-2.5 text-xs text-muted-foreground font-mono pointer-events-none">
                  $
                </span>
                <Input
                  type="number"
                  step="0.01"
                  placeholder={(taxLabour / 100).toFixed(2)}
                  value={customLabour}
                  onChange={(e) => setCustomLabour(e.target.value)}
                  disabled={isReadOnly || !includeLabourInPromo}
                  className={`h-9 pl-6 pr-3 font-mono text-sm bg-background ${
                    !includeLabourInPromo ? 'opacity-30 line-through' : ''
                  } ${isReadOnly && customLabour !== '' ? 'ring-1 ring-blue-500/40 bg-blue-500/5' : ''}`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Surcharge</Label>
                <div className="h-9 px-3 py-2 bg-background border border-border rounded-md font-mono text-sm opacity-70">
                  {formatMoney(quoteResult?.surcharge || 0)}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Discount</Label>
                <div className="h-9 px-3 py-2 bg-background border border-border rounded-md font-mono text-sm opacity-70 text-emerald-500">
                  -{formatMoney(quoteResult?.promoDiscount || 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3 bg-primary/10 p-4 rounded-xl border border-primary/20">
            <Checkbox
              id="upgrade"
              disabled={isReadOnly}
              checked={wantsUpgrade}
              onCheckedChange={(c) => setWantsUpgrade(!!c)}
              className="mt-1"
            />
            <div className="space-y-1.5">
              <Label htmlFor="upgrade" className="text-sm font-medium cursor-pointer">
                Include 5-year free labour upgrade
              </Label>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Optional. Shows upgrade price only; not included in HST or final total.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-mono">{formatMoney(beforeTaxDiscount)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">After Discount</span>
              <span className="font-mono font-medium">{formatMoney(afterDiscount)}</span>
            </div>

            {wantsUpgrade && (
              <div className="flex justify-between text-sm text-primary bg-primary/10 p-2 rounded -mx-2 px-2">
                <span>Labour Upgrade ({upgrade.rate})</span>
                <span className="font-mono">{formatMoney(shownUpgrade)}</span>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2 border-t border-border">
              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="promoHst13"
                    disabled={isReadOnly}
                    checked={hstRate === 13}
                    onCheckedChange={(c) => setHstRate(c ? 13 : 0)}
                  />
                  <Label htmlFor="promoHst13" className="cursor-pointer text-muted-foreground font-normal">
                    Include HST (13%)
                  </Label>
                </div>
                <span className={`font-mono ${hstRate !== 13 ? 'line-through opacity-50' : ''}`}>
                  {formatMoney(Math.round(afterDiscount * 0.13))}
                </span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="promoHst8"
                    disabled={isReadOnly}
                    checked={hstRate === 8}
                    onCheckedChange={(c) => setHstRate(c ? 8 : 0)}
                  />
                  <Label htmlFor="promoHst8" className="cursor-pointer text-muted-foreground font-normal">
                    Include HST (8%)
                  </Label>
                </div>
                <span className={`font-mono ${hstRate !== 8 ? 'line-through opacity-50' : ''}`}>
                  {formatMoney(Math.round(afterDiscount * 0.08))}
                </span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 mt-3 border-t border-border">
              <span className="font-bold">Total incl. HST</span>
              <span className="font-bold font-mono text-xl tracking-tight">{formatMoney(total)}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/50">
              <div className="bg-muted rounded-lg p-3 border border-border">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">First 50%</div>
                <div className="font-mono font-semibold text-primary">{formatMoney(firstPayment)}</div>
              </div>
              <div className="bg-muted rounded-lg p-3 border border-border">
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Final 50%</div>
                <div className="font-mono font-semibold text-primary">{formatMoney(secondPayment)}</div>
              </div>
            </div>

            {/* Optional Quote Notes Field with Rich Auto-Growing WYSIWYG Editor */}
            <div className="pt-3 border-t border-border/50">
              {reviewQuote && reviewQuote.status === 'RETURNED' && reviewQuote.reviewerNotes && (
                <div className="mb-3 text-xs bg-amber-500/15 border border-amber-500/35 text-amber-950 dark:text-amber-200 p-3 rounded-xl font-medium flex items-start gap-2 shadow-xs animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-900 dark:text-amber-300">Reviewer Revision Instructions:</strong>
                    <p className="mt-0.5 italic text-foreground/90 font-normal">"{reviewQuote.reviewerNotes}"</p>
                  </div>
                </div>
              )}
              <QuoteNotesEditor
                id="quoteNotesInput"
                value={quoteNotes}
                onChange={setQuoteNotes}
                readOnly={isReadOnly}
                placeholder="Enter special site notes, instructions, or employee comments..."
              />
            </div>

            {/* Vertically stacked full-width buttons */}
            <div className="mt-4 flex flex-col gap-2.5 w-full">
              {!reviewQuote ? (
                <Button
                  variant="default"
                  className={cn(
                    'w-full h-11 text-sm shadow-md font-bold text-white cursor-pointer transition-colors',
                    user?.role === 'ADMIN' || user?.role === 'SUPERADMIN'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  )}
                  onClick={() => {
                    if (!quoteNumber.trim() || !customerName.trim()) {
                      toast.error('Please enter a Customer Name and Quote Number before submitting!');
                      return;
                    }
                    const otherReviewers = staffList.filter(
                      (s) => s.username?.toLowerCase() !== user?.username?.toLowerCase()
                    );
                    if (
                      otherReviewers.length > 0 &&
                      (!assignedReviewer ||
                        assignedReviewer.toLowerCase() === user?.username?.toLowerCase() ||
                        assignedReviewer === 'Admin')
                    ) {
                      setAssignedReviewer(otherReviewers[0].username);
                    }
                    if (!selectedOdooClerk && clerkList.length > 0) {
                      const defaultClerk = clerkList.find((c) => c.department === 'CLERK') || clerkList[0];
                      if (defaultClerk) setSelectedOdooClerk(defaultClerk.username);
                    }
                    setShowSubmitModal(true);
                  }}
                >
                  {user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' ? (
                    <>
                      <ShieldCheck className="w-4 h-4 mr-2" /> Approve &amp; Assign / Submit
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" /> Submit for Review
                    </>
                  )}
                </Button>
              ) : (
                <>
                  {/* Returned Quote: Employee can revise and resubmit */}
                  {reviewQuote.status === 'RETURNED' && (
                    <>
                      <Button
                        variant="default"
                        className="w-full h-11 text-sm shadow-md font-bold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer transition-colors"
                        onClick={handleResubmitReturnedQuote}
                        disabled={reviewActionLoading}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        {reviewActionLoading ? 'Resubmitting...' : 'Resubmit for Review'}
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full h-10 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-500/40 cursor-pointer transition-colors"
                        onClick={handleSaveQuotePrices}
                        disabled={reviewActionLoading}
                      >
                        <Save className="w-4 h-4 mr-2" /> Save Revisions
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full h-10 text-xs font-semibold text-muted-foreground hover:bg-muted"
                        onClick={handleExitReview}
                      >
                        Exit Review Mode
                      </Button>
                    </>
                  )}

                  {/* Approved or Modified Quote */}
                  {(reviewQuote.status === 'APPROVED' || reviewQuote.status === 'MODIFIED') && (
                    <div className="space-y-2">
                      {isEditMode ? (
                        <>
                          <Button
                            variant="default"
                            className="w-full h-11 text-sm shadow-md font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-colors"
                            onClick={handleSaveQuotePrices}
                            disabled={reviewActionLoading}
                          >
                            <Save className="w-4 h-4 mr-2" /> Save &amp; Keep Approved
                          </Button>
                          <Button
                            variant="default"
                            className="w-full h-11 text-sm shadow-md font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer transition-colors"
                            onClick={handleResubmitReturnedQuote}
                            disabled={reviewActionLoading}
                          >
                            <Send className="w-4 h-4 mr-2" /> Resubmit for Review
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full h-10 text-xs font-semibold text-muted-foreground hover:bg-muted"
                            onClick={handleCancelEdits}
                            disabled={reviewActionLoading}
                          >
                            Cancel Edits
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 flex items-center justify-between">
                            <span className="font-semibold flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" /> Quote Approved (View Only)
                            </span>
                            {canEditApprovedQuote && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsEditMode(true)}
                                className="h-7 text-xs font-bold text-primary hover:bg-primary/10"
                              >
                                <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                              </Button>
                            )}
                          </div>
                          {canEditApprovedQuote ? (
                            <Button
                              variant="outline"
                              className="w-full h-10 text-xs font-bold border-primary/50 text-primary hover:bg-primary/10 cursor-pointer"
                              onClick={() => setIsEditMode(true)}
                            >
                              <Edit3 className="w-4 h-4 mr-2" /> Edit Quote Details
                            </Button>
                          ) : (
                            <>
                              {reviewQuote.odooStatus === 'PENDING_ENTRY' && (
                                <Button
                                  variant="default"
                                  className="w-full h-11 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer"
                                  onClick={() => {
                                    setOdooOrderNumberInput(reviewQuote.odooOrderNumber || '');
                                    setShowCompleteOdooModal(true);
                                  }}
                                >
                                  <ClipboardCheck className="w-4 h-4 mr-2" /> Mark Entered in Odoo
                                </Button>
                              )}
                              <Button
                                variant="default"
                                className="w-full h-10 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm cursor-pointer"
                                onClick={() => setIsPreviewOpen(true)}
                              >
                                <Printer className="w-4 h-4 mr-2" /> Preview &amp; Print Quote
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            className="w-full h-10 text-xs font-semibold text-muted-foreground hover:bg-muted"
                            onClick={handleExitReview}
                          >
                            Exit Review Mode
                          </Button>
                        </>
                      )}
                    </div>
                  )}

                  {/* Pending Review Quote */}
                  {reviewQuote.status === 'PENDING_REVIEW' && (
                    <>
                      {isReviewerOrAdmin ? (
                        <>
                          <Button
                            variant="default"
                            className="w-full h-11 text-sm shadow-md font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-colors"
                            onClick={handleApproveReviewQuote}
                            disabled={reviewActionLoading}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {reviewActionLoading ? 'Approving...' : 'Approve & Save Changes'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const other = staffList.find(
                                (s) => s.username?.toLowerCase() !== user?.username?.toLowerCase()
                              );
                              setReassignTo(other ? other.username : '');
                              setReassignNotes('');
                              setShowReassignModal(true);
                            }}
                            disabled={reviewActionLoading}
                            className="w-full h-10 text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10 cursor-pointer shadow-sm"
                          >
                            <Share2 className="w-4 h-4 mr-1.5" />
                            Forward / Reassign Quote
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full h-10 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-500/40 cursor-pointer transition-colors"
                            onClick={handleSaveQuotePrices}
                            disabled={reviewActionLoading}
                          >
                            <Save className="w-4 h-4 mr-2" /> Save Updated Prices (No Status Change)
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full h-10 text-xs font-semibold text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer"
                            onClick={handleReturnReviewQuote}
                            disabled={reviewActionLoading}
                          >
                            <AlertCircle className="w-4 h-4 mr-2" /> Return with Note
                          </Button>
                        </>
                      ) : (
                        <div className="space-y-2">
                          {isEditMode ? (
                            <>
                              <Button
                                variant="default"
                                className="w-full h-11 text-sm shadow-md font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer transition-colors"
                                onClick={handleSaveQuotePrices}
                                disabled={reviewActionLoading}
                              >
                                <Save className="w-4 h-4 mr-2" /> Save Revisions
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full h-10 text-xs font-semibold text-muted-foreground hover:bg-muted"
                                onClick={handleCancelEdits}
                              >
                                Cancel Edits
                              </Button>
                            </>
                          ) : (
                            <>
                              {canEditCurrentQuote && (
                                <Button
                                  variant="outline"
                                  className="w-full h-10 text-xs font-bold border-primary/50 text-primary hover:bg-primary/10 cursor-pointer"
                                  onClick={() => setIsEditMode(true)}
                                >
                                  <Edit3 className="w-4 h-4 mr-2" /> Edit Quote Details
                                </Button>
                              )}
                              <Button
                                variant="outline"
                                className="w-full h-10 text-xs font-semibold text-muted-foreground hover:bg-muted"
                                onClick={handleExitReview}
                              >
                                Exit Review Mode
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              <Button
                variant="outline"
                className="w-full h-11 text-sm shadow-sm font-semibold border-primary/40 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                onClick={() => {
                  if (!taxTotals) {
                    toast.error('Please calculate travel in the Tax Calculator tab first!');
                    return;
                  }
                  setIsPreviewOpen(true);
                }}
              >
                <Eye className="w-4 h-4 mr-2 text-primary cursor-pointer" /> Preview &amp; Customize
              </Button>
              <Button
                className="w-full h-11 text-sm shadow-md font-semibold cursor-pointer"
                onClick={() => {
                  if (!taxTotals) {
                    toast.error('Please calculate travel in the Tax Calculator tab first!');
                    return;
                  }
                  window.print();
                }}
              >
                <Download className="w-4 h-4 mr-2 cursor-pointer" /> Download PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default QuoteSummaryCard;
