'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, ArrowLeft, Trash2, Power, Edit, ShieldCheck, Briefcase, Settings2, Check, X, Component } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import NotificationBell from '@/components/NotificationBell';
import QuotesBinPill from '@/components/QuotesBinPill';
import SmartBackButton from '@/components/SmartBackButton';
import { toast } from 'sonner';

type UserType = {
  _id: string;
  username: string;
  email?: string;
  role: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  customPermissions?: Record<string, boolean>;
};

type DepartmentType = {
  _id?: string;
  name: string;
  code: string;
  description?: string;
  isSystem?: boolean;
  permissions?: Record<string, boolean>;
};

const PERMISSION_CONFIG = [
  {
    key: 'canCreateQuote',
    label: 'Create & Import Quotes',
    desc: 'Allows access to calculator, PDF upload & quote submission',
    isDeptDefault: (deptCode?: string, role?: string, dept?: DepartmentType) => {
      if (role === 'ADMIN') return true;
      return Boolean(dept?.permissions?.canCreateQuote);
    },
  },
  {
    key: 'canReviewQuote',
    label: 'Review & Approve Quotes',
    desc: 'Approve incoming sales quotes and assign Odoo clerks',
    isDeptDefault: (deptCode?: string, role?: string, dept?: DepartmentType) => {
      if (role === 'ADMIN') return true;
      return Boolean(dept?.permissions?.canReviewQuote);
    },
  },
  {
    key: 'canEditApprovedQuote',
    label: 'Modify Approved Quotes',
    desc: 'Unlock and edit quotes after they have already been approved',
    isDeptDefault: (deptCode?: string, role?: string, dept?: DepartmentType) => {
      if (role === 'ADMIN') return true;
      return Boolean(dept?.permissions?.canEditApprovedQuote);
    },
  },
  {
    key: 'canAccessOdooQueue',
    label: 'Access Odoo Entry Queue',
    desc: 'View approved quotes waiting for Odoo ERP entry',
    isDeptDefault: (deptCode?: string, role?: string, dept?: DepartmentType) => {
      if (role === 'ADMIN') return true;
      return Boolean(deptCode === 'CLERK' || dept?.permissions?.canAccessOdooQueue);
    },
  },
  {
    key: 'canMarkOdooEntry',
    label: 'Mark Quotes as Done in Odoo',
    desc: 'Submit official Odoo SO# and finish assignment',
    isDeptDefault: (deptCode?: string, role?: string, dept?: DepartmentType) => {
      if (role === 'ADMIN') return true;
      return Boolean(deptCode === 'CLERK' || dept?.permissions?.canMarkOdooEntry);
    },
  },
  {
    key: 'canAccessAdmin',
    label: 'Admin Portal Access',
    desc: 'Allows access to backend admin navigation & settings',
    isDeptDefault: (deptCode?: string, role?: string, dept?: DepartmentType) => {
      if (role === 'ADMIN') return true;
      return Boolean(dept?.permissions?.canAccessAdmin);
    },
  },
];

