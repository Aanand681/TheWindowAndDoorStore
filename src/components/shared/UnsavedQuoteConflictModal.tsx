"use client"

import React, { useState } from "react"
import { AlertCircle, Save, ArrowRight, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface UnsavedQuoteConflictModalProps {
  isOpen: boolean
  onClose: () => void
  quoteTypeLabel: string
  existingQuoteTitle?: string
  incomingQuoteTitle?: string
  onSaveExistingAndLoad: () => Promise<void> | void
  onContinueWithNew: () => void
  isSaving?: boolean
}

export function UnsavedQuoteConflictModal({
  isOpen,
  onClose,
  quoteTypeLabel,
  existingQuoteTitle = "Draft in progress",
  incomingQuoteTitle = "new quote",
  onSaveExistingAndLoad,
  onContinueWithNew,
  isSaving: externalSaving,
}: UnsavedQuoteConflictModalProps) {
  const [internalSaving, setInternalSaving] = useState(false)
  const isSaving = externalSaving ?? internalSaving

  if (!isOpen) return null

  const handleSaveAndLoad = async () => {
    if (isSaving) return
    try {
      setInternalSaving(true)
      await onSaveExistingAndLoad()
    } finally {
      setInternalSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/80 p-4 backdrop-blur-md duration-200 fade-in">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-xl bg-amber-500/10 p-2.5 text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-foreground">
              Unsaved Quote in Progress
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              You have an unsaved {quoteTypeLabel} quote in your workspace (
              <span className="font-semibold text-foreground">
                {existingQuoteTitle}
              </span>
              ). Loading{" "}
              <span className="font-semibold text-foreground">
                {incomingQuoteTitle}
              </span>{" "}
              will replace your active workspace. Would you like to save your
              existing quote to the database first, or continue and replace it?
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onClose}
            disabled={isSaving}
            className="h-7 w-7 rounded-full text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
            className="h-9 cursor-pointer text-xs"
          >
            Keep Existing
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onContinueWithNew}
            disabled={isSaving}
            className="h-9 cursor-pointer gap-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-500/10 dark:text-amber-400"
          >
            <ArrowRight className="h-3.5 w-3.5" />
            <span>Continue with New</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSaveAndLoad}
            disabled={isSaving}
            className="h-9 cursor-pointer gap-1.5 bg-primary text-xs font-bold text-primary-foreground shadow-md hover:bg-primary/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Saving to Database...</span>
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                <span>Save &amp; Load New</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

