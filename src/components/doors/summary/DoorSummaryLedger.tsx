"use client"

import React from "react"
import { DoorLineItem, DoorQuoteTotals } from "@/lib/doors/types"
import { formatDoorItemHeading } from "@/lib/doors/calculations"
import { EditableLedgerRow } from "@/components/shared/summary/EditableLedgerRow"
import { UnifiedTaxAndDeposit } from "@/components/shared/summary/UnifiedTaxAndDeposit"
import { DiscountLoyaltySelector } from "@/components/shared/discount/DiscountLoyaltySelector"
import { CustomMaterialsSummaryRows } from "@/components/shared/materials"
import { AttachedQuoteDiscountRows } from "@/components/shared/summary/AttachedQuoteDiscountRows"
import {
  AttachedQuoteProductRows,
  AttachedQuoteHardwareAndJCRows,
} from "@/components/shared/summary/AttachedQuoteProductRows"
import type { NormalizedQuoteFinancials } from "@/lib/quotes/quote-financial-normalizer"

export interface DoorSummaryLedgerProps {
  lineItems: DoorLineItem[]
  totals: DoorQuoteTotals
  isInstallation: boolean
  hasAttachedWindow: boolean
  hasAttachedSU: boolean
  attachedWindowQuote?: any
  attachedSealedUnit?: any
  winNorm?: NormalizedQuoteFinancials | null
  suNorm?: NormalizedQuoteFinancials | null
  attachedWinSentence: string
  attachedSUSentence: string
  winBase: number
  winJC: number
  winJCDescription: string
  winCustomMaterialsList?: any[]
  winCustomMaterials?: number
  suCustomMaterialsList?: any[]
  suCustomMaterials?: number
  suGlass: number
  combinedLabour: number
  customLabour: string
  defaultDoorLabour: number
  winLabour: number
  suLabour: number
  setCustomLabour?: (val: string) => void
  combinedMisc: number
  customMisc: string
  defaultDoorMisc: number
  winMisc: number
  suMisc: number
  setCustomMisc?: (val: string) => void
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
  defaultDoorDiscount?: number
  hasAnyAttached: boolean
  combinedSurcharge: number
  winDiscount: number
  winLoyaltyDiscount?: number
  suDiscount?: number
  suLoyaltyDiscount?: number
  combinedSubtotal: number
  isFirstNation: boolean
  onToggleFirstNation: (val: boolean) => void
  hstRate?: number
  setHstRate?: (val: number) => void
  combinedTax: number
  displayGrandTotal: number
  firstPayment: number
  secondPayment: number
  editingField: "labour" | "misc" | "discount" | null
  setEditingField: (field: "labour" | "misc" | "discount" | null) => void
  tempEditVal: string
  setTempEditVal: (val: string) => void
  isReadOnly?: boolean
  combinedHstBase?: number
  combinedMaterialExemption?: number
}

