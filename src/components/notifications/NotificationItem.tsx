"use client";

import { Notification, NotificationType } from '@/types/notification';
import {
  Bell,
  Calendar,
  CheckCircle,
  AlertCircle,
  Trophy,
  Users,
  Megaphone
} from 'lucide-react';
import { formatDistanceToNow } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
}

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  EVENT_REMINDER: <Calendar className="w-5 h-5 text-blue-500" />,
  EVENT_CREATED: <Calendar className="w-5 h-5 text-green-500" />,
  EVENT_UPDATED: <Calendar className="w-5 h-5 text-yellow-500" />,
  EVENT_CANCELLED: <AlertCircle className="w-5 h-5 text-red-500" />,
  RSVP_CONFIRMED: <CheckCircle className="w-5 h-5 text-green-500" />,
  WAITLIST_PROMOTED: <Users className="w-5 h-5 text-purple-500" />,
  ATTENDANCE_MARKED: <CheckCircle className="w-5 h-5 text-blue-500" />,
  ANNOUNCEMENT: <Megaphone className="w-5 h-5 text-orange-500" />,
  ACHIEVEMENT: <Trophy className="w-5 h-5 text-yellow-500" />,
  GENERAL: <Bell className="w-5 h-5 text-gray-500" />,
};

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`p-4 hover:bg-accent cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
        }`}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          {notificationIcons[notification.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-medium ${!notification.read ? 'font-semibold' : ''}`}>
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {notification.message}
          </p>
          <p className='text-xs text-muted-foreground mt-2' suppressHydrationWarning>
            {formatDistanceToNow(new Date(notification.createdAt ?? notification.sentAt))}
          </p>
        </div>
      </div>
    </div>
  );
}


