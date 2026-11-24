"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Settings2, Save, AlertCircle, RotateCcw, History, Percent, Award } from "lucide-react"
import SmartBackButton from "@/components/shared/SmartBackButton"
import { AppHeader } from "@/components/layout/AppHeader"
import { PricingHistoryModal } from "@/components/admin/shared/PricingHistoryModal"
import { ILabourUpgradeTier } from "@/lib/promo-logic"
import { DEFAULT_TIERS } from "@/components/admin/settings/default-tiers"
import { SurchargeSettingsCard } from "@/components/admin/settings/SurchargeSettingsCard"
import { LabourUpgradeTiersCard } from "@/components/admin/settings/LabourUpgradeTiersCard"
import { AdminLoyaltyTiersTab } from "@/components/admin/settings/AdminLoyaltyTiersTab"
import { ILoyaltyTier, DEFAULT_LOYALTY_TIERS } from "@/lib/loyalty/loyalty-engine"

export default function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState<"general" | "loyalty">("general")
  const [surcharge, setSurcharge] = useState<string>("")
  const [tiers, setTiers] = useState<ILabourUpgradeTier[]>(DEFAULT_TIERS)
  const [loyaltyTiers, setLoyaltyTiers] = useState<ILoyaltyTier[]>(DEFAULT_LOYALTY_TIERS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })
  const [showHistory, setShowHistory] = useState(false)

  const loadSettings = async () => {
    try {
      const res = await fetch("/api/settings")
      const data = await res.json()
      if (data.surchargeRate !== undefined) {
        setSurcharge(data.surchargeRate.toString())
      }
      if (Array.isArray(data.labourUpgradeTiers) && data.labourUpgradeTiers.length > 0) {
        setTiers(data.labourUpgradeTiers)
      }
      if (Array.isArray(data.loyaltyTiers) && data.loyaltyTiers.length > 0) {
        setLoyaltyTiers(data.loyaltyTiers)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
  }, [])

  const handleDiscardChanges = () => {
    if (confirm("Discard all unsaved edits and reload current settings from the database?")) {
      loadSettings()
      setMessage({
        text: "Unsaved changes discarded. Reloaded active settings from database.",
        type: "success",
      })
    }
  }

  const handleRestoreVersion = (snapshot: Record<string, any>, version: number) => {
    if (snapshot.surchargeRate !== undefined) setSurcharge(snapshot.surchargeRate.toString())
    if (Array.isArray(snapshot.labourUpgradeTiers)) setTiers(snapshot.labourUpgradeTiers)
    if (Array.isArray(snapshot.loyaltyTiers)) setLoyaltyTiers(snapshot.loyaltyTiers)

    setMessage({
      text: `Loaded rates from Version ${version} snapshot. Click "Save Settings" to persist.`,
      type: "success",
    })
  }

  const handleTierChange = (index: number, field: keyof ILabourUpgradeTier, value: any) => {
    setTiers((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const handleAddTier = () => {
    const lastTier = tiers[tiers.length - 1]
    const newMin = lastTier?.maxAmount ?? (lastTier?.minAmount ? lastTier.minAmount + 5000 : 25000)
    setTiers((prev) => [
      ...prev,
      {
        id: `tier_${Date.now()}`,
        minAmount: newMin,
        maxAmount: null,
        ratePercent: 12,
        minFee: 0,
        isAvailable: true,
        label: "12%",
      },
    ])
  }

  const handleRemoveTier = (index: number) => {
    setTiers((prev) => prev.filter((_, i) => i !== index))
  }

  const handleResetTiers = () => {
    if (confirm("Reset all Labour Upgrade brackets to business defaults?")) {
      setTiers(DEFAULT_TIERS)
    }
  }

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    setMessage({ text: "", type: "" })

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surchargeRate: parseFloat(surcharge),
          labourUpgradeTiers: tiers,
          loyaltyTiers,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setMessage({ text: "Settings updated successfully!", type: "success" })
    } catch (err: any) {
      setMessage({ text: err.message, type: "error" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="relative z-10 mx-auto w-full max-w-[1650px] space-y-6 px-4 pt-5 pb-12 sm:space-y-8 sm:px-6 sm:pt-6 lg:px-8">
        <AppHeader currentPath="/admin/settings" />

        <div className="flex flex-col justify-between gap-4 border-b border-border/50 pb-2 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-3">
            <SmartBackButton fallbackUrl="/admin" title="Back to Admin" />
            <div className="inline-flex items-center gap-2">
              <span className="rounded-lg bg-primary/10 p-1.5 text-primary">
                <Settings2 className="h-5 w-5" />
              </span>
              <div>
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Global Settings
                </h1>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Configure global surcharge rates, labour upgrade tiers, and loyalty points redemption.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDiscardChanges}
              className="cursor-pointer gap-1.5 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Discard Changes</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowHistory(true)}
              className="cursor-pointer gap-1.5 text-xs"
            >
              <History className="h-3.5 w-3.5" />
              <span>Version History</span>
            </Button>
            <Button
              type="button"
              onClick={() => handleSave()}
              disabled={saving || loading}
              size="sm"
              className="cursor-pointer gap-1.5 shadow-md"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? "Saving..." : "Save Settings"}</span>
            </Button>
          </div>
        </div>

        {/* Pricing History Version Modal */}
        <PricingHistoryModal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          category="GLOBAL_SETTINGS"
          title="Global Settings"
          onRestoreVersion={handleRestoreVersion}
        />

        {message.text && (
          <div
            className={`flex items-center gap-2 rounded-xl border p-4 text-sm font-medium shadow-sm transition-all ${
              message.type === "error"
                ? "border-destructive/20 bg-destructive/10 text-destructive"
                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
            }`}
          >
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p>{message.text}</p>
          </div>
        )}

        {/* Tabbed Interface matching /admin/doors */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as any)}
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/50 p-1">
            <TabsTrigger value="general" className="gap-2 text-xs sm:text-sm">
              <Percent className="h-4 w-4" />
              <span>General Rates &amp; Tiers</span>
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="gap-2 text-xs sm:text-sm">
              <Award className="h-4 w-4" />
              <span>Loyalty Points ({loyaltyTiers.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-8">
            <SurchargeSettingsCard
              surcharge={surcharge}
              setSurcharge={setSurcharge}
              loading={loading}
            />

            <LabourUpgradeTiersCard
              tiers={tiers}
              loading={loading}
              handleResetTiers={handleResetTiers}
              handleAddTier={handleAddTier}
              handleTierChange={handleTierChange}
              handleRemoveTier={handleRemoveTier}
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                onClick={() => handleSave()}
                disabled={saving || loading}
                className="cursor-pointer gap-2 bg-primary px-6 font-semibold text-primary-foreground shadow-lg hover:bg-primary/90"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? "Saving Settings..." : "Save General Settings"}</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="loyalty" className="space-y-6">
            <AdminLoyaltyTiersTab
              loyaltyTiers={loyaltyTiers}
              setLoyaltyTiers={setLoyaltyTiers}
              loading={loading}
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                onClick={() => handleSave()}
                disabled={saving || loading}
                className="cursor-pointer gap-2 bg-primary px-6 font-semibold text-primary-foreground shadow-lg hover:bg-primary/90"
              >
                <Save className="h-4 w-4" />
                <span>{saving ? "Saving Settings..." : "Save Loyalty Tiers"}</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
