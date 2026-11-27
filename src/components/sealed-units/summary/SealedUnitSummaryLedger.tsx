"use client"

import React from "react"
import { SealedUnitLineItem } from "@/lib/sealed-units-logic"
import {
  formatSealedUnitSummarySentence,
  getSealedUnitServiceSummaryLabel,
} from "@/lib/sealed-units-logic"
import { UnifiedTaxAndDeposit } from "@/components/shared/summary/UnifiedTaxAndDeposit"
import { CustomMaterialsSummaryRows } from "@/components/shared/materials"
import { DiscountLoyaltySelector } from "@/components/shared/discount/DiscountLoyaltySelector"
import { AttachedQuoteDiscountRows } from "@/components/shared/summary/AttachedQuoteDiscountRows"
import {
  AttachedQuoteProductRows,
  AttachedQuoteHardwareAndJCRows,
} from "@/components/shared/summary/AttachedQuoteProductRows"
import type { NormalizedQuoteFinancials } from "@/lib/quotes/quote-financial-normalizer"

export interface SealedUnitSummaryLedgerProps {
  isService: boolean
  lineItems: SealedUnitLineItem[]
  lineItemsCount: number
  totals: any
  labour: any
  combinedLabour: number
  combinedMisc: number
  combinedSurcharge: number
  combinedSubtotal: number
  combinedTax: number
  displayGrandTotal: number
  firstPayment: number
  secondPayment: number
  hasAttachedWindow: boolean
  hasAttachedDoor: boolean
  hasAnyAttached: boolean
  attachedWindowQuote?: any
  attachedDoorQuote?: any
  attachedWinSentence: string
  attachedDoorSentence: string
  winBase: number
  winJC: number
  winJCDescription: string
  winCustomMaterialsList?: any[]
  doorCustomMaterialsList?: any[]
  winDiscount: number
  winLoyaltyDiscount?: number
  doorRawBase: number
  doorDiscount: number
  doorLoyaltyDiscount?: number
  winNorm?: NormalizedQuoteFinancials | null
  doorNorm?: NormalizedQuoteFinancials | null
  winCustomMaterials?: number
  doorCustomMaterials?: number
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
  isReadOnly?: boolean
  isInstallation: boolean
  hstRate: number
  setHstRate?: (rate: number) => void
  combinedHstBase?: number
  combinedMaterialExemption?: number
}

