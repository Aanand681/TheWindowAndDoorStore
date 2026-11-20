"use client"

import React from "react"
import { StormDoorStyle } from "@/lib/doors/storm-door-types"
import { STYLE_STARTING_PRICES } from "@/lib/doors/storm-door-catalog"
import { StormDoorGraphic } from "../storm/StormDoorGraphics"

export interface StormDoorStyleGridProps {
  style: StormDoorStyle
  onSelectStyle: (st: StormDoorStyle) => void
}

const STYLES_LIST: { id: StormDoorStyle; label: string }[] = [
  { id: "self_storing", label: "Self-Storing" },
  { id: "hi_view", label: "Hi-View" },
  { id: "extended_view", label: "Extended-View" },
  { id: "full_view", label: "Full-View" },
  { id: "one_lite", label: "One-Lite" },
  { id: "tri_lite", label: "Tri-Lite" },
  { id: "true_view_half", label: "True-View 1/2" },
  { id: "true_view_three_quarter", label: "True-View 3/4" },
  { id: "project_self_storing", label: '1 1/4" Self Storing' },
]

export function StormDoorStyleGrid({
  style,
  onSelectStyle,
}: StormDoorStyleGridProps) {
  return (
    <div className="p-4 md:col-span-5 overflow-y-auto space-y-3">
      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        Select Door Style
      </label>
      <div className="grid grid-cols-3 gap-2">
        {STYLES_LIST.map((st) => {
          const isSel = style === st.id
          const startPrice = STYLE_STARTING_PRICES[st.id] || 600
          return (
            <button
              key={st.id}
              type="button"
              onClick={() => onSelectStyle(st.id)}
              className={`flex flex-col items-center justify-between rounded-xl border p-2 text-center transition-all ${
                isSel
                  ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                  : "border-border/70 bg-background/50 hover:border-border hover:bg-muted/40"
              }`}
            >
              <div className="h-16 w-10 py-1">
                <StormDoorGraphic style={st.id} />
              </div>
              <span className="mt-1 text-[11px] font-bold line-clamp-1">
                {st.label}
              </span>
              <span className="mt-0.5 rounded bg-muted/60 px-1.5 py-0.2 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                From ${startPrice.toFixed(0)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
