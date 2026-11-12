"use client"

import React from "react"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { QuoteType } from "@/lib/quote-drafts-storage"

interface SavedQuotesModalFooterProps {
  totalDraftsCount: number
  selectedTab: QuoteType | "all"
  isConfirmingDeleteAll: boolean
  setIsConfirmingDeleteAll: (val: boolean) => void
  handleDeleteAll: () => void
  onClose: () => void
}

export function SavedQuotesModalFooter({
  totalDraftsCount,
  selectedTab,
  isConfirmingDeleteAll,
  setIsConfirmingDeleteAll,
  handleDeleteAll,
  onClose,
}: SavedQuotesModalFooterProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 bg-muted/20 p-3.5 sm:p-4">
      <div className="flex items-center gap-3">
        <div className="text-xs text-muted-foreground">
          {totalDraftsCount} total saved{" "}
          {totalDraftsCount === 1 ? "quote" : "quotes"}
        </div>

        {totalDraftsCount > 0 && (
          <>
            {isConfirmingDeleteAll ? (
              <div className="flex items-center gap-1.5 rounded-lg border border-destructive/30 bg-destructive/10 px-2 py-1">
                <span className="text-xs font-bold text-destructive">
                  Delete all{" "}
                  {selectedTab === "all"
                    ? "quotes"
                    : selectedTab === "window"
                      ? "window quotes"
                      : selectedTab === "door"
                        ? "door quotes"
                        : "sealed unit quotes"}
                  ?
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={handleDeleteAll}
                  className="h-6 cursor-pointer px-2 text-xs font-bold"
                >
                  Yes, Delete All
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsConfirmingDeleteAll(false)}
                  className="h-6 cursor-pointer px-1.5 text-xs"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsConfirmingDeleteAll(true)}
                className="h-7 cursor-pointer gap-1 px-2 text-xs font-semibold text-destructive/80 hover:bg-destructive/10 hover:text-destructive"
                title="Delete all saved quotes"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete All</span>
              </Button>
            )}
          </>
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onClose}
        className="ml-auto h-8 cursor-pointer text-xs font-semibold"
      >
        Close
      </Button>
    </div>
  )
}
