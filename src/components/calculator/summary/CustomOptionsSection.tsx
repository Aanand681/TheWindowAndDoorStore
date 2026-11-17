"use client"

import React, { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, X, Sparkles, Pencil, Check } from "lucide-react"
import { formatMoney } from "@/lib/promo-logic"
import { toast } from "sonner"
import {
  readSessionCustomOptions,
  writeSessionCustomOptions,
  CUSTOM_OPTIONS_CHANGE_EVENT,
  type CustomQuoteOption,
} from "@/hooks/calculator/supply-mode/supply-session-storage"

export interface CustomOptionsSectionProps {
  canModifyOptions: boolean
  reviewQuote?: any
  quoteNumber?: string
}

export function CustomOptionsSection({
  canModifyOptions,
  reviewQuote,
  quoteNumber,
}: CustomOptionsSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [optionTitle, setOptionTitle] = useState("")
  const [optionPrice, setOptionPrice] = useState("")
  const [editingOptionId, setEditingOptionId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editPrice, setEditPrice] = useState("")

  const [customOptions, setCustomOptions] = useState<CustomQuoteOption[]>(() => {
    if (typeof window !== "undefined") {
      const fromSession = readSessionCustomOptions()
      if (fromSession && fromSession.length > 0) return fromSession
      if (reviewQuote && Array.isArray(reviewQuote.customOptions)) {
        return reviewQuote.customOptions
      }
    }
    return []
  })

  useEffect(() => {
    if (
      reviewQuote &&
      Array.isArray(reviewQuote.customOptions) &&
      reviewQuote.customOptions.length > 0
    ) {
      const sessionOpts = readSessionCustomOptions()
      if (sessionOpts.length === 0) {
        writeSessionCustomOptions(reviewQuote.customOptions)
        setCustomOptions(reviewQuote.customOptions)
        return
      }
    }

    const syncOptions = () => {
      setCustomOptions(readSessionCustomOptions())
    }

    syncOptions()
    window.addEventListener(CUSTOM_OPTIONS_CHANGE_EVENT, syncOptions)
    window.addEventListener("storage", syncOptions)
    return () => {
      window.removeEventListener(CUSTOM_OPTIONS_CHANGE_EVENT, syncOptions)
      window.removeEventListener("storage", syncOptions)
    }
  }, [quoteNumber, reviewQuote?._id])

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
    if (editingOptionId === id) {
      setEditingOptionId(null)
      setEditTitle("")
      setEditPrice("")
    }
    toast.info("Option removed")
  }

  const handleStartEdit = (opt: CustomQuoteOption) => {
    setEditingOptionId(opt.id)
    setEditTitle(opt.title)
    setEditPrice((opt.amountPreTaxCents / 100).toFixed(2))
  }

  const handleCancelEdit = () => {
    setEditingOptionId(null)
    setEditTitle("")
    setEditPrice("")
  }

  const handleSaveEdit = (id: string) => {
    const trimmedTitle = editTitle.trim()
    if (!trimmedTitle) {
      toast.error("Please enter an option heading")
      return
    }
    const parsedPrice = parseFloat(editPrice)
    if (isNaN(parsedPrice) || parsedPrice === 0) {
      toast.error("Please enter a valid non-zero price (+ or -)")
      return
    }
    const updated = customOptions.map((opt) =>
      opt.id === id
        ? {
            ...opt,
            title: trimmedTitle,
            amountPreTaxCents: Math.round(parsedPrice * 100),
          }
        : opt
    )
    setCustomOptions(updated)
    writeSessionCustomOptions(updated)
    setEditingOptionId(null)
    setEditTitle("")
    setEditPrice("")
    toast.success("Option updated")
  }

  return (
    <>
      {/* Custom Quote Options Cards - Visible to everyone (preparer & reviewer) */}
      {customOptions.length > 0 && (
        <div className="space-y-2">
          {customOptions.map((opt) => (
            <div
              key={opt.id}
              className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs"
            >
              {editingOptionId === opt.id ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span>Edit Quote Option</span>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Input
                      type="text"
                      placeholder="Option heading"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="h-8 text-xs"
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Price (+/-)"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="h-8 w-24 text-xs font-mono"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleSaveEdit(opt.id)}
                      className="h-8 shrink-0 cursor-pointer gap-1 px-2.5 text-xs"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Save
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleCancelEdit}
                      className="h-8 shrink-0 cursor-pointer px-2 text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <div className="space-y-0.5">
                      <div className="font-semibold text-foreground">
                        {opt.title}
                      </div>
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
                    {canModifyOptions && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(opt)}
                          title="Edit option"
                          className="cursor-pointer rounded p-1 text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(opt.id)}
                          title="Remove option"
                          className="cursor-pointer rounded p-1 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Option Button & Inline Form - Available in Edit & Review modes */}
      {canModifyOptions && (
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
    </>
  )
}

