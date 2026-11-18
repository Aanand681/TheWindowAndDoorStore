"use client"

export interface UseReviewPermissionsParams {
  user: any
  reviewQuote: any
  isEditMode: boolean
}

export interface UseReviewPermissionsReturn {
  effectivePerms: any
  isSuperAdmin: boolean
  isAdmin: boolean
  canReview: boolean
  canApprove: boolean
  isAssignedReviewer: boolean
  isPreparer: boolean
  canEditApprovedQuote: boolean
  isReviewerOrAdmin: boolean
  isOdooClerk: boolean
  isOdooCompleted: boolean
  isApprovedOrModified: boolean
  canEditCurrentQuote: boolean
  isReadOnly: boolean
}

export function useReviewPermissions({
  user,
  reviewQuote,
  isEditMode,
}: UseReviewPermissionsParams): UseReviewPermissionsReturn {
  const effectivePerms = user?.permissions || user?.departmentPermissions || {}
  const isSuperAdmin = Boolean(user && user.role === "SUPERADMIN")
  const isAdmin = Boolean(user && (user.role === "ADMIN" || isSuperAdmin))
  const canApprove = Boolean(
    isAdmin || effectivePerms.canApproveQuote === true
  )
  const canReview = Boolean(
    isAdmin || effectivePerms.canReviewQuote || canApprove
  )
  const canEditApprovedQuote = Boolean(
    isAdmin || effectivePerms.canEditApprovedQuote
  )

  const isAssignedReviewer = Boolean(
    user &&
    reviewQuote &&
    reviewQuote.assignedTo &&
    user.username &&
    reviewQuote.assignedTo.toLowerCase() === user.username.toLowerCase()
  )

  const isPreparer = Boolean(
    user &&
    reviewQuote &&
    user.username &&
    reviewQuote.preparedBy &&
    reviewQuote.preparedBy.toLowerCase() === user.username.toLowerCase()
  )

  const isReviewerOrAdmin = Boolean(
    isAdmin ||
    isAssignedReviewer ||
    canReview
  )

  const isOdooClerk = Boolean(
    !canReview &&
    (user?.department === "CLERK" ||
      ((effectivePerms.canMarkOdooEntry || effectivePerms.canAccessOdooQueue) &&
        (isAdmin ||
          (user &&
            reviewQuote &&
            reviewQuote.odooAssignedTo === user.username))))
  )

  const isOdooCompleted = Boolean(
    reviewQuote?.odooStatus === "COMPLETED" || reviewQuote?.odooOrderNumber
  )
  const isApprovedOrModified =
    reviewQuote?.status === "APPROVED" || reviewQuote?.status === "MODIFIED"
  const isPendingReview = reviewQuote?.status === "PENDING_REVIEW"
  const canEditCurrentQuote = Boolean(
    !isOdooCompleted &&
    !isOdooClerk &&
    (isApprovedOrModified ? canEditApprovedQuote : true) &&
    (!isPendingReview || (isReviewerOrAdmin && !isPreparer))
  )
  const isReadOnly = Boolean(
    reviewQuote && (!isEditMode || !canEditCurrentQuote || isOdooCompleted)
  )

  return {
    effectivePerms,
    isSuperAdmin,
    isAdmin,
    canReview,
    canApprove,
    isAssignedReviewer,
    isPreparer,
    canEditApprovedQuote,
    isReviewerOrAdmin,
    isOdooClerk,
    isOdooCompleted,
    isApprovedOrModified,
    canEditCurrentQuote,
    isReadOnly,
  }
}
