"use client"

import React from "react"
import { motion } from "framer-motion"
import { Tag } from "lucide-react"
import { formatMoney } from "@/lib/promo-logic"

export interface PromoOption {
  promoId: string
  promoName: string
  base: number
  promoDiscount: number
}

interface PromoComparisonGridProps {
  compareOptions: PromoOption[]
  activePromoId: string | null
  setActivePromoId: (id: string) => void
  setLockedPromoId: (id: string | null) => void
}

export function PromoComparisonGrid({
  compareOptions,
  activePromoId,
  setActivePromoId,
  setLockedPromoId,
}: PromoComparisonGridProps) {
  if (!compareOptions || compareOptions.length === 0) {
    return null
  }

  const validOptions = compareOptions.filter((opt) => opt.promoId !== "none")
  if (validOptions.length === 0) {
    return null
  }

  const lowestNetPrice = Math.min(
    ...validOptions.map((o) => Math.max(0, o.base - o.promoDiscount))
  )

  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center gap-2">
        <Tag className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Promo Comparison</h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {validOptions.map((opt) => {
          const isSelected = activePromoId === opt.promoId
          const netPrice = Math.max(0, opt.base - opt.promoDiscount)
          const isLowest = lowestNetPrice === netPrice
          const savings = opt.promoDiscount

          return (
            <motion.div
              key={opt.promoId}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (isLowest) {
                  setLockedPromoId(null)
                } else {
                  setLockedPromoId(opt.promoId)
                }
                setActivePromoId(opt.promoId)
              }}
              className={`relative cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-xl ring-1 shadow-primary/10 ring-primary/50"
                  : "border-border bg-card hover:border-primary/50 hover:bg-muted/50"
              }`}
            >
              {isLowest && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase shadow-lg">
                  Lowest
                </div>
              )}
              <h3 className="mb-1 line-clamp-1 text-sm font-medium text-muted-foreground">
                {opt.promoName}
              </h3>
              <div
                className={`mb-2 text-2xl font-bold tracking-tight ${isSelected ? "text-primary" : ""}`}
              >
                {formatMoney(netPrice)}
              </div>
              <div className="space-y-1 text-xs">
                {savings > 0 ? (
                  <div className="font-medium text-emerald-500">
                    Discount -{formatMoney(savings)}
                  </div>
                ) : (
                  <div className="text-muted-foreground">No discount</div>
                )}
                <div className="truncate text-muted-foreground">
                  Base {formatMoney(opt.base)}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
