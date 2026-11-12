"use client"

import React from "react"
import {
  Calendar,
  Layers,
  Component,
  ArrowRight,
  User,
  Trash2,
  DoorClosed,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { QuoteDraftItem } from "@/lib/quote-drafts-storage"

interface SavedQuoteItemCardProps {
  draft: QuoteDraftItem
  confirmDeleteId: string | null
  setConfirmDeleteId: (id: string | null) => void
  onDelete: (id: string, quoteNumber: string) => void
  onLoadQuote: (draft: QuoteDraftItem) => void
  onClose: () => void
}

function formatDate(isoString: string) {
  try {
    const d = new Date(isoString)
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return isoString
  }
}

export function SavedQuoteItemCard({
  draft,
  confirmDeleteId,
  setConfirmDeleteId,
  onDelete,
  onLoadQuote,
  onClose,
}: SavedQuoteItemCardProps) {
  const isConfirmingDelete = confirmDeleteId === draft.id
  const rawTotal =
    Number(draft.grandTotal) || Number((draft.data as any)?.grandTotal) || 0
  const dataSubtotal = Number((draft.data as any)?.subtotal) || 0
  // Handle legacy drafts where window quote grandTotal was stored in raw cents
  const displayGrandTotal =
    draft.type === "window" && dataSubtotal > 0 && rawTotal > dataSubtotal * 50
      ? rawTotal / 100
      : rawTotal

  return (
    <div className="group relative flex flex-col justify-between gap-3.5 rounded-xl border border-border/70 bg-card p-3.5 shadow-xs transition-all hover:border-primary/40 hover:bg-muted/30 sm:flex-row sm:items-center sm:p-4">
      {/* Left Info */}
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          {draft.type === "window" ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
              <Component className="h-3 w-3" />
              <span>Window Quote</span>
            </span>
          ) : draft.type === "sealed_unit" ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <Layers className="h-3 w-3" />
              <span>Sealed Unit Quote</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
              <DoorClosed className="h-3 w-3" />
              <span>Door Quote</span>
            </span>
          )}

          <span className="font-mono text-xs font-bold text-foreground">
            #{draft.quoteNumber}
          </span>

          <span className="ml-auto flex items-center gap-1 text-[11px] text-muted-foreground sm:ml-0">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(draft.updatedAt || draft.createdAt)}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate text-sm font-semibold text-foreground">
            {draft.customerName || "Unnamed Customer"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">{draft.summaryLabel}</span>
          <span>•</span>
          <span className="font-medium text-foreground">
            {draft.itemCount} items
          </span>
        </div>
      </div>

      {/* Right: Financials & Action Buttons */}
      <div className="flex shrink-0 items-center justify-between gap-3 sm:justify-end sm:border-l sm:border-border/60 sm:pl-4">
        <div className="text-left sm:text-right">
          <div className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            Total Amount
          </div>
          <div className="font-mono text-base font-black text-primary sm:text-lg">
            $
            {displayGrandTotal.toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isConfirmingDelete ? (
            <div className="flex items-center gap-1 rounded-lg border border-destructive/30 bg-destructive/10 p-1">
              <span className="px-1.5 text-[11px] font-semibold text-destructive">
                Delete?
              </span>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={() => onDelete(draft.id, draft.quoteNumber)}
                className="h-7 cursor-pointer px-2 text-xs font-bold"
              >
                Yes
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setConfirmDeleteId(null)}
                className="h-7 cursor-pointer px-2 text-xs"
              >
                No
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDeleteId(draft.id)}
              className="h-8 w-8 cursor-pointer p-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              title="Delete draft"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}

          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={() => {
              onLoadQuote(draft)
              onClose()
            }}
            className="h-8 cursor-pointer gap-1.5 bg-primary px-3 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90"
          >
            <span>Load Quote</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
