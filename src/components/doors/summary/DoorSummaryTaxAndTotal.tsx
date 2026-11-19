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
import { DoorQuoteTotals } from "@/lib/doors/types"

export interface DoorSummaryTaxAndTotalProps {
  totals: DoorQuoteTotals
  isFirstNation: boolean
  onToggleFirstNation: (val: boolean) => void
  hstRate?: number
  setHstRate?: (val: number) => void
  combinedTax: number
  displayGrandTotal: number
  firstPayment: number
  secondPayment: number
  isReadOnly?: boolean
}

export function DoorSummaryTaxAndTotal({
  totals,
  isFirstNation,
  onToggleFirstNation,
  hstRate,
  setHstRate,
  combinedTax,
  displayGrandTotal,
  firstPayment,
  secondPayment,
  isReadOnly = false,
}: DoorSummaryTaxAndTotalProps) {
  const effectiveRate = hstRate !== undefined ? hstRate : isFirstNation ? 8 : 13

  return (
    <div className="space-y-2 border-t border-border/50 pt-2 text-xs sm:text-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium whitespace-nowrap text-muted-foreground">
            Tax Option:
          </Label>
          <Select
            value={String(effectiveRate)}
            onValueChange={(val) => {
              const num = Number(val)
              if (setHstRate) setHstRate(num)
              onToggleFirstNation(num === 8)
            }}
          >
            <SelectTrigger
              disabled={isReadOnly}
              className="h-7 w-[190px] bg-background/50 text-xs font-medium shadow-none"
            >
              <SelectValue>
                {effectiveRate === 8
                  ? "8% Material Exemption"
                  : effectiveRate === 0
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

        {effectiveRate === 13 && (
          <span className="font-mono font-medium">+${combinedTax.toFixed(2)}</span>
        )}
        {effectiveRate === 0 && (
          <span className="font-mono text-muted-foreground">$0.00</span>
        )}
      </div>

      {(isFirstNation || effectiveRate === 8) && (
        <div className="space-y-1 rounded-md border border-border/50 bg-muted/40 p-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>13% HST (on all):</span>
            <span className="font-mono font-medium text-foreground">
              +${(totals.hstBase ?? combinedTax + (totals.materialExemption || 0)).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between font-medium text-emerald-500">
            <span>8% Tax Rebate (Material Exemption):</span>
            <span className="font-mono">-${(totals.materialExemption || 0).toFixed(2)}</span>
          </div>
        </div>
      )}

      <div className="pt-2">
        <div className="mb-2.5 flex items-baseline justify-between">
          <span className="text-base font-bold text-foreground">Total incl. HST</span>
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
