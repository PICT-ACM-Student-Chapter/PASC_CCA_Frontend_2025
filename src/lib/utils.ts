import { Event } from "@/types/events";
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getStatusColor = (status: Event['status']) => {
  switch (status) {
    case 'UPCOMING':
      return 'text-blue-600';
    case 'ONGOING':
      return 'text-green-600';
    case 'COMPLETED':
      return 'text-gray-600';
    default:
      return 'text-gray-600';
  }
}


export const getStatusBadgeVariant = (status: Event['status']) => {
  switch (status) {
    case 'UPCOMING':
      return 'default';
    case 'ONGOING':
      return 'secondary';
    case 'COMPLETED':
      return 'outline';
    default:
      return 'default';
  }
};

export const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/';

// Date formatting utilities
export function formatDistanceToNow(date: Date): string {
  if (!date || isNaN(date.getTime())) return '—';
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC'
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}