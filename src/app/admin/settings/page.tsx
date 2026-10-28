'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Settings2, DollarSign, ShieldCheck, Plus, Trash2, RotateCcw, Save } from 'lucide-react';
import Link from 'next/link';
import SmartBackButton from '@/components/shared/SmartBackButton';
import { AppHeader } from '@/components/layout/AppHeader';
import { ILabourUpgradeTier } from '@/lib/promo-logic';

const DEFAULT_TIERS: ILabourUpgradeTier[] = [
  { id: 'tier_0', minAmount: 0, maxAmount: 3000, ratePercent: 0, minFee: 0, isAvailable: false, label: 'Not available below $3,000' },
  { id: 'tier_1', minAmount: 3000, maxAmount: 5000, ratePercent: 6, minFee: 260, isAvailable: true, label: '6% (minimum $260)' },
  { id: 'tier_2', minAmount: 5000, maxAmount: 7500, ratePercent: 7, minFee: 0, isAvailable: true, label: '7%' },
  { id: 'tier_3', minAmount: 7500, maxAmount: 10000, ratePercent: 8, minFee: 0, isAvailable: true, label: '8%' },
  { id: 'tier_4', minAmount: 10000, maxAmount: 15000, ratePercent: 8.5, minFee: 0, isAvailable: true, label: '8.5%' },
  { id: 'tier_5', minAmount: 15000, maxAmount: 20000, ratePercent: 9, minFee: 0, isAvailable: true, label: '9%' },
  { id: 'tier_6', minAmount: 20000, maxAmount: 25000, ratePercent: 10, minFee: 0, isAvailable: true, label: '10%' },
  { id: 'tier_7', minAmount: 25000, maxAmount: null, ratePercent: 11, minFee: 0, isAvailable: true, label: '11%' },
];

export default function SettingsDashboard() {
  const [surcharge, setSurcharge] = useState<string>('');
  const [tiers, setTiers] = useState<ILabourUpgradeTier[]>(DEFAULT_TIERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (data.surchargeRate !== undefined) {
          setSurcharge(data.surchargeRate.toString());
        }
        if (Array.isArray(data.labourUpgradeTiers) && data.labourUpgradeTiers.length > 0) {
          setTiers(data.labourUpgradeTiers);
        }
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleTierChange = (index: number, field: keyof ILabourUpgradeTier, value: any) => {
    setTiers(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newMin = lastTier?.maxAmount ?? (lastTier?.minAmount ? lastTier.minAmount + 5000 : 25000);
    setTiers(prev => [
      ...prev,
      {
        id: `tier_${Date.now()}`,
        minAmount: newMin,
        maxAmount: null,
        ratePercent: 12,
        minFee: 0,
        isAvailable: true,
        label: '12%',
      },
    ]);
  };

  const handleRemoveTier = (index: number) => {
    setTiers(prev => prev.filter((_, i) => i !== index));
  };

  const handleResetTiers = () => {
    if (confirm('Reset all Labour Upgrade brackets to business defaults?')) {
      setTiers(DEFAULT_TIERS);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surchargeRate: parseFloat(surcharge),
          labourUpgradeTiers: tiers,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ text: 'Settings updated successfully!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-10 relative z-10 space-y-6 sm:space-y-8">
        <AppHeader currentPath="/admin/settings" />

        <div className="flex items-center justify-between gap-4 pb-2 border-b border-border/50">
          <div className="flex items-center gap-3 flex-wrap">
            <SmartBackButton fallbackUrl="/admin" title="Back to Admin" />
            <div className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Settings2 className="w-5 h-5 text-primary" />
              <span className="text-base font-semibold tracking-wider uppercase">Global Settings</span>
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl text-sm font-semibold border shadow-sm animate-in fade-in ${message.type === 'error' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* Card 1: Pricing Constants */}
          <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
            <CardHeader className="border-b border-border/50 pb-6">
              <CardTitle className="text-xl flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Pricing Constants
              </CardTitle>
              <CardDescription>Update global pricing modifiers used across the calculator.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {loading ? (
                <p className="text-muted-foreground text-sm">Loading settings...</p>
              ) : (
                <div className="max-w-xs space-y-2">
                  <Label htmlFor="surcharge">Global Surcharge (%)</Label>
                  <Input 
                    id="surcharge" 
                    type="number" 
                    step="0.01" 
                    min="0"
                    required
                    value={surcharge} 
                    onChange={e => setSurcharge(e.target.value)} 
                    className="bg-background"
                  />
                  <p className="text-[11px] text-muted-foreground">This percentage is automatically added to the base price of all windows during calculation.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card 2: Labour Upgrade Tier Brackets */}
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
                              onChange={e => handleTierChange(idx, 'minAmount', Number(e.target.value) || 0)}
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
                              onChange={e => handleTierChange(idx, 'maxAmount', e.target.value === '' ? null : Number(e.target.value))}
                              className="h-8 w-24 text-xs font-mono bg-background"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="0"
                              step="0.1"
                              value={tier.ratePercent}
                              onChange={e => handleTierChange(idx, 'ratePercent', Number(e.target.value) || 0)}
                              className="h-8 w-20 text-xs font-mono bg-background"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="0"
                              step="any"
                              value={tier.minFee}
                              onChange={e => handleTierChange(idx, 'minFee', Number(e.target.value) || 0)}
                              className="h-8 w-20 text-xs font-mono bg-background"
                            />
                          </td>
                          <td className="p-2">
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                              <input
                                type="checkbox"
                                checked={tier.isAvailable}
                                onChange={e => handleTierChange(idx, 'isAvailable', e.target.checked)}
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
                              onChange={e => handleTierChange(idx, 'label', e.target.value)}
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

          {/* Sticky/Bottom Save Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={saving || loading}
              className="gap-2 px-6 shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Settings...' : 'Save All Settings'}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
