"use client"

import { useState, useEffect } from "react"
import {
  DoorPreset,
  DoorUpchargeConfig,
  DoorFormulaSettings,
  DoorLogisticsSettings,
} from "@/lib/doors/types"
import {
  DEFAULT_DOOR_PRESETS,
  DEFAULT_DOOR_UPCHARGES,
  DEFAULT_DOOR_FORMULA,
  DEFAULT_DOOR_LOGISTICS,
} from "@/lib/doors/constants"

export function useDoorSettings() {
  const [presets, setPresets] = useState<DoorPreset[]>(DEFAULT_DOOR_PRESETS)
  const [upcharges, setUpcharges] = useState<DoorUpchargeConfig[]>(
    DEFAULT_DOOR_UPCHARGES
  )
  const [formula, setFormula] =
    useState<DoorFormulaSettings>(DEFAULT_DOOR_FORMULA)
  const [logistics, setLogistics] = useState<DoorLogisticsSettings>(
    DEFAULT_DOOR_LOGISTICS
  )

  useEffect(() => {
    fetch("/api/doors/settings")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.presets) && data.presets.length > 0)
          setPresets(data.presets)
        if (Array.isArray(data.upcharges) && data.upcharges.length > 0)
          setUpcharges(data.upcharges)
        if (data.formula) setFormula(data.formula)
        if (data.logistics) setLogistics(data.logistics)
      })
      .catch((err) => {
        console.error("Failed to load door settings:", err)
      })
  }, [])

  return {
    presets,
    setPresets,
    upcharges,
    setUpcharges,
    formula,
    setFormula,
    logistics,
    setLogistics,
  }
}
