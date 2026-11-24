"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { getJcSummaryLabel } from "@/lib/promo-logic"
import { writeSessionAttachedInstallOption } from "@/hooks/calculator/supply-mode/supply-session-storage"
import { useCombinedQuoteData } from "@/hooks/calculator/useCombinedQuoteData"
import { QuoteSummaryHeader } from "./summary/QuoteSummaryHeader"
import { AttachedQuoteBadges } from "./summary/AttachedQuoteBadges"
import { EditableLedgerRow } from "./summary/EditableLedgerRow"
import { SummaryUpgradeCard } from "./summary/SummaryUpgradeCard"
import { SummaryReviewActions } from "./summary/SummaryReviewActions"
import { ReviewerRevisionAlert } from "./summary/ReviewerRevisionAlert"
import { useQuoteSummaryComparison } from "./summary/useQuoteSummaryComparison"
import { SummaryCompareModalWrapper } from "./summary/SummaryCompareModalWrapper"
import { SummaryLedgerSwitcher } from "./summary/SummaryLedgerSwitcher"
import { computeEffectiveDollars } from "./summary/effective-cents-calc"
import type { QuoteSummaryCardProps } from "./summary/types"

export type { QuoteSummaryCardProps }

export function QuoteSummaryCard(props: QuoteSummaryCardProps) {
  const {
    quoteResult,
    summaryWindowGroups,
    surchargeRate,
    taxTotals,
    taxJC,
    taxMisc,
    taxLabour,
    customJC = "",
    setCustomJC,
    customMisc = "",
    setCustomMisc,
    customLabour = "",
    setCustomLabour,
    customDiscount = "",
    setCustomDiscount,
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
  } = props

  const isSupply = Boolean(isSupplyOnly || taxTotals?.isSupplyOnly)

  const {
    hasSupplyJC,
    effectiveJC,
    effectiveMisc,
    effectiveLabour,
    effectiveJCCents,
    effectiveMiscCents,
    effectiveLabourCents,
  } = computeEffectiveDollars(
    isSupply,
    taxTotals,
    taxJC,
    taxMisc,
    taxLabour,
    customJC,
    customMisc,
    customLabour
  )

  const [editingField, setEditingField] = React.useState<
    "jc" | "labour" | "misc" | "discount" | null
  >(null)
  const [tempEditVal, setTempEditVal] = React.useState<string>("")

  const {
    isCompareOpen,
    setIsCompareOpen,
    attachedInstallOption,
    setAttachedInstallOption,
    windowGroupsBaseTotal,
    supplyJCAmount,
    installJCAmount,
    compareLabourAmount,
    compareMiscAmount,
    dynamicInstallDeltaCents,
  } = useQuoteSummaryComparison({
    isSupply,
    quoteNumber,
    reviewQuoteId: reviewQuote?._id ? String(reviewQuote._id) : undefined,
    summaryWindowGroups,
    quoteResult,
    taxTotals,
    taxJC,
    taxLabour,
    taxMisc,
    effectiveJCCents,
    effectiveLabourCents,
    effectiveMiscCents,
    hasSupplyJC,
  })

  const renderEditableRow = (
    field: "jc" | "labour" | "misc" | "discount",
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
  )

  const jcSummaryLabel = React.useMemo(
    () => getJcSummaryLabel(taxTotals),
    [taxTotals]
  )

  // Combined Financials Ledger via clean hook
  const combinedData = useCombinedQuoteData({
    attachedSealedUnit,
    attachedDoorQuote,
    quoteResult,
    customDiscount,
    effectiveMisc,
    effectiveLabour,
    effectiveJC,
    effectiveMiscCents,
    effectiveLabourCents,
    effectiveJCCents,
    hstRate,
    isSupplyOnly: isSupply,
  })

  const compareSubtotal = combinedData
    ? combinedData.combinedSubtotal
    : afterDiscount / 100

  const compareAttachedAmount = combinedData
    ? (combinedData.hasDoor
        ? combinedData.doorMaterials - combinedData.doorDiscount
        : 0) +
        (combinedData.hasSU ? combinedData.suGlass : 0)
    : undefined

  const compareAttachedLabel = combinedData
    ? [
        combinedData.hasDoor ? combinedData.doorSummarySentence : "",
        combinedData.hasSU ? combinedData.suSummarySentence : "",
      ]
        .filter(Boolean)
        .join(" + ") || undefined
    : undefined

  const doorInstallLabour = attachedDoorQuote
    ? Number(
        attachedDoorQuote.totals?.fullInstallLabour ??
          attachedDoorQuote.totals?.combinedLabourTotal ??
          attachedDoorQuote.totals?.doorPureLabourTotal ??
          0
      )
    : 0
  const suInstallLabour = attachedSealedUnit
    ? Number(
        attachedSealedUnit.totals?.fullInstallLabour ??
          attachedSealedUnit.totals?.combinedLabourTotal ??
          attachedSealedUnit.totals?.pureLabour ??
          0
      )
    : 0
  const effectiveCompareLabour =
    compareLabourAmount + doorInstallLabour + suInstallLabour

  const doorInstallMisc = attachedDoorQuote
    ? Number(
        attachedDoorQuote.totals?.fullInstallMisc ??
          attachedDoorQuote.totals?.miscTotal ??
          0
      )
    : 0
  const suInstallMisc = attachedSealedUnit
    ? Number(
        attachedSealedUnit.totals?.fullInstallMisc ??
          attachedSealedUnit.totals?.miscTotal ??
          0
      )
    : 0
  const effectiveCompareMisc =
    compareMiscAmount + doorInstallMisc + suInstallMisc

  const hasActiveQuoteData = Boolean(
    (quoteResult &&
      ((quoteResult.base || 0) > 0 || (quoteResult.total || 0) > 0)) ||
    effectiveJCCents > 0 ||
    effectiveLabourCents > 0 ||
    effectiveMiscCents > 0 ||
    attachedSealedUnit ||
    attachedDoorQuote ||
    attachedUpgrade ||
    customJC !== "" ||
    customLabour !== "" ||
    customMisc !== ""
  )

  return (
    <div className="sticky top-8 h-fit space-y-6 pb-12 lg:col-span-4">
      <Card className="relative gap-0 overflow-hidden border-border bg-card/80 py-0 shadow-xl backdrop-blur-xl [--card-spacing:0px]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
        <QuoteSummaryHeader
          quoteResult={quoteResult}
          quoteNumber={quoteNumber}
          customerName={customerName}
          isSupplyOnly={isSupplyOnly}
          setIsSupplyOnly={setIsSupplyOnly}
          isReadOnly={isReadOnly}
          onOpenCompare={() => setIsCompareOpen(true)}
        />
        <CardContent className="space-y-4 px-5 pt-3.5 pb-5 sm:px-6">
          {hasActiveQuoteData ? (
            <>
              <AttachedQuoteBadges
                attachedSealedUnit={attachedSealedUnit}
                onRemoveAttachedSealedUnit={onRemoveAttachedSealedUnit}
                attachedDoorQuote={attachedDoorQuote}
                onRemoveAttachedDoorQuote={onRemoveAttachedDoorQuote}
                attachedUpgrade={attachedUpgrade}
                onRemoveAttachedUpgrade={onRemoveAttachedUpgrade}
                attachedInstallOption={attachedInstallOption}
                isSupply={isSupply}
                hasSupplyJC={supplyJCAmount > 0}
                onRemoveAttachedInstallOption={() => {
                  writeSessionAttachedInstallOption(null)
                  setAttachedInstallOption(null)
                }}
                dynamicInstallDeltaCents={dynamicInstallDeltaCents}
              />

              {/* FINANCIAL LEDGER */}
              <SummaryLedgerSwitcher
                combinedData={combinedData}
                summaryWindowGroups={summaryWindowGroups}
                attachedDoorQuote={attachedDoorQuote}
                quoteResult={quoteResult}
                renderEditableRow={renderEditableRow}
                jcSummaryLabel={jcSummaryLabel}
                effectiveJCCents={effectiveJCCents}
                effectiveLabourCents={effectiveLabourCents}
                effectiveMiscCents={effectiveMiscCents}
                customJC={customJC}
                customMisc={customMisc}
                customLabour={customLabour}
                customDiscount={customDiscount}
                customDiscountLabel={props.customDiscountLabel}
                setCustomDiscountLabel={props.setCustomDiscountLabel}
                loyaltyDiscount={props.loyaltyDiscount}
                setLoyaltyDiscount={props.setLoyaltyDiscount}
                loyaltyDiscountLabel={props.loyaltyDiscountLabel}
                setLoyaltyDiscountLabel={props.setLoyaltyDiscountLabel}
                discountType={props.discountType}
                setDiscountType={props.setDiscountType}
                loyaltyPoints={props.loyaltyPoints}
                setLoyaltyPoints={props.setLoyaltyPoints}
                loyaltyGrossAmount={props.loyaltyGrossAmount}
                setLoyaltyGrossAmount={props.setLoyaltyGrossAmount}
                combinedMaterials={combinedData ? (combinedData.windowBase + combinedData.suGlass + combinedData.doorMaterials) : ((quoteResult?.base || 0) / 100)}
                taxJC={taxJC}
                taxMisc={taxMisc}
                taxLabour={taxLabour}
                setCustomJC={setCustomJC}
                setCustomMisc={setCustomMisc}
                setCustomLabour={setCustomLabour}
                setCustomDiscount={setCustomDiscount}
                isSupplyOnly={isSupplyOnly}
                surchargeRate={surchargeRate}
                afterDiscount={afterDiscount}
                total={total}
                firstPayment={firstPayment}
                secondPayment={secondPayment}
                hstRate={hstRate}
                setHstRate={setHstRate}
                taxTotals={taxTotals}
                hstBaseCents={props.hstBase}
                materialExemptionCents={props.materialExemption}
                isReadOnly={isReadOnly}
              />

              {/* 5-Year Free Labour Upgrade & Attached Window/Door Options */}
              <SummaryUpgradeCard
                wantsUpgrade={wantsUpgrade}
                setWantsUpgrade={setWantsUpgrade}
                isReadOnly={isReadOnly}
                isReviewerOrAdmin={props.isReviewerOrAdmin}
                isOdooCompleted={props.isOdooCompleted}
                upgrade={upgrade}
                shownUpgrade={shownUpgrade}
                attachedDoorQuote={attachedDoorQuote}
                attachedUpgrade={attachedUpgrade}
                reviewQuote={reviewQuote}
                quoteNumber={quoteNumber}
              />

              {/* Reviewer Revision Instructions (if returned) */}
              {reviewQuote?.status === "RETURNED" && (
                <ReviewerRevisionAlert notes={reviewQuote.reviewerNotes} />
              )}

              {/* Action Buttons */}
              <SummaryReviewActions {...props} />
            </>
          ) : (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Enter window prices, add Jambs &amp; Casing, or enter Service
              specifications to view summary.
            </div>
          )}
        </CardContent>
      </Card>

      <SummaryCompareModalWrapper
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        quoteNumber={quoteNumber}
        customerName={customerName}
        isSupplyOnly={isSupplyOnly}
        currentSubtotal={compareSubtotal}
        windowGroupsBaseTotal={windowGroupsBaseTotal}
        jcSummaryLabel={jcSummaryLabel}
        isSupply={isSupply}
        supplyJCAmount={supplyJCAmount}
        installJCAmount={installJCAmount}
        taxTotals={taxTotals}
        compareLabourAmount={effectiveCompareLabour}
        compareMiscAmount={effectiveCompareMisc}
        attachedLabel={compareAttachedLabel}
        attachedAmount={compareAttachedAmount}
        quoteResult={quoteResult}
        surchargeRate={surchargeRate}
        hstRate={hstRate}
        setIsSupplyOnly={setIsSupplyOnly}
        setAttachedInstallOption={setAttachedInstallOption}
      />
    </div>
  )
}

export default QuoteSummaryCard
