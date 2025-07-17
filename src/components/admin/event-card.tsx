import { Event } from "@/types/events";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export const EventCard = (event: Event) => {
  const router = useRouter();
  const getStatusBadge = (status: Event["status"]) => {
    const variants = {
      Upcoming: "bg-blue-100 text-blue-800 hover:bg-blue-100",
      Completed: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      Ongoing: "bg-green-100 text-green-800 hover:bg-green-100",
    };
    return (
      <Badge className={variants[status] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  return (
    <Card className="mb-4 border-none shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-lg">{event.title}</h3>
              {getStatusBadge(event.status)}
            </div>
            <p className="text-sm text-gray-600 mb-1">
              {event.startDate} - {event.endDate} • {event.duration} • 245
              registered
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-base" onClick={() => router.push(`/admin/editEvent/${event.id}`)}>
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-base"
              onClick={() => router.push(`/admin/attendance/${event.id}`)}
            >
              Attendence
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
