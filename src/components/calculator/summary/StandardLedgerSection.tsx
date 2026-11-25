"use client"

import React from "react"
import { Info } from "lucide-react"
import { formatMoney } from "@/lib/promo-logic"
import { UnifiedTaxAndDeposit } from "@/components/shared/summary/UnifiedTaxAndDeposit"
import { DiscountLoyaltySelector } from "@/components/shared/discount/DiscountLoyaltySelector"
import { CustomMaterialsSummaryRows } from "@/components/shared/materials"

export interface StandardLedgerSectionProps {
  summaryWindowGroups: any[]
  quoteResult: any
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
  effectiveJCCents: number
  effectiveLabourCents: number
  effectiveMiscCents: number
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
  surchargeRate: number
  afterDiscount: number
  total: number
  firstPayment: number
  secondPayment: number
  hstRate: number
  setHstRate: (val: number) => void
  taxTotals?: any
  hstBaseCents?: number
  materialExemptionCents?: number
  isReadOnly?: boolean
}

export function StandardLedgerSection({
  summaryWindowGroups,
  quoteResult,
  renderEditableRow,
  jcSummaryLabel,
  effectiveJCCents,
  effectiveLabourCents,
  effectiveMiscCents,
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
  surchargeRate,
  afterDiscount,
  total,
  firstPayment,
  secondPayment,
  hstRate,
  setHstRate,
  taxTotals,
  hstBaseCents,
  materialExemptionCents,
  isReadOnly = false,
}: StandardLedgerSectionProps) {
  return (
    <>
      {/* Window configurations */}
      <div className="space-y-1.5 border-b border-border/50 pb-2.5">
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
        ) : (
          <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
            <span className="font-medium text-foreground">
              Base window price
            </span>
            <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
              {formatMoney(quoteResult?.base || 0)}
            </span>
          </div>
        )}

        {/* Jambs & Casing */}
        {(!isSupplyOnly || effectiveJCCents > 0) &&
          renderEditableRow(
            "jc",
            jcSummaryLabel,
            effectiveJCCents,
            customJC,
            taxJC,
            (val) => setCustomJC(val)
          )}

        {/* Additional Materials */}
        <CustomMaterialsSummaryRows materials={taxTotals?.customMaterials} />

        {/* Miscellaneous - Completely hidden on Supply Only */}
        {!isSupplyOnly &&
          renderEditableRow(
            "misc",
            "Miscellaneous",
            effectiveMiscCents,
            customMisc,
            taxMisc,
            (val) => setCustomMisc(val)
          )}

        {/* Labour - Completely hidden on Supply Only (placed after Misc) */}
        {!isSupplyOnly &&
          renderEditableRow(
            "labour",
            "Labour",
            effectiveLabourCents,
            customLabour,
            taxLabour,
            (val) => setCustomLabour(val)
          )}

        {/* Surcharge (placed below Labour and above Discounts) */}
        <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
          <span className="font-medium text-foreground">
            Surcharge ({surchargeRate}%)
          </span>
          <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
            +{formatMoney(quoteResult?.surcharge || 0)}
          </span>
        </div>

        {/* Layer 1: Base Promotional / Campaign Discount */}
        {((quoteResult?.promoDiscount || 0) > 0 || customDiscount !== "") && (
          renderEditableRow(
            "discount",
            customDiscountLabel || (customDiscount !== "" ? "Promo discount (custom)" : quoteResult?.promoName || "Promo discount"),
            customDiscount !== ""
              ? Math.round((parseFloat(customDiscount) || 0) * 100)
              : quoteResult?.promoDiscount || 0,
            customDiscount,
            quoteResult?.promoDiscount || 0,
            (val) => setCustomDiscount?.(val)
          )
        )}
        {quoteResult?.text && !customDiscount && (
          <p className="my-1.5 flex items-start gap-1.5 rounded-lg border border-border/60 bg-muted/50 p-2.5 text-[11px] text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
            <span>{quoteResult.text}</span>
          </p>
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
            combinedMaterials={combinedMaterials ?? ((quoteResult?.base || 0) / 100)}
            otherDiscounts={customDiscount !== "" ? parseFloat(customDiscount) || 0 : (quoteResult?.promoDiscount || 0) / 100}
            hstRate={hstRate}
            isFirstNation={hstRate === 8}
            isReadOnly={isReadOnly}
          />
        )}
      </div>

      {/* Subtotal (After Discount) */}
      <div className="border-b border-border/50 pb-2.5 text-xs sm:text-sm">
        <div className="flex items-center justify-between font-medium">
          <span className="text-foreground">Subtotal</span>
          <span className="shrink-0 font-mono font-bold whitespace-nowrap text-primary">
            {formatMoney(afterDiscount)}
          </span>
        </div>
      </div>

      {/* Tax Section & Deposit Schedule */}
      <UnifiedTaxAndDeposit
        hstRate={hstRate}
        setHstRate={setHstRate}
        taxCents={total - afterDiscount}
        hstBaseCents={hstBaseCents}
        materialExemptionCents={materialExemptionCents}
        totalCents={total}
        firstPaymentCents={firstPayment}
        secondPaymentCents={secondPayment}
        isReadOnly={isReadOnly}
        idPrefix="promo"
      />
    </>
  )
}
