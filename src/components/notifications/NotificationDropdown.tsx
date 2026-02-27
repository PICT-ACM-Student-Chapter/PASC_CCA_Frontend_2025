'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Notification } from '@/types/notification';
import { NotificationItem } from './NotificationItem';
import { Skeleton } from '../ui/skeleton';

interface NotificationDropdownProps {
  notifications: Notification[];
  loading: boolean;
  role?: string;
  onClose: () => void;
  onMarkAsRead: (id: number) => void;
  onMarkAllAsRead: () => void;
}

export function NotificationDropdown({
  notifications,
  loading,
  role,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleViewAll = () => {
    onClose();
    if (role === 'admin') {
      router.push('/admin/notifications');
    } else {
      router.push('/student/notifications');
    }
  };

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div
      ref={dropdownRef}
      className='absolute right-0 mt-2 w-96 bg-card border border-border rounded-lg shadow-xl z-50 max-h-[500px] overflow-hidden flex flex-col'
    >
      {/* Header */}
      <div className='p-4 border-b border-border flex items-center justify-between'>
        <h3 className='font-semibold text-lg'>
          {role === 'admin' ? 'Recent RSVPs' : 'Notifications'}
        </h3>
        {hasUnread && (
          <button
            onClick={onMarkAllAsRead}
            className='text-sm text-blue-600 hover:text-blue-800'
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Notification list */}
      <div className='overflow-y-auto flex-1'>
        {loading ? (
          <div className='p-4 space-y-3'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='space-y-2'>
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-3 w-1/2' />
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className='p-8 text-center text-muted-foreground'>
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className='divide-y divide-border'>
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={onMarkAsRead}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className='p-3 border-t border-border text-center'>
          <button
            onClick={handleViewAll}
            className='text-sm text-blue-600 hover:text-blue-800 font-medium'
          >
            {role === 'admin' ? 'View all announcements' : 'View all notifications'}
          </button>
        </div>
      )}
    </div>
  );
}
