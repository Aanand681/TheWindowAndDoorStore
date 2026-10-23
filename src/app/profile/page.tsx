'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserCircle, ArrowLeft, ShieldCheck, Mail, KeyRound, Component, Calculator } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import NotificationBell from '@/components/NotificationBell';
import QuotesBinPill from '@/components/QuotesBinPill';
import SmartBackButton from '@/components/SmartBackButton';

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Profile State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [landingPage, setLandingPage] = useState('calculator');
  const [muteNotifications, setMuteNotifications] = useState(false);
  const [receiveQuoteEmails, setReceiveQuoteEmails] = useState(true);
  
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
          setLandingPage(data.landingPage || 'calculator');
          setMuteNotifications(Boolean(data.muteNotifications));
          setReceiveQuoteEmails(data.receiveQuoteEmails !== false);
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
          landingPage,
          muteNotifications,
          receiveQuoteEmails,
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
          <div className="flex items-center gap-3 flex-wrap">
            <SmartBackButton fallbackUrl="/" label="Back" />
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
              <UserCircle className="w-5 h-5 text-primary" />
              <span className="text-base font-semibold tracking-wider uppercase">My Profile</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <QuotesBinPill />
            <NotificationBell />
            <ThemeToggle />
          </div>
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
                  <div className="space-y-2 col-span-full">
                    <Label htmlFor="landingPage">Default Landing Page Upon Login</Label>
                    <select
                      id="landingPage"
                      value={landingPage}
                      onChange={(e) => setLandingPage(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="calculator">Promo Calculator (/)</option>
                      <option value="quotes">Quote Review & Bin (/quotes)</option>
                      {(role === 'ADMIN' || role === 'SUPERADMIN') && (
                        <option value="admin">Admin Dashboard (/admin)</option>
                      )}
                    </select>
                    <p className="text-xs text-muted-foreground">Choose where you automatically land right after logging in.</p>
                  </div>

                  <div className="space-y-3 col-span-full pt-2">
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border">
                      <div className="space-y-0.5 pr-4">
                        <Label htmlFor="emailNotif" className="text-sm font-semibold cursor-pointer">
                          Receive Quote Notification Emails
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Receive email alerts when quotes are assigned to you for review, approved, or modified.
                        </p>
                      </div>
                      <input
                        id="emailNotif"
                        type="checkbox"
                        checked={receiveQuoteEmails}
                        onChange={(e) => setReceiveQuoteEmails(e.target.checked)}
                        className="w-5 h-5 accent-primary cursor-pointer rounded"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border">
                      <div className="space-y-0.5 pr-4">
                        <Label htmlFor="muteNotif" className="text-sm font-semibold cursor-pointer">
                          Mute In-App Review Notifications
                        </Label>
                        <p className="text-xs text-muted-foreground">
                          Turn this on if you don't want to receive in-app notification popups when a reviewer approves or modifies your quotes.
                        </p>
                      </div>
                      <input
                        id="muteNotif"
                        type="checkbox"
                        checked={muteNotifications}
                        onChange={(e) => setMuteNotifications(e.target.checked)}
                        className="w-5 h-5 accent-primary cursor-pointer rounded"
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
