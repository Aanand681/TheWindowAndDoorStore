"use client"

import React from "react"
import {
  DoorItemBuilder,
  DoorLineItemsTable,
  DoorLabourTravelCard,
  DoorQuoteSummaryCard,
  DoorOfficePricingCard,
} from "@/components/doors"
import { DoorCalculatorPageState } from "@/hooks/doors"
import { toast } from "sonner"

export interface DoorWorkspaceColumnsProps {
  page: DoorCalculatorPageState
  onStartNewQuote: () => void
  onApplyDoorHardware: (config: any) => void
}

export function DoorWorkspaceColumns({
  page,
  onStartNewQuote,
  onApplyDoorHardware,
}: DoorWorkspaceColumnsProps) {
  return (
    <div className="grid grid-cols-1 items-start gap-5 sm:gap-6 lg:grid-cols-12">
      {/* Left Column: Item Builder, Items Table, Labour/Travel (8 cols) */}
      <div className="space-y-5 lg:col-span-8">
        <DoorItemBuilder
          customerName={page.customerName}
          setCustomerName={page.setCustomerName}
          quoteNumber={page.quoteNumber}
          setQuoteNumber={page.setQuoteNumber}
          mode={page.mode}
          lineItems={page.lineItems}
          presets={page.presets}
          formula={page.formula}
          editingItem={page.editingItem}
          onSaveItem={page.handleSaveItem}
          onCancelEdit={() => page.setEditingItem(null)}
          onResetQuote={onStartNewQuote}
          isReadOnly={page.isReadOnly}
        />

        <DoorLineItemsTable
          lineItems={page.lineItems}
          mode={page.mode}
          onEdit={page.handleEditItem}
          onDuplicate={page.handleDuplicateItem}
          onDelete={page.handleDeleteItem}
          isReadOnly={page.isReadOnly}
        />

        <DoorLabourTravelCard
          mode={page.mode}
          availableUpcharges={page.upcharges}
          globalUpcharges={page.globalUpcharges}
          onUpdateGlobalUpcharges={page.setGlobalUpcharges}
          regions={page.regions}
          selectedRegionId={page.selectedRegionId}
          onSelectRegion={page.setSelectedRegionId}
          travelFeeType={page.travelFeeType}
          customTravelFee={page.customTravelFee}
          showOutTownTravel={page.showOutTownTravel}
          travelKm={page.travelKm}
          crewHours={page.crewHours}
          crewSize={page.crewSize}
          logistics={page.logistics}
          onUpdateParams={page.handleUpdateTravelParams}
          isReadOnly={page.isReadOnly}
        />
      </div>

      {/* Right Column: Quote Summary & Office Reference (4 cols) */}
      <div className="space-y-5 lg:sticky lg:top-5 lg:col-span-4">
        <DoorQuoteSummaryCard
          customerName={page.customerName}
          quoteNumber={page.quoteNumber}
          lineItems={page.lineItems}
          totals={page.totals}
          mode={page.mode}
          onModeChange={(newMode) => {
            if (newMode !== page.mode) page.setMode(newMode)
          }}
          isFirstNation={page.isFirstNation}
          onToggleFirstNation={page.setIsFirstNation}
          hstRate={page.hstRate}
          setHstRate={page.setHstRate}
          customLabour={page.customLabour}
          setCustomLabour={page.setCustomLabour}
          customMisc={page.customMisc}
          setCustomMisc={page.setCustomMisc}
          customDiscount={page.customDiscount}
          setCustomDiscount={page.setCustomDiscount}
          onSubmitQuote={() => page.setShowSubmitModal(true)}
          onPrintPreview={() => page.setShowPreviewModal(true)}
          isAdmin={page.isAdmin}
          attachedWindowQuote={page.attachedWindowQuote}
          attachedSealedUnit={page.attachedSealedUnit}
          onOpenAttachModal={() => page.setIsAttachModalOpen(true)}
          onRemoveAttachedWindowQuote={() => {
            page.setAttachedWindowQuote(null)
            toast.info("Detached window quote.")
          }}
          onRemoveAttachedSealedUnit={() => {
            page.setAttachedSealedUnit(null)
            toast.info("Detached sealed unit quote.")
          }}
          onApplyDoorHardware={onApplyDoorHardware}
          isReadOnly={page.isReadOnly}
          isReviewMode={Boolean(page.reviewQuote)}
        />

        <DoorOfficePricingCard
          totals={page.totals}
          lineItems={page.lineItems}
          mode={page.mode}
        />
      </div>
    </div>
  )
}
