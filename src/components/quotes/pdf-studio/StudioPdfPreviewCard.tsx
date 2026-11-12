"use client"

import React from "react"
import { Eye, Download, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface StudioPdfPreviewCardProps {
  pdfUrl: string | null
  onDownloadPdf: () => void
}

export function StudioPdfPreviewCard({
  pdfUrl,
  onDownloadPdf,
}: StudioPdfPreviewCardProps) {
  return (
    <Card className="overflow-hidden border-border bg-card/70 shadow-md backdrop-blur-xl">
      <CardHeader className="border-b border-border/50 bg-muted/20 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-semibold">
              Live PDF Preview
            </CardTitle>
          </div>
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
