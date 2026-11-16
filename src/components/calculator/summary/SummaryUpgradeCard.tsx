"use client"

import React, { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, X, Sparkles } from "lucide-react"
import { formatMoney } from "@/lib/promo-logic"
import { toast } from "sonner"
import {
  readSessionCustomOptions,
  writeSessionCustomOptions,
  CUSTOM_OPTIONS_CHANGE_EVENT,
  type CustomQuoteOption,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

export interface SummaryUpgradeCardProps {
  wantsUpgrade: boolean
  setWantsUpgrade: (val: boolean) => void
  isReadOnly?: boolean
  upgrade?: any
  shownUpgrade?: number
  attachedDoorQuote?: any | null
  attachedUpgrade?: { title: string; amountPreTaxCents: number } | null
  reviewQuote?: any
  quoteNumber?: string
}

export function SummaryUpgradeCard({
  wantsUpgrade,
  setWantsUpgrade,
  isReadOnly = false,
  upgrade,
  shownUpgrade = 0,
  attachedDoorQuote,
  reviewQuote,
  quoteNumber,
}: SummaryUpgradeCardProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [optionTitle, setOptionTitle] = useState("")
  const [optionPrice, setOptionPrice] = useState("")
  const [customOptions, setCustomOptions] = useState<CustomQuoteOption[]>([])

  useEffect(() => {
    const syncOptions = () => {
      if (reviewQuote && Array.isArray(reviewQuote.customOptions)) {
        setCustomOptions(reviewQuote.customOptions)
      } else {
        setCustomOptions(readSessionCustomOptions())
      }
    }

    syncOptions()
    window.addEventListener(CUSTOM_OPTIONS_CHANGE_EVENT, syncOptions)
    window.addEventListener("storage", syncOptions)
    return () => {
      window.removeEventListener(CUSTOM_OPTIONS_CHANGE_EVENT, syncOptions)
      window.removeEventListener("storage", syncOptions)
    }
  }, [quoteNumber, reviewQuote?._id, reviewQuote?.customOptions])

  const handleAddOption = () => {
    const trimmedTitle = optionTitle.trim()
    if (!trimmedTitle) {
      toast.error("Please enter an option heading")
      return
    }

    const parsedPrice = parseFloat(optionPrice)
    if (isNaN(parsedPrice) || parsedPrice === 0) {
      toast.error("Please enter a valid non-zero price (+ or -)")
      return
    }

    const newOpt: CustomQuoteOption = {
      id: `opt-${Date.now()}`,
      title: trimmedTitle,
      amountPreTaxCents: Math.round(parsedPrice * 100),
    }

    const updated = [...customOptions, newOpt]
    setCustomOptions(updated)
    writeSessionCustomOptions(updated)
    setOptionTitle("")
    setOptionPrice("")
    setShowAddForm(false)
    toast.success(`Added option: ${trimmedTitle}`)
  }

  const handleRemoveOption = (id: string) => {
    const updated = customOptions.filter((o) => o.id !== id)
    setCustomOptions(updated)
    writeSessionCustomOptions(updated)
    toast.info("Option removed")
  }

  return (
    <div className="mt-3 space-y-2.5">
      {/* 5-year free labour upgrade checkbox (placed right after 50/50 deposits) */}
      <div className="flex items-start space-x-2.5 rounded-xl border border-primary/15 bg-primary/5 p-3">
        <Checkbox
          id="summaryUpgrade"
          disabled={isReadOnly}
          checked={wantsUpgrade}
          onCheckedChange={(c) => setWantsUpgrade(!!c)}
          className="mt-0.5"
        />
        <div className="flex-1 space-y-0.5">
          <Label
            htmlFor="summaryUpgrade"
            className="cursor-pointer text-xs font-semibold"
          >
            Include 5-year free labour upgrade
          </Label>
          <p className="text-[10px] text-muted-foreground">
            Optional. Shows upgrade price only; not added to final total.
          </p>
          {wantsUpgrade && upgrade && (
            <div className="flex items-center justify-between pt-1 text-xs font-semibold text-primary">
              <span>Upgrade ({upgrade?.rate})</span>
              <span className="shrink-0 font-mono whitespace-nowrap">
                {formatMoney(shownUpgrade)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Option for door Callout for Attached Door Quote */}
      {attachedDoorQuote?.lineItems &&
        attachedDoorQuote.lineItems.some(
          (i: any) => i.upgradeOption?.enabled
        ) && (
          <div className="space-y-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Option for door:
            </div>
            <div className="space-y-1 divide-y divide-emerald-500/20">
              {attachedDoorQuote.lineItems
                .filter((i: any) => i.upgradeOption?.enabled)
                .map((item: any, idx: number) => (
                  <div
                    key={item.id || idx}
                    className="flex items-center justify-between gap-2 pt-1 first:pt-0"
                  >
                    <span className="truncate text-[11px] text-muted-foreground">
                      {item.customDescription || item.presetLabel}:{" "}
                      <strong>{item.upgradeOption?.title}</strong>
                    </span>
                    <span className="shrink-0 font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      +$
                      {Number(
                        item.upgradeOption?.subtotalDifference || 0
                      ).toFixed(2)}
                      /unit
                      {item.quantity > 1
                        ? ` (+${(
                            Number(
                              item.upgradeOption?.subtotalDifference || 0
                            ) * item.quantity
                          ).toFixed(2)} total)`
                        : ""}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

      {/* Custom Quote Options Cards - Visible to everyone (preparer & reviewer) */}
      {customOptions.length > 0 && (
        <div className="space-y-2">
          {customOptions.map((opt) => (
            <div
              key={opt.id}
              className="flex items-start justify-between rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs"
            >
              <div className="flex items-start gap-2.5">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="space-y-0.5">
                  <div className="font-semibold text-foreground">{opt.title}</div>
                  <p className="text-[10px] text-muted-foreground">
                    Optional Quote Option • Not added to base total
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs sm:text-sm font-bold text-foreground">
                  {opt.amountPreTaxCents < 0 ? "deduct: -" : "add: +"}
                  {formatMoney(Math.abs(opt.amountPreTaxCents))}
                </span>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(opt.id)}
                    title="Remove option"
                    className="cursor-pointer rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Option Button & Inline Form - Available in Edit & Creation modes */}
      {!isReadOnly && (
        <div className="pt-0.5">
          {!showAddForm ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="h-7 cursor-pointer gap-1.5 px-2.5 text-[11px] font-semibold text-foreground hover:bg-muted"
            >
              <Plus className="h-3 w-3" />
              Add Option
            </Button>
          ) : (
            <div className="space-y-2 rounded-xl border border-border/80 bg-muted/40 p-2.5">
              <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                <span>Add Quote Option</span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                <Input
                  type="text"
                  placeholder="Option heading (e.g. Triple pane upgrade)"
                  value={optionTitle}
                  onChange={(e) => setOptionTitle(e.target.value)}
                  className="h-8 text-xs"
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Price (+/-)"
                  value={optionPrice}
                  onChange={(e) => setOptionPrice(e.target.value)}
                  className="h-8 w-24 text-xs font-mono"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddOption}
                  className="h-8 shrink-0 cursor-pointer px-2.5 text-xs"
                >
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
