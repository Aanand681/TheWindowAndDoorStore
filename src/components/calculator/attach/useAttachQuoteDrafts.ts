"use client"

import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import {
  getSavedDrafts,
  syncRemoteDrafts,
  QuoteDraftItem,
  QuoteType,
  DRAFT_CHANGE_EVENT,
} from "@/lib/quote-drafts-storage"
import {
  buildDoorAttachPayload,
  buildSealedUnitAttachPayload,
  buildWindowAttachPayload,
} from "./attach-payload-builders"

export interface UseAttachQuoteDraftsProps {
  isOpen: boolean
  currentQuoteType?: QuoteType
  attachedWindowQuote?: any | null
  attachedSealedUnit?: any | null
  attachedDoorQuote?: any | null
  onAttachWindow?: (data: any) => void
  onAttachSealedUnit?: (data: any) => void
  onAttachDoor?: (data: any) => void
  onAttach?: (data: any) => void
}

export function useAttachQuoteDrafts({
  isOpen,
  currentQuoteType = "window",
  attachedWindowQuote,
  attachedSealedUnit,
  attachedDoorQuote,
  onAttachWindow,
  onAttachSealedUnit,
  onAttachDoor,
  onAttach,
}: UseAttachQuoteDraftsProps) {
  const [drafts, setDrafts] = useState<QuoteDraftItem[]>([])
  const [activeTab, setActiveTab] = useState<
    "all" | "window" | "sealed_unit" | "door"
  >("all")
  const [searchQuery, setSearchQuery] = useState("")

  const loadDrafts = () => {
    const all = getSavedDrafts()
    setDrafts(all.filter((d) => d.type !== currentQuoteType))
  }

  useEffect(() => {
    if (isOpen) {
      loadDrafts()
      syncRemoteDrafts()
        .then(() => loadDrafts())
        .catch(() => {})
      setSearchQuery("")
      setActiveTab("all")
    }
  }, [isOpen, currentQuoteType])

  useEffect(() => {
    window.addEventListener(DRAFT_CHANGE_EVENT, loadDrafts)
    return () => window.removeEventListener(DRAFT_CHANGE_EVENT, loadDrafts)
  }, [currentQuoteType])

  const filteredDrafts = useMemo(() => {
    let list = drafts
    if (activeTab !== "all") {
      list = list.filter((d) => d.type === activeTab)
    }
    if (!searchQuery.trim()) return list
    const q = searchQuery.toLowerCase().trim()
    return list.filter(
      (d) =>
        d.quoteNumber?.toLowerCase().includes(q) ||
        d.customerName?.toLowerCase().includes(q) ||
        d.summaryLabel?.toLowerCase().includes(q)
    )
  }, [drafts, activeTab, searchQuery])

  const windowDraftsCount = useMemo(
    () => drafts.filter((d) => d.type === "window").length,
    [drafts]
  )
  const sealedUnitCount = useMemo(
    () => drafts.filter((d) => d.type === "sealed_unit").length,
    [drafts]
  )
  const doorCount = useMemo(
    () => drafts.filter((d) => d.type === "door").length,
    [drafts]
  )

  const isDraftAttached = (draft: QuoteDraftItem) => {
    if (draft.type === "window") {
      return attachedWindowQuote?.quoteNumber === draft.quoteNumber
    }
    if (draft.type === "sealed_unit") {
      return attachedSealedUnit?.quoteNumber === draft.quoteNumber
    }
    if (draft.type === "door") {
      return attachedDoorQuote?.quoteNumber === draft.quoteNumber
    }
    return false
  }

  const handleAttachItem = (draft: QuoteDraftItem) => {
    if (draft.type === "door") {
      const payload = buildDoorAttachPayload(draft)
      if (onAttachDoor) onAttachDoor(payload)
      else if (onAttach) onAttach(payload)
      toast.success(`Attached Door Quote #${draft.quoteNumber}!`)
    } else if (draft.type === "sealed_unit") {
      const payload = buildSealedUnitAttachPayload(draft)
      if (onAttachSealedUnit) onAttachSealedUnit(payload)
      else if (onAttach) onAttach(payload)
      toast.success(`Attached Sealed Unit Quote #${draft.quoteNumber}!`)
    } else if (draft.type === "window") {
      const payload = buildWindowAttachPayload(draft)
      if (onAttachWindow) onAttachWindow(payload)
      else if (onAttach) onAttach(payload)
      toast.success(`Attached Window Quote #${draft.quoteNumber}!`)
    }
  }

  return {
    drafts,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    filteredDrafts,
    windowDraftsCount,
    sealedUnitCount,
    doorCount,
    isDraftAttached,
    handleAttachItem,
  }
}
