"use client"

import { useState, useEffect } from "react"
import {
  ComboPricing,
  SealedUnitFormulaConstants,
  SealedUnitLabourSettings,
  ThicknessBreak,
  SealedUnitGrillSettings,
  DEFAULT_SEALED_UNIT_COMBOS,
  DEFAULT_FORMULA_CONSTANTS,
  DEFAULT_LABOUR_SETTINGS,
  DEFAULT_THICKNESS_BREAKS,
  DEFAULT_GRILL_SETTINGS,
} from "@/lib/sealed-units-logic"
import { toast } from "sonner"

export type AdminSealedUnitsTab =
  "annealed" | "tempered" | "labour" | "formula" | "grills"

export function useAdminSealedUnits() {
  const [combos, setCombos] = useState<ComboPricing[]>(
    DEFAULT_SEALED_UNIT_COMBOS
  )
  const [formula, setFormula] = useState<SealedUnitFormulaConstants>(
    DEFAULT_FORMULA_CONSTANTS
  )
  const [labour, setLabour] = useState<SealedUnitLabourSettings>(
    DEFAULT_LABOUR_SETTINGS
  )
  const [thicknessBreaks, setThicknessBreaks] = useState<ThicknessBreak[]>(
    DEFAULT_THICKNESS_BREAKS
  )
  const [grills, setGrills] = useState<SealedUnitGrillSettings>(
    DEFAULT_GRILL_SETTINGS
  )

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<AdminSealedUnitsTab>("annealed")

  const fetchSealedUnitSettings = async () => {
    try {
      const res = await fetch("/api/sealed-units/settings")
      const data = await res.json()
      if (Array.isArray(data.combos) && data.combos.length > 0) {
        setCombos(data.combos)
      }
      if (data.formula) setFormula(data.formula)
      if (data.labour) setLabour(data.labour)
      if (Array.isArray(data.thicknessBreaks))
        setThicknessBreaks(data.thicknessBreaks)
      if (data.grills) setGrills(data.grills)
    } catch (err) {
      console.error("Failed to load sealed unit settings:", err)
      toast.error("Failed to load sealed unit settings from database")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSealedUnitSettings()
  }, [])

  const handlePriceChange = (
    comboId: string,
    thickness: number,
    pane: "dual" | "triple",
    value: string
  ) => {
    const num = value.trim() === "" ? null : Number(value)
    setCombos((prev) =>
      prev.map((c) => {
        if (c.id !== comboId) return c
        const currentPrices = c.prices || {}
        const currentThickness = currentPrices[thickness] || {
          dual: null,
          triple: null,
        }
        return {
          ...c,
          prices: {
            ...currentPrices,
            [thickness]: {
              ...currentThickness,
              [pane]: num !== null && !isNaN(num) ? num : null,
            },
          },
        }
      })
    )
  }

  const handleGridRateChange = (
    profile: string,
    color: string,
    value: string
  ) => {
    const num = value.trim() === "" ? null : Number(value)
    setGrills((prev) => ({
      ...prev,
      gridRates: {
        ...prev.gridRates,
        [profile]: {
          ...(prev.gridRates?.[profile] || {}),
          [color]: num !== null && !isNaN(num) ? num : null,
        },
      },
    }))
  }

  const handleBurst3Change = (colorKey: string, value: string) => {
    const num = Number(value) || 0
    setGrills((prev) => ({
      ...prev,
      burst3Rates: {
        ...prev.burst3Rates,
        [colorKey]: num,
      },
    }))
  }

  const handleBurst5Change = (colorKey: string, value: string) => {
    const num = Number(value) || 0
    setGrills((prev) => ({
      ...prev,
      burst5Rates: {
        ...prev.burst5Rates,
        [colorKey]: num,
      },
    }))
  }

  const handleGrillExtraChange = (
    field: "tIntersectionPrice" | "bentHubPrice" | "customerOwnGrillPrice",
    value: string
  ) => {
    const num = Number(value) || 0
    setGrills((prev) => ({
      ...prev,
      [field]: num,
    }))
  }

  const handleDiscardChanges = () => {
    if (
      confirm(
        "Discard all unsaved edits and reload active sealed unit settings from the database?"
      )
    ) {
      fetchSealedUnitSettings()
      toast.info("Unsaved edits discarded. Active sealed unit rates reloaded.")
    }
  }

  const handleRestoreVersion = (
    snapshot: Record<string, any>,
    version: number
  ) => {
    if (Array.isArray(snapshot.combos)) setCombos(snapshot.combos)
    if (snapshot.formula) setFormula(snapshot.formula)
    if (snapshot.labour) setLabour(snapshot.labour)
    if (Array.isArray(snapshot.thicknessBreaks))
      setThicknessBreaks(snapshot.thicknessBreaks)
    if (snapshot.grills) setGrills(snapshot.grills)
    toast.success(
      `Loaded rates from Version ${version} snapshot. Click "Save All Changes" to persist.`
    )
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/sealed-units/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          combos,
          formula,
          labour,
          thicknessBreaks,
          grills,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to save settings")
      }

      toast.success("Sealed Unit pricing and rules saved successfully!")
    } catch (err: any) {
      toast.error(err.message || "An error occurred while saving.")
    } finally {
      setSaving(false)
    }
  }

  const annealedCombos = combos.filter((c) => c.treatment === "annealed")
  const temperedCombos = combos.filter((c) => c.treatment === "tempered")

  return {
    combos,
    setCombos,
    formula,
    setFormula,
    labour,
    setLabour,
    thicknessBreaks,
    setThicknessBreaks,
    grills,
    setGrills,
    loading,
    saving,
    activeTab,
    setActiveTab,
    handlePriceChange,
    handleGridRateChange,
    handleBurst3Change,
    handleBurst5Change,
    handleGrillExtraChange,
    handleDiscardChanges,
    handleRestoreVersion,
    handleSave,
    annealedCombos,
    temperedCombos,
  }
}
