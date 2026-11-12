"use client"

import React from "react"
import { DoorQuotingMode } from "@/lib/doors/types"
import { Wrench, PackageCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface DoorScopeSelectorProps {
  mode: DoorQuotingMode
  onModeChange: (mode: DoorQuotingMode) => void
  className?: string
}

export function DoorScopeSelector({
  mode,
  onModeChange,
  className,
}: DoorScopeSelectorProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 rounded-2xl border border-border/60 bg-muted/40 p-1.5",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onModeChange("installation")}
        className={cn(
          "flex cursor-pointer items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium transition-all",
          mode === "installation"
            ? "bg-black text-white shadow-md dark:bg-white dark:text-black"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )}
      >
        <Wrench className="h-4 w-4 shrink-0" />
        <div className="text-left">
          <div className="text-xs font-semibold sm:text-sm">
            Supply &amp; Installation
          </div>
          <div
            className={cn(
              "hidden text-[10px] sm:block",
              mode === "installation"
                ? "text-white/80 dark:text-black/80"
                : "text-muted-foreground"
            )}
          >
            Full door supply, setup fee, install labour &amp; upcharges
          </div>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onModeChange("supply_only")}
        className={cn(
          "flex cursor-pointer items-center justify-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium transition-all",
          mode === "supply_only"
            ? "bg-black text-white shadow-md dark:bg-white dark:text-black"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )}
      >
        <PackageCheck className="h-4 w-4 shrink-0" />
        <div className="text-left">
          <div className="text-xs font-semibold sm:text-sm">Supply Only</div>
          <div
            className={cn(
              "hidden text-[10px] sm:block",
              mode === "supply_only"
                ? "text-white/80 dark:text-black/80"
                : "text-muted-foreground"
            )}
          >
            Doors &amp; hardware only (zero labour or setup fee)
          </div>
        </div>
      </button>
    </div>
  )
}
