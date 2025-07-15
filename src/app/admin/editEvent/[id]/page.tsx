'use client';

import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sun,
  Moon,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

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

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:4000/api/events/${eventId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const eventData = response.data;

        const formatDateForInput = (dateString: string) =>
          new Date(dateString).toISOString().split('T')[0];

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
      } catch (err) {
        console.error('Error fetching event data:', err);
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
      const payload = {
        ...formData,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        numDays
      };

      const token = localStorage.getItem('token');

      const response = await axios.put(
        `http://localhost:4000/api/events/${eventId}`,
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
      if (err.response?.data) {
        console.log('🔍 Backend says:', err.response.data);
      }
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
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="ml-2">Loading event data...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className={`rounded-lg p-6 shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Edit Event</h1>
              <p className="text-sm mt-1">Update the event details for your community</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition ${
                  isDarkMode ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title="Toggle dark mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <div className="flex items-center gap-2 text-blue-600">
                <Calendar className="w-5 h-5" />
                <span>ACM Student Chapter</span>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className={`rounded-lg p-6 shadow space-y-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
          <input name="title" value={formData.title} onChange={handleInputChange} placeholder="Event Title" className="w-full p-3 border rounded" required />
          <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Description" className="w-full p-3 border rounded" rows={4} required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full p-3 border rounded" required />
            <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full p-3 border rounded" required />
          </div>
          <input name="location" value={formData.location} onChange={handleInputChange} placeholder="Location" className="w-full p-3 border rounded" required />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="number" name="credits" value={formData.credits} onChange={handleInputChange} placeholder="Credits" className="w-full p-3 border rounded" required />
            <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} placeholder="Capacity" className="w-full p-3 border rounded" required />
          </div>
          <textarea name="prerequisite" value={formData.prerequisite} onChange={handleInputChange} placeholder="Prerequisites (optional)" className="w-full p-3 border rounded" rows={3} />

          {formData.startDate && formData.endDate && (
            <p className="text-sm text-blue-600">
              Duration: {calculateNumDays(formData.startDate, formData.endDate)} day(s)
            </p>
          )}

          {submitAttempted && submitStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded">
              <AlertCircle className="w-4 h-4" />
              <span>Failed to update event. Please try again.</span>
            </div>
          )}
          {submitStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded">
              <CheckCircle className="w-4 h-4" />
              <span>Event updated successfully! Redirecting...</span>
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/admin/dashboard')}
              className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? 'Updating...' : 'Update Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventPage;
