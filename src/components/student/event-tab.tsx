'use client';
import { EventWithRsvp } from "@/types/events";
import { useState } from "react";
import { EventCard } from "@/components/student/event-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const EventsTab = ({ eventsWithRsvp }: { eventsWithRsvp: EventWithRsvp[] }) => {
  const [activeTab, setActiveTab] = useState("ALL EVENTS");

  const filterEvents = (status?: string) => {
    if (!status || status === "ALL EVENTS") return eventsWithRsvp;
    return eventsWithRsvp.filter(e => e.event.status === status);
  };

  const getTabContent = (tabValue: string) => {
    let filteredEvents = eventsWithRsvp;
    switch (tabValue) {
      case 'upcoming':
        filteredEvents = filterEvents('UPCOMING');
        break;
      case 'ongoing':
        filteredEvents = filterEvents('ONGOING');
        break;
      case 'completed':
        filteredEvents = filterEvents('COMPLETED');
        break;
      case 'my-events':
        filteredEvents = eventsWithRsvp.filter(e => e.rsvp);
        break;
      default:
        filteredEvents = eventsWithRsvp;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {filteredEvents.map((eventWithRsvp, index) => (
          <EventCard key={index} eventWithRsvp={eventWithRsvp} />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Full width tabs container with gray background */}
        <div className="w-full  rounded-lg p-1 mb-6">
          <TabsList className="w-full h-auto p-3 flex justify-between items-center bg-gray-100 rounded-lg flex-wrap">
            <TabsTrigger 
              value="all-events" 
              className="text-sm py-1.5 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200"
            >
              All Events
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming" 
              className="text-sm py-1.5 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger 
              value="ongoing" 
              className="text-sm py-1.5 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200"
            >
              Ongoing
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              className="text-sm py-1.5 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200"
            >
              Completed
            </TabsTrigger>
            <TabsTrigger 
              value="my-events" 
              className="text-sm py-1.5 px-4 rounded-md data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow-sm text-gray-600 hover:text-gray-900 transition-all duration-200"
            >
              My Events
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="all-events" className="mt-0">
          {getTabContent('all-events')}
        </TabsContent>
        <TabsContent value="upcoming" className="mt-0">
          {getTabContent('upcoming')}
        </TabsContent>
        <TabsContent value="ongoing" className="mt-0">
          {getTabContent('ongoing')}
        </TabsContent>
        <TabsContent value="completed" className="mt-0">
          {getTabContent('completed')}
        </TabsContent>
        <TabsContent value="my-events" className="mt-0">
          {getTabContent('my-events')}
        </TabsContent>
      </Tabs>
    </div>
  );
};