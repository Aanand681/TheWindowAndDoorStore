"use client"

import React from "react"
import { Info } from "lucide-react"
import { formatMoney } from "@/lib/promo-logic"
import { SummaryTaxSection } from "./SummaryTaxSection"
import { SummaryDepositSchedule } from "./SummaryDepositSchedule"

export interface StandardLedgerSectionProps {
  summaryWindowGroups: any[]
  quoteResult: any
  renderEditableRow: (
    field: "jc" | "labour" | "misc",
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
  taxJC,
  taxMisc,
  taxLabour,
  setCustomJC,
  setCustomMisc,
  setCustomLabour,
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
              <span className="truncate font-medium text-muted-foreground capitalize">
                {g.label}
              </span>
              <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                {formatMoney(g.baseCents)}
              </span>
            </div>
          ))
        ) : (
          <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
            <span className="font-medium text-muted-foreground">
              Base window price
            </span>
            <span className="shrink-0 font-mono font-semibold whitespace-nowrap">
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
        {taxTotals?.customMaterials &&
          Array.isArray(taxTotals.customMaterials) &&
          taxTotals.customMaterials.map((mat: any) => {
            const amt = Number(mat.amount) || 0
            if (amt <= 0 && !mat.label) return null
            return (
              <div
                key={mat.id}
                className="flex items-center justify-between py-0.5 text-xs sm:text-sm"
              >
                <span className="text-muted-foreground">
                  {mat.label ? `Material: ${mat.label}` : "Additional Material"}
                </span>
                <span className="shrink-0 font-mono whitespace-nowrap text-foreground">
                  +{formatMoney(Math.round(amt * 100))}
                </span>
              </div>
            )
          })}

        {/* Labour - Completely hidden on Supply Only */}
        {!isSupplyOnly &&
          renderEditableRow(
            "labour",
            "Labour",
            effectiveLabourCents,
            customLabour,
            taxLabour,
            (val) => setCustomLabour(val)
          )}

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

        {/* Surcharge */}
        <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
          <span className="text-muted-foreground">
            Surcharge ({surchargeRate}%)
          </span>
          <span className="shrink-0 font-mono whitespace-nowrap text-muted-foreground">
            +{formatMoney(quoteResult?.surcharge || 0)}
          </span>
        </div>

        {/* Promo discount */}
        {(quoteResult?.promoDiscount || 0) > 0 && (
          <>
            <div className="flex items-center justify-between py-0.5 text-xs font-medium text-emerald-500 sm:text-sm">
              <span>Promo discount</span>
              <span className="shrink-0 font-mono whitespace-nowrap">
                -{formatMoney(quoteResult?.promoDiscount || 0)}
              </span>
            </div>
            {quoteResult?.text && (
              <p className="my-1.5 flex items-start gap-1.5 rounded-lg border border-border/60 bg-muted/50 p-2.5 text-[11px] text-muted-foreground">
                <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span>{quoteResult.text}</span>
              </p>
            )}
          </>
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

      {/* Tax Section */}
      <SummaryTaxSection
        hstRate={hstRate}
        setHstRate={setHstRate}
        taxCents={total - afterDiscount}
        hstBaseCents={hstBaseCents}
        materialExemptionCents={materialExemptionCents}
        isReadOnly={isReadOnly}
        idPrefix="promo"
      />

      {/* Total & Deposit Schedule */}
      <SummaryDepositSchedule
        totalCents={total}
        firstPaymentCents={firstPayment}
        secondPaymentCents={secondPayment}
      />
    </>
  )
}
