"use client"

import React from "react"
import { StormDoorStyle } from "@/lib/doors/storm-door-types"
import { STYLE_STARTING_PRICES } from "@/lib/doors/storm-door-catalog"
import { StormDoorGraphic } from "../storm/StormDoorGraphics"

export interface StormDoorStyleGridProps {
  selectedStyle?: StormDoorStyle
  onSelectStyle: (st: StormDoorStyle) => void
}

const STYLES_LIST: { id: StormDoorStyle; label: string; tag: string }[] = [
  { id: "one_lite", label: "One-Lite", tag: '2" & 2-1/4"' },
  { id: "full_view", label: "Full-View", tag: '2" & 2-1/4"' },
  { id: "self_storing", label: "Self-Storing", tag: '2" & 2-1/4"' },
  { id: "hi_view", label: "Hi-View", tag: '2" & 2-1/4"' },
  { id: "extended_view", label: "Extended-View", tag: '2" & 2-1/4"' },
  { id: "tri_lite", label: "Tri-Lite", tag: '2" Classic Only' },
  { id: "true_view_half", label: "True-View 1/2", tag: '2" & 2-1/4"' },
  { id: "true_view_three_quarter", label: "True-View 3/4", tag: '2" & 2-1/4"' },
  { id: "project_self_storing", label: '1 1/4" Self Storing', tag: "Push Button / Project" },
]

export function StormDoorStyleGrid({
  selectedStyle,
  onSelectStyle,
}: StormDoorStyleGridProps) {
  return (
    <div className="p-4 sm:p-6 overflow-y-auto w-full h-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-1 border-b border-border/50">
        <div>
          <h4 className="text-sm font-bold text-foreground">Select a Storm Door Model</h4>
          <p className="text-xs text-muted-foreground">
            Choose a style to customize frame thickness, venting, hardware finish, and colors.
          </p>
        </div>
        <span className="text-xs font-semibold text-primary">9 Models Available</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {STYLES_LIST.map((st) => {
          const isSel = selectedStyle === st.id
          const startPrice = STYLE_STARTING_PRICES[st.id] || 600

          return (
            <button
              key={st.id}
              type="button"
              onClick={() => onSelectStyle(st.id)}
              className={`group relative flex flex-col items-center justify-between rounded-xl border p-3 text-center transition-all cursor-pointer hover:shadow-md ${
                isSel
                  ? "border-primary bg-primary/10 ring-2 ring-primary/40 shadow-sm"
                  : "border-border/70 bg-card hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <div className="h-24 w-14 py-1 flex items-center justify-center transition-transform group-hover:scale-105">
                <StormDoorGraphic style={st.id} color="White" />
              </div>

              <div className="w-full mt-2 pt-2 border-t border-border/40">
                <span className="block text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  {st.label}
                </span>
                <span className="block text-[10px] text-muted-foreground mt-0.5 truncate">
                  {st.tag}
                </span>
                <div className="mt-1.5 flex items-center justify-center">
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                    From ${startPrice.toFixed(0)}
                  </span>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
