'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Layers,
  Sparkles,
  RotateCcw,
  User,
  Hash,
  RefreshCw,
  Bookmark,
  FolderOpen,
  Paperclip,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SmartBackButton from '@/components/shared/SmartBackButton';
import { AppHeader } from '@/components/layout/AppHeader';
import { SubmitReviewModal } from '@/components/calculator/SubmitReviewModal';
import { SavedQuotesModal } from '@/components/calculator/SavedQuotesModal';
import {
  saveQuoteDraft,
  saveActiveAutoSave,
  getActiveAutoSave,
  clearActiveAutoSave,
  getSavedDrafts,
  isAutoSaveAlreadySaved,
  QuoteDraftItem,
  ActiveAutoSaveDraft,
  DRAFT_CHANGE_EVENT,
} from '@/lib/quote-drafts-storage';
import {
  GlassTreatment,
  PaneType,
  ComboPricing,
  SealedUnitFormulaConstants,
  SealedUnitLabourSettings,
  ThicknessBreak,
  SealedUnitLineItem,
  GrillType,
  GrillProfile,
  GrillItemConfig,
  SealedUnitGrillSettings,
  GlassShape,
  DEFAULT_SEALED_UNIT_COMBOS,
  DEFAULT_FORMULA_CONSTANTS,
  DEFAULT_LABOUR_SETTINGS,
  DEFAULT_THICKNESS_BREAKS,
  DEFAULT_GRILL_SETTINGS,
  calculateGrillRawCost,
  parseInchesInput,
  inchesToSqft,
  calculateSealedUnitItem,
} from '@/lib/sealed-units-logic';
import { toast } from 'sonner';
import {
  SealedUnitItemBuilder,
  SealedUnitLabourTravelCard,
  SealedUnitQuoteSummaryCard,
  SealedUnitLineItemsTable,
  SealedUnitPrintInvoice,
  SealedUnitPreviewModal,
  SealedUnitTemplateType,
} from '@/components/sealed-units';
import { calculateSealedUnitTotals } from '@/lib/sealed-units/calculations';

