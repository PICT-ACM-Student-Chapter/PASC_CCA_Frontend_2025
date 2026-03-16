"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Users,
  BarChart3,
  Megaphone,
  Plus,
  CheckCircle,
  UserCheck,
  TrendingUp,
  Activity,
  Star,
  Award,
  RefreshCw,
} from "lucide-react";
import { StatsCard } from "@/components/admin/stats-card";
import { analyticsAPI } from "@/lib/api";
import { DashboardAnalytics } from "@/types/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

// ─── Mapper ────────────────────────────────────────────────────────────────

function mapDashboardAnalytics(apiData: any): DashboardAnalytics {
  return {
    totalEvents: apiData.overview.totalEvents,
    totalUsers: apiData.overview.totalUsers,
    totalRsvps: apiData.overview.totalRSVPs,
    totalAttendance: apiData.overview.totalAttendances,
    totalCreditsDistributed: 0,
    averageEventRating: apiData.overview.averageEventRating ?? 0,

    upcomingEvents: apiData.eventsByStatus?.UPCOMING ?? 0,
    ongoingEvents: apiData.eventsByStatus?.ONGOING ?? 0,
    completedEvents: apiData.eventsByStatus?.COMPLETED ?? 0,

    topEvents: (apiData.topEvents ?? []).slice(0, 5).map((e: any) => ({
      id: e.id,
      title: e.title,
      attendanceCount: e.totalAttendance,
      rating: e.rating ?? 0,
    })),

    recentActivity: (apiData.recentEvents ?? []).slice(0, 5).map((e: any) => ({
      type: "EVENT",
      description: `${e.title} (${e.status})`,
      timestamp: e.startDate,
    })),
  };
}

/* ─── Donut Chart (SVG) ────────────── */
interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

