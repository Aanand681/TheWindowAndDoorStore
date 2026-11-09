'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ShieldCheck, Plus, Trash2, RotateCcw } from 'lucide-react';
import { ILabourUpgradeTier } from '@/lib/promo-logic';

export interface LabourUpgradeTiersCardProps {
  tiers: ILabourUpgradeTier[];
  loading: boolean;
  handleResetTiers: () => void;
  handleAddTier: () => void;
  handleTierChange: (index: number, field: keyof ILabourUpgradeTier, value: any) => void;
  handleRemoveTier: (index: number) => void;
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
    <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
      <CardHeader className="border-b border-border/50 pb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle className="text-xl flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            Labour Upgrade Tier Brackets
          </CardTitle>
          <CardDescription>
            Configure tiered fee brackets for the optional Labour Upgrade warranty.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetTiers}
            className="gap-1.5 text-xs cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddTier}
            className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/10 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Tier</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading tiers...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-muted/40 uppercase tracking-wider text-[10px] text-muted-foreground border-b border-border/60">
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
                  <tr key={tier.id || idx} className="hover:bg-muted/30 transition-colors">
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={tier.minAmount}
                        onChange={(e) => handleTierChange(idx, 'minAmount', Number(e.target.value) || 0)}
                        className="h-8 w-24 text-xs font-mono bg-background"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        placeholder="Unlimited"
                        value={tier.maxAmount ?? ''}
                        onChange={(e) => handleTierChange(idx, 'maxAmount', e.target.value === '' ? null : Number(e.target.value))}
                        className="h-8 w-24 text-xs font-mono bg-background"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.1"
                        value={tier.ratePercent}
                        onChange={(e) => handleTierChange(idx, 'ratePercent', Number(e.target.value) || 0)}
                        className="h-8 w-20 text-xs font-mono bg-background"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        type="number"
                        min="0"
                        step="any"
                        value={tier.minFee}
                        onChange={(e) => handleTierChange(idx, 'minFee', Number(e.target.value) || 0)}
                        className="h-8 w-20 text-xs font-mono bg-background"
                      />
                    </td>
                    <td className="p-2">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={tier.isAvailable}
                          onChange={(e) => handleTierChange(idx, 'isAvailable', e.target.checked)}
                          className="rounded text-primary focus:ring-primary"
                        />
                        <span className={tier.isAvailable ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-muted-foreground'}>
                          {tier.isAvailable ? 'Active' : 'N/A'}
                        </span>
                      </label>
                    </td>
                    <td className="p-2">
                      <Input
                        type="text"
                        placeholder="e.g. 7% or Not available"
                        value={tier.label || ''}
                        onChange={(e) => handleTierChange(idx, 'label', e.target.value)}
                        className="h-8 w-44 text-xs bg-background"
                      />
                    </td>
                    <td className="p-2 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveTier(idx)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Delete tier"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-muted-foreground mt-3">
              Leave &ldquo;Max Subtotal&rdquo; empty for the top tier (e.g., $25,000+). Quotes below the first active tier will display as not available.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

