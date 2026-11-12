"use client"

import React from "react"
import { Trash2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StudioWindowItem } from "@/lib/pdf-studio/types"

interface StudioWindowItemRowProps {
  item: StudioWindowItem
  idx: number
  onUpdateItem: (
    index: number,
    field: keyof StudioWindowItem,
    value: any
  ) => void
  onRemoveItem: (index: number) => void
  onImageUpload: (index: number, e: React.ChangeEvent<HTMLInputElement>) => void
}

export function StudioWindowItemRow({
  item,
  idx,
  onUpdateItem,
  onRemoveItem,
  onImageUpload,
}: StudioWindowItemRowProps) {
  return (
    <div
      className={`rounded-xl border transition-all ${
        item.child
          ? "-mt-3 ml-5 space-y-1 border-border/40 bg-muted/15 p-2.5"
          : "border-border/80 bg-card/90 p-3.5 shadow-sm"
      }`}
    >
      {/* Row Header */}
      <div className="mb-2 flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-foreground">
            Window {item.id || idx + 1}
          </span>
          {item.child && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Child unit
            </span>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemoveItem(idx)}
          className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="mr-1 h-3.5 w-3.5" />
          Remove
        </Button>
      </div>

      {/* Dimensions & Fields Grid */}
      <div className="grid grid-cols-2 gap-2.5 text-xs sm:grid-cols-4">
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Item #</Label>
          <Input
            value={item.id}
            onChange={(e) => onUpdateItem(idx, "id", e.target.value)}
            className="h-8 bg-background/80 text-xs"
          />
        </div>
        <div className="col-span-2 space-y-1 sm:col-span-2">
          <Label className="text-[11px] text-muted-foreground">
            Description
          </Label>
          <Input
            value={item.name}
            onChange={(e) => onUpdateItem(idx, "name", e.target.value)}
            className="h-8 bg-background/80 text-xs"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Quantity</Label>
          <Input
            value={item.qty}
            onChange={(e) => onUpdateItem(idx, "qty", e.target.value)}
            className="h-8 bg-background/80 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">
            FR Size (Frame)
          </Label>
          <Input
            value={item.fr}
            onChange={(e) => onUpdateItem(idx, "fr", e.target.value)}
            placeholder="48 X 22"
            className="h-8 bg-background/80 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">
            BM Size (Brickmould)
          </Label>
          <Input
            value={item.bm}
            onChange={(e) => onUpdateItem(idx, "bm", e.target.value)}
            placeholder="Optional"
            className="h-8 bg-background/80 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">
            R/O Size (+1&quot;)
          </Label>
          <Input
            value={item.ro}
            onChange={(e) => onUpdateItem(idx, "ro", e.target.value)}
            placeholder="49 X 23"
            className="h-8 bg-background/80 text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">
            Total / List ($)
          </Label>
          <Input
            value={item.price}
            onChange={(e) => onUpdateItem(idx, "price", e.target.value)}
            placeholder="823.84"
            className="h-8 bg-background/80 font-mono text-xs"
          />
        </div>
      </div>

      {/* Options & CAD Drawing */}
      {item.child ? (
        <div className="mt-2 space-y-1">
          <Label className="text-[11px] text-muted-foreground">
            Options &amp; Performance
          </Label>
          <Input
            value={item.options}
            onChange={(e) => onUpdateItem(idx, "options", e.target.value)}
            className="h-8 bg-background/80 text-xs"
            placeholder="Child unit options..."
          />
        </div>
      ) : (
        <div className="mt-3 grid grid-cols-1 items-center gap-3 sm:grid-cols-12">
          <div className="space-y-1 sm:col-span-8">
            <Label className="text-[11px] text-muted-foreground">
              Options &amp; Performance
            </Label>
            <Textarea
              rows={2}
              value={item.options}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                onUpdateItem(idx, "options", e.target.value)
              }
              className="bg-background/80 text-xs"
            />
          </div>

          {/* Drawing Preview & Upload */}
          <div className="flex flex-col items-center justify-center rounded-lg border border-border/40 bg-muted/20 p-2 sm:col-span-4">
            {item.image ? (
              <div className="text-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.image}
                  alt="CAD drawing"
                  className="mx-auto max-h-20 max-w-full rounded border bg-white object-contain p-1 shadow-xs"
                />
                <span className="mt-1 block text-[10px] text-muted-foreground">
                  Outside view
                </span>
              </div>
            ) : (
              <div className="py-2 text-center text-xs text-muted-foreground">
                <ImageIcon className="mx-auto mb-1 h-5 w-5 opacity-40" />
                <span>No drawing</span>
              </div>
            )}

            <label className="mt-1 flex cursor-pointer items-center gap-1 text-[11px] text-primary hover:underline">
              <ImageIcon className="h-3 w-3" />
              <span>{item.image ? "Replace" : "Upload drawing"}</span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => onImageUpload(idx, e)}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
