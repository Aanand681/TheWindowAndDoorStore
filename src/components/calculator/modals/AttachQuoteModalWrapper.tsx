"use client"

import React from "react"
import dynamic from "next/dynamic"
import type { AttachQuoteModalProps } from "@/components/calculator/AttachQuoteModal"

const AttachQuoteModal = dynamic(
  () =>
    import("@/components/calculator/AttachQuoteModal").then(
      (m) => m.AttachQuoteModal
    ),
  { ssr: false }
)

export function AttachQuoteModalWrapper(props: AttachQuoteModalProps) {
  if (!props.isOpen) return null
  return <AttachQuoteModal {...props} />
}
