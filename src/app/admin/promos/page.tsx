'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag, Plus, ArrowLeft, Trash2, Power, Settings2, Percent, ChevronUp, ChevronDown, GripVertical, Save, RotateCcw, Check, Loader2, Component } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import NotificationBell from '@/components/NotificationBell';
import { toast } from 'sonner';

type PromoType = {
  _id: string;
  name: string;
  type: string;
  isActive: boolean;
  order?: number;
  buyQty?: number;
  getQty?: number;
  freeComponents?: string[];
  discountPercentage?: number;
  applyPercentageAfterFreeParts?: boolean;
};

export default function PromosDashboard() {
  const [promos, setPromos] = useState<PromoType[]>([]);
  const [savedPromos, setSavedPromos] = useState<PromoType[]>([]);
  const [savingOrder, setSavingOrder] = useState(false);
  const [role, setRole] = useState('ADMIN');
  const [loading, setLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('BOGO');
  const [buyQty, setBuyQty] = useState('');
  const [getQty, setGetQty] = useState('');
  const [freeComponents, setFreeComponents] = useState<string[]>([]);
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [applyAfter, setApplyAfter] = useState(false);
  
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [promoRes, profileRes] = await Promise.all([
        fetch('/api/promos'),
        fetch('/api/profile')
      ]);
      const promoData = await promoRes.json();
      const profileData = await profileRes.json();
      
      if (Array.isArray(promoData)) {
        setPromos(promoData);
        setSavedPromos(promoData);
      }
      if (profileData.role) setRole(profileData.role);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasOrderChanges = promos.length > 0 && savedPromos.length === promos.length && 
    promos.some((p, i) => p._id !== savedPromos[i]?._id);

  const handleSaveOrder = async () => {
    setSavingOrder(true);
    try {
      const res = await fetch('/api/promos/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: promos.map(p => p._id) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order');
      setSavedPromos([...promos]);
      toast.success('Promo order saved! Sequence is now live on the calculator.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update order');
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDiscardChanges = () => {
    setPromos([...savedPromos]);
    toast.info('Discarded order changes');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= promos.length) return;

    const newPromos = [...promos];
    const [moved] = newPromos.splice(index, 1);
    newPromos.splice(targetIndex, 0, moved);

    setPromos(newPromos);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      return;
    }

    const newPromos = [...promos];
    const [moved] = newPromos.splice(draggedIndex, 1);
    newPromos.splice(targetIndex, 0, moved);

    setDraggedIndex(null);
    setPromos(newPromos);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/promos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promo permanently?')) return;
    try {
      await fetch(`/api/promos/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleComponent = (comp: string) => {
    if (freeComponents.includes(comp)) {
      setFreeComponents(freeComponents.filter(c => c !== comp));
    } else {
      setFreeComponents([...freeComponents, comp]);
    }
  };

  const handleCreatePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    const payload: any = { name, type, isActive: true };

    if (type === 'BOGO') {
      payload.buyQty = parseInt(buyQty);
      payload.getQty = parseInt(getQty);
    } else if (type === 'FREE_PARTS') {
      payload.freeComponents = freeComponents;
    } else if (type === 'PERCENTAGE') {
      payload.discountPercentage = parseFloat(discountPercentage);
    } else if (type === 'COMBO') {
      payload.freeComponents = freeComponents;
      payload.discountPercentage = parseFloat(discountPercentage);
      payload.applyPercentageAfterFreeParts = applyAfter;
    }

    try {
      const res = await fetch('/api/promos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setShowCreateModal(false);
      setName('');
      setType('BOGO');
      setBuyQty('');
      setGetQty('');
      setFreeComponents([]);
      setDiscountPercentage('');
      setApplyAfter(false);
      fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const isSuperAdmin = role === 'SUPERADMIN';

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      {/* Create Modal */}
      {showCreateModal && isSuperAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="bg-card p-6 rounded-xl shadow-2xl max-w-lg w-full border border-border animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Create New Promo
            </h3>
            <p className="text-muted-foreground text-sm mb-6">Build a dynamic formula for your sales event.</p>
            
            <form onSubmit={handleCreatePromo} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Promo Name (e.g., "Summer Sale 2026")</Label>
                <Input id="name" required value={name} onChange={e => setName(e.target.value)} className="bg-background" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Calculation Engine Type</Label>
                <select
                  id="type"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  <option value="BOGO">Buy X, Get Y Free</option>
                  <option value="FREE_PARTS">Free Components (Argon, Solar, etc.)</option>
                  <option value="PERCENTAGE">Flat Percentage Off Base Price</option>
                  <option value="COMBO">Combo (Free Parts + Percentage Off)</option>
                </select>
              </div>

              {type === 'BOGO' && (
                <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border border-border">
                  <div className="space-y-2">
                    <Label htmlFor="buyQty">Buy Qty</Label>
                    <Input id="buyQty" type="number" min="1" required value={buyQty} onChange={e => setBuyQty(e.target.value)} className="bg-background" placeholder="e.g. 2" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="getQty">Get Qty (Free)</Label>
                    <Input id="getQty" type="number" min="1" required value={getQty} onChange={e => setGetQty(e.target.value)} className="bg-background" placeholder="e.g. 2" />
                  </div>
                </div>
              )}

              {(type === 'FREE_PARTS' || type === 'COMBO') && (
                <div className="space-y-3 bg-muted/30 p-4 rounded-lg border border-border">
                  <Label>Select Free Components</Label>
                  <div className="flex flex-wrap gap-3">
                    {['argon', 'solar', 'triple'].map(comp => (
                      <label key={comp} className="flex items-center gap-2 text-sm cursor-pointer border border-border bg-background px-3 py-2 rounded-md hover:border-primary/50">
                        <input 
                          type="checkbox" 
                          checked={freeComponents.includes(comp)} 
                          onChange={() => toggleComponent(comp)} 
                          className="accent-primary"
                        />
                        <span className="capitalize">{comp}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {(type === 'PERCENTAGE' || type === 'COMBO') && (
                <div className="space-y-2 bg-muted/30 p-4 rounded-lg border border-border">
                  <Label htmlFor="discountPercentage">Percentage Off</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input id="discountPercentage" type="number" step="0.1" min="0.1" max="100" required value={discountPercentage} onChange={e => setDiscountPercentage(e.target.value)} className="bg-background pl-9" placeholder="e.g. 5" />
                  </div>
                  
                  {type === 'COMBO' && (
                    <label className="flex items-center gap-2 text-xs mt-3 cursor-pointer">
                      <input type="checkbox" checked={applyAfter} onChange={e => setApplyAfter(e.target.checked)} className="accent-primary" />
                      <span>Apply percentage discount AFTER subtracting the free components cost.</span>
                    </label>
                  )}
                </div>
              )}

              {error && <div className="text-sm text-destructive font-medium p-2 bg-destructive/10 rounded">{error}</div>}

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create Promo'}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              <Tag className="w-5 h-5 text-primary" />
              <span className="text-base font-semibold tracking-wider uppercase">Promos &amp; Sales</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell />
            <ThemeToggle />
          </div>
        </header>


        <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
            <div>
              <CardTitle className="text-xl">Active & Inactive Promos</CardTitle>
              <CardDescription>
                Toggle which promos are live. Use the arrows or drag cards to rearrange their order on the calculator page.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {hasOrderChanges && (
                <Button 
                  onClick={handleSaveOrder} 
                  disabled={savingOrder} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg font-bold animate-pulse"
                >
                  {savingOrder ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Order...</>
                  ) : (
                    <><Save className="w-4 h-4 mr-2" /> Save Order</>
                  )}
                </Button>
              )}
              {isSuperAdmin && (
                <Button onClick={() => setShowCreateModal(true)} className="shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Promo
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {hasOrderChanges && (
              <div className="flex flex-col sm:flex-row items-center justify-between p-4 mb-6 rounded-xl bg-amber-500/10 border-2 border-amber-500/40 shadow-md gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500 shrink-0">
                    <Save className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-foreground">You have rearranged the promo sequence!</div>
                    <div className="text-xs text-muted-foreground">Click "Save Order" to permanently store this order and update the promo calculator.</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="outline" size="sm" onClick={handleDiscardChanges} disabled={savingOrder}>
                    <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Discard
                  </Button>
                  <Button size="sm" onClick={handleSaveOrder} disabled={savingOrder} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md">
                    {savingOrder ? (
                      <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Saving...</>
                    ) : (
                      <><Check className="w-3.5 h-3.5 mr-1.5" /> Save Order</>
                    )}
                  </Button>
                </div>
              </div>
            )}
            {loading ? (
              <div className="text-muted-foreground text-sm">Loading promos...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promos.map((promo, index) => (
                  <div 
                    key={promo._id} 
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={() => setDraggedIndex(null)}
                    className={`p-5 rounded-xl border transition-all duration-200 ${
                      draggedIndex === index ? 'opacity-40 border-primary scale-[0.98]' : ''
                    } ${
                      promo.isActive ? 'bg-primary/5 border-primary/30 shadow-lg' : 'bg-card/30 border-border opacity-70 grayscale'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4 gap-2">
                      <div className="flex items-start gap-2.5">
                        {/* Reordering Grip & Arrows */}
                        <div className="flex items-center gap-1 bg-muted/60 border border-border/80 rounded-lg p-1">
                          <div 
                            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-0.5" 
                            title="Drag to reorder"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-background/80 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                              disabled={index === 0}
                              onClick={() => handleMove(index, 'up')}
                              title="Move up in order"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              className="h-5 w-5 flex items-center justify-center rounded text-muted-foreground hover:text-foreground hover:bg-background/80 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                              disabled={index === promos.length - 1}
                              onClick={() => handleMove(index, 'down')}
                              title="Move down in order"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-bold bg-background border border-border px-1.5 py-0.5 rounded text-muted-foreground">
                              #{index + 1}
                            </span>
                            <h3 className="text-lg font-bold flex items-center gap-2">
                              {promo.name}
                              {promo.isActive && <span className="text-[9px] uppercase tracking-wider font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">Live</span>}
                            </h3>
                          </div>
                          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md inline-block mt-1.5 uppercase tracking-widest">
                            {promo.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Button 
                          variant={promo.isActive ? "default" : "secondary"} 
                          size="sm" 
                          onClick={() => handleToggleActive(promo._id, promo.isActive)}
                          className={promo.isActive ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}
                        >
                          <Power className="w-4 h-4 mr-1.5" />
                          {promo.isActive ? 'Turn Off' : 'Turn On'}
                        </Button>
                        {isSuperAdmin && (
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(promo._id)} className="h-9 w-9 hover:bg-destructive/10 hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground bg-background/50 p-3 rounded-lg border border-border/50">
                      {promo.type === 'BOGO' && <span>Buy {promo.buyQty}, Get {promo.getQty} Free (cheapest items).</span>}
                      {promo.type === 'FREE_PARTS' && <span>Free components: {promo.freeComponents?.join(', ')}.</span>}
                      {promo.type === 'PERCENTAGE' && <span>{promo.discountPercentage}% off base price.</span>}
                      {promo.type === 'COMBO' && (
                        <span>
                          Free {promo.freeComponents?.join(', ')} <br/> 
                          <span className="text-primary font-medium">PLUS</span> {promo.discountPercentage}% off 
                          {promo.applyPercentageAfterFreeParts ? ' (applied after parts deduction).' : ' (applied to total base).'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {promos.length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                    No promos found. Contact developer to create new promo.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
