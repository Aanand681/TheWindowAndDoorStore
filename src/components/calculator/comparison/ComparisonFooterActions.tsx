import React from 'react';
import { CheckCircle2, RotateCcw, Check, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UIWindowItem } from '@/hooks/useCalculatorWindows';
import { AttachedUpgradeOption, ComparisonOverridesPayload } from './types';

interface ComparisonFooterActionsProps {
  attachedUpgrade: AttachedUpgradeOption | null;
  onClose: () => void;
  appliedOption: 'A' | 'B';
  isComparisonStaging?: boolean;
  effectiveOptionBWindows: UIWindowItem[] | null;
  optionBMeta: { customerName?: string; quoteNumber?: string };
  currentWindows: UIWindowItem[];
  getOverridesPayload: () => ComparisonOverridesPayload;
  onApplyOption: (
    target: 'A' | 'B',
    windows: UIWindowItem[],
    meta?: { customerName?: string; quoteNumber?: string },
    overrides?: ComparisonOverridesPayload
  ) => void;
  onApplyAndCustomize?: (
    windows: UIWindowItem[],
    meta?: { customerName?: string; quoteNumber?: string },
    overrides?: ComparisonOverridesPayload
  ) => void;
  onKeepOptionB?: () => void;
}

export function ComparisonFooterActions({
  attachedUpgrade,
  onClose,
  appliedOption,
  isComparisonStaging = false,
  effectiveOptionBWindows,
  optionBMeta,
  currentWindows,
  getOverridesPayload,
  onApplyOption,
  onApplyAndCustomize,
  onKeepOptionB,
}: ComparisonFooterActionsProps) {
  const hasOptionBWindows = Boolean(effectiveOptionBWindows && effectiveOptionBWindows.length > 0);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:px-6 border-t border-border/60 bg-muted/20 shrink-0">
      <div className="flex items-center gap-2 w-full sm:w-auto">
        {attachedUpgrade && (
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Optional upgrade offer attached to PDF</span>
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="text-xs font-semibold cursor-pointer"
        >
          Close
        </Button>

        {/* Hybrid Action: Full Workspace Edit Button */}
        {onApplyAndCustomize && hasOptionBWindows && !isComparisonStaging && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (effectiveOptionBWindows) {
                onApplyAndCustomize(effectiveOptionBWindows, optionBMeta, getOverridesPayload());
                onClose();
              }
            }}
            className="gap-1.5 text-xs font-semibold border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 cursor-pointer shadow-xs"
            title="Loads Option B into calculator while preserving Base Quote A so you can adjust crew, distance, or promo"
          >
            <Pencil className="w-3.5 h-3.5 text-amber-500" />
            <span>Apply &amp; Customize in Full Calculator</span>
          </Button>
        )}

        {/* Two-Way Swapping Action Button */}
        {appliedOption === 'B' || isComparisonStaging ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onApplyOption('A', currentWindows);
                onClose();
              }}
              className="gap-1.5 text-xs font-bold cursor-pointer border-primary text-primary hover:bg-primary/10 shadow-md"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Apply Option A (Revert to Base)</span>
            </Button>
            {onKeepOptionB && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  onKeepOptionB();
                  onClose();
                }}
                className="gap-1.5 text-xs font-bold cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              >
                <Check className="w-4 h-4" />
                <span>Keep Option B as Primary</span>
              </Button>
            )}
          </div>
        ) : (
          <Button
            variant="default"
            size="sm"
            disabled={!hasOptionBWindows}
            onClick={() => {
              if (effectiveOptionBWindows) {
                onApplyOption('B', effectiveOptionBWindows, optionBMeta, getOverridesPayload());
                onClose();
              }
            }}
            className="gap-1.5 text-xs font-bold cursor-pointer bg-amber-500 hover:bg-amber-600 text-amber-950 shadow-md"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Apply Option B to Quote</span>
          </Button>
        )}
      </div>
    </div>
  );
}

