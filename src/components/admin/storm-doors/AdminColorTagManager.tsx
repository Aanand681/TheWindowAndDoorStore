"use client"

import React, { useState } from "react"
import { X, Plus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

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

  const handleAdd = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const trimmed = newColor.trim()
    if (!trimmed) return
    if (!colors.includes(trimmed)) {
      onChange([...colors, trimmed])
    }
    setNewColor("")
  }

  const handleRemove = (colorToRemove: string) => {
    onChange(colors.filter((c) => c !== colorToRemove))
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold">{label}</Label>

      <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 rounded-lg border border-border/80 bg-background/50">
        {colors.map((c) => (
          <span
            key={c}
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted border border-border"
          >
            <span>{c}</span>
            <button
              type="button"
              onClick={() => handleRemove(c)}
              className="rounded-full hover:bg-muted-foreground/20 p-0.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {colors.length === 0 && (
          <span className="text-xs text-muted-foreground italic">No colors configured</span>
        )}
      </div>

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Add color (e.g. Iron Ore)"
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
