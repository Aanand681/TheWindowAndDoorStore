"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { toCents, getJcSummaryLabel } from "@/lib/promo-logic"
import {
  readSessionSupplyState,
  readSessionInstallState,
  readSessionAttachedInstallOption,
  writeSessionAttachedInstallOption,
  type CachedAttachedInstallOption,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import { useCombinedQuoteData } from "@/hooks/calculator/useCombinedQuoteData"
import { QuoteSummaryHeader } from "./summary/QuoteSummaryHeader"
import { AttachedQuoteBadges } from "./summary/AttachedQuoteBadges"
import { EditableLedgerRow } from "./summary/EditableLedgerRow"
import { CombinedLedgerSection } from "./summary/CombinedLedgerSection"
import { StandardLedgerSection } from "./summary/StandardLedgerSection"
import { SummaryUpgradeCard } from "./summary/SummaryUpgradeCard"
import { SummaryReviewActions } from "./summary/SummaryReviewActions"
import { ReviewerRevisionAlert } from "./summary/ReviewerRevisionAlert"
import { SupplyVsInstallCompareModal } from "@/components/shared/SupplyVsInstallCompareModal"
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
  } = props
  const isSupply = Boolean(isSupplyOnly || taxTotals?.isSupplyOnly)
  const hasSupplyJC = isSupply
    ? Boolean(
        (taxTotals?.selectedJamb &&
          taxTotals.selectedJamb.id !== "none" &&
          Number(
            taxTotals.selectedJamb.total || taxTotals.selectedJamb.rate || 0
          ) > 0) ||
        (taxTotals?.selectedCasing &&
          taxTotals.selectedCasing.id !== "none" &&
          Number(
            taxTotals.selectedCasing.total || taxTotals.selectedCasing.rate || 0
          ) > 0) ||
        (taxTotals?.jcLabourCents && taxTotals.jcLabourCents > 0)
      )
    : true

  const effectiveJCCents = isSupply
    ? hasSupplyJC
      ? customJC !== ""
        ? toCents(customJC)
        : taxJC || 0
      : 0
    : customJC !== ""
      ? toCents(customJC)
      : taxJC || 0
  const effectiveMiscCents = isSupply
    ? customMisc !== ""
      ? toCents(customMisc)
      : 0
    : customMisc !== ""
      ? toCents(customMisc)
      : taxMisc || 0
  const effectiveLabourCents = isSupply
    ? 0
    : customLabour !== ""
      ? toCents(customLabour)
      : taxLabour || 0

  const [editingField, setEditingField] = React.useState<
    "jc" | "labour" | "misc" | null
  >(null)
  const [tempEditVal, setTempEditVal] = React.useState<string>("")
  const [isCompareOpen, setIsCompareOpen] = React.useState<boolean>(false)
  const [attachedInstallOption, setAttachedInstallOption] =
    React.useState<CachedAttachedInstallOption | null>(null)

  React.useEffect(() => {
    setAttachedInstallOption(
      isSupply ? readSessionAttachedInstallOption() : null
    )
  }, [isSupply])

  const windowGroupsBaseTotal = React.useMemo(() => {
    if (summaryWindowGroups && summaryWindowGroups.length > 0) {
      return (
        summaryWindowGroups.reduce((acc, g) => acc + (g.baseCents || 0), 0) /
        100
      )
    }
    return (quoteResult?.base || 0) / 100
  }, [summaryWindowGroups, quoteResult?.base])

  const supplyJCAmount = React.useMemo(() => {
    if (isSupply) return hasSupplyJC ? effectiveJCCents / 100 : 0
    const cachedSupply = readSessionSupplyState()
    if (
      !cachedSupply ||
      (cachedSupply.jambId === "none" && cachedSupply.casingId === "none")
    )
      return 0
    return cachedSupply.customJC ? toCents(cachedSupply.customJC) / 100 : 0
  }, [isSupply, hasSupplyJC, effectiveJCCents])

  const installJCAmount = React.useMemo(() => {
    if (!isSupply) return effectiveJCCents / 100
    const c = readSessionInstallState()
    if (c?.customJC) return toCents(c.customJC) / 100
    return (
      c?.installJCAmount ??
      (taxTotals?.jcLabourCents
        ? taxTotals.jcLabourCents / 100
        : (taxJC || 0) / 100)
    )
  }, [isSupply, effectiveJCCents, taxTotals, taxJC])

  const compareLabourAmount = React.useMemo(() => {
    if (!isSupply) return effectiveLabourCents / 100
    const c = readSessionInstallState()
    if (c?.customLabour) return toCents(c.customLabour) / 100
    return c?.installLabourAmount ?? (taxLabour || 0) / 100
  }, [isSupply, effectiveLabourCents, taxLabour])

  const compareMiscAmount = React.useMemo(() => {
    if (!isSupply) return effectiveMiscCents / 100
    const c = readSessionInstallState()
    if (c?.customMisc) return toCents(c.customMisc) / 100
    return c?.installMiscAmount ?? (taxMisc || 0) / 100
  }, [isSupply, effectiveMiscCents, taxMisc])

  const renderEditableRow = (
    field: "jc" | "labour" | "misc",
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
    effectiveMiscCents,
    effectiveLabourCents,
    effectiveJCCents,
    hstRate,
  })

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
                attachedInstallOption={isSupply ? attachedInstallOption : null}
                onRemoveAttachedInstallOption={() => {
                  writeSessionAttachedInstallOption(null)
                  setAttachedInstallOption(null)
                }}
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
                  taxTotals={taxTotals}
                  hstBaseCents={props.hstBase}
                  materialExemptionCents={props.materialExemption}
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

      <SupplyVsInstallCompareModal
        isOpen={isCompareOpen}
        onClose={() => setIsCompareOpen(false)}
        title="Window Quote Comparison"
        quoteNumber={quoteNumber}
        customerName={customerName}
        currentMode={isSupplyOnly ? "supply" : "install"}
        baseLabel="Windows"
        baseAmount={windowGroupsBaseTotal}
        jcLabel={jcSummaryLabel}
        jcAmount={isSupply ? supplyJCAmount : installJCAmount}
        supplyJCAmount={supplyJCAmount}
        installJCAmount={installJCAmount}
        labourAmount={compareLabourAmount}
        miscAmount={compareMiscAmount}
        surchargeAmount={(quoteResult?.surcharge || 0) / 100}
        surchargeLabel={`Surcharge (${surchargeRate}%)`}
        discountAmount={(quoteResult?.promoDiscount || 0) / 100}
        discountLabel={quoteResult?.promoName || "Promo Discount"}
        hstRate={hstRate}
        onApplyMode={(m) => setIsSupplyOnly && setIsSupplyOnly(m === "supply")}
        onToggleAttachOption={(att, c) =>
          setAttachedInstallOption(
            att ? { enabled: true, amountPreTaxCents: c } : null
          )
        }
      />
    </div>
  )
}

export default QuoteSummaryCard
