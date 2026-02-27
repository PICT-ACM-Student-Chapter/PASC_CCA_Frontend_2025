'use client';

import { useState, useEffect } from 'react';
import { announcementAPI } from '@/lib/api';
import { Notification } from '@/types/notification';
import { NotificationItem } from './NotificationItem';
import { Skeleton } from '../ui/skeleton';
import { Bell } from 'lucide-react';

/**
 * AdminNotificationList — mirrors NotificationList for students but
 * fetches admin announcements and renders them as Notification items.
 */
export function AdminNotificationList() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await announcementAPI.getAllAdmin({ limit: 50 });
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
                    }))
                );
            }
        } catch (err) {
            console.error('Error fetching admin announcements:', err);
            setError('Failed to load announcements. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = (notificationId: number) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
        );
    };

    const handleMarkAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    };

    if (loading) {
        return (
            <div className='space-y-4'>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className='bg-card p-4 rounded-lg border border-border animate-pulse'>
                        <div className='h-4 bg-muted w-1/4 mb-2' />
                        <div className='h-3 bg-muted w-3/4' />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className='text-center py-12 bg-card rounded-lg border border-border'>
                <p className='text-red-500 mb-4'>{error}</p>
                <button onClick={fetchNotifications} className='text-blue-600 hover:underline font-medium'>
                    Try again
                </button>
            </div>
        );
    }

    if (notifications.length === 0) {
        return (
            <div className='text-center py-12 bg-card rounded-lg border border-border'>
                <Bell className='w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50' />
                <h3 className='text-lg font-medium'>No announcements</h3>
                <p className='text-muted-foreground'>No announcements have been sent yet.</p>
            </div>
        );
    }

    const hasUnread = notifications.some((n) => !n.read);

    return (
        <div className='space-y-4'>
            {hasUnread && (
                <div className='flex justify-end'>
                    <button
                        onClick={handleMarkAllAsRead}
                        className='text-sm text-blue-600 hover:text-blue-800 font-medium'
                    >
                        Mark all as read
                    </button>
                </div>
            )}
            <div className='bg-card border border-border rounded-lg overflow-hidden divide-y divide-border shadow-sm'>
                {notifications.map((notification) => (
                    <NotificationItem
                        key={notification.id}
                        notification={notification}
                        onMarkAsRead={handleMarkAsRead}
                    />
                ))}
            </div>
        </div>
    );
}
