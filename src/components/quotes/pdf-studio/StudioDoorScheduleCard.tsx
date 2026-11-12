"use client"

import React from "react"
import {
  DoorOpen,
  Sparkles,
  RefreshCw,
  Send,
  Check,
  Plus,
  RotateCcw,
} from "lucide-react"
import { StudioDoorLine } from "@/lib/pdf-studio/door-types"
import { StudioDoorLineCard } from "./StudioDoorLineCard"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface StudioDoorScheduleCardProps {
  lines: StudioDoorLine[]
  allName: string
  allPrice: string
  generating: boolean
  onSetAllName: (val: string) => void
  onSetAllPrice: (val: string) => void
  onApplyAll: () => void
  onUpdateLine: (index: number, updates: Partial<StudioDoorLine>) => void
  onRecropLine: (index: number, trimLeft: number, trimBottom: number) => void
  onReplaceDrawing: (index: number, file: File) => void
  onToggleSpecBold: (lineIndex: number, specIndex: number) => void
  onUpdateSpecText: (lineIndex: number, specIndex: number, text: string) => void
  onGeneratePdf: () => void
  onAddLine?: () => void
  onRemoveLine?: (index: number) => void
  onResetTrims?: (index: number) => void
  onResetQuote?: () => void
}

export function StudioDoorScheduleCard({
  lines,
  allName,
  allPrice,
  generating,
  onSetAllName,
  onSetAllPrice,
  onApplyAll,
  onUpdateLine,
  onRecropLine,
  onReplaceDrawing,
  onToggleSpecBold,
  onUpdateSpecText,
  onGeneratePdf,
  onAddLine,
  onRemoveLine,
  onResetTrims,
  onResetQuote,
}: StudioDoorScheduleCardProps) {
  return (
    <Card className="border-border bg-card/70 shadow-md backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-500">
              3
            </span>
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <DoorOpen className="h-4 w-4 text-emerald-500" />
              <span>Door Schedule ({lines.length} lines)</span>
            </CardTitle>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onResetQuote && lines.length > 0 && (
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

            {onAddLine && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onAddLine}
                className="h-8 cursor-pointer gap-1 border-border/70 px-2.5 text-xs font-semibold shadow-xs"
                title="Add a custom door line"
              >
                <Plus className="h-3.5 w-3.5 text-emerald-500" />
                <span>Add Door</span>
              </Button>
            )}

            <Button
              type="button"
              onClick={onGeneratePdf}
              disabled={generating || lines.length === 0}
              className="h-8 cursor-pointer gap-1.5 bg-emerald-600 text-xs text-white shadow-sm hover:bg-emerald-500"
              size="sm"
            >
              {generating ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              <span>Generate Customer PDF</span>
            </Button>
          </div>
        </div>
        <CardDescription>
          Review extracted door lines, apply batch pricing, adjust canvas trims,
          and customize specifications.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Batch Price & Name Section */}
        <div className="space-y-3 rounded-lg border border-border/60 bg-muted/30 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            <span>Apply to All Door Lines</span>
          </div>
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-12">
            <div className="space-y-1 sm:col-span-5">
              <Label className="text-xs text-muted-foreground">
                Name for all lines
              </Label>
              <Input
                value={allName}
                onChange={(e) => onSetAllName(e.target.value)}
                placeholder="e.g. Standard Entry Door"
                className="bg-background/80 text-xs"
              />
            </div>

            <div className="space-y-1 sm:col-span-4">
              <Label className="text-xs text-muted-foreground">
                Price for all lines (CAD)
              </Label>
              <Input
                type="number"
                step="any"
                min="0"
                value={allPrice}
                onChange={(e) => onSetAllPrice(e.target.value)}
                placeholder="e.g. 1950.00"
                className="bg-background/80 font-mono text-xs"
              />
            </div>

            <div className="sm:col-span-3">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onApplyAll}
                disabled={lines.length === 0}
                className="w-full cursor-pointer gap-1 text-xs"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Apply to All</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Lines List */}
        {lines.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/10 py-10 text-center">
            <DoorOpen className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No door lines extracted yet.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/70">
              Upload a supplier quote PDF above to automatically load door lines
              and drawings.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {lines.map((line, idx) => (
              <StudioDoorLineCard
                key={line.number || idx}
                line={line}
                index={idx}
                onUpdateLine={onUpdateLine}
                onRecropLine={onRecropLine}
                onReplaceDrawing={onReplaceDrawing}
                onToggleSpecBold={onToggleSpecBold}
                onUpdateSpecText={onUpdateSpecText}
                onRemoveLine={onRemoveLine}
                onResetTrims={onResetTrims}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
