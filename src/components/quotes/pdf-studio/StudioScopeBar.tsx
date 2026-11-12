"use client"

import React from "react"
import { Sparkles, DoorOpen, AppWindow } from "lucide-react"

export type StudioProductType = "window" | "door"

interface StudioScopeBarProps {
  productType: StudioProductType
  onProductTypeChange: (type: StudioProductType) => void
  detectedType: "window" | "door" | "mixed" | "unknown" | null
}

export function StudioScopeBar({
  productType,
  onProductTypeChange,
  detectedType,
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
        </button>
      </div>

      <div className="flex items-center gap-2">
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