export function DoorSummaryLedger({
  lineItems, totals, isInstallation, hasAttachedWindow, hasAttachedSU,
  attachedWindowQuote, attachedSealedUnit, winNorm, suNorm,
  attachedWinSentence, attachedSUSentence, winBase,
  winJC, winJCDescription, winCustomMaterialsList,
  winCustomMaterials = 0, suCustomMaterialsList, suCustomMaterials = 0,
  suGlass, combinedLabour, customLabour,
  defaultDoorLabour, winLabour, suLabour, setCustomLabour, combinedMisc,
  customMisc, defaultDoorMisc, winMisc, suMisc, setCustomMisc,
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
  setCustomDiscount,
  defaultDoorDiscount = 0,
  hasAnyAttached, combinedSurcharge, winDiscount, winLoyaltyDiscount = 0,
  suDiscount = 0, suLoyaltyDiscount = 0, combinedSubtotal,
  isFirstNation, onToggleFirstNation, hstRate, setHstRate, combinedTax,
  displayGrandTotal, firstPayment, secondPayment, editingField,
  setEditingField, tempEditVal, setTempEditVal, isReadOnly = false,
  combinedHstBase, combinedMaterialExemption,
}: DoorSummaryLedgerProps) {
  return (
    <>
      <div className="space-y-1.5 border-b border-border/50 pb-2.5">
        {lineItems.length > 0 ? (
          lineItems.map((item, idx) => {
            const qty = item.quantity || 1
            const heading = formatDoorItemHeading(item)
            const itemBaseTotal = item.inksterBasePrice * qty

            return (
              <div
                key={item.id || idx}
                className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm"
              >
                <span className="truncate font-medium text-foreground">
                  {heading}
                </span>
                <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
                  ${itemBaseTotal.toFixed(2)}
                </span>
              </div>
            )
          })
        ) : (
          !hasAnyAttached &&
          !((totals.customMaterialsTotal || 0) > 0) && (
            <div className="flex items-center justify-between gap-3 py-0.5 text-xs sm:text-sm">
              <span className="truncate font-medium text-foreground">Door Units</span>
              <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-muted-foreground">
                $0.00
              </span>
            </div>
          )
        )}

        {/* Attached Window & Sealed Unit Products */}
        <AttachedQuoteProductRows
          hostType="door"
          attachedWindowQuote={hasAttachedWindow ? attachedWindowQuote : null}
          attachedSealedUnit={hasAttachedSU ? attachedSealedUnit : null}
          suNorm={suNorm}
          winSentence={attachedWinSentence}
          winBase={winBase}
          suSentence={attachedSUSentence}
          suGlass={suGlass}
        />

        {/* Hardware & Window Jambs/Casing */}
        <AttachedQuoteHardwareAndJCRows
          hostType="door"
          doorHardwareTotal={totals.hardwareTotal}
          doorHardwareQty={totals.hardwareQty}
          attachedWindowQuote={hasAttachedWindow ? attachedWindowQuote : null}
          winJC={winJC}
          winJCDescription={winJCDescription}
        />

        {/* Additional Materials (Doors + Attached Windows + Attached Sealed Units) */}
        <CustomMaterialsSummaryRows materials={totals.customMaterials} />
        {hasAttachedWindow && (
          <CustomMaterialsSummaryRows
            materials={winCustomMaterialsList}
            prefix="Window Add-on"
          />
        )}
        {hasAttachedSU && (
          <CustomMaterialsSummaryRows
            materials={suCustomMaterialsList}
            prefix="Glass Add-on"
          />
        )}

        {isInstallation && (
          <EditableLedgerRow
            field="misc"
            label="Miscellaneous"
            amount={combinedMisc}
            customVal={customMisc}
            defaultAmount={defaultDoorMisc + winMisc + suMisc}
            unit="dollars"
            canEdit={isInstallation}
            editingField={editingField}
            setEditingField={setEditingField}
            tempEditVal={tempEditVal}
            setTempEditVal={setTempEditVal}
            setter={setCustomMisc}
            suffix={hasAnyAttached ? "(combined)" : undefined}
            isReadOnly={isReadOnly}
          />
        )}

        {isInstallation && (
          <EditableLedgerRow
            field="labour"
            label="Labour"
            amount={combinedLabour}
            customVal={customLabour}
            defaultAmount={defaultDoorLabour + winLabour + suLabour}
            unit="dollars"
            canEdit={isInstallation}
            editingField={editingField}
            setEditingField={setEditingField}
            tempEditVal={tempEditVal}
            setTempEditVal={setTempEditVal}
            setter={setCustomLabour}
            suffix={hasAnyAttached ? "(combined)" : undefined}
            isReadOnly={isReadOnly}
          />
        )}

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

        {/* Layer 1: Base Door Discount */}
        {(totals.discountTotal > 0 || customDiscount !== "") && (
          <EditableLedgerRow
            field="discount"
            label={customDiscountLabel || (customDiscount !== "" ? "Door Discount (custom)" : totals.discountLabel || "Door Discount")}
            amount={totals.discountTotal}
            customVal={customDiscount}
            defaultAmount={defaultDoorDiscount}
            unit="dollars"
            canEdit={true}
            editingField={editingField}
            setEditingField={setEditingField}
            tempEditVal={tempEditVal}
            setTempEditVal={setTempEditVal}
            setter={setCustomDiscount}
            isReadOnly={isReadOnly}
          />
        )}

        <AttachedQuoteDiscountRows
          hostType="door"
          winNorm={winNorm}
          suNorm={suNorm}
          winDiscount={winDiscount}
          winLoyaltyDiscount={winLoyaltyDiscount}
          suDiscount={suDiscount}
          suLoyaltyDiscount={suLoyaltyDiscount}
          attachedWindowQuote={attachedWindowQuote}
          attachedSealedUnit={attachedSealedUnit}
        />

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
            combinedMaterials={Number(
              (totals.rawDoorBaseTotal || 0) +
                (totals.stormDoorTotal || 0) +
                (totals.hardwareTotal || 0) +
                (totals.customMaterialsTotal || 0) +
                (winBase || 0) +
                (winJC || 0) +
                (winCustomMaterials || 0) +
                (suGlass || 0) +
                (suCustomMaterials || 0)
            )}
            otherDiscounts={
              (totals.discountTotal || 0) +
              (winDiscount || 0) +
              (winLoyaltyDiscount || 0) +
              (suDiscount || 0) +
              (suLoyaltyDiscount || 0)
            }
            hstRate={hstRate ?? (isFirstNation ? 8 : 13)}
            isFirstNation={isFirstNation}
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
        hstRate={hstRate !== undefined ? hstRate : isFirstNation ? 8 : 13}
        setHstRate={setHstRate}
        onToggleFirstNation={setHstRate ? undefined : onToggleFirstNation}
        taxAmount={combinedTax}
        hstBase={combinedHstBase ?? totals.hstBase}
        materialExemption={combinedMaterialExemption ?? totals.materialExemption}
        total={displayGrandTotal}
        firstPayment={firstPayment}
        secondPayment={secondPayment}
        isReadOnly={isReadOnly}
        idPrefix="door"
      />
    </>
  )
}
