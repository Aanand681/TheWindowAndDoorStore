import React from "react"
import { cn } from "@/lib/utils"
import { formatMoney, toCents } from "@/lib/promo-logic"
import { UIWindowItem } from "@/hooks/useCalculatorWindows"

interface ComparisonDiffTableProps {
  currentWindows: UIWindowItem[]
  effectiveOptionBWindows: UIWindowItem[] | null
}

export function ComparisonDiffTable({
  currentWindows,
  effectiveOptionBWindows,
}: ComparisonDiffTableProps) {
  if (!effectiveOptionBWindows || effectiveOptionBWindows.length === 0)
    return null

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/10 shadow-xs">
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-2.5">
        <span className="text-xs font-bold tracking-wider text-foreground uppercase">
          Window-by-Window Configuration Diff ({effectiveOptionBWindows.length}{" "}
          items)
        </span>
        <span className="text-[11px] text-muted-foreground">
          Comparison between Option A &amp; Option B line items
        </span>
      </div>
      <div className="max-h-56 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="sticky top-0 bg-muted/60 text-[10px] tracking-wider text-muted-foreground uppercase">
            <tr>
              <th className="p-2.5">#</th>
              <th className="p-2.5">Qty</th>
              <th className="p-2.5">Dimensions</th>
              <th className="p-2.5">Option A Specs</th>
              <th className="p-2.5">Option B Specs</th>
              <th className="p-2.5 text-right">Base Diff (&Delta;)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {effectiveOptionBWindows.map((wb, idx) => {
              const wa = currentWindows[idx]
              const isTripleA =
                wa && (Number(wa.triple) > 0 || toCents(wa.triple) > 0)
              const isTripleB = Number(wb.triple) > 0 || toCents(wb.triple) > 0
              const isPaintedA = wa && wa.color?.toLowerCase() === "painted"
              const isPaintedB = wb.color?.toLowerCase() === "painted"

              const baseA = wa ? toCents(wa.base) : 0
              const baseB = toCents(wb.base)
              const diffBase = baseB - baseA

              const specDiff =
                isTripleB !== isTripleA || isPaintedB !== isPaintedA

              return (
                <tr
                  key={wb.id || idx}
                  className={cn(
                    "transition-colors hover:bg-muted/40",
                    specDiff && "bg-amber-500/5"
                  )}
                >
                  <td className="p-2.5 font-bold text-muted-foreground">
                    {idx + 1}
                  </td>
                  <td className="p-2.5 font-semibold text-foreground">
                    {wb.qty || "1"}
                  </td>
                  <td className="p-2.5 text-muted-foreground">
                    {wb.w && wb.h ? `${wb.w}″ × ${wb.h}″` : "—"}
                  </td>
                  <td className="p-2.5 text-muted-foreground">
                    {wa ? (
                      <span>
                        {isTripleA ? "Triple Pane" : "Dual Pane"} •{" "}
                        {wa.color || "White"}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">
                        New line item
                      </span>
                    )}
                  </td>
                  <td className="p-2.5 font-semibold text-foreground">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1",
                        specDiff &&
                          "font-bold text-amber-600 dark:text-amber-400"
                      )}
                    >
                      {isTripleB ? "Triple Pane" : "Dual Pane"} •{" "}
                      {wb.color || "White"}
                    </span>
                  </td>
                  <td className="p-2.5 text-right font-bold">
                    {diffBase !== 0 ? (
                      <span
                        className={
                          diffBase > 0
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-emerald-600 dark:text-emerald-400"
                        }
                      >
                        {diffBase > 0 ? "+" : ""}
                        {formatMoney(diffBase)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
