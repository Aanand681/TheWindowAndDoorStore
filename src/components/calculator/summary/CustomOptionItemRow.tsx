"use client"

import React from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { X, Pencil, Check } from "lucide-react"
import { QuoteOptionCard } from "@/components/shared/summary/QuoteOptionCard"
import type { CustomQuoteOption } from "@/hooks/calculator/supply-mode/supply-session-storage"

export interface CustomOptionItemRowProps {
  opt: CustomQuoteOption
  canModifyOptions: boolean
  isEditing: boolean
  editTitle: string
  setEditTitle: (v: string) => void
  editPrice: string
  setEditPrice: (v: string) => void
  onSaveEdit: (id: string) => void
  onCancelEdit: () => void
  onStartEdit: (opt: CustomQuoteOption) => void
  onRemoveOption: (id: string) => void
}

export function CustomOptionItemRow({
  opt,
  canModifyOptions,
  isEditing,
  editTitle,
  setEditTitle,
  editPrice,
  setEditPrice,
  onSaveEdit,
  onCancelEdit,
  onStartEdit,
  onRemoveOption,
}: CustomOptionItemRowProps) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs">
      {isEditing ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-foreground">
            <span>Edit Quote Option</span>
            <button
              type="button"
              onClick={onCancelEdit}
              className="cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <Input
              type="text"
              placeholder="Option heading"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="h-8 text-xs"
            />
            <Input
              type="number"
              step="0.01"
              placeholder="Price (+/-)"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              className="h-8 w-24 text-xs font-mono"
            />
            <Button
              type="button"
              size="sm"
              onClick={() => onSaveEdit(opt.id)}
              className="h-8 shrink-0 cursor-pointer gap-1 px-2.5 text-xs"
            >
              <Check className="h-3.5 w-3.5" />
              Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancelEdit}
              className="h-8 shrink-0 cursor-pointer px-2 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <QuoteOptionCard
          title={opt.title}
          amountPreTaxCents={opt.amountPreTaxCents}
          onRemove={canModifyOptions ? () => onRemoveOption(opt.id) : undefined}
          removeTitle="Remove option"
          extraActions={
            canModifyOptions ? (
              <button
                type="button"
                onClick={() => onStartEdit(opt)}
                title="Edit option"
                className="cursor-pointer rounded p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            ) : undefined
          }
        />
      )}
    </div>
  )
}
