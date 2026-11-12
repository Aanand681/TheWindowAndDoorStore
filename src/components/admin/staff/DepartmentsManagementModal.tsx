"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Briefcase, X } from "lucide-react"
import { DepartmentType } from "./types"
import { ExistingDepartmentsList } from "./ExistingDepartmentsList"
import { CreateDepartmentForm } from "./CreateDepartmentForm"

export interface DepartmentsManagementModalProps {
  showDeptModal: boolean
  setShowDeptModal: (show: boolean) => void
  departments: DepartmentType[]
  isSuperAdmin: boolean
  editingDeptId: string | null
  setEditingDeptId: (id: string | null) => void
  editingDeptPerms: Record<string, boolean>
  setEditingDeptPerms: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >
  savingDept: boolean
  handleSaveDeptPermissions: (id: string) => Promise<void>
  newDeptName: string
  setNewDeptName: (name: string) => void
  newDeptCode: string
  setNewDeptCode: (code: string) => void
  newDeptDesc: string
  setNewDeptDesc: (desc: string) => void
  newDeptPerms: Record<string, boolean>
  setNewDeptPerms: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  creatingDept: boolean
  handleCreateDepartment: (e: React.FormEvent) => Promise<void>
}

export function DepartmentsManagementModal({
  showDeptModal,
  setShowDeptModal,
  departments,
  isSuperAdmin,
  editingDeptId,
  setEditingDeptId,
  editingDeptPerms,
  setEditingDeptPerms,
  savingDept,
  handleSaveDeptPermissions,
  newDeptName,
  setNewDeptName,
  newDeptCode,
  setNewDeptCode,
  newDeptDesc,
  setNewDeptDesc,
  newDeptPerms,
  setNewDeptPerms,
  creatingDept,
  handleCreateDepartment,
}: DepartmentsManagementModalProps) {
  if (!showDeptModal) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-2xl animate-in space-y-6 overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl duration-200 zoom-in-95 fade-in">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h3 className="flex items-center gap-2 text-xl font-bold text-foreground">
              <Briefcase className="h-5 w-5 text-primary" />
              Departments &amp; Roles Management
            </h3>
            <p className="text-xs text-muted-foreground">
              Manage employee categories and feature permissions.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeptModal(false)}
            className="rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <ExistingDepartmentsList
          departments={departments}
          isSuperAdmin={isSuperAdmin}
          editingDeptId={editingDeptId}
          setEditingDeptId={setEditingDeptId}
          editingDeptPerms={editingDeptPerms}
          setEditingDeptPerms={setEditingDeptPerms}
          savingDept={savingDept}
          handleSaveDeptPermissions={handleSaveDeptPermissions}
        />

        {isSuperAdmin && (
          <CreateDepartmentForm
            newDeptName={newDeptName}
            setNewDeptName={setNewDeptName}
            newDeptCode={newDeptCode}
            setNewDeptCode={setNewDeptCode}
            newDeptDesc={newDeptDesc}
            setNewDeptDesc={setNewDeptDesc}
            newDeptPerms={newDeptPerms}
            setNewDeptPerms={setNewDeptPerms}
            creatingDept={creatingDept}
            handleCreateDepartment={handleCreateDepartment}
          />
        )}

        <div className="flex justify-end border-t border-border/60 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeptModal(false)}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
