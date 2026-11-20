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

export interface SealedUnitSummaryTaxSectionProps {
  isService: boolean
  hstRate: number
  setHstRate: (rate: number) => void
  combinedTax: number
  totals: any
}

export function SealedUnitSummaryTaxSection({
  isService,
  hstRate,
  setHstRate,
  combinedTax,
  totals,
}: SealedUnitSummaryTaxSectionProps) {
  return (
    <div className="space-y-2 border-b border-border/50 pt-1 pb-2.5">
      <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <Label className="text-xs font-medium whitespace-nowrap text-muted-foreground">
            Tax Option:
          </Label>
          <Select
            disabled={isService}
            value={String(isService ? 13 : hstRate)}
            onValueChange={(val) => setHstRate(Number(val))}
          >
            <SelectTrigger className="h-7 w-[190px] bg-background/50 text-xs font-medium shadow-none">
              <SelectValue>
                {isService
                  ? "13% HST (Service Rate)"
                  : hstRate === 8
                    ? "8% Material Exemption"
                    : hstRate === 0
                      ? "0% No Tax (Exempt)"
                      : "13% HST (Standard)"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="13">
                {isService ? "13% HST (Service Rate)" : "13% HST (Standard)"}
              </SelectItem>
              {!isService && (
                <>
                  <SelectItem value="8">8% Material Exemption</SelectItem>
                  <SelectItem value="0">0% No Tax (Exempt)</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {(hstRate === 13 || isService) && (
          <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-foreground">
            +${combinedTax.toFixed(2)}
          </span>
        )}
        {hstRate === 0 && !isService && (
          <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-muted-foreground">
            $0.00
          </span>
        )}
      </div>

      {!isService && hstRate === 8 && (
        <div className="space-y-1 rounded-md border border-border/50 bg-muted/40 p-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>13% HST (on all):</span>
            <span className="font-mono font-medium text-foreground">
              +${(totals.hstBase ?? combinedTax + (totals.materialExemption || 0)).toFixed(2)}
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
  )
}
