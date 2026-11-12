"use client"

import React from "react"
import {
  AppWindow,
  Calendar,
  CheckCircle2,
  DoorClosed,
  Layers,
  Paperclip,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { QuoteDraftItem } from "@/lib/quote-drafts-storage"

export interface AttachQuoteDraftCardProps {
  draft: QuoteDraftItem
  isAttached: boolean
  onAttachItem: (draft: QuoteDraftItem) => void
}

export function AttachQuoteDraftCard({
  draft,
  isAttached,
  onAttachItem,
}: AttachQuoteDraftCardProps) {
  const isDoor = draft.type === "door"
  const isSealedUnit = draft.type === "sealed_unit"

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString)
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return isoString
    }
  }

  return (
    <div
      className={`flex flex-col justify-between gap-3 rounded-xl border p-3.5 transition-all sm:flex-row sm:items-center ${
        isAttached
          ? "border-emerald-500/60 bg-emerald-500/5 shadow-xs"
          : "border-border/70 bg-card hover:border-border hover:bg-muted/30"
      }`}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-foreground">
            #{draft.quoteNumber || "Untitled"}
          </span>
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
              isDoor
                ? "border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                : isSealedUnit
                  ? "border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400"
                  : "border border-primary/30 bg-primary/10 text-primary"
            }`}
          >
            {isDoor ? (
              <>
                <DoorClosed className="h-3 w-3" /> Door Quote
              </>
            ) : isSealedUnit ? (
              <>
                <Layers className="h-3 w-3" /> Sealed Units
              </>
            ) : (
              <>
                <AppWindow className="h-3 w-3" /> Window Quote
              </>
            )}
          </span>

          {isAttached && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
              <CheckCircle2 className="h-3 w-3" /> Attached
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold text-foreground">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3 text-muted-foreground" />
            {draft.customerName || "No customer name"}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(draft.updatedAt)}
          </span>
        </div>

        <div className="max-w-md truncate text-[11px] text-muted-foreground">
          {draft.summaryLabel || `${draft.itemCount || 0} items`}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-4 self-end sm:self-center">
        <div className="text-right">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase">
            Total
          </div>
          <div className="font-mono text-base font-black text-foreground">
            ${draft.grandTotal ? draft.grandTotal.toFixed(2) : "0.00"}
          </div>
        </div>

        <Button
          type="button"
          variant={isAttached ? "outline" : "default"}
          size="sm"
          onClick={() => onAttachItem(draft)}
          className={`h-8 cursor-pointer gap-1.5 px-3 text-xs font-bold shadow-xs ${
            isAttached
              ? "border-emerald-500 text-emerald-600 hover:bg-emerald-500/10"
              : "bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          <Paperclip className="h-3.5 w-3.5" />
          <span>{isAttached ? "Re-attach / Update" : "Attach Quote"}</span>
        </Button>
      </div>
    </div>
  )
}
