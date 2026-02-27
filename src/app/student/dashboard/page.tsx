"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  TrendingUp,
  Calendar,
  Award,
  Clock,
  Target,
  BarChart3
} from 'lucide-react';
import { analyticsAPI, leaderboardAPI } from '@/lib/api';
import { LeaderboardEntry } from '@/types/leaderboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [topPerformers, setTopPerformers] = useState<LeaderboardEntry[]>([]);
  const [stats, setStats] = useState({
    totalCredits: 0,
    eventsAttended: 0,
    upcomingEvents: 0,
    completionRate: 0,
  });
  const [attendanceData, setAttendanceData] = useState<any>(null);

  useEffect(() => {
    fetchDashboardData();
    fetchAttendanceData();
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/attendance/user-attendance-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Attendance data:', data);
      setAttendanceData(data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      // Fetch analytics - BigInt issue is now resolved
      const analyticsResponse = await analyticsAPI.getUserAnalytics();
      console.log('Analytics response:', analyticsResponse.data);
      if (analyticsResponse.data?.success && analyticsResponse.data.data) {
        const data = analyticsResponse.data.data as any;
        const overview = data.overview || {};
        setStats({
          totalCredits: overview.totalCredits || 0,
          eventsAttended: overview.eventsAttended || 0,
          upcomingEvents: data.upcomingEvents?.length || 0,
          completionRate: overview.attendanceRate || 0,
        });
      }

      const leaderboardResponse = await leaderboardAPI.get({
        period: 'SEMESTER',
        limit: 5
      });
      console.log('Leaderboard response:', leaderboardResponse.data);
      if (leaderboardResponse.data?.success && leaderboardResponse.data.data) {
        const leaders = leaderboardResponse.data.data as LeaderboardEntry[];
        setTopPerformers(leaders);
      }

      try {
        const rankResponse = await leaderboardAPI.getMyRank();
        console.log('My rank response:', rankResponse.data);
        if (rankResponse.data?.success && rankResponse.data.data) {
          const rankData = rankResponse.data.data;
          const userId = parseInt(localStorage.getItem('userId') || '0');
          const userEntry = leaderboardResponse.data?.data?.find((l: LeaderboardEntry) => l.userId === userId);
          if (userEntry) {
            setUserRank(userEntry);
          } else if (rankData.rank > 0) {
            // Use flat structure to match backend
            setUserRank({
              userId: userId,
              rank: rankData.rank,
              credits: rankData.credits,
              eventsAttended: 0,
              userName: 'You',
              department: 'IT',
              year: new Date().getFullYear()
            } as LeaderboardEntry);
          }
        }
      } catch (rankError) {
        console.log('Could not fetch user rank:', rankError);
        const userId = parseInt(localStorage.getItem('userId') || '0');
        const userEntry = leaderboardResponse.data?.data?.find((l: LeaderboardEntry) => l.userId === userId);
        if (userEntry) {
          setUserRank(userEntry);
        }
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
      // Don't set hardcoded fallback values - let the error surface
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Track your CCA progress and achievements
            </p>
          </div>
          <button
            onClick={() => router.push('/student/events')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Browse Events
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex gap-1" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-3 px-6 border-b-2 font-medium text-sm transition-all ${activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`py-3 px-6 border-b-2 font-medium text-sm transition-all ${activeTab === 'attendance'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
            >
              Attendance History
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`py-3 px-6 border-b-2 font-medium text-sm transition-all ${activeTab === 'achievements'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                }`}
            >
              Achievements
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                icon={<Award className="w-5 h-5 text-primary" />}
                title="Total Credits"
                value={stats.totalCredits.toString()}
                loading={loading}
              />
              <StatCard
                icon={<Calendar className="w-5 h-5 text-primary" />}
                title="Events Attended"
                value={stats.eventsAttended.toString()}
                loading={loading}
              />
              <StatCard
                icon={<Clock className="w-5 h-5 text-primary" />}
                title="Upcoming Events"
                value={stats.upcomingEvents.toString()}
                loading={loading}
              />
              <StatCard
                icon={<Target className="w-5 h-5 text-primary" />}
                title="Completion Rate"
                value={`${stats.completionRate}%`}
                loading={loading}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Leaderboard & Progress */}
              <div className="lg:col-span-2 space-y-6">
                {/* Your Rank Card */}
                {userRank && (
                  <div className="bg-card border border-border rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">Your Rank</p>
                        <h2 className="text-4xl font-bold mt-1 text-foreground">#{userRank.rank}</h2>
                        <p className="text-muted-foreground mt-2 text-sm">
                          {userRank.credits} credits • {userRank.eventsAttended} events
                        </p>
                      </div>
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <Trophy className="w-8 h-8 text-primary" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <Progress value={stats.completionRate} className="h-2" />
                      <p className="text-muted-foreground text-xs mt-2">
                        {stats.completionRate}% completion rate
                      </p>
                    </div>
                  </div>
                )}

                {/* Top Performers */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-foreground">Top Performers</h3>
                    <button
                      onClick={() => router.push('/student/leaderboard')}
                      className="text-sm text-primary hover:underline font-medium"
                    >
                      View All →
                    </button>
                  </div>

                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-16 w-full" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {topPerformers.map((entry, index) => (
                        <div
                          key={`${entry.userId}-${index}`}
                          className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                        >
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${index === 0 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                            index === 1 ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' :
                              index === 2 ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400' :
                                'bg-muted text-muted-foreground'
                            }`}>
                            {entry.rank}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">
                              {entry.userName || 'Anonymous'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {entry.department} • Year {entry.year}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">{entry.credits}</p>
                            <p className="text-xs text-muted-foreground">credits</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ATTENDANCE TAB */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            {attendanceLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading attendance data...</p>
              </div>
            ) : attendanceData?.sessions?.length > 0 ? (
              <>
                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-card border border-border p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Award className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">Total Credits</p>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{attendanceData.totalCredits || 0}</p>
                  </div>
                  <div className="bg-card border border-border p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Calendar className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">Sessions Attended</p>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{attendanceData.sessionsAttended || 0}</p>
                  </div>
                  <div className="bg-card border border-border p-6 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <TrendingUp className="w-5 h-5 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                    </div>
                    <p className="text-3xl font-bold text-foreground">{Math.floor(attendanceData.completionRate || 0)}%</p>
                  </div>
                </div>

                {/* Sessions List */}
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">All Attended Sessions</h3>
                  <div className="space-y-2">
                    {attendanceData.sessions.map((session: any) => (
                      <div key={session.id} className="border border-border rounded-lg p-4 hover:bg-accent/50 transition-colors">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-foreground">{session.sessionName}</h4>
                          <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-medium">
                            {session.credits} credits
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <p>📍 {session.location}</p>
                          <p>📅 {new Date(session.startTime).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            timeZone: 'UTC'
                          })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Attendance Records</h3>
                <p className="text-muted-foreground mb-4">Start attending sessions to see your history here</p>
                <button
                  onClick={() => router.push('/student/events')}
                  className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Browse Events
                </button>
              </div>
            )}
          </div>
        )}

        {/* ACHIEVEMENTS TAB */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            {/* Personal Best */}
            {attendanceData?.userPersonalBest?.credits > 0 ? (
              <div className="bg-card border border-border p-6 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-primary" />
                      Personal Best Session
                    </h3>
                    <p className="text-3xl font-bold text-foreground">{attendanceData.userPersonalBest.credits} credits</p>
                    <p className="text-xs text-muted-foreground mt-1">Highest credits in a single session</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Award className="w-8 h-8 text-primary" />
                  </div>
                </div>
              </div>
            ) : null}

            {/* Milestones */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Milestones</h3>
              <div className="space-y-4">
                {/* First Session */}
                <div className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${(attendanceData?.sessionsAttended || 0) >= 1 ? 'bg-card border-border' : 'bg-card border-border opacity-50'}`}>
                  <div className={`p-2 rounded-full ${(attendanceData?.sessionsAttended || 0) >= 1 ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Trophy className={`w-5 h-5 ${(attendanceData?.sessionsAttended || 0) >= 1 ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">First Steps</h4>
                    <p className="text-sm text-muted-foreground">Attend your first session</p>
                  </div>
                  {(attendanceData?.sessionsAttended || 0) >= 1 && (
                    <span className="text-xs font-medium text-primary">✓</span>
                  )}
                </div>

                {/* 5 Sessions */}
                <div className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${(attendanceData?.sessionsAttended || 0) >= 5 ? 'bg-card border-border' : 'bg-card border-border opacity-50'}`}>
                  <div className={`p-2 rounded-full ${(attendanceData?.sessionsAttended || 0) >= 5 ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Award className={`w-5 h-5 ${(attendanceData?.sessionsAttended || 0) >= 5 ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">Getting Started</h4>
                    <p className="text-sm text-muted-foreground">Attend 5 sessions ({attendanceData?.sessionsAttended || 0}/5)</p>
                  </div>
                  {(attendanceData?.sessionsAttended || 0) >= 5 && (
                    <span className="text-xs font-medium text-primary">✓</span>
                  )}
                </div>

                {/* 50 Credits */}
                <div className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${(attendanceData?.totalCredits || 0) >= 50 ? 'bg-card border-border' : 'bg-card border-border opacity-50'}`}>
                  <div className={`p-2 rounded-full ${(attendanceData?.totalCredits || 0) >= 50 ? 'bg-primary/10' : 'bg-muted'}`}>
                    <Trophy className={`w-5 h-5 ${(attendanceData?.totalCredits || 0) >= 50 ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">Credit Master</h4>
                    <p className="text-sm text-muted-foreground">Earn 50 credits ({attendanceData?.totalCredits || 0}/50)</p>
                  </div>
                  {(attendanceData?.totalCredits || 0) >= 50 && (
                    <span className="text-xs font-medium text-primary">✓</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  loading: boolean;
}

function StatCard({ icon, title, value, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6">
        <Skeleton className="h-10 w-10 rounded-full mb-3" />
        <Skeleton className="h-4 w-24 mb-2" />
        <Skeleton className="h-8 w-16" />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          {icon}
        </div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}
