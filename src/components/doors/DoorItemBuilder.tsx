"use client"

import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DoorPreset,
  DoorFormulaSettings,
  DoorLineItem,
  DoorQuotingMode,
  DoorCategory,
} from "@/lib/doors/types"
import { Plus, DoorClosed, CheckCircle2, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  DoorHardwareSection,
  DoorUpgradeSection,
  DoorPresetSpecsSection,
  useDoorItemForm,
} from "./builder"
import { StormDoorSelectorModal } from "./modals/StormDoorSelectorModal"

interface DoorItemBuilderProps {
  customerName?: string
  setCustomerName?: (name: string) => void
  quoteNumber?: string
  setQuoteNumber?: (num: string) => void
  mode?: DoorQuotingMode
  presets: DoorPreset[]
  formula: DoorFormulaSettings
  lineItems?: DoorLineItem[]
  editingItem?: DoorLineItem | null
  onSaveItem: (item: DoorLineItem) => void
  onCancelEdit?: () => void
  onResetQuote?: () => void
  isReadOnly?: boolean
  className?: string
}

export function DoorItemBuilder({
  customerName = "",
  setCustomerName,
  quoteNumber = "",
  setQuoteNumber,
  mode = "installation",
  presets,
  formula,
  lineItems = [],
  editingItem,
  onSaveItem,
  onCancelEdit,
  onResetQuote,
  isReadOnly = false,
  className,
}: DoorItemBuilderProps) {
  const [isStormModalOpen, setIsStormModalOpen] = useState(false)
  const hasOtherDoorsInQuote = lineItems.some(
    (it) => it.id !== editingItem?.id && it.category !== "storm"
  )

  const form = useDoorItemForm({
    presets,
    formula,
    editingItem,
    mode,
    hasOtherDoorsInQuote,
    onSaveItem,
    onResetQuote,
  })

  const handleDoorTypeChangeWithModal = (newType: DoorCategory) => {
    form.handleDoorTypeChange(newType)
    if (newType === "storm" && !editingItem) {
      setIsStormModalOpen(true)
    }
  }

  return (
    <Card
      className={cn(
        "!gap-0 border-border bg-card/70 !py-0 shadow-md backdrop-blur-md [--card-spacing:0px]",
        className
      )}
    >
      <CardHeader className="border-b border-border/50 p-3.5 !pb-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
              <DoorClosed className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold sm:text-base">
                {editingItem ? "Edit Door Unit" : "Configure Door Unit"}
              </CardTitle>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {editingItem && onCancelEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onCancelEdit}
                className="h-7 px-2 text-xs"
              >
                Cancel Edit
              </Button>
            )}

            {!isReadOnly && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={form.handleResetClick}
                className="h-7 cursor-pointer gap-1 px-2 text-xs text-foreground hover:bg-muted"
                title="Start a new quote"
              >
                <Plus className="h-3 w-3 text-primary" />
                <span>New</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Customer Name & Quote Number Header Section */}
      {setCustomerName && setQuoteNumber && (
        <div className="grid grid-cols-1 gap-3 border-b border-border/40 bg-muted/20 px-3.5 py-2 sm:px-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Quote/Order Number
            </Label>
            <Input
              value={quoteNumber}
              disabled={isReadOnly}
              onChange={(e) => setQuoteNumber(e.target.value)}
              placeholder="Quote #"
              className="h-8.5 bg-background font-mono text-xs shadow-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Customer Name
            </Label>
            <Input
              value={customerName}
              disabled={isReadOnly}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Customer Name"
              className="h-8.5 bg-background text-xs shadow-xs"
            />
          </div>
        </div>
      )}

      <CardContent className="p-3.5 !pt-2.5">
        <form onSubmit={form.handleSubmit} className="space-y-2.5">
          <fieldset disabled={isReadOnly} className="space-y-2.5 border-0 p-0 m-0">
          <DoorPresetSpecsSection
            doorType={form.doorType}
            onDoorTypeChange={handleDoorTypeChangeWithModal}
            typeOptions={form.typeOptions}
            selectedPresetId={form.selectedPresetId}
            onOptionChange={form.handleOptionChange}
            quantity={form.quantity}
            setQuantity={form.setQuantity}
            inksterBasePrice={form.inksterBasePrice}
            setInksterBasePrice={form.setInksterBasePrice}
            labourInput={form.labourInput}
            setLabourInput={form.setLabourInput}
            miscInput={form.miscInput}
            setMiscInput={form.setMiscInput}
            hardwareType={form.hardwareType}
            setHardwareType={form.setHardwareType}
            customDescription={form.customDescription}
            setCustomDescription={form.setCustomDescription}
            currentPreset={form.currentPreset}
            onOpenStormModal={() => setIsStormModalOpen(true)}
          />

          <DoorHardwareSection
            hardwareType={form.hardwareType}
            customHardwareName={form.customHardwareName}
            setCustomHardwareName={form.setCustomHardwareName}
            customHardwarePrice={form.customHardwarePrice}
            setCustomHardwarePrice={form.setCustomHardwarePrice}
          />

          <DoorUpgradeSection
            hasUpgradeOption={form.hasUpgradeOption}
            setHasUpgradeOption={form.setHasUpgradeOption}
            upgradeTitle={form.upgradeTitle}
            setUpgradeTitle={form.setUpgradeTitle}
            upgradeInksterPrice={form.upgradeInksterPrice}
            setUpgradeInksterPrice={form.setUpgradeInksterPrice}
            upgradeDiff={form.upgradeDiff}
            parsedQuantity={form.parsedQuantity}
          />
          </fieldset>

          {isReadOnly ? (
            <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-center text-xs text-muted-foreground">
              Review Mode (Read-Only) — Click &ldquo;Edit Quote&rdquo; in the top bar to make changes.
            </div>
          ) : (
            <div className="flex items-center gap-2 pt-1">
              <Button
                type="submit"
                className="h-9 flex-1 cursor-pointer gap-1.5 bg-black text-xs font-semibold text-white shadow-sm hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
              >
                {editingItem ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Update Door Unit
                  </>
                ) : (
                  <>
                    <Plus className="h-3.5 w-3.5" />
                    Add Door Unit
                  </>
                )}
              </Button>
              {editingItem && onCancelEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onCancelEdit}
                  className="h-9 px-3 text-xs"
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </form>
      </CardContent>

      <StormDoorSelectorModal
        isOpen={isStormModalOpen}
        onClose={() => setIsStormModalOpen(false)}
        onSelect={(res) => {
          form.setInksterBasePrice(String(res.basePrice))
          form.setCustomDescription(res.description)
        }}
      />
    </Card>
  )
}
