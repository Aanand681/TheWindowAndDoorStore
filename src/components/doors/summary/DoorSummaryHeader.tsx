"use client"

import React from "react"
import { CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wrench, PackageCheck, Scale } from "lucide-react"
import { cn } from "@/lib/utils"
import { DoorQuotingMode } from "@/lib/doors/types"

export interface DoorSummaryHeaderProps {
  quoteNumber?: string
  customerName?: string
  mode: DoorQuotingMode
  onModeChange: (mode: DoorQuotingMode) => void
  onOpenCompare?: () => void
}

export function DoorSummaryHeader({
  quoteNumber,
  customerName,
  mode,
  onModeChange,
  onOpenCompare,
}: DoorSummaryHeaderProps) {
  return (
    <CardHeader className="border-b border-border/50 p-3.5 pb-2.5">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-1.5 truncate text-base font-bold">
            <span className="truncate">Door Quote Summary</span>
          </CardTitle>
          <p
            className="mt-0.5 truncate text-[11px] leading-tight text-muted-foreground"
            suppressHydrationWarning
          >
            Itemized summary for Quote #{quoteNumber || "------"}{" "}
            {customerName ? `• ${customerName}` : ""}
          </p>
        </div>

        {/* Action Controls: Segmented Toggle + Compare Button */}
        <div className="flex shrink-0 flex-wrap items-center gap-1.5">
          <div className="inline-flex rounded-lg border border-border bg-muted/50 p-0.5">
            <button
              type="button"
              onClick={() => onModeChange("installation")}
              className={cn(
                "flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
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
              onClick={() => onModeChange("supply_only")}
              className={cn(
                "flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold transition-all",
                mode === "supply_only"
                  ? "bg-black text-white shadow-xs dark:bg-white dark:text-black"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <PackageCheck className="h-3 w-3" />
              <span>Supply</span>
            </button>
          </div>

          {onOpenCompare && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenCompare}
              className="h-7 cursor-pointer gap-1 border-primary/30 px-2.5 text-xs font-bold text-primary shadow-xs hover:bg-primary/10"
              title="Compare Supply vs Installation"
            >
              <Scale className="h-3.5 w-3.5" />
              <span>Compare</span>
            </Button>
          )}
        </div>
      </div>
    </CardHeader>
  )
}
