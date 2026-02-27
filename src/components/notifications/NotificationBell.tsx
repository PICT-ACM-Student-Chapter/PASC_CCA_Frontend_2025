'use client';

import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { notificationAPI, announcementAPI, rsvpAPI } from '@/lib/api';
import { Notification } from '@/types/notification';
import { NotificationDropdown } from './NotificationDropdown';
import { useAuthStore } from '@/lib/store';

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const role = useAuthStore((state) => state.role);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || !role) return;

    if (role === 'student') {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }

    if (role === 'admin') {
      fetchAdminCount();
      const interval = setInterval(fetchAdminCount, 60000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  // Student: unread notification count
  const fetchUnreadCount = async () => {
    if (role !== 'student') return;
    try {
      const response = await notificationAPI.getUnreadCount();
      if (response.data?.success && response.data.data != null) {
        const count = response.data.data.unreadCount ?? response.data.data.count ?? 0;
        setUnreadCount(Number(count));
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  // Admin: new RSVPs in the last 24 h minus already-seen count
  const fetchAdminCount = async () => {
    if (role !== 'admin') return;
    try {
      const response = await rsvpAPI.getAdminNewCount();
      if (response.data?.success && response.data.data != null) {
        const totalNew = Number(response.data.data.count ?? 0);
        const seenCount = Number(localStorage.getItem('admin_rsvp_badge_seen_count') ?? 0);
        setUnreadCount(Math.max(0, totalNew - seenCount));
      }
    } catch (error) {
      console.error('Error fetching admin RSVP count:', error);
    }
  };

  const fetchNotifications = async () => {
    if (!role) return;
    setLoading(true);
    try {
      if (role === 'student') {
        const response = await notificationAPI.getAll({ limit: 10 });
        if (response.data?.success && response.data.data) {
          setNotifications(response.data.data as Notification[]);
        }
      } else if (role === 'admin') {
        const response = await announcementAPI.getAllAdmin({ limit: 10 });
        if (response.data?.success && response.data.data) {
          const announcements = response.data.data as any[];
          setNotifications(
            announcements.map((a: any) => ({
              id: a.id,
              title: a.title,
              message: a.content || a.message || '',
              read: false,
              createdAt: a.createdAt,
              type: 'ANNOUNCEMENT' as const,
            })) as Notification[]
          );
        }
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = async () => {
    const opening = !isOpen;
    setIsOpen(opening);
    if (opening) {
      fetchNotifications();
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      if (role === 'student') {
        await notificationAPI.markAsRead(notificationId);
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
      setNotifications(notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (role === 'student') {
        await notificationAPI.markAllAsRead();
      } else if (role === 'admin') {
        // Persist seen count so badge stays cleared after refresh
        const response = await rsvpAPI.getAdminNewCount();
        if (response.data?.success) {
          const total = Number(response.data.data?.count ?? 0);
          localStorage.setItem('admin_rsvp_badge_seen_count', String(total));
        }
      }
      setNotifications(notifications.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  return (
    <div className='relative inline-flex overflow-visible'>
      <button
        onClick={handleOpen}
        className='relative p-2 rounded-full hover:bg-accent transition-colors'
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} new)` : ''}`}
      >
        <Bell className='w-6 h-6 text-foreground' />
      </button>

      {unreadCount > 0 && (
        <span
          className='absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold leading-none border-2 border-white dark:border-gray-900 shadow-md z-[100] pointer-events-none'
          aria-hidden
        >
          {unreadCount > 99 ? '99+' : unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          loading={loading}
          role={role ?? undefined}
          onClose={() => setIsOpen(false)}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
        />
      )}
    </div>
  );
}
