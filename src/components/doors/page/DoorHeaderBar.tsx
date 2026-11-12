"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DoorClosed,
  Settings as SettingsIcon,
  Bookmark,
  FolderOpen,
  Paperclip,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DoorHeaderBarProps {
  lastSavedAt: string | null
  attachedWindowQuote: any
  attachedSealedUnit: any
  savedDraftsCount: number
  isAdmin: boolean
  onOpenAttach: () => void
  onSaveDraft: () => void
  onOpenSavedQuotes: () => void
  onOpenReset?: () => void
}

export function DoorHeaderBar({
  lastSavedAt,
  attachedWindowQuote,
  attachedSealedUnit,
  savedDraftsCount,
  isAdmin,
  onOpenAttach,
  onSaveDraft,
  onOpenSavedQuotes,
  onOpenReset: _onOpenReset,
}: DoorHeaderBarProps) {
  const hasAttachment = Boolean(attachedWindowQuote || attachedSealedUnit)

  return (
    <div className="flex flex-col justify-between gap-3.5 border-b border-border/50 pb-2 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <DoorClosed className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            Door &amp; Installation Calculator
          </h1>
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Inkster software pricing, 8% surcharge, 10% door discount (storm
          exempt), hardware, and site labour.
        </p>
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
          onClick={onOpenAttach}
          className={cn(
            "h-8 cursor-pointer gap-1.5 px-2.5 text-xs font-semibold shadow-xs transition-colors",
            hasAttachment
              ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400"
              : "border-border/80 text-foreground hover:bg-muted"
          )}
          title="Attach saved Window or Sealed Unit quote to this door quote"
        >
          <Paperclip
            className={cn(
              "h-3.5 w-3.5",
              hasAttachment
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-primary"
            )}
          />
          <span>{hasAttachment ? "Quote Attached" : "Attach Quote"}</span>
          {hasAttachment && (
            <span className="ml-0.5 h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          )}
        </Button>

        {/* 2. Save Draft */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSaveDraft}
          className="h-8 cursor-pointer gap-1.5 border-border/80 px-2.5 text-xs font-semibold text-foreground shadow-xs hover:bg-muted"
          title="Explicitly save this door quote to your permanent Saved Quotes library"
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
          className="relative h-8 cursor-pointer gap-1.5 border-border/80 px-2.5 text-xs font-semibold text-foreground shadow-xs hover:bg-muted"
        >
          <FolderOpen className="h-3.5 w-3.5 text-primary" />
          <span>Saved Quotes</span>
          {savedDraftsCount > 0 && (
            <span className="py-0.2 ml-1 rounded-full bg-primary/20 px-1.5 text-[10px] font-bold text-primary">
              {savedDraftsCount}
            </span>
          )}
        </Button>

        {/* 4. Admin Rates Button */}
        {isAdmin && (
          <Link href="/admin/doors">
            <Button
              variant="outline"
              size="sm"
              className="h-8 cursor-pointer gap-1.5 border-border/80 px-2.5 text-xs font-semibold text-foreground shadow-xs hover:bg-muted"
            >
              <SettingsIcon className="h-3.5 w-3.5 text-primary" />
              <span>Door Rates</span>
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
