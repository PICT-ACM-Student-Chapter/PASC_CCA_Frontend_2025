import React from "react";
import { EventsTab } from "@/components/student/event-tab";
import { EVENTS } from "@/data/events";
export default function EventsPage() {
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
      <EventsTab events={EVENTS} />
    </section>
  );
}
