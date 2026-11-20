"use client"

import React from "react"
import { Check } from "lucide-react"

export const ALL_STORM_STYLES: { id: string; label: string }[] = [
  { id: "one_lite", label: "One-Lite" },
  { id: "full_view", label: "Full-View" },
  { id: "self_storing", label: "Self-Storing" },
  { id: "hi_view", label: "Hi-View" },
  { id: "extended_view", label: "Extended-View" },
  { id: "tri_lite", label: "Tri-Lite" },
  { id: "true_view_half", label: "True-View 1/2" },
  { id: "true_view_three_quarter", label: "True-View 3/4" },
  { id: "project_self_storing", label: "1-1/4\" Project" },
]

export interface AdminStormStylePickerProps {
  selectedStyles?: string[]
  onChange: (styles?: string[]) => void
}

export function AdminStormStylePicker({
  selectedStyles = [],
  onChange,
}: AdminStormStylePickerProps) {
  const isAll = !selectedStyles || selectedStyles.length === 0

  const toggleStyle = (id: string) => {
    if (isAll) {
      onChange([id])
      return
    }
    const exists = selectedStyles.includes(id)
    const next = exists
      ? selectedStyles.filter((s) => s !== id)
      : [...selectedStyles, id]

    onChange(next.length === 0 ? undefined : next)
  }

  const handleSelectAll = () => {
    onChange(undefined)
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1">
      <button
        type="button"
        onClick={handleSelectAll}
        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
          isAll
            ? "bg-primary text-primary-foreground border-primary"
            : "bg-muted/40 border-border text-muted-foreground hover:bg-muted"
        }`}
      >
        All Styles
      </button>

      {ALL_STORM_STYLES.map((st) => {
        const isSelected = !isAll && selectedStyles.includes(st.id)
        return (
          <button
            key={st.id}
            type="button"
            onClick={() => toggleStyle(st.id)}
            className={`px-2 py-0.5 rounded-md text-[10px] font-medium border flex items-center gap-1 transition-colors ${
              isSelected
                ? "bg-primary/20 border-primary text-primary font-bold"
                : "bg-background border-border/80 text-muted-foreground hover:bg-muted"
            }`}
          >
            {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
            <span>{st.label}</span>
          </button>
        )
      })}
    </div>
  )
}
