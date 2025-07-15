import { useEffect, useState } from "react";
import axios from "axios";
import { Event } from "@/types/events";
import { EventCard } from "@/components/admin/event-card";

interface EventsListProps {
  events: Event[];
  filterStatus: "All Events" | "Upcoming" | "Completed" | "Ongoing";
}

export const EventsList = ({ events, filterStatus }: EventsListProps) => {
  const [fetchedEvents, setFetchedEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        let res;
        if (filterStatus === "All Events") {
          const token = localStorage.getItem('token');
          res = await axios.get("http://localhost:4000/api/events/admin", {
            headers: { Authorization: `Bearer ${token}` }
          });
          setFetchedEvents(res.data.data || []);
        } else {
          const statusMap: Record<string, string> = {
            "Upcoming": "UPCOMING",
            "Ongoing": "ONGOING",
            "Completed": "COMPLETED",
          };
          const backendStatus = statusMap[filterStatus];
          res = await axios.get(`http://localhost:4000/api/events/filter?status=${backendStatus}`);
          setFetchedEvents(res.data.data || []);
        }
      } catch (err) {
        setError("Failed to fetch events");
        setFetchedEvents([]);
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    fetchEvents();
    return () => { cancel = true; };
  }, [filterStatus]);

  if (loading) return <div>Loading events...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      {fetchedEvents.map((event) => (
        <EventCard key={event.id} {...event} />
      ))}
    </div>
  );
};
