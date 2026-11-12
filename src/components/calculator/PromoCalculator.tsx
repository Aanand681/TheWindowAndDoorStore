"use client"

import React from "react"
import { Tabs } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// App shell and tab components
import { AppHeader } from "@/components/layout/AppHeader"
import TaxCalculatorTab from "@/components/tax/TaxCalculatorTab"
import QuotesTab from "@/components/quotes/QuotesTab"

// Calculator modular sub-components
import { ReviewWorkflowBar } from "@/components/calculator/ReviewWorkflowBar"
import {
  CalculatorHeaderToolbar,
  WindowConfigPanel,
  CalculatorSummaryPanel,
  CalculatorPrintInvoice,
} from "@/components/calculator/panels"
import { CalculatorModalsGroup } from "@/components/calculator/modals"
import {
  usePromoCalculator,
  UsePromoCalculatorOptions,
} from "@/hooks/calculator/usePromoCalculator"
import { generateId, UIWindowItem } from "@/hooks/useCalculatorWindows"

export { generateId, type UIWindowItem }

export type PromoCalculatorProps = UsePromoCalculatorOptions

export function PromoCalculator(props: PromoCalculatorProps = {}) {
  const {
    activeTab,
    switchTab,
    reviewWorkflowProps,
    headerToolbarProps,
    windowConfigProps,
    summaryProps,
    taxCalcKey,
    taxTabProps,
    quotesTabProps,
    printInvoiceProps,
    modalProps,
  } = usePromoCalculator(props)

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div>
        <div className="mx-auto w-full max-w-[1650px] px-4 pt-5 sm:px-6 sm:pt-6 lg:px-8">
          <AppHeader currentPath="/calculator" />
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1650px] flex-1 space-y-8 p-4 sm:p-6 lg:p-8">
        {/* Sticky Review / Approval Bar */}
        <ReviewWorkflowBar {...reviewWorkflowProps} />

        {/* Tab Controls */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => switchTab(val as any)}
          className="w-full"
        >
          {/* Header Toolbar: Staging Banner, Tabs & Action Buttons */}
          <CalculatorHeaderToolbar {...headerToolbarProps} />

          {/* Tab 1: Promo Calculator */}
          <div
            className={cn(
              "mt-0 outline-none",
              activeTab !== "promo" && "hidden"
            )}
          >
            <div className="grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-12">
              <div className="lg:col-span-8">
                <WindowConfigPanel {...windowConfigProps} />
              </div>
              <CalculatorSummaryPanel {...summaryProps} />
            </div>
          </div>

          {/* Tab 2: Tax & Labour Calculator */}
          <div
            className={cn("mt-0 outline-none", activeTab !== "tax" && "hidden")}
          >
            <TaxCalculatorTab
              key={taxCalcKey}
              {...taxTabProps}
              summarySlot={<CalculatorSummaryPanel {...summaryProps} />}
            />
          </div>

          {/* Tab 3: Quotes List & Bin */}
          <div
            className={cn(
              "mt-0 outline-none",
              activeTab !== "quotes" && "hidden"
            )}
          >
            <QuotesTab {...quotesTabProps} />
          </div>
        </Tabs>
      </div>

      {/* Hidden Invoice Template for PDF print */}
      <CalculatorPrintInvoice {...printInvoiceProps} />

      {/* Modals & Dialogs */}
      <CalculatorModalsGroup {...modalProps} />
    </div>
  )
}

export default PromoCalculator