export function SealedUnitSummaryLedger({
  isService, lineItems, lineItemsCount, totals, labour, combinedLabour,
  combinedMisc, combinedSurcharge, combinedSubtotal, combinedTax,
  displayGrandTotal, firstPayment, secondPayment, hasAttachedWindow,
  hasAttachedDoor, hasAnyAttached, attachedWindowQuote, attachedDoorQuote,
  attachedWinSentence, attachedDoorSentence, winBase, winJC,
  winJCDescription, winCustomMaterialsList, doorCustomMaterialsList, winDiscount, winLoyaltyDiscount = 0, doorRawBase,
  doorDiscount, doorLoyaltyDiscount = 0, winNorm, doorNorm, winCustomMaterials = 0, doorCustomMaterials = 0,
  loyaltyDiscount = "", setLoyaltyDiscount, loyaltyDiscountLabel = "", setLoyaltyDiscountLabel,
  discountType = "none", setDiscountType, loyaltyPoints = 0, setLoyaltyPoints,
  loyaltyGrossAmount = 0, setLoyaltyGrossAmount, isReadOnly = false,
  isInstallation, hstRate, setHstRate,
  combinedHstBase, combinedMaterialExemption,
}: SealedUnitSummaryLedgerProps) {
  const serviceSummaryLabel = isService
    ? getSealedUnitServiceSummaryLabel(lineItems, totals.totalSqft)
    : ""

  return (
    <>
      <div className="space-y-1.5 border-b border-border/50 pb-2.5">
        {/* Host Sealed Unit Glass or Service scope line */}
        {!isService && lineItemsCount > 0 && (
          <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
            <span className="truncate font-medium text-foreground capitalize">
              {formatSealedUnitSummarySentence(lineItems)}
            </span>
            <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
              ${totals.glassBefore8PercentTotal.toFixed(2)}
            </span>
          </div>
        )}

        {isService && hasAnyAttached && (
          <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
            <span className="truncate font-medium text-blue-700 dark:text-blue-400">
              {serviceSummaryLabel} (Service)
            </span>
            <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
              $0.00 (Labour below)
            </span>
          </div>
        )}

        {/* Attached Window & Door Products */}
        <AttachedQuoteProductRows
          hostType="sealed_unit"
          attachedWindowQuote={hasAttachedWindow ? attachedWindowQuote : null}
          attachedDoorQuote={hasAttachedDoor ? attachedDoorQuote : null}
          winSentence={attachedWinSentence}
          winBase={winBase}
          doorSentence={attachedDoorSentence}
          doorFallbackBase={doorRawBase}
        />

        {/* Hardware & Window Jambs/Casing */}
        <AttachedQuoteHardwareAndJCRows
          hostType="sealed_unit"
          attachedDoorQuote={hasAttachedDoor ? attachedDoorQuote : null}
          attachedWindowQuote={hasAttachedWindow ? attachedWindowQuote : null}
          winJC={winJC}
          winJCDescription={winJCDescription}
        />

        {/* Additional Materials (Sealed Units + Attached Windows + Attached Doors) */}
        <CustomMaterialsSummaryRows materials={totals.customMaterials} />
        {hasAttachedWindow && (
          <CustomMaterialsSummaryRows
            materials={winCustomMaterialsList}
            prefix="Window Add-on"
          />
        )}
        {hasAttachedDoor && (
          <CustomMaterialsSummaryRows
            materials={doorCustomMaterialsList}
            prefix="Door Add-on"
          />
        )}

        {/* Misc (Installation or Service - Hidden on Supply Only even when attached) */}
        {(isService || isInstallation) && (
          <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
            <span className="truncate font-medium text-foreground">
              {isService ? (
                <>
                  Service Materials &amp; Misc{" "}
                  <span className="text-[10px] text-muted-foreground/80">
                    ({(totals.totalSqft || 0).toFixed(2)} sq ft @ $
                    {(totals.effectiveMiscRate || labour.miscRatePerSqft || 2.4).toFixed(2)}
                    /sqft{hasAnyAttached ? ", combined" : ""})
                  </span>
                </>
              ) : (
                <>
                  Miscellaneous{" "}
                  {hasAnyAttached && (
                    <span className="text-[10px] text-muted-foreground/80">
                      (combined)
                    </span>
                  )}
                </>
              )}
            </span>
            <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
              +${combinedMisc.toFixed(2)}
            </span>
          </div>
        )}

        {/* Labour (Installation or Service - Hidden on Supply Only even when attached) */}
        {(isService || isInstallation) && (
          <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
            <span className="truncate font-medium text-foreground">
              {isService ? `${serviceSummaryLabel} (Labour)` : "Labour"}{" "}
              {hasAnyAttached && (
                <span className="text-[10px] text-muted-foreground/80">
                  (combined)
                </span>
              )}
            </span>
            <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
              {isService && !hasAnyAttached && !(Array.isArray(totals.customMaterials) && totals.customMaterials.length > 0)
                ? `$${combinedLabour.toFixed(2)}`
                : `+$${combinedLabour.toFixed(2)}`}
            </span>
          </div>
        )}

        {/* Surcharge */}
        {(!isService || combinedSurcharge > 0) && (
          <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
            <span className="font-medium text-foreground">
              Surcharge{" "}
              <span className="text-[10px] text-muted-foreground/80">
                (8% on materials)
              </span>
            </span>
            <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
              +${combinedSurcharge.toFixed(2)}
            </span>
          </div>
        )}

        <AttachedQuoteDiscountRows
          hostType="sealed_unit"
          winNorm={winNorm}
          doorNorm={doorNorm}
          winDiscount={winDiscount}
          winLoyaltyDiscount={winLoyaltyDiscount}
          doorDiscount={doorDiscount}
          doorLoyaltyDiscount={doorLoyaltyDiscount}
          attachedWindowQuote={attachedWindowQuote}
          attachedDoorQuote={attachedDoorQuote}
        />

        {/* Loyalty Points / Custom Extra Discount (Works across Install, Supply & Service) */}
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
            combinedMaterials={Number(
              (isService ? 0 : totals.glassBefore8PercentTotal || 0) +
                (totals.customMaterialsTotal || 0) +
                (winBase || 0) +
                (winJC || 0) +
                (winCustomMaterials || 0) +
                (doorRawBase || 0) +
                (doorCustomMaterials || 0)
            )}
            otherDiscounts={
              (winDiscount || 0) +
              (winLoyaltyDiscount || 0) +
              (doorDiscount || 0) +
              (doorLoyaltyDiscount || 0)
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
            {hasAnyAttached ? "Combined Subtotal" : "Subtotal"}
          </span>
          <span className="shrink-0 font-mono font-bold whitespace-nowrap text-primary">
            ${combinedSubtotal.toFixed(2)}
          </span>
        </div>
      </div>

      <UnifiedTaxAndDeposit
        isService={isService}
        hstRate={hstRate}
        setHstRate={setHstRate}
        taxAmount={combinedTax}
        hstBase={combinedHstBase ?? totals.hstBase}
        materialExemption={combinedMaterialExemption ?? totals.materialExemption}
        total={displayGrandTotal}
        firstPayment={firstPayment}
        secondPayment={secondPayment}
        isReadOnly={isReadOnly}
        idPrefix="sealedUnit"
      />
    </>
  )
}
