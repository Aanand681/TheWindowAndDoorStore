'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { AppHeader } from '@/components/layout/AppHeader';
import {
  DoorItemBuilder,
  DoorLineItemsTable,
  DoorLabourTravelCard,
  DoorQuoteSummaryCard,
  DoorOfficePricingCard,
  DoorPreviewModal,
} from '@/components/doors';
import QuoteInvoice, { QuoteTemplateType } from '@/components/quotes/QuoteInvoice';
import QuotePreviewModal from '@/components/quotes/QuotePreviewModal';
import { SubmitReviewModal } from '@/components/calculator/SubmitReviewModal';
import { SavedQuotesModal } from '@/components/calculator/SavedQuotesModal';
import { AttachQuoteModal } from '@/components/calculator/AttachQuoteModal';
import {
  DoorLineItem,
  DoorQuotingMode,
  DoorPreset,
  DoorUpchargeConfig,
  DoorFormulaSettings,
  DoorLogisticsSettings,
  DoorSelectedUpcharge,
} from '@/lib/doors/types';
import {
  DEFAULT_DOOR_PRESETS,
  DEFAULT_DOOR_UPCHARGES,
  DEFAULT_DOOR_FORMULA,
  DEFAULT_DOOR_LOGISTICS,
} from '@/lib/doors/constants';
import { calculateDoorQuoteTotals, formatDoorSummarySentence } from '@/lib/doors/calculations';
import {
  saveQuoteDraft,
  getSavedDrafts,
  saveActiveAutoSave,
  getActiveAutoSave,
  clearActiveAutoSave,
  QuoteDraftItem,
  DRAFT_CHANGE_EVENT,
} from '@/lib/quote-drafts-storage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DoorClosed,
  Settings as SettingsIcon,
  Save,
  Bookmark,
  FolderOpen,
  User,
  Hash,
  RotateCcw,
  Paperclip,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function DoorCalculatorPage() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPERADMIN';

  // Settings loaded from API with fallbacks
  const [presets, setPresets] = useState<DoorPreset[]>(DEFAULT_DOOR_PRESETS);
  const [upcharges, setUpcharges] = useState<DoorUpchargeConfig[]>(DEFAULT_DOOR_UPCHARGES);
  const [formula, setFormula] = useState<DoorFormulaSettings>(DEFAULT_DOOR_FORMULA);
  const [logistics, setLogistics] = useState<DoorLogisticsSettings>(DEFAULT_DOOR_LOGISTICS);

  // Quote Customer & ID State (Manual Entry Required)
  const [customerName, setCustomerName] = useState<string>('');
  const [quoteNumber, setQuoteNumber] = useState<string>('');
  const [mode, setMode] = useState<DoorQuotingMode>('installation');
  const [lineItems, setLineItems] = useState<DoorLineItem[]>([]);
  const [editingItem, setEditingItem] = useState<DoorLineItem | null>(null);

  // Jobsite Labour Upcharges (Added once for the whole quote)
  const [globalUpcharges, setGlobalUpcharges] = useState<DoorSelectedUpcharge[]>([]);

  // Travel / Logistics State (Default 3-Men Crew)
  const [travelFeeType, setTravelFeeType] = useState<'none' | 'local_std' | 'far_std' | 'far_small' | 'custom'>('local_std');
  const [customTravelFee, setCustomTravelFee] = useState<string>('');
  const [showOutTownTravel, setShowOutTownTravel] = useState<boolean>(false);
  const [travelKm, setTravelKm] = useState<string>('');
  const [crewHours, setCrewHours] = useState<string>('');
  const [crewSize, setCrewSize] = useState<'2' | '3'>('3'); // Default 3-Men Crew

  // Customer / Notes / Tax State
  const [quoteNotes, setQuoteNotes] = useState<string>('');
  const [isFirstNation, setIsFirstNation] = useState<boolean>(false);
  const [customLabour, setCustomLabour] = useState<string>('');
  const [customMisc, setCustomMisc] = useState<string>('');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [quoteTemplate, setQuoteTemplate] = useState<QuoteTemplateType>('cards');
  const [quoteFontSize, setQuoteFontSize] = useState<number>(11.5);
  const [quoteSpacing, setQuoteSpacing] = useState<number>(1.0);

  // Modals State
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [isSavedQuotesOpen, setIsSavedQuotesOpen] = useState<boolean>(false);
  const [isAttachModalOpen, setIsAttachModalOpen] = useState<boolean>(false);
  const [attachedWindowQuote, setAttachedWindowQuote] = useState<any | null>(null);
  const [attachedSealedUnit, setAttachedSealedUnit] = useState<any | null>(null);
  const [savedDraftsCount, setSavedDraftsCount] = useState<number>(0);

  // Submit / Review Workflow State
  const [submittingQuote, setSubmittingQuote] = useState<boolean>(false);
  const [assignedReviewer, setAssignedReviewer] = useState<string>('');
  const [selectedOdooClerk, setSelectedOdooClerk] = useState<string>('');
  const [adminSubmitMode, setAdminSubmitMode] = useState<'direct_approve' | 'submit_review'>('direct_approve');
  const [preparerNotes, setPreparerNotes] = useState<string>('');
  const [staffList, setStaffList] = useState<any[]>([]);
  const [clerkList, setClerkList] = useState<any[]>([]);

  const initialLoadDone = useRef(false);

  // 1. Fetch Admin Settings from API
  useEffect(() => {
    fetch('/api/doors/settings')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.presets) && data.presets.length > 0) setPresets(data.presets);
        if (Array.isArray(data.upcharges) && data.upcharges.length > 0) setUpcharges(data.upcharges);
        if (data.formula) setFormula(data.formula);
        if (data.logistics) setLogistics(data.logistics);
      })
      .catch((err) => {
        console.error('Failed to load door settings:', err);
      });
  }, []);

  // 2. Load Staff List for SubmitReviewModal
  useEffect(() => {
    Promise.all([
      fetch('/api/users').then((r) => r.json()).catch(() => []),
      fetch('/api/users?canBeAssigned=true').then((r) => r.json()).catch(() => []),
    ]).then(([allUsers, assignees]) => {
      if (Array.isArray(allUsers)) {
        const eligible = allUsers.filter(
          (d: any) =>
            d.role !== 'SUPERADMIN' &&
            d.role !== 'superadmin' &&
            d.username?.toLowerCase() !== 'cheeku' &&
            !d.username?.toLowerCase().includes('superadmin')
        );
        setStaffList(eligible);
        if (eligible.length > 0) {
          setAssignedReviewer(eligible[0].username);
        }
      }
      if (Array.isArray(assignees)) {
        const eligible = assignees.filter(
          (d: any) =>
            d.role !== 'SUPERADMIN' &&
            d.role !== 'superadmin' &&
            d.username?.toLowerCase() !== 'cheeku' &&
            !d.username?.toLowerCase().includes('superadmin')
        );
        setClerkList(eligible);
        if (eligible.length > 0) {
          setSelectedOdooClerk(eligible[0].username);
        }
      }
    });
  }, []);

  // 3. Update Saved Drafts Count
  const updateSavedCount = () => {
    const all = getSavedDrafts();
    setSavedDraftsCount(all.filter((d) => d.type === 'door').length);
  };

  useEffect(() => {
    updateSavedCount();
    window.addEventListener(DRAFT_CHANGE_EVENT, updateSavedCount);
    return () => window.removeEventListener(DRAFT_CHANGE_EVENT, updateSavedCount);
  }, []);

  // 4. Load Active Auto-save Draft on Mount
  useEffect(() => {
    const autoSave = getActiveAutoSave('door');
    if (autoSave && autoSave.data) {
      const d = autoSave.data as any;
      if (d.customerName) setCustomerName(d.customerName);
      if (d.quoteNumber) setQuoteNumber(d.quoteNumber);
      if (d.mode) setMode(d.mode);
      if (Array.isArray(d.lineItems)) setLineItems(d.lineItems);
      if (Array.isArray(d.globalUpcharges)) setGlobalUpcharges(d.globalUpcharges);
      if (d.travelFeeType) setTravelFeeType(d.travelFeeType);
      if (d.customTravelFee !== undefined) setCustomTravelFee(d.customTravelFee);
      if (d.showOutTownTravel !== undefined) setShowOutTownTravel(d.showOutTownTravel);
      if (d.travelKm !== undefined) setTravelKm(d.travelKm);
      if (d.crewHours !== undefined) setCrewHours(d.crewHours);
      if (d.crewSize) setCrewSize(d.crewSize);
      if (d.quoteNotes !== undefined) setQuoteNotes(d.quoteNotes);
      if (d.isFirstNation !== undefined) setIsFirstNation(d.isFirstNation);
      if (d.customLabour !== undefined) setCustomLabour(String(d.customLabour));
      if (d.customMisc !== undefined) setCustomMisc(String(d.customMisc));
      if (d.attachedWindowQuote !== undefined) setAttachedWindowQuote(d.attachedWindowQuote);
      if (d.attachedSealedUnit !== undefined) setAttachedSealedUnit(d.attachedSealedUnit);
      if (autoSave.timestamp) {
        setLastSavedAt(new Date(autoSave.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    }
    initialLoadDone.current = true;
  }, []);

  // 5. Calculate Totals using Pure Engine
  const totals = useMemo(() => {
    return calculateDoorQuoteTotals({
      lineItems,
      mode,
      globalUpcharges,
      travelFeeType,
      customTravelFee,
      showOutTownTravel,
      travelKm,
      crewHours,
      crewSize,
      hstRate: isFirstNation ? 8 : 13,
      isFirstNation,
      formula,
      logistics,
    });
  }, [
    lineItems,
    mode,
    globalUpcharges,
    travelFeeType,
    customTravelFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
    isFirstNation,
    formula,
    logistics,
  ]);

  // 6. Debounced Auto-Save
  useEffect(() => {
    if (!initialLoadDone.current) return;
    const timer = setTimeout(() => {
      if (lineItems.length === 0 && !attachedWindowQuote && !attachedSealedUnit && (!customerName || customerName === 'Valued Customer')) {
        clearActiveAutoSave('door');
        return;
      }

      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      saveActiveAutoSave('door', {
        quoteNumber,
        customerName,
        itemCount: lineItems.length,
        grandTotal: totals.grandTotal,
        summaryLabel: formatDoorSummarySentence(lineItems),
        data: {
          quoteNumber,
          customerName,
          quoteNotes,
          mode,
          lineItems,
          globalUpcharges,
          travelFeeType,
          customTravelFee,
          showOutTownTravel,
          travelKm,
          crewHours,
          crewSize,
          isFirstNation,
          customLabour,
          customMisc,
          attachedWindowQuote,
          attachedSealedUnit,
          subtotal: totals.subtotalPreTax,
          grandTotal: totals.grandTotal,
          itemCount: lineItems.length,
          totals,
        },
      });
      setLastSavedAt(nowStr);
    }, 700);

    return () => clearTimeout(timer);
  }, [
    customerName,
    quoteNumber,
    mode,
    lineItems,
    globalUpcharges,
    travelFeeType,
    customTravelFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
    quoteNotes,
    isFirstNation,
    attachedWindowQuote,
    attachedSealedUnit,
    totals,
  ]);

  // Explicit Save Draft into Persistent Registry
  const handleExplicitSaveDraft = () => {
    try {
      if (!customerName.trim()) {
        toast.error('Customer name is required before saving a draft.');
        return;
      }

      if (!quoteNumber.trim()) {
        toast.error('Quote number is required before saving a draft.');
        return;
      }

      if (lineItems.length === 0 && !attachedWindowQuote && !attachedSealedUnit) {
        toast.error('Please configure and add at least one door unit before saving a draft.');
        return;
      }

      const summaryLabel = formatDoorSummarySentence(lineItems);
      saveQuoteDraft({
        type: 'door',
        quoteNumber,
        customerName,
        itemCount: lineItems.length,
        subtotal: totals.subtotalPreTax,
        grandTotal: totals.grandTotal,
        summaryLabel,
        data: {
          quoteNumber,
          customerName,
          quoteNotes,
          mode,
          lineItems,
          globalUpcharges,
          travelFeeType,
          customTravelFee,
          showOutTownTravel,
          travelKm,
          crewHours,
          crewSize,
          isFirstNation,
          customLabour,
          customMisc,
          attachedWindowQuote,
          attachedSealedUnit,
          subtotal: totals.subtotalPreTax,
          grandTotal: totals.grandTotal,
          itemCount: lineItems.length,
          totals,
        },
      });
      updateSavedCount();
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSavedAt(nowStr);
      toast.success(`Door quote draft #${quoteNumber} saved to Saved Quotes!`);
    } catch (e) {
      toast.error('Failed to save draft');
    }
  };

  // Restore Quote from SavedQuotesModal
  const handleLoadQuoteFromDrafts = (draft: QuoteDraftItem) => {
    if (draft.type !== 'door') {
      toast.info(`Selected a ${draft.type} draft. Switch to that calculator to open it.`);
      return;
    }

    const d = draft.data as any;
    if (d.customerName) setCustomerName(d.customerName);
    if (d.quoteNumber) setQuoteNumber(d.quoteNumber);
    if (d.mode) setMode(d.mode);
    if (Array.isArray(d.lineItems)) setLineItems(d.lineItems);
    if (Array.isArray(d.globalUpcharges)) setGlobalUpcharges(d.globalUpcharges);
    if (d.travelFeeType) setTravelFeeType(d.travelFeeType);
    if (d.customTravelFee !== undefined) setCustomTravelFee(d.customTravelFee);
    if (d.showOutTownTravel !== undefined) setShowOutTownTravel(d.showOutTownTravel);
    if (d.travelKm !== undefined) setTravelKm(d.travelKm);
    if (d.crewHours !== undefined) setCrewHours(d.crewHours);
    if (d.crewSize) setCrewSize(d.crewSize);
    if (d.quoteNotes !== undefined) setQuoteNotes(d.quoteNotes);
    if (d.isFirstNation !== undefined) setIsFirstNation(d.isFirstNation);
    if (d.customLabour !== undefined) setCustomLabour(String(d.customLabour));
    else setCustomLabour('');
    if (d.customMisc !== undefined) setCustomMisc(String(d.customMisc));
    else setCustomMisc('');
    if (d.attachedWindowQuote !== undefined) setAttachedWindowQuote(d.attachedWindowQuote);
    else setAttachedWindowQuote(null);
    if (d.attachedSealedUnit !== undefined) setAttachedSealedUnit(d.attachedSealedUnit);
    else setAttachedSealedUnit(null);

    setIsSavedQuotesOpen(false);
    toast.success(`Loaded Door Quote #${draft.quoteNumber}`);
  };

  // Reset Quote (Clean in-app confirmation modal)
  const handleConfirmReset = () => {
    setLineItems([]);
    setEditingItem(null);
    setGlobalUpcharges([]);
    setTravelFeeType('local_std');
    setCustomTravelFee('');
    setShowOutTownTravel(false);
    setTravelKm('');
    setCrewHours('');
    setCrewSize('3');
    setQuoteNotes('');
    setIsFirstNation(false);
    setCustomLabour('');
    setCustomMisc('');
    setCustomerName('');
    setQuoteNumber('');
    setAttachedWindowQuote(null);
    setAttachedSealedUnit(null);
    clearActiveAutoSave('door');
    setLastSavedAt(null);
    setShowResetModal(false);
    toast.info('Quote reset to a blank workspace');
  };

  // Line Item Handlers
  const handleSaveItem = (item: DoorLineItem) => {
    setLineItems((prev) => {
      const existsIndex = prev.findIndex((i) => i.id === item.id);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = item;
        return copy;
      }
      return [...prev, item];
    });
    setEditingItem(null);
  };

  const handleEditItem = (item: DoorLineItem) => {
    setEditingItem(item);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const handleDuplicateItem = (id: string) => {
    const found = lineItems.find((i) => i.id === id);
    if (!found) return;
    const duplicated: DoorLineItem = {
      ...found,
      id: `door_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      customDescription: found.customDescription ? `${found.customDescription} (Copy)` : undefined,
    };
    setLineItems((prev) => [...prev, duplicated]);
    toast.success('Door duplicated');
  };

  const handleDeleteItem = (id: string) => {
    setLineItems((prev) => prev.filter((i) => i.id !== id));
    if (editingItem?.id === id) setEditingItem(null);
    toast.info('Door removed');
  };

  // Travel params updater
  const handleUpdateTravelParams = (updates: any) => {
    if (updates.travelFeeType !== undefined) setTravelFeeType(updates.travelFeeType);
    if (updates.customTravelFee !== undefined) setCustomTravelFee(updates.customTravelFee);
    if (updates.showOutTownTravel !== undefined) setShowOutTownTravel(updates.showOutTownTravel);
    if (updates.travelKm !== undefined) setTravelKm(updates.travelKm);
    if (updates.crewHours !== undefined) setCrewHours(updates.crewHours);
    if (updates.crewSize !== undefined) setCrewSize(updates.crewSize);
  };

  // Submit for Review / Direct Approve handler
  const handleSubmitQuote = async () => {
    if (!customerName.trim()) {
      toast.error('Customer name is required before submitting quote.');
      return;
    }

    if (!quoteNumber.trim()) {
      toast.error('Quote number is required before submitting quote.');
      return;
    }

    if (lineItems.length === 0) {
      toast.error('Please add at least one door to the quote before submitting!');
      return;
    }

    const isDirectApprove = Boolean(isAdmin && adminSubmitMode === 'direct_approve');
    if (isDirectApprove && !selectedOdooClerk && clerkList.length > 0) {
      setSelectedOdooClerk(clerkList[0].username);
    }
    if (!isDirectApprove && !assignedReviewer && staffList.length > 0) {
      setAssignedReviewer(staffList[0].username);
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
          quoteNotes,
          windows: lineItems.map((item) => ({
            id: item.id,
            combinationName: item.customDescription || item.presetLabel,
            doorPresetId: item.presetId,
            category: item.category,
            quantity: item.quantity,
            inksterBasePrice: item.inksterBasePrice,
            finalUnitPrice: item.inksterBasePrice,
            lineTotal: mode === 'supply_only' ? (item.lineSupplyTotal ?? (item.lineDoorSupplyTotal + item.lineHardwareTotal + (item.surchargeAmount * item.quantity) - (item.discountAmount * item.quantity))) : item.lineGrandTotal,
            hardwareType: item.hardwareType,
            hardwarePrice: item.hardwarePrice,
            upgradeOption: item.upgradeOption,
          })),
          taxTotals: {
            isSupplyOnly: mode === 'supply_only',
            isFirstNation,
            totalPrice: totals.rawDoorBaseTotal + totals.stormDoorTotal,
            subtotal: totals.subtotalPreTax,
            combinedLabour: totals.combinedLabourTotal,
            miscTotal: totals.miscTotal,
            surchargeTotal: totals.surchargeTotal,
            discountTotal: totals.discountTotal,
            hstAmount: totals.hstAmount,
            grandTotal: totals.grandTotal,
            depositAmount: totals.depositAmount,
          },
          status: isDirectApprove ? 'APPROVED' : 'PENDING_REVIEW',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit quote');

      toast.success(isDirectApprove ? 'Door quote approved and assigned!' : 'Door quote submitted for review!');
      setShowSubmitModal(false);
    } catch (err: any) {
      toast.error(err.message || 'Error submitting quote');
    } finally {
      setSubmittingQuote(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-16 relative z-10 space-y-5">
        <AppHeader currentPath="/doors" />

        {/* Page Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-2 border-b border-border/50">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-primary/10 text-primary">
                <DoorClosed className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Door &amp; Installation Calculator</h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Inkster software pricing, 8% surcharge, 10% door discount (storm exempt), hardware, and site labour.
            </p>
          </div>

          {/* Top Actions Row: Exact Sequence across all pages: Attach Quote -> Save Draft -> Saved Quotes -> Admin Rates */}
          <div className="flex items-center gap-2 flex-wrap">
            {lastSavedAt && (
              <span className="text-[11px] text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full border border-border/50">
                Draft auto-saved {lastSavedAt}
              </span>
            )}

            {/* 1. Attach Quote */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAttachModalOpen(true)}
              className={cn(
                'gap-1.5 text-xs h-8 px-2.5 font-semibold cursor-pointer shadow-xs transition-colors',
                attachedWindowQuote || attachedSealedUnit
                  ? 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                  : 'border-border/80 hover:bg-muted text-foreground'
              )}
              title="Attach saved Window or Sealed Unit quote to this door quote"
            >
              <Paperclip
                className={cn(
                  'w-3.5 h-3.5',
                  attachedWindowQuote || attachedSealedUnit
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-primary'
                )}
              />
              <span>{attachedWindowQuote || attachedSealedUnit ? 'Quote Attached' : 'Attach Quote'}</span>
            </Button>

            {/* 2. Save Draft */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleExplicitSaveDraft}
              className="gap-1.5 text-xs h-8 px-2.5 font-semibold cursor-pointer border-primary/40 text-primary hover:bg-primary/10 shadow-xs"
              title="Save current door quote to drafts"
            >
              <Bookmark className="w-3.5 h-3.5 text-primary" />
              <span>Save Draft</span>
            </Button>

            {/* 3. Saved Quotes */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsSavedQuotesOpen(true)}
              className="gap-1.5 text-xs h-8 px-2.5 font-semibold cursor-pointer border-border/80 hover:bg-muted shadow-xs"
              title="View and load saved quotes"
            >
              <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
              <span>Saved Quotes</span>
              {savedDraftsCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary text-primary-foreground">
                  {savedDraftsCount}
                </span>
              )}
            </Button>

            <Link href="/admin/doors">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8 px-2.5 font-semibold cursor-pointer border-border/80 hover:bg-muted shadow-xs">
                <SettingsIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Admin Rates</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Dedicated Customer & Quote Information Bar (Replacing standalone scope toggle) */}
        <Card className="bg-card/60 backdrop-blur-md border-border shadow-xs">
          <CardContent className="p-3 sm:px-4 py-2.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 space-y-0.5">
                  <Label className="text-[11px] text-muted-foreground font-semibold">
                    Customer Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter customer name (required)"
                    className="h-8 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 space-y-0.5">
                  <Label className="text-[11px] text-muted-foreground font-semibold">
                    Quote Reference # <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    value={quoteNumber}
                    onChange={(e) => setQuoteNumber(e.target.value)}
                    placeholder="Enter quote number (required)"
                    className="h-8 text-xs font-mono font-semibold"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main 2-Column Responsive Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Builder, Line items & Labour Card (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* Door Item Builder Form (Reset button on top right, no gap) */}
            <DoorItemBuilder
              presets={presets}
              formula={formula}
              editingItem={editingItem}
              onSaveItem={handleSaveItem}
              onCancelEdit={() => setEditingItem(null)}
              onResetQuote={() => setShowResetModal(true)}
            />

            {/* Configured Line Items Table */}
            <DoorLineItemsTable
              lineItems={lineItems}
              mode={mode}
              onEdit={handleEditItem}
              onDuplicate={handleDuplicateItem}
              onDelete={handleDeleteItem}
            />

            {/* Labour & Site Logistics Card (One-time Jobsite Upcharges & Fixed $140 Setup) */}
            <DoorLabourTravelCard
              mode={mode}
              availableUpcharges={upcharges}
              globalUpcharges={globalUpcharges}
              onUpdateGlobalUpcharges={setGlobalUpcharges}
              travelFeeType={travelFeeType}
              customTravelFee={customTravelFee}
              showOutTownTravel={showOutTownTravel}
              travelKm={travelKm}
              crewHours={crewHours}
              crewSize={crewSize}
              logistics={logistics}
              onUpdateParams={handleUpdateTravelParams}
            />
          </div>

          {/* Right Column: Quote Summary & Office Reference (5 cols) */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-5">
            {/* Unified Summary Card (Mode switch on header right; Submit on top of Preview/Print) */}
            <DoorQuoteSummaryCard
              customerName={customerName}
              quoteNumber={quoteNumber}
              lineItems={lineItems}
              totals={totals}
              mode={mode}
              onModeChange={setMode}
              isFirstNation={isFirstNation}
              onToggleFirstNation={setIsFirstNation}
              customLabour={customLabour}
              setCustomLabour={setCustomLabour}
              customMisc={customMisc}
              setCustomMisc={setCustomMisc}
              onSubmitQuote={() => setShowSubmitModal(true)}
              onPrintPreview={() => setShowPreviewModal(true)}
              isAdmin={isAdmin}
              attachedWindowQuote={attachedWindowQuote}
              attachedSealedUnit={attachedSealedUnit}
              onOpenAttachModal={() => setIsAttachModalOpen(true)}
              onRemoveAttachedWindowQuote={() => {
                setAttachedWindowQuote(null);
                toast.info('Detached window quote.');
              }}
              onRemoveAttachedSealedUnit={() => {
                setAttachedSealedUnit(null);
                toast.info('Detached sealed unit quote.');
              }}
            />

            {/* Office Pricing & Ledger Card (Collapsible) */}
            <DoorOfficePricingCard
              totals={totals}
              lineItems={lineItems}
              mode={mode}
            />
          </div>
        </div>
      </div>

      {/* Dedicated Printable Quote Invoice (Active during window.print) */}
      {!showPreviewModal && (
        <QuoteInvoice
          customerName={customerName}
          quoteNumber={quoteNumber}
          preparedBy={user?.name || user?.username || 'The Window & Door Store'}
          primaryQuoteType="door"
          doors={lineItems}
          doorTotals={totals}
          quoteNotes={quoteNotes}
          template={quoteTemplate}
          fontSize={quoteFontSize}
          spacing={quoteSpacing}
          hstRate={isFirstNation ? 8 : 13}
          isSupplyOnly={mode === 'supply_only'}
          globalUpcharges={globalUpcharges}
          attachedWindowQuote={attachedWindowQuote}
          attachedSealedUnit={attachedSealedUnit}
        />
      )}

      {/* Universal Interactive Print Preview Modal with 3 Templates, Sliders, and Notes */}
      <QuotePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        template={quoteTemplate}
        onTemplateChange={setQuoteTemplate}
        fontSize={quoteFontSize}
        onFontSizeChange={setQuoteFontSize}
        spacing={quoteSpacing}
        onSpacingChange={setQuoteSpacing}
        quoteNotes={quoteNotes}
        onQuoteNotesChange={setQuoteNotes}
        primaryQuoteType="door"
        doors={lineItems}
        doorTotals={totals}
        customerName={customerName}
        quoteNumber={quoteNumber}
        preparedBy={user?.name || user?.username || 'The Window & Door Store'}
        hstRate={isFirstNation ? 8 : 13}
        isSupplyOnly={mode === 'supply_only'}
        globalUpcharges={globalUpcharges}
        attachedWindowQuote={attachedWindowQuote}
        attachedSealedUnit={attachedSealedUnit}
      />

      {/* Modal 2: Submit for Review / Direct Approve Modal */}
      <SubmitReviewModal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        user={user}
        adminSubmitMode={adminSubmitMode}
        setAdminSubmitMode={setAdminSubmitMode}
        quoteNumber={quoteNumber}
        customerName={customerName}
        windowsCount={lineItems.length}
        total={totals.grandTotal}
        staffList={staffList}
        clerkList={clerkList}
        assignedReviewer={assignedReviewer}
        setAssignedReviewer={setAssignedReviewer}
        selectedOdooClerk={selectedOdooClerk}
        setSelectedOdooClerk={setSelectedOdooClerk}
        preparerNotes={preparerNotes}
        setPreparerNotes={setPreparerNotes}
        submittingQuote={submittingQuote}
        onSubmit={handleSubmitQuote}
      />

      {/* Modal 3: Saved Quotes Modal with Doors Filter */}
      <SavedQuotesModal
        isOpen={isSavedQuotesOpen}
        onClose={() => setIsSavedQuotesOpen(false)}
        defaultType="door"
        onLoadQuote={handleLoadQuoteFromDrafts}
      />

      {/* Modal: Universal Attach Quote Modal */}
      <AttachQuoteModal
        isOpen={isAttachModalOpen}
        onClose={() => setIsAttachModalOpen(false)}
        currentQuoteType="door"
        attachedWindowQuote={attachedWindowQuote}
        attachedSealedUnit={attachedSealedUnit}
        onAttachWindow={(win) => setAttachedWindowQuote(win)}
        onDetachWindow={() => setAttachedWindowQuote(null)}
        onAttachSealedUnit={(su) => setAttachedSealedUnit(su)}
        onDetachSealedUnit={() => setAttachedSealedUnit(null)}
      />

      {/* Modal 4: Custom In-App Reset Confirmation Dialog */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-card p-5 rounded-2xl shadow-2xl max-w-sm w-full border border-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-destructive/15 text-destructive shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Reset Door Quote?</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Are you sure you want to clear this workspace and all {lineItems.length} configured door items?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowResetModal(false)}
                className="text-xs cursor-pointer h-8"
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmReset}
                className="text-xs font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer h-8"
              >
                Reset Quote
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
