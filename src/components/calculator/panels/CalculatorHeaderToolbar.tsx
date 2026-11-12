"use client"

import React from "react"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Sparkles,
  RotateCcw,
  Check,
  FolderOpen,
  Paperclip,
  Bookmark,
} from "lucide-react"
import { cn } from "@/lib/utils"

export interface CalculatorHeaderToolbarProps {
  activeTab: "promo" | "tax" | "quotes"
  isComparisonStaging: boolean
  hasCompareOptions: boolean
  hasAttachedQuotes: boolean
  lastSavedAt: string | null
  savedDraftsCount?: number
  onOpenCompareModal: () => void
  onRevertToBase: () => void
  onKeepOptionB: () => void
  onOpenAttachModal: () => void
  onSaveDraft: () => void
  onOpenSavedQuotes: () => void
}

export function CalculatorHeaderToolbar({
  activeTab,
  isComparisonStaging,
  hasCompareOptions,
  hasAttachedQuotes,
  lastSavedAt,
  savedDraftsCount,
  onOpenCompareModal,
  onRevertToBase,
  onKeepOptionB,
  onOpenAttachModal,
  onSaveDraft,
  onOpenSavedQuotes,
}: CalculatorHeaderToolbarProps) {
  return (
    <>
      {/* Phase 3 Hybrid: Staging Mode Banner */}
      {isComparisonStaging && (
        <div className="mb-4 flex animate-in flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-primary/10 to-amber-500/15 p-3.5 px-4 shadow-md duration-150 fade-in sm:mb-5 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-amber-500 p-2 font-bold text-amber-950 shadow-xs">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
                  Comparison Staging Mode: Option B (Upgraded Quote)
                </span>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                  Live Editing
                </span>
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Base Quote A is preserved. Customize crew, distance, jambs, or
                promo on Option B, then view the live comparison.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="default"
              size="sm"
              onClick={onOpenCompareModal}
              className="h-8 cursor-pointer gap-1.5 bg-amber-500 text-xs font-bold text-amber-950 shadow-sm hover:bg-amber-600"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>View Comparison &amp; Delta</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRevertToBase}
              className="h-8 cursor-pointer gap-1.5 border-border text-xs font-semibold text-foreground hover:bg-muted"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Revert to Base (Option A)</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onKeepOptionB}
              className="h-8 cursor-pointer gap-1 text-xs font-bold text-emerald-600 hover:bg-emerald-500/10 dark:text-emerald-400"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Keep Option B</span>
            </Button>
          </div>
        </div>
      )}

      {/* Tab Controls & Unified Action Bar */}
      {activeTab !== "quotes" && (
        <div className="mb-4 flex flex-col items-stretch justify-between gap-3 sm:mb-5 sm:flex-row sm:items-center">
          {/* Left Side: Segmented Tab Controls */}
          <TabsList className="inline-flex h-9 rounded-xl border border-border/50 bg-muted p-1 shadow-xs">
            <TabsTrigger
              value="promo"
              className="cursor-pointer rounded-lg px-3 py-1 text-xs font-semibold"
            >
              Promo Calculator
            </TabsTrigger>
            <TabsTrigger
              value="tax"
              className="cursor-pointer rounded-lg px-3 py-1 text-xs font-semibold"
            >
              Tax &amp; Labour Calculator
            </TabsTrigger>
          </TabsList>

          {/* Right Side: Exact Sequence: Auto-saved info, Compare PDF, Attach Quote, Save Draft, Saved Quotes */}
          <div className="flex flex-wrap items-center gap-2">
            {lastSavedAt && (
              <span className="rounded-full border border-border/50 bg-muted/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                Draft auto-saved {lastSavedAt}
              </span>
            )}

            {hasCompareOptions && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenCompareModal}
                className="h-8 cursor-pointer gap-1.5 border-amber-500/40 px-2.5 text-xs font-semibold text-amber-600 shadow-xs hover:bg-amber-500/10 dark:text-amber-400"
                title="Compare Promo Option A vs Option B"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                <span>Compare PDF</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenAttachModal}
              className={cn(
                "h-8 cursor-pointer gap-1.5 px-2.5 text-xs font-semibold shadow-xs transition-colors",
                hasAttachedQuotes
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
                  : "border-border/80 text-foreground hover:bg-muted"
              )}
              title="Attach an existing quote (Sealed Units, Entry Doors, etc.) to this window quote"
            >
              <Paperclip
                className={cn(
                  "h-3.5 w-3.5",
                  hasAttachedQuotes
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-primary"
                )}
              />
              <span>
                {hasAttachedQuotes ? "Quote Attached" : "Attach Quote"}
              </span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSaveDraft}
              className="h-8 cursor-pointer gap-1.5 border-primary/40 px-2.5 text-xs font-semibold text-primary shadow-xs hover:bg-primary/10"
              title="Save current quote to drafts"
            >
              <Bookmark className="h-3.5 w-3.5 text-primary" />
              <span>Save Draft</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenSavedQuotes}
              className="h-8 cursor-pointer gap-1.5 border-border/80 px-2.5 text-xs font-semibold shadow-xs hover:bg-muted"
              title="View and load saved quotes"
            >
              <FolderOpen className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Saved Quotes</span>
              {typeof savedDraftsCount === "number" && savedDraftsCount > 0 && (
                <span className="py-0.2 ml-0.5 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                  {savedDraftsCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
