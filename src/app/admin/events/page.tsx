"use client";

import React, { useState } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Search } from "lucide-react";
import { EventsList } from "@/components/admin/event-list";
import { useFetchEventsForAdmin } from "@/hooks/events";
import { EventStatus } from "@/types/events";
import { Skeleton } from "@/components/ui/skeleton";

const AdminEventsPage = () => {
    const [activeTab, setActiveTab] = useState("ALL EVENTS");
    const [searchQuery, setSearchQuery] = useState("");

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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                        <Calendar className="w-8 h-8 text-primary" />
                        Manage Events
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        View, edit, and monitor all event activities
                    </p>
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
                <Card className="border border-border bg-card shadow-sm rounded-xl overflow-hidden">
                    <CardHeader className="p-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="bg-accent/50 p-4 border-b border-border">
                                <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-background/50 border border-border">
                                    {["ALL EVENTS", "UPCOMING", "ONGOING", "COMPLETED"].map((tab) => (
                                        <TabsTrigger
                                            key={tab}
                                            value={tab}
                                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                                        >
                                            {tab.replace("ALL EVENTS", "All")}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>

                            <div className="p-6">
                                {["ALL EVENTS", "UPCOMING", "ONGOING", "COMPLETED"].map((status) => (
                                    <TabsContent key={status} value={status} className="mt-0">
                                        <EventsList events={events} filterStatus={status as EventStatus} />
                                    </TabsContent>
                                ))}
                            </div>
                        </Tabs>
                    </CardHeader>
                </Card>
            </div>
        </div>
    );
};

export default AdminEventsPage;
