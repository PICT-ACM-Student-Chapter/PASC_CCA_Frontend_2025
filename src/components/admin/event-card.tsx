import { Event } from "@/types/events";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { BarChart3, Edit, Users, Clock, FolderOpen, Image, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { eventAPI } from "@/lib/api";
import { getStatusBadgeVariant, getStatusColor, formatDate } from "@/lib/utils";


interface EventCardProps extends Event {
  onRefresh?: () => void;
}

export const EventCard = ({ onRefresh, ...event }: EventCardProps) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const getStatusBadge = (status: Event["status"]) => {
    const variants: Record<string, string> = {
      UPCOMING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      COMPLETED: "bg-[var(--color-primary)]/10 text-[var(--color-primary)]",
      ONGOING: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    };
    return (
      <Badge className={variants[status] || "bg-[var(--color-surface)] text-[var(--color-text-primary)]"}>        {status}
      </Badge>
    );
  };

  // const formatDate = (date: string | Date) => {
  //   if (!date) return "—";

  //   const d = date instanceof Date ? date : new Date(date);

  //   if (isNaN(d.getTime())) return "—";

  //   return d.toLocaleDateString('en-GB', {
  //   year: 'numeric',
  //   month: 'short',
  //   day: 'numeric',
  //   hour: '2-digit',
  //   minute: '2-digit',
  //   timeZone: 'UTC'
  // });
  // };

  // export function formatDateTime(date: Date | string): string {
  // const d = new Date(date);
  // return d.toLocaleDateString('en-GB', {
  //   year: 'numeric',
  //   month: 'short',
  //   day: 'numeric',
  //   hour: '2-digit',
  //   minute: '2-digit',
  //   timeZone: 'UTC'
  // });



  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    try {
      await eventAPI.delete(event.id);
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="mb-4 rounded-2xl sm:rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold text-lg text-foreground">{event.title}</h3>
            {getStatusBadge(event.status)}
          </div>
          <p className="text-sm text-muted-foreground mb-1">
            {formatDate(event.startDate)} - {formatDate(event.endDate)} • {event.location}
          </p>
          <p className="text-sm text-muted-foreground">
            {event.credits} credits • Capacity: {event.capacity}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => router.push(`/admin/events/${event.id}/analytics`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </button>
          <button
            onClick={() => router.push(`/admin/events/${event.id}/sessions`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <Clock className="w-4 h-4" />
            Sessions
          </button>
          <button
            onClick={() => router.push(`/admin/events/${event.id}/resources`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <FolderOpen className="w-4 h-4" />
            Resources
          </button>
          <button
            onClick={() => router.push(`/admin/events/${event.id}/gallery`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <Image className="w-4 h-4" />
            Gallery
          </button>
          <button
            onClick={() => router.push(`/admin/editEvent/${event.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => router.push(`/admin/attendance/${event.id}`)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] text-sm font-medium hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <Users className="w-4 h-4" />
            Attendance
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
