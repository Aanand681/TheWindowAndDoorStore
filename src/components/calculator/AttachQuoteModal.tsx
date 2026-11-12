"use client"

import React from "react"
import {
  Paperclip,
  Search,
  X,
  AppWindow,
  Layers,
  DoorClosed,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { QuoteType } from "@/lib/quote-drafts-storage"
import { useAttachQuoteDrafts } from "./attach/useAttachQuoteDrafts"
import { AttachedQuotesPills } from "./attach/AttachedQuotesPills"
import { AttachQuoteDraftCard } from "./attach/AttachQuoteDraftCard"

export interface AttachQuoteModalProps {
  isOpen: boolean
  onClose: () => void
  currentQuoteType?: QuoteType
  attachedWindowQuote?: any | null
  attachedSealedUnit?: any | null
  attachedDoorQuote?: any | null
  onAttachWindow?: (data: any) => void
  onDetachWindow?: () => void
  onAttachSealedUnit?: (data: any) => void
  onDetachSealedUnit?: () => void
  onAttachDoor?: (data: any) => void
  onDetachDoor?: () => void
  onAttach?: (data: any) => void
  onDetach?: () => void
}

export function AttachQuoteModal({
  isOpen,
  onClose,
  currentQuoteType = "window",
  attachedWindowQuote,
  attachedSealedUnit,
  attachedDoorQuote,
  onAttachWindow,
  onDetachWindow,
  onAttachSealedUnit,
  onDetachSealedUnit,
  onAttachDoor,
  onDetachDoor,
  onAttach,
  onDetach,
}: AttachQuoteModalProps) {
  const {
    drafts,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filteredDrafts,
    windowDraftsCount,
    sealedUnitCount,
    doorCount,
    isDraftAttached,
    handleAttachItem,
  } = useAttachQuoteDrafts({
    isOpen,
    currentQuoteType,
    attachedWindowQuote,
    attachedSealedUnit,
    attachedDoorQuote,
    onAttachWindow,
    onAttachSealedUnit,
    onAttachDoor,
    onAttach,
  })

  if (!isOpen) return null

  const getHostLabel = () => {
    if (currentQuoteType === "window") return "Window Quote"
    if (currentQuoteType === "sealed_unit") return "Sealed Unit Quote"
    return "Door Quote"
  }

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-3 backdrop-blur-xs duration-200 fade-in sm:p-4">
      <div className="relative flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/70 bg-muted/20 p-4 sm:p-5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl border border-primary/20 bg-primary/10 p-2 text-primary">
              <Paperclip className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Attach Quotes to {getHostLabel()}
              </h2>
              <p className="text-xs text-muted-foreground">
                Combine window, sealed unit, or door quotes into this quotation
                and PDF.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Attachments Ledger / Badges */}
        <AttachedQuotesPills
          attachedWindowQuote={attachedWindowQuote}
          attachedSealedUnit={attachedSealedUnit}
          attachedDoorQuote={attachedDoorQuote}
          onDetachWindow={onDetachWindow}
          onDetachSealedUnit={onDetachSealedUnit}
          onDetachDoor={onDetachDoor}
          onDetach={onDetach}
        />

        {/* Toolbar: Search & Filter Tabs */}
        <div className="flex flex-col items-stretch justify-between gap-2.5 border-b border-border/60 bg-card/60 p-3 sm:flex-row sm:items-center sm:px-5">
          <div className="relative flex-1">
            <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by quote #, customer, or description..."
              className="h-9 bg-background pl-9 text-xs"
            />
          </div>

          <div className="flex shrink-0 items-center gap-1 rounded-lg bg-muted/60 p-1">
            <Button
              type="button"
              variant={activeTab === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("all")}
              className="h-7 px-2.5 text-xs"
            >
              All ({drafts.length})
            </Button>

            {currentQuoteType !== "window" && (
              <Button
                type="button"
                variant={activeTab === "window" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("window")}
                className="h-7 gap-1 px-2.5 text-xs"
              >
                <AppWindow className="h-3 w-3" />
                <span>Windows ({windowDraftsCount})</span>
              </Button>
            )}

            {currentQuoteType !== "sealed_unit" && (
              <Button
                type="button"
                variant={activeTab === "sealed_unit" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("sealed_unit")}
                className="h-7 gap-1 px-2.5 text-xs"
              >
                <Layers className="h-3 w-3" />
                <span>Sealed Units ({sealedUnitCount})</span>
              </Button>
            )}

            {currentQuoteType !== "door" && (
              <Button
                type="button"
                variant={activeTab === "door" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("door")}
                className="h-7 gap-1 px-2.5 text-xs"
              >
                <DoorClosed className="h-3 w-3" />
                <span>Doors ({doorCount})</span>
              </Button>
            )}
          </div>
        </div>

        {/* Drafts List */}
        <div className="flex-1 space-y-2.5 overflow-y-auto p-3 sm:p-5">
          {filteredDrafts.length === 0 ? (
            <div className="space-y-2 py-12 text-center text-xs text-muted-foreground">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                <Paperclip className="h-5 w-5 opacity-40" />
              </div>
              <div className="text-sm font-semibold text-foreground">
                No saved quotes available to attach
              </div>
              <p className="mx-auto max-w-md">
                Save quotes in the Window, Sealed Unit, or Door calculators to
                attach them together here.
              </p>
            </div>
          ) : (
            filteredDrafts.map((draft) => (
              <AttachQuoteDraftCard
                key={draft.id}
                draft={draft}
                isAttached={isDraftAttached(draft)}
                onAttachItem={handleAttachItem}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 p-3.5 sm:p-4">
          <div className="text-xs text-muted-foreground">
            {drafts.length} saved quotes available to attach
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 cursor-pointer text-xs font-semibold"
          >
            Done
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AttachQuoteModal
