"use client"

import React, { useState, useMemo } from "react"
import { X, Check, ShieldCheck, DoorClosed } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  StormDoorStyle,
  StormDoorProfile,
  StormDoorVentType,
  StormDoorSwing,
} from "@/lib/doors/storm-door-types"
import {
  YORK_STORM_DOORS,
  STYLE_STARTING_PRICES,
  computeStormDoorPrice,
  buildStormDoorDescription,
  COLORS_2_INCH,
  COLORS_2_QUARTER_INCH,
  COLORS_PROJECT,
} from "@/lib/doors/storm-door-catalog"
import { StormDoorGraphic } from "../storm/StormDoorGraphics"
import { StormDoorOptionsPane } from "./StormDoorOptionsPane"

export interface StormDoorSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (result: { basePrice: number; description: string }) => void
}

const STYLES_LIST: { id: StormDoorStyle; label: string }[] = [
  { id: "self_storing", label: "Self-Storing" },
  { id: "hi_view", label: "Hi-View" },
  { id: "extended_view", label: "Extended-View" },
  { id: "full_view", label: "Full-View" },
  { id: "one_lite", label: "One-Lite" },
  { id: "tri_lite", label: "Tri-Lite" },
  { id: "true_view_half", label: "True-View 1/2" },
  { id: "true_view_three_quarter", label: "True-View 3/4" },
  { id: "project_self_storing", label: '1 1/4" Self Storing' },
]

export function StormDoorSelectorModal({
  isOpen,
  onClose,
  onSelect,
}: StormDoorSelectorModalProps) {
  const [style, setStyle] = useState<StormDoorStyle>("self_storing")
  const [profile, setProfile] = useState<StormDoorProfile>('2"')
  const [ventType, setVentType] = useState<StormDoorVentType>("hidden_vent")
  const [swing, setSwing] = useState<StormDoorSwing>("outswing")
  const [color, setColor] = useState<string>("White")
  const [isCustomPaint, setIsCustomPaint] = useState<boolean>(false)
  const [selectedAddons, setSelectedAddons] = useState<string[]>([])

  const currentItem = useMemo(() => {
    if (style === "project_self_storing") {
      return YORK_STORM_DOORS.find((i) => i.style === "project_self_storing")!
    }
    const matched = YORK_STORM_DOORS.find(
      (i) => i.style === style && i.profile === profile
    )
    return matched || YORK_STORM_DOORS.find((i) => i.style === style) || YORK_STORM_DOORS[0]
  }, [style, profile])

  const colorList = useMemo(() => {
    if (style === "project_self_storing") return COLORS_PROJECT
    return currentItem.profile === '2-1/4"' ? COLORS_2_QUARTER_INCH : COLORS_2_INCH
  }, [style, currentItem])

  const calculation = useMemo(() => {
    return computeStormDoorPrice(currentItem, {
      ventType,
      swing,
      color,
      isCustomPaint,
      selectedAddonIds: selectedAddons,
    })
  }, [currentItem, ventType, swing, color, isCustomPaint, selectedAddons])

  const fullDesc = useMemo(() => {
    return buildStormDoorDescription(currentItem, {
      ventType,
      swing,
      color,
      isCustomPaint,
      selectedAddonIds: selectedAddons,
    })
  }, [currentItem, ventType, swing, color, isCustomPaint, selectedAddons])

  if (!isOpen) return null

  const handleApply = () => {
    onSelect({ basePrice: calculation.totalPrice, description: fullDesc })
    onClose()
  }

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-3 sm:p-6 backdrop-blur-md animate-in fade-in duration-150">
      <div className="flex h-[88vh] max-h-[820px] w-full max-w-4xl flex-col rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden">
        {/* Header with Title on Left, Live Price & Close on Right */}
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/30 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <DoorClosed className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                York Aluminum Storm Doors
              </h3>
              <p className="text-xs text-muted-foreground">
                Official Manufacturer Catalog &amp; Fixed Pricing
              </p>
            </div>
          </div>

          {/* Top Right: Live Price Highlight & Close Button */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-right">
              <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                Price:
              </span>
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

        {/* Modal Body: with min-h-0 and internal scroll */}
        <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border/60 overflow-hidden">
          {/* Left Column: Style Grid with starting prices */}
          <div className="p-4 md:col-span-5 overflow-y-auto space-y-3">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Select Door Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {STYLES_LIST.map((st) => {
                const isSel = style === st.id
                const startPrice = STYLE_STARTING_PRICES[st.id]
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      setStyle(st.id)
                      if (st.id === "project_self_storing") {
                        setProfile('1-1/4"')
                        setVentType("standard")
                      } else if (profile === '1-1/4"') {
                        setProfile('2"')
                      }
                    }}
                    className={`flex flex-col items-center justify-between rounded-xl border p-2 text-center transition-all ${
                      isSel
                        ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                        : "border-border/70 bg-background/50 hover:border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="h-16 w-10 py-1">
                      <StormDoorGraphic style={st.id} />
                    </div>
                    <span className="mt-1 text-[11px] font-bold line-clamp-1">
                      {st.label}
                    </span>
                    <span className="mt-0.5 rounded bg-muted/60 px-1.5 py-0.2 font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      From ${startPrice.toFixed(0)}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

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
            selectedAddons={selectedAddons}
            toggleAddon={toggleAddon}
          />
        </div>

        {/* Footer: pinned at bottom, action buttons in bottom right */}
        <div className="sticky bottom-0 z-20 shrink-0 border-t border-border/60 bg-card px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="space-y-0.5 text-center sm:text-left flex-1 min-w-0 pr-2">
            <div className="text-xs font-semibold text-foreground truncate">
              {fullDesc}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Standard 8% surcharge applies • 0% discount</span>
            </div>
          </div>

          {/* Bottom Right Corner Action Buttons */}
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-9 px-4 text-xs font-semibold"
            >
              Cancel / Close
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleApply}
              className="h-9 px-4 text-xs font-bold gap-1.5 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              <Check className="h-4 w-4" />
              Apply to Quote (${calculation.totalPrice.toFixed(2)})
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
