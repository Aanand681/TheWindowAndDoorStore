'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  DoorClosed,
  Wrench,
  DollarSign,
  Truck,
  RotateCcw,
  Save,
  Plus,
  Trash2,
  Percent,
  CheckCircle2,
  Info,
} from 'lucide-react';
import SmartBackButton from '@/components/shared/SmartBackButton';
import { AppHeader } from '@/components/layout/AppHeader';
import { toast } from 'sonner';
import {
  DEFAULT_DOOR_PRESETS,
  DEFAULT_DOOR_UPCHARGES,
  DEFAULT_DOOR_FORMULA,
  DEFAULT_DOOR_LOGISTICS,
} from '@/lib/doors/constants';
import {
  DoorPreset,
  DoorUpchargeConfig,
  DoorFormulaSettings,
  DoorLogisticsSettings,
  DoorCategory,
} from '@/lib/doors/types';

export default function AdminDoorsPage() {
  const [presets, setPresets] = useState<DoorPreset[]>(DEFAULT_DOOR_PRESETS);
  const [upcharges, setUpcharges] = useState<DoorUpchargeConfig[]>(DEFAULT_DOOR_UPCHARGES);
  const [formula, setFormula] = useState<DoorFormulaSettings>(DEFAULT_DOOR_FORMULA);
  const [logistics, setLogistics] = useState<DoorLogisticsSettings>(DEFAULT_DOOR_LOGISTICS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'presets' | 'upcharges' | 'formula' | 'logistics'>('presets');

  useEffect(() => {
    fetch('/api/doors/settings')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.presets) && data.presets.length > 0) setPresets(data.presets);
        if (Array.isArray(data.upcharges) && data.upcharges.length > 0) setUpcharges(data.upcharges);
        if (data.formula) setFormula(data.formula);
        if (data.logistics) setLogistics(data.logistics);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load door settings:', err);
        toast.error('Failed to load door settings from database');
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/doors/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ presets, upcharges, formula, logistics }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');
      toast.success('Door settings and rates updated successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (confirm('Are you sure you want to reset all door rates, presets, and logistics to system defaults? Any unsaved edits will be lost.')) {
      setPresets(DEFAULT_DOOR_PRESETS);
      setUpcharges(DEFAULT_DOOR_UPCHARGES);
      setFormula(DEFAULT_DOOR_FORMULA);
      setLogistics(DEFAULT_DOOR_LOGISTICS);
      toast.info('Settings reset to system defaults. Click "Save Changes" to persist to database.');
    }
  };

  // Preset Handlers
  const handleUpdatePreset = (index: number, field: keyof DoorPreset, value: any) => {
    setPresets((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddPreset = () => {
    const newPreset: DoorPreset = {
      id: `door_${Date.now()}`,
      label: 'New Door Preset',
      category: 'entry',
      labour: 715,
      misc: 115.20,
      description: 'Custom door preset',
      isCustom: true,
    };
    setPresets((prev) => [...prev, newPreset]);
    toast.info('New door preset added. Don’t forget to save changes.');
  };

  const handleDeletePreset = (index: number) => {
    setPresets((prev) => prev.filter((_, i) => i !== index));
  };

  // Upcharge Handlers
  const handleUpdateUpcharge = (index: number, field: keyof DoorUpchargeConfig, value: any) => {
    setUpcharges((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAddUpcharge = () => {
    const newUpcharge: DoorUpchargeConfig = {
      id: `upcharge_${Date.now()}`,
      label: 'New Site Upcharge',
      rate: 130,
      unit: '1 Hour',
      description: 'Jobsite labour addition',
    };
    setUpcharges((prev) => [...prev, newUpcharge]);
    toast.info('New upcharge added. Don’t forget to save changes.');
  };

  const handleDeleteUpcharge = (index: number) => {
    setUpcharges((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-12 relative z-10 space-y-6 sm:space-y-8">
        <AppHeader currentPath="/admin/doors" />

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <SmartBackButton fallbackUrl="/admin" />
            <div>
              <div className="flex items-center gap-2">
                <DoorClosed className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">Door Pricing &amp; Labour Settings</h1>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                Manage door categories, presets, upcharges, surcharge %, 10% discount, and logistics rates.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Defaults
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving || loading}
              className="gap-2 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-sm"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tabs Container */}
        <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-3xl bg-muted/50 p-1">
            <TabsTrigger value="presets" className="gap-2 text-xs sm:text-sm">
              <DoorClosed className="w-4 h-4" />
              <span>Door Presets ({presets.length})</span>
            </TabsTrigger>
            <TabsTrigger value="upcharges" className="gap-2 text-xs sm:text-sm">
              <Wrench className="w-4 h-4" />
              <span>Upcharges &amp; Hardware</span>
            </TabsTrigger>
            <TabsTrigger value="formula" className="gap-2 text-xs sm:text-sm">
              <Percent className="w-4 h-4" />
              <span>Surcharges &amp; Discounts</span>
            </TabsTrigger>
            <TabsTrigger value="logistics" className="gap-2 text-xs sm:text-sm">
              <Truck className="w-4 h-4" />
              <span>Travel &amp; Logistics</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: PRESETS */}
          <TabsContent value="presets" className="space-y-4">
            <Card className="bg-card/60 backdrop-blur-sm border-border/80">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-lg">Standard Door Presets</CardTitle>
                  <CardDescription>
                    Base installation labour and miscellaneous materials from the shop price sheet.
                  </CardDescription>
                </div>
                <Button size="sm" onClick={handleAddPreset} className="gap-1.5">
                  <Plus className="w-4 h-4" />
                  Add Preset
                </Button>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground bg-muted/30">
                        <th className="py-2.5 px-3">Preset Name</th>
                        <th className="py-2.5 px-3 w-36">Category</th>
                        <th className="py-2.5 px-3 w-32">Labour ($)</th>
                        <th className="py-2.5 px-3 w-32">Misc Mat ($)</th>
                        <th className="py-2.5 px-3">Description / Notes</th>
                        <th className="py-2.5 px-3 w-16 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {presets.map((preset, idx) => (
                        <tr key={preset.id || idx} className="hover:bg-muted/20 transition-colors">
                          <td className="py-2 px-3">
                            <Input
                              value={preset.label}
                              onChange={(e) => handleUpdatePreset(idx, 'label', e.target.value)}
                              className="h-8 font-medium"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <select
                              value={preset.category}
                              onChange={(e) => handleUpdatePreset(idx, 'category', e.target.value as DoorCategory)}
                              className="h-8 w-full rounded-md border border-input bg-background px-2 text-xs shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring"
                            >
                              <option value="entry">Entry Door</option>
                              <option value="patio">Patio Door</option>
                              <option value="garden">Garden/Terrace</option>
                              <option value="storm">Storm Door</option>
                              <option value="custom">Custom</option>
                            </select>
                          </td>
                          <td className="py-2 px-3">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                              <Input
                                type="number"
                                step="0.01"
                                value={preset.labour}
                                onChange={(e) => handleUpdatePreset(idx, 'labour', parseFloat(e.target.value) || 0)}
                                className="h-8 pl-6 text-right font-mono"
                              />
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="relative">
                              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                              <Input
                                type="number"
                                step="0.01"
                                value={preset.misc}
                                onChange={(e) => handleUpdatePreset(idx, 'misc', parseFloat(e.target.value) || 0)}
                                className="h-8 pl-6 text-right font-mono"
                              />
                            </div>
                          </td>
                          <td className="py-2 px-3">
                            <Input
                              value={preset.description || ''}
                              onChange={(e) => handleUpdatePreset(idx, 'description', e.target.value)}
                              placeholder="Notes or door specs..."
                              className="h-8 text-xs text-muted-foreground"
                            />
                          </td>
                          <td className="py-2 px-3 text-center">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePreset(idx)}
                              className="h-8 w-8 text-destructive hover:bg-destructive/10"
                              title="Delete preset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: UPCHARGES & HARDWARE */}
          <TabsContent value="upcharges" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upcharges Table */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-card/60 backdrop-blur-sm border-border/80">
                  <CardHeader className="flex flex-row items-center justify-between pb-3">
                    <div>
                      <CardTitle className="text-lg">Jobsite Labour Upcharges</CardTitle>
                      <CardDescription>
                        Custom site additions such as transoms, extra height, and complex trims.
                      </CardDescription>
                    </div>
                    <Button size="sm" onClick={handleAddUpcharge} className="gap-1.5">
                      <Plus className="w-4 h-4" />
                      Add Upcharge
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left border-collapse">
                        <thead>
                          <tr className="border-b border-border/60 text-xs uppercase tracking-wider text-muted-foreground bg-muted/30">
                            <th className="py-2.5 px-3">Label</th>
                            <th className="py-2.5 px-3 w-32">Rate ($)</th>
                            <th className="py-2.5 px-3 w-32">Unit / Billing</th>
                            <th className="py-2.5 px-3">Description</th>
                            <th className="py-2.5 px-3 w-16 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {upcharges.map((upcharge, idx) => (
                            <tr key={upcharge.id || idx} className="hover:bg-muted/20 transition-colors">
                              <td className="py-2 px-3">
                                <Input
                                  value={upcharge.label}
                                  onChange={(e) => handleUpdateUpcharge(idx, 'label', e.target.value)}
                                  className="h-8 font-medium"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <div className="relative">
                                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                                  <Input
                                    type="number"
                                    step="0.5"
                                    value={upcharge.rate}
                                    onChange={(e) => handleUpdateUpcharge(idx, 'rate', parseFloat(e.target.value) || 0)}
                                    className="h-8 pl-6 text-right font-mono"
                                  />
                                </div>
                              </td>
                              <td className="py-2 px-3">
                                <Input
                                  value={upcharge.unit}
                                  onChange={(e) => handleUpdateUpcharge(idx, 'unit', e.target.value)}
                                  placeholder="e.g. 1 Hour"
                                  className="h-8 text-xs font-mono"
                                />
                              </td>
                              <td className="py-2 px-3">
                                <Input
                                  value={upcharge.description || ''}
                                  onChange={(e) => handleUpdateUpcharge(idx, 'description', e.target.value)}
                                  placeholder="Description..."
                                  className="h-8 text-xs text-muted-foreground"
                                />
                              </td>
                              <td className="py-2 px-3 text-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteUpcharge(idx)}
                                  className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Hardware Prices Card */}
              <div className="space-y-4">
                <Card className="bg-card/60 backdrop-blur-sm border-border/80">
                  <CardHeader>
                    <CardTitle className="text-lg">Hardware Standard Rates</CardTitle>
                    <CardDescription>
                      Lockset, deadbolt, and customer-supplied hardware charges.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Standard Lockset &amp; Deadbolt Hardware ($)</Label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                        <Input
                          type="number"
                          step="1"
                          value={formula.locksetDeadboltPrice}
                          onChange={(e) =>
                            setFormula((prev) => ({
                              ...prev,
                              locksetDeadboltPrice: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="pl-6 font-mono font-medium"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Default shop price: $147.00 per set</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs">Customer-Supplied Hardware Fee ($)</Label>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                        <Input
                          type="number"
                          step="1"
                          value={formula.customerSuppliedHardwareFee}
                          onChange={(e) =>
                            setFormula((prev) => ({
                              ...prev,
                              customerSuppliedHardwareFee: parseFloat(e.target.value) || 0,
                            }))
                          }
                          className="pl-6 font-mono font-medium"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Default install charge: $80.00</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 3: SURCHARGES & DISCOUNTS */}
          <TabsContent value="formula" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
              <Card className="bg-card/60 backdrop-blur-sm border-border/80">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Percent className="w-5 h-5 text-primary" />
                    Door Surcharge Rate
                  </CardTitle>
                  <CardDescription>
                    Manufacturer price surcharge applied to base Inkster door pricing.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Surcharge Percentage (%)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.5"
                        value={formula.surchargeRate}
                        onChange={(e) =>
                          setFormula((prev) => ({
                            ...prev,
                            surchargeRate: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="pr-8 font-mono font-bold text-lg"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Typically 8% aligned with the manufacturer pricing adjustments.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/60 backdrop-blur-sm border-border/80">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Percent className="w-5 h-5 text-emerald-500" />
                    Door Discount Rate
                  </CardTitle>
                  <CardDescription>
                    Standard discount applied to Entry, Patio, and Garden doors.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Standard Door Discount (%)</Label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.5"
                        value={formula.doorDiscountPercent}
                        onChange={(e) =>
                          setFormula((prev) => ({
                            ...prev,
                            doorDiscountPercent: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="pr-8 font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">%</span>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/50">
                      <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong>Note:</strong> Storm doors are strictly <strong>0% discount</strong> (exempt from the standard door discount per shop policy).
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 4: LOGISTICS & TRAVEL */}
          <TabsContent value="logistics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Setup Fees */}
              <Card className="bg-card/60 backdrop-blur-sm border-border/80">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    Base Setup Fees
                  </CardTitle>
                  <CardDescription>Standard truck &amp; site mobilization charges.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Local Setup Fee ($)</Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                      <Input
                        type="number"
                        step="5"
                        value={logistics.setupFeeDefault}
                        onChange={(e) =>
                          setLogistics((prev) => ({
                            ...prev,
                            setupFeeDefault: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="pl-6 font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">Standard in-town setup ($140.00)</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Dryden / Sioux Lookout Standard ($)</Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                      <Input
                        type="number"
                        step="0.5"
                        value={logistics.setupFeeFarStandard}
                        onChange={(e) =>
                          setLogistics((prev) => ({
                            ...prev,
                            setupFeeFarStandard: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="pl-6 font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">Standard remote setup ($727.50)</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Dryden / Sioux Lookout Small ($)</Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                      <Input
                        type="number"
                        step="0.5"
                        value={logistics.setupFeeFarSmall}
                        onChange={(e) =>
                          setLogistics((prev) => ({
                            ...prev,
                            setupFeeFarSmall: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="pl-6 font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">Single unit / partial setup ($363.50)</p>
                  </div>
                </CardContent>
              </Card>

              {/* Mileage & Vehicle */}
              <Card className="bg-card/60 backdrop-blur-sm border-border/80">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Truck className="w-4 h-4 text-primary" />
                    Vehicle Mileage
                  </CardTitle>
                  <CardDescription>Rate per kilometer traveled outside standard zone.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Vehicle Rate per KM ($/km)</Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={logistics.vehicleRatePerKm}
                        onChange={(e) =>
                          setLogistics((prev) => ({
                            ...prev,
                            vehicleRatePerKm: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="pl-6 font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">Default rate: $0.98/km</p>
                  </div>
                </CardContent>
              </Card>

              {/* Crew Hourly Rates */}
              <Card className="bg-card/60 backdrop-blur-sm border-border/80">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-primary" />
                    Crew Travel Hourly Rates
                  </CardTitle>
                  <CardDescription>Hourly billing for crew transit time.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">2-Man Crew Rate ($/hr)</Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                      <Input
                        type="number"
                        step="5"
                        value={logistics.crewHourly2Men}
                        onChange={(e) =>
                          setLogistics((prev) => ({
                            ...prev,
                            crewHourly2Men: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="pl-6 font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">Default 2-man rate: $150.00/hr</p>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">3-Man Crew Rate ($/hr)</Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                      <Input
                        type="number"
                        step="5"
                        value={logistics.crewHourly3Men}
                        onChange={(e) =>
                          setLogistics((prev) => ({
                            ...prev,
                            crewHourly3Men: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="pl-6 font-mono"
                      />
                    </div>
                    <p className="text-[11px] text-muted-foreground">Default 3-man rate: $200.00/hr</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

