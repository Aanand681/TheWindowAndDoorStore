'use client';

import { useState, useEffect } from 'react';
import { ADDONS } from '@/components/tax/types';

interface UseTaxInitialDataProps {
  onSetupFeeDefault?: (fee: string) => void;
}

export function useTaxInitialData({ onSetupFeeDefault }: UseTaxInitialDataProps = {}) {
  const [regions, setRegions] = useState<any[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>('');

  const [dbAddons, setDbAddons] = useState<any[]>(ADDONS);
  const [dbJambs, setDbJambs] = useState<any[]>([]);
  const [dbCasings, setDbCasings] = useState<any[]>([]);
  const [dbVehicleRate, setDbVehicleRate] = useState<number>(0.98);
  const [dbCrewRates, setDbCrewRates] = useState<any[]>([
    { crewSize: '2', hourlyRate: 150 },
    { crewSize: '3', hourlyRate: 200 },
    { crewSize: '4', hourlyRate: 500 },
  ]);

  useEffect(() => {
    fetch('/api/regions')
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          const installRegions = d.filter(
            (r: any) => !r.isSupplyOnly && !r.name?.toLowerCase().includes('supply')
          );
          setRegions(installRegions);
          if (installRegions.length > 0) {
            const ff = installRegions.find((r: any) =>
              r.name.toLowerCase().includes('fort frances')
            );
            const initial = ff || installRegions[0];
            setSelectedRegionId(initial._id);
            if (
              initial.name.toLowerCase().includes('dryden') ||
              initial.name.toLowerCase().includes('sioux')
            ) {
              const std = initial.setupFeeOptions?.find(
                (o: any) => Math.abs(o.value - 727.5) < 0.01
              );
              if (onSetupFeeDefault) {
                onSetupFeeDefault(std ? String(std.value) : '727.5');
              }
            }
          }
        }
      })
      .catch(console.error);

    fetch('/api/settings')
      .then((r) => r.json())
      .then((d) => {
        if (!d || d.error) return;
        if (d.addons?.length) {
          setDbAddons((prev) => {
            const defaultIds = new Set((d.addons || []).map((x: any) => x.id));
            const customs = prev.filter((p) => p.isCustom || !defaultIds.has(p.id));
            return [...(d.addons || []), ...customs];
          });
        }
        if (d.jambs?.length) setDbJambs(d.jambs);
        if (d.casings?.length) setDbCasings(d.casings);
        if (d.vehicleRate !== undefined) setDbVehicleRate(d.vehicleRate);
        if (d.crewRates?.length) setDbCrewRates(d.crewRates);
      })
      .catch(console.error);
  }, []);

  return {
    regions,
    setRegions,
    selectedRegionId,
    setSelectedRegionId,
    dbAddons,
    setDbAddons,
    dbJambs,
    setDbJambs,
    dbCasings,
    setDbCasings,
    dbVehicleRate,
    setDbVehicleRate,
    dbCrewRates,
    setDbCrewRates,
  };
}

