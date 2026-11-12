"use client"

import React from "react"
import { ImageIcon } from "lucide-react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { StudioQuoteData } from "@/lib/pdf-studio/types"

interface StudioBrandingCardProps {
  quoteData: StudioQuoteData
  logoInputRef: React.RefObject<HTMLInputElement | null>
  onModeChange: (mode: "supply" | "install") => void
  onUpdateQuoteData: (
    updater: (prev: StudioQuoteData) => StudioQuoteData
  ) => void
  onLogoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export function StudioBrandingCard({
  quoteData,
  logoInputRef,
  onModeChange,
  onUpdateQuoteData,
  onLogoUpload,
}: StudioBrandingCardProps) {
  return (
    <Card className="border-border bg-card/70 shadow-md backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            2
          </span>
          <CardTitle className="text-base font-semibold">
            Quote Type &amp; Branding
          </CardTitle>
        </div>
        <CardDescription>
          Configure customer quote presentation and header branding.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quote Type Toggle */}
        <div>
          <Label className="mb-2 block text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            Quote Presentation Mode
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onModeChange("supply")}
              className={`cursor-pointer rounded-lg border p-3 text-left transition-all ${
                quoteData.mode === "supply"
                  ? "border-primary bg-primary/10 font-medium text-primary ring-1 ring-primary"
                  : "border-border/60 text-muted-foreground hover:bg-muted/30"
              }`}
            >
              <div className="text-sm font-semibold">Supply Quote</div>
              <div className="mt-0.5 text-xs opacity-80">
                Shows FR, BM (if present), and R/O (+1&quot;) on parents
              </div>
            </button>

            <button
              type="button"
              onClick={() => onModeChange("install")}
              className={`cursor-pointer rounded-lg border p-3 text-left transition-all ${
                quoteData.mode === "install"
                  ? "border-primary bg-primary/10 font-medium text-primary ring-1 ring-primary"
                  : "border-border/60 text-muted-foreground hover:bg-muted/30"
              }`}
            >
              <div className="text-sm font-semibold">Install Quote</div>
              <div className="mt-0.5 text-xs opacity-80">
                Keeps SIZE column blank for site measure verification
              </div>
            </button>
          </div>
        </div>

        {/* Metadata Fields */}
        <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Customer Reference</Label>
            <Input
              value={quoteData.customerName}
              onChange={(e) =>
                onUpdateQuoteData((prev) => ({
                  ...prev,
                  customerName: e.target.value,
                }))
              }
              placeholder="e.g. Simeon Nussbaumer"
              className="bg-background/80"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Quote Number</Label>
            <Input
              value={quoteData.quoteNumber}
              onChange={(e) =>
                onUpdateQuoteData((prev) => ({
                  ...prev,
                  quoteNumber: e.target.value,
                }))
              }
              placeholder="e.g. 401729"
              className="bg-background/80"
            />
          </div>
        </div>

        {/* Company & Address */}
        <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Company Name</Label>
            <Input
              value={quoteData.companyName}
              onChange={(e) =>
                onUpdateQuoteData((prev) => ({
                  ...prev,
                  companyName: e.target.value,
                }))
              }
              className="bg-background/80"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">
              Custom Logo (Auto-loads from /public/images/logo.png)
            </Label>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={onLogoUpload}
              className="hidden"
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => logoInputRef.current?.click()}
                className="w-full cursor-pointer gap-1.5 text-xs"
              >
                <ImageIcon className="h-3.5 w-3.5 text-primary" />
                <span>
                  {quoteData.logoDataUrl
                    ? "Change Custom Logo"
                    : "Upload Custom Logo"}
                </span>
              </Button>
              {quoteData.logoDataUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onUpdateQuoteData((prev) => ({
                      ...prev,
                      logoDataUrl: null,
                    }))
                  }
                  className="text-xs text-destructive hover:bg-destructive/10"
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs font-medium">Address / Contact Block</Label>
          <Textarea
            rows={3}
            value={quoteData.address}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              onUpdateQuoteData((prev) => ({
                ...prev,
                address: e.target.value,
              }))
            }
            className="bg-background/80 font-mono text-xs"
          />
        </div>
      </CardContent>
    </Card>
  )
}
