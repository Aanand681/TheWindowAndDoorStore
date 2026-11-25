"use client"

import React from "react"
import { SealedUnitLineItem } from "@/lib/sealed-units-logic"
import {
  formatSealedUnitSummarySentence,
  getSealedUnitServiceSummaryLabel,
} from "@/lib/sealed-units-logic"
import { formatDoorItemHeading } from "@/lib/doors/calculations"
import { SealedUnitSummaryDepositAndUpgrades } from "./SealedUnitSummaryDepositAndUpgrades"
import { UnifiedTaxAndDeposit } from "@/components/shared/summary/UnifiedTaxAndDeposit"
import { CustomMaterialsSummaryRows } from "@/components/shared/materials"
import { DiscountLoyaltySelector } from "@/components/shared/discount/DiscountLoyaltySelector"

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
  doorRawBase: number
  doorDiscount: number
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
  winJCDescription, winCustomMaterialsList, doorCustomMaterialsList, winDiscount, doorRawBase,
  doorDiscount, winCustomMaterials = 0, doorCustomMaterials = 0,
  loyaltyDiscount = "", setLoyaltyDiscount, loyaltyDiscountLabel = "", setLoyaltyDiscountLabel,
  discountType = "none", setDiscountType, loyaltyPoints = 0, setLoyaltyPoints,
  loyaltyGrossAmount = 0, setLoyaltyGrossAmount, isReadOnly = false,
  isInstallation, hstRate, setHstRate,
  combinedHstBase, combinedMaterialExemption,
}: SealedUnitSummaryLedgerProps) {
  return (
    <div className="space-y-3 text-xs">
      <div className="space-y-1.5 border-b border-border/50 pb-2.5">
        {isService ? (
          <>
            <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
              <span className="font-medium text-muted-foreground">
                {getSealedUnitServiceSummaryLabel(lineItems, totals.totalSqft)} (Labour)
              </span>
              <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                ${combinedLabour.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
              <span className="font-medium text-muted-foreground">
                Service Materials &amp; Misc ({(totals.totalSqft || 0).toFixed(2)} sq ft @ ${(totals.effectiveMiscRate || labour.miscRatePerSqft || 2.4).toFixed(2)}/sqft)
              </span>
              <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                +${combinedMisc.toFixed(2)}
              </span>
            </div>
            <CustomMaterialsSummaryRows materials={totals.customMaterials} />
          </>
        ) : (
          <>
            {lineItemsCount > 0 && (
              <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
                <span className="truncate font-medium text-foreground capitalize">
                  {formatSealedUnitSummarySentence(lineItems)}
                </span>
                <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                  ${totals.glassBefore8PercentTotal.toFixed(2)}
                </span>
              </div>
            )}

            <CustomMaterialsSummaryRows materials={totals.customMaterials} />

            {hasAttachedWindow && (
              <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
                <span className="truncate font-medium text-foreground">{attachedWinSentence}</span>
                <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                  +${winBase.toFixed(2)}
                </span>
              </div>
            )}

            {hasAttachedWindow && winJC > 0 && (
              <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
                <span className="truncate font-medium text-foreground">{winJCDescription}</span>
                <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                  +${winJC.toFixed(2)}
                </span>
              </div>
            )}

            {hasAttachedWindow && (
              <CustomMaterialsSummaryRows
                materials={winCustomMaterialsList}
                prefix="Window Add-on"
              />
            )}

            {hasAttachedDoor &&
              (attachedDoorQuote?.lineItems && attachedDoorQuote.lineItems.length > 0 ? (
                attachedDoorQuote.lineItems.map((dItem: any, dIdx: number) => (
                  <div key={dItem.id || dIdx} className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
                    <span className="truncate font-medium text-foreground">{formatDoorItemHeading(dItem)}</span>
                    <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                      +${((dItem.inksterBasePrice || 0) * (dItem.quantity || 1)).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
                  <span className="truncate font-medium text-foreground">{attachedDoorSentence}</span>
                  <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">+${doorRawBase.toFixed(2)}</span>
                </div>
              ))}

            {hasAttachedDoor && Boolean(attachedDoorQuote?.totals?.hardwareTotal > 0) && (
              <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
                <span className="truncate font-medium text-foreground">Door Lockset &amp; Hardware</span>
                <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                  +${Number(attachedDoorQuote.totals.hardwareTotal).toFixed(2)}
                </span>
              </div>
            )}

            {hasAttachedDoor && (
              <CustomMaterialsSummaryRows
                materials={doorCustomMaterialsList}
                prefix="Door Add-on"
              />
            )}

            {(isInstallation || hasAnyAttached) && (
              <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
                <span className="font-medium text-foreground">
                  Miscellaneous {hasAnyAttached ? "(combined)" : ""}
                </span>
                <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                  +${combinedMisc.toFixed(2)}
                </span>
              </div>
            )}

            {(isInstallation || hasAnyAttached) && (
              <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
                <span className="font-medium text-foreground">
                  Labour {hasAnyAttached ? "(combined)" : ""}
                </span>
                <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                  +${combinedLabour.toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between py-0.5 text-xs sm:text-sm">
              <span className="font-medium text-foreground">Surcharge (8% on materials)</span>
              <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                +${combinedSurcharge.toFixed(2)}
              </span>
            </div>

            {winDiscount > 0 && (
              <div className="flex items-center justify-between py-0.5 text-xs font-medium text-emerald-600 sm:text-sm dark:text-emerald-400">
                <span>
                  {attachedWindowQuote?.discountLabel
                    ? `Window Discount (${attachedWindowQuote.discountLabel})`
                    : `Window Discount (${attachedWindowQuote?.promoName || attachedWindowQuote?.quoteResult?.promoName || "Window Promo"})`}
                </span>
                <span className="shrink-0 font-mono whitespace-nowrap">-${winDiscount.toFixed(2)}</span>
              </div>
            )}

            {doorDiscount > 0 && (
              <div className="flex items-center justify-between py-0.5 text-xs font-medium text-emerald-600 sm:text-sm dark:text-emerald-400">
                <span>
                  {attachedDoorQuote?.discountLabel || "Door Discount"}{" "}
                  <span className="text-[10px] text-muted-foreground/70">
                    (attached door)
                  </span>
                </span>
                <span className="shrink-0 font-mono whitespace-nowrap">-${doorDiscount.toFixed(2)}</span>
              </div>
            )}
          </>
        )}

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
                (winCustomMaterials || 0) +
                (doorRawBase || 0) +
                (doorCustomMaterials || 0)
            )}
            otherDiscounts={(winDiscount || 0) + (doorDiscount || 0)}
            hstRate={hstRate}
            isFirstNation={hstRate === 8}
            isReadOnly={isReadOnly}
          />
        )}
      </div>

      <div className="border-b border-border/50 pb-2.5 text-xs sm:text-sm">
        <div className="flex items-center justify-between font-medium">
          <span className="font-bold text-foreground">
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
        idPrefix="sealedUnit"
      />

      <SealedUnitSummaryDepositAndUpgrades
        hasAttachedDoor={hasAttachedDoor}
        hasAttachedWindow={hasAttachedWindow}
        attachedDoorQuote={attachedDoorQuote}
        attachedWindowQuote={attachedWindowQuote}
      />
    </div>
  )
}
