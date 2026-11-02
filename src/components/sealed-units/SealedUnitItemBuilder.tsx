'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import {
  Layers,
  Plus,
  Grid,
  Shapes,
  Bookmark,
  FolderOpen,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  GlassTreatment,
  PaneType,
  ComboPricing,
  GrillType,
  GrillProfile,
  GrillItemConfig,
  SealedUnitGrillSettings,
  GlassShape,
  getAvailableGrillColors,
} from '@/lib/sealed-units-logic';

export interface SealedUnitItemBuilderProps {
  treatment: GlassTreatment;
  setTreatment: (t: GlassTreatment) => void;
  availableCombos: ComboPricing[];
  selectedComboId: string;
  setSelectedComboId: (id: string) => void;
  activeCombo: ComboPricing | undefined;
  hasDualPane: boolean;
  selectedPane: PaneType;
  setSelectedPane: (p: PaneType) => void;
  shape: GlassShape;
  setShape: (s: GlassShape) => void;
  widthInput: string;
  setWidthInput: (w: string) => void;
  heightInput: string;
  setHeightInput: (h: string) => void;
  qtyInput: string;
  setQtyInput: (q: string) => void;
  // Grill state
  grillType: GrillType;
  setGrillType: (g: GrillType) => void;
  grillProfile: GrillProfile;
  setGrillProfile: (p: GrillProfile) => void;
  grillColor: string;
  setGrillColor: (c: string) => void;
  grillPatternMode: 'pattern' | 'manual';
  setGrillPatternMode: (m: 'pattern' | 'manual') => void;
  grillCols: string;
  setGrillCols: (c: string) => void;
  grillRows: string;
  setGrillRows: (r: string) => void;
  grillSquares: string;
  setGrillSquares: (s: string) => void;
  grillTIntersections: string;
  setGrillTIntersections: (t: string) => void;
  grillBentHubs: string;
  setGrillBentHubs: (b: string) => void;
  computedGrillConfig: GrillItemConfig;
  activeGrillPreview: { rawCost: number; description: string };
  grills: SealedUnitGrillSettings;
  // Submit
  onAddItem: (e: React.FormEvent) => void;
  // Draft Actions
  onSaveDraft?: () => void;
  onOpenSavedQuotes?: () => void;
  savedDraftsCount?: number;
}

