import { EventWithRsvp } from "@/types/events";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { getStatusBadgeVariant, getStatusColor } from "@/lib/utils";
import axios from "axios";

// Event Card Component
export const EventCard = ({ eventWithRsvp }: { eventWithRsvp: EventWithRsvp }) => {

  async function handleRsvpButton() {
     try {
      const token = localStorage.getItem('token')
      console.log(token)
      const response = await axios.post(
        'http://localhost:4000/api/rsvps/',
        {
          eventId: eventWithRsvp.event.id,
          status: 'ATTENDING'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${token}`
          }
        }
      );
      console.log(response);
     } catch (error) {
      console.log(error);

     }
   }

   async function handleRsvpCancle()
   {
    try {
      const token = localStorage.getItem('token')
      console.log(token)
      const response = await axios.delete(
        `http://localhost:4000/api/rsvps/${eventWithRsvp.rsvp.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'authorization': `Bearer ${token}`
          }
        }
      );
      console.log(response);
     } catch (error) {
      console.log(error);

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
      onClick={()=>{
        handleRsvpButton()
      }}>
        RSVP
      </Button>
    );
  };

  return (
    <Card className="w-full border-none shadow-sm hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-semibold">{event.title}</CardTitle>
          <Badge 
            variant={getStatusBadgeVariant(event.status)}
            className={`${getStatusColor(event.status)} ${
              event.status === 'ONGOING' ? 'bg-green-100' : ''
            }`}
          >
            {event.status}
          </Badge>
        </div>
        <CardDescription className="text-sm text-gray-600 leading-relaxed">
          {event.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{event.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Start Date: {event.startDate}</span>
            <span className="mx-2">End Date: {event.endDate}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{event.creditHours}</span>
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
