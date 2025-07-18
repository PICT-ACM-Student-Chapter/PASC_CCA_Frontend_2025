'use client';

import React, { useState, KeyboardEvent, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Download,
  Edit3,
  Power,
  PowerOff,
  Trash2,
  Calendar,
} from 'lucide-react';
import { useParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import axios from 'axios';

interface Session {
  id: number;
  sessionName: string;
  location: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  present: number;
  absent: number;
  total: number;
  code?: string; // Add code field
}

const AttendanceManagement: React.FC = () => {
  
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId;
  const [sessions, setSessions] = useState<Session[]>([]); // Start with no sessions
  const [activeSession, setActiveSession] = useState<number | null>(null);
  const [editingSession, setEditingSession] = useState<number | null>(null);
  const [editingDate, setEditingDate] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSession, setNewSession] = useState({
    sessionName: '',
    location: '',
    startTime: '',
    endTime: '',
    isActive: true,
  });
  const [editSessionId, setEditSessionId] = useState<number | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!eventId) return;
      try {
        const res = await axios.get(`http://localhost:4000/api/attendance/events/${eventId}/sessions`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (res.data && res.data.success && Array.isArray(res.data.data)) {
          setSessions(
            res.data.data.map((s: any) => ({
              id: s.id,
              sessionName: s.sessionName,
              location: s.location,
              startTime: s.startTime,
              endTime: s.endTime,
              isActive: s.isActive,
              present: 0, // Placeholder, update if you have stats
              absent: 0,  // Placeholder, update if you have stats
              total: 0,   // Placeholder, update if you have stats
              code: s.code, // Store code
            }))
          );
        }
      } catch (err) {
        console.error('Failed to fetch sessions:', err);
      }
    };
    fetchSessions();
  }, [eventId]);

  const handleOpenAddModal = () => {
    setShowAddModal(true);
    setEditSessionId(null);
    setNewSession({ sessionName: '', location: '', startTime: '', endTime: '', isActive: true });
  };

  const handleOpenEditModal = (session: Session) => {
    setShowAddModal(true);
    setEditSessionId(session.id);
    setNewSession({
      sessionName: session.sessionName,
      location: session.location,
      startTime: session.startTime,
      endTime: session.endTime,
      isActive: session.isActive,
    });
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setEditSessionId(null);
    setNewSession({ sessionName: '', location: '', startTime: '', endTime: '', isActive: true });
  };

  const handleNewSessionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewSession((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAddOrEditSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editSessionId !== null) {
      // Edit mode (leave as is for now)
      setSessions((prev) =>
        prev.map((session) =>
          session.id === editSessionId
            ? {
                ...session,
                sessionName: newSession.sessionName,
                location: newSession.location,
                startTime: newSession.startTime,
                endTime: newSession.endTime,
                isActive: newSession.isActive,
              }
            : session
        )
      );
    } else {
      // Add mode: make API request
      if (!eventId) {
        alert('Event ID not found in URL.');
        return;
      }
      try {
        const payload = {
          sessionName: newSession.sessionName,
          location: newSession.location,
          startTime: new Date(newSession.startTime).toISOString(),
          endTime: new Date(newSession.endTime).toISOString(),
          isActive: newSession.isActive,
        };
        await axios.post(`http://localhost:4000/api/attendance/events/${eventId}/sessions`, payload, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } catch (err) {
        console.log(err);
        alert('Failed to add session.');
      
        return;
      }
      setSessions((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          sessionName: newSession.sessionName,
          location: newSession.location,
          startTime: newSession.startTime,
          endTime: newSession.endTime,
          isActive: newSession.isActive,
          present: 0,
          absent: 0,
          total: 0,
        },
      ]);
    }
    handleCloseAddModal();
  };

  const toggleSession = (sessionId: number) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId
          ? { ...session, isActive: !session.isActive }
          : session
      )
    );
  };

  const updateSessionTitle = (sessionId: number, newTitle: string) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId ? { ...session, sessionName: newTitle } : session
      )
    );
    setEditingSession(null);
  };

  const updateSessionDate = (sessionId: number, newDate: string) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId ? { ...session, date: newDate } : session
      )
    );
    setEditingDate(null);
  };

  const deleteSession = (sessionId: number) => {
    // Remove restriction: allow deleting the last session
    const remainingSessions = sessions.filter((s) => s.id !== sessionId);
    setSessions(remainingSessions);

    if (activeSession === sessionId) {
      setActiveSession(remainingSessions[0]?.id ?? null);
    }
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleExport = () => {
    const activeSessionData = sessions.find((s) => s.id === activeSession);
    console.log('Exporting attendance data for:', activeSessionData?.sessionName);
    // TODO: Add actual export logic
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button className="flex items-center text-blue-600 hover:text-blue-800" onClick={() => router.push('/admin/dashboard')}>
              <ArrowLeft className="w-5 h-5 mr-1" />
              <span>Back to admin dashboard</span>
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <div className="flex items-center justify-between mt-4">
            <p className="text-lg text-gray-600">Web Dev SIG</p>
            <div className="text-sm text-gray-500">3/15/2024 - 8/5/2024</div>
          </div>
        </div>

        {/* Session List */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Select Session</h2>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Session
            </button>
          </div>
          {sessions.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p className="mb-4">No sessions yet. Click 'Add Session' to create one.</p>
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Session
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                    activeSession === session.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveSession(session.id)}
                >
                  <div className="flex items-center justify-end space-x-2 mb-3 pb-2 border-b border-gray-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenEditModal(session);
                      }}
                      className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                      title="Edit Session"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSession(session.id);
                      }}
                      className={`p-1.5 rounded-md ${
                        session.isActive
                          ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                      }`}
                      title={session.isActive ? 'Disable Session' : 'Enable Session'}
                    >
                      {session.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSession(session.id);
                      }}
                      className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50"
                      title="Delete Session"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Title */}
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-900">{session.sessionName}</span>
                  </div>
                  {/* Location */}
                  <div className="mb-3">
                    <span className="text-xs text-gray-500">{session.location}</span>
                  </div>
                  {/* Start/End Time */}
                  <div className="mb-3">
                    <span className="text-xs text-gray-500">
                      {new Date(session.startTime).toLocaleString()} - {new Date(session.endTime).toLocaleString()}
                    </span>
                  </div>
                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        session.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {session.isActive ? 'Active' : 'Disabled'}
                    </span>
                    {activeSession === session.id && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attendance Stats */}
        {sessions.length > 0 && activeSession !== null && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Attendance For {sessions.find((s) => s.id === activeSession)?.sessionName}
              </h2>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Enable Attendance</span>
                  <button
                    onClick={() => toggleSession(activeSession)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      sessions.find((s) => s.id === activeSession)?.isActive
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        sessions.find((s) => s.id === activeSession)?.isActive
                          ? 'translate-x-6'
                          : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                <button
                  onClick={handleExport}
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Show code if session is active */}
            {(() => {
              const session = sessions.find((s) => s.id === activeSession);
              if (session && session.isActive && session.code) {
                return (
                  <div className="my-8 flex justify-center">
                    <div className="text-5xl font-extrabold tracking-widest text-blue-700 bg-blue-100 px-8 py-6 rounded-lg shadow">
                      {session.code}
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard label="Present" color="green" value={sessions.find(s => s.id === activeSession)?.present ?? 0} />
              <StatCard label="Absent" color="red" value={sessions.find(s => s.id === activeSession)?.absent ?? 0} />
              <StatCard label="Total" color="blue" value={sessions.find(s => s.id === activeSession)?.total ?? 0} />
            </div>
          </div>
        )}
      </div>

      {/* Add Session Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              onClick={handleCloseAddModal}
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-4">{editSessionId !== null ? 'Edit Session' : 'Add New Session'}</h3>
            <form onSubmit={handleAddOrEditSession} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Session Name</label>
                <input
                  type="text"
                  name="sessionName"
                  value={newSession.sessionName}
                  onChange={handleNewSessionChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={newSession.location}
                  onChange={handleNewSessionChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Start Time</label>
                <input
                  type="datetime-local"
                  name="startTime"
                  value={newSession.startTime}
                  onChange={handleNewSessionChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Time</label>
                <input
                  type="datetime-local"
                  name="endTime"
                  value={newSession.endTime}
                  onChange={handleNewSessionChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={newSession.isActive}
                  onChange={handleNewSessionChange}
                  className="mr-2"
                />
                <label className="text-sm">Active</label>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
              >
                {editSessionId !== null ? 'Save Changes' : 'Add Session'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; color: string; value: number }> = ({
  label,
  color,
  value,
}) => {
  return (
    <div className={`bg-${color}-50 border border-${color}-200 rounded-lg p-6 text-center`}>
      <div className={`text-3xl font-bold text-${color}-600 mb-2`}>{value}</div>
      <div className={`text-${color}-800 font-medium`}>{label}</div>
    </div>
  );
};

export default AttendanceManagement;
