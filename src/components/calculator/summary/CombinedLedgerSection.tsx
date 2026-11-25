"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { formatMoney, toCents } from "@/lib/promo-logic"
import { formatDoorItemHeading } from "@/lib/doors/calculations"
import { UnifiedTaxAndDeposit } from "@/components/shared/summary/UnifiedTaxAndDeposit"
import { DiscountLoyaltySelector } from "@/components/shared/discount/DiscountLoyaltySelector"
import { CustomMaterialsSummaryRows } from "@/components/shared/materials"

export interface CombinedLedgerSectionProps {
  combinedData: any
  summaryWindowGroups: any[]
  attachedDoorQuote: any | null
  attachedSealedUnit?: any | null
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
  hstRate: number
  setHstRate: (val: number) => void
  isReadOnly?: boolean
}

export function CombinedLedgerSection({
  combinedData,
  summaryWindowGroups,
  attachedDoorQuote,
  attachedSealedUnit,
  taxTotals,
  renderEditableRow,
  jcSummaryLabel,
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
  hstRate,
  setHstRate,
  isReadOnly = false,
}: CombinedLedgerSectionProps) {
  return (
    <>
      <div className="space-y-1.5 border-b border-border/50 pb-2.5">
        {/* Window glass configurations */}
        {summaryWindowGroups.length > 0
          ? summaryWindowGroups.map((g) => (
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
          : combinedData.windowBaseCents > 0 && (
              <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
                <span className="font-medium text-foreground">
                  Window base price
                </span>
                <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                  {formatMoney(combinedData.windowBaseCents)}
                </span>
              </div>
            )}

        {/* Sealed unit glass price */}
        {combinedData.hasSU && (
          <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
            <span
              className={cn(
                "truncate font-medium",
                combinedData.isAttachedSUService
                  ? "text-blue-700 dark:text-blue-400"
                  : "text-foreground"
              )}
            >
              {combinedData.suSummarySentence}
            </span>
            <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
              {combinedData.isAttachedSUService &&
              combinedData.suGlassCents === 0
                ? "$0.00 (Labour below)"
                : `+${formatMoney(combinedData.suGlassCents)}`}
            </span>
          </div>
        )}

        {/* Door units materials price (Itemized as headings) */}
        {combinedData.hasDoor &&
          (() => {
            const items = attachedDoorQuote?.lineItems || []
            const hasItemPrices = items.some((dItem: any) =>
              Boolean(
                dItem.inksterBasePrice ||
                dItem.finalUnitPrice ||
                dItem.unitPrice ||
                dItem.basePrice ||
                dItem.lineTotal
              )
            )

            if (items.length > 0 && hasItemPrices) {
              return items.map((dItem: any, dIdx: number) => {
                const q = Math.max(1, Number(dItem.quantity) || 1)
                const heading = formatDoorItemHeading(dItem)
                const rawPrice = Number(
                  dItem.inksterBasePrice ??
                  dItem.finalUnitPrice ??
                  dItem.unitPrice ??
                  dItem.basePrice ??
                  (dItem.lineTotal ? dItem.lineTotal / q : 0)
                )
                const itemBaseCents = Math.round(rawPrice * q * 100)
                return (
                  <div
                    key={dItem.id || dIdx}
                    className="flex items-center justify-between py-0.5 text-xs sm:text-sm"
                  >
                    <span className="truncate font-medium text-foreground">
                      {heading}
                    </span>
                    <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                      +{formatMoney(itemBaseCents)}
                    </span>
                  </div>
                )
              })
            }

            return (
              <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
                <span className="truncate font-medium text-foreground">
                  {combinedData.doorSummarySentence}
                </span>
                <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                  +{formatMoney(combinedData.doorMaterialsCents)}
                </span>
              </div>
            )
          })()}

        {/* Attached Door Hardware if any */}
        {combinedData.hasDoor &&
          Boolean((attachedDoorQuote?.totals?.hardwareTotal || 0) > 0) && (
            <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
              <span className="truncate font-medium text-foreground">
                Door Lockset &amp; Hardware
              </span>
              <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                +
                {formatMoney(
                  Math.round(
                    Number(attachedDoorQuote.totals.hardwareTotal) * 100
                  )
                )}
              </span>
            </div>
          )}

        {/* Jambs & Casing (Window only) */}
        {(!isSupplyOnly || combinedData.effectiveJCCents > 0) &&
          renderEditableRow(
            "jc",
            jcSummaryLabel,
            combinedData.effectiveJCCents,
            customJC,
            taxJC,
            (val) => setCustomJC(val),
            "(window only)"
          )}

        {/* Additional Materials (Windows + Attached Doors + Attached Sealed Units) */}
        <CustomMaterialsSummaryRows materials={taxTotals?.customMaterials} />
        <CustomMaterialsSummaryRows
          materials={
            attachedDoorQuote?.totals?.customMaterialsList ||
            attachedDoorQuote?.totals?.customMaterials ||
            attachedDoorQuote?.customMaterials
          }
          prefix="Door Add-on"
        />
        <CustomMaterialsSummaryRows
          materials={
            attachedSealedUnit?.totals?.customMaterialsList ||
            attachedSealedUnit?.totals?.customMaterials ||
            attachedSealedUnit?.customMaterials
          }
          prefix="Glass Add-on"
        />

        {/* Misc (Window + Attached) - Hidden on Supply Only */}
        {!isSupplyOnly &&
          (() => {
            const attMisc = combinedData.combinedMiscCents - (customMisc !== "" ? toCents(customMisc) : taxMisc)
            return renderEditableRow(
              "misc", "Miscellaneous", combinedData.combinedMiscCents, customMisc, taxMisc + attMisc,
              (val) => {
                if (!val) { setCustomMisc(""); return }
                setCustomMisc((Math.max(0, toCents(val) - attMisc) / 100).toFixed(2))
              },
              "(combined)"
            )
          })()}

        {/* Labour (Window + Attached) - Hidden on Supply Only (placed after Misc) */}
        {!isSupplyOnly &&
          (() => {
            const attLab = combinedData.combinedLabourCents - (customLabour !== "" ? toCents(customLabour) : taxLabour)
            return renderEditableRow(
              "labour", "Labour", combinedData.combinedLabourCents, customLabour, taxLabour + attLab,
              (val) => {
                if (!val) { setCustomLabour(""); return }
                setCustomLabour((Math.max(0, toCents(val) - attLab) / 100).toFixed(2))
              },
              "(combined)"
            )
          })()}

        {/* Surcharge (Window + Attached 8% - placed below Labour and above Discounts) */}
        <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
          <span className="font-medium text-foreground">
            Surcharge{" "}
            <span className="text-[10px] text-muted-foreground/80">
              (8% on materials)
            </span>
          </span>
          <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
            +{formatMoney(combinedData.combinedSurchargeCents)}
          </span>
        </div>

        {/* Layer 1: Base Window Promo Discount */}
        {(combinedData.windowDiscountCents > 0 || customDiscount !== "") && (
          renderEditableRow(
            "discount",
            customDiscountLabel || (customDiscount !== "" ? "Window Discount (custom)" : "Window Promo Discount"),
            customDiscount !== ""
              ? Math.round((parseFloat(customDiscount) || 0) * 100)
              : combinedData.windowDiscountCents,
            customDiscount,
            combinedData.windowDiscountCents,
            (val) => setCustomDiscount?.(val)
          )
        )}

        {/* Door Discount (Attached Door Promo) */}
        {combinedData.doorDiscountCents > 0 && (
          <div className="flex items-center justify-between py-0.5 text-xs font-medium text-emerald-600 sm:text-sm dark:text-emerald-400">
            <span>
              {attachedDoorQuote?.discountLabel || "Door Discount"}{" "}
              <span className="text-[10px] text-muted-foreground/70">
                (attached door)
              </span>
            </span>
            <span className="shrink-0 font-mono whitespace-nowrap">
              -{formatMoney(combinedData.doorDiscountCents)}
            </span>
          </div>
        )}

        {/* Layer 2: Loyalty Points / Additional Discount (ON TOP OF BOTH) */}
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
            combinedMaterials={combinedMaterials ?? (combinedData.windowBase + combinedData.suGlass + combinedData.doorMaterials)}
            otherDiscounts={(customDiscount !== "" ? parseFloat(customDiscount) || 0 : combinedData.windowDiscountCents / 100) + (combinedData.doorDiscountCents / 100)}
            hstRate={hstRate}
            isFirstNation={hstRate === 8}
            isReadOnly={isReadOnly}
          />
        )}
      </div>

      {/* Subtotal */}
      <div className="border-b border-border/50 pb-2.5 text-xs sm:text-sm">
        <div className="flex items-center justify-between font-medium">
          <span className="text-foreground">Combined Subtotal</span>
          <span className="shrink-0 font-mono font-bold whitespace-nowrap text-primary">
            {formatMoney(combinedData.combinedSubtotalCents)}
          </span>
        </div>
      </div>

      {/* Tax Section & Deposit Schedule */}
      <UnifiedTaxAndDeposit
        hstRate={hstRate}
        setHstRate={setHstRate}
        taxCents={combinedData.combinedTaxCents}
        hstBaseCents={combinedData.combinedHstBaseCents}
        materialExemptionCents={combinedData.combinedMaterialExemptionCents}
        totalCents={combinedData.combinedTotalCents}
        firstPaymentCents={combinedData.combinedFirstPayment}
        secondPaymentCents={combinedData.combinedSecondPayment}
        isReadOnly={isReadOnly}
        idPrefix="promoCombined"
      />
    </>
  )
}
