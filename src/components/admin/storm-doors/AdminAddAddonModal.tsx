"use client"

import React, { useState } from "react"
import { X, Plus, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { StormDoorAddonOption } from "@/lib/doors/storm-door-types"

export interface AdminAddAddonModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (addon: StormDoorAddonOption) => void
}

export function AdminAddAddonModal({
  isOpen,
  onClose,
  onAdd,
}: AdminAddAddonModalProps) {
  const [label, setLabel] = useState("")
  const [price, setPrice] = useState("")
  const [applicableStyles, setApplicableStyles] = useState("")
  const [description, setDescription] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!label.trim()) return

    const id = `addon_${label.toLowerCase().replace(/[^a-z0-9]/g, "_")}_${Date.now()}`
    const styles = applicableStyles
      ? applicableStyles.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined

    const addon: StormDoorAddonOption = {
      id,
      label: label.trim(),
      price: parseFloat(price) || 0,
      applicableStyles: styles,
      description: description.trim(),
      active: true,
      sortOrder: 99,
    }

    onAdd(addon)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="flex max-h-[90vh] w-full max-w-md flex-col rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/50 p-4">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-primary/10 p-1.5 text-primary">
              <Sparkles className="h-5 w-5" />
            </span>
            <h3 className="text-base font-bold text-foreground">Add New Storm Door Add-on</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto">
          <div className="space-y-1">
            <Label className="text-xs">Add-on Label</Label>
            <Input
              placeholder="e.g. Interchangeable Screen Insert"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Price ($)</Label>
            <Input
              type="number"
              step="0.01"
              placeholder="73.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Applicable Styles (comma separated)</Label>
            <Input
              placeholder="e.g. one_lite, full_view (leave empty for all doors)"
              value={applicableStyles}
              onChange={(e) => setApplicableStyles(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Input
              placeholder="Details about this add-on or accessory"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border/40">
            <Button type="button" variant="outline" onClick={onClose} size="sm">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="gap-1.5 font-semibold">
              <Plus className="h-3.5 w-3.5" />
              <span>Create Add-on</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
