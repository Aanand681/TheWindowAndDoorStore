'use client';

import React from 'react';
import { Shapes } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  GlassTreatment,
  ComboPricing,
  PaneType,
  GlassShape,
} from '@/lib/sealed-units-logic';

export interface SealedUnitGlassSpecsFormProps {
  treatment: GlassTreatment;
  setTreatment: (t: GlassTreatment) => void;
  availableCombos: ComboPricing[];
  selectedComboId: string;
  setSelectedComboId: (id: string) => void;
  hasDualPane: boolean;
  selectedPane: PaneType;
  setSelectedPane: (p: PaneType) => void;
  shape: GlassShape;
  setShape: (s: GlassShape) => void;
  widthRef: React.RefObject<HTMLInputElement | null>;
  widthInput: string;
  setWidthInput: (w: string) => void;
  heightInput: string;
  setHeightInput: (h: string) => void;
  qtyInput: string;
  setQtyInput: (q: string) => void;
}

export function SealedUnitGlassSpecsForm({
  treatment,
  setTreatment,
  availableCombos,
  selectedComboId,
  setSelectedComboId,
  hasDualPane,
  selectedPane,
  setSelectedPane,
  shape,
  setShape,
  widthRef,
  widthInput,
  setWidthInput,
  heightInput,
  setHeightInput,
  qtyInput,
  setQtyInput,
}: SealedUnitGlassSpecsFormProps) {
  return (
    <>
      {/* Treatment Selector */}
      <div className="space-y-1">
        <Label className="text-[11px] font-semibold text-muted-foreground">Glass Treatment</Label>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => setTreatment('annealed')}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all text-center cursor-pointer',
              treatment === 'annealed'
                ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
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
                ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
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

      {/* Pane Selector */}
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
                ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
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
                ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
                : 'bg-muted/40 hover:bg-muted text-muted-foreground border-border/70'
            )}
          >
            Triple Pane
          </button>
        </div>
      </div>

      {/* Shape Charge Selector */}
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
                ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
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
                ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
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
                ? 'border-primary bg-primary/10 text-primary font-bold shadow-xs'
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

      {/* Dimensions Input */}
      <div className="grid grid-cols-3 gap-2">
        <div className="space-y-1">
          <Label htmlFor="widthInput" className="text-[11px] font-semibold text-muted-foreground">
            Width (in)
          </Label>
          <Input
            ref={widthRef}
            id="widthInput"
            type="text"
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
    </>
  );
}

