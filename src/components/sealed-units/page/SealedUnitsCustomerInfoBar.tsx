"use client"

import React from "react"
import { User, Hash, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface SealedUnitsCustomerInfoBarProps {
  customerName: string
  setCustomerName: (val: string) => void
  quoteNumber: string
  setQuoteNumber: (val: string) => void
  onRegenerateQuoteNumber: () => void
}

export function SealedUnitsCustomerInfoBar({
  customerName,
  setCustomerName,
  quoteNumber,
  setQuoteNumber,
  onRegenerateQuoteNumber,
}: SealedUnitsCustomerInfoBarProps) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card/70 p-3 shadow-sm backdrop-blur-xl sm:p-3.5">
      <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-12">
        {/* Customer Name */}
        <div className="space-y-1 sm:col-span-7">
          <Label className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            <User className="h-3.5 w-3.5 text-primary" />
            <span>
              Customer Name <span className="text-destructive">*</span>
            </span>
          </Label>
          <Input
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Enter customer name (required)"
            className="h-9 bg-background text-xs font-medium shadow-xs sm:text-sm"
          />
        </div>

        {/* 6-Digit Quote Number */}
        <div className="space-y-1 sm:col-span-5">
          <div className="flex items-center justify-between">
            <Label className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              <Hash className="h-3.5 w-3.5 text-primary" />
              <span>6-Digit Quote Number</span>
            </Label>
            <button
              type="button"
              onClick={onRegenerateQuoteNumber}
              className="flex cursor-pointer items-center gap-1 text-[11px] font-medium text-primary hover:underline"
              title="Generate a fresh unique 6-digit quote number"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Regenerate</span>
            </button>
          </div>
          <div className="relative">
            <Input
              suppressHydrationWarning
              value={quoteNumber}
              onChange={(e) =>
                setQuoteNumber(e.target.value.replace(/\D/g, "").slice(0, 8))
              }
              className="h-9 bg-background pl-8 font-mono text-xs font-bold tracking-wider text-foreground shadow-xs sm:text-sm"
            />
            <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 font-mono text-xs font-bold text-muted-foreground">
              #
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
