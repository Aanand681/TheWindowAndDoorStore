'use client';

import { useState } from 'react';
import { useSharedRegions } from '@/hooks/shared/useSharedRegions';

export function useDoorTravel() {
  const {
    regions,
    selectedRegionId,
    setSelectedRegionId,
    selectedRegion,
    loading: regionsLoading,
  } = useSharedRegions('Fort Frances');

  const [travelFeeType, setTravelFeeType] = useState<
    'none' | 'local_std' | 'far_std' | 'far_small' | 'custom'
  >('local_std');
  const [customTravelFee, setCustomTravelFee] = useState<string>('');
  const [showOutTownTravel, setShowOutTownTravel] = useState<boolean>(false);
  const [travelKm, setTravelKm] = useState<string>('');
  const [crewHours, setCrewHours] = useState<string>('');
  const [crewSize, setCrewSize] = useState<'2' | '3'>('3');

  const handleUpdateTravelParams = (updates: any) => {
    if (updates.selectedRegionId !== undefined) setSelectedRegionId(updates.selectedRegionId);
    if (updates.travelFeeType !== undefined) setTravelFeeType(updates.travelFeeType);
    if (updates.customTravelFee !== undefined) setCustomTravelFee(updates.customTravelFee);
    if (updates.showOutTownTravel !== undefined) setShowOutTownTravel(updates.showOutTownTravel);
    if (updates.travelKm !== undefined) setTravelKm(updates.travelKm);
    if (updates.crewHours !== undefined) setCrewHours(updates.crewHours);
    if (updates.crewSize !== undefined) setCrewSize(updates.crewSize);
  };

  return {
    regions,
    selectedRegionId,
    setSelectedRegionId,
    selectedRegion,
    regionsLoading,
    travelFeeType,
    setTravelFeeType,
    customTravelFee,
    setCustomTravelFee,
    showOutTownTravel,
    setShowOutTownTravel,
    travelKm,
    setTravelKm,
    crewHours,
    setCrewHours,
    crewSize,
    setCrewSize,
    handleUpdateTravelParams,
  };
}

