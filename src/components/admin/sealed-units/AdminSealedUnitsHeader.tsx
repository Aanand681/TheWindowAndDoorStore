"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Layers, RotateCcw, Save } from "lucide-react"
import SmartBackButton from "@/components/shared/SmartBackButton"

interface AdminSealedUnitsHeaderProps {
  loading: boolean
  saving: boolean
  onResetDefaults: () => void
  onSave: () => void
}

export function AdminSealedUnitsHeader({
  loading,
  saving,
  onResetDefaults,
  onSave,
}: AdminSealedUnitsHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/50 pb-2">
      <div className="flex flex-wrap items-center gap-3">
        <SmartBackButton fallbackUrl="/admin" title="Back to Admin" />
        <div className="inline-flex items-center gap-1.5 text-muted-foreground">
          <Layers className="h-5 w-5 text-primary" />
          <span className="text-base font-semibold tracking-wider uppercase">
            Sealed Unit Pricing &amp; Labour Rules
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onResetDefaults}
          className="cursor-pointer gap-1.5 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Reset Defaults</span>
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onSave}
          disabled={saving || loading}
          className="cursor-pointer gap-1.5 bg-primary text-xs font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? "Saving..." : "Save All Changes"}</span>
        </Button>
      </div>
    </div>
  )
}