function DonutChart({
  segments,
  centerLabel,
  centerValue,
  size = 180,
}: {
  segments: DonutSegment[];
  centerLabel?: string;
  centerValue?: string;
  size?: number;
}) {
  const [hoveredSegment, setHoveredSegment] = useState<DonutSegment | null>(null);
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const radius = 75;
  const strokeWidth = 26;
  const circumference = 2 * Math.PI * radius;
  let cumulativeOffset = 0;

  return (
    <div className="relative group" style={{ width: size, height: size }}>
      <svg viewBox="0 0 200 200" className="w-full h-full -rotate-90 drop-shadow-sm transition-all duration-300">
        <circle cx="100" cy="100" r={radius} fill="none" stroke="var(--color-surface-hover)" strokeWidth={strokeWidth} className="opacity-40" />
        {total > 0 &&
          segments
            .filter((s) => s.value > 0)
            .map((seg, i) => {
              const pct = seg.value / total;
              const dashLength = pct * circumference;
              const dashGap = circumference - dashLength;
              const offset = cumulativeOffset;
              cumulativeOffset += dashLength;
              return (
                <circle
                  key={i}
                  cx="100"
                  cy="100"
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${dashLength} ${dashGap}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer drop-shadow-md"
                  onMouseEnter={() => setHoveredSegment(seg)}
                  onMouseLeave={() => setHoveredSegment(null)}
                />
              );
            })}
      </svg>
      {/* center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center transition-all duration-300 pointer-events-none">
        {hoveredSegment ? (
          <>
            <span className="text-2xl font-extrabold tracking-tight drop-shadow-sm transition-colors" style={{ color: hoveredSegment.color }}>
              {hoveredSegment.value}
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5 transition-colors" style={{ color: hoveredSegment.color }}>
              {hoveredSegment.label}
            </span>
          </>
        ) : (
          <>
            {centerValue && (
              <span className="text-2xl font-extrabold text-foreground tracking-tight drop-shadow-sm">{centerValue}</span>
            )}
            {centerLabel && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mt-0.5">{centerLabel}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── MetricCard ────────────────────────────────────────────────────────────

interface MetricCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  loading: boolean;
  color: string;
}

function MetricCard({
  icon,
  title,
  value,
  subtitle,
  loading,
  color,
}: MetricCardProps) {
  const baseCardClass = "rounded-2xl sm:rounded-[1.5rem] border border-[var(--color-border)] p-5 sm:p-7 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col items-center justify-center";

  if (loading) {
    return (
      <div className={`${color} ${baseCardClass}`}>
        <Skeleton className="h-6 w-6 mb-3" />
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-16 mb-2" />
        <Skeleton className="h-3 w-20" />
      </div>
    );
  }

  return (
    <div className={`${color} ${baseCardClass}`}>
      <div className="flex flex-row items-center justify-between w-full mb-3 sm:mb-4">
        <span className="text-sm sm:text-base font-medium text-muted-foreground">{title}</span>
        {icon}
      </div>
      <div className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-1">{value}</div>
      {subtitle && <p className="text-sm text-muted-foreground mt-2">{subtitle}</p>}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsAPI.getAdminDashboard();
      console.log("RAW API DATA 👉", res.data?.data);
      if (res.data?.success && res.data.data) {
        setAnalytics(mapDashboardAnalytics(res.data.data));
      } else {
        throw new Error("Invalid analytics response");
      }
    } catch (err: any) {
      console.error("Error fetching analytics:", err);
      setError("Failed to fetch analytics data.");
    } finally {
      setLoading(false);
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center max-w-md">
          <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const attendanceRate = (analytics as any)?.overview?.attendanceRate ?? 0;

  const activeEventsCount = (analytics?.upcomingEvents ?? 0) + (analytics?.ongoingEvents ?? 0);
  const totalPipelineEvents = (analytics?.upcomingEvents ?? 0) + (analytics?.ongoingEvents ?? 0) + (analytics?.completedEvents ?? 0);

  const eventPipelineSegments: DonutSegment[] = analytics
    ? [
      { label: 'Total', value: totalPipelineEvents, color: '#64748b' }, // slate-500
      { label: 'Active', value: activeEventsCount, color: '#0ea5e9' }, // sky-500
      { label: 'Upcoming', value: analytics.upcomingEvents, color: '#3b82f6' }, // blue-500
      { label: 'Ongoing', value: analytics.ongoingEvents, color: '#10b981' }, // emerald-500
      { label: 'Completed', value: analytics.completedEvents, color: '#9333ea' }, // purple-600
    ]
    : [];

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Comprehensive insights into CCA activities
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center mt-3 md:mt-0">
            <button
              onClick={fetchAnalytics}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-[var(--color-border-light)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-all shadow-sm active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Data
            </button>
            <button
              onClick={() => router.push("/admin/announcements")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border border-[var(--color-border-light)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)] transition-all shadow-sm active:scale-95"
            >
              <Megaphone className="h-4 w-4 text-orange-500" />
              Announcements
            </button>
            <button
              onClick={() => router.push("/admin/createEvent")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border border-transparent bg-[var(--color-button-primary)] text-white hover:bg-[var(--color-button-primary-hover)] transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Create Event
            </button>
          </div>
        </div>

        {/* ── Top Stats Row ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Events"
            value={analytics?.totalEvents ?? 0}
            Icon={Calendar}
          />
          <StatsCard
            title="Total Students"
            value={analytics?.totalUsers ?? 0}
            Icon={Users}
          />
          <StatsCard
            title="Total RSVPs"
            value={analytics?.totalRsvps ?? 0}
            Icon={UserCheck}
          />
          <StatsCard
            title="Total Attendances"
            value={analytics?.totalAttendance ?? 0}
            Icon={CheckCircle}
          />
        </div>

        {/* ── Event Status Pipeline ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart Panel */}
          <div className="lg:col-span-1 rounded-2xl sm:rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6 shadow-sm flex flex-col hover:shadow-md transition-shadow duration-300">
            <div className="w-full flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg text-foreground tracking-tight">Event Distribution</h3>
              <div className="p-1.5 bg-[var(--color-surface-hover)]/30 rounded-lg hidden sm:block">
                <Activity className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <div className="flex-1 flex flex-row items-center justify-between w-full mt-2 sm:mt-4">
              {/* Left: Chart Visualization */}
              <div className="flex-shrink-0 flex items-center justify-center w-[120px] sm:w-[130px]">
                <DonutChart
                  segments={eventPipelineSegments}
                  centerValue={totalPipelineEvents.toString()}
                  centerLabel="Total Events"
                  size={130}
                />
              </div>

              {/* Right: Legend Items */}
              <div className="flex flex-col flex-1 justify-center gap-2 sm:gap-2.5 pl-5 sm:pl-7">
                {eventPipelineSegments.filter(s => s.value >= 0).map((seg) => (
                  <div key={seg.label} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-sm group-hover:scale-110 transition-transform" style={{ backgroundColor: seg.color }} />
                      <span className="text-muted-foreground text-[13px] sm:text-sm font-medium group-hover:text-foreground transition-colors">
                        {seg.label}
                      </span>
                    </div>
                    <span className="text-foreground font-bold text-xs sm:text-[13px] bg-[var(--color-surface)]/50 px-2 sm:px-2.5 py-0.5 rounded-md border border-[var(--color-border-light)] shadow-sm">
                      {seg.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Metrics Tiles layout block (2x2 grid) */}
          <div className="lg:col-span-1 grid grid-cols-2 gap-4 h-full">
            <div className="rounded-2xl sm:rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Upcoming</h3>
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {analytics?.upcomingEvents ?? 0}
              </p>
            </div>

            <div className="rounded-2xl sm:rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Ongoing</h3>
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {analytics?.ongoingEvents ?? 0}
              </p>
            </div>

            <div className="rounded-2xl sm:rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Completed</h3>
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {analytics?.completedEvents ?? 0}
              </p>
            </div>

            <div className="rounded-2xl sm:rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-sm text-muted-foreground">Active</h3>
                <div className="w-8 h-8 bg-[var(--color-info)]/10 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-[var(--color-info)]" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">
                {activeEventsCount}
              </p>
            </div>
          </div>
        </div>

        {/* ── Engagement Highlights ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Average Rating */}
          <div className="rounded-2xl sm:rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-7 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Average Rating
                </p>
                <p className="text-4xl font-bold text-foreground">
                  {(analytics?.averageEventRating ?? 0).toFixed(1)}
                </p>
                <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-2">
                  Overall event rating
                </p>
              </div>
              <Star className="w-12 h-12 text-green-500 opacity-30" />
            </div>
          </div>

          {/* Credits Distributed */}
          <div className="rounded-2xl sm:rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-7 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Credits Distributed
                </p>
                <p className="text-4xl font-bold text-foreground">
                  {analytics?.totalCreditsDistributed ?? 0}
                </p>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400 mt-2">
                  {analytics?.totalAttendance ?? 0} attendances
                </p>
              </div>
              <Award className="w-12 h-12 text-amber-500 opacity-30" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Top Performing Events (Span 2) ── */}
          <div className="lg:col-span-2 flex flex-col h-full rounded-2xl sm:rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold">Top Performing Events</h3>
            </div>

            {analytics?.topEvents && analytics.topEvents.length > 0 ? (
              <div className="space-y-3">
                {analytics.topEvents.map((event: any, index: number) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)]/35 hover:bg-[var(--color-surface)] shadow-[0_2px_8px_rgba(15,23,42,0.08)] hover:shadow-[0_6px_14px_rgba(15,23,42,0.1)] transition-[background-color,box-shadow]"
                  >
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-[15px] font-extrabold border transition-all ${index === 0
                        ? 'bg-[#ffe44d] border-[#e6be00] text-[#8a7200]' // 1st (Solid Gold Base)
                        : index === 1
                          ? 'bg-[#e2e8f0] border-[#cbd5e1] text-[#475569]' // 2nd (Solid Silver/Slate)
                          : index === 2
                            ? 'bg-[#ffedd5] border-[#fdba74] text-[#9a3412]' // 3rd (Solid Bronze)
                            : 'bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] opacity-80' // Others (Subdued)
                        }`}
                    >
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-[15px] sm:text-base font-semibold text-foreground truncate leading-tight">
                          {event.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-[13px] sm:text-sm font-medium text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" />
                            {event.attendanceCount} Attendees
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20">
                        <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                        <span className="font-semibold text-orange-700 dark:text-orange-400 text-sm leading-none">
                          {event.rating?.toFixed(1) || "0.0"}
                        </span>
                      </div>
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

          {/* ── Recent Activity (Span 1) ── */}
          <div className="lg:col-span-1 flex flex-col h-full rounded-2xl sm:rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold">Recent Activity</h3>
            </div>

            {analytics?.recentActivity && analytics.recentActivity.length > 0 ? (
              <div className="space-y-2">
                {analytics.recentActivity.map((activity: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="w-2 h-2 bg-[var(--color-info)] rounded-full mt-2 flex-shrink-0" />
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

      </div>
    </div>
  );
};

export default AdminDashboard;
