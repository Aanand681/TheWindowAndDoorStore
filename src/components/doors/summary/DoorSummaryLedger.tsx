"use client"

import React from "react"
import { DoorLineItem, DoorQuoteTotals } from "@/lib/doors/types"
import { formatDoorItemHeading } from "@/lib/doors/calculations"
import { DoorSummaryEditableRow } from "./DoorSummaryEditableRow"
import { UnifiedTaxAndDeposit } from "@/components/shared/summary/UnifiedTaxAndDeposit"
import { DiscountLoyaltySelector } from "@/components/shared/discount/DiscountLoyaltySelector"
import { CustomMaterialsSummaryRows } from "@/components/shared/materials"

export interface DoorSummaryLedgerProps {
  lineItems: DoorLineItem[]
  totals: DoorQuoteTotals
  isInstallation: boolean
  hasAttachedWindow: boolean
  hasAttachedSU: boolean
  attachedWindowQuote?: any
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
  attachedWindowQuote, attachedWinSentence, attachedSUSentence, winBase,
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
  hasAnyAttached, combinedSurcharge, winDiscount, combinedSubtotal,
  isFirstNation, onToggleFirstNation, hstRate, setHstRate, combinedTax,
  displayGrandTotal, firstPayment, secondPayment, editingField,
  setEditingField, tempEditVal, setTempEditVal, isReadOnly = false,
  combinedHstBase, combinedMaterialExemption,
}: DoorSummaryLedgerProps) {
  return (
    <div className="space-y-2 text-xs sm:text-sm">
      {lineItems.length > 0 ? (
        lineItems.map((item, idx) => {
          const qty = item.quantity || 1
          const heading = formatDoorItemHeading(item)
          const itemBaseTotal = item.inksterBasePrice * qty

          return (
            <div
              key={item.id || idx}
              className="flex items-center justify-between gap-2 py-0.5 text-xs sm:text-sm"
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
        <div className="flex items-center justify-between gap-2 py-0.5 text-xs sm:text-sm">
          <span className="truncate font-medium text-foreground">Door Units</span>
          <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-muted-foreground">
            $0.00
          </span>
        </div>
      )}

      {totals.hardwareTotal > 0 && (
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="font-medium text-foreground">
            {totals.hardwareQty && totals.hardwareQty > 0
              ? `${totals.hardwareQty} Door Locksets & Hardware`
              : "Door Lockset & Hardware"}
          </span>
          <span className="font-mono font-semibold text-foreground">
            +${totals.hardwareTotal.toFixed(2)}
          </span>
        </div>
      )}

      {/* Door Custom / Additional Materials */}
      <CustomMaterialsSummaryRows materials={totals.customMaterials} />

      {hasAttachedWindow && (
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="truncate font-medium text-foreground">{attachedWinSentence}</span>
          <span className="font-mono font-semibold text-foreground">+${winBase.toFixed(2)}</span>
        </div>
      )}

      {hasAttachedWindow && winJC > 0 && (
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="truncate font-medium text-foreground">{winJCDescription}</span>
          <span className="font-mono font-semibold text-foreground">+${winJC.toFixed(2)}</span>
        </div>
      )}

      {hasAttachedWindow && (
        <CustomMaterialsSummaryRows
          materials={winCustomMaterialsList}
          prefix="Window Add-on"
        />
      )}

      {hasAttachedSU && (
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="truncate font-medium text-foreground">{attachedSUSentence}</span>
          <span className="font-mono font-semibold text-foreground">+${suGlass.toFixed(2)}</span>
        </div>
      )}

      {hasAttachedSU && (
        <CustomMaterialsSummaryRows
          materials={suCustomMaterialsList}
          prefix="Glass Add-on"
        />
      )}

      {isInstallation && (
        <DoorSummaryEditableRow
          field="misc"
          label="Miscellaneous"
          amount={combinedMisc}
          customVal={customMisc}
          defaultAmount={defaultDoorMisc + winMisc + suMisc}
          isInstallation={isInstallation}
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
        <DoorSummaryEditableRow
          field="labour"
          label="Labour"
          amount={combinedLabour}
          customVal={customLabour}
          defaultAmount={defaultDoorLabour + winLabour + suLabour}
          isInstallation={isInstallation}
          editingField={editingField}
          setEditingField={setEditingField}
          tempEditVal={tempEditVal}
          setTempEditVal={setTempEditVal}
          setter={setCustomLabour}
          suffix={hasAnyAttached ? "(combined)" : undefined}
          isReadOnly={isReadOnly}
        />
      )}

      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="font-medium text-foreground">Surcharge (8% on materials)</span>
        <span className="font-mono font-semibold text-foreground">+${combinedSurcharge.toFixed(2)}</span>
      </div>

      {/* Layer 1: Base Door Discount */}
      {(totals.discountTotal > 0 || customDiscount !== "") && (
        <DoorSummaryEditableRow
          field="discount"
          label={customDiscountLabel || (customDiscount !== "" ? "Door Discount (custom)" : totals.discountLabel || "Door Discount")}
          amount={totals.discountTotal}
          customVal={customDiscount}
          defaultAmount={defaultDoorDiscount}
          isInstallation={true}
          editingField={editingField}
          setEditingField={setEditingField}
          tempEditVal={tempEditVal}
          setTempEditVal={setTempEditVal}
          setter={setCustomDiscount}
          isReadOnly={isReadOnly}
        />
      )}

      {winDiscount > 0 && (
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            {attachedWindowQuote?.discountLabel
              ? `Window Discount (${attachedWindowQuote.discountLabel})`
              : `Window Discount (${attachedWindowQuote?.promoName || attachedWindowQuote?.quoteResult?.promoName || "Window Promo"})`}
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            -${winDiscount.toFixed(2)}
          </span>
        </div>
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
          combinedMaterials={Number(
            (totals.rawDoorBaseTotal || 0) +
              (totals.stormDoorTotal || 0) +
              (totals.hardwareTotal || 0) +
              (totals.customMaterialsTotal || 0) +
              (winBase || 0) +
              (winCustomMaterials || 0) +
              (suGlass || 0) +
              (suCustomMaterials || 0)
          )}
          otherDiscounts={(totals.discountTotal || 0) + (winDiscount || 0)}
          hstRate={hstRate ?? (isFirstNation ? 8 : 13)}
          isFirstNation={isFirstNation}
          isReadOnly={isReadOnly}
        />
      )}

      <div className="border-t border-border/60 pt-1" />

      <div className="flex items-center justify-between text-sm font-semibold">
        <span>{hasAnyAttached ? "Combined Subtotal" : "Subtotal"}</span>
        <span className="font-mono text-base font-bold text-foreground">
          ${combinedSubtotal.toFixed(2)}
        </span>
      </div>

      <UnifiedTaxAndDeposit
        hstRate={hstRate !== undefined ? hstRate : isFirstNation ? 8 : 13}
        setHstRate={setHstRate}
        onToggleFirstNation={onToggleFirstNation}
        taxAmount={combinedTax}
        hstBase={combinedHstBase ?? totals.hstBase}
        materialExemption={combinedMaterialExemption ?? totals.materialExemption}
        total={displayGrandTotal}
        firstPayment={firstPayment}
        secondPayment={secondPayment}
        isReadOnly={isReadOnly}
        idPrefix="door"
      />
    </div>
  )
}
