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
import { CustomMaterialsCard } from "@/components/shared/materials"
import { WORKSPACE_TWO_COLUMN_GRID_CLASS } from "@/components/shared/summary/layout-classes"

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
    <div className={WORKSPACE_TWO_COLUMN_GRID_CLASS}>
      {/* Left Column: Builder, Table, Travel */}
      <div className="min-w-0 space-y-3.5">
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

        <CustomMaterialsCard
          materials={travel.customMaterials}
          onMaterialsChange={travel.setCustomMaterials}
          isReadOnly={reviewLoader.isReadOnly}
          title="Sealed Unit Additional Materials (Optional)"
          placeholder="e.g. Specialty stops, glazing tape, custom silicone"
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

      {/* Right Column (sticky): Quote Summary */}
      <div className="min-w-0 space-y-3.5 lg:sticky lg:top-4">
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
          loyaltyDiscount={travel.loyaltyDiscount}
          setLoyaltyDiscount={travel.setLoyaltyDiscount}
          loyaltyDiscountLabel={travel.loyaltyDiscountLabel}
          setLoyaltyDiscountLabel={travel.setLoyaltyDiscountLabel}
          discountType={travel.discountType}
          setDiscountType={travel.setDiscountType}
          loyaltyPoints={travel.loyaltyPoints}
          setLoyaltyPoints={travel.setLoyaltyPoints}
          loyaltyGrossAmount={travel.loyaltyGrossAmount}
          setLoyaltyGrossAmount={travel.setLoyaltyGrossAmount}
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
