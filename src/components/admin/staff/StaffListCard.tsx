'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, Power, ShieldCheck, Trash2 } from 'lucide-react';
import { UserType, DepartmentType } from './types';
import { getDeptBadgeClass, getDeptDisplayName } from './staff-utils';

export interface StaffListCardProps {
  users: UserType[];
  departments: DepartmentType[];
  currentProfile: any;
  loading: boolean;
  editingId: string | null;
  setEditingId: (id: string | null) => void;
  editRole: string;
  setEditRole: (role: string) => void;
  editDepartment: string;
  setEditDepartment: (dept: string) => void;
  handleSaveRole: (id: string) => Promise<void>;
  handleOpenCustomPerms: (u: UserType) => void;
  handleToggleActive: (id: string, currentStatus: boolean) => Promise<void>;
  setUserToDelete: (id: string | null) => void;
  isSuperAdmin: boolean;
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
    <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
      <CardHeader>
        <CardTitle className="text-xl">Active Staff Members</CardTitle>
        <CardDescription>View assigned department roles and edit employee access.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-muted-foreground text-sm">Loading staff...</div>
        ) : (
          <div className="space-y-3">
            {users.map((user) => {
              const currentUserId = currentProfile?._id || currentProfile?.id;
              const isSelf =
                user._id === currentUserId ||
                user.username?.toLowerCase() === currentProfile?.username?.toLowerCase();
              const hasCustomPerms =
                user.customPermissions && Object.values(user.customPermissions).some(Boolean);

              return (
                <div
                  key={user._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background/50 rounded-lg border border-border gap-4 transition-colors hover:border-primary/30"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                        user.isActive
                          ? 'bg-primary/10 text-primary'
                          : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold flex items-center gap-2">
                        {user.username}
                        {isSelf && (
                          <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">
                            You
                          </span>
                        )}
                        {!user.isActive && (
                          <span className="text-[10px] bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                            Deactivated
                          </span>
                        )}
                        {hasCustomPerms && (
                          <span className="text-[9px] bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded-md font-semibold">
                            Custom Access
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {user.email ? user.email : 'No email'} • Joined{' '}
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {editingId === user._id ? (
                      <div className="flex items-center gap-2 flex-wrap">
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
                        <Button size="sm" onClick={() => handleSaveRole(user._id)}>
                          Save
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${getDeptBadgeClass(
                            user.department
                          )}`}
                        >
                          {getDeptDisplayName(departments, user.department)}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                            user.role === 'ADMIN'
                              ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                              : 'bg-muted text-muted-foreground border border-border'
                          }`}
                        >
                          {user.role}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingId(user._id);
                            setEditRole(user.role);
                            setEditDepartment(user.department || 'SALES');
                          }}
                          className="h-8 w-8 ml-1 hover:bg-primary/10 hover:text-primary"
                          title="Edit Role & Department"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {isSuperAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenCustomPerms(user)}
                            className="h-8 w-8 hover:bg-purple-500/10 hover:text-purple-500"
                            title="Custom Permissions"
                          >
                            <ShieldCheck className="w-4 h-4 text-purple-500" />
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
                                  user.isActive !== undefined ? user.isActive : true
                                )
                              }
                              className="h-8 w-8 hover:bg-amber-500/10 hover:text-amber-500"
                              title={user.isActive !== false ? 'Deactivate User' : 'Activate User'}
                            >
                              <Power
                                className={`w-4 h-4 ${
                                  user.isActive !== false ? 'text-amber-500' : 'text-emerald-500'
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
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {users.length === 0 && (
              <div className="text-muted-foreground text-sm text-center py-8 border border-dashed border-border rounded-xl">
                No staff members found.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

