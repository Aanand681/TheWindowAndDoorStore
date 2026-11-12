"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Database } from "lucide-react"
import type { QuotesSubTabType, QuotesTabProps } from "./tab/types"
import { useQuotesTabState } from "@/hooks/quotes/useQuotesTabState"
import { QuotesStatsRibbon } from "./tab/QuotesStatsRibbon"
import { QuotesFilterToolbar } from "./tab/QuotesFilterToolbar"
import { QuoteCardItem } from "./tab/QuoteCardItem"
import { QuotesModals } from "./tab/QuotesModals"

export type { QuotesSubTabType, QuotesTabProps }

export default function QuotesTab(props: QuotesTabProps) {
  const {
    currentUser,
    onOpenQuote,
    initialSubTab,
    initialPreviewQuoteId,
    onQuotesCountChange,
  } = props

  const state = useQuotesTabState({
    currentUser,
    initialSubTab,
    initialPreviewQuoteId,
    onQuotesCountChange,
  })

  const {
    isSuperAdmin,
    isAdmin,
    canReview,
    canEditApproved,
    hasOdooAccess,
    isClerk,
    isEmployee,
    loading,
    activeTab,
    handleTabChange,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    staffList,
    selectedOdooClerk,
    setSelectedOdooClerk,
    odooModalQuote,
    setOdooModalQuote,
    odooOrderNum,
    setOdooOrderNum,
    markingOdoo,
    previewQuote,
    setPreviewQuote,
    isPreviewOpen,
    setIsPreviewOpen,
    previewTemplate,
    setPreviewTemplate,
    previewFontSize,
    setPreviewFontSize,
    previewSpacing,
    setPreviewSpacing,
    previewNotes,
    setPreviewNotes,
    storageStats,
    showFlushModal,
    setShowFlushModal,
    flushing,
    quoteToDelete,
    setQuoteToDelete,
    isDeletingQuote,
    selectedQuoteForReview,
    setSelectedQuoteForReview,
    reviewerNotes,
    setReviewerNotes,
    reviewingAction,
    fetchStorageStats,
    handleToggleStar,
    promptDeleteQuote,
    confirmDeleteQuote,
    handlePreviewQuote,
    handleQuickApprove,
    handleConfirmOdooEntry,
    handleFlushStorage,
    sortedQuotes,
    adminPendingCount,
    adminOdooCount,
    adminArchiveCount,
    employeeInReviewCount,
    employeeOdooDoneCount,
    employeeHistoryCount,
    clerkPendingCount,
    clerkCompletedCount,
    clerkTotalAssignedCount,
  } = state

  return (
    <div className="space-y-6">
      {/* Title & Stats Ribbon */}
      <div className="flex flex-col justify-between gap-4 pt-1 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <FileText className="h-7 w-7 text-primary" />
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Quotes &amp; Review Queue
            </h2>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {canReview
              ? "Review submitted quotes, assign Odoo queues, and explore all quote archives."
              : isClerk
                ? "Manage pending Odoo entries, record official Sales Order numbers, and archive assignments."
                : "Track submitted quotes in review, verify completed Odoo entries, and view quote history."}
          </p>
        </div>

        {(isSuperAdmin || isAdmin) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchStorageStats()
              setShowFlushModal(true)
            }}
            className="cursor-pointer gap-2 self-start border-border/80 bg-card/40 text-xs shadow-sm backdrop-blur hover:border-primary/50 md:self-auto"
          >
            <Database className="h-3.5 w-3.5 text-primary" />
            <span>Storage &amp; Auto-Flush</span>
          </Button>
        )}
      </div>

      {/* Stats Counter Cards (Role-Tailored 3-Card Grid) */}
      <QuotesStatsRibbon
        canReview={canReview}
        isEmployee={isEmployee}
        isClerk={isClerk}
        hasOdooAccess={hasOdooAccess}
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        adminPendingCount={adminPendingCount}
        adminOdooCount={adminOdooCount}
        adminArchiveCount={adminArchiveCount}
        employeeInReviewCount={employeeInReviewCount}
        employeeOdooDoneCount={employeeOdooDoneCount}
        employeeHistoryCount={employeeHistoryCount}
        clerkPendingCount={clerkPendingCount}
        clerkCompletedCount={clerkCompletedCount}
        clerkTotalAssignedCount={clerkTotalAssignedCount}
      />

      {/* Filter & Search Bar */}
      <QuotesFilterToolbar
        search={search}
        setSearch={setSearch}
        activeTab={activeTab}
        handleTabChange={handleTabChange}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        canReview={canReview}
        isClerk={isClerk}
        isEmployee={isEmployee}
        hasOdooAccess={hasOdooAccess}
        adminPendingCount={adminPendingCount}
        adminOdooCount={adminOdooCount}
        employeeInReviewCount={employeeInReviewCount}
        employeeOdooDoneCount={employeeOdooDoneCount}
        clerkPendingCount={clerkPendingCount}
        clerkCompletedCount={clerkCompletedCount}
        clerkTotalAssignedCount={clerkTotalAssignedCount}
      />

      {/* Quotes List / Grid */}
      {loading ? (
        <div className="animate-pulse py-16 text-center text-sm text-muted-foreground">
          Loading quotes...
        </div>
      ) : sortedQuotes.length === 0 ? (
        <Card className="border-dashed bg-card/20">
          <CardContent className="space-y-3 p-12 text-center text-muted-foreground">
            <FileText className="mx-auto h-10 w-10 text-muted-foreground/60" />
            <div className="text-base font-semibold text-foreground">
              No quotes found
            </div>
            <p className="mx-auto max-w-sm text-xs">
              {activeTab === "review"
                ? "There are currently no quotes waiting for review."
                : "No quotes match your current filter or search criteria."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedQuotes.map((quote) => (
            <QuoteCardItem
              key={quote._id}
              quote={quote}
              currentUser={currentUser}
              canReview={canReview}
              isAdmin={isAdmin}
              canEditApproved={canEditApproved}
              hasOdooAccess={hasOdooAccess}
              isClerk={isClerk}
              activeTab={activeTab}
              staffList={staffList}
              onOpenQuote={onOpenQuote}
              handleToggleStar={handleToggleStar}
              promptDeleteQuote={promptDeleteQuote}
              handlePreviewQuote={handlePreviewQuote}
              setSelectedQuoteForReview={setSelectedQuoteForReview}
              setReviewerNotes={setReviewerNotes}
              setSelectedOdooClerk={setSelectedOdooClerk}
              setOdooModalQuote={setOdooModalQuote}
              setOdooOrderNum={setOdooOrderNum}
            />
          ))}
        </div>
      )}

      {/* Modals Container */}
      <QuotesModals
        showFlushModal={showFlushModal}
        setShowFlushModal={setShowFlushModal}
        storageStats={storageStats}
        flushing={flushing}
        handleFlushStorage={handleFlushStorage}
        selectedQuoteForReview={selectedQuoteForReview}
        setSelectedQuoteForReview={setSelectedQuoteForReview}
        reviewerNotes={reviewerNotes}
        setReviewerNotes={setReviewerNotes}
        selectedOdooClerk={selectedOdooClerk}
        setSelectedOdooClerk={setSelectedOdooClerk}
        reviewingAction={reviewingAction}
        handleQuickApprove={handleQuickApprove}
        staffList={staffList}
        quoteToDelete={quoteToDelete}
        setQuoteToDelete={setQuoteToDelete}
        isDeletingQuote={isDeletingQuote}
        confirmDeleteQuote={confirmDeleteQuote}
        previewQuote={previewQuote}
        setPreviewQuote={setPreviewQuote}
        isPreviewOpen={isPreviewOpen}
        setIsPreviewOpen={setIsPreviewOpen}
        previewTemplate={previewTemplate}
        setPreviewTemplate={setPreviewTemplate}
        previewFontSize={previewFontSize}
        setPreviewFontSize={setPreviewFontSize}
        previewSpacing={previewSpacing}
        setPreviewSpacing={setPreviewSpacing}
        previewNotes={previewNotes}
        setPreviewNotes={setPreviewNotes}
        canReview={canReview}
        currentUser={currentUser}
        odooModalQuote={odooModalQuote}
        setOdooModalQuote={setOdooModalQuote}
        odooOrderNum={odooOrderNum}
        setOdooOrderNum={setOdooOrderNum}
        markingOdoo={markingOdoo}
        handleConfirmOdooEntry={handleConfirmOdooEntry}
      />
    </div>
  )
}
