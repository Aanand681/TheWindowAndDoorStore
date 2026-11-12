"use client"

import React from "react"
import { UploadCloud, CheckCircle2, RotateCcw } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface StudioUploadCardProps {
  fileInputRef: React.RefObject<HTMLInputElement | null>
  loading: boolean
  loadingStatus: string
  itemCount: number
  onFileUpload: (file: File) => void
  onReset?: () => void
}

export function StudioUploadCard({
  fileInputRef,
  loading,
  loadingStatus,
  itemCount,
  onFileUpload,
  onReset,
}: StudioUploadCardProps) {
  return (
    <Card className="border-border bg-card/70 shadow-md backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              1
            </span>
            <CardTitle className="text-base font-semibold">
              Upload Supplier Quote-List PDF
            </CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {itemCount > 0 && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-500">
                <CheckCircle2 className="h-3 w-3" />
                {itemCount} items extracted
              </span>
            )}
            {itemCount > 0 && onReset && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onReset}
                className="h-7 cursor-pointer gap-1 border-border/70 px-2 text-xs font-semibold text-destructive shadow-xs hover:bg-destructive/10"
                title="Reset quote & start fresh"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset</span>
              </Button>
            )}
          </div>
        </div>
        <CardDescription>
          Upload the raw manufacturer/supplier PDF. Text and CAD diagrams will
          be auto-extracted.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf,.pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) onFileUpload(f)
          }}
        />

        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            const f = e.dataTransfer.files?.[0]
            if (f) onFileUpload(f)
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all sm:p-8 ${
            loading
              ? "cursor-wait border-primary/50 bg-primary/5"
              : "border-border/80 bg-background/50 hover:border-primary/60 hover:bg-muted/30"
          }`}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UploadCloud
              className={`h-6 w-6 ${loading ? "animate-bounce" : ""}`}
            />
          </div>
          <p className="text-sm font-semibold text-foreground">
            {loading
              ? "Processing Supplier PDF…"
              : "Click to upload or drag & drop quote PDF"}
          </p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            {loading
              ? loadingStatus
              : "Supports raw Inkster Park Millwork Quote-List PDFs."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
