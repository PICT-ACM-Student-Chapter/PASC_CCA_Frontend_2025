"use client";

import { CalendarDays, Clock, MapPin, Phone } from "lucide-react";

export default function EventDetailsPage() {
  return (
    <main className="min-h-screen bg-background p-4 md:p-8 text-primary">
      <div className="mx-auto max-w-6xl flex flex-col lg:flex-row gap-8">
        {/* Left: Main Event Info */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-card rounded-xl border border-card p-6">
            <h1 className="text-2xl font-bold mb-4">WebDev SIG</h1>
            <p className="text-secondary mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod.
            </p>
            <h2 className="text-lg font-semibold mb-2">About Event</h2>
            <p className="text-secondary mb-6">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation. Ut enim ad minim veniam, quis nostrud exercitation. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.
            </p>
            <h2 className="text-lg font-semibold mb-2">Prerequisites</h2>
            <p className="text-secondary">Basic understanding of programming concepts</p>
          </div>
        </div>
        {/* Right: Event Details Card */}
        <div className="w-full lg:w-1/3 flex-shrink-0">
          <div className="bg-card rounded-xl border border-card p-6 flex flex-col gap-4">
            <h2 className="text-lg font-semibold mb-2">Event Details</h2>
            <div className="flex items-center gap-2 text-secondary">
              <CalendarDays className="w-5 h-5" />
              <span className="font-medium">Start Date</span>
              <span className="ml-auto text-primary">June 15, 2025</span>
            </div>
            <div className="flex items-center gap-2 text-secondary">
              <CalendarDays className="w-5 h-5" />
              <span className="font-medium">End Date</span>
              <span className="ml-auto text-primary">June 15, 2025</span>
            </div>
            <div className="flex items-center gap-2 text-secondary">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Credit Hours</span>
              <span className="ml-auto text-primary">8 hours</span>
            </div>
            <div className="flex items-center gap-2 text-secondary">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Location</span>
              <span className="ml-auto text-primary">Auditorium</span>
            </div>
            <div className="flex items-center gap-2 text-secondary">
              <Phone className="w-5 h-5" />
              <span className="font-medium">Contact:</span>
              <span className="ml-auto text-primary">8421318457 / 7896541239</span>
            </div>
            <button className="mt-4 bg-[var(--color-primary)] text-white rounded-lg py-2 font-semibold hover:bg-[var(--color-primary-dark)] transition">
              RSVP to Event
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 