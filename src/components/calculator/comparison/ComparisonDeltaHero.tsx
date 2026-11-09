import React from 'react';
import { Sparkles, CheckCircle2, ArrowUpRight, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatMoney } from '@/lib/promo-logic';
import { AttachedUpgradeOption, ComparisonDelta, OptionBFinancials } from './types';
import { UPGRADE_PRESETS } from './comparison-helpers';

interface ComparisonDeltaHeroProps {
  delta: ComparisonDelta | null;
  optionBFinancials: OptionBFinancials | null;
  attachedUpgrade: AttachedUpgradeOption | null;
  customUpgradeTitle: string;
  detectedUpgradeTitle: string;
  onUpgradeTitleChange: (title: string) => void;
  onToggleAttachUpgrade: () => void;
}

export function ComparisonDeltaHero({
  delta,
  optionBFinancials,
  attachedUpgrade,
  customUpgradeTitle,
  detectedUpgradeTitle,
  onUpgradeTitleChange,
  onToggleAttachUpgrade,
}: ComparisonDeltaHeroProps) {
  if (!delta || !optionBFinancials) return null;

  return (
    <div
      className={cn(
        'rounded-2xl p-4 sm:p-5 border transition-all shadow-md',
        delta.isUpgrade
          ? 'bg-gradient-to-r from-amber-500/10 via-primary/5 to-amber-500/10 border-amber-500/30'
          : delta.isSavings
          ? 'bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-emerald-500/10 border-emerald-500/30'
          : 'bg-muted/40 border-border'
      )}
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div
            className={cn(
              'p-3 rounded-2xl shrink-0 shadow-sm',
              delta.isUpgrade
                ? 'bg-amber-500 text-amber-950'
                : delta.isSavings
                ? 'bg-emerald-500 text-emerald-950'
                : 'bg-muted text-foreground'
            )}
          >
            {delta.isUpgrade ? (
              <ArrowUpRight className="w-6 h-6 stroke-[2.5]" />
            ) : delta.isSavings ? (
              <TrendingDown className="w-6 h-6 stroke-[2.5]" />
            ) : (
              <CheckCircle2 className="w-6 h-6" />
            )}
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {delta.isUpgrade
                ? 'Upgrade Cost Difference (Pre-Tax)'
                : delta.isSavings
                ? 'Cost Savings Difference (Pre-Tax)'
                : 'Exact Price Match'}
            </span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-foreground">
                {delta.preTax >= 0 ? '+' : ''}
                {formatMoney(delta.preTax)}
              </span>
              <span className="text-xs font-semibold text-muted-foreground">
                pre-tax
              </span>
            </div>
          </div>
        </div>

        {/* Attach to Quote PDF Action & Editable Upgrade Description */}
        {delta.preTax > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-end gap-3 w-full sm:w-auto">
            <div className="flex flex-col gap-1 w-full sm:w-80">
              <div className="flex items-center justify-between">
                <Label htmlFor="upgradeTitleInput" className="text-[11px] font-semibold text-muted-foreground">
                  Upgrade Description on Quote PDF
                </Label>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Editable</span>
              </div>
              <Input
                id="upgradeTitleInput"
                value={customUpgradeTitle || detectedUpgradeTitle}
                onChange={(e) => onUpgradeTitleChange(e.target.value)}
                placeholder="e.g. Triple Pane (Solar Shield), Brick Mould..."
                className="h-8 text-xs bg-background font-medium"
              />
              {/* Quick Presets */}
              <div className="flex flex-wrap gap-1 mt-0.5">
                {UPGRADE_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => onUpgradeTitleChange(preset)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground border border-border cursor-pointer transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <Button
              variant={attachedUpgrade ? 'default' : 'outline'}
              size="sm"
              onClick={onToggleAttachUpgrade}
              className={cn(
                'gap-1.5 text-xs font-bold shadow-xs cursor-pointer h-8 shrink-0',
                attachedUpgrade
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500'
              )}
            >
              {attachedUpgrade ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Attached to Quote PDF</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Attach Upgrade to Quote PDF</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

