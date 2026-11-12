"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { computeQuotePricing } from "./quote-pricing-helper"
import type { QuotesSubTabType } from "./types"
import { QuoteCardHeader, QuoteCardNotes, QuoteCardActions } from "./card"

export interface QuoteCardItemProps {
  quote: any
  currentUser: any
  canReview: boolean
  isAdmin: boolean
  canEditApproved: boolean
  hasOdooAccess: boolean
  isClerk: boolean
  activeTab: QuotesSubTabType
  myUsername?: string
  staffList: any[]
  onOpenQuote: (
    quoteId: string,
    isEdit?: boolean,
    originSubTab?: QuotesSubTabType
  ) => void
  handleToggleStar: (id: string, currentStarred: boolean) => void
  promptDeleteQuote: (id: string, quoteNum: string) => void
  handlePreviewQuote: (quote: any) => void
  setSelectedQuoteForReview: (quote: any) => void
  setReviewerNotes: (val: string) => void
  setSelectedOdooClerk: (val: string) => void
  setOdooModalQuote: (quote: any) => void
  setOdooOrderNum: (val: string) => void
}

export function QuoteCardItem(props: QuoteCardItemProps) {
  const { quote, isClerk, canReview, activeTab, handlePreviewQuote } = props
  const pricing = computeQuotePricing(quote)
  const finalTotalCents = pricing?.total || 0
  const isModified = quote.status === "MODIFIED"

  return (
    <Card className="adaptive-card-container border-border/70 bg-card/50 shadow-sm backdrop-blur transition-all duration-200 hover:border-primary/50 hover:shadow">
      <CardContent className="flex flex-col gap-3.5 p-4 md:p-5">
        <QuoteCardHeader
          quote={quote}
          isClerk={isClerk}
          canReview={canReview}
          pricing={pricing}
          finalTotalCents={finalTotalCents}
          handlePreviewQuote={handlePreviewQuote}
        />

        <QuoteCardNotes
          quote={quote}
          isClerk={isClerk}
          activeTab={activeTab}
          isModified={isModified}
        />

        <QuoteCardActions {...props} />
      </CardContent>
    </Card>
  )
}
