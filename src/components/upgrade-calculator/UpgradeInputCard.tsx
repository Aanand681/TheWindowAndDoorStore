"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calculator, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface UpgradeInputCardProps {
  subtotalInput: string
  setSubtotalInput: (val: string) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  setPreset: (amount: number) => void
  hstRate: number
  setHstRate: (rate: number) => void
}

export function UpgradeInputCard({
  subtotalInput,
  setSubtotalInput,
  inputRef,
  setPreset,
  hstRate,
  setHstRate,
}: UpgradeInputCardProps) {
  return (
    <div className="space-y-5">
      <Card className="overflow-hidden rounded-2xl border-border/80 bg-card/60 shadow-xl backdrop-blur-xl">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-bold">
            <Calculator className="h-4 w-4 text-primary" />
            <span>Job Subtotal Amount</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Enter the pre-tax quote subtotal after promo discounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-5">
          {/* Big Currency Input */}
          <div className="space-y-1.5">
            <Label
              htmlFor="subtotalInput"
              className="text-xs font-bold tracking-wider text-muted-foreground uppercase"
            >
              Pre-Tax Subtotal ($)
            </Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-lg font-bold text-muted-foreground">
                $
              </div>
              <Input
                id="subtotalInput"
                ref={inputRef}
                type="number"
                step="any"
                min="0"
                value={subtotalInput}
                onChange={(e) => setSubtotalInput(e.target.value)}
                placeholder="e.g. 12500"
                className="h-13 border-border/80 bg-background pl-8 font-mono text-xl font-bold shadow-inner focus-visible:ring-emerald-500 sm:text-2xl"
              />
              {subtotalInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSubtotalInput("")
                    inputRef.current?.focus()
                  }}
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-3 text-xs text-muted-foreground hover:text-foreground"
                  title="Clear input"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
              Quick Sample Amounts
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: "$2.5k (N/A)", amount: 2500 },
                { label: "$4.5k (6%)", amount: 4500 },
                { label: "$8k (8%)", amount: 8000 },
                { label: "$12.5k (8.5%)", amount: 12500 },
                { label: "$18k (9%)", amount: 18000 },
                { label: "$28k (11%)", amount: 28000 },
              ].map((p) => (
                <button
                  key={p.amount}
                  type="button"
                  onClick={() => setPreset(p.amount)}
                  className={cn(
                    "cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors",
                    subtotalInput === String(p.amount)
                      ? "border-primary bg-primary/15 font-bold text-primary shadow-xs"
                      : "border-border/60 bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tax Rate Setting */}
          <div className="flex items-center justify-between border-t border-border/50 pt-3">
            <div className="space-y-0.5">
              <Label className="text-xs font-semibold text-foreground">
                HST / Tax Rate
              </Label>
              <p className="text-[11px] text-muted-foreground">
                For total with tax estimation
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-muted/60 p-1 text-xs">
              {[
                { label: "13% HST", val: 13 },
                { label: "8% FN", val: 8 },
                { label: "0%", val: 0 },
              ].map((r) => (
                <button
                  key={r.val}
                  type="button"
                  onClick={() => setHstRate(r.val)}
                  className={cn(
                    "cursor-pointer rounded-lg px-2.5 py-1 font-semibold transition-all",
                    hstRate === r.val
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Helper Note for Clerk */}
      <div className="space-y-1 rounded-2xl border border-border/70 bg-muted/30 p-3.5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <Info className="h-3.5 w-3.5 text-primary" />
          <span>Clerk Quick Guide</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          Labour Upgrade coverage is an optional 5-year labour warranty offer.
          Quotes under $3,000 do not qualify. It does not alter base quote
          deposits unless explicitly accepted by the customer.
        </p>
      </div>
    </div>
  )
}
