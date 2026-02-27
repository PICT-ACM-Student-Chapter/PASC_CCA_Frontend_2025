'use client';

import { Bell } from 'lucide-react';
import { AdminNotificationList } from '@/components/notifications/AdminNotificationList';

export default function AdminNotificationsPage() {
    return (
        <main className='min-h-screen bg-background p-4 md:p-6'>
            <div className='max-w-4xl mx-auto space-y-6'>
                <div>
                    <h1 className='text-3xl font-bold text-foreground flex items-center gap-3'>
                        <Bell className='w-8 h-8 text-primary' />
                        Announcements
                    </h1>
                    <p className='text-muted-foreground mt-1'>
                        All announcements sent to students
                    </p>
                </div>
                <AdminNotificationList />
            </div>
        </main>
    );
}
