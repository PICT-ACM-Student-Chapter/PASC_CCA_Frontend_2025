"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit, Clock, MapPin, Award, Calendar } from 'lucide-react';
import { attendanceAPI, eventAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { formatDateTime } from '@/lib/utils';

interface AttendanceSession {
  id: number;
  eventId: number;
  startTime: string;
  endTime: string | null;
  isActive: boolean;
  sessionName: string;
  code: string;
  location: string;
  credits: number;
}

export default function SessionManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [eventId, setEventId] = useState<number>(0);
  const [eventTitle, setEventTitle] = useState<string>('');
  const [eventStartDate, setEventStartDate] = useState<string>(''); // ISO string
  const [eventEndDate, setEventEndDate] = useState<string>('');   // ISO string
  const [eventStatus, setEventStatus] = useState<string>('');
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingSession, setEditingSession] = useState<AttendanceSession | null>(null);
  const [formError, setFormError] = useState<string>('');
  const [formData, setFormData] = useState({
    sessionName: '',
    location: '',
    code: '',
    credits: 0,
    startTime: '',
    endTime: '',
    isActive: true,
  });

  useEffect(() => {
    const init = async () => {
      const { id } = await params;
      const numId = parseInt(id);
      setEventId(numId);

      // Fetch event details
      try {
        const eventResponse = await eventAPI.getById(numId);
        if (eventResponse.data?.success && eventResponse.data.data) {
          const event = eventResponse.data.data as any;
          setEventTitle(event.title);
          // Store event date boundaries (convert to local datetime-local format)
          const toLocalInput = (iso: string) => {
            const d = new Date(iso);
            return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16);
          };
          setEventStartDate(toLocalInput(event.startDate));
          setEventEndDate(toLocalInput(event.endDate));
          setEventStatus(event.status ?? '');
        }
      } catch (error) {
        console.error('Error fetching event:', error);
      }

      fetchSessions(numId);
    };
    init();
  }, [params]);

  const fetchSessions = async (id: number) => {
    try {
      const response = await attendanceAPI.getEventSessions(id);
      if (response.data?.success && response.data.data) {
        setSessions(response.data.data as any);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setFormError('');

    if (!formData.startTime) {
      setFormError('Please select a start time');
      return;
    }

    // Client-side date range validation
    if (eventStartDate && eventEndDate) {
      const eventStart = new Date(eventStartDate);
      const eventEnd = new Date(eventEndDate);
      const sessionStart = new Date(formData.startTime);

      if (sessionStart < eventStart || sessionStart > eventEnd) {
        setFormError(
          `Session start time must be within the event range: ${eventStartDate.replace('T', ' ')} – ${eventEndDate.replace('T', ' ')}`
        );
        return;
      }

      if (formData.endTime) {
        const sessionEnd = new Date(formData.endTime);
        if (sessionEnd < eventStart || sessionEnd > eventEnd) {
          setFormError(
            `Session end time must be within the event range: ${eventStartDate.replace('T', ' ')} – ${eventEndDate.replace('T', ' ')}`
          );
          return;
        }
        if (sessionEnd <= sessionStart) {
          setFormError('Session end time must be after the session start time.');
          return;
        }
      }
    }

    try {
      const payload = {
        sessionName: formData.sessionName,
        location: formData.location,
        code: formData.code,
        credits: formData.credits,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null,
        isActive: formData.isActive,
      };

      if (editingSession) {
        await attendanceAPI.updateSession(editingSession.id, payload);
      } else {
        await attendanceAPI.createSession(eventId, payload);
      }
      setShowDialog(false);
      resetForm();
      fetchSessions(eventId);
    } catch (error: any) {
      const msg = error?.response?.data?.error || error?.response?.data?.message || 'Failed to save session. Please try again.';
      setFormError(msg);
    }
  };

  // Note: Backend doesn't have a delete session endpoint
  // Sessions can be deactivated by setting isActive to false
  const handleDeactivate = async (session: AttendanceSession) => {
    if (!confirm(`Are you sure you want to ${session.isActive ? 'deactivate' : 'activate'} this session?`)) return;

    try {
      await attendanceAPI.updateSession(session.id, { isActive: !session.isActive });
      fetchSessions(eventId);
    } catch (error) {
      console.error('Error updating session:', error);
      alert('Failed to update session.');
    }
  };

  const handleEdit = (session: AttendanceSession) => {
    setEditingSession(session);

    const toLocalDatetime = (isoString: string | null) => {
      if (!isoString) return '';
      const d = new Date(isoString);
      return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    setFormData({
      sessionName: session.sessionName,
      location: session.location,
      code: session.code,
      credits: session.credits,
      startTime: toLocalDatetime(session.startTime),
      endTime: toLocalDatetime(session.endTime),
      isActive: session.isActive,
    });
    setShowDialog(true);
  };

  const resetForm = () => {
    setEditingSession(null);
    setFormError('');
    setFormData({
      sessionName: '',
      location: '',
      code: '',
      credits: 0,
      startTime: '',
      endTime: '',
      isActive: true,
    });
  };

  const generateCode = () => {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    setFormData({ ...formData, code });
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => router.back()}
              className="flex items-center text-blue-600 hover:text-blue-800 mb-2"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Back
            </button>
            <h1 className="text-3xl font-bold text-foreground">Session Management</h1>
            <p className="text-muted-foreground mt-1">{eventTitle}</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                resetForm();
                setShowDialog(true);
              }}
              className="flex items-center gap-2"
              disabled={eventStatus === 'COMPLETED'}
              title={eventStatus === 'COMPLETED' ? 'Cannot create sessions for a completed event' : undefined}
            >
              <Plus className="w-5 h-5" />
              Create Session
            </Button>
          </div>
        </div>

        {eventStatus === 'COMPLETED' && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
            This event is <strong>completed</strong>. New sessions cannot be created.
          </div>
        )}

        {/* Sessions List */}
        <div className="bg-card rounded-xl border border-border p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No sessions yet</p>
              <p className="text-sm">Create attendance sessions for this event</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.map(session => (
                <div
                  key={session.id}
                  className="border border-border rounded-lg p-4 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        {session.sessionName}
                      </h3>
                      <Badge variant={session.isActive ? "default" : "secondary"} className="mt-1">
                        {session.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(session)}
                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Edit session"
                      >
                        <Edit className="w-4 h-4 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDeactivate(session)}
                        className={`p-2 rounded-lg transition-colors ${session.isActive
                          ? 'hover:bg-red-100 dark:hover:bg-red-900/20'
                          : 'hover:bg-green-100 dark:hover:bg-green-900/20'
                          }`}
                        title={session.isActive ? 'Deactivate session' : 'Activate session'}
                      >
                        <Clock className={`w-4 h-4 ${session.isActive ? 'text-red-600' : 'text-green-600'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{session.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDateTime(session.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Award className="w-4 h-4" />
                      <span>{session.credits} credits</span>
                    </div>
                    <div className="mt-3 p-2 bg-accent rounded">
                      <p className="text-xs text-muted-foreground">Attendance Code:</p>
                      <p className="font-mono font-bold text-lg">{session.code}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSession ? 'Edit Session' : 'Create Session'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Session Name</label>
              <Input
                value={formData.sessionName}
                onChange={(e) => setFormData({ ...formData, sessionName: e.target.value })}
                placeholder="e.g., Day 1 - Morning Session"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Location</label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Auditorium A"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Attendance Code</label>
              <div className="flex gap-2">
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., ABC123"
                  className="flex-1"
                />
                <Button type="button" onClick={generateCode} variant="outline">
                  Generate
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Credits</label>
              <Input
                type="number"
                value={formData.credits === 0 ? '' : formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: parseFloat(e.target.value) || 0 })}
                placeholder="e.g., 1"
                min="0"
                step="0.5"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Start Time</label>
                <Input
                  type="datetime-local"
                  value={formData.startTime}
                  min={eventStartDate}
                  max={eventEndDate}
                  onChange={(e) => { setFormError(''); setFormData({ ...formData, startTime: e.target.value }); }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">End Time (Optional)</label>
                <Input
                  type="datetime-local"
                  value={formData.endTime}
                  min={formData.startTime || eventStartDate}
                  max={eventEndDate}
                  onChange={(e) => { setFormError(''); setFormData({ ...formData, endTime: e.target.value }); }}
                />
              </div>
            </div>

            {/* Date range hint */}
            {eventStartDate && eventEndDate && (
              <p className="text-xs text-muted-foreground">
                Session times must be within event range:{' '}
                <span className="font-medium">{eventStartDate.replace('T', ' ')}</span>
                {' '}–{' '}
                <span className="font-medium">{eventEndDate.replace('T', ' ')}</span>
              </p>
            )}

            {/* Validation error */}
            {formError && (
              <p className="text-sm text-red-500 font-medium">{formError}</p>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isActive" className="text-sm">
                Session is active (students can mark attendance)
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingSession ? 'Update' : 'Create'} Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}


