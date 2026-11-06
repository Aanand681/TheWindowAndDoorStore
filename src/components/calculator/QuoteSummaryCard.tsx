'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Calculator,
  AlertTriangle,
  Paperclip,
  Wrench,
  PackageCheck,
  FileText,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toCents } from '@/lib/promo-logic';
import { formatDoorSummarySentence } from '@/lib/doors/calculations';
import { formatSealedUnitSummarySentence, getSealedUnitServiceSummaryLabel } from '@/lib/sealed-units-logic';
import QuoteNotesEditor from '@/components/quotes/QuoteNotesEditor';
import { EditableLedgerRow } from './summary/EditableLedgerRow';
import { CombinedLedgerSection } from './summary/CombinedLedgerSection';
import { StandardLedgerSection } from './summary/StandardLedgerSection';
import { SummaryUpgradeCard } from './summary/SummaryUpgradeCard';
import { SummaryReviewActions } from './summary/SummaryReviewActions';

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
  setIsSupplyOnly?: (val: boolean) => void;
  attachedSealedUnit?: any | null;
  attachedDoorQuote?: any | null;
  onOpenAttachSealedUnitModal?: () => void;
  onRemoveAttachedSealedUnit?: () => void;
  onRemoveAttachedDoorQuote?: () => void;
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
  setIsSupplyOnly,
  attachedSealedUnit,
  attachedDoorQuote,
  onOpenAttachSealedUnitModal,
  onRemoveAttachedSealedUnit,
  onRemoveAttachedDoorQuote,
  onSaveDraft,
  onOpenSavedQuotes,
}: QuoteSummaryCardProps) {
  const effectiveJCCents = customJC !== '' ? toCents(customJC) : (taxJC || 0);
  const effectiveMiscCents = customMisc !== '' ? toCents(customMisc) : (taxMisc || 0);
  const effectiveLabourCents = customLabour !== '' ? toCents(customLabour) : (taxLabour || 0);

  const [editingField, setEditingField] = React.useState<'jc' | 'labour' | 'misc' | null>(null);
  const [tempEditVal, setTempEditVal] = React.useState<string>('');

  const renderEditableRow = (
    field: 'jc' | 'labour' | 'misc',
    label: string,
    amountCents: number,
    customVal: string,
    defaultCents: number,
    setter: (val: string) => void,
    suffix?: string
  ) => (
    <EditableLedgerRow
      key={field}
      field={field}
      label={label}
      amountCents={amountCents}
      customVal={customVal}
      defaultCents={defaultCents}
      setter={setter}
      suffix={suffix}
      isReadOnly={isReadOnly}
      editingField={editingField}
      setEditingField={setEditingField}
      tempEditVal={tempEditVal}
      setTempEditVal={setTempEditVal}
    />
  );

  const jcSummaryLabel = React.useMemo(() => {
    const hasJamb = Boolean(
      taxTotals?.selectedJamb &&
        (Number(taxTotals.selectedJamb.total) > 0 || Number(taxTotals.selectedJamb.rate) > 0)
    );
    const hasCasing = Boolean(
      taxTotals?.selectedCasing &&
        (Number(taxTotals.selectedCasing.total) > 0 || Number(taxTotals.selectedCasing.rate) > 0)
    );
    if (hasJamb && !hasCasing) return 'Jambs Only';
    if (!hasJamb && hasCasing) return 'Casing Only';
    return 'Jambs & Casing';
  }, [taxTotals?.selectedJamb, taxTotals?.selectedCasing]);

  // Combined Financials Ledger when attachedSealedUnit or attachedDoorQuote exists
  const combinedData = React.useMemo(() => {
    if (!attachedSealedUnit && !attachedDoorQuote) return null;

    const hasSU = Boolean(attachedSealedUnit);
    const suTotals = attachedSealedUnit?.totals || {};
    const isAttachedSUService =
      attachedSealedUnit?.sealedUnitMode === 'service_only' ||
      attachedSealedUnit?.data?.sealedUnitMode === 'service_only' ||
      Boolean(suTotals.isServiceOnly);
    const suGlassCents =
      hasSU && !isAttachedSUService ? Math.round((suTotals.glassBefore8PercentTotal || 0) * 100) : 0;
    const suSurchargeCents =
      hasSU && !isAttachedSUService ? Math.round((suTotals.glass8PercentSurchargeTotal || 0) * 100) : 0;
    const suLabourCents = hasSU
      ? Math.round((suTotals.serviceLabourTotal ?? suTotals.unitLabourSum ?? 0) * 100)
      : 0;
    const suMiscCents = hasSU ? Math.round((suTotals.miscTotal || 0) * 100) : 0;

    const hasDoor = Boolean(attachedDoorQuote);
    const doorTotals = attachedDoorQuote?.totals || {};
    const doorRawBaseCents = hasDoor
      ? Math.round(
          ((doorTotals.rawDoorBaseTotal || 0) +
            (doorTotals.stormDoorTotal || 0) +
            (doorTotals.hardwareTotal || 0)) *
            100
        )
      : 0;
    const doorDiscountCents = hasDoor ? Math.round((doorTotals.discountTotal || 0) * 100) : 0;
    const doorMaterialsCents = doorRawBaseCents;
    const doorSurchargeCents = hasDoor ? Math.round((doorTotals.surchargeTotal || 0) * 100) : 0;
    const doorLabourCents = hasDoor
      ? Math.round(((doorTotals.unitLabourTotal || 0) + (doorTotals.upchargesTotal || 0)) * 100)
      : 0;
    const doorMiscCents = hasDoor ? Math.round((doorTotals.miscTotal || 0) * 100) : 0;

    const windowBaseCents = quoteResult?.base || 0;
    const windowSurchargeCents = quoteResult?.surcharge || 0;
    const windowDiscountCents = quoteResult?.promoDiscount || 0;

    const combinedMiscCents = effectiveMiscCents + suMiscCents + doorMiscCents;
    const combinedLabourCents = effectiveLabourCents + suLabourCents + doorLabourCents;
    const combinedSurchargeCents = windowSurchargeCents + suSurchargeCents + doorSurchargeCents;

    const combinedSubtotalCents =
      windowBaseCents -
      windowDiscountCents +
      suGlassCents +
      (doorRawBaseCents - doorDiscountCents) +
      effectiveJCCents +
      combinedMiscCents +
      combinedLabourCents +
      combinedSurchargeCents;

    let combinedTaxCents = 0;
    if (hstRate === 13) {
      combinedTaxCents = Math.round(combinedSubtotalCents * 0.13);
    } else if (hstRate === 8) {
      const materialsCents = Math.max(
        0,
        windowBaseCents -
          windowDiscountCents +
          windowSurchargeCents +
          effectiveJCCents +
          suGlassCents +
          suSurchargeCents +
          (doorRawBaseCents - doorDiscountCents) +
          doorSurchargeCents
      );
      const servicesCents = Math.max(0, combinedLabourCents + combinedMiscCents);
      combinedTaxCents = Math.round(materialsCents * 0.05 + servicesCents * 0.13);
    } else {
      combinedTaxCents = 0;
    }

    const combinedTotalCents = combinedSubtotalCents + combinedTaxCents;
    const combinedFirstPayment = Math.round(combinedTotalCents / 2);
    const combinedSecondPayment = combinedTotalCents - combinedFirstPayment;

    const suLineItems = attachedSealedUnit?.lineItems || [];
    let suSummarySentence = 'Sealed Unit';
    if (isAttachedSUService) {
      suSummarySentence = getSealedUnitServiceSummaryLabel(suLineItems, suTotals.totalSqft);
    } else if (suLineItems.length > 0) {
      suSummarySentence = formatSealedUnitSummarySentence(suLineItems);
    }

    const doorLineItems = attachedDoorQuote?.lineItems || [];
    const doorSummarySentence =
      doorLineItems.length > 0
        ? formatDoorSummarySentence(doorLineItems)
        : `${attachedDoorQuote?.itemCount || 1} Door Unit${(attachedDoorQuote?.itemCount || 1) !== 1 ? 's' : ''}`;

    return {
      hasSU,
      hasDoor,
      windowBaseCents,
      suGlassCents,
      suSummarySentence,
      isAttachedSUService,
      doorMaterialsCents,
      doorSummarySentence,
      doorDiscountCents,
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
    attachedDoorQuote,
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
      attachedDoorQuote ||
      customJC !== '' ||
      customLabour !== '' ||
      customMisc !== ''
  );

  return (
    <div className="lg:col-span-4 space-y-6 sticky top-8 h-fit pb-12">
      <Card className="bg-card/80 border-border backdrop-blur-xl shadow-xl overflow-hidden relative py-0 gap-0 [--card-spacing:0px]">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
        <CardHeader className="p-3.5 pb-2.5 border-b border-border/50">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-bold flex items-center gap-1.5 truncate">
                <Calculator className="w-4 h-4 text-primary shrink-0" />
                <span className="truncate">Promo Summary</span>
              </CardTitle>
              <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                {quoteResult?.promoName && (quoteResult.promoDiscount || 0) > 0 ? (
                  <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 truncate">
                    {quoteResult.promoName}
                  </span>
                ) : (
                  <p className="text-[11px] text-muted-foreground leading-tight truncate">
                    {quoteNumber ? `Quote #${quoteNumber}` : 'Window Calculation Summary'}{' '}
                    {customerName ? `• ${customerName}` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Segmented Install vs Supply Only Toggle */}
            {setIsSupplyOnly && (
              <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5 shrink-0">
                <button
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => setIsSupplyOnly(false)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                    !isSupplyOnly
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Wrench className="w-3 h-3" />
                  <span>Install</span>
                </button>
                <button
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => setIsSupplyOnly(true)}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer',
                    isSupplyOnly
                      ? 'bg-black text-white dark:bg-white dark:text-black shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <PackageCheck className="w-3 h-3" />
                  <span>Supply Only</span>
                </button>
              </div>
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

              {/* Attached Door Quote Badge */}
              {attachedDoorQuote && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-800 dark:text-amber-300 mb-2">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Paperclip className="w-3.5 h-3.5 text-amber-600" />
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

              {/* FINANCIAL LEDGER */}
              {combinedData ? (
                <CombinedLedgerSection
                  combinedData={combinedData}
                  summaryWindowGroups={summaryWindowGroups}
                  attachedDoorQuote={attachedDoorQuote}
                  renderEditableRow={renderEditableRow}
                  jcSummaryLabel={jcSummaryLabel}
                  customJC={customJC}
                  customMisc={customMisc}
                  customLabour={customLabour}
                  taxJC={taxJC}
                  taxMisc={taxMisc}
                  taxLabour={taxLabour}
                  setCustomJC={setCustomJC}
                  setCustomMisc={setCustomMisc}
                  setCustomLabour={setCustomLabour}
                  isSupplyOnly={isSupplyOnly}
                  hstRate={hstRate}
                  setHstRate={setHstRate}
                  isReadOnly={isReadOnly}
                />
              ) : (
                <StandardLedgerSection
                  summaryWindowGroups={summaryWindowGroups}
                  quoteResult={quoteResult}
                  renderEditableRow={renderEditableRow}
                  jcSummaryLabel={jcSummaryLabel}
                  effectiveJCCents={effectiveJCCents}
                  effectiveLabourCents={effectiveLabourCents}
                  effectiveMiscCents={effectiveMiscCents}
                  customJC={customJC}
                  customMisc={customMisc}
                  customLabour={customLabour}
                  taxJC={taxJC}
                  taxMisc={taxMisc}
                  taxLabour={taxLabour}
                  setCustomJC={setCustomJC}
                  setCustomMisc={setCustomMisc}
                  setCustomLabour={setCustomLabour}
                  isSupplyOnly={isSupplyOnly}
                  surchargeRate={surchargeRate}
                  afterDiscount={afterDiscount}
                  total={total}
                  firstPayment={firstPayment}
                  secondPayment={secondPayment}
                  hstRate={hstRate}
                  setHstRate={setHstRate}
                  isReadOnly={isReadOnly}
                />
              )}

              {/* 5-Year Free Labour Upgrade & Attached Door Options */}
              <SummaryUpgradeCard
                wantsUpgrade={wantsUpgrade}
                setWantsUpgrade={setWantsUpgrade}
                isReadOnly={isReadOnly}
                upgrade={upgrade}
                shownUpgrade={shownUpgrade}
                attachedDoorQuote={attachedDoorQuote}
              />

              {/* Reviewer Revision Instructions (if returned) */}
              {reviewQuote && reviewQuote.status === 'RETURNED' && reviewQuote.reviewerNotes && (
                <div className="mt-3 text-xs bg-amber-500/15 border border-amber-500/35 text-amber-950 dark:text-amber-200 p-3 rounded-xl font-medium flex items-start gap-2 shadow-xs animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-900 dark:text-amber-300">
                      Reviewer Revision Instructions:
                    </strong>
                    <p className="mt-0.5 italic text-foreground/90 font-normal">
                      &quot;{reviewQuote.reviewerNotes}&quot;
                    </p>
                  </div>
                </div>
              )}

              {/* Special Notes & Instructions (Printed on PDF Quotation) */}
              <div className="mt-3 space-y-1.5 pt-2 border-t border-border/40">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="windowQuoteNotes"
                    className="text-xs font-semibold flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-primary" />
                    <span>Special Notes &amp; Instructions</span>
                  </Label>
                  <span className="text-[10px] text-muted-foreground">Printed on PDF quotation</span>
                </div>
                <QuoteNotesEditor
                  id="windowQuoteNotes"
                  value={quoteNotes}
                  onChange={setQuoteNotes}
                  readOnly={isReadOnly}
                  placeholder="Enter special site notes, instructions, or employee comments with bold text and bullets..."
                />
              </div>

              {/* Action Buttons */}
              <SummaryReviewActions
                user={user}
                reviewQuote={reviewQuote}
                isEditMode={isEditMode}
                setIsEditMode={setIsEditMode}
                canEditApprovedQuote={canEditApprovedQuote}
                canEditCurrentQuote={canEditCurrentQuote}
                isReviewerOrAdmin={isReviewerOrAdmin}
                reviewActionLoading={reviewActionLoading}
                staffList={staffList}
                clerkList={clerkList}
                quoteNumber={quoteNumber}
                customerName={customerName}
                assignedReviewer={assignedReviewer}
                setAssignedReviewer={setAssignedReviewer}
                selectedOdooClerk={selectedOdooClerk}
                setSelectedOdooClerk={setSelectedOdooClerk}
                setShowSubmitModal={setShowSubmitModal}
                handleResubmitReturnedQuote={handleResubmitReturnedQuote}
                handleSaveQuotePrices={handleSaveQuotePrices}
                handleExitReview={handleExitReview}
                handleCancelEdits={handleCancelEdits}
                setOdooOrderNumberInput={setOdooOrderNumberInput}
                setShowCompleteOdooModal={setShowCompleteOdooModal}
                setIsPreviewOpen={setIsPreviewOpen}
                handleApproveReviewQuote={handleApproveReviewQuote}
                setReassignTo={setReassignTo}
                setReassignNotes={setReassignNotes}
                setShowReassignModal={setShowReassignModal}
                handleReturnReviewQuote={handleReturnReviewQuote}
              />
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
