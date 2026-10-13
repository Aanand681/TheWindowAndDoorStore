'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Map, Save } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import dynamic from 'next/dynamic';

const AdminGeofenceMap = dynamic(() => import('@/components/AdminGeofenceMap'), { ssr: false });

export default function RegionsDashboard() {
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetch('/api/regions')
      .then(res => res.json())
      .then(data => {
        setRegions(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const handleSave = async (region: any) => {
    setSaving(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch(`/api/regions/${region._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(region),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage({ text: `${region.name} updated successfully!`, type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const updateRegion = (id: string, field: string, value: any) => {
    setRegions(prev => prev.map(r => r._id === id ? { ...r, [field]: value } : r));
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 space-y-8">
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="icon" className="rounded-full bg-card/50 backdrop-blur">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="inline-flex items-center gap-2 text-primary">
              <Map className="w-6 h-6" />
              <span className="text-xl font-semibold tracking-wider uppercase">Region Pricing & Defaults</span>
            </div>
          </div>
          <ThemeToggle />
        </header>

        {message.text && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium ${message.type === 'error' ? 'bg-destructive/10 text-destructive' : 'bg-emerald-500/10 text-emerald-500'}`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <p className="text-center text-muted-foreground">Loading regions...</p>
        ) : (
          <div className="space-y-8">
            {regions.map(region => (
              <Card key={region._id} className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
                <CardHeader className="border-b border-border/50 pb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-xl text-primary">{region.name}</CardTitle>
                      <CardDescription>Manage labour formulas and map coordinates for this region.</CardDescription>
                    </div>
                    <Button onClick={() => handleSave(region)} disabled={saving} size="sm">
                      <Save className="w-4 h-4 mr-2" /> Save {region.name}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* General */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-2">General Constants</h3>
                      <div className="space-y-3">
                        <div>
                          <Label>Fixed Setup Fee / Job ($)</Label>
                          <Input type="number" value={region.fixedSetupFee} onChange={e => updateRegion(region._id, 'fixedSetupFee', Number(e.target.value))} />
                        </div>
                        <div>
                          <Label>Extra Linear Per Window (ft)</Label>
                          <Input type="number" step="0.01" value={region.extraLinPerWindow} onChange={e => updateRegion(region._id, 'extraLinPerWindow', Number(e.target.value))} />
                        </div>
                        <div>
                          <Label>Free Radius Cities (comma-separated)</Label>
                          <Input value={region.freeCities.join(', ')} onChange={e => updateRegion(region._id, 'freeCities', e.target.value.split(',').map(s=>s.trim()).filter(Boolean))} />
                        </div>
                      </div>
                    </div>

                    {/* Window Labour */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Window Labour Base</h3>
                      <div className="space-y-3">
                        <div>
                          <Label>Labour Per Sq Ft ($)</Label>
                          <Input type="number" step="0.01" value={region.labourPerSqft} onChange={e => updateRegion(region._id, 'labourPerSqft', Number(e.target.value))} />
                        </div>
                        <div>
                          <Label>Misc Per Sq Ft ($)</Label>
                          <Input type="number" step="0.01" value={region.miscPerSqft} onChange={e => updateRegion(region._id, 'miscPerSqft', Number(e.target.value))} />
                        </div>
                        <div>
                          <Label>Min. Labour per Window ($)</Label>
                          <Input type="number" value={region.labourMin} onChange={e => updateRegion(region._id, 'labourMin', Number(e.target.value))} />
                        </div>
                        <div>
                          <Label>Min. Misc per Window ($)</Label>
                          <Input type="number" value={region.miscMin} onChange={e => updateRegion(region._id, 'miscMin', Number(e.target.value))} />
                        </div>
                      </div>
                    </div>

                    {/* Setup Fee Options */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Per-Job Dynamic Setup Fees</h3>
                      <div className="space-y-3">
                        {region.setupFeeOptions.map((opt: any, idx: number) => (
                          <div key={idx} className="flex gap-2">
                            <Input className="flex-1" placeholder="Label" value={opt.label} onChange={e => {
                              const newOpts = [...region.setupFeeOptions];
                              newOpts[idx].label = e.target.value;
                              updateRegion(region._id, 'setupFeeOptions', newOpts);
                            }} />
                            <Input className="w-24" type="number" placeholder="$" value={opt.value} onChange={e => {
                              const newOpts = [...region.setupFeeOptions];
                              newOpts[idx].value = Number(e.target.value);
                              updateRegion(region._id, 'setupFeeOptions', newOpts);
                            }} />
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                  
                  {/* Geofence and Base Travel */}
                  <div className="space-y-4 mt-8 pt-8 border-t border-border">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-2">Geofence & Fixed City Travel</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <Label>Base Travel Fee for Region ($)</Label>
                        <Input type="number" className="mb-4" value={region.baseTravelFee === 0 ? '' : region.baseTravelFee} onChange={e => updateRegion(region._id, 'baseTravelFee', e.target.value === '' ? 0 : Number(e.target.value))} />
                        <p className="text-xs text-muted-foreground mb-4">This fixed amount is charged automatically if the customer lives inside the drawn city limits.</p>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => {
                            const poly = region.polygon || [];
                            updateRegion(region._id, 'polygon', poly.slice(0, -1));
                          }}>
                            Undo Last Pin
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => updateRegion(region._id, 'polygon', [])} className="text-destructive border-destructive/20 hover:bg-destructive hover:text-white">
                            Clear All
                          </Button>
                        </div>
                      </div>
                      <div className="h-[300px] w-full bg-muted/20 border border-border rounded-xl overflow-hidden relative">
                        {typeof window !== 'undefined' && (
                          <AdminGeofenceMap 
                            lat={region.officeLat} 
                            lon={region.officeLon} 
                            polygon={region.polygon || []} 
                            onChangePolygon={(poly) => updateRegion(region._id, 'polygon', poly)}
                          />
                        )}
                        <div className="absolute top-2 right-2 bg-background/80 backdrop-blur px-3 py-1 rounded-full text-xs z-[1000] border border-border shadow">
                          Click map to draw boundary
                        </div>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
