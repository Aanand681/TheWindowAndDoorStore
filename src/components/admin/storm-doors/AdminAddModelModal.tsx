"use client"

import React, { useState } from "react"
import { X, Plus, DoorClosed } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { StormDoorCatalogItem } from "@/lib/doors/storm-door-types"
import { COLORS_2_INCH } from "@/lib/doors/storm-door-catalog"

export interface AdminAddModelModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (model: StormDoorCatalogItem) => void
}

export function AdminAddModelModal({
  isOpen,
  onClose,
  onAdd,
}: AdminAddModelModalProps) {
  const [name, setName] = useState("")
  const [style, setStyle] = useState("")
  const [profile, setProfile] = useState('2"')
  const [standardPrice, setStandardPrice] = useState("")
  const [hiddenVentPrice, setHiddenVentPrice] = useState("")
  const [screenOnlyPrice, setScreenOnlyPrice] = useState("")
  const [inswingPrice, setInswingPrice] = useState("")
  const [description, setDescription] = useState("")

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const id = `${style || name.toLowerCase().replace(/\s+/g, "_")}_${profile.replace(/[^0-9]/g, "_")}`
    const model: StormDoorCatalogItem = {
      id: `${id}_${Date.now()}`,
      name: name.trim(),
      style: (style.trim() || name.toLowerCase().replace(/\s+/g, "_")) as any,
      profile: profile as any,
      standardPrice: parseFloat(standardPrice) || 0,
      hiddenVentPrice: hiddenVentPrice ? parseFloat(hiddenVentPrice) : undefined,
      screenOnlyPrice: screenOnlyPrice ? parseFloat(screenOnlyPrice) : undefined,
      inswingPrice: inswingPrice ? parseFloat(inswingPrice) : undefined,
      description: description.trim(),
      availableColors: COLORS_2_INCH,
      active: true,
      sortOrder: 99,
    }

    onAdd(model)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/50 p-4">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-primary/10 p-1.5 text-primary">
              <DoorClosed className="h-5 w-5" />
            </span>
            <h3 className="text-base font-bold text-foreground">Add New Storm Door Model</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Model Name</Label>
              <Input
                placeholder="e.g. Colonial View"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Profile</Label>
              <Input
                placeholder='e.g. 2" or 2-1/4"'
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Style Identifier</Label>
            <Input
              placeholder="e.g. colonial_view"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Standard Price ($)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={standardPrice}
                onChange={(e) => setStandardPrice(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Hidden Vent ($)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Optional"
                value={hiddenVentPrice}
                onChange={(e) => setHiddenVentPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Screen Only ($)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Optional"
                value={screenOnlyPrice}
                onChange={(e) => setScreenOnlyPrice(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Inswing ($)</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Optional"
                value={inswingPrice}
                onChange={(e) => setInswingPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Description</Label>
            <Input
              placeholder="Door features and specifications"
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
              <span>Create Model</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
