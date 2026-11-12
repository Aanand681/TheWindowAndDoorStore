"use client"

import React from "react"
import { Search, X, Layers, Component, DoorClosed } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { QuoteType } from "@/lib/quote-drafts-storage"

interface SavedQuotesFilterBarProps {
  selectedTab: QuoteType | "all"
  setSelectedTab: (tab: QuoteType | "all") => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  totalDraftsCount: number
  windowDraftsCount: number
  sealedUnitDraftsCount: number
  doorDraftsCount: number
}

export function SavedQuotesFilterBar({
  selectedTab,
  setSelectedTab,
  searchQuery,
  setSearchQuery,
  totalDraftsCount,
  windowDraftsCount,
  sealedUnitDraftsCount,
  doorDraftsCount,
}: SavedQuotesFilterBarProps) {
  return (
    <div className="space-y-3 border-b border-border/60 bg-background/50 p-3 sm:p-4">
      <div className="flex flex-col items-stretch justify-between gap-2.5 sm:flex-row sm:items-center">
        {/* Tabs */}
        <div className="flex items-center gap-1 rounded-xl border border-border/60 bg-muted/60 p-1">
          <button
            type="button"
            onClick={() => setSelectedTab("all")}
            className={cn(
              "cursor-pointer rounded-lg px-3 py-1 text-xs font-semibold transition-all",
              selectedTab === "all"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All ({totalDraftsCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("window")}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all",
              selectedTab === "window"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Component className="h-3.5 w-3.5" />
            <span>Windows ({windowDraftsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("sealed_unit")}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all",
              selectedTab === "sealed_unit"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Sealed Units ({sealedUnitDraftsCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTab("door")}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold transition-all",
              selectedTab === "door"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <DoorClosed className="h-3.5 w-3.5" />
            <span>Doors ({doorDraftsCount})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer or quote #..."
            className="h-8 bg-background pl-8 text-xs shadow-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute top-1/2 right-2.5 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
