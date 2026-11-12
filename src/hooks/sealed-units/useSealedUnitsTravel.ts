"use client"

import { useState } from "react"
import { useSharedRegions } from "@/hooks/shared/useSharedRegions"

export function useSealedUnitsTravel() {
  const {
    regions,
    selectedRegionId,
    setSelectedRegionId,
    selectedRegion,
    loading: regionsLoading,
  } = useSharedRegions("Fort Frances")

  const [sealedUnitMode, setSealedUnitMode] = useState<
    "installation" | "supply_only" | "service_only"
  >("installation")
  const isInstallation = sealedUnitMode === "installation"
  const isServiceOnly = sealedUnitMode === "service_only"
  const [serviceSqftInput, setServiceSqftInput] = useState<string>("")
  const [serviceLabourRateInput, setServiceLabourRateInput] =
    useState<string>("")
  const [serviceMiscRateInput, setServiceMiscRateInput] = useState<string>("")
  const [travelFeeType, setTravelFeeType] = useState<
    "none" | "local_std" | "far_std" | "far_small" | "custom"
  >("local_std")
  const [customTravelFee, setCustomTravelFee] = useState<string>("")
  const [showOutTownTravel, setShowOutTownTravel] = useState<boolean>(false)
  const [travelKm, setTravelKm] = useState<string>("")
  const [crewHours, setCrewHours] = useState<string>("")
  const [crewSize, setCrewSize] = useState<"2" | "3">("3")
  const [hstRate, setHstRate] = useState<number>(13)

  const handleSetSealedUnitMode = (
    newMode: "installation" | "supply_only" | "service_only"
  ) => {
    setSealedUnitMode(newMode)
    if (newMode === "service_only") {
      setHstRate(13)
    }
  }

  const setIsInstallation = (val: boolean) => {
    handleSetSealedUnitMode(val ? "installation" : "supply_only")
  }

  const formInputs = {
    sealedUnitMode,
    isInstallation,
    isServiceOnly,
    serviceSqftInput,
    serviceLabourRateInput,
    serviceMiscRateInput,
    travelFeeType,
    customTravelFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
    hstRate,
    selectedRegionId,
  }

  const formSetters = {
    setSealedUnitMode: handleSetSealedUnitMode,
    setIsInstallation,
    setServiceSqftInput,
    setServiceLabourRateInput,
    setServiceMiscRateInput,
    setTravelFeeType,
    setCustomTravelFee,
    setShowOutTownTravel,
    setTravelKm,
    setCrewHours,
    setCrewSize,
    setHstRate,
    setSelectedRegionId,
  }

  return {
    ...formInputs,
    ...formSetters,
    regions,
    selectedRegionId,
    setSelectedRegionId,
    selectedRegion,
    regionsLoading,
    formInputs,
    formSetters,
    handleSetSealedUnitMode,
    setIsInstallation,
  }
}
