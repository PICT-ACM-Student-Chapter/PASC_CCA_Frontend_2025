export type Event = {
  id: number;
  title: string;
  status:EventStatus;
  description: string;
  duration: string;
  location: string;
  startDate: string;
  endDate: string;
  creditHours: string;
  // 'prerequisites' is now the only field for event requirements. 'aboutEvent' has been removed.
  prerequisites?: string;
  contact?: string;
};
export interface Rsvp {
  id: number; 
  eventId: number; //ip
  userId: number; //midleware
  status: RsvpStatus;//ip
  createdAt: Date;
}
export type RsvpStatus = "ATTENDING" | "NOT_ATTENDING";
export interface EventWithRsvp {
  event : Event;
  rsvp : Rsvp;
}

export type EventFor = 'ADMIN' | 'STUDENT RSVP' | 'STUDENT EVENTS';

export type EventStatus = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'ALL EVENTS';