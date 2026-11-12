"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { UserType } from "./types"

export interface StaffDeleteModalProps {
  userToDelete: string | null
  users: UserType[]
  onCancel: () => void
  onConfirm: () => Promise<void>
}

export function StaffDeleteModal({
  userToDelete,
  users,
  onCancel,
  onConfirm,
}: StaffDeleteModalProps) {
  if (!userToDelete) return null

  const targetUser = users.find((u) => u._id === userToDelete)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-in space-y-4 rounded-2xl border border-border bg-card p-6 shadow-2xl duration-200 zoom-in-95 fade-in">
        <div className="flex items-center gap-3 text-destructive">
          <Trash2 className="h-6 w-6" />
          <h3 className="text-lg font-bold">Delete Staff Member?</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{" "}
          <strong className="text-foreground">{targetUser?.username}</strong>?
          This action cannot be undone and all associated permissions will be
          permanently removed.
        </p>
        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Delete Staff
          </Button>
        </div>
      </div>
    </div>
  )
}
