'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, X } from 'lucide-react';
import { useQuoteComparison } from '@/hooks/calculator/useQuoteComparison';
import { QuoteComparisonModalProps, AttachedUpgradeOption } from './comparison/types';
import { ComparisonDeltaHero } from './comparison/ComparisonDeltaHero';
import { ComparisonOptionACard } from './comparison/ComparisonOptionACard';
import { ComparisonOptionBCard } from './comparison/ComparisonOptionBCard';
import { ComparisonDiffTable } from './comparison/ComparisonDiffTable';
import { ComparisonFooterActions } from './comparison/ComparisonFooterActions';

export type { AttachedUpgradeOption, QuoteComparisonModalProps };

export function QuoteComparisonModal(props: QuoteComparisonModalProps) {
  const {
    isOpen,
    onClose,
    currentWindows,
    customerName,
    quoteNumber,
    surchargeRate,
    effectiveJC,
    effectiveLabour,
    hstRate,
    quoteResultA,
    afterDiscountA,
    totalA,
    firstPaymentA,
    secondPaymentA,
    appliedOption,
    isComparisonStaging = false,
    stagedOptionB,
    onApplyOption,
    onApplyAndCustomize,
    onKeepOptionB,
    attachedUpgrade,
  } = props;

  const comparison = useQuoteComparison(props);

  if (!comparison.mounted || !isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-card text-card-foreground border border-border shadow-2xl rounded-2xl w-full max-w-5xl my-auto max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-3.5 bg-muted/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold tracking-tight">
                  Dual PDF Upgrade &amp; Option Comparison
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider border border-amber-500/30">
                  Phase 3 Hybrid
                </span>
                {isComparisonStaging && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold uppercase tracking-wider border border-primary/30">
                    Live Staging Mode
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Compare base quote with upgraded manufacturer PDF to calculate &Delta; pre-tax upgrade cost.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Delta Hero Card */}
          <ComparisonDeltaHero
            delta={comparison.delta}
            optionBFinancials={comparison.optionBFinancials}
            attachedUpgrade={attachedUpgrade}
            customUpgradeTitle={comparison.customUpgradeTitle}
            detectedUpgradeTitle={comparison.detectedUpgradeTitle}
            onUpgradeTitleChange={comparison.handleUpgradeTitleChange}
            onToggleAttachUpgrade={comparison.handleToggleAttachUpgrade}
          />

          {/* Side-by-Side Comparison Columns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <ComparisonOptionACard
              currentWindows={currentWindows}
              customerName={customerName}
              quoteNumber={quoteNumber}
              surchargeRate={surchargeRate}
              effectiveJC={effectiveJC}
              effectiveLabour={effectiveLabour}
              hstRate={hstRate}
              quoteResultA={quoteResultA}
              afterDiscountA={afterDiscountA}
              totalA={totalA}
              firstPaymentA={firstPaymentA}
              secondPaymentA={secondPaymentA}
              appliedOption={appliedOption}
            />

            <ComparisonOptionBCard
              effectiveOptionBWindows={comparison.effectiveOptionBWindows}
              stagedOptionB={stagedOptionB}
              optionBMeta={comparison.optionBMeta}
              customerName={customerName}
              appliedOption={appliedOption}
              isComparisonStaging={isComparisonStaging}
              isDragging={comparison.isDragging}
              isParsing={comparison.isParsing}
              fileInputRef={comparison.fileInputRef}
              handleFileInputChange={comparison.handleFileInputChange}
              handleDrop={comparison.handleDrop}
              setIsDragging={comparison.setIsDragging}
              showOverrides={comparison.showOverrides}
              setShowOverrides={comparison.setShowOverrides}
              overrideJambId={comparison.overrideJambId}
              setOverrideJambId={comparison.setOverrideJambId}
              overrideCasingId={comparison.overrideCasingId}
              setOverrideCasingId={comparison.setOverrideCasingId}
              dbJambs={comparison.dbJambs}
              dbCasings={comparison.dbCasings}
              resolvedOptionAJambLabel={comparison.resolvedOptionAJambLabel}
              resolvedOptionACasingLabel={comparison.resolvedOptionACasingLabel}
              selectedOverrideJambDisplay={comparison.selectedOverrideJambDisplay}
              selectedOverrideCasingDisplay={comparison.selectedOverrideCasingDisplay}
              optionBFinancials={comparison.optionBFinancials}
              surchargeRate={surchargeRate}
              hstRate={hstRate}
            />
          </div>

          {/* Window Differences Table */}
          <ComparisonDiffTable
            currentWindows={currentWindows}
            effectiveOptionBWindows={comparison.effectiveOptionBWindows}
          />
        </div>

        {/* Footer Actions */}
        <ComparisonFooterActions
          attachedUpgrade={attachedUpgrade}
          onClose={onClose}
          appliedOption={appliedOption}
          isComparisonStaging={isComparisonStaging}
          effectiveOptionBWindows={comparison.effectiveOptionBWindows}
          optionBMeta={comparison.optionBMeta}
          currentWindows={currentWindows}
          getOverridesPayload={comparison.getOverridesPayload}
          onApplyOption={onApplyOption}
          onApplyAndCustomize={onApplyAndCustomize}
          onKeepOptionB={onKeepOptionB}
        />
      </div>
    </div>,
    document.body
  );
}
