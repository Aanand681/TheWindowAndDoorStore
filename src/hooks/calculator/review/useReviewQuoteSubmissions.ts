"use client"

import {
  useQuoteReviewSubmissionState,
  UseQuoteReviewSubmissionStateParams,
} from "./useQuoteReviewSubmissionState"
import {
  useReviewWorkflowActions,
  UseReviewWorkflowActionsParams,
} from "./useReviewWorkflowActions"

export interface UseReviewQuoteSubmissionsParams
  extends
    Omit<
      UseQuoteReviewSubmissionStateParams,
      "setReviewQuote" | "setOriginalSnapshot" | "setIsEditMode"
    >,
    Omit<
      UseReviewWorkflowActionsParams,
      "selectedOdooClerk" | "setSelectedOdooClerk" | "staffList" | "clerkList"
    > {
  setReviewQuoteId?: (id: string | null) => void
}

export function useReviewQuoteSubmissions(
  params: UseReviewQuoteSubmissionsParams
) {
  const submissionState = useQuoteReviewSubmissionState(params)

  const workflowActions = useReviewWorkflowActions({
    ...params,
    selectedOdooClerk: submissionState.selectedOdooClerk,
    setSelectedOdooClerk: submissionState.setSelectedOdooClerk,
    staffList: submissionState.staffList,
    clerkList: submissionState.clerkList,
  })

  return {
    ...submissionState,
    ...workflowActions,
  }
}
