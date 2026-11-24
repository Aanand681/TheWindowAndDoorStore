"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Award, Tag, Edit3, X, Check, AlertCircle, Plus } from "lucide-react"
import {
  ILoyaltyTier,
  DEFAULT_LOYALTY_TIERS,
  calculateLoyaltyPreTaxDiscount,
} from "@/lib/loyalty/loyalty-engine"

export interface DiscountLoyaltySelectorProps {
  loyaltyDiscount: string
  setLoyaltyDiscount: (val: string) => void
  loyaltyDiscountLabel?: string
  setLoyaltyDiscountLabel?: (val: string) => void
  discountType?: "none" | "custom" | "loyalty"
  setDiscountType?: (val: "none" | "custom" | "loyalty") => void
  loyaltyGrossAmount?: number
  setLoyaltyGrossAmount?: (val: number) => void
  loyaltyPoints?: number
  setLoyaltyPoints?: (val: number) => void
  combinedMaterials: number
  otherDiscounts?: number // All existing base discounts (window promo + door promo)
  hstRate?: number
  isFirstNation?: boolean
  isReadOnly?: boolean
}

export function DiscountLoyaltySelector({
  loyaltyDiscount,
  setLoyaltyDiscount,
  loyaltyDiscountLabel = "",
  setLoyaltyDiscountLabel,
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
  const [tab, setTab] = useState<"loyalty" | "custom">(
    discountType === "custom" ? "custom" : "loyalty"
  )
  const [customLabel, setCustomLabel] = useState(loyaltyDiscountLabel || "Special Courtesy Discount")
  const [customAmount, setCustomAmount] = useState(loyaltyDiscount || "")
  const [customLoyaltyGross, setCustomLoyaltyGross] = useState<string>(
    loyaltyGrossAmount > 0 ? loyaltyGrossAmount.toString() : "50"
  )

  useEffect(() => {
    let active = true
    async function fetchTiers() {
      try {
        const res = await fetch("/api/settings")
        if (!res.ok) return
        const data = await res.json()
        if (active && Array.isArray(data.loyaltyTiers) && data.loyaltyTiers.length > 0) {
          setTiers(data.loyaltyTiers)
        }
      } catch {
        // Keep default tiers
      }
    }
    fetchTiers()
    return () => { active = false }
  }, [])

  const currentPreTax = parseFloat(loyaltyDiscount) || 0
  const qualifyingBase = Math.max(0, Math.round((combinedMaterials - (otherDiscounts || 0)) * 100) / 100)
  const qualifiedTiers = tiers.filter((t) => t.isActive !== false && qualifyingBase >= t.minPurchase)

  const handleSelectTier = (tier: ILoyaltyTier) => {
    const preTax = calculateLoyaltyPreTaxDiscount(
      tier.rewardAmount,
      tier.isTaxInclusive !== false,
      hstRate,
      isFirstNation
    )
    setDiscountType?.("loyalty")
    setLoyaltyPoints?.(tier.points)
    setLoyaltyGrossAmount?.(tier.rewardAmount)
    setLoyaltyDiscountLabel?.(`Loyalty Points (${tier.points.toLocaleString()} pts — $${tier.rewardAmount.toFixed(2)} incl. tax)`)
    setLoyaltyDiscount(preTax.toFixed(2))
    setIsEditing(false)
  }

  const handleApplyCustomLoyaltyGross = () => {
    const gross = parseFloat(customLoyaltyGross) || 0
    if (gross <= 0) {
      handleClear()
      return
    }
    const preTax = calculateLoyaltyPreTaxDiscount(gross, true, hstRate, isFirstNation)
    setDiscountType?.("loyalty")
    setLoyaltyPoints?.(0)
    setLoyaltyGrossAmount?.(gross)
    setLoyaltyDiscountLabel?.(`Loyalty Discount ($${gross.toFixed(2)} incl. tax)`)
    setLoyaltyDiscount(preTax.toFixed(2))
    setIsEditing(false)
  }

  const handleApplyCustom = () => {
    const val = parseFloat(customAmount) || 0
    if (val <= 0) {
      handleClear()
      return
    }
    setDiscountType?.("custom")
    setLoyaltyDiscountLabel?.(customLabel.trim() || "Additional Discount")
    setLoyaltyDiscount(val.toFixed(2))
    setIsEditing(false)
  }

  const handleClear = () => {
    setDiscountType?.("none")
    setLoyaltyDiscount("")
    setLoyaltyDiscountLabel?.("")
    setLoyaltyPoints?.(0)
    setLoyaltyGrossAmount?.(0)
    setIsEditing(false)
  }

  // 1. COLLAPSED WITH ACTIVE DISCOUNT
  if (!isEditing && currentPreTax > 0) {
    return (
      <div className="flex items-center justify-between py-1 text-xs sm:text-sm font-medium text-emerald-600 dark:text-emerald-400">
        <div className="flex items-center gap-1.5 truncate">
          {discountType === "loyalty" ? (
            <Award className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          ) : (
            <Tag className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
          )}
          <span className="truncate">
            {loyaltyDiscountLabel || (loyaltyPoints > 0 ? `Loyalty Points (${loyaltyPoints.toLocaleString()} pts)` : "Additional Discount")}
          </span>
          {!isReadOnly && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="cursor-pointer ml-1 p-0.5 text-muted-foreground hover:text-foreground"
              title="Edit additional discount"
            >
              <Edit3 className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0 font-mono font-bold whitespace-nowrap">
          <span>-${currentPreTax.toFixed(2)}</span>
          {!isReadOnly && (
            <button
              type="button"
              onClick={handleClear}
              className="cursor-pointer text-muted-foreground hover:text-destructive"
              title="Remove"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // 2. COLLAPSED WITHOUT ACTIVE DISCOUNT
  if (!isEditing) {
    if (isReadOnly) return null
    return (
      <div className="py-0.5">
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-medium text-primary/80 hover:text-primary hover:underline"
        >
          <Plus className="h-3 w-3" />
          <span>Add Loyalty Points or Extra Discount</span>
        </button>
      </div>
    )
  }

  // 3. EDIT / SELECTION CARD (Clean Professional Card)
  return (
    <div className="my-2 rounded-xl border border-border/80 bg-card p-3 shadow-sm space-y-2.5 text-xs">
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <div className="flex items-center gap-1.5 font-bold text-foreground">
          <Award className="h-3.5 w-3.5 text-amber-500" />
          <span>Add Additional Discount</span>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="cursor-pointer rounded p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Segmented Tab Control */}
      <div className="flex rounded-lg bg-muted/60 p-0.5">
        <button
          type="button"
          onClick={() => setTab("loyalty")}
          className={`flex-1 rounded-md py-1 text-center font-medium transition-all ${
            tab === "loyalty"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Loyalty Points
        </button>
        <button
          type="button"
          onClick={() => setTab("custom")}
          className={`flex-1 rounded-md py-1 text-center font-medium transition-all ${
            tab === "custom"
              ? "bg-background text-foreground shadow-xs font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Custom Extra Discount
        </button>
      </div>

      {/* TAB 1: LOYALTY POINTS (ONLY QUALIFIED TIERS SHOWN) */}
      {tab === "loyalty" && (
        <div className="space-y-2 pt-0.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Qualifying Materials Base:</span>
            <span className="font-mono font-semibold text-foreground">
              ${qualifyingBase.toFixed(2)}
              {otherDiscounts > 0 && ` (after -$${otherDiscounts.toFixed(2)} promo)`}
            </span>
          </div>

          {qualifiedTiers.length > 0 ? (
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-foreground">
                Qualified Loyalty Rewards:
              </label>
              <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto">
                {qualifiedTiers.map((t) => {
                  const preTax = calculateLoyaltyPreTaxDiscount(
                    t.rewardAmount,
                    t.isTaxInclusive !== false,
                    hstRate,
                    isFirstNation
                  )
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleSelectTier(t)}
                      className="cursor-pointer flex items-center justify-between rounded-lg border border-border/70 bg-muted/20 px-2.5 py-1.5 text-left transition hover:border-amber-500/60 hover:bg-amber-500/5"
                    >
                      <div>
                        <div className="font-semibold text-foreground">
                          {t.points.toLocaleString()} Points
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Min purchase: ${t.minPurchase.toFixed(2)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-amber-600 dark:text-amber-400">
                          ${t.rewardAmount.toFixed(2)} off (incl. tax)
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          Pre-tax: -${preTax.toFixed(2)}
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5 text-[11px] text-amber-800 dark:text-amber-300">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
              <span>
                No loyalty tiers qualified. Minimum purchase of $167.00 combined materials required after other discounts (current: ${qualifyingBase.toFixed(2)}).
              </span>
            </div>
          )}

          {/* Optional manual gross loyalty amount */}
          <div className="pt-1 border-t border-border/40">
            <details className="text-[11px] text-muted-foreground">
              <summary className="cursor-pointer font-medium hover:text-foreground">
                Or enter custom loyalty amount ($ incl. tax)...
              </summary>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={customLoyaltyGross}
                  onChange={(e) => setCustomLoyaltyGross(e.target.value)}
                  placeholder="50.00"
                  className="h-8 font-mono text-xs font-semibold"
                />
                <Button type="button" size="sm" onClick={handleApplyCustomLoyaltyGross} className="h-8 gap-1 text-xs shrink-0">
                  <Check className="h-3 w-3" /> Apply
                </Button>
              </div>
            </details>
          </div>
        </div>
      )}

      {/* TAB 2: CUSTOM EXTRA DISCOUNT */}
      {tab === "custom" && (
        <div className="space-y-2 pt-0.5">
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground">Discount Label</label>
            <Input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="e.g. Builder Courtesy Discount"
              className="mt-0.5 h-8 text-xs"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-muted-foreground">Pre-Tax Amount ($)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="0.00"
              className="mt-0.5 h-8 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400"
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
    </div>
  )
}
