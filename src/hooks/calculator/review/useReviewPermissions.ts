'use client';

export interface UseReviewPermissionsParams {
  user: any;
  reviewQuote: any;
  isEditMode: boolean;
}

export interface UseReviewPermissionsReturn {
  effectivePerms: any;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  canReview: boolean;
  canEditApprovedQuote: boolean;
  isReviewerOrAdmin: boolean;
  isOdooClerk: boolean;
  isOdooCompleted: boolean;
  isApprovedOrModified: boolean;
  canEditCurrentQuote: boolean;
  isReadOnly: boolean;
}

export function useReviewPermissions({
  user,
  reviewQuote,
  isEditMode,
}: UseReviewPermissionsParams): UseReviewPermissionsReturn {
  const effectivePerms = user?.permissions || user?.departmentPermissions || {};
  const isSuperAdmin = Boolean(user && user.role === 'SUPERADMIN');
  const isAdmin = Boolean(user && (user.role === 'ADMIN' || isSuperAdmin));
  const canReview = Boolean(isAdmin || effectivePerms.canReviewQuote || effectivePerms.canApproveQuote);
  const canEditApprovedQuote = Boolean(isAdmin || effectivePerms.canEditApprovedQuote);

  const isReviewerOrAdmin = Boolean(
    isAdmin || (user && reviewQuote && reviewQuote.assignedTo === user.username) || canReview
  );

  const isOdooClerk = Boolean(
    !canReview &&
      (user?.department === 'CLERK' ||
        ((effectivePerms.canMarkOdooEntry || effectivePerms.canAccessOdooQueue) &&
          (isAdmin || (user && reviewQuote && reviewQuote.odooAssignedTo === user.username))))
  );

  const isOdooCompleted = Boolean(
    reviewQuote?.odooStatus === 'COMPLETED' || reviewQuote?.odooOrderNumber
  );
  const isApprovedOrModified =
    reviewQuote?.status === 'APPROVED' || reviewQuote?.status === 'MODIFIED';
  const canEditCurrentQuote = Boolean(
    !isOdooCompleted && !isOdooClerk && (isApprovedOrModified ? canEditApprovedQuote : true)
  );
  const isReadOnly = Boolean(
    reviewQuote && (!isEditMode || !canEditCurrentQuote || isOdooCompleted)
  );

  return {
    effectivePerms,
    isSuperAdmin,
    isAdmin,
    canReview,
    canEditApprovedQuote,
    isReviewerOrAdmin,
    isOdooClerk,
    isOdooCompleted,
    isApprovedOrModified,
    canEditCurrentQuote,
    isReadOnly,
  };
}

