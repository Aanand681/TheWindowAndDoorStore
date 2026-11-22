"use client"

import { useCallback } from "react"
import { useUniversalReviewActions } from "@/hooks/quotes/review/useUniversalReviewActions"
import {
  buildDoorUpdatePayload,
  BuildDoorUpdatePayloadParams,
} from "./door-review-payload"

export interface UseDoorReviewActionsParams
  extends Omit<BuildDoorUpdatePayloadParams, "extra"> {
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

export function useDoorReviewActions(p: UseDoorReviewActionsParams) {
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
      buildDoorUpdatePayload({ ...payloadParams, extra }),
    [payloadParams]
  )

  return useUniversalReviewActions({
    quoteTypeLabel: "Door",
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
