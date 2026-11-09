'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Layers, Wrench, Save, Sliders, Sparkles, Grid } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { useAdminSealedUnits } from '@/hooks/admin/useAdminSealedUnits';
import {
  AdminSealedUnitsHeader,
  AdminGlassCombosTab,
  AdminLabourSettingsTab,
  AdminFormulaConstantsTab,
  AdminGrillsSettingsTab,
} from '@/components/admin/sealed-units';

export default function AdminSealedUnitsPage() {
  const {
    formula,
    setFormula,
    labour,
    setLabour,
    thicknessBreaks,
    grills,
    loading,
    saving,
    activeTab,
    setActiveTab,
    handlePriceChange,
    handleGridRateChange,
    handleBurst3Change,
    handleBurst5Change,
    handleGrillExtraChange,
    handleResetDefaults,
    handleSave,
    annealedCombos,
    temperedCombos,
  } = useAdminSealedUnits();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-10 relative z-10 space-y-6 sm:space-y-8">
        <AppHeader currentPath="/admin/sealed-units" />

        <AdminSealedUnitsHeader
          loading={loading}
          saving={saving}
          onResetDefaults={handleResetDefaults}
          onSave={() => handleSave()}
        />

        {loading ? (
          <div className="py-20 text-center text-muted-foreground animate-pulse text-sm">
            Loading Sealed Unit pricing settings from database...
          </div>
        ) : (
          <div className="space-y-6">
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

              <TabsContent value="annealed" className="space-y-6">
                <AdminGlassCombosTab
                  title="Annealed Sealed Unit Combinations (Foam Spacer)"
                  description="Base rate ($/sqft) by glass thickness. Clear values to set as N/A (e.g. 2-lites have no dual price)."
                  icon={<Layers className="w-5 h-5 text-primary" />}
                  combos={annealedCombos}
                  onPriceChange={handlePriceChange}
                />
              </TabsContent>

              <TabsContent value="tempered" className="space-y-6">
                <AdminGlassCombosTab
                  title="Tempered Sealed Unit Combinations (All Lites Tempered)"
                  description="Base rate ($/sqft) for tempered safety glass. Surcharges, argon, and multipliers apply equally."
                  icon={<Sparkles className="w-5 h-5 text-amber-500" />}
                  combos={temperedCombos}
                  onPriceChange={handlePriceChange}
                />
              </TabsContent>

              <TabsContent value="labour" className="space-y-6">
                <AdminLabourSettingsTab labour={labour} setLabour={setLabour} />
              </TabsContent>

              <TabsContent value="formula" className="space-y-6">
                <AdminFormulaConstantsTab
                  formula={formula}
                  setFormula={setFormula}
                  thicknessBreaks={thicknessBreaks}
                />
              </TabsContent>

              <TabsContent value="grills" className="space-y-6">
                <AdminGrillsSettingsTab
                  grills={grills}
                  onGridRateChange={handleGridRateChange}
                  onBurst3Change={handleBurst3Change}
                  onBurst5Change={handleBurst5Change}
                  onGrillExtraChange={handleGrillExtraChange}
                />
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
