"use client"

import React from "react"
import { toast } from "sonner"
import {
  SealedUnitItemBuilder,
  SealedUnitLineItemsTable,
  SealedUnitLabourTravelCard,
  SealedUnitQuoteSummaryCard,
  SealedUnitOfficePricingCard,
} from "@/components/sealed-units"
import { SealedUnitsCalculatorPageState } from "@/hooks/sealed-units"

export interface SealedUnitsWorkspaceColumnsProps {
  page: SealedUnitsCalculatorPageState
}

export function SealedUnitsWorkspaceColumns({
  page,
}: SealedUnitsWorkspaceColumnsProps) {
  const {
    user,
    drafts,
    builder,
    travel,
    settings,
    reviewLoader,
    lineItems,
    totals,
    handleStartNewQuote,
    handleOpenSubmitModal,
    handlePrint,
  } = page

  return (
    <div className="grid grid-cols-1 items-start gap-3.5 lg:grid-cols-12">
      {/* Left Column (7 cols): Builder, Table, Travel */}
      <div className="space-y-3.5 lg:col-span-7">
        <SealedUnitItemBuilder
          customerName={drafts.customerName}
          setCustomerName={drafts.setCustomerName}
          quoteNumber={drafts.quoteNumber}
          setQuoteNumber={drafts.setQuoteNumber}
          onRegenerateQuoteNumber={() =>
            drafts.setQuoteNumber(drafts.generateQuoteNumber())
          }
          {...builder}
          grills={settings.grills}
          onResetQuote={handleStartNewQuote}
          onSaveDraft={drafts.handleSaveDraft}
          onOpenSavedQuotes={() => drafts.setIsSavedQuotesOpen(true)}
          savedDraftsCount={drafts.savedDraftsCount}
          isReadOnly={reviewLoader.isReadOnly}
        />

        <SealedUnitLineItemsTable
          lineItems={lineItems}
          isInstallation={travel.isInstallation}
          mode={travel.sealedUnitMode}
          labourRate={totals.effectiveLabourRate}
          miscRate={totals.effectiveMiscRate}
          labourMin={settings.labour.labourMinPerUnit ?? 120.0}
          editingItemId={builder.editingItem?.id}
          onEditItem={builder.handleEditItem}
          onDuplicateItem={builder.handleDuplicateItem}
          onRemoveItem={builder.handleRemoveItem}
          onResetQuote={handleStartNewQuote}
          isReadOnly={reviewLoader.isReadOnly}
        />

        <SealedUnitLabourTravelCard
          mode={travel.sealedUnitMode}
          setMode={travel.handleSetSealedUnitMode}
          isInstallation={travel.isInstallation}
          setIsInstallation={travel.setIsInstallation}
          labour={settings.labour}
          regions={travel.regions}
          selectedRegionId={travel.selectedRegionId}
          onSelectRegion={travel.setSelectedRegionId}
          travelFeeType={travel.travelFeeType}
          setTravelFeeType={travel.setTravelFeeType}
          customTravelFee={travel.customTravelFee}
          setCustomTravelFee={travel.setCustomTravelFee}
          showOutTownTravel={travel.showOutTownTravel}
          setShowOutTownTravel={travel.setShowOutTownTravel}
          travelKm={travel.travelKm}
          setTravelKm={travel.setTravelKm}
          crewHours={travel.crewHours}
          setCrewHours={travel.setCrewHours}
          crewSize={travel.crewSize}
          setCrewSize={travel.setCrewSize}
          extraLabour={travel.extraLabour}
          setExtraLabour={travel.setExtraLabour}
          globalUpcharges={travel.globalUpcharges}
          setGlobalUpcharges={travel.setGlobalUpcharges}
          serviceSqftInput={travel.serviceSqftInput}
          setServiceSqftInput={travel.setServiceSqftInput}
          serviceLabourRateInput={travel.serviceLabourRateInput}
          setServiceLabourRateInput={travel.setServiceLabourRateInput}
          serviceMiscRateInput={travel.serviceMiscRateInput}
          setServiceMiscRateInput={travel.setServiceMiscRateInput}
          itemsSqft={totals.itemsSqft || 0}
          totals={totals}
          isReadOnly={reviewLoader.isReadOnly}
        />
      </div>

      {/* Right Column (5 cols, sticky): Quote Summary */}
      <div className="space-y-3.5 lg:sticky lg:top-4 lg:col-span-5">
        <SealedUnitQuoteSummaryCard
          lineItems={lineItems}
          lineItemsCount={lineItems.length}
          mode={travel.sealedUnitMode}
          onModeChange={travel.handleSetSealedUnitMode}
          isInstallation={travel.isInstallation}
          labour={settings.labour}
          hstRate={travel.hstRate}
          setHstRate={travel.setHstRate}
          totals={totals}
          customerName={drafts.customerName}
          quoteNumber={drafts.quoteNumber}
          quoteNotes={drafts.quoteNotes}
          setQuoteNotes={drafts.setQuoteNotes}
          user={user}
          onOpenSubmitModal={handleOpenSubmitModal}
          onPrint={handlePrint}
          onResetQuote={handleStartNewQuote}
          onSaveDraft={drafts.handleSaveDraft}
          onOpenSavedQuotes={() => drafts.setIsSavedQuotesOpen(true)}
          attachedWindowQuote={drafts.attachedWindowQuote}
          attachedDoorQuote={drafts.attachedDoorQuote}
          onOpenAttachModal={() => drafts.setIsAttachModalOpen(true)}
          onRemoveAttachedWindowQuote={() => {
            drafts.setAttachedWindowQuote(null)
            toast.info("Detached Window Quote")
          }}
          onRemoveAttachedDoorQuote={() => {
            drafts.setAttachedDoorQuote(null)
            toast.info("Detached Door Quote")
          }}
          isReadOnly={reviewLoader.isReadOnly}
          isReviewMode={Boolean(reviewLoader.reviewQuote)}
        />

        <SealedUnitOfficePricingCard
          lineItems={lineItems}
          totals={totals}
          formula={settings.formula}
          labour={settings.labour}
          isInstallation={travel.isInstallation}
          isServiceOnly={travel.isServiceOnly}
          travelKm={travel.travelKm}
          crewHours={travel.crewHours}
          crewSize={travel.crewSize}
        />
      </div>
    </div>
  )
}
