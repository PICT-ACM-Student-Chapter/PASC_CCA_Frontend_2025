'use client';
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, MapPin, Phone, ArrowLeft } from "lucide-react";
import { getStatusBadgeVariant, getStatusColor } from "@/lib/utils";
import axios from "axios";
import { EventAttendanceSessionForUser } from "@/types/attendance";
import type { Event } from "@/types/events";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";


function formatDateToDDMMYY(dateString: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const router = useRouter();
  const [event, setEvent] = useState<EventAttendanceSessionForUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendanceModal, setAttendanceModal] = useState<{ open: boolean; sessionId: number | null }>({ open: false, sessionId: null });
  const [attendanceCode, setAttendanceCode] = useState("");
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const [attendanceSuccess, setAttendanceSuccess] = useState<string | null>(null);


  useEffect(() => {
    const resolveParamsAndFetch = async () => {
      try {
        setLoading(true);
        const  {id}  = await params;
        console.log(id);
        const token = localStorage.getItem("token");
        console.log("getting the event.")
        const res = await axios.get(
          `http://localhost:4000/api/attendance/user/events/${id}/sessions`,
          {
            headers: {
              'Content-type' : 'Application/json',
              'Authorization': `Bearer ${token}`
            },
          }
        );
        setEvent(res.data.data);
      } catch (err) {
        setError("Failed to fetch event");
        setEvent(null);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    resolveParamsAndFetch();
  }, [params]);

  // Handler for mark attendance
  const handleMarkAttendance = async () => {
    if (!attendanceCode || !attendanceModal.sessionId) return;
    setAttendanceLoading(true);
    setAttendanceError(null);
    setAttendanceSuccess(null);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:4000/api/attendance/events/${eventDetails?.id}/sessions/${attendanceModal.sessionId}/attend`,
        {
          code: attendanceCode,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (res.data && res.data.success) {
        setAttendanceSuccess("Attendance marked successfully!");
        setTimeout(() => {
          setAttendanceModal({ open: false, sessionId: null });
          setAttendanceCode("");
          setAttendanceSuccess(null);
        }, 1200);
      } else {
        setAttendanceError(res.data?.message || "Failed to mark attendance.");
      }
    } catch (err: any) {
      console.error('Attendance error:', err?.response?.data?.message);
      setAttendanceError(err?.response?.data?.message || "Failed to mark attendance.");
    } finally {
      setAttendanceLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Event Not Found</h2>
          <p className="text-gray-600 mt-2">
            {error || "The event you are looking for does not exist."}
          </p>
        </div>
      </div>
    );
  } 

  // TODO: Fix typing once API response is finalized
  const eventDetails: any = event.event;

  return (
    <div className="max-w-7xl w-full mx-auto px-4 py-8">
      {/* Navigation Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button 
          className="flex items-center text-blue-600 hover:text-blue-800"
          onClick={() => router.push('/student/events')}
        >
          <ArrowLeft className="w-5 h-5 mr-1" />
          <span>Back to Events</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Event Title Card */}
          <Card className="border-none shadow-sm hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {eventDetails?.title}
                </CardTitle>
                <Badge
                  variant={getStatusBadgeVariant(eventDetails?.status)}
                  className={getStatusColor(eventDetails?.status)}
                >
                  {eventDetails?.status}
                </Badge>
              </div>
              <p className="text-gray-600 leading-relaxed mt-4">
                {eventDetails?.description}
              </p>
            </CardHeader>
          </Card>

          {/* Prerequisites */}
          <Card className="border-none shadow-sm hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Prerequisites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{eventDetails?.prerequisite}</p>
            </CardContent>
          </Card>

          {/* Sessions List (Student View) */}
          <Card className="border-none shadow-sm hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {Array.isArray(event.session) && event.session.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                  {event.session.map((session: any) => (
                    <div
                      key={session.id}
                      className={`border rounded-lg p-4 transition-all bg-gray-50`}
                    >
                      {/* Title */}
                      <div className="mb-2">
                        <span className="text-base font-medium text-gray-900">{session.sessionName}</span>
                      </div>
                      {/* Location */}
                      <div className="mb-1">
                        <span className="text-xs text-gray-500">{session.location}</span>
                      </div>
                      {/* Start/End Time */}
                      <div className="mb-1">
                        <span className="text-xs text-gray-500">
                          {session.startTime ? new Date(session.startTime).toLocaleString() : "-"} - {session.endTime ? new Date(session.endTime).toLocaleString() : "-"}
                        </span>
                      </div>
                      {/* Status */}
                      <div className="mt-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            session.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {session.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                      {/* Mark Attendance Button */}
                      {session.isActive && (
                        <div className="mt-4">
                          {session.attended ? (
                            <Button
                              className="w-full bg-green-400 text-white font-semibold"
                              disabled
                            >
                              Attendance Marked
                            </Button>
                          ) : (
                            <Button
                              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors duration-200"
                              onClick={() => setAttendanceModal({ open: true, sessionId: session.id })}
                            >
                              Mark Attendance
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500">No sessions available for this event.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Event Details */}
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
                  <p className="text-gray-600 text-sm">{eventDetails?.startDate}</p>
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
                  <p className="text-gray-600 text-sm">{eventDetails?.endDate}</p>
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
                  <p className="text-gray-600 text-sm">{eventDetails?.credits}</p>
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
                  <p className="text-gray-600 text-sm">{eventDetails?.location}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact
          <Card className="border-none shadow-sm hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">Contact:</p>
                  <p className="text-gray-600 text-sm">{eventDetails?.contact}</p>
                </div>
              </div>
            </CardContent>
          </Card> */}
        </div>
      </div>

      {/* Attendance Code Modal */}
      <Dialog open={attendanceModal.open} onOpenChange={open => setAttendanceModal(v => ({ ...v, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Attendance Code</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Enter code"
            value={attendanceCode}
            onChange={e => setAttendanceCode(e.target.value)}
            disabled={attendanceLoading}
            className="mb-2"
          />
          {attendanceError && <div className="text-red-600 text-sm mb-2">{attendanceError}</div>}
          {attendanceSuccess && <div className="text-green-600 text-sm mb-2">{attendanceSuccess}</div>}
          <DialogFooter>
            <Button
              onClick={handleMarkAttendance}
              disabled={attendanceLoading || !attendanceCode}
              className="bg-green-600 hover:bg-green-700"
            >
              {attendanceLoading ? "Marking..." : "Submit"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setAttendanceModal({ open: false, sessionId: null });
                setAttendanceCode("");
                setAttendanceError(null);
                setAttendanceSuccess(null);
              }}
              disabled={attendanceLoading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}