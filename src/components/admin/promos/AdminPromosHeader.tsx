"use client"

import React from "react"
import { Tag, Plus, Save, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import SmartBackButton from "@/components/shared/SmartBackButton"

export interface AdminPromosHeaderProps {
  onOpenCreate?: () => void
  isSuperAdmin?: boolean
  hasOrderChanges?: boolean
  savingOrder?: boolean
  onSaveOrder?: () => void
}

export function AdminPromosHeader({
  onOpenCreate,
  isSuperAdmin,
  hasOrderChanges,
  savingOrder,
  onSaveOrder,
}: AdminPromosHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-border/50 pb-2 sm:flex-row sm:items-center">
      <div className="flex flex-wrap items-center gap-3">
        <SmartBackButton fallbackUrl="/admin" title="Back to Admin" />
        <div className="inline-flex items-center gap-2">
          <span className="rounded-lg bg-primary/10 p-1.5 text-primary">
            <Tag className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Promos and Sales
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Toggle which promos are currently live and configure promotional pricing discounts.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {hasOrderChanges && onSaveOrder && (
          <Button
            onClick={onSaveOrder}
            disabled={savingOrder}
            size="sm"
            className="animate-pulse bg-emerald-600 font-semibold text-white shadow-md hover:bg-emerald-700"
          >
            {savingOrder ? (
              <>
                <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Saving Order...
              </>
            ) : (
              <>
                <Save className="mr-1.5 h-4 w-4" /> Save Order
              </>
            )}
          </Button>
        )}
        {isSuperAdmin && onOpenCreate && (
          <Button
            onClick={onOpenCreate}
            size="sm"
            className="flex cursor-pointer items-center gap-1.5 bg-primary font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Promo</span>
          </Button>
        )}
      </div>
    </div>
  )
}
