'use client';

import React from 'react';
import { Lock } from 'lucide-react';
import { TaxCalculatorTabProps } from './types';
import { useTaxCalculator } from '@/hooks/tax/useTaxCalculator';
import { RegionProfileCard } from './RegionProfileCard';
import { WindowsSizesLabourCard } from './WindowsSizesLabourCard';
import { TravelSetupCard } from './TravelSetupCard';
import { ExtrasAndJambsCard } from './ExtrasAndJambsCard';
import { TaxSummarySidebar } from './TaxSummarySidebar';

export default function TaxCalculatorTab({
  windows,
  onWindowsChange,
  onCalculated,
  savedTaxTotals,
  readOnly = false,
  onOpenPreview,
  isSupplyOnly: isSupplyOnlyProp = false,
  isServiceOnly: _isServiceOnlyProp = false,
  onModeChange: _onModeChange,
  summarySlot,
}: TaxCalculatorTabProps) {
  const {
    regions,
    selectedRegionId,
    region,
    effectiveIsSupplyOnly,
    isSupplyOnly,
    handleRegionSelect,
    travel,
    dbAddons,
    setDbAddons,
    addons,
    setAddons,
    dbCrewRates,
    crew,
    setCrew,
    dbJambs,
    jambId,
    setJambId,
    jambName,
    setJambName,
    jambRate,
    setJambRate,
    dbCasings,
    casingId,
    setCasingId,
    casingName,
    setCasingName,
    casingRate,
    setCasingRate,
    discount,
    setDiscount,
    hstOn,
    setHstOn,
    includeLabour,
    setIncludeLabour,
    includeMisc,
    setIncludeMisc,
    includeJC,
    setIncludeJC,
    calculatedTotals,
  } = useTaxCalculator({
    windows,
    isSupplyOnlyProp,
    savedTaxTotals,
    onCalculated,
  });

  if (!region) return <div>Loading region data...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
      {readOnly && (
        <div className="lg:col-span-12 bg-amber-500/10 border-2 border-amber-500/30 rounded-xl p-3 flex items-center gap-2.5 text-xs font-semibold text-amber-700 dark:text-amber-300 animate-in fade-in">
          <Lock className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
          <span>
            Tax &amp; Labour Calculator is in Read-Only Mode. Values and extras are locked and cannot be edited.
          </span>
        </div>
      )}

      <div className="lg:col-span-8 space-y-4 sm:space-y-5">
        <RegionProfileCard
          region={region}
          regions={regions}
          selectedRegionId={selectedRegionId}
          effectiveIsSupplyOnly={effectiveIsSupplyOnly}
          readOnly={readOnly}
          onRegionSelect={handleRegionSelect}
        />

        <WindowsSizesLabourCard
          windows={windows}
          onWindowsChange={onWindowsChange}
          calculatedTotals={calculatedTotals}
          isSupplyOnly={isSupplyOnly}
          readOnly={readOnly}
        />

        <TravelSetupCard
          region={region}
          isSupplyOnly={isSupplyOnly}
          readOnly={readOnly}
          travel={travel}
          crew={crew}
          setCrew={setCrew}
          dbCrewRates={dbCrewRates}
        />

        <ExtrasAndJambsCard
          readOnly={readOnly}
          dbAddons={dbAddons}
          setDbAddons={setDbAddons}
          addons={addons}
          setAddons={setAddons}
          isSupplyOnly={isSupplyOnly}
          linearFt={calculatedTotals?.ln || 0}
          dbJambs={dbJambs}
          jambId={jambId}
          setJambId={setJambId}
          jambName={jambName}
          setJambName={setJambName}
          jambRate={jambRate}
          setJambRate={setJambRate}
          dbCasings={dbCasings}
          casingId={casingId}
          setCasingId={setCasingId}
          casingName={casingName}
          setCasingName={setCasingName}
          casingRate={casingRate}
          setCasingRate={setCasingRate}
        />
      </div>

      <TaxSummarySidebar
        isSupplyOnly={isSupplyOnly}
        readOnly={readOnly}
        calculatedTotals={calculatedTotals}
        includeLabour={includeLabour}
        setIncludeLabour={setIncludeLabour}
        includeMisc={includeMisc}
        setIncludeMisc={setIncludeMisc}
        includeJC={includeJC}
        setIncludeJC={setIncludeJC}
        discount={discount}
        setDiscount={setDiscount}
        hstOn={hstOn}
        setHstOn={setHstOn}
        onOpenPreview={onOpenPreview}
        summarySlot={summarySlot}
      />
    </div>
  );
}

export { TaxCalculatorTab };
