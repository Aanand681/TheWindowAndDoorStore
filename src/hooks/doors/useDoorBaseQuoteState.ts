"use client"

import { useState, useCallback } from "react"
import { DoorQuotingMode, DoorSelectedUpcharge } from "@/lib/doors/types"
import { QuoteTemplateType } from "@/components/quotes/QuoteInvoice"
import { useLoyaltyDiscountState } from "@/hooks/shared/useLoyaltyDiscountState"
import type { CustomMaterialItem } from "@/types/calculator"

export function useDoorBaseQuoteState() {
  const [customerName, setCustomerName] = useState<string>("")
  const [quoteNumber, setQuoteNumber] = useState<string>("")
  const [mode, setMode] = useState<DoorQuotingMode>("installation")
  const [globalUpcharges, setGlobalUpcharges] = useState<DoorSelectedUpcharge[]>([])
  const [quoteNotes, setQuoteNotes] = useState<string>("")
  const [isFirstNation, setIsFirstNation] = useState<boolean>(false)
  const [hstRate, setHstRateState] = useState<number>(13)

  const setHstRate = useCallback((rate: number) => {
    setHstRateState(rate)
    setIsFirstNation(rate === 8)
  }, [])

  const handleToggleFirstNation = useCallback((val: boolean) => {
    setIsFirstNation(val)
    setHstRateState(val ? 8 : 13)
  }, [])

  const [customLabour, setCustomLabour] = useState<string>("")
  const [customMisc, setCustomMisc] = useState<string>("")
  const [customDiscount, setCustomDiscount] = useState<string>("")
  const [customDiscountLabel, setCustomDiscountLabel] = useState<string>("")
  const loyalty = useLoyaltyDiscountState({ hstRate, isFirstNation })
  const [customMaterials, setCustomMaterials] = useState<CustomMaterialItem[]>([])
  const [attachedWindowQuote, setAttachedWindowQuote] = useState<any | null>(null)
  const [attachedSealedUnit, setAttachedSealedUnit] = useState<any | null>(null)

  const [quoteTemplate, setQuoteTemplate] = useState<QuoteTemplateType>("universal")
  const [quoteFontSize, setQuoteFontSize] = useState<number>(11.5)
  const [quoteSpacing, setQuoteSpacing] = useState<number>(1.0)
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false)
  const [isAttachModalOpen, setIsAttachModalOpen] = useState<boolean>(false)

  return {
    customerName,
    setCustomerName,
    quoteNumber,
    setQuoteNumber,
    mode,
    setMode,
    globalUpcharges,
    setGlobalUpcharges,
    quoteNotes,
    setQuoteNotes,
    isFirstNation,
    setIsFirstNation,
    hstRate,
    setHstRate,
    handleToggleFirstNation,
    customLabour,
    setCustomLabour,
    customMisc,
    setCustomMisc,
    customDiscount,
    setCustomDiscount,
    customDiscountLabel,
    setCustomDiscountLabel,
    ...loyalty,
    customMaterials,
    setCustomMaterials,
    attachedWindowQuote,
    setAttachedWindowQuote,
    attachedSealedUnit,
    setAttachedSealedUnit,
    quoteTemplate,
    setQuoteTemplate,
    quoteFontSize,
    setQuoteFontSize,
    quoteSpacing,
    setQuoteSpacing,
    showPreviewModal,
    setShowPreviewModal,
    isAttachModalOpen,
    setIsAttachModalOpen,
  }
}
