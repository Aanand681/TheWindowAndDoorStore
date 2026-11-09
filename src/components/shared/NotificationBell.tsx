'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCheck, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  NotificationItem,
  useNotifications,
  NotificationItemRow,
} from '@/components/notifications';

export type { NotificationItem };

export default function NotificationBell() {
  const {
    notifications,
    unreadList,
    unreadCount,
    handleMarkAllAsRead,
    handleNotificationClick,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'unread' | 'history'>('unread');
  const dropdownRef = useRef<HTMLDivElement>(null);

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
              displayedList.map((n) => (
                <NotificationItemRow
                  key={n._id}
                  notification={n}
                  onClick={() => handleNotificationClick(n, () => setIsOpen(false))}
                />
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
