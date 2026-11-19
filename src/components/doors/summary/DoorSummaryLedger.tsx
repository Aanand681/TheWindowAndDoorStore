"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DoorLineItem, DoorQuoteTotals } from "@/lib/doors/types"
import { formatDoorItemHeading } from "@/lib/doors/calculations"
import { cn } from "@/lib/utils"
import { DoorSummaryEditableRow } from "./DoorSummaryEditableRow"
import { DoorSummaryTaxAndTotal } from "./DoorSummaryTaxAndTotal"

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
  editingField: "labour" | "misc" | null
  setEditingField: (field: "labour" | "misc" | null) => void
  tempEditVal: string
  setTempEditVal: (val: string) => void
  isReadOnly?: boolean
}

export function DoorSummaryLedger({
  lineItems,
  totals,
  isInstallation,
  hasAttachedWindow,
  hasAttachedSU,
  attachedWindowQuote,
  attachedWinSentence,
  attachedSUSentence,
  winBase,
  winJC,
  winJCDescription,
  suGlass,
  combinedLabour,
  customLabour,
  defaultDoorLabour,
  winLabour,
  suLabour,
  setCustomLabour,
  combinedMisc,
  customMisc,
  defaultDoorMisc,
  winMisc,
  suMisc,
  setCustomMisc,
  hasAnyAttached,
  combinedSurcharge,
  winDiscount,
  combinedSubtotal,
  isFirstNation,
  onToggleFirstNation,
  hstRate,
  setHstRate,
  combinedTax,
  displayGrandTotal,
  firstPayment,
  secondPayment,
  editingField,
  setEditingField,
  tempEditVal,
  setTempEditVal,
  isReadOnly = false,
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
              className="flex items-start justify-between gap-2 border-b border-border/30 pb-1.5"
            >
              <div className="min-w-0">
                <div className="text-xs font-semibold text-foreground sm:text-sm">
                  {heading}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Preset: {item.presetLabel} • $
                  {item.inksterBasePrice.toFixed(2)}/ea
                </div>
              </div>
              <div className="shrink-0 font-mono text-xs font-semibold sm:text-sm">
                ${itemBaseTotal.toFixed(2)}
              </div>
            </div>
          )
        })
      ) : (
        <div className="flex items-start justify-between gap-2 border-b border-border/30 pb-1.5">
          <div className="min-w-0">
            <div className="text-xs font-semibold text-foreground sm:text-sm">
              Door Units
            </div>
            <div className="text-[11px] text-muted-foreground">
              No doors configured yet
            </div>
          </div>
          <div className="shrink-0 font-mono text-xs font-semibold sm:text-sm">
            $0.00
          </div>
        </div>
      )}

      {totals.hardwareTotal > 0 && (
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="font-medium text-foreground">
            {totals.hardwareQty && totals.hardwareQty > 0
              ? `${totals.hardwareQty} Locksets & Deadbolts`
              : "Locksets & Deadbolts"}
          </span>
          <span className="font-mono font-semibold text-foreground">
            +${totals.hardwareTotal.toFixed(2)}
          </span>
        </div>
      )}

      {hasAttachedWindow && (
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="truncate font-medium text-foreground">
            {attachedWinSentence}
          </span>
          <span className="font-mono font-semibold text-foreground">+${winBase.toFixed(2)}</span>
        </div>
      )}

      {hasAttachedWindow && winJC > 0 && (
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="truncate font-medium text-foreground">
            {winJCDescription}
          </span>
          <span className="font-mono font-semibold text-foreground">+${winJC.toFixed(2)}</span>
        </div>
      )}

      {hasAttachedSU && (
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="truncate font-medium text-foreground">
            {attachedSUSentence}
          </span>
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
          suffix={hasAnyAttached ? "(all quotes)" : undefined}
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
          suffix={hasAnyAttached ? "(all quotes)" : undefined}
          isReadOnly={isReadOnly}
        />
      )}

      <div className="flex items-center justify-between text-xs sm:text-sm">
        <span className="font-medium text-foreground">
          Surcharge (8% on materials)
        </span>
        <span className="font-mono font-semibold text-foreground">
          +${combinedSurcharge.toFixed(2)}
        </span>
      </div>

      {totals.discountTotal > 0 && (
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            10% Discount
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            -${totals.discountTotal.toFixed(2)}
          </span>
        </div>
      )}

      {winDiscount > 0 && (
        <div className="flex items-center justify-between text-xs sm:text-sm">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            Promo Discount (
            {attachedWindowQuote?.promoName ||
              attachedWindowQuote?.quoteResult?.promoName ||
              "Attached Window Promo"}
            )
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            -${winDiscount.toFixed(2)}
          </span>
        </div>
      )}

      <div className="border-t border-border/60 pt-1" />

      <div className="flex items-center justify-between text-sm font-semibold">
        <span>Subtotal</span>
        <span className="font-mono text-base font-bold text-foreground">
          ${combinedSubtotal.toFixed(2)}
        </span>
      </div>

      <DoorSummaryTaxAndTotal
        totals={totals}
        isFirstNation={isFirstNation}
        onToggleFirstNation={onToggleFirstNation}
        hstRate={hstRate}
        setHstRate={setHstRate}
        combinedTax={combinedTax}
        displayGrandTotal={displayGrandTotal}
        firstPayment={firstPayment}
        secondPayment={secondPayment}
        isReadOnly={isReadOnly}
      />
    </div>
  )
}
