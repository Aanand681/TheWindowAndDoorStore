"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckSquare } from "lucide-react"

interface ConfirmOdooEntryModalProps {
  odooModalQuote: any
  setOdooModalQuote: (val: any) => void
  odooOrderNum: string
  setOdooOrderNum: (val: string) => void
  markingOdoo: boolean
  handleConfirmOdooEntry: () => void
}

export function ConfirmOdooEntryModal({
  odooModalQuote,
  setOdooModalQuote,
  odooOrderNum,
  setOdooOrderNum,
  markingOdoo,
  handleConfirmOdooEntry,
}: ConfirmOdooEntryModalProps) {
  if (!odooModalQuote) return null

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-background/80 p-4 backdrop-blur-sm duration-200 fade-in">
      <div className="w-full max-w-md space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl">
        <div className="flex items-center gap-2.5 border-b border-border pb-3">
          <div className="rounded-lg bg-emerald-500/15 p-2 text-emerald-500">
            <CheckSquare className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Confirm Odoo Entry &bull; Quote #{odooModalQuote.quoteNumber}
            </h3>
            <p className="text-xs text-muted-foreground">
              Customer: <strong>{odooModalQuote.customerName}</strong>
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="odooOrderRef"
            className="flex items-center justify-between text-xs font-semibold"
          >
            <span>Odoo Sales Order #</span>
            <span className="text-[10px] font-semibold text-destructive">
              * Required &amp; Unique
            </span>
          </Label>
          <Input
            id="odooOrderRef"
            placeholder="e.g. SO-10492"
            value={odooOrderNum}
            onChange={(e) => setOdooOrderNum(e.target.value)}
            className="font-mono text-xs"
            required
          />
          <p className="text-[11px] text-muted-foreground">
            Confirm that you have entered all order specifications into the Odoo
            software and attached the printed quote to the physical shop folder.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setOdooModalQuote(null)
              setOdooOrderNum("")
            }}
            disabled={markingOdoo}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirmOdooEntry}
            disabled={markingOdoo || !odooOrderNum.trim()}
            className="cursor-pointer bg-emerald-600 font-bold text-white hover:bg-emerald-700"
          >
            {markingOdoo ? "Confirming..." : "Confirm Odoo Entry"}
          </Button>
        </div>
      </div>
    </div>
  )
}
