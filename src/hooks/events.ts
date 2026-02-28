import { useEffect, useState, useCallback } from "react";
import { Event, EventWithRsvp } from "@/types/events";
import { eventAPI } from "@/lib/api";
import { useAuthStore } from "@/lib/store";


export function useFetchEventsForAdmin(search?: string) {
    const [fetchedEvents, setFetchedEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    const fetchEvents = useCallback(async (searchQuery?: string) => {
        setLoading(true);
        setError(null);
        try {
            // Use admin events endpoint — supports backend search
            const res = await eventAPI.getAdminEvents(
                searchQuery ? { search: searchQuery } : undefined
            );
            const data = res.data.data;
            const events = data?.events || [];
            setFetchedEvents(events);
            setTotalCount(data?.pagination?.total ?? events.length);
        } catch (err) {
            setError("Failed to fetch events");
            setFetchedEvents([]);
            setTotalCount(0);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounce search: wait 400 ms after the last keystroke before hitting the backend
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchEvents(search);
        }, 400);
        return () => clearTimeout(timer);
    }, [search, fetchEvents]);

    return { events: fetchedEvents, loading, error, totalCount, refetchEvents: () => fetchEvents(search) };
}

export function useFetchEventsForStudentRsvp() {
    const [fetchedEvents, setFetchedEvents] = useState<EventWithRsvp[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const role = useAuthStore(state => state.role);

    const fetchEvents = useCallback(async () => {
        if (role !== 'student') {
            setLoading(false);
            setFetchedEvents([]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            // Use user events endpoint - returns events with RSVP status
            const res = await eventAPI.getUserEvents();
            // Pass through raw ISO date strings - let components format them
            const events = res.data.data || [];
            setFetchedEvents(events);
        } catch (err) {
            setError("Failed to fetch events");
            console.error(err);
            setFetchedEvents([]);
        } finally {
            setLoading(false);
        }
    }, [role]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents, role]);

    return { events: fetchedEvents, loading, error, refetchEvents: fetchEvents };
}

