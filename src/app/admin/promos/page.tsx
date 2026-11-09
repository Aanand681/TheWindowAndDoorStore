'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Save, Loader2 } from 'lucide-react';
import { useAdminPromos } from '@/hooks/admin/useAdminPromos';
import {
  AdminPromosHeader,
  CreatePromoModal,
  PromoCardItem,
  PromoOrderAlert,
} from '@/components/admin/promos';

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
  } = useAdminPromos();

  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />

      {/* Create Modal */}
      {showCreateModal && isSuperAdmin && (
        <CreatePromoModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchData}
        />
      )}

      <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-8">
        <AdminPromosHeader />

        <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
            <div>
              <CardTitle className="text-xl">Active & Inactive Promos</CardTitle>
              <CardDescription>
                Toggle which promos are live. Use the arrows or drag cards to rearrange their order on the calculator page.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {hasOrderChanges && (
                <Button
                  onClick={handleSaveOrder}
                  disabled={savingOrder}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg font-bold animate-pulse"
                >
                  {savingOrder ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving Order...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save Order
                    </>
                  )}
                </Button>
              )}
              {isSuperAdmin && (
                <Button onClick={() => setShowCreateModal(true)} className="shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
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
              <div className="text-muted-foreground text-sm">Loading promos...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <div className="col-span-full text-center py-12 text-muted-foreground border border-dashed border-border rounded-xl">
                    No promos found. Contact developer to create new promo.
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
