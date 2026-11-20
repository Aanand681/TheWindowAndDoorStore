"use client"

import React, { useState } from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Shield, Sparkles, Palette } from "lucide-react"
import { AppHeader } from "@/components/layout/AppHeader"
import { useAdminStormDoors } from "@/hooks/admin/useAdminStormDoors"
import {
  AdminStormDoorsHeader,
  AdminStormModelsTab,
  AdminStormAddonsTab,
  AdminStormRulesTab,
  AdminAddModelModal,
  AdminAddAddonModal,
} from "@/components/admin/storm-doors"

export default function AdminStormDoorsPage() {
  const [isAddModelOpen, setIsAddModelOpen] = useState(false)
  const [isAddAddonOpen, setIsAddAddonOpen] = useState(false)

  const {
    models,
    addons,
    rules,
    loading,
    saving,
    activeTab,
    setActiveTab,
    handleSave,
    handleDiscardChanges,
    handleAddModel,
    handleUpdateModelField,
    handleDeleteModel,
    handleAddAddon,
    handleUpdateAddonField,
    handleDeleteAddon,
    handleUpdateRule,
  } = useAdminStormDoors()

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="relative z-10 mx-auto w-full max-w-[1650px] space-y-6 px-4 pt-5 pb-12 sm:space-y-8 sm:px-6 sm:pt-6 lg:px-8">
        <AppHeader currentPath="/admin/storm-doors" />

        <AdminStormDoorsHeader
          onDiscardChanges={handleDiscardChanges}
          onSave={handleSave}
          onOpenAddModel={() => setIsAddModelOpen(true)}
          onOpenAddAddon={() => setIsAddAddonOpen(true)}
          activeTab={activeTab}
          saving={saving}
          loading={loading}
        />

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as any)}
          className="space-y-6"
        >
          <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-muted/50 p-1">
            <TabsTrigger value="models" className="gap-2 text-xs sm:text-sm">
              <Shield className="h-4 w-4" />
              <span>Door Models ({models.length})</span>
            </TabsTrigger>
            <TabsTrigger value="addons" className="gap-2 text-xs sm:text-sm">
              <Sparkles className="h-4 w-4" />
              <span>Add-ons ({addons.length})</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="gap-2 text-xs sm:text-sm">
              <Palette className="h-4 w-4" />
              <span>Finishes &amp; Rules</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-4">
            <AdminStormModelsTab
              models={models}
              onUpdateModel={handleUpdateModelField}
              onDeleteModel={handleDeleteModel}
              onOpenAddModel={() => setIsAddModelOpen(true)}
            />
          </TabsContent>

          <TabsContent value="addons" className="space-y-4">
            <AdminStormAddonsTab
              addons={addons}
              onUpdateAddon={handleUpdateAddonField}
              onDeleteAddon={handleDeleteAddon}
              onOpenAddAddon={() => setIsAddAddonOpen(true)}
            />
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <AdminStormRulesTab
              rules={rules}
              onUpdateRule={handleUpdateRule}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AdminAddModelModal
        isOpen={isAddModelOpen}
        onClose={() => setIsAddModelOpen(false)}
        onAdd={handleAddModel}
      />

      <AdminAddAddonModal
        isOpen={isAddAddonOpen}
        onClose={() => setIsAddAddonOpen(false)}
        onAdd={handleAddAddon}
      />
    </div>
  )
}
