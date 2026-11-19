"use client"

import { useState, useRef } from "react"
import { toast } from "sonner"
import { UIWindowItem } from "@/hooks/useCalculatorWindows"
import { parseAndValidateOptionBPdf } from "./quote-comparison-pdf"

export function useOptionBUpload(
  currentWindows: UIWindowItem[],
  customerName: string,
  quoteNumber: string,
  onAfterCopyA?: () => void
) {
  const [optionBWindows, setOptionBWindows] = useState<UIWindowItem[] | null>(null)
  const [optionBMeta, setOptionBMeta] = useState<{
    customerName?: string
    quoteNumber?: string
  }>({})
  const [isParsing, setIsParsing] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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

  const handleCopyOptionAWindows = () => {
    if (!currentWindows || currentWindows.length === 0) {
      toast.error("No windows found in Option A to copy.")
      return
    }
    const cloned = currentWindows.map((w) => ({ ...w }))
    setOptionBWindows(cloned)
    setOptionBMeta({
      customerName,
      quoteNumber,
    })
    onAfterCopyA?.()
    toast.success(
      "Copied Option A windows to Option B. Select Jambs & Casing below."
    )
  }

  return {
    optionBWindows,
    setOptionBWindows,
    optionBMeta,
    setOptionBMeta,
    isParsing,
    isDragging,
    setIsDragging,
    fileInputRef,
    handleFileInputChange,
    handleDrop,
    handleCopyOptionAWindows,
  }
}
