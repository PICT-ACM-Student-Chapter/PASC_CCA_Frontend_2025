import { useEffect, useState } from "react";
import axios from "axios";
import { Event, EventStatus } from "@/types/events";
import { EventCard } from "@/components/admin/event-card";

interface EventsListProps {
  events: Event[];
  filterStatus: EventStatus;
}

export const EventsList = ({ events, filterStatus }: EventsListProps) => {
  const filteredEvents =
    filterStatus !== "ALL EVENTS"
      ? events.filter((event) => event.status === filterStatus)
      : events;

  return (
    <div className="space-y-4">
      {filteredEvents.map((event) => (
        <EventCard key={event.id} {...event} />
      ))}
    </div>
  );
};
