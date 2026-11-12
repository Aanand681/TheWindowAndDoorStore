"use client"

import React from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { ShieldCheck, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatMoney, ILabourUpgradeTier } from "@/lib/promo-logic"

interface UpgradeBracketsTableProps {
  dbTiers: ILabourUpgradeTier[]
  activeTier: ILabourUpgradeTier | null | undefined
  isAvailable: boolean
  upgradeResult: { charge: number; rate: string }
}

const DEFAULT_TIERS: ILabourUpgradeTier[] = [
  {
    id: "t0",
    minAmount: 0,
    maxAmount: 3000,
    ratePercent: 0,
    minFee: 0,
    isAvailable: false,
    label: "Not available below $3,000",
  },
  {
    id: "t1",
    minAmount: 3000,
    maxAmount: 5000,
    ratePercent: 6,
    minFee: 260,
    isAvailable: true,
    label: "6% (minimum $260)",
  },
  {
    id: "t2",
    minAmount: 5000,
    maxAmount: 7500,
    ratePercent: 7,
    minFee: 0,
    isAvailable: true,
    label: "7%",
  },
  {
    id: "t3",
    minAmount: 7500,
    maxAmount: 10000,
    ratePercent: 8,
    minFee: 0,
    isAvailable: true,
    label: "8%",
  },
  {
    id: "t4",
    minAmount: 10000,
    maxAmount: 15000,
    ratePercent: 8.5,
    minFee: 0,
    isAvailable: true,
    label: "8.5%",
  },
  {
    id: "t5",
    minAmount: 15000,
    maxAmount: 20000,
    ratePercent: 9,
    minFee: 0,
    isAvailable: true,
    label: "9%",
  },
  {
    id: "t6",
    minAmount: 20000,
    maxAmount: 25000,
    ratePercent: 10,
    minFee: 0,
    isAvailable: true,
    label: "10%",
  },
  {
    id: "t7",
    minAmount: 25000,
    maxAmount: null,
    ratePercent: 11,
    minFee: 0,
    isAvailable: true,
    label: "11%",
  },
]

export function UpgradeBracketsTable({
  dbTiers,
  activeTier,
  isAvailable,
  upgradeResult,
}: UpgradeBracketsTableProps) {
  const tiersToRender = dbTiers.length > 0 ? dbTiers : DEFAULT_TIERS

  return (
    <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/40 shadow-md backdrop-blur-xl">
      <CardHeader className="flex flex-col gap-2 border-b border-border/50 bg-muted/20 pb-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-sm font-bold">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Active Database Labour Upgrade Brackets</span>
          </CardTitle>
          <CardDescription className="text-xs">
            Live brackets pulled from company database settings. Highlighted row
            matches current input.
          </CardDescription>
        </div>
        <Link
          href="/admin/settings"
          className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <span>Manage in Admin Settings</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border/50 bg-muted/40 text-[10px] tracking-wider text-muted-foreground uppercase">
              <tr>
                <th className="p-3">Job Subtotal Range</th>
                <th className="p-3">Upgrade Rate</th>
                <th className="p-3">Minimum Fee Floor</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Fee on Current Job</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {tiersToRender.map((t) => {
                const isRowActive = activeTier?.id === t.id
                const rangeLabel =
                  t.maxAmount === null
                    ? `$${t.minAmount.toLocaleString()} and above`
                    : `$${t.minAmount.toLocaleString()} – $${(t.maxAmount - 0.01).toLocaleString()}`

                return (
                  <tr
                    key={t.id}
                    className={cn(
                      "transition-colors",
                      isRowActive
                        ? "bg-emerald-500/10 font-bold text-foreground"
                        : "text-muted-foreground hover:bg-muted/30"
                    )}
                  >
                    <td className="p-3 font-mono">
                      <span className="flex items-center gap-2">
                        {isRowActive && (
                          <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" />
                        )}
                        <span>{rangeLabel}</span>
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-foreground">
                      {t.isAvailable ? `${t.ratePercent}%` : "—"}
                    </td>
                    <td className="p-3 font-mono">
                      {t.minFee > 0 ? `$${t.minFee.toFixed(2)}` : "None"}
                    </td>
                    <td className="p-3">
                      {t.isAvailable ? (
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                          Active
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground italic">
                          Not available
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-right font-mono font-bold">
                      {isRowActive ? (
                        isAvailable ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            +{formatMoney(upgradeResult.charge)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic">
                            $0.00 (N/A)
                          </span>
                        )
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
