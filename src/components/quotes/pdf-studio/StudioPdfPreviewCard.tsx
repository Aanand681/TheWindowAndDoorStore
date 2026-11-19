"use client"

import React from "react"
import { Eye, Download, FileText, Layers } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export interface StudioPdfPreviewCardProps {
  pdfUrl: string | null
  onDownloadPdf: () => void
  hasBothQuotes?: boolean
  onDownloadCombinedPdf?: () => void
  isCombining?: boolean
  combinedFileName?: string
}

export function StudioPdfPreviewCard({
  pdfUrl,
  onDownloadPdf,
  hasBothQuotes = false,
  onDownloadCombinedPdf,
  isCombining = false,
  combinedFileName,
}: StudioPdfPreviewCardProps) {
  return (
    <Card className="overflow-hidden border-border bg-card/70 shadow-md backdrop-blur-xl">
      <CardHeader className="border-b border-border/50 bg-muted/20 pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">
              Live PDF Preview
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {hasBothQuotes && onDownloadCombinedPdf && (
              <Button
                size="sm"
                variant="outline"
                onClick={onDownloadCombinedPdf}
                disabled={isCombining}
                className="h-8 cursor-pointer gap-1.5 border-emerald-500/40 bg-emerald-500/10 text-xs text-emerald-700 dark:text-emerald-300 shadow-sm hover:bg-emerald-500/20"
                title={combinedFileName ? `Download: ${combinedFileName}` : "Download Combined PDF"}
              >
                <Layers className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>
                  {isCombining ? "Combining..." : "Download Combined (Window & Door)"}
                </span>
              </Button>
            )}
            {pdfUrl && (
              <Button
                size="sm"
                onClick={onDownloadPdf}
                className="h-8 cursor-pointer gap-1.5 bg-emerald-600 text-xs text-white shadow-sm hover:bg-emerald-500"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download</span>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title="Clean Customer PDF Preview"
            className="h-[780px] w-full border-0 bg-zinc-100 dark:bg-zinc-900"
          />
        ) : (
          <div className="flex h-[520px] flex-col items-center justify-center p-8 text-center text-muted-foreground">
            <FileText className="mb-3 h-16 w-16 text-muted-foreground/30" />
            <p className="text-base font-semibold text-foreground">
              No PDF Generated Yet
            </p>
            <p className="mt-1 max-w-sm text-xs text-muted-foreground">
              Upload your supplier quote-list PDF on the left. The clean
              customer version will render here in real-time.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
