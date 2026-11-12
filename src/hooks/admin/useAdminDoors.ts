"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  DEFAULT_DOOR_PRESETS,
  DEFAULT_DOOR_UPCHARGES,
  DEFAULT_DOOR_FORMULA,
  DEFAULT_DOOR_LOGISTICS,
} from "@/lib/doors/constants"
import {
  DoorPreset,
  DoorUpchargeConfig,
  DoorFormulaSettings,
  DoorLogisticsSettings,
} from "@/lib/doors/types"

export function useAdminDoors() {
  const [presets, setPresets] = useState<DoorPreset[]>(DEFAULT_DOOR_PRESETS)
  const [upcharges, setUpcharges] = useState<DoorUpchargeConfig[]>(
    DEFAULT_DOOR_UPCHARGES
  )
  const [formula, setFormula] =
    useState<DoorFormulaSettings>(DEFAULT_DOOR_FORMULA)
  const [logistics, setLogistics] = useState<DoorLogisticsSettings>(
    DEFAULT_DOOR_LOGISTICS
  )

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<
    "presets" | "upcharges" | "formula" | "logistics"
  >("presets")

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
        setLoading(false)
      })
      .catch((err) => {
        console.error("Failed to load door settings:", err)
        toast.error("Failed to load door settings from database")
        setLoading(false)
      })
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/doors/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presets, upcharges, formula, logistics }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to save settings")
      toast.success("Door settings and rates updated successfully!")
    } catch (err: any) {
      toast.error(err.message || "Error saving settings")
    } finally {
      setSaving(false)
    }
  }

  const handleResetDefaults = () => {
    if (
      confirm(
        "Are you sure you want to reset all door rates, presets, and logistics to system defaults? Any unsaved edits will be lost."
      )
    ) {
      setPresets(DEFAULT_DOOR_PRESETS)
      setUpcharges(DEFAULT_DOOR_UPCHARGES)
      setFormula(DEFAULT_DOOR_FORMULA)
      setLogistics(DEFAULT_DOOR_LOGISTICS)
      toast.info(
        'Settings reset to system defaults. Click "Save Changes" to persist to database.'
      )
    }
  }

  const handleUpdatePreset = (
    index: number,
    field: keyof DoorPreset,
    value: any
  ) => {
    setPresets((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleAddPreset = () => {
    const newPreset: DoorPreset = {
      id: `door_${Date.now()}`,
      label: "New Door Preset",
      category: "entry",
      labour: 715,
      misc: 115.2,
      description: "Custom door preset",
      isCustom: true,
    }
    setPresets((prev) => [...prev, newPreset])
    toast.info("New door preset added. Don’t forget to save changes.")
  }

  const handleDeletePreset = (index: number) => {
    setPresets((prev) => prev.filter((_, i) => i !== index))
  }

  const handleUpdateUpcharge = (
    index: number,
    field: keyof DoorUpchargeConfig,
    value: any
  ) => {
    setUpcharges((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleAddUpcharge = () => {
    const newUpcharge: DoorUpchargeConfig = {
      id: `upcharge_${Date.now()}`,
      label: "New Site Upcharge",
      rate: 130,
      unit: "1 Hour",
      description: "Jobsite labour addition",
    }
    setUpcharges((prev) => [...prev, newUpcharge])
    toast.info("New upcharge added. Don’t forget to save changes.")
  }

  const handleDeleteUpcharge = (index: number) => {
    setUpcharges((prev) => prev.filter((_, i) => i !== index))
  }

  return {
    presets,
    setPresets,
    upcharges,
    setUpcharges,
    formula,
    setFormula,
    logistics,
    setLogistics,
    loading,
    saving,
    activeTab,
    setActiveTab,
    handleSave,
    handleResetDefaults,
    handleUpdatePreset,
    handleAddPreset,
    handleDeletePreset,
    handleUpdateUpcharge,
    handleAddUpcharge,
    handleDeleteUpcharge,
  }
}