export function SealedUnitItemBuilder({
  treatment,
  setTreatment,
  availableCombos,
  selectedComboId,
  setSelectedComboId,
  activeCombo,
  hasDualPane,
  selectedPane,
  setSelectedPane,
  shape,
  setShape,
  widthInput,
  setWidthInput,
  heightInput,
  setHeightInput,
  qtyInput,
  setQtyInput,
  grillType,
  setGrillType,
  grillProfile,
  setGrillProfile,
  grillColor,
  setGrillColor,
  grillPatternMode,
  setGrillPatternMode,
  grillCols,
  setGrillCols,
  grillRows,
  setGrillRows,
  grillSquares,
  setGrillSquares,
  grillTIntersections,
  setGrillTIntersections,
  grillBentHubs,
  setGrillBentHubs,
  computedGrillConfig,
  activeGrillPreview,
  grills,
  onAddItem,
  onSaveDraft,
  onOpenSavedQuotes,
  savedDraftsCount,
}: SealedUnitItemBuilderProps) {
  const widthRef = useRef<HTMLInputElement>(null);

  // Dynamic available grill colors strictly matching profile pricing sheet
  const availableGrillColors = useMemo(() => {
    return getAvailableGrillColors(grillProfile);
  }, [grillProfile]);

  // Auto-correct grill color if current color is not supported by newly selected profile
  useEffect(() => {
    if (!availableGrillColors.includes(grillColor)) {
      setGrillColor(availableGrillColors[0] || 'White');
    }
  }, [availableGrillColors, grillColor, setGrillColor]);

  const handleResetInputs = () => {
    setWidthInput('');
    setHeightInput('');
    setQtyInput('1');
    widthRef.current?.focus();
  };

  return (
    <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl shadow-xl overflow-hidden">
      {/* Header with Save Draft & Saved Quotes on the side */}
      <div className="border-b border-border/50 py-2.5 px-3.5 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-sm font-bold flex items-center gap-1.5 text-foreground">
            <Layers className="w-4 h-4 text-primary" />
            <span>Unit Specifications &amp; Glass Config</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onSaveDraft && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onSaveDraft}
                className="h-7 px-2.5 text-[11px] font-semibold cursor-pointer gap-1 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 shadow-xs"
                title="Save sealed unit quote to drafts"
              >
                <Bookmark className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                <span>Save Draft</span>
              </Button>
            )}
            {onOpenSavedQuotes && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenSavedQuotes}
                className="h-7 px-2.5 text-[11px] font-semibold cursor-pointer gap-1 border-border hover:bg-muted shadow-xs"
                title="Open saved quotes"
              >
                <FolderOpen className="w-3 h-3 text-muted-foreground" />
                <span>Saved Quotes</span>
                {savedDraftsCount !== undefined && savedDraftsCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-primary/10 text-primary">
                    {savedDraftsCount}
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">
          Select treatment, combo, shape, and dimensions with live fraction parsing.
        </p>
      </div>

      <div className="p-3 sm:p-3.5 space-y-3">
        <form onSubmit={onAddItem} className="space-y-3">
          {/* Treatment Selector: Annealed vs Tempered */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-muted-foreground">Glass Treatment</Label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setTreatment('annealed')}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer',
                  treatment === 'annealed'
                    ? 'bg-sky-100 text-sky-900 border-sky-400 font-bold shadow-xs dark:bg-sky-950/70 dark:text-sky-200 dark:border-sky-700'
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border/70'
                )}
              >
                Annealed (Standard)
              </button>
              <button
                type="button"
                onClick={() => setTreatment('tempered')}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer',
                  treatment === 'tempered'
                    ? 'bg-sky-100 text-sky-900 border-sky-400 font-bold shadow-xs dark:bg-sky-950/70 dark:text-sky-200 dark:border-sky-700'
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border/70'
                )}
              >
                Tempered (Safety)
              </button>
            </div>
          </div>

          {/* Combination Selector */}
          <div className="space-y-1">
            <Label htmlFor="comboSelect" className="text-[11px] font-semibold text-muted-foreground">
              Glass Combination
            </Label>
            <select
              id="comboSelect"
              value={selectedComboId}
              onChange={(e) => setSelectedComboId(e.target.value)}
              className="w-full h-8 px-2.5 rounded-lg border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
            >
              {availableCombos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Pane Selector (Dual vs Triple) */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-muted-foreground">Pane Type</Label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                disabled={!hasDualPane}
                onClick={() => setSelectedPane('dual')}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer',
                  !hasDualPane && 'opacity-40 cursor-not-allowed line-through',
                  selectedPane === 'dual'
                    ? 'bg-sky-100 text-sky-900 border-sky-400 font-bold shadow-xs dark:bg-sky-950/70 dark:text-sky-200 dark:border-sky-700'
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border/70'
                )}
              >
                Dual Pane
              </button>
              <button
                type="button"
                onClick={() => setSelectedPane('triple')}
                className={cn(
                  'px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer',
                  selectedPane === 'triple'
                    ? 'bg-sky-100 text-sky-900 border-sky-400 font-bold shadow-xs dark:bg-sky-950/70 dark:text-sky-200 dark:border-sky-700'
                    : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border/70'
                )}
              >
                Triple Pane
              </button>
            </div>
          </div>

          {/* Shape Charge Selector (Vitro Price Sheet) */}
          <div className="space-y-1">
            <Label className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
              <Shapes className="w-3 h-3 text-primary" />
              <span>Unit Shape &amp; Custom Geometry</span>
            </Label>
            <div className="grid grid-cols-3 gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setShape('rectangle')}
                className={cn(
                  'px-2 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer text-center',
                  shape === 'rectangle'
                    ? 'bg-sky-100 text-sky-900 border-sky-400 font-bold shadow-xs dark:bg-sky-950/70 dark:text-sky-200 dark:border-sky-700'
                    : 'bg-muted/30 hover:bg-muted text-muted-foreground border-border/70'
                )}
              >
                <div>Rectangle</div>
                <div className="text-[9px] opacity-80 font-mono">$0</div>
              </button>
              <button
                type="button"
                onClick={() => setShape('rakehead_triangle')}
                className={cn(
                  'px-2 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer text-center',
                  shape === 'rakehead_triangle'
                    ? 'bg-sky-100 text-sky-900 border-sky-400 font-bold shadow-xs dark:bg-sky-950/70 dark:text-sky-200 dark:border-sky-700'
                    : 'bg-muted/30 hover:bg-muted text-muted-foreground border-border/70'
                )}
              >
                <div>Rakehead</div>
                <div className="text-[9px] opacity-80 font-mono">
                  {treatment === 'annealed' ? (selectedPane === 'triple' ? '+$40' : '+$20') : '+10%'}
                </div>
              </button>
              <button
                type="button"
                onClick={() => setShape('roundtop_circle_octagon')}
                className={cn(
                  'px-2 py-1.5 rounded-lg border font-semibold transition-all cursor-pointer text-center',
                  shape === 'roundtop_circle_octagon'
                    ? 'bg-sky-100 text-sky-900 border-sky-400 font-bold shadow-xs dark:bg-sky-950/70 dark:text-sky-200 dark:border-sky-700'
                    : 'bg-muted/30 hover:bg-muted text-muted-foreground border-border/70'
                )}
              >
                <div>Roundtop</div>
                <div className="text-[9px] opacity-80 font-mono">
                  {treatment === 'annealed' ? (selectedPane === 'triple' ? '+$50' : '+$30') : '+20%'}
                </div>
              </button>
            </div>
          </div>

          {/* Dimensions Input (Inches) */}
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-1">
              <Label htmlFor="widthInput" className="text-[11px] font-semibold text-muted-foreground">
                Width (in)
              </Label>
              <Input
                ref={widthRef}
                id="widthInput"
                type="text"
                placeholder='e.g. 30 1/2"'
                value={widthInput}
                onChange={(e) => setWidthInput(e.target.value)}
                className="h-8 text-xs font-mono font-bold"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="heightInput" className="text-[11px] font-semibold text-muted-foreground">
                Height (in)
              </Label>
              <Input
                id="heightInput"
                type="text"
                placeholder='e.g. 40"'
                value={heightInput}
                onChange={(e) => setHeightInput(e.target.value)}
                className="h-8 text-xs font-mono font-bold"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="qtyInput" className="text-[11px] font-semibold text-muted-foreground">
                Quantity
              </Label>
              <Input
                id="qtyInput"
                type="number"
                min="1"
                value={qtyInput}
                onChange={(e) => setQtyInput(e.target.value)}
                className="h-8 text-xs font-mono font-bold"
                required
              />
            </div>
          </div>

          {/* Interior Grill Configurator */}
          <div className="border border-border/70 rounded-xl p-2.5 bg-muted/10 space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-[11px] font-bold text-foreground flex items-center gap-1">
                <Grid className="w-3.5 h-3.5 text-primary" />
                <span>Interior Metal Grills</span>
              </Label>
              <span className="text-[9px] text-muted-foreground font-mono">Vitro Metal Grid Sheet</span>
            </div>

            {/* Grill Type Selector */}
            <div className="grid grid-cols-3 gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setGrillType('none')}
                className={cn(
                  'px-2 py-1 rounded-lg border font-semibold transition-all cursor-pointer text-center',
                  grillType === 'none'
                    ? 'bg-sky-100 text-sky-900 border-sky-400 font-bold shadow-xs dark:bg-sky-950/70 dark:text-sky-200 dark:border-sky-700'
                    : 'bg-background hover:bg-muted text-muted-foreground border-border/70'
                )}
              >
                None
              </button>
              <button
                type="button"
                onClick={() => setGrillType('grid')}
                className={cn(
                  'px-2 py-1 rounded-lg border font-semibold transition-all cursor-pointer text-center',
                  grillType === 'grid'
                    ? 'bg-sky-100 text-sky-900 border-sky-400 font-bold shadow-xs dark:bg-sky-950/70 dark:text-sky-200 dark:border-sky-700'
                    : 'bg-background hover:bg-muted text-muted-foreground border-border/70'
                )}
              >
                Grid Pattern
              </button>
              <button
                type="button"
                onClick={() => setGrillType('3_burst')}
                className={cn(
                  'px-2 py-1 rounded-lg border font-semibold transition-all cursor-pointer text-center',
                  grillType === '3_burst'
                    ? 'bg-sky-100 text-sky-900 border-sky-400 font-bold shadow-xs dark:bg-sky-950/70 dark:text-sky-200 dark:border-sky-700'
                    : 'bg-background hover:bg-muted text-muted-foreground border-border/70'
                )}
              >
                3 Burst
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setGrillType('5_burst')}
                className={cn(
                  'px-2 py-1 rounded-lg border font-semibold transition-all cursor-pointer text-center',
                  grillType === '5_burst'
                    ? 'bg-sky-100 text-sky-900 border-sky-400 font-bold shadow-xs dark:bg-sky-950/70 dark:text-sky-200 dark:border-sky-700'
                    : 'bg-background hover:bg-muted text-muted-foreground border-border/70'
                )}
              >
                5 Burst
              </button>
              <button
                type="button"
                onClick={() => setGrillType('customer_own')}
                className={cn(
                  'px-2 py-1 rounded-lg border font-semibold transition-all cursor-pointer text-center',
                  grillType === 'customer_own'
                    ? 'bg-sky-100 text-sky-900 border-sky-400 font-bold shadow-xs dark:bg-sky-950/70 dark:text-sky-200 dark:border-sky-700'
                    : 'bg-background hover:bg-muted text-muted-foreground border-border/70'
                )}
              >
                Customer&apos;s Own ($33)
              </button>
            </div>

            {/* Grid Detail Fields */}
            {grillType === 'grid' && (
              <div className="space-y-2 pt-1 border-t border-border/40">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground">Profile</Label>
                    <select
                      value={grillProfile}
                      onChange={(e) => setGrillProfile(e.target.value as GrillProfile)}
                      className="w-full h-8 px-2 rounded-lg border border-input bg-background text-[11px]"
                    >
                      <option value='5/8" x 1/4"'>5/8&quot; × 1/4&quot;</option>
                      <option value='3/8" x 1/4"'>3/8&quot; × 1/4&quot;</option>
                      <option value="8mm x 18mm Georgian">8mm × 18mm Georgian</option>
                    </select>
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground">Color</Label>
                    <select
                      value={grillColor}
                      onChange={(e) => setGrillColor(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg border border-input bg-background text-[11px]"
                    >
                      {availableGrillColors.map((col) => {
                        const rate = grills?.gridRates?.[grillProfile]?.[col] ?? 5.5;
                        return (
                          <option key={col} value={col}>
                            {col} (${rate.toFixed(2)})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                {/* Pattern Entry vs Manual Direct Count */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] font-semibold text-muted-foreground">Grid Geometry</Label>
                    <div className="flex items-center gap-1 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setGrillPatternMode('pattern')}
                        className={cn(
                          'px-2 py-0.5 rounded cursor-pointer font-bold',
                          grillPatternMode === 'pattern'
                            ? 'bg-sky-100 text-sky-900 font-bold dark:bg-sky-950/70 dark:text-sky-200'
                            : 'text-muted-foreground'
                        )}
                      >
                        Cols × Rows
                      </button>
                      <span className="text-muted-foreground/40">|</span>
                      <button
                        type="button"
                        onClick={() => setGrillPatternMode('manual')}
                        className={cn(
                          'px-2 py-0.5 rounded cursor-pointer font-bold',
                          grillPatternMode === 'manual'
                            ? 'bg-sky-100 text-sky-900 font-bold dark:bg-sky-950/70 dark:text-sky-200'
                            : 'text-muted-foreground'
                        )}
                      >
                        Direct Count
                      </button>
                    </div>
                  </div>

                  {grillPatternMode === 'pattern' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-[10px] text-muted-foreground">Columns (e.g. 3)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={grillCols}
                          onChange={(e) => setGrillCols(e.target.value)}
                          className="h-8 text-xs font-mono font-bold"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <Label className="text-[10px] text-muted-foreground">Rows (e.g. 5)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={grillRows}
                          onChange={(e) => setGrillRows(e.target.value)}
                          className="h-8 text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-0.5">
                        <Label className="text-[10px] text-muted-foreground">Total Squares</Label>
                        <Input
                          type="number"
                          min="0"
                          value={grillSquares}
                          onChange={(e) => setGrillSquares(e.target.value)}
                          className="h-8 text-xs font-mono font-bold"
                        />
                      </div>
                      <div className="space-y-0.5">
                        <Label className="text-[10px] text-muted-foreground">T-Intersections</Label>
                        <Input
                          type="number"
                          min="0"
                          value={grillTIntersections}
                          onChange={(e) => setGrillTIntersections(e.target.value)}
                          className="h-8 text-xs font-mono font-bold"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Burst Config */}
            {(grillType === '3_burst' || grillType === '5_burst') && (
              <div className="space-y-2 pt-1 border-t border-border/40">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground">Burst Color</Label>
                    <select
                      value={grillColor}
                      onChange={(e) => setGrillColor(e.target.value)}
                      className="w-full h-8 px-2 rounded-lg border border-input bg-background text-[11px]"
                    >
                      <option value="white">White</option>
                      <option value="brassPewter">Brass or Pewter</option>
                      <option value="brushedChrome">Brushed Chrome</option>
                      <option value="black">Black</option>
                    </select>
                  </div>
                  <div className="space-y-0.5">
                    <Label className="text-[10px] font-semibold text-muted-foreground">Bent Hubs ($110 ea)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={grillBentHubs}
                      onChange={(e) => setGrillBentHubs(e.target.value)}
                      className="h-8 text-xs font-mono font-bold"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Single Clean Grill Cost Summary Badge */}
            {grillType !== 'none' && (
              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center justify-between">
                <div className="truncate pr-2">
                  <span className="font-bold text-xs block truncate">{activeGrillPreview.description}</span>
                  {grillType === 'grid' && (
                    <span className="text-[10px] text-muted-foreground">
                      {computedGrillConfig.squaresCount || 0} Squares, {computedGrillConfig.tIntersectionsCount || 0} T-connections
                    </span>
                  )}
                </div>
                <span className="font-mono font-bold text-xs shrink-0">
                  +${activeGrillPreview.rawCost.toFixed(2)} raw
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons: Add Item & Clear */}
          <div className="flex gap-2 pt-0.5">
            <Button
              type="submit"
              className="flex-1 h-9 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm cursor-pointer gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add to Quote</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleResetInputs}
              className="h-9 text-xs cursor-pointer px-3"
            >
              Clear
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
