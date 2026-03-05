'use client';

import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import React, { useState, useEffect, useRef } from 'react';
import {
  AlertCircle,
  Loader2,
  Users,
  FileText,
  Image as ImageIcon,
  Clock,
  Settings,
  CheckCircle,
  Calendar,
  Sun,
  Moon
} from 'lucide-react';
import { apiUrl } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AttendeeList } from "@/components/admin/AttendeeList";
import { ResourceManager } from "@/components/admin/ResourceManager";
import { GalleryManager } from "@/components/admin/GalleryManager";
import { SessionManager } from "@/components/admin/SessionManager";

interface FormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  credits: number;
  capacity: number;
  prerequisite: string;
}

const EditEventPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    credits: 0,
    capacity: 0,
    prerequisite: '',
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [submitStatus, setSubmitStatus] = useState<null | 'success' | 'error'>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Prevent duplicate fetches
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    const fetchEventData = async () => {
      // Prevent duplicate API calls
      if (hasFetchedRef.current) return;
      hasFetchedRef.current = true;

      try {
        setIsLoading(true);
        setErrorMessage('');
        const token = localStorage.getItem('token');
        const response = await axios.get(`${apiUrl}/events/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const eventData = response.data.data;

        const formatDateForInput = (dateString: string) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return '';

          // Use local methods since the stored date string is already ISO converted from local
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');

          return `${year}-${month}-${day}`;
        };

        setFormData({
          title: eventData.title || '',
          description: eventData.description || '',
          startDate: formatDateForInput(eventData.startDate),
          endDate: formatDateForInput(eventData.endDate),
          location: eventData.location || '',
          credits: eventData.credits || 0,
          capacity: eventData.capacity || 0,
          prerequisite: eventData.prerequisite || '',
        });
      } catch (err: any) {
        console.error('Error fetching event data:', err);

        if (err.response?.status === 429) {
          setErrorMessage('Too many requests. Please wait a moment and refresh the page.');
        } else if (err.response?.status === 404) {
          setErrorMessage('Event not found.');
        } else if (err.response?.status === 401 || err.response?.status === 403) {
          setErrorMessage('You do not have permission to edit this event.');
        } else {
          setErrorMessage('Failed to load event data. Please try again.');
        }

        setSubmitStatus('error');
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) fetchEventData();
  }, [eventId]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const calculateNumDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
  };

  const handleSubmit = async () => {
    setSubmitAttempted(true);

    const { title, description, startDate, endDate, location, credits, capacity } = formData;
    if (!title.trim() || !description.trim() || !startDate || !endDate || !location.trim() || credits <= 0 || capacity <= 0) {
      setSubmitStatus('error');
      alert('Please fill in all the fields correctly before submitting.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const numDays = calculateNumDays(startDate, endDate);

      // Create local date objects at the exact start (00:00:00) and end (23:59:59) of the day
      const startDateObj = new Date(startDate + 'T00:00:00');
      const endDateObj = new Date(endDate + 'T23:59:59');

      const payload = {
        ...formData,
        startDate: startDateObj.toISOString(),
        endDate: endDateObj.toISOString(),
        numDays
      };

      const token = localStorage.getItem('token');

      const response = await axios.put(
        `${apiUrl}/events/${eventId}`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log("✅ Event updated:", response.data);
      setSubmitStatus('success');
      setTimeout(() => router.push('/admin/dashboard'), 1500);
    } catch (err: any) {
      console.error('❌ Error updating event:', err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
        <div className="max-w-4xl mx-auto">
          <div className={`rounded-lg p-6 shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {errorMessage ? (
              <div className="flex flex-col items-center justify-center py-20">
                <AlertCircle className="w-12 h-12 text-red-600 mb-4" />
                <p className="text-lg font-semibold mb-2">Error Loading Event</p>
                <p className="text-sm text-gray-600">{errorMessage}</p>
                <button
                  onClick={() => router.push('/admin/dashboard')}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Back to Dashboard
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span className="ml-2">Loading event data...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className={`rounded-lg p-6 shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Edit Event</h1>
              <p className="text-sm mt-1">Update the event details and manage resources</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                type="button"
                className={`p-2 rounded-lg transition ${isDarkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                title="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2 text-blue-600">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">ACM Student Chapter</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Edit Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className={`rounded-lg p-6 shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Event Configuration
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground font-bold">Event Title</label>
                  <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Event Title" className={`w-full p-3 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white placeholder:text-gray-400'}`} required />
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground font-bold">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" className={`w-full p-3 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white placeholder:text-gray-400'}`} rows={4} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground font-bold">Start Date</label>
                    <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className={`w-full p-3 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground font-bold">End Date</label>
                    <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className={`w-full p-3 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white'}`} required />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground font-bold">Location</label>
                  <input name="location" value={formData.location} onChange={handleInputChange} placeholder="Location" className={`w-full p-3 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white placeholder:text-gray-400'}`} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground font-bold">Credits</label>
                    <input type="number" name="credits" value={formData.credits} onChange={handleInputChange} placeholder="Credits" className={`w-full p-3 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white placeholder:text-gray-400'}`} required />
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-muted-foreground font-bold">Capacity</label>
                    <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} placeholder="Capacity" className={`w-full p-3 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white placeholder:text-gray-400'}`} required />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground font-bold">Prerequisites</label>
                  <textarea name="prerequisite" value={formData.prerequisite} onChange={handleInputChange} placeholder="Prerequisites (optional)" className={`w-full p-3 border rounded ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : 'bg-white placeholder:text-gray-400'}`} rows={3} />
                </div>

                {formData.startDate && formData.endDate && (
                  <p className={`text-sm ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    Duration: {calculateNumDays(formData.startDate, formData.endDate)} day(s)
                  </p>
                )}

                {submitAttempted && submitStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded shadow-sm border border-red-100">
                    <AlertCircle className="w-4 h-4" />
                    <span>Failed to update event. Please try again.</span>
                  </div>
                )}
                {submitStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded shadow-sm border border-green-100">
                    <CheckCircle className="w-4 h-4" />
                    <span>Event updated successfully!</span>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-8 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all font-semibold"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isSubmitting ? 'Saving Changes...' : 'Save All Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push('/admin/dashboard')}
                    className={`px-8 py-2.5 rounded-lg border font-semibold transition-colors ${isDarkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* Attendance Session Management */}
            <div className={`rounded-lg p-6 shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <SessionManager eventId={Number(eventId)} />
            </div>
          </div>

          {/* Sidebar Management */}
          <div className="space-y-6">
            <Tabs defaultValue="attendees" className="w-full">
              <div className={`rounded-lg p-2 shadow mb-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="attendees" className="rounded-md">
                    <Users className="w-4 h-4 mr-2 hidden md:block" />
                    <span>RSVPs</span>
                  </TabsTrigger>
                  <TabsTrigger value="resources" className="rounded-md">
                    <FileText className="w-4 h-4 mr-2 hidden md:block" />
                    <span>Files</span>
                  </TabsTrigger>
                  <TabsTrigger value="gallery" className="rounded-md">
                    <ImageIcon className="w-4 h-4 mr-2 hidden md:block" />
                    <span>Gallery</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <div className={`rounded-lg p-6 shadow min-h-[400px] ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <TabsContent value="attendees" className="mt-0">
                  <AttendeeList eventId={Number(eventId)} />
                </TabsContent>
                <TabsContent value="resources" className="mt-0">
                  <ResourceManager eventId={Number(eventId)} />
                </TabsContent>
                <TabsContent value="gallery" className="mt-0">
                  <GalleryManager eventId={Number(eventId)} />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEventPage;
