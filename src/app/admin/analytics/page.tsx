"use client";

import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Calendar,
  Award,
  Star,
  Activity
} from 'lucide-react';
import { analyticsAPI } from '@/lib/api';
import { DashboardAnalytics } from '@/types/analytics';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDate } from '@/lib/utils';
function mapDashboardAnalytics(apiData: any): DashboardAnalytics {
  return {
    // ---- Overview ----
    totalEvents: apiData.overview.totalEvents,
    totalUsers: apiData.overview.totalUsers,
    totalRsvps: apiData.overview.totalRSVPs,
    totalAttendance: apiData.overview.totalAttendances,
    // Backend doesn’t provide these yet - UPDATE: Now it does for rating!
    totalCreditsDistributed: 0,
    averageEventRating: apiData.overview.averageEventRating ?? 0,

    // ---- Events by status ----
    upcomingEvents: apiData.eventsByStatus.UPCOMING ?? 0,
    ongoingEvents: apiData.eventsByStatus.ONGOING ?? 0,
    completedEvents: apiData.eventsByStatus.COMPLETED ?? 0,

    // ---- Top Events ----
    topEvents: apiData.topEvents.map((e: any) => ({
      id: e.id,
      title: e.title,
      attendanceCount: e.totalAttendance,
      rating: e.rating ?? 0
    })),

    // ---- Recent Activity ----
    recentActivity: apiData.recentEvents.map((e: any) => ({
      type: "EVENT",
      description: `${e.title} (${e.status})`,
      timestamp: e.startDate
    }))
  };
}



export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const res = await analyticsAPI.getAdminDashboard();

      console.log("RAW API DATA 👉", res.data.data);

      const mappedAnalytics = mapDashboardAnalytics(res.data.data);

      console.log("FINAL DASHBOARD DATA 👉", mappedAnalytics);

      setAnalytics(mappedAnalytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };


  if (!mounted) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive insights into CCA activities
            </p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Refresh Data
          </button>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={<Calendar className="w-6 h-6 text-blue-500" />}
            title="Total Events"
            value={(analytics?.totalEvents ?? 0).toString()}
            subtitle={`${analytics?.upcomingEvents || 0} upcoming`}
            loading={loading}
            color="bg-blue-50 dark:bg-blue-950/20"
          />
          <MetricCard
            icon={<Users className="w-6 h-6 text-green-500" />}
            title="Total Students"
            value={(analytics?.totalUsers ?? 0).toString()}
            subtitle={`${analytics?.totalRsvps || 0} RSVPs`}
            loading={loading}
            color="bg-green-50 dark:bg-green-950/20"
          />
          <MetricCard
            icon={<Award className="w-6 h-6 text-yellow-500" />}
            title="Credits Distributed"
            value={(analytics?.totalCreditsDistributed ?? 0).toString()}
            subtitle={`${analytics?.totalAttendance || 0} attendances`}
            loading={loading}
            color="bg-yellow-50 dark:bg-yellow-950/20"
          />

          <MetricCard
            icon={<Star className="w-6 h-6 text-purple-500" />}
            title="Average Rating"
            value={(analytics?.averageEventRating ?? 0).toString()}
            // averageRating: apiData.reviews?.averageRating ?? apiData.averageRating ?? 0,
            subtitle="Overall event rating"
            loading={loading}
            color="bg-purple-50 dark:bg-purple-950/20"
          />
        </div>

        {/* Event Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Upcoming Events</h3>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            {loading ? (
              <Skeleton className="h-12 w-20" />
            ) : (
              <p className="text-4xl font-bold text-foreground">
                {analytics?.upcomingEvents || 0}
              </p>
            )}
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Ongoing Events</h3>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
            {loading ? (
              <Skeleton className="h-12 w-20" />
            ) : (
              <p className="text-4xl font-bold text-foreground">
                {analytics?.ongoingEvents || 0}
              </p>
            )}
          </div>

          <div className="bg-card rounded-xl border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">Completed Events</h3>
              <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-gray-600" />
              </div>
            </div>
            {loading ? (
              <Skeleton className="h-12 w-20" />
            ) : (
              <p className="text-4xl font-bold text-foreground">
                {analytics?.completedEvents || 0}
              </p>
            )}
          </div>
        </div>

        {/* Top Events */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">Top Performing Events</h3>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : analytics?.topEvents && analytics.topEvents.length > 0 ? (
            <div className="space-y-3">
              {analytics.topEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                >
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                    index === 1 ? 'bg-gray-300 text-gray-900' :
                      index === 2 ? 'bg-orange-400 text-orange-900' :
                        'bg-blue-100 text-blue-900'
                    }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {event.title}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.attendanceCount} attendees
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-semibold text-foreground">
                      {event.rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No event data available
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold">Recent Activity</h3>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
            <div className="space-y-2">
              {analytics.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No recent activity
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  loading: boolean;
  color: string;
}

function MetricCard({ icon, title, value, subtitle, loading, color }: MetricCardProps) {
  if (loading) {
    return (
      <div className={`${color} rounded-xl p-6 border border-border`}>
        <Skeleton className="h-6 w-6 mb-3" />
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }

  return (
    <div className={`${color} rounded-xl p-6 border border-border`}>
      <div className="flex items-center gap-3 mb-3">
        {icon}
        <h3 className="font-medium text-foreground">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-foreground mb-1">{value}</p>
      <p className="text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}


