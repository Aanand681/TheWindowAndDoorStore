"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { GuideTabType, GuideTabsContent } from "./guide/GuideTabsContent"
import { GuideTabHeader } from "./guide/GuideTabHeader"

interface EstimatorGuideModalProps {
  isOpen: boolean
  onClose: () => void
  defaultTab?: GuideTabType
}

export function EstimatorGuideModal({
  isOpen,
  onClose,
  defaultTab = "fenevision",
}: EstimatorGuideModalProps) {
  const [activeTab, setActiveTab] = useState<GuideTabType>(defaultTab)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/60 p-3 backdrop-blur-xs duration-200 fade-in sm:p-4">
      <div className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <GuideTabHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onClose={onClose}
        />

        <GuideTabsContent activeTab={activeTab} />

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-border/70 bg-muted/20 p-4">
          <span className="text-[11px] text-muted-foreground">
            The Window &amp; Door Store • Estimator Suite
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-8 cursor-pointer text-xs font-semibold"
          >
            Close Guide
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EstimatorGuideModal
