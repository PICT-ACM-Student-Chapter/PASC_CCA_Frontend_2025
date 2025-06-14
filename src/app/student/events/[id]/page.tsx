import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, Phone } from "lucide-react";
import { EVENTS } from "@/data/events";
import { getStatusBadgeVariant, getStatusColor } from "@/lib/utils";

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = EVENTS.find((event) => event.id.toString() === id);
  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Event Not Found</h2>
          <p className="text-gray-600 mt-2">
            The event you are looking for does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl w-full mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Title Card */}
          <Card className="border-none shadow-sm hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {event.title}
                </CardTitle>
                <Badge
                  variant={getStatusBadgeVariant(event.status)}
                  className={getStatusColor(event.status)}
                >
                  {event.status}
                </Badge>
              </div>
              <p className="text-gray-600 leading-relaxed mt-4">
                {event.description}
              </p>
            </CardHeader>
          </Card>

          {/* About Event */}
          <Card className="border-none shadow-sm hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                About Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 leading-relaxed">
                {event.aboutEvent}
              </p>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          <Card className="border-none shadow-sm hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Prerequisites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{event.prerequisites}</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="border-none shadow-sm hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Start Date */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Start Date</p>
                  <p className="text-gray-600 text-sm">{event.startDate}</p>
                </div>
              </div>

              <Separator />

              {/* End Date */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">End Date</p>
                  <p className="text-gray-600 text-sm">{event.endDate}</p>
                </div>
              </div>

              <Separator />

              {/* Credit Hours */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Clock className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Credit Hours</p>
                  <p className="text-gray-600 text-sm">{event.creditHours}</p>
                </div>
              </div>

              <Separator />

              {/* Location */}
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Location</p>
                  <p className="text-gray-600 text-sm">{event.location}</p>
                </div>
              </div>

              <Separator />

              {/* Contact */}
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Contact:</p>
                  <p className="text-gray-600 text-sm">{event.contact}</p>
                </div>
              </div>

              {/* RSVP Button */}
              <div className="pt-4">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200"
                  disabled={event.rsvpStatus === "disabled"}
                >
                  RSVP to Event
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
