"use client"

import React, { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import QuoteInvoice, {
  QuoteInvoiceProps,
  QuoteTemplateType,
} from "./QuoteInvoice"
import QuoteNotesEditor from "./QuoteNotesEditor"
import { QuotePreviewToolbar } from "./preview/QuotePreviewToolbar"
import { toast } from "sonner"
import { readSessionAttachedInstallOption } from "@/hooks/calculator/supply-mode/supply-session-storage"

interface QuotePreviewModalProps extends QuoteInvoiceProps {
  isOpen: boolean
  onClose: () => void
  template: QuoteTemplateType
  onTemplateChange: (t: QuoteTemplateType) => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  spacing: number
  onSpacingChange: (spacing: number) => void
  quoteNotes?: string
  onQuoteNotesChange?: (notes: string) => void
}

export default function QuotePreviewModal({
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
  ...invoiceProps
}: QuotePreviewModalProps) {
  const [mounted, setMounted] = useState(false)
  const [orientation, setOrientation] = useState<"portrait" | "landscape">(
    "portrait"
  )
  const [showNotesEditor, setShowNotesEditor] = useState(false)
  const isSupplyOnly = Boolean(invoiceProps.isSupplyOnly)
  const [isDualOption, setIsDualOption] = useState<boolean>(() =>
    Boolean(invoiceProps.isDualOption)
  )
  const [defaultTemplate, setDefaultTemplate] =
    useState<QuoteTemplateType | null>(null)

  useEffect(() => {
    if (isOpen) {
      if (invoiceProps.isDualOption !== undefined) {
        setIsDualOption(Boolean(invoiceProps.isDualOption))
      } else if (isSupplyOnly) {
        const hasAttachedInstall = Boolean(
          invoiceProps.attachedUpgrade?.title
            ?.toLowerCase()
            .includes("installation") ||
          invoiceProps.attachedUpgrade?.title?.toLowerCase().includes("option")
        )
        const cached = readSessionAttachedInstallOption()
        setIsDualOption(Boolean(hasAttachedInstall || cached?.enabled))
      }
    }
  }, [isOpen, invoiceProps.isDualOption, isSupplyOnly])

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
          ? localStorage.getItem("defaultQuoteTemplate")
          : null
      ) as QuoteTemplateType | null
      if (saved && ["modern", "executive", "cards"].includes(saved)) {
        setDefaultTemplate(saved)
        onTemplateChange(saved)
      } else {
        setDefaultTemplate("cards")
        onTemplateChange("cards")
      }
      fetch("/api/profile")
        .then((r) => r.json())
        .then((d) => {
          if (
            d?.favoriteTemplate &&
            ["modern", "executive", "cards"].includes(d?.favoriteTemplate)
          ) {
            setDefaultTemplate(d.favoriteTemplate)
            localStorage.setItem("defaultQuoteTemplate", d.favoriteTemplate)
            if (!saved) {
              onTemplateChange(d.favoriteTemplate)
            }
          }
        })
        .catch(() => {})
    }
  }, [isOpen])

  const handleSetDefaultTemplate = async () => {
    try {
      localStorage.setItem("defaultQuoteTemplate", template)
      setDefaultTemplate(template)
      await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ favoriteTemplate: template }),
      })
      const name =
        template === "modern"
          ? "Modern Detailed"
          : template === "executive"
            ? "Executive Ledger"
            : "Specification Sheet"
      toast.success(`${name} set as your default template!`)
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
      <QuotePreviewToolbar
        onPrint={handlePrint}
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
        showNotesEditor={showNotesEditor}
        setShowNotesEditor={setShowNotesEditor}
        quoteNotes={quoteNotes}
        isSupplyOnly={isSupplyOnly}
        isDualOption={isDualOption}
        setIsDualOption={setIsDualOption}
      />

      {/* Main Preview Area */}
      <div className="flex flex-1 flex-col items-center overflow-y-auto bg-muted/30 px-4 py-8 print:m-0 print:block print:h-auto print:w-full print:overflow-visible print:bg-white print:p-0">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media print {
            @page {
              size: letter ${orientation};
              margin: 0.35in 0.4in;
            }
          }
        `,
          }}
        />

        {/* Global In-Modal Notes Editor */}
        {showNotesEditor && onQuoteNotesChange && (
          <div className="mb-6 w-full max-w-4xl print:hidden">
            <QuoteNotesEditor
              value={quoteNotes}
              onChange={onQuoteNotesChange}
            />
          </div>
        )}

        <div
          className={`w-full transition-all duration-300 print:m-0 print:w-full print:max-w-none print:border-none print:p-0 print:shadow-none ${
            isLandscape ? "max-w-[1100px]" : "max-w-4xl"
          }`}
        >
          <QuoteInvoice
            isInteractivePreview={true}
            template={template}
            fontSize={fontSize}
            spacing={spacing}
            quoteNotes={quoteNotes}
            isDualOption={isDualOption}
            {...invoiceProps}
          />
        </div>
      </div>
    </div>
  )

  if (!mounted) return null
  return createPortal(modalContent, document.body)
}
