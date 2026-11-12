"use client"

import React from "react"
import { DoorClosed, RotateCcw, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import SmartBackButton from "@/components/shared/SmartBackButton"

export interface AdminDoorsHeaderProps {
  onResetDefaults: () => void
  onSave: () => Promise<void>
  saving: boolean
  loading: boolean
}

export function AdminDoorsHeader({
  onResetDefaults,
  onSave,
  saving,
  loading,
}: AdminDoorsHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-border/50 pb-4 md:flex-row md:items-center">
      <div className="flex items-center gap-3">
        <SmartBackButton fallbackUrl="/admin" />
        <div>
          <div className="flex items-center gap-2">
            <DoorClosed className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">
              Door Pricing &amp; Labour Settings
            </h1>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Manage door categories, presets, upcharges, surcharge %, 10%
            discount, and logistics rates.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onResetDefaults}
          className="gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          Reset Defaults
        </Button>

        <Button
          size="sm"
          onClick={onSave}
          disabled={saving || loading}
          className="gap-2 bg-black text-white shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {saving ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
