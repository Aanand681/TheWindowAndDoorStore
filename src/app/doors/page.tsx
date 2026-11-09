'use client';

import React from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import {
  DoorItemBuilder,
  DoorLineItemsTable,
  DoorLabourTravelCard,
  DoorQuoteSummaryCard,
  DoorOfficePricingCard,
} from '@/components/doors';
import QuoteInvoice from '@/components/quotes/QuoteInvoice';
import { toast } from 'sonner';

import { useDoorCalculatorPage } from '@/hooks/doors';
import {
  DoorHeaderBar,
  DoorCustomerInfoBar,
  DoorModalsGroup,
} from '@/components/doors/page';

export default function DoorCalculatorPage() {
  const {
    user,
    isAdmin,
    presets,
    upcharges,
    formula,
    logistics,
    customerName,
    setCustomerName,
    quoteNumber,
    setQuoteNumber,
    mode,
    setMode,
    globalUpcharges,
    setGlobalUpcharges,
    quoteNotes,
    setQuoteNotes,
    isFirstNation,
    setIsFirstNation,
    customLabour,
    setCustomLabour,
    customMisc,
    setCustomMisc,
    attachedWindowQuote,
    setAttachedWindowQuote,
    attachedSealedUnit,
    setAttachedSealedUnit,
    quoteTemplate,
    setQuoteTemplate,
    quoteFontSize,
    setQuoteFontSize,
    quoteSpacing,
    setQuoteSpacing,
    showPreviewModal,
    setShowPreviewModal,
    isAttachModalOpen,
    setIsAttachModalOpen,
    lineItems,
    editingItem,
    setEditingItem,
    handleSaveItem,
    handleEditItem,
    handleDuplicateItem,
    handleDeleteItem,
    travelFeeType,
    customTravelFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
    handleUpdateTravelParams,
    totals,
    lastSavedAt,
    savedDraftsCount,
    isSavedQuotesOpen,
    setIsSavedQuotesOpen,
    showResetModal,
    setShowResetModal,
    handleExplicitSaveDraft,
    handleLoadQuoteFromDrafts,
    handleConfirmReset,
    showSubmitModal,
    setShowSubmitModal,
    submittingQuote,
    assignedReviewer,
    setAssignedReviewer,
    selectedOdooClerk,
    setSelectedOdooClerk,
    adminSubmitMode,
    setAdminSubmitMode,
    preparerNotes,
    setPreparerNotes,
    staffList,
    clerkList,
    handleSubmitQuote,
  } = useDoorCalculatorPage();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-16 relative z-10 space-y-5">
        <AppHeader currentPath="/doors" />

        {/* Page Top Header Bar */}
        <DoorHeaderBar
          lastSavedAt={lastSavedAt}
          attachedWindowQuote={attachedWindowQuote}
          attachedSealedUnit={attachedSealedUnit}
          savedDraftsCount={savedDraftsCount}
          isAdmin={isAdmin}
          onOpenAttach={() => setIsAttachModalOpen(true)}
          onSaveDraft={handleExplicitSaveDraft}
          onOpenSavedQuotes={() => setIsSavedQuotesOpen(true)}
          onOpenReset={() => setShowResetModal(true)}
        />

        {/* Customer Info Bar */}
        <DoorCustomerInfoBar
          customerName={customerName}
          setCustomerName={setCustomerName}
          quoteNumber={quoteNumber}
          setQuoteNumber={setQuoteNumber}
        />

        {/* Main Work Area: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* Left Column: Item Builder, Items Table, Labour/Travel (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <DoorItemBuilder
              presets={presets}
              formula={formula}
              editingItem={editingItem}
              onSaveItem={handleSaveItem}
              onCancelEdit={() => setEditingItem(null)}
              onResetQuote={() => setShowResetModal(true)}
            />

            <DoorLineItemsTable
              lineItems={lineItems}
              mode={mode}
              onEdit={handleEditItem}
              onDuplicate={handleDuplicateItem}
              onDelete={handleDeleteItem}
            />

            <DoorLabourTravelCard
              mode={mode}
              availableUpcharges={upcharges}
              globalUpcharges={globalUpcharges}
              onUpdateGlobalUpcharges={setGlobalUpcharges}
              travelFeeType={travelFeeType}
              customTravelFee={customTravelFee}
              showOutTownTravel={showOutTownTravel}
              travelKm={travelKm}
              crewHours={crewHours}
              crewSize={crewSize}
              logistics={logistics}
              onUpdateParams={handleUpdateTravelParams}
            />
          </div>

          {/* Right Column: Quote Summary & Office Reference (5 cols) */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-5">
            <DoorQuoteSummaryCard
              customerName={customerName}
              quoteNumber={quoteNumber}
              lineItems={lineItems}
              totals={totals}
              mode={mode}
              onModeChange={setMode}
              isFirstNation={isFirstNation}
              onToggleFirstNation={setIsFirstNation}
              customLabour={customLabour}
              setCustomLabour={setCustomLabour}
              customMisc={customMisc}
              setCustomMisc={setCustomMisc}
              onSubmitQuote={() => setShowSubmitModal(true)}
              onPrintPreview={() => setShowPreviewModal(true)}
              isAdmin={isAdmin}
              attachedWindowQuote={attachedWindowQuote}
              attachedSealedUnit={attachedSealedUnit}
              onOpenAttachModal={() => setIsAttachModalOpen(true)}
              onRemoveAttachedWindowQuote={() => {
                setAttachedWindowQuote(null);
                toast.info('Detached window quote.');
              }}
              onRemoveAttachedSealedUnit={() => {
                setAttachedSealedUnit(null);
                toast.info('Detached sealed unit quote.');
              }}
            />

            <DoorOfficePricingCard
              totals={totals}
              lineItems={lineItems}
              mode={mode}
            />
          </div>
        </div>
      </div>

      {/* Dedicated Printable Quote Invoice (Active during window.print) */}
      {!showPreviewModal && (
        <QuoteInvoice
          customerName={customerName}
          quoteNumber={quoteNumber}
          preparedBy={user?.name || user?.username || 'The Window & Door Store'}
          primaryQuoteType="door"
          doors={lineItems}
          doorTotals={totals}
          quoteNotes={quoteNotes}
          template={quoteTemplate}
          fontSize={quoteFontSize}
          spacing={quoteSpacing}
          hstRate={isFirstNation ? 8 : 13}
          isSupplyOnly={mode === 'supply_only'}
          globalUpcharges={globalUpcharges}
          attachedWindowQuote={attachedWindowQuote}
          attachedSealedUnit={attachedSealedUnit}
        />
      )}

      {/* Universal Interactive Print Preview & Workflow Modals */}
      <DoorModalsGroup
        showPreviewModal={showPreviewModal}
        setShowPreviewModal={setShowPreviewModal}
        showSubmitModal={showSubmitModal}
        setShowSubmitModal={setShowSubmitModal}
        showResetModal={showResetModal}
        setShowResetModal={setShowResetModal}
        isSavedQuotesOpen={isSavedQuotesOpen}
        setIsSavedQuotesOpen={setIsSavedQuotesOpen}
        isAttachModalOpen={isAttachModalOpen}
        setIsAttachModalOpen={setIsAttachModalOpen}
        customerName={customerName}
        quoteNumber={quoteNumber}
        lineItems={lineItems}
        mode={mode}
        globalUpcharges={globalUpcharges}
        isFirstNation={isFirstNation}
        quoteNotes={quoteNotes}
        setQuoteNotes={setQuoteNotes}
        attachedWindowQuote={attachedWindowQuote}
        setAttachedWindowQuote={setAttachedWindowQuote}
        attachedSealedUnit={attachedSealedUnit}
        setAttachedSealedUnit={setAttachedSealedUnit}
        totals={totals}
        quoteTemplate={quoteTemplate}
        setQuoteTemplate={setQuoteTemplate}
        quoteFontSize={quoteFontSize}
        setQuoteFontSize={setQuoteFontSize}
        quoteSpacing={quoteSpacing}
        setQuoteSpacing={setQuoteSpacing}
        user={user}
        adminSubmitMode={adminSubmitMode}
        setAdminSubmitMode={setAdminSubmitMode}
        staffList={staffList}
        assignedReviewer={assignedReviewer}
        setAssignedReviewer={setAssignedReviewer}
        clerkList={clerkList}
        selectedOdooClerk={selectedOdooClerk}
        setSelectedOdooClerk={setSelectedOdooClerk}
        preparerNotes={preparerNotes}
        setPreparerNotes={setPreparerNotes}
        submittingQuote={submittingQuote}
        onSubmitQuote={handleSubmitQuote}
        onLoadQuoteFromDrafts={handleLoadQuoteFromDrafts}
        onConfirmReset={handleConfirmReset}
      />
    </div>
  );
}
