"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShieldCheck, Plus, Trash2, RotateCcw } from "lucide-react"
import { ILabourUpgradeTier } from "@/lib/promo-logic"

export interface LabourUpgradeTiersCardProps {
  tiers: ILabourUpgradeTier[]
  loading: boolean
  handleResetTiers: () => void
  handleAddTier: () => void
  handleTierChange: (
    index: number,
    field: keyof ILabourUpgradeTier,
    value: any
  ) => void
  handleRemoveTier: (index: number) => void
}

export function LabourUpgradeTiersCard({
  tiers,
  loading,
  handleResetTiers,
  handleAddTier,
  handleTierChange,
  handleRemoveTier,
}: LabourUpgradeTiersCardProps) {
  return (
    <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl">
      <CardHeader className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ShieldCheck className="h-5 w-5 text-emerald-500" />
            Labour Upgrade Tier Brackets
          </CardTitle>
          <CardDescription>
            Configure tiered fee brackets for the optional Labour Upgrade
            warranty.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetTiers}
            className="cursor-pointer gap-1.5 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset Defaults</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddTier}
            className="cursor-pointer gap-1.5 border-primary/30 text-xs text-primary hover:bg-primary/10"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Tier</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading tiers...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-muted/40 text-[10px] tracking-wider text-muted-foreground uppercase">
                <tr>
                  <th className="p-2.5">Min Subtotal ($)</th>
                  <th className="p-2.5">Max Subtotal ($)</th>
                  <th className="p-2.5">Rate (%)</th>
                  <th className="p-2.5">Min Fee Floor ($)</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5">Label / Display</th>
                  <th className="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {tiers.map((tier, idx) => (
                  <tr
                    key={tier.id || idx}
                    className="transition-colors hover:bg-muted/30"
                  >
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={tier.minAmount}
                        onChange={(e) =>
                          handleTierChange(
                            idx,
                            "minAmount",
                            Number(e.target.value) || 0
                          )
                        }
                        className="h-8 w-24 bg-background font-mono text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="Unlimited"
                        value={tier.maxAmount ?? ""}
                        onChange={(e) =>
                          handleTierChange(
                            idx,
                            "maxAmount",
                            e.target.value === ""
                              ? null
                              : Number(e.target.value)
                          )
                        }
                        className="h-8 w-24 bg-background font-mono text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={tier.ratePercent}
                        onChange={(e) =>
                          handleTierChange(
                            idx,
                            "ratePercent",
                            Number(e.target.value) || 0
                          )
                        }
                        className="h-8 w-20 bg-background font-mono text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={tier.minFee}
                        onChange={(e) =>
                          handleTierChange(
                            idx,
                            "minFee",
                            Number(e.target.value) || 0
                          )
                        }
                        className="h-8 w-20 bg-background font-mono text-xs"
                      />
                    </td>
                    <td className="p-2">
                      <label className="flex cursor-pointer items-center gap-1.5 text-xs">
                        <input
                          type="checkbox"
                          checked={tier.isAvailable}
                          onChange={(e) =>
                            handleTierChange(
                              idx,
                              "isAvailable",
                              e.target.checked
                            )
                          }
                          className="rounded text-primary focus:ring-primary"
                        />
                        <span
                          className={
                            tier.isAvailable
                              ? "font-semibold text-emerald-600 dark:text-emerald-400"
                              : "text-muted-foreground"
                          }
                        >
                          {tier.isAvailable ? "Active" : "N/A"}
                        </span>
                      </label>
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        placeholder="e.g. 7% or Not available"
                        value={tier.label || ""}
                        onChange={(e) =>
                          handleTierChange(idx, "label", e.target.value)
                        }
                        className="h-8 w-44 bg-background text-xs"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTier(idx)}
                        className="h-8 w-8 cursor-pointer p-0 text-muted-foreground hover:text-destructive"
                        title="Delete tier"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Leave &ldquo;Max Subtotal&rdquo; empty for the top tier (e.g.,
              $25,000+). Quotes below the first active tier will display as not
              available.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
