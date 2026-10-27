'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Settings, Plus, Trash2, Save, Component } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import NotificationBell from '@/components/shared/NotificationBell';
import UserProfileMenu from '@/components/shared/UserProfileMenu';
import QuotesBinPill from '@/components/quotes/QuotesBinPill';
import SmartBackButton from '@/components/shared/SmartBackButton';

export default function TaxSettingsDashboard() {
  const [addons, setAddons] = useState<any[]>([]);
  const [jambs, setJambs] = useState<any[]>([]);
  const [casings, setCasings] = useState<any[]>([]);
  const [vehicleRate, setVehicleRate] = useState<number>(0.98);
  const [crewRates, setCrewRates] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setAddons(data.addons || []);
        setJambs(data.jambs || []);
        setCasings(data.casings || []);
        if (data.vehicleRate !== undefined) setVehicleRate(data.vehicleRate);
        setCrewRates(data.crewRates || []);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addons, jambs, casings, vehicleRate, crewRates }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ text: 'Tax and Labour settings updated successfully!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const focusLastAddedItem = (e: React.MouseEvent) => {
    setTimeout(() => {
      const card = (e.target as HTMLElement).closest('.bg-card') || (e.target as HTMLElement).closest('.bg-card\\/50');
      if (card) {
        const rows = card.querySelectorAll('.bg-muted\\/20');
        if (rows.length > 0) {
          const lastRow = rows[rows.length - 1];
          lastRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const firstInput = lastRow.querySelector('input');
          if (firstInput) firstInput.focus();
        }
      }
    }, 50);
  };

  const handleAddAddon = (e: React.MouseEvent) => { setAddons([...addons, { id: `ext_${Date.now()}`, label: '', lab: 0, misc: 0 }]); focusLastAddedItem(e); };
  const handleAddJamb = (e: React.MouseEvent) => { setJambs([...jambs, { id: `j_${Date.now()}`, label: '', rate: 0 }]); focusLastAddedItem(e); };
  const handleAddCasing = (e: React.MouseEvent) => { setCasings([...casings, { id: `c_${Date.now()}`, label: '', rate: 0 }]); focusLastAddedItem(e); };
  const handleAddCrew = (e: React.MouseEvent) => { setCrewRates([...crewRates, { crewSize: '5', hourlyRate: 0 }]); focusLastAddedItem(e); };

  const updateItem = (setter: any, index: number, field: string, value: any) => {
    setter((prev: any[]) => {
      const next = [...prev];
      next[index][field] = value;
      return next;
    });
  };

  const removeItem = (setter: any, index: number) => {
    setter((prev: any[]) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <div className="max-w-6xl mx-auto px-4 py-12 relative z-10 space-y-8">
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
              <Settings className="w-5 h-5 text-primary" />
              <span className="text-base font-semibold tracking-wider uppercase">Tax &amp; Labour Pricing</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <QuotesBinPill />
            <NotificationBell />
            <ThemeToggle />
            <UserProfileMenu />
          </div>
        </header>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading settings...</p>
        ) : (
          <div className="space-y-8">
            <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">Extras & Addons</CardTitle>
                    <CardDescription>Manage rates for extra items like Brick, Siding, Caulk, etc.</CardDescription>
                  </div>
                  <Button size="sm" onClick={handleAddAddon}><Plus className="w-4 h-4 mr-2"/> Add Extra</Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid gap-4">
                  {addons.map((a, i) => (
                    <div key={i} className="flex gap-4 items-end bg-muted/20 p-3 rounded-lg border border-border/50">
                      <div className="flex-1 space-y-1">
                        <Label>Label</Label>
                        <Input value={a.label} onChange={e => updateItem(setAddons, i, 'label', e.target.value)} />
                      </div>
                      <div className="w-32 space-y-1">
                        <Label>Labour ($)</Label>
                        <Input type="number" value={a.lab === 0 ? '' : a.lab} onChange={e => updateItem(setAddons, i, 'lab', e.target.value === '' ? 0 : Number(e.target.value))} />
                      </div>
                      <div className="w-32 space-y-1">
                        <Label>Misc ($)</Label>
                        <Input type="number" value={a.misc === 0 ? '' : a.misc} onChange={e => updateItem(setAddons, i, 'misc', e.target.value === '' ? 0 : Number(e.target.value))} />
                      </div>
                      <Button variant="ghost" size="icon" className="text-destructive mb-0.5" onClick={() => removeItem(setAddons, i)}>
                        <Trash2 className="w-4 h-4"/>
                      </Button>
                    </div>
                  ))}
                  {addons.length === 0 && <p className="text-sm text-muted-foreground">No extras defined.</p>}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">Jambs</CardTitle>
                      <CardDescription>Price per linear foot</CardDescription>
                    </div>
                    <Button size="sm" onClick={handleAddJamb}><Plus className="w-4 h-4 mr-2"/> Add Jamb</Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-4">
                    {jambs.map((j, i) => (
                      <div key={i} className="flex gap-4 items-end bg-muted/20 p-3 rounded-lg border border-border/50">
                        <div className="flex-1 space-y-1">
                          <Label>Label</Label>
                          <Input value={j.label} onChange={e => updateItem(setJambs, i, 'label', e.target.value)} />
                        </div>
                        <div className="w-24 space-y-1">
                          <Label>Rate ($)</Label>
                          <Input type="number" value={j.rate === 0 ? '' : j.rate} onChange={e => updateItem(setJambs, i, 'rate', e.target.value === '' ? 0 : Number(e.target.value))} />
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive mb-0.5" onClick={() => removeItem(setJambs, i)}>
                          <Trash2 className="w-4 h-4"/>
                        </Button>
                      </div>
                    ))}
                    {jambs.length === 0 && <p className="text-sm text-muted-foreground">No jambs defined.</p>}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">Casings</CardTitle>
                      <CardDescription>Price per linear foot</CardDescription>
                    </div>
                    <Button size="sm" onClick={handleAddCasing}><Plus className="w-4 h-4 mr-2"/> Add Casing</Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-4">
                    {casings.map((c, i) => (
                      <div key={i} className="flex gap-4 items-end bg-muted/20 p-3 rounded-lg border border-border/50">
                        <div className="flex-1 space-y-1">
                          <Label>Label</Label>
                          <Input value={c.label} onChange={e => updateItem(setCasings, i, 'label', e.target.value)} />
                        </div>
                        <div className="w-24 space-y-1">
                          <Label>Rate ($)</Label>
                          <Input type="number" value={c.rate === 0 ? '' : c.rate} onChange={e => updateItem(setCasings, i, 'rate', e.target.value === '' ? 0 : Number(e.target.value))} />
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive mb-0.5" onClick={() => removeItem(setCasings, i)}>
                          <Trash2 className="w-4 h-4"/>
                        </Button>
                      </div>
                    ))}
                    {casings.length === 0 && <p className="text-sm text-muted-foreground">No casings defined.</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="text-lg">Vehicle Travel Rate</CardTitle>
                  <CardDescription>Cost per km for vehicle travel.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-2 max-w-[200px]">
                    <Label>Rate per km ($)</Label>
                    <Input type="number" step="0.01" value={vehicleRate === 0 ? '' : vehicleRate} onChange={e => setVehicleRate(e.target.value === '' ? 0 : Number(e.target.value))} />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">Crew Hourly Rates</CardTitle>
                      <CardDescription>Hourly cost for different crew sizes during travel.</CardDescription>
                    </div>
                    <Button size="sm" onClick={handleAddCrew}><Plus className="w-4 h-4 mr-2"/> Add Crew</Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid gap-4">
                    {crewRates.map((cr, i) => (
                      <div key={i} className="flex gap-4 items-end bg-muted/20 p-3 rounded-lg border border-border/50">
                        <div className="flex-1 space-y-1">
                          <Label>Crew Size (Men)</Label>
                          <Input value={cr.crewSize} onChange={e => updateItem(setCrewRates, i, 'crewSize', e.target.value)} />
                        </div>
                        <div className="w-32 space-y-1">
                          <Label>Hourly Rate ($)</Label>
                          <Input type="number" value={cr.hourlyRate === 0 ? '' : cr.hourlyRate} onChange={e => updateItem(setCrewRates, i, 'hourlyRate', e.target.value === '' ? 0 : Number(e.target.value))} />
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive mb-0.5" onClick={() => removeItem(setCrewRates, i)}>
                          <Trash2 className="w-4 h-4"/>
                        </Button>
                      </div>
                    ))}
                    {crewRates.length === 0 && <p className="text-sm text-muted-foreground">No crew rates defined.</p>}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <Button onClick={handleSave} disabled={saving} size="lg" className="w-full sm:w-auto shadow-lg">
                <Save className="w-5 h-5 mr-2" />
                {saving ? 'Saving...' : 'Save All Settings'}
              </Button>
              {message.text && (
                <div className={`px-4 py-2 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  {message.text}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
