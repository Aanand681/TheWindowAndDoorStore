"use client"

import React from "react"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PackageCheck, Wrench, Scale } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SealedUnitSummaryHeaderProps {
  quoteNumber: string
  customerName: string
  mode?: "installation" | "supply_only" | "service_only"
  onModeChange?: (mode: "installation" | "supply_only" | "service_only") => void
  isService: boolean
  onOpenCompare?: () => void
  isReadOnly?: boolean
}

export function SealedUnitSummaryHeader({
  quoteNumber,
  customerName,
  mode,
  onModeChange,
  isService,
  onOpenCompare,
  isReadOnly = false,
}: SealedUnitSummaryHeaderProps) {
  const headingText = `Quote #${quoteNumber || "------"}${customerName ? ` • ${customerName}` : ""}`

  return (
    <CardHeader className="min-w-0 border-b border-border/50 p-3.5 pb-2.5">
      <div className="flex min-w-0 w-full flex-col gap-2">
        <div className="min-w-0 w-full">
          <CardTitle
            className="min-w-0 truncate text-sm font-bold text-foreground sm:text-base"
            title={headingText}
            suppressHydrationWarning
          >
            {headingText}
          </CardTitle>
        </div>

        <div className="flex max-w-full flex-wrap items-center gap-1.5">
          {onModeChange ? (
            <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => onModeChange("installation")}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold transition-all",
                  isReadOnly ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                  mode === "installation"
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
                onClick={() => onModeChange("supply_only")}
                className={cn(
                  "flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold transition-all",
                  isReadOnly ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                  mode === "supply_only"
                    ? "bg-black text-white shadow-xs dark:bg-white dark:text-black"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <PackageCheck className="h-3 w-3" />
                <span>Supply</span>
              </button>
              <button
                type="button"
                onClick={() => onModeChange("service_only")}
                className={cn(
                  "flex cursor-pointer items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold transition-all",
                  mode === "service_only"
                    ? "bg-black text-white shadow-xs dark:bg-white dark:text-black"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Wrench className="h-3 w-3" />
                <span>Service</span>
              </button>
            </div>
          ) : (
            isService && (
              <span className="flex h-6.5 items-center rounded-lg border border-border/80 bg-muted/60 px-2 text-[11px] font-semibold text-foreground shadow-xs">
                Service Only
              </span>
            )
          )}

          {onOpenCompare && !isService && (
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
