"use client"

import React, { useState, useRef, useMemo } from "react"
import { FileText } from "lucide-react"
import { toast } from "sonner"
import { useQuotePdfStudio } from "@/hooks/useQuotePdfStudio"
import { useDoorPdfStudio } from "@/hooks/useDoorPdfStudio"
import { classifyPdfFile, QuotePdfType } from "@/lib/pdf-studio/classifier"
import {
  buildCombinedPdfFileName,
  combineWindowAndDoorPdfs,
} from "@/lib/pdf-studio/pdf-combiner"
import { AppHeader } from "@/components/layout/AppHeader"
import {
  StudioUploadCard,
  StudioBrandingCard,
  StudioWindowScheduleCard,
  StudioPdfPreviewCard,
  StudioScopeBar,
  StudioProductType,
  StudioDoorBrandingCard,
  StudioDoorScheduleCard,
} from "./pdf-studio"

export default function QuotePdfStudioClient() {
  const [productType, setProductType] = useState<StudioProductType>("window")
  const [detectedType, setDetectedType] = useState<QuotePdfType | null>(null)
  const [isCombining, setIsCombining] = useState(false)
  const unifiedFileInputRef = useRef<HTMLInputElement>(null)

  // Window Studio Hook
  const windowStudio = useQuotePdfStudio()

  // Door Studio Hook
  const doorStudio = useDoorPdfStudio()

  const windowCount = windowStudio.quoteData.items.length
  const doorCount = doorStudio.doorQuoteData.lines.length
  const hasBothQuotes = windowCount > 0 && doorCount > 0

  const combinedFileName = useMemo(() => {
    return buildCombinedPdfFileName({
      customerName:
        windowStudio.quoteData.customerName ||
        doorStudio.doorQuoteData.customerName,
      windowQuoteNo: windowStudio.quoteData.quoteNumber,
      doorQuoteNo: doorStudio.doorQuoteData.quoteNumber,
    })
  }, [
    windowStudio.quoteData.customerName,
    windowStudio.quoteData.quoteNumber,
    doorStudio.doorQuoteData.customerName,
    doorStudio.doorQuoteData.quoteNumber,
  ])

  const handleDownloadCombinedPdf = async () => {
    if (!hasBothQuotes) {
      toast.error("Both Window and Door quote items must be loaded first.")
      return
    }

    setIsCombining(true)
    try {
      let winUrl = windowStudio.pdfUrl
      if (!winUrl && windowStudio.quoteData.items.length > 0) {
        await windowStudio.handleGeneratePdf()
        winUrl = windowStudio.pdfUrl
      }

      let doorUrl = doorStudio.pdfUrl
      if (!doorUrl && doorStudio.doorQuoteData.lines.length > 0) {
        await doorStudio.handleGeneratePdf()
        doorUrl = doorStudio.pdfUrl
      }

      if (!winUrl || !doorUrl) {
        throw new Error(
          "Unable to obtain generated PDF for both Windows and Doors."
        )
      }

      const [winBuffer, doorBuffer] = await Promise.all([
        fetch(winUrl).then((r) => r.arrayBuffer()),
        fetch(doorUrl).then((r) => r.arrayBuffer()),
      ])

      const combinedBytes = await combineWindowAndDoorPdfs(winBuffer, doorBuffer)
      const blob = new Blob([new Uint8Array(combinedBytes)], {
        type: "application/pdf",
      })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = combinedFileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success(`Combined PDF downloaded as "${combinedFileName}"`)
    } catch (err: any) {
      console.error("Failed to combine PDFs:", err)
      toast.error(err.message || "Failed to combine Window and Door PDFs")
    } finally {
      setIsCombining(false)
    }
  }

  // Unified File Upload with Auto-detection
  const handleUnifiedFileUpload = async (file: File) => {
    try {
      const type = await classifyPdfFile(file)
      setDetectedType(type)

      if (type === "door") {
        setProductType("door")
        await doorStudio.handleFileUpload(file)
      } else if (type === "window") {
        setProductType("window")
        await windowStudio.handleFileUpload(file)
      } else {
        if (productType === "door") {
          await doorStudio.handleFileUpload(file)
        } else {
          await windowStudio.handleFileUpload(file)
        }
      }
    } catch {
      if (productType === "door") {
        await doorStudio.handleFileUpload(file)
      } else {
        await windowStudio.handleFileUpload(file)
      }
    }
  }

  const isDoor = productType === "door"
  const activeLoading = isDoor ? doorStudio.loading : windowStudio.loading
  const activeLoadingStatus = isDoor
    ? doorStudio.loadingStatus
    : windowStudio.loadingStatus
  const activeItemCount = isDoor
    ? doorStudio.doorQuoteData.lines.length
    : windowStudio.quoteData.items.length
  const activePdfUrl = isDoor ? doorStudio.pdfUrl : windowStudio.pdfUrl
  const activeDownload = isDoor
    ? doorStudio.handleDownloadPdf
    : windowStudio.handleDownloadPdf

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="relative z-10 mx-auto w-full max-w-[1650px] space-y-6 px-4 pt-5 pb-10 sm:space-y-8 sm:px-6 sm:pt-6 lg:px-8">
        {/* Standard Unified Application Header */}
        <AppHeader currentPath="/quote-studio" />

        {/* Page Title & Scope Switcher */}
        <div className="flex flex-col justify-between gap-4 border-b border-border/50 pb-2.5 md:flex-row md:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight sm:text-2xl">
              <FileText className="h-6 w-6 text-primary" />
              <span>Quote PDF Studio</span>
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Generate clean customer-facing Window and Door quote PDFs from raw
              supplier quote-list PDFs.
            </p>
          </div>

          {/* Product Type & Detection Badge */}
          <StudioScopeBar
            productType={productType}
            onProductTypeChange={setProductType}
            detectedType={detectedType}
            windowCount={windowCount}
            doorCount={doorCount}
          />
        </div>

        {/* Workspace Layout: Left Editor / Right Preview */}
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
          {/* Left Column: Input, Controls, Product Schedule Editor */}
          <div className="space-y-6 lg:col-span-6 xl:col-span-6">
            <StudioUploadCard
              fileInputRef={unifiedFileInputRef}
              loading={activeLoading}
              loadingStatus={activeLoadingStatus}
              itemCount={activeItemCount}
              onFileUpload={handleUnifiedFileUpload}
              onReset={
                isDoor
                  ? doorStudio.handleResetQuote
                  : windowStudio.handleResetQuote
              }
            />

            {isDoor ? (
              <>
                <StudioDoorBrandingCard
                  quoteData={doorStudio.doorQuoteData}
                  onModeChange={doorStudio.handleModeChange}
                  onUpdateQuoteData={doorStudio.setDoorQuoteData}
                />

                <StudioDoorScheduleCard
                  lines={doorStudio.doorQuoteData.lines}
                  allName={doorStudio.allName}
                  allPrice={doorStudio.allPrice}
                  generating={doorStudio.generating}
                  onSetAllName={doorStudio.setAllName}
                  onSetAllPrice={doorStudio.setAllPrice}
                  onApplyAll={doorStudio.handleApplyAll}
                  onUpdateLine={doorStudio.handleUpdateLine}
                  onRecropLine={doorStudio.handleRecropLine}
                  onReplaceDrawing={doorStudio.handleReplaceDrawing}
                  onToggleSpecBold={doorStudio.handleToggleSpecBold}
                  onUpdateSpecText={doorStudio.handleUpdateSpecText}
                  onAddLine={doorStudio.handleAddLine}
                  onRemoveLine={doorStudio.handleRemoveLine}
                  onResetTrims={doorStudio.handleResetTrims}
                  onResetQuote={doorStudio.handleResetQuote}
                  onGeneratePdf={() => doorStudio.handleGeneratePdf()}
                />
              </>
            ) : (
              <>
                <StudioBrandingCard
                  quoteData={windowStudio.quoteData}
                  logoInputRef={windowStudio.logoInputRef}
                  onModeChange={windowStudio.handleModeChange}
                  onUpdateQuoteData={windowStudio.setQuoteData}
                  onLogoUpload={windowStudio.handleLogoUpload}
                />

                <StudioWindowScheduleCard
                  items={windowStudio.quoteData.items}
                  isDetailsOpen={windowStudio.isDetailsOpen}
                  generating={windowStudio.generating}
                  onToggleDetails={() =>
                    windowStudio.setIsDetailsOpen(!windowStudio.isDetailsOpen)
                  }
                  onAddItem={windowStudio.handleAddItem}
                  onRemoveItem={windowStudio.handleRemoveItem}
                  onUpdateItem={windowStudio.handleUpdateItem}
                  onImageUpload={windowStudio.handleImageUpload}
                  onResetQuote={windowStudio.handleResetQuote}
                  onGeneratePdf={() => windowStudio.handleGeneratePdf()}
                />
              </>
            )}
          </div>

          {/* Right Column: Live PDF Preview */}
          <div className="sticky top-6 space-y-4 lg:col-span-6 xl:col-span-6">
            <StudioPdfPreviewCard
              pdfUrl={activePdfUrl}
              onDownloadPdf={activeDownload}
              hasBothQuotes={hasBothQuotes}
              onDownloadCombinedPdf={handleDownloadCombinedPdf}
              isCombining={isCombining}
              combinedFileName={combinedFileName}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
