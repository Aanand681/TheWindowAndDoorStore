"use client"

import React from "react"
import { useAdminRegions } from "@/hooks/admin/useAdminRegions"
import {
  AdminRegionsHeader,
  RegionConfigCard,
  BigScreenGeofenceModal,
  CreateRegionModal,
  DeleteRegionDialog,
} from "@/components/admin/regions"

export default function RegionsDashboard() {
  const {
    regions,
    loading,
    saving,
    creating,
    geocoding,
    message,
    setFullscreenRegionId,
    fullscreenRegion,
    isCreateOpen,
    setIsCreateOpen,
    deleteConfirmRegion,
    setDeleteConfirmRegion,
    newRegion,
    setNewRegion,
    updateRegion,
    handleAutoLocate,
    handleToggleNewSupplyOnly,
    handleCreateRegion,
    handleDeleteRegion,
    handleSave,
  } = useAdminRegions()

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      <div className="relative z-10 mx-auto w-full max-w-[1650px] space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <AdminRegionsHeader onOpenCreate={() => setIsCreateOpen(true)} />

        {message.text && (
          <div
            className={`rounded-lg px-4 py-3 text-sm font-medium ${
              message.type === "error"
                ? "bg-destructive/10 text-destructive"
                : "bg-emerald-500/10 text-emerald-500"
            }`}
          >
            {message.text}
          </div>
        )}

        {loading ? (
          <p className="text-center text-muted-foreground">
            Loading regions...
          </p>
        ) : (
          <div className="space-y-8">
            {regions.map((region) => (
              <RegionConfigCard
                key={region._id}
                region={region}
                saving={saving}
                geocoding={geocoding}
                onSave={handleSave}
                onDeleteConfirm={setDeleteConfirmRegion}
                onUpdateRegion={updateRegion}
                onAutoLocate={handleAutoLocate}
                onOpenFullscreen={setFullscreenRegionId}
              />
            ))}
          </div>
        )}

        {/* Fullscreen Big Screen Map Modal */}
        <BigScreenGeofenceModal
          fullscreenRegion={fullscreenRegion}
          onClose={() => setFullscreenRegionId(null)}
          onUpdateRegion={updateRegion}
        />

        {/* Create New Region Modal */}
        <CreateRegionModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          newRegion={newRegion}
          setNewRegion={setNewRegion}
          creating={creating}
          geocoding={geocoding}
          onToggleSupplyOnly={handleToggleNewSupplyOnly}
          onAutoLocate={handleAutoLocate}
          onSubmit={handleCreateRegion}
        />

        {/* Delete Confirmation Modal */}
        <DeleteRegionDialog
          region={deleteConfirmRegion}
          onClose={() => setDeleteConfirmRegion(null)}
          onConfirm={handleDeleteRegion}
        />
      </div>
    </div>
  )
}
