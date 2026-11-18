"use client"

import React from "react"
import { Scale, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface CompareHeaderBarProps {
  title: string
  quoteNumber?: string
  customerName?: string
  onClose: () => void
}

export function CompareHeaderBar({
  title,
  quoteNumber,
  customerName,
  onClose,
}: CompareHeaderBarProps) {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-4">
      <div className="flex items-center gap-2.5">
        <div className="rounded-xl border border-primary/20 bg-primary/10 p-2 text-primary shadow-xs">
          <Scale className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight sm:text-lg">
              {title}
            </h2>
            <span className="rounded-full border border-primary/25 bg-primary/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary uppercase">
              Supply vs. Install
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {customerName ? `${customerName} • ` : ""}
            {quoteNumber ? `Quote #${quoteNumber} • ` : ""}
            Side-by-side pricing evaluation
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="h-8 w-8 cursor-pointer rounded-full text-muted-foreground hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

