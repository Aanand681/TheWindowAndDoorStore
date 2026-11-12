"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  Wrench,
  ChevronDown,
  FileText,
  DoorClosed,
  ArrowRight,
  ShieldCheck,
  Layers,
  HelpCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { EstimatorGuideModal } from "@/components/calculator/EstimatorGuideModal"

export interface ToolsMenuProps {
  currentPath: string
  className?: string
}

export default function ToolsMenu({ currentPath, className }: ToolsMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGuideOpen, setIsGuideOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const isStudioActive = currentPath === "/quote-studio"
  const isUpgradeActive = currentPath === "/upgrade-calculator"
  const isSealedUnitsActive = currentPath === "/sealed-units"
  const isDoorsActive = currentPath === "/doors"

  return (
    <div
      className={cn("relative inline-block text-left", className)}
      ref={menuRef}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "cursor-pointer gap-1.5 rounded-full bg-card/50 text-xs font-medium shadow-xs backdrop-blur transition-all",
          isStudioActive ||
            isUpgradeActive ||
            isSealedUnitsActive ||
            isDoorsActive
            ? "border-primary bg-primary/10 text-primary hover:bg-primary/15"
            : "border-border/60 text-muted-foreground hover:bg-muted/30 hover:text-foreground"
        )}
        title="Tools & App Launcher"
        aria-expanded={isOpen}
      >
        <Wrench className="h-3.5 w-3.5" />
        <span>Tools</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 opacity-70 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-72 animate-in rounded-2xl border border-border bg-card/95 p-2 shadow-2xl backdrop-blur-xl duration-150 fade-in slide-in-from-top-2">
          <div className="border-b border-border/60 px-3 py-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
                Estimator Tools
              </span>
              <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                Suite
              </span>
            </div>
          </div>

          <div className="space-y-1 py-1.5">
            {/* Tool 1: Quote PDF Studio */}
            <Link
              href="/quote-studio"
              onClick={() => setIsOpen(false)}
              className={cn(
                "group flex cursor-pointer items-start gap-3 rounded-xl border p-2.5 transition-all",
                isStudioActive
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-transparent text-foreground hover:bg-muted/60"
              )}
            >
              <div
                className={cn(
                  "shrink-0 rounded-lg p-2 transition-colors",
                  isStudioActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                )}
              >
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">
                    Quote PDF Studio
                  </span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                  Invoice generation, designer &amp; print presets
                </p>
              </div>
            </Link>

            {/* Tool 2: Labour Upgrade */}
            <Link
              href="/upgrade-calculator"
              onClick={() => setIsOpen(false)}
              className={cn(
                "group flex cursor-pointer items-start gap-3 rounded-xl border p-2.5 transition-all",
                isUpgradeActive
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-transparent text-foreground hover:bg-muted/60"
              )}
            >
              <div
                className={cn(
                  "shrink-0 rounded-lg p-2 transition-colors",
                  isUpgradeActive
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white dark:text-emerald-400"
                )}
              >
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Labour Upgrade</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                  Instant 5-year labour warranty fee calculator
                </p>
              </div>
            </Link>

            {/* Tool 3: Sealed Unit Price Calculator */}
            <Link
              href="/sealed-units"
              onClick={() => setIsOpen(false)}
              className={cn(
                "group flex cursor-pointer items-start gap-3 rounded-xl border p-2.5 transition-all",
                isSealedUnitsActive
                  ? "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                  : "border-transparent text-foreground hover:bg-muted/60"
              )}
            >
              <div
                className={cn(
                  "shrink-0 rounded-lg p-2 transition-colors",
                  isSealedUnitsActive
                    ? "bg-blue-600 text-white"
                    : "bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white dark:text-blue-400"
                )}
              >
                <Layers className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Sealed Units</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                  Glass unit pricing, installation &amp; travel calculator
                </p>
              </div>
            </Link>

            {/* Tool 4: Door Calculator */}
            <Link
              href="/doors"
              onClick={() => setIsOpen(false)}
              className={cn(
                "group flex cursor-pointer items-start gap-3 rounded-xl border p-2.5 transition-all",
                isDoorsActive
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                  : "border-transparent text-foreground hover:bg-muted/60"
              )}
            >
              <div
                className={cn(
                  "shrink-0 rounded-lg p-2 transition-colors",
                  isDoorsActive
                    ? "bg-amber-600 text-white"
                    : "bg-amber-500/10 text-amber-600 group-hover:bg-amber-600 group-hover:text-white dark:text-amber-400"
                )}
              >
                <DoorClosed className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Door Calculator</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
                  Door &amp; installation pricing, 10% discount &amp; tax
                </p>
              </div>
            </Link>

            {/* Estimator Guide Quick Action */}
            <div className="border-t border-border/60 pt-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setIsGuideOpen(true)
                }}
                className="flex w-full cursor-pointer items-center gap-2.5 rounded-xl p-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              >
                <HelpCircle className="h-4 w-4 shrink-0 text-primary" />
                <span>Workflow &amp; PDF Guide</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <EstimatorGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  )
}
