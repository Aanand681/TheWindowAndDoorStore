"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { getJcSummaryLabel } from "@/lib/promo-logic"
import { writeSessionAttachedInstallOption } from "@/hooks/calculator/supply-mode/supply-session-storage"
import { useCombinedQuoteData } from "@/hooks/calculator/useCombinedQuoteData"
import { UnifiedSummaryHeader } from "@/components/shared/summary/UnifiedSummaryHeader"
import { UnifiedAttachedBadges } from "@/components/shared/summary/UnifiedAttachedBadges"
import { EditableLedgerRow } from "@/components/shared/summary/EditableLedgerRow"
import { UnifiedUpgradeCallouts } from "@/components/shared/summary/UnifiedUpgradeCallouts"
import { CustomOptionsSection } from "./summary/CustomOptionsSection"
import { SummaryReviewActions } from "./summary/SummaryReviewActions"
import { ReviewerRevisionAlert } from "./summary/ReviewerRevisionAlert"
import { useQuoteSummaryComparison } from "./summary/useQuoteSummaryComparison"
import { SummaryCompareModalWrapper } from "./summary/SummaryCompareModalWrapper"
import { CombinedLedgerSection } from "./summary/CombinedLedgerSection"
import { computeEffectiveDollars } from "./summary/effective-cents-calc"
import type { QuoteSummaryCardProps } from "./summary/types"
import { computeDeduplicatedInstallCompareAmounts } from "@/lib/quotes/supply-install-delta"

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
      amount={amountCents}
      customVal={customVal}
      defaultAmount={defaultCents}
      unit="cents"
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
    taxTotals,
    customDiscount,
    customDiscountLabel: props.customDiscountLabel,
    loyaltyDiscount: props.loyaltyDiscount,
    loyaltyDiscountLabel: props.loyaltyDiscountLabel,
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

  const dedupCompare = React.useMemo(
    () =>
      computeDeduplicatedInstallCompareAmounts({
        hasWindows: true,
        isWinSupplyOnly: isSupply,
        winTaxTotals: taxTotals,
        winOverrideLabourDollars:
          isSupply || customLabour === ""
            ? undefined
            : parseFloat(customLabour) || 0,
        winOverrideMiscDollars:
          isSupply || customMisc === "" ? undefined : parseFloat(customMisc) || 0,
        hasDoors: Boolean(attachedDoorQuote),
        isDoorSupplyOnly: Boolean(
          attachedDoorQuote?.mode === "supply_only" ||
            attachedDoorQuote?.isSupplyOnly ||
            attachedDoorQuote?.totals?.isSupplyOnly
        ),
        doorTotals: attachedDoorQuote?.totals,
        attachedDoorQuote,
        hasSealedUnits: Boolean(attachedSealedUnit),
        isSUSupplyOnly: Boolean(
          attachedSealedUnit?.sealedUnitMode === "supply_only" ||
            attachedSealedUnit?.isSupplyOnly ||
            attachedSealedUnit?.totals?.isSupplyOnly
        ),
        suTotals: attachedSealedUnit?.totals,
        attachedSealedUnit,
      }),
    [
      isSupply,
      taxTotals,
      customLabour,
      customMisc,
      attachedDoorQuote,
      attachedSealedUnit,
    ]
  )

  const effectiveCompareLabour = dedupCompare.compareLabourAmount || compareLabourAmount
  const effectiveCompareMisc = dedupCompare.compareMiscAmount || compareMiscAmount

  const hasActiveQuoteData = Boolean(
    (quoteResult &&
      ((quoteResult.base || 0) > 0 || (quoteResult.total || 0) > 0)) ||
    effectiveJCCents > 0 ||
    effectiveLabourCents > 0 ||
    effectiveMiscCents > 0 ||
    ((taxTotals as any)?.customMaterialsTotal || 0) > 0 ||
    (Array.isArray((taxTotals as any)?.customMaterials) &&
      (taxTotals as any).customMaterials.length > 0) ||
    attachedSealedUnit ||
    attachedDoorQuote ||
    attachedUpgrade ||
    customJC !== "" ||
    customLabour !== "" ||
    customMisc !== ""
  )

  return (
    <div className="sticky top-8 h-fit min-w-0 space-y-6 pb-12">
      <Card className="relative gap-0 overflow-hidden border-border bg-card/80 py-0 shadow-xl backdrop-blur-xl [--card-spacing:0px]">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
        <UnifiedSummaryHeader
          mode={isSupplyOnly ? "supply_only" : "installation"}
          showModeToggle={Boolean(setIsSupplyOnly)}
          onModeChange={
            setIsSupplyOnly
              ? (m) => setIsSupplyOnly(m === "supply_only")
              : undefined
          }
          isReadOnly={isReadOnly}
          onOpenCompare={() => setIsCompareOpen(true)}
        />
        <CardContent className="space-y-4 px-5 pt-3.5 pb-5 sm:px-6">
          {hasActiveQuoteData ? (
            <>
              <UnifiedAttachedBadges
                hostType="window"
                attachedSealedUnit={attachedSealedUnit}
                onRemoveAttachedSealedUnit={onRemoveAttachedSealedUnit}
                attachedDoorQuote={attachedDoorQuote}
                onRemoveAttachedDoorQuote={onRemoveAttachedDoorQuote}
                attachedInstallOption={attachedInstallOption}
                isSupply={isSupply}
                hasSupplyJC={supplyJCAmount > 0}
                onRemoveAttachedInstallOption={() => {
                  writeSessionAttachedInstallOption(null, "window")
                  setAttachedInstallOption(null)
                }}
                dynamicInstallDeltaCents={dynamicInstallDeltaCents}
              />

              {/* FINANCIAL LEDGER */}
              <CombinedLedgerSection
                combinedData={combinedData}
                summaryWindowGroups={summaryWindowGroups || []}
                attachedDoorQuote={attachedDoorQuote}
                attachedSealedUnit={attachedSealedUnit}
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
                combinedMaterials={
                  combinedData
                    ? combinedData.windowBase +
                      (combinedData.effectiveJCCents || 0) / 100 +
                      combinedData.suGlass +
                      combinedData.doorMaterials +
                      combinedData.totalCustomMaterials
                    : (quoteResult?.base || 0) / 100 +
                      effectiveJC +
                      ((taxTotals as any)?.customMaterialsTotal || 0)
                }
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

              {/* 5-Year Free Labour Upgrade, Window Comparison Option & Attached Door Upgrades + Custom Options */}
              <div className="mt-3 space-y-2.5">
                <UnifiedUpgradeCallouts
                  showLabourUpgradeCheckbox={true}
                  wantsUpgrade={wantsUpgrade}
                  setWantsUpgrade={setWantsUpgrade}
                  upgrade={upgrade}
                  shownUpgrade={shownUpgrade}
                  isReadOnly={isReadOnly}
                  attachedUpgrade={attachedUpgrade}
                  onRemoveAttachedUpgrade={onRemoveAttachedUpgrade}
                  attachedDoorQuote={attachedDoorQuote}
                />
                <CustomOptionsSection
                  scope="window"
                  canModifyOptions={
                    !isReadOnly ||
                    Boolean(props.isReviewerOrAdmin && !props.isOdooCompleted)
                  }
                  reviewQuote={reviewQuote}
                  quoteNumber={quoteNumber}
                />
              </div>

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
