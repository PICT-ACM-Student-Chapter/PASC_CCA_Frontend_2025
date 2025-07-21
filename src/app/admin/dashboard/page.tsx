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
import axios from "axios";
import { useAuthStore } from "@/lib/store";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("ALL EVENTS");
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [studentLoading, setStudentLoading] = useState(true);
  const [studentError, setStudentError] = useState<string | null>(null);
  const router = useRouter();
  const { clearAuth } = useAuthStore();

  // Use the hook to fetch events
  const { events, loading, error } = useFetchEventsForAdmin();

  // Fetch student count
  React.useEffect(() => {
    const fetchStudentCount = async () => {
      setStudentLoading(true);
      setStudentError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:4000/api/auth/user/count", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudentCount(res.data.count);
      } catch (err: any) {
        setStudentError("Failed to fetch student count");
        setStudentCount(null);
      } finally {
        setStudentLoading(false);
      }
    };
    fetchStudentCount();
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:4000/api/auth/admin/logout",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e) {
      // ignore error
    }
    clearAuth();
    localStorage.removeItem("token");
    router.push("/auth/login");
  };

  // Calculate stats from fetched events
  const totalEvents = events.length;
  const activeEvents = events.filter(
    (event) => event.status === "ONGOING" || event.status === "UPCOMING"
  ).length;

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
          <div className="flex gap-2 items-center">
            <Button
              size={"lg"}
              className="bg-blue-500 text-lg self-end mt-3 md:mt-0 py-2 px-1 text-white hover:bg-blue-600"
              onClick={() => router.push("/admin/createEvent")}
            >
              <Plus className="h-6 w-6 mr-2" />
              Create Event
            </Button>
            <Button
              size={"lg"}
              variant="outline"
              className="text-lg self-end mt-3 md:mt-0 py-2 px-4 border-red-500 text-red-600 hover:bg-red-100"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard title="Total Events" value={totalEvents} Icon={Calendar} />
          <StatsCard title="Active Events" value={activeEvents} />
          <StatsCard
            title="Total Students"
            value={studentLoading ? "Loading..." : studentError ? studentError : studentCount ?? "-"}
            Icon={Users}
          />
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
