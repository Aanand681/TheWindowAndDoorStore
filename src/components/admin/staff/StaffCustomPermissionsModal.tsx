'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ShieldCheck, X } from 'lucide-react';
import { UserType, DepartmentType, PERMISSION_CONFIG } from './types';
import { getDeptDisplayName } from './staff-utils';

export interface StaffCustomPermissionsModalProps {
  userForCustomPerms: UserType | null;
  departments: DepartmentType[];
  userCustomPerms: Record<string, boolean>;
  setUserCustomPerms: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  savingUserPerms: boolean;
  onClose: () => void;
  onSave: () => Promise<void>;
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
  if (!userForCustomPerms) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
      <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-lg w-full border border-border animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] space-y-4">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-lg font-bold">Customize Staff Permissions</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">
            Overriding permissions for{' '}
            <strong className="text-foreground">{userForCustomPerms.username}</strong>
          </p>
          <p className="text-xs text-muted-foreground">
            Department: {getDeptDisplayName(departments, userForCustomPerms.department)} (
            {userForCustomPerms.role})
          </p>
        </div>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted-foreground pb-1">
            <span>Granular Capability</span>
            <span className="normal-case text-[11px] text-muted-foreground font-normal">
              Check or uncheck to customize
            </span>
          </div>

          {PERMISSION_CONFIG.map((item) => {
            const userDept = departments.find((d) => d.code === userForCustomPerms.department);
            const isDept = item.isDeptDefault(
              userForCustomPerms.department,
              userForCustomPerms.role,
              userDept
            );
            const isChecked = Boolean(userCustomPerms[item.key]);

            return (
              <label
                key={item.key}
                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  isChecked
                    ? isDept
                      ? 'bg-emerald-500/5 border-emerald-500/30 hover:border-emerald-500/50'
                      : 'bg-purple-500/5 border-purple-500/30 hover:border-purple-500/50'
                    : 'bg-background/40 border-border/60 hover:border-border opacity-70 hover:opacity-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) =>
                    setUserCustomPerms((prev) => ({ ...prev, [item.key]: e.target.checked }))
                  }
                  className="rounded accent-purple-600 w-4 h-4 mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-foreground text-xs">{item.label}</span>
                    {isChecked && isDept && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                        Default ({getDeptDisplayName(departments, userForCustomPerms.department)})
                      </span>
                    )}
                    {isChecked && !isDept && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 whitespace-nowrap">
                        Custom Granted
                      </span>
                    )}
                    {!isChecked && (
                      <span className="text-[10px] text-muted-foreground font-medium px-2 py-0.5 rounded-full bg-muted/60 border border-border/50 whitespace-nowrap">
                        Disabled
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{item.desc}</div>
                </div>
              </label>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onSave}
            disabled={savingUserPerms}
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold cursor-pointer"
          >
            {savingUserPerms ? 'Saving...' : 'Save Permissions'}
          </Button>
        </div>
      </div>
    </div>
  );
}

