"use client"

import React from "react"
import dynamic from "next/dynamic"
import type { QuoteComparisonModalProps } from "@/components/calculator/QuoteComparisonModal"

const QuoteComparisonModal = dynamic(
  () =>
    import("@/components/calculator/QuoteComparisonModal").then(
      (m) => m.QuoteComparisonModal
    ),
  { ssr: false }
)

export function ComparisonModalWrapper(props: QuoteComparisonModalProps) {
  if (!props.isOpen) return null
  return <QuoteComparisonModal {...props} />
}
