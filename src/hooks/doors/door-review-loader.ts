"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import {
  clearAllQuoteSessionState,
  writeSessionAttachedInstallOption,
  writeSessionCustomOptions,
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import {
  DoorLineItem,
  DoorPreset,
  DoorFormulaSettings,
  DoorCategory,
} from "@/lib/doors/types"
import { useReviewPermissions } from "@/hooks/calculator/review/useReviewPermissions"
import { navigateExitReview } from "@/hooks/quotes/review/review-navigation"

export function mapSavedWindowToDoorLineItem(
  w: any,
  presets: DoorPreset[] = [],
  formula?: DoorFormulaSettings
): DoorLineItem {
  if (w.presetId && w.presetLabel && w.netDoorPrice !== undefined) {
    return w as DoorLineItem
  }
  const preset = presets.find((p) => p.id === (w.doorPresetId || w.presetId))
  const category = (w.category || preset?.category || "entry") as DoorCategory
  const presetLabel =
    preset?.label || w.presetLabel || w.combinationName || "Door Unit"
  const inksterBasePrice = Number(
    w.inksterBasePrice ?? w.finalUnitPrice ?? w.base ?? 0
  )
  const quantity = Math.max(1, Number(w.quantity ?? w.qty ?? 1))
  const surchargeRate = formula?.surchargeRate ?? 8
  const discountRate =
    category === "storm" ? 0 : (formula?.doorDiscountPercent ?? 10)
  const surchargeAmount =
    Math.round(inksterBasePrice * (surchargeRate / 100) * 100) / 100
  const discountAmount =
    Math.round(inksterBasePrice * (discountRate / 100) * 100) / 100
  const netDoorPrice = inksterBasePrice + surchargeAmount - discountAmount

  const unitLabour = preset?.labour ?? (w.unitLabour || 0)
  const unitMisc = preset?.misc ?? (w.unitMisc || 0)
  const hwPrice = Number(
    w.hardwarePrice ??
      (w.hardwareType === "standard"
        ? formula?.locksetDeadboltPrice || 158
        : 0)
  )

  return {
    id:
      w.id ||
      `door_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    presetId: w.doorPresetId || w.presetId || preset?.id || "custom",
    presetLabel,
    category,
    customDescription: w.combinationName || w.customDescription || presetLabel,
    inksterBasePrice,
    surchargePercent: surchargeRate,
    surchargeAmount,
    priceWithSurcharge: inksterBasePrice + surchargeAmount,
    discountPercent: discountRate,
    discountAmount,
    netDoorPrice,
    quantity,
    unitLabour,
    unitMisc,
    hardwareType: w.hardwareType || "none",
    hardwarePrice: hwPrice,
    supplyHardwareType: w.supplyHardwareType || w.hardwareType || "none",
    supplyHardwarePrice: w.supplyHardwarePrice || hwPrice,
    installHardwareType: w.installHardwareType || w.hardwareType || "standard",
    installHardwarePrice: w.installHardwarePrice || hwPrice,
    customerHardwareFee: w.customerHardwareFee || 0,
    customHardwareName: w.customHardwareName,
    customHardwarePrice: w.customHardwarePrice,
    upcharges: Array.isArray(w.upcharges) ? w.upcharges : [],
    upchargesTotal: Number(w.upchargesTotal || 0),
    lineDoorSupplyTotal: netDoorPrice * quantity,
    lineLabourTotal: unitLabour * quantity,
    lineMiscTotal: unitMisc * quantity,
    lineHardwareTotal: hwPrice * quantity,
    lineGrandTotal: Number(
      w.lineTotal ||
        (netDoorPrice + unitLabour + unitMisc + hwPrice) * quantity
    ),
    upgradeOption: w.upgradeOption,
    notes: w.notes,
  }
}

export interface UseDoorReviewLoaderParams {
  user: any
  presets: DoorPreset[]
  formula: DoorFormulaSettings
  setCustomerName: (name: string) => void
  setQuoteNumber: (num: string) => void
  setQuoteNotes: (notes: string) => void
  setMode: (mode: any) => void
  setLineItems: (items: DoorLineItem[]) => void
  setGlobalUpcharges: (u: any[]) => void
  setSelectedRegionId?: (id: string) => void
  setTravelFeeType: (t: any) => void
  setCustomTravelFee: (f: string) => void
  setShowOutTownTravel: (show: boolean) => void
  setTravelKm: (km: string) => void
  setCrewHours: (h: string) => void
  setCrewSize: (s: "2" | "3") => void
  setIsFirstNation: (fn: boolean) => void
  setHstRate: (rate: number) => void
  setCustomLabour: (l: string) => void
  setCustomMisc: (m: string) => void
  setAttachedWindowQuote: (q: any) => void
  setAttachedSealedUnit: (u: any) => void
  onConfirmReset: () => void
  initialReviewQuoteId?: string
  initialIsEditMode?: boolean
  originSubTab?: string
}

export function useDoorReviewLoader(p: UseDoorReviewLoaderParams) {
  const {
    user, presets, formula, setCustomerName, setQuoteNumber, setQuoteNotes,
    setMode, setLineItems, setGlobalUpcharges, setSelectedRegionId,
    setTravelFeeType, setCustomTravelFee, setShowOutTownTravel, setTravelKm,
    setCrewHours, setCrewSize, setIsFirstNation, setHstRate, setCustomLabour,
    setCustomMisc, setAttachedWindowQuote, setAttachedSealedUnit, onConfirmReset,
    initialReviewQuoteId, initialIsEditMode = false, originSubTab,
  } = p

  const [reviewQuoteId, setReviewQuoteId] = useState<string | null>(
    initialReviewQuoteId || null
  )
  const [reviewQuote, setReviewQuote] = useState<any>(null)
  const [isEditMode, setIsEditMode] = useState<boolean>(initialIsEditMode)
  const [originalSnapshot, setOriginalSnapshot] = useState<any>(null)
  const [reviewActionLoading, setReviewActionLoading] = useState(false)

  const perms = useReviewPermissions({ user, reviewQuote, isEditMode })

  const loadQuoteIntoWorkspace = useCallback(
    (q: any, edit?: boolean) => {
      clearAllQuoteSessionState()
      setReviewQuote(q)
      setOriginalSnapshot(q.initialSnapshot || q)

      const isClerk = perms.isOdooClerk
      const isApproved = q.status === "APPROVED" || q.status === "MODIFIED"
      const isPending = q.status === "PENDING_REVIEW"
      const isPrep = Boolean(user?.username && q.preparedBy?.toLowerCase() === user.username.toLowerCase())
      const isOdooDone = Boolean(q.odooStatus === "COMPLETED" || q.odooOrderNumber)
      const allowEdit = Boolean(
        edit && !isOdooDone && !isClerk &&
        (isApproved ? perms.canEditApprovedQuote : true) &&
        (!isPending || (!isPrep && perms.isReviewerOrAdmin))
      )
      setIsEditMode(allowEdit)

      if (q.customerName) setCustomerName(q.customerName)
      if (q.quoteNumber) setQuoteNumber(q.quoteNumber)
      if (q.quoteNotes !== undefined) setQuoteNotes(q.quoteNotes)
      if (q.mode) setMode(q.mode)

      const rawWindows = Array.isArray(q.windows) ? q.windows : []
      const mappedDoors = rawWindows.map((w: any) =>
        mapSavedWindowToDoorLineItem(w, presets, formula)
      )
      setLineItems(mappedDoors)

      if (Array.isArray(q.globalUpcharges)) setGlobalUpcharges(q.globalUpcharges)
      if (q.selectedRegionId && setSelectedRegionId) setSelectedRegionId(q.selectedRegionId)
      if (q.travelFeeType) setTravelFeeType(q.travelFeeType)
      if (q.customTravelFee !== undefined) setCustomTravelFee(String(q.customTravelFee))
      if (q.showOutTownTravel !== undefined) setShowOutTownTravel(Boolean(q.showOutTownTravel))
      if (q.travelKm !== undefined) setTravelKm(String(q.travelKm))
      if (q.crewHours !== undefined) setCrewHours(String(q.crewHours))
      if (q.crewSize) setCrewSize(q.crewSize)
      if (q.isFirstNation !== undefined) {
        setIsFirstNation(Boolean(q.isFirstNation))
        setHstRate(q.isFirstNation ? 8 : (q.hstRate ?? 13))
      }
      setCustomLabour(q.customLabour !== undefined ? String(q.customLabour) : "")
      setCustomMisc(q.customMisc !== undefined ? String(q.customMisc) : "")
      setAttachedWindowQuote(q.attachedWindowQuote ?? null)
      setAttachedSealedUnit(q.attachedSealedUnit ?? null)

      writeSessionAttachedInstallOption(q.attachedInstallOption ?? null)
      writeSessionCustomOptions(Array.isArray(q.customOptions) ? q.customOptions : [])

      toast.info(
        allowEdit
          ? `Loaded Door Quote #${q.quoteNumber} in Edit Mode`
          : `Loaded Door Quote #${q.quoteNumber} in Review Mode`
      )
    },
    [
      perms.canEditApprovedQuote,
      perms.isOdooClerk,
      presets,
      formula,
      setCustomerName,
      setQuoteNumber,
      setQuoteNotes,
      setMode,
      setLineItems,
      setGlobalUpcharges,
      setSelectedRegionId,
      setTravelFeeType,
      setCustomTravelFee,
      setShowOutTownTravel,
      setTravelKm,
      setCrewHours,
      setCrewSize,
      setIsFirstNation,
      setHstRate,
      setCustomLabour,
      setCustomMisc,
      setAttachedWindowQuote,
      setAttachedSealedUnit,
    ]
  )

  const handleOpenQuote = useCallback(
    (qId: string, edit?: boolean) => {
      setReviewQuoteId(qId)
      fetch(`/api/quotes/${qId}?t=${Date.now()}`, { cache: "no-store" })
        .then((r) => r.json())
        .then((q) => {
          if (q && q._id) loadQuoteIntoWorkspace(q, edit)
        })
        .catch(console.error)
    },
    [loadQuoteIntoWorkspace]
  )

  useEffect(() => {
    if (initialReviewQuoteId) {
      handleOpenQuote(initialReviewQuoteId, initialIsEditMode)
    }
  }, [initialReviewQuoteId, initialIsEditMode, handleOpenQuote])

  const handleCancelEdits = useCallback(() => {
    if (reviewQuote) loadQuoteIntoWorkspace(reviewQuote, false)
  }, [reviewQuote, loadQuoteIntoWorkspace])

  const handleExitReview = useCallback(() => {
    clearAllQuoteSessionState()
    setReviewQuoteId(null)
    setReviewQuote(null)
    setIsEditMode(false)
    setOriginalSnapshot(null)
    onConfirmReset()
    navigateExitReview(p.originSubTab)
  }, [onConfirmReset, p.originSubTab])

  return {
    reviewQuoteId,
    reviewQuote,
    setReviewQuote,
    isEditMode,
    setIsEditMode,
    originalSnapshot,
    setOriginalSnapshot,
    reviewActionLoading,
    setReviewActionLoading,
    perms,
    handleOpenQuote,
    handleCancelEdits,
    handleExitReview,
  }
}
