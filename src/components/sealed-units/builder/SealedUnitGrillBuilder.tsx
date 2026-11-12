"use client"

import React from "react"
import { Grid } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  GrillType,
  GrillProfile,
  GrillItemConfig,
  SealedUnitGrillSettings,
} from "@/lib/sealed-units-logic"
import { SealedUnitGridFields } from "./SealedUnitGridFields"

export interface SealedUnitGrillBuilderProps {
  grillType: GrillType
  setGrillType: (g: GrillType) => void
  grillProfile: GrillProfile
  setGrillProfile: (p: GrillProfile) => void
  grillColor: string
  setGrillColor: (c: string) => void
  availableGrillColors: string[]
  grillPatternMode: "pattern" | "manual"
  setGrillPatternMode: (m: "pattern" | "manual") => void
  grillCols: string
  setGrillCols: (c: string) => void
  grillRows: string
  setGrillRows: (r: string) => void
  grillSquares: string
  setGrillSquares: (s: string) => void
  grillTIntersections: string
  setGrillTIntersections: (t: string) => void
  grillBentHubs: string
  setGrillBentHubs: (b: string) => void
  computedGrillConfig: GrillItemConfig
  activeGrillPreview: { rawCost: number; description: string }
  grills: SealedUnitGrillSettings
}

export function SealedUnitGrillBuilder({
  grillType,
  setGrillType,
  grillProfile,
  setGrillProfile,
  grillColor,
  setGrillColor,
  availableGrillColors,
  grillPatternMode,
  setGrillPatternMode,
  grillCols,
  setGrillCols,
  grillRows,
  setGrillRows,
  grillSquares,
  setGrillSquares,
  grillTIntersections,
  setGrillTIntersections,
  grillBentHubs,
  setGrillBentHubs,
  computedGrillConfig,
  activeGrillPreview,
  grills,
}: SealedUnitGrillBuilderProps) {
  return (
    <div className="space-y-2.5 rounded-xl border border-border/70 bg-muted/10 p-2.5">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1 text-[11px] font-bold text-foreground">
          <Grid className="h-3.5 w-3.5 text-primary" />
          <span>Interior Metal Grills</span>
        </Label>
        <span className="font-mono text-[9px] text-muted-foreground">
          Vitro Metal Grid Sheet
        </span>
      </div>

      {/* Grill Type Selector */}
      <div className="grid grid-cols-3 gap-1 text-[11px]">
        <button
          type="button"
          onClick={() => setGrillType("none")}
          className={cn(
            "cursor-pointer rounded-lg border px-2 py-1 text-center font-semibold transition-all",
            grillType === "none"
              ? "border-primary bg-primary/10 font-bold text-primary shadow-xs"
              : "border-border/70 bg-background text-muted-foreground hover:bg-muted"
          )}
        >
          None
        </button>
        <button
          type="button"
          onClick={() => setGrillType("grid")}
          className={cn(
            "cursor-pointer rounded-lg border px-2 py-1 text-center font-semibold transition-all",
            grillType === "grid"
              ? "border-primary bg-primary/10 font-bold text-primary shadow-xs"
              : "border-border/70 bg-background text-muted-foreground hover:bg-muted"
          )}
        >
          Grid Pattern
        </button>
        <button
          type="button"
          onClick={() => setGrillType("3_burst")}
          className={cn(
            "cursor-pointer rounded-lg border px-2 py-1 text-center font-semibold transition-all",
            grillType === "3_burst"
              ? "border-primary bg-primary/10 font-bold text-primary shadow-xs"
              : "border-border/70 bg-background text-muted-foreground hover:bg-muted"
          )}
        >
          3 Burst
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1 text-[11px]">
        <button
          type="button"
          onClick={() => setGrillType("5_burst")}
          className={cn(
            "cursor-pointer rounded-lg border px-2 py-1 text-center font-semibold transition-all",
            grillType === "5_burst"
              ? "border-primary bg-primary/10 font-bold text-primary shadow-xs"
              : "border-border/70 bg-background text-muted-foreground hover:bg-muted"
          )}
        >
          5 Burst
        </button>
        <button
          type="button"
          onClick={() => setGrillType("customer_own")}
          className={cn(
            "cursor-pointer rounded-lg border px-2 py-1 text-center font-semibold transition-all",
            grillType === "customer_own"
              ? "border-primary bg-primary/10 font-bold text-primary shadow-xs"
              : "border-border/70 bg-background text-muted-foreground hover:bg-muted"
          )}
        >
          Customer&apos;s Own ($33)
        </button>
      </div>

      {/* Grid Detail Fields */}
      {grillType === "grid" && (
        <SealedUnitGridFields
          grillProfile={grillProfile}
          setGrillProfile={setGrillProfile}
          grillColor={grillColor}
          setGrillColor={setGrillColor}
          availableGrillColors={availableGrillColors}
          grillPatternMode={grillPatternMode}
          setGrillPatternMode={setGrillPatternMode}
          grillCols={grillCols}
          setGrillCols={setGrillCols}
          grillRows={grillRows}
          setGrillRows={setGrillRows}
          grillSquares={grillSquares}
          setGrillSquares={setGrillSquares}
          grillTIntersections={grillTIntersections}
          setGrillTIntersections={setGrillTIntersections}
          grills={grills}
        />
      )}

      {/* Burst Config */}
      {(grillType === "3_burst" || grillType === "5_burst") && (
        <div className="space-y-2 border-t border-border/40 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <Label className="text-[10px] font-semibold text-muted-foreground">
                Burst Color
              </Label>
              <select
                value={grillColor}
                onChange={(e) => setGrillColor(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-background px-2 text-[11px]"
              >
                <option value="white">White</option>
                <option value="brassPewter">Brass or Pewter</option>
                <option value="brushedChrome">Brushed Chrome</option>
                <option value="black">Black</option>
              </select>
            </div>
            <div className="space-y-0.5">
              <Label className="text-[10px] font-semibold text-muted-foreground">
                Bent Hubs ($110 ea)
              </Label>
              <Input
                type="number"
                min="0"
                value={grillBentHubs}
                onChange={(e) => setGrillBentHubs(e.target.value)}
                className="h-8 font-mono text-xs font-bold"
              />
            </div>
          </div>
        </div>
      )}

      {/* Single Clean Grill Cost Summary Badge */}
      {grillType !== "none" && (
        <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-2 text-xs text-emerald-600 dark:text-emerald-400">
          <div className="truncate pr-2">
            <span className="block truncate text-xs font-bold">
              {activeGrillPreview.description}
            </span>
            {grillType === "grid" && (
              <span className="text-[10px] text-muted-foreground">
                {computedGrillConfig.squaresCount || 0} Squares,{" "}
                {computedGrillConfig.tIntersectionsCount || 0} T-connections
              </span>
            )}
          </div>
          <span className="shrink-0 font-mono text-xs font-bold">
            +${activeGrillPreview.rawCost.toFixed(2)} raw
          </span>
        </div>
      )}
    </div>
  )
}
