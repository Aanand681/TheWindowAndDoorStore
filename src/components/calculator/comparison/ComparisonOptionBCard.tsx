import React from 'react';
import { FileUp, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { formatMoney } from '@/lib/promo-logic';
import { UIWindowItem } from '@/hooks/useCalculatorWindows';
import { OptionBFinancials, StagedOptionBData, DbSettingsItem } from './types';
import { getWindowsSummarySentence } from './comparison-helpers';
import { ComparisonOptionBOverrides } from './ComparisonOptionBOverrides';

interface ComparisonOptionBCardProps {
  effectiveOptionBWindows: UIWindowItem[] | null;
  stagedOptionB?: StagedOptionBData;
  optionBMeta: { customerName?: string; quoteNumber?: string };
  customerName: string;
  appliedOption: 'A' | 'B';
  isComparisonStaging?: boolean;
  isDragging: boolean;
  isParsing: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  setIsDragging: (val: boolean) => void;
  showOverrides: boolean;
  setShowOverrides: (val: boolean) => void;
  overrideJambId: string;
  setOverrideJambId: (val: string) => void;
  overrideCasingId: string;
  setOverrideCasingId: (val: string) => void;
  dbJambs: DbSettingsItem[];
  dbCasings: DbSettingsItem[];
  resolvedOptionAJambLabel: string;
  resolvedOptionACasingLabel: string;
  selectedOverrideJambDisplay: string;
  selectedOverrideCasingDisplay: string;
  optionBFinancials: OptionBFinancials | null;
  surchargeRate: number;
  hstRate: number;
}

export function ComparisonOptionBCard({
  effectiveOptionBWindows,
  stagedOptionB,
  optionBMeta,
  customerName,
  appliedOption,
  isComparisonStaging,
  isDragging,
  isParsing,
  fileInputRef,
  handleFileInputChange,
  handleDrop,
  setIsDragging,
  showOverrides,
  setShowOverrides,
  overrideJambId,
  setOverrideJambId,
  overrideCasingId,
  setOverrideCasingId,
  dbJambs,
  dbCasings,
  resolvedOptionAJambLabel,
  resolvedOptionACasingLabel,
  selectedOverrideJambDisplay,
  selectedOverrideCasingDisplay,
  optionBFinancials,
  surchargeRate,
  hstRate,
}: ComparisonOptionBCardProps) {
  return (
    <div className="bg-muted/20 border border-border/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              Option B (Upgraded)
            </span>
            {appliedOption === 'B' && (
              <span className="text-[11px] font-semibold text-amber-500">
                ✓ Active in Quote
              </span>
            )}
            {isComparisonStaging && (
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                Live Customized
              </span>
            )}
          </div>
          {(stagedOptionB?.quoteNumber || optionBMeta.quoteNumber) && (
            <span className="text-xs font-bold text-foreground">
              {stagedOptionB?.quoteNumber || optionBMeta.quoteNumber}
            </span>
          )}
        </div>

        {/* Upload State vs Loaded State */}
        {!effectiveOptionBWindows ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'mt-4 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 min-h-[220px]',
              isDragging
                ? 'border-amber-500 bg-amber-500/10 scale-[0.99]'
                : 'border-border/80 hover:border-amber-500/50 hover:bg-muted/40'
            )}
          >
            <input
              type="file"
              accept=".pdf,application/pdf"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              className="hidden"
            />
            <div className="p-3 rounded-full bg-amber-500/10 text-amber-500 mb-1">
              <FileUp className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-foreground">
              {isParsing ? 'Parsing PDF Quote...' : 'Upload Upgraded Manufacturer PDF'}
            </p>
            <p className="text-[11px] text-muted-foreground max-w-xs leading-relaxed">
              Drag &amp; drop the upgraded PDF quote here (e.g. Triple Pane, Painted, Brickmould), or click to browse.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-3 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-bold text-foreground truncate">
                  {stagedOptionB?.customerName || optionBMeta.customerName || customerName || 'Upgraded Quote'}
                </p>
                {/* High-visibility Change PDF button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 px-3 text-xs font-semibold bg-background border-border hover:bg-muted text-foreground shadow-xs gap-1.5 shrink-0 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-500" />
                  <span>Change PDF</span>
                </Button>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  ref={fileInputRef}
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {getWindowsSummarySentence(effectiveOptionBWindows)}
              </p>
            </div>

            <ComparisonOptionBOverrides
              showOverrides={showOverrides}
              setShowOverrides={setShowOverrides}
              overrideJambId={overrideJambId}
              setOverrideJambId={setOverrideJambId}
              overrideCasingId={overrideCasingId}
              setOverrideCasingId={setOverrideCasingId}
              dbJambs={dbJambs}
              dbCasings={dbCasings}
              resolvedOptionAJambLabel={resolvedOptionAJambLabel}
              resolvedOptionACasingLabel={resolvedOptionACasingLabel}
              selectedOverrideJambDisplay={selectedOverrideJambDisplay}
              selectedOverrideCasingDisplay={selectedOverrideCasingDisplay}
            />

            {/* Financial breakdown for Option B */}
            {optionBFinancials && (
              <div className="mt-4 pt-4 border-t border-border/60 space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground">
                  <span>Manufacturer Base:</span>
                  <span className="font-semibold text-foreground">
                    {formatMoney(optionBFinancials.base)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Surcharge ({surchargeRate}%):</span>
                  <span className="font-semibold text-foreground">
                    {formatMoney(optionBFinancials.surcharge)}
                  </span>
                </div>
                {optionBFinancials.jc > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Supply Jambs &amp; Casing:</span>
                    <span className="font-semibold text-foreground">
                      {formatMoney(optionBFinancials.jc)}
                    </span>
                  </div>
                )}
                {optionBFinancials.labour > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Labour &amp; Installation:</span>
                    <span className="font-semibold text-foreground">
                      {formatMoney(optionBFinancials.labour)}
                    </span>
                  </div>
                )}
                {optionBFinancials.promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Promo Discount:</span>
                    <span>-{formatMoney(optionBFinancials.promoDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-border/50 font-semibold text-foreground">
                  <span>Pre-Tax Subtotal:</span>
                  <span className="text-amber-500 font-bold">
                    {formatMoney(optionBFinancials.afterDiscount)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>HST ({hstRate}%):</span>
                  <span className="font-semibold text-foreground">
                    {formatMoney(optionBFinancials.hst)}
                  </span>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Total Card for Option B */}
      {optionBFinancials && (
        <div className="bg-card border border-border/80 rounded-xl p-3 shadow-xs">
          <div className="flex items-baseline justify-between">
            <span className="text-xs uppercase font-bold text-muted-foreground">
              Option B Total
            </span>
            <span className="text-lg font-black text-amber-500">
              {formatMoney(optionBFinancials.total)}
            </span>
          </div>
          <div className="flex justify-between text-[11px] text-muted-foreground mt-1 pt-1 border-t border-border/40">
            <span>Deposits (50/50):</span>
            <span>
              {formatMoney(optionBFinancials.firstPayment)} /{' '}
              {formatMoney(optionBFinancials.secondPayment)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

