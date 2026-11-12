"use client"

import { useState, useEffect } from "react"
import { PromoType } from "@/components/admin/promos/types"
import { toast } from "sonner"

export function useAdminPromos() {
  const [promos, setPromos] = useState<PromoType[]>([])
  const [savedPromos, setSavedPromos] = useState<PromoType[]>([])
  const [savingOrder, setSavingOrder] = useState(false)
  const [role, setRole] = useState("ADMIN")
  const [loading, setLoading] = useState(true)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const fetchData = async () => {
    try {
      const [promoRes, profileRes] = await Promise.all([
        fetch("/api/promos"),
        fetch("/api/profile"),
      ])
      const promoData = await promoRes.json()
      const profileData = await profileRes.json()

      if (Array.isArray(promoData)) {
        setPromos(promoData)
        setSavedPromos(promoData)
      }
      if (profileData.role) setRole(profileData.role)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const hasOrderChanges =
    promos.length > 0 &&
    savedPromos.length === promos.length &&
    promos.some((p, i) => p._id !== savedPromos[i]?._id)

  const handleSaveOrder = async () => {
    setSavingOrder(true)
    try {
      const res = await fetch("/api/promos/reorder", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderedIds: promos.map((p) => p._id) }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update order")
      setSavedPromos([...promos])
      toast.success(
        "Promo order saved! Sequence is now live on the calculator."
      )
    } catch (err: any) {
      toast.error(err.message || "Failed to update order")
    } finally {
      setSavingOrder(false)
    }
  }

  const handleDiscardChanges = () => {
    setPromos([...savedPromos])
    toast.info("Discarded order changes")
  }

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= promos.length) return

    const newPromos = [...promos]
    const [moved] = newPromos.splice(index, 1)
    newPromos.splice(targetIndex, 0, moved)

    setPromos(newPromos)
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", String(index))
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null)
      return
    }

    const newPromos = [...promos]
    const [moved] = newPromos.splice(draggedIndex, 1)
    newPromos.splice(targetIndex, 0, moved)

    setDraggedIndex(null)
    setPromos(newPromos)
  }

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/promos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      })
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo permanently?"))
      return
    try {
      await fetch(`/api/promos/${id}`, { method: "DELETE" })
      fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const isSuperAdmin = role === "SUPERADMIN"

  return {
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
  }
}
