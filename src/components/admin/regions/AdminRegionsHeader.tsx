"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Map, Plus } from "lucide-react"
import SmartBackButton from "@/components/shared/SmartBackButton"

interface AdminRegionsHeaderProps {
  onOpenCreate: () => void
}

export function AdminRegionsHeader({ onOpenCreate }: AdminRegionsHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-border/50 pb-2 sm:flex-row sm:items-center">
      <div className="flex flex-wrap items-center gap-3">
        <SmartBackButton fallbackUrl="/admin" title="Back to Admin" />
        <div className="inline-flex items-center gap-2">
          <span className="rounded-lg bg-primary/10 p-1.5 text-primary">
            <Map className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Manage Region Charges
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Update region-specific per-sqft rates, fixed setup fees, and map coordinates.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button
          onClick={onOpenCreate}
          size="sm"
          className="flex cursor-pointer items-center gap-1.5 bg-primary font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Region</span>
        </Button>
      </div>
    </div>
  )
}
