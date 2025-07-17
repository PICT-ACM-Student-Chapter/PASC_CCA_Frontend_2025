
import axios from "axios";
import { useEffect, useState } from "react";
import { Event, EventFor, EventWithRsvp } from "@/types/events";

function formatDateToDDMMYY(dateString: string): string {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
}

export function useFetchEventsForAdmin() {
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
                const token = localStorage.getItem('token');
                res = await axios.get("http://localhost:4000/api/events/");
                console.log(res.data.data.events);
                const formattedEvents = (res.data.data.events || []).map((event: any) => ({
                    ...event,
                    startDate: formatDateToDDMMYY(event.startDate),
                    endDate: formatDateToDDMMYY(event.endDate),
                }));
                setFetchedEvents(formattedEvents);
            } catch (err) {
                setError("Failed to fetch events");
                setFetchedEvents([]);
            } finally {
                if (!cancel) setLoading(false);
            }
        };
        fetchEvents();
        return () => { cancel = true; };
    }, []);

    return { events: fetchedEvents, loading, error };
}

export function useFetchEventsForStudentRsvp() {
    const [fetchedEvents, setFetchedEvents] = useState<EventWithRsvp[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancel = false;
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);
            try {
                let res;
                const token = localStorage.getItem('token');
                res = await axios.get("http://localhost:4000/api/events/user/" , {
                    headers : {
                        'Authorization' : `Bearer ${token}`
                    }
                });
                console.log(res.data.data);
                const formattedEvents = (res.data.data || []).map((event: any) => ({
                    ...event,
                    startDate: formatDateToDDMMYY(event.startDate),
                    endDate: formatDateToDDMMYY(event.endDate),
                }));
                setFetchedEvents(formattedEvents);
            } catch (err) {
                setError("Failed to fetch events");
                console.log(err);
                setFetchedEvents([]);
            } finally {
                if (!cancel) setLoading(false);
            }
        };
        fetchEvents();
        return () => { cancel = true; };
    }, []);

    return { events: fetchedEvents, loading, error };
}

