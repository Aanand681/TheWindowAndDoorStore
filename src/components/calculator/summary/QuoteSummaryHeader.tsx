import React from "react"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator, Wrench, PackageCheck, Scale } from "lucide-react"
import { cn } from "@/lib/utils"

export interface QuoteSummaryHeaderProps {
  quoteResult?: { promoName?: string; promoDiscount?: number } | null
  quoteNumber?: string
  customerName?: string
  isSupplyOnly?: boolean
  setIsSupplyOnly?: (val: boolean) => void
  isReadOnly?: boolean
  onOpenCompare?: () => void
}

export function QuoteSummaryHeader({
  quoteResult,
  quoteNumber,
  customerName,
  isSupplyOnly = false,
  setIsSupplyOnly,
  isReadOnly = false,
  onOpenCompare,
}: QuoteSummaryHeaderProps) {
  return (
    <CardHeader className="border-b border-border/50 p-3.5 pb-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <CardTitle className="flex items-center gap-1.5 truncate text-base font-bold">
            <Calculator className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">Promo Summary</span>
          </CardTitle>
          <div className="mt-0.5 flex min-w-0 items-center gap-1.5">
            {quoteResult?.promoName && (quoteResult.promoDiscount || 0) > 0 ? (
              <span className="py-0.2 truncate rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                {quoteResult.promoName}
              </span>
            ) : (
              <p className="truncate text-[11px] leading-tight text-muted-foreground">
                {quoteNumber
                  ? `Quote #${quoteNumber}`
                  : "Window Calculation Summary"}{" "}
                {customerName ? `• ${customerName}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls: Segmented Toggle + Compare Popout */}
        <div className="flex shrink-0 items-center gap-1.5">
          {setIsSupplyOnly && (
            <div
              className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5"
              title={isReadOnly ? "Toggle disabled in review mode" : undefined}
            >
              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => setIsSupplyOnly(false)}
                className={cn(
                  "flex cursor-pointer items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold transition-all",
                  !isSupplyOnly
                    ? "bg-black text-white shadow-xs dark:bg-white dark:text-black"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Wrench className="h-3 w-3" />
                <span>Install</span>
              </button>
              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => setIsSupplyOnly(true)}
                className={cn(
                  "flex cursor-pointer items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold transition-all",
                  isSupplyOnly
                    ? "bg-black text-white shadow-xs dark:bg-white dark:text-black"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <PackageCheck className="h-3 w-3" />
                <span>Supply</span>
              </button>
            </div>
          )}

          {onOpenCompare && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenCompare}
              className="h-6.5 cursor-pointer gap-1 border-primary/30 px-2 text-[11px] font-bold text-primary shadow-xs hover:bg-primary/10"
              title="Compare Supply vs Installation"
            >
              <Scale className="h-3 w-3" />
              <span>Compare</span>
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
  )
}
