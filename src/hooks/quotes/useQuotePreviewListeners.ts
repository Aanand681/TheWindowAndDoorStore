import { useEffect } from 'react';
import type { QuotesSubTabType } from '@/components/quotes/tab/types';

export function useQuotePreviewListeners({
  quotes,
  currentUser,
  initialPreviewQuoteId,
  setActiveTab,
  handlePreviewQuote,
}: {
  quotes: any[];
  currentUser: any;
  initialPreviewQuoteId?: string;
  setActiveTab: (sub: QuotesSubTabType) => void;
  handlePreviewQuote: (quote: any) => void;
}) {
  useEffect(() => {
    const handleClerkPreview = async (e: any) => {
      const qId = e.detail?.quoteId;
      if (!qId) return;
      const targetSub = e.detail?.sub || (currentUser?.role === 'ADMIN' ? 'all' : 'my');
      if (['all', 'my', 'review', 'odoo'].includes(targetSub)) {
        setActiveTab(targetSub as any);
      }
      let target = quotes.find((q) => q._id === qId);
      if (!target) {
        try {
          const res = await fetch(`/api/quotes/${qId}?t=${Date.now()}`);
          if (res.ok) {
            target = await res.json();
          }
        } catch (err) {
          console.error('Failed to fetch quote for preview:', err);
        }
      }
      if (target) {
        handlePreviewQuote(target);
      }
    };

    window.addEventListener('open-clerk-preview', handleClerkPreview);
    return () => window.removeEventListener('open-clerk-preview', handleClerkPreview);
  }, [quotes, currentUser, setActiveTab, handlePreviewQuote]);

  useEffect(() => {
    const checkUrlPreview = async () => {
      let previewId = initialPreviewQuoteId;
      let targetSub: string | null = null;
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (!previewId) previewId = params.get('previewQuoteId') || undefined;
        targetSub = params.get('sub');
      }
      if (previewId) {
        const activeSub =
          targetSub && ['all', 'my', 'review', 'odoo'].includes(targetSub)
            ? targetSub
            : currentUser?.role === 'ADMIN'
              ? 'all'
              : 'my';
        setActiveTab(activeSub as any);
        if (typeof window !== 'undefined') {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('previewQuoteId');
          window.history.replaceState({}, '', cleanUrl.pathname + cleanUrl.search);
        }
        try {
          const res = await fetch(`/api/quotes/${previewId}?t=${Date.now()}`);
          if (res.ok) {
            const q = await res.json();
            if (q && q._id) {
              handlePreviewQuote(q);
            }
          }
        } catch (err) {
          console.error('Failed to load quote for preview from URL:', err);
        }
      }
    };
    checkUrlPreview();
  }, [initialPreviewQuoteId, currentUser, setActiveTab, handlePreviewQuote]);
}

