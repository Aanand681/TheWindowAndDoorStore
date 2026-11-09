import { useState, useEffect, useCallback, useRef } from 'react';
import type { QuotesSubTabType } from '@/components/quotes/tab/types';
import type { QuoteTemplateType } from '@/components/quotes/invoice/types';
import { filterAndSortQuotes, computeQuotesTabCounts } from './quotes-tab-filter';
import { useQuotesTabActions } from './useQuotesTabActions';
import { useQuotePreviewListeners } from './useQuotePreviewListeners';

export interface UseQuotesTabStateParams {
  currentUser: any;
  initialSubTab?: QuotesSubTabType;
  initialPreviewQuoteId?: string;
  onQuotesCountChange?: (count: number) => void;
}

export function useQuotesTabState({
  currentUser,
  initialSubTab,
  initialPreviewQuoteId,
  onQuotesCountChange,
}: UseQuotesTabStateParams) {
  const isSuperAdmin = currentUser?.role === 'SUPERADMIN';
  const isAdmin = currentUser?.role === 'ADMIN' || isSuperAdmin;
  const effectivePerms = currentUser?.permissions || currentUser?.departmentPermissions || {};
  const canReview = Boolean(
    isAdmin || effectivePerms.canReviewQuote || effectivePerms.canApproveQuote
  );
  const canEditApproved = Boolean(isAdmin || effectivePerms.canEditApprovedQuote);
  const hasOdooAccess = Boolean(
    isAdmin ||
      effectivePerms.canAccessOdooQueue ||
      effectivePerms.canMarkOdooEntry ||
      currentUser?.department === 'CLERK'
  );
  const isClerk = Boolean(
    currentUser?.department === 'CLERK' || (effectivePerms.canMarkOdooEntry && !canReview)
  );
  const isEmployee = !canReview && !isClerk;

  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const defaultSubTab: QuotesSubTabType = canReview ? 'review' : isClerk ? 'odoo' : 'my';
  const [activeTab, setActiveTab] = useState<QuotesSubTabType>(
    initialSubTab || defaultSubTab
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [staffList, setStaffList] = useState<any[]>([]);

  // Preview Modal State
  const [previewQuote, setPreviewQuote] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<QuoteTemplateType>('modern');
  const [previewFontSize, setPreviewFontSize] = useState(11.5);
  const [previewSpacing, setPreviewSpacing] = useState(1.0);
  const [previewNotes, setPreviewNotes] = useState('');

  const myUsername = currentUser?.username?.toLowerCase();

  const onQuotesCountChangeRef = useRef(onQuotesCountChange);
  useEffect(() => {
    onQuotesCountChangeRef.current = onQuotesCountChange;
  });

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sub = params.get('sub') as QuotesSubTabType;
      if (
        sub &&
        ['review', 'odoo', 'my', 'all', 'odoo_completed', 'all_assigned'].includes(sub)
      ) {
        setActiveTab(sub);
      }
    }
  }, [initialSubTab]);

  useEffect(() => {
    fetch('/api/users?assignees=true')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) {
          const eligible = data.filter(
            (d) =>
              d.role !== 'SUPERADMIN' &&
              d.role !== 'superadmin' &&
              !d.username?.toLowerCase().includes('superadmin')
          );
          setStaffList(eligible);
        }
      })
      .catch(() => {});
  }, []);

  const fetchQuotes = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/quotes?search=${encodeURIComponent(search)}&status=${statusFilter}&t=${Date.now()}`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setQuotes(list);

        let totalActionable = 0;
        if (isSuperAdmin) {
          const pendingReview = list.filter((q: any) => q.status === 'PENDING_REVIEW').length;
          const pendingOdoo = list.filter(
            (q: any) =>
              q.odooStatus === 'PENDING_ENTRY' ||
              (!q.odooStatus && Boolean(q.odooAssignedTo))
          ).length;
          totalActionable = pendingReview + pendingOdoo;
        } else if (canReview) {
          const pendingReview = list.filter((q: any) => {
            if (q.status !== 'PENDING_REVIEW') return false;
            const assigned = q.assignedTo?.toLowerCase()?.trim();
            if (assigned) return assigned === myUsername;
            return myUsername === 'admin';
          }).length;
          const pendingOdoo = list.filter(
            (q: any) =>
              (q.odooStatus === 'PENDING_ENTRY' ||
                (!q.odooStatus && Boolean(q.odooAssignedTo))) &&
              q.odooAssignedTo?.toLowerCase() === myUsername
          ).length;
          totalActionable = pendingReview + pendingOdoo;
        } else if (isClerk) {
          totalActionable = list.filter(
            (q: any) =>
              q.odooAssignedTo?.toLowerCase() === myUsername &&
              q.odooStatus !== 'COMPLETED'
          ).length;
        } else {
          totalActionable = list.filter(
            (q: any) =>
              q.preparedBy?.toLowerCase() === myUsername && q.status === 'PENDING_REVIEW'
          ).length;
        }

        if (onQuotesCountChangeRef.current) onQuotesCountChangeRef.current(totalActionable);
      }
    } catch (err) {
      console.error('Failed to fetch quotes:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, isSuperAdmin, canReview, isClerk, myUsername]);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  useEffect(() => {
    const handleCountUpdate = () => {
      fetchQuotes();
    };
    const handleQuoteDeleted = (e: any) => {
      const deletedId = e.detail?.quoteId;
      if (deletedId) {
        setQuotes((prev) => prev.filter((q) => q._id !== deletedId));
      }
      fetchQuotes();
    };
    const handleFocus = () => {
      fetchQuotes();
    };

    window.addEventListener('quote-count-updated', handleCountUpdate);
    window.addEventListener('quote-deleted', handleQuoteDeleted);
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('quote-count-updated', handleCountUpdate);
      window.removeEventListener('quote-deleted', handleQuoteDeleted);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchQuotes]);

  const actions = useQuotesTabActions({
    quotes,
    setQuotes,
    fetchQuotes,
    currentUser,
  });

  const handlePreviewQuote = useCallback((quote: any) => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('defaultQuoteTemplate') as QuoteTemplateType | null;
      if (saved && ['modern', 'executive', 'cards'].includes(saved)) {
        setPreviewTemplate(saved);
      }
    }
    setPreviewQuote(quote);
    setPreviewNotes(quote.quoteNotes || '');
    setIsPreviewOpen(true);
  }, []);

  useQuotePreviewListeners({
    quotes,
    currentUser,
    initialPreviewQuoteId,
    setActiveTab,
    handlePreviewQuote,
  });

  const sortedQuotes = filterAndSortQuotes({
    quotes,
    activeTab,
    statusFilter,
    search,
    canReview,
    isSuperAdmin,
    isClerk,
    hasOdooAccess,
    myUsername,
  });

  const handleTabChange = (newTab: QuotesSubTabType) => {
    setActiveTab(newTab);
    setStatusFilter('all');
  };

  const counts = computeQuotesTabCounts({
    quotes,
    isSuperAdmin,
    hasOdooAccess,
    myUsername,
  });

  return {
    isSuperAdmin,
    isAdmin,
    canReview,
    canEditApproved,
    hasOdooAccess,
    isClerk,
    isEmployee,
    quotes,
    loading,
    activeTab,
    setActiveTab,
    handleTabChange,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    staffList,
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
    handlePreviewQuote,
    fetchQuotes,
    sortedQuotes,
    ...actions,
    ...counts,
  };
}
