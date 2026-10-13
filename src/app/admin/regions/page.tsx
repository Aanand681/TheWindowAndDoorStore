'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Map, Save, Maximize2, Minimize2, RotateCcw, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import dynamic from 'next/dynamic';

const AdminGeofenceMap = dynamic(() => import('@/components/AdminGeofenceMap'), { ssr: false });

export default function RegionsDashboard() {
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [fullscreenRegionId, setFullscreenRegionId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/regions')
      .then(res => res.json())
      .then(data => {
        setRegions(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  // Listen for Escape key to close fullscreen modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && fullscreenRegionId) {
        setFullscreenRegionId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenRegionId]);

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

  const fullscreenRegion = regions.find(r => r._id === fullscreenRegionId);

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
                  
                  {/* Geofence and Fixed City Limits */}
                  <div className="space-y-4 mt-8 pt-8 border-t border-border">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
                      <div>
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Geofence & City Limits</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Click on the map to add boundary pins. Drag any pin to adjust its position.
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-muted border border-border text-foreground">
                          {region.polygon?.length || 0} Pins
                        </span>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setFullscreenRegionId(region._id)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium shadow-sm hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Pop Out Big Screen</span>
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
                      {/* Left control panel */}
                      <div className="space-y-3 lg:col-span-1">
                        <div className="p-3.5 rounded-xl border border-border/80 bg-muted/20 text-xs space-y-2.5">
                          <div className="font-semibold text-foreground flex items-center justify-between">
                            <span>Boundary Status</span>
                            <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                              region.polygon?.length >= 3 
                                ? 'bg-emerald-500/10 text-emerald-500' 
                                : region.polygon?.length > 0 
                                  ? 'bg-amber-500/10 text-amber-500' 
                                  : 'bg-muted text-muted-foreground'
                            }`}>
                              {region.polygon?.length >= 3 ? 'Active Polygon' : region.polygon?.length > 0 ? 'Connecting' : 'No Boundary'}
                            </span>
                          </div>
                          <div className="text-muted-foreground leading-relaxed text-[11px] space-y-1">
                            <div>• <strong>Click map:</strong> Drop new pin</div>
                            <div>• <strong>Drag pin:</strong> Move anywhere</div>
                            <div>• <strong>Click pin:</strong> Delete individual pin</div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs font-medium"
                            onClick={() => {
                              const poly = region.polygon || [];
                              updateRegion(region._id, 'polygon', poly.slice(0, -1));
                            }}
                            disabled={!region.polygon?.length}
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-2" />
                            Undo Last Pin
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs text-destructive border-destructive/20 hover:bg-destructive hover:text-white font-medium"
                            onClick={() => updateRegion(region._id, 'polygon', [])}
                            disabled={!region.polygon?.length}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Clear All Pins
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="w-full justify-start text-xs font-medium"
                            onClick={() => setFullscreenRegionId(region._id)}
                          >
                            <Maximize2 className="w-3.5 h-3.5 mr-2 text-primary" />
                            Open in Big Screen
                          </Button>
                        </div>
                      </div>

                      {/* Right map preview */}
                      <div className="lg:col-span-3 h-[420px] w-full bg-muted/20 border border-border rounded-xl overflow-hidden relative shadow-sm">
                        {typeof window !== 'undefined' && (
                          <AdminGeofenceMap 
                            lat={region.officeLat} 
                            lon={region.officeLon} 
                            polygon={region.polygon || []} 
                            onChangePolygon={(poly) => updateRegion(region._id, 'polygon', poly)}
                          />
                        )}
                        <button
                          type="button"
                          onClick={() => setFullscreenRegionId(region._id)}
                          className="absolute top-3 right-3 bg-background/90 hover:bg-background backdrop-blur px-3 py-1.5 rounded-lg text-xs font-semibold z-[1000] border border-border shadow flex items-center gap-1.5 transition cursor-pointer"
                          title="Click to open big screen"
                        >
                          <Maximize2 className="w-3.5 h-3.5 text-primary" />
                          <span>Click for Big Screen</span>
                        </button>
                      </div>
                    </div>
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Fullscreen Big Screen Map Modal */}
        {fullscreenRegion && (
          <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col p-4 md:p-6 animate-in fade-in duration-150">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                  <Map className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    Geofence Boundary: <span className="text-primary">{fullscreenRegion.name}</span>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Click anywhere on the map to place pins • Drag any pin to reposition • Click a pin to delete it
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-muted border border-border text-foreground">
                  {fullscreenRegion.polygon?.length || 0} Pins Placed
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const poly = fullscreenRegion.polygon || [];
                    updateRegion(fullscreenRegion._id, 'polygon', poly.slice(0, -1));
                  }}
                  disabled={!fullscreenRegion.polygon?.length}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Undo Last Pin
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => updateRegion(fullscreenRegion._id, 'polygon', [])}
                  className="text-destructive border-destructive/20 hover:bg-destructive hover:text-white"
                  disabled={!fullscreenRegion.polygon?.length}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Clear All
                </Button>
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  onClick={() => setFullscreenRegionId(null)}
                  className="bg-primary text-primary-foreground font-semibold px-4 cursor-pointer"
                >
                  <Minimize2 className="w-4 h-4 mr-1.5" /> Done (Pop Out)
                </Button>
              </div>
            </div>

            {/* Giant interactive map */}
            <div className="flex-1 w-full mt-4 rounded-xl overflow-hidden border border-border shadow-2xl relative">
              {typeof window !== 'undefined' && (
                <AdminGeofenceMap 
                  lat={fullscreenRegion.officeLat} 
                  lon={fullscreenRegion.officeLon} 
                  polygon={fullscreenRegion.polygon || []} 
                  onChangePolygon={(poly) => updateRegion(fullscreenRegion._id, 'polygon', poly)}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
