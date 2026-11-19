"use client"

import React from "react"
import { Sparkles, DoorOpen, AppWindow, Layers } from "lucide-react"

export type StudioProductType = "window" | "door"

export interface StudioScopeBarProps {
  productType: StudioProductType
  onProductTypeChange: (type: StudioProductType) => void
  detectedType: "window" | "door" | "mixed" | "unknown" | null
  windowCount?: number
  doorCount?: number
}

export function StudioScopeBar({
  productType,
  onProductTypeChange,
  detectedType,
  windowCount = 0,
  doorCount = 0,
}: StudioScopeBarProps) {
  return (
    <div className="flex flex-col justify-between gap-3 rounded-xl border border-border bg-card/60 p-2.5 shadow-sm backdrop-blur-md sm:flex-row sm:items-center">
      <div className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/60 p-1">
        <button
          type="button"
          onClick={() => onProductTypeChange("window")}
          className={`flex cursor-pointer items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
            productType === "window"
              ? "bg-background text-foreground shadow-sm ring-1 ring-border"
              : "text-muted-foreground hover:bg-background/40 hover:text-foreground"
          }`}
        >
          <AppWindow className="h-4 w-4 text-primary" />
          <span>Windows</span>
          {windowCount > 0 && (
            <span className="rounded-full bg-primary/15 px-1.5 py-0.2 font-mono text-[10px] font-bold text-primary">
              {windowCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => onProductTypeChange("door")}
          className={`flex cursor-pointer items-center gap-2 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-all sm:text-sm ${
            productType === "door"
              ? "bg-background text-foreground shadow-sm ring-1 ring-border"
              : "text-muted-foreground hover:bg-background/40 hover:text-foreground"
          }`}
        >
          <DoorOpen className="h-4 w-4 text-emerald-500" />
          <span>Doors</span>
          {doorCount > 0 && (
            <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              {doorCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2">
        {windowCount > 0 && doorCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            <Layers className="h-3 w-3" />
            <span>Combined Ready</span>
          </span>
        )}

        {detectedType && detectedType !== "unknown" && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
            <Sparkles className="h-3 w-3 animate-pulse text-primary" />
            <span>
              Auto-detected:{" "}
              {detectedType === "door"
                ? "Door Quote"
                : detectedType === "window"
                  ? "Window Quote"
                  : "Mixed Quote"}
            </span>
          </span>
        )}
      </div>
    </div>
  )
}
