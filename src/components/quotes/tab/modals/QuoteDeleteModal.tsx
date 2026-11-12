"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface QuoteDeleteModalProps {
  quoteToDelete: { id: string; quoteNumber: string } | null
  setQuoteToDelete: (val: any) => void
  isDeletingQuote: boolean
  confirmDeleteQuote: () => void
}

export function QuoteDeleteModal({
  quoteToDelete,
  setQuoteToDelete,
  isDeletingQuote,
  confirmDeleteQuote,
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

        <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setQuoteToDelete(null)}
            disabled={isDeletingQuote}
            className="cursor-pointer"
          >
            Cancel
          </Button>
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
