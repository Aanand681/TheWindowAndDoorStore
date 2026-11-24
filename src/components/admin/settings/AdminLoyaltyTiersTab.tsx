"use client"

import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Award, Edit2, Trash2, RotateCcw } from "lucide-react"
import { ILoyaltyTier, DEFAULT_LOYALTY_TIERS } from "@/lib/loyalty/loyalty-engine"
import { LoyaltyTierModal } from "./LoyaltyTierModal"

interface AdminLoyaltyTiersTabProps {
  loyaltyTiers: ILoyaltyTier[]
  setLoyaltyTiers: React.Dispatch<React.SetStateAction<ILoyaltyTier[]>>
  loading?: boolean
}

export function AdminLoyaltyTiersTab({
  loyaltyTiers,
  setLoyaltyTiers,
  loading = false,
}: AdminLoyaltyTiersTabProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTier, setEditingTier] = useState<ILoyaltyTier | null>(null)

  const handleOpenAdd = () => {
    setEditingTier(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (tier: ILoyaltyTier) => {
    setEditingTier(tier)
    setModalOpen(true)
  }

  const handleSaveTier = (savedTier: ILoyaltyTier) => {
    setLoyaltyTiers((prev) => {
      const idx = prev.findIndex((t) => t.id === savedTier.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = savedTier
        return next
      }
      return [...prev, savedTier].sort((a, b) => a.points - b.points)
    })
  }

  const handleDeleteTier = (id: string) => {
    if (confirm("Are you sure you want to delete this loyalty tier?")) {
      setLoyaltyTiers((prev) => prev.filter((t) => t.id !== id))
    }
  }

  const handleResetDefaults = () => {
    if (confirm("Reset all loyalty tiers to business defaults?")) {
      setLoyaltyTiers(DEFAULT_LOYALTY_TIERS)
    }
  }

  const handleToggleActive = (id: string) => {
    setLoyaltyTiers((prev) =>
      prev.map((t) => (t.id === id ? { ...t, isActive: !t.isActive } : t))
    )
  }

  return (
    <>
      <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl">
        <CardHeader className="flex flex-col items-start justify-between gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-amber-500/15 p-1.5 text-amber-500">
                <Award className="h-5 w-5" />
              </span>
              <CardTitle className="text-xl">Loyalty Points Program</CardTitle>
            </div>
            <CardDescription className="mt-1">
              Configure point thresholds, minimum qualifying materials purchase, and tax-inclusive reward values.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              className="cursor-pointer gap-1.5 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Defaults</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleOpenAdd}
              className="cursor-pointer gap-1.5 shadow-md"
            >
              <Plus className="h-4 w-4" />
              <span>Add Loyalty Tier</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted-foreground animate-pulse">
              Loading loyalty tiers...
            </div>
          ) : loyaltyTiers.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No loyalty tiers configured. Click &quot;Add Loyalty Tier&quot; or &quot;Reset Defaults&quot;.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/50 text-xs text-muted-foreground">
                    <th className="pb-3 font-semibold">Points Required</th>
                    <th className="pb-3 font-semibold">Min. Materials Base</th>
                    <th className="pb-3 font-semibold">Customer Savings</th>
                    <th className="pb-3 font-semibold">Pre-Tax Ledger Value</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {loyaltyTiers.map((tier) => (
                    <tr key={tier.id} className="transition-colors hover:bg-muted/30">
                      <td className="py-3.5 font-mono font-bold text-foreground">
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs text-amber-500 font-bold border border-amber-500/20">
                          {tier.points.toLocaleString()} pts
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-xs">
                        ${tier.minPurchase.toFixed(2)}
                      </td>
                      <td className="py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-base text-foreground">
                            ${tier.rewardAmount.toFixed(2)}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            tier.isTaxInclusive !== false
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                              : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
                          }`}>
                            {tier.isTaxInclusive !== false ? "Incl. 13% HST" : "Excl. Tax"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono text-xs text-muted-foreground">
                        ${tier.preTaxAmount.toFixed(2)}
                      </td>
                      <td className="py-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(tier.id)}
                          className={`cursor-pointer rounded-full px-2 py-0.5 text-[11px] font-bold transition-all ${
                            tier.isActive !== false
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {tier.isActive !== false ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(tier)}
                            className="h-8 w-8 cursor-pointer hover:text-primary"
                            title="Edit Tier"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteTier(tier.id)}
                            className="h-8 w-8 cursor-pointer hover:text-destructive"
                            title="Delete Tier"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <LoyaltyTierModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveTier}
        editingTier={editingTier}
      />
    </>
  )
}
