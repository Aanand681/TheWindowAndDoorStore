'use client';

import { useState } from 'react';
import { useReviewOdooActions, UseReviewOdooActionsParams } from './useReviewOdooActions';
import { useReviewStatusActions, UseReviewStatusActionsParams } from './useReviewStatusActions';

export interface UseReviewWorkflowActionsParams
  extends Omit<UseReviewOdooActionsParams, 'setReviewActionLoading'>,
    Omit<UseReviewStatusActionsParams, 'setReviewActionLoading'> {}

export function useReviewWorkflowActions(params: UseReviewWorkflowActionsParams) {
  const [reviewActionLoading, setReviewActionLoading] = useState<boolean>(false);

  const odooActions = useReviewOdooActions({
    ...params,
    setReviewActionLoading,
  });

  const statusActions = useReviewStatusActions({
    ...params,
    setReviewActionLoading,
  });

  return {
    reviewActionLoading,
    ...odooActions,
    ...statusActions,
  };
}
