'use client';
import { useRouter } from "next/navigation";
import axios from "axios";
import React, { useState } from 'react';
import {
  Calendar,
  Sun,
  Moon,
  CheckCircle,
  AlertCircle,
  MapPin,
  Users,
  Award,
  Clock,
  FileText,
  Sparkles,
  Plus,
  ArrowLeft
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { apiUrl } from "@/lib/utils";
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

const Page: React.FC = () => {
  const router = useRouter();
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
  const [submitStatus, setSubmitStatus] = useState<null | 'success' | 'error'>(null);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      // Handle number inputs - use parseInt for capacity (must be integer), parseFloat for credits
      if (name === 'capacity') {
        const numValue = value === '' ? 0 : parseInt(value, 10);
        setFormData(prev => ({
          ...prev,
          [name]: isNaN(numValue) ? 0 : numValue
        }));
      } else {
        const numValue = value === '' ? 0 : parseFloat(value);
        setFormData(prev => ({
          ...prev,
          [name]: isNaN(numValue) ? 0 : numValue
        }));
      }
    } else {
      // Handle text inputs
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const calculateNumDays = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  const handleSubmit = async () => {
    // Check for any missing fields
    const { title, description, startDate, endDate, location, credits, capacity } = formData;
    if (
      !title.trim() ||
      !description.trim() ||
      !startDate ||
      !endDate ||
      !location.trim() ||
      credits <= 0 ||
      capacity <= 0
    ) {
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

      console.log("📦 Payload being sent to backend:", payload);
      console.log("📊 Payload types:", {
        title: typeof payload.title,
        description: typeof payload.description,
        location: typeof payload.location,
        credits: typeof payload.credits,
        capacity: typeof payload.capacity,
        numDays: typeof payload.numDays,
        startDate: typeof payload.startDate,
        endDate: typeof payload.endDate,
      });
      console.log("📋 Payload values:", {
        credits: payload.credits,
        capacity: payload.capacity,
        numDays: payload.numDays,
      });

      const res = await axios.post(`${apiUrl}/events`, payload, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      console.log("✅ Event created successfully:", res.data);

      setSubmitStatus('success');

      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        credits: 0,
        capacity: 0,
        prerequisite: '',
      });

      // Redirect after success with delay
      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 2000);
    } catch (err: any) {
      console.error('❌ Error creating event:', err);
      console.error('Error response:', err.response?.data);
      setSubmitStatus('error');

      // Show detailed validation errors if available
      if (err.response?.data?.details) {
        const validationErrors = err.response.data.details
          .map((detail: any) => `${detail.field}: ${detail.message}`)
          .join('\n');
        alert(`Validation failed:\n\n${validationErrors}`);
      } else {
        const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to create event. Please try again.';
        alert(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode
      ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800'
      : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className={`absolute inset-0 bg-grid-pattern ${isDarkMode ? 'opacity-30' : 'opacity-20'}`}></div>
      </div>

      <div className="relative container mx-auto px-4 py-8 max-w-5xl">
        {/* Navigation Header */}
        <div className="mb-6">
          <button
            className={`flex items-center text-blue-600 hover:text-blue-800 transition-colors ${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'
              }`}
            onClick={() => router.push('/admin/dashboard')}
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Animated Header */}
        <div className={`rounded-2xl shadow-2xl mb-8 overflow-hidden backdrop-blur-xl border transition-all duration-300 hover:shadow-3xl ${isDarkMode
          ? 'bg-gray-800/60 border-gray-700/50 shadow-black/20'
          : 'bg-white/60 border-white/50 shadow-blue-500/10'
          }`}>
          <div className="p-8 lg:p-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">

                  <p className={`text-3xl lg:text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                    Create New Event
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={toggleDarkMode}
                  className={`group p-3 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 ${isDarkMode
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 shadow-lg shadow-amber-400/25 hover:shadow-amber-400/40'
                    : 'bg-gradient-to-r from-slate-700 to-gray-800 text-white shadow-lg shadow-gray-700/25 hover:shadow-gray-700/40'
                    }`}
                  title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDarkMode ? (
                    <Sun className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300" />
                  ) : (
                    <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform duration-300" />
                  )}
                </button>

                <div className={`flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 ${isDarkMode
                  ? 'bg-blue-900/30 text-blue-300 border border-blue-700/30'
                  : 'bg-blue-100 text-blue-700 border border-blue-200'
                  }`}>
                  <Calendar className="w-5 h-5" />
                  <span className="font-semibold">ACM Student Chapter</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className={`rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl border transition-all duration-300 ${isDarkMode
          ? 'bg-gray-800/60 border-gray-700/50 shadow-black/20'
          : 'bg-white/70 border-white/50 shadow-blue-500/10'
          }`}>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="p-8 lg:p-10">
            <div className="grid gap-8">
              {/* Event Title */}
              <div className="group space-y-3">
                <label className={`flex items-center gap-3 text-sm font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-200 group-hover:text-blue-400' : 'text-gray-700 group-hover:text-blue-600'
                  }`}>
                  <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-blue-500/20' : 'bg-blue-500/10'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  Event Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter an engaging and memorable event title..."
                  className={`w-full px-5 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 focus:scale-[1.02] ${isDarkMode
                    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-700/70 hover:border-gray-500'
                    : 'bg-white/70 border-gray-200 text-gray-900 placeholder-gray-500 hover:bg-white/90 hover:border-gray-300'
                    }`}
                  required
                />
              </div>

              {/* Description */}
              <div className="group space-y-3">
                <label className={`flex items-center gap-3 text-sm font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-200 group-hover:text-purple-400' : 'text-gray-700 group-hover:text-purple-600'
                  }`}>
                  <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-500/10'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  Event Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe what makes this event special and why people should attend..."
                  rows={5}
                  className={`w-full px-5 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 focus:scale-[1.01] resize-none ${isDarkMode
                    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-700/70 hover:border-gray-500'
                    : 'bg-white/70 border-gray-200 text-gray-900 placeholder-gray-500 hover:bg-white/90 hover:border-gray-300'
                    }`}
                  required
                />
              </div>

              {/* Date Range */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="group space-y-3">
                  <label className={`flex items-center gap-3 text-sm font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-200 group-hover:text-green-400' : 'text-gray-700 group-hover:text-green-600'
                    }`}>
                    <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-green-500/20' : 'bg-green-500/10'}`}>
                      <Calendar className="w-4 h-4" />
                    </div>
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 focus:scale-[1.02] ${isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700/70 hover:border-gray-500'
                      : 'bg-white/70 border-gray-200 text-gray-900 hover:bg-white/90 hover:border-gray-300'
                      }`}
                    required
                  />
                </div>

                <div className="group space-y-3">
                  <label className={`flex items-center gap-3 text-sm font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-200 group-hover:text-green-400' : 'text-gray-700 group-hover:text-green-600'
                    }`}>
                    <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-green-500/20' : 'bg-green-500/10'}`}>
                      <Calendar className="w-4 h-4" />
                    </div>
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-green-500/20 focus:border-green-500 focus:scale-[1.02] ${isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 text-white hover:bg-gray-700/70 hover:border-gray-500'
                      : 'bg-white/70 border-gray-200 text-gray-900 hover:bg-white/90 hover:border-gray-300'
                      }`}
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="group space-y-3">
                <label className={`flex items-center gap-3 text-sm font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-200 group-hover:text-red-400' : 'text-gray-700 group-hover:text-red-600'
                  }`}>
                  <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-red-500/20' : 'bg-red-500/10'}`}>
                    <MapPin className="w-4 h-4" />
                  </div>
                  Event Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Where will this amazing event take place?"
                  className={`w-full px-5 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 focus:scale-[1.02] ${isDarkMode
                    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-700/70 hover:border-gray-500'
                    : 'bg-white/70 border-gray-200 text-gray-900 placeholder-gray-500 hover:bg-white/90 hover:border-gray-300'
                    }`}
                  required
                />
              </div>

              {/* Credits and Capacity */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="group space-y-3">
                  <label className={`flex items-center gap-3 text-sm font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-200 group-hover:text-yellow-400' : 'text-gray-700 group-hover:text-yellow-600'
                    }`}>
                    <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-yellow-500/20' : 'bg-yellow-500/10'}`}>
                      <Award className="w-4 h-4" />
                    </div>
                    Academic Credits
                  </label>
                  <input
                    type="number"
                    name="credits"
                    value={formData.credits === 0 ? '' : formData.credits}
                    onChange={handleInputChange}
                    placeholder="e.g., 2.5"
                    min="0"
                    step="0.5"
                    className={`w-full px-5 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-yellow-500/20 focus:border-yellow-500 focus:scale-[1.02] ${isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-700/70 hover:border-gray-500'
                      : 'bg-white/70 border-gray-200 text-gray-900 placeholder-gray-500 hover:bg-white/90 hover:border-gray-300'
                      }`}
                    required
                  />
                </div>

                <div className="group space-y-3">
                  <label className={`flex items-center gap-3 text-sm font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-200 group-hover:text-indigo-400' : 'text-gray-700 group-hover:text-indigo-600'
                    }`}>
                    <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-indigo-500/20' : 'bg-indigo-500/10'}`}>
                      <Users className="w-4 h-4" />
                    </div>
                    Event Capacity
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity === 0 ? '' : formData.capacity}
                    onChange={handleInputChange}
                    placeholder="e.g., 50"
                    min="1"
                    className={`w-full px-5 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 focus:scale-[1.02] ${isDarkMode
                      ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-700/70 hover:border-gray-500'
                      : 'bg-white/70 border-gray-200 text-gray-900 placeholder-gray-500 hover:bg-white/90 hover:border-gray-300'
                      }`}
                    required
                  />
                </div>
              </div>

              {/* Prerequisites */}
              <div className="group space-y-3">
                <label className={`flex items-center gap-3 text-sm font-bold uppercase tracking-wider transition-colors ${isDarkMode ? 'text-gray-200 group-hover:text-pink-400' : 'text-gray-700 group-hover:text-pink-600'
                  }`}>
                  <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-pink-500/20' : 'bg-pink-500/10'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  Prerequisites (Optional)
                </label>
                <textarea
                  name="prerequisite"
                  value={formData.prerequisite}
                  onChange={handleInputChange}
                  placeholder="Any requirements, skills, or knowledge needed for attendees..."
                  rows={4}
                  className={`w-full px-5 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-4 focus:ring-pink-500/20 focus:border-pink-500 focus:scale-[1.01] resize-none ${isDarkMode
                    ? 'bg-gray-700/50 border-gray-600 text-white placeholder-gray-400 hover:bg-gray-700/70 hover:border-gray-500'
                    : 'bg-white/70 border-gray-200 text-gray-900 placeholder-gray-500 hover:bg-white/90 hover:border-gray-300'
                    }`}
                />
              </div>

              {/* Duration Display */}
              {formData.startDate && formData.endDate && (
                <Alert className={`border-2 rounded-xl transition-all duration-300 hover:scale-[1.01] ${isDarkMode
                  ? 'bg-cyan-900/20 border-cyan-600/30 text-cyan-300'
                  : 'bg-cyan-50 border-cyan-200 text-cyan-700'
                  }`}>
                  <Clock className="w-5 h-5" />
                  <AlertDescription className="flex items-center gap-3 text-base">
                    <span className="font-medium">Event Duration:</span>
                    <span className={`font-bold text-lg px-3 py-1 rounded-lg ${isDarkMode ? 'bg-cyan-500/20 text-cyan-300' : 'bg-cyan-500/10 text-cyan-700'
                      }`}>
                      {calculateNumDays(formData.startDate, formData.endDate)} day(s)
                    </span>
                  </AlertDescription>
                </Alert>
              )}

              {/* Status Messages */}
              {submitStatus === 'success' && (
                <Alert className="border-2 border-green-300 bg-green-50 text-green-800 rounded-xl animate-pulse">
                  <CheckCircle className="w-5 h-5" />
                  <AlertDescription className="font-bold text-base flex items-center gap-2">
                    Event created successfully! 🎉 Redirecting to dashboard...
                  </AlertDescription>
                </Alert>
              )}

              {submitStatus === 'error' && (
                <Alert className="border-2 border-red-300 bg-red-50 text-red-800 rounded-xl">
                  <AlertCircle className="w-5 h-5" />
                  <AlertDescription className="font-bold text-base">
                    Failed to create event. Please check all fields and try again.
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="bg-blue-500 text-lg py-2 px-4 text-white hover:bg-blue-600 w-full"
              >
                <Plus className="h-6 w-6 mr-2" />
                {isSubmitting ? 'Creating Event...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: radial-gradient(circle, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
};

export default Page;