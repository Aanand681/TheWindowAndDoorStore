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
  Bookmark,
  FolderOpen,
  Paperclip,
  Pencil,
  X,
  Check,
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
  attachedSealedUnit?: any | null;
  onOpenAttachSealedUnitModal?: () => void;
  onRemoveAttachedSealedUnit?: () => void;
  onSaveDraft?: () => void;
  onOpenSavedQuotes?: () => void;
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
  attachedSealedUnit,
  onOpenAttachSealedUnitModal,
  onRemoveAttachedSealedUnit,
  onSaveDraft,
  onOpenSavedQuotes,
}: QuoteSummaryCardProps) {
  const effectiveJCCents = customJC !== '' ? toCents(customJC) : (taxJC || 0);
  const effectiveMiscCents = customMisc !== '' ? toCents(customMisc) : (taxMisc || 0);
  const effectiveLabourCents = customLabour !== '' ? toCents(customLabour) : (taxLabour || 0);

  const [editingField, setEditingField] = React.useState<'jc' | 'labour' | 'misc' | null>(null);
  const [tempEditVal, setTempEditVal] = React.useState<string>('');

  const hasAnyOverrides = customJC !== '' || customLabour !== '' || customMisc !== '';

  const handleResetAllOverrides = () => {
    setCustomJC('');
    setCustomLabour('');
    setCustomMisc('');
    setEditingField(null);
    setTempEditVal('');
    toast.success('Reset Jambs & Casing, Labour, and Misc to default pricing');
  };

  const renderEditableRow = (
    field: 'jc' | 'labour' | 'misc',
    label: string,
    amountCents: number,
    customVal: string,
    defaultCents: number,
    setter: (val: string) => void,
    suffix?: string
  ) => {
    const isEditing = editingField === field;
    const isCustom = customVal !== '';
    const defaultDollars = (defaultCents / 100).toFixed(2);

    if (isEditing) {
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
                  toast.info(`Reset ${label} to default ($${defaultDollars})`);
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
      <div key={field} className="flex items-center justify-between text-xs sm:text-sm py-0.5 group">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-muted-foreground truncate">
            {label} {suffix && <span className="text-[10px] text-muted-foreground/70">{suffix}</span>}
          </span>
          {isCustom && (
            <span className="text-[9px] bg-primary/15 text-primary font-bold px-1.5 py-0.5 rounded shrink-0">
              custom
            </span>
          )}
          {isCustom && !isReadOnly && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                setter('');
                toast.info(`Reset ${label} to default ($${defaultDollars})`);
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
            amountCents === 0 ? "text-muted-foreground text-xs" : (isCustom ? "font-bold text-primary" : "text-foreground font-medium")
          )}>
            {amountCents > 0 ? `+${formatMoney(amountCents)}` : '$0.00'}
          </span>
          {!isReadOnly && (
            <button
              type="button"
              onClick={() => {
                setEditingField(field);
                setTempEditVal(isCustom ? customVal : (amountCents / 100).toFixed(2));
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

  const jcSummaryLabel = React.useMemo(() => {
    const hasJamb = Boolean(taxTotals?.selectedJamb && (Number(taxTotals.selectedJamb.total) > 0 || Number(taxTotals.selectedJamb.rate) > 0));
    const hasCasing = Boolean(taxTotals?.selectedCasing && (Number(taxTotals.selectedCasing.total) > 0 || Number(taxTotals.selectedCasing.rate) > 0));
    if (hasJamb && !hasCasing) return 'Jambs Only';
    if (!hasJamb && hasCasing) return 'Casing Only';
    return 'Jambs & Casing';
  }, [taxTotals?.selectedJamb, taxTotals?.selectedCasing]);

  // Combined Financials Ledger when attachedSealedUnit exists
  const combinedData = React.useMemo(() => {
    if (!attachedSealedUnit) return null;
    const suTotals = attachedSealedUnit.totals || {};
    const suGlassCents = Math.round((suTotals.glassBefore8PercentTotal || 0) * 100);
    const suSurchargeCents = Math.round((suTotals.glass8PercentSurchargeTotal || 0) * 100);
    const suLabourCents = Math.round((suTotals.combinedLabourTotal || 0) * 100);
    const suMiscCents = Math.round((suTotals.miscTotal || 0) * 100);

    const windowBaseCents = quoteResult?.base || 0;
    const windowSurchargeCents = quoteResult?.surcharge || 0;
    const windowDiscountCents = quoteResult?.promoDiscount || 0;

    const combinedMiscCents = effectiveMiscCents + suMiscCents;
    const combinedLabourCents = effectiveLabourCents + suLabourCents;
    const combinedSurchargeCents = windowSurchargeCents + suSurchargeCents;

    // Subtotal pre-tax: sum of lines 1 to 6 minus promo discount
    const combinedSubtotalCents =
      windowBaseCents +
      suGlassCents +
      effectiveJCCents +
      combinedMiscCents +
      combinedLabourCents +
      combinedSurchargeCents -
      windowDiscountCents;

    // Tax calculation
    let combinedTaxCents = 0;
    if (hstRate === 13) {
      combinedTaxCents = Math.round(combinedSubtotalCents * 0.13);
    } else if (hstRate === 8) {
      const materialsCents = Math.max(
        0,
        windowBaseCents + windowSurchargeCents - windowDiscountCents + effectiveJCCents + suGlassCents + suSurchargeCents
      );
      const servicesCents = Math.max(0, combinedLabourCents + combinedMiscCents);
      combinedTaxCents = Math.round(materialsCents * 0.05 + servicesCents * 0.13);
    } else {
      combinedTaxCents = 0;
    }

    const combinedTotalCents = combinedSubtotalCents + combinedTaxCents;
    const combinedFirstPayment = Math.round(combinedTotalCents / 2);
    const combinedSecondPayment = combinedTotalCents - combinedFirstPayment;

    // Format sealed unit summary sentence
    const lineItems = attachedSealedUnit.lineItems || [];
    let suSummarySentence = 'Sealed Unit';
    if (lineItems.length > 0) {
      const totalSUQty = lineItems.reduce((acc: number, it: any) => acc + (Number(it.quantity) || 1), 0);
      const paneTypes = Array.from(
        new Set(lineItems.map((it: any) => (it.paneType === 'triple' ? 'Triple' : 'Dual')))
      );
      suSummarySentence = `${totalSUQty} ${paneTypes.join('/')} Pane Sealed Unit`;
    }

    return {
      windowBaseCents,
      suGlassCents,
      suSummarySentence,
      effectiveJCCents,
      combinedMiscCents,
      combinedLabourCents,
      combinedSurchargeCents,
      windowDiscountCents,
      combinedSubtotalCents,
      combinedTaxCents,
      combinedTotalCents,
      combinedFirstPayment,
      combinedSecondPayment,
    };
  }, [
    attachedSealedUnit,
    quoteResult,
    effectiveMiscCents,
    effectiveLabourCents,
    effectiveJCCents,
    hstRate,
  ]);

  const hasActiveQuoteData = Boolean(
    (quoteResult && ((quoteResult.base || 0) > 0 || (quoteResult.total || 0) > 0)) ||
    effectiveJCCents > 0 ||
    effectiveLabourCents > 0 ||
    effectiveMiscCents > 0 ||
    attachedSealedUnit ||
    customJC !== '' ||
    customLabour !== '' ||
    customMisc !== ''
  );

  return (
    <div className="lg:col-span-4 space-y-6 sticky top-8 h-fit pb-12">
      <Card className="bg-card/80 border-border backdrop-blur-xl shadow-xl overflow-hidden relative py-0 gap-0 [--card-spacing:0px]">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
        <CardHeader className="py-3 px-5 sm:px-6 !pb-3 border-b border-border/50">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-xl flex items-center gap-2">
              <Calculator className="w-5 h-5 text-primary" />
              <span>Promo Summary</span>
            </CardTitle>
            {quoteResult?.promoName && (quoteResult.promoDiscount || 0) > 0 && (
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                {quoteResult.promoName}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-3.5 px-5 sm:px-6 pb-5">
          {hasActiveQuoteData ? (
            <>
              {/* Attached Sealed Unit Badge */}
              {attachedSealedUnit && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-800 dark:text-emerald-300 mb-2">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Combined Quote: Attached #{attachedSealedUnit.quoteNumber}</span>
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

              {/* COMBINED FINANCIAL LEDGER (Windows + Attached Sealed Units) */}
              {combinedData ? (
                <>
                  <div className="space-y-1.5 pb-2.5 border-b border-border/50">
                    {/* Window glass configurations */}
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
                        <span className="text-muted-foreground font-medium">Window base price</span>
                        <span className="font-mono font-semibold whitespace-nowrap shrink-0">{formatMoney(combinedData.windowBaseCents)}</span>
                      </div>
                    )}

                    {/* Sealed unit glass price */}
                    <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
                      <span className="text-muted-foreground font-medium text-emerald-700 dark:text-emerald-400">
                        {combinedData.suSummarySentence}
                      </span>
                      <span className="font-mono font-semibold whitespace-nowrap shrink-0 text-foreground">
                        +{formatMoney(combinedData.suGlassCents)}
                      </span>
                    </div>

                    {/* Jambs & Casing (Window only) */}
                    {renderEditableRow(
                      'jc',
                      jcSummaryLabel,
                      combinedData.effectiveJCCents,
                      customJC,
                      taxJC,
                      (val) => setCustomJC(val),
                      '(window only)'
                    )}

                    {/* Misc (Window + Sealed Unit) - Hidden on Supply Only */}
                    {!isSupplyOnly && renderEditableRow(
                      'misc',
                      'Miscellaneous',
                      combinedData.combinedMiscCents,
                      customMisc,
                      taxMisc,
                      (val) => setCustomMisc(val),
                      '(window + SU)'
                    )}

                    {/* Labour (Window + Sealed Unit) - Hidden on Supply Only */}
                    {!isSupplyOnly && renderEditableRow(
                      'labour',
                      'Labour',
                      combinedData.combinedLabourCents,
                      customLabour,
                      taxLabour,
                      (val) => setCustomLabour(val),
                      '(window + SU)'
                    )}

                    {/* Surcharge (Window + Sealed Unit 8%) */}
                    <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
                      <span className="text-muted-foreground">
                        Surcharge <span className="text-[10px] text-muted-foreground/70">(window + SU 8%)</span>
                      </span>
                      <span className="font-mono text-muted-foreground whitespace-nowrap shrink-0">
                        +{formatMoney(combinedData.combinedSurchargeCents)}
                      </span>
                    </div>

                    {/* Promo discount (Window only) */}
                    {combinedData.windowDiscountCents > 0 && (
                      <div className="flex items-center justify-between text-xs sm:text-sm py-0.5 font-medium text-emerald-500">
                        <span>Promo discount <span className="text-[10px] text-muted-foreground/70">(window only)</span></span>
                        <span className="font-mono whitespace-nowrap shrink-0">-{formatMoney(combinedData.windowDiscountCents)}</span>
                      </div>
                    )}
                  </div>

                  {/* Subtotal */}
                  <div className="pb-2.5 border-b border-border/50 text-xs sm:text-sm">
                    <div className="flex items-center justify-between font-medium">
                      <span className="text-foreground">Combined Subtotal</span>
                      <span className="font-mono font-bold text-primary whitespace-nowrap shrink-0">
                        {formatMoney(combinedData.combinedSubtotalCents)}
                      </span>
                    </div>
                  </div>

                  {/* Tax (HST on combined subtotal) */}
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
                        {formatMoney(combinedData.combinedTaxCents)}
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
                          title="Point-of-Sale Exemption: 8% provincial tax exempt on materials; 13% on labour"
                        >
                          8% Material Tax Exemption
                        </Label>
                      </div>
                      <span className={`font-mono whitespace-nowrap shrink-0 ${hstRate !== 8 ? 'line-through opacity-40' : 'text-emerald-500 font-semibold'}`}>
                        {formatMoney(combinedData.combinedTaxCents)}
                      </span>
                    </div>
                  </div>

                  {/* Total incl. HST */}
                  <div className="pt-2">
                    <div className="flex justify-between items-baseline mb-3">
                      <span className="text-base font-bold">Total incl. HST</span>
                      <span className="text-2xl font-black font-mono tracking-tight text-primary whitespace-nowrap shrink-0">
                        {formatMoney(combinedData.combinedTotalCents)}
                      </span>
                    </div>

                    {/* Deposit Schedule */}
                    <div className="text-[11px] text-muted-foreground font-semibold mb-1">
                      Deposit Schedule (50 / 50)
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/60 rounded-xl p-2.5 border border-border/60">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">First 50%</div>
                        <div className="font-mono font-bold text-primary text-sm sm:text-base whitespace-nowrap">
                          {formatMoney(combinedData.combinedFirstPayment)}
                        </div>
                      </div>
                      <div className="bg-muted/60 rounded-xl p-2.5 border border-border/60">
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-0.5">Final 50%</div>
                        <div className="font-mono font-bold text-primary text-sm sm:text-base whitespace-nowrap">
                          {formatMoney(combinedData.combinedSecondPayment)}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* STANDARD SINGLE WINDOW QUOTE FINANCIAL LEDGER */
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
                        <span className="font-mono font-semibold whitespace-nowrap shrink-0">{formatMoney(quoteResult?.base || 0)}</span>
                      </div>
                    )}
                    {/* Jambs & Casing */}
                    {renderEditableRow(
                      'jc',
                      jcSummaryLabel,
                      effectiveJCCents,
                      customJC,
                      taxJC,
                      (val) => setCustomJC(val)
                    )}

                    {/* Labour - Completely hidden on Supply Only */}
                    {!isSupplyOnly && renderEditableRow(
                      'labour',
                      'Labour',
                      effectiveLabourCents,
                      customLabour,
                      taxLabour,
                      (val) => setCustomLabour(val)
                    )}

                    {/* Miscellaneous - Completely hidden on Supply Only */}
                    {!isSupplyOnly && renderEditableRow(
                      'misc',
                      'Miscellaneous',
                      effectiveMiscCents,
                      customMisc,
                      taxMisc,
                      (val) => setCustomMisc(val)
                    )}

                    <div className="flex items-center justify-between text-xs sm:text-sm py-0.5">
                      <span className="text-muted-foreground">Surcharge ({surchargeRate}%)</span>
                      <span className="font-mono text-muted-foreground whitespace-nowrap shrink-0">+{formatMoney(quoteResult?.surcharge || 0)}</span>
                    </div>
                    {(quoteResult?.promoDiscount || 0) > 0 && (
                      <>
                        <div className="flex items-center justify-between text-xs sm:text-sm py-0.5 font-medium text-emerald-500">
                          <span>Promo discount</span>
                          <span className="font-mono whitespace-nowrap shrink-0">-{formatMoney(quoteResult?.promoDiscount || 0)}</span>
                        </div>
                        {quoteResult?.text && (
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
                            : Math.round(Math.max(0, ((quoteResult?.base || 0) + (quoteResult?.surcharge || 0) - (quoteResult?.promoDiscount || 0)) + effectiveJCCents) * 0.05 + Math.max(0, afterDiscount - (Math.max(0, ((quoteResult?.base || 0) + (quoteResult?.surcharge || 0) - (quoteResult?.promoDiscount || 0)) + effectiveJCCents))) * 0.13)
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
                </>
              )}

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
                  {wantsUpgrade && upgrade && (
                    <div className="flex items-center justify-between text-xs font-semibold text-primary pt-1">
                      <span>Upgrade ({upgrade?.rate})</span>
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

                {onOpenAttachSealedUnitModal && !attachedSealedUnit && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-10 text-xs font-semibold cursor-pointer gap-1.5 border-emerald-500/50 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 shadow-xs"
                    onClick={onOpenAttachSealedUnitModal}
                  >
                    <Paperclip className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Attach Sealed Units to Quote</span>
                  </Button>
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

                {(onSaveDraft || onOpenSavedQuotes) && (
                  <div className="flex items-center gap-2 pt-1">
                    {onSaveDraft && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onSaveDraft}
                        className="flex-1 h-9 text-xs font-semibold cursor-pointer gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                        title="Save quote to drafts"
                      >
                        <Bookmark className="w-3.5 h-3.5 text-primary" />
                        <span>Save Draft</span>
                      </Button>
                    )}
                    {onOpenSavedQuotes && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={onOpenSavedQuotes}
                        className="flex-1 h-9 text-xs font-semibold cursor-pointer gap-1.5 border-border hover:bg-muted"
                        title="Open saved quotes"
                      >
                        <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
                        <span>Saved Quotes</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Enter window prices, add Jambs &amp; Casing, or enter Service specifications to view summary.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default QuoteSummaryCard;
