'use client';

import React from 'react';
import { useAdminStaff } from '@/hooks/admin/useAdminStaff';
import { useAdminDepartments } from '@/hooks/admin/useAdminDepartments';
import {
  AdminStaffHeader,
  CreateStaffCard,
  StaffListCard,
  StaffDeleteModal,
  StaffCustomPermissionsModal,
  DepartmentsManagementModal,
} from '@/components/admin/staff';

export default function StaffDirectory() {
  const staff = useAdminStaff();
  const depts = useAdminDepartments({
    onRefresh: staff.fetchUsersAndDepts,
  });

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background radial gradient accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

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

      <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-8">
        <AdminStaffHeader onOpenDeptModal={() => depts.setShowDeptModal(true)} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Create User Form */}
          <div className="lg:col-span-4 space-y-6">
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
          <div className="lg:col-span-8 space-y-6">
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
  );
}
