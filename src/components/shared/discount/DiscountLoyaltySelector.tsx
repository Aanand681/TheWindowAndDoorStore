"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Award, Tag, Edit3, X, Check, AlertTriangle } from "lucide-react"
import {
  ILoyaltyTier,
  DEFAULT_LOYALTY_TIERS,
  calculateLoyaltyPreTaxDiscount,
  checkLoyaltyQualification,
} from "@/lib/loyalty/loyalty-engine"

export interface DiscountLoyaltyState {
  discountType: "none" | "custom" | "loyalty"
  customDiscount: string // pre-tax amount for engine
  customDiscountLabel: string
  loyaltyPoints?: number
  loyaltyGrossAmount?: number
  loyaltyTierId?: string
}

export interface DiscountLoyaltySelectorProps {
  customDiscount: string
  setCustomDiscount: (val: string) => void
  customDiscountLabel?: string
  setCustomDiscountLabel?: (val: string) => void
  discountType?: "none" | "custom" | "loyalty"
  setDiscountType?: (val: "none" | "custom" | "loyalty") => void
  loyaltyGrossAmount?: number
  setLoyaltyGrossAmount?: (val: number) => void
  loyaltyPoints?: number
  setLoyaltyPoints?: (val: number) => void
  combinedMaterials: number
  otherDiscounts?: number
  hstRate?: number
  isFirstNation?: boolean
  isReadOnly?: boolean
}

