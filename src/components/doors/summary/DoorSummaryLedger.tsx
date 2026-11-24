"use client"

import React from "react"
import { DoorLineItem, DoorQuoteTotals } from "@/lib/doors/types"
import { formatDoorItemHeading } from "@/lib/doors/calculations"
import { DoorSummaryEditableRow } from "./DoorSummaryEditableRow"
import { UnifiedTaxAndDeposit } from "@/components/shared/summary/UnifiedTaxAndDeposit"

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
  winJC, winJCDescription, winCustomMaterialsList, suGlass, combinedLabour, customLabour,
  defaultDoorLabour, winLabour, suLabour, setCustomLabour, combinedMisc,
  customMisc, defaultDoorMisc, winMisc, suMisc, setCustomMisc,
  customDiscount = "", setCustomDiscount, defaultDoorDiscount = 0,
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

      {hasAttachedWindow && winCustomMaterialsList && winCustomMaterialsList.length > 0 &&
        winCustomMaterialsList.map((mat: any, idx: number) => {
          const amt = Number(mat.amount) || 0
          if (amt <= 0 && !mat.label) return null
          return (
            <div key={mat.id || idx} className="flex items-center justify-between text-xs sm:text-sm">
              <span className="truncate font-medium text-foreground">
                {mat.label ? `Window Add-on: ${mat.label}` : "Window Additional Material"}
              </span>
              <span className="font-mono font-semibold text-foreground">+${amt.toFixed(2)}</span>
            </div>
          )
        })
      }

      {hasAttachedSU && (
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="truncate font-medium text-foreground">{attachedSUSentence}</span>
          <span className="font-mono font-semibold text-foreground">+${suGlass.toFixed(2)}</span>
        </div>
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

      {(totals.discountTotal > 0 || customDiscount !== "" || setCustomDiscount) && (
        <DoorSummaryEditableRow
          field="discount"
          label={customDiscount !== "" ? "Discount" : totals.discountLabel || "Door Discount"}
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
            Window Discount ({attachedWindowQuote?.promoName || attachedWindowQuote?.quoteResult?.promoName || "Window Promo"})
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            -${winDiscount.toFixed(2)}
          </span>
        </div>
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
