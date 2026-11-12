"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Percent } from "lucide-react"

interface CreatePromoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreatePromoModal({
  isOpen,
  onClose,
  onSuccess,
}: CreatePromoModalProps) {
  const [name, setName] = useState("")
  const [type, setType] = useState("BOGO")
  const [buyQty, setBuyQty] = useState("")
  const [getQty, setGetQty] = useState("")
  const [freeComponents, setFreeComponents] = useState<string[]>([])
  const [discountPercentage, setDiscountPercentage] = useState("")
  const [applyAfter, setApplyAfter] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen) return null

  const toggleComponent = (comp: string) => {
    if (freeComponents.includes(comp)) {
      setFreeComponents(freeComponents.filter((c) => c !== comp))
    } else {
      setFreeComponents([...freeComponents, comp])
    }
  }

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSaving(true)

    const payload: any = { name, type, isActive: true }

    if (type === "BOGO") {
      payload.buyQty = parseInt(buyQty)
      payload.getQty = parseInt(getQty)
    } else if (type === "FREE_PARTS") {
      payload.freeComponents = freeComponents
    } else if (type === "PERCENTAGE") {
      payload.discountPercentage = parseFloat(discountPercentage)
    } else if (type === "COMBO") {
      payload.freeComponents = freeComponents
      payload.discountPercentage = parseFloat(discountPercentage)
      payload.applyPercentageAfterFreeParts = applyAfter
    }

    try {
      const res = await fetch("/api/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setName("")
      setType("BOGO")
      setBuyQty("")
      setGetQty("")
      setFreeComponents([])
      setDiscountPercentage("")
      setApplyAfter(false)
      onSuccess()
      onClose()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg animate-in overflow-y-auto rounded-xl border border-border bg-card p-6 shadow-2xl duration-200 zoom-in-95 fade-in">
        <h3 className="mb-2 flex items-center gap-2 text-xl font-bold">
          <Plus className="h-5 w-5 text-primary" />
          Create New Promo
        </h3>
        <p className="mb-6 text-sm text-muted-foreground">
          Build a dynamic formula for your sales event.
        </p>

        <form onSubmit={handleCreatePromo} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">
              Promo Name (e.g., &quot;Summer Sale 2026&quot;)
            </Label>
            <Input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Calculation Engine Type</Label>
            <select
              id="type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="BOGO">Buy X, Get Y Free</option>
              <option value="FREE_PARTS">
                Free Components (Argon, Solar, etc.)
              </option>
              <option value="PERCENTAGE">Flat Percentage Off Base Price</option>
              <option value="COMBO">Combo (Free Parts + Percentage Off)</option>
            </select>
          </div>

          {type === "BOGO" && (
            <div className="grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/30 p-4">
              <div className="space-y-2">
                <Label htmlFor="buyQty">Buy Qty</Label>
                <Input
                  id="buyQty"
                  type="number"
                  min="1"
                  required
                  value={buyQty}
                  onChange={(e) => setBuyQty(e.target.value)}
                  className="bg-background"
                  placeholder="e.g. 2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="getQty">Get Qty (Free)</Label>
                <Input
                  id="getQty"
                  type="number"
                  min="1"
                  required
                  value={getQty}
                  onChange={(e) => setGetQty(e.target.value)}
                  className="bg-background"
                  placeholder="e.g. 2"
                />
              </div>
            </div>
          )}

          {(type === "FREE_PARTS" || type === "COMBO") && (
            <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
              <Label>Select Free Components</Label>
              <div className="flex flex-wrap gap-3">
                {["argon", "solar", "triple"].map((comp) => (
                  <label
                    key={comp}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm hover:border-primary/50"
                  >
                    <input
                      type="checkbox"
                      checked={freeComponents.includes(comp)}
                      onChange={() => toggleComponent(comp)}
                      className="accent-primary"
                    />
                    <span className="capitalize">{comp}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {(type === "PERCENTAGE" || type === "COMBO") && (
            <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-4">
              <Label htmlFor="discountPercentage">Percentage Off</Label>
              <div className="relative">
                <Percent className="absolute top-2.5 left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="discountPercentage"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  required
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  className="bg-background pl-9"
                  placeholder="e.g. 5"
                />
              </div>

              {type === "COMBO" && (
                <label className="mt-3 flex cursor-pointer items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={applyAfter}
                    onChange={(e) => setApplyAfter(e.target.checked)}
                    className="accent-primary"
                  />
                  <span>
                    Apply percentage discount AFTER subtracting the free
                    components cost.
                  </span>
                </label>
              )}
            </div>
          )}

          {error && (
            <div className="rounded bg-destructive/10 p-2 text-sm font-medium text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Create Promo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
