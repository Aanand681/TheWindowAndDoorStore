"use client"

import { useState, useEffect, useCallback } from "react"
import {
  YORK_STORM_DOORS,
  YORK_STORM_ADDONS,
  DEFAULT_STORM_DOOR_RULES,
} from "@/lib/doors/storm-door-catalog"
import {
  StormDoorCatalogItem,
  StormDoorAddonOption,
  StormDoorGlobalRules,
  StormDoorSettingsData,
} from "@/lib/doors/storm-door-types"

export function useStormDoorCatalog() {
  const [models, setModels] = useState<StormDoorCatalogItem[]>(YORK_STORM_DOORS)
  const [addons, setAddons] = useState<StormDoorAddonOption[]>(YORK_STORM_ADDONS)
  const [rules, setRules] = useState<StormDoorGlobalRules>(DEFAULT_STORM_DOOR_RULES)
  const [loading, setLoading] = useState(true)

  const fetchCatalog = useCallback(async () => {
    try {
      const res = await fetch("/api/doors/storm-doors", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })
      if (!res.ok) throw new Error("Failed to fetch storm door catalog")
      const data: StormDoorSettingsData = await res.json()

      if (Array.isArray(data.models) && data.models.length > 0) {
        setModels(data.models.filter((m) => m.active !== false))
      }
      if (Array.isArray(data.addons) && data.addons.length > 0) {
        setAddons(data.addons.filter((a) => a.active !== false))
      }
      if (data.rules) {
        setRules(data.rules)
      }
    } catch {
      // Fallback cleanly to default York Aluminum catalog
      setModels(YORK_STORM_DOORS)
      setAddons(YORK_STORM_ADDONS)
      setRules(DEFAULT_STORM_DOOR_RULES)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCatalog()

    const onUpdate = () => fetchCatalog()
    window.addEventListener("storm-doors-updated", onUpdate)
    window.addEventListener("door-settings-updated", onUpdate)
    return () => {
      window.removeEventListener("storm-doors-updated", onUpdate)
      window.removeEventListener("door-settings-updated", onUpdate)
    }
  }, [fetchCatalog])

  return {
    models,
    addons,
    rules,
    loading,
    refreshCatalog: fetchCatalog,
  }
}
