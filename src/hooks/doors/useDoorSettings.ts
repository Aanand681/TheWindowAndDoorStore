"use client"

import { useState, useEffect, useCallback } from "react"
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
import { getPusherClient } from "@/lib/pusher-client"

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

  const fetchSettings = useCallback(() => {
    fetch("/api/doors/settings", {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
    })
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

  useEffect(() => {
    fetchSettings()

    // Cross-tab sync via storage events
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "door_settings_updated_at") {
        fetchSettings()
      }
    }

    // Same-tab custom event
    const handleCustom = () => {
      fetchSettings()
    }

    window.addEventListener("storage", handleStorage)
    window.addEventListener("door-settings-updated", handleCustom)

    // Pusher real-time updates across devices/sessions
    const pusher = getPusherClient()
    let channel: any = null
    if (pusher) {
      try {
        channel = pusher.subscribe("admin-settings")
        channel.bind("DOOR_SETTINGS_UPDATED", fetchSettings)
      } catch (err) {
        console.warn("Pusher subscribe error in useDoorSettings:", err)
      }
    }

    return () => {
      window.removeEventListener("storage", handleStorage)
      window.removeEventListener("door-settings-updated", handleCustom)
      if (pusher && channel) {
        channel.unbind("DOOR_SETTINGS_UPDATED", fetchSettings)
      }
    }
  }, [fetchSettings])

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
