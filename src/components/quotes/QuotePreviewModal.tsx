"use client"

import React, { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react"
import { createPortal } from "react-dom"
import { useSession } from "next-auth/react"
import { toast } from "sonner"
import QuoteInvoice, {
  QuoteInvoiceProps,
  QuoteTemplateType,
} from "./QuoteInvoice"
import QuoteNotesEditor from "./QuoteNotesEditor"
import { QuotePreviewToolbar } from "./preview/QuotePreviewToolbar"
import {
  readSessionAttachedInstallOption,
  readSessionCustomOptions,
  CUSTOM_OPTIONS_CHANGE_EVENT,
  type QuoteOptionScope,
} from "@/hooks/calculator/supply-mode/supply-session-storage"
import { useInvoiceCalculations } from "@/hooks/quotes/useInvoiceCalculations"
import {
  getSavedQuoteLayoutSnapshot,
  sanitizeSavedQuoteLayout,
  subscribeSavedQuoteLayout,
  writeLocalSavedQuoteLayout,
  type SavedQuoteLayout,
} from "@/lib/quotes/invoice-layout-engine"
import {
  deriveSmartLayoutInput,
  useInvoiceComposerState,
} from "./invoice/composer/useInvoiceComposerState"
import {
  buildStandardQuotePdfFileName,
  collectInvoiceQuoteNumbers,
  triggerDirectQuotePrint,
} from "@/lib/quotes/pdf-filename"
import { downloadInvoiceElementAsPdf } from "@/lib/quotes/export-invoice-pdf"

interface QuotePreviewModalProps extends QuoteInvoiceProps {
  isOpen: boolean
  onClose: () => void
  template?: QuoteTemplateType
  onTemplateChange?: (t: QuoteTemplateType) => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  spacing: number
  onSpacingChange: (spacing: number) => void
  quoteNotes?: string
  onQuoteNotesChange?: (notes: string) => void
}

const emptySubscribe = () => () => {}

export default function QuotePreviewModal({
  isOpen,
  onClose,
  template: _template = "universal",
  onTemplateChange: _onTemplateChange,
  fontSize,
  onFontSizeChange,
  spacing,
  onSpacingChange,
  quoteNotes = "",
  onQuoteNotesChange,
  ...invoiceProps
}: QuotePreviewModalProps) {
  const { data: session } = useSession()
  const userId = session?.user?.id ?? null

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  )

  const getLocalLayout = useCallback(() => getSavedQuoteLayoutSnapshot(userId), [userId])
  const localSavedLayout = useSyncExternalStore(
    subscribeSavedQuoteLayout,
    getLocalLayout,
    () => null
  )

  const [profileLayoutOverride, setProfileLayoutOverride] =
    useState<SavedQuoteLayout | null | undefined>(undefined)
  const [showNotesEditor, setShowNotesEditor] = useState(false)
  const isSupplyOnly = Boolean(invoiceProps.isSupplyOnly)
  const optionScope: QuoteOptionScope =
    invoiceProps.primaryQuoteType === "door"
      ? "door"
      : invoiceProps.primaryQuoteType === "sealed_unit"
        ? "sealed_unit"
        : "window"
  const [isDualOption, setIsDualOption] = useState<boolean>(() =>
    Boolean(invoiceProps.isDualOption)
  )
  const [liveCustomOptions, setLiveCustomOptions] = useState<any[]>(() =>
    readSessionCustomOptions(optionScope)
  )
  const [userAdjustedTypography, setUserAdjustedTypography] = useState(false)
  const [isSavingLayout, setIsSavingLayout] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)

  const effectiveSavedLayout =
    profileLayoutOverride !== undefined ? profileLayoutOverride : localSavedLayout

  const activeCustomOptions = useMemo(
    () =>
      liveCustomOptions.length > 0
        ? liveCustomOptions
        : invoiceProps.customOptions,
    [liveCustomOptions, invoiceProps.customOptions]
  )

  // Compute smart input unconditionally for composer state
  const previewCalcForSmart = useInvoiceCalculations({
    ...invoiceProps,
    customOptions: activeCustomOptions,
    template: "cards",
    fontSize,
    spacing,
    quoteNotes,
    isDualOption,
  })

  const smartInput = useMemo(
    () =>
      deriveSmartLayoutInput(previewCalcForSmart, {
        isDualOption,
        wantsUpgrade: invoiceProps.wantsUpgrade,
        shownUpgrade: invoiceProps.shownUpgrade,
        attachedUpgrade: invoiceProps.attachedUpgrade,
        customOptions: activeCustomOptions,
        quoteNotes,
      }),
    [
      previewCalcForSmart,
      isDualOption,
      invoiceProps.wantsUpgrade,
      invoiceProps.shownUpgrade,
      invoiceProps.attachedUpgrade,
      activeCustomOptions,
      quoteNotes,
    ]
  )

  const handleResetTypography = useCallback(
    (nextFont: number, nextSpacing: number) => {
      setUserAdjustedTypography(true)
      onFontSizeChange(nextFont)
      onSpacingChange(nextSpacing)
    },
    [onFontSizeChange, onSpacingChange]
  )

  const composer = useInvoiceComposerState({
    smartInput,
    savedLayout: effectiveSavedLayout,
    enabled: isOpen,
    onResetTypography: handleResetTypography,
  })

  // Apply saved default typography or no-window 14px spacious auto-fit until the user touches a slider
  const resolvedFontSize = userAdjustedTypography
    ? fontSize
    : (effectiveSavedLayout?.fontSize ??
      (composer.autoResult.mode === "spacious" &&
      (Math.abs(fontSize - 11.5) < 0.01 || Math.abs(fontSize - 8.5) < 0.01)
        ? composer.autoResult.suggestedFontSize
        : fontSize))

  const resolvedSpacing = userAdjustedTypography
    ? spacing
    : (effectiveSavedLayout?.spacing ?? spacing)

  const handleFontChange = useCallback(
    (next: number) => {
      setUserAdjustedTypography(true)
      onFontSizeChange(next)
    },
    [onFontSizeChange]
  )

  const handleSpacingChange = useCallback(
    (next: number) => {
      setUserAdjustedTypography(true)
      onSpacingChange(next)
    },
    [onSpacingChange]
  )

  // Sync custom options listener when modal is open
  useEffect(() => {
    if (!isOpen) return undefined
    const sync = (evt?: Event) => {
      const detailScope = (evt as CustomEvent<{ scope?: QuoteOptionScope }> | undefined)
        ?.detail?.scope
      if (detailScope && detailScope !== optionScope) return
      setLiveCustomOptions(readSessionCustomOptions(optionScope))
    }
    const frameId = window.requestAnimationFrame(() => sync())
    window.addEventListener(CUSTOM_OPTIONS_CHANGE_EVENT, sync)
    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener(CUSTOM_OPTIONS_CHANGE_EVENT, sync)
    }
  }, [isOpen, optionScope])

  // Sync modal body class and fetch latest saved layout from /api/profile asynchronously
  useEffect(() => {
    if (!isOpen) return undefined
    document.body.classList.add("quote-modal-open")

    let cancelled = false
    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (cancelled || !d) return
        const sanitized = sanitizeSavedQuoteLayout(d.savedQuoteLayout)
        setProfileLayoutOverride(sanitized)
        writeLocalSavedQuoteLayout(sanitized, userId)
        if (invoiceProps.isDualOption !== undefined) {
          setIsDualOption(Boolean(invoiceProps.isDualOption))
        } else {
          const cached = readSessionAttachedInstallOption(optionScope)
          setIsDualOption(Boolean(cached?.enabled))
        }
      })
      .catch(() => {})

    return () => {
      cancelled = true
      document.body.classList.remove("quote-modal-open")
    }
  }, [isOpen, userId, invoiceProps.isDualOption, optionScope])

  const handleSaveDefaultLayout = async () => {
    setIsSavingLayout(true)
    const payload: SavedQuoteLayout = {
      rows: composer.displayedRows,
      fontSize: resolvedFontSize,
      spacing: resolvedSpacing,
      updatedAt: new Date().toISOString(),
    }
    try {
      writeLocalSavedQuoteLayout(payload, userId)
      setProfileLayoutOverride(payload)
      composer.clearCommittedRows()

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          favoriteTemplate: "cards",
          savedQuoteLayout: payload,
        }),
      })
      if (!res.ok) throw new Error("Failed to save profile layout")
      toast.success("Custom layout saved! It will apply automatically on your future quotes.")
    } catch {
      toast.warning("Saved locally on this browser, but failed to sync to cloud profile.")
    } finally {
      setIsSavingLayout(false)
    }
  }

  const handleClose = useCallback(() => {
    setUserAdjustedTypography(false)
    onClose()
  }, [onClose])

  const handleDownloadPdf = useCallback(async () => {
    const invoiceEl = document.getElementById("printable-invoice")
    if (!invoiceEl || isDownloadingPdf) return
    setIsDownloadingPdf(true)
    try {
      const quoteNumbers = collectInvoiceQuoteNumbers({
        quoteNumber: invoiceProps.quoteNumber,
        attachedWindowQuote: invoiceProps.attachedWindowQuote,
        attachedDoorQuote: invoiceProps.attachedDoorQuote,
        attachedSealedUnit: invoiceProps.attachedSealedUnit,
      })
      const filename = buildStandardQuotePdfFileName({
        customerName: invoiceProps.customerName,
        quoteNumbers,
        withExtension: true,
      })
      await downloadInvoiceElementAsPdf({ element: invoiceEl, filename })
      toast.success(`Downloaded ${filename}`)
    } catch (err) {
      console.error("Direct PDF download failed:", err)
      toast.error("Failed to download PDF. Please try Print instead.")
    } finally {
      setIsDownloadingPdf(false)
    }
  }, [
    isDownloadingPdf,
    invoiceProps.customerName,
    invoiceProps.quoteNumber,
    invoiceProps.attachedWindowQuote,
    invoiceProps.attachedDoorQuote,
    invoiceProps.attachedSealedUnit,
  ])

  if (!isOpen || !mounted) return null

  const modalContent = (
    <div className="quote-preview-portal fixed inset-0 z-50 flex animate-in flex-col bg-background/80 backdrop-blur-md duration-200 fade-in print:static print:inset-auto print:m-0 print:block print:h-auto print:w-full print:overflow-visible print:bg-white print:p-0">
      <QuotePreviewToolbar
        onPrint={() =>
          triggerDirectQuotePrint({
            customerName: invoiceProps.customerName,
            quoteNumber: invoiceProps.quoteNumber,
            attachedWindowQuote: invoiceProps.attachedWindowQuote,
            attachedDoorQuote: invoiceProps.attachedDoorQuote,
            attachedSealedUnit: invoiceProps.attachedSealedUnit,
          })
        }
        onDownloadPdf={handleDownloadPdf}
        isDownloadingPdf={isDownloadingPdf}
        onClose={handleClose}
        canUndo={composer.canUndo}
        canRedo={composer.canRedo}
        onUndo={composer.undo}
        onRedo={composer.redo}
        onResetAutoFit={composer.resetToAutoFit}
        onSaveDefaultLayout={handleSaveDefaultLayout}
        hasSavedDefaultLayout={Boolean(effectiveSavedLayout?.rows?.length)}
        isSavingLayout={isSavingLayout}
        fontSize={resolvedFontSize}
        onFontSizeChange={handleFontChange}
        spacing={resolvedSpacing}
        onSpacingChange={handleSpacingChange}
        showNotesEditor={showNotesEditor}
        setShowNotesEditor={setShowNotesEditor}
        canEditNotes={Boolean(onQuoteNotesChange)}
        quoteNotes={quoteNotes}
        isSupplyOnly={isSupplyOnly}
        isDualOption={isDualOption}
        setIsDualOption={setIsDualOption}
        optionScope={optionScope}
      />

      {/* Main Preview Area */}
      <div className="flex flex-1 flex-col items-center overflow-y-auto bg-muted/30 px-4 py-8 print:m-0 print:block print:h-auto print:w-full print:overflow-visible print:bg-white print:p-0">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @media print {
            @page {
              size: letter portrait;
              margin: 0.25in;
            }
          }
        `,
          }}
        />

        {showNotesEditor && onQuoteNotesChange && (
          <div className="mb-6 w-full max-w-4xl print:hidden">
            <QuoteNotesEditor value={quoteNotes} onChange={onQuoteNotesChange} />
          </div>
        )}

        <div className="w-full max-w-4xl transition-all duration-300 print:m-0 print:w-full print:max-w-none print:border-none print:p-0 print:shadow-none">
          <QuoteInvoice
            {...invoiceProps}
            customOptions={activeCustomOptions}
            isInteractivePreview={true}
            template="universal"
            fontSize={resolvedFontSize}
            spacing={resolvedSpacing}
            quoteNotes={quoteNotes}
            isDualOption={isDualOption}
            savedLayout={effectiveSavedLayout}
            composer={composer}
          />
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
