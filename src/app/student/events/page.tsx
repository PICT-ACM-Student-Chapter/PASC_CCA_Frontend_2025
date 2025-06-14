'use client';

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Clock } from "lucide-react";

const sampleEvents = [
  {
    id: 1,
    title: "Web Dev SIG",
    status: "Upcoming",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    duration: "3 days",
    location: "Auditorium",
    startDate: "15/7/25",
    endDate: "18/7/25",
    credits: 15,
    isRSVPed: false,
  },
  {
    id: 2,
    title: "Road Map Session",
    status: "Completed",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...Lorem ipsum dolor sit amet, consectetur adipiscing elit..",
    duration: "3 days",
    location: "Auditorium",
    startDate: "15/7/25",
    endDate: "18/7/25",
    credits: 15,
    isRSVPed: false,
  },
  {
    id: 3,
    title: "ML SIG",
    status: "Ongoing",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit...",
    duration: "3 days",
    location: "Auditorium",
    startDate: "15/7/25",
    endDate: "18/7/25",
    credits: 15,
    isRSVPed: true,
  },
];

export default function EventsDashboard() {
  const [filter, setFilter] = useState("all");

  const filteredEvents = sampleEvents.filter((event) =>
    filter === "all"
      ? true
      : filter === "my"
      ? event.isRSVPed
      : event.status.toLowerCase() === filter
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">CCA Events Dashboard</h1>
        <p className="text-muted-foreground">
          Discover and participate in co-curricular activities
        </p>
      </div>

      <Tabs value={filter} onValueChange={setFilter} className="w-full">
        <TabsList className="grid grid-cols-5 w-full h-12 mb-6 bg-blue-200/16 ">
          <TabsTrigger value="all">All Events</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="ongoing">Ongoing</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="my">My Events</TabsTrigger>
        </TabsList>

        <TabsContent value={filter}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 px-4">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="flex flex-col justify-between h-full border-none shadow-sm">
                <CardContent className="p-4 space-y-3 flex flex-col flex-grow">
                  <div className="flex justify-between items-start">
                    <h1 className="text-xl font-semibold">{event.title}</h1>
                    <Badge
                      variant="outline"
                      className={`
                        ${event.status === "Upcoming"
                          ? "text-[var(--color-badge-upcoming)] border-[var(--color-badge-upcoming)]"
                          : event.status === "Ongoing"
                          ? "text-[var(--color-badge-ongoing)] border-[var(--color-badge-ongoing)]"
                          : "text-[var(--color-badge-completed)] border-[var(--color-badge-completed)]"}
                        text-md
                      `}
                    >
                      {event.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                  <div className="flex items-center gap-4 lg:gap-8 text-sm text-muted-foreground">
                    <div className="flex flex-row gap-1">
                      <CalendarDays className="w-4 h-4" />
                      {event.duration}
                    </div>
                    <div className="flex flex-row gap-1">
                      <MapPin className="w-4 h-4 ml-4" />
                      {event.location}
                    </div>
                  </div>
                  <div className="text-sm flex flex-row gap-16">
                    <p>Start Date: {event.startDate}</p>
                    <p>End Date: {event.endDate}</p>
                  </div>
                  <div className="flex items-center text-sm gap-2">
                    <Clock className="w-4 h-4" />
                    {event.credits} hrs credit
                  </div>
                  </CardContent>
                  <CardContent className="p-4 pt-0">
                  <div className="flex gap-2">
                    {event.status !== "Completed" && (
                      <Button className={`flex-6 text-xl bg-[var(--color-button-rsvp)] text-white dark:bg-[var(--color-button-rsvp)] dark:text-white`}>
                        {event.isRSVPed ? "Cancel RSVP" : "RSVP"}
                      </Button>
                    )}
                    {event.status === "Completed" && (
                      <Button className="flex-6 text-xl bg-[var(--color-button-disabled)] text-[var(--color-badge-completed)] cursor-not-allowed" disabled>
                        RSVP
                      </Button>
                    )}
                    <Button className="flex-2 border-1 text-xl" variant="secondary">
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
