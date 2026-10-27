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
import { formatMoney, toCents } from '@/lib/promo-logic';
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
  isSupplyOnly?: boolean;
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
  isSupplyOnly = false,
}: QuoteSummaryCardProps) {
  const effectiveJCCents = customJC !== '' ? toCents(customJC) : (taxJC || 0);
  const effectiveMiscCents = customMisc !== '' ? toCents(customMisc) : (taxMisc || 0);
  const effectiveLabourCents = customLabour !== '' ? toCents(customLabour) : (taxLabour || 0);

  const jcSummaryLabel = React.useMemo(() => {
    const hasJamb = Boolean(taxTotals?.selectedJamb && (Number(taxTotals.selectedJamb.total) > 0 || Number(taxTotals.selectedJamb.rate) > 0));
    const hasCasing = Boolean(taxTotals?.selectedCasing && (Number(taxTotals.selectedCasing.total) > 0 || Number(taxTotals.selectedCasing.rate) > 0));
    if (hasJamb && !hasCasing) return 'Jambs Only';
    if (!hasJamb && hasCasing) return 'Casing Only';
    return 'Jambs & Casing';
  }, [taxTotals?.selectedJamb, taxTotals?.selectedCasing]);

  return (
    <div className="lg:col-span-4 space-y-6 sticky top-8 h-fit pb-12">
      <Card className="bg-card/80 border-border backdrop-blur-xl shadow-xl overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
        <CardHeader className="pb-3 border-b border-border/50">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              <span>Promo Summary</span>
            </CardTitle>
            {quoteResult?.promoName && quoteResult.promoDiscount > 0 && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                {quoteResult.promoName}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          {quoteResult ? (
            <>
              {/* Window configurations (Strictly single line per group) */}
              <div className="space-y-1.5 pb-2.5 border-b border-border/50">
                {summaryWindowGroups.length > 0 ? (
                  summaryWindowGroups.map((g) => (
                    <div key={g.key} className="flex items-center justify-between gap-3 text-xs sm:text-sm py-0.5">
                      <span className="text-muted-foreground font-medium truncate capitalize">
                        {g.label}
                      </span>
                      <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                        {formatMoney(g.baseCents)}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
                    <span className="text-muted-foreground font-medium">Base window price</span>
                    <span className="font-mono font-semibold whitespace-nowrap shrink-0">{formatMoney(quoteResult.base)}</span>
                  </div>
                )}
                {/* Jambs & Casing (or Jambs Only / Casing Only) */}
                {effectiveJCCents > 0 && (
                  <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
                    <span className="text-muted-foreground">
                      {jcSummaryLabel}
                    </span>
                    <span className="font-mono text-foreground font-medium whitespace-nowrap shrink-0">
                      +{formatMoney(effectiveJCCents)}
                    </span>
                  </div>
                )}

                {/* Labour and Misc: ONLY shown if NOT supply only */}
                {!isSupplyOnly && effectiveLabourCents > 0 && (
                  <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
                    <span className="text-muted-foreground">Labour</span>
                    <span className="font-mono text-foreground font-medium whitespace-nowrap shrink-0">
                      +{formatMoney(effectiveLabourCents)}
                    </span>
                  </div>
                )}
                {!isSupplyOnly && effectiveMiscCents > 0 && (
                  <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
                    <span className="text-muted-foreground">Miscellaneous</span>
                    <span className="font-mono text-foreground font-medium whitespace-nowrap shrink-0">
                      +{formatMoney(effectiveMiscCents)}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
                  <span className="text-muted-foreground">Surcharge ({surchargeRate}%)</span>
                  <span className="font-mono text-muted-foreground whitespace-nowrap shrink-0">+{formatMoney(quoteResult.surcharge)}</span>
                </div>
                {quoteResult.promoDiscount > 0 && (
                  <>
                    <div className="flex items-center justify-between text-xs sm:text-sm py-0.5 font-medium text-emerald-500">
                      <span>Promo discount</span>
                      <span className="font-mono whitespace-nowrap shrink-0">-{formatMoney(quoteResult.promoDiscount)}</span>
                    </div>
                    {quoteResult.text && (
                      <p className="text-[11px] text-muted-foreground flex items-start gap-1.5 my-1.5 bg-muted/50 p-2.5 rounded-lg border border-border/60">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary" />
                        <span>{quoteResult.text}</span>
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* Subtotal (After Discount) */}
              <div className="pb-2.5 border-b border-border/50 text-xs sm:text-sm">
                <div className="flex items-center justify-between font-medium">
                  <span className="text-foreground">Subtotal</span>
                  <span className="font-mono font-bold text-primary whitespace-nowrap shrink-0">{formatMoney(afterDiscount)}</span>
                </div>
              </div>

              {/* HST Selection (Standard 13% vs 8% First Nations Material Exemption) */}
              <div className="flex flex-col gap-2 pt-1 pb-2.5 border-b border-border/50">
                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="promoHst13"
                      disabled={isReadOnly}
                      checked={hstRate === 13}
                      onCheckedChange={(c) => setHstRate(c ? 13 : 0)}
                    />
                    <Label htmlFor="promoHst13" className="cursor-pointer text-muted-foreground font-normal">
                      Include 13% HST
                    </Label>
                  </div>
                  <span className={`font-mono whitespace-nowrap shrink-0 ${hstRate !== 13 ? 'line-through opacity-40' : ''}`}>
                    {formatMoney(Math.round(afterDiscount * 0.13))}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="promoHst8"
                      disabled={isReadOnly}
                      checked={hstRate === 8}
                      onCheckedChange={(c) => setHstRate(c ? 8 : 0)}
                    />
                    <Label
                      htmlFor="promoHst8"
                      className="cursor-pointer text-muted-foreground font-normal"
                      title="Ontario Point-of-Sale Exemption: 8% provincial tax exempt on window & jamb materials; 13% on labour"
                    >
                      8% First Nations Material Exemption
                    </Label>
                  </div>
                  <span className={`font-mono whitespace-nowrap shrink-0 ${hstRate !== 8 ? 'line-through opacity-40' : 'text-emerald-500 font-semibold'}`}>
                    {formatMoney(
                      hstRate === 8
                        ? (total - afterDiscount)
                        : Math.round(Math.max(0, (quoteResult.base + quoteResult.surcharge - (quoteResult?.promoDiscount || 0)) + effectiveJCCents) * 0.05 + Math.max(0, afterDiscount - (Math.max(0, (quoteResult.base + quoteResult.surcharge - (quoteResult?.promoDiscount || 0)) + effectiveJCCents))) * 0.13)
                    )}
                  </span>
                </div>
              </div>

              {/* Total incl. HST */}
              <div className="pt-2">
                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-base font-bold">Total incl. HST</span>
                  <span className="text-2xl font-black font-mono tracking-tight text-primary whitespace-nowrap shrink-0">
                    {formatMoney(total)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/60 rounded-xl p-2.5 border border-border/60">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">First 50%</div>
                    <div className="font-mono font-bold text-primary text-sm sm:text-base whitespace-nowrap">{formatMoney(firstPayment)}</div>
                  </div>
                  <div className="bg-muted/60 rounded-xl p-2.5 border border-border/60">
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Final 50%</div>
                    <div className="font-mono font-bold text-primary text-sm sm:text-base whitespace-nowrap">{formatMoney(secondPayment)}</div>
                  </div>
                </div>
              </div>

              {/* 5-year free labour upgrade checkbox (placed right after 50/50 deposits) */}
              <div className="flex items-start space-x-2.5 bg-primary/5 p-3 rounded-xl border border-primary/15 mt-3">
                <Checkbox
                  id="summaryUpgrade"
                  disabled={isReadOnly}
                  checked={wantsUpgrade}
                  onCheckedChange={(c) => setWantsUpgrade(!!c)}
                  className="mt-0.5"
                />
                <div className="space-y-0.5 flex-1">
                  <Label htmlFor="summaryUpgrade" className="text-xs font-semibold cursor-pointer">
                    Include 5-year free labour upgrade
                  </Label>
                  <p className="text-[10px] text-muted-foreground">
                    Optional. Shows upgrade price only; not added to final total.
                  </p>
                  {wantsUpgrade && (
                    <div className="flex items-center justify-between text-xs font-semibold text-primary pt-1">
                      <span>Upgrade ({upgrade.rate})</span>
                      <span className="font-mono whitespace-nowrap shrink-0">{formatMoney(shownUpgrade)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Reviewer Revision Instructions (if returned) */}
              {reviewQuote && reviewQuote.status === 'RETURNED' && reviewQuote.reviewerNotes && (
                <div className="mt-3 text-xs bg-amber-500/15 border border-amber-500/35 text-amber-950 dark:text-amber-200 p-3 rounded-xl font-medium flex items-start gap-2 shadow-xs animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-900 dark:text-amber-300">Reviewer Revision Instructions:</strong>
                    <p className="mt-0.5 italic text-foreground/90 font-normal">"{reviewQuote.reviewerNotes}"</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
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
                  onClick={() => setIsPreviewOpen(true)}
                >
                  <Eye className="w-4 h-4 mr-2 text-primary cursor-pointer" /> Preview &amp; Customize
                </Button>
                <Button
                  className="w-full h-11 text-sm shadow-md font-semibold cursor-pointer"
                  onClick={() => setIsPreviewOpen(true)}
                >
                  <Download className="w-4 h-4 mr-2 cursor-pointer" /> Download / Print PDF
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Enter valid window base prices to see the summary.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default QuoteSummaryCard;
