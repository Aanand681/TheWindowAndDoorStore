"use client"

import { useState } from "react"
import { toast } from "sonner"

export interface UseAdminDepartmentsProps {
  onRefresh: () => Promise<void>
}

export function useAdminDepartments({ onRefresh }: UseAdminDepartmentsProps) {
  const [showDeptModal, setShowDeptModal] = useState(false)
  const [newDeptName, setNewDeptName] = useState("")
  const [newDeptCode, setNewDeptCode] = useState("")
  const [newDeptDesc, setNewDeptDesc] = useState("")
  const [newDeptPerms, setNewDeptPerms] = useState<Record<string, boolean>>({
    canCreateQuote: true,
    canReviewQuote: false,
    canApproveQuote: false,
    canEditApprovedQuote: false,
    canAccessOdooQueue: false,
    canMarkOdooEntry: false,
    canAccessAdmin: false,
  })
  const [creatingDept, setCreatingDept] = useState(false)
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null)
  const [editingDeptPerms, setEditingDeptPerms] = useState<
    Record<string, boolean>
  >({})
  const [savingDept, setSavingDept] = useState(false)

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDeptName.trim() || !newDeptCode.trim()) {
      toast.error("Department name and code are required")
      return
    }
    setCreatingDept(true)
    try {
      const res = await fetch("/api/departments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newDeptName.trim(),
          code: newDeptCode.trim().toUpperCase(),
          description: newDeptDesc.trim(),
          permissions: newDeptPerms,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to create department")
      toast.success(`Department "${newDeptName}" created!`)
      setNewDeptName("")
      setNewDeptCode("")
      setNewDeptDesc("")
      await onRefresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setCreatingDept(false)
    }
  }

  const handleSaveDeptPermissions = async (deptId: string) => {
    setSavingDept(true)
    try {
      const res = await fetch("/api/departments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: deptId,
          permissions: editingDeptPerms,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to update department")
      toast.success("Department permissions updated successfully!")
      setEditingDeptId(null)
      await onRefresh()
    } catch (err: any) {
      toast.error(err.message || "Failed to update department")
    } finally {
      setSavingDept(false)
    }
  }

  return {
    showDeptModal,
    setShowDeptModal,
    newDeptName,
    setNewDeptName,
    newDeptCode,
    setNewDeptCode,
    newDeptDesc,
    setNewDeptDesc,
    newDeptPerms,
    setNewDeptPerms,
    creatingDept,
    editingDeptId,
    setEditingDeptId,
    editingDeptPerms,
    setEditingDeptPerms,
    savingDept,
    handleCreateDepartment,
    handleSaveDeptPermissions,
  }
}
