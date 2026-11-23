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
import { formatDollars } from "@/lib/promo-logic"

export interface UnifiedTaxAndDepositProps {
  hstRate: number
  setHstRate?: (rate: number) => void
  onToggleFirstNation?: (isFN: boolean) => void
  taxAmount?: number
  taxCents?: number
  hstBase?: number
  hstBaseCents?: number
  materialExemption?: number
  materialExemptionCents?: number
  total?: number
  totalCents?: number
  firstPayment?: number
  firstPaymentCents?: number
  secondPayment?: number
  secondPaymentCents?: number
  isService?: boolean
  isReadOnly?: boolean
  idPrefix?: string
}

export function UnifiedTaxAndDeposit({
  hstRate,
  setHstRate,
  onToggleFirstNation,
  taxAmount,
  taxCents,
  hstBase,
  hstBaseCents,
  materialExemption,
  materialExemptionCents,
  total,
  totalCents,
  firstPayment,
  firstPaymentCents,
  secondPayment,
  secondPaymentCents,
  isService = false,
  isReadOnly = false,
  idPrefix = "unified",
}: UnifiedTaxAndDepositProps) {
  const resolvedTax = taxAmount !== undefined ? taxAmount : (taxCents || 0) / 100
  const resolvedTotal = total !== undefined ? total : (totalCents || 0) / 100
  const resolvedFirstPayment = firstPayment !== undefined ? firstPayment : (firstPaymentCents || 0) / 100
  const resolvedSecondPayment = secondPayment !== undefined ? secondPayment : (secondPaymentCents || 0) / 100
  const resolvedExemption = materialExemption !== undefined ? materialExemption : (materialExemptionCents || 0) / 100
  const resolvedHstBase =
    hstBase !== undefined
      ? hstBase
      : hstBaseCents !== undefined
        ? hstBaseCents / 100
        : hstRate === 8
          ? resolvedTax + resolvedExemption
          : resolvedTax

  const selectId = `${idPrefix}HstRateSelect`

  const handleRateChange = (val: string | null) => {
    if (val === null) return
    const num = Number(val)
    if (setHstRate) setHstRate(num)
    if (onToggleFirstNation) onToggleFirstNation(num === 8)
  }

  return (
    <div className="space-y-2 border-t border-border/50 pt-2 text-xs sm:text-sm">
      {/* Tax Option Dropdown */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Label
            htmlFor={selectId}
            className="text-xs font-medium whitespace-nowrap text-muted-foreground"
          >
            Tax Option:
          </Label>
          <Select
            disabled={isReadOnly || isService}
            value={String(isService ? 13 : hstRate)}
            onValueChange={handleRateChange}
          >
            <SelectTrigger
              id={selectId}
              disabled={isReadOnly || isService}
              className="h-7 w-[190px] bg-background/50 text-xs font-medium shadow-none"
            >
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
            +{formatDollars(resolvedTax)}
          </span>
        )}
        {hstRate === 0 && !isService && (
          <span className="shrink-0 font-mono font-semibold whitespace-nowrap text-muted-foreground">
            $0.00
          </span>
        )}
      </div>

      {/* 8% First Nations Material Exemption Details */}
      {hstRate === 8 && !isService && (
        <div className="space-y-1 rounded-md border border-border/50 bg-muted/40 p-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>13% HST (on all):</span>
            <span className="font-mono font-medium text-foreground">
              +{formatDollars(resolvedHstBase)}
            </span>
          </div>
          <div className="flex items-center justify-between font-medium text-emerald-500">
            <span>8% Tax Rebate (Material Exemption):</span>
            <span className="font-mono">
              -{formatDollars(resolvedExemption)}
            </span>
          </div>
        </div>
      )}

      {/* Total & Deposit Schedule */}
      <div className="pt-2">
        <div className="mb-2.5 flex items-baseline justify-between">
          <span className="text-base font-bold text-foreground">Total incl. HST</span>
          <span className="shrink-0 font-mono text-2xl font-black tracking-tight whitespace-nowrap text-primary">
            {formatDollars(resolvedTotal)}
          </span>
        </div>

        <div className="mb-1 text-[11px] font-semibold text-muted-foreground">
          Deposit Schedule (50 / 50)
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl border border-border/60 bg-muted/60 p-2.5 text-center sm:text-left">
            <div className="mb-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              First 50%
            </div>
            <div className="font-mono text-sm font-bold whitespace-nowrap text-primary sm:text-base">
              {formatDollars(resolvedFirstPayment)}
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-muted/60 p-2.5 text-center sm:text-left">
            <div className="mb-0.5 text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
              Final 50%
            </div>
            <div className="font-mono text-sm font-bold whitespace-nowrap text-primary sm:text-base">
              {formatDollars(resolvedSecondPayment)}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
