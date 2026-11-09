'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DoorPreset, DoorFormulaSettings, DoorLineItem } from '@/lib/doors/types';
import { Plus, DoorClosed, CheckCircle2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DoorHardwareSection,
  DoorUpgradeSection,
  DoorLivePreviewBox,
  DoorPresetSpecsSection,
  useDoorItemForm,
} from './builder';

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
  const form = useDoorItemForm({
    presets,
    formula,
    editingItem,
    onSaveItem,
    onResetQuote,
  });

  return (
    <Card className={cn('bg-card/70 backdrop-blur-md border-border shadow-md !py-0 !gap-0 [--card-spacing:0px]', className)}>
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
              onClick={form.handleResetClick}
              className="gap-1 text-xs text-destructive hover:bg-destructive/10 h-7 px-2 cursor-pointer"
              title="Reset quote & start fresh"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 !pt-2.5">
        <form onSubmit={form.handleSubmit} className="space-y-3">
          <DoorPresetSpecsSection
            presets={presets}
            selectedPresetId={form.selectedPresetId}
            handlePresetSelect={form.handlePresetSelect}
            category={form.category}
            setCategory={form.setCategory}
            customDescription={form.customDescription}
            setCustomDescription={form.setCustomDescription}
            currentPreset={form.currentPreset}
            quantity={form.quantity}
            setQuantity={form.setQuantity}
            inksterBasePrice={form.inksterBasePrice}
            setInksterBasePrice={form.setInksterBasePrice}
          />

          <DoorHardwareSection
            hardwareType={form.hardwareType}
            setHardwareType={form.setHardwareType}
            locksetDeadboltPrice={formula.locksetDeadboltPrice || 158.0}
            customerSuppliedHardwareFee={formula.customerSuppliedHardwareFee || 80.0}
            customHardwareName={form.customHardwareName}
            setCustomHardwareName={form.setCustomHardwareName}
            customHardwarePrice={form.customHardwarePrice}
            setCustomHardwarePrice={form.setCustomHardwarePrice}
          />

          <DoorUpgradeSection
            hasUpgradeOption={form.hasUpgradeOption}
            setHasUpgradeOption={form.setHasUpgradeOption}
            upgradeTitle={form.upgradeTitle}
            setUpgradeTitle={form.setUpgradeTitle}
            upgradeInksterPrice={form.upgradeInksterPrice}
            setUpgradeInksterPrice={form.setUpgradeInksterPrice}
            upgradeDiff={form.upgradeDiff}
            parsedQuantity={form.parsedQuantity}
          />

          <DoorLivePreviewBox previewItem={form.previewItem} />

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
