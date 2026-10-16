'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  FileText, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Star, 
  Printer, 
  Trash2, 
  Calendar, 
  Database, 
  ArrowRight, 
  MessageSquare, 
  Sparkles, 
  Edit3, 
  AlertTriangle,
  ClipboardCheck,
  CheckSquare
} from 'lucide-react';

import { formatMoney } from '@/lib/promo-logic';
import { toast } from 'sonner';
import QuotePreviewModal from '@/components/QuotePreviewModal';
import { QuoteTemplateType } from '@/components/QuoteInvoice';
import { useViewport } from '@/hooks/use-viewport';

export type QuotesSubTabType = 'review' | 'odoo' | 'my' | 'all' | 'odoo_completed' | 'all_assigned';

export interface QuotesTabProps {
  currentUser: any;
  onOpenQuote: (quoteId: string, isEdit?: boolean, originSubTab?: QuotesSubTabType) => void;
  onQuotesCountChange?: (count: number) => void;
  initialSubTab?: QuotesSubTabType;
}

export default function QuotesTab({ currentUser, onOpenQuote, onQuotesCountChange, initialSubTab }: QuotesTabProps) {
  const isSuperAdmin = currentUser?.role === 'SUPERADMIN';
  const isAdmin = currentUser?.role === 'ADMIN' || isSuperAdmin;
  const deptPerms = currentUser?.departmentPermissions || {};
  const canReview = Boolean(isAdmin || deptPerms.canReviewQuote || deptPerms.canApproveQuote);
  const canEditApproved = Boolean(isAdmin || deptPerms.canEditApprovedQuote);
  const isClerk = Boolean(currentUser?.department === 'CLERK' || (deptPerms.canMarkOdooEntry && !canReview));
  const isEmployee = !canReview && !isClerk;

  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial sub-tab resolution based on role
  const defaultSubTab: QuotesSubTabType = canReview ? 'review' : isClerk ? 'odoo' : 'my';
  const [activeTab, setActiveTab] = useState<QuotesSubTabType>(
    initialSubTab || defaultSubTab
  );
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Staff List for Odoo Assignee Picker
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedOdooClerk, setSelectedOdooClerk] = useState<string>('');

  // Odoo Completion Modal State
  const [odooModalQuote, setOdooModalQuote] = useState<any | null>(null);
  const [odooOrderNum, setOdooOrderNum] = useState<string>('');
  const [markingOdoo, setMarkingOdoo] = useState<boolean>(false);

  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(initialSubTab);
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const sub = params.get('sub') as QuotesSubTabType;
      if (sub && ['review', 'odoo', 'my', 'all', 'odoo_completed', 'all_assigned'].includes(sub)) {
        setActiveTab(sub);
      }
    }
  }, [initialSubTab]);

  // Fetch staff list for Odoo assignee selection
  useEffect(() => {
    fetch('/api/users?assignees=true')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          const eligible = data.filter(d => 
            d.role !== 'SUPERADMIN' && 
            d.role !== 'superadmin' &&
            d.username?.toLowerCase() !== 'cheeku' &&
            !d.username?.toLowerCase().includes('superadmin')
          );
          setStaffList(eligible);
        }
      })
      .catch(() => {});
  }, []);

  // Preview Modal State
  const [previewQuote, setPreviewQuote] = useState<any | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<QuoteTemplateType>('modern');
  const [previewFontSize, setPreviewFontSize] = useState(11.5);
  const [previewSpacing, setPreviewSpacing] = useState(1.0);
  const [previewNotes, setPreviewNotes] = useState('');

  // Storage Flush State
  const [storageStats, setStorageStats] = useState<any | null>(null);
  const [showFlushModal, setShowFlushModal] = useState(false);
  const [flushing, setFlushing] = useState(false);

  // Review Dialog State (for Quick Approval from this page)
  const [selectedQuoteForReview, setSelectedQuoteForReview] = useState<any | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [reviewingAction, setReviewingAction] = useState(false);

  const myUsername = currentUser?.username?.toLowerCase();

  const fetchQuotes = async () => {
    try {
      const res = await fetch(`/api/quotes?search=${encodeURIComponent(search)}&status=${statusFilter}&t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setQuotes(list);
        
        let totalActionable = 0;
        if (canReview) {
          const pendingReview = list.filter((q: any) => q.status === 'PENDING_REVIEW').length;
          const pendingOdoo = list.filter((q: any) => q.odooStatus === 'PENDING_ENTRY' || (!q.odooStatus && Boolean(q.odooAssignedTo))).length;
          totalActionable = pendingReview + pendingOdoo;
        } else if (isClerk) {
          totalActionable = list.filter((q: any) => q.odooAssignedTo?.toLowerCase() === myUsername && q.odooStatus !== 'COMPLETED').length;
        } else {
          totalActionable = list.filter((q: any) => q.preparedBy?.toLowerCase() === myUsername && q.status === 'PENDING_REVIEW').length;
        }

        if (onQuotesCountChange) onQuotesCountChange(totalActionable);
      }
    } catch (err) {
      console.error('Failed to fetch quotes:', err);
    } finally {
      setLoading(false);
    }
  };

  const computeQuotePricing = (quote: any) => {
    if (!quote) return null;
    const taxJC = quote.taxTotals ? Math.round((quote.taxTotals.finalJC ?? quote.taxTotals.jcTotal ?? 0) * 100) : 0;
    const taxMisc = quote.taxTotals ? Math.round((quote.taxTotals.finalMisc ?? quote.taxTotals.miscTotal ?? 0) * 100) : 0;
    const taxLabour = quote.taxTotals ? Math.round((quote.taxTotals.finalLabour ?? quote.taxTotals.labourTotal ?? 0) * 100) : 0;

    const effectiveJC = (quote.customJC !== undefined && String(quote.customJC).trim() !== '') 
      ? Math.round(Number(quote.customJC) * 100) 
      : taxJC;

    const effectiveMisc = (quote.customMisc !== undefined && String(quote.customMisc).trim() !== '') 
      ? Math.round(Number(quote.customMisc) * 100) 
      : taxMisc;

    const effectiveLabour = (quote.customLabour !== undefined && String(quote.customLabour).trim() !== '') 
      ? Math.round(Number(quote.customLabour) * 100) 
      : taxLabour;

    const includeJCInPromo = quote.includeJCInPromo !== false;
    const includeMiscInPromo = quote.includeMiscInPromo !== false;
    const includeLabourInPromo = quote.includeLabourInPromo !== false;

    const basePrice = quote.quoteResult?.base || 0;
    const surcharge = quote.quoteResult?.surcharge || 0;
    const promoDiscount = quote.quoteResult?.promoDiscount || 0;

    const beforeTaxDiscount = basePrice + 
      (includeJCInPromo ? effectiveJC : 0) + 
      (includeMiscInPromo ? effectiveMisc : 0) + 
      (includeLabourInPromo ? effectiveLabour : 0) + 
      surcharge;

    const afterDiscount = Math.max(0, beforeTaxDiscount - promoDiscount);
    const hstRate = quote.taxTotals?.hstRate !== undefined ? quote.taxTotals.hstRate : 13;
    const hst = hstRate > 0 ? Math.round(afterDiscount * (hstRate / 100)) : 0;
    const total = quote.quoteSummaryTotal || (afterDiscount + hst);
    const firstPayment = Math.floor(total / 2);
    const secondPayment = total - firstPayment;

    return {
      basePrice,
      surcharge,
      promoDiscount,
      effectiveJC,
      effectiveMisc,
      effectiveLabour,
      includeJCInPromo,
      includeMiscInPromo,
      includeLabourInPromo,
      beforeTaxDiscount,
      afterDiscount,
      hstRate,
      hst,
      total,
      firstPayment,
      secondPayment,
    };
  };

  const fetchStorageStats = async () => {
    try {
      const res = await fetch('/api/quotes/flush');
      if (res.ok) {
        const data = await res.json();
        setStorageStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch storage stats:', err);
    }
  };

  useEffect(() => {
    fetchQuotes();
  }, [search, statusFilter]);

  useEffect(() => {
    const handleCountUpdate = () => {
      fetchQuotes();
    };
    const handleQuoteDeleted = (e: any) => {
      const deletedId = e.detail?.quoteId;
      if (deletedId) {
        setQuotes(prev => prev.filter(q => q._id !== deletedId));
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
  }, []);

  const handleToggleStar = async (id: string, currentStarred: boolean) => {
    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isStarred: !currentStarred }),
      });
      if (res.ok) {
        setQuotes(quotes.map(q => q._id === id ? { ...q, isStarred: !currentStarred } : q));
        toast.success(!currentStarred ? 'Quote starred (will be kept permanently)' : 'Quote unstarred');
      }
    } catch (err) {
      toast.error('Failed to update star');
    }
  };

  const handleDeleteQuote = async (id: string, quoteNum: string) => {
    if (!confirm(`Are you sure you want to delete Quote #${quoteNum}?`)) return;
    try {
      const res = await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setQuotes(quotes.filter(q => q._id !== id));
        toast.success(`Quote #${quoteNum} deleted`);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete');
      }
    } catch (err) {
      toast.error('Failed to delete quote');
    }
  };

  const handlePreviewQuote = (quote: any) => {
    setPreviewQuote(quote);
    setPreviewNotes(quote.quoteNotes || '');
    setIsPreviewOpen(true);
  };

  const handleQuickApprove = async (quote: any, newStatus: 'APPROVED' | 'RETURNED') => {
    setReviewingAction(true);
    try {
      const payload: any = {
        status: newStatus,
        reviewerNotes,
      };
      if (newStatus === 'APPROVED' && selectedOdooClerk) {
        payload.odooAssignedTo = selectedOdooClerk;
      }
      const res = await fetch(`/api/quotes/${quote._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast.success(
          newStatus === 'APPROVED'
            ? selectedOdooClerk
              ? `Quote #${quote.quoteNumber} approved & assigned to ${selectedOdooClerk} for Odoo entry!`
              : `Quote #${quote.quoteNumber} approved!`
            : `Quote #${quote.quoteNumber} returned with notes`
        );
        setSelectedQuoteForReview(null);
        setReviewerNotes('');
        setSelectedOdooClerk('');
        fetchQuotes();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to review');
      }
    } catch (err) {
      toast.error('Failed to update quote review status');
    } finally {
      setReviewingAction(false);
    }
  };

  const handleConfirmOdooEntry = async () => {
    if (!odooModalQuote) return;
    setMarkingOdoo(true);
    try {
      const res = await fetch(`/api/quotes/${odooModalQuote._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          odooStatus: 'COMPLETED',
          odooOrderNumber: odooOrderNum.trim(),
          odooCompletedBy: currentUser?.username || 'Clerk',
        }),
      });
      if (res.ok) {
        toast.success(`Quote #${odooModalQuote.quoteNumber} confirmed entered in Odoo!`);
        setOdooModalQuote(null);
        setOdooOrderNum('');
        fetchQuotes();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update Odoo status');
      }
    } catch (err) {
      toast.error('Failed to update Odoo status');
    } finally {
      setMarkingOdoo(false);
    }
  };

  const handleFlushStorage = async () => {
    setFlushing(true);
    try {
      const res = await fetch('/api/quotes/flush', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Storage cleanup complete. Removed ${data.deletedCount} old quotes.`);
        setShowFlushModal(false);
        fetchQuotes();
      } else {
        toast.error(data.error || 'Cleanup failed');
      }
    } catch (err) {
      toast.error('Failed to execute storage flush');
    } finally {
      setFlushing(false);
    }
  };

  // Filter quotes based on role, active tab, status dropdown, and search query
  const displayedQuotes = quotes.filter(quote => {
    const prep = quote.preparedBy?.toLowerCase();
    const clerk = quote.odooAssignedTo?.toLowerCase();
    const completedBy = quote.odooCompletedBy?.toLowerCase();

    // 1. Role-Tailored Sub-tab filter
    if (canReview) {
      if (activeTab === 'review') {
        if (quote.status !== 'PENDING_REVIEW') return false;
      } else if (activeTab === 'odoo') {
        if (!Boolean(quote.odooAssignedTo || quote.odooStatus === 'PENDING_ENTRY' || quote.odooStatus === 'COMPLETED')) return false;
      }
      // If 'all', all quotes are included
    } else if (isClerk) {
      if (activeTab === 'odoo') {
        // Pending Odoo Entry
        if (clerk !== myUsername || quote.odooStatus === 'COMPLETED') return false;
      } else if (activeTab === 'odoo_completed') {
        // Completed in Odoo
        if (!((clerk === myUsername || completedBy === myUsername) && quote.odooStatus === 'COMPLETED')) return false;
      } else if (activeTab === 'all_assigned') {
        // Total Assigned to this clerk
        if (clerk !== myUsername) return false;
      }
    } else {
      // Employee / Sales Associate: must be quotes prepared by this user
      if (prep !== myUsername) return false;

      if (activeTab === 'review') {
        if (quote.status !== 'PENDING_REVIEW') return false;
      } else if (activeTab === 'odoo_completed') {
        if (quote.odooStatus !== 'COMPLETED') return false;
      }
      // If 'my', shows all quotes prepared by this employee (My Quotes History)
    }

    // 2. Status Dropdown filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'ODOO_PENDING') {
        const isPending = quote.odooStatus === 'PENDING_ENTRY' || (!quote.odooStatus && Boolean(quote.odooAssignedTo));
        if (!isPending) return false;
      } else if (statusFilter === 'ODOO_COMPLETED') {
        if (quote.odooStatus !== 'COMPLETED') return false;
      } else {
        if (quote.status !== statusFilter) return false;
      }
    }

    // 3. Search query filter (matches Quote #, Sales Order / Odoo #, Customer, Preparer, Odoo Clerk)
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      const matchQuoteNum = quote.quoteNumber?.toString().toLowerCase().includes(q);
      const matchOdooNum = quote.odooOrderNumber?.toLowerCase().includes(q);
      const matchCustomer = quote.customerName?.toLowerCase().includes(q);
      const matchPreparer = quote.preparedBy?.toLowerCase().includes(q);
      const matchOdooClerk = quote.odooAssignedTo?.toLowerCase().includes(q);
      if (!matchQuoteNum && !matchOdooNum && !matchCustomer && !matchPreparer && !matchOdooClerk) {
        return false;
      }
    }

    return true;
  });

  // Sort quotes: In the Odoo Queue, pending entries strictly display on top of completed entries
  const sortedQuotes = [...displayedQuotes].sort((a, b) => {
    if (activeTab === 'odoo') {
      const aPending = (a.odooStatus === 'PENDING_ENTRY' || (!a.odooStatus && Boolean(a.odooAssignedTo))) ? 1 : 0;
      const bPending = (b.odooStatus === 'PENDING_ENTRY' || (!b.odooStatus && Boolean(b.odooAssignedTo))) ? 1 : 0;
      if (aPending !== bPending) {
        return bPending - aPending; // 1 comes before 0: Pending always top!
      }
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleTabChange = (newTab: QuotesSubTabType) => {
    setActiveTab(newTab);
    setStatusFilter('all');
  };

  // Admin / Reviewer Counts
  const adminPendingCount = quotes.filter(q => q.status === 'PENDING_REVIEW').length;
  const adminOdooCount = quotes.filter(q => q.odooStatus === 'PENDING_ENTRY' || (!q.odooStatus && Boolean(q.odooAssignedTo))).length;
  const adminArchiveCount = quotes.length;

  // Employee Counts
  const employeeInReviewCount = quotes.filter(q => q.preparedBy?.toLowerCase() === myUsername && q.status === 'PENDING_REVIEW').length;
  const employeeOdooDoneCount = quotes.filter(q => q.preparedBy?.toLowerCase() === myUsername && q.odooStatus === 'COMPLETED').length;
  const employeeHistoryCount = quotes.filter(q => q.preparedBy?.toLowerCase() === myUsername).length;

  // Clerk Counts
  const clerkPendingCount = quotes.filter(q => q.odooAssignedTo?.toLowerCase() === myUsername && q.odooStatus !== 'COMPLETED').length;
  const clerkCompletedCount = quotes.filter(q => (q.odooCompletedBy?.toLowerCase() === myUsername || q.odooAssignedTo?.toLowerCase() === myUsername) && q.odooStatus === 'COMPLETED').length;
  const clerkTotalAssignedCount = quotes.filter(q => q.odooAssignedTo?.toLowerCase() === myUsername).length;

  return (
    <div className="space-y-6">
      {/* Title & Stats Ribbon */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-1">
        <div>
          <div className="flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-primary" />
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">Quotes &amp; Review Queue</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {canReview 
              ? 'Review submitted quotes, assign Odoo queues, and explore all quote archives.'
              : isClerk
              ? 'Manage pending Odoo entries, record official Sales Order numbers, and archive assignments.'
              : 'Track submitted quotes in review, verify completed Odoo entries, and view quote history.'}
          </p>
        </div>

        {(currentUser?.role === 'SUPERADMIN' || currentUser?.role === 'ADMIN') && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { fetchStorageStats(); setShowFlushModal(true); }}
            className="gap-2 border-border/80 bg-card/40 backdrop-blur shadow-sm hover:border-primary/50 text-xs self-start md:self-auto cursor-pointer"
          >
            <Database className="w-3.5 h-3.5 text-primary" />
            <span>Storage &amp; Auto-Flush</span>
          </Button>
        )}
      </div>

      {/* Stats Counter Cards (Role-Tailored 3-Card Grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {canReview && (
          <>
            {/* Admin Card 1: Pending Review */}
            <Card 
              className={`border cursor-pointer transition-all duration-200 ${
                activeTab === 'review' 
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-2 ring-amber-500/20' 
                  : 'bg-card/40 border-border/70 hover:border-border'
              }`}
              onClick={() => handleTabChange('review')}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider font-bold text-amber-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Pending Review</span>
                  </div>
                  <div className="text-2xl font-black font-mono mt-1 text-foreground">
                    {adminPendingCount}
                  </div>
                </div>
                <div className="p-2.5 rounded-full bg-amber-500/20 text-amber-500">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Admin Card 2: Odoo Entry Queue */}
            <Card 
              className={`border cursor-pointer transition-all duration-200 ${
                activeTab === 'odoo' 
                  ? 'bg-indigo-500/10 border-indigo-500/50 shadow-md ring-2 ring-indigo-500/20' 
                  : 'bg-card/40 border-border/70 hover:border-border'
              }`}
              onClick={() => handleTabChange('odoo')}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider font-bold text-indigo-500 flex items-center gap-1.5">
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>Odoo Entry Queue</span>
                  </div>
                  <div className="text-2xl font-black font-mono mt-1 text-foreground">
                    {adminOdooCount}
                  </div>
                </div>
                <div className="p-2.5 rounded-full bg-indigo-500/20 text-indigo-500">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Admin Card 3: All Quotes Archive */}
            <Card 
              className={`border cursor-pointer transition-all duration-200 ${
                activeTab === 'all' 
                  ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md ring-2 ring-emerald-500/20' 
                  : 'bg-card/40 border-border/70 hover:border-border'
              }`}
              onClick={() => handleTabChange('all')}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider font-bold text-emerald-500 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>All Quotes Archive</span>
                  </div>
                  <div className="text-2xl font-black font-mono mt-1 text-foreground">
                    {adminArchiveCount}
                  </div>
                </div>
                <div className="p-2.5 rounded-full bg-emerald-500/20 text-emerald-500">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {isEmployee && (
          <>
            {/* Employee Card 1: In Review */}
            <Card 
              className={`border cursor-pointer transition-all duration-200 ${
                activeTab === 'review' 
                  ? 'bg-amber-500/10 border-amber-500/50 shadow-md ring-2 ring-amber-500/20' 
                  : 'bg-card/40 border-border/70 hover:border-border'
              }`}
              onClick={() => handleTabChange('review')}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider font-bold text-amber-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>In Review</span>
                  </div>
                  <div className="text-2xl font-black font-mono mt-1 text-foreground">
                    {employeeInReviewCount}
                  </div>
                </div>
                <div className="p-2.5 rounded-full bg-amber-500/20 text-amber-500">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Employee Card 2: Entered in Odoo (Done) */}
            <Card 
              className={`border cursor-pointer transition-all duration-200 ${
                activeTab === 'odoo_completed' 
                  ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md ring-2 ring-emerald-500/20' 
                  : 'bg-card/40 border-border/70 hover:border-border'
              }`}
              onClick={() => handleTabChange('odoo_completed')}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider font-bold text-emerald-500 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Entered in Odoo (Done)</span>
                  </div>
                  <div className="text-2xl font-black font-mono mt-1 text-foreground">
                    {employeeOdooDoneCount}
                  </div>
                </div>
                <div className="p-2.5 rounded-full bg-emerald-500/20 text-emerald-500">
                  <CheckSquare className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Employee Card 3: My Quotes History */}
            <Card 
              className={`border cursor-pointer transition-all duration-200 ${
                activeTab === 'my' 
                  ? 'bg-primary/10 border-primary/50 shadow-md ring-2 ring-primary/20' 
                  : 'bg-card/40 border-border/70 hover:border-border'
              }`}
              onClick={() => handleTabChange('my')}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider font-bold text-primary flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>My Quotes History</span>
                  </div>
                  <div className="text-2xl font-black font-mono mt-1 text-foreground">
                    {employeeHistoryCount}
                  </div>
                </div>
                <div className="p-2.5 rounded-full bg-primary/20 text-primary">
                  <FileText className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {isClerk && (
          <>
            {/* Clerk Card 1: Pending Odoo Entry */}
            <Card 
              className={`border cursor-pointer transition-all duration-200 ${
                activeTab === 'odoo' 
                  ? 'bg-indigo-500/10 border-indigo-500/50 shadow-md ring-2 ring-indigo-500/20' 
                  : 'bg-card/40 border-border/70 hover:border-border'
              }`}
              onClick={() => handleTabChange('odoo')}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider font-bold text-indigo-500 flex items-center gap-1.5">
                    <ClipboardCheck className="w-3.5 h-3.5" />
                    <span>Pending Odoo Entry</span>
                  </div>
                  <div className="text-2xl font-black font-mono mt-1 text-foreground">
                    {clerkPendingCount}
                  </div>
                </div>
                <div className="p-2.5 rounded-full bg-indigo-500/20 text-indigo-500">
                  <ClipboardCheck className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Clerk Card 2: Completed in Odoo */}
            <Card 
              className={`border cursor-pointer transition-all duration-200 ${
                activeTab === 'odoo_completed' 
                  ? 'bg-emerald-500/10 border-emerald-500/50 shadow-md ring-2 ring-emerald-500/20' 
                  : 'bg-card/40 border-border/70 hover:border-border'
              }`}
              onClick={() => handleTabChange('odoo_completed')}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider font-bold text-emerald-500 flex items-center gap-1.5">
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>Completed in Odoo</span>
                  </div>
                  <div className="text-2xl font-black font-mono mt-1 text-foreground">
                    {clerkCompletedCount}
                  </div>
                </div>
                <div className="p-2.5 rounded-full bg-emerald-500/20 text-emerald-500">
                  <CheckSquare className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            {/* Clerk Card 3: Total Assigned */}
            <Card 
              className={`border cursor-pointer transition-all duration-200 ${
                activeTab === 'all_assigned' 
                  ? 'bg-primary/10 border-primary/50 shadow-md ring-2 ring-primary/20' 
                  : 'bg-card/40 border-border/70 hover:border-border'
              }`}
              onClick={() => handleTabChange('all_assigned')}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-xs uppercase tracking-wider font-bold text-primary flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Total Assigned</span>
                  </div>
                  <div className="text-2xl font-black font-mono mt-1 text-foreground">
                    {clerkTotalAssignedCount}
                  </div>
                </div>
                <div className="p-2.5 rounded-full bg-primary/20 text-primary">
                  <FileText className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-card/40 border border-border/70 p-3 rounded-xl backdrop-blur">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by Quote #, Odoo Sales Order #, Customer, Staff..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-8 h-9 bg-background/80 text-sm"
          />
          {search && (
            <button 
              type="button" 
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground text-xs font-bold cursor-pointer"
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border border-border">
            {canReview && (
              <>
                <Button 
                  variant={activeTab === 'review' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => handleTabChange('review')}
                  className="h-7 text-xs font-semibold cursor-pointer"
                >
                  Pending ({adminPendingCount})
                </Button>
                <Button 
                  variant={activeTab === 'odoo' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => handleTabChange('odoo')}
                  className={`h-7 text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                    adminOdooCount > 0 ? 'text-indigo-500 font-bold' : ''
                  }`}
                >
                  <span>Odoo Queue</span>
                  {adminOdooCount > 0 && (
                    <span className="bg-indigo-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {adminOdooCount}
                    </span>
                  )}
                </Button>
                <Button 
                  variant={activeTab === 'all' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => handleTabChange('all')}
                  className="h-7 text-xs font-semibold cursor-pointer"
                >
                  All Quotes ({adminArchiveCount})
                </Button>
              </>
            )}

            {isEmployee && (
              <>
                <Button 
                  variant={activeTab === 'review' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => handleTabChange('review')}
                  className="h-7 text-xs font-semibold cursor-pointer"
                >
                  In Review ({employeeInReviewCount})
                </Button>
                <Button 
                  variant={activeTab === 'odoo_completed' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => handleTabChange('odoo_completed')}
                  className={`h-7 text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                    employeeOdooDoneCount > 0 ? 'text-emerald-500 font-bold' : ''
                  }`}
                >
                  <CheckSquare className="w-3 h-3 text-emerald-500" />
                  <span>Entered in Odoo ({employeeOdooDoneCount})</span>
                </Button>
                <Button 
                  variant={activeTab === 'my' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => handleTabChange('my')}
                  className="h-7 text-xs font-semibold cursor-pointer"
                >
                  My Quotes History ({employeeHistoryCount})
                </Button>
              </>
            )}

            {isClerk && (
              <>
                <Button 
                  variant={activeTab === 'odoo' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => handleTabChange('odoo')}
                  className={`h-7 text-xs font-semibold cursor-pointer flex items-center gap-1.5 ${
                    clerkPendingCount > 0 ? 'text-indigo-500 font-bold' : ''
                  }`}
                >
                  <ClipboardCheck className="w-3 h-3 text-indigo-500" />
                  <span>Pending Entry ({clerkPendingCount})</span>
                </Button>
                <Button 
                  variant={activeTab === 'odoo_completed' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => handleTabChange('odoo_completed')}
                  className="h-7 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <CheckSquare className="w-3 h-3 text-emerald-500" />
                  <span>Completed ({clerkCompletedCount})</span>
                </Button>
                <Button 
                  variant={activeTab === 'all_assigned' ? 'secondary' : 'ghost'} 
                  size="sm" 
                  onClick={() => handleTabChange('all_assigned')}
                  className="h-7 text-xs font-semibold cursor-pointer"
                >
                  Total Assigned ({clerkTotalAssignedCount})
                </Button>
              </>
            )}
          </div>

          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium focus:ring-1 focus:ring-primary outline-none cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="MODIFIED">Modified &amp; Approved</option>
            <option value="RETURNED">Returned</option>
            <option value="ODOO_PENDING">Odoo: Pending Entry</option>
            <option value="ODOO_COMPLETED">Odoo: Entered / Completed</option>
          </select>
        </div>
      </div>

      {/* Quotes List / Grid */}
      {loading ? (
        <div className="text-center py-16 text-muted-foreground animate-pulse text-sm">
          Loading quotes...
        </div>
      ) : sortedQuotes.length === 0 ? (
        <Card className="border-dashed bg-card/20">
          <CardContent className="p-12 text-center text-muted-foreground space-y-3">
            <FileText className="w-10 h-10 mx-auto text-muted-foreground/60" />
            <div className="text-base font-semibold text-foreground">No quotes found</div>
            <p className="text-xs max-w-sm mx-auto">
              {activeTab === 'review' 
                ? 'There are currently no quotes waiting for review.' 
                : 'No quotes match your current filter or search criteria.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sortedQuotes.map(quote => {
            const pricing = computeQuotePricing(quote);
            const finalTotalCents = pricing?.total || 0;

            const isPending = quote.status === 'PENDING_REVIEW';
            const isApproved = quote.status === 'APPROVED';
            const isModified = quote.status === 'MODIFIED';
            const isReturned = quote.status === 'RETURNED';

            const createdDate = new Date(quote.createdAt).toLocaleDateString('en-CA', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <Card 
                key={quote._id} 
                className="adaptive-card-container border-border/70 hover:border-primary/50 transition-all duration-200 bg-card/50 backdrop-blur shadow-sm hover:shadow"
              >
                <CardContent className="p-4 md:p-5 flex flex-col gap-3.5">
                  {/* ZONE 1: HEADER ROW (Info 70-75% on Left, Price 25-30% on Right) */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 cq-stack-compact cq-header-medium">
                    {/* Left: Quote Identification & Metadata */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-base font-bold text-foreground">
                          #{quote.quoteNumber}
                        </span>
                        <span className="font-semibold text-foreground truncate max-w-[220px] sm:max-w-md" title={quote.customerName}>
                          {quote.customerName}
                        </span>

                        {/* Status Badge */}
                        {isPending && (
                          <span className="bg-amber-500/15 text-amber-500 border border-amber-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{canReview ? 'Pending Review' : (quote.assignedTo ? `In Review with ${quote.assignedTo}` : 'In Review')}</span>
                          </span>
                        )}
                        {isApproved && (
                          <span className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approved by {quote.reviewedBy || quote.assignedTo || 'Admin'}</span>
                          </span>
                        )}
                        {isModified && (
                          <span className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-3 h-3" />
                            <span>Modified &amp; Approved by {quote.reviewedBy || quote.assignedTo || 'Admin'}</span>
                          </span>
                        )}
                        {isReturned && (
                          <span className="bg-destructive/15 text-destructive border border-destructive/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            <span>Returned for Revision</span>
                          </span>
                        )}
                        {/* Odoo Status Badge */}
                        {quote.odooAssignedTo && (
                          quote.odooStatus === 'COMPLETED' ? (
                            <span className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                              <CheckSquare className="w-3 h-3 text-emerald-500" />
                              <span>Entered in Odoo {quote.odooOrderNumber ? `(#${quote.odooOrderNumber})` : ''}</span>
                            </span>
                          ) : (
                            <span className="bg-indigo-500/15 text-indigo-500 border border-indigo-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                              <ClipboardCheck className="w-3 h-3 text-indigo-500" />
                              <span>Odoo Entry Pending ({quote.odooAssignedTo})</span>
                            </span>
                          )
                        )}

                        {quote.isStarred && (
                          <span className="text-amber-400" title="Starred / Protected from auto-flush">
                            <Star className="w-3.5 h-3.5 fill-amber-400" />
                          </span>
                        )}
                      </div>

                      {/* Metadata line: Prepared by, Date, Region, Windows */}
                      <div className="text-xs text-muted-foreground flex items-center gap-2.5 flex-wrap">
                        <span>Prepared by: <strong className="text-foreground">{quote.preparedBy}</strong></span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {createdDate}
                        </span>
                        {quote.taxTotals?.regionName && (
                          <>
                            <span>&bull;</span>
                            <span>Region: <strong className="text-foreground">{quote.taxTotals.regionName}</strong></span>
                          </>
                        )}
                        <span>&bull;</span>
                        <span>{quote.windows?.length || 0} Windows</span>
                      </div>
                    </div>

                    {/* Right: Financials / Price Badge */}
                    <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-1 shrink-0 bg-muted/40 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-0 border-border/40 cq-price-compact">
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Quote Total</span>
                      <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-foreground">
                        {formatMoney(finalTotalCents)}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-1.5 flex-wrap justify-end">
                        <span>Base: {formatMoney(pricing?.basePrice || 0)}</span>
                        {(pricing?.effectiveLabour || 0) > 0 && <span>&bull; Lab: {formatMoney(pricing?.effectiveLabour || 0)}</span>}
                        {(pricing?.effectiveJC || 0) > 0 && <span>&bull; J&amp;C: {formatMoney(pricing?.effectiveJC || 0)}</span>}
                      </div>
                    </div>
                  </div>

                  {/* ZONE 2: FULL-WIDTH BODY (Revision Notes, Preparer Notes, Dynamic Reviewer Notes) */}
                  {(quote.status === 'RETURNED' && quote.reviewerNotes) ||
                   (quote.preparerNotes && quote.status !== 'RETURNED') ||
                   (isModified || (quote.reviewChanges && quote.reviewChanges.length > 0)) ? (
                    <div className="space-y-2 pt-1">
                      {/* Return Reason from Reviewer if Returned */}
                      {quote.status === 'RETURNED' && quote.reviewerNotes && (
                        <div className="text-xs bg-amber-500/15 border border-amber-500/35 text-amber-950 dark:text-amber-200 p-3 rounded-xl font-medium flex items-start gap-2 shadow-xs animate-in fade-in">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-amber-900 dark:text-amber-300">
                              Revision Requested by {quote.reviewedBy || quote.assignedTo || 'Reviewer'}:
                            </span>
                            <p className="mt-0.5 italic text-foreground/90 font-normal">"{quote.reviewerNotes}"</p>
                          </div>
                        </div>
                      )}

                      {/* Preparer Notes Snippet (shown if not returned) */}
                      {quote.preparerNotes && quote.status !== 'RETURNED' && (
                        <div className="text-xs bg-muted/40 p-2.5 rounded-xl border border-border/60 text-muted-foreground italic flex items-start gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                          <span><strong>Note from {quote.preparedBy}:</strong> "{quote.preparerNotes}"</span>
                        </div>
                      )}

                      {/* Reviewer Changes Log (if modified) */}
                      {(isModified || (quote.reviewChanges && quote.reviewChanges.length > 0)) && (
                        <div className="text-xs bg-blue-50 text-blue-950 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-100 dark:border-blue-800 p-3 rounded-xl shadow-xs animate-in fade-in">
                          <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300 mb-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>What {quote.reviewedBy || quote.assignedTo || 'Admin'} Edited &amp; Approved:</span>
                          </div>
                          {quote.reviewChanges && quote.reviewChanges.length > 0 ? (
                            <ul className="list-disc pl-5 space-y-1 text-blue-800 dark:text-blue-200 font-medium">
                              {quote.reviewChanges.map((c: string, idx: number) => (
                                <li key={idx} className="leading-snug">{c}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-blue-700 dark:text-blue-300 italic">Price or configuration adjustments made during review.</p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null}

                  {/* ZONE 3: DEDICATED ACTION TOOLBAR (Footer) */}
                  <div className="pt-3 border-t border-border/50 flex flex-wrap items-center justify-between gap-2.5">
                    {/* Left Utility Actions: Star & Delete */}
                    <div className="flex items-center gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleToggleStar(quote._id, !!quote.isStarred)}
                        className="h-8 w-8 text-muted-foreground hover:text-amber-400 cursor-pointer"
                        title={quote.isStarred ? "Starred (Keep permanently)" : "Star to keep permanently"}
                      >
                        <Star className={`w-4 h-4 ${quote.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </Button>

                      {(isAdmin || quote.preparedBy === currentUser?.username) && !isClerk && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteQuote(quote._id, quote.quoteNumber)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive cursor-pointer"
                          title="Delete quote"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>

                    {/* Right Primary Actions */}
                    <div className="flex items-center gap-2 flex-wrap cq-actions-compact">
                      {isApproved || isModified ? (
                        <>
                          {/* Mark Entered in Odoo Button (visible if pending entry and assigned to user or Reviewer/Admin) */}
                          {quote.odooStatus === 'PENDING_ENTRY' && (canReview || quote.odooAssignedTo?.toLowerCase() === myUsername) && (
                            <Button 
                              variant="default" 
                              size="sm" 
                              onClick={() => { setOdooModalQuote(quote); setOdooOrderNum(quote.odooOrderNumber || ''); }}
                              className="gap-1.5 font-bold shadow-sm bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer text-xs h-8"
                              title="Confirm entered in Odoo and attached to physical file folder"
                            >
                              <CheckSquare className="w-3.5 h-3.5 mr-0.5" />
                              <span>Mark Entered in Odoo</span>
                            </Button>
                          )}

                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => handlePreviewQuote(quote)}
                            className="gap-1.5 font-bold shadow-sm bg-primary text-primary-foreground hover:bg-primary/90 cursor-pointer text-xs h-8"
                          >
                            <Printer className="w-3.5 h-3.5 mr-0.5" />
                            <span>Preview &amp; Print</span>
                          </Button>

                          {/* Only users with edit approved permissions can unlock; clerk is never shown edit */}
                          {canEditApproved && activeTab !== 'odoo' && !isClerk && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => onOpenQuote(quote._id, true, activeTab)}
                              className="gap-1 text-xs font-semibold bg-background/80 hover:border-amber-500/50 hover:text-amber-500 cursor-pointer h-8"
                              title="Edit details (Notes, Customer, custom pricing)"
                            >
                              <Edit3 className="w-3 h-3 mr-0.5" />
                              <span>Edit</span>
                            </Button>
                          )}

                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => onOpenQuote(quote._id, false, activeTab)}
                            className="gap-1 text-xs font-semibold bg-background/80 cursor-pointer h-8"
                          >
                            <span>View Details</span>
                            <ArrowRight className="w-3 h-3 ml-0.5" />
                          </Button>
                        </>
                      ) : (
                        <>
                          {isPending && canReview && (
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              onClick={() => { setSelectedQuoteForReview(quote); setReviewerNotes(''); }}
                              className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 text-xs font-bold cursor-pointer h-8"
                            >
                              Quick Approve
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handlePreviewQuote(quote)}
                            className="gap-1 bg-background/80 cursor-pointer text-xs h-8"
                            title="Preview & Print PDF"
                          >
                            <Printer className="w-3.5 h-3.5 mr-1" />
                            <span>Print</span>
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm" 
                            onClick={() => onOpenQuote(quote._id, false, activeTab)}
                            className="gap-1.5 font-bold shadow-sm cursor-pointer text-xs h-8"
                          >
                            <span>{isPending ? (canReview ? 'Open & Review' : 'View Quote') : isReturned ? 'Revise & Edit' : 'Open in Calculator'}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Storage & Auto-Flush Modal */}
      {showFlushModal && storageStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-md w-full border border-border space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Storage &amp; Auto-Flush Manager</h3>
                <p className="text-xs text-muted-foreground">Automatic retention policies protect database limits.</p>
              </div>
            </div>

            <div className="space-y-3 bg-muted/30 p-3.5 rounded-xl border border-border text-xs">
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span className="text-muted-foreground">Total Quotes Saved:</span>
                <span className="font-bold font-mono">{storageStats.totalQuotes}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span className="text-muted-foreground">Starred / Protected Quotes:</span>
                <span className="font-bold font-mono text-amber-500">{storageStats.starredQuotes}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span className="text-muted-foreground">Quotes Pending Review:</span>
                <span className="font-bold font-mono text-primary">{storageStats.pendingQuotes}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span className="text-muted-foreground">Retention Policy:</span>
                <span className="font-bold font-mono">{storageStats.retentionDays} Days</span>
              </div>
              <div className="flex justify-between items-center py-1 text-destructive">
                <span>Eligible for Flush Right Now:</span>
                <span className="font-bold font-mono">{storageStats.eligibleForFlush}</span>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• <strong>Starred quotes</strong> are never deleted automatically.</p>
              <p>• <strong>Pending review quotes</strong> are protected from cleanup.</p>
              <p>• The system automatically runs a cleanup check when new quotes are submitted.</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowFlushModal(false)}
                disabled={flushing}
                className="cursor-pointer"
              >
                Close
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={handleFlushStorage}
                disabled={flushing || storageStats.eligibleForFlush === 0}
                className="gap-1.5 font-bold cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{flushing ? 'Cleaning...' : `Flush ${storageStats.eligibleForFlush} Old Quotes`}</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Review Dialog Modal */}
      {selectedQuoteForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-md w-full border border-border space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Quick Review: Quote #{selectedQuoteForReview.quoteNumber}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Customer: <strong>{selectedQuoteForReview.customerName}</strong> &bull; Prepared by: <strong>{selectedQuoteForReview.preparedBy}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quickNotes" className="text-xs font-semibold">
                Reviewer Instructions / Notes
              </Label>
              <textarea
                id="quickNotes"
                rows={3}
                placeholder="Optional notes or instructions for the preparer..."
                value={reviewerNotes}
                onChange={e => setReviewerNotes(e.target.value)}
                className="w-full text-xs bg-background border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="quickOdooAssignee" className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                <ClipboardCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Assign for Odoo Entry &amp; Physical Filing</span>
              </Label>
              <select
                id="quickOdooAssignee"
                value={selectedOdooClerk}
                onChange={e => setSelectedOdooClerk(e.target.value)}
                className="w-full text-xs bg-background border border-border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="">Do not assign yet (Approve only)</option>
                {staffList.map((s: any) => (
                  <option key={s._id || s.username} value={s.username}>
                    {s.username} ({s.role || 'Staff'})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setSelectedQuoteForReview(null); setSelectedOdooClerk(''); }}
                disabled={reviewingAction}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleQuickApprove(selectedQuoteForReview, 'RETURNED')}
                disabled={reviewingAction}
                className="text-destructive hover:bg-destructive/10 border-destructive/30 font-semibold cursor-pointer"
              >
                Return with Note
              </Button>
              <Button 
                size="sm" 
                onClick={() => handleQuickApprove(selectedQuoteForReview, 'APPROVED')}
                disabled={reviewingAction}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                {reviewingAction ? 'Saving...' : 'Approve Quote'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Preview Modal */}
      {previewQuote && (
        <QuotePreviewModal
          isOpen={isPreviewOpen}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewQuote(null);
          }}
          customerName={previewQuote.customerName}
          quoteNumber={previewQuote.quoteNumber}
          windows={previewQuote.windows || []}
          taxTotals={previewQuote.taxTotals}
          quoteResult={previewQuote.quoteResult}
          activePromo={previewQuote.quoteResult?.promoDiscount > 0 ? {
            name: previewQuote.quoteResult?.promoName || 'Applied Promo',
            discount: previewQuote.quoteResult.promoDiscount
          } : null}
          basePrice={previewQuote.quoteResult?.base || 0}
          surcharge={previewQuote.quoteResult?.surcharge || 0}
          wantsUpgrade={false}
          shownUpgrade={0}
          hstRate={previewQuote.taxTotals?.hstRate !== undefined ? previewQuote.taxTotals.hstRate : 13}
          total={previewQuote.quoteSummaryTotal || 0}
          beforeTaxDiscount={0}
          afterDiscount={0}
          firstPayment={Math.floor((previewQuote.quoteSummaryTotal || 0) / 2)}
          secondPayment={(previewQuote.quoteSummaryTotal || 0) - Math.floor((previewQuote.quoteSummaryTotal || 0) / 2)}
          regionName={previewQuote.taxTotals?.regionName}
          includeLabourInPromo={previewQuote.includeLabourInPromo !== false}
          includeMiscInPromo={previewQuote.includeMiscInPromo !== false}
          includeJCInPromo={previewQuote.includeJCInPromo !== false}
          effectiveJC={previewQuote.customJC ? Math.round(Number(previewQuote.customJC) * 100) : undefined}
          effectiveMisc={previewQuote.customMisc ? Math.round(Number(previewQuote.customMisc) * 100) : undefined}
          effectiveLabour={previewQuote.customLabour ? Math.round(Number(previewQuote.customLabour) * 100) : undefined}
          template={previewTemplate}
          fontSize={previewFontSize}
          spacing={previewSpacing}
          quoteNotes={previewNotes}
          preparedBy={previewQuote.preparedBy}
          onTemplateChange={setPreviewTemplate}
          onFontSizeChange={setPreviewFontSize}
          onSpacingChange={setPreviewSpacing}
          onQuoteNotesChange={
            !canReview && previewQuote?.odooAssignedTo?.toLowerCase() === currentUser?.username?.toLowerCase()
              ? undefined
              : setPreviewNotes
          }
        />
      )}

      {/* Mark Entered in Odoo Confirmation Modal */}
      {odooModalQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-md w-full border border-border space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border pb-3">
              <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-500">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">
                  Confirm Odoo Entry &bull; Quote #{odooModalQuote.quoteNumber}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Customer: <strong>{odooModalQuote.customerName}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="odooOrderRef" className="text-xs font-semibold">
                Odoo Sales Order # (Optional Reference)
              </Label>
              <Input
                id="odooOrderRef"
                placeholder="e.g. SO-10492"
                value={odooOrderNum}
                onChange={e => setOdooOrderNum(e.target.value)}
                className="text-xs font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Confirm that you have entered all order specifications into the Odoo software and attached the printed quote to the physical shop folder.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setOdooModalQuote(null); setOdooOrderNum(''); }}
                disabled={markingOdoo}
                className="cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleConfirmOdooEntry}
                disabled={markingOdoo}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
              >
                {markingOdoo ? 'Confirming...' : 'Confirm Odoo Entry'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
