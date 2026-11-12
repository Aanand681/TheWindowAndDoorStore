"use client"

import React from "react"
import { Plus, RefreshCw, RotateCcw } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StudioWindowItem } from "@/lib/pdf-studio/types"
import { StudioWindowItemRow } from "./StudioWindowItemRow"

interface StudioWindowScheduleCardProps {
  items: StudioWindowItem[]
  isDetailsOpen: boolean
  generating: boolean
  onToggleDetails: () => void
  onAddItem: () => void
  onRemoveItem: (index: number) => void
  onUpdateItem: (
    index: number,
    field: keyof StudioWindowItem,
    value: any
  ) => void
  onImageUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void
  onGeneratePdf: () => void
  onResetQuote?: () => void
}

export function StudioWindowScheduleCard({
  items,
  isDetailsOpen,
  generating,
  onToggleDetails,
  onAddItem,
  onRemoveItem,
  onUpdateItem,
  onImageUpload,
  onGeneratePdf,
  onResetQuote,
}: StudioWindowScheduleCardProps) {
  return (
    <Card className="border-border bg-card/70 shadow-md backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              3
            </span>
            <CardTitle className="text-base font-semibold">
              Window Schedule &amp; Drawings ({items.length})
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {onResetQuote && items.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onResetQuote}
                className="h-8 cursor-pointer gap-1 border-border/70 px-2.5 text-xs font-semibold text-destructive shadow-xs hover:bg-destructive/10"
                title="Reset quote & start fresh"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onToggleDetails}
              className="cursor-pointer text-xs"
            >
              {isDetailsOpen ? "Collapse" : "Expand"}
            </Button>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={onAddItem}
              className="cursor-pointer gap-1.5 text-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Window</span>
            </Button>
          </div>
        </div>
        <CardDescription>
          Review and edit extracted window dimensions, options, prices, and CAD
          drawings.
        </CardDescription>
      </CardHeader>

      {isDetailsOpen && (
        <CardContent className="space-y-4 pt-2">
          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed py-8 text-center text-sm text-muted-foreground">
              No window items yet. Upload a supplier PDF or click &ldquo;Add
              Window&rdquo;.
            </div>
          ) : (
            <div className="max-h-[600px] space-y-4 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <StudioWindowItemRow
                  key={idx}
                  item={item}
                  idx={idx}
                  onUpdateItem={onUpdateItem}
                  onRemoveItem={onRemoveItem}
                  onImageUpload={onImageUpload}
                />
              ))}
            </div>
          )}

          {/* Generate Button at bottom of editor */}
          <div className="pt-2">
            <Button
              onClick={onGeneratePdf}
              disabled={generating || !items.length}
              className="w-full cursor-pointer gap-2 shadow-md"
            >
              {generating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Generating PDF…</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  <span>Update &amp; Re-generate PDF</span>
                </>
              )}
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
