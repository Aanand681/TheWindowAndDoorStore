"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { RotateCcw } from "lucide-react"

export interface ResetModalWrapperProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ResetModalWrapper({
  isOpen,
  onClose,
  onConfirm,
}: ResetModalWrapperProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/80 p-4 backdrop-blur-md duration-200 fade-in">
      <div className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="shrink-0 rounded-xl bg-destructive/15 p-2.5 text-destructive">
            <RotateCcw className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Reset Window Quote?
            </h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Are you sure you want to clear this workspace and all window
              configurations and pricing overrides?
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 cursor-pointer text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            className="text-destructive-foreground h-8 cursor-pointer bg-destructive text-xs font-bold hover:bg-destructive/90"
          >
            Reset Quote
          </Button>
        </div>
      </div>
    </div>
  )
}
