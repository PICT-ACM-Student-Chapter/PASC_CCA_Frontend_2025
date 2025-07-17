'use client';
import { useRouter } from "next/navigation";
import axios from "axios";
import React, { useState } from 'react';
import {
  Calendar,
  Sun,
  Moon,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { head } from "framer-motion/client";

interface FormData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  credits: number;
  capacity: number;
  prerequisite: string; // <-- add this
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
    prerequisite: '', // <-- add this
  });

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<null | 'success' | 'error'>(null);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

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
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };const handleSubmit = async () => {
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
  
      const payload = {
        ...formData,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        numDays
      };
      
      console.log("📦 Payload being sent to backend:", payload); 
  
      try{
        const res = await axios.post('http://localhost:4000/api/events' , {
          headers: { 'Content-Type': 'application/json' , 'Authorization': `Bearer ${localStorage.getItem('token')}`},
          body: JSON.stringify(payload)
        });
      }catch(err:any)
      {
        console.log(err.response.data);
      }

  

  
      setSubmitStatus('success');
  
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        location: '',
        credits: 0,
        capacity: 0,
        prerequisite: '', // <-- add this
      });
  
      router.push('/admin/dashboard');
    } catch (err) {
      console.error('Error:', err);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className={`min-h-screen p-6 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black'}`}>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className={`rounded-lg p-6 shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Create New Event</h1>
              <p className="text-sm mt-1">Fill in the details to create a new event for your community</p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition ${
                  isDarkMode
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
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

        {/* Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className={`rounded-lg p-6 shadow space-y-4 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}
        >
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Event Title"
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Description"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="Location"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="number"
            name="credits"
            value={formData.credits}
            onChange={handleInputChange}
            placeholder="Credits"
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="number"
            name="capacity"
            value={formData.capacity}
            onChange={handleInputChange}
            placeholder="Capacity"
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            name="prerequisite"
            value={formData.prerequisite}
            onChange={handleInputChange}
            placeholder="Prerequisites"
            className="w-full p-2 border rounded"
          />

          {/* Duration */}
          {formData.startDate && formData.endDate && (
            <p className="text-sm text-blue-600">
              Duration: {calculateNumDays(formData.startDate, formData.endDate)} day(s)
            </p>
          )}

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-4 h-4" />
              <span>Event created successfully!</span>
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-4 h-4" />
              <span>Failed to create event. Please try again.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
