"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { toast } from "sonner"
import {
  GlassTreatment,
  PaneType,
  ComboPricing,
  SealedUnitFormulaConstants,
  SealedUnitLabourSettings,
  ThicknessBreak,
  SealedUnitLineItem,
  GrillType,
  GrillProfile,
  GrillItemConfig,
  SealedUnitGrillSettings,
  GlassShape,
  calculateGrillRawCost,
  parseInchesInput,
  calculateSealedUnitItem,
} from "@/lib/sealed-units-logic"

interface UseSealedUnitsItemBuilderProps {
  combos: ComboPricing[]
  formula: SealedUnitFormulaConstants
  labour: SealedUnitLabourSettings
  thicknessBreaks: ThicknessBreak[]
  grills: SealedUnitGrillSettings
  setLineItems: React.Dispatch<React.SetStateAction<SealedUnitLineItem[]>>
}

export function useSealedUnitsItemBuilder({
  combos,
  formula,
  labour,
  thicknessBreaks,
  grills,
  setLineItems,
}: UseSealedUnitsItemBuilderProps) {
  // Line Item Builder State
  const [treatment, setTreatment] = useState<GlassTreatment>("annealed")
  const [selectedComboId, setSelectedComboId] = useState<string>("ann_clear")
  const [selectedPane, setSelectedPane] = useState<PaneType>("dual")
  const [shape, setShape] = useState<GlassShape>("rectangle")
  const [widthInput, setWidthInput] = useState<string>("")
  const [heightInput, setHeightInput] = useState<string>("")
  const [qtyInput, setQtyInput] = useState<string>("")

  // Interior Grill Builder State
  const [grillType, setGrillType] = useState<GrillType>("none")
  const [grillProfile, setGrillProfile] = useState<GrillProfile>('5/8" x 1/4"')
  const [grillColor, setGrillColor] = useState<string>("White")
  const [grillPatternMode, setGrillPatternMode] = useState<
    "pattern" | "manual"
  >("pattern")
  const [grillCols, setGrillCols] = useState<string>("")
  const [grillRows, setGrillRows] = useState<string>("")
  const [grillSquares, setGrillSquares] = useState<string>("")
  const [grillTIntersections, setGrillTIntersections] = useState<string>("")
  const [grillBentHubs, setGrillBentHubs] = useState<string>("")

  // Editing State
  const [editingItem, setEditingItem] = useState<SealedUnitLineItem | null>(null)

  const widthRef = useRef<HTMLInputElement>(null)

  // Filter combos by treatment (Annealed vs Tempered)
  const availableCombos = useMemo(() => {
    return combos.filter((c) => c.treatment === treatment)
  }, [combos, treatment])

  // Keep selected combo valid when switching treatment
  useEffect(() => {
    if (!availableCombos.some((c) => c.id === selectedComboId)) {
      if (availableCombos.length > 0) {
        setSelectedComboId(availableCombos[0].id)
      }
    }
  }, [treatment, availableCombos, selectedComboId])

  // Selected combo object
  const activeCombo = useMemo(() => {
    return (
      combos.find((c) => c.id === selectedComboId) ||
      availableCombos[0] ||
      combos[0]
    )
  }, [combos, selectedComboId, availableCombos])

  // Check if current combo supports Dual pane
  const hasDualPane = useMemo(() => {
    if (!activeCombo) return true
    const pricesObj = (activeCombo.prices as any) || {}
    return Object.values(pricesObj).some(
      (t: any) =>
        t &&
        t.dual !== null &&
        t.dual !== undefined &&
        t.dual !== "" &&
        Number(t.dual) > 0
    )
  }, [activeCombo])

  // Auto-switch to Triple if Dual is not available on selected combo
  useEffect(() => {
    if (!hasDualPane && selectedPane === "dual") {
      setSelectedPane("triple")
    }
  }, [hasDualPane, selectedPane])

  // Computed grill item config based on pattern mode or manual mode
  const computedGrillConfig = useMemo((): GrillItemConfig => {
    if (grillType === "none") return { type: "none" }
    const hubs = Math.max(0, parseInt(grillBentHubs, 10) || 0)

    if (grillType === "grid") {
      if (grillPatternMode === "pattern") {
        const c = Math.max(1, parseInt(grillCols, 10) || 1)
        const r = Math.max(1, parseInt(grillRows, 10) || 1)
        return {
          type: "grid",
          profile: grillProfile,
          color: grillColor,
          colsCount: c,
          rowsCount: r,
          squaresCount: c * r,
          tIntersectionsCount: Math.max(0, c - 1) * Math.max(0, r - 1),
          bentHubsCount: hubs,
        }
      } else {
        return {
          type: "grid",
          profile: grillProfile,
          color: grillColor,
          squaresCount: Math.max(0, parseInt(grillSquares, 10) || 0),
          tIntersectionsCount: Math.max(
            0,
            parseInt(grillTIntersections, 10) || 0
          ),
          bentHubsCount: hubs,
        }
      }
    }

    return {
      type: grillType,
      color: grillColor,
      bentHubsCount: hubs,
    }
  }, [
    grillType,
    grillProfile,
    grillColor,
    grillPatternMode,
    grillCols,
    grillRows,
    grillSquares,
    grillTIntersections,
    grillBentHubs,
  ])

  // Live Grill Cost Preview
  const activeGrillPreview = useMemo(() => {
    return calculateGrillRawCost(computedGrillConfig, grills)
  }, [computedGrillConfig, grills])

  // Edit Item Handler
  const handleEditItem = (item: SealedUnitLineItem) => {
    setEditingItem(item)
    setTreatment(item.treatment || "annealed")
    setSelectedComboId(item.combinationId)
    setSelectedPane(item.paneType || "dual")
    setShape(item.shape || "rectangle")
    setWidthInput(String(item.widthIn || ""))
    setHeightInput(String(item.heightIn || ""))
    setQtyInput(String(item.quantity || 1))

    if (item.grill && item.grill.type !== "none") {
      setGrillType(item.grill.type)
      if (item.grill.profile) setGrillProfile(item.grill.profile)
      if (item.grill.color) setGrillColor(item.grill.color)
      if (item.grill.colsCount && item.grill.rowsCount) {
        setGrillPatternMode("pattern")
        setGrillCols(String(item.grill.colsCount))
        setGrillRows(String(item.grill.rowsCount))
        setGrillSquares("")
        setGrillTIntersections("")
      } else {
        setGrillPatternMode("manual")
        setGrillSquares(
          item.grill.squaresCount ? String(item.grill.squaresCount) : ""
        )
        setGrillTIntersections(
          item.grill.tIntersectionsCount
            ? String(item.grill.tIntersectionsCount)
            : ""
        )
        setGrillCols("")
        setGrillRows("")
      }
      setGrillBentHubs(
        item.grill.bentHubsCount ? String(item.grill.bentHubsCount) : ""
      )
    } else {
      setGrillType("none")
      setGrillCols("")
      setGrillRows("")
      setGrillSquares("")
      setGrillTIntersections("")
      setGrillBentHubs("")
    }

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 120, behavior: "smooth" })
    }
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setWidthInput("")
    setHeightInput("")
    setQtyInput("1")
    setGrillType("none")
    setGrillCols("")
    setGrillRows("")
    setGrillSquares("")
    setGrillTIntersections("")
    setGrillBentHubs("")
  }

  const handleDuplicateItem = (id: string) => {
    setLineItems((prev) => {
      const found = prev.find((i) => i.id === id)
      if (!found) return prev
      const duplicated: SealedUnitLineItem = {
        ...found,
        id: `su_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      }
      toast.success("Sealed unit duplicated")
      return [...prev, duplicated]
    })
  }

  // Add / Update Item Handler
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!activeCombo) throw new Error("Please select a glass combination.")
      const w = parseInchesInput(widthInput, "width")
      const h = parseInchesInput(heightInput, "height")
      const qty = parseInt(qtyInput, 10)
      if (!qty || qty < 1) throw new Error("Quantity must be at least 1.")

      const calculatedItem = calculateSealedUnitItem({
        combo: activeCombo,
        paneType: selectedPane,
        widthIn: w,
        heightIn: h,
        quantity: qty,
        shape,
        formula,
        thicknessBreaks,
        labourSettings: labour,
        grill: computedGrillConfig,
        grillSettings: grills,
      })

      if (editingItem) {
        const updatedItem: SealedUnitLineItem = {
          ...calculatedItem,
          id: editingItem.id,
        }
        setLineItems((prev) => {
          const idx = prev.findIndex((i) => i.id === editingItem.id)
          if (idx >= 0) {
            const next = [...prev]
            next[idx] = updatedItem
            return next
          }
          return [...prev, updatedItem]
        })
        setEditingItem(null)
        toast.success(
          `Updated ${activeCombo.name} (${updatedItem.thicknessMm}mm).`
        )
      } else {
        setLineItems((prev) => [...prev, calculatedItem])
        toast.success(
          `Added ${activeCombo.name} (${calculatedItem.thicknessMm}mm) to quote.`
        )
      }

      // Reset dimensions for fast entry
      setWidthInput("")
      setHeightInput("")
      setQtyInput("1")
      widthRef.current?.focus()
    } catch (err: any) {
      toast.error(err.message || "Invalid dimensions or pricing error.")
    }
  }

  const handleRemoveItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id))
    if (editingItem?.id === id) {
      setEditingItem(null)
    }
  }

  return {
    treatment,
    setTreatment,
    availableCombos,
    selectedComboId,
    setSelectedComboId,
    activeCombo,
    hasDualPane,
    selectedPane,
    setSelectedPane,
    shape,
    setShape,
    widthInput,
    setWidthInput,
    heightInput,
    setHeightInput,
    qtyInput,
    setQtyInput,
    grillType,
    setGrillType,
    grillProfile,
    setGrillProfile,
    grillColor,
    setGrillColor,
    grillPatternMode,
    setGrillPatternMode,
    grillCols,
    setGrillCols,
    grillRows,
    setGrillRows,
    grillSquares,
    setGrillSquares,
    grillTIntersections,
    setGrillTIntersections,
    grillBentHubs,
    setGrillBentHubs,
    computedGrillConfig,
    activeGrillPreview,
    editingItem,
    setEditingItem,
    handleEditItem,
    handleCancelEdit,
    onCancelEdit: handleCancelEdit,
    handleDuplicateItem,
    onAddItem: handleAddItem,
    handleAddItem,
    handleRemoveItem,
    widthRef,
  }
}
