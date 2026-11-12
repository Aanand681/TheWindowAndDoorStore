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
    UseQuoteReviewSubmissionStateParams,
    Omit<
      UseReviewWorkflowActionsParams,
      "selectedOdooClerk" | "setSelectedOdooClerk" | "staffList" | "clerkList"
    > {}

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
