"use client";

import React, { useState } from "react";
import { Calendar, Search, Plus } from "lucide-react";
import { EventsList } from "@/components/admin/event-list";
import { useFetchEventsForAdmin } from "@/hooks/events";
import { useRouter } from "next/navigation";
import { EventStatus } from "@/types/events";
import { Skeleton } from "@/components/ui/skeleton";

const AdminEventsPage = () => {
    const [activeTab, setActiveTab] = useState("ALL EVENTS");
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    // Search is sent to backend — filtering happens in the database, not the browser
    const { events, loading, error } = useFetchEventsForAdmin(searchQuery);

    if (loading) {
        return (
            <div className="min-h-screen p-6">
                <div className="max-w-7xl mx-auto space-y-6">
                    <Skeleton className="h-10 w-64" />
                    <Skeleton className="h-96 w-full" />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen p-6 flex items-center justify-center">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center max-w-md">
                    <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-6 bg-background">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <Calendar className="w-8 h-8 text-primary" />
                            Manage Events
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            View, edit, and monitor all event activities
                        </p>
                    </div>
                    <button
                        onClick={() => router.push("/admin/createEvent")}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-transparent bg-[var(--color-button-primary)] text-white hover:bg-[var(--color-button-primary-hover)] transition-all shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap"
                    >
                        <Plus className="h-4 w-4" />
                        Create Event
                    </button>
                </div>

                {/* Search bar — query is forwarded to the backend */}
                <div className="mb-6 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <input
                        id="admin-event-search"
                        type="text"
                        placeholder="Search events by title or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            aria-label="Clear search"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Events Section */}
                <div className="rounded-2xl sm:rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                    {/* Tab Pills */}
                    <div className="w-full grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3 items-center mb-6">
                        {["ALL EVENTS", "UPCOMING", "ONGOING", "COMPLETED"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`w-full px-4 py-3 rounded-xl text-sm font-semibold tracking-[0.01em] text-center whitespace-nowrap transition-all ${
                                    activeTab === tab
                                        ? "bg-[var(--color-button-primary)] text-white shadow-sm ring-1 ring-[var(--color-button-primary)]"
                                        : "bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border-light)]"
                                }`}
                            >
                                {tab === "ALL EVENTS" ? "All" : tab}
                            </button>
                        ))}
                    </div>

                    <div className="mt-0">
                        {["ALL EVENTS", "UPCOMING", "ONGOING", "COMPLETED"].map((status) => (
                            activeTab === status && (
                                <EventsList key={status} events={events} filterStatus={status as EventStatus} />
                            )
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminEventsPage;
