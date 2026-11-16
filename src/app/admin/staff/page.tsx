"use client"

import React from "react"
import { AppHeader } from "@/components/layout/AppHeader"
import { useAdminStaff } from "@/hooks/admin/useAdminStaff"
import { useAdminDepartments } from "@/hooks/admin/useAdminDepartments"
import {
  AdminStaffHeader,
  CreateStaffCard,
  StaffListCard,
  StaffDeleteModal,
  StaffCustomPermissionsModal,
  DepartmentsManagementModal,
} from "@/components/admin/staff"

export default function StaffDirectory() {
  const staff = useAdminStaff()
  const depts = useAdminDepartments({
    onRefresh: staff.fetchUsersAndDepts,
  })

  return (
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/30">
      {/* Background radial gradient accent */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

      {/* Staff Delete Confirmation Modal */}
      <StaffDeleteModal
        userToDelete={staff.userToDelete}
        users={staff.users}
        onCancel={() => staff.setUserToDelete(null)}
        onConfirm={staff.confirmDelete}
      />

      {/* Custom User Permissions Modal (Superadmin) */}
      <StaffCustomPermissionsModal
        userForCustomPerms={staff.userForCustomPerms}
        departments={staff.departments}
        userCustomPerms={staff.userCustomPerms}
        setUserCustomPerms={staff.setUserCustomPerms}
        savingUserPerms={staff.savingUserPerms}
        onClose={() => staff.setUserForCustomPerms(null)}
        onSave={staff.handleSaveUserCustomPerms}
      />

      {/* Departments & Permissions Modal (Superadmin) */}
      <DepartmentsManagementModal
        showDeptModal={depts.showDeptModal}
        setShowDeptModal={depts.setShowDeptModal}
        departments={staff.departments}
        isSuperAdmin={staff.isSuperAdmin}
        editingDeptId={depts.editingDeptId}
        setEditingDeptId={depts.setEditingDeptId}
        editingDeptPerms={depts.editingDeptPerms}
        setEditingDeptPerms={depts.setEditingDeptPerms}
        savingDept={depts.savingDept}
        handleSaveDeptPermissions={depts.handleSaveDeptPermissions}
        newDeptName={depts.newDeptName}
        setNewDeptName={depts.setNewDeptName}
        newDeptCode={depts.newDeptCode}
        setNewDeptCode={depts.setNewDeptCode}
        newDeptDesc={depts.newDeptDesc}
        setNewDeptDesc={depts.setNewDeptDesc}
        newDeptPerms={depts.newDeptPerms}
        setNewDeptPerms={depts.setNewDeptPerms}
        creatingDept={depts.creatingDept}
        handleCreateDepartment={depts.handleCreateDepartment}
      />

      <div className="relative z-10 mx-auto w-full max-w-[1650px] space-y-6 px-4 pt-5 pb-12 sm:space-y-8 sm:px-6 sm:pt-6 lg:px-8">
        <AppHeader currentPath="/admin/staff" />
        <AdminStaffHeader
          onOpenDeptModal={() => depts.setShowDeptModal(true)}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Create User Form */}
          <div className="space-y-6 lg:col-span-4">
            <CreateStaffCard
              departments={staff.departments}
              department={staff.department}
              setDepartment={staff.setDepartment}
              role={staff.role}
              setRole={staff.setRole}
              username={staff.username}
              setUsername={staff.setUsername}
              email={staff.email}
              setEmail={staff.setEmail}
              password={staff.password}
              setPassword={staff.setPassword}
              error={staff.error}
              success={staff.success}
              handleCreateUser={staff.handleCreateUser}
            />
          </div>

          {/* User List */}
          <div className="space-y-6 lg:col-span-8">
            <StaffListCard
              users={staff.users}
              departments={staff.departments}
              currentProfile={staff.currentProfile}
              loading={staff.loading}
              editingId={staff.editingId}
              setEditingId={staff.setEditingId}
              editRole={staff.editRole}
              setEditRole={staff.setEditRole}
              editDepartment={staff.editDepartment}
              setEditDepartment={staff.setEditDepartment}
              handleSaveRole={staff.handleSaveRole}
              handleOpenCustomPerms={staff.handleOpenCustomPerms}
              handleToggleActive={staff.handleToggleActive}
              setUserToDelete={staff.setUserToDelete}
              isSuperAdmin={staff.isSuperAdmin}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
