"use client"

import { useCallback } from "react"
import { useUniversalReviewActions } from "@/hooks/quotes/review/useUniversalReviewActions"
import {
  buildSealedUnitsUpdatePayload,
  BuildSealedUnitsUpdatePayloadParams,
} from "./sealed-units-review-payload"

export interface UseSealedUnitsReviewActionsParams
  extends Omit<BuildSealedUnitsUpdatePayloadParams, "extra"> {
  user: any
  reviewQuoteId: string | null
  reviewQuote: any
  setReviewQuote: (q: any) => void
  setOriginalSnapshot: (snapshot: any) => void
  setIsEditMode: (val: boolean) => void
  handleExitReview: () => void
  staffList: any[]
  clerkList: any[]
}

export function useSealedUnitsReviewActions(
  p: UseSealedUnitsReviewActionsParams
) {
  const {
    user,
    reviewQuoteId,
    reviewQuote,
    setReviewQuote,
    setOriginalSnapshot,
    setIsEditMode,
    handleExitReview,
    staffList,
    clerkList,
    ...payloadParams
  } = p

  const buildUpdatePayload = useCallback(
    (extra: Record<string, any> = {}) =>
      buildSealedUnitsUpdatePayload({ ...payloadParams, extra }),
    [payloadParams]
  )

  return useUniversalReviewActions({
    quoteTypeLabel: "Sealed Unit",
    quoteNumber: payloadParams.quoteNumber,
    reviewQuoteId,
    reviewQuote,
    setReviewQuote,
    setOriginalSnapshot,
    setIsEditMode,
    handleExitReview,
    staffList,
    clerkList,
    user,
    buildUpdatePayload,
  })
}
