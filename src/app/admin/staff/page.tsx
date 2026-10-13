'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Users, Plus, ArrowLeft, Trash2, Power, Edit } from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

type UserType = {
  _id: string;
  username: string;
  email?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

export default function StaffDirectory() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New User Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState('');

  // Delete Modal State
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, role, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setSuccess('User created successfully!');
      setUsername('');
      setPassword('');
      setEmail('');
      setRole('EMPLOYEE');
      fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      await fetch(`/api/users/${userToDelete}`, { method: 'DELETE' });
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveRole = async (id: string) => {
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: editRole }),
      });
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
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

      <div className="max-w-7xl mx-auto px-4 py-12 relative z-10 space-y-8">
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="outline" size="icon" className="rounded-full bg-card/50 backdrop-blur">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="inline-flex items-center gap-2 text-primary">
              <Users className="w-6 h-6" />
              <span className="text-xl font-semibold tracking-wider uppercase">Staff Directory</span>
            </div>
          </div>
          <ThemeToggle />
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
                <CardDescription>Create a new employee or admin account.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="EMPLOYEE">Employee (Standard Access)</option>
                      <option value="ADMIN">Admin (Prices & Staff)</option>
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

                  {role === 'ADMIN' && (
                    <div className="space-y-2">
                      <Label htmlFor="email">Recovery Email (Optional)</Label>
                      <Input 
                        id="email" 
                        type="email"
                        className="bg-background"
                        value={email}
                        placeholder="admin@company.com"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  )}

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
                  
                  <Button type="submit" className="w-full mt-2">Create Account</Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* User List */}
          <div className="lg:col-span-8 space-y-6">
            <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl">
              <CardHeader>
                <CardTitle className="text-xl">Active Staff Members</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-muted-foreground text-sm">Loading staff...</div>
                ) : (
                  <div className="space-y-3">
                    {users.map(user => (
                      <div key={user._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-background/50 rounded-lg border border-border gap-4 transition-colors hover:border-primary/30">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${user.isActive ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}`}>
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold flex items-center gap-2">
                              {user.username}
                              {!user.isActive && <span className="text-[10px] bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Deactivated</span>}
                            </div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {user.email ? user.email : 'No email'} • Joined {new Date(user.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {editingId === user._id ? (
                            <div className="flex items-center gap-2">
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
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                                user.role === 'ADMIN' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                                'bg-muted text-muted-foreground border border-border'
                              }`}>
                                {user.role}
                              </span>
                              <Button variant="ghost" size="icon" onClick={() => { setEditingId(user._id); setEditRole(user.role); }} className="h-8 w-8 ml-2 hover:bg-primary/10 hover:text-primary">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleToggleActive(user._id, user.isActive !== undefined ? user.isActive : true)} className="h-8 w-8 hover:bg-amber-500/10 hover:text-amber-500">
                                <Power className={`w-4 h-4 ${user.isActive !== false ? 'text-amber-500' : 'text-emerald-500'}`} />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => setUserToDelete(user._id)} className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
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
