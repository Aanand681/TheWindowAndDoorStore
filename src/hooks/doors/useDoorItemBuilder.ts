"use client"

import { useState } from "react"
import { DoorLineItem } from "@/lib/doors/types"
import { toast } from "sonner"

export function useDoorItemBuilder() {
  const [lineItems, setLineItems] = useState<DoorLineItem[]>([])
  const [editingItem, setEditingItem] = useState<DoorLineItem | null>(null)

  const handleSaveItem = (item: DoorLineItem) => {
    setLineItems((prev) => {
      const existsIndex = prev.findIndex((i) => i.id === item.id)
      if (existsIndex >= 0) {
        const copy = [...prev]
        copy[existsIndex] = item
        return copy
      }
      return [...prev, item]
    })
    setEditingItem(null)
  }

  const handleEditItem = (item: DoorLineItem) => {
    setEditingItem(item)
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 120, behavior: "smooth" })
    }
  }

  const handleDuplicateItem = (id: string) => {
    const found = lineItems.find((i) => i.id === id)
    if (!found) return
    const duplicated: DoorLineItem = {
      ...found,
      id: `door_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      customDescription: found.customDescription
        ? `${found.customDescription} (Copy)`
        : undefined,
    }
    setLineItems((prev) => [...prev, duplicated])
    toast.success("Door duplicated")
  }

  const handleDeleteItem = (id: string) => {
    setLineItems((prev) => prev.filter((i) => i.id !== id))
    if (editingItem?.id === id) setEditingItem(null)
    toast.info("Door removed")
  }

  return {
    lineItems,
    setLineItems,
    editingItem,
    setEditingItem,
    handleSaveItem,
    handleEditItem,
    handleDuplicateItem,
    handleDeleteItem,
  }
}
