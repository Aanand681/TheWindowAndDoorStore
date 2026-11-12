"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { DepartmentType } from "./types"
import { getDeptBadgeClass } from "./staff-utils"

export interface ExistingDepartmentsListProps {
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
      <h4 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
        Existing Departments
      </h4>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {departments.map((d) => (
          <div
            key={d.code}
            className="space-y-2 rounded-xl border border-border/80 bg-background/60 p-3.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">
                {d.name}
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getDeptBadgeClass(
                    d.code
                  )}`}
                >
                  {d.code}
                </span>
                {isSuperAdmin && editingDeptId !== d._id && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingDeptId(d._id || null)
                      setEditingDeptPerms({ ...(d.permissions || {}) })
                    }}
                    className="ml-1 cursor-pointer text-[10px] font-semibold text-primary hover:underline"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
            {d.description && (
              <p className="text-xs leading-relaxed text-muted-foreground">
                {d.description}
              </p>
            )}

            {editingDeptId === d._id ? (
              <div className="space-y-2 border-t border-border/60 pt-2">
                <span className="block text-[11px] font-bold text-primary">
                  Assign Permissions:
                </span>
                <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                  <label className="flex cursor-pointer items-center gap-1.5">
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
                  <label className="flex cursor-pointer items-center gap-1.5">
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
                  <label className="flex cursor-pointer items-center gap-1.5">
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
                  <label className="flex cursor-pointer items-center gap-1.5">
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
                  <label className="flex cursor-pointer items-center gap-1.5">
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
                  <label className="flex cursor-pointer items-center gap-1.5">
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
                <div className="flex justify-end gap-2 border-t border-border/40 pt-2">
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
                    {savingDept ? "Saving..." : "Save Permissions"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-1 pt-1">
                {d.permissions?.canCreateQuote && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[9px]">
                    Create Quotes
                  </span>
                )}
                {d.permissions?.canReviewQuote && (
                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] text-emerald-600">
                    Review &amp; Approve
                  </span>
                )}
                {d.permissions?.canEditApprovedQuote && (
                  <span className="rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] text-amber-600">
                    Modify Approved
                  </span>
                )}
                {d.permissions?.canAccessOdooQueue && (
                  <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[9px] text-indigo-600">
                    Odoo Queue
                  </span>
                )}
                {d.permissions?.canMarkOdooEntry && (
                  <span className="rounded bg-indigo-500/10 px-1.5 py-0.5 text-[9px] text-indigo-600">
                    Mark in Odoo
                  </span>
                )}
                {d.permissions?.canAccessAdmin && (
                  <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-[9px] text-purple-600">
                    Admin Access
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
