"use client"

import React from "react"
import { Info } from "lucide-react"
import { formatMoney, toCents } from "@/lib/promo-logic"
import { UnifiedTaxAndDeposit } from "@/components/shared/summary/UnifiedTaxAndDeposit"
import { DiscountLoyaltySelector } from "@/components/shared/discount/DiscountLoyaltySelector"
import { CustomMaterialsSummaryRows } from "@/components/shared/materials"
import { AttachedQuoteDiscountRows } from "@/components/shared/summary/AttachedQuoteDiscountRows"
import {
  AttachedQuoteProductRows,
  AttachedQuoteHardwareAndJCRows,
} from "@/components/shared/summary/AttachedQuoteProductRows"

export interface CombinedLedgerSectionProps {
  combinedData?: any | null
  summaryWindowGroups: any[]
  attachedDoorQuote?: any | null
  attachedSealedUnit?: any | null
  quoteResult?: any
  taxTotals?: any
  renderEditableRow: (
    field: "jc" | "labour" | "misc" | "discount",
    label: string,
    amountCents: number,
    customVal: string,
    defaultCents: number,
    setter: (val: string) => void,
    suffix?: string
  ) => React.ReactNode
  jcSummaryLabel: string
  effectiveJCCents?: number
  effectiveLabourCents?: number
  effectiveMiscCents?: number
  customJC: string
  customMisc: string
  customLabour: string
  customDiscount?: string
  setCustomDiscount?: (val: string) => void
  customDiscountLabel?: string
  setCustomDiscountLabel?: (val: string) => void
  loyaltyDiscount?: string
  setLoyaltyDiscount?: (val: string) => void
  loyaltyDiscountLabel?: string
  setLoyaltyDiscountLabel?: (val: string) => void
  discountType?: "none" | "custom" | "loyalty"
  setDiscountType?: (val: "none" | "custom" | "loyalty") => void
  loyaltyPoints?: number
  setLoyaltyPoints?: (val: number) => void
  loyaltyGrossAmount?: number
  setLoyaltyGrossAmount?: (val: number) => void
  combinedMaterials?: number
  taxJC: number
  taxMisc: number
  taxLabour: number
  setCustomJC: (val: string) => void
  setCustomMisc: (val: string) => void
  setCustomLabour: (val: string) => void
  isSupplyOnly: boolean
  surchargeRate?: number
  afterDiscount?: number
  total?: number
  firstPayment?: number
  secondPayment?: number
  hstRate: number
  setHstRate: (val: number) => void
  hstBaseCents?: number
  materialExemptionCents?: number
  isReadOnly?: boolean
}

