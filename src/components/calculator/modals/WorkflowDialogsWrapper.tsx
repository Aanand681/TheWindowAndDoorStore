"use client"

import React from "react"
import dynamic from "next/dynamic"

const WorkflowDialogs = dynamic(
  () =>
    import("@/components/calculator/WorkflowDialogs").then(
      (m) => m.WorkflowDialogs
    ),
  { ssr: false }
)

export interface WorkflowDialogsWrapperProps {
  showReassignModal: boolean
  setShowReassignModal: (show: boolean) => void
  reviewQuote: any
  user: any
  staffList: any[]
  reassignTo: string
  setReassignTo: (user: string) => void
  reassignNotes: string
  setReassignNotes: (notes: string) => void
  handleReassignQuote: () => void
  showReturnModal: boolean
  setShowReturnModal: (show: boolean) => void
  returnNotes: string
  setReturnNotes: (notes: string) => void
  submitReturnReviewQuote: () => void
  showExitReviewForPdfModal: boolean
  setShowExitReviewForPdfModal: (show: boolean) => void
  handleExitReviewAndImportPdf: () => void
  reviewActionLoading: boolean
}

export function WorkflowDialogsWrapper(props: WorkflowDialogsWrapperProps) {
  if (
    !props.showReassignModal &&
    !props.showReturnModal &&
    !props.showExitReviewForPdfModal
  ) {
    return null
  }
  return <WorkflowDialogs {...props} />
}
