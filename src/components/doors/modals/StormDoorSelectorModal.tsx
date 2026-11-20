"use client"

import React, { useState, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import { X, Check, ShieldCheck, DoorClosed, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  StormDoorStyle,
  StormDoorProfile,
  StormDoorVentType,
  StormDoorSwing,
  PapaizFinish,
} from "@/lib/doors/storm-door-types"
import {
  computeStormDoorPrice,
  buildStormDoorDescription,
} from "@/lib/doors/storm-door-catalog"
import {
  readSessionCustomOptions,
  writeSessionCustomOptions,
  type CustomQuoteOption,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import { useStormDoorCatalog } from "@/hooks/doors/useStormDoorCatalog"
import { StormDoorStyleGrid } from "./StormDoorStyleGrid"
import { StormDoorOptionsPane } from "./StormDoorOptionsPane"

export interface StormDoorSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (result: { basePrice: number; description: string }) => void
}

export function StormDoorSelectorModal({
  isOpen,
  onClose,
  onSelect,
}: StormDoorSelectorModalProps) {
  const [mounted, setMounted] = useState(false)
  const { models, addons, rules } = useStormDoorCatalog()

  const [style, setStyle] = useState<StormDoorStyle>("self_storing")
  const [profile, setProfile] = useState<StormDoorProfile>('2"')
  const [ventType, setVentType] = useState<StormDoorVentType>("hidden_vent")
  const [swing, setSwing] = useState<StormDoorSwing>("outswing")
  const [color, setColor] = useState<string>("White")
  const [isCustomPaint, setIsCustomPaint] = useState<boolean>(false)
  const [isDoubleDoorCustomPaint, setIsDoubleDoorCustomPaint] = useState<boolean>(false)
  const [papaizFinish, setPapaizFinish] = useState<PapaizFinish>("Satin Chrome")
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])
  const [addonModes, setAddonModes] = useState<Record<string, "included" | "option">>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  const currentItem = useMemo(() => {
    if (style === "project_self_storing") {
      return models.find((i) => i.style === "project_self_storing") || models[0]
    }
    const matched = models.find((i) => i.style === style && i.profile === profile)
    return matched || models.find((i) => i.style === style) || models[0]
  }, [models, style, profile])

  const colorList = useMemo(() => {
    if (style === "project_self_storing") return rules.colorsProject
    return currentItem.profile === '2-1/4"' ? rules.colors2QuarterInch : rules.colors2Inch
  }, [style, currentItem, rules])

  const includedAddonIds = useMemo(
    () => selectedAddons.filter((id) => addonModes[id] !== "option"),
    [selectedAddons, addonModes]
  )

  const optionAddonIds = useMemo(
    () => selectedAddons.filter((id) => addonModes[id] === "option"),
    [selectedAddons, addonModes]
  )

  const calculation = useMemo(() => {
    return computeStormDoorPrice(currentItem, {
      ventType, swing, color, isCustomPaint, isDoubleDoorCustomPaint,
      selectedAddonIds: includedAddonIds, availableAddons: addons,
    })
  }, [currentItem, ventType, swing, color, isCustomPaint, isDoubleDoorCustomPaint, includedAddonIds, addons])

  const fullCalculation = useMemo(() => {
    return computeStormDoorPrice(currentItem, {
      ventType, swing, color, isCustomPaint, isDoubleDoorCustomPaint,
      selectedAddonIds: selectedAddons, availableAddons: addons,
    })
  }, [currentItem, ventType, swing, color, isCustomPaint, isDoubleDoorCustomPaint, selectedAddons, addons])

  const fullDesc = useMemo(() => {
    return buildStormDoorDescription(currentItem, {
      ventType, swing, color, isCustomPaint, isDoubleDoorCustomPaint,
      papaizFinish, selectedAddonIds: includedAddonIds, availableAddons: addons,
    })
  }, [currentItem, ventType, swing, color, isCustomPaint, isDoubleDoorCustomPaint, papaizFinish, includedAddonIds, addons])

  if (!isOpen || !mounted) return null

  const handleApply = () => {
    onSelect({ basePrice: calculation.totalPrice, description: fullDesc })

    if (optionAddonIds.length > 0) {
      const existingOpts = readSessionCustomOptions()
      const newOpts: CustomQuoteOption[] = optionAddonIds.map((id) => {
        const ad = addons.find((a) => a.id === id)
        return {
          id: `storm-addon-opt-${id}-${Date.now()}`,
          title: `Option: Add ${ad?.label || "Upgrade"} (${currentItem.name})`,
          amountPreTaxCents: Math.round((ad?.price || 0) * 100),
        }
      })
      writeSessionCustomOptions([...existingOpts, ...newOpts])
      toast.success(`Door added + registered ${newOpts.length} quote option(s)!`)
    } else {
      toast.success("Applied storm door to quote")
    }
    onClose()
  }

  const handleAddAsQuoteOption = () => {
    const existingOpts = readSessionCustomOptions()
    const allDesc = buildStormDoorDescription(currentItem, {
      ventType, swing, color, isCustomPaint, isDoubleDoorCustomPaint,
      papaizFinish, selectedAddonIds: selectedAddons, availableAddons: addons,
    })
    const newOpt: CustomQuoteOption = {
      id: `storm-door-opt-${Date.now()}`,
      title: `Option: ${allDesc}`,
      amountPreTaxCents: Math.round(fullCalculation.totalPrice * 100),
    }
    writeSessionCustomOptions([...existingOpts, newOpt])
    toast.success(`Added storm door as Quote Option ($${fullCalculation.totalPrice.toFixed(2)})`)
    onClose()
  }

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const setAddonMode = (id: string, mode: "included" | "option") => {
    setAddonModes((prev) => ({ ...prev, [id]: mode }))
  }

  const handleSelectStyle = (st: StormDoorStyle) => {
    setStyle(st)
    if (st === "project_self_storing") {
      setProfile('1-1/4"')
      setVentType("standard")
    } else if (profile === '1-1/4"') {
      setProfile('2"')
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex h-[88vh] max-h-[840px] w-full max-w-4xl flex-col rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <DoorClosed className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">York Aluminum Storm Doors</h3>
              <p className="text-xs text-muted-foreground">Official Manufacturer Catalog &amp; Options</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-right">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">Base Price:</span>
              <span className="font-mono text-base font-black text-emerald-600 dark:text-emerald-400">
                ${calculation.totalPrice.toFixed(2)}
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border/60 overflow-hidden">
          <StormDoorStyleGrid style={style} onSelectStyle={handleSelectStyle} />

          <StormDoorOptionsPane
            style={style}
            currentItem={currentItem}
            profile={profile}
            setProfile={setProfile}
            ventType={ventType}
            setVentType={setVentType}
            swing={swing}
            setSwing={setSwing}
            color={color}
            setColor={setColor}
            colorList={colorList}
            isCustomPaint={isCustomPaint}
            setIsCustomPaint={setIsCustomPaint}
            isDoubleDoorCustomPaint={isDoubleDoorCustomPaint}
            setIsDoubleDoorCustomPaint={setIsDoubleDoorCustomPaint}
            papaizFinish={papaizFinish}
            setPapaizFinish={setPapaizFinish}
            selectedAddons={selectedAddons}
            toggleAddon={toggleAddon}
            addonModes={addonModes}
            setAddonMode={setAddonMode}
            availableAddons={addons}
          />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-20 shrink-0 border-t border-border/60 bg-card px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="space-y-0.5 text-center sm:text-left flex-1 min-w-0 pr-2">
            <div className="text-xs font-semibold text-foreground truncate">{fullDesc}</div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Standard 8% surcharge applies • 0% discount</span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddAsQuoteOption}
              className="h-9 px-3 text-xs font-bold gap-1.5 border-amber-500/50 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>Add as Quote Option (${fullCalculation.totalPrice.toFixed(2)})</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="h-9 px-4 text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Check className="h-4 w-4" />
              <span>Apply to Door Quote (${calculation.totalPrice.toFixed(2)})</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
