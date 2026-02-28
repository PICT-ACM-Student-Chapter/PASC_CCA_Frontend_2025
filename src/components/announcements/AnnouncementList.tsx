"use client";

import { useState, useEffect } from 'react';
import { Announcement } from '@/types/announcement';
import { announcementAPI } from '@/lib/api';
import { AnnouncementCard } from './AnnouncementCard';
import { Skeleton } from '../ui/skeleton';
import { Megaphone } from 'lucide-react';

export function AnnouncementList() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementAPI.getAll({ limit: 20 });
      if (response.data?.success && response.data.data) {
        setAnnouncements(response.data.data as Announcement[]);
      }
    } catch (error: any) {
      console.error('Error fetching announcements:', error);
      if (error.response?.status === 403) {
        setError("Access Denied: You might be logged in as an Admin. Please logout and login as a Student.");
      } else {
        setError("Failed to load announcements.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await announcementAPI.markAsRead(id);
      setAnnouncements(announcements.map(a =>
        a.id === id ? { ...a, isRead: true } : a
      ));
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-4 border rounded-lg space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>{error}</p>
        <button onClick={() => window.location.reload()} className="mt-4 underline">
          Retry
        </button>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="text-center py-12">
        <Megaphone className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Announcements</h3>
        <p className="text-muted-foreground">
          There are no announcements at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {announcements.map(announcement => (
        <AnnouncementCard
          key={announcement.id}
          announcement={announcement}
          onMarkAsRead={handleMarkAsRead}
        />
      ))}
    </div>
  );
}