export function CombinedLedgerSection({
  combinedData,
  summaryWindowGroups,
  attachedDoorQuote,
  attachedSealedUnit,
  quoteResult,
  taxTotals,
  renderEditableRow,
  jcSummaryLabel,
  effectiveJCCents = 0,
  effectiveLabourCents = 0,
  effectiveMiscCents = 0,
  customJC,
  customMisc,
  customLabour,
  customDiscount = "",
  customDiscountLabel = "",
  setCustomDiscountLabel: _setCustomDiscountLabel,
  loyaltyDiscount = "",
  setLoyaltyDiscount,
  loyaltyDiscountLabel = "",
  setLoyaltyDiscountLabel,
  discountType = "none",
  setDiscountType,
  loyaltyPoints = 0,
  setLoyaltyPoints,
  loyaltyGrossAmount = 0,
  setLoyaltyGrossAmount,
  combinedMaterials,
  taxJC,
  taxMisc,
  taxLabour,
  setCustomJC,
  setCustomMisc,
  setCustomLabour,
  setCustomDiscount,
  isSupplyOnly,
  surchargeRate = 8,
  afterDiscount = 0,
  total = 0,
  firstPayment = 0,
  secondPayment = 0,
  hstRate,
  setHstRate,
  hstBaseCents,
  materialExemptionCents,
  isReadOnly = false,
}: CombinedLedgerSectionProps) {
  const hasCombined = Boolean(combinedData)
  const resolvedJCCents = hasCombined ? combinedData.effectiveJCCents : effectiveJCCents
  const resolvedMiscCents = hasCombined ? combinedData.combinedMiscCents : effectiveMiscCents
  const resolvedLabourCents = hasCombined ? combinedData.combinedLabourCents : effectiveLabourCents
  const resolvedSurchargeCents = hasCombined ? combinedData.combinedSurchargeCents : (quoteResult?.surcharge || 0)
  const resolvedPromoDiscountCents = hasCombined ? combinedData.windowDiscountCents : (quoteResult?.promoDiscount || 0)
  const resolvedSubtotalCents = hasCombined ? combinedData.combinedSubtotalCents : afterDiscount
  const resolvedTaxCents = hasCombined ? combinedData.combinedTaxCents : total - afterDiscount
  const resolvedHstBaseCents = hasCombined ? combinedData.combinedHstBaseCents : hstBaseCents
  const resolvedMaterialExemptionCents = hasCombined ? combinedData.combinedMaterialExemptionCents : materialExemptionCents
  const resolvedTotalCents = hasCombined ? combinedData.combinedTotalCents : total
  const resolvedFirstPayment = hasCombined ? combinedData.combinedFirstPayment : firstPayment
  const resolvedSecondPayment = hasCombined ? combinedData.combinedSecondPayment : secondPayment

  return (
    <>
      <div className="space-y-1.5 border-b border-border/50 pb-2.5">
        {/* Window glass configurations */}
        {summaryWindowGroups.length > 0 ? (
          summaryWindowGroups.map((g) => (
            <div
              key={g.key}
              className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm"
            >
              <span className="truncate font-medium text-foreground capitalize">
                {g.label}
              </span>
              <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                {formatMoney(g.baseCents)}
              </span>
            </div>
          ))
        ) : hasCombined && combinedData.windowBaseCents > 0 ? (
          <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
            <span className="font-medium text-foreground">
              Window base price
            </span>
            <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
              {formatMoney(combinedData.windowBaseCents)}
            </span>
          </div>
        ) : !hasCombined ? (
          <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
            <span className="font-medium text-foreground">
              Base window price
            </span>
            <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
              {formatMoney(quoteResult?.base || 0)}
            </span>
          </div>
        ) : null}

        {/* Attached Sealed Unit & Door Products */}
        {hasCombined && (
          <AttachedQuoteProductRows
            hostType="window"
            attachedDoorQuote={attachedDoorQuote}
            attachedSealedUnit={attachedSealedUnit}
            suNorm={combinedData.suNorm}
            suSentence={combinedData.suSummarySentence}
            suGlass={combinedData.suGlassCents / 100}
            isAttachedSUService={combinedData.isAttachedSUService}
            doorSentence={combinedData.doorSummarySentence}
            doorFallbackBase={combinedData.doorMaterialsCents / 100}
          />
        )}

        {/* Hardware & Jambs/Casing */}
        {hasCombined && (
          <AttachedQuoteHardwareAndJCRows
            hostType="window"
            attachedDoorQuote={attachedDoorQuote}
          />
        )}
        {(!isSupplyOnly || resolvedJCCents > 0) &&
          renderEditableRow(
            "jc",
            jcSummaryLabel,
            resolvedJCCents,
            customJC,
            taxJC,
            (val) => setCustomJC(val),
            hasCombined ? "(window only)" : undefined
          )}

        {/* Additional Materials (Windows + Attached Sealed Units + Attached Doors) */}
        <CustomMaterialsSummaryRows materials={taxTotals?.customMaterials} />
        {hasCombined && (
          <>
            <CustomMaterialsSummaryRows
              materials={
                attachedSealedUnit?.totals?.customMaterialsList ||
                attachedSealedUnit?.totals?.customMaterials ||
                attachedSealedUnit?.customMaterials
              }
              prefix="Glass Add-on"
            />
            <CustomMaterialsSummaryRows
              materials={
                attachedDoorQuote?.totals?.customMaterialsList ||
                attachedDoorQuote?.totals?.customMaterials ||
                attachedDoorQuote?.customMaterials
              }
              prefix="Door Add-on"
            />
          </>
        )}

        {/* Misc - Hidden on Supply Only */}
        {!isSupplyOnly &&
          (() => {
            const attMisc = hasCombined
              ? resolvedMiscCents - (customMisc !== "" ? toCents(customMisc) : taxMisc)
              : 0
            return renderEditableRow(
              "misc",
              "Miscellaneous",
              resolvedMiscCents,
              customMisc,
              taxMisc + attMisc,
              hasCombined
                ? (val) => {
                    if (!val) {
                      setCustomMisc("")
                      return
                    }
                    setCustomMisc((Math.max(0, toCents(val) - attMisc) / 100).toFixed(2))
                  }
                : (val) => setCustomMisc(val),
              hasCombined ? "(combined)" : undefined
            )
          })()}

        {/* Labour - Hidden on Supply Only (placed after Misc) */}
        {!isSupplyOnly &&
          (() => {
            const attLab = hasCombined
              ? resolvedLabourCents - (customLabour !== "" ? toCents(customLabour) : taxLabour)
              : 0
            return renderEditableRow(
              "labour",
              "Labour",
              resolvedLabourCents,
              customLabour,
              taxLabour + attLab,
              hasCombined
                ? (val) => {
                    if (!val) {
                      setCustomLabour("")
                      return
                    }
                    setCustomLabour((Math.max(0, toCents(val) - attLab) / 100).toFixed(2))
                  }
                : (val) => setCustomLabour(val),
              hasCombined ? "(combined)" : undefined
            )
          })()}

        {/* Surcharge (placed below Labour and above Discounts) */}
        <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
          <span className="font-medium text-foreground">
            {hasCombined ? (
              <>
                Surcharge{" "}
                <span className="text-[10px] text-muted-foreground/80">
                  (8% on materials)
                </span>
              </>
            ) : (
              `Surcharge (${surchargeRate}%)`
            )}
          </span>
          <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
            +{formatMoney(resolvedSurchargeCents)}
          </span>
        </div>

        {/* Layer 1: Base Window Promo Discount */}
        {(resolvedPromoDiscountCents > 0 || customDiscount !== "") &&
          renderEditableRow(
            "discount",
            customDiscountLabel ||
              (customDiscount !== ""
                ? hasCombined
                  ? "Window Discount (custom)"
                  : "Promo discount (custom)"
                : hasCombined
                  ? "Window Promo Discount"
                  : quoteResult?.promoName || "Promo discount"),
            customDiscount !== ""
              ? Math.round((parseFloat(customDiscount) || 0) * 100)
              : resolvedPromoDiscountCents,
            customDiscount,
            resolvedPromoDiscountCents,
            (val) => setCustomDiscount?.(val)
          )}
        {!hasCombined && quoteResult?.text && !customDiscount && (
          <p className="my-1.5 flex items-start gap-1.5 rounded-lg border border-border/60 bg-muted/50 p-2.5 text-[11px] text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span>{quoteResult.text}</span>
          </p>
        )}

        {/* Attached Door & Sealed Unit Discounts */}
        {hasCombined && (
          <AttachedQuoteDiscountRows
            hostType="window"
            doorNorm={combinedData.doorNorm}
            suNorm={combinedData.suNorm}
            doorDiscount={(combinedData.doorDiscountCents || 0) / 100}
            attachedDoorQuote={attachedDoorQuote}
            attachedSealedUnit={attachedSealedUnit}
          />
        )}

        {/* Layer 2: Loyalty Points / Additional Discount (ON TOP) */}
        {setLoyaltyDiscount && (
          <DiscountLoyaltySelector
            loyaltyDiscount={loyaltyDiscount}
            setLoyaltyDiscount={setLoyaltyDiscount}
            loyaltyDiscountLabel={loyaltyDiscountLabel}
            setLoyaltyDiscountLabel={setLoyaltyDiscountLabel}
            discountType={discountType}
            setDiscountType={setDiscountType}
            loyaltyPoints={loyaltyPoints}
            setLoyaltyPoints={setLoyaltyPoints}
            loyaltyGrossAmount={loyaltyGrossAmount}
            setLoyaltyGrossAmount={setLoyaltyGrossAmount}
            combinedMaterials={
              combinedMaterials ??
              (hasCombined
                ? combinedData.windowBase +
                  combinedData.suGlass +
                  combinedData.doorMaterials
                : (quoteResult?.base || 0) / 100)
            }
            otherDiscounts={
              (customDiscount !== ""
                ? parseFloat(customDiscount) || 0
                : resolvedPromoDiscountCents / 100) +
              (hasCombined
                ? (combinedData.doorNorm
                    ? combinedData.doorNorm.discount +
                      (combinedData.doorNorm.loyaltyDiscount || 0)
                    : combinedData.doorDiscountCents / 100) +
                  (combinedData.suNorm
                    ? combinedData.suNorm.discount +
                      (combinedData.suNorm.loyaltyDiscount || 0)
                    : 0)
                : 0)
            }
            hstRate={hstRate}
            isFirstNation={hstRate === 8}
            isReadOnly={isReadOnly}
          />
        )}
      </div>

      {/* Subtotal */}
      <div className="border-b border-border/50 pb-2.5 text-xs sm:text-sm">
        <div className="flex items-center justify-between font-medium">
          <span className="text-foreground">
            {hasCombined ? "Combined Subtotal" : "Subtotal"}
          </span>
          <span className="shrink-0 font-mono font-bold whitespace-nowrap text-primary">
            {formatMoney(resolvedSubtotalCents)}
          </span>
        </div>
      </div>

      {/* Tax Section & Deposit Schedule */}
      <UnifiedTaxAndDeposit
        hstRate={hstRate}
        setHstRate={setHstRate}
        taxCents={resolvedTaxCents}
        hstBaseCents={resolvedHstBaseCents}
        materialExemptionCents={resolvedMaterialExemptionCents}
        totalCents={resolvedTotalCents}
        firstPaymentCents={resolvedFirstPayment}
        secondPaymentCents={resolvedSecondPayment}
        isReadOnly={isReadOnly}
        idPrefix={hasCombined ? "promoCombined" : "promo"}
      />
    </>
  )
}
