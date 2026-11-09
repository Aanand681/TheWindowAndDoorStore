'use client';

import React, { useState, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { SealedUnitLineItem } from '@/lib/sealed-units-logic';
import { calculateSealedUnitTotals } from '@/lib/sealed-units/calculations';
import {
  SealedUnitItemBuilder,
  SealedUnitLabourTravelCard,
  SealedUnitQuoteSummaryCard,
  SealedUnitLineItemsTable,
  SealedUnitOfficePricingCard,
  SealedUnitTemplateType,
} from '@/components/sealed-units';
import { useSealedUnitsSettings } from '@/hooks/sealed-units/useSealedUnitsSettings';
import { useSealedUnitsTravel } from '@/hooks/sealed-units/useSealedUnitsTravel';
import { useSealedUnitsItemBuilder } from '@/hooks/sealed-units/useSealedUnitsItemBuilder';
import { useSealedUnitsDrafts } from '@/hooks/sealed-units/useSealedUnitsDrafts';
import { useSealedUnitsReviewSubmit } from '@/hooks/sealed-units/useSealedUnitsReviewSubmit';
import { SealedUnitsHeaderBar } from '@/components/sealed-units/page/SealedUnitsHeaderBar';
import { SealedUnitsModalsGroup } from '@/components/sealed-units/page/SealedUnitsModalsGroup';

export default function SealedUnitsCalculatorPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  // 1. Settings & Staff Lists Hook (with SuperAdmin masking)
  const settings = useSealedUnitsSettings();

  // 2. Base Line Items & Travel/Service Hook
  const [lineItems, setLineItems] = useState<SealedUnitLineItem[]>([]);
  const travel = useSealedUnitsTravel();

  // 3. Print & Interactive Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [quoteTemplate, setQuoteTemplate] = useState<SealedUnitTemplateType>('window_style');
  const [quoteFontSize, setQuoteFontSize] = useState<number>(8.5);
  const [quoteSpacing, setQuoteSpacing] = useState<number>(1.0);

  // 4. Financial Calculations
  const totals = useMemo(() => {
    const calc = calculateSealedUnitTotals({
      lineItems,
      ...travel.formInputs,
      labour: settings.labour,
    });
    return { ...calc, isServiceOnly: travel.isServiceOnly };
  }, [lineItems, travel.formInputs, travel.isServiceOnly, settings.labour]);

  // 5. Item Builder Hook
  const builder = useSealedUnitsItemBuilder({
    combos: settings.combos,
    formula: settings.formula,
    labour: settings.labour,
    thicknessBreaks: settings.thicknessBreaks,
    grills: settings.grills,
    setLineItems,
  });

  // 6. Drafts & Auto-Recovery Hook
  const drafts = useSealedUnitsDrafts({
    lineItems,
    setLineItems,
    formInputs: travel.formInputs,
    formSetters: travel.formSetters,
    totals,
  });

  // 7. Review & Submit Hook
  const review = useSealedUnitsReviewSubmit({
    user,
    quoteNumber: drafts.quoteNumber,
    customerName: drafts.customerName,
    quoteNotes: drafts.quoteNotes,
    lineItems,
    isInstallation: travel.isInstallation,
    isServiceOnly: travel.isServiceOnly,
    hstRate: travel.hstRate,
    totals,
    assignedReviewer: settings.assignedReviewer,
    selectedOdooClerk: settings.selectedOdooClerk,
  });

  const handlePrint = () => {
    if (
      lineItems.length === 0 &&
      !(travel.isServiceOnly && (totals.totalSqft || 0) > 0) &&
      !drafts.attachedWindowQuote &&
      !drafts.attachedDoorQuote
    ) {
      toast.error('Add at least one line item, enter service sq ft, or attach a quote before previewing.');
      return;
    }
    setIsPreviewOpen(true);
  };

  const handleOpenSubmitModal = () => {
    if (!drafts.quoteNumber.trim() || !drafts.customerName.trim()) {
      toast.error('Please enter a Customer Name and Quote Number before submitting!');
      return;
    }
    if (lineItems.length === 0 && !(travel.isServiceOnly && (totals.totalSqft || 0) > 0)) {
      toast.error('Add at least one line item or enter service sq ft before submitting!');
      return;
    }
    const otherReviewers = settings.staffList.filter(
      (s) => s.username?.toLowerCase() !== user?.username?.toLowerCase()
    );
    if (
      otherReviewers.length > 0 &&
      (!settings.assignedReviewer ||
        settings.assignedReviewer.toLowerCase() === user?.username?.toLowerCase() ||
        settings.assignedReviewer === 'Admin')
    ) {
      settings.setAssignedReviewer(otherReviewers[0].username);
    }
    if (!settings.selectedOdooClerk && settings.clerkList.length > 0) {
      const defaultClerk = settings.clerkList.find((c) => c.department === 'CLERK') || settings.clerkList[0];
      if (defaultClerk) settings.setSelectedOdooClerk(defaultClerk.username);
    }
    review.setShowSubmitModal(true);
  };

  return (
    <>
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 su-no-print">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

        <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-10 relative z-10 space-y-4">
          <SealedUnitsHeaderBar
            user={user}
            lastSavedAt={drafts.lastSavedAt}
            hasAttachedQuote={Boolean(drafts.attachedWindowQuote || drafts.attachedDoorQuote)}
            savedDraftsCount={drafts.savedDraftsCount}
            onOpenAttachModal={() => drafts.setIsAttachModalOpen(true)}
            onSaveDraft={drafts.handleSaveDraft}
            onOpenSavedQuotes={() => drafts.setIsSavedQuotesOpen(true)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
            {/* Left Column (7 cols): Builder, Table, Travel */}
            <div className="lg:col-span-7 space-y-3.5">
              <SealedUnitItemBuilder
                customerName={drafts.customerName}
                setCustomerName={drafts.setCustomerName}
                quoteNumber={drafts.quoteNumber}
                setQuoteNumber={drafts.setQuoteNumber}
                onRegenerateQuoteNumber={() => drafts.setQuoteNumber(drafts.generateQuoteNumber())}
                {...builder}
                grills={settings.grills}
                onResetQuote={() => drafts.setShowResetModal(true)}
                onSaveDraft={drafts.handleSaveDraft}
                onOpenSavedQuotes={() => drafts.setIsSavedQuotesOpen(true)}
                savedDraftsCount={drafts.savedDraftsCount}
              />

              <SealedUnitLineItemsTable
                lineItems={lineItems}
                isInstallation={travel.isInstallation}
                mode={travel.sealedUnitMode}
                labourRate={totals.effectiveLabourRate}
                miscRate={totals.effectiveMiscRate}
                labourMin={settings.labour.labourMinPerUnit ?? 120.0}
                onRemoveItem={builder.handleRemoveItem}
                onResetQuote={() => drafts.setShowResetModal(true)}
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
                serviceSqftInput={travel.serviceSqftInput}
                setServiceSqftInput={travel.setServiceSqftInput}
                serviceLabourRateInput={travel.serviceLabourRateInput}
                setServiceLabourRateInput={travel.setServiceLabourRateInput}
                serviceMiscRateInput={travel.serviceMiscRateInput}
                setServiceMiscRateInput={travel.setServiceMiscRateInput}
                itemsSqft={totals.itemsSqft || 0}
                totals={totals}
              />
            </div>

            {/* Right Column (5 cols, sticky): Quote Summary */}
            <div className="lg:col-span-5 space-y-3.5 lg:sticky lg:top-4">
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
                onResetQuote={() => drafts.setShowResetModal(true)}
                onSaveDraft={drafts.handleSaveDraft}
                onOpenSavedQuotes={() => drafts.setIsSavedQuotesOpen(true)}
                attachedWindowQuote={drafts.attachedWindowQuote}
                attachedDoorQuote={drafts.attachedDoorQuote}
                onOpenAttachModal={() => drafts.setIsAttachModalOpen(true)}
                onRemoveAttachedWindowQuote={() => {
                  drafts.setAttachedWindowQuote(null);
                  toast.info('Detached Window Quote');
                }}
                onRemoveAttachedDoorQuote={() => {
                  drafts.setAttachedDoorQuote(null);
                  toast.info('Detached Door Quote');
                }}
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
        </div>
      </div>

      <SealedUnitsModalsGroup
        user={user}
        review={review}
        drafts={drafts}
        settings={settings}
        preview={{
          isPreviewOpen,
          setIsPreviewOpen,
          quoteTemplate,
          setQuoteTemplate,
          quoteFontSize,
          setQuoteFontSize,
          quoteSpacing,
          setQuoteSpacing,
        }}
        lineItems={lineItems}
        totals={totals}
        isInstallation={travel.isInstallation}
        regionName={travel.isInstallation ? travel.selectedRegion?.name : undefined}
        hstRate={travel.hstRate}
      />
    </>
  );
}
