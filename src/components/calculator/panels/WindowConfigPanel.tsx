"use client"

import React from "react"
import { WindowConfigurationsCard } from "@/components/calculator/WindowConfigurationsCard"
import { SupplyJambCasingCard } from "@/components/calculator/SupplyJambCasingCard"
import { PromoComparisonGrid } from "@/components/calculator/PromoComparisonGrid"
import { UIWindowItem } from "@/hooks/useCalculatorWindows"

export interface WindowConfigPanelProps {
  windows: UIWindowItem[]
  surchargeRate: number
  quoteNumber: string
  setQuoteNumber: (num: string) => void
  customerName: string
  setCustomerName: (name: string) => void
  fileInputRef: React.RefObject<HTMLInputElement | null>
  handlePdfUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  handlePdfImportClick: () => void
  isReadOnly: boolean
  onResetQuote: () => void
  handleWindowChange: (
    id: string,
    field: keyof UIWindowItem,
    value: string
  ) => void
  handleRemoveWindow: (id: string) => void
  handleAddWindow: () => void
  windowEndRef: React.RefObject<HTMLDivElement | null>
  isSupplyOnly: boolean
  setIsSupplyOnly: (val: boolean) => void
  onOpenCompareModal: () => void
  attachedUpgrade: any
  onRemoveAttachedUpgrade: () => void
  attachedSealedUnit: any
  attachedDoorQuote: any
  onOpenAttachSealedUnitModal: () => void
  onRemoveAttachedSealedUnit: () => void
  onRemoveAttachedDoorQuote: () => void
  onSaveDraft: () => void
  onOpenSavedQuotes: () => void
  savedDraftsCount?: number

  // Supply only options
  supplyJambId: string
  setSupplyJambId: (id: string) => void
  supplyJambName: string
  setSupplyJambName: (name: string) => void
  supplyJambRate: string
  setSupplyJambRate: (rate: string) => void
  supplyCasingId: string
  setSupplyCasingId: (id: string) => void
  supplyCasingName: string
  setSupplyCasingName: (name: string) => void
  supplyCasingRate: string
  setSupplyCasingRate: (rate: string) => void
  onSupplyJCCalculated: (data: any) => void

  // Promo Grid
  compareOptions: any[]
  activePromoId: string
  setActivePromoId: (id: string) => void
  setLockedPromoId: (id: string | null) => void
}

export function WindowConfigPanel({
  windows,
  surchargeRate,
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
  isSupplyOnly,
  setIsSupplyOnly,
  onOpenCompareModal,
  attachedUpgrade,
  onRemoveAttachedUpgrade,
  attachedSealedUnit,
  attachedDoorQuote,
  onOpenAttachSealedUnitModal,
  onRemoveAttachedSealedUnit,
  onRemoveAttachedDoorQuote,
  onSaveDraft,
  onOpenSavedQuotes,
  savedDraftsCount,
  supplyJambId,
  setSupplyJambId,
  supplyJambName,
  setSupplyJambName,
  supplyJambRate,
  setSupplyJambRate,
  supplyCasingId,
  setSupplyCasingId,
  supplyCasingName,
  setSupplyCasingName,
  supplyCasingRate,
  setSupplyCasingRate,
  onSupplyJCCalculated,
  compareOptions,
  activePromoId,
  setActivePromoId,
  setLockedPromoId,
}: WindowConfigPanelProps) {
  return (
    <div className="space-y-4 sm:space-y-5">
      <WindowConfigurationsCard
        windows={windows}
        surchargeRate={surchargeRate}
        quoteNumber={quoteNumber}
        setQuoteNumber={setQuoteNumber}
        customerName={customerName}
        setCustomerName={setCustomerName}
        fileInputRef={fileInputRef}
        handlePdfUpload={handlePdfUpload}
        handlePdfImportClick={handlePdfImportClick}
        isReadOnly={isReadOnly}
        onResetQuote={onResetQuote}
        handleWindowChange={handleWindowChange}
        handleRemoveWindow={handleRemoveWindow}
        handleAddWindow={handleAddWindow}
        windowEndRef={windowEndRef}
        isSupplyOnly={isSupplyOnly}
        setIsSupplyOnly={setIsSupplyOnly}
        onOpenCompareModal={onOpenCompareModal}
        attachedUpgrade={attachedUpgrade}
        onRemoveAttachedUpgrade={onRemoveAttachedUpgrade}
        attachedSealedUnit={attachedSealedUnit}
        attachedDoorQuote={attachedDoorQuote}
        onOpenAttachSealedUnitModal={onOpenAttachSealedUnitModal}
        onRemoveAttachedSealedUnit={onRemoveAttachedSealedUnit}
        onRemoveAttachedDoorQuote={onRemoveAttachedDoorQuote}
        onSaveDraft={onSaveDraft}
        onOpenSavedQuotes={onOpenSavedQuotes}
        savedDraftsCount={savedDraftsCount}
      />

      {isSupplyOnly && (
        <SupplyJambCasingCard
          windows={windows}
          isReadOnly={isReadOnly}
          jambId={supplyJambId}
          setJambId={setSupplyJambId}
          jambName={supplyJambName}
          setJambName={setSupplyJambName}
          jambRate={supplyJambRate}
          setJambRate={setSupplyJambRate}
          casingId={supplyCasingId}
          setCasingId={setSupplyCasingId}
          casingName={supplyCasingName}
          setCasingName={setSupplyCasingName}
          casingRate={supplyCasingRate}
          setCasingRate={setSupplyCasingRate}
          onJCCalculated={onSupplyJCCalculated}
        />
      )}

      <PromoComparisonGrid
        compareOptions={compareOptions}
        activePromoId={activePromoId}
        setActivePromoId={setActivePromoId}
        setLockedPromoId={setLockedPromoId}
      />
    </div>
  )
}
