'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { DepartmentType } from './types';
import { getDeptBadgeClass } from './staff-utils';

export interface ExistingDepartmentsListProps {
  departments: DepartmentType[];
  isSuperAdmin: boolean;
  editingDeptId: string | null;
  setEditingDeptId: (id: string | null) => void;
  editingDeptPerms: Record<string, boolean>;
  setEditingDeptPerms: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  savingDept: boolean;
  handleSaveDeptPermissions: (id: string) => Promise<void>;
}

export function ExistingDepartmentsList({
  departments,
  isSuperAdmin,
  editingDeptId,
  setEditingDeptId,
  editingDeptPerms,
  setEditingDeptPerms,
  savingDept,
  handleSaveDeptPermissions,
}: ExistingDepartmentsListProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
        Existing Departments
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {departments.map((d) => (
          <div
            key={d.code}
            className="p-3.5 bg-background/60 rounded-xl border border-border/80 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">{d.name}</span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDeptBadgeClass(
                    d.code
                  )}`}
                >
                  {d.code}
                </span>
                {isSuperAdmin && editingDeptId !== d._id && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDeptId(d._id || null);
                      setEditingDeptPerms({ ...(d.permissions || {}) });
                    }}
                    className="text-[10px] text-primary hover:underline font-semibold cursor-pointer ml-1"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
            {d.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">{d.description}</p>
            )}

            {editingDeptId === d._id ? (
              <div className="space-y-2 pt-2 border-t border-border/60">
                <span className="text-[11px] font-bold text-primary block">
                  Assign Permissions:
                </span>
                <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingDeptPerms.canCreateQuote)}
                      onChange={(e) =>
                        setEditingDeptPerms({
                          ...editingDeptPerms,
                          canCreateQuote: e.target.checked,
                        })
                      }
                      className="rounded accent-primary"
                    />
                    <span>Can Create &amp; Import Quotes</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingDeptPerms.canReviewQuote)}
                      onChange={(e) =>
                        setEditingDeptPerms({
                          ...editingDeptPerms,
                          canReviewQuote: e.target.checked,
                        })
                      }
                      className="rounded accent-primary"
                    />
                    <span className="font-semibold text-emerald-600">
                      Can Review &amp; Approve Quotes (Like Admin)
                    </span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingDeptPerms.canEditApprovedQuote)}
                      onChange={(e) =>
                        setEditingDeptPerms({
                          ...editingDeptPerms,
                          canEditApprovedQuote: e.target.checked,
                        })
                      }
                      className="rounded accent-primary"
                    />
                    <span className="font-semibold text-amber-600">
                      Can Modify Approved Quotes (Like Admin)
                    </span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingDeptPerms.canAccessOdooQueue)}
                      onChange={(e) =>
                        setEditingDeptPerms({
                          ...editingDeptPerms,
                          canAccessOdooQueue: e.target.checked,
                        })
                      }
                      className="rounded accent-primary"
                    />
                    <span>Can Access Odoo Queue</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingDeptPerms.canMarkOdooEntry)}
                      onChange={(e) =>
                        setEditingDeptPerms({
                          ...editingDeptPerms,
                          canMarkOdooEntry: e.target.checked,
                        })
                      }
                      className="rounded accent-primary"
                    />
                    <span>Can Mark Orders in Odoo</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(editingDeptPerms.canAccessAdmin)}
                      onChange={(e) =>
                        setEditingDeptPerms({
                          ...editingDeptPerms,
                          canAccessAdmin: e.target.checked,
                        })
                      }
                      className="rounded accent-primary"
                    />
                    <span>Can Access Admin Area</span>
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-xs"
                    onClick={() => setEditingDeptId(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 text-xs font-bold"
                    disabled={savingDept || !d._id}
                    onClick={() => d._id && handleSaveDeptPermissions(d._id)}
                  >
                    {savingDept ? 'Saving...' : 'Save Permissions'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1 pt-1">
                {d.permissions?.canCreateQuote && (
                  <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded">
                    Create Quotes
                  </span>
                )}
                {d.permissions?.canReviewQuote && (
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded">
                    Review &amp; Approve
                  </span>
                )}
                {d.permissions?.canEditApprovedQuote && (
                  <span className="text-[9px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded">
                    Modify Approved
                  </span>
                )}
                {d.permissions?.canAccessOdooQueue && (
                  <span className="text-[9px] bg-indigo-500/10 text-indigo-600 px-1.5 py-0.5 rounded">
                    Odoo Queue
                  </span>
                )}
                {d.permissions?.canMarkOdooEntry && (
                  <span className="text-[9px] bg-indigo-500/10 text-indigo-600 px-1.5 py-0.5 rounded">
                    Mark in Odoo
                  </span>
                )}
                {d.permissions?.canAccessAdmin && (
                  <span className="text-[9px] bg-purple-500/10 text-purple-600 px-1.5 py-0.5 rounded">
                    Admin Access
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

