'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Map, Save, Maximize2, Minimize2, RotateCcw, Trash2, Plus, X, AlertCircle, MapPin, Loader2, Component } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import NotificationBell from '@/components/NotificationBell';
import dynamic from 'next/dynamic';

const AdminGeofenceMap = dynamic(() => import('@/components/AdminGeofenceMap'), { ssr: false });

export default function RegionsDashboard() {
  const [regions, setRegions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [geocoding, setGeocoding] = useState<string | null>(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [fullscreenRegionId, setFullscreenRegionId] = useState<string | null>(null);
  
  // New region modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteConfirmRegion, setDeleteConfirmRegion] = useState<any | null>(null);
  const [newRegion, setNewRegion] = useState<{
    name: string;
    isSupplyOnly: boolean;
    labourPerSqft: number;
    miscPerSqft: number;
    labourMin: number;
    miscMin: number;
    extraLinPerWindow: number;
    fixedSetupFee: number;
    baseTravelFee: number;
    officeLat: number;
    officeLon: number;
    freeCities: string;
    setupFeeOptions: { label: string; value: number }[];
  }>({
    name: '',
    isSupplyOnly: false,
    labourPerSqft: 19,
    miscPerSqft: 8,
    labourMin: 325,
    miscMin: 74,
    extraLinPerWindow: 2.17,
    fixedSetupFee: 140,
    baseTravelFee: 0,
    officeLat: 48.6017,
    officeLon: -93.3986,
    freeCities: '',
    setupFeeOptions: [
      { label: 'Standard Setup', value: 140 }
    ],
  });

  const handleAutoLocate = async (targetCity: string, isForNewRegion: boolean, regionId?: string) => {
    if (!targetCity.trim()) return;
    setGeocoding(isForNewRegion ? 'new' : (regionId || 'card'));
    try {
      // Try search with Ontario suffix first
      let res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(targetCity.trim() + ', Ontario, Canada')}`);
      let data = await res.json();
      if (!data || !data.length) {
        // Fallback without Ontario suffix
        res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(targetCity.trim())}`);
        data = await res.json();
      }
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        if (!isNaN(lat) && !isNaN(lon)) {
          if (isForNewRegion) {
            setNewRegion(prev => ({
              ...prev,
              officeLat: Number(lat.toFixed(4)),
              officeLon: Number(lon.toFixed(4)),
            }));
            setMessage({ text: `Found location for "${targetCity}": ${lat.toFixed(4)}, ${lon.toFixed(4)}`, type: 'success' });
          } else if (regionId) {
            updateRegion(regionId, 'officeLat', Number(lat.toFixed(4)));
            updateRegion(regionId, 'officeLon', Number(lon.toFixed(4)));
            setMessage({ text: `Updated map center for "${targetCity}": ${lat.toFixed(4)}, ${lon.toFixed(4)}`, type: 'success' });
          }
        }
      } else {
        setMessage({ text: `Could not find coordinates for "${targetCity}". Please enter manually.`, type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: `Geocoding request failed: ${err.message}`, type: 'error' });
    } finally {
      setGeocoding(null);
    }
  };

  const handleToggleNewSupplyOnly = (val: boolean) => {
    setNewRegion(prev => ({
      ...prev,
      isSupplyOnly: val,
      ...(val ? {
        labourPerSqft: 0,
        miscPerSqft: 0,
        labourMin: 0,
        miscMin: 0,
        extraLinPerWindow: 0,
        fixedSetupFee: 0,
        baseTravelFee: 0,
        setupFeeOptions: [{ label: 'Supply Only (No Setup)', value: 0 }],
      } : {
        labourPerSqft: 19,
        miscPerSqft: 8,
        labourMin: 325,
        miscMin: 74,
        extraLinPerWindow: 2.17,
        fixedSetupFee: 140,
        baseTravelFee: 0,
        setupFeeOptions: [{ label: 'Standard Setup', value: 140 }],
      })
    }));
  };

  const handleCreateRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRegion.name.trim()) return;
    setCreating(true);
    setMessage({ text: '', type: '' });
    try {
      const payload = {
        ...newRegion,
        freeCities: newRegion.freeCities ? newRegion.freeCities.split(',').map(s => s.trim()).filter(Boolean) : [],
        setupFeeOptions: newRegion.setupFeeOptions.filter(o => o.label.trim()),
      };
      const res = await fetch('/api/regions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create region');
      setRegions(prev => [...prev, data]);
      setIsCreateOpen(false);
      setMessage({ text: `Region "${data.name}" created successfully!`, type: 'success' });
      setNewRegion({
        name: '',
        isSupplyOnly: false,
        labourPerSqft: 19,
        miscPerSqft: 8,
        labourMin: 325,
        miscMin: 74,
        extraLinPerWindow: 2.17,
        fixedSetupFee: 140,
        baseTravelFee: 0,
        officeLat: 48.6017,
        officeLon: -93.3986,
        freeCities: '',
        setupFeeOptions: [
          { label: 'Standard Setup', value: 140 }
        ],
      });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRegion = async (regionId: string) => {
    try {
      const res = await fetch(`/api/regions/${regionId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete region');
      setRegions(prev => prev.filter(r => r._id !== regionId));
      setDeleteConfirmRegion(null);
      setMessage({ text: 'Region deleted successfully!', type: 'success' });
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

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
      if (e.key === 'Escape') {
        if (fullscreenRegionId) setFullscreenRegionId(null);
        if (isCreateOpen) setIsCreateOpen(false);
        if (deleteConfirmRegion) setDeleteConfirmRegion(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fullscreenRegionId, isCreateOpen, deleteConfirmRegion]);

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
      
      <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-8">
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <Link href="/admin">
              <Button variant="outline" size="icon" className="rounded-full bg-card/50 backdrop-blur" title="Back to Admin">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
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
              <Map className="w-5 h-5 text-primary" />
              <span className="text-base font-semibold tracking-wider uppercase">Region Pricing &amp; Defaults</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setIsCreateOpen(true)}
              size="sm"
              className="bg-primary text-primary-foreground font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Region</span>
            </Button>
            <NotificationBell />
            <ThemeToggle />
          </div>
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
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <CardTitle className="text-xl text-primary">{region.name}</CardTitle>
                      {region.isSupplyOnly ? (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-500 border border-amber-500/30 tracking-wide uppercase">
                          Supply Only
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                          Install &amp; Travel
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button onClick={() => handleSave(region)} disabled={saving} size="sm" className="cursor-pointer">
                        <Save className="w-4 h-4 mr-1.5" /> Save {region.name}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteConfirmRegion(region)}
                        disabled={saving}
                        className="text-destructive border-destructive/20 hover:bg-destructive hover:text-white cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 mr-1.5" /> Delete
                      </Button>
                    </div>
                  </div>
                  <CardDescription className="mt-1">
                    {region.isSupplyOnly 
                      ? 'Supply-only window & material orders. Zero installation labour and zero travel fees.' 
                      : 'Manage labour formulas and map coordinates for this region.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    {/* General */}
                    <div className="space-y-4">
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground border-b border-border pb-2">General Constants</h3>
                      <div className="space-y-3">
                        <div className="p-2.5 rounded-lg border border-border/80 bg-muted/20 space-y-1">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold cursor-pointer">Supply Only Region</Label>
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                              checked={Boolean(region.isSupplyOnly)}
                              onChange={e => {
                                const checked = e.target.checked;
                                updateRegion(region._id, 'isSupplyOnly', checked);
                                if (checked) {
                                  updateRegion(region._id, 'labourPerSqft', 0);
                                  updateRegion(region._id, 'miscPerSqft', 0);
                                  updateRegion(region._id, 'labourMin', 0);
                                  updateRegion(region._id, 'miscMin', 0);
                                  updateRegion(region._id, 'extraLinPerWindow', 0);
                                  updateRegion(region._id, 'fixedSetupFee', 0);
                                  updateRegion(region._id, 'baseTravelFee', 0);
                                }
                              }}
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-tight">
                            When enabled, installation labour, setup, and travel automatically default to $0.
                          </p>
                        </div>
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
                        <div className="pt-2 border-t border-border/60 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold">City Origin (Map Center)</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-[11px] flex items-center gap-1 text-primary cursor-pointer hover:bg-primary/10"
                              disabled={geocoding === region._id}
                              onClick={() => handleAutoLocate(region.name, false, region._id)}
                              title="Locate city coordinates using OpenStreetMap"
                            >
                              {geocoding === region._id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <MapPin className="w-3 h-3" />
                              )}
                              <span>Auto-Center</span>
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="text-[10px] text-muted-foreground block mb-0.5">Latitude</span>
                              <Input
                                type="number"
                                step="0.0001"
                                value={region.officeLat}
                                onChange={e => updateRegion(region._id, 'officeLat', Number(e.target.value))}
                              />
                            </div>
                            <div>
                              <span className="text-[10px] text-muted-foreground block mb-0.5">Longitude</span>
                              <Input
                                type="number"
                                step="0.0001"
                                value={region.officeLon}
                                onChange={e => updateRegion(region._id, 'officeLon', Number(e.target.value))}
                              />
                            </div>
                          </div>
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
                      <div className="flex items-center justify-between border-b border-border pb-2">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Per-Job Dynamic Setup Fees</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-primary hover:text-primary font-semibold flex items-center gap-1 cursor-pointer"
                          onClick={() => {
                            const currentOpts = region.setupFeeOptions || [];
                            updateRegion(region._id, 'setupFeeOptions', [...currentOpts, { label: '', value: 0 }]);
                          }}
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Fee Option
                        </Button>
                      </div>
                      <div className="space-y-2.5">
                        {(!region.setupFeeOptions || region.setupFeeOptions.length === 0) ? (
                          <p className="text-xs text-muted-foreground py-2 italic">
                            No dynamic setup fees defined. Click &quot;Add Fee Option&quot; above to add one (e.g. Crane Fee, High-Rise Setup).
                          </p>
                        ) : (
                          region.setupFeeOptions.map((opt: any, idx: number) => (
                            <div key={idx} className="flex gap-2 items-center">
                              <Input
                                className="flex-1 text-xs"
                                placeholder="Fee Label (e.g., Crane Fee)"
                                value={opt.label}
                                onChange={e => {
                                  const newOpts = [...(region.setupFeeOptions || [])];
                                  newOpts[idx] = { ...newOpts[idx], label: e.target.value };
                                  updateRegion(region._id, 'setupFeeOptions', newOpts);
                                }}
                              />
                              <div className="relative w-28">
                                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                <Input
                                  className="pl-6 text-xs"
                                  type="number"
                                  placeholder="0"
                                  value={opt.value}
                                  onChange={e => {
                                    const newOpts = [...(region.setupFeeOptions || [])];
                                    newOpts[idx] = { ...newOpts[idx], value: Number(e.target.value) };
                                    updateRegion(region._id, 'setupFeeOptions', newOpts);
                                  }}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                                title="Delete fee option"
                                onClick={() => {
                                  const newOpts = (region.setupFeeOptions || []).filter((_: any, i: number) => i !== idx);
                                  updateRegion(region._id, 'setupFeeOptions', newOpts);
                                }}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          ))
                        )}
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

        {/* Create New Region Modal */}
        {isCreateOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150">
            <div className="bg-card border border-border shadow-2xl rounded-2xl max-w-xl w-full p-6 space-y-6 relative max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Add New Region</h3>
                    <p className="text-xs text-muted-foreground">Configure a standard installation or supply-only region.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="text-muted-foreground hover:text-foreground p-1 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateRegion} className="space-y-4">
                {/* Region Type Selector */}
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Region Type</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleNewSupplyOnly(false)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                        !newRegion.isSupplyOnly 
                          ? 'border-primary bg-primary/10 text-foreground ring-1 ring-primary' 
                          : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/40'
                      }`}
                    >
                      <span className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                        🏡 Standard Install
                      </span>
                      <span className="text-[11px] leading-snug">
                        Full crew labour, travel calculations, and site installation.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleNewSupplyOnly(true)}
                      className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col gap-1 ${
                        newRegion.isSupplyOnly 
                          ? 'border-amber-500 bg-amber-500/10 text-foreground ring-1 ring-amber-500' 
                          : 'border-border bg-muted/20 text-muted-foreground hover:bg-muted/40'
                      }`}
                    >
                      <span className="font-semibold text-sm text-amber-500 flex items-center gap-1.5">
                        ⚡ Supply Only
                      </span>
                      <span className="text-[11px] leading-snug">
                        Window supply &amp; optional trim materials. $0 labour &amp; travel.
                      </span>
                    </button>
                  </div>
                </div>

                {/* Region Name */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="region-name" className="text-xs font-semibold">Region / City Name *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-[11px] flex items-center gap-1 text-primary cursor-pointer hover:bg-primary/10"
                      disabled={geocoding === 'new' || !newRegion.name.trim()}
                      onClick={() => handleAutoLocate(newRegion.name, true)}
                      title="Auto-detect city coordinates on OpenStreetMap"
                    >
                      {geocoding === 'new' ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <MapPin className="w-3 h-3" />
                      )}
                      <span>Auto-Locate City</span>
                    </Button>
                  </div>
                  <Input
                    id="region-name"
                    required
                    placeholder={newRegion.isSupplyOnly ? "e.g., Supply Only" : "e.g., Kenora, Thunder Bay, Dryden"}
                    value={newRegion.name}
                    onChange={e => setNewRegion(prev => ({ ...prev, name: e.target.value }))}
                    onBlur={() => {
                      if (!newRegion.isSupplyOnly && newRegion.name.trim().length > 2 && newRegion.officeLat === 48.6017 && newRegion.officeLon === -93.3986) {
                        handleAutoLocate(newRegion.name, true);
                      }
                    }}
                  />
                </div>

                {/* City Center Coordinates */}
                <div className="grid grid-cols-2 gap-3 p-2.5 rounded-lg border border-border/70 bg-muted/20">
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Office / Center Latitude</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={newRegion.officeLat}
                      onChange={e => setNewRegion(prev => ({ ...prev, officeLat: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Office / Center Longitude</Label>
                    <Input
                      type="number"
                      step="0.0001"
                      value={newRegion.officeLon}
                      onChange={e => setNewRegion(prev => ({ ...prev, officeLon: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                {newRegion.isSupplyOnly ? (
                  <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 text-xs space-y-1 text-muted-foreground">
                    <span className="font-semibold text-amber-500 block">Supply Only Defaults Configured</span>
                    <p className="leading-relaxed">
                      All installation labour rates, travel fees, vehicle costs, and fixed setup fees will be locked to <strong>$0.00</strong>.
                      Window promo discounts and optional Jamb &amp; Casing materials apply normally.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 pt-2 border-t border-border">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Labour Per Sqft ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newRegion.labourPerSqft}
                          onChange={e => setNewRegion(prev => ({ ...prev, labourPerSqft: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Misc Per Sqft ($)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newRegion.miscPerSqft}
                          onChange={e => setNewRegion(prev => ({ ...prev, miscPerSqft: Number(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Min Labour per Window ($)</Label>
                        <Input
                          type="number"
                          value={newRegion.labourMin}
                          onChange={e => setNewRegion(prev => ({ ...prev, labourMin: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Min Misc per Window ($)</Label>
                        <Input
                          type="number"
                          value={newRegion.miscMin}
                          onChange={e => setNewRegion(prev => ({ ...prev, miscMin: Number(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Fixed Setup Fee / Job ($)</Label>
                        <Input
                          type="number"
                          value={newRegion.fixedSetupFee}
                          onChange={e => setNewRegion(prev => ({ ...prev, fixedSetupFee: Number(e.target.value) }))}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Extra Lin Per Window (ft)</Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={newRegion.extraLinPerWindow}
                          onChange={e => setNewRegion(prev => ({ ...prev, extraLinPerWindow: Number(e.target.value) }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Free Radius Cities (comma-separated)</Label>
                      <Input
                        placeholder="e.g. Fort Frances, Devlin, Emo"
                        value={newRegion.freeCities}
                        onChange={e => setNewRegion(prev => ({ ...prev, freeCities: e.target.value }))}
                      />
                    </div>

                    {/* Dynamic Setup Fees */}
                    <div className="space-y-3 pt-2 border-t border-border">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Dynamic Setup Fee Options
                        </Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-primary font-semibold flex items-center gap-1 cursor-pointer"
                          onClick={() => {
                            setNewRegion(prev => ({
                              ...prev,
                              setupFeeOptions: [...prev.setupFeeOptions, { label: '', value: 0 }]
                            }));
                          }}
                        >
                          <Plus className="w-3.5 h-3.5" /> Add Fee
                        </Button>
                      </div>
                      <div className="space-y-2">
                        {newRegion.setupFeeOptions.map((opt, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <Input
                              className="flex-1 text-xs"
                              placeholder="e.g. Standard Setup or Crane Fee"
                              value={opt.label}
                              onChange={e => {
                                const updated = [...newRegion.setupFeeOptions];
                                updated[idx] = { ...updated[idx], label: e.target.value };
                                setNewRegion(prev => ({ ...prev, setupFeeOptions: updated }));
                              }}
                            />
                            <div className="relative w-28">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                              <Input
                                className="pl-6 text-xs"
                                type="number"
                                placeholder="0"
                                value={opt.value}
                                onChange={e => {
                                  const updated = [...newRegion.setupFeeOptions];
                                  updated[idx] = { ...updated[idx], value: Number(e.target.value) };
                                  setNewRegion(prev => ({ ...prev, setupFeeOptions: updated }));
                                }}
                              />
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0 cursor-pointer"
                              onClick={() => {
                                setNewRegion(prev => ({
                                  ...prev,
                                  setupFeeOptions: prev.setupFeeOptions.filter((_, i) => i !== idx)
                                }));
                              }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateOpen(false)}
                    disabled={creating}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={creating || !newRegion.name.trim()}
                    className="bg-primary text-primary-foreground font-semibold"
                  >
                    {creating ? 'Creating...' : 'Create Region'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmRegion && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className="bg-card border border-destructive/30 shadow-2xl rounded-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">Delete Region</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Are you sure you want to delete <strong className="text-foreground">{deleteConfirmRegion.name}</strong>?
                    Existing saved quotes will keep their historical totals, but this region will no longer appear for new quotes.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteConfirmRegion(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteRegion(deleteConfirmRegion._id)}
                  className="font-semibold"
                >
                  Delete Region
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
