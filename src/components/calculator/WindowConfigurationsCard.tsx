"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
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
import { Component, FileUp, Plus, Trash2, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { UIWindowItem } from "@/hooks/useCalculatorWindows"

export interface WindowConfigurationsCardProps {
  windows: UIWindowItem[]
  surchargeRate: number
  quoteNumber: string
  setQuoteNumber: (val: string) => void
  customerName: string
  setCustomerName: (val: string) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handlePdfUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handlePdfImportClick: () => void
  isReadOnly: boolean
  onResetQuote?: () => void
  handleWindowChange: (
    id: string,
    field: keyof UIWindowItem,
    value: string
  ) => void
  handleRemoveWindow: (id: string) => void
  handleAddWindow: () => void
  windowEndRef: React.RefObject<HTMLDivElement | null>
  isSupplyOnly?: boolean
  setIsSupplyOnly?: (val: boolean) => void
  onOpenCompareModal?: () => void
  attachedUpgrade?: { title: string; amountPreTaxCents: number } | null
  onRemoveAttachedUpgrade?: () => void
  attachedSealedUnit?: any | null
  attachedDoorQuote?: any | null
  onOpenAttachSealedUnitModal?: () => void
  onRemoveAttachedSealedUnit?: () => void
  onRemoveAttachedDoorQuote?: () => void
  onSaveDraft?: () => void
  onOpenSavedQuotes?: () => void
  savedDraftsCount?: number
}

export function WindowConfigurationsCard({
  windows,
  surchargeRate: _surchargeRate,
  quoteNumber,
  setQuoteNumber,
  customerName,
  setCustomerName,
  fileInputRef,
  handlePdfUpload,
  handlePdfImportClick,
  isReadOnly,
  onResetQuote,
  handleWindowChange,
  handleRemoveWindow,
  handleAddWindow,
  windowEndRef,
  isSupplyOnly: _isSupplyOnly,
  setIsSupplyOnly: _setIsSupplyOnly,
  onOpenCompareModal: _onOpenCompareModal,
  attachedUpgrade: _attachedUpgrade,
  onRemoveAttachedUpgrade: _onRemoveAttachedUpgrade,
  attachedSealedUnit: _attachedSealedUnit,
  attachedDoorQuote: _attachedDoorQuote,
  onOpenAttachSealedUnitModal: _onOpenAttachSealedUnitModal,
  onRemoveAttachedSealedUnit: _onRemoveAttachedSealedUnit,
  onRemoveAttachedDoorQuote: _onRemoveAttachedDoorQuote,
  onSaveDraft: _onSaveDraft,
  onOpenSavedQuotes: _onOpenSavedQuotes,
  savedDraftsCount: _savedDraftsCount,
}: WindowConfigurationsCardProps) {
  return (
    <Card className="gap-0 border-border bg-card/50 py-0 shadow-2xl backdrop-blur-xl [--card-spacing:0px]">
      <CardHeader className="flex flex-col justify-between gap-3 border-b border-border/50 px-5 py-3 !pb-3 sm:flex-row sm:items-center sm:px-6">
        <div>
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <Component className="h-5 w-5 shrink-0 text-primary sm:h-6 sm:w-6" />
            <span>Window Configurations</span>
          </CardTitle>
          <CardDescription className="mt-0.5 text-xs sm:text-sm">
            Enter the base prices and upgrade components for each window.
          </CardDescription>
        </div>
        {/* Right side: Reset Quote & Import PDF in its original position */}
        <div className="flex items-center gap-1.5">
          {onResetQuote && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetQuote}
              disabled={isReadOnly}
              className="h-8 cursor-pointer gap-1 border-border/70 px-2.5 text-xs font-semibold text-destructive shadow-xs hover:bg-destructive/10"
              title="Reset quote & start fresh"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </Button>
          )}

          <input
            type="file"
            accept=".pdf,application/pdf"
            hidden
            ref={fileInputRef as any}
            onChange={handlePdfUpload}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handlePdfImportClick}
            disabled={isReadOnly}
            className="h-8 cursor-pointer border-border/70 bg-card px-2.5 text-xs font-semibold text-foreground shadow-xs hover:bg-muted"
          >
            <FileUp className="mr-1 h-3.5 w-3.5 text-primary" />
            <span>Import PDF</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 gap-3 border-b border-border/40 bg-muted/20 px-5 py-2.5 sm:px-6 md:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Quote/Order Number
            </Label>
            <Input
              disabled={isReadOnly}
              value={quoteNumber}
              onChange={(e) => setQuoteNumber(e.target.value)}
              placeholder="e.g. 400820"
              className="h-9 bg-background text-sm shadow-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              Customer Name
            </Label>
            <Input
              disabled={isReadOnly}
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. Jason Schram"
              className="h-9 bg-background text-sm shadow-xs"
            />
          </div>
        </div>
        <div className="max-h-[600px] w-full overflow-auto">
          <div className="flex items-center justify-between border-b border-border/40 bg-muted/30 px-4 py-2 text-[11px] font-medium text-muted-foreground/80 md:hidden">
            <span>
              ← Swipe table horizontally to edit all panes &amp; prices →
            </span>
          </div>
          <div className="min-w-[800px] p-4 sm:p-5">
            <div className="mb-4 grid grid-cols-12 gap-4 px-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
              <div className="col-span-1">Seq</div>
              <div className="col-span-1">Qty</div>
              <div className="col-span-2">Base Total</div>
              <div className="col-span-2">Argon Total</div>
              <div className="col-span-2">Solar Total</div>
              <div className="col-span-2">Triple Pane Total</div>
              <div className="col-span-2 text-right">Finish &amp; Actions</div>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {windows.map((w, i) => (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="grid grid-cols-12 items-center gap-4 rounded-xl border border-border/80 bg-muted/30 p-2 transition-colors hover:border-border"
                  >
                    <div className="col-span-1 pl-3 font-mono text-muted-foreground">
                      {i + 1}
                    </div>
                    <div className="col-span-1">
                      <Input
                        type="number"
                        min="1"
                        disabled={isReadOnly}
                        value={w.qty}
                        onChange={(e) =>
                          handleWindowChange(w.id, "qty", e.target.value)
                        }
                        className="h-9 [appearance:textfield] bg-background [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                    <div className="relative col-span-2">
                      <span className="absolute top-2.5 left-3 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        disabled={isReadOnly}
                        value={w.base}
                        onChange={(e) =>
                          handleWindowChange(w.id, "base", e.target.value)
                        }
                        className="h-9 [appearance:textfield] bg-background pl-6 font-mono [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                    <div className="relative col-span-2">
                      <span className="absolute top-2.5 left-3 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        disabled={isReadOnly}
                        value={w.argon}
                        onChange={(e) =>
                          handleWindowChange(w.id, "argon", e.target.value)
                        }
                        className="h-9 [appearance:textfield] bg-background pl-6 font-mono [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                    <div className="relative col-span-2">
                      <span className="absolute top-2.5 left-3 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        disabled={isReadOnly}
                        value={w.solar}
                        onChange={(e) =>
                          handleWindowChange(w.id, "solar", e.target.value)
                        }
                        className="h-9 [appearance:textfield] bg-background pl-6 font-mono [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                    <div className="relative col-span-2">
                      <span className="absolute top-2.5 left-3 text-sm text-muted-foreground">
                        $
                      </span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        disabled={isReadOnly}
                        value={w.triple}
                        onChange={(e) =>
                          handleWindowChange(w.id, "triple", e.target.value)
                        }
                        className="h-9 [appearance:textfield] bg-background pl-6 font-mono [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      />
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-1.5 pr-2 sm:gap-2">
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={() =>
                          handleWindowChange(
                            w.id,
                            "color",
                            w.color === "Painted" ? "White" : "Painted"
                          )
                        }
                        title="Click to toggle between White and Painted"
                        className={cn(
                          "cursor-pointer rounded-full border px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap transition-all select-none sm:px-2.5 sm:py-1 sm:text-[11px]",
                          w.color === "Painted"
                            ? "border-purple-500/30 bg-purple-500/15 text-purple-600 hover:bg-purple-500/25 dark:text-purple-300"
                            : "border-border bg-muted text-foreground hover:bg-muted/80"
                        )}
                      >
                        {w.color === "Painted" ? "🎨 Painted" : "⬜ White"}
                      </button>
                      {!isReadOnly ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0 text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleRemoveWindow(w.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      ) : (
                        <span className="pr-2 text-xs text-muted-foreground italic">
                          Locked
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              <div ref={windowEndRef as any} />
            </div>
          </div>
        </div>
        {!isReadOnly && (
          <div className="flex justify-center rounded-b-xl border-t border-border/50 bg-muted/10 px-4 py-2.5 sm:justify-start sm:px-5">
            <Button
              onClick={handleAddWindow}
              size="sm"
              className="h-8 w-full cursor-pointer text-xs font-semibold shadow-xs sm:w-auto"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Window Manually
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default WindowConfigurationsCard
