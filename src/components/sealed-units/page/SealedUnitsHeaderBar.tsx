"use client"

import React from "react"
import Link from "next/link"
import { Layers, Sparkles, Bookmark, FolderOpen, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { AppHeader } from "@/components/layout/AppHeader"

interface SealedUnitsHeaderBarProps {
  user: any
  lastSavedAt: string | null
  hasAttachedQuote: boolean
  savedDraftsCount: number
  onOpenAttachModal: () => void
  onSaveDraft: () => void
  onOpenSavedQuotes: () => void
}

export function SealedUnitsHeaderBar({
  user,
  lastSavedAt,
  hasAttachedQuote,
  savedDraftsCount,
  onOpenAttachModal,
  onSaveDraft,
  onOpenSavedQuotes,
}: SealedUnitsHeaderBarProps) {
  const canManagePriceSheets = Boolean(
    user?.role === "ADMIN" ||
    user?.role === "SUPERADMIN" ||
    user?.canAccessAdmin
  )

  return (
    <div className="space-y-4">
      <AppHeader currentPath="/sealed-units" />

      {/* Sub-bar with Title */}
      <div className="flex items-center justify-between gap-3 border-b border-border/50 pb-1.5">
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-primary/20 bg-primary/10 p-1.5 text-primary">
            <Layers className="h-4 w-4" />
          </span>
          <h1 className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            Sealed Unit Calculator
          </h1>
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Official Shop Logic
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {lastSavedAt && (
            <span className="rounded-full border border-border/50 bg-muted/60 px-2.5 py-1 text-[11px] text-muted-foreground">
              Draft auto-saved {lastSavedAt}
            </span>
          )}

          {/* 1. Attach Quote */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenAttachModal}
            className={cn(
              "h-8 cursor-pointer gap-1.5 px-2.5 text-xs font-semibold shadow-xs transition-colors",
              hasAttachedQuote
                ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
                : "border-border/80 text-foreground hover:bg-muted"
            )}
            title="Attach saved Window or Door quote to this sealed unit quotation"
          >
            <Paperclip
              className={cn(
                "h-3.5 w-3.5",
                hasAttachedQuote
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-primary"
              )}
            />
            <span>{hasAttachedQuote ? "Quote Attached" : "Attach Quote"}</span>
          </Button>

          {/* 2. Save Draft */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSaveDraft}
            className="h-8 cursor-pointer gap-1.5 border-primary/40 px-2.5 text-xs font-semibold text-primary shadow-xs hover:bg-primary/10"
            title="Save current sealed unit quote to drafts"
          >
            <Bookmark className="h-3.5 w-3.5 text-primary" />
            <span>Save Draft</span>
          </Button>

          {/* 3. Saved Quotes */}
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
            {savedDraftsCount > 0 && (
              <span className="py-0.2 ml-0.5 rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
                {savedDraftsCount}
              </span>
            )}
          </Button>

          {canManagePriceSheets && (
            <Link href="/admin/sealed-units">
              <Button
                variant="outline"
                size="sm"
                className="h-8 cursor-pointer gap-1.5 border-border/80 px-2.5 text-xs font-semibold shadow-xs hover:bg-muted"
              >
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span>Manage Price Sheets</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
