"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

export interface OptionCompareColumnProps {
  optionNumber: number
  title: string
  badgeLabel?: string
  icon: LucideIcon
  isActive: boolean
  applyLabel: string
  baseLabel: string
  baseAmount: number
  jcLabel?: string
  jcAmount?: number
  attachedLabel?: string
  attachedAmount?: number
  labourAmount: number
  miscAmount: number
  surchargeAmount?: number
  surchargeLabel?: string
  discountAmount?: number
  discountLabel?: string
  hardwareAmount?: number
  hardwareLabel?: string
  subtotal: number
  hstRate: number
  hstAmount: number
  total: number
  firstPayment: number
  secondPayment: number
  totalColorClass?: string
  buttonVariant?: "default" | "outline" | "secondary"
  onApply: () => void
}

export function OptionCompareColumn({
  optionNumber,
  title,
  badgeLabel,
  icon: Icon,
  isActive,
  applyLabel,
  baseLabel,
  baseAmount,
  jcLabel = "Jambs & Casing",
  jcAmount = 0,
  attachedLabel = "Attached Quote Items",
  attachedAmount = 0,
  labourAmount,
  miscAmount,
  surchargeAmount = 0,
  surchargeLabel = "Surcharge (8% on materials)",
  discountAmount = 0,
  discountLabel = "Discount",
  hardwareAmount = 0,
  hardwareLabel = "Lockset & Hardware",
  subtotal,
  hstRate,
  hstAmount,
  total,
  firstPayment,
  secondPayment,
  totalColorClass = "text-foreground",
  buttonVariant = "outline",
  onApply,
}: OptionCompareColumnProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col justify-between space-y-3 rounded-xl border p-4 transition-all",
        isActive
          ? "border-primary bg-primary/5 ring-1 ring-primary/30"
          : "border-border/80 bg-card/60"
      )}
    >
      <div className="space-y-3">
        {/* Card Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold text-foreground">
              Option {optionNumber}: {title}
            </h3>
          </div>
          {isActive ? (
            <span className="rounded-full border border-primary/20 bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
              Active Mode
            </span>
          ) : badgeLabel ? (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              {badgeLabel}
            </span>
          ) : null}
        </div>

        {/* Ledger Rows matching Summary Card */}
        <div className="space-y-1.5 border-t border-border/40 pt-1 font-mono text-xs text-muted-foreground">
          {/* Base Units */}
          <div className="flex justify-between">
            <span className="max-w-[190px] truncate">{baseLabel}:</span>
            <span className="font-semibold text-foreground">
              ${baseAmount.toFixed(2)}
            </span>
          </div>

          {/* Jambs & Casing (if present) */}
          {jcAmount > 0 && (
            <div className="flex justify-between">
              <span className="max-w-[190px] truncate">{jcLabel}:</span>
              <span className="font-semibold text-foreground">
                +${jcAmount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Attached items (if present) */}
          {attachedAmount > 0 && (
            <div className="flex justify-between">
              <span className="max-w-[190px] truncate">{attachedLabel}:</span>
              <span className="font-semibold text-foreground">
                +${attachedAmount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Labour */}
          <div className="flex justify-between">
            <span>Labour:</span>
            <span
              className={cn(
                labourAmount > 0
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground/60"
              )}
            >
              ${labourAmount.toFixed(2)}
            </span>
          </div>

          {/* Miscellaneous */}
          <div className="flex justify-between">
            <span>Miscellaneous:</span>
            <span
              className={cn(
                miscAmount > 0
                  ? "font-semibold text-foreground"
                  : "text-muted-foreground/60"
              )}
            >
              ${miscAmount.toFixed(2)}
            </span>
          </div>

          {/* Surcharge */}
          {surchargeAmount > 0 && (
            <div className="flex justify-between">
              <span className="max-w-[190px] truncate">{surchargeLabel}:</span>
              <span className="font-semibold text-foreground">
                +${surchargeAmount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Discount */}
          {discountAmount > 0 && (
            <div className="flex justify-between font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="max-w-[190px] truncate">{discountLabel}:</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          {/* Hardware */}
          {hardwareAmount > 0 && (
            <div className="flex justify-between">
              <span className="max-w-[190px] truncate">{hardwareLabel}:</span>
              <span className="font-semibold text-foreground">
                +${hardwareAmount.toFixed(2)}
              </span>
            </div>
          )}

          {/* Pre-Tax Subtotal */}
          <div className="flex justify-between border-t border-border/40 pt-1.5 text-xs font-bold text-foreground sm:text-sm">
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          {/* HST */}
          <div className="flex justify-between text-muted-foreground">
            <span>HST ({hstRate}%):</span>
            <span>${hstAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer: Grand Total, 50% Deposits, and Action Button */}
      <div className="space-y-2.5 border-t border-border/60 pt-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Total incl. HST:
          </span>
          <span
            className={cn(
              "font-mono text-lg font-bold sm:text-xl",
              totalColorClass
            )}
          >
            ${total.toFixed(2)}
          </span>
        </div>

        {/* 50/50 Deposit Schedule */}
        <div className="grid grid-cols-2 gap-2 text-center font-mono text-xs">
          <div className="rounded-lg border border-border/50 bg-muted/50 p-1.5">
            <span className="block text-[10px] font-bold text-muted-foreground uppercase">
              First 50%
            </span>
            <span className="text-xs font-bold text-foreground">
              ${firstPayment.toFixed(2)}
            </span>
          </div>
          <div className="rounded-lg border border-border/50 bg-muted/50 p-1.5">
            <span className="block text-[10px] font-bold text-muted-foreground uppercase">
              Final 50%
            </span>
            <span className="text-xs font-bold text-foreground">
              ${secondPayment.toFixed(2)}
            </span>
          </div>
        </div>

        <Button
          type="button"
          variant={isActive ? "secondary" : buttonVariant}
          size="sm"
          onClick={onApply}
          className="h-8 w-full cursor-pointer gap-1.5 text-xs font-semibold"
        >
          {isActive ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              Currently Applied
            </>
          ) : (
            applyLabel
          )}
        </Button>
      </div>
    </div>
  )
}
