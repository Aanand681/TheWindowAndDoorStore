'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { toCents, getJcSummaryLabel } from '@/lib/promo-logic';
import { useCombinedQuoteData } from '@/hooks/calculator/useCombinedQuoteData';
import { QuoteSummaryHeader } from './summary/QuoteSummaryHeader';
import { AttachedQuoteBadges } from './summary/AttachedQuoteBadges';
import { EditableLedgerRow } from './summary/EditableLedgerRow';
import { CombinedLedgerSection } from './summary/CombinedLedgerSection';
import { StandardLedgerSection } from './summary/StandardLedgerSection';
import { SummaryUpgradeCard } from './summary/SummaryUpgradeCard';
import { SummaryReviewActions } from './summary/SummaryReviewActions';
import { ReviewerRevisionAlert } from './summary/ReviewerRevisionAlert';
import type { QuoteSummaryCardProps } from './summary/types';

export type { QuoteSummaryCardProps };

export function QuoteSummaryCard(props: QuoteSummaryCardProps) {
  const {
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
    wantsUpgrade,
    setWantsUpgrade,
    upgrade,
    shownUpgrade,
    afterDiscount,
    hstRate,
    setHstRate,
    total,
    firstPayment,
    secondPayment,
    quoteNotes,
    setQuoteNotes,
    isReadOnly,
    reviewQuote,
    quoteNumber,
    customerName,
    isSupplyOnly = false,
    setIsSupplyOnly,
    attachedSealedUnit,
    attachedDoorQuote,
    attachedUpgrade,
    onRemoveAttachedSealedUnit,
    onRemoveAttachedDoorQuote,
    onRemoveAttachedUpgrade,
  } = props;
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

  const jcSummaryLabel = React.useMemo(
    () => getJcSummaryLabel(taxTotals),
    [taxTotals]
  );

  // Combined Financials Ledger via clean hook
  const combinedData = useCombinedQuoteData({
    attachedSealedUnit,
    attachedDoorQuote,
    quoteResult,
    effectiveMiscCents,
    effectiveLabourCents,
    effectiveJCCents,
    hstRate,
  });

  const hasActiveQuoteData = Boolean(
    (quoteResult && ((quoteResult.base || 0) > 0 || (quoteResult.total || 0) > 0)) ||
    effectiveJCCents > 0 ||
    effectiveLabourCents > 0 ||
    effectiveMiscCents > 0 ||
    attachedSealedUnit ||
    attachedDoorQuote ||
    attachedUpgrade ||
    customJC !== '' ||
    customLabour !== '' ||
    customMisc !== ''
  );

  return (
    <div className="lg:col-span-4 space-y-6 sticky top-8 h-fit pb-12">
      <Card className="bg-card/80 border-border backdrop-blur-xl shadow-xl overflow-hidden relative py-0 gap-0 [--card-spacing:0px]">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
        <QuoteSummaryHeader
          quoteResult={quoteResult}
          quoteNumber={quoteNumber}
          customerName={customerName}
          isSupplyOnly={isSupplyOnly}
          setIsSupplyOnly={setIsSupplyOnly}
          isReadOnly={isReadOnly}
        />
        <CardContent className="space-y-4 pt-3.5 px-5 sm:px-6 pb-5">
          {hasActiveQuoteData ? (
            <>
              <AttachedQuoteBadges
                attachedSealedUnit={attachedSealedUnit}
                onRemoveAttachedSealedUnit={onRemoveAttachedSealedUnit}
                attachedDoorQuote={attachedDoorQuote}
                onRemoveAttachedDoorQuote={onRemoveAttachedDoorQuote}
                attachedUpgrade={attachedUpgrade}
                onRemoveAttachedUpgrade={onRemoveAttachedUpgrade}
              />

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

              {/* 5-Year Free Labour Upgrade & Attached Window/Door Options */}
              <SummaryUpgradeCard
                wantsUpgrade={wantsUpgrade}
                setWantsUpgrade={setWantsUpgrade}
                isReadOnly={isReadOnly}
                upgrade={upgrade}
                shownUpgrade={shownUpgrade}
                attachedDoorQuote={attachedDoorQuote}
                attachedUpgrade={attachedUpgrade}
              />

              {/* Reviewer Revision Instructions (if returned) */}
              {reviewQuote?.status === 'RETURNED' && (
                <ReviewerRevisionAlert notes={reviewQuote.reviewerNotes} />
              )}

              {/* Action Buttons */}
              <SummaryReviewActions {...props} />
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