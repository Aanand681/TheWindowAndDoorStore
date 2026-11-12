"use client"

import React, { useState } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Save, Loader2 } from "lucide-react"
import { useAdminPromos } from "@/hooks/admin/useAdminPromos"
import {
  AdminPromosHeader,
  CreatePromoModal,
  PromoCardItem,
  PromoOrderAlert,
} from "@/components/admin/promos"

export default function PromosDashboard() {
  const {
    promos,
    loading,
    savingOrder,
    hasOrderChanges,
    handleSaveOrder,
    handleDiscardChanges,
    handleMove,
    handleDragStart,
    handleDragOver,
    handleDrop,
    draggedIndex,
    setDraggedIndex,
    handleToggleActive,
    handleDelete,
    isSuperAdmin,
    fetchData,
  } = useAdminPromos()

  const [showCreateModal, setShowCreateModal] = useState(false)

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      {/* Create Modal */}
      {showCreateModal && isSuperAdmin && (
        <CreatePromoModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchData}
        />
      )}

      <div className="relative z-10 mx-auto w-full max-w-[1650px] space-y-8 px-4 py-10 sm:px-6 lg:px-8">
        <AdminPromosHeader />

        <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl">
          <CardHeader className="flex flex-col items-start justify-between gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-xl">
                Active & Inactive Promos
              </CardTitle>
              <CardDescription>
                Toggle which promos are live. Use the arrows or drag cards to
                rearrange their order on the calculator page.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {hasOrderChanges && (
                <Button
                  onClick={handleSaveOrder}
                  disabled={savingOrder}
                  className="animate-pulse bg-emerald-600 font-bold text-white shadow-lg hover:bg-emerald-700"
                >
                  {savingOrder ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
                      Order...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Order
                    </>
                  )}
                </Button>
              )}
              {isSuperAdmin && (
                <Button
                  onClick={() => setShowCreateModal(true)}
                  className="shadow-lg"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Promo
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {hasOrderChanges && (
              <PromoOrderAlert
                savingOrder={savingOrder}
                onSaveOrder={handleSaveOrder}
                onDiscardChanges={handleDiscardChanges}
              />
            )}
            {loading ? (
              <div className="text-sm text-muted-foreground">
                Loading promos...
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {promos.map((promo, index) => (
                  <PromoCardItem
                    key={promo._id}
                    promo={promo}
                    index={index}
                    totalPromos={promos.length}
                    draggedIndex={draggedIndex}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={() => setDraggedIndex(null)}
                    onMove={handleMove}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDelete}
                    isSuperAdmin={isSuperAdmin}
                  />
                ))}
                {promos.length === 0 && (
                  <div className="col-span-full rounded-xl border border-dashed border-border py-12 text-center text-muted-foreground">
                    No promos found. Contact developer to create new promo.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