export default function SealedUnitsCalculatorPage() {
  const { data: session } = useSession();
  const user = session?.user as any;

  // Helper to generate unique 6-digit quote number
  const generateQuoteNumber = () => Math.floor(100000 + Math.random() * 900000).toString();

  // Quote Metadata (Initialized empty on server, set on client mount)
  const [quoteNumber, setQuoteNumber] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [quoteNotes, setQuoteNotes] = useState<string>('');

  // Print & Interactive PDF Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);
  const [quoteTemplate, setQuoteTemplate] = useState<SealedUnitTemplateType>('window_style');
  const [quoteFontSize, setQuoteFontSize] = useState<number>(8.5);
  const [quoteSpacing, setQuoteSpacing] = useState<number>(1.0);

  // Submit for Review / Approval Workflow State
  const [showSubmitModal, setShowSubmitModal] = useState<boolean>(false);
  const [submittingQuote, setSubmittingQuote] = useState<boolean>(false);
  const [assignedReviewer, setAssignedReviewer] = useState<string>('');
  const [selectedOdooClerk, setSelectedOdooClerk] = useState<string>('');
  const [adminSubmitMode, setAdminSubmitMode] = useState<'direct_approve' | 'submit_review'>('direct_approve');
  const [preparerNotes, setPreparerNotes] = useState<string>('');
  const [staffList, setStaffList] = useState<any[]>([]);
  const [clerkList, setClerkList] = useState<any[]>([]);

  // Database Settings State
  const [combos, setCombos] = useState<ComboPricing[]>(DEFAULT_SEALED_UNIT_COMBOS);
  const [formula, setFormula] = useState<SealedUnitFormulaConstants>(DEFAULT_FORMULA_CONSTANTS);
  const [labour, setLabour] = useState<SealedUnitLabourSettings>(DEFAULT_LABOUR_SETTINGS);
  const [thicknessBreaks, setThicknessBreaks] = useState<ThicknessBreak[]>(DEFAULT_THICKNESS_BREAKS);
  const [grills, setGrills] = useState<SealedUnitGrillSettings>(DEFAULT_GRILL_SETTINGS);
  const [, setLoadingSettings] = useState(true);

  // Line Item Builder State
  const [treatment, setTreatment] = useState<GlassTreatment>('annealed');
  const [selectedComboId, setSelectedComboId] = useState<string>('ann_clear');
  const [selectedPane, setSelectedPane] = useState<PaneType>('dual');
  const [shape, setShape] = useState<GlassShape>('rectangle');
  const [widthInput, setWidthInput] = useState<string>('');
  const [heightInput, setHeightInput] = useState<string>('');
  const [qtyInput, setQtyInput] = useState<string>('');

  // Interior Grill Builder State
  const [grillType, setGrillType] = useState<GrillType>('none');
  const [grillProfile, setGrillProfile] = useState<GrillProfile>('5/8" x 1/4"');
  const [grillColor, setGrillColor] = useState<string>('White');
  const [grillPatternMode, setGrillPatternMode] = useState<'pattern' | 'manual'>('pattern');
  const [grillCols, setGrillCols] = useState<string>('');
  const [grillRows, setGrillRows] = useState<string>('');
  const [grillSquares, setGrillSquares] = useState<string>('');
  const [grillTIntersections, setGrillTIntersections] = useState<string>('');
  const [grillBentHubs, setGrillBentHubs] = useState<string>('');

  // Quote State
  const [lineItems, setLineItems] = useState<SealedUnitLineItem[]>([]);
  const [sealedUnitMode, setSealedUnitMode] = useState<'installation' | 'supply_only' | 'service_only'>('installation');
  const isInstallation = sealedUnitMode === 'installation';
  const isSupplyOnly = sealedUnitMode === 'supply_only';
  const isServiceOnly = sealedUnitMode === 'service_only';
  const [serviceSqftInput, setServiceSqftInput] = useState<string>('');
  const [serviceLabourRateInput, setServiceLabourRateInput] = useState<string>('');
  const [serviceMiscRateInput, setServiceMiscRateInput] = useState<string>('');

  const handleSetSealedUnitMode = (newMode: 'installation' | 'supply_only' | 'service_only') => {
    setSealedUnitMode(newMode);
    if (newMode === 'service_only') {
      setHstRate(13); // Tax is strictly 13% for on-site services
    }
  };

  const setIsInstallation = (val: boolean) => {
    handleSetSealedUnitMode(val ? 'installation' : 'supply_only');
  };
  const [travelFeeType, setTravelFeeType] = useState<'none' | 'far_std' | 'far_small' | 'custom'>('none');
  const [customTravelFee, setCustomTravelFee] = useState<string>('');
  const [showOutTownTravel, setShowOutTownTravel] = useState<boolean>(false);
  const [travelKm, setTravelKm] = useState<string>('');
  const [crewHours, setCrewHours] = useState<string>('');
  const [crewSize, setCrewSize] = useState<'2' | '3'>('3');
  const [hstRate, setHstRate] = useState<number>(13); // 13% HST, 8% Exempt on Materials, 0% Tax Exempt
  const [showResetModal, setShowResetModal] = useState<boolean>(false);

  // Saved Drafts & Auto-Recovery State
  const router = useRouter();
  const [isSavedQuotesOpen, setIsSavedQuotesOpen] = useState<boolean>(false);
  const [savedDraftsCount, setSavedDraftsCount] = useState<number>(0);
  const [activeAutoSaveDraft, setActiveAutoSaveDraft] = useState<ActiveAutoSaveDraft | null>(null);
  const [autoSaveRestoredOrDismissed, setAutoSaveRestoredOrDismissed] = useState<boolean>(false);
  const lastSavedSnapshotRef = useRef<string>('');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const widthRef = useRef<HTMLInputElement>(null);

  // Fetch live settings and reviewer/clerk lists from database on mount
  useEffect(() => {
    fetch('/api/sealed-units/settings')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.combos) && data.combos.length > 0) {
          setCombos(data.combos);
        }
        if (data.formula) setFormula(data.formula);
        if (data.labour) setLabour(data.labour);
        if (Array.isArray(data.thicknessBreaks)) setThicknessBreaks(data.thicknessBreaks);
        if (data.grills) setGrills(data.grills);
        setLoadingSettings(false);
      })
      .catch((err) => {
        console.error('Failed to load sealed unit settings:', err);
        setLoadingSettings(false);
      });

    // Reviewer and Clerk lists
    Promise.all([
      fetch(`/api/users?t=${Date.now()}`, { cache: 'no-store' }).then((r) =>
        r.ok ? r.json() : []
      ),
      fetch(`/api/users?assignees=true&t=${Date.now()}`, { cache: 'no-store' }).then((r) =>
        r.ok ? r.json() : []
      ),
    ])
      .then(([allUsers, assignees]) => {
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
          const defaultClerk = eligible.find((c: any) => c.department === 'CLERK') || eligible[0];
          if (defaultClerk) setSelectedOdooClerk(defaultClerk.username);
        }
      })
      .catch(console.error);
  }, []);

  // Filter combos by treatment (Annealed vs Tempered)
  const availableCombos = useMemo(() => {
    return combos.filter((c) => c.treatment === treatment);
  }, [combos, treatment]);

  // Keep selected combo valid when switching treatment
  useEffect(() => {
    if (!availableCombos.some((c) => c.id === selectedComboId)) {
      if (availableCombos.length > 0) {
        setSelectedComboId(availableCombos[0].id);
      }
    }
  }, [treatment, availableCombos, selectedComboId]);

  // Selected combo object
  const activeCombo = useMemo(() => {
    return combos.find((c) => c.id === selectedComboId) || availableCombos[0] || combos[0];
  }, [combos, selectedComboId, availableCombos]);

  // Check if current combo supports Dual pane
  const hasDualPane = useMemo(() => {
    if (!activeCombo) return true;
    const pricesObj = (activeCombo.prices as any) || {};
    return Object.values(pricesObj).some(
      (t: any) => t && t.dual !== null && t.dual !== undefined && t.dual !== '' && Number(t.dual) > 0
    );
  }, [activeCombo]);

  // Auto-switch to Triple if Dual is not available on selected combo
  useEffect(() => {
    if (!hasDualPane && selectedPane === 'dual') {
      setSelectedPane('triple');
    }
  }, [hasDualPane, selectedPane]);

  // Computed Live Area Preview (Actual sqft for tax & labour, Ceiling rounding for glass)
  const computedAreaPreview = useMemo(() => {
    try {
      const w = parseInchesInput(widthInput, 'width');
      const h = parseInchesInput(heightInput, 'height');
      const sqft = inchesToSqft(w, h);
      const roundedSqft = Math.ceil(sqft);
      const billableSqft = Math.max(formula.minSqft || 4.0, roundedSqft);
      return {
        sqft,
        roundedSqft,
        billableSqft,
        isUnderMin: sqft < formula.minSqft,
        valid: true,
      };
    } catch {
      return { sqft: 0, roundedSqft: 0, billableSqft: 0, isUnderMin: false, valid: false };
    }
  }, [widthInput, heightInput, formula.minSqft]);

  // Current grill unit rate based on selected profile & color
  const currentGridRate = useMemo(() => {
    const gridRates = grills?.gridRates || DEFAULT_GRILL_SETTINGS.gridRates;
    return gridRates?.[grillProfile]?.[grillColor] ?? 5.5;
  }, [grills, grillProfile, grillColor]);

  // Computed grill item config based on pattern mode or manual mode
  const computedGrillConfig = useMemo((): GrillItemConfig => {
    if (grillType === 'none') return { type: 'none' };
    const hubs = Math.max(0, parseInt(grillBentHubs, 10) || 0);

    if (grillType === 'grid') {
      if (grillPatternMode === 'pattern') {
        const c = Math.max(1, parseInt(grillCols, 10) || 1);
        const r = Math.max(1, parseInt(grillRows, 10) || 1);
        return {
          type: 'grid',
          profile: grillProfile,
          color: grillColor,
          colsCount: c,
          rowsCount: r,
          squaresCount: c * r,
          tIntersectionsCount: Math.max(0, c - 1) * Math.max(0, r - 1),
          bentHubsCount: hubs,
        };
      } else {
        return {
          type: 'grid',
          profile: grillProfile,
          color: grillColor,
          squaresCount: Math.max(0, parseInt(grillSquares, 10) || 0),
          tIntersectionsCount: Math.max(0, parseInt(grillTIntersections, 10) || 0),
          bentHubsCount: hubs,
        };
      }
    }

    return {
      type: grillType,
      color: grillColor,
      bentHubsCount: hubs,
    };
  }, [
    grillType,
    grillProfile,
    grillColor,
    grillPatternMode,
    grillCols,
    grillRows,
    grillSquares,
    grillTIntersections,
    grillBentHubs,
  ]);

  // Live Grill Cost Preview
  const activeGrillPreview = useMemo(() => {
    return calculateGrillRawCost(computedGrillConfig, grills);
  }, [computedGrillConfig, grills]);

  // Add Item Handler
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!activeCombo) throw new Error('Please select a glass combination.');
      const w = parseInchesInput(widthInput, 'width');
      const h = parseInchesInput(heightInput, 'height');
      const qty = parseInt(qtyInput, 10);
      if (!qty || qty < 1) throw new Error('Quantity must be at least 1.');

      const newItem = calculateSealedUnitItem({
        combo: activeCombo,
        paneType: selectedPane,
        widthIn: w,
        heightIn: h,
        quantity: qty,
        shape,
        formula,
        thicknessBreaks,
        labourSettings: labour,
        grill: computedGrillConfig,
        grillSettings: grills,
      });

      setLineItems((prev) => [...prev, newItem]);
      toast.success(`Added ${activeCombo.name} (${newItem.thicknessMm}mm) to quote.`);

      // Reset dimensions for fast entry
      setWidthInput('');
      setHeightInput('');
      setQtyInput('1');
      widthRef.current?.focus();
    } catch (err: any) {
      toast.error(err.message || 'Invalid dimensions or pricing error.');
    }
  };

  const handleRemoveItem = (id: string) => {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleResetQuote = () => {
    if (lineItems.length === 0) return;
    setShowResetModal(true);
  };

  // --- Aggregate Financial Calculations ---
  const totals = useMemo(() => {
    const calc = calculateSealedUnitTotals({
      lineItems,
      sealedUnitMode,
      serviceSqftInput,
      serviceLabourRateInput,
      serviceMiscRateInput,
      travelFeeType,
      customTravelFee,
      showOutTownTravel,
      travelKm,
      crewHours,
      crewSize,
      hstRate,
      labour,
    });

    return {
      ...calc,
      isServiceOnly,
    };
  }, [
    lineItems,
    sealedUnitMode,
    isServiceOnly,
    serviceSqftInput,
    serviceLabourRateInput,
    serviceMiscRateInput,
    travelFeeType,
    customTravelFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
    hstRate,
    labour,
  ]);

  const loadDraftIntoWorkspace = useCallback(
    (draft: QuoteDraftItem) => {
      if (draft.type === 'window') {
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current);
          autoSaveTimerRef.current = null;
        }
        clearActiveAutoSave('sealed_unit');
        router.push(`/calculator?loadDraftId=${draft.id}`);
        return;
      }

      const d = draft.data as any;
      if (!d) return;

      if (d.quoteNumber) setQuoteNumber(d.quoteNumber);
      if (d.customerName !== undefined) setCustomerName(d.customerName);
      if (d.quoteNotes !== undefined) setQuoteNotes(d.quoteNotes);
      if (Array.isArray(d.lineItems)) setLineItems(d.lineItems);
      if (d.sealedUnitMode) {
        setSealedUnitMode(d.sealedUnitMode);
      } else if (d.isInstallation !== undefined) {
        setIsInstallation(d.isInstallation);
      }
      if (d.serviceSqftInput !== undefined) setServiceSqftInput(d.serviceSqftInput);
      if (d.serviceLabourRateInput !== undefined) setServiceLabourRateInput(d.serviceLabourRateInput);
      if (d.serviceMiscRateInput !== undefined) setServiceMiscRateInput(d.serviceMiscRateInput);
      if (d.travelFeeType !== undefined) setTravelFeeType(d.travelFeeType);
      if (d.customTravelFee !== undefined) setCustomTravelFee(d.customTravelFee);
      if (d.showOutTownTravel !== undefined) setShowOutTownTravel(d.showOutTownTravel);
      if (d.travelKm !== undefined) setTravelKm(d.travelKm);
      if (d.crewHours !== undefined) setCrewHours(d.crewHours);
      if (d.crewSize !== undefined) setCrewSize(d.crewSize);
      if (d.hstRate !== undefined) setHstRate(d.hstRate);

      clearActiveAutoSave('sealed_unit');
      setActiveAutoSaveDraft(null);
      setAutoSaveRestoredOrDismissed(true);
      lastSavedSnapshotRef.current = JSON.stringify({
        quoteNumber: d.quoteNumber || '',
        customerName: (d.customerName || '').trim(),
        lineItems: d.lineItems || [],
        sealedUnitMode: d.sealedUnitMode || (d.isInstallation ? 'installation' : 'supply_only'),
        isInstallation: Boolean(d.isInstallation),
        serviceSqftInput: d.serviceSqftInput || '',
        serviceLabourRateInput: d.serviceLabourRateInput || '',
        serviceMiscRateInput: d.serviceMiscRateInput || '',
        travelFeeType: d.travelFeeType,
        customTravelFee: d.customTravelFee,
        showOutTownTravel: d.showOutTownTravel,
        travelKm: d.travelKm,
        crewHours: d.crewHours,
        crewSize: d.crewSize,
        hstRate: d.hstRate,
      });
      toast.success(`Loaded Sealed Unit Quote #${draft.quoteNumber}`);
    },
    [router]
  );

  const handleSaveDraft = useCallback(() => {
    const effectiveQuoteNumber = quoteNumber.trim() || generateQuoteNumber();
    if (!quoteNumber.trim()) {
      setQuoteNumber(effectiveQuoteNumber);
    }

    const panesCount = lineItems
      .map((l) => `${l.paneType === 'triple' ? 'Triple' : 'Dual'} Pane`)
      .slice(0, 3)
      .join(', ');
    const summaryTypeDesc = isServiceOnly
      ? `Service Only (${(totals.totalSqft || 0).toFixed(1)} sq ft)`
      : lineItems.length > 0
      ? `${lineItems.length} Sealed Units (${panesCount}${lineItems.length > 3 ? '...' : ''})`
      : '0 Sealed Units';

    saveQuoteDraft({
      type: 'sealed_unit',
      quoteNumber: effectiveQuoteNumber,
      customerName: customerName.trim() || 'Unnamed Customer',
      itemCount: isServiceOnly && lineItems.length === 0 ? 1 : lineItems.reduce((acc, it) => acc + it.quantity, 0),
      subtotal: totals.subtotalPreTax || 0,
      grandTotal: totals.grandTotal || 0,
      summaryLabel: summaryTypeDesc,
      data: {
        quoteNumber: effectiveQuoteNumber,
        customerName: customerName.trim(),
        quoteNotes,
        lineItems,
        sealedUnitMode,
        isInstallation,
        serviceSqftInput,
        serviceLabourRateInput,
        serviceMiscRateInput,
        travelFeeType,
        customTravelFee,
        showOutTownTravel,
        travelKm,
        crewHours,
        crewSize,
        hstRate,
        subtotal: totals.subtotalPreTax || 0,
        grandTotal: totals.grandTotal || 0,
        itemCount: isServiceOnly && lineItems.length === 0 ? 1 : lineItems.length,
        totals: totals,
      },
    });

    // Cancel any pending debounced auto-saver immediately
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }

    // Mark as saved so auto-save won't falsely flag it as unsaved
    clearActiveAutoSave('sealed_unit');
    setActiveAutoSaveDraft(null);
    setAutoSaveRestoredOrDismissed(true);
    lastSavedSnapshotRef.current = JSON.stringify({
      quoteNumber: effectiveQuoteNumber,
      customerName: customerName.trim(),
      lineItems,
      sealedUnitMode,
      isInstallation,
      serviceSqftInput,
      serviceLabourRateInput,
      serviceMiscRateInput,
      travelFeeType,
      customTravelFee,
      showOutTownTravel,
      travelKm,
      crewHours,
      crewSize,
      hstRate,
    });

    toast.success(`Sealed Unit Quote #${effectiveQuoteNumber} saved to drafts!`);
  }, [
    quoteNumber,
    customerName,
    lineItems,
    totals,
    quoteNotes,
    sealedUnitMode,
    isInstallation,
    isServiceOnly,
    serviceSqftInput,
    serviceLabourRateInput,
    serviceMiscRateInput,
    travelFeeType,
    customTravelFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
    hstRate,
  ]);

  // Saved drafts count sync
  useEffect(() => {
    const updateCount = () => {
      const all = getSavedDrafts();
      setSavedDraftsCount(all.filter((d) => d.type === 'sealed_unit').length);
    };
    updateCount();
    window.addEventListener(DRAFT_CHANGE_EVENT, updateCount);
    return () => window.removeEventListener(DRAFT_CHANGE_EVENT, updateCount);
  }, []);

  // Check URL query param and auto-save on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const draftId = urlParams.get('loadDraftId');
      if (draftId) {
        const allDrafts = getSavedDrafts();
        const match = allDrafts.find((d) => d.id === draftId);
        if (match && match.type === 'sealed_unit') {
          loadDraftIntoWorkspace(match);
          window.history.replaceState({}, '', '/sealed-units');
          return;
        }
      }
    }

    const recovered = getActiveAutoSave('sealed_unit');
    if (recovered && recovered.data && (recovered.itemCount > 0 || recovered.customerName)) {
      if (isAutoSaveAlreadySaved('sealed_unit', recovered)) {
        clearActiveAutoSave('sealed_unit');
        setActiveAutoSaveDraft(null);
      } else {
        setActiveAutoSaveDraft(recovered);
      }
    }
  }, [loadDraftIntoWorkspace]);

  // Debounced auto-save effect
  useEffect(() => {
    const hasMeaningfulContent =
      lineItems.length > 0 ||
      (isServiceOnly && (serviceSqftInput.trim() !== '' || (totals.totalSqft || 0) > 0)) ||
      customerName.trim() !== '';

    if (!hasMeaningfulContent) {
      clearActiveAutoSave('sealed_unit');
      return;
    }

    // Check if state is identical to last explicitly saved or loaded snapshot
    const currentSnapshot = JSON.stringify({
      quoteNumber: quoteNumber.trim(),
      customerName: customerName.trim(),
      lineItems,
      sealedUnitMode,
      isInstallation,
      serviceSqftInput,
      serviceLabourRateInput,
      serviceMiscRateInput,
      travelFeeType,
      customTravelFee,
      showOutTownTravel,
      travelKm,
      crewHours,
      crewSize,
      hstRate,
    });

    if (currentSnapshot === lastSavedSnapshotRef.current) {
      return; // Workspace matches saved state, not unsaved!
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      const summaryLabel = isServiceOnly
        ? `Service Only (${(totals.totalSqft || 0).toFixed(1)} sq ft)`
        : `${lineItems.length} Sealed Units`;

      saveActiveAutoSave('sealed_unit', {
        quoteNumber: quoteNumber || 'Draft',
        customerName: customerName || '',
        itemCount: isServiceOnly ? ((totals.totalSqft || 0) > 0 ? 1 : 0) : lineItems.length,
        grandTotal: totals.grandTotal || 0,
        summaryLabel,
        data: {
          quoteNumber,
          customerName,
          quoteNotes,
          lineItems,
          sealedUnitMode,
          isInstallation,
          serviceSqftInput,
          serviceLabourRateInput,
          serviceMiscRateInput,
          travelFeeType,
          customTravelFee,
          showOutTownTravel,
          travelKm,
          crewHours,
          crewSize,
          hstRate,
          subtotal: totals.subtotalPreTax || 0,
          grandTotal: totals.grandTotal || 0,
          itemCount: isServiceOnly && lineItems.length === 0 ? 1 : lineItems.length,
          totals: totals,
        },
      });
    }, 1500);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [
    lineItems,
    customerName,
    quoteNumber,
    quoteNotes,
    sealedUnitMode,
    isInstallation,
    isServiceOnly,
    serviceSqftInput,
    serviceLabourRateInput,
    serviceMiscRateInput,
    travelFeeType,
    customTravelFee,
    showOutTownTravel,
    travelKm,
    crewHours,
    crewSize,
    hstRate,
    totals,
  ]);

  const handlePrint = () => {
    if (lineItems.length === 0 && !(isServiceOnly && (totals.totalSqft || 0) > 0)) {
      toast.error('Add at least one line item or enter service sq ft before previewing.');
      return;
    }
    setIsPreviewOpen(true);
  };

  const handleAttachToWindowQuote = () => {
    if (lineItems.length === 0 && !(isServiceOnly && (totals.totalSqft || 0) > 0)) {
      toast.error('Add at least one sealed unit or enter service sq ft before attaching to a window quote.');
      return;
    }
    handleSaveDraft();
    toast.success('Sealed unit draft saved! Opening Window Calculator to attach...');
    setTimeout(() => {
      router.push('/calculator');
    }, 600);
  };

  const handleSubmitForReview = async () => {
    if (!quoteNumber.trim() || !customerName.trim()) {
      toast.error('Please enter Customer Name and Quote Number before submitting!');
      return;
    }
    if (lineItems.length === 0 && !(isServiceOnly && (totals.totalSqft || 0) > 0)) {
      toast.error('Please add at least one sealed unit or enter service sq ft before submitting!');
      return;
    }

    const isDirectApprove = Boolean(
      (user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && adminSubmitMode === 'direct_approve'
    );

    if (isDirectApprove && !selectedOdooClerk) {
      toast.error('Please select an Odoo clerk to assign this quote to');
      return;
    }
    if (!isDirectApprove && !assignedReviewer) {
      toast.error('Please select a reviewer to submit this quote to');
      return;
    }

    setSubmittingQuote(true);
    try {
      const effectiveLineItems = lineItems.length > 0 ? lineItems : [
        {
          id: 'service-unit-1',
          combinationName: 'On-Site Sealed Unit Glazing Service',
          paneType: 'dual',
          treatment: 'annealed',
          thicknessMm: 0,
          widthIn: 0,
          heightIn: 0,
          actualSqft: totals.totalSqft,
          billableSqft: Math.ceil(totals.totalSqft),
          quantity: 1,
          finalUnitPrice: 0,
          multipliedAmount: 0,
          multipliedTotal: 0,
          lineGlassTotal: 0,
          totalLabour: totals.serviceLabourTotal,
          totalMisc: totals.miscTotal,
        } as any,
      ];

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
          windows: effectiveLineItems,
          taxTotals: {
            isSupplyOnly: !isInstallation,
            subtotalPreTax: totals.subtotalPreTax,
            grandTotal: totals.grandTotal,
            hstAmount: totals.hstAmount,
            hstRate,
            totalUnits: totals.totalUnits,
            totalSqft: totals.totalSqft,
            glassSupplyTotal: totals.glassSupplyTotal,
            combinedLabourTotal: totals.combinedLabourTotal,
            miscTotal: totals.miscTotal,
            baseSetupFee: totals.baseSetupFee,
            totalAdditionalTravel: totals.totalAdditionalTravel,
            isSealedUnitQuote: true,
          },
          quoteResult: {
            base: totals.glassBefore8PercentTotal,
            surcharge: totals.glass8PercentSurchargeTotal,
            total: totals.grandTotal,
            isSealedUnit: true,
          },
          quoteSummaryTotal: totals.grandTotal,
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
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit quote');
    } finally {
      setSubmittingQuote(false);
    }
  };

  return (
    <>
      {/* Interactive Screen View (Hidden during Print) */}
      <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 su-no-print">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

        <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-10 relative z-10 space-y-4">
          <AppHeader currentPath="/sealed-units" />

          {/* Sub-bar with SmartBackButton & Title */}
          <div className="flex items-center justify-between gap-3 pb-1.5 border-b border-border/50">
            <div className="flex items-center gap-2.5">
              <SmartBackButton fallbackUrl="/calculator" title="Back to Calculator" />
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-md bg-primary/10 text-primary border border-primary/20">
                  <Layers className="w-4 h-4" />
                </span>
                <h1 className="text-base font-bold tracking-tight text-foreground">
                  Sealed Unit Calculator
                </h1>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  Official Shop Logic
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveDraft}
                className="h-7 text-xs cursor-pointer gap-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                title="Save current sealed unit quote to drafts"
              >
                <Bookmark className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Save Draft</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAttachToWindowQuote}
                className="h-7 text-xs cursor-pointer gap-1.5 border-primary/40 text-primary hover:bg-primary/10"
                title="Save and attach this sealed unit quote to a window quotation"
              >
                <Paperclip className="w-3.5 h-3.5 text-primary" />
                <span>Attach to Window Quote</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSavedQuotesOpen(true)}
                className="h-7 text-xs cursor-pointer gap-1.5 border-border hover:bg-muted"
                title="View and load saved quotes"
              >
                <FolderOpen className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Saved Quotes</span>
                {savedDraftsCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                    {savedDraftsCount}
                  </span>
                )}
              </Button>
              {(user?.role === 'ADMIN' || user?.role === 'SUPERADMIN' || Boolean(user?.canAccessAdmin)) && (
                <Link href="/admin/sealed-units">
                  <Button variant="outline" size="sm" className="h-7 text-xs cursor-pointer gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-primary" />
                    <span>Manage Price Sheets</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Unsaved Sealed Unit Draft Recovery Notification (Ultra-Slim Minimal Space) */}
          {activeAutoSaveDraft && !autoSaveRestoredOrDismissed && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg py-1 px-3 flex items-center justify-between gap-2 shadow-xs animate-in fade-in duration-150">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 animate-pulse" />
                <div className="text-xs text-foreground truncate">
                  <span className="font-semibold text-amber-700 dark:text-amber-400 mr-1">Unsaved Session:</span>
                  <span className="text-muted-foreground">{activeAutoSaveDraft.customerName || 'Customer'} (#{activeAutoSaveDraft.quoteNumber || 'Draft'} · {activeAutoSaveDraft.itemCount} units · ${activeAutoSaveDraft.grandTotal ? activeAutoSaveDraft.grandTotal.toFixed(2) : '0.00'})</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    loadDraftIntoWorkspace({
                      id: 'autosave',
                      type: 'sealed_unit',
                      quoteNumber: activeAutoSaveDraft.quoteNumber,
                      customerName: activeAutoSaveDraft.customerName,
                      createdAt: activeAutoSaveDraft.timestamp,
                      updatedAt: activeAutoSaveDraft.timestamp,
                      itemCount: activeAutoSaveDraft.itemCount,
                      subtotal: (activeAutoSaveDraft.data as any).subtotal || 0,
                      grandTotal: activeAutoSaveDraft.grandTotal,
                      summaryLabel: activeAutoSaveDraft.summaryLabel,
                      data: activeAutoSaveDraft.data,
                    });
                  }}
                  className="h-5 px-2 text-[10px] font-bold cursor-pointer bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Resume
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    clearActiveAutoSave('sealed_unit');
                    setActiveAutoSaveDraft(null);
                    setAutoSaveRestoredOrDismissed(true);
                  }}
                  className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {/* Customer & Quote Number Information Bar */}
          <div className="bg-card/70 border border-border/80 backdrop-blur-xl rounded-2xl p-3 sm:p-3.5 shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Customer Name */}
              <div className="sm:col-span-7 space-y-1">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>Customer Name</span>
                </Label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-9 text-xs sm:text-sm bg-background shadow-xs font-medium"
                />
              </div>

              {/* 6-Digit Quote Number */}
              <div className="sm:col-span-5 space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-primary" />
                    <span>6-Digit Quote Number</span>
                  </Label>
                  <button
                    type="button"
                    onClick={() => setQuoteNumber(generateQuoteNumber())}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1 cursor-pointer font-medium"
                    title="Generate a fresh unique 6-digit quote number"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Regenerate</span>
                  </button>
                </div>
                <div className="relative">
                  <Input
                    suppressHydrationWarning
                    value={quoteNumber}
                    onChange={(e) => setQuoteNumber(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    className="h-9 text-xs sm:text-sm font-mono font-bold bg-background shadow-xs text-foreground tracking-wider pl-8"
                  />
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-mono font-bold text-xs pointer-events-none">
                    #
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main 2-Column Responsive Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
            {/* LEFT COLUMN (7 cols): Item Builder & Added Line Items Table */}
            <div className="lg:col-span-7 space-y-3.5">
              <SealedUnitItemBuilder
                treatment={treatment}
                setTreatment={setTreatment}
                availableCombos={availableCombos}
                selectedComboId={selectedComboId}
                setSelectedComboId={setSelectedComboId}
                activeCombo={activeCombo}
                hasDualPane={hasDualPane}
                selectedPane={selectedPane}
                setSelectedPane={setSelectedPane}
                shape={shape}
                setShape={setShape}
                widthInput={widthInput}
                setWidthInput={setWidthInput}
                heightInput={heightInput}
                setHeightInput={setHeightInput}
                qtyInput={qtyInput}
                setQtyInput={setQtyInput}
                grillType={grillType}
                setGrillType={setGrillType}
                grillProfile={grillProfile}
                setGrillProfile={setGrillProfile}
                grillColor={grillColor}
                setGrillColor={setGrillColor}
                grillPatternMode={grillPatternMode}
                setGrillPatternMode={setGrillPatternMode}
                grillCols={grillCols}
                setGrillCols={setGrillCols}
                grillRows={grillRows}
                setGrillRows={setGrillRows}
                grillSquares={grillSquares}
                setGrillSquares={setGrillSquares}
                grillTIntersections={grillTIntersections}
                setGrillTIntersections={setGrillTIntersections}
                grillBentHubs={grillBentHubs}
                setGrillBentHubs={setGrillBentHubs}
                computedGrillConfig={computedGrillConfig}
                activeGrillPreview={activeGrillPreview}
                grills={grills}
                onAddItem={handleAddItem}
                onSaveDraft={handleSaveDraft}
                onOpenSavedQuotes={() => setIsSavedQuotesOpen(true)}
                savedDraftsCount={savedDraftsCount}
              />

              <SealedUnitLineItemsTable
                lineItems={lineItems}
                isInstallation={isInstallation}
                mode={sealedUnitMode}
                labourRate={totals.effectiveLabourRate}
                miscRate={totals.effectiveMiscRate}
                onRemoveItem={handleRemoveItem}
                onResetQuote={handleResetQuote}
              />
            </div>

            {/* RIGHT COLUMN (5 cols, sticky): Installation/Travel & Quote Summary */}
            <div className="lg:col-span-5 space-y-3.5 lg:sticky lg:top-4">
              <SealedUnitLabourTravelCard
                mode={sealedUnitMode}
                setMode={handleSetSealedUnitMode}
                isInstallation={isInstallation}
                setIsInstallation={setIsInstallation}
                labour={labour}
                travelFeeType={travelFeeType}
                setTravelFeeType={setTravelFeeType}
                customTravelFee={customTravelFee}
                setCustomTravelFee={setCustomTravelFee}
                showOutTownTravel={showOutTownTravel}
                setShowOutTownTravel={setShowOutTownTravel}
                travelKm={travelKm}
                setTravelKm={setTravelKm}
                crewHours={crewHours}
                setCrewHours={setCrewHours}
                crewSize={crewSize}
                setCrewSize={setCrewSize}
                serviceSqftInput={serviceSqftInput}
                setServiceSqftInput={setServiceSqftInput}
                serviceLabourRateInput={serviceLabourRateInput}
                setServiceLabourRateInput={setServiceLabourRateInput}
                serviceMiscRateInput={serviceMiscRateInput}
                setServiceMiscRateInput={setServiceMiscRateInput}
                itemsSqft={totals.itemsSqft || 0}
                totals={totals}
              />

              <SealedUnitQuoteSummaryCard
                lineItems={lineItems}
                lineItemsCount={lineItems.length}
                mode={sealedUnitMode}
                isInstallation={isInstallation}
                labour={labour}
                hstRate={hstRate}
                setHstRate={setHstRate}
                totals={totals}
                customerName={customerName}
                quoteNumber={quoteNumber}
                quoteNotes={quoteNotes}
                setQuoteNotes={setQuoteNotes}
                user={user}
                onOpenSubmitModal={() => {
                  if (!quoteNumber.trim() || !customerName.trim()) {
                    toast.error('Please enter a Customer Name and Quote Number before submitting!');
                    return;
                  }
                  if (lineItems.length === 0 && !(isServiceOnly && (totals.totalSqft || 0) > 0)) {
                    toast.error('Add at least one line item or enter service sq ft before submitting!');
                    return;
                  }
                  const otherReviewers = staffList.filter(
                    (s) => s.username?.toLowerCase() !== user?.username?.toLowerCase()
                  );
                  if (
                    otherReviewers.length > 0 &&
                    (!assignedReviewer ||
                      assignedReviewer.toLowerCase() === user?.username?.toLowerCase() ||
                      assignedReviewer === 'Admin')
                  ) {
                    setAssignedReviewer(otherReviewers[0].username);
                  }
                  if (!selectedOdooClerk && clerkList.length > 0) {
                    const defaultClerk = clerkList.find((c) => c.department === 'CLERK') || clerkList[0];
                    if (defaultClerk) setSelectedOdooClerk(defaultClerk.username);
                  }
                  setShowSubmitModal(true);
                }}
                onPrint={handlePrint}
                onResetQuote={handleResetQuote}
                onSaveDraft={handleSaveDraft}
                onOpenSavedQuotes={() => setIsSavedQuotesOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit for Review / Direct Approve Modal */}
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
        onSubmit={handleSubmitForReview}
      />

      {/* Custom Designed Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-card p-5 rounded-2xl shadow-2xl max-w-sm w-full border border-border space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-destructive/15 text-destructive shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Reset Quote?</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Are you sure you want to reset all {lineItems.length} sealed unit line items?
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
                onClick={() => {
                  setLineItems([]);
                  setShowResetModal(false);
                  clearActiveAutoSave('sealed_unit');
                  setActiveAutoSaveDraft(null);
                  setAutoSaveRestoredOrDismissed(true);
                  toast.info('Quote reset.');
                }}
                className="text-xs font-bold bg-destructive hover:bg-destructive/90 text-destructive-foreground cursor-pointer h-8"
              >
                Reset Quote
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* DEDICATED CLEAN PRINTABLE QUOTE INVOICE (Visible ONLY during print/PDF when preview modal is not active) */}
      {!isPreviewOpen && (
        <SealedUnitPrintInvoice
          lineItems={lineItems}
          mode={sealedUnitMode}
          isInstallation={isInstallation}
          labour={labour}
          hstRate={hstRate}
          customerName={customerName}
          quoteNumber={quoteNumber}
          quoteNotes={quoteNotes}
          preparedBy={user?.name || user?.username || ''}
          totals={totals}
          template={quoteTemplate}
          fontSize={quoteFontSize}
          spacing={quoteSpacing}
        />
      )}

      {/* Interactive Print Preview Modal with 3 Templates, Sliders, and Notes */}
      <SealedUnitPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        template={quoteTemplate}
        onTemplateChange={setQuoteTemplate}
        fontSize={quoteFontSize}
        onFontSizeChange={setQuoteFontSize}
        spacing={quoteSpacing}
        onSpacingChange={setQuoteSpacing}
        quoteNotes={quoteNotes}
        onQuoteNotesChange={setQuoteNotes}
        lineItems={lineItems}
        mode={sealedUnitMode}
        isInstallation={isInstallation}
        labour={labour}
        hstRate={hstRate}
        customerName={customerName}
        quoteNumber={quoteNumber}
        preparedBy={user?.name || user?.username || ''}
        totals={totals}
      />

      {/* Saved Quotes & Drafts Modal */}
      <SavedQuotesModal
        isOpen={isSavedQuotesOpen}
        onClose={() => setIsSavedQuotesOpen(false)}
        defaultType="sealed_unit"
        onLoadQuote={loadDraftIntoWorkspace}
      />
    </>
  );
}
