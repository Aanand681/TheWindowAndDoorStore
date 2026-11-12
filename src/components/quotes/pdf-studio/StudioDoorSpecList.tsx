"use client"

import React, { useState } from "react"
import { ChevronDown, ChevronRight, CheckSquare, Square } from "lucide-react"
import { StudioDoorSpec } from "@/lib/pdf-studio/door-types"
import { Input } from "@/components/ui/input"

interface StudioDoorSpecListProps {
  specs: StudioDoorSpec[]
  onToggleBold: (specIndex: number) => void
  onUpdateText: (specIndex: number, text: string) => void
}

export function StudioDoorSpecList({
  specs,
  onToggleBold,
  onUpdateText,
}: StudioDoorSpecListProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="overflow-hidden rounded-lg border border-border/70 bg-muted/20">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full cursor-pointer items-center justify-between bg-muted/40 px-3 py-2 text-left transition-colors hover:bg-muted/60"
      >
        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
          <span>Door Specifications ({specs.length} items)</span>
        </span>
        <span className="text-[11px] text-muted-foreground">
          {isOpen ? "Click to collapse" : "Click to edit lines & toggle bold"}
        </span>
      </button>

      {isOpen && (
        <div className="max-h-96 space-y-2 divide-y divide-border/40 overflow-y-auto p-3">
          <p className="pb-1 text-[11px] text-muted-foreground">
            Check <strong>Bold</strong> to emphasize any specification line in
            the generated customer PDF:
          </p>
          {specs.map((s, idx) => (
            <div key={idx} className="flex items-center gap-2 pt-2 first:pt-0">
              <button
                type="button"
                onClick={() => onToggleBold(idx)}
                className={`flex shrink-0 cursor-pointer items-center gap-1 rounded px-2 py-1 text-[11px] font-semibold transition-colors ${
                  s.bold
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
                title="Toggle bold for this line"
              >
                {s.bold ? (
                  <CheckSquare className="h-3.5 w-3.5" />
                ) : (
                  <Square className="h-3.5 w-3.5" />
                )}
                <span>Bold</span>
              </button>

              <Input
                value={s.text}
                onChange={(e) => onUpdateText(idx, e.target.value)}
                className={`h-8 flex-1 bg-background/80 text-xs ${s.bold ? "font-bold text-foreground" : ""}`}
                placeholder="Specification text"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
