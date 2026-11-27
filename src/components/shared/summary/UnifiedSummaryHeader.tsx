"use client"

import React from "react"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wrench, PackageCheck, Scale } from "lucide-react"
import { cn } from "@/lib/utils"

export type SummaryModeOption = "installation" | "supply_only" | "service_only"

export interface UnifiedSummaryHeaderProps {
  title?: string
  mode: SummaryModeOption
  onModeChange?: (mode: SummaryModeOption) => void
  showModeToggle?: boolean
  showServiceOption?: boolean
  isService?: boolean
  onOpenCompare?: () => void
  isReadOnly?: boolean
}

/**
 * Unified single-row summary card header shared across Window, Door, and Sealed Unit calculators.
 */
export function UnifiedSummaryHeader({
  title = "Summary",
  mode,
  onModeChange,
  showModeToggle = true,
  showServiceOption = false,
  isService = false,
  onOpenCompare,
  isReadOnly = false,
}: UnifiedSummaryHeaderProps) {
  const modeButtonClass = (active: boolean) =>
    cn(
      "flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold transition-all",
      isReadOnly ? "cursor-not-allowed opacity-60" : "cursor-pointer",
      active
        ? "bg-black text-white shadow-xs dark:bg-white dark:text-black"
        : "text-muted-foreground hover:text-foreground"
    )

  return (
    <CardHeader className="min-w-0 border-b border-border/50 p-3.5 pb-2.5">
      <div className="flex min-w-0 w-full flex-wrap items-center justify-between gap-2">
        <CardTitle className="shrink-0 text-base font-bold text-foreground">
          {title}
        </CardTitle>

        <div className="flex max-w-full flex-wrap items-center gap-1.5">
          {showModeToggle && onModeChange ? (
            <div
              className="inline-flex max-w-full flex-wrap rounded-lg border border-border bg-muted/50 p-0.5"
              title={isReadOnly ? "Toggle disabled in review mode" : undefined}
            >
              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => onModeChange("installation")}
                className={modeButtonClass(mode === "installation")}
              >
                <Wrench className="h-3 w-3" />
                <span>Install</span>
              </button>
              <button
                type="button"
                disabled={isReadOnly}
                onClick={() => onModeChange("supply_only")}
                className={modeButtonClass(mode === "supply_only")}
              >
                <PackageCheck className="h-3 w-3" />
                <span>Supply</span>
              </button>
              {showServiceOption && (
                <button
                  type="button"
                  disabled={isReadOnly}
                  onClick={() => onModeChange("service_only")}
                  className={modeButtonClass(mode === "service_only")}
                >
                  <Wrench className="h-3 w-3" />
                  <span>Service</span>
                </button>
              )}
            </div>
          ) : (
            isService && (
              <span className="flex h-6.5 items-center rounded-lg border border-border/80 bg-muted/60 px-2 text-[11px] font-semibold text-foreground shadow-xs">
                Service Only
              </span>
            )
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
