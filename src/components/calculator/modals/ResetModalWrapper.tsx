"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Save, X, Loader2 } from "lucide-react"

export interface ResetModalWrapperProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onSaveDraftAndReset?: () => Promise<void> | void
  isSaving?: boolean
  title?: string
  description?: string
}

export function ResetModalWrapper({
  isOpen,
  onClose,
  onConfirm,
  onSaveDraftAndReset,
  isSaving: externalSaving,
  title = "Start New Quote?",
  description = "You have active work in progress. Would you like to save this quote as a draft before starting a clean workspace?",
}: ResetModalWrapperProps) {
  const [internalSaving, setInternalSaving] = useState(false)
  const isSaving = externalSaving ?? internalSaving

  if (!isOpen) return null

  const handleSaveAndReset = async () => {
    if (!onSaveDraftAndReset || isSaving) return
    try {
      setInternalSaving(true)
      await onSaveDraftAndReset()
    } finally {
      setInternalSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/80 p-4 backdrop-blur-md duration-200 fade-in">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">
            <Plus className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-foreground">
              {title}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              {description}
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
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onConfirm}
            disabled={isSaving}
            className="h-9 cursor-pointer gap-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Discard &amp; Start New</span>
          </Button>
          {onSaveDraftAndReset && (
            <Button
              type="button"
              size="sm"
              onClick={handleSaveAndReset}
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
                  <span>Save Draft &amp; Start New</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
