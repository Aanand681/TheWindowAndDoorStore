"use client"

import React from "react"
import { createPortal } from "react-dom"
import { Sparkles, X } from "lucide-react"
import { useQuoteComparison } from "@/hooks/calculator/useQuoteComparison"
import {
  QuoteComparisonModalProps,
  AttachedUpgradeOption,
} from "./comparison/types"
import { ComparisonDeltaHero } from "./comparison/ComparisonDeltaHero"
import { ComparisonOptionACard } from "./comparison/ComparisonOptionACard"
import { ComparisonOptionBCard } from "./comparison/ComparisonOptionBCard"
import { ComparisonDiffTable } from "./comparison/ComparisonDiffTable"
import { ComparisonFooterActions } from "./comparison/ComparisonFooterActions"

export type { AttachedUpgradeOption, QuoteComparisonModalProps }

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
  } = props

  const comparison = useQuoteComparison(props)

  if (!comparison.mounted || !isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center overflow-y-auto bg-background/85 p-3 backdrop-blur-md duration-200 fade-in sm:p-5">
      <div className="my-auto flex max-h-[92vh] w-full max-w-5xl animate-in flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl duration-150 zoom-in-95">
        {/* Header Bar */}
        <div className="flex shrink-0 items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-2 text-amber-500 shadow-xs">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight sm:text-lg">
                  Dual PDF Upgrade &amp; Option Comparison
                </h2>
                <span className="rounded-full border border-amber-500/30 bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-amber-600 uppercase dark:text-amber-400">
                  Phase 3 Hybrid
                </span>
                {isComparisonStaging && (
                  <span className="rounded-full border border-primary/30 bg-primary/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-primary uppercase">
                    Live Staging Mode
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Compare base quote with upgraded manufacturer PDF to calculate
                &Delta; pre-tax upgrade cost.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
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
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
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
              selectedOverrideJambDisplay={
                comparison.selectedOverrideJambDisplay
              }
              selectedOverrideCasingDisplay={
                comparison.selectedOverrideCasingDisplay
              }
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
  )
}
