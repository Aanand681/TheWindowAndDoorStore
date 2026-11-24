"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X, Award, Info, Percent } from "lucide-react"
import { ILoyaltyTier, calculateLoyaltyPreTaxDiscount } from "@/lib/loyalty/loyalty-engine"

interface LoyaltyTierModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (tier: ILoyaltyTier) => void
  editingTier?: ILoyaltyTier | null
}

function createTierId(points: number): string {
  return `loyalty_${points}_${Date.now()}`
}

export function LoyaltyTierModal({
  isOpen,
  onClose,
  onSave,
  editingTier,
}: LoyaltyTierModalProps) {
  const [points, setPoints] = useState<string>("1000")
  const [minPurchase, setMinPurchase] = useState<string>("167")
  const [rewardAmount, setRewardAmount] = useState<string>("50")
  const [isTaxInclusive, setIsTaxInclusive] = useState<boolean>(true)
  const [isActive, setIsActive] = useState<boolean>(true)

  useEffect(() => {
    if (editingTier) {
      setPoints(editingTier.points.toString())
      setMinPurchase(editingTier.minPurchase.toString())
      setRewardAmount(editingTier.rewardAmount.toString())
      setIsTaxInclusive(editingTier.isTaxInclusive !== false)
      setIsActive(editingTier.isActive !== false)
    } else {
      setPoints("1000")
      setMinPurchase("167")
      setRewardAmount("50")
      setIsTaxInclusive(true)
      setIsActive(true)
    }
  }, [editingTier, isOpen])

  if (!isOpen) return null

  const numPoints = parseInt(points, 10) || 0
  const numMinPurchase = parseFloat(minPurchase) || 0
  const numReward = parseFloat(rewardAmount) || 0
  const computedPreTax = calculateLoyaltyPreTaxDiscount(numReward, isTaxInclusive, 13, false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (numPoints <= 0 || numReward <= 0) return

    const tierId = editingTier?.id || createTierId(numPoints)
    const tier: ILoyaltyTier = {
      id: tierId,
      points: numPoints,
      minPurchase: numMinPurchase,
      rewardAmount: numReward,
      isTaxInclusive,
      preTaxAmount: computedPreTax,
      isActive,
      label: `${numPoints.toLocaleString()} Points ($${numReward.toFixed(2)})`,
    }

    onSave(tier)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-amber-500/15 p-2 text-amber-500">
              <Award className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-bold">
              {editingTier ? "Edit Loyalty Tier" : "Add Loyalty Tier"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Points */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Loyalty Points Required</Label>
            <Input
              type="number"
              min="1"
              value={points}
              onChange={(e) => setPoints(e.target.value)}
              placeholder="e.g. 1000"
              required
              className="font-mono"
            />
          </div>

          {/* Minimum Purchase */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Minimum Qualifying Purchase ($ Materials - Discounts)
            </Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={minPurchase}
              onChange={(e) => setMinPurchase(e.target.value)}
              placeholder="e.g. 167.00"
              required
              className="font-mono"
            />
            <p className="text-[11px] text-muted-foreground">
              Qualifying base is calculated as total combined materials minus other discounts.
            </p>
          </div>

          {/* Reward Amount */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Reward Value ($)</Label>
            <Input
              type="number"
              step="0.01"
              min="0.01"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(e.target.value)}
              placeholder="e.g. 50.00"
              required
              className="font-mono text-base font-bold text-primary"
            />
          </div>

          {/* Tax Inclusivity Choice */}
          <div className="rounded-xl border border-border/70 bg-muted/40 p-3.5 space-y-2.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Percent className="h-3.5 w-3.5 text-primary" />
              Tax Status for this Reward Value:
            </Label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsTaxInclusive(true)}
                className={`cursor-pointer rounded-lg border p-2.5 text-left transition-all ${
                  isTaxInclusive
                    ? "border-amber-500 bg-amber-500/10 font-bold text-amber-500 ring-1 ring-amber-500/30"
                    : "border-border/60 bg-card hover:bg-muted"
                }`}
              >
                <div className="font-semibold">Includes 13% HST</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  e.g. $50 total savings
                </div>
              </button>

              <button
                type="button"
                onClick={() => setIsTaxInclusive(false)}
                className={`cursor-pointer rounded-lg border p-2.5 text-left transition-all ${
                  !isTaxInclusive
                    ? "border-primary bg-primary/10 font-bold text-primary ring-1 ring-primary/30"
                    : "border-border/60 bg-card hover:bg-muted"
                }`}
              >
                <div className="font-semibold">Excludes Tax</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  Pre-tax discount
                </div>
              </button>
            </div>

            {/* Calculated Breakdown Preview */}
            <div className="flex items-center justify-between rounded-lg bg-card/80 p-2.5 text-xs border border-border/50">
              <span className="text-muted-foreground">Pre-Tax Ledger Discount:</span>
              <span className="font-mono font-bold text-foreground">
                ${computedPreTax.toFixed(2)}
              </span>
            </div>
            {isTaxInclusive && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Info className="h-3 w-3 shrink-0 text-amber-500" />
                Customer gets exact ${numReward.toFixed(2)} total savings off invoice total.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
            <Button type="button" variant="outline" size="sm" onClick={onClose} className="cursor-pointer">
              Cancel
            </Button>
            <Button type="submit" size="sm" className="cursor-pointer gap-1.5 shadow-md">
              <Award className="h-4 w-4" />
              <span>{editingTier ? "Save Changes" : "Add Tier"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
