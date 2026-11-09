'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

export interface CreateDepartmentFormProps {
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

export function CreateDepartmentForm({
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
}: CreateDepartmentFormProps) {
  return (
    <form
      onSubmit={handleCreateDepartment}
      className="p-4 bg-muted/30 border border-border/80 rounded-xl space-y-4"
    >
      <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
        <Plus className="w-4 h-4" /> Add Custom Department
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="deptName" className="text-xs">
            Department Name
          </Label>
          <Input
            id="deptName"
            placeholder="e.g. Senior Estimator"
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            className="h-9 bg-background"
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="deptCode" className="text-xs">
            Short Code
          </Label>
          <Input
            id="deptCode"
            placeholder="e.g. ESTIMATOR"
            value={newDeptCode}
            onChange={(e) => setNewDeptCode(e.target.value)}
            className="h-9 bg-background uppercase"
            required
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="deptDesc" className="text-xs">
          Description
        </Label>
        <Input
          id="deptDesc"
          placeholder="Responsibilities and scope"
          value={newDeptDesc}
          onChange={(e) => setNewDeptDesc(e.target.value)}
          className="h-9 bg-background"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold">Authorized Feature Access</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-background/50 border border-border/60">
            <input
              type="checkbox"
              checked={newDeptPerms.canCreateQuote}
              onChange={(e) =>
                setNewDeptPerms({ ...newDeptPerms, canCreateQuote: e.target.checked })
              }
              className="rounded accent-primary"
            />
            <span>Can Create &amp; Import Quotes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-background/50 border border-border/60">
            <input
              type="checkbox"
              checked={newDeptPerms.canReviewQuote}
              onChange={(e) =>
                setNewDeptPerms({ ...newDeptPerms, canReviewQuote: e.target.checked })
              }
              className="rounded accent-primary"
            />
            <span>Can Review &amp; Approve Quotes</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-background/50 border border-border/60">
            <input
              type="checkbox"
              checked={newDeptPerms.canAccessOdooQueue}
              onChange={(e) =>
                setNewDeptPerms({ ...newDeptPerms, canAccessOdooQueue: e.target.checked })
              }
              className="rounded accent-primary"
            />
            <span>Can Access Odoo Queue</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-background/50 border border-border/60">
            <input
              type="checkbox"
              checked={newDeptPerms.canMarkOdooEntry}
              onChange={(e) =>
                setNewDeptPerms({ ...newDeptPerms, canMarkOdooEntry: e.target.checked })
              }
              className="rounded accent-primary"
            />
            <span>Can Mark Orders in Odoo</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button type="submit" size="sm" disabled={creatingDept} className="font-bold">
          {creatingDept ? 'Creating...' : 'Create Department'}
        </Button>
      </div>
    </form>
  );
}

