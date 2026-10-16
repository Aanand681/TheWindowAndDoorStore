"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  WindowItem,
  DBPromo,
  formatMoney,
  toCents,
  calculatePromo,
  calculateUpgrade,
} from '@/lib/promo-logic';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Calculator, Tag, Info, Receipt, Component, FileUp, UserCircle, LogOut, Eye, Download, RotateCcw, Bold, List, Send, Inbox, CheckCircle2, Clock, AlertCircle, Sparkles, MessageSquare, AlertTriangle, Save, Share2, Printer, Edit3, Check, ShieldCheck, ChevronDown, CheckSquare, ClipboardCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import NotificationBell from '@/components/NotificationBell';
import UserProfileMenu from '@/components/UserProfileMenu';
import { cachedFetch, getCachedData } from '@/lib/client-cache';
import { readPdfItems, parseManufacturerPdfItems, extractPdfMetadata } from '@/lib/pdf-parser';
import { useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaxCalculatorTab from '@/components/TaxCalculatorTab';
import QuotesTab, { QuotesSubTabType } from '@/components/QuotesTab';
import QuoteInvoice, { QuoteTemplateType } from '@/components/QuoteInvoice';
import QuotePreviewModal from '@/components/QuotePreviewModal';
import QuoteNotesEditor from '@/components/QuoteNotesEditor';
import { detectQuoteChanges } from '@/lib/quote-diff';

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

type UIWindowItem = {
  id: string;
  qty: string;
  base: string;
  argon: string;
  solar: string;
  triple: string;
  w?: string;
  h?: string;
  color?: string; // 'White' | 'Painted'
};

export default function PromoCalculator() {
  const router = useRouter();
  const [windows, setWindows] = useState<UIWindowItem[]>([
    { id: generateId(), qty: '1', base: '', argon: '', solar: '', triple: '', w: '', h: '', color: 'White' },
  ]);
  const [surchargeRate, setSurchargeRate] = useState<number>(() => {
    const cached = getCachedData<any>('/api/settings');
    return cached?.surchargeRate !== undefined ? cached.surchargeRate : 8;
  });
  const [customerName, setCustomerName] = useState('');
  const [quoteNumber, setQuoteNumber] = useState('');
  
  // Dynamic Promos State
  const [availablePromos, setAvailablePromos] = useState<DBPromo[]>(() => {
    return getCachedData<DBPromo[]>('/api/promos?active=true') || [];
  });
  const [activePromoId, setActivePromoId] = useState<string>('none');
  const [lockedPromoId, setLockedPromoId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('promo');

  // Odoo Post-Approval Workflow State
  const [showApproveOdooModal, setShowApproveOdooModal] = useState(false);
  const [selectedOdooClerk, setSelectedOdooClerk] = useState('');
  const [showCompleteOdooModal, setShowCompleteOdooModal] = useState(false);
  const [odooOrderNumberInput, setOdooOrderNumberInput] = useState('');

  // Tax and Calculation State
  const [taxTotals, setTaxTotals] = useState<any>(null);
  const taxJC = taxTotals ? Math.round(taxTotals.finalJC * 100) : 0;
  const taxMisc = taxTotals ? Math.round(taxTotals.finalMisc * 100) : 0;
  const taxLabour = taxTotals ? Math.round(taxTotals.finalLabour * 100) : 0;
  
  // Custom Editable Overrides for Final Prices
  const [customJC, setCustomJC] = useState<string>('');
  const [customMisc, setCustomMisc] = useState<string>('');
  const [customLabour, setCustomLabour] = useState<string>('');

  const effectiveJC = customJC.trim() !== '' ? Math.round(Number(customJC) * 100) : taxJC;
  const effectiveMisc = customMisc.trim() !== '' ? Math.round(Number(customMisc) * 100) : taxMisc;
  const effectiveLabour = customLabour.trim() !== '' ? Math.round(Number(customLabour) * 100) : taxLabour;

  // Preview Modal & Customizer State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [quoteTemplate, setQuoteTemplate] = useState<QuoteTemplateType>('modern');
  const [quoteFontSize, setQuoteFontSize] = useState<number>(11.5);
  const [quoteSpacing, setQuoteSpacing] = useState<number>(1.0);
  const [quoteNotes, setQuoteNotes] = useState<string>('');

  const [wantsUpgrade, setWantsUpgrade] = useState<boolean>(false);
  const [includeLabourInPromo, setIncludeLabourInPromo] = useState<boolean>(true);
  const [includeMiscInPromo, setIncludeMiscInPromo] = useState<boolean>(true);
  const [includeJCInPromo, setIncludeJCInPromo] = useState<boolean>(true);
  const [hstRate, setHstRate] = useState<number>(13);
  
  const windowEndRef = useRef<HTMLDivElement>(null);

  // Derived Values
  const [quoteResult, setQuoteResult] = useState<ReturnType<typeof calculatePromo> | null>(null);
  const [compareOptions, setCompareOptions] = useState<ReturnType<typeof calculatePromo>[]>([]);

  // Import State
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User State
  const [user, setUser] = useState<{
    username: string;
    role: string;
    department?: string;
    departmentPermissions?: any;
    favoriteTemplate?: string;
  } | null>(
    () => getCachedData<any>('/api/profile') || null
  );
  const [showGreeting, setShowGreeting] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const alreadyShown = sessionStorage.getItem('greeting_shown_session');
      if (!alreadyShown) {
        sessionStorage.setItem('greeting_shown_session', 'true');
        setShowGreeting(true);
        const timer = setTimeout(() => {
          setShowGreeting(false);
        }, 10000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Review Mode & Submission State
  const [reviewQuoteId, setReviewQuoteId] = useState<string | null>(null);
  const [reviewQuote, setReviewQuote] = useState<any | null>(null);
  const [originalSnapshot, setOriginalSnapshot] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [reviewActionLoading, setReviewActionLoading] = useState(false);
  const [pendingReviewCount, setPendingReviewCount] = useState<number>(0);
  const [quotesSubTab, setQuotesSubTab] = useState<QuotesSubTabType>('review');

  const switchTab = (tab: string, sub?: QuotesSubTabType) => {
    setShowGreeting(false);
    setActiveTab(tab);
    if (sub) {
      setQuotesSubTab(sub);
    }
    if (typeof window !== 'undefined') {
      if (tab === 'quotes') {
        const targetSub = sub || quotesSubTab || 'my';
        window.history.replaceState({}, '', `/?tab=quotes&sub=${targetSub}`);
      } else if (tab === 'tax') {
        if (reviewQuoteId) {
          window.history.replaceState({}, '', `/?reviewQuoteId=${reviewQuoteId}&tab=tax${isEditMode ? '&edit=true' : ''}`);
        } else {
          window.history.replaceState({}, '', '/?tab=tax');
        }
      } else {
        // tab === 'promo' (Calculator)
        if (reviewQuoteId) {
          window.history.replaceState({}, '', `/?reviewQuoteId=${reviewQuoteId}${isEditMode ? '&edit=true' : ''}`);
        } else {
          window.history.replaceState({}, '', '/');
        }
      }
    }
  };

  const summaryWindowGroups = useMemo(() => {
    const map = new Map<string, { pane: 'Dual' | 'Triple'; color: 'White' | 'Painted'; qty: number; baseCents: number }>();
    windows.forEach(w => {
      const q = Math.max(1, Number(w.qty) || 1);
      const itemBase = toCents(w.base);
      const isTriple = (Number(w.triple) > 0) || (toCents(w.triple) > 0);
      const pane: 'Dual' | 'Triple' = isTriple ? 'Triple' : 'Dual';
      const color: 'White' | 'Painted' = (w.color && w.color.toLowerCase() === 'painted') ? 'Painted' : 'White';
      const key = `${pane}_${color}`;
      const existing = map.get(key);
      if (existing) {
        existing.qty += q;
        existing.baseCents += itemBase;
      } else {
        map.set(key, { pane, color, qty: q, baseCents: itemBase });
      }
    });
    const order = ['Dual_White', 'Dual_Painted', 'Triple_White', 'Triple_Painted'];
    const groups: { key: string; pane: string; color: string; qty: number; baseCents: number }[] = [];
    order.forEach(k => {
      const g = map.get(k);
      if (g && g.qty > 0) groups.push({ key: k, ...g });
    });
    return groups;
  }, [windows]);
  
  // Submit for Review Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [assignedReviewer, setAssignedReviewer] = useState('Admin');
  const [preparerNotes, setPreparerNotes] = useState('');
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);

  // Reassign / Forward Quote Modal State
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignTo, setReassignTo] = useState('Admin');
  const [reassignNotes, setReassignNotes] = useState('');

  // Return with Note Custom Modal State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnNotes, setReturnNotes] = useState('');

  // Exit Review Confirmation for PDF Import
  const [showExitReviewForPdfModal, setShowExitReviewForPdfModal] = useState(false);

  // Fetch Live Promos & User
  useEffect(() => {
    cachedFetch<DBPromo[]>('/api/promos?active=true')
      .then(data => {
        if (Array.isArray(data)) setAvailablePromos(data);
      })
      .catch(() => {});
      
    cachedFetch<any>('/api/profile')
      .then(data => {
        if (data) {
          setUser(data);
          if (data.favoriteTemplate && ['modern', 'executive', 'cards'].includes(data.favoriteTemplate)) {
            setQuoteTemplate(data.favoriteTemplate);
          }
        }
      })
      .catch((err) => {
        if (err?.message?.includes('401')) {
          router.replace('/login');
        }
      });

    cachedFetch<any>('/api/settings')
      .then(data => {
        if (data && data.surchargeRate !== undefined) {
          setSurchargeRate(data.surchargeRate);
        }
      })
      .catch(() => {});

    // Fetch review and odoo badge count
    fetch('/api/quotes?countOnly=true')
      .then(res => res.json())
      .then(data => {
        const count = data.totalActionableCount ?? data.pendingReviewCount;
        if (count !== undefined) {
          setPendingReviewCount(count);
        }
      })
      .catch(console.error);

    // Fetch all eligible staff for assignment (excluding SUPERADMIN cheeku)
    fetch(`/api/users?assignees=true&t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const eligible = data.filter(d => 
            d.role !== 'SUPERADMIN' && 
            d.role !== 'superadmin' &&
            d.username?.toLowerCase() !== 'cheeku' &&
            !d.username?.toLowerCase().includes('superadmin')
          );
          setStaffList(eligible);
          if (eligible.length > 0) {
            setAssignedReviewer(eligible[0].username);
            setReassignTo(eligible[0].username);
          } else {
            setAssignedReviewer('Admin');
            setReassignTo('Admin');
          }
        }
      })
      .catch(console.error);

    // Check if URL has ?reviewQuoteId=... or ?tab=...
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'quotes' || tabParam === 'tax' || tabParam === 'promo') {
        setActiveTab(tabParam);
      }
      const subParam = params.get('sub') as any;
      if (subParam && ['odoo', 'review', 'my', 'all', 'odoo_completed', 'all_assigned'].includes(subParam)) {
        setQuotesSubTab(subParam);
      }
      const qId = params.get('reviewQuoteId') || params.get('quoteId');
      if (params.get('edit') === 'true') {
        setIsEditMode(true);
      }
      if (qId) {
        setReviewQuoteId(qId);
        fetch(`/api/quotes/${qId}?t=${Date.now()}`, { cache: 'no-store' })
          .then(r => r.json())
          .then(q => {
            if (q && q._id) {
              setReviewQuote(q);
              setOriginalSnapshot(q.initialSnapshot || q);
              if (q.windows?.length) setWindows(q.windows);
              if (q.customerName) setCustomerName(q.customerName);
              if (q.quoteNumber) setQuoteNumber(q.quoteNumber);
              if (q.quoteNotes) setQuoteNotes(q.quoteNotes);
              if (q.surchargeRate !== undefined) setSurchargeRate(q.surchargeRate);
              if (q.activePromoId) {
                setActivePromoId(q.activePromoId);
                setLockedPromoId(q.activePromoId);
              }
              if (q.customJC !== undefined) setCustomJC(String(q.customJC || ''));
              if (q.customMisc !== undefined) setCustomMisc(String(q.customMisc || ''));
              if (q.customLabour !== undefined) setCustomLabour(String(q.customLabour || ''));
              if (q.includeJCInPromo !== undefined) setIncludeJCInPromo(Boolean(q.includeJCInPromo));
              if (q.includeMiscInPromo !== undefined) setIncludeMiscInPromo(Boolean(q.includeMiscInPromo));
              if (q.includeLabourInPromo !== undefined) setIncludeLabourInPromo(Boolean(q.includeLabourInPromo));
              if (q.taxTotals) {
                setTaxTotals({ ...q.taxTotals, _quoteId: q._id, _quoteNumber: q.quoteNumber });
              }
              toast.info(`Loaded Quote #${q.quoteNumber} in Review Mode`);
            }
          })
          .catch(console.error);
      }
    }

    const handleLoadQuoteEvent = (e: any) => {
      const qId = e.detail?.quoteId;
      const originSubTab = e.detail?.originSubTab;
      if (qId) {
        handleOpenQuoteFromTab(qId, false, originSubTab);
      }
    };
    window.addEventListener('load-review-quote', handleLoadQuoteEvent);

    const refreshPendingCount = () => {
      fetch('/api/quotes?countOnly=true')
        .then(res => res.json())
        .then(data => {
          const count = data.totalActionableCount ?? data.pendingReviewCount;
          if (count !== undefined) {
            setPendingReviewCount(count);
          }
        })
        .catch(console.error);
    };
    window.addEventListener('quote-count-updated', refreshPendingCount);
    window.addEventListener('focus', refreshPendingCount);

    return () => {
      window.removeEventListener('load-review-quote', handleLoadQuoteEvent);
      window.removeEventListener('quote-count-updated', refreshPendingCount);
      window.removeEventListener('focus', refreshPendingCount);
    };
  }, []);

  const handleOpenQuoteFromTab = (qId: string, isEdit?: boolean, originSubTab?: QuotesSubTabType) => {
    if (originSubTab) {
      setQuotesSubTab(originSubTab);
    }
    setShowGreeting(false);
    setReviewQuoteId(qId);
    setActiveTab('promo');
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', `/?reviewQuoteId=${qId}${isEdit ? '&edit=true' : ''}`);
    }
    fetch(`/api/quotes/${qId}?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(q => {
        if (q && q._id) {
          const deptPerms = user?.departmentPermissions || {};
          const isSuperAdmin = Boolean(user && user.role === 'SUPERADMIN');
          const isAdmin = Boolean(user && (user.role === 'ADMIN' || isSuperAdmin));
          const canReview = Boolean(isAdmin || deptPerms.canReviewQuote || deptPerms.canApproveQuote);
          const canEditApproved = Boolean(isAdmin || deptPerms.canEditApprovedQuote);

          const isClerk = Boolean(
            !canReview && (user?.department === 'CLERK' || deptPerms.canMarkOdooEntry)
          );
          const isApproved = q.status === 'APPROVED' || q.status === 'MODIFIED';
          // Only Admin or users with canEditApprovedQuote permission can edit approved quotes; Odoo clerks can strictly NEVER edit
          const allowEdit = Boolean(isEdit && !isClerk && (isApproved ? canEditApproved : true));
          setIsEditMode(allowEdit);

          setReviewQuote(q);
          setOriginalSnapshot(q.initialSnapshot || q);
          if (q.windows?.length) setWindows(q.windows);
          if (q.customerName) setCustomerName(q.customerName);
          if (q.quoteNumber) setQuoteNumber(q.quoteNumber);
          if (q.quoteNotes) setQuoteNotes(q.quoteNotes);
          if (q.surchargeRate !== undefined) setSurchargeRate(q.surchargeRate);
          if (q.activePromoId) {
            setActivePromoId(q.activePromoId);
            setLockedPromoId(q.activePromoId);
          }
          if (q.customJC !== undefined) setCustomJC(String(q.customJC || ''));
          if (q.customMisc !== undefined) setCustomMisc(String(q.customMisc || ''));
          if (q.customLabour !== undefined) setCustomLabour(String(q.customLabour || ''));
          if (q.includeJCInPromo !== undefined) setIncludeJCInPromo(Boolean(q.includeJCInPromo));
          if (q.includeMiscInPromo !== undefined) setIncludeMiscInPromo(Boolean(q.includeMiscInPromo));
          if (q.includeLabourInPromo !== undefined) setIncludeLabourInPromo(Boolean(q.includeLabourInPromo));
          if (q.taxTotals) {
            setTaxTotals({ ...q.taxTotals, _quoteId: q._id, _quoteNumber: q.quoteNumber });
          }
          toast.info(allowEdit ? `Loaded Quote #${q.quoteNumber} in Edit Mode` : `Loaded Quote #${q.quoteNumber} in Review Mode`);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      })
      .catch(console.error);
  };

  const handleSubmitForReview = async () => {
    if (!quoteNumber.trim() || !customerName.trim()) {
      toast.error("Please enter a Quote Number and Customer Name");
      return;
    }
    setSubmittingQuote(true);
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quoteNumber,
          customerName,
          assignedTo: assignedReviewer,
          preparerNotes,
          windows,
          taxTotals,
          quoteResult,
          quoteNotes,
          surchargeRate,
          activePromoId,
          customJC,
          customMisc,
          customLabour,
          includeJCInPromo,
          includeMiscInPromo,
          includeLabourInPromo,
          quoteSummaryTotal: total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit quote');
      toast.success(`Quote #${quoteNumber} submitted to ${assignedReviewer} for review!`);
      setShowSubmitModal(false);
      setPreparerNotes('');
      window.dispatchEvent(new CustomEvent('quote-count-updated'));
      fetch('/api/quotes?countOnly=true')
        .then(res => res.json())
        .then(d => {
          const count = d?.totalActionableCount ?? d?.pendingReviewCount;
          if (count !== undefined) {
            setPendingReviewCount(count);
          }
        })
        .catch(console.error);

    } catch (err: any) {
      toast.error(err.message || 'Failed to submit quote');
    } finally {
      setSubmittingQuote(false);
    }
  };

  const handleSaveQuotePrices = async () => {
    if (!reviewQuoteId) return;
    setReviewActionLoading(true);
    try {
      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          quoteNumber,
          windows,
          taxTotals,
          quoteResult,
          quoteNotes,
          surchargeRate,
          activePromoId,
          customJC,
          customMisc,
          customLabour,
          includeJCInPromo,
          includeMiscInPromo,
          includeLabourInPromo,
          quoteSummaryTotal: total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save changes');
      toast.success(`Quote #${quoteNumber} changes saved successfully!`);
      if (data.quote) {
        setReviewQuote(data.quote);
        if (data.quote.initialSnapshot) {
          setOriginalSnapshot(data.quote.initialSnapshot);
        }
      }
      setIsEditMode(false);
    } catch (err: any) {
      toast.error(err.message || 'Failed to save price updates');
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleCancelEdits = () => {
    if (!reviewQuote) {
      setIsEditMode(false);
      return;
    }
    if (reviewQuote.windows?.length) setWindows(reviewQuote.windows);
    if (reviewQuote.customerName) setCustomerName(reviewQuote.customerName);
    if (reviewQuote.quoteNumber) setQuoteNumber(reviewQuote.quoteNumber);
    if (reviewQuote.quoteNotes !== undefined) setQuoteNotes(reviewQuote.quoteNotes);
    if (reviewQuote.surchargeRate !== undefined) setSurchargeRate(reviewQuote.surchargeRate);
    if (reviewQuote.activePromoId) {
      setActivePromoId(reviewQuote.activePromoId);
      setLockedPromoId(reviewQuote.activePromoId);
    }
    setCustomJC(String(reviewQuote.customJC || ''));
    setCustomMisc(String(reviewQuote.customMisc || ''));
    setCustomLabour(String(reviewQuote.customLabour || ''));
    setIncludeJCInPromo(reviewQuote.includeJCInPromo !== false);
    setIncludeMiscInPromo(reviewQuote.includeMiscInPromo !== false);
    setIncludeLabourInPromo(reviewQuote.includeLabourInPromo !== false);
    if (reviewQuote.taxTotals) {
      setTaxTotals({ ...reviewQuote.taxTotals, _quoteId: reviewQuote._id, _quoteNumber: reviewQuote.quoteNumber });
    }
    setIsEditMode(false);
    toast.info("Edits cancelled. Reverted back to saved quote.");
  };

  const handleApproveReviewQuote = () => {
    if (!reviewQuoteId) return;
    setSelectedOdooClerk('');
    setShowApproveOdooModal(true);
  };

  const confirmApproveReviewQuote = async () => {
    if (!reviewQuoteId) return;
    setReviewActionLoading(true);

    const currentQuoteState = {
      windows,
      taxTotals,
      quoteResult,
      quoteNotes,
      surchargeRate,
      activePromoId,
      customJC,
      customMisc,
      customLabour,
      includeJCInPromo,
      includeMiscInPromo,
      includeLabourInPromo,
      quoteSummaryTotal: total,
    };

    const reviewChanges = detectQuoteChanges(originalSnapshot, currentQuoteState);
    const finalStatus = reviewChanges.length > 0 ? 'MODIFIED' : 'APPROVED';

    try {
      const payload: any = {
        status: finalStatus,
        reviewChanges,
        reviewerNotes: `Reviewed and approved by ${user?.username || 'Admin'}`,
        windows,
        taxTotals,
        quoteResult,
        quoteNotes,
        surchargeRate,
        activePromoId,
        customJC,
        customMisc,
        customLabour,
        includeJCInPromo,
        includeMiscInPromo,
        includeLabourInPromo,
        quoteSummaryTotal: total,
      };
      if (selectedOdooClerk) {
        payload.odooAssignedTo = selectedOdooClerk;
      }

      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve');
      toast.success(
        selectedOdooClerk
          ? `Quote #${quoteNumber} approved & assigned to ${selectedOdooClerk} for Odoo entry!`
          : finalStatus === 'MODIFIED'
            ? `Quote #${quoteNumber} modified, saved, & approved!`
            : `Quote #${quoteNumber} approved!`
      );
      setShowApproveOdooModal(false);
      handleExitReview();
    } catch (err: any) {
      toast.error(err.message || 'Failed to approve quote');
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleCompleteOdooEntry = async () => {
    if (!reviewQuoteId) return;
    setReviewActionLoading(true);
    try {
      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          odooStatus: 'COMPLETED',
          odooOrderNumber: odooOrderNumberInput.trim() || undefined,
        }),
      });
      if (res.ok) {
        toast.success(`Quote #${reviewQuote.quoteNumber} marked as entered in Odoo!`);
        setShowCompleteOdooModal(false);
        handleExitReview();
      } else {
        toast.error('Failed to update Odoo status');
      }
    } catch {
      toast.error('Failed to update Odoo status');
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleReturnReviewQuote = () => {
    setReturnNotes('');
    setShowReturnModal(true);
  };

  const submitReturnReviewQuote = async () => {
    if (!reviewQuoteId) return;
    if (!returnNotes.trim()) {
      toast.error("Please enter revision instructions for the preparer.");
      return;
    }
    setReviewActionLoading(true);
    try {
      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'RETURNED',
          reviewerNotes: returnNotes.trim(),
        }),
      });
      if (res.ok) {
        toast.info(`Quote returned to ${reviewQuote.preparedBy}`);
        setShowReturnModal(false);
        handleExitReview();
      }
    } catch (err) {
      toast.error('Failed to return quote');
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleExitReview = () => {
    setIsEditMode(false);
    setReviewQuote(null);
    setReviewQuoteId(null);
    setOriginalSnapshot(null);
    setWindows([{ id: generateId(), qty: '1', base: '', argon: '', solar: '', triple: '', w: '', h: '', color: 'White' }]);
    setCustomerName('');
    setQuoteNumber('');
    setQuoteNotes('');
    setCustomJC('');
    setCustomMisc('');
    setCustomLabour('');
    setIncludeJCInPromo(true);
    setIncludeMiscInPromo(true);
    setIncludeLabourInPromo(true);
    setSurchargeRate(8);
    setLockedPromoId(null);
    setTaxTotals(null);
    const deptPerms = user?.departmentPermissions || {};
    const isAdminUser = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
    const canReview = Boolean(isAdminUser || deptPerms.canReviewQuote || deptPerms.canApproveQuote);
    const isClerk = Boolean(user?.department === 'CLERK' || (deptPerms.canMarkOdooEntry && !canReview));
    
    let defaultTab: string = 'my';
    if (canReview) defaultTab = 'review';
    else if (isClerk) defaultTab = 'odoo';

    const targetSubTab = quotesSubTab || defaultTab;
    setQuotesSubTab(targetSubTab);
    setActiveTab('quotes');
    if (typeof window !== 'undefined') {
      window.history.replaceState({}, '', `/?tab=quotes&sub=${targetSubTab}`);
    }
    const tabName = targetSubTab === 'review'
      ? 'Pending Review queue'
      : targetSubTab === 'odoo'
      ? 'Odoo Entry queue'
      : targetSubTab === 'odoo_completed'
      ? 'Completed in Odoo'
      : targetSubTab === 'all'
      ? 'All Quotes'
      : targetSubTab === 'all_assigned'
      ? 'Total Assigned'
      : 'your Quote History';
    toast.info(`Exited review mode. Returned to ${tabName}.`);
  };

  useEffect(() => {
    const handleQuoteDeleted = (e: any) => {
      const deletedId = e.detail?.quoteId;
      const deletedNum = e.detail?.quoteNumber;
      if (deletedId && reviewQuoteId === deletedId) {
        toast.warning(`Quote #${deletedNum || ''} was deleted. Returning to quote list.`);
        handleExitReview();
      }
    };
    window.addEventListener('quote-deleted', handleQuoteDeleted);
    return () => window.removeEventListener('quote-deleted', handleQuoteDeleted);
  }, [reviewQuoteId, quotesSubTab]);


  const handlePdfImportClick = () => {
    if (reviewQuote) {
      setShowExitReviewForPdfModal(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleExitReviewAndImportPdf = () => {
    setShowExitReviewForPdfModal(false);
    handleExitReview();
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handleResubmitReturnedQuote = async () => {
    if (!reviewQuoteId) return;
    setReviewActionLoading(true);
    try {
      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'PENDING_REVIEW',
          reviewerNotes: '',
          windows,
          taxTotals,
          quoteResult,
          quoteNotes,
          surchargeRate,
          activePromoId,
          customJC,
          customMisc,
          customLabour,
          includeJCInPromo,
          includeMiscInPromo,
          includeLabourInPromo,
          quoteSummaryTotal: total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resubmit quote');
      toast.success(`Quote #${quoteNumber} resubmitted to ${reviewQuote.assignedTo || 'reviewer'} for review!`);
      handleExitReview();
    } catch (err: any) {
      toast.error(err.message || 'Failed to resubmit quote');
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleReassignQuote = async () => {
    if (!reviewQuoteId || !reassignTo) return;
    setReviewActionLoading(true);
    try {
      const updatedNotes = reassignNotes.trim()
        ? (reviewQuote.preparerNotes ? `${reviewQuote.preparerNotes} | Forwarded to ${reassignTo}: ${reassignNotes.trim()}` : `Forwarded to ${reassignTo}: ${reassignNotes.trim()}`)
        : reviewQuote.preparerNotes;

      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignedTo: reassignTo,
          status: 'PENDING_REVIEW',
          preparerNotes: updatedNotes,
          windows,
          taxTotals,
          quoteResult,
          quoteNotes,
          surchargeRate,
          activePromoId,
          customJC,
          customMisc,
          customLabour,
          includeJCInPromo,
          includeMiscInPromo,
          includeLabourInPromo,
          quoteSummaryTotal: total,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to forward quote');
      toast.success(`Quote #${quoteNumber} forwarded to ${reassignTo} for review!`);
      setShowReassignModal(false);
      handleExitReview();
    } catch (err: any) {
      toast.error(err.message || 'Failed to forward quote');
    } finally {
      setReviewActionLoading(false);
    }
  };

  const handleAddWindow = () => {
    setLockedPromoId(null);
    setWindows([...windows, { id: generateId(), qty: '1', base: '', argon: '', solar: '', triple: '', w: '', h: '', color: 'White' }]);
    setTimeout(() => {
      windowEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const container = windowEndRef.current?.parentElement;
      if (container) {
        const inputs = container.querySelectorAll('input');
        if (inputs.length > 0) inputs[inputs.length - 6]?.focus(); // focus base price or qty
      }
    }, 50);
  };

  const handleRemoveWindow = (id: string) => {
    setLockedPromoId(null);
    setWindows(windows.filter((w) => w.id !== id));
  };

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      toast.info('Parsing PDF...');
      const items = await readPdfItems(file);
      
      const meta = extractPdfMetadata(items);
      if (meta.customerName) setCustomerName(meta.customerName);
      if (meta.quoteNumber) setQuoteNumber(meta.quoteNumber);

      const imported = parseManufacturerPdfItems(items).map(w => ({
        id: w.id,
        qty: String(w.qty),
        base: w.base ? (w.base / 100).toString() : '',
        argon: w.argon ? (w.argon / 100).toString() : '',
        solar: w.solar ? (w.solar / 100).toString() : '',
        triple: w.triple ? (w.triple / 100).toString() : '',
        w: w.w || '',
        h: w.h || '',
        color: w.color || 'White',
      }));
      setWindows(imported.length > 0 ? imported : [{ id: generateId(), qty: '1', base: '', argon: '', solar: '', triple: '', w: '', h: '', color: 'White' }]);
      setLockedPromoId(null);
      setActivePromoId('none');
      toast.success(`Imported ${imported.length} window(s) from ${file.name}.`);
    } catch (error: any) {
      toast.error(`PDF import failed: ${error.message}`);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleWindowChange = (id: string, field: keyof UIWindowItem, value: string) => {
    setWindows(
      windows.map((w) => {
        if (w.id !== id) return w;
        return { ...w, [field]: value };
      })
    );
  };

  const calculateQuote = () => {
    const validWindows = windows.map(w => ({
      id: w.id,
      qty: parseInt(w.qty) || 1,
      base: toCents(w.base),
      argon: toCents(w.argon),
      solar: toCents(w.solar),
      triple: toCents(w.triple)
    })).filter((w) => w.base > 0);
    
    if (!validWindows.length) return; 
    
    const options = availablePromos.map((p) => calculatePromo(p, validWindows, surchargeRate));
    options.push(calculatePromo(null, validWindows, surchargeRate)); // Add 'none' option
    
    setCompareOptions(options);

    const validOptions = options.filter(o => o.promoId !== 'none');
    const lowest = validOptions.length > 0 
      ? validOptions.reduce((min, o) => (o.base - o.promoDiscount) < (min.base - min.promoDiscount) ? o : min, validOptions[0])
      : options[0]; // fallback to none
    
    // Automatically follow lowest promo unless explicitly locked by user to another promo
    const selectedId = (lockedPromoId && options.some(o => o.promoId === lockedPromoId))
      ? lockedPromoId
      : lowest.promoId;

    setActivePromoId(selectedId);

    const selectedOption = options.find(o => o.promoId === selectedId) || options.find(o => o.promoId === 'none');
    setQuoteResult(selectedOption || null);
  };

  useEffect(() => {
    if (windows.some(w => toCents(w.base) > 0)) {
      calculateQuote();
    } else {
      setQuoteResult(null);
      setCompareOptions([]);
    }
  }, [windows, surchargeRate, lockedPromoId, availablePromos]);

  const beforeTaxDiscount = quoteResult 
    ? quoteResult.base + 
      (includeJCInPromo ? effectiveJC : 0) + 
      (includeMiscInPromo ? effectiveMisc : 0) + 
      (includeLabourInPromo ? effectiveLabour : 0) + 
      quoteResult.surcharge 
    : 0;
  
  const afterDiscount = Math.max(0, beforeTaxDiscount - (quoteResult?.promoDiscount || 0));
  const upgrade = calculateUpgrade(afterDiscount);
  const shownUpgrade = wantsUpgrade ? upgrade.charge : 0;
  const hst = hstRate > 0 ? Math.round(afterDiscount * (hstRate / 100)) : 0;
  const total = afterDiscount + hst;
  const firstPayment = Math.floor(total / 2);
  const secondPayment = total - firstPayment;
  const deptPerms = user?.departmentPermissions || {};
  const isSuperAdmin = Boolean(user && user.role === 'SUPERADMIN');
  const isAdmin = Boolean(user && (user.role === 'ADMIN' || isSuperAdmin));
  const canReview = Boolean(isAdmin || deptPerms.canReviewQuote || deptPerms.canApproveQuote);
  const canEditApprovedQuote = Boolean(isAdmin || deptPerms.canEditApprovedQuote);

  const isReviewerOrAdmin = Boolean(
    user && (
      canReview ||
      (reviewQuote && reviewQuote.assignedTo && user.username && reviewQuote.assignedTo.toLowerCase() === user.username.toLowerCase())
    )
  );

  const isOdooClerk = Boolean(
    !canReview && (
      user?.department === 'CLERK' ||
      deptPerms.canMarkOdooEntry ||
      (reviewQuote?.odooAssignedTo && user?.username && reviewQuote.odooAssignedTo.toLowerCase() === user.username.toLowerCase())
    )
  );

  // Once approved or modified, ONLY Admin or users with canEditApprovedQuote permission can edit. Odoo clerks and unpermitted staff are strictly view-only!
  const isApprovedOrModified = reviewQuote?.status === 'APPROVED' || reviewQuote?.status === 'MODIFIED';

  // Can this user edit the current quote?
  // - If approved/modified: only canEditApprovedQuote
  // - If pending review: reviewer (canReview) or original preparer
  // - If Odoo clerk: strictly NEVER
  const canEditCurrentQuote = Boolean(
    !isOdooClerk && (
      isApprovedOrModified 
        ? canEditApprovedQuote 
        : (isReviewerOrAdmin || (reviewQuote?.preparedBy && user?.username && reviewQuote.preparedBy.toLowerCase() === user.username.toLowerCase()))
    )
  );

  const isReadOnly = Boolean(
    reviewQuote && (
      !canEditCurrentQuote ||
      !isEditMode
    )
  );

  useEffect(() => {
    if (reviewQuote && isEditMode && !canEditCurrentQuote) {
      setIsEditMode(false);
    }
  }, [reviewQuote, isEditMode, canEditCurrentQuote]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <div className="max-w-[1650px] w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10 relative z-10 space-y-6 sm:space-y-8 print:hidden">
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 text-primary">
            <Component className="w-6 h-6" />
            <span className="text-xl font-semibold tracking-wider uppercase">Window & Door Store</span>
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-2 md:gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const nextTab = activeTab === 'quotes' ? 'promo' : 'quotes';
                switchTab(nextTab);
              }}
              className={cn(
                "gap-1.5 rounded-full text-xs font-medium bg-card/50 backdrop-blur transition-colors cursor-pointer",
                activeTab === 'quotes' 
                  ? "border-primary text-primary hover:bg-primary/10" 
                  : "border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
              )}
            >
              {activeTab === 'quotes' ? (
                <>
                  <Calculator className="w-3.5 h-3.5 text-primary" />
                  <span>Calculator</span>
                </>
              ) : (
                <>
                  <Inbox className="w-3.5 h-3.5 text-amber-500" />
                  <span>Quotes &amp; Bin</span>
                  {pendingReviewCount > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {pendingReviewCount}
                    </span>
                  )}
                </>
              )}
            </Button>

            {user && showGreeting && (
              <div className="text-sm border border-primary/30 bg-primary/10 px-3 py-1.5 rounded-full font-medium hidden sm:flex items-center gap-1.5 animate-in fade-in duration-500 shadow-sm">
                <span className="text-muted-foreground mr-0.5">Hello,</span>
                <span className="text-primary font-bold">{user.username}</span>
                <span className="text-xs">👋</span>
              </div>
            )}

            {user && (user.role === 'SUPERADMIN' || user.role === 'ADMIN') && (
              <Link 
                href="/admin" 
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "rounded-full gap-1.5 text-xs font-semibold shadow-sm")}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Dashboard</span>
              </Link>
            )}

            <NotificationBell />
            <ThemeToggle />

            <UserProfileMenu user={user} />
          </div>
        </header>



        {/* Dynamic Sticky Review Mode Banner */}
        {reviewQuote && (
          <div className={`p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 border-2 ${
            reviewQuote.status === 'APPROVED'
              ? 'bg-emerald-500/15 border-emerald-500/50'
              : reviewQuote.status === 'MODIFIED'
              ? 'bg-blue-500/15 border-blue-500/50'
              : reviewQuote.status === 'RETURNED'
              ? 'bg-destructive/15 border-destructive/50'
              : 'bg-amber-500/15 border-amber-500/50'
          }`}>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                {isEditMode ? (
                  <span className="bg-amber-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm animate-pulse">
                    <Edit3 className="w-3.5 h-3.5" /> Edit Mode Active (Unlocked)
                  </span>
                ) : (
                  <>
                    {reviewQuote.status === 'APPROVED' && (
                      <span className="bg-emerald-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Quote Approved (View Only)
                      </span>
                    )}
                    {reviewQuote.status === 'MODIFIED' && (
                      <span className="bg-blue-600 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3.5 h-3.5" /> Modified &amp; Approved (View Only)
                      </span>
                    )}
                    {reviewQuote.status === 'RETURNED' && (
                      <span className="bg-destructive text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <AlertCircle className="w-3.5 h-3.5" /> Returned for Revision (Editable)
                      </span>
                    )}
                    {reviewQuote.status === 'PENDING_REVIEW' && (
                      <span className="bg-amber-500 text-white font-mono font-bold text-xs px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <Clock className="w-3.5 h-3.5" /> {isReviewerOrAdmin ? 'Review Mode Active' : reviewQuote.assignedTo ? `In Review with ${reviewQuote.assignedTo} (Read-Only)` : 'In Review (Read-Only)'}
                      </span>
                    )}
                  </>
                )}

                {/* Odoo Status Badge */}
                {reviewQuote.odooAssignedTo && (
                  reviewQuote.odooStatus === 'COMPLETED' ? (
                    <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Entered in Odoo {reviewQuote.odooOrderNumber ? `(#${reviewQuote.odooOrderNumber})` : ''}</span>
                    </span>
                  ) : (
                    <span className="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <ClipboardCheck className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Odoo Entry Pending ({reviewQuote.odooAssignedTo})</span>
                    </span>
                  )
                )}

                <h2 className="font-extrabold text-lg text-foreground">
                  Quote #{reviewQuote.quoteNumber} for {reviewQuote.customerName}
                </h2>
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
                <span>Prepared by: <strong className="text-foreground">{reviewQuote.preparedBy}</strong></span>
                {reviewQuote.assignedTo && (
                  <>
                    <span>&bull;</span>
                    <span>Assigned to: <strong className="text-foreground">{reviewQuote.assignedTo}</strong></span>
                  </>
                )}
                {reviewQuote.preparerNotes && (
                  <>
                    <span>&bull;</span>
                    <span className="italic">Note: "{reviewQuote.preparerNotes}"</span>
                  </>
                )}
              </div>

              {/* Show Revision Instructions if Returned */}
              {reviewQuote.status === 'RETURNED' && reviewQuote.reviewerNotes && (
                <div className="text-xs bg-amber-500/15 text-amber-950 dark:text-amber-200 border border-amber-500/35 p-3 rounded-xl font-medium mt-2 shadow-xs flex items-start gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-900 dark:text-amber-300">Revision requested by {reviewQuote.reviewedBy || reviewQuote.assignedTo || 'Reviewer'}:</strong>
                    <p className="mt-0.5 italic text-foreground/90 font-normal">"{reviewQuote.reviewerNotes}"</p>
                  </div>
                </div>
              )}


              {/* Show Changes Log if Modified (Hidden for Odoo clerk) */}
              {reviewQuote.status === 'MODIFIED' && !isOdooClerk && user?.department !== 'CLERK' && (
                <div className="text-xs bg-blue-50 text-blue-950 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-100 dark:border-blue-800 p-3 rounded-xl font-medium mt-2 shadow-xs animate-in fade-in">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-300 mb-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>What {reviewQuote.reviewedBy || reviewQuote.assignedTo || 'Admin'} Edited &amp; Approved:</span>
                  </div>
                  {reviewQuote.reviewChanges && reviewQuote.reviewChanges.length > 0 ? (
                    <ul className="list-disc pl-5 mt-1 space-y-1 text-blue-800 dark:text-blue-200 font-medium">
                      {reviewQuote.reviewChanges.map((c: string, idx: number) => (
                        <li key={idx} className="leading-snug">{c}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-blue-700 dark:text-blue-300 italic mt-0.5">Price or specification adjustments made during review.</p>
                  )}
                </div>
              )}

            </div>
            
            <div className="flex items-center gap-2 flex-wrap self-end md:self-auto">
              {isEditMode ? (
                <>
                  {reviewQuote.status === 'PENDING_REVIEW' ? (
                    <>
                      <Button 
                        size="sm" 
                        onClick={handleSaveQuotePrices}
                        disabled={reviewActionLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm cursor-pointer"
                        title="Save changes to this pending quote"
                      >
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                        Save Changes
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancelEdits}
                        disabled={reviewActionLoading}
                        className="cursor-pointer bg-background/60"
                      >
                        Cancel Edits
                      </Button>
                    </>
                  ) : reviewQuote.status === 'RETURNED' ? (
                    <>
                      <Button 
                        size="sm" 
                        onClick={handleSaveQuotePrices}
                        disabled={reviewActionLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm cursor-pointer"
                        title="Save revisions made to this returned quote"
                      >
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                        Save Revisions
                      </Button>
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={handleResubmitReturnedQuote}
                        disabled={reviewActionLoading}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm cursor-pointer"
                        title="Resubmit quote for formal reviewer approval"
                      >
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        Resubmit for Review
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancelEdits}
                        disabled={reviewActionLoading}
                        className="cursor-pointer bg-background/60"
                      >
                        Cancel Edits
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        size="sm" 
                        onClick={handleSaveQuotePrices}
                        disabled={reviewActionLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-sm cursor-pointer"
                        title="Save changes and keep current approval status"
                      >
                        <Save className="w-3.5 h-3.5 mr-1.5" />
                        Save &amp; Keep Approved
                      </Button>
                      <Button 
                        size="sm" 
                        variant="default"
                        onClick={handleResubmitReturnedQuote}
                        disabled={reviewActionLoading}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-sm cursor-pointer"
                        title="Resubmit quote for formal reviewer approval"
                      >
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        Resubmit for Review
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleCancelEdits}
                        disabled={reviewActionLoading}
                        className="cursor-pointer bg-background/60"
                      >
                        Cancel Edits
                      </Button>
                    </>
                  )}
                </>
              ) : (
                <>
                  {/* Edit Quote Button (Hidden for Odoo clerk & unauthorized users) */}
                  {canEditCurrentQuote && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setIsEditMode(true)}
                      className="cursor-pointer border-primary/50 text-primary hover:bg-primary/10 font-bold bg-background/80 shadow-sm"
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1.5" />
                      Edit Quote
                    </Button>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExitReview}
                    className="cursor-pointer bg-background/60"
                  >
                    Exit Review
                  </Button>

                  {/* Approved or Modified Quotes: Quick Preview & Print */}
                  {(reviewQuote.status === 'APPROVED' || reviewQuote.status === 'MODIFIED') && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => setIsPreviewOpen(true)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-sm cursor-pointer"
                      >
                        <Printer className="w-4 h-4 mr-1.5" />
                        Preview &amp; Print
                      </Button>

                      {/* Mark Entered in Odoo Action */}
                      {reviewQuote.odooStatus === 'PENDING_ENTRY' && (isReviewerOrAdmin || isOdooClerk) && (
                        <Button
                          size="sm"
                          onClick={() => {
                            setOdooOrderNumberInput('');
                            setShowCompleteOdooModal(true);
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md cursor-pointer"
                        >
                          <CheckSquare className="w-4 h-4 mr-1.5" />
                          Mark Entered in Odoo
                        </Button>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Returned Quotes: Employee can Save Revisions or Resubmit */}
              {reviewQuote.status === 'RETURNED' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveQuotePrices}
                    disabled={reviewActionLoading}
                    className="border-emerald-600/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-semibold cursor-pointer shadow-sm"
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    Save Revisions
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleResubmitReturnedQuote}
                    disabled={reviewActionLoading}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md cursor-pointer"
                  >
                    <Send className="w-4 h-4 mr-1.5" />
                    {reviewActionLoading ? 'Resubmitting...' : 'Resubmit for Review'}
                  </Button>
                </>
              )}

              {/* Pending Review Quotes: Reviewer Controls */}
              {reviewQuote.status === 'PENDING_REVIEW' && isReviewerOrAdmin && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReassignTo(staffList.length > 0 ? staffList[0].username : 'Admin');
                      setReassignNotes('');
                      setShowReassignModal(true);
                    }}
                    disabled={reviewActionLoading}
                    className="border-primary/40 text-primary hover:bg-primary/10 font-semibold cursor-pointer shadow-sm"
                    title="Forward this quote to another staff member or admin"
                  >
                    <Share2 className="w-4 h-4 mr-1.5" />
                    Forward
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSaveQuotePrices}
                    disabled={reviewActionLoading}
                    className="border-emerald-600/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 font-semibold cursor-pointer shadow-sm"
                  >
                    <Save className="w-4 h-4 mr-1.5" />
                    Save Changes
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleReturnReviewQuote}
                    disabled={reviewActionLoading}
                    className="text-destructive hover:bg-destructive/10 border-destructive/30 font-semibold cursor-pointer"
                  >
                    Return with Note
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={handleApproveReviewQuote}
                    disabled={reviewActionLoading}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    {reviewActionLoading ? 'Saving...' : 'Approve Quote'}
                  </Button>
                </>
              )}

              {/* Pending Review for Non-Reviewer */}
              {reviewQuote.status === 'PENDING_REVIEW' && !isReviewerOrAdmin && (
                <div className="px-3 py-1.5 rounded-lg bg-background/60 border border-border text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>In Review with {reviewQuote.assignedTo || 'Reviewer'} (Read-Only)</span>
                </div>
              )}
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(val) => switchTab(val)} className="w-full">
          {activeTab !== 'quotes' && (
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8 bg-muted p-1 rounded-full border border-border/50 shadow-sm animate-in fade-in duration-200">
              <TabsTrigger value="promo" className="rounded-full text-xs sm:text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer">Promo Calculator</TabsTrigger>
              <TabsTrigger value="tax" className="rounded-full text-xs sm:text-sm font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm cursor-pointer">Tax &amp; Labour Calculator</TabsTrigger>
            </TabsList>
          )}
          
          <div className={cn("mt-0 outline-none", activeTab !== 'promo' && "hidden")}>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            <Card className="bg-card/50 border-border backdrop-blur-xl shadow-2xl">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-5">
                <div>
                  <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                    <Component className="w-5 sm:w-6 h-5 sm:h-6 text-primary shrink-0" />
                    <span>Window Configurations</span>
                  </CardTitle>
                  <CardDescription className="mt-1 text-xs sm:text-sm">
                    Enter the base prices and upgrade components for each window.
                  </CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-2 bg-muted/50 p-1.5 sm:p-2 rounded-xl border border-border/50 w-full sm:w-auto justify-between sm:justify-start">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="surcharge" className="whitespace-nowrap px-1 text-xs sm:text-sm font-medium">Surcharge %</Label>
                    <Input
                      id="surcharge"
                      type="number"
                      readOnly
                      value={surchargeRate}
                      className="w-16 sm:w-20 h-9 bg-background opacity-70 cursor-not-allowed text-xs sm:text-sm font-mono"
                      title="Configured by Admin in Settings"
                    />
                  </div>
                  <input 
                    type="file" 
                    accept=".pdf,application/pdf" 
                    hidden 
                    ref={fileInputRef} 
                    onChange={handlePdfUpload} 
                  />
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={handlePdfImportClick} 
                    disabled={isReadOnly} 
                    className="whitespace-nowrap shadow-sm h-9 px-3 text-xs sm:text-sm font-semibold cursor-pointer"
                  >
                    <FileUp className="w-4 h-4 mr-1.5" />
                    Import PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-muted/20 border-t border-border">
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Quote/Order Number</Label>
                    <Input disabled={isReadOnly} value={quoteNumber} onChange={e => setQuoteNumber(e.target.value)} placeholder="e.g. 400820" className="bg-background shadow-sm" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Customer Name</Label>
                    <Input disabled={isReadOnly} value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="e.g. Jason Schram" className="bg-background shadow-sm" />
                  </div>
                </div>
                <div className="w-full max-h-[600px] overflow-auto border-t border-border">
                  <div className="text-[11px] text-muted-foreground/80 md:hidden px-4 py-2 bg-muted/30 border-b border-border/40 flex items-center justify-between font-medium">
                    <span>← Swipe table horizontally to edit all panes &amp; prices →</span>
                  </div>
                  <div className="min-w-[800px] p-6">
                    <div className="grid grid-cols-12 gap-4 mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                      <div className="col-span-1">Seq</div>
                      <div className="col-span-1">Qty</div>
                      <div className="col-span-2">Base Total</div>
                      <div className="col-span-2">Argon Total</div>
                      <div className="col-span-2">Solar Total</div>
                      <div className="col-span-2">Triple Pane Total</div>
                      <div className="col-span-2 text-right">Finish &amp; Actions</div>
                    </div>
                    
                    <div className="space-y-3">
                      <AnimatePresence>
                        {windows.map((w, i) => (
                          <motion.div
                            key={w.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="grid grid-cols-12 gap-4 items-center bg-muted/30 p-2 rounded-xl border border-border/80 transition-colors hover:border-border"
                          >
                            <div className="col-span-1 pl-3 font-mono text-muted-foreground">{i + 1}</div>
                            <div className="col-span-1">
                              <Input
                                type="number"
                                min="1"
                                disabled={isReadOnly}
                                value={w.qty}
                                onChange={(e) => handleWindowChange(w.id, 'qty', e.target.value)}
                                className="bg-background h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                            <div className="col-span-2 relative">
                              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                              <Input
                                type="number"
                                placeholder="0.00"
                                disabled={isReadOnly}
                                value={w.base}
                                onChange={(e) => handleWindowChange(w.id, 'base', e.target.value)}
                                className="bg-background h-9 pl-6 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                            <div className="col-span-2 relative">
                              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                              <Input
                                type="number"
                                placeholder="0.00"
                                disabled={isReadOnly}
                                value={w.argon}
                                onChange={(e) => handleWindowChange(w.id, 'argon', e.target.value)}
                                className="bg-background h-9 pl-6 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                            <div className="col-span-2 relative">
                              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                              <Input
                                type="number"
                                placeholder="0.00"
                                disabled={isReadOnly}
                                value={w.solar}
                                onChange={(e) => handleWindowChange(w.id, 'solar', e.target.value)}
                                className="bg-background h-9 pl-6 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                            <div className="col-span-2 relative">
                              <span className="absolute left-3 top-2.5 text-muted-foreground text-sm">$</span>
                              <Input
                                type="number"
                                placeholder="0.00"
                                disabled={isReadOnly}
                                value={w.triple}
                                onChange={(e) => handleWindowChange(w.id, 'triple', e.target.value)}
                                className="bg-background h-9 pl-6 font-mono [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                            </div>
                            <div className="col-span-2 flex items-center justify-end gap-1.5 sm:gap-2 pr-2">
                              <button
                                type="button"
                                disabled={isReadOnly}
                                onClick={() => handleWindowChange(w.id, 'color', (w.color === 'Painted' ? 'White' : 'Painted'))}
                                title="Click to toggle between White and Painted"
                                className={cn(
                                  "text-[10px] sm:text-[11px] font-semibold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full border transition-all cursor-pointer whitespace-nowrap select-none",
                                  w.color === 'Painted'
                                    ? "bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30 hover:bg-purple-500/25"
                                    : "bg-muted text-foreground border-border hover:bg-muted/80"
                                )}
                              >
                                {w.color === 'Painted' ? '🎨 Painted' : '⬜ White'}
                              </button>
                              {!isReadOnly ? (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors h-8 w-8 shrink-0"
                                  onClick={() => handleRemoveWindow(w.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground italic pr-2">Locked</span>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                      <div ref={windowEndRef} />
                    </div>

                  </div>
                </div>
                {!isReadOnly && (
                  <div className="p-6 border-t border-border bg-muted/10 rounded-b-xl flex justify-center sm:justify-start">
                    <Button 
                      onClick={handleAddWindow}
                      className="shadow-lg w-full sm:w-auto"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Window Manually
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Promo Comparison Cards */}
            {compareOptions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="w-5 h-5 text-primary" />
                  <h2 className="text-xl font-semibold">Promo Comparison</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {compareOptions.filter(opt => opt.promoId !== 'none').map((opt) => {
                    const isSelected = activePromoId === opt.promoId;
                    const validOptions = compareOptions.filter(o => o.promoId !== 'none');
                    const netPrice = Math.max(0, opt.base - opt.promoDiscount);
                    const isLowest = Math.min(...validOptions.map(o => Math.max(0, o.base - o.promoDiscount))) === netPrice;
                    const savings = opt.promoDiscount;

                    return (
                      <motion.div
                        key={opt.promoId}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          if (isLowest) {
                            setLockedPromoId(null);
                          } else {
                            setLockedPromoId(opt.promoId);
                          }
                          setActivePromoId(opt.promoId);
                        }}
                        className={`relative cursor-pointer rounded-2xl p-5 border transition-all duration-300 ${
                          isSelected 
                            ? 'bg-primary/10 border-primary shadow-xl shadow-primary/10 ring-1 ring-primary/50' 
                            : 'bg-card border-border hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        {isLowest && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-lg">
                            Lowest
                          </div>
                        )}
                        <h3 className="text-sm text-muted-foreground font-medium mb-1 line-clamp-1">
                          {opt.promoName}
                        </h3>
                        <div className={`text-2xl font-bold mb-2 tracking-tight ${isSelected ? 'text-primary' : ''}`}>
                          {formatMoney(netPrice)}
                        </div>
                        <div className="text-xs space-y-1">
                          {savings > 0 ? (
                            <div className="text-emerald-500 font-medium">Discount -{formatMoney(savings)}</div>
                          ) : (
                            <div className="text-muted-foreground">No discount</div>
                          )}
                          <div className="text-muted-foreground truncate">
                            Base {formatMoney(opt.base)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Calculation Results */}
          <div className="lg:col-span-4 space-y-6 sticky top-8 h-fit pb-12">
            <Card className="bg-card/80 border-border backdrop-blur-xl shadow-xl overflow-hidden relative">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary to-primary/50" />
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-primary" />
                  Promo Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quoteResult ? (
                  <>
                    <div className="space-y-3">
                      {summaryWindowGroups.length > 0 ? (
                        <div className="space-y-1.5 pb-2 border-b border-border/50">
                          {summaryWindowGroups.map((g) => (
                            <div key={g.key} className="flex justify-between text-xs sm:text-sm">
                              <span className="text-muted-foreground font-medium">
                                {g.qty} {g.pane} pane {g.color} window{g.qty > 1 ? 's' : ''}
                              </span>
                              <span className="font-mono">{formatMoney(g.baseCents)}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Base window price</span>
                          <span className="font-mono">{formatMoney(quoteResult.base)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Surcharge ({surchargeRate}%)</span>
                        <span className="font-mono">+{formatMoney(quoteResult.surcharge)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-medium text-emerald-500">
                        <span>Promo discount</span>
                        <span className="font-mono">-{formatMoney(quoteResult.promoDiscount)}</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-base font-semibold">Total</span>
                        <span className="text-2xl font-bold font-mono tracking-tight text-primary">
                          {formatMoney(quoteResult.base + quoteResult.surcharge - quoteResult.promoDiscount)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground flex items-start gap-1.5 mt-4 bg-muted p-3 rounded-lg border border-border">
                        <Info className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                        <span>{quoteResult.text}</span>
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    Enter valid window base prices to see the summary.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card/80 border-border backdrop-blur-xl shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  Tax Calculation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Base price of windows</Label>
                    <div className="h-9 px-3 py-2 bg-background border border-border rounded-md font-mono text-sm opacity-70">
                      {formatMoney(quoteResult?.base || 0)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5 flex flex-col justify-end">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Checkbox disabled={isReadOnly} id="incJc" checked={includeJCInPromo} onCheckedChange={c => setIncludeJCInPromo(!!c)} />
                          <Label htmlFor="incJc" className="text-xs text-muted-foreground cursor-pointer">Include J & C</Label>
                        </div>
                        {!isReadOnly && customJC !== '' && (
                          <button
                            type="button"
                            onClick={() => setCustomJC('')}
                            title="Reset to calculated"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer select-none no-underline"
                          >
                            <RotateCcw className="w-2.5 h-2.5 cursor-pointer" />
                            <span className="cursor-pointer">Reset</span>
                          </button>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <span className="absolute left-2.5 text-xs text-muted-foreground font-mono pointer-events-none">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={(taxJC / 100).toFixed(2)}
                          value={customJC}
                          onChange={(e) => setCustomJC(e.target.value)}
                          disabled={isReadOnly || !includeJCInPromo}
                          className={`h-9 pl-6 pr-3 font-mono text-sm bg-background ${!includeJCInPromo ? 'opacity-30 line-through' : ''}`}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 flex flex-col justify-end">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <Checkbox disabled={isReadOnly} id="incMisc" checked={includeMiscInPromo} onCheckedChange={c => setIncludeMiscInPromo(!!c)} />
                          <Label htmlFor="incMisc" className="text-xs text-muted-foreground cursor-pointer">Include Misc</Label>
                        </div>
                        {!isReadOnly && customMisc !== '' && (
                          <button
                            type="button"
                            onClick={() => setCustomMisc('')}
                            title="Reset to calculated"
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer select-none no-underline"
                          >
                            <RotateCcw className="w-2.5 h-2.5 cursor-pointer" />
                            <span className="cursor-pointer">Reset</span>
                          </button>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <span className="absolute left-2.5 text-xs text-muted-foreground font-mono pointer-events-none">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder={(taxMisc / 100).toFixed(2)}
                          value={customMisc}
                          onChange={(e) => setCustomMisc(e.target.value)}
                          disabled={isReadOnly || !includeMiscInPromo}
                          className={`h-9 pl-6 pr-3 font-mono text-sm bg-background ${!includeMiscInPromo ? 'opacity-30 line-through' : ''}`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <Checkbox disabled={isReadOnly} id="incLab" checked={includeLabourInPromo} onCheckedChange={c => setIncludeLabourInPromo(!!c)} />
                        <Label htmlFor="incLab" className="text-xs text-muted-foreground cursor-pointer">Include Labour</Label>
                      </div>
                      {!isReadOnly && customLabour !== '' && (
                        <button
                          type="button"
                          onClick={() => setCustomLabour('')}
                          title="Reset to calculated"
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary/20 transition-colors cursor-pointer select-none no-underline"
                        >
                          <RotateCcw className="w-2.5 h-2.5 cursor-pointer" />
                          <span className="cursor-pointer">Reset</span>
                        </button>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <span className="absolute left-2.5 text-xs text-muted-foreground font-mono pointer-events-none">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={(taxLabour / 100).toFixed(2)}
                        value={customLabour}
                        onChange={(e) => setCustomLabour(e.target.value)}
                        disabled={isReadOnly || !includeLabourInPromo}
                        className={`h-9 pl-6 pr-3 font-mono text-sm bg-background ${!includeLabourInPromo ? 'opacity-30 line-through' : ''} ${isReadOnly && customLabour !== '' ? 'ring-1 ring-blue-500/40 bg-blue-500/5' : ''}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Surcharge</Label>
                      <div className="h-9 px-3 py-2 bg-background border border-border rounded-md font-mono text-sm opacity-70">
                        {formatMoney(quoteResult?.surcharge || 0)}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">Discount</Label>
                      <div className="h-9 px-3 py-2 bg-background border border-border rounded-md font-mono text-sm opacity-70 text-emerald-500">
                        -{formatMoney(quoteResult?.promoDiscount || 0)}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3 bg-primary/10 p-4 rounded-xl border border-primary/20">
                  <Checkbox 
                    id="upgrade" 
                    disabled={isReadOnly}
                    checked={wantsUpgrade} 
                    onCheckedChange={(c) => setWantsUpgrade(!!c)} 
                    className="mt-1"
                  />
                  <div className="space-y-1.5">
                    <Label htmlFor="upgrade" className="text-sm font-medium cursor-pointer">
                      Include 5-year free labour upgrade
                    </Label>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Optional. Shows upgrade price only; not included in HST or final total.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-mono">{formatMoney(beforeTaxDiscount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">After Discount</span>
                    <span className="font-mono font-medium">{formatMoney(afterDiscount)}</span>
                  </div>
                  
                  {wantsUpgrade && (
                    <div className="flex justify-between text-sm text-primary bg-primary/10 p-2 rounded -mx-2 px-2">
                      <span>Labour Upgrade ({upgrade.rate})</span>
                      <span className="font-mono">{formatMoney(shownUpgrade)}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 pt-2 border-t border-border">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="promoHst13" 
                          disabled={isReadOnly}
                          checked={hstRate === 13} 
                          onCheckedChange={(c) => setHstRate(c ? 13 : 0)} 
                        />
                        <Label htmlFor="promoHst13" className="cursor-pointer text-muted-foreground font-normal">
                          Include HST (13%)
                        </Label>
                      </div>
                      <span className={`font-mono ${hstRate !== 13 ? 'line-through opacity-50' : ''}`}>
                        {formatMoney(Math.round(afterDiscount * 0.13))}
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id="promoHst8" 
                          disabled={isReadOnly}
                          checked={hstRate === 8} 
                          onCheckedChange={(c) => setHstRate(c ? 8 : 0)} 
                        />
                        <Label htmlFor="promoHst8" className="cursor-pointer text-muted-foreground font-normal">
                          Include HST (8%)
                        </Label>
                      </div>
                      <span className={`font-mono ${hstRate !== 8 ? 'line-through opacity-50' : ''}`}>
                        {formatMoney(Math.round(afterDiscount * 0.08))}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center pt-3 mt-3 border-t border-border">
                    <span className="font-bold">Total incl. HST</span>
                    <span className="font-bold font-mono text-xl tracking-tight">
                      {formatMoney(total)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/50">
                    <div className="bg-muted rounded-lg p-3 border border-border">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">First 50%</div>
                      <div className="font-mono font-semibold text-primary">{formatMoney(firstPayment)}</div>
                    </div>
                    <div className="bg-muted rounded-lg p-3 border border-border">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Final 50%</div>
                      <div className="font-mono font-semibold text-primary">{formatMoney(secondPayment)}</div>
                    </div>
                  </div>

                  {/* Optional Quote Notes Field with Rich Auto-Growing WYSIWYG Editor */}
                  <div className="pt-3 border-t border-border/50">
                    {reviewQuote && reviewQuote.status === 'RETURNED' && reviewQuote.reviewerNotes && (
                      <div className="mb-3 text-xs bg-amber-500/15 border border-amber-500/35 text-amber-950 dark:text-amber-200 p-3 rounded-xl font-medium flex items-start gap-2 shadow-xs animate-in fade-in">
                        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-amber-900 dark:text-amber-300">Reviewer Revision Instructions:</strong>
                          <p className="mt-0.5 italic text-foreground/90 font-normal">"{reviewQuote.reviewerNotes}"</p>
                        </div>
                      </div>
                    )}
                    <QuoteNotesEditor
                      id="quoteNotesInput"
                      value={quoteNotes}
                      onChange={setQuoteNotes}
                      readOnly={isReadOnly}
                      placeholder="Enter special site notes, instructions, or employee comments..."
                    />
                  </div>

                  {/* Vertically stacked full-width buttons - NO overflow outside the card */}
                  <div className="mt-4 flex flex-col gap-2.5 w-full">
                    {!reviewQuote ? (
                      <Button 
                        variant="default"
                        className="w-full h-11 text-sm shadow-md font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer transition-colors" 
                        onClick={() => {
                          if (!quoteNumber.trim() || !customerName.trim()) {
                            toast.error("Please enter a Customer Name and Quote Number before submitting!");
                            return;
                          }
                          setShowSubmitModal(true);
                        }}
                      >
                        <Send className="w-4 h-4 mr-2" /> Submit for Review
                      </Button>
                    ) : (
                      <>
                        {/* Returned Quote: Employee can revise and resubmit */}
                        {reviewQuote.status === 'RETURNED' && (
                          <>
                            <Button 
                              variant="default"
                              className="w-full h-11 text-sm shadow-md font-bold bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer transition-colors" 
                              onClick={handleResubmitReturnedQuote}
                              disabled={reviewActionLoading}
                            >
                              <Send className="w-4 h-4 mr-2" />
                              {reviewActionLoading ? 'Resubmitting...' : 'Resubmit for Review'}
                            </Button>
                            <Button 
                              variant="outline"
                              className="w-full h-10 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-500/40 cursor-pointer transition-colors" 
                              onClick={handleSaveQuotePrices}
                              disabled={reviewActionLoading}
                            >
                              <Save className="w-4 h-4 mr-2" /> Save Revisions
                            </Button>
                            <Button 
                              variant="outline"
                              className="w-full h-10 text-xs font-semibold text-muted-foreground hover:bg-muted" 
                              onClick={handleExitReview}
                            >
                              Exit Review Mode
                            </Button>
                          </>
                        )}

                        {/* Approved or Modified Quote */}
                        {(reviewQuote.status === 'APPROVED' || reviewQuote.status === 'MODIFIED') && (
                          <div className="space-y-2">
                            {isEditMode ? (
                              <>
                                <Button 
                                  variant="default"
                                  className="w-full h-11 text-sm shadow-md font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-colors"
                                  onClick={handleSaveQuotePrices}
                                  disabled={reviewActionLoading}
                                >
                                  <Save className="w-4 h-4 mr-2" /> Save &amp; Keep Approved
                                </Button>
                                <Button 
                                  variant="default"
                                  className="w-full h-11 text-sm shadow-md font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer transition-colors"
                                  onClick={handleResubmitReturnedQuote}
                                  disabled={reviewActionLoading}
                                >
                                  <Send className="w-4 h-4 mr-2" /> Resubmit for Review
                                </Button>
                                <Button 
                                  variant="outline"
                                  className="w-full h-10 text-xs font-semibold text-muted-foreground hover:bg-muted"
                                  onClick={handleCancelEdits}
                                  disabled={reviewActionLoading}
                                >
                                  Cancel Edits
                                </Button>
                              </>
                            ) : (
                              <>
                                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 flex items-center justify-between">
                                  <span className="font-semibold flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4" /> Quote Approved (View Only)
                                  </span>
                                  {canEditApprovedQuote && (
                                    <Button variant="ghost" size="sm" onClick={() => setIsEditMode(true)} className="h-7 text-xs font-bold text-primary hover:bg-primary/10">
                                      <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                                    </Button>
                                  )}
                                </div>
                                {canEditApprovedQuote ? (
                                  <Button 
                                    variant="outline"
                                    className="w-full h-10 text-xs font-bold border-primary/50 text-primary hover:bg-primary/10 cursor-pointer"
                                    onClick={() => setIsEditMode(true)}
                                  >
                                    <Edit3 className="w-4 h-4 mr-2" /> Edit Quote Details
                                  </Button>
                                ) : (
                                  <>
                                    {reviewQuote.odooStatus === 'PENDING_ENTRY' && (
                                      <Button 
                                        variant="default"
                                        className="w-full h-11 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer"
                                        onClick={() => {
                                          setOdooOrderNumberInput(reviewQuote.odooOrderNumber || '');
                                          setShowCompleteOdooModal(true);
                                        }}
                                      >
                                        <ClipboardCheck className="w-4 h-4 mr-2" /> Mark Entered in Odoo
                                      </Button>
                                    )}
                                    <Button 
                                      variant="default"
                                      className="w-full h-10 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm cursor-pointer"
                                      onClick={() => setIsPreviewOpen(true)}
                                    >
                                      <Printer className="w-4 h-4 mr-2" /> Preview &amp; Print Quote
                                    </Button>
                                  </>
                                )}
                                <Button 
                                  variant="outline"
                                  className="w-full h-10 text-xs font-semibold text-muted-foreground hover:bg-muted" 
                                  onClick={handleExitReview}
                                >
                                  Exit Review Mode
                                </Button>
                              </>
                            )}
                          </div>
                        )}

                        {/* Pending Review Quote */}
                        {reviewQuote.status === 'PENDING_REVIEW' && (
                          <>
                            {isReviewerOrAdmin ? (
                              <>
                                <Button 
                                  variant="default"
                                  className="w-full h-11 text-sm shadow-md font-bold bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer transition-colors" 
                                  onClick={handleApproveReviewQuote}
                                  disabled={reviewActionLoading}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-2" /> 
                                  {reviewActionLoading ? 'Approving...' : 'Approve & Save Changes'}
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => {
                                    setReassignTo(staffList.length > 0 ? staffList[0].username : 'Admin');
                                    setReassignNotes('');
                                    setShowReassignModal(true);
                                  }}
                                  disabled={reviewActionLoading}
                                  className="w-full h-10 text-xs font-semibold border-primary/40 text-primary hover:bg-primary/10 cursor-pointer shadow-sm"
                                >
                                  <Share2 className="w-4 h-4 mr-1.5" />
                                  Forward / Reassign Quote
                                </Button>
                                <Button 
                                  variant="outline"
                                  className="w-full h-10 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 border-emerald-500/40 cursor-pointer transition-colors" 
                                  onClick={handleSaveQuotePrices}
                                  disabled={reviewActionLoading}
                                >
                                  <Save className="w-4 h-4 mr-2" /> Save Updated Prices (No Status Change)
                                </Button>
                                <Button 
                                  variant="outline"
                                  className="w-full h-10 text-xs font-semibold text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer" 
                                  onClick={handleReturnReviewQuote}
                                  disabled={reviewActionLoading}
                                >
                                  <AlertCircle className="w-4 h-4 mr-2" /> Return with Note
                                </Button>
                              </>
                            ) : (
                              <div className="space-y-2">
                                {isEditMode ? (
                                  <>
                                    <Button 
                                      variant="default" 
                                      className="w-full h-11 text-sm shadow-md font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer transition-colors"
                                      onClick={handleSaveQuotePrices}
                                      disabled={reviewActionLoading}
                                    >
                                      <Save className="w-4 h-4 mr-2" /> Save Revisions
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      className="w-full h-10 text-xs font-semibold text-muted-foreground hover:bg-muted" 
                                      onClick={handleCancelEdits}
                                    >
                                      Cancel Edits
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    {canEditCurrentQuote && (
                                      <Button 
                                        variant="outline"
                                        className="w-full h-10 text-xs font-bold border-primary/50 text-primary hover:bg-primary/10 cursor-pointer"
                                        onClick={() => setIsEditMode(true)}
                                      >
                                        <Edit3 className="w-4 h-4 mr-2" /> Edit Quote Details
                                      </Button>
                                    )}
                                    <Button 
                                      variant="outline"
                                      className="w-full h-10 text-xs font-semibold text-muted-foreground hover:bg-muted" 
                                      onClick={handleExitReview}
                                    >
                                      Exit Review Mode
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </>
                    )}

                    <Button 
                      variant="outline"
                      className="w-full h-11 text-sm shadow-sm font-semibold border-primary/40 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer" 
                      onClick={() => {
                        if (!taxTotals) {
                          toast.error("Please calculate travel in the Tax Calculator tab first!");
                          return;
                        }
                        setIsPreviewOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2 text-primary cursor-pointer" /> Preview &amp; Customize
                    </Button>
                    <Button 
                      className="w-full h-11 text-sm shadow-md font-semibold cursor-pointer" 
                      onClick={() => {
                        if (!taxTotals) {
                          toast.error("Please calculate travel in the Tax Calculator tab first!");
                          return;
                        }
                        window.print();
                      }}
                    >
                      <Download className="w-4 h-4 mr-2 cursor-pointer" /> Download PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <div className={cn("mt-0 outline-none", activeTab !== 'tax' && "hidden")}>
        <TaxCalculatorTab 
          windows={windows} 
          onWindowsChange={setWindows} 
          onCalculated={setTaxTotals} 
          savedTaxTotals={reviewQuote?.taxTotals || null}
          readOnly={isReadOnly}
        />
      </div>

      <div className={cn("mt-0 outline-none", activeTab !== 'quotes' && "hidden")}>
        <QuotesTab 
          currentUser={user}
          onOpenQuote={handleOpenQuoteFromTab}
          onQuotesCountChange={(count) => setPendingReviewCount(count)}
          initialSubTab={quotesSubTab}
        />
      </div>

    </Tabs>
      </div>

      <QuoteInvoice 
        customerName={customerName} 
        quoteNumber={quoteNumber} 
        windows={windows} 
        taxTotals={taxTotals} 
        quoteResult={quoteResult}
        activePromo={quoteResult && quoteResult.promoDiscount > 0 ? { 
          name: availablePromos.find(p => p._id === activePromoId || (p as any).id === activePromoId)?.name || 'Custom Promo', 
          discount: quoteResult.promoDiscount 
        } : null} 
        basePrice={quoteResult?.base || 0}
        surcharge={quoteResult?.surcharge || 0}
        wantsUpgrade={wantsUpgrade}
        shownUpgrade={shownUpgrade}
        hstRate={hstRate}
        total={total}
        beforeTaxDiscount={beforeTaxDiscount}
        afterDiscount={afterDiscount}
        firstPayment={firstPayment}
        secondPayment={secondPayment}
        regionName={taxTotals?.regionName || taxTotals?.city} 
        includeLabourInPromo={includeLabourInPromo}
        includeMiscInPromo={includeMiscInPromo}
        includeJCInPromo={includeJCInPromo}
        effectiveJC={effectiveJC}
        effectiveMisc={effectiveMisc}
        effectiveLabour={effectiveLabour}
        template={quoteTemplate}
        fontSize={quoteFontSize}
        spacing={quoteSpacing}
        quoteNotes={quoteNotes}
        preparedBy={reviewQuote?.preparedBy || user?.username || ''}
      />

      <QuotePreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        template={quoteTemplate}
        onTemplateChange={setQuoteTemplate}
        fontSize={quoteFontSize}
        onFontSizeChange={setQuoteFontSize}
        spacing={quoteSpacing}
        onSpacingChange={setQuoteSpacing}
        quoteNotes={quoteNotes}
        onQuoteNotesChange={isReadOnly ? undefined : setQuoteNotes}
        preparedBy={reviewQuote?.preparedBy || user?.username || ''}
        customerName={customerName}
        quoteNumber={quoteNumber}
        windows={windows}
        taxTotals={taxTotals}
        quoteResult={quoteResult}
        activePromo={quoteResult && quoteResult.promoDiscount > 0 ? { 
          name: availablePromos.find(p => p._id === activePromoId || (p as any).id === activePromoId)?.name || 'Custom Promo', 
          discount: quoteResult.promoDiscount 
        } : null}
        basePrice={quoteResult?.base || 0}
        surcharge={quoteResult?.surcharge || 0}
        wantsUpgrade={wantsUpgrade}
        shownUpgrade={shownUpgrade}
        hstRate={hstRate}
        total={total}
        beforeTaxDiscount={beforeTaxDiscount}
        afterDiscount={afterDiscount}
        firstPayment={firstPayment}
        secondPayment={secondPayment}
        regionName={taxTotals?.regionName || taxTotals?.city}
        includeLabourInPromo={includeLabourInPromo}
        includeMiscInPromo={includeMiscInPromo}
        includeJCInPromo={includeJCInPromo}
        effectiveJC={effectiveJC}
        effectiveMisc={effectiveMisc}
        effectiveLabour={effectiveLabour}
      />

      {/* Submit for Review Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-md w-full border border-border space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Send to Review Queue</h3>
                <p className="text-xs text-muted-foreground">Submit this quote to team reviewer for price check.</p>
              </div>
            </div>

            <div className="bg-muted/40 p-3.5 rounded-xl border border-border space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quote Number:</span>
                <span className="font-mono font-bold">#{quoteNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Customer Name:</span>
                <span className="font-bold">{customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Items:</span>
                <span>{windows.filter(w => Number(w.base) > 0 || Number(w.qty) > 0).length} windows</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-border/60">
                <span className="text-muted-foreground">Quote Total (incl. tax):</span>
                <span className="font-mono font-bold text-primary text-sm">{formatMoney(total)}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reviewerSelect" className="text-xs">Assign Team Member / Reviewer</Label>
              <select
                id="reviewerSelect"
                value={assignedReviewer}
                onChange={e => setAssignedReviewer(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
              >
                {staffList.filter(s => s.username?.toLowerCase() !== user?.username?.toLowerCase()).length > 0 ? (
                  staffList
                    .filter(s => s.username?.toLowerCase() !== user?.username?.toLowerCase())
                    .map(s => (
                      <option key={s._id || s.username} value={s.username}>
                        {s.username}
                      </option>
                    ))
                ) : (
                  <option value="Admin">Admin</option>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="preparerNotes" className="text-xs">Notes for {assignedReviewer} (Optional)</Label>
              <textarea
                id="preparerNotes"
                rows={3}
                placeholder="e.g. Please verify travel setup fee or check if scaffolding labour is needed..."
                value={preparerNotes}
                onChange={e => setPreparerNotes(e.target.value)}
                className="w-full text-sm bg-background border border-input rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowSubmitModal(false)}
                disabled={submittingQuote}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSubmitForReview}
                disabled={submittingQuote}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
              >
                {submittingQuote ? 'Submitting...' : `Submit to ${assignedReviewer}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Forward / Reassign Quote Modal */}
      {showReassignModal && reviewQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-md w-full border border-border space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-primary/20 text-primary">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Forward / Reassign Quote</h3>
                <p className="text-xs text-muted-foreground">
                  Reassign Quote #{reviewQuote.quoteNumber} (originally prepared by <strong className="text-foreground">{reviewQuote.preparedBy}</strong>)
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reassignSelect" className="text-xs">Forward to Staff Member</Label>
              <select
                id="reassignSelect"
                value={reassignTo}
                onChange={e => setReassignTo(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
              >
                {staffList.filter(s => s.username?.toLowerCase() !== user?.username?.toLowerCase()).length > 0 ? (
                  staffList
                    .filter(s => s.username?.toLowerCase() !== user?.username?.toLowerCase())
                    .map(s => (
                      <option key={s._id || s.username} value={s.username}>
                        {s.username}
                      </option>
                    ))
                ) : (
                  <option value="Admin">Admin</option>
                )}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="reassignNotesInput" className="text-xs">Transfer Comments / Hand-off Notes (Optional)</Label>
              <textarea
                id="reassignNotesInput"
                rows={3}
                placeholder="e.g. Luke checked window specs, forwarding for final margin approval..."
                value={reassignNotes}
                onChange={e => setReassignNotes(e.target.value)}
                className="w-full text-sm bg-background border border-input rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowReassignModal(false)}
                disabled={reviewActionLoading}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleReassignQuote}
                disabled={reviewActionLoading || !reassignTo}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                {reviewActionLoading ? 'Forwarding...' : `Forward to ${reassignTo}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Web-Design Return Quote Modal (Replaces browser prompt) */}
      {showReturnModal && reviewQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-md w-full border border-border space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-destructive/15 text-destructive">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Return Quote for Revision</h3>
                <p className="text-xs text-muted-foreground">
                  Returning Quote #{reviewQuote.quoteNumber} to <strong className="text-foreground">{reviewQuote.preparedBy}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="returnNotesInput" className="text-xs font-semibold">
                Revision Instructions <span className="text-destructive">*</span>
              </Label>
              <textarea
                id="returnNotesInput"
                rows={4}
                autoFocus
                placeholder="e.g. Please recalculate window #2 with triple-pane glass, verify jamb depth, or check travel surcharge..."
                value={returnNotes}
                onChange={e => setReturnNotes(e.target.value)}
                className="w-full text-sm bg-background border border-input rounded-xl p-3 outline-none focus:ring-2 focus:ring-destructive resize-none"
              />
              <p className="text-[11px] text-muted-foreground">
                This note will be logged on the quote and sent directly to {reviewQuote.preparedBy}.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowReturnModal(false)}
                disabled={reviewActionLoading}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={submitReturnReviewQuote}
                disabled={reviewActionLoading || !returnNotes.trim()}
                className="bg-destructive hover:bg-destructive/90 text-white font-bold"
              >
                {reviewActionLoading ? 'Returning...' : `Return to ${reviewQuote.preparedBy}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Exit Review Mode Before Importing PDF */}
      {showExitReviewForPdfModal && reviewQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-md w-full border border-border space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-500">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Exit Review Mode?</h3>
                <p className="text-xs text-muted-foreground">Active quote review in progress</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/40 border border-border text-xs text-muted-foreground space-y-1.5">
              <p>
                You are currently reviewing <strong className="text-foreground">Quote #{reviewQuote.quoteNumber}</strong> for <strong className="text-foreground">{reviewQuote.customerName}</strong>.
              </p>
              <p>
                Importing a new manufacturer PDF will exit review mode and replace the current window line items with the new PDF contents.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowExitReviewForPdfModal(false)}
              >
                Stay in Review Mode
              </Button>
              <Button 
                size="sm" 
                onClick={handleExitReviewAndImportPdf}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
              >
                Exit &amp; Import PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Approve Quote & Optional Odoo Assignment Modal */}
      {showApproveOdooModal && reviewQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-md w-full border border-border space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Approve Quote #{reviewQuote.quoteNumber}</h3>
                <p className="text-xs text-muted-foreground">
                  Customer: <strong className="text-foreground">{reviewQuote.customerName}</strong>
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Approve this quote and optionally assign an employee to enter the order into Odoo software and prepare the physical file.
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="odooAssigneeSelect" className="text-xs font-semibold flex items-center gap-1.5">
                  <ClipboardCheck className="w-3.5 h-3.5 text-indigo-500" />
                  Assign for Odoo Entry (Optional)
                </Label>
                <select
                  id="odooAssigneeSelect"
                  value={selectedOdooClerk}
                  onChange={e => setSelectedOdooClerk(e.target.value)}
                  className="w-full text-sm bg-background border border-input rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">-- No Odoo Assignment (Direct Approval) --</option>
                  {staffList.map((member: any) => (
                    <option key={member._id || member.username} value={member.username}>
                      {member.name ? `${member.name} (${member.username})` : member.username} {member.role ? `• ${member.role}` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  The assigned clerk will receive an instant notification and view-only access to preview and print the quote.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowApproveOdooModal(false)}
                disabled={reviewActionLoading}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={confirmApproveReviewQuote}
                disabled={reviewActionLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                {reviewActionLoading ? 'Approving...' : selectedOdooClerk ? `Approve & Assign to ${selectedOdooClerk}` : 'Confirm Approval'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Odoo Entry Modal */}
      {showCompleteOdooModal && reviewQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-md w-full border border-border space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
                <CheckSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Mark Entered in Odoo</h3>
                <p className="text-xs text-muted-foreground">
                  Quote #{reviewQuote.quoteNumber} • {reviewQuote.customerName}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Confirm that this quote has been entered into Odoo. This will notify the review team and mark the order file as processed.
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="odooOrderNumInput" className="text-xs font-semibold">
                  Odoo Sales Order # (Optional)
                </Label>
                <Input
                  id="odooOrderNumInput"
                  placeholder="e.g. SO0482 or PO-9912"
                  value={odooOrderNumberInput}
                  onChange={e => setOdooOrderNumberInput(e.target.value)}
                  className="bg-background"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowCompleteOdooModal(false)}
                disabled={reviewActionLoading}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleCompleteOdooEntry}
                disabled={reviewActionLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {reviewActionLoading ? 'Saving...' : 'Confirm Odoo Entry'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
