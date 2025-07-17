'use client'
import React from "react";
import { EventsTab } from "@/components/student/event-tab";
import { useFetchEventsForStudentRsvp } from "@/hooks/events";
import { EventWithRsvp } from "@/types/events";

export default function EventsPage() {
  const { events, loading, error } = useFetchEventsForStudentRsvp();
  const eventsWithRsvp = events;
  const totalEvents = eventsWithRsvp.length;
  const activeEvents = eventsWithRsvp.filter(
    (e: EventWithRsvp) => e.event.status === "ONGOING" || e.event.status === "UPCOMING"
  ).length;

  if (loading) return <div>Loading events...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  return (
    <section className="max-w-7xl mx-auto px-4 py-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          CCA Events Dashboard
        </h1>
        <p className="text-gray-600">
          Discover and participate in co-curricular activities
        </p>
      </div>

      {/* Events Tab Section */}
      <EventsTab eventsWithRsvp={eventsWithRsvp} />
    </section>
  );
}
