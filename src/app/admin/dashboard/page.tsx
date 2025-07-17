"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Plus } from "lucide-react";
import { StatsCard } from "@/components/admin/stats-card";
import { EventsList } from "@/components/admin/event-list";
import {  useFetchEventsForAdmin } from "@/hooks/events";
import { Event, EventStatus } from "@/types/events";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("ALL EVENTS");
  const router = useRouter();

  // Use the hook to fetch events
  const { events, loading, error } = useFetchEventsForAdmin();

  // Calculate stats from fetched events
  const totalEvents = events.length;
  const activeEvents = events.filter(
    (event) => event.status === "ONGOING" || event.status === "UPCOMING"
  ).length;
  const totalStudents = 1250;

  if (loading) return <div>Loading events...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-muted-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted text-lg mt-1">
              Manage events, attendance, and student activities
            </p>
          </div>
          <Button
            size={"lg"}
            className="bg-blue-500 text-lg self-end mt-3 md:mt-0 py-2 px-1 text-white hover:bg-blue-600"
            onClick={() => router.push("/admin/createEvent")}
          >
            <Plus className="h-6 w-6 mr-2" />
            Create Event
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard title="Total Events" value={totalEvents} Icon={Calendar} />
          <StatsCard title="Active Events" value={activeEvents} />
          <StatsCard title="Total Students" value={totalStudents} Icon={Users} />
        </div>

        {/* Events Section */}
        <Card className="border-none bg-background shadow-none">
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 bg-gray-200 rounded-md text-lg">
                {["ALL EVENTS", "UPCOMING", "ONGOING", "COMPLETED"].map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className={activeTab === tab ? "bg-blue-500 text-white" : ""}
                  >
                    {tab}
                  </TabsTrigger>
                ))}
              </TabsList>

              {["ALL EVENTS", "UPCOMING", "ONGOING", "COMPLETED"].map((status) => (
                <TabsContent key={status} value={status} className="mt-6">
                  <EventsList events={events} filterStatus={status as EventStatus} />
                </TabsContent>
              ))}
            </Tabs>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
