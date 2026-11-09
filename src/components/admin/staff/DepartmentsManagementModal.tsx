'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Briefcase, X } from 'lucide-react';
import { DepartmentType } from './types';
import { ExistingDepartmentsList } from './ExistingDepartmentsList';
import { CreateDepartmentForm } from './CreateDepartmentForm';

export interface DepartmentsManagementModalProps {
  showDeptModal: boolean;
  setShowDeptModal: (show: boolean) => void;
  departments: DepartmentType[];
  isSuperAdmin: boolean;
  editingDeptId: string | null;
  setEditingDeptId: (id: string | null) => void;
  editingDeptPerms: Record<string, boolean>;
  setEditingDeptPerms: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  savingDept: boolean;
  handleSaveDeptPermissions: (id: string) => Promise<void>;
  newDeptName: string;
  setNewDeptName: (name: string) => void;
  newDeptCode: string;
  setNewDeptCode: (code: string) => void;
  newDeptDesc: string;
  setNewDeptDesc: (desc: string) => void;
  newDeptPerms: Record<string, boolean>;
  setNewDeptPerms: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  creatingDept: boolean;
  handleCreateDepartment: (e: React.FormEvent) => Promise<void>;
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
  if (!showDeptModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
      <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-2xl w-full border border-border animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Briefcase className="w-5 h-5 text-primary" />
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
            <X className="w-4 h-4" />
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

        <div className="flex justify-end pt-2 border-t border-border/60">
          <Button variant="outline" size="sm" onClick={() => setShowDeptModal(false)}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
