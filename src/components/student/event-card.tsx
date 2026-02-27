import { EventWithRsvp } from "@/types/events";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Users, Award } from "lucide-react";
import Link from "next/link";
import { getStatusBadgeVariant, getStatusColor, formatDate } from "@/lib/utils";
import { rsvpAPI } from "@/lib/api";

// Event Card Component
export const EventCard = ({ eventWithRsvp }: { eventWithRsvp: EventWithRsvp }) => {

  async function handleRsvpButton() {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please login first');
        return;
      }
      console.log('Creating RSVP for event:', eventWithRsvp.event.id);
      const response = await rsvpAPI.create(eventWithRsvp.event.id);
      console.log('RSVP Success:', response.data);
      alert('RSVP successful!');
      // Reload the page to update RSVP status
      window.location.reload();
    } catch (error: any) {
      console.error('RSVP Error Details:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Failed to RSVP. Please try again.';
      alert(errorMessage);
    }
  }

  async function handleRsvpCancle() {
    try {
      if (!eventWithRsvp.rsvp || !eventWithRsvp.rsvp.id) {
        alert('No RSVP found to cancel');
        return;
      }
      const response = await rsvpAPI.cancel(eventWithRsvp.rsvp.id);
      console.log('Cancel RSVP Success:', response.data);
      // Reload the page to update RSVP status
      window.location.reload();
    } catch (error: any) {
      console.error('Cancel RSVP Error:', error.response?.data || error);
      alert(error.response?.data?.error || 'Failed to cancel RSVP. Please try again.');
    }
  }

  const event = eventWithRsvp.event;
  const getRSVPButton = () => {
    if (eventWithRsvp.rsvp) {
      return (
        <Button variant="outline" className="flex-1 border-none"
          onClick={handleRsvpCancle}>
          Cancel RSVP
        </Button>
      );
    }
    return (
      <Button className="flex-1 text-white bg-blue-600 hover:bg-blue-700"
        onClick={() => {
          handleRsvpButton()
        }}>
        RSVP
      </Button>
    );
  };

  return (
    <Card className="w-full border-none shadow-sm hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl font-semibold line-clamp-2 break-all">{event.title}</CardTitle>
          <Badge
            variant={getStatusBadgeVariant(event.status)}
            className={`shrink-0 ${getStatusColor(event.status)} ${event.status === 'ONGOING' ? 'bg-green-100' : ''
              }`}
          >
            {event.status}
          </Badge>
        </div>
        <CardDescription className="text-sm text-gray-600 leading-relaxed line-clamp-1 break-all mt-2">
          {event.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Start: {formatDate(event.startDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>End: {formatDate(event.endDate)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award className="w-4 h-4 text-yellow-600" />
            <span className="font-medium">{event.credits} Credit Hours</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Capacity: {event.capacity} students</span>
          </div>
        </div>
        <div className="flex gap-2">
          {getRSVPButton()}
          <Button variant="outline" className="flex-1" asChild>
            <Link href={`/student/events/${event.id}`} className="flex items-center justify-center">
              Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
