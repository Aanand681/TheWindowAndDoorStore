'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Clock, FileText, Sparkles, AlertTriangle, Send, ClipboardCheck, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getPusherClient } from '@/lib/pusher-client';

export interface NotificationItem {
  _id: string;
  recipientUsername: string;
  senderUsername: string;
  type: 'QUOTE_APPROVED' | 'QUOTE_MODIFIED' | 'QUOTE_RETURNED' | 'QUOTE_ASSIGNED' | 'QUOTE_SUBMITTED' | 'QUOTE_ODOO_ASSIGNED' | 'ODOO_ENTRY_COMPLETED';
  title: string;
  message: string;
  quoteId: string;
  quoteNumber: string;
  customerName: string;
  reviewChanges?: string[];
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'unread' | 'history'>('unread');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (typeof document !== 'undefined' && document.hidden) return;
    try {
      const res = await fetch(`/api/notifications?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      // Quiet fail
    }
  };

  useEffect(() => {
    fetchNotifications();

    // ⚡ 1. Pusher WebSockets (Sub-second instant push on Vercel & Production)
    let pusher = getPusherClient();
    let userChannel: any = null;
    let globalChannel: any = null;

    fetch('/api/profile')
      .then(res => res.ok ? res.json() : null)
      .then(user => {
        if (user && user.username && pusher) {
          const userChannelName = `user-${user.username.toLowerCase().trim()}`;
          userChannel = pusher.subscribe(userChannelName);

          userChannel.bind('notification', (data: any) => {
            const newNotif = data.notification || data;
            if (newNotif && newNotif._id) {
              setNotifications(prev => {
                const exists = prev.some(n => n._id === newNotif._id);
                if (exists) return prev;
                return [newNotif, ...prev];
              });
              setUnreadCount(prev => prev + 1);
              window.dispatchEvent(new CustomEvent('quote-count-updated'));
            }
          });

          globalChannel = pusher.subscribe('global-quotes');
          globalChannel.bind('QUOTE_COUNT_UPDATED', () => {
            window.dispatchEvent(new CustomEvent('quote-count-updated'));
          });
          globalChannel.bind('QUOTE_DELETED', (data: any) => {
            window.dispatchEvent(new CustomEvent('quote-deleted', { detail: data }));
            window.dispatchEvent(new CustomEvent('quote-count-updated'));
          });
        }
      })
      .catch(() => {});

    // ⚡ 2. Native Server-Sent Events (SSE) Stream: Local Dev companion
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/notifications/stream');

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'NOTIFICATION' && data.notification) {
            setNotifications(prev => {
              const exists = prev.some(n => n._id === data.notification._id);
              if (exists) return prev;
              return [data.notification, ...prev];
            });
            setUnreadCount(prev => prev + 1);
            window.dispatchEvent(new CustomEvent('quote-count-updated'));
          } else if (data.type === 'QUOTE_COUNT_UPDATED') {
            window.dispatchEvent(new CustomEvent('quote-count-updated'));
          } else if (data.type === 'QUOTE_DELETED') {
            window.dispatchEvent(new CustomEvent('quote-deleted', { detail: data }));
            window.dispatchEvent(new CustomEvent('quote-count-updated'));
          }
        } catch (err) {}
      };

      eventSource.onerror = () => {
        // Quiet fail, Pusher is active
      };
    } catch (e) {
      // Quiet fail
    }

    // Gentle 5-minute safety sync (Pusher handles instant real-time events)
    const interval = setInterval(fetchNotifications, 300000);

    return () => {
      if (userChannel) {
        userChannel.unbind_all();
      }
      if (globalChannel) {
        globalChannel.unbind_all();
      }
      if (eventSource) eventSource.close();
      clearInterval(interval);
    };
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (n: NotificationItem) => {
    if (!n.isRead) handleMarkAsRead(n._id);
    setIsOpen(false);

    if (n.type === 'QUOTE_ODOO_ASSIGNED' && n.quoteId) {
      if (typeof window !== 'undefined' && window.location.pathname === '/') {
        window.dispatchEvent(new CustomEvent('load-review-quote', { detail: { quoteId: n.quoteId, originSubTab: 'odoo' } }));
        window.history.pushState({}, '', `/?reviewQuoteId=${n.quoteId}&sub=odoo`);
      } else {
        router.push(`/?reviewQuoteId=${n.quoteId}&sub=odoo`);
      }
      return;
    }

    if (n.quoteId) {
      const originSubTab = n.type === 'QUOTE_SUBMITTED' ? 'review' : 'my';
      if (typeof window !== 'undefined' && window.location.pathname === '/') {
        window.dispatchEvent(new CustomEvent('load-review-quote', { detail: { quoteId: n.quoteId, originSubTab } }));
        window.history.pushState({}, '', `/?reviewQuoteId=${n.quoteId}&sub=${originSubTab}`);
      } else {
        router.push(`/?reviewQuoteId=${n.quoteId}&sub=${originSubTab}`);
      }
    } else {
      router.push('/?tab=quotes');
    }
  };

  const formatTime = (isoString: string) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const unreadList = notifications.filter(n => !n.isRead);
  const displayedList = activeTab === 'unread' ? unreadList : notifications;

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full text-muted-foreground hover:text-foreground h-9 w-9 cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {isOpen && (
        <Card className="absolute right-0 mt-2 w-80 sm:w-96 p-0 shadow-2xl border-border bg-card/95 backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 overflow-hidden">
          {/* Snug Header Group */}
          <div className="border-b border-border/70 bg-muted/20">
            {/* Title & Action Row */}
            <div className="px-3.5 pt-3 pb-1.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-500/15 text-amber-500 font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center gap-1 font-medium"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            {/* Sub Tabs */}
            <div className="flex border-t border-border/40 mt-1">
              <button
                onClick={() => setActiveTab('unread')}
                className={`flex-1 py-1.5 text-xs font-semibold text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === 'unread'
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Unread ({unreadCount})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-1.5 text-xs font-semibold text-center border-b-2 transition-all cursor-pointer ${
                  activeTab === 'history'
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                History / All ({notifications.length})
              </button>
            </div>
          </div>

          {/* Notifications Scroll Area */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/40">
            {displayedList.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-30 text-muted-foreground" />
                <p className="font-semibold text-foreground/80">All caught up!</p>
                <p className="mt-1 opacity-70">
                  {activeTab === 'unread'
                    ? 'No new quote review alerts. Check "History / All" for past records.'
                    : 'Your notifications will appear here.'}
                </p>
              </div>
            ) : (
              displayedList.map(n => {
                const isModified = n.type === 'QUOTE_MODIFIED';
                const isReturned = n.type === 'QUOTE_RETURNED';
                const isApproved = n.type === 'QUOTE_APPROVED';
                const isSubmission = n.type === 'QUOTE_SUBMITTED' || n.type === 'QUOTE_ASSIGNED';
                const isOdoo = n.type === 'QUOTE_ODOO_ASSIGNED';
                const isOdooDone = n.type === 'ODOO_ENTRY_COMPLETED';

                return (
                  <div
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3 text-left transition-colors cursor-pointer flex gap-3 hover:bg-muted/50 ${
                      !n.isRead ? 'bg-primary/5 font-medium' : 'opacity-85'
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      {isOdoo && (
                        <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-500">
                          <ClipboardCheck className="w-4 h-4" />
                        </div>
                      )}
                      {isOdooDone && (
                        <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500">
                          <CheckSquare className="w-4 h-4" />
                        </div>
                      )}
                      {isModified && (
                        <div className="p-1.5 rounded-lg bg-blue-500/15 text-blue-500">
                          <Sparkles className="w-4 h-4" />
                        </div>
                      )}
                      {isReturned && (
                        <div className="p-1.5 rounded-lg bg-destructive/15 text-destructive">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      )}
                      {isApproved && (
                        <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                      {isSubmission && (
                        <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500">
                          <Send className="w-4 h-4" />
                        </div>
                      )}
                      {!isModified && !isReturned && !isApproved && !isSubmission && !isOdoo && !isOdooDone && (
                        <div className="p-1.5 rounded-lg bg-primary/15 text-primary">
                          <FileText className="w-4 h-4" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-foreground truncate">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {formatTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.message}
                      </p>

                      {n.reviewChanges && n.reviewChanges.length > 0 && (
                        <div className="mt-1.5 p-1.5 rounded bg-muted/60 text-[11px] text-muted-foreground border border-border/30">
                          <span className="font-semibold text-foreground/80">Revisions:</span>
                          <ul className="list-disc list-inside mt-0.5 space-y-0.5">
                            {n.reviewChanges.slice(0, 2).map((c, i) => (
                              <li key={i} className="truncate">{c}</li>
                            ))}
                            {n.reviewChanges.length > 2 && (
                              <li className="text-[10px] italic">+{n.reviewChanges.length - 2} more changes</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    {!n.isRead && (
                      <div className="shrink-0 self-center">
                        <span className="w-2 h-2 rounded-full bg-primary block" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
