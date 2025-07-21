'use client'
import React from "react";
import { EventsTab } from "@/components/student/event-tab";
import { useFetchEventsForStudentRsvp } from "@/hooks/events";
import { EventWithRsvp } from "@/types/events";
import { useAuthStore } from "@/lib/store";
import axios from "axios";

export default function EventsPage() {
  const { clearAuth } = useAuthStore();
  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:4000/api/auth/user/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e) {
      // ignore error
    }
    clearAuth();
    localStorage.removeItem("token");
    window.location.href = "/auth/login";
  };
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
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            CCA Events Dashboard
          </h1>
          <p className="text-gray-600">
            Discover and participate in co-curricular activities
          </p>
        </div>
        <button
          className="border border-red-500 text-red-600 px-4 py-2 rounded hover:bg-red-100 text-lg mt-3 md:mt-0"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>

      {/* Events Tab Section */}
      <EventsTab eventsWithRsvp={eventsWithRsvp} />
    </section>
  );
}
