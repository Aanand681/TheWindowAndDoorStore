"use client"

import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import {
  SealedUnitPrintInvoice,
  SealedUnitTemplateType,
} from "./SealedUnitPrintInvoice"
import {
  SealedUnitLineItem,
  SealedUnitLabourSettings,
} from "@/lib/sealed-units-logic"
import { toast } from "sonner"
import { SealedUnitPrintToolbar } from "./preview/SealedUnitPrintToolbar"

export interface SealedUnitPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  template: SealedUnitTemplateType
  onTemplateChange: (t: SealedUnitTemplateType) => void
  fontSize: number
  onFontSizeChange: (sz: number) => void
  spacing: number
  onSpacingChange: (sp: number) => void
  quoteNotes?: string
  onQuoteNotesChange?: (notes: string) => void
  lineItems: SealedUnitLineItem[]
  mode?: "installation" | "supply_only" | "service_only"
  isInstallation: boolean
  labour: SealedUnitLabourSettings
  hstRate: number
  customerName: string
  quoteNumber: string
  preparedBy?: string
  totals: any
  attachedWindowQuote?: any | null
  attachedDoorQuote?: any | null
}

export function SealedUnitPreviewModal({
  isOpen,
  onClose,
  template,
  onTemplateChange,
  fontSize,
  onFontSizeChange,
  spacing,
  onSpacingChange,
  quoteNotes = "",
  onQuoteNotesChange,
  lineItems,
  mode = "installation",
  isInstallation,
  labour,
  hstRate,
  customerName,
  quoteNumber,
  preparedBy,
  totals,
  attachedWindowQuote,
  attachedDoorQuote,
}: SealedUnitPreviewModalProps) {
  const [mounted, setMounted] = useState(false)
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  )
  const [showNotesEditor, setShowNotesEditor] = useState(false)
  const [defaultTemplate, setDefaultTemplate] =
    useState<SealedUnitTemplateType | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("quote-modal-open")
      return () => {
        document.body.classList.remove("quote-modal-open")
      }
    }
    return undefined
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      const saved = (
        typeof window !== "undefined"
          ? localStorage.getItem("defaultSealedUnitTemplate")
          : null
      ) as SealedUnitTemplateType | null
      if (saved && ["window_style", "standard", "production"].includes(saved)) {
        setDefaultTemplate(saved)
        onTemplateChange(saved)
      } else {
        setDefaultTemplate("window_style")
      }
    }
  }, [isOpen, onTemplateChange])

  const handleSetDefaultTemplate = () => {
    try {
      localStorage.setItem("defaultSealedUnitTemplate", template)
      setDefaultTemplate(template)
      const name =
        template === "window_style"
          ? "Window Style Proposal"
          : template === "standard"
            ? "Standard Full Width"
            : "Production Order"
      toast.success(`${name} set as your default sealed unit template!`)
    } catch {
      toast.success("Template saved as default!")
    }
  }

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const isLandscape = orientation === "landscape"

  const modalContent = (
    <div className="quote-preview-portal fixed inset-0 z-50 flex animate-in flex-col bg-background/80 backdrop-blur-md duration-200 fade-in print:static print:inset-auto print:m-0 print:block print:h-auto print:w-full print:overflow-visible print:bg-white print:p-0">
      <SealedUnitPrintToolbar
        handlePrint={handlePrint}
        onClose={onClose}
        template={template}
        onTemplateChange={onTemplateChange}
        defaultTemplate={defaultTemplate}
        handleSetDefaultTemplate={handleSetDefaultTemplate}
        orientation={orientation}
        setOrientation={setOrientation}
        fontSize={fontSize}
        onFontSizeChange={onFontSizeChange}
        spacing={spacing}
        onSpacingChange={onSpacingChange}
        quoteNotes={quoteNotes}
        onQuoteNotesChange={onQuoteNotesChange}
        showNotesEditor={showNotesEditor}
        setShowNotesEditor={setShowNotesEditor}
      />

      {/* Main Preview Document Viewport */}
      <div className="flex flex-1 justify-center overflow-y-auto bg-muted/30 p-4 sm:p-8 print:m-0 print:block print:w-full print:overflow-visible print:bg-white print:p-0">
        <div
          className={`w-full ${
            isLandscape ? "max-w-[10.8in]" : "max-w-[8.2in]"
          } transition-all duration-200 print:m-0 print:w-full print:max-w-none print:p-0`}
        >
          <div className="overflow-hidden rounded border border-border/40 bg-white shadow-2xl print:overflow-visible print:rounded-none print:border-none print:shadow-none">
            <SealedUnitPrintInvoice
              lineItems={lineItems}
              mode={mode}
              isInstallation={isInstallation}
              labour={labour}
              totals={totals}
              hstRate={hstRate}
              customerName={customerName}
              quoteNumber={quoteNumber}
              quoteNotes={quoteNotes}
              preparedBy={preparedBy}
              template={template}
              fontSize={fontSize}
              spacing={spacing}
              orientation={orientation}
              isInteractivePreview={true}
              attachedWindowQuote={attachedWindowQuote}
              attachedDoorQuote={attachedDoorQuote}
            />
          </div>
        </div>
      </div>
    </div>
  )

  if (mounted && typeof document !== "undefined") {
    return createPortal(modalContent, document.body)
  }
  return modalContent
}
