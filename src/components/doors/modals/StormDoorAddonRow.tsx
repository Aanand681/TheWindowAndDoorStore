"use client"

import React from "react"
import { Sparkles } from "lucide-react"
import { StormDoorAddonOption } from "@/lib/doors/storm-door-types"

export interface StormDoorAddonRowProps {
  addon: StormDoorAddonOption
  isSelected: boolean
  currentMode: "included" | "option"
  onToggle: () => void
  onSetMode?: (mode: "included" | "option") => void
}

export function StormDoorAddonRow({
  addon,
  isSelected,
  currentMode,
  onToggle,
  onSetMode,
}: StormDoorAddonRowProps) {
  return (
    <div
      className={`flex flex-col gap-1.5 rounded-lg border p-2 text-xs transition-colors ${
        isSelected ? "border-primary/50 bg-primary/5" : "border-border/70 hover:bg-muted/30"
      }`}
    >
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer font-medium">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            className="h-4 w-4 rounded border-gray-300 text-primary"
          />
          <span>{addon.label}</span>
        </label>
        <span className="font-mono font-bold text-primary">
          +${addon.price.toFixed(2)}
        </span>
      </div>

      {isSelected && onSetMode && (
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-border/40">
          <span className="text-[10px] text-muted-foreground">Mode:</span>
          <button
            type="button"
            onClick={() => onSetMode("included")}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
              currentMode === "included"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            Included in Door
          </button>
          <button
            type="button"
            onClick={() => onSetMode("option")}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1 ${
              currentMode === "option"
                ? "bg-amber-500 text-white border-amber-600"
                : "bg-muted/50 border-border text-muted-foreground hover:bg-muted"
            }`}
          >
            <Sparkles className="h-2.5 w-2.5" />
            Offer as Quote Option
          </button>
        </div>
      )}
    </div>
  )
}
