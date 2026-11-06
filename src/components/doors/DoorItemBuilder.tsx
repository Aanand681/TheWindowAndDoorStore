'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DoorPreset,
  DoorFormulaSettings,
  DoorLineItem,
  DoorCategory,
  DoorHardwareType,
  DoorUpgradeOption,
} from '@/lib/doors/types';
import { buildDoorLineItem, calculateDoorUpgradeDifference } from '@/lib/doors/calculations';
import {
  Plus,
  DoorClosed,
  KeyRound,
  Sparkles,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface DoorItemBuilderProps {
  presets: DoorPreset[];
  formula: DoorFormulaSettings;
  editingItem?: DoorLineItem | null;
  onSaveItem: (item: DoorLineItem) => void;
  onCancelEdit?: () => void;
  onResetQuote?: () => void;
  className?: string;
}

export function DoorItemBuilder({
  presets,
  formula,
  editingItem,
  onSaveItem,
  onCancelEdit,
  onResetQuote,
  className,
}: DoorItemBuilderProps) {
  // Preset & Identity
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    presets[0]?.id || 'single_regular'
  );
  const [customDescription, setCustomDescription] = useState<string>(
    presets[0]?.description?.trim() || presets[0]?.label || ''
  );
  const [category, setCategory] = useState<DoorCategory>('entry');
  const [quantity, setQuantity] = useState<string>('1');

  // Pricing
  const [inksterBasePrice, setInksterBasePrice] = useState<string>('1200');

  // Hardware
  const [hardwareType, setHardwareType] = useState<DoorHardwareType>('standard');
  const [customHardwareName, setCustomHardwareName] = useState<string>('Premium Grip Set');
  const [customHardwarePrice, setCustomHardwarePrice] = useState<string>('250');

  // Upgrade Option
  const [hasUpgradeOption, setHasUpgradeOption] = useState<boolean>(false);
  const [upgradeTitle, setUpgradeTitle] = useState<string>('Triple Pane Glass Upgrade');
  const [upgradeInksterPrice, setUpgradeInksterPrice] = useState<string>('1450');

  // Additional Notes
  const [notes, setNotes] = useState<string>('');

  // Selected preset object
  const currentPreset = useMemo(() => {
    return presets.find((p) => p.id === selectedPresetId) || presets[0];
  }, [presets, selectedPresetId]);

  // When preset changes, automatically sync category and description if untouched
  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = presets.find((p) => p.id === presetId);
    if (found) {
      setCategory(found.category);
      const isDefault =
        !customDescription ||
        presets.some(
          (p) =>
            p.label === customDescription ||
            (p.description && p.description.trim() === customDescription.trim())
        );
      if (isDefault) {
        setCustomDescription(found.description?.trim() || found.label);
      }
    }
  };

  // Sync initial description when database presets finish loading
  useEffect(() => {
    if (!editingItem && presets.length > 0) {
      const current = presets.find((p) => p.id === selectedPresetId) || presets[0];
      if (current) {
        const isDefault =
          !customDescription ||
          presets.some(
            (p) =>
              p.label === customDescription ||
              (p.description && p.description.trim() === customDescription.trim())
          );
        if (isDefault) {
          setCustomDescription(current.description?.trim() || current.label);
          setCategory(current.category);
        }
      }
    }
  }, [presets, editingItem]);

  // Populate from editingItem
  useEffect(() => {
    if (editingItem) {
      setSelectedPresetId(editingItem.presetId);
      setCustomDescription(editingItem.customDescription || editingItem.presetLabel);
      setCategory(editingItem.category);
      setQuantity(String(editingItem.quantity || 1));
      setInksterBasePrice(String(editingItem.inksterBasePrice));
      setHardwareType(editingItem.hardwareType);
      if (editingItem.customHardwareName) setCustomHardwareName(editingItem.customHardwareName);
      if (editingItem.customHardwarePrice !== undefined) {
        setCustomHardwarePrice(String(editingItem.customHardwarePrice));
      }
      setNotes(editingItem.notes || '');

      if (editingItem.upgradeOption?.enabled) {
        setHasUpgradeOption(true);
        setUpgradeTitle(editingItem.upgradeOption.title);
        setUpgradeInksterPrice(String(editingItem.upgradeOption.inksterPrice));
      } else {
        setHasUpgradeOption(false);
      }
    }
  }, [editingItem]);

  // Upgrade option calculations
  const upgradeDiff = useMemo(() => {
    if (!hasUpgradeOption) return null;
    const baseP = parseFloat(inksterBasePrice) || 0;
    const optP = parseFloat(upgradeInksterPrice) || 0;
    return calculateDoorUpgradeDifference(
      baseP,
      optP,
      category,
      formula.surchargeRate,
      formula.doorDiscountPercent
    );
  }, [hasUpgradeOption, inksterBasePrice, upgradeInksterPrice, category, formula]);

  const parsedQuantity = Math.max(1, parseInt(quantity, 10) || 1);

  // Preview Line Item with ID preservation
  const previewItem = useMemo(() => {
    const baseP = parseFloat(inksterBasePrice) || 0;
    const customHwP = hardwareType === 'custom' ? parseFloat(customHardwarePrice) || 0 : undefined;

    let upgradeObj: DoorUpgradeOption | undefined = undefined;
    if (hasUpgradeOption && upgradeDiff) {
      upgradeObj = {
        enabled: true,
        title: upgradeTitle.trim() || 'Option for door',
        inksterPrice: parseFloat(upgradeInksterPrice) || 0,
        netOptionDoorPrice: upgradeDiff.optionNetPrice,
        subtotalDifference: upgradeDiff.subtotalDifference,
        totalWithTaxDifference: upgradeDiff.totalDifference,
      };
    }

    return buildDoorLineItem({
      id: editingItem?.id, // CRITICAL: Preserves existing ID so updates replace in-place
      preset: currentPreset,
      customDescription: customDescription.trim() || currentPreset.description?.trim() || currentPreset.label,
      category,
      inksterBasePrice: baseP,
      quantity: parsedQuantity,
      hardwareType,
      customHardwareName: hardwareType === 'custom' ? customHardwareName : undefined,
      customHardwarePrice: customHwP,
      formula,
      upgradeOption: upgradeObj,
      notes,
    });
  }, [
    editingItem,
    currentPreset,
    customDescription,
    category,
    inksterBasePrice,
    parsedQuantity,
    hardwareType,
    customHardwareName,
    customHardwarePrice,
    formula,
    hasUpgradeOption,
    upgradeTitle,
    upgradeInksterPrice,
    upgradeDiff,
    notes,
  ]);

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const baseP = parseFloat(inksterBasePrice) || 0;
    if (baseP <= 0) {
      toast.error('Please enter a valid Inkster base price');
      return;
    }

    onSaveItem(previewItem);
    toast.success(editingItem ? 'Door updated successfully' : 'Door added to quote');

    if (!editingItem) {
      setInksterBasePrice('1200');
      setQuantity('1');
      setHasUpgradeOption(false);
      setNotes('');
    }
  };

  const handleResetClick = () => {
    if (onResetQuote) {
      onResetQuote();
    } else {
      setInksterBasePrice('1200');
      setQuantity('1');
      setHasUpgradeOption(false);
      setHardwareType('standard');
      setNotes('');
      toast.info('Door form reset');
    }
  };

  return (
    <Card className={cn('bg-card/70 backdrop-blur-md border-border shadow-md !py-0 !gap-0 [--card-spacing:0px]', className)}>
      {/* Compact Card Header with zero excess padding */}
      <CardHeader className="p-3.5 !pb-2.5 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
              <DoorClosed className="w-4 h-4" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold">
                {editingItem ? 'Edit Door Unit' : 'Configure Door Unit'}
              </CardTitle>
              <CardDescription className="text-[11px]">
                Select preset, enter Inkster software price, and choose hardware.
              </CardDescription>
            </div>
          </div>

          {/* Top-Right Reset & Cancel Buttons */}
          <div className="flex items-center gap-1.5">
            {editingItem && onCancelEdit && (
              <Button variant="ghost" size="sm" onClick={onCancelEdit} className="text-xs h-7 px-2">
                Cancel Edit
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetClick}
              className="gap-1 text-xs text-destructive hover:bg-destructive/10 h-7 px-2 cursor-pointer"
              title="Reset quote &amp; start fresh"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Tight Content Body with No Gap */}
      <CardContent className="p-3.5 !pt-2.5">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Row 1: Preset & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Door Style Preset</Label>
              <select
                value={selectedPresetId}
                onChange={(e) => handlePresetSelect(e.target.value)}
                className="w-full h-8.5 rounded-lg border border-input bg-background px-2.5 text-xs shadow-xs focus:ring-1 focus:ring-ring font-medium"
              >
                {presets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label} (Lab: ${p.labour.toFixed(0)}, Misc: ${p.misc.toFixed(0)})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Category</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as DoorCategory)}
                className="w-full h-8.5 rounded-lg border border-input bg-background px-2.5 text-xs shadow-xs focus:ring-1 focus:ring-ring"
              >
                <option value="entry">Entry Door (10% Discount)</option>
                <option value="patio">Patio Door (10% Discount)</option>
                <option value="garden">Garden / Terrace Door (10% Discount)</option>
                <option value="storm">Storm Door (0% Discount / Exempt)</option>
                <option value="custom">Custom Door (10% Discount)</option>
              </select>
            </div>
          </div>

          {/* Row 2: Custom Description */}
          <div className="space-y-1">
            <Label className="text-xs font-semibold">Door Description / Specification</Label>
            <Input
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder={currentPreset.description?.trim() || currentPreset.label || 'e.g. Steel Single Entry Door'}
              className="h-8.5 text-xs font-medium"
            />
          </div>

          {/* Row 3: Quantity & Inkster Base Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Quantity (Number of Doors)</Label>
              <Input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                onBlur={() => {
                  const val = parseInt(quantity, 10);
                  if (isNaN(val) || val < 1) {
                    setQuantity('1');
                  }
                }}
                className="h-8.5 text-xs font-mono font-semibold"
              />
              <p className="text-[10px] text-muted-foreground">
                Enter 2 or more if quoting multiple identical doors.
              </p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold text-primary">Inkster Base Price per Unit ($)</Label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                <Input
                  type="number"
                  step="0.01"
                  required
                  value={inksterBasePrice}
                  onChange={(e) => setInksterBasePrice(e.target.value)}
                  placeholder="1200.00"
                  className="h-8.5 pl-6 text-right font-mono font-bold text-xs bg-primary/5 border-primary/40 focus:border-primary"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">Price before 8% surcharge &amp; 10% discount.</p>
            </div>
          </div>

          {/* Row 4: Hardware Selection ($158 Standard, Customer $80, Custom, None) */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-muted-foreground" />
              Lockset &amp; Hardware Style
            </Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setHardwareType('standard')}
                className={cn(
                  'py-2 px-2.5 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer',
                  hardwareType === 'standard'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border hover:bg-muted/40 text-muted-foreground'
                )}
              >
                <div>Standard Set</div>
                <div className="text-[10px] opacity-80">+${(formula.locksetDeadboltPrice || 158.0).toFixed(2)}</div>
              </button>

              <button
                type="button"
                onClick={() => setHardwareType('customer_supplied')}
                className={cn(
                  'py-2 px-2.5 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer',
                  hardwareType === 'customer_supplied'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border hover:bg-muted/40 text-muted-foreground'
                )}
              >
                <div>Customer Supplied</div>
                <div className="text-[10px] opacity-80">+${(formula.customerSuppliedHardwareFee || 80.0).toFixed(2)} Labour</div>
              </button>

              <button
                type="button"
                onClick={() => setHardwareType('custom')}
                className={cn(
                  'py-2 px-2.5 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer',
                  hardwareType === 'custom'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border hover:bg-muted/40 text-muted-foreground'
                )}
              >
                <div>Custom Hardware</div>
                <div className="text-[10px] opacity-80">Custom Price</div>
              </button>

              <button
                type="button"
                onClick={() => setHardwareType('none')}
                className={cn(
                  'py-2 px-2.5 rounded-lg border text-xs font-medium transition-all text-left cursor-pointer',
                  hardwareType === 'none'
                    ? 'border-primary bg-primary/10 text-primary font-semibold'
                    : 'border-border hover:bg-muted/40 text-muted-foreground'
                )}
              >
                <div>No Hardware</div>
                <div className="text-[10px] opacity-80">$0.00</div>
              </button>
            </div>

            {/* Custom Hardware Inputs */}
            {hardwareType === 'custom' && (
              <div className="p-2.5 rounded-xl bg-muted/20 border border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1.5">
                <div className="space-y-1">
                  <Label className="text-xs">Custom Hardware / Lockset Style</Label>
                  <Input
                    value={customHardwareName}
                    onChange={(e) => setCustomHardwareName(e.target.value)}
                    placeholder="e.g. Emtek Modern Matte Black Grip Set"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Custom Hardware Price ($)</Label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                    <Input
                      type="number"
                      step="1"
                      value={customHardwarePrice}
                      onChange={(e) => setCustomHardwarePrice(e.target.value)}
                      placeholder="250.00"
                      className="h-8 pl-6 text-right font-mono text-xs font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Row 5: Option for door (Re-labeled as requested) */}
          <div className="border border-border/70 rounded-xl overflow-hidden bg-card/40">
            <div className="flex items-center justify-between p-2.5 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasUpgradeOption}
                  onChange={(e) => setHasUpgradeOption(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary w-4 h-4"
                />
                <span className="flex items-center gap-1.5 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Option for door
                </span>
              </label>
              {hasUpgradeOption && upgradeDiff && (
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  +{upgradeDiff.subtotalDifference >= 0 ? `$${upgradeDiff.subtotalDifference.toFixed(2)}` : `-$${Math.abs(upgradeDiff.subtotalDifference).toFixed(2)}`}/unit
                  {parsedQuantity > 1 ? ` (+${(upgradeDiff.subtotalDifference * parsedQuantity).toFixed(2)} total)` : ''}
                </span>
              )}
            </div>

            {hasUpgradeOption && (
              <div className="p-2.5 pt-0 border-t border-border/40 space-y-2.5 mt-1.5 bg-muted/20">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <Label className="text-xs">Option Description</Label>
                    <Input
                      value={upgradeTitle}
                      onChange={(e) => setUpgradeTitle(e.target.value)}
                      placeholder="e.g. Triple Pane LoE-366 with Frosted Satin Glass"
                      className="h-8 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Option Inkster Price ($)</Label>
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        value={upgradeInksterPrice}
                        onChange={(e) => setUpgradeInksterPrice(e.target.value)}
                        placeholder="1450.00"
                        className="h-8 pl-6 text-right font-mono text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {upgradeDiff && (
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs text-foreground flex items-center justify-between gap-2">
                    <div className="text-[10px] text-muted-foreground">
                      Base: ${upgradeDiff.baseNetPrice.toFixed(2)} | Option: ${upgradeDiff.optionNetPrice.toFixed(2)}
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        Upgrade Diff: +${upgradeDiff.subtotalDifference.toFixed(2)}/unit
                        {parsedQuantity > 1 ? (
                          <span className="ml-1 text-primary">
                            (+${(upgradeDiff.subtotalDifference * parsedQuantity).toFixed(2)} for {parsedQuantity} doors)
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Live Preview Box */}
          <div className="p-2.5 rounded-xl bg-muted/30 border border-border/60 text-xs space-y-1">
            <div className="flex items-center justify-between text-muted-foreground text-[11px]">
              <span>
                Door Base: ${previewItem.inksterBasePrice.toFixed(2)} (Surch +8%: ${previewItem.surchargeAmount.toFixed(2)}
                {previewItem.discountPercent > 0 ? ` | Disc -10%: -$${previewItem.discountAmount.toFixed(2)}` : ''}):
              </span>
              <span className="font-mono font-semibold text-foreground">
                ${previewItem.inksterBasePrice.toFixed(2)}/unit
              </span>
            </div>

            <div className="flex items-center justify-between text-muted-foreground text-[11px]">
              <span>
                Unit Labour (${previewItem.unitLabour.toFixed(2)}) + Misc (${previewItem.unitMisc.toFixed(2)}) + Hardware (${previewItem.hardwarePrice.toFixed(2)}):
              </span>
              <span className="font-mono font-semibold text-foreground">
                ${(previewItem.lineLabourTotal + previewItem.lineMiscTotal + previewItem.lineHardwareTotal).toFixed(2)}
              </span>
            </div>

            <div className="pt-1 border-t border-border/40 flex items-center justify-between text-xs font-bold">
              <span>Estimated Line Total (Qty: {previewItem.quantity}):</span>
              <span className="text-sm font-mono text-primary font-black">
                ${previewItem.lineGrandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Button: Solid Black Button */}
          <Button
            type="submit"
            className="w-full h-9 bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-semibold gap-1.5 shadow-sm text-xs cursor-pointer"
          >
            {editingItem ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                Update Door Unit
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                Add Door to Quote
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
