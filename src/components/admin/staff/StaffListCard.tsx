"use client"

import React from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Power, ShieldCheck, Trash2 } from "lucide-react"
import { UserType, DepartmentType } from "./types"
import { getDeptBadgeClass, getDeptDisplayName } from "./staff-utils"

export interface StaffListCardProps {
  users: UserType[]
  departments: DepartmentType[]
  currentProfile: any
  loading: boolean
  editingId: string | null
  setEditingId: (id: string | null) => void
  editRole: string
  setEditRole: (role: string) => void
  editDepartment: string
  setEditDepartment: (dept: string) => void
  handleSaveRole: (id: string) => Promise<void>
  handleOpenCustomPerms: (u: UserType) => void
  handleToggleActive: (id: string, currentStatus: boolean) => Promise<void>
  setUserToDelete: (id: string | null) => void
  isSuperAdmin: boolean
}

export function StaffListCard({
  users,
  departments,
  currentProfile,
  loading,
  editingId,
  setEditingId,
  editRole,
  setEditRole,
  editDepartment,
  setEditDepartment,
  handleSaveRole,
  handleOpenCustomPerms,
  handleToggleActive,
  setUserToDelete,
  isSuperAdmin,
}: StaffListCardProps) {
  return (
    <Card className="border-border bg-card/50 shadow-xl backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-xl">Active Staff Members</CardTitle>
        <CardDescription>
          View assigned department roles and edit employee access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading staff...</div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => {
              const currentUserId = currentProfile?._id || currentProfile?.id
              const isSelf =
                user._id === currentUserId ||
                user.username?.toLowerCase() ===
                  currentProfile?.username?.toLowerCase()
              const hasCustomPerms =
                user.customPermissions &&
                Object.values(user.customPermissions).some(Boolean)

              return (
                <div
                  key={user._id}
                  className="flex flex-col justify-between gap-4 rounded-lg border border-border bg-background/50 p-4 transition-colors hover:border-primary/30 sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full font-bold ${
                        user.isActive
                          ? "bg-primary/10 text-primary"
                          : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 font-semibold">
                        {user.username}
                        {isSelf && (
                          <span className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                            You
                          </span>
                        )}
                        {!user.isActive && (
                          <span className="rounded-full border border-destructive/20 bg-destructive/10 px-2 py-0.5 text-[10px] font-bold tracking-wider text-destructive uppercase">
                            Deactivated
                          </span>
                        )}
                        {hasCustomPerms && (
                          <span className="rounded-md border border-purple-500/30 bg-purple-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-purple-600 dark:text-purple-400">
                            Custom Access
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {user.email ? user.email : "No email"} • Joined{" "}
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {editingId === user._id ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                          value={editDepartment}
                          onChange={(e) => setEditDepartment(e.target.value)}
                        >
                          {departments.map((d) => (
                            <option key={d.code} value={d.code}>
                              {d.name}
                            </option>
                          ))}
                        </select>
                        <select
                          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                        >
                          <option value="EMPLOYEE">EMPLOYEE</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                        <Button
                          size="sm"
                          onClick={() => handleSaveRole(user._id)}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span
                          className={`rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${getDeptBadgeClass(
                            user.department
                          )}`}
                        >
                          {getDeptDisplayName(departments, user.department)}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase ${
                            user.role === "ADMIN"
                              ? "border border-blue-500/20 bg-blue-500/10 text-blue-500"
                              : "border border-border bg-muted text-muted-foreground"
                          }`}
                        >
                          {user.role}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingId(user._id)
                            setEditRole(user.role)
                            setEditDepartment(user.department || "SALES")
                          }}
                          className="ml-1 h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          title="Edit Role & Department"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {isSuperAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenCustomPerms(user)}
                            className="h-8 w-8 hover:bg-purple-500/10 hover:text-purple-500"
                            title="Custom Permissions"
                          >
                            <ShieldCheck className="h-4 w-4 text-purple-500" />
                          </Button>
                        )}
                        {!isSelf && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                handleToggleActive(
                                  user._id,
                                  user.isActive !== undefined
                                    ? user.isActive
                                    : true
                                )
                              }
                              className="h-8 w-8 hover:bg-amber-500/10 hover:text-amber-500"
                              title={
                                user.isActive !== false
                                  ? "Deactivate User"
                                  : "Activate User"
                              }
                            >
                              <Power
                                className={`h-4 w-4 ${
                                  user.isActive !== false
                                    ? "text-amber-500"
                                    : "text-emerald-500"
                                }`}
                              />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setUserToDelete(user._id)}
                              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                              title="Delete User"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
            {users.length === 0 && (
              <div className="rounded-xl border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                No staff members found.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
