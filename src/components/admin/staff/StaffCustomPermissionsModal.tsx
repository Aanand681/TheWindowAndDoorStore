"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ShieldCheck, X } from "lucide-react"
import { UserType, DepartmentType, PERMISSION_CONFIG } from "./types"
import { getDeptDisplayName } from "./staff-utils"

export interface StaffCustomPermissionsModalProps {
  userForCustomPerms: UserType | null
  departments: DepartmentType[]
  userCustomPerms: Record<string, boolean>
  setUserCustomPerms: React.Dispatch<
    React.SetStateAction<Record<string, boolean>>
  >
  savingUserPerms: boolean
  onClose: () => void
  onSave: () => Promise<void>
}

export function StaffCustomPermissionsModal({
  userForCustomPerms,
  departments,
  userCustomPerms,
  setUserCustomPerms,
  savingUserPerms,
  onClose,
  onSave,
}: StaffCustomPermissionsModalProps) {
  if (!userForCustomPerms) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-lg animate-in space-y-4 overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl duration-200 zoom-in-95 fade-in">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <ShieldCheck className="h-5 w-5" />
            <h3 className="text-lg font-bold">Customize Staff Permissions</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">
            Overriding permissions for{" "}
            <strong className="text-foreground">
              {userForCustomPerms.username}
            </strong>
          </p>
          <p className="text-xs text-muted-foreground">
            Department:{" "}
            {getDeptDisplayName(departments, userForCustomPerms.department)} (
            {userForCustomPerms.role})
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between pb-1 text-xs font-bold tracking-wider text-muted-foreground uppercase">
            <span>Granular Capability</span>
            <span className="text-[11px] font-normal text-muted-foreground normal-case">
              Check or uncheck to customize
            </span>
          </div>

          {PERMISSION_CONFIG.map((item) => {
            const userDept = departments.find(
              (d) => d.code === userForCustomPerms.department
            )
            const isDept = item.isDeptDefault(
              userForCustomPerms.department,
              userForCustomPerms.role,
              userDept
            )
            const isChecked = Boolean(userCustomPerms[item.key])

            return (
              <label
                key={item.key}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-all ${
                  isChecked
                    ? isDept
                      ? "border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500/50"
                      : "border-purple-500/30 bg-purple-500/5 hover:border-purple-500/50"
                    : "border-border/60 bg-background/40 opacity-70 hover:border-border hover:opacity-100"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) =>
                    setUserCustomPerms((prev) => ({
                      ...prev,
                      [item.key]: e.target.checked,
                    }))
                  }
                  className="mt-0.5 h-4 w-4 rounded accent-purple-600"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-foreground">
                      {item.label}
                    </span>
                    {isChecked && isDept && (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                        Default (
                        {getDeptDisplayName(
                          departments,
                          userForCustomPerms.department
                        )}
                        )
                      </span>
                    )}
                    {isChecked && !isDept && (
                      <span className="rounded-full border border-purple-500/30 bg-purple-500/15 px-2 py-0.5 text-[10px] font-bold whitespace-nowrap text-purple-600 dark:text-purple-400">
                        Custom Granted
                      </span>
                    )}
                    {!isChecked && (
                      <span className="rounded-full border border-border/50 bg-muted/60 px-2 py-0.5 text-[10px] font-medium whitespace-nowrap text-muted-foreground">
                        Disabled
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    {item.desc}
                  </div>
                </div>
              </label>
            )
          })}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/60 pt-3">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={savingUserPerms}
            className="cursor-pointer bg-purple-600 font-semibold text-white hover:bg-purple-700"
          >
            {savingUserPerms ? "Saving..." : "Save Permissions"}
          </Button>
        </div>
      </div>
    </div>
  )
}
