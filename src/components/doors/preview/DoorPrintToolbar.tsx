"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { DoorClosed, FileText, Printer, X, Scale } from "lucide-react"
import QuoteNotesEditor from "@/components/quotes/QuoteNotesEditor"
import { writeSessionAttachedInstallOption } from "@/hooks/calculator/supply-mode/supply-session-storage"
import type { DoorQuotingMode } from "@/lib/doors/types"

export interface DoorPrintToolbarProps {
  showNotesEditor: boolean
  setShowNotesEditor: (show: boolean) => void
  quoteNotes: string
  onQuoteNotesChange: (notes: string) => void
  onPrint: () => void
  onClose: () => void
  mode?: DoorQuotingMode | "supply"
  isDualOption?: boolean
  setIsDualOption?: (val: boolean) => void
}

export function DoorPrintToolbar({
  showNotesEditor,
  setShowNotesEditor,
  quoteNotes,
  onQuoteNotesChange,
  onPrint,
  onClose,
  mode,
  isDualOption = false,
  setIsDualOption,
}: DoorPrintToolbarProps) {
  return (
    <div className="no-print shrink-0 border-b border-border bg-card/90 px-4 py-2.5 shadow-md sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
            <DoorClosed className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground sm:text-base">
              Door Quote Preview &amp; Print
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Official architectural proposal matching window and sealed unit
              specifications.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(mode === "supply_only" || isDualOption) && setIsDualOption && (
            <Button
              type="button"
              variant={isDualOption ? "secondary" : "outline"}
              size="sm"
              onClick={() => {
                const next = !isDualOption
                setIsDualOption(next)
                writeSessionAttachedInstallOption(
                  next ? { enabled: true, amountPreTaxCents: 0 } : null
                )
              }}
              className="h-8 cursor-pointer gap-1.5 border-primary/30 text-xs"
              title="Attach the Option for Installation card to this supply quote"
            >
              <Scale className="h-3.5 w-3.5 text-primary" />
              <span>
                {isDualOption
                  ? "Installation Option (Attached)"
                  : "Option for Installation"}
              </span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowNotesEditor(!showNotesEditor)}
            className="h-8 cursor-pointer gap-1.5 text-xs"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>{showNotesEditor ? "Hide Notes" : "Edit Special Notes"}</span>
            {quoteNotes && quoteNotes.trim() && (
              <span className="ml-0.5 h-2 w-2 rounded-full bg-emerald-500" />
            )}
          </Button>

          <Button
            type="button"
            onClick={onPrint}
            className="h-8 cursor-pointer gap-1.5 bg-black text-xs font-bold text-white shadow-xs hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Quote</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 cursor-pointer text-muted-foreground hover:text-foreground"
            title="Close Preview"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Inline Rich Notes Editor inside Modal */}
      {showNotesEditor && (
        <div className="mx-auto mt-2.5 max-w-5xl animate-in border-t border-border/60 pt-2.5 duration-150 fade-in">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">
              Special Notes &amp; Site Instructions (Supports bold &amp; bullet
              points)
            </span>
            <button
              type="button"
              onClick={() => setShowNotesEditor(false)}
              className="cursor-pointer text-[10px] text-muted-foreground hover:text-foreground"
            >
              Close Editor
            </button>
          </div>
          <QuoteNotesEditor
            id="doorQuoteModalNotes"
            value={quoteNotes}
            onChange={onQuoteNotesChange}
            placeholder="Enter special site instructions, door warranty details, or customer notes..."
          />
        </div>
      )}
    </div>
  )
}
