export type NotificationType =
    | 'EVENT_REMINDER'
    | 'EVENT_CREATED'
    | 'EVENT_UPDATED'
    | 'EVENT_CANCELLED'
    | 'RSVP_CONFIRMED'
    | 'WAITLIST_PROMOTED'
    | 'ATTENDANCE_MARKED'
    | 'ANNOUNCEMENT'
    | 'ACHIEVEMENT'
    | 'GENERAL';

export interface Notification {
    id: number;
    userId?: number;
    type: NotificationType;
    title: string;
    message: string;
    read: boolean;
    relatedEntityId?: number;
    relatedEntityType?: string;
    createdAt: string;
    sentAt?: string;
}
