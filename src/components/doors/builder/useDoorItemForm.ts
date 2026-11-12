"use client"

import { useState, useEffect, useMemo } from "react"
import {
  DoorPreset,
  DoorFormulaSettings,
  DoorLineItem,
  DoorCategory,
  DoorHardwareType,
  DoorUpgradeOption,
  DoorQuotingMode,
} from "@/lib/doors/types"
import {
  buildDoorLineItem,
  calculateDoorUpgradeDifference,
} from "@/lib/doors/calculations"
import { toast } from "sonner"

interface UseDoorItemFormOptions {
  presets: DoorPreset[]
  formula: DoorFormulaSettings
  editingItem?: DoorLineItem | null
  mode?: DoorQuotingMode
  onSaveItem: (item: DoorLineItem) => void
  onResetQuote?: () => void
}

export function useDoorItemForm({
  presets,
  formula,
  editingItem,
  mode,
  onSaveItem,
  onResetQuote,
}: UseDoorItemFormOptions) {
  // Cascading Dropdown 1: Door Type
  const [doorType, setDoorType] = useState<DoorCategory>("entry")

  // Filtered options based on doorType
  const typeOptions = useMemo(() => {
    const matched = presets.filter((p) => p.category === doorType)
    return matched.length > 0 ? matched : presets
  }, [presets, doorType])

  // Selected Option / Preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>(
    typeOptions[0]?.id || "single_regular"
  )

  const currentPreset = useMemo(() => {
    return (
      presets.find((p) => p.id === selectedPresetId) ||
      typeOptions[0] ||
      presets[0]
    )
  }, [presets, selectedPresetId, typeOptions])

  // Editable fields in single row
  const [customDescription, setCustomDescription] = useState<string>(
    presets[0]?.description?.trim() || presets[0]?.label || ""
  )
  const [quantity, setQuantity] = useState<string>("1")
  const [inksterBasePrice, setInksterBasePrice] = useState<string>("")
  const [labourInput, setLabourInput] = useState<string>(
    String(presets[0]?.labour ?? 715)
  )
  const [miscInput, setMiscInput] = useState<string>(
    String(presets[0]?.misc ?? 115.2)
  )

  // Hardware
  const [hardwareType, setHardwareType] = useState<DoorHardwareType>(
    mode === "supply_only" ? "none" : "standard"
  )
  const [customHardwareName, setCustomHardwareName] = useState<string>("")
  const [customHardwarePrice, setCustomHardwarePrice] = useState<string>("")

  useEffect(() => {
    if (mode === "supply_only") setHardwareType("none")
  }, [mode])

  // Upgrade Option
  const [hasUpgradeOption, setHasUpgradeOption] = useState<boolean>(false)
  const [upgradeTitle, setUpgradeTitle] = useState<string>("")
  const [upgradeInksterPrice, setUpgradeInksterPrice] = useState<string>("")
  const [notes, setNotes] = useState<string>("")

  // Handle changing Door Type (Dropdown 1)
  const handleDoorTypeChange = (newType: DoorCategory) => {
    setDoorType(newType)
    const firstForType = presets.find((p) => p.category === newType)
    if (firstForType) {
      setSelectedPresetId(firstForType.id)
      setLabourInput(String(firstForType.labour))
      setMiscInput(String(firstForType.misc))
      setCustomDescription(
        firstForType.description?.trim() || firstForType.label
      )
    }
  }

  // Handle changing Option (Dropdown 2)
  const handleOptionChange = (presetId: string) => {
    setSelectedPresetId(presetId)
    const found = presets.find((p) => p.id === presetId)
    if (found) {
      setLabourInput(String(found.labour))
      setMiscInput(String(found.misc))
      setCustomDescription(found.description?.trim() || found.label)
    }
  }

  // Populate from editingItem
  useEffect(() => {
    if (editingItem) {
      setDoorType(editingItem.category)
      setSelectedPresetId(editingItem.presetId)
      setCustomDescription(
        editingItem.customDescription || editingItem.presetLabel
      )
      setQuantity(String(editingItem.quantity || 1))
      setInksterBasePrice(String(editingItem.inksterBasePrice))
      setLabourInput(String(editingItem.unitLabour))
      setMiscInput(String(editingItem.unitMisc))
      setHardwareType(
        editingItem.hardwareType === "customer_supplied"
          ? "none"
          : editingItem.hardwareType
      )
      if (editingItem.customHardwareName)
        setCustomHardwareName(editingItem.customHardwareName)
      if (editingItem.customHardwarePrice !== undefined) {
        setCustomHardwarePrice(String(editingItem.customHardwarePrice))
      }
      setNotes(editingItem.notes || "")
      if (editingItem.upgradeOption?.enabled) {
        setHasUpgradeOption(true)
        setUpgradeTitle(editingItem.upgradeOption.title)
        setUpgradeInksterPrice(String(editingItem.upgradeOption.inksterPrice))
      } else {
        setHasUpgradeOption(false)
      }
    }
  }, [editingItem])

  // Upgrade difference
  const upgradeDiff = useMemo(() => {
    if (!hasUpgradeOption) return null
    return calculateDoorUpgradeDifference(
      parseFloat(inksterBasePrice) || 0,
      parseFloat(upgradeInksterPrice) || 0,
      doorType,
      formula.surchargeRate,
      formula.doorDiscountPercent
    )
  }, [
    hasUpgradeOption,
    inksterBasePrice,
    upgradeInksterPrice,
    doorType,
    formula,
  ])

  const parsedQuantity = Math.max(1, parseInt(quantity, 10) || 1)

  // Line item preview
  const previewItem = useMemo(() => {
    const baseP = parseFloat(inksterBasePrice) || 0
    const labP = parseFloat(labourInput)
    const miscP = parseFloat(miscInput)
    const customHwP =
      hardwareType === "custom"
        ? parseFloat(customHardwarePrice) || 0
        : undefined

    let upgradeObj: DoorUpgradeOption | undefined = undefined
    if (hasUpgradeOption && upgradeDiff) {
      upgradeObj = {
        enabled: true,
        title: upgradeTitle.trim() || "Option for door",
        inksterPrice: parseFloat(upgradeInksterPrice) || 0,
        netOptionDoorPrice: upgradeDiff.optionNetPrice,
        subtotalDifference: upgradeDiff.subtotalDifference,
        totalWithTaxDifference: upgradeDiff.totalDifference,
      }
    }

    return buildDoorLineItem({
      id: editingItem?.id,
      preset: currentPreset,
      customDescription:
        customDescription.trim() ||
        currentPreset.description?.trim() ||
        currentPreset.label,
      category: doorType,
      inksterBasePrice: baseP,
      quantity: parsedQuantity,
      unitLabour: isNaN(labP) ? currentPreset.labour : labP,
      unitMisc: isNaN(miscP) ? currentPreset.misc : miscP,
      hardwareType,
      customHardwareName:
        hardwareType === "custom" ? customHardwareName : undefined,
      customHardwarePrice: customHwP,
      formula,
      upgradeOption: upgradeObj,
      notes,
    })
  }, [
    editingItem,
    currentPreset,
    customDescription,
    doorType,
    inksterBasePrice,
    parsedQuantity,
    labourInput,
    miscInput,
    hardwareType,
    customHardwareName,
    customHardwarePrice,
    formula,
    hasUpgradeOption,
    upgradeTitle,
    upgradeInksterPrice,
    upgradeDiff,
    notes,
  ])

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    const baseP = parseFloat(inksterBasePrice) || 0
    if (baseP <= 0) {
      toast.error("Please enter a valid Inkster base price")
      return
    }
    onSaveItem(previewItem)
    toast.success(
      editingItem ? "Door updated successfully" : "Door added to quote"
    )
    if (!editingItem) {
      setInksterBasePrice("")
      setQuantity("1")
      setHasUpgradeOption(false)
      setNotes("")
    }
  }

  const handleResetClick = () => {
    if (onResetQuote) {
      onResetQuote()
    } else {
      setInksterBasePrice("")
      setQuantity("1")
      setHasUpgradeOption(false)
      setHardwareType(mode === "supply_only" ? "none" : "standard")
      setNotes("")
      toast.info("Door form reset")
    }
  }

  return {
    doorType,
    handleDoorTypeChange,
    typeOptions,
    selectedPresetId,
    handleOptionChange,
    customDescription,
    setCustomDescription,
    quantity,
    setQuantity,
    inksterBasePrice,
    setInksterBasePrice,
    labourInput,
    setLabourInput,
    miscInput,
    setMiscInput,
    hardwareType,
    setHardwareType,
    customHardwareName,
    setCustomHardwareName,
    customHardwarePrice,
    setCustomHardwarePrice,
    hasUpgradeOption,
    setHasUpgradeOption,
    upgradeTitle,
    setUpgradeTitle,
    upgradeInksterPrice,
    setUpgradeInksterPrice,
    upgradeDiff,
    parsedQuantity,
    previewItem,
    handleSubmit,
    handleResetClick,
    currentPreset,
  }
}
