'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { 
  UserCircle, 
  LogOut, 
  ShieldCheck, 
  Calculator, 
  Inbox, 
  ChevronDown,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { cachedFetch, getCachedData } from '@/lib/client-cache';

export interface UserProfileMenuProps {
  user?: {
    username?: string;
    role?: string;
    email?: string;
  } | null;
  className?: string;
}

export default function UserProfileMenu({ user: propUser, className }: UserProfileMenuProps) {
  const [user, setUser] = useState<{ username?: string; role?: string; email?: string } | null>(
    propUser || getCachedData('/api/profile') || null
  );
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // If user wasn't passed as prop, fetch from profile endpoint with deduplication
  useEffect(() => {
    if (propUser) {
      setUser(propUser);
      return;
    }

    cachedFetch<any>('/api/profile')
      .then(data => {
        if (data) setUser(data);
      })
      .catch(() => {});
  }, [propUser]);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('greeting_shown_session');
    }
    signOut({ callbackUrl: '/login' });
  };

  if (!user && !propUser) {
    return null;
  }

  const username = user?.username || propUser?.username || 'User';
  const role = user?.role || propUser?.role || 'Staff';
  const initials = username.slice(0, 2).toUpperCase();
  const isAdmin = role === 'ADMIN' || role === 'SUPERADMIN';

  return (
    <div className={cn("relative inline-block text-left", className)} ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full hover:bg-muted/70 transition-all cursor-pointer border border-border/70 bg-card/50 backdrop-blur shadow-xs focus:outline-hidden"
        title="Account Menu"
      >
        <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-[11px] uppercase shadow-xs">
          {initials}
        </div>
        <span className="text-xs font-semibold text-foreground max-w-[90px] truncate hidden sm:inline">
          {username}
        </span>
        <ChevronDown 
          className={cn(
            "w-3.5 h-3.5 text-muted-foreground transition-transform duration-200", 
            isOpen && "rotate-180"
          )} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-card/95 backdrop-blur-xl border border-border p-1.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User Info Header */}
          <div className="px-3 py-2.5 border-b border-border/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-black text-xs uppercase">
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground truncate">{username}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-primary/15 text-primary font-bold uppercase tracking-wider">
                    {role}
                  </span>
                  {user?.email && (
                    <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
                      {user.email}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Navigation Items */}
          <div className="py-1.5 space-y-0.5">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/70 transition-colors"
            >
              <UserCircle className="w-4 h-4 text-muted-foreground" />
              <span>Profile &amp; Settings</span>
            </Link>

            <Link
              href="/quotes"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/70 transition-colors"
            >
              <Inbox className="w-4 h-4 text-amber-500" />
              <span>Quotes History &amp; Bin</span>
            </Link>

            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-foreground hover:bg-muted/70 transition-colors"
            >
              <Calculator className="w-4 h-4 text-primary" />
              <span>Quote Calculator</span>
            </Link>
          </div>

          {/* Sign Out Footer */}
          <div className="pt-1.5 border-t border-border/60">
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
