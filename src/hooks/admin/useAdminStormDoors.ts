"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import {
  DEFAULT_STORM_DOORS_DATA,
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

export function useAdminStormDoors() {
  const [models, setModels] = useState<StormDoorCatalogItem[]>(YORK_STORM_DOORS)
  const [addons, setAddons] = useState<StormDoorAddonOption[]>(YORK_STORM_ADDONS)
  const [rules, setRules] = useState<StormDoorGlobalRules>(DEFAULT_STORM_DOOR_RULES)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<"models" | "addons" | "rules">("models")

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/doors/storm-doors", {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      })
      const data: StormDoorSettingsData = await res.json()
      if (Array.isArray(data.models) && data.models.length > 0) setModels(data.models)
      if (Array.isArray(data.addons) && data.addons.length > 0) setAddons(data.addons)
      if (data.rules) setRules(data.rules)
    } catch {
      toast.error("Failed to load storm door settings")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/doors/storm-doors", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ models, addons, rules }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save storm doors")

      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("storm-doors-updated"))
      }
      toast.success("Storm door catalog and add-ons saved successfully!")
    } catch (err: any) {
      toast.error(err.message || "Error saving storm doors")
    } finally {
      setSaving(false)
    }
  }

  const handleDiscardChanges = () => {
    fetchSettings()
    toast.info("Reverted to saved database settings")
  }

  const handleUpdateModelField = (
    index: number,
    field: keyof StormDoorCatalogItem,
    value: any
  ) => {
    setModels((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const handleAddModel = (newModel: StormDoorCatalogItem) => {
    setModels((prev) => [...prev, newModel])
    toast.success(`Added model: ${newModel.name}`)
  }

  const handleDeleteModel = (index: number) => {
    const target = models[index]
    setModels((prev) => prev.filter((_, i) => i !== index))
    toast.info(`Removed model: ${target?.name || "Storm Door"}`)
  }

  const handleAddAddon = (newAddon: StormDoorAddonOption) => {
    setAddons((prev) => [...prev, newAddon])
    toast.success(`Added add-on: ${newAddon.label}`)
  }

  const handleUpdateAddonField = (
    index: number,
    field: keyof StormDoorAddonOption,
    value: any
  ) => {
    setAddons((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
  }

  const handleDeleteAddon = (index: number) => {
    const target = addons[index]
    setAddons((prev) => prev.filter((_, i) => i !== index))
    toast.info(`Removed add-on: ${target?.label || "Add-on"}`)
  }

  const handleUpdateRule = (field: keyof StormDoorGlobalRules, value: any) => {
    setRules((prev) => ({ ...prev, [field]: value }))
  }

  return {
    models,
    addons,
    rules,
    loading,
    saving,
    activeTab,
    setActiveTab,
    handleSave,
    handleDiscardChanges,
    handleAddModel,
    handleUpdateModelField,
    handleDeleteModel,
    handleAddAddon,
    handleUpdateAddonField,
    handleDeleteAddon,
    handleUpdateRule,
  }
}
