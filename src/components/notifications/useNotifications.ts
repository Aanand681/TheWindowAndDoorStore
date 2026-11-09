'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPusherClient } from '@/lib/pusher-client';
import { NotificationItem } from './types';

export function useNotifications() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const unreadList = notifications.filter((n) => !n.isRead);
  const unreadCount = unreadList.length;

  const fetchNotifications = async () => {
    if (typeof document !== 'undefined' && document.hidden) return;
    try {
      const res = await fetch(`/api/notifications?t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const notifs = data.notifications || [];
        setNotifications(notifs);
      }
    } catch {
      // Quiet fail
    }
  };

  useEffect(() => {
    let isCancelled = false;
    let boundUserChannel: any = null;
    let boundGlobalChannel: any = null;

    const handleNewNotification = (data: any) => {
      const newNotif = data.notification || data;
      if (newNotif && newNotif._id) {
        setNotifications((prev) => {
          if (prev.some((n) => n._id === newNotif._id)) return prev;
          return [newNotif, ...prev];
        });
        window.dispatchEvent(new CustomEvent('quote-count-updated'));
      }
    };

    const handleCountUpdated = () => {
      window.dispatchEvent(new CustomEvent('quote-count-updated'));
    };

    const handleQuoteDeleted = (data: any) => {
      window.dispatchEvent(new CustomEvent('quote-deleted', { detail: data }));
      window.dispatchEvent(new CustomEvent('quote-count-updated'));
    };

    fetchNotifications();

    const pusher = getPusherClient();
    if (pusher) {
      fetch('/api/profile')
        .then((res) => (res.ok ? res.json() : null))
        .then((user) => {
          if (isCancelled) return;
          if (user && user.username && pusher) {
            const userChannelName = `user-${user.username.toLowerCase().trim()}`;
            boundUserChannel = pusher.subscribe(userChannelName);
            boundUserChannel.unbind('notification', handleNewNotification);
            boundUserChannel.bind('notification', handleNewNotification);

            boundGlobalChannel = pusher.subscribe('global-quotes');
            boundGlobalChannel.unbind('QUOTE_COUNT_UPDATED', handleCountUpdated);
            boundGlobalChannel.unbind('QUOTE_DELETED', handleQuoteDeleted);
            boundGlobalChannel.bind('QUOTE_COUNT_UPDATED', handleCountUpdated);
            boundGlobalChannel.bind('QUOTE_DELETED', handleQuoteDeleted);
          }
        })
        .catch(() => {});
    }

    const interval = setInterval(fetchNotifications, 300000);

    return () => {
      isCancelled = true;
      if (boundUserChannel) {
        boundUserChannel.unbind('notification', handleNewNotification);
      }
      if (boundGlobalChannel) {
        boundGlobalChannel.unbind('QUOTE_COUNT_UPDATED', handleCountUpdated);
        boundGlobalChannel.unbind('QUOTE_DELETED', handleQuoteDeleted);
      }
      clearInterval(interval);
    };
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: true }),
      });
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllAsRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const handleNotificationClick = (n: NotificationItem, closeDropdown: () => void) => {
    if (!n.isRead) handleMarkAsRead(n._id);
    closeDropdown();

    if (n.type === 'QUOTE_ODOO_ASSIGNED' && n.quoteId) {
      if (typeof window !== 'undefined' && window.location.pathname === '/') {
        window.dispatchEvent(
          new CustomEvent('open-clerk-preview', { detail: { quoteId: n.quoteId, sub: 'odoo' } })
        );
        window.history.pushState({}, '', `/?tab=quotes&sub=odoo&previewQuoteId=${n.quoteId}`);
      } else {
        router.push(`/?tab=quotes&sub=odoo&previewQuoteId=${n.quoteId}`);
      }
      return;
    }

    const isApprovedOrCompleted =
      n.type === 'QUOTE_APPROVED' ||
      n.type === 'QUOTE_MODIFIED' ||
      n.type === 'ODOO_ENTRY_COMPLETED';
    if (isApprovedOrCompleted && n.quoteId) {
      const targetSub = 'my';
      if (typeof window !== 'undefined' && window.location.pathname === '/') {
        window.dispatchEvent(
          new CustomEvent('open-clerk-preview', { detail: { quoteId: n.quoteId, sub: targetSub } })
        );
        window.history.pushState({}, '', `/?tab=quotes&sub=${targetSub}&previewQuoteId=${n.quoteId}`);
      } else {
        router.push(`/?tab=quotes&sub=${targetSub}&previewQuoteId=${n.quoteId}`);
      }
      return;
    }

    if (n.quoteId) {
      const originSubTab = n.type === 'QUOTE_SUBMITTED' ? 'review' : 'my';
      if (typeof window !== 'undefined' && window.location.pathname === '/') {
        window.dispatchEvent(
          new CustomEvent('load-review-quote', { detail: { quoteId: n.quoteId, originSubTab } })
        );
        window.history.pushState({}, '', `/?reviewQuoteId=${n.quoteId}&sub=${originSubTab}`);
      } else {
        router.push(`/?reviewQuoteId=${n.quoteId}&sub=${originSubTab}`);
      }
    } else {
      router.push('/?tab=quotes');
    }
  };

  return {
    notifications,
    unreadList,
    unreadCount,
    handleMarkAllAsRead,
    handleNotificationClick,
  };
}

