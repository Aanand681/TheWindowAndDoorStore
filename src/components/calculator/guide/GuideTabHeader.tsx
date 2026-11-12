"use client"

import React from "react"
import {
  HelpCircle,
  FileCheck2,
  Calculator,
  FileText,
  Layers,
  Bookmark,
  X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { GuideTabType } from "./GuideTabsContent"

export interface GuideTabHeaderProps {
  activeTab: GuideTabType
  setActiveTab: (t: GuideTabType) => void
  onClose: () => void
}

export function GuideTabHeader({
  activeTab,
  setActiveTab,
  onClose,
}: GuideTabHeaderProps) {
  return (
    <div className="border-b border-border/70 bg-muted/20 p-5 pb-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
              Estimator &amp; Quoting Workflow Guide
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">
              Quick instructions for FeneVision PDFs, Window Calculations, Quote
              Studio &amp; Sealed Units.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Pills */}
      <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border/50 pt-2">
        <button
          type="button"
          onClick={() => setActiveTab("fenevision")}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
            activeTab === "fenevision"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <FileCheck2 className="h-3.5 w-3.5" />
          <span>1. FeneVision PDFs</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("calculator")}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
            activeTab === "calculator"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Calculator className="h-3.5 w-3.5" />
          <span>2. Window Calculator</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("studio")}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
            activeTab === "studio"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <FileText className="h-3.5 w-3.5" />
          <span>3. Quote PDF Studio</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sealed_units")}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
            activeTab === "sealed_units"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>4. Sealed Units</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("workflow")}
          className={cn(
            "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
            activeTab === "workflow"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <Bookmark className="h-3.5 w-3.5" />
          <span>5. Save &amp; Print Policy</span>
        </button>
      </div>
    </div>
  )
}
