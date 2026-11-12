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
import { StudioDoorQuoteData } from "@/lib/pdf-studio/door-types"

interface StudioDoorBrandingCardProps {
  quoteData: StudioDoorQuoteData
  onModeChange: (mode: "supply" | "install") => void
  onUpdateQuoteData: (
    updater: (prev: StudioDoorQuoteData) => StudioDoorQuoteData
  ) => void
}

export function StudioDoorBrandingCard({
  quoteData,
  onModeChange,
  onUpdateQuoteData,
}: StudioDoorBrandingCardProps) {
  const logoInputRef = React.useRef<HTMLInputElement>(null)

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onUpdateQuoteData((prev) => ({
          ...prev,
          logoDataUrl: reader.result as string,
        }))
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <Card className="border-border bg-card/70 shadow-md backdrop-blur-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-500">
            2
          </span>
          <CardTitle className="text-base font-semibold">
            Quote Type &amp; Branding
          </CardTitle>
        </div>
        <CardDescription>
          Configure customer quote presentation and header branding for doors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quote Mode Toggle */}
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
                  ? "border-emerald-500 bg-emerald-500/10 font-medium text-emerald-500 ring-1 ring-emerald-500"
                  : "border-border/60 text-muted-foreground hover:bg-muted/30"
              }`}
            >
              <div className="text-sm font-semibold">Supply Quote</div>
              <div className="mt-0.5 text-xs opacity-80">
                Standard supply-only quote with full specifications
              </div>
            </button>

            <button
              type="button"
              onClick={() => onModeChange("install")}
              className={`cursor-pointer rounded-lg border p-3 text-left transition-all ${
                quoteData.mode === "install"
                  ? "border-emerald-500 bg-emerald-500/10 font-medium text-emerald-500 ring-1 ring-emerald-500"
                  : "border-border/60 text-muted-foreground hover:bg-muted/30"
              }`}
            >
              <div className="text-sm font-semibold">Install Quote</div>
              <div className="mt-0.5 text-xs opacity-80">
                Supply &amp; Installation quote presentation
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
              placeholder="e.g. John Doe"
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

        {/* Company & Logo */}
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
              Custom Logo (Auto-loads default if empty)
            </Label>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg"
              onChange={handleLogoUpload}
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
                <ImageIcon className="h-3.5 w-3.5 text-emerald-500" />
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

        <div className="space-y-1">
          <Label className="text-xs font-medium">
            Job Comments (Printed in Page 1 Comments Box)
          </Label>
          <Input
            value={quoteData.jobComments || ""}
            onChange={(e) =>
              onUpdateQuoteData((prev) => ({
                ...prev,
                jobComments: e.target.value,
              }))
            }
            placeholder="e.g. Customer requested jamb extension, site measure verification required"
            className="bg-background/80 text-xs"
          />
        </div>
      </CardContent>
    </Card>
  )
}
