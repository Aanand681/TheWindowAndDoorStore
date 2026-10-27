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
import { Plus, Trash2, Calculator, Tag, Info, Receipt, Component, FileUp, UserCircle, LogOut, Eye, Download, RotateCcw, Bold, List, Send, Inbox, CheckCircle2, Clock, AlertCircle, Sparkles, MessageSquare, AlertTriangle, Save, Share2, Printer, Edit3, Check, ShieldCheck, ChevronDown, CheckSquare, ClipboardCheck, FileText } from 'lucide-react';
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
import { AppHeader } from '@/components/AppHeader';
import { ReviewWorkflowBar } from '@/components/calculator/ReviewWorkflowBar';
import { OdooActionModals } from '@/components/calculator/OdooActionModals';
import { WindowConfigurationsCard } from '@/components/calculator/WindowConfigurationsCard';
import { QuoteSummaryCard } from '@/components/calculator/QuoteSummaryCard';
import { PromoComparisonGrid } from '@/components/calculator/PromoComparisonGrid';
import { SubmitReviewModal } from '@/components/calculator/SubmitReviewModal';
import { WorkflowDialogs } from '@/components/calculator/WorkflowDialogs';

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

export type UIWindowItem = {
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

export interface PromoCalculatorProps {
  initialReviewQuoteId?: string;
  initialIsEditMode?: boolean;
}

export function PromoCalculator({ initialReviewQuoteId, initialIsEditMode }: PromoCalculatorProps = {}) {
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
    customPermissions?: any;
    permissions?: any;
    favoriteTemplate?: string;
    canAccessAdmin?: boolean;
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
  const [reviewQuoteId, setReviewQuoteId] = useState<string | null>(initialReviewQuoteId || null);
  const [reviewQuote, setReviewQuote] = useState<any | null>(null);
  const [originalSnapshot, setOriginalSnapshot] = useState<any | null>(null);
  const [isEditMode, setIsEditMode] = useState<boolean>(Boolean(initialIsEditMode));
  const [reviewActionLoading, setReviewActionLoading] = useState(false);
  const [pendingReviewCount, setPendingReviewCount] = useState<number>(0);
  const [quotesSubTab, setQuotesSubTab] = useState<QuotesSubTabType>('review');

  useEffect(() => {
    if (initialReviewQuoteId && initialReviewQuoteId !== reviewQuoteId) {
      setReviewQuoteId(initialReviewQuoteId);
      setIsEditMode(Boolean(initialIsEditMode));
    }
  }, [initialReviewQuoteId, initialIsEditMode]);

  const switchTab = (tab: string, sub?: QuotesSubTabType, replace = false) => {
    setShowGreeting(false);
    setActiveTab(tab);
    if (sub) {
      setQuotesSubTab(sub);
    }
    if (typeof window !== 'undefined') {
      let targetUrl = '/';
      if (tab === 'quotes') {
        const targetSub = sub || quotesSubTab || 'my';
        targetUrl = `/?tab=quotes&sub=${targetSub}`;
      } else if (tab === 'tax') {
        if (reviewQuoteId) {
          targetUrl = `/?reviewQuoteId=${reviewQuoteId}&tab=tax${isEditMode ? '&edit=true' : ''}`;
        } else {
          targetUrl = '/?tab=tax';
        }
      } else {
        // tab === 'promo' (Calculator)
        if (reviewQuoteId) {
          targetUrl = `/?reviewQuoteId=${reviewQuoteId}${isEditMode ? '&edit=true' : ''}`;
        } else {
          targetUrl = '/';
        }
      }

      if (replace) {
        window.history.replaceState({ tab, sub: sub || quotesSubTab, reviewQuoteId }, '', targetUrl);
      } else {
        window.history.pushState({ tab, sub: sub || quotesSubTab, reviewQuoteId }, '', targetUrl);
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
  
  // Tax Calculator reset key
  const [taxCalcKey, setTaxCalcKey] = useState(0);

  // Submit for Review / Direct Approve Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [assignedReviewer, setAssignedReviewer] = useState('');
  const [preparerNotes, setPreparerNotes] = useState('');
  const [submittingQuote, setSubmittingQuote] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]); // Eligible reviewers (admins/managers)
  const [clerkList, setClerkList] = useState<any[]>([]); // Eligible Odoo clerks
  const [adminSubmitMode, setAdminSubmitMode] = useState<'direct_approve' | 'submit_review'>('direct_approve');

  // Reassign / Forward Quote Modal State
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [reassignTo, setReassignTo] = useState('');
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

    // Fetch eligible reviewers (admins & managers) and clerks (assignees)
    Promise.all([
      fetch(`/api/users?reviewersOnly=true&t=${Date.now()}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
      fetch(`/api/users?assignees=true&t=${Date.now()}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : []),
    ])
      .then(([reviewers, assignees]) => {
        if (Array.isArray(reviewers)) {
          const eligibleReviewers = reviewers.filter((d: any) => 
            d.role !== 'SUPERADMIN' && 
            d.role !== 'superadmin' &&
            d.username?.toLowerCase() !== 'cheeku' &&
            !d.username?.toLowerCase().includes('superadmin')
          );
          setStaffList(eligibleReviewers);
          if (eligibleReviewers.length > 0) {
            setAssignedReviewer(eligibleReviewers[0].username);
            setReassignTo(eligibleReviewers[0].username);
          }
        }
        if (Array.isArray(assignees)) {
          const eligibleClerks = assignees.filter((d: any) => 
            d.role !== 'SUPERADMIN' && 
            d.role !== 'superadmin' &&
            d.username?.toLowerCase() !== 'cheeku' &&
            !d.username?.toLowerCase().includes('superadmin')
          );
          setClerkList(eligibleClerks);
          const defaultClerk = eligibleClerks.find((c: any) => c.department === 'CLERK') || eligibleClerks[0];
          if (defaultClerk) {
            setSelectedOdooClerk(defaultClerk.username);
          }
        }
      })
      .catch(console.error);

    // Check if URL has ?reviewQuoteId=... or ?tab=... or ?previewQuoteId=...
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const previewQId = params.get('previewQuoteId');
      if (previewQId) {
        setActiveTab('quotes');
        setQuotesSubTab('odoo');
      }
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
      if (qId && !previewQId) {
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

      const fromStudio = params.get('from');
      if (fromStudio === 'pdf-studio') {
        const stored = sessionStorage.getItem('calculator_import_quote');
        if (stored) {
          try {
            const data = JSON.parse(stored);
            if (data.windows?.length) setWindows(data.windows);
            if (data.customerName) setCustomerName(data.customerName);
            if (data.quoteNumber) setQuoteNumber(data.quoteNumber);
            sessionStorage.removeItem('calculator_import_quote');
            toast.success(`Loaded ${data.windows.length} windows from Quote PDF Studio!`);
          } catch (e) {
            console.error('Failed to parse calculator_import_quote:', e);
          }
        }
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

    const handleOpenClerkPreview = (e: any) => {
      const qId = e.detail?.quoteId;
      if (qId) {
        setActiveTab('quotes');
        setQuotesSubTab('odoo');
      }
    };
    window.addEventListener('open-clerk-preview', handleOpenClerkPreview);

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
      window.removeEventListener('open-clerk-preview', handleOpenClerkPreview);
      window.removeEventListener('quote-count-updated', refreshPendingCount);
      window.removeEventListener('focus', refreshPendingCount);
    };
  }, []);

  // Synchronize browser Back & Forward navigation with tabs and review state
  useEffect(() => {
    const handlePopState = () => {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const subParam = params.get('sub') as QuotesSubTabType | null;
      const qId = params.get('reviewQuoteId') || params.get('quoteId');
      const editParam = params.get('edit') === 'true';

      if (tabParam === 'quotes') {
        setActiveTab('quotes');
        if (subParam && ['odoo', 'review', 'my', 'all', 'odoo_completed', 'all_assigned'].includes(subParam)) {
          setQuotesSubTab(subParam);
        }
      } else if (tabParam === 'tax') {
        setActiveTab('tax');
      } else {
        setActiveTab('promo');
      }

      if (qId) {
        if (qId !== reviewQuoteId) {
          setReviewQuoteId(qId);
          setIsEditMode(editParam);
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
              }
            })
            .catch(console.error);
        }
      } else {
        // No quote in URL: user navigated back to clean calculator
        if (reviewQuoteId || reviewQuote) {
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
          setTaxTotals(null);
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [reviewQuoteId, reviewQuote]);

  const handleOpenQuoteFromTab = (qId: string, isEdit?: boolean, originSubTab?: QuotesSubTabType) => {
    if (originSubTab) {
      setQuotesSubTab(originSubTab);
    }
    setShowGreeting(false);
    setReviewQuoteId(qId);
    setActiveTab('promo');
    if (typeof window !== 'undefined') {
      window.history.pushState({ tab: 'promo', reviewQuoteId: qId, isEdit }, '', `/?reviewQuoteId=${qId}${isEdit ? '&edit=true' : ''}`);
    }
    fetch(`/api/quotes/${qId}?t=${Date.now()}`, { cache: 'no-store' })
      .then(r => r.json())
      .then(q => {
        if (q && q._id) {
          const effectivePerms = user?.permissions || user?.departmentPermissions || {};
          const isSuperAdmin = Boolean(user && user.role === 'SUPERADMIN');
          const isAdmin = Boolean(user && (user.role === 'ADMIN' || isSuperAdmin));
          const canReview = Boolean(isAdmin || effectivePerms.canReviewQuote || effectivePerms.canApproveQuote);
          const canEditApproved = Boolean(isAdmin || effectivePerms.canEditApprovedQuote);

          const isClerk = Boolean(
            !canReview && (user?.department === 'CLERK' || effectivePerms.canMarkOdooEntry || effectivePerms.canAccessOdooQueue)
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

    const isDirectApprove = Boolean((user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && adminSubmitMode === 'direct_approve');

    if (isDirectApprove && !selectedOdooClerk) {
      toast.error("Please select an Odoo clerk to assign this quote to");
      return;
    }
    if (!isDirectApprove && !assignedReviewer) {
      toast.error("Please select a reviewer to submit this quote to");
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
          assignedTo: isDirectApprove ? (user?.username || '') : assignedReviewer,
          directApprove: isDirectApprove,
          odooAssignedTo: isDirectApprove ? selectedOdooClerk : undefined,
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

      if (isDirectApprove) {
        toast.success(`Quote #${quoteNumber} approved & assigned to ${selectedOdooClerk} for Odoo entry!`);
      } else {
        toast.success(`Quote #${quoteNumber} submitted to ${assignedReviewer} for review!`);
      }
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
    const defaultClerk = (clerkList.length > 0 ? clerkList : staffList).find((c: any) => c.department === 'CLERK') || (clerkList[0] || staffList[0]);
    setSelectedOdooClerk(reviewQuote?.odooAssignedTo || defaultClerk?.username || '');
    setShowApproveOdooModal(true);
  };

  const confirmApproveReviewQuote = async () => {
    if (!reviewQuoteId) return;
    if (!selectedOdooClerk) {
      toast.error('Please select an Odoo clerk before approving the quote.');
      return;
    }
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
        odooAssignedTo: selectedOdooClerk,
      };

      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve');
      toast.success(`Quote #${quoteNumber} approved & assigned to ${selectedOdooClerk} for Odoo entry!`);
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
    const orderNumber = odooOrderNumberInput.trim();
    if (!orderNumber) {
      toast.error('Please enter the Odoo Sales Order # before confirming.');
      return;
    }
    setReviewActionLoading(true);
    try {
      const res = await fetch(`/api/quotes/${reviewQuoteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          odooStatus: 'COMPLETED',
          odooOrderNumber: orderNumber,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Quote #${reviewQuote.quoteNumber} marked as entered in Odoo with Order #${orderNumber}!`);
        setShowCompleteOdooModal(false);
        setOdooOrderNumberInput('');
        handleExitReview();
      } else {
        toast.error(data.error || 'Failed to update Odoo status');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update Odoo status');
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
    const effectivePerms = user?.permissions || user?.departmentPermissions || {};
    const isAdminUser = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';
    const canReview = Boolean(isAdminUser || effectivePerms.canReviewQuote || effectivePerms.canApproveQuote);
    const isClerk = Boolean(user?.department === 'CLERK' || ((effectivePerms.canMarkOdooEntry || effectivePerms.canAccessOdooQueue) && !canReview));
    
    let defaultTab: string = 'my';
    if (canReview) defaultTab = 'review';
    else if (isClerk) defaultTab = 'odoo';

    const targetSubTab = quotesSubTab || defaultTab;
    setQuotesSubTab(targetSubTab);
    setActiveTab('quotes');
    if (typeof window !== 'undefined') {
      window.history.pushState({ tab: 'quotes', sub: targetSubTab }, '', `/?tab=quotes&sub=${targetSubTab}`);
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

      // Reset all manual price overrides, custom notes, and tax calculator form area
      setCustomJC('');
      setCustomMisc('');
      setCustomLabour('');
      setIncludeJCInPromo(true);
      setIncludeMiscInPromo(true);
      setIncludeLabourInPromo(true);
      setQuoteNotes('');
      setPreparerNotes('');
      setTaxTotals(null);
      setTaxCalcKey(k => k + 1);

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
  const effectivePerms = user?.permissions || user?.departmentPermissions || {};
  const isSuperAdmin = Boolean(user && user.role === 'SUPERADMIN');
  const isAdmin = Boolean(user && (user.role === 'ADMIN' || isSuperAdmin));
  const canReview = Boolean(isAdmin || effectivePerms.canReviewQuote || effectivePerms.canApproveQuote);
  const canEditApprovedQuote = Boolean(isAdmin || effectivePerms.canEditApprovedQuote);

  const isReviewerOrAdmin = Boolean(
    user && (
      canReview ||
      (reviewQuote && reviewQuote.assignedTo && user.username && reviewQuote.assignedTo.toLowerCase() === user.username.toLowerCase())
    )
  );

  const isOdooClerk = Boolean(
    !canReview && (
      user?.department === 'CLERK' ||
      effectivePerms.canMarkOdooEntry ||
      effectivePerms.canAccessOdooQueue ||
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
    <div className="min-h-screen print:min-h-0 print:h-auto bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <div className="max-w-[1650px] w-full mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10 relative z-10 space-y-6 sm:space-y-8 print:hidden">
        <AppHeader currentPath={reviewQuoteId ? `/review/${reviewQuoteId}` : '/calculator'} />



        <ReviewWorkflowBar
          reviewQuote={reviewQuote}
          activeTab={activeTab}
          isEditMode={isEditMode}
          setIsEditMode={setIsEditMode}
          canEditCurrentQuote={canEditCurrentQuote}
          isReviewerOrAdmin={isReviewerOrAdmin}
          isOdooClerk={isOdooClerk}
          user={user}
          reviewActionLoading={reviewActionLoading}
          handleSaveQuotePrices={handleSaveQuotePrices}
          handleCancelEdits={handleCancelEdits}
          handleResubmitReturnedQuote={handleResubmitReturnedQuote}
          handleExitReview={handleExitReview}
          setIsPreviewOpen={setIsPreviewOpen}
          setOdooOrderNumberInput={setOdooOrderNumberInput}
          setShowCompleteOdooModal={setShowCompleteOdooModal}
          staffList={staffList}
          setReassignTo={setReassignTo}
          setReassignNotes={setReassignNotes}
          setShowReassignModal={setShowReassignModal}
          handleReturnReviewQuote={handleReturnReviewQuote}
          handleApproveReviewQuote={handleApproveReviewQuote}
        />

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
            <WindowConfigurationsCard
              windows={windows}
              surchargeRate={surchargeRate}
              quoteNumber={quoteNumber}
              setQuoteNumber={setQuoteNumber}
              customerName={customerName}
              setCustomerName={setCustomerName}
              fileInputRef={fileInputRef}
              handlePdfUpload={handlePdfUpload}
              handlePdfImportClick={handlePdfImportClick}
              isReadOnly={isReadOnly}
              handleWindowChange={handleWindowChange}
              handleRemoveWindow={handleRemoveWindow}
              handleAddWindow={handleAddWindow}
              windowEndRef={windowEndRef}
            />

            {/* Promo Comparison Grid */}
            <PromoComparisonGrid
              compareOptions={compareOptions}
              activePromoId={activePromoId}
              setActivePromoId={setActivePromoId}
              setLockedPromoId={setLockedPromoId}
            />
          </div>

          {/* Sidebar - Calculation Results */}
          <QuoteSummaryCard
            quoteResult={quoteResult}
            summaryWindowGroups={summaryWindowGroups}
            surchargeRate={surchargeRate}
            taxTotals={taxTotals}
            taxJC={taxJC}
            taxMisc={taxMisc}
            taxLabour={taxLabour}
            customJC={customJC}
            setCustomJC={setCustomJC}
            customMisc={customMisc}
            setCustomMisc={setCustomMisc}
            customLabour={customLabour}
            setCustomLabour={setCustomLabour}
            includeJCInPromo={includeJCInPromo}
            setIncludeJCInPromo={setIncludeJCInPromo}
            includeMiscInPromo={includeMiscInPromo}
            setIncludeMiscInPromo={setIncludeMiscInPromo}
            includeLabourInPromo={includeLabourInPromo}
            setIncludeLabourInPromo={setIncludeLabourInPromo}
            wantsUpgrade={wantsUpgrade}
            setWantsUpgrade={setWantsUpgrade}
            upgrade={upgrade}
            shownUpgrade={shownUpgrade}
            beforeTaxDiscount={beforeTaxDiscount}
            afterDiscount={afterDiscount}
            hstRate={hstRate}
            setHstRate={setHstRate}
            total={total}
            firstPayment={firstPayment}
            secondPayment={secondPayment}
            quoteNotes={quoteNotes}
            setQuoteNotes={setQuoteNotes}
            isReadOnly={isReadOnly}
            user={user}
            reviewQuote={reviewQuote}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
            canEditApprovedQuote={canEditApprovedQuote}
            canEditCurrentQuote={canEditCurrentQuote}
            isReviewerOrAdmin={isReviewerOrAdmin}
            reviewActionLoading={reviewActionLoading}
            staffList={staffList}
            clerkList={clerkList}
            quoteNumber={quoteNumber}
            customerName={customerName}
            assignedReviewer={assignedReviewer}
            setAssignedReviewer={setAssignedReviewer}
            selectedOdooClerk={selectedOdooClerk}
            setSelectedOdooClerk={setSelectedOdooClerk}
            setShowSubmitModal={setShowSubmitModal}
            handleResubmitReturnedQuote={handleResubmitReturnedQuote}
            handleSaveQuotePrices={handleSaveQuotePrices}
            handleExitReview={handleExitReview}
            handleCancelEdits={handleCancelEdits}
            setOdooOrderNumberInput={setOdooOrderNumberInput}
            setShowCompleteOdooModal={setShowCompleteOdooModal}
            setIsPreviewOpen={setIsPreviewOpen}
            handleApproveReviewQuote={handleApproveReviewQuote}
            setReassignTo={setReassignTo}
            setReassignNotes={setReassignNotes}
            setShowReassignModal={setShowReassignModal}
            handleReturnReviewQuote={handleReturnReviewQuote}
          />
        </div>
      </div>
      
      <div className={cn("mt-0 outline-none", activeTab !== 'tax' && "hidden")}>
        <TaxCalculatorTab 
          key={taxCalcKey}
          windows={windows} 
          onWindowsChange={setWindows} 
          onCalculated={setTaxTotals} 
          savedTaxTotals={reviewQuote?.taxTotals || null}
          readOnly={isReadOnly}
          onOpenPreview={() => setIsPreviewOpen(true)}
        />
      </div>

      <div className={cn("mt-0 outline-none", activeTab !== 'quotes' && "hidden")}>
        <QuotesTab 
          currentUser={user}
          onOpenQuote={handleOpenQuoteFromTab}
          onQuotesCountChange={(count) => setPendingReviewCount(count)}
          initialSubTab={quotesSubTab}
          initialPreviewQuoteId={typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('previewQuoteId') || undefined : undefined}
        />
      </div>
    </Tabs>
      </div>

      {!isPreviewOpen && (
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
      )}

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

      {/* Submit for Review / Direct Approve Modal */}
      <SubmitReviewModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        user={user}
        adminSubmitMode={adminSubmitMode}
        setAdminSubmitMode={setAdminSubmitMode}
        quoteNumber={quoteNumber}
        customerName={customerName}
        windowsCount={windows.filter(w => Number(w.base) > 0 || Number(w.qty) > 0).length}
        total={total}
        staffList={staffList}
        clerkList={clerkList}
        assignedReviewer={assignedReviewer}
        setAssignedReviewer={setAssignedReviewer}
        selectedOdooClerk={selectedOdooClerk}
        setSelectedOdooClerk={setSelectedOdooClerk}
        preparerNotes={preparerNotes}
        setPreparerNotes={setPreparerNotes}
        submittingQuote={submittingQuote}
        onSubmit={handleSubmitForReview}
      />

      {/* Workflow Dialogs (Reassign, Return, Exit Review for PDF) */}
      <WorkflowDialogs
        showReassignModal={showReassignModal}
        setShowReassignModal={setShowReassignModal}
        reviewQuote={reviewQuote}
        user={user}
        staffList={staffList}
        reassignTo={reassignTo}
        setReassignTo={setReassignTo}
        reassignNotes={reassignNotes}
        setReassignNotes={setReassignNotes}
        handleReassignQuote={handleReassignQuote}
        showReturnModal={showReturnModal}
        setShowReturnModal={setShowReturnModal}
        returnNotes={returnNotes}
        setReturnNotes={setReturnNotes}
        submitReturnReviewQuote={submitReturnReviewQuote}
        showExitReviewForPdfModal={showExitReviewForPdfModal}
        setShowExitReviewForPdfModal={setShowExitReviewForPdfModal}
        handleExitReviewAndImportPdf={handleExitReviewAndImportPdf}
        reviewActionLoading={reviewActionLoading}
      />

      {/* Odoo Action Modals (Approve & Assign Clerk, Confirm SO#) */}
      <OdooActionModals
        showApproveOdooModal={showApproveOdooModal}
        setShowApproveOdooModal={setShowApproveOdooModal}
        showCompleteOdooModal={showCompleteOdooModal}
        setShowCompleteOdooModal={setShowCompleteOdooModal}
        reviewQuote={reviewQuote}
        selectedOdooClerk={selectedOdooClerk}
        setSelectedOdooClerk={setSelectedOdooClerk}
        odooOrderNumberInput={odooOrderNumberInput}
        setOdooOrderNumberInput={setOdooOrderNumberInput}
        reviewActionLoading={reviewActionLoading}
        clerkList={clerkList}
        staffList={staffList}
        confirmApproveReviewQuote={confirmApproveReviewQuote}
        handleCompleteOdooEntry={handleCompleteOdooEntry}
      />
    </div>
  );
}

export default PromoCalculator;

