"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { toast } from "sonner"
import { UIWindowItem } from "@/hooks/useCalculatorWindows"
import { formatMoney } from "@/lib/promo-logic"
import {
  QuoteComparisonModalProps,
  OptionBFinancials,
  ComparisonDelta,
  DbSettingsItem,
  ComparisonOverridesPayload,
} from "@/components/calculator/comparison/types"
import {
  calculateOptionBFinancials,
  calculateComparisonDelta,
  detectUpgradeTitle,
} from "./quote-comparison-calc"
import { parseAndValidateOptionBPdf } from "./quote-comparison-pdf"
import {
  resolveOptionALabel,
  resolveOverrideDisplay,
  resolveEffectiveRate,
} from "./quote-comparison-jambs"

export function useQuoteComparison(props: QuoteComparisonModalProps) {
  const {
    isOpen,
    currentWindows,
    surchargeRate,
    supplyJambId,
    supplyJambName,
    supplyJambRate,
    supplyCasingId,
    supplyCasingName,
    supplyCasingRate,
    effectiveJC,
    effectiveMisc,
    effectiveLabour,
    availablePromos,
    activePromoId,
    hstRate,
    afterDiscountA,
    totalA,
    isComparisonStaging = false,
    stagedOptionB,
    attachedUpgrade,
    onAttachUpgrade,
  } = props

  const [mounted, setMounted] = useState(false)
  const [optionBWindows, setOptionBWindows] = useState<UIWindowItem[] | null>(
    null
  )
  const [optionBMeta, setOptionBMeta] = useState<{
    customerName?: string
    quoteNumber?: string
  }>({})
  const [isParsing, setIsParsing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // In-Modal Quick Overrides for Option B
  const [showOverrides, setShowOverrides] = useState(false)
  const [overrideJambId, setOverrideJambId] = useState<string>("inherit")
  const [overrideJambRate] = useState<string>("")
  const [overrideCasingId, setOverrideCasingId] = useState<string>("inherit")
  const [overrideCasingRate] = useState<string>("")

  const [dbJambs, setDbJambs] = useState<DbSettingsItem[]>([])
  const [dbCasings, setDbCasings] = useState<DbSettingsItem[]>([])
  const [extraLinPerWindow, setExtraLinPerWindow] = useState<number>(2.17)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch settings for jamb/casing rate inheritance
  useEffect(() => {
    if (!isOpen) return
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => {
        if (d?.jambs?.length) setDbJambs(d.jambs)
        if (d?.casings?.length) setDbCasings(d.casings)
      })
      .catch(() => {})

    fetch("/api/regions")
      .then((r) => r.json())
      .then((regions) => {
        if (!Array.isArray(regions)) return
        const supply = regions.find(
          (r: any) => r.isSupplyOnly || r.name?.toLowerCase().includes("supply")
        )
        if (supply?.extraLinPerWindow !== undefined) {
          setExtraLinPerWindow(Number(supply.extraLinPerWindow) || 2.17)
        }
      })
      .catch(() => {})
  }, [isOpen])

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden")
      return () => {
        document.body.classList.remove("overflow-hidden")
      }
    }
    return undefined
  }, [isOpen])

  // Live Option B windows: prioritize active staged workspace when in comparison staging
  const effectiveOptionBWindows = useMemo(() => {
    if (
      isComparisonStaging &&
      stagedOptionB?.windows &&
      stagedOptionB.windows.length > 0
    ) {
      return stagedOptionB.windows
    }
    return optionBWindows
  }, [isComparisonStaging, stagedOptionB, optionBWindows])

  const processOptionBFile = async (file: File) => {
    if (!file) return
    setIsParsing(true)
    try {
      const result = await parseAndValidateOptionBPdf(file, currentWindows)
      if (result) {
        setOptionBMeta(result.meta)
        setOptionBWindows(result.parsed)
      }
    } finally {
      setIsParsing(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processOptionBFile(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type === "application/pdf") {
      processOptionBFile(file)
    } else {
      toast.error("Please drop a valid PDF file.")
    }
  }

  const resolvedOptionAJambLabel = useMemo(
    () => resolveOptionALabel(supplyJambId, supplyJambName, dbJambs),
    [supplyJambId, supplyJambName, dbJambs]
  )

  const resolvedOptionACasingLabel = useMemo(
    () => resolveOptionALabel(supplyCasingId, supplyCasingName, dbCasings),
    [supplyCasingId, supplyCasingName, dbCasings]
  )

  const selectedOverrideJambDisplay = useMemo(
    () =>
      resolveOverrideDisplay(
        overrideJambId,
        resolvedOptionAJambLabel,
        dbJambs,
        "Select jamb"
      ),
    [overrideJambId, resolvedOptionAJambLabel, dbJambs]
  )

  const selectedOverrideCasingDisplay = useMemo(
    () =>
      resolveOverrideDisplay(
        overrideCasingId,
        resolvedOptionACasingLabel,
        dbCasings,
        "Select casing"
      ),
    [overrideCasingId, resolvedOptionACasingLabel, dbCasings]
  )

  const effectiveJambRateB = useMemo(
    () =>
      resolveEffectiveRate(
        overrideJambId,
        overrideJambRate,
        supplyJambId,
        supplyJambRate,
        dbJambs
      ),
    [overrideJambId, overrideJambRate, supplyJambId, supplyJambRate, dbJambs]
  )

  const effectiveCasingRateB = useMemo(
    () =>
      resolveEffectiveRate(
        overrideCasingId,
        overrideCasingRate,
        supplyCasingId,
        supplyCasingRate,
        dbCasings
      ),
    [
      overrideCasingId,
      overrideCasingRate,
      supplyCasingId,
      supplyCasingRate,
      dbCasings,
    ]
  )

  const optionBFinancials = useMemo<OptionBFinancials | null>(() => {
    return calculateOptionBFinancials({
      isComparisonStaging,
      stagedOptionB,
      effectiveOptionBWindows,
      surchargeRate,
      extraLinPerWindow,
      effectiveJambRateB,
      effectiveCasingRateB,
      overrideJambId,
      overrideCasingId,
      effectiveJC,
      effectiveMisc,
      effectiveLabour,
      availablePromos,
      activePromoId,
      hstRate,
    })
  }, [
    isComparisonStaging,
    stagedOptionB,
    effectiveOptionBWindows,
    surchargeRate,
    extraLinPerWindow,
    effectiveJambRateB,
    effectiveCasingRateB,
    overrideJambId,
    overrideCasingId,
    effectiveJC,
    effectiveMisc,
    effectiveLabour,
    availablePromos,
    activePromoId,
    hstRate,
  ])

  const delta = useMemo<ComparisonDelta | null>(() => {
    return calculateComparisonDelta(optionBFinancials, afterDiscountA, totalA)
  }, [optionBFinancials, afterDiscountA, totalA])

  const [customUpgradeTitle, setCustomUpgradeTitle] = useState<string>("")

  const detectedUpgradeTitle = useMemo(() => {
    return detectUpgradeTitle(effectiveOptionBWindows, currentWindows)
  }, [effectiveOptionBWindows, currentWindows])

  const effectiveUpgradeTitle = useMemo(() => {
    return customUpgradeTitle.trim() || detectedUpgradeTitle
  }, [customUpgradeTitle, detectedUpgradeTitle])

  useEffect(() => {
    if (attachedUpgrade?.title) {
      setCustomUpgradeTitle(attachedUpgrade.title)
    }
  }, [attachedUpgrade])

  const handleUpgradeTitleChange = (newTitle: string) => {
    setCustomUpgradeTitle(newTitle)
    if (attachedUpgrade && delta && delta.preTax > 0) {
      onAttachUpgrade({
        title: newTitle.trim() || detectedUpgradeTitle,
        amountPreTaxCents: delta.preTax,
      })
    }
  }

  const handleToggleAttachUpgrade = () => {
    if (!delta || delta.preTax <= 0) {
      toast.error(
        "Optional upgrade can only be attached when there is an upgrade price difference."
      )
      return
    }

    if (attachedUpgrade) {
      onAttachUpgrade(null)
      toast.info("Removed optional upgrade offer from quote PDF.")
    } else {
      onAttachUpgrade({
        title: effectiveUpgradeTitle,
        amountPreTaxCents: delta.preTax,
      })
      toast.success(
        `Attached "${effectiveUpgradeTitle} adds ${formatMoney(delta.preTax)}" to quote PDF!`
      )
    }
  }

  const getOverridesPayload = (): ComparisonOverridesPayload => ({
    jambId: overrideJambId === "inherit" ? supplyJambId : overrideJambId,
    jambRate: overrideJambId === "inherit" ? supplyJambRate : overrideJambRate,
    casingId:
      overrideCasingId === "inherit" ? supplyCasingId : overrideCasingId,
    casingRate:
      overrideCasingId === "inherit" ? supplyCasingRate : overrideCasingRate,
  })

  return {
    mounted,
    effectiveOptionBWindows,
    optionBMeta,
    isParsing,
    isDragging,
    setIsDragging,
    showOverrides,
    setShowOverrides,
    overrideJambId,
    setOverrideJambId,
    overrideCasingId,
    setOverrideCasingId,
    dbJambs,
    dbCasings,
    fileInputRef,
    handleFileInputChange,
    handleDrop,
    resolvedOptionAJambLabel,
    resolvedOptionACasingLabel,
    selectedOverrideJambDisplay,
    selectedOverrideCasingDisplay,
    optionBFinancials,
    delta,
    customUpgradeTitle,
    detectedUpgradeTitle,
    handleUpgradeTitleChange,
    handleToggleAttachUpgrade,
    getOverridesPayload,
  }
}