export default function StaffDirectory() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // New User Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [department, setDepartment] = useState('SALES');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editDepartment, setEditDepartment] = useState('');

  // Delete Modal State
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Custom User Permissions Modal State (Superadmin)
  const [userForCustomPerms, setUserForCustomPerms] = useState<UserType | null>(null);
  const [userCustomPerms, setUserCustomPerms] = useState<Record<string, boolean>>({});
  const [savingUserPerms, setSavingUserPerms] = useState(false);

  // Departments Modal State (For Superadmin)
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptCode, setNewDeptCode] = useState('');
  const [newDeptDesc, setNewDeptDesc] = useState('');
  const [newDeptPerms, setNewDeptPerms] = useState<Record<string, boolean>>({
    canCreateQuote: true,
    canReviewQuote: false,
    canApproveQuote: false,
    canEditApprovedQuote: false,
    canAccessOdooQueue: false,
    canMarkOdooEntry: false,
    canAccessAdmin: false,
  });
  const [creatingDept, setCreatingDept] = useState(false);
  const [editingDeptId, setEditingDeptId] = useState<string | null>(null);
  const [editingDeptPerms, setEditingDeptPerms] = useState<Record<string, boolean>>({});
  const [savingDept, setSavingDept] = useState(false);

  const handleSaveDeptPermissions = async (deptId: string) => {
    setSavingDept(true);
    try {
      const res = await fetch('/api/departments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: deptId,
          permissions: editingDeptPerms,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update department');
      toast.success('Department permissions updated successfully!');
      setEditingDeptId(null);
      fetchUsersAndDepts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update department');
    } finally {
      setSavingDept(false);
    }
  };

  const fetchUsersAndDepts = async () => {
    try {
      const [uRes, dRes, pRes] = await Promise.all([
        fetch('/api/users'),
        fetch('/api/departments'),
        fetch('/api/profile'),
      ]);
      const [uData, dData, pData] = await Promise.all([
        uRes.json(),
        dRes.json(),
        pRes.ok ? pRes.json() : null,
      ]);

      if (Array.isArray(uData)) setUsers(uData);
      if (Array.isArray(dData)) setDepartments(dData);
      if (pData) setCurrentProfile(pData);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersAndDepts();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role, email, department }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccess('User created successfully!');
      toast.success(`Account for ${username} created!`);
      setUsername('');
      setPassword('');
      setEmail('');
      setRole('EMPLOYEE');
      setDepartment('SALES');
      fetchUsersAndDepts();
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchUsersAndDepts();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const res = await fetch(`/api/users/${userToDelete}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete user');
      setUserToDelete(null);
      toast.success('User deleted permanently.');
      fetchUsersAndDepts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete user');
      console.error(err);
    }
  };

  const handleOpenCustomPerms = (u: UserType) => {
    setUserForCustomPerms(u);
    const userDept = departments.find(d => d.code === u.department);
    
    // Initialize permissions with current effective values (department defaults + custom overrides)
    const initialPerms: Record<string, boolean> = {};
    PERMISSION_CONFIG.forEach(p => {
      if (u.customPermissions && u.customPermissions[p.key] !== undefined) {
        initialPerms[p.key] = Boolean(u.customPermissions[p.key]);
      } else {
        initialPerms[p.key] = p.isDeptDefault(u.department, u.role, userDept);
      }
    });

    setUserCustomPerms(initialPerms);
  };

  const handleSaveUserCustomPerms = async () => {
    if (!userForCustomPerms) return;
    setSavingUserPerms(true);
    try {
      const res = await fetch(`/api/users/${userForCustomPerms._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customPermissions: userCustomPerms }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update custom permissions');
      toast.success(`Custom permissions updated for ${userForCustomPerms.username}!`);
      setUserForCustomPerms(null);
      fetchUsersAndDepts();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update custom permissions');
    } finally {
      setSavingUserPerms(false);
    }
  };

  const handleSaveRole = async (id: string) => {
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editRole, department: editDepartment }),
      });
      setEditingId(null);
      toast.success('User updated successfully.');
      fetchUsersAndDepts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim() || !newDeptCode.trim()) {
      toast.error('Department name and code are required');
      return;
    }
    setCreatingDept(true);
    try {
      const res = await fetch('/api/departments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDeptName.trim(),
          code: newDeptCode.trim().toUpperCase(),
          description: newDeptDesc.trim(),
          permissions: newDeptPerms,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create department');
      toast.success(`Department "${newDeptName}" created!`);
      setNewDeptName('');
      setNewDeptCode('');
      setNewDeptDesc('');
      fetchUsersAndDepts();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreatingDept(false);
    }
  };

  const isSuperAdmin = currentProfile?.role === 'SUPERADMIN';

  const getDeptBadgeClass = (deptCode?: string) => {
    switch (deptCode) {
      case 'MANAGER':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25';
      case 'CLERK':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/25';
      case 'SALES':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25';
      default:
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/25';
    }
  };

  const getDeptDisplayName = (deptCode?: string) => {
    const match = departments.find(d => d.code === deptCode);
    return match ? match.name : deptCode || 'Sales Associate';
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      {/* Custom Delete Modal Overlay */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="bg-card p-6 rounded-xl shadow-2xl max-w-sm w-full border border-border animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold mb-2 text-foreground">Delete User?</h3>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Are you sure you want to permanently delete this user? This action cannot be undone and will permanently remove their access.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setUserToDelete(null)}>Cancel</Button>
              <Button variant="destructive" onClick={confirmDelete}>Delete Permanently</Button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Custom Permissions Modal (Superadmin) */}
      {userForCustomPerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-lg w-full border border-border animate-in fade-in zoom-in-95 duration-200 space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                  <ShieldCheck className="w-5 h-5 text-purple-500" />
                  Staff Feature Permissions
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Configure feature access and department overrides for <strong className="text-foreground">{userForCustomPerms.username}</strong> ({getDeptDisplayName(userForCustomPerms.department)})
                </p>
              </div>
              <button 
                onClick={() => setUserForCustomPerms(null)} 
                className="text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                <span>Feature Permissions</span>
                <span className="normal-case text-[11px] text-muted-foreground font-normal">Check or uncheck to customize</span>
              </div>

              {PERMISSION_CONFIG.map(item => {
                const userDept = departments.find(d => d.code === userForCustomPerms.department);
                const isDept = item.isDeptDefault(userForCustomPerms.department, userForCustomPerms.role, userDept);
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
                      onChange={e => setUserCustomPerms(prev => ({ ...prev, [item.key]: e.target.checked }))} 
                      className="rounded accent-purple-600 w-4 h-4 mt-0.5" 
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-foreground text-xs">{item.label}</span>
                        {isChecked && isDept && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 whitespace-nowrap">
                            Default ({getDeptDisplayName(userForCustomPerms.department)})
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
              <Button variant="ghost" size="sm" onClick={() => setUserForCustomPerms(null)}>
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleSaveUserCustomPerms} 
                disabled={savingUserPerms}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold cursor-pointer"
              >
                {savingUserPerms ? 'Saving...' : 'Save Permissions'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Departments & Permissions Modal (Superadmin) */}
      {showDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm px-4">
          <div className="bg-card p-6 rounded-2xl shadow-2xl max-w-2xl w-full border border-border animate-in fade-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] space-y-6">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2 text-foreground">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Departments &amp; Roles Management
                </h3>
                <p className="text-xs text-muted-foreground">Manage employee categories and feature permissions.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowDeptModal(false)} className="rounded-full">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* List Existing Departments */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Existing Departments</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {departments.map(d => (
                  <div key={d.code} className="p-3.5 bg-background/60 rounded-xl border border-border/80 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">{d.name}</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getDeptBadgeClass(d.code)}`}>
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
                    {d.description && <p className="text-xs text-muted-foreground leading-relaxed">{d.description}</p>}
                    
                    {editingDeptId === d._id ? (
                      <div className="space-y-2 pt-2 border-t border-border/60">
                        <span className="text-[11px] font-bold text-primary block">Assign Permissions:</span>
                        <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={Boolean(editingDeptPerms.canCreateQuote)} 
                              onChange={e => setEditingDeptPerms({ ...editingDeptPerms, canCreateQuote: e.target.checked })} 
                              className="rounded accent-primary" 
                            />
                            <span>Can Create &amp; Import Quotes</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={Boolean(editingDeptPerms.canReviewQuote)} 
                              onChange={e => setEditingDeptPerms({ ...editingDeptPerms, canReviewQuote: e.target.checked })} 
                              className="rounded accent-primary" 
                            />
                            <span className="font-semibold text-emerald-600">Can Review &amp; Approve Quotes (Like Admin)</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={Boolean(editingDeptPerms.canEditApprovedQuote)} 
                              onChange={e => setEditingDeptPerms({ ...editingDeptPerms, canEditApprovedQuote: e.target.checked })} 
                              className="rounded accent-primary" 
                            />
                            <span className="font-semibold text-amber-600">Can Modify Approved Quotes (Like Admin)</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={Boolean(editingDeptPerms.canAccessOdooQueue)} 
                              onChange={e => setEditingDeptPerms({ ...editingDeptPerms, canAccessOdooQueue: e.target.checked })} 
                              className="rounded accent-primary" 
                            />
                            <span>Can Access Odoo Queue</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={Boolean(editingDeptPerms.canMarkOdooEntry)} 
                              onChange={e => setEditingDeptPerms({ ...editingDeptPerms, canMarkOdooEntry: e.target.checked })} 
                              className="rounded accent-primary" 
                            />
                            <span>Can Mark Orders in Odoo</span>
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={Boolean(editingDeptPerms.canAccessAdmin)} 
                              onChange={e => setEditingDeptPerms({ ...editingDeptPerms, canAccessAdmin: e.target.checked })} 
                              className="rounded accent-primary" 
                            />
                            <span>Can Access Admin Area</span>
                          </label>
                        </div>
                        <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setEditingDeptId(null)}>Cancel</Button>
                          <Button size="sm" className="h-7 text-xs font-bold" disabled={savingDept || !d._id} onClick={() => d._id && handleSaveDeptPermissions(d._id)}>
                            {savingDept ? 'Saving...' : 'Save Permissions'}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {d.permissions?.canCreateQuote && <span className="text-[9px] bg-muted px-1.5 py-0.5 rounded">Create Quotes</span>}
                        {d.permissions?.canReviewQuote && <span className="text-[9px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.5 rounded">Review &amp; Approve</span>}
                        {d.permissions?.canEditApprovedQuote && <span className="text-[9px] bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded">Modify Approved</span>}
                        {d.permissions?.canAccessOdooQueue && <span className="text-[9px] bg-indigo-500/10 text-indigo-600 px-1.5 py-0.5 rounded">Odoo Queue</span>}
                        {d.permissions?.canMarkOdooEntry && <span className="text-[9px] bg-indigo-500/10 text-indigo-600 px-1.5 py-0.5 rounded">Mark in Odoo</span>}
                        {d.permissions?.canAccessAdmin && <span className="text-[9px] bg-purple-500/10 text-purple-600 px-1.5 py-0.5 rounded">Admin Access</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Create Custom Department Form (Superadmin) */}
            {isSuperAdmin && (
              <form onSubmit={handleCreateDepartment} className="p-4 bg-muted/30 border border-border/80 rounded-xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Add Custom Department
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="deptName" className="text-xs">Department Name</Label>
                    <Input id="deptName" placeholder="e.g. Senior Estimator" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} className="h-9 bg-background" required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="deptCode" className="text-xs">Short Code</Label>
                    <Input id="deptCode" placeholder="e.g. ESTIMATOR" value={newDeptCode} onChange={e => setNewDeptCode(e.target.value)} className="h-9 bg-background uppercase" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="deptDesc" className="text-xs">Description</Label>
                  <Input id="deptDesc" placeholder="Responsibilities and scope" value={newDeptDesc} onChange={e => setNewDeptDesc(e.target.value)} className="h-9 bg-background" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Authorized Feature Access</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-background/50 border border-border/60">
                      <input type="checkbox" checked={newDeptPerms.canCreateQuote} onChange={e => setNewDeptPerms({ ...newDeptPerms, canCreateQuote: e.target.checked })} className="rounded accent-primary" />
                      <span>Can Create &amp; Import Quotes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-background/50 border border-border/60">
                      <input type="checkbox" checked={newDeptPerms.canReviewQuote} onChange={e => setNewDeptPerms({ ...newDeptPerms, canReviewQuote: e.target.checked })} className="rounded accent-primary" />
                      <span>Can Review &amp; Approve Quotes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-background/50 border border-border/60">
                      <input type="checkbox" checked={newDeptPerms.canAccessOdooQueue} onChange={e => setNewDeptPerms({ ...newDeptPerms, canAccessOdooQueue: e.target.checked })} className="rounded accent-primary" />
                      <span>Can Access Odoo Queue</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg bg-background/50 border border-border/60">
                      <input type="checkbox" checked={newDeptPerms.canMarkOdooEntry} onChange={e => setNewDeptPerms({ ...newDeptPerms, canMarkOdooEntry: e.target.checked })} className="rounded accent-primary" />
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
            )}

            <div className="flex justify-end pt-2 border-t border-border/60">
              <Button variant="outline" size="sm" onClick={() => setShowDeptModal(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1650px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10 space-y-8">
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <SmartBackButton fallbackUrl="/admin" label="Back to Admin" />
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-primary hover:opacity-80 transition-opacity cursor-pointer group"
              title="Window & Door Store - Home / Calculator"
            >
              <Component className="w-6 h-6 transition-transform group-hover:scale-105" />
              <span className="text-xl font-semibold tracking-wider uppercase">Window &amp; Door Store</span>
            </Link>
            <span className="text-muted-foreground/40 hidden sm:inline">/</span>
            <div className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-5 h-5 text-primary" />
              <span className="text-base font-semibold tracking-wider uppercase">Staff Directory</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <QuotesBinPill />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowDeptModal(true)}
              className="gap-2 border-primary/40 text-primary hover:bg-primary/10 text-xs font-semibold cursor-pointer"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Departments &amp; Permissions</span>
            </Button>
            <NotificationBell />
            <ThemeToggle />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Create User Form */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Plus className="w-5 h-5 text-primary" />
                  Add New Staff
                </CardTitle>
                <CardDescription>Assign department, role, and credentials.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dept">Department / Category</Label>
                    <select
                      id="dept"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                    >
                      {departments.map(d => (
                        <option key={d.code} value={d.code}>
                          {d.name} ({d.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">System Role</Label>
                    <select
                      id="role"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="EMPLOYEE">Employee (Standard Access)</option>
                      <option value="ADMIN">Admin (Prices, Staff &amp; Reviews)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      required 
                      className="bg-background"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input 
                      id="email" 
                      type="email"
                      className="bg-background"
                      value={email}
                      placeholder="employee@company.com"
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Temporary Password</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      required 
                      className="bg-background"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  
                  {error && <div className="text-sm text-destructive font-medium">{error}</div>}
                  {success && <div className="text-sm text-emerald-500 font-medium">{success}</div>}
                  
                  <Button type="submit" className="w-full mt-2 font-bold cursor-pointer">Create Account</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* User List */}
          <div className="lg:col-span-8 space-y-6">
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
                    {users.map(user => {
                      const currentUserId = currentProfile?._id || currentProfile?.id;
                      const isSelf = user._id === currentUserId || user.username?.toLowerCase() === currentProfile?.username?.toLowerCase();
                      const hasCustomPerms = user.customPermissions && Object.values(user.customPermissions).some(Boolean);

                      return (
                        <div key={user._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background/50 rounded-lg border border-border gap-4 transition-colors hover:border-primary/30">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${user.isActive ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold flex items-center gap-2">
                                {user.username}
                                {isSelf && <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 rounded-full font-bold">You</span>}
                                {!user.isActive && <span className="text-[10px] bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Deactivated</span>}
                                {hasCustomPerms && <span className="text-[9px] bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 px-1.5 py-0.5 rounded-md font-semibold">Custom Access</span>}
                              </div>
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {user.email ? user.email : 'No email'} • Joined {new Date(user.createdAt).toLocaleDateString()}
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
                                  {departments.map(d => (
                                    <option key={d.code} value={d.code}>{d.name}</option>
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
                                <Button size="sm" onClick={() => handleSaveRole(user._id)}>Save</Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                              </div>
                            ) : (
                              <>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border ${getDeptBadgeClass(user.department)}`}>
                                  {getDeptDisplayName(user.department)}
                                </span>
                                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                  user.role === 'ADMIN' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                  'bg-muted text-muted-foreground border border-border'
                                }`}>
                                  {user.role}
                                </span>
                                <Button variant="ghost" size="icon" onClick={() => { setEditingId(user._id); setEditRole(user.role); setEditDepartment(user.department || 'SALES'); }} className="h-8 w-8 ml-1 hover:bg-primary/10 hover:text-primary" title="Edit Role & Department">
                                  <Edit className="w-4 h-4" />
                                </Button>
                                {isSuperAdmin && (
                                  <Button variant="ghost" size="icon" onClick={() => handleOpenCustomPerms(user)} className="h-8 w-8 hover:bg-purple-500/10 hover:text-purple-500" title="Custom Permissions">
                                    <ShieldCheck className="w-4 h-4 text-purple-500" />
                                  </Button>
                                )}
                                {!isSelf && (
                                  <>
                                    <Button variant="ghost" size="icon" onClick={() => handleToggleActive(user._id, user.isActive !== undefined ? user.isActive : true)} className="h-8 w-8 hover:bg-amber-500/10 hover:text-amber-500" title={user.isActive !== false ? "Deactivate User" : "Activate User"}>
                                      <Power className={`w-4 h-4 ${user.isActive !== false ? 'text-amber-500' : 'text-emerald-500'}`} />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => setUserToDelete(user._id)} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive" title="Delete User">
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
                      <div className="text-muted-foreground text-sm text-center py-8 border border-dashed border-border rounded-xl">No staff members found.</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
