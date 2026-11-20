"use client"

import React, { useState } from "react"
import { resolveColorHex } from "../storm/storm-door-colors"
import { Palette, Check } from "lucide-react"
import { Input } from "@/components/ui/input"

export interface StormDoorColorPickerProps {
  color: string
  setColor: (c: string) => void
  colorList: string[]
  isCustomPaint: boolean
  setIsCustomPaint: (cp: boolean) => void
  isDoubleDoorCustomPaint?: boolean
  setIsDoubleDoorCustomPaint?: (val: boolean) => void
}

const QUICK_CUSTOM_PRESETS = [
  { name: "Cranberry", hex: "#8A1C30" },
  { name: "Forest Green", hex: "#1E3F20" },
  { name: "Hunter Green", hex: "#1B4D3E" },
  { name: "Green", hex: "#2E7D32" },
  { name: "Navy", hex: "#1B365D" },
  { name: "Burgundy", hex: "#6B1D2F" },
]

export function StormDoorColorPicker({
  color,
  setColor,
  colorList,
  isCustomPaint,
  setIsCustomPaint,
  isDoubleDoorCustomPaint = false,
  setIsDoubleDoorCustomPaint,
}: StormDoorColorPickerProps) {
  const [customInput, setCustomInput] = useState(isCustomPaint ? color : "")
  const currentHex = resolveColorHex(color)

  const handleSelectFactory = (c: string) => {
    setIsCustomPaint(false)
    setColor(c)
  }

  const handleCustomColorChange = (newVal: string) => {
    setCustomInput(newVal)
    if (!isCustomPaint) setIsCustomPaint(true)
    if (newVal.trim()) setColor(newVal.trim())
  }

  return (
    <div className="space-y-2 rounded-xl border border-border/70 bg-card/60 p-3">
      {/* Header & Mode Toggle */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Palette className="h-3.5 w-3.5 text-primary" />
          <span>Color &amp; Finish</span>
        </label>
        <button
          type="button"
          onClick={() => {
            const next = !isCustomPaint
            setIsCustomPaint(next)
            if (next && (!customInput || colorList.includes(customInput))) {
              setColor("Cranberry")
              setCustomInput("Cranberry")
            } else if (!next) {
              setColor(colorList[0] || "White")
            }
          }}
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full border transition-colors ${
            isCustomPaint
              ? "bg-amber-500/15 border-amber-500/50 text-amber-600 dark:text-amber-400"
              : "bg-muted/50 border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          {isCustomPaint ? "✓ Custom Paint Mode" : "+ Enable Custom Paint"}
        </button>
      </div>

      {/* Custom Paint Pricing Tiers */}
      {isCustomPaint && setIsDoubleDoorCustomPaint && (
        <div className="flex gap-2 p-1 rounded-lg bg-amber-500/10 border border-amber-500/30">
          <button
            type="button"
            onClick={() => setIsDoubleDoorCustomPaint(false)}
            className={`flex-1 rounded-md px-2 py-1 text-xs border transition-all ${
              !isDoubleDoorCustomPaint
                ? "bg-amber-500 text-white font-bold border-amber-600 shadow-sm"
                : "bg-background/80 text-foreground border-border/60 hover:bg-muted"
            }`}
          >
            Single Door (+$1,113)
          </button>
          <button
            type="button"
            onClick={() => setIsDoubleDoorCustomPaint(true)}
            className={`flex-1 rounded-md px-2 py-1 text-xs border transition-all ${
              isDoubleDoorCustomPaint
                ? "bg-amber-500 text-white font-bold border-amber-600 shadow-sm"
                : "bg-background/80 text-foreground border-border/60 hover:bg-muted"
            }`}
          >
            Double French (+$2,184)
          </button>
        </div>
      )}

      {/* Standard Factory Swatches */}
      {!isCustomPaint ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {colorList.map((c) => {
            const hex = resolveColorHex(c)
            const isSel = color === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => handleSelectFactory(c)}
                className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-xs transition-all ${
                  isSel
                    ? "border-primary bg-primary/10 ring-1 ring-primary font-bold text-foreground"
                    : "border-border/70 bg-background/50 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className="h-4 w-4 shrink-0 rounded-full border border-black/20 shadow-xs"
                  style={{ backgroundColor: hex }}
                />
                <span className="truncate text-[11px]">{c}</span>
              </button>
            )
          })}
        </div>
      ) : (
        /* Custom Paint Wheel & Input */
        <div className="space-y-2.5 pt-1">
          {/* Quick presets */}
          <div className="flex flex-wrap gap-1.5">
            {QUICK_CUSTOM_PRESETS.map((p) => {
              const isSel = color.toLowerCase() === p.name.toLowerCase()
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleCustomColorChange(p.name)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] transition-all ${
                    isSel
                      ? "border-amber-500 bg-amber-500/15 font-bold text-amber-700 dark:text-amber-300"
                      : "border-border bg-background hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: p.hex }} />
                  <span>{p.name}</span>
                </button>
              )
            })}
          </div>

          {/* Color Wheel & Custom Text */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center">
              <input
                type="color"
                value={currentHex.startsWith("#") ? currentHex : "#8A1C30"}
                onChange={(e) => handleCustomColorChange(e.target.value)}
                className="h-8 w-10 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
                title="Pick exact color wheel tone"
              />
            </div>
            <Input
              type="text"
              placeholder="e.g. Cranberry, Forest Green, or #8A1C30"
              value={customInput}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              className="h-8 text-xs flex-1"
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="h-3 w-3 rounded-full border border-black/20" style={{ backgroundColor: currentHex }} />
            <span>Active Tint: <strong className="text-foreground">{color}</strong> ({currentHex})</span>
          </div>
        </div>
      )}
    </div>
  )
}
