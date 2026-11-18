"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react"

interface QuoteDeleteModalProps {
  quoteToDelete: { id: string; quoteNumber: string; isPending?: boolean } | null
  setQuoteToDelete: (val: any) => void
  isDeletingQuote: boolean
  confirmDeleteQuote: () => void
  onRecallQuote?: (id: string, quoteNumber: string) => Promise<boolean>
}

export function QuoteDeleteModal({
  quoteToDelete,
  setQuoteToDelete,
  isDeletingQuote,
  confirmDeleteQuote,
  onRecallQuote,
}: QuoteDeleteModalProps) {
  if (!quoteToDelete) return null

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/80 p-4 backdrop-blur-sm fade-in">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">
              Delete Quote #{quoteToDelete.quoteNumber}?
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              This action cannot be undone and will permanently remove this
              quote.
            </p>
          </div>
        </div>

        {quoteToDelete.isPending && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <div>
              <span className="font-bold">Need to fix a mistake?</span> This
              quote is in review. If you just need to edit it, click{" "}
              <span className="font-semibold underline">Recall &amp; Edit</span>{" "}
              instead of permanently deleting it.
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuoteToDelete(null)}
            disabled={isDeletingQuote}
            className="cursor-pointer"
          >
            Cancel
          </Button>

          {quoteToDelete.isPending && onRecallQuote && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                const ok = await onRecallQuote(
                  quoteToDelete.id,
                  quoteToDelete.quoteNumber
                )
                if (ok) setQuoteToDelete(null)
              }}
              disabled={isDeletingQuote}
              className="cursor-pointer border-amber-500/50 bg-amber-500/10 font-bold text-amber-600 hover:bg-amber-500/20 dark:text-amber-400"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Recall &amp; Edit
            </Button>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={confirmDeleteQuote}
            disabled={isDeletingQuote}
            className="cursor-pointer font-bold"
          >
            {isDeletingQuote ? "Deleting..." : "Delete Quote"}
          </Button>
        </div>
      </div>
    </div>
  )
}
