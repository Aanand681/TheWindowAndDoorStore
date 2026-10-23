'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Settings2, DollarSign, Component } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import NotificationBell from '@/components/NotificationBell';
import UserProfileMenu from '@/components/UserProfileMenu';
import QuotesBinPill from '@/components/QuotesBinPill';
import SmartBackButton from '@/components/SmartBackButton';

export default function SettingsDashboard() {
  const [surcharge, setSurcharge] = useState<string>('');
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
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surchargeRate: parseFloat(surcharge) }),
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
      
      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10 space-y-8">
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <SmartBackButton fallbackUrl="/admin" title="Back to Admin" />
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity cursor-pointer group"
              title="Window & Door Store - Home / Calculator"
            >
              <Component className="w-6 h-6 transition-transform group-hover:scale-105" />
              <span className="text-xl font-semibold tracking-wider uppercase">Window &amp; Door Store</span>
            </Link>
            <span className="text-muted-foreground/40 hidden sm:inline">/</span>
            <div className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Settings2 className="w-5 h-5 text-primary" />
              <span className="text-base font-semibold tracking-wider uppercase">Global Settings</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <QuotesBinPill />
            <NotificationBell />
            <ThemeToggle />
            <UserProfileMenu />
          </div>
        </header>

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
              <form onSubmit={handleSave} className="space-y-6 max-w-sm">
                <div className="space-y-2">
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

                {message.text && (
                  <div className={`p-3 rounded-lg text-sm font-medium border ${message.type === 'error' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                    {message.text}
                  </div>
                )}

                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
