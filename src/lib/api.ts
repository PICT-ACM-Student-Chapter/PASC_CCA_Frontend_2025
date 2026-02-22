import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { apiUrl } from './utils';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: apiUrl,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login ONLY if not already on auth pages
      const currentPath = window.location.pathname;
      if (!currentPath.startsWith('/auth/')) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        window.location.href = '/auth/login';
      }
    } else if (error.response?.status === 403) {
      // Forbidden - Let specific components handle this (e.g. AuthGuard for role switching)
      // Do NOT auto-logout here.
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

export default api;

// API Service Functions

// Auth APIs
export const authAPI = {
  // User endpoints
  userLogin: (email: string, password: string) =>
    api.post('auth/user/login', { email, password }),

  userRegister: (data: any) =>
    api.post('auth/user/register', data),

  userLogout: () =>
    api.post('auth/user/logout'),

  getCurrentUser: () =>
    api.get('auth/user/me'),

  // Admin endpoints
  adminLogin: (email: string, password: string) =>
    api.post('auth/admin/login', { email, password }),

  adminRegister: (data: any) =>
    api.post('auth/admin/register', data),

  adminLogout: () =>
    api.post('auth/admin/logout'),

  getCurrentAdmin: () =>
    api.get('auth/admin/me'),

  // Admin-only endpoint
  getUserCount: () =>
    api.get('auth/user/count'),

  // Legacy helper for login page compatibility
  login: (email: string, password: string, role: 'user' | 'admin') =>
    api.post(`auth/${role}/login`, { email, password }),

  register: (data: any) =>
    api.post('auth/user/register', data),
};

// Event APIs
export const eventAPI = {
  // Public endpoints
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get('events', { params }),

  getById: (id: number) =>
    api.get(`events/${id}`),

  getByStatus: (status: string) =>
    api.get('events/filter', { params: { status } }),

  // Admin endpoints (requireAdmin)
  create: (data: any) =>
    api.post('events', data),

  update: (id: number, data: any) =>
    api.put(`events/${id}`, data),

  delete: (id: number) =>
    api.delete(`events/${id}`),

  getAdminEvents: () =>
    api.get('events/admin'),

  // User endpoints (requireUser)
  getUserEvents: () =>
    api.get('events/user'),
};

// RSVP APIs (Base: /api/rsvps - note the 's'!)
export const rsvpAPI = {
  // User endpoints (requireUser)
  create: (eventId: number) =>
    api.post('rsvps', { eventId, status: 'ATTENDING' }),

  update: (rsvpId: number, data: any) =>
    api.put(`rsvps/${rsvpId}`, data),

  cancel: (rsvpId: number) =>
    api.delete(`rsvps/${rsvpId}`),

  getUserRsvps: () =>
    api.get('rsvps/user'),

  getRsvpByEventId: (eventId: number) =>
    api.get(`rsvps/events/${eventId}/rsvp`),

  // Admin endpoint (requireAdmin)
  getEventRsvps: (eventId: number) =>
    api.get(`rsvps/event/${eventId}`),
};

// Attendance APIs
export const attendanceAPI = {
  // User endpoints (requireUser)
  markAttendance: (eventId: number, sessionId: number, code?: string) =>
    api.post(`attendance/events/${eventId}/sessions/${sessionId}/attend`, code ? { code } : {}),

  getUserStats: () =>
    api.get('attendance/user-attendance-stats'),

  getUserEventAttendance: (eventId: number) =>
    api.get(`attendance/events/${eventId}/sessions/attendance`),

  getUserSessionsByEvent: (eventId: number) =>
    api.get(`attendance/user/events/${eventId}/sessions`),

  // Admin endpoints (requireAdmin)
  createSession: (eventId: number, data: any) =>
    api.post(`attendance/events/${eventId}/sessions`, data),

  updateSession: (sessionId: number, data: any) =>
    api.put(`attendance/events/sessions/${sessionId}`, data),

  getSessionStats: (sessionId: number) =>
    api.get(`attendance/sessions/${sessionId}/stats`),

  getEventSessions: (eventId: number) =>
    api.get(`attendance/events/${eventId}/sessions`),
};

// Review APIs
export const reviewAPI = {
  create: (data: any) =>
    api.post('reviews', data),

  getMyReview: (eventId: number) =>
    api.get(`reviews/event/${eventId}/me`),

  getEventReviews: (eventId: number) =>
    api.get(`reviews/event/${eventId}`),

  getEventStats: (eventId: number) =>
    api.get(`reviews/event/${eventId}/stats`),

  update: (reviewId: number, data: any) =>
    api.put(`reviews/${reviewId}`, data),

  delete: (reviewId: number) =>
    api.delete(`reviews/${reviewId}`),
};

// Resource APIs
export const resourceAPI = {
  create: (data: any) =>
    api.post('resources', data),

  getEventResources: (eventId: number) =>
    api.get(`resources/event/${eventId}`),

  update: (resourceId: number, data: any) =>
    api.put(`resources/${resourceId}`, data),

  delete: (resourceId: number) =>
    api.delete(`resources/${resourceId}`),
};

// Gallery APIs
export const galleryAPI = {
  // Admin endpoints (requireAdmin)
  create: (data: any) =>
    api.post('gallery', data),

  update: (imageId: number, data: any) =>
    api.put(`gallery/${imageId}`, data),

  delete: (imageId: number) =>
    api.delete(`gallery/${imageId}`),

  // Public endpoints
  getAll: () =>
    api.get('gallery'),

  getEventGallery: (eventId: number) =>
    api.get(`gallery/event/${eventId}`),
};

// Notification APIs (all require User auth)
export const notificationAPI = {
  getAll: (params?: { read?: boolean; limit?: number }) =>
    api.get('notifications', { params }),

  markAsRead: (notificationId: number) =>
    api.post(`notifications/${notificationId}/read`),

  markAllAsRead: () =>
    api.post('notifications/mark-all-read'),

  getUnreadCount: () =>
    api.get('notifications/unread-count'),
};

// Announcement APIs
export const announcementAPI = {
  // User endpoints (requireUser)
  getAll: (params?: { priority?: string; limit?: number }) =>
    api.get('announcements', { params }),

  markAsRead: (id: number) =>
    api.post(`announcements/${id}/read`),

  getUnreadCount: () =>
    api.get('announcements/unread-count'),

  // Admin endpoints (requireAdmin)
  getAllAdmin: (params?: { priority?: string; limit?: number }) =>
    api.get('announcements/all', { params }),

  create: (data: any) =>
    api.post('announcements', data),

  update: (id: number, data: any) =>
    api.put(`announcements/${id}`, data),

  delete: (id: number) =>
    api.delete(`announcements/${id}`),
};

// Leaderboard APIs
export const leaderboardAPI = {
  // Public endpoint; division 1–13 for division-wise leaderboard
  get: (params?: { period?: string; year?: number; month?: number; division?: number; limit?: number }) =>
    api.get('leaderboard', { params }),

  // User endpoint (requireUser); division for rank within that division
  getMyRank: (params?: { period?: string; division?: number }) =>
    api.get('leaderboard/my-rank', { params }),
};

// Analytics APIs
export const analyticsAPI = {
  // Admin endpoint (requireAdmin)
  getAdminDashboard: () =>
    api.get('analytics/admin'),

  // Admin endpoint (requireAdmin)
  getEventAnalytics: (eventId: number) =>
    api.get(`analytics/event/${eventId}`),

  // User endpoint (requireUser)
  getUserAnalytics: () =>
    api.get('analytics/user'),
};

// Calendar APIs
export const calendarAPI = {
  // Public endpoints
  getEventLinks: (eventId: number) =>
    api.get(`calendar/event/${eventId}/links`),

  downloadEventCalendar: (eventId: number) =>
    api.get(`calendar/event/${eventId}/download`, { responseType: 'blob' }),

  downloadPublicCalendar: () =>
    api.get('calendar/public/download', { responseType: 'blob' }),

  // User endpoint (requireUser)
  downloadMyCalendar: () =>
    api.get('calendar/my-calendar/download', { responseType: 'blob' }),
};
