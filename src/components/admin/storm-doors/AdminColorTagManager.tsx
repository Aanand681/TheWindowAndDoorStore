"use client"

import React, { useState } from "react"
import { X, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { resolveColorHex } from "@/components/doors/storm/storm-door-colors"

export interface AdminColorTagManagerProps {
  label: string
  colors: string[]
  onChange: (colors: string[]) => void
}

export function AdminColorTagManager({
  label,
  colors = [],
  onChange,
}: AdminColorTagManagerProps) {
  const [newColor, setNewColor] = useState("")
  const [pickerHex, setPickerHex] = useState("#8A1C30")

  const handleAdd = (val?: string) => {
    const trimmed = (val !== undefined ? val : newColor).trim()
    if (!trimmed) return
    if (!colors.includes(trimmed)) {
      onChange([...colors, trimmed])
    }
    setNewColor("")
  }

  const handleRemove = (colorToRemove: string) => {
    onChange(colors.filter((c) => c !== colorToRemove))
  }

  const handleColorPickerChange = (hex: string) => {
    setPickerHex(hex)
    setNewColor(hex)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-semibold">{label}</Label>
        <span className="text-[11px] text-muted-foreground">{colors.length} colors active</span>
      </div>

      <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-lg border border-border/80 bg-background/50">
        {colors.map((c) => {
          const hex = resolveColorHex(c)
          return (
            <span
              key={c}
              className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-0.5 rounded-full text-xs font-medium bg-muted border border-border shadow-xs"
            >
              <span
                className="h-3 w-3 rounded-full border border-black/20 shrink-0"
                style={{ backgroundColor: hex }}
              />
              <span>{c}</span>
              <button
                type="button"
                onClick={() => handleRemove(c)}
                className="rounded-full hover:bg-muted-foreground/20 p-0.5 text-muted-foreground hover:text-foreground transition-colors"
                title={`Remove ${c}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )
        })}
        {colors.length === 0 && (
          <span className="text-xs text-muted-foreground italic">No colors configured</span>
        )}
      </div>

      <div className="flex gap-2 items-center">
        <div className="relative flex items-center justify-center">
          <input
            type="color"
            value={pickerHex}
            onChange={(e) => handleColorPickerChange(e.target.value)}
            className="h-8 w-9 cursor-pointer rounded-lg border border-border bg-transparent p-0.5"
            title="Pick color on wheel"
          />
        </div>
        <Input
          type="text"
          placeholder="Color name or hex (e.g. Iron Ore, #353839)"
          value={newColor}
          onChange={(e) => setNewColor(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleAdd()
            }
          }}
          className="h-8 text-xs flex-1"
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => handleAdd()}
          className="h-8 px-3 text-xs gap-1"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add</span>
        </Button>
      </div>
    </div>
  )
}
