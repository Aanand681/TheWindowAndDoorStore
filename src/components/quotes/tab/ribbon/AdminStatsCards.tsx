"use client"

import React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, AlertCircle, ClipboardCheck, CheckCircle2 } from "lucide-react"
import type { QuotesSubTabType } from "../types"

export interface AdminStatsCardsProps {
  activeTab: QuotesSubTabType
  handleTabChange: (tab: QuotesSubTabType) => void
  adminPendingCount: number
  adminOdooCount: number
  adminArchiveCount: number
}

export function AdminStatsCards({
  activeTab,
  handleTabChange,
  adminPendingCount,
  adminOdooCount,
  adminArchiveCount,
}: AdminStatsCardsProps) {
  return (
    <>
      {/* Admin Card 1: Pending Review */}
      <Card
        className={`cursor-pointer border transition-all duration-200 ${
          activeTab === "review"
            ? "border-amber-500/50 bg-amber-500/10 shadow-md ring-2 ring-amber-500/20"
            : "border-border/70 bg-card/40 hover:border-border"
        }`}
        onClick={() => handleTabChange("review")}
      >
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-500 uppercase">
              <Clock className="h-3.5 w-3.5" />
              <span>Pending Review</span>
            </div>
            <div className="mt-1 font-mono text-2xl font-black text-foreground">
              {adminPendingCount}
            </div>
          </div>
          <div className="rounded-full bg-amber-500/20 p-2.5 text-amber-500">
            <AlertCircle className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Admin Card 2: Odoo Entry Queue */}
      <Card
        className={`cursor-pointer border transition-all duration-200 ${
          activeTab === "odoo"
            ? "border-indigo-500/50 bg-indigo-500/10 shadow-md ring-2 ring-indigo-500/20"
            : "border-border/70 bg-card/40 hover:border-border"
        }`}
        onClick={() => handleTabChange("odoo")}
      >
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-indigo-500 uppercase">
              <ClipboardCheck className="h-3.5 w-3.5" />
              <span>Odoo Entry Queue</span>
            </div>
            <div className="mt-1 font-mono text-2xl font-black text-foreground">
              {adminOdooCount}
            </div>
          </div>
          <div className="rounded-full bg-indigo-500/20 p-2.5 text-indigo-500">
            <ClipboardCheck className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>

      {/* Admin Card 3: All Quotes Archive */}
      <Card
        className={`cursor-pointer border transition-all duration-200 ${
          activeTab === "all"
            ? "border-emerald-500/50 bg-emerald-500/10 shadow-md ring-2 ring-emerald-500/20"
            : "border-border/70 bg-card/40 hover:border-border"
        }`}
        onClick={() => handleTabChange("all")}
      >
        <CardContent className="flex items-center justify-between p-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-emerald-500 uppercase">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>All Quotes Archive</span>
            </div>
            <div className="mt-1 font-mono text-2xl font-black text-foreground">
              {adminArchiveCount}
            </div>
          </div>
          <div className="rounded-full bg-emerald-500/20 p-2.5 text-emerald-500">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </CardContent>
      </Card>
    </>
  )
}
