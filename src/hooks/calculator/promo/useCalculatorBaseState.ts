"use client"

import { useState } from "react"
import { QuotesSubTabType } from "@/components/quotes/QuotesTab"
import { QuoteTemplateType } from "@/components/quotes/QuoteInvoice"
import { ILabourUpgradeTier } from "@/lib/promo-logic"

export function useCalculatorBaseState() {
  // Primary Quote Info
  const [quoteNumber, setQuoteNumber] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [quoteNotes, setQuoteNotes] = useState("")
  const [surchargeRate, setSurchargeRate] = useState<number>(8)
  const [user, setUser] = useState<any>(null)
  const [_pendingReviewCount, setPendingReviewCount] = useState<number>(0)

  // Tab & Navigation State
  const [activeTab, setActiveTab] = useState<"promo" | "tax" | "quotes">(
    "promo"
  )
  const [quotesSubTab, setQuotesSubTab] = useState<QuotesSubTabType>("review")
  const [taxCalcKey, setTaxCalcKey] = useState(0)

  // Invoice & Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)
  const [attachedUpgrade, setAttachedUpgrade] = useState<{
    title: string
    amountPreTaxCents: number
  } | null>(null)
  const [attachedSealedUnit, setAttachedSealedUnit] = useState<any | null>(null)
  const [attachedDoorQuote, setAttachedDoorQuote] = useState<any | null>(null)
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false)
  const [quoteTemplate, setQuoteTemplate] = useState<QuoteTemplateType>("cards")
  const [quoteFontSize, setQuoteFontSize] = useState<number>(11.5)
  const [quoteSpacing, setQuoteSpacing] = useState<number>(1.0)
  const [showResetModal, setShowResetModal] = useState<boolean>(false)

  // DB Labour Upgrade Tiers
  const [dbLabourUpgradeTiers, setDbLabourUpgradeTiers] = useState<
    ILabourUpgradeTier[] | undefined
  >(undefined)

  return {
    quoteNumber,
    setQuoteNumber,
    customerName,
    setCustomerName,
    quoteNotes,
    setQuoteNotes,
    surchargeRate,
    setSurchargeRate,
    user,
    setUser,
    _pendingReviewCount,
    setPendingReviewCount,
    activeTab,
    setActiveTab,
    quotesSubTab,
    setQuotesSubTab,
    taxCalcKey,
    setTaxCalcKey,
    isPreviewOpen,
    setIsPreviewOpen,
    isCompareModalOpen,
    setIsCompareModalOpen,
    attachedUpgrade,
    setAttachedUpgrade,
    attachedSealedUnit,
    setAttachedSealedUnit,
    attachedDoorQuote,
    setAttachedDoorQuote,
    isAttachModalOpen,
    setIsAttachModalOpen,
    quoteTemplate,
    setQuoteTemplate,
    quoteFontSize,
    setQuoteFontSize,
    quoteSpacing,
    setQuoteSpacing,
    showResetModal,
    setShowResetModal,
    dbLabourUpgradeTiers,
    setDbLabourUpgradeTiers,
  }
}
