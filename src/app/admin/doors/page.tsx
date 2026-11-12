"use client"

import React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DoorClosed, Wrench, Percent, Truck } from "lucide-react"
import { AppHeader } from "@/components/layout/AppHeader"
import { useAdminDoors } from "@/hooks/admin/useAdminDoors"
import {
  AdminDoorsHeader,
  AdminDoorPresetsTab,
  AdminDoorUpchargesTab,
  AdminDoorFormulaTab,
  AdminDoorLogisticsTab,
} from "@/components/admin/doors"

export default function AdminDoorsPage() {
  const {
    presets,
    upcharges,
    formula,
    setFormula,
    logistics,
    setLogistics,
    loading,
    saving,
    activeTab,
    setActiveTab,
    handleSave,
    handleResetDefaults,
    handleUpdatePreset,
    handleAddPreset,
    handleDeletePreset,
    handleUpdateUpcharge,
    handleAddUpcharge,
    handleDeleteUpcharge,
  } = useAdminDoors()

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="relative z-10 mx-auto w-full max-w-[1650px] space-y-6 px-4 pt-5 pb-12 sm:space-y-8 sm:px-6 sm:pt-6 lg:px-8">
        <AppHeader currentPath="/admin/doors" />

        <AdminDoorsHeader
          onResetDefaults={handleResetDefaults}
          onSave={handleSave}
          saving={saving}
          loading={loading}
        />

        {/* Tabs Container */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as any)}
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-3xl grid-cols-2 bg-muted/50 p-1 md:grid-cols-4">
            <TabsTrigger value="presets" className="gap-2 text-xs sm:text-sm">
              <DoorClosed className="h-4 w-4" />
              <span>Door Presets ({presets.length})</span>
            </TabsTrigger>
            <TabsTrigger value="upcharges" className="gap-2 text-xs sm:text-sm">
              <Wrench className="h-4 w-4" />
              <span>Upcharges &amp; Hardware</span>
            </TabsTrigger>
            <TabsTrigger value="formula" className="gap-2 text-xs sm:text-sm">
              <Percent className="h-4 w-4" />
              <span>Surcharges &amp; Discounts</span>
            </TabsTrigger>
            <TabsTrigger value="logistics" className="gap-2 text-xs sm:text-sm">
              <Truck className="h-4 w-4" />
              <span>Travel &amp; Logistics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-4">
            <AdminDoorPresetsTab
              presets={presets}
              onAddPreset={handleAddPreset}
              onUpdatePreset={handleUpdatePreset}
              onDeletePreset={handleDeletePreset}
            />
          </TabsContent>

          <TabsContent value="upcharges" className="space-y-6">
            <AdminDoorUpchargesTab
              upcharges={upcharges}
              formula={formula}
              setFormula={setFormula}
              onAddUpcharge={handleAddUpcharge}
              onUpdateUpcharge={handleUpdateUpcharge}
              onDeleteUpcharge={handleDeleteUpcharge}
            />
          </TabsContent>

          <TabsContent value="formula" className="space-y-4">
            <AdminDoorFormulaTab formula={formula} setFormula={setFormula} />
          </TabsContent>

          <TabsContent value="logistics" className="space-y-4">
            <AdminDoorLogisticsTab
              logistics={logistics}
              setLogistics={setLogistics}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
