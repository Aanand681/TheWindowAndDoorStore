"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { PromoType } from "./types"
import {
  GripVertical,
  ChevronUp,
  ChevronDown,
  Power,
  Trash2,
} from "lucide-react"

interface PromoCardItemProps {
  promo: PromoType
  index: number
  totalPromos: number
  draggedIndex: number | null
  onDragStart: (e: React.DragEvent, index: number) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: (e: React.DragEvent, index: number) => void
  onDragEnd: () => void
  onMove: (index: number, direction: "up" | "down") => void
  onToggleActive: (id: string, currentStatus: boolean) => void
  onDelete: (id: string) => void
  isSuperAdmin: boolean
}

export function PromoCardItem({
  promo,
  index,
  totalPromos,
  draggedIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMove,
  onToggleActive,
  onDelete,
  isSuperAdmin,
}: PromoCardItemProps) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
      className={`rounded-xl border p-5 transition-all duration-200 ${
        draggedIndex === index ? "scale-[0.98] border-primary opacity-40" : ""
      } ${
        promo.isActive
          ? "border-primary/30 bg-primary/5 shadow-lg"
          : "border-border bg-card/30 opacity-70 grayscale"
      }`}
    >
      <div className="mb-4 flex items-start justify-between gap-2">
        <div className="flex items-start gap-2.5">
          {/* Reordering Grip & Arrows */}
          <div className="flex items-center gap-1 rounded-lg border border-border/80 bg-muted/60 p-1">
            <div
              className="cursor-grab p-0.5 text-muted-foreground hover:text-foreground active:cursor-grabbing"
              title="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </div>
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground disabled:opacity-20 disabled:hover:bg-transparent"
                disabled={index === 0}
                onClick={() => onMove(index, "up")}
                title="Move up in order"
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="flex h-5 w-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground disabled:opacity-20 disabled:hover:bg-transparent"
                disabled={index === totalPromos - 1}
                onClick={() => onMove(index, "down")}
                title="Move down in order"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] font-bold text-muted-foreground">
                #{index + 1}
              </span>
              <h3 className="flex items-center gap-2 text-lg font-bold">
                {promo.name}
                {promo.isActive && (
                  <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-bold tracking-wider text-white uppercase">
                    Live
                  </span>
                )}
              </h3>
            </div>
            <span className="mt-1.5 inline-block rounded-md bg-muted px-2 py-0.5 text-xs font-medium tracking-widest text-muted-foreground uppercase">
              {promo.type.replace("_", " ")}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant={promo.isActive ? "default" : "secondary"}
            size="sm"
            onClick={() => onToggleActive(promo._id, promo.isActive)}
            className={
              promo.isActive
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : ""
            }
          >
            <Power className="mr-1.5 h-4 w-4" />
            {promo.isActive ? "Turn Off" : "Turn On"}
          </Button>
          {isSuperAdmin && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(promo._id)}
              className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border/50 bg-background/50 p-3 text-sm text-muted-foreground">
        {promo.type === "BOGO" && (
          <span>
            Buy {promo.buyQty}, Get {promo.getQty} Free (cheapest items).
          </span>
        )}
        {promo.type === "FREE_PARTS" && (
          <span>Free components: {promo.freeComponents?.join(", ")}.</span>
        )}
        {promo.type === "PERCENTAGE" && (
          <span>{promo.discountPercentage}% off base price.</span>
        )}
        {promo.type === "COMBO" && (
          <span>
            Free {promo.freeComponents?.join(", ")} <br />
            <span className="font-medium text-primary">PLUS</span>{" "}
            {promo.discountPercentage}% off
            {promo.applyPercentageAfterFreeParts
              ? " (applied after parts deduction)."
              : " (applied to total base)."}
          </span>
        )}
      </div>
    </div>
  )
}
