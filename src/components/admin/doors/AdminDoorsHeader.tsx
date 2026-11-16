"use client"

import React from "react"
import { DoorClosed, RotateCcw, Save, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import SmartBackButton from "@/components/shared/SmartBackButton"

export interface AdminDoorsHeaderProps {
  onDiscardChanges: () => void
  onOpenHistory: () => void
  onSave: () => Promise<void>
  saving: boolean
  loading: boolean
}

export function AdminDoorsHeader({
  onDiscardChanges,
  onOpenHistory,
  onSave,
  saving,
  loading,
}: AdminDoorsHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-border/50 pb-2 sm:flex-row sm:items-center">
      <div className="flex flex-wrap items-center gap-3">
        <SmartBackButton fallbackUrl="/admin" title="Back to Admin" />
        <div className="inline-flex items-center gap-2">
          <span className="rounded-lg bg-primary/10 p-1.5 text-primary">
            <DoorClosed className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Door Labour &amp; Pricing
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Update door presets, base labour, misc materials, site upcharges,
              surcharge %, and travel rates.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDiscardChanges}
          className="cursor-pointer gap-1.5 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Discard Changes</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onOpenHistory}
          className="cursor-pointer gap-1.5 text-xs"
        >
          <History className="h-3.5 w-3.5" />
          <span>Version History</span>
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onSave}
          disabled={saving || loading}
          className="cursor-pointer gap-1.5 bg-primary text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? "Saving..." : "Save Changes"}</span>
        </Button>
      </div>
    </div>
  )
}
