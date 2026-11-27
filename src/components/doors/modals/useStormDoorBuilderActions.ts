"use client"

import { toast } from "sonner"
import {
  StormDoorCatalogItem,
  StormDoorVentType,
  StormDoorSwing,
  StormDoorAddonOption,
} from "@/lib/doors/storm-door-types"
import {
  buildStormDoorOptionLabel,
  buildStormDoorAddonOptionLabel,
} from "@/lib/doors/storm-door-catalog"
import {
  readSessionCustomOptions,
  writeSessionCustomOptions,
  type CustomQuoteOption,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

export interface UseStormDoorBuilderActionsProps {
  calculationTotalPrice: number
  fullCalculationTotalPrice: number
  fullDesc: string
  optionAddonIds: string[]
  selectedAddons: string[]
  addons: StormDoorAddonOption[]
  currentItem: StormDoorCatalogItem
  ventType: StormDoorVentType
  swing: StormDoorSwing
  onSelect: (result: { basePrice: number; description: string }) => void
  onClose: () => void
}

export function useStormDoorBuilderActions({
  calculationTotalPrice,
  fullCalculationTotalPrice,
  fullDesc,
  optionAddonIds,
  selectedAddons,
  addons,
  currentItem,
  ventType,
  swing,
  onSelect,
  onClose,
}: UseStormDoorBuilderActionsProps) {
  const handleApply = () => {
    onSelect({ basePrice: calculationTotalPrice, description: fullDesc })

    if (optionAddonIds.length > 0) {
      const existingOpts = readSessionCustomOptions("door")
      const newOpts: CustomQuoteOption[] = optionAddonIds.map((id) => {
        const ad = addons.find((a) => a.id === id)
        const label = ad?.label || "Upgrade"
        const optTitle = buildStormDoorAddonOptionLabel(label, ad?.price || 0)
        return {
          id: `storm-addon-opt-${id}-${Date.now()}`,
          title: optTitle,
          amountPreTaxCents: Math.round((ad?.price || 0) * 100),
        }
      })
      writeSessionCustomOptions([...existingOpts, ...newOpts], "door")
      toast.success(`Door added + registered ${newOpts.length} quote option(s)!`)
    } else {
      toast.success("Applied storm door to quote")
    }
    onClose()
  }

  const handleAddAsQuoteOption = () => {
    const existingOpts = readSessionCustomOptions("door")
    const optTitle = buildStormDoorOptionLabel(
      currentItem,
      { ventType, swing, selectedAddonIds: selectedAddons },
      fullCalculationTotalPrice
    )
    const newOpt: CustomQuoteOption = {
      id: `storm-door-opt-${Date.now()}`,
      title: optTitle,
      amountPreTaxCents: Math.round(fullCalculationTotalPrice * 100),
    }
    writeSessionCustomOptions([...existingOpts, newOpt], "door")
    toast.success(`Added quote option: ${optTitle}`)
    onClose()
  }

  return { handleApply, handleAddAsQuoteOption }
}
