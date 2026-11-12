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

      {hasAttachedWindow && (
        <div className="flex items-center justify-between text-xs">
          <span className="truncate text-muted-foreground">
            {attachedWinSentence}
          </span>
          <span className="font-mono font-medium">+${winBase.toFixed(2)}</span>
        </div>
      )}

      {hasAttachedWindow && winJC > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="truncate text-muted-foreground">
            {winJCDescription}
          </span>
          <span className="font-mono font-medium">+${winJC.toFixed(2)}</span>
        </div>
      )}

      {hasAttachedSU && (
        <div className="flex items-center justify-between text-xs">
          <span className="truncate text-muted-foreground">
            {attachedSUSentence}
          </span>
          <span className="font-mono font-medium">+${suGlass.toFixed(2)}</span>
        </div>
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
          suffix={hasAnyAttached ? "(all quotes)" : undefined}
        />
      )}

      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          Surcharge (8% on materials)
        </span>
        <span className="font-mono font-medium">
          ${combinedSurcharge.toFixed(2)}
        </span>
      </div>

      {totals.discountTotal > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
            10% Discount
          </span>
          <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
            -${totals.discountTotal.toFixed(2)}
          </span>
        </div>
      )}

      {winDiscount > 0 && (
        <div className="flex items-center justify-between text-xs">
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

      {totals.hardwareTotal > 0 && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Lockset &amp; Hardware</span>
          <span className="font-mono font-medium">
            ${totals.hardwareTotal.toFixed(2)}
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

      <div className="space-y-2 border-t border-border/40 pt-2">
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <Label className="text-xs font-medium whitespace-nowrap text-muted-foreground">
              Tax Option:
            </Label>
            <Select
              value={String(
                hstRate !== undefined ? hstRate : isFirstNation ? 8 : 13
              )}
              onValueChange={(val) => {
                const num = Number(val)
                if (setHstRate) setHstRate(num)
                onToggleFirstNation(num === 8)
              }}
            >
              <SelectTrigger className="h-7 w-[190px] bg-background/50 text-xs font-medium shadow-none">
                <SelectValue>
                  {(hstRate !== undefined ? hstRate : isFirstNation ? 8 : 13) === 8
                    ? "8% Material Exemption"
                    : (hstRate !== undefined ? hstRate : isFirstNation ? 8 : 13) === 0
                      ? "0% No Tax (Exempt)"
                      : "13% HST (Standard)"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="13">13% HST (Standard)</SelectItem>
                <SelectItem value="8">8% Material Exemption</SelectItem>
                <SelectItem value="0">0% No Tax (Exempt)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(hstRate === 13 || (!hstRate && !isFirstNation)) && (
            <span className="font-mono font-medium">
              +${combinedTax.toFixed(2)}
            </span>
          )}
          {hstRate === 0 && (
            <span className="font-mono text-muted-foreground">$0.00</span>
          )}
        </div>

        {(isFirstNation || hstRate === 8) && (
          <div className="space-y-1 rounded-md border border-border/50 bg-muted/40 p-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span>13% HST (on all):</span>
              <span className="font-mono font-medium text-foreground">
                +$
                {(
                  totals.hstBase ??
                  combinedTax + (totals.materialExemption || 0)
                ).toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between font-medium text-emerald-500">
              <span>8% Tax Rebate (Material Exemption):</span>
              <span className="font-mono">
                -${(totals.materialExemption || 0).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="pt-2">
        <div className="mb-2.5 flex items-baseline justify-between">
          <span className="text-base font-bold text-foreground">
            Total incl. HST
          </span>
          <span className="shrink-0 font-mono text-2xl font-black tracking-tight whitespace-nowrap text-primary">
            ${displayGrandTotal.toFixed(2)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-border/60 bg-muted/60 p-2.5 text-center sm:text-left">
            <div className="mb-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              First 50%
            </div>
            <div className="font-mono text-base font-bold whitespace-nowrap text-primary">
              ${firstPayment.toFixed(2)}
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/60 p-2.5 text-center sm:text-left">
            <div className="mb-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Final 50%
            </div>
            <div className="font-mono text-base font-bold whitespace-nowrap text-primary">
              ${secondPayment.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
