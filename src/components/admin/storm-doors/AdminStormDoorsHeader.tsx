"use client"

import React from "react"
import { Shield, RotateCcw, Save, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import SmartBackButton from "@/components/shared/SmartBackButton"

export interface AdminStormDoorsHeaderProps {
  onDiscardChanges: () => void
  onSave: () => Promise<void>
  onOpenAddModel: () => void
  onOpenAddAddon: () => void
  activeTab: "models" | "addons" | "rules"
  saving: boolean
  loading: boolean
}

export function AdminStormDoorsHeader({
  onDiscardChanges,
  onSave,
  onOpenAddModel,
  onOpenAddAddon,
  activeTab,
  saving,
  loading,
}: AdminStormDoorsHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-border/50 pb-2 sm:flex-row sm:items-center">
      <div className="flex flex-wrap items-center gap-3">
        <SmartBackButton fallbackUrl="/admin" title="Back to Admin" />
        <div className="inline-flex items-center gap-2">
          <span className="rounded-lg bg-primary/10 p-1.5 text-primary">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Storm Door Catalog &amp; Options
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Manage York Aluminum storm door models, prices, interchangeable screen add-ons, and finishes.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {activeTab === "models" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenAddModel}
            className="cursor-pointer gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/10"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Model</span>
          </Button>
        )}

        {activeTab === "addons" && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenAddAddon}
            className="cursor-pointer gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/10"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Add-on</span>
          </Button>
        )}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onDiscardChanges}
          className="cursor-pointer gap-1.5 text-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Discard</span>
        </Button>

        <Button
          type="button"
          size="sm"
          onClick={onSave}
          disabled={saving || loading}
          className="cursor-pointer gap-1.5 text-xs font-semibold"
        >
          <Save className="h-3.5 w-3.5" />
          <span>{saving ? "Saving..." : "Save Catalog"}</span>
        </Button>
      </div>
    </div>
  )
}
