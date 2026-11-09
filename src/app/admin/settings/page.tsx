'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Settings2, Save } from 'lucide-react';
import SmartBackButton from '@/components/shared/SmartBackButton';
import { AppHeader } from '@/components/layout/AppHeader';
import { ILabourUpgradeTier } from '@/lib/promo-logic';
import { DEFAULT_TIERS } from '@/components/admin/settings/default-tiers';
import { SurchargeSettingsCard } from '@/components/admin/settings/SurchargeSettingsCard';
import { LabourUpgradeTiersCard } from '@/components/admin/settings/LabourUpgradeTiersCard';

export default function SettingsDashboard() {
  const [surcharge, setSurcharge] = useState<string>('');
  const [tiers, setTiers] = useState<ILabourUpgradeTier[]>(DEFAULT_TIERS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
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
    setTiers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newMin = lastTier?.maxAmount ?? (lastTier?.minAmount ? lastTier.minAmount + 5000 : 25000);
    setTiers((prev) => [
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
    setTiers((prev) => prev.filter((_, i) => i !== index));
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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <AppHeader currentPath="/admin/settings" />
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in duration-300">
        <div>
          <SmartBackButton fallbackUrl="/admin" label="Back to Administration" className="mb-4" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight flex items-center gap-3">
                <Settings2 className="w-8 h-8 text-primary" />
                Calculator &amp; Business Settings
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Configure global surcharge rates, pricing overrides, and labour upgrade bracket tiers.
              </p>
            </div>
          </div>
        </div>

        {message.text && (
          <div
            className={`p-4 rounded-xl text-sm font-semibold border shadow-sm animate-in fade-in ${
              message.type === 'error'
                ? 'bg-destructive/10 text-destructive border-destructive/20'
                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          <SurchargeSettingsCard
            surcharge={surcharge}
            setSurcharge={setSurcharge}
            loading={loading}
          />

          <LabourUpgradeTiersCard
            tiers={tiers}
            loading={loading}
            handleResetTiers={handleResetTiers}
            handleAddTier={handleAddTier}
            handleTierChange={handleTierChange}
            handleRemoveTier={handleRemoveTier}
          />

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
      </main>
    </div>
  );
}
