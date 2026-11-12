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
import { formatMoney } from "@/lib/promo-logic"

export interface SummaryTaxSectionProps {
  hstRate: number
  setHstRate: (val: number) => void
  taxCents: number
  hstBaseCents?: number
  materialExemptionCents?: number
  isReadOnly?: boolean
  idPrefix?: string
}

export function SummaryTaxSection({
  hstRate,
  setHstRate,
  taxCents,
  hstBaseCents,
  materialExemptionCents,
  isReadOnly = false,
  idPrefix = "promo",
}: SummaryTaxSectionProps) {
  const selectId = `${idPrefix}HstRateSelect`

  const resolvedHstBase =
    hstBaseCents !== undefined
      ? hstBaseCents
      : hstRate === 8
        ? taxCents + (materialExemptionCents || 0)
        : taxCents

  return (
    <div className="space-y-2 border-b border-border/50 pt-1 pb-2.5">
      <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <Label
            htmlFor={selectId}
            className="text-xs font-medium whitespace-nowrap text-muted-foreground"
          >
            Tax Option:
          </Label>
          <Select
            disabled={isReadOnly}
            value={String(hstRate)}
            onValueChange={(val) => setHstRate(Number(val))}
          >
            <SelectTrigger
              id={selectId}
              className="h-7 w-[190px] bg-background/50 text-xs font-medium shadow-none"
            >
              <SelectValue>
                {hstRate === 8
                  ? "8% Material Exemption"
                  : hstRate === 0
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

        {hstRate === 13 && (
          <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
            +{formatMoney(taxCents)}
          </span>
        )}
        {hstRate === 0 && (
          <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-muted-foreground">
            $0.00
          </span>
        )}
      </div>

      {hstRate === 8 && (
        <div className="space-y-1 rounded-md border border-border/50 bg-muted/40 p-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>13% HST (on all):</span>
            <span className="font-mono font-medium text-foreground">
              +{formatMoney(resolvedHstBase)}
            </span>
          </div>
          <div className="flex items-center justify-between font-medium text-emerald-500">
            <span>8% Tax Rebate (Material Exemption):</span>
            <span className="font-mono">
              -{formatMoney(materialExemptionCents || 0)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
