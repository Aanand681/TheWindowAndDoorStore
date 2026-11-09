'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useTaxTravelRoute } from './useTaxTravelRoute';
import { calculateTaxTotals } from './tax-calculations';
import {
  restoreSavedTaxState,
  computeTaxQuoteKey,
  resetTaxState,
} from './tax-restoration';
import { useTaxInitialData } from './useTaxInitialData';

interface UseTaxCalculatorProps {
  windows: any[];
  isSupplyOnlyProp?: boolean;
  savedTaxTotals?: any;
  onCalculated?: (totals: any) => void;
}

export function useTaxCalculator({
  windows,
  isSupplyOnlyProp = false,
  savedTaxTotals,
  onCalculated,
}: UseTaxCalculatorProps) {
  const isSupplyOnly = Boolean(isSupplyOnlyProp);
  const [addons, setAddons] = useState<Record<string, string>>({});
  const [crew, setCrew] = useState('3');

  // Jambs & Casing
  const [jambId, setJambId] = useState<string>(() =>
    !isSupplyOnly && !savedTaxTotals ? 'j3' : 'none'
  );
  const [jambName, setJambName] = useState('');
  const [jambRate, setJambRate] = useState('');

  const [casingId, setCasingId] = useState<string>(() =>
    !isSupplyOnly && !savedTaxTotals ? 'vinyl' : 'none'
  );
  const [casingName, setCasingName] = useState('');
  const [casingRate, setCasingRate] = useState('');

  const [discount, setDiscount] = useState('');
  const [hstOn, setHstOn] = useState(true);

  // Toggles for Quote Type
  const [includeLabour, setIncludeLabour] = useState(true);
  const [includeMisc, setIncludeMisc] = useState(true);
  const [includeJC, setIncludeJC] = useState(true);

  const regionStateRef = useRef<{ setupFeeSetter?: (fee: string) => void }>({});

  const {
    regions,
    selectedRegionId,
    setSelectedRegionId,
    dbAddons,
    setDbAddons,
    dbJambs,
    dbCasings,
    dbVehicleRate,
    dbCrewRates,
    windowLabourSettings,
  } = useTaxInitialData({
    onSetupFeeDefault: useCallback((fee: string) => {
      regionStateRef.current.setupFeeSetter?.(fee);
    }, []),
  });

  const region = regions.find((r) => r._id === selectedRegionId);
  const effectiveIsSupplyOnly =
    isSupplyOnly ||
    Boolean(
      isSupplyOnlyProp ||
        region?.isSupplyOnly ||
        region?.name?.toLowerCase().includes('supply')
    );

  const travel = useTaxTravelRoute(region);
  useEffect(() => {
    regionStateRef.current.setupFeeSetter = travel.setSetupFee;
  }, [travel.setSetupFee]);

  const handleRegionSelect = (regId: string, currentRegions = regions) => {
    setSelectedRegionId(regId);
    const reg = currentRegions.find((r) => r._id === regId);
    if (!reg) return;
    const isSupply = Boolean(
      isSupplyOnlyProp || reg.isSupplyOnly || reg.name?.toLowerCase().includes('supply')
    );
    if (isSupply) {
      travel.setSetupFee('0');
      travel.setManualKm('0');
      travel.setManualHours('0');
      travel.setTravelInfo(null);
      setCrew('none');
      setJambId('none');
      setCasingId('none');
      setJambRate('0');
      setCasingRate('0');
      return;
    }
    if (
      reg.name.toLowerCase().includes('dryden') ||
      reg.name.toLowerCase().includes('sioux')
    ) {
      const std = reg.setupFeeOptions?.find((o: any) => Math.abs(o.value - 727.5) < 0.01);
      travel.setSetupFee(std ? String(std.value) : '727.5');
    } else {
      travel.setSetupFee('0');
    }
  };

  const restoredQuoteKeyRef = useRef<string | null>(null);

  const settersMap = useMemo(
    () => ({
      setAddons,
      setDbAddons,
      setSelectedRegionId,
      setJambId,
      setJambName,
      setJambRate,
      setCasingId,
      setCasingName,
      setCasingRate,
      setCoords: travel.setCoords,
      setManualKm: travel.setManualKm,
      setManualHours: travel.setManualHours,
      setCrew,
      setSetupFee: travel.setSetupFee,
      setDiscount,
      setHstOn,
      setIncludeLabour,
      setIncludeMisc,
      setIncludeJC,
    }),
    [travel.setCoords, travel.setManualKm, travel.setManualHours, travel.setSetupFee]
  );

  useEffect(() => {
    if (!savedTaxTotals) {
      if (restoredQuoteKeyRef.current !== null) {
        restoredQuoteKeyRef.current = null;
        resetTaxState(settersMap);
      }
      return;
    }

    const quoteKey = computeTaxQuoteKey(savedTaxTotals);

    if (restoredQuoteKeyRef.current === quoteKey) {
      if ((!selectedRegionId || selectedRegionId === '') && regions.length > 0) {
        if (savedTaxTotals.selectedRegionId) {
          setSelectedRegionId(savedTaxTotals.selectedRegionId);
        } else if (savedTaxTotals.regionName) {
          const match = regions.find(
            (r) => r.name.toLowerCase() === savedTaxTotals.regionName.toLowerCase()
          );
          if (match) setSelectedRegionId(match._id);
        }
      }
      return;
    }
    restoredQuoteKeyRef.current = quoteKey;

    restoreSavedTaxState(savedTaxTotals, settersMap, { regions, dbJambs, dbCasings });
  }, [savedTaxTotals, regions, dbJambs, dbCasings, settersMap, selectedRegionId, setSelectedRegionId]);

  const lastInstallJambIdRef = useRef<string>('j3');
  const lastInstallCasingIdRef = useRef<string>('vinyl');

  useEffect(() => {
    if (effectiveIsSupplyOnly) {
      if (jambId !== 'none') lastInstallJambIdRef.current = jambId;
      if (casingId !== 'none') lastInstallCasingIdRef.current = casingId;
      setJambId('none');
      setCasingId('none');
    } else {
      if (jambId === 'none') {
        setJambId(lastInstallJambIdRef.current || 'j3');
      }
      if (casingId === 'none') {
        setCasingId(lastInstallCasingIdRef.current || 'vinyl');
      }
    }
  }, [effectiveIsSupplyOnly]);

  const calculatedTotals = useMemo(
    () =>
      calculateTaxTotals({
        windows,
        region,
        windowLabourSettings,
        effectiveIsSupplyOnly,
        dbAddons,
        addons,
        manualKm: travel.manualKm,
        manualHours: travel.manualHours,
        crew,
        dbCrewRates,
        dbVehicleRate,
        setupFee: travel.setupFee,
        jambId,
        jambName,
        jambRate,
        dbJambs,
        casingId,
        casingName,
        casingRate,
        dbCasings,
        includeLabour,
        includeMisc,
        includeJC,
        discount,
        hstOn,
        selectedRegionId,
        coords: travel.coords,
        travelCity: travel.travelInfo?.city,
      }),
    [
      windows, region, addons, travel.manualKm, travel.manualHours, crew, travel.setupFee,
      jambId, jambName, jambRate, casingId, casingName, casingRate, discount, hstOn, includeLabour, includeMisc,
      includeJC, dbAddons, dbJambs, dbCasings, dbVehicleRate, dbCrewRates, isSupplyOnly,
      effectiveIsSupplyOnly, selectedRegionId, travel.coords, travel.travelInfo?.city, windowLabourSettings,
    ]
  );

  const onCalculatedRef = useRef(onCalculated);
  useEffect(() => {
    onCalculatedRef.current = onCalculated;
  });

  useEffect(() => {
    if (onCalculatedRef.current && calculatedTotals) {
      onCalculatedRef.current(calculatedTotals);
    }
  }, [calculatedTotals]);

  return {
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
  };
}
