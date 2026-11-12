"use client"

import React from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { GrillProfile, SealedUnitGrillSettings } from "@/lib/sealed-units-logic"

export interface SealedUnitGridFieldsProps {
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
  grills: SealedUnitGrillSettings
}

export function SealedUnitGridFields({
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
  grills,
}: SealedUnitGridFieldsProps) {
  return (
    <div className="space-y-2 border-t border-border/40 pt-1">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-0.5">
          <Label className="text-[10px] font-semibold text-muted-foreground">
            Profile
          </Label>
          <select
            value={grillProfile}
            onChange={(e) => setGrillProfile(e.target.value as GrillProfile)}
            className="h-8 w-full rounded-lg border border-input bg-background px-2 text-[11px]"
          >
            <option value='5/8" x 1/4"'>5/8&quot; × 1/4&quot;</option>
            <option value='3/8" x 1/4"'>3/8&quot; × 1/4&quot;</option>
            <option value="8mm x 18mm Georgian">8mm × 18mm Georgian</option>
          </select>
        </div>
        <div className="space-y-0.5">
          <Label className="text-[10px] font-semibold text-muted-foreground">
            Color
          </Label>
          <select
            value={grillColor}
            onChange={(e) => setGrillColor(e.target.value)}
            className="h-8 w-full rounded-lg border border-input bg-background px-2 text-[11px]"
          >
            {availableGrillColors.map((col) => {
              const rate = grills?.gridRates?.[grillProfile]?.[col] ?? 5.5
              return (
                <option key={col} value={col}>
                  {col} (${rate.toFixed(2)})
                </option>
              )
            })}
          </select>
        </div>
      </div>

      {/* Pattern Entry vs Manual Direct Count */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-[10px] font-semibold text-muted-foreground">
            Grid Geometry
          </Label>
          <div className="flex items-center gap-1 text-[10px]">
            <button
              type="button"
              onClick={() => setGrillPatternMode("pattern")}
              className={cn(
                "cursor-pointer rounded px-2 py-0.5 font-bold",
                grillPatternMode === "pattern"
                  ? "bg-primary/15 font-bold text-primary"
                  : "text-muted-foreground"
              )}
            >
              Cols × Rows
            </button>
            <span className="text-muted-foreground/40">|</span>
            <button
              type="button"
              onClick={() => setGrillPatternMode("manual")}
              className={cn(
                "cursor-pointer rounded px-2 py-0.5 font-bold",
                grillPatternMode === "manual"
                  ? "bg-primary/15 font-bold text-primary"
                  : "text-muted-foreground"
              )}
            >
              Direct Count
            </button>
          </div>
        </div>

        {grillPatternMode === "pattern" ? (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <Label className="text-[10px] text-muted-foreground">
                Columns
              </Label>
              <Input
                type="number"
                min="1"
                value={grillCols}
                onChange={(e) => setGrillCols(e.target.value)}
                className="h-8 font-mono text-xs font-bold"
              />
            </div>
            <div className="space-y-0.5">
              <Label className="text-[10px] text-muted-foreground">Rows</Label>
              <Input
                type="number"
                min="1"
                value={grillRows}
                onChange={(e) => setGrillRows(e.target.value)}
                className="h-8 font-mono text-xs font-bold"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-0.5">
              <Label className="text-[10px] text-muted-foreground">
                Total Squares
              </Label>
              <Input
                type="number"
                min="0"
                value={grillSquares}
                onChange={(e) => setGrillSquares(e.target.value)}
                className="h-8 font-mono text-xs font-bold"
              />
            </div>
            <div className="space-y-0.5">
              <Label className="text-[10px] text-muted-foreground">
                T-Intersections
              </Label>
              <Input
                type="number"
                min="0"
                value={grillTIntersections}
                onChange={(e) => setGrillTIntersections(e.target.value)}
                className="h-8 font-mono text-xs font-bold"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
