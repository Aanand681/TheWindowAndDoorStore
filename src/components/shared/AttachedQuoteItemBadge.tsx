"use client"

import React from "react"
import { AppWindow, DoorClosed, Layers, ExternalLink, Trash2 } from "lucide-react"

export type AttachedQuoteType = "window" | "door" | "sealed_unit"

export interface AttachedQuoteItemBadgeProps {
  type: AttachedQuoteType
  quoteNumber: string
  total?: number | string
  onEdit: () => void
  onDetach: () => void
}

const TYPE_CONFIG = {
  window: {
    label: "Window",
    editLabel: "Edit in Windows",
    icon: AppWindow,
    badgeClasses:
      "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  },
  door: {
    label: "Door",
    editLabel: "Edit in Doors",
    icon: DoorClosed,
    badgeClasses:
      "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  },
  sealed_unit: {
    label: "Sealed Unit",
    editLabel: "Edit in Sealed Units",
    icon: Layers,
    badgeClasses:
      "bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30",
  },
}

export function AttachedQuoteItemBadge({
  type,
  quoteNumber,
  total,
  onEdit,
  onDetach,
}: AttachedQuoteItemBadgeProps) {
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.window
  const Icon = config.icon

  const displayTotal =
    total !== undefined && total !== null && total !== ""
      ? typeof total === "number"
        ? `$${total.toFixed(2)}`
        : String(total).startsWith("$")
          ? total
          : `$${total}`
      : null

  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-xl border border-border bg-card/70 p-2.5 text-xs shadow-xs backdrop-blur-sm transition-all sm:flex-nowrap">
      {/* Left: (Bubble: Type) quoteNo. */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase shadow-xs ${config.badgeClasses}`}
        >
          <Icon className="h-3.5 w-3.5" />
          <span>{config.label}</span>
        </span>
        <span className="font-semibold text-foreground">
          #{quoteNumber || "Untitled"}
        </span>
        {displayTotal && (
          <span className="font-mono text-[11px] text-muted-foreground">
            ({displayTotal})
          </span>
        )}
      </div>

      {/* Right: [Edit in ... (green bubble button)] [Detach (red bubble button)] */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-xs transition-all hover:bg-emerald-700 active:scale-95 dark:bg-emerald-600 dark:hover:bg-emerald-500"
          title={config.editLabel}
        >
          <ExternalLink className="h-3 w-3" />
          <span>{config.editLabel}</span>
        </button>

        <button
          type="button"
          onClick={onDetach}
          className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow-xs transition-all hover:bg-rose-700 active:scale-95 dark:bg-rose-600 dark:hover:bg-rose-500"
          title={`Detach ${config.label}`}
        >
          <Trash2 className="h-3 w-3" />
          <span>Detach</span>
        </button>
      </div>
    </div>
  )
}
