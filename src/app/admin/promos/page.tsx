'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tag, Plus, ArrowLeft, Trash2, Power, Settings2, Percent } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

type PromoType = {
  _id: string;
  name: string;
  type: string;
  isActive: boolean;
  buyQty?: number;
  getQty?: number;
  freeComponents?: string[];
  discountPercentage?: number;
  applyPercentageAfterFreeParts?: boolean;
};

export default function PromosDashboard() {
  const [promos, setPromos] = useState<PromoType[]>([]);
  const [role, setRole] = useState('ADMIN');
  const [loading, setLoading] = useState(true);
  
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
      
      if (Array.isArray(promoData)) setPromos(promoData);
      if (profileData.role) setRole(profileData.role);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
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

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 space-y-8">
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="icon" className="rounded-full bg-card/50 backdrop-blur">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="inline-flex items-center gap-2 text-primary">
              <Tag className="w-6 h-6" />
              <span className="text-xl font-semibold tracking-wider uppercase">Promos & Sales</span>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-6">
            <div>
              <CardTitle className="text-xl">Active & Inactive Promos</CardTitle>
              <CardDescription>Toggle which promos are currently live on the calculator.</CardDescription>
            </div>
            {isSuperAdmin && (
              <Button onClick={() => setShowCreateModal(true)} className="shadow-lg">
                <Plus className="w-4 h-4 mr-2" />
                Create New Promo
              </Button>
            )}
          </CardHeader>
          <CardContent className="pt-6">
            {loading ? (
              <div className="text-muted-foreground text-sm">Loading promos...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {promos.map(promo => (
                  <div key={promo._id} className={`p-5 rounded-xl border transition-all duration-300 ${promo.isActive ? 'bg-primary/5 border-primary/30 shadow-lg' : 'bg-card/30 border-border opacity-70 grayscale'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold flex items-center gap-2">
                          {promo.name}
                          {promo.isActive && <span className="text-[9px] uppercase tracking-wider font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">Live</span>}
                        </h3>
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md inline-block mt-2 uppercase tracking-widest">
                          {promo.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
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
