"use client"

import React from "react"
import dynamic from "next/dynamic"
import type { QuoteType, QuoteDraftItem } from "@/lib/quote-drafts-storage"

const SavedQuotesModal = dynamic(
  () =>
    import("@/components/calculator/SavedQuotesModal").then(
      (m) => m.SavedQuotesModal
    ),
  { ssr: false }
)

export interface SavedQuotesModalWrapperProps {
  isOpen: boolean
  onClose: () => void
  defaultType?: QuoteType | "all"
  onLoadQuote: (draft: QuoteDraftItem) => void
}

export function SavedQuotesModalWrapper(props: SavedQuotesModalWrapperProps) {
  if (!props.isOpen) return null
  return <SavedQuotesModal {...props} />
}
