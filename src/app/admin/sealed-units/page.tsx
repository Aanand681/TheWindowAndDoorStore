'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Layers,
  DollarSign,
  Wrench,
  RotateCcw,
  Save,
  Plus,
  Trash2,
  Sliders,
  CheckCircle2,
  Sparkles,
  Grid,
} from 'lucide-react';
import SmartBackButton from '@/components/shared/SmartBackButton';
import { AppHeader } from '@/components/layout/AppHeader';
import {
  ComboPricing,
  SealedUnitFormulaConstants,
  SealedUnitLabourSettings,
  ThicknessBreak,
  SealedUnitGrillSettings,
  DEFAULT_SEALED_UNIT_COMBOS,
  DEFAULT_FORMULA_CONSTANTS,
  DEFAULT_LABOUR_SETTINGS,
  DEFAULT_THICKNESS_BREAKS,
  DEFAULT_GRILL_SETTINGS,
} from '@/lib/sealed-units-logic';
import { toast } from 'sonner';

export default function AdminSealedUnitsPage() {
  const [combos, setCombos] = useState<ComboPricing[]>(DEFAULT_SEALED_UNIT_COMBOS);
  const [formula, setFormula] = useState<SealedUnitFormulaConstants>(DEFAULT_FORMULA_CONSTANTS);
  const [labour, setLabour] = useState<SealedUnitLabourSettings>(DEFAULT_LABOUR_SETTINGS);
  const [thicknessBreaks, setThicknessBreaks] = useState<ThicknessBreak[]>(DEFAULT_THICKNESS_BREAKS);
  const [grills, setGrills] = useState<SealedUnitGrillSettings>(DEFAULT_GRILL_SETTINGS);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'annealed' | 'tempered' | 'labour' | 'formula' | 'grills'>('annealed');

  useEffect(() => {
    fetch('/api/sealed-units/settings')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.combos) && data.combos.length > 0) {
          setCombos(data.combos);
        }
        if (data.formula) setFormula(data.formula);
        if (data.labour) setLabour(data.labour);
        if (Array.isArray(data.thicknessBreaks)) setThicknessBreaks(data.thicknessBreaks);
        if (data.grills) setGrills(data.grills);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load sealed unit settings:', err);
        setLoading(false);
      });
  }, []);

  const handlePriceChange = (
    comboId: string,
    thickness: number,
    pane: 'dual' | 'triple',
    value: string
  ) => {
    const num = value.trim() === '' ? null : Number(value);
    setCombos((prev) =>
      prev.map((c) => {
        if (c.id !== comboId) return c;
        const currentPrices = c.prices || {};
        const currentThickness = currentPrices[thickness] || { dual: null, triple: null };
        return {
          ...c,
          prices: {
            ...currentPrices,
            [thickness]: {
              ...currentThickness,
              [pane]: num !== null && !isNaN(num) ? num : null,
            },
          },
        };
      })
    );
  };

  const handleGridRateChange = (profile: string, color: string, value: string) => {
    const num = value.trim() === '' ? null : Number(value);
    setGrills((prev) => ({
      ...prev,
      gridRates: {
        ...prev.gridRates,
        [profile]: {
          ...(prev.gridRates?.[profile] || {}),
          [color]: num !== null && !isNaN(num) ? num : null,
        },
      },
    }));
  };

  const handleBurst3Change = (colorKey: string, value: string) => {
    const num = Number(value) || 0;
    setGrills((prev) => ({
      ...prev,
      burst3Rates: {
        ...prev.burst3Rates,
        [colorKey]: num,
      },
    }));
  };

  const handleBurst5Change = (colorKey: string, value: string) => {
    const num = Number(value) || 0;
    setGrills((prev) => ({
      ...prev,
      burst5Rates: {
        ...prev.burst5Rates,
        [colorKey]: num,
      },
    }));
  };

  const handleGrillExtraChange = (field: 'tIntersectionPrice' | 'bentHubPrice' | 'customerOwnGrillPrice', value: string) => {
    const num = Number(value) || 0;
    setGrills((prev) => ({
      ...prev,
      [field]: num,
    }));
  };

  const handleResetDefaults = () => {
    if (!confirm('Are you sure you want to reset all sealed unit prices and labour rules to defaults?')) {
      return;
    }
    setCombos(DEFAULT_SEALED_UNIT_COMBOS);
    setFormula(DEFAULT_FORMULA_CONSTANTS);
    setLabour(DEFAULT_LABOUR_SETTINGS);
    setThicknessBreaks(DEFAULT_THICKNESS_BREAKS);
    setGrills(DEFAULT_GRILL_SETTINGS);
    toast.info('Settings reset to default source sheet rates.');
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/sealed-units/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          combos,
          formula,
          labour,
          thicknessBreaks,
          grills,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      toast.success('Sealed Unit pricing and rules saved successfully!');
    } catch (err: any) {
      toast.error(err.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  const annealedCombos = combos.filter((c) => c.treatment === 'annealed');
  const temperedCombos = combos.filter((c) => c.treatment === 'tempered');

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-10 relative z-10 space-y-6 sm:space-y-8">
        <AppHeader currentPath="/admin/sealed-units" />

        {/* Sub-bar with SmartBackButton & Breadcrumb */}
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-border/50">
          <div className="flex items-center gap-3 flex-wrap">
            <SmartBackButton fallbackUrl="/admin" title="Back to Admin" />
            <div className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Layers className="w-5 h-5 text-primary" />
              <span className="text-base font-semibold tracking-wider uppercase">
                Sealed Unit Pricing &amp; Labour Rules
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              className="gap-1.5 text-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => handleSave()}
              disabled={saving || loading}
              className="gap-1.5 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-muted-foreground animate-pulse text-sm">
            Loading Sealed Unit pricing settings from database...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Navigation Tabs */}
            <Tabs
              value={activeTab}
              onValueChange={(v: any) => setActiveTab(v)}
              className="w-full space-y-6"
            >
              <TabsList className="bg-muted/50 p-1 rounded-xl border border-border/60">
                <TabsTrigger value="annealed" className="gap-2 text-xs font-semibold">
                  <span>Annealed Glass Rates ({annealedCombos.length})</span>
                </TabsTrigger>
                <TabsTrigger value="tempered" className="gap-2 text-xs font-semibold">
                  <span>Tempered Glass Rates ({temperedCombos.length})</span>
                </TabsTrigger>
                <TabsTrigger value="labour" className="gap-2 text-xs font-semibold">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Installation &amp; Travel Rules</span>
                </TabsTrigger>
                <TabsTrigger value="formula" className="gap-2 text-xs font-semibold">
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Formula Multipliers &amp; Breaks</span>
                </TabsTrigger>
                <TabsTrigger value="grills" className="gap-2 text-xs font-semibold">
                  <Grid className="w-3.5 h-3.5" />
                  <span>Interior Grills</span>
                </TabsTrigger>
              </TabsList>

              {/* TAB 1: Annealed Glass Rates */}
              <TabsContent value="annealed" className="space-y-6">
                <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
                  <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary" />
                      <span>Annealed Sealed Unit Combinations (Foam Spacer)</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Base rate ($/sqft) by glass thickness. Clear values to set as N/A (e.g. 2-lites have no dual price).
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-muted/40 uppercase tracking-wider text-[10px] text-muted-foreground border-b border-border/60">
                          <tr>
                            <th className="p-3 w-64">Combination Name</th>
                            <th className="p-3 text-center" colSpan={2}>3mm ($)</th>
                            <th className="p-3 text-center" colSpan={2}>4mm ($)</th>
                            <th className="p-3 text-center" colSpan={2}>5mm ($)</th>
                            <th className="p-3 text-center" colSpan={2}>6mm ($)</th>
                          </tr>
                          <tr className="border-b border-border/40 text-[9px] text-muted-foreground/80">
                            <th className="p-2"></th>
                            <th className="p-1 text-center">Dual</th>
                            <th className="p-1 text-center">Triple</th>
                            <th className="p-1 text-center">Dual</th>
                            <th className="p-1 text-center">Triple</th>
                            <th className="p-1 text-center">Dual</th>
                            <th className="p-1 text-center">Triple</th>
                            <th className="p-1 text-center">Dual</th>
                            <th className="p-1 text-center">Triple</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {annealedCombos.map((combo) => (
                            <tr key={combo.id} className="hover:bg-muted/20 transition-colors">
                              <td className="p-3 font-semibold text-foreground">{combo.name}</td>
                              {[3, 4, 5, 6].map((th) => (
                                <React.Fragment key={th}>
                                  <td className="p-1.5 text-center">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="—"
                                      value={combo.prices?.[th]?.dual ?? (combo.prices as any)?.[String(th)]?.dual ?? ''}
                                      onChange={(e) =>
                                        handlePriceChange(combo.id, th, 'dual', e.target.value)
                                      }
                                      className="h-8 w-18 text-xs font-mono text-center mx-auto bg-background"
                                    />
                                  </td>
                                  <td className="p-1.5 text-center">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="—"
                                      value={combo.prices?.[th]?.triple ?? (combo.prices as any)?.[String(th)]?.triple ?? ''}
                                      onChange={(e) =>
                                        handlePriceChange(combo.id, th, 'triple', e.target.value)
                                      }
                                      className="h-8 w-18 text-xs font-mono text-center mx-auto bg-background"
                                    />
                                  </td>
                                </React.Fragment>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 2: Tempered Glass Rates */}
              <TabsContent value="tempered" className="space-y-6">
                <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
                  <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      <span>Tempered Sealed Unit Combinations (All Lites Tempered)</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Base rate ($/sqft) for tempered safety glass. Surcharges, argon, and multipliers apply equally.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-muted/40 uppercase tracking-wider text-[10px] text-muted-foreground border-b border-border/60">
                          <tr>
                            <th className="p-3 w-64">Combination Name</th>
                            <th className="p-3 text-center" colSpan={2}>3mm ($)</th>
                            <th className="p-3 text-center" colSpan={2}>4mm ($)</th>
                            <th className="p-3 text-center" colSpan={2}>5mm ($)</th>
                            <th className="p-3 text-center" colSpan={2}>6mm ($)</th>
                          </tr>
                          <tr className="border-b border-border/40 text-[9px] text-muted-foreground/80">
                            <th className="p-2"></th>
                            <th className="p-1 text-center">Dual</th>
                            <th className="p-1 text-center">Triple</th>
                            <th className="p-1 text-center">Dual</th>
                            <th className="p-1 text-center">Triple</th>
                            <th className="p-1 text-center">Dual</th>
                            <th className="p-1 text-center">Triple</th>
                            <th className="p-1 text-center">Dual</th>
                            <th className="p-1 text-center">Triple</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40">
                          {temperedCombos.map((combo) => (
                            <tr key={combo.id} className="hover:bg-muted/20 transition-colors">
                              <td className="p-3 font-semibold text-foreground">{combo.name}</td>
                              {[3, 4, 5, 6].map((th) => (
                                <React.Fragment key={th}>
                                  <td className="p-1.5 text-center">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="—"
                                      value={combo.prices?.[th]?.dual ?? (combo.prices as any)?.[String(th)]?.dual ?? ''}
                                      onChange={(e) =>
                                        handlePriceChange(combo.id, th, 'dual', e.target.value)
                                      }
                                      className="h-8 w-18 text-xs font-mono text-center mx-auto bg-background"
                                    />
                                  </td>
                                  <td className="p-1.5 text-center">
                                    <Input
                                      type="number"
                                      step="0.01"
                                      placeholder="—"
                                      value={combo.prices?.[th]?.triple ?? (combo.prices as any)?.[String(th)]?.triple ?? ''}
                                      onChange={(e) =>
                                        handlePriceChange(combo.id, th, 'triple', e.target.value)
                                      }
                                      className="h-8 w-18 text-xs font-mono text-center mx-auto bg-background"
                                    />
                                  </td>
                                </React.Fragment>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 3: Installation & Travel Rules */}
              <TabsContent value="labour" className="space-y-6">
                <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
                  <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-emerald-500" />
                      <span>Installation Labour, Misc Supplies &amp; Travel Rules</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Configured in accordance with the shop Sealed Units Excel spreadsheet calculations.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="labourRate" className="text-xs font-bold uppercase tracking-wider">
                          Installation Labour Rate ($/sqft)
                        </Label>
                        <Input
                          id="labourRate"
                          type="number"
                          step="0.01"
                          min="0"
                          value={labour.labourRatePerSqft}
                          onChange={(e) =>
                            setLabour({ ...labour, labourRatePerSqft: Number(e.target.value) || 0 })
                          }
                          className="bg-background font-mono"
                        />
                        <p className="text-[11px] text-muted-foreground">Standard rate: $14.40 per square foot</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="labourMin" className="text-xs font-bold uppercase tracking-wider">
                          Labour Minimum Fee ($/unit)
                        </Label>
                        <Input
                          id="labourMin"
                          type="number"
                          step="1"
                          min="0"
                          value={labour.labourMinPerUnit}
                          onChange={(e) =>
                            setLabour({ ...labour, labourMinPerUnit: Number(e.target.value) || 0 })
                          }
                          className="bg-background font-mono"
                        />
                        <p className="text-[11px] text-muted-foreground">Standard minimum: $120.00 per window</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="miscRate" className="text-xs font-bold uppercase tracking-wider">
                          Misc Supplies Rate ($/sqft)
                        </Label>
                        <Input
                          id="miscRate"
                          type="number"
                          step="0.01"
                          min="0"
                          value={labour.miscRatePerSqft}
                          onChange={(e) =>
                            setLabour({ ...labour, miscRatePerSqft: Number(e.target.value) || 0 })
                          }
                          className="bg-background font-mono"
                        />
                        <p className="text-[11px] text-muted-foreground">Standard rate: $2.40 per square foot</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="setupDefault" className="text-xs font-bold uppercase tracking-wider">
                          Standard Setup Fee ($)
                        </Label>
                        <Input
                          id="setupDefault"
                          type="number"
                          step="1"
                          min="0"
                          value={labour.setupFeeDefault}
                          onChange={(e) =>
                            setLabour({ ...labour, setupFeeDefault: Number(e.target.value) || 0 })
                          }
                          className="bg-background font-mono"
                        />
                        <p className="text-[11px] text-muted-foreground">Default local setup under $5,000: $140.00</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="setupFarStd" className="text-xs font-bold uppercase tracking-wider">
                          Far Area Standard Setup Fee ($)
                        </Label>
                        <Input
                          id="setupFarStd"
                          type="number"
                          step="0.1"
                          min="0"
                          value={labour.setupFeeFarStandard}
                          onChange={(e) =>
                            setLabour({ ...labour, setupFeeFarStandard: Number(e.target.value) || 0 })
                          }
                          className="bg-background font-mono"
                        />
                        <p className="text-[11px] text-muted-foreground">Kenora, Dryden, Sioux Lookout: $727.50</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="setupFarSmall" className="text-xs font-bold uppercase tracking-wider">
                          Far Area Small Job Setup Fee ($)
                        </Label>
                        <Input
                          id="setupFarSmall"
                          type="number"
                          step="0.1"
                          min="0"
                          value={labour.setupFeeFarSmall}
                          onChange={(e) =>
                            setLabour({ ...labour, setupFeeFarSmall: Number(e.target.value) || 0 })
                          }
                          className="bg-background font-mono"
                        />
                        <p className="text-[11px] text-muted-foreground">Smaller far-area jobs: $363.50</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="vehicleRate" className="text-xs font-bold uppercase tracking-wider">
                          Vehicle Travel Rate ($/km)
                        </Label>
                        <Input
                          id="vehicleRate"
                          type="number"
                          step="0.01"
                          min="0"
                          value={labour.vehicleRatePerKm}
                          onChange={(e) =>
                            setLabour({ ...labour, vehicleRatePerKm: Number(e.target.value) || 0 })
                          }
                          className="bg-background font-mono"
                        />
                        <p className="text-[11px] text-muted-foreground">Both ways travel: $0.98 per KM</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="crew2" className="text-xs font-bold uppercase tracking-wider">
                          2-Man Crew Travel Rate ($/hr)
                        </Label>
                        <Input
                          id="crew2"
                          type="number"
                          step="1"
                          min="0"
                          value={labour.crewHourly2Men}
                          onChange={(e) =>
                            setLabour({ ...labour, crewHourly2Men: Number(e.target.value) || 0 })
                          }
                          className="bg-background font-mono"
                        />
                        <p className="text-[11px] text-muted-foreground">Standard rate: $150.00 / hour</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="crew3" className="text-xs font-bold uppercase tracking-wider">
                          3-Man Crew Travel Rate ($/hr)
                        </Label>
                        <Input
                          id="crew3"
                          type="number"
                          step="1"
                          min="0"
                          value={labour.crewHourly3Men}
                          onChange={(e) =>
                            setLabour({ ...labour, crewHourly3Men: Number(e.target.value) || 0 })
                          }
                          className="bg-background font-mono"
                        />
                        <p className="text-[11px] text-muted-foreground">Standard rate: $200.00 / hour</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 4: Formula Multipliers & Thickness Breaks */}
              <TabsContent value="formula" className="space-y-6">
                <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
                  <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sliders className="w-5 h-5 text-primary" />
                      <span>Pricing Formula Modifiers &amp; Ladder</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Controls the step multipliers: (Rate + Argon) × Area + Surcharge × Step + Final Addon.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="argonRate" className="text-xs font-bold uppercase tracking-wider">
                          Argon Gas Surcharge ($/sqft)
                        </Label>
                        <Input
                          id="argonRate"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formula.argonPerSqft}
                          onChange={(e) =>
                            setFormula({ ...formula, argonPerSqft: Number(e.target.value) || 0 })
                          }
                          className="bg-background font-mono"
                        />
                        <p className="text-[11px] text-muted-foreground">Default: $0.60 per square foot</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="surchargeRate" className="text-xs font-bold uppercase tracking-wider">
                          Glass Surcharge Rate (decimal)
                        </Label>
                        <Input
                          id="surchargeRate"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formula.surchargeRate}
                          onChange={(e) =>
                            setFormula({ ...formula, surchargeRate: Number(e.target.value) || 0 })
                          }
                          className="bg-background font-mono"
                        />
                        <p className="text-[11px] text-muted-foreground">Default: 0.27 (27% surcharge)</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="stepMult" className="text-xs font-bold uppercase tracking-wider">
                          Step Multiplier
                        </Label>
                        <Input
                          id="stepMult"
                          type="number"
                          step="0.1"
                          min="1"
                          value={formula.stepMultiplier}
                          onChange={(e) =>
                            setFormula({ ...formula, stepMultiplier: Number(e.target.value) || 1 })
                          }
                          className="bg-background font-mono"
                        />
                        <p className="text-[11px] text-muted-foreground">Default: 2.5 multiplier</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="finalAddon" className="text-xs font-bold uppercase tracking-wider">
                          Final Addon Rate (decimal)
                        </Label>
                        <Input
                          id="finalAddon"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formula.finalAddonRate}
                          onChange={(e) =>
                            setFormula({ ...formula, finalAddonRate: Number(e.target.value) || 0 })
                          }
                          className="bg-background font-mono"
                        />
                        <p className="text-[11px] text-muted-foreground">Default: 0.08 (8% addon)</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="minSqft" className="text-xs font-bold uppercase tracking-wider">
                          Minimum Billable Area (sqft)
                        </Label>
                        <Input
                          id="minSqft"
                          type="number"
                          step="0.1"
                          min="1"
                          value={formula.minSqft}
                          onChange={(e) =>
                            setFormula({ ...formula, minSqft: Number(e.target.value) || 1 })
                          }
                          className="bg-background font-mono"
                        />
                        <p className="text-[11px] text-muted-foreground">Default: 4.0 sq ft minimum on source sheet</p>
                      </div>
                    </div>

                    {/* Thickness Ladder */}
                    <div className="pt-4 border-t border-border/50 space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Area to Glass Thickness Ladder
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {thicknessBreaks.map((b, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">
                              Tier {idx + 1} (&lt; {b.upperBoundExclusive} sqft)
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-muted-foreground">Thickness:</span>
                              <span className="text-sm font-bold font-mono text-foreground">{b.thicknessMm}mm</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* TAB 5: Interior Metal Grills */}
              <TabsContent value="grills" className="space-y-6">
                {/* 1. Standard Grid Rates */}
                <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
                  <CardHeader className="border-b border-border/50 pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Grid className="w-5 h-5 text-primary" />
                      <span>Standard Interior Grid Pricing (Per Square / Lite)</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Base raw cost per grid square formed by intersections. Raw grill cost is added to unit price prior to surcharge and formula markups.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-muted/40 uppercase tracking-wider text-[10px] text-muted-foreground border-b border-border/60">
                          <tr>
                            <th className="p-3 w-56">Color</th>
                            <th className="p-3 text-center">5/8&quot; × 1/4&quot; ($/sq)</th>
                            <th className="p-3 text-center">3/8&quot; × 1/4&quot; ($/sq)</th>
                            <th className="p-3 text-center">8mm × 18mm Georgian ($/sq)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border/40 font-mono">
                          {[
                            'White',
                            'Brass',
                            'Pewter',
                            'Brushed Chrome',
                            'Black',
                            'Black/White',
                          ].map((color) => {
                            const p58 = grills.gridRates?.['5/8" x 1/4"']?.[color];
                            const p38 = grills.gridRates?.['3/8" x 1/4"']?.[color];
                            const pGeo = grills.gridRates?.['8mm x 18mm Georgian']?.[color];

                            return (
                              <tr key={color} className="hover:bg-muted/30">
                                <td className="p-3 font-sans font-bold text-foreground">{color}</td>
                                <td className="p-2 text-center">
                                  <div className="relative inline-block w-28">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px]">$</span>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={p58 ?? ''}
                                      placeholder="N/A"
                                      onChange={(e) =>
                                        handleGridRateChange('5/8" x 1/4"', color, e.target.value)
                                      }
                                      className="h-8 pl-6 text-center text-xs font-mono bg-background"
                                    />
                                  </div>
                                </td>
                                <td className="p-2 text-center">
                                  <div className="relative inline-block w-28">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px]">$</span>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={p38 ?? ''}
                                      placeholder="N/A"
                                      onChange={(e) =>
                                        handleGridRateChange('3/8" x 1/4"', color, e.target.value)
                                      }
                                      className="h-8 pl-6 text-center text-xs font-mono bg-background"
                                    />
                                  </div>
                                </td>
                                <td className="p-2 text-center">
                                  <div className="relative inline-block w-28">
                                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px]">$</span>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={pGeo ?? ''}
                                      placeholder="N/A"
                                      onChange={(e) =>
                                        handleGridRateChange('8mm x 18mm Georgian', color, e.target.value)
                                      }
                                      className="h-8 pl-6 text-center text-xs font-mono bg-background"
                                    />
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* 2. Sunburst Rates (3 Burst & 5 Burst) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 3 Burst Card */}
                  <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
                    <CardHeader className="border-b border-border/50 pb-3">
                      <CardTitle className="text-base font-bold flex items-center justify-between">
                        <span>&quot;3 Burst&quot; Arched Pattern ($ / unit)</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Foam spacer only</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-4">
                          <Label className="text-xs font-medium">3/8&quot; + 5/8&quot; White</Label>
                          <div className="relative w-28">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px]">$</span>
                            <Input
                              type="number"
                              step="0.5"
                              value={grills.burst3Rates?.white ?? 34}
                              onChange={(e) => handleBurst3Change('white', e.target.value)}
                              className="h-8 pl-6 text-center text-xs font-mono bg-background"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <Label className="text-xs font-medium">3/8&quot; + 5/8&quot; Brass or Pewter</Label>
                          <div className="relative w-28">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px]">$</span>
                            <Input
                              type="number"
                              step="0.5"
                              value={grills.burst3Rates?.brassPewter ?? 48}
                              onChange={(e) => handleBurst3Change('brassPewter', e.target.value)}
                              className="h-8 pl-6 text-center text-xs font-mono bg-background"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <Label className="text-xs font-medium">3/8&quot; + 5/8&quot; Brushed Chrome</Label>
                          <div className="relative w-28">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px]">$</span>
                            <Input
                              type="number"
                              step="0.5"
                              value={grills.burst3Rates?.brushedChrome ?? 53}
                              onChange={(e) => handleBurst3Change('brushedChrome', e.target.value)}
                              className="h-8 pl-6 text-center text-xs font-mono bg-background"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <Label className="text-xs font-medium">5/8&quot; Black</Label>
                          <div className="relative w-28">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px]">$</span>
                            <Input
                              type="number"
                              step="0.5"
                              value={grills.burst3Rates?.black ?? 53}
                              onChange={(e) => handleBurst3Change('black', e.target.value)}
                              className="h-8 pl-6 text-center text-xs font-mono bg-background"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* 5 Burst Card */}
                  <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
                    <CardHeader className="border-b border-border/50 pb-3">
                      <CardTitle className="text-base font-bold flex items-center justify-between">
                        <span>&quot;5 Burst&quot; Arched Pattern ($ / unit)</span>
                        <span className="text-[10px] text-muted-foreground font-normal">Foam spacer only</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between gap-4">
                          <Label className="text-xs font-medium">3/8&quot; + 5/8&quot; White</Label>
                          <div className="relative w-28">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px]">$</span>
                            <Input
                              type="number"
                              step="0.5"
                              value={grills.burst5Rates?.white ?? 36}
                              onChange={(e) => handleBurst5Change('white', e.target.value)}
                              className="h-8 pl-6 text-center text-xs font-mono bg-background"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <Label className="text-xs font-medium">3/8&quot; + 5/8&quot; Brass or Pewter</Label>
                          <div className="relative w-28">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px]">$</span>
                            <Input
                              type="number"
                              step="0.5"
                              value={grills.burst5Rates?.brassPewter ?? 64}
                              onChange={(e) => handleBurst5Change('brassPewter', e.target.value)}
                              className="h-8 pl-6 text-center text-xs font-mono bg-background"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <Label className="text-xs font-medium">3/8&quot; + 5/8&quot; Brushed Chrome</Label>
                          <div className="relative w-28">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px]">$</span>
                            <Input
                              type="number"
                              step="0.5"
                              value={grills.burst5Rates?.brushedChrome ?? 64}
                              onChange={(e) => handleBurst5Change('brushedChrome', e.target.value)}
                              className="h-8 pl-6 text-center text-xs font-mono bg-background"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <Label className="text-xs font-medium">5/8&quot; Black</Label>
                          <div className="relative w-28">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-[11px]">$</span>
                            <Input
                              type="number"
                              step="0.5"
                              value={grills.burst5Rates?.black ?? 64}
                              onChange={(e) => handleBurst5Change('black', e.target.value)}
                              className="h-8 pl-6 text-center text-xs font-mono bg-background"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 3. Accessories & Services */}
                <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
                  <CardHeader className="border-b border-border/50 pb-3">
                    <CardTitle className="text-base font-bold">
                      Grill Accessories &amp; Custom Installation Fees
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
                    <div className="space-y-1.5">
                      <Label className="font-bold uppercase tracking-wider text-muted-foreground">
                        T-Intersection ($ / connection)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">$</span>
                        <Input
                          type="number"
                          step="0.25"
                          value={grills.tIntersectionPrice ?? 5.50}
                          onChange={(e) => handleGrillExtraChange('tIntersectionPrice', e.target.value)}
                          className="pl-7 bg-background font-mono"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Default: $5.50 per connection</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-bold uppercase tracking-wider text-muted-foreground">
                        Bent Grill Hubs ($ each)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">$</span>
                        <Input
                          type="number"
                          step="1"
                          value={grills.bentHubPrice ?? 110.00}
                          onChange={(e) => handleGrillExtraChange('bentHubPrice', e.target.value)}
                          className="pl-7 bg-background font-mono"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Default: $110.00 each</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="font-bold uppercase tracking-wider text-muted-foreground">
                        Customer&rsquo;s Own Grills ($ / unit)
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">$</span>
                        <Input
                          type="number"
                          step="1"
                          value={grills.customerOwnGrillPrice ?? 33.00}
                          onChange={(e) => handleGrillExtraChange('customerOwnGrillPrice', e.target.value)}
                          className="pl-7 bg-background font-mono"
                        />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Default: $33.00 / unit</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Bottom Save Bar */}
            <div className="flex items-center justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleResetDefaults}
                className="cursor-pointer"
              >
                Reset to Defaults
              </Button>
              <Button
                type="button"
                onClick={() => handleSave()}
                disabled={saving || loading}
                className="gap-2 px-8 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
