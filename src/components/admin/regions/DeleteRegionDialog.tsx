"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface DeleteRegionDialogProps {
  region: any | null
  onClose: () => void
  onConfirm: (id: string) => void
}

export function DeleteRegionDialog({
  region,
  onClose,
  onConfirm,
}: DeleteRegionDialogProps) {
  if (!region) return null

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/80 p-4 backdrop-blur-sm duration-150 fade-in">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-destructive/30 bg-card p-6 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="shrink-0 rounded-xl bg-destructive/10 p-2.5 text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Delete Region
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Are you sure you want to delete{" "}
              <strong className="text-foreground">{region.name}</strong>?
              Existing saved quotes will keep their historical totals, but this
              region will no longer appear for new quotes.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 border-t border-border pt-3">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={() => onConfirm(region._id)}
            className="cursor-pointer font-semibold"
          >
            Delete Region
          </Button>
        </div>
      </div>
    </div>
  )
}
