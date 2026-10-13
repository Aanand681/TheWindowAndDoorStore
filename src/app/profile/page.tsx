'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCircle, ArrowLeft, ShieldCheck, Mail, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/profile');
        if (res.ok) {
          const data = await res.json();
          setUsername(data.username || '');
          setEmail(data.email || '');
          setRole(data.role || '');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (newPassword && newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          email, 
          currentPassword: currentPassword || undefined, 
          newPassword: newPassword || undefined 
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      
      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10 space-y-8">
        <header className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button onClick={() => router.back()} variant="outline" size="icon" className="rounded-full bg-card/50 backdrop-blur">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="inline-flex items-center gap-2 text-primary">
              <UserCircle className="w-6 h-6" />
              <span className="text-xl font-semibold tracking-wider uppercase">My Profile</span>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <Card className="bg-card/50 border-border backdrop-blur-xl shadow-xl max-w-2xl mx-auto">
          <CardHeader className="border-b border-border pb-6">
            <CardTitle className="text-2xl flex items-center gap-2">
              Account Settings
            </CardTitle>
            <CardDescription>Update your personal information and password.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {role && role !== 'SUPERADMIN' && (
              <div className="mb-8 flex items-center gap-3 bg-muted/50 p-4 rounded-lg border border-border">
                <ShieldCheck className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Current Role Level</p>
                  <p className="font-bold tracking-wider">{role}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-lg">
                  <UserCircle className="w-5 h-5 text-muted-foreground" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input 
                      id="username" 
                      value={username} 
                      onChange={(e) => setUsername(e.target.value)} 
                      required 
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Recovery Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="email" 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        placeholder="you@example.com"
                        className="bg-background pl-9"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-6 space-y-4">
                <h3 className="font-semibold flex items-center gap-2 text-lg">
                  <KeyRound className="w-5 h-5 text-muted-foreground" />
                  Change Password
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Leave these fields blank if you do not want to change your password.</p>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      type="password" 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)} 
                      className="bg-background"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input 
                        id="newPassword" 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword" 
                        type="password" 
                        value={confirmPassword} 
                        onChange={(e) => setConfirmPassword(e.target.value)} 
                        className="bg-background"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {message.text && (
                <div className={`p-3 rounded text-sm font-medium border ${message.type === 'error' ? 'bg-destructive/10 text-destructive border-destructive/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
                  {message.text}
                </div>
              )}

              <Button type="submit" disabled={saving} className="w-full md:w-auto">
                {saving ? 'Saving Changes...' : 'Save Profile Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