export function DiscountLoyaltySelector({
  customDiscount,
  setCustomDiscount,
  customDiscountLabel = "",
  setCustomDiscountLabel,
  discountType = "none",
  setDiscountType,
  loyaltyGrossAmount = 0,
  setLoyaltyGrossAmount,
  loyaltyPoints = 0,
  setLoyaltyPoints,
  combinedMaterials,
  otherDiscounts = 0,
  hstRate = 13,
  isFirstNation = false,
  isReadOnly = false,
}: DiscountLoyaltySelectorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [tiers, setTiers] = useState<ILoyaltyTier[]>(DEFAULT_LOYALTY_TIERS)
  const [selectedType, setSelectedType] = useState<"none" | "custom" | "loyalty">(
    discountType !== "none" ? discountType : customDiscount ? "custom" : "none"
  )
  const [manualLabel, setManualLabel] = useState(customDiscountLabel || "Special Discount")
  const [manualPrice, setManualPrice] = useState(customDiscount || "")
  const [selectedTierId, setSelectedTierId] = useState<string>("")
  const [manualLoyaltyGross, setManualLoyaltyGross] = useState<string>(
    loyaltyGrossAmount > 0 ? loyaltyGrossAmount.toString() : "50"
  )

  useEffect(() => {
    let isMounted = true
    async function loadTiers() {
      try {
        const res = await fetch("/api/settings")
        if (!res.ok) return
        const data = await res.json()
        if (isMounted && Array.isArray(data.loyaltyTiers) && data.loyaltyTiers.length > 0) {
          setTiers(data.loyaltyTiers)
        }
      } catch {
        // Fallback to DEFAULT_LOYALTY_TIERS
      }
    }
    loadTiers()
    return () => {
      isMounted = false
    }
  }, [])

  const currentPreTaxValue = parseFloat(customDiscount) || 0

  const handleApplyCustom = () => {
    const val = parseFloat(manualPrice) || 0
    if (val <= 0) {
      handleClear()
      return
    }
    setDiscountType?.("custom")
    setCustomDiscountLabel?.(manualLabel.trim() || "Discount")
    setCustomDiscount(val.toFixed(2))
    setIsEditing(false)
  }

  const handleApplyLoyaltyTier = (tier: ILoyaltyTier) => {
    const preTax = calculateLoyaltyPreTaxDiscount(
      tier.rewardAmount,
      tier.isTaxInclusive !== false,
      hstRate,
      isFirstNation
    )
    setDiscountType?.("loyalty")
    setLoyaltyPoints?.(tier.points)
    setLoyaltyGrossAmount?.(tier.rewardAmount)
    setCustomDiscountLabel?.(`Loyalty Points (${tier.points.toLocaleString()} pts)`)
    setCustomDiscount(preTax.toFixed(2))
    setSelectedTierId(tier.id)
    setIsEditing(false)
  }

  const handleApplyManualLoyalty = () => {
    const gross = parseFloat(manualLoyaltyGross) || 0
    if (gross <= 0) {
      handleClear()
      return
    }
    const preTax = calculateLoyaltyPreTaxDiscount(gross, true, hstRate, isFirstNation)
    setDiscountType?.("loyalty")
    setLoyaltyPoints?.(0)
    setLoyaltyGrossAmount?.(gross)
    setCustomDiscountLabel?.(`Loyalty Points ($${gross.toFixed(2)} incl. tax)`)
    setCustomDiscount(preTax.toFixed(2))
    setIsEditing(false)
  }

  const handleClear = () => {
    setDiscountType?.("none")
    setCustomDiscount("")
    setCustomDiscountLabel?.("")
    setLoyaltyPoints?.(0)
    setLoyaltyGrossAmount?.(0)
    setSelectedTierId("")
    setIsEditing(false)
  }

  const activeTier = tiers.find((t) => t.id === selectedTierId)
  const qualification = activeTier
    ? checkLoyaltyQualification(combinedMaterials, otherDiscounts, activeTier.minPurchase)
    : { isQualified: true, shortage: 0 }

  if (!isEditing) {
    if (currentPreTaxValue > 0) {
      return (
        <div className="flex items-center justify-between py-1 text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <div className="flex items-center gap-1.5 truncate">
            {discountType === "loyalty" ? (
              <Award className="h-3.5 w-3.5 shrink-0 text-amber-500" />
            ) : (
              <Tag className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
            )}
            <span className="truncate">
              {customDiscountLabel || (loyaltyPoints > 0 ? `Loyalty Points (${loyaltyPoints.toLocaleString()} pts)` : "Discount")}
            </span>
            {!isReadOnly && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="cursor-pointer ml-1 p-0.5 text-muted-foreground hover:text-foreground"
                title="Edit discount"
              >
                <Edit3 className="h-3 w-3" />
              </button>
            )}
          </div>
          <span className="shrink-0 font-mono font-bold whitespace-nowrap">
            -${currentPreTaxValue.toFixed(2)}
          </span>
        </div>
      )
    }

    if (isReadOnly) return null

    return (
      <div className="py-1">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
        >
          <Tag className="h-3 w-3" />
          <span>+ Add Discount or Loyalty Points</span>
        </button>
      </div>
    )
  }

  return (
    <div className="my-2 rounded-xl border border-border/80 bg-muted/30 p-3 text-xs space-y-3">
      <div className="flex items-center justify-between border-b border-border/40 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <Tag className="h-3.5 w-3.5 text-primary" />
          <span>Discount &amp; Loyalty Program</span>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="cursor-pointer rounded p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="space-y-1">
        <Label className="text-[11px] font-semibold text-muted-foreground">Select Discount Program</Label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as any)}
          className="w-full rounded-lg border border-border/70 bg-card px-2.5 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="none">No Discount</option>
          <option value="custom">Manual Custom Discount (Label + Price)</option>
          <option value="loyalty">Loyalty Points Redemption (Incl. 13% HST)</option>
        </select>
      </div>

      {selectedType === "custom" && (
        <div className="space-y-2.5 pt-1">
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold">Discount Label</Label>
            <Input
              type="text"
              value={manualLabel}
              onChange={(e) => setManualLabel(e.target.value)}
              placeholder="e.g. Builder Discount, Friends & Family"
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold">Discount Amount ($)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={manualPrice}
              onChange={(e) => setManualPrice(e.target.value)}
              placeholder="0.00"
              className="h-8 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400"
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="outline" size="sm" onClick={handleClear} className="h-7 text-xs">
              Clear
            </Button>
            <Button type="button" size="sm" onClick={handleApplyCustom} className="h-7 gap-1 text-xs">
              <Check className="h-3 w-3" /> Apply
            </Button>
          </div>
        </div>
      )}

      {selectedType === "loyalty" && (
        <div className="space-y-2.5 pt-1">
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold flex items-center justify-between">
              <span>Choose Loyalty Tier</span>
              <span className="text-[10px] text-muted-foreground">
                Materials Base: ${combinedMaterials.toFixed(2)}
              </span>
            </Label>
            <select
              value={selectedTierId}
              onChange={(e) => {
                const id = e.target.value
                setSelectedTierId(id)
                const found = tiers.find((t) => t.id === id)
                if (found) handleApplyLoyaltyTier(found)
              }}
              className="w-full rounded-lg border border-border/70 bg-card px-2.5 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="">Select configured loyalty tier...</option>
              {tiers.filter((t) => t.isActive !== false).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.points.toLocaleString()} pts — ${t.rewardAmount.toFixed(2)} (Min ${t.minPurchase.toFixed(2)} materials)
                </option>
              ))}
              <option value="custom_loyalty">Custom Loyalty Dollar Amount...</option>
            </select>
          </div>

          {selectedTierId && activeTier && !qualification.isQualified && (
            <div className="flex items-start gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-[11px] text-amber-700 dark:text-amber-300">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span>
                Minimum ${activeTier.minPurchase.toFixed(2)} combined materials required. (${qualification.shortage.toFixed(2)} more needed).
              </span>
            </div>
          )}

          {selectedTierId === "custom_loyalty" && (
            <div className="space-y-2 pt-1">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">
                  Loyalty Value ($ Including 13% HST)
                </Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={manualLoyaltyGross}
                  onChange={(e) => setManualLoyaltyGross(e.target.value)}
                  placeholder="50.00"
                  className="h-8 font-mono text-xs font-bold text-amber-500"
                />
                <p className="text-[10px] text-muted-foreground">
                  Original pre-tax value is automatically extracted: ${calculateLoyaltyPreTaxDiscount(parseFloat(manualLoyaltyGross) || 0, true, hstRate, isFirstNation).toFixed(2)}
                </p>
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button type="button" size="sm" onClick={handleApplyManualLoyalty} className="h-7 gap-1 text-xs">
                  <Check className="h-3 w-3" /> Apply
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
            <Button type="button" variant="ghost" size="sm" onClick={handleClear} className="h-7 text-xs text-muted-foreground hover:text-destructive">
              Remove Discount
            </Button>
            <span className="text-muted-foreground text-[10px]">
              Tiers deduct pre-tax discount to give exact customer savings.
            </span>
          </div>
        </div>
      )}

      {selectedType === "none" && currentPreTaxValue > 0 && (
        <div className="pt-1 text-right">
          <Button type="button" variant="outline" size="sm" onClick={handleClear} className="h-7 text-xs">
            Confirm Remove Discount
          </Button>
        </div>
      )}
    </div>
  )
}
