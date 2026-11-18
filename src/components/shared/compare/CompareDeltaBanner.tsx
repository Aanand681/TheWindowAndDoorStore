"use client"

import React from "react"
import { CheckCircle2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface CompareDeltaBannerProps {
  currentMode: "supply" | "install"
  hasSupplyJC?: boolean
  extraPriceSubtotal: number
  extraPriceTotalWithTax?: number
  installSubtotal: number
  supplySubtotal: number
  isOptionAttached: boolean
  onToggleAttach: () => void
}

export function CompareDeltaBanner({
  currentMode,
  hasSupplyJC,
  extraPriceSubtotal,
  extraPriceTotalWithTax: _extraPriceTotalWithTax,
  installSubtotal,
  supplySubtotal,
  isOptionAttached,
  onToggleAttach,
}: CompareDeltaBannerProps) {
  return (
    <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs sm:flex-row">
      <div className="space-y-0.5 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-bold text-emerald-600 sm:justify-start dark:text-emerald-400">
          {currentMode === "install" ? (
            <>
              <span>
                {hasSupplyJC
                  ? "Savings with J&C for Supply Only:"
                  : "Savings for Supply Only (Self-Installation):"}
              </span>
              <span className="font-mono text-base font-extrabold text-sky-600 dark:text-sky-400">
                -${extraPriceSubtotal.toFixed(2)}
              </span>
            </>
          ) : (
            <>
              <span>Extra Price for Installation:</span>
              <span className="font-mono text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                +${extraPriceSubtotal.toFixed(2)}
              </span>
            </>
          )}
        </div>
        <div className="text-[11px] text-muted-foreground">
          Install Subtotal (${installSubtotal.toFixed(2)}) − Supply Subtotal ($
          {supplySubtotal.toFixed(2)})
        </div>
      </div>

      <Button
        type="button"
        variant={isOptionAttached ? "default" : "outline"}
        size="sm"
        onClick={onToggleAttach}
        className="h-8 shrink-0 cursor-pointer gap-1.5 text-xs font-semibold shadow-xs"
      >
        {isOptionAttached ? (
          <>
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>
              {currentMode === "install"
                ? hasSupplyJC
                  ? "Supply with J&C Option Attached"
                  : "Supply Option Attached to PDF"
                : "Install Option Attached to PDF"}
            </span>
          </>
        ) : (
          <>
            <Plus className="h-3.5 w-3.5" />
            <span>
              {currentMode === "install"
                ? hasSupplyJC
                  ? "Attach Supply with J&C Option (Less)"
                  : "Attach Supply Option to PDF (Less)"
                : "Attach Install Option to PDF (Add)"}
            </span>
          </>
        )}
      </Button>
    </div>
  )
}

