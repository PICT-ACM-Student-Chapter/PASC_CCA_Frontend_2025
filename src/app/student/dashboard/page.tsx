"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  TrendingUp,
  Calendar,
  Award,
  Clock,
  Target,
  ArrowRight,
  Medal,
  Star,
  Zap,
  CheckCircle2,
  LayoutDashboard,
} from 'lucide-react';
import { analyticsAPI, leaderboardAPI } from '@/lib/api';
import { apiUrl } from '@/lib/utils';
import { LeaderboardEntry } from '@/types/leaderboard';
import { Skeleton } from '@/components/ui/skeleton';

/* ──────────────────── Donut Chart (SVG) ──────────────────── */
interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface RankSummary {
  rank: number;
  totalUsers: number;
  credits: number;
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

/* ──────────────────── Main Dashboard ──────────────────── */
export default function StudentDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);
  const [globalRank, setGlobalRank] = useState<RankSummary | null>(null);
  const [divisionRank, setDivisionRank] = useState<RankSummary | null>(null);
  const [myDivision, setMyDivision] = useState<number | null>(null);
  const [topPerformers, setTopPerformers] = useState<LeaderboardEntry[]>([]);
  const [totalLeaderboardUsers, setTotalLeaderboardUsers] = useState(0);
  const [stats, setStats] = useState({
    totalCredits: 0,
    eventsAttended: 0,
    upcomingEvents: 0,
    completionRate: 0,
  });
  const [attendanceData, setAttendanceData] = useState<any>(null);

  useEffect(() => {
    Promise.all([fetchDashboardData(), fetchAttendanceData()]);
  }, []);

  const fetchAttendanceData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${apiUrl}/attendance/user-attendance-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setAttendanceData(data);
      setStats((prev) => ({ ...prev, totalCredits: data?.totalCredits ?? 0 }));
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setAttendanceLoading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const analyticsResponse = await analyticsAPI.getUserAnalytics();
      if (analyticsResponse.data?.success && analyticsResponse.data.data) {
        const data = analyticsResponse.data.data as any;
        const overview = data.overview || {};
        setStats((prev) => ({
          ...prev,
          eventsAttended: overview.eventsAttended || 0,
          upcomingEvents: data.upcomingEvents?.length || 0,
          completionRate: overview.attendanceRate || 0,
        }));
      }

      const leaderboardResponse = await leaderboardAPI.get({
        period: 'SEMESTER',
        limit: 6,
      });
      if (leaderboardResponse.data?.success && leaderboardResponse.data.data) {
        const leaders = leaderboardResponse.data.data as LeaderboardEntry[];
        setTopPerformers(leaders);
      }

      // Fetch total users for rank context
      const fullBoard = await leaderboardAPI.get({ period: 'SEMESTER', limit: 10000 });
      if (fullBoard.data?.success && fullBoard.data.data) {
        setTotalLeaderboardUsers((fullBoard.data.data as LeaderboardEntry[]).length);
      }

      try {
        const userId = parseInt(localStorage.getItem('userId') || '0');
        const [globalRankResponse, divisionInfoResponse] = await Promise.all([
          leaderboardAPI.getMyRank({ period: 'SEMESTER' }),
          leaderboardAPI.getMyDivision(),
        ]);

        const divisionValue = divisionInfoResponse.data?.success
          ? (divisionInfoResponse.data?.data?.division ?? null)
          : null;
        setMyDivision(divisionValue);

        if (globalRankResponse.data?.success && globalRankResponse.data.data) {
          const rankData = globalRankResponse.data.data;
          setGlobalRank({
            rank: rankData.rank || 0,
            totalUsers: rankData.totalUsers || 0,
            credits: rankData.credits || 0,
          });

          const userEntry = leaderboardResponse.data?.data?.find(
            (l: LeaderboardEntry) => l.userId === userId,
          );
          if (userEntry) {
            setUserRank(userEntry);
          } else if (rankData.rank > 0) {
            setUserRank({
              userId,
              rank: rankData.rank,
              credits: rankData.credits,
              eventsAttended: 0,
              userName: 'You',
              department: 'IT',
              year: new Date().getFullYear(),
            } as LeaderboardEntry);
          }
        }

        if (divisionValue != null) {
          const divisionRankResponse = await leaderboardAPI.getMyRank({
            period: 'SEMESTER',
            division: divisionValue,
          });

          if (divisionRankResponse.data?.success && divisionRankResponse.data?.data) {
            const divData = divisionRankResponse.data.data;
            setDivisionRank({
              rank: divData.rank || 0,
              totalUsers: divData.totalUsers || 0,
              credits: divData.credits || 0,
            });
          }
        } else {
          setDivisionRank(null);
        }
      } catch (rankError) {
        console.log('Could not fetch user rank:', rankError);
        const userId = parseInt(localStorage.getItem('userId') || '0');
        const userEntry = leaderboardResponse.data?.data?.find(
          (l: LeaderboardEntry) => l.userId === userId,
        );
        if (userEntry) setUserRank(userEntry);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRankDonutSegments = (rankData: RankSummary | null): DonutSegment[] => {
    if (!rankData || rankData.totalUsers <= 0 || rankData.rank <= 0) return [];
    const behind = rankData.rank - 1;
    const ahead = rankData.totalUsers - rankData.rank;
    return [
      { label: 'Above you', value: behind, color: '#1c4f73' },
      { label: 'You', value: 1, color: '#f2c94c' },
      { label: 'Below you', value: ahead, color: '#16b78b' },
    ];
  };

  /* ── Donut segments for "Your Rank" card ── */
  const globalRankDonutSegments: DonutSegment[] = useMemo(
    () => createRankDonutSegments(globalRank),
    [globalRank]
  );

  const divisionRankDonutSegments: DonutSegment[] = useMemo(
    () => createRankDonutSegments(divisionRank),
    [divisionRank]
  );

  /* ── Computed rank stats ── */
  const rankStats = useMemo(() => {
    if (!globalRank || globalRank.totalUsers === 0 || globalRank.rank === 0) return null;
    const topPercent = Math.max(Math.ceil((globalRank.rank / globalRank.totalUsers) * 100), 1);
    const topCredits = topPerformers[0]?.credits || 0;
    const userCredits = userRank?.credits ?? globalRank.credits;
    const creditProgress = topCredits > 0 ? Math.min((userCredits / topCredits) * 100, 100) : 0;
    const rankProgress = globalRank.totalUsers > 1
      ? ((globalRank.totalUsers - globalRank.rank) / (globalRank.totalUsers - 1)) * 100
      : 100;
    return { topPercent, topCredits, creditProgress, rankProgress, userCredits };
  }, [globalRank, userRank, topPerformers]);

  /* ── Milestones helper ── */
  const milestones = useMemo(() => {
    const sessions = attendanceData?.sessionsAttended || 0;
    const credits = attendanceData?.totalCredits || 0;
    return [
      { title: 'First Steps', desc: 'Attend your first session', done: sessions >= 1, icon: Zap },
      { title: 'Getting Started', desc: `Attend 5 sessions (${sessions}/5)`, done: sessions >= 5, icon: Star },
      { title: 'Dedicated Learner', desc: `Attend 10 sessions (${sessions}/10)`, done: sessions >= 10, icon: Medal },
      { title: 'Credit Collector', desc: `Earn 25 credits (${credits}/25)`, done: credits >= 25, icon: Award },
      { title: 'Credit Master', desc: `Earn 50 credits (${credits}/50)`, done: credits >= 50, icon: Trophy },
    ];
  }, [attendanceData]);

  const dataReady = !loading && !attendanceLoading;
  const adminHoverCardClass = 'shadow-sm hover:shadow-md transition-shadow duration-300';
  const overviewHeroPanelClass =
    `rounded-2xl sm:rounded-[1.5rem] p-5 sm:p-7 flex flex-col min-h-[150px] bg-[var(--color-card)] border border-[var(--color-border)] ${adminHoverCardClass}`;
  const unlockedMilestones = milestones.filter((m) => m.done).length;
  const milestoneProgressPercent = milestones.length > 0
    ? Math.round((unlockedMilestones / milestones.length) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-background p-4 sm:p-6 md:p-8 lg:p-10">
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-10">

        {/* Header */}
        <header className={`rounded-2xl sm:rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-7 ${adminHoverCardClass}`}>
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-border-light)] flex items-center justify-center shrink-0">
              <LayoutDashboard className="w-6 h-6 text-[var(--color-primary)]" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl sm:text-2xl font-bold text-[var(--color-text-primary)] tracking-tight leading-tight">
                Dashboard
              </h1>
              <p className="text-sm sm:text-base text-[var(--color-text-muted)] leading-relaxed">
                Track your CCA progress and achievements
              </p>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-1">
          {([
            { key: 'overview', label: 'Overview', icon: LayoutDashboard },
            { key: 'attendance', label: 'Attendance History', icon: Clock },
            { key: 'achievements', label: 'Achievements', icon: Trophy },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === key
                ? 'bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active)] font-medium'
                : 'text-[var(--color-nav-text)] hover:bg-[var(--color-nav-hover-bg)]'
                }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ═══════════════ OVERVIEW TAB ═══════════════ */}
        {activeTab === 'overview' && (
          <div className="space-y-8 sm:space-y-10">

            {/* ═══════ ROW 1 — Attendance History (hero) + Achievements ═══════ */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
              {/* Attendance History — spans 3 cols */}
              <div className={`lg:col-span-3 ${overviewHeroPanelClass} text-[var(--color-text-primary)]`}>
                {attendanceLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-40 bg-[var(--color-surface-hover)]" />
                    <Skeleton className="h-10 w-56 bg-[var(--color-surface-hover)]" />
                    <Skeleton className="h-4 w-72 bg-[var(--color-surface-hover)]" />
                  </div>
                ) : (
                  <>
                    <div className="w-full space-y-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#2BA6DF] border border-[#55B8E5]">
                            <Clock className="w-4 h-4 text-white" />
                          </span>
                          <p className="text-xl sm:text-[21px] font-semibold tracking-tight text-foreground">Attendance History</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full mt-1">
                        <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)]/35 p-3 text-center">
                          <p className="text-xl sm:text-3xl md:text-[2.1rem] font-bold tracking-tight leading-none text-[var(--color-text-primary)]">
                            {attendanceData?.totalCredits ?? 0}
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-[var(--color-text-muted)] mt-1">credits earned</p>
                        </div>
                        <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)]/35 p-3 text-center">
                          <p className="text-xl sm:text-3xl md:text-[2.1rem] font-bold tracking-tight leading-none text-[var(--color-text-primary)]">
                            {attendanceData?.sessionsAttended ?? 0}
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-[var(--color-text-muted)] mt-1">sessions attended</p>
                        </div>
                        <div className="rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)]/35 p-3 text-center">
                          <p className="text-xl sm:text-3xl md:text-[2.1rem] font-bold tracking-tight leading-none text-[var(--color-text-primary)]">
                            {Math.floor(attendanceData?.completionRate ?? stats.completionRate)}%
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-[var(--color-text-muted)] mt-1">completion rate</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Achievements Card */}
              <div className={`lg:col-span-2 ${overviewHeroPanelClass} text-[var(--color-text-primary)]`}>
                <div className="w-full space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-[#FDB811] border border-[#E5A50F]">
                        <Trophy className="w-4 h-4 text-[#6b4e00]" />
                      </span>
                      <h3 className="text-xl sm:text-[21px] font-semibold tracking-tight text-foreground">Achievements</h3>
                    </div>
                  </div>

                  <p className="text-sm md:text-base text-[var(--color-text-muted)] leading-relaxed w-full">
                    Track your milestones and unlock badges as you attend more events and earn credits.
                  </p>
                </div>
              </div>
            </div>

            {/* ═══════ ROW 2 — 4 Stat Cards (Admin Style) ═══════ */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-4 mb-4">
              <div className={`rounded-2xl sm:rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-7 flex flex-col items-center justify-center ${adminHoverCardClass}`}>
                <div className="flex flex-row items-center justify-between w-full mb-3 sm:mb-4">
                  <span className="text-sm sm:text-base font-medium text-muted-foreground">Total Credits</span>
                  <Award className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{stats.totalCredits}</div>
              </div>
              <div className={`rounded-2xl sm:rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-7 flex flex-col items-center justify-center ${adminHoverCardClass}`}>
                <div className="flex flex-row items-center justify-between w-full mb-3 sm:mb-4">
                  <span className="text-sm sm:text-base font-medium text-muted-foreground">Events Attended</span>
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{stats.eventsAttended}</div>
              </div>
              <div className={`rounded-2xl sm:rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-7 flex flex-col items-center justify-center ${adminHoverCardClass}`}>
                <div className="flex flex-row items-center justify-between w-full mb-3 sm:mb-4">
                  <span className="text-sm sm:text-base font-medium text-muted-foreground">Upcoming Events</span>
                  <Clock className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{stats.upcomingEvents}</div>
              </div>
              <div className={`rounded-2xl sm:rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-7 flex flex-col items-center justify-center ${adminHoverCardClass}`}>
                <div className="flex flex-row items-center justify-between w-full mb-3 sm:mb-4">
                  <span className="text-sm sm:text-base font-medium text-muted-foreground">Completion Rate</span>
                  <Target className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{Math.floor(stats.completionRate)}%</div>
              </div>
            </div>

            {/* ═══════ ROW 3 — Top Performers + Your Rank ═══════ */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
              {/* Top Performers (transactions-style) */}
              <div className={`lg:col-span-3 rounded-2xl p-5 bg-[var(--color-card)] border border-[var(--color-border)] ${adminHoverCardClass}`}>
                <div className="mb-3 text-left">
                  <h3 className="text-[22px] font-bold tracking-tight text-foreground">Top Performers</h3>
                  <p className="text-sm text-muted-foreground mt-1">Students leading this semester by credits earned</p>
                </div>

                {loading ? (
                  <div className="space-y-2.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-[74px] w-full rounded-xl" />
                    ))}
                  </div>
                ) : topPerformers.length === 0 ? (
                  <div className="text-center py-10 rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)]/30">
                    <Trophy className="w-8 h-8 text-muted-foreground/60 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No leaderboard data yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {topPerformers.slice(0, 6).map((entry, index) => (
                      <div
                        key={`${entry.userId}-${index}`}
                        className="flex items-center gap-3.5 px-4.5 py-3.5 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)]/35 hover:bg-[var(--color-surface)] shadow-[0_2px_8px_rgba(15,23,42,0.08)] hover:shadow-[0_6px_14px_rgba(15,23,42,0.1)] transition-[background-color,box-shadow]"
                      >
                        {/* Rank badge */}
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
                          {entry.rank}
                        </div>
                        {/* Performer details with enhanced visual metrics */}
                        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:gap-4">
                          <div className="min-w-0">
                            <p className="text-[15px] sm:text-base font-semibold text-foreground truncate leading-tight">
                              {entry.userName || 'Anonymous'}
                            </p>
                            <p className="text-[13px] sm:text-sm text-muted-foreground font-medium mt-1 leading-tight">
                              {entry.department} &bull; Year {entry.year}
                            </p>
                          </div>

                          <div className="justify-self-start sm:justify-self-end flex items-center gap-2 flex-wrap sm:flex-nowrap">
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#1c4f73]/20 bg-[#1c4f73]/8 px-2 py-0.5 text-[12px] sm:text-[13px] font-semibold text-[#1c4f73] dark:text-[#8ec1df]">
                              <Award className="w-3.5 h-3.5" />
                              {entry.credits} credits
                            </span>
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#16b78b]/22 bg-[#16b78b]/10 px-2 py-0.5 text-[12px] sm:text-[13px] font-semibold text-[#138e6d] dark:text-[#1cbaba]">
                              <Calendar className="w-3.5 h-3.5" />
                              {entry.eventsAttended} events
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Your Rank — Detailed pictorial card */}
              <div className={`lg:col-span-2 rounded-2xl p-5 bg-[var(--color-card)] border border-[var(--color-border)] ${adminHoverCardClass} h-full flex flex-col`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[22px] font-bold tracking-tight text-foreground">Your Rank</h3>
                  {globalRank && rankStats && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1c4f73]/10 border border-[#1c4f73]/24 text-[#1c4f73] dark:text-[#7fb3d6] text-sm font-semibold shadow-sm">
                      <TrendingUp className="w-3 h-3" /> Top {rankStats.topPercent}% Global
                    </span>
                  )}
                </div>
                <div className="flex-1 flex flex-col">
                  {loading ? (
                    <div className="flex flex-col items-center py-8 gap-4 flex-1">
                      <Skeleton className="h-44 w-44 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-20 w-full rounded-xl" />
                      <Skeleton className="h-10 w-full rounded-xl" />
                    </div>
                  ) : userRank && globalRank && rankStats ? (
                    <div className="flex-1 flex flex-col">
                      <div className="mb-4">
                        <p className="text-base font-medium text-muted-foreground">This semester</p>
                      </div>

                      {/* Dual Donut charts */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1">
                        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 p-3 shadow-[0_2px_8px_rgba(15,23,42,0.08)] flex flex-col items-center justify-center">
                          <p className="text-sm font-semibold text-foreground text-center mb-2">Global Rank</p>
                          <div className="flex justify-center">
                            <DonutChart
                              segments={globalRankDonutSegments}
                              centerValue={`#${globalRank.rank}`}
                              centerLabel={`of ${globalRank.totalUsers}`}
                              size={145}
                            />
                          </div>
                        </div>
                        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]/40 p-3 shadow-[0_2px_8px_rgba(15,23,42,0.08)] flex flex-col items-center justify-center">
                          <p className="text-sm font-semibold text-foreground text-center mb-2">
                            Division Rank{myDivision ? ` (D${myDivision})` : ''}
                          </p>
                          <div className="flex justify-center">
                            {divisionRank && divisionRank.rank > 0 && divisionRank.totalUsers > 0 ? (
                              <DonutChart
                                segments={divisionRankDonutSegments}
                                centerValue={`#${divisionRank.rank}`}
                                centerLabel={`of ${divisionRank.totalUsers}`}
                                size={145}
                              />
                            ) : (
                              <div className="w-[145px] h-[145px] rounded-full border-2 border-dashed border-[var(--color-border)] bg-[var(--color-card)]/70 flex items-center justify-center p-5 text-center">
                                <div className="space-y-1">
                                  <p className="text-[13px] font-semibold text-foreground leading-tight">Division Rank</p>
                                  <p className="text-[11px] text-muted-foreground leading-snug">Available for first-year students</p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2.5 justify-center">
                        {globalRankDonutSegments
                          .filter((s) => s.value > 0)
                          .map((seg) => (
                            <div key={seg.label} className="flex items-center gap-2 text-sm">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                              <span className="text-muted-foreground font-semibold">{seg.label} ({seg.value})</span>
                            </div>
                          ))}
                      </div>

                      {/* Stats grid */}
                      <div className="grid grid-cols-3 gap-3 mt-5">
                        <div className="text-center p-3 bg-[#1c4f73]/10 border border-[#1c4f73]/22 rounded-xl">
                          <p className="text-xl font-bold text-[#1c4f73] dark:text-[#7fb3d6]">{rankStats.userCredits}</p>
                          <p className="text-sm text-[#1c4f73]/80 dark:text-[#7fb3d6]/80 font-semibold uppercase tracking-wide">Credits</p>
                        </div>
                        <div className="text-center p-3 bg-[#f2c94c]/16 border border-[#f2c94c]/30 rounded-xl">
                          <p className="text-xl font-bold text-[#b88700]">{userRank.eventsAttended}</p>
                          <p className="text-sm text-[#b88700]/80 font-semibold uppercase tracking-wide">Events</p>
                        </div>
                        <div className="text-center p-3 bg-[#16b78b]/11 border border-[#16b78b]/24 rounded-xl">
                          <p className="text-xl font-bold text-[#138e6d] dark:text-[#72ddbf]">{rankStats.topPercent}%</p>
                          <p className="text-sm text-[#138e6d]/80 dark:text-[#72ddbf]/80 font-semibold uppercase tracking-wide">Percentile</p>
                        </div>
                      </div>

                      {/* View leaderboard */}
                      <div className="mt-3">
                        <button
                          onClick={() => router.push('/student/leaderboard')}
                          className="w-full py-2.5 text-sm font-semibold bg-[var(--color-button-primary)] text-white hover:bg-[var(--color-button-primary-hover)] rounded-xl transition-colors flex items-center justify-center gap-1.5"
                        >
                          View Full Leaderboard <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center py-10 text-center flex-1">
                      <Trophy className="w-12 h-12 text-muted-foreground/40 mb-3" />
                      <p className="text-sm text-muted-foreground">Attend events to get ranked</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ═══════════════ ATTENDANCE HISTORY TAB ═══════════════ */}
        {activeTab === 'attendance' && (
          <div className="space-y-7">
            {attendanceLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto" />
                <p className="text-sm text-muted-foreground mt-4">Loading attendance data&hellip;</p>
              </div>
            ) : attendanceData?.sessions?.length > 0 ? (
              <>
                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {[
                    { icon: Award, label: 'Total Credits', value: attendanceData.totalCredits || 0, sub: 'Earned across all sessions', accent: 'border-l-primary' },
                    { icon: Calendar, label: 'Sessions Attended', value: attendanceData.sessionsAttended || 0, sub: 'Unique sessions completed', accent: 'border-l-emerald-500 dark:border-l-emerald-400' },
                    { icon: TrendingUp, label: 'Completion Rate', value: `${Math.floor(attendanceData.completionRate || 0)}%`, sub: 'Of registered sessions attended', accent: 'border-l-amber-500 dark:border-l-amber-400' },
                  ].map((stat) => (
                    <div key={stat.label} className={`bg-[var(--color-card)] border border-[var(--color-border)] border-l-4 ${stat.accent} p-6 rounded-xl ${adminHoverCardClass}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-muted/60">
                          <stat.icon className="w-4 h-4 text-foreground/70" />
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{stat.label}</p>
                      </div>
                      <p className="text-3xl font-bold text-foreground tracking-tight">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{stat.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Sessions List */}
                <div className={`bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] ${adminHoverCardClass}`}>
                  <div className="flex items-center justify-between px-7 pt-7 pb-5">
                    <div>
                      <h3 className="text-base font-semibold text-foreground">Session History</h3>
                      <p className="text-sm text-muted-foreground mt-0.5">{attendanceData.sessions.length} session{attendanceData.sessions.length !== 1 ? 's' : ''} recorded</p>
                    </div>
                  </div>
                  <div className="divide-y divide-border">
                    {attendanceData.sessions.map((session: any, idx: number) => (
                      <div key={session.id} className="flex items-center gap-4 px-7 py-5 hover:bg-muted/30 transition-colors">
                        {/* Index badge */}
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs font-bold text-muted-foreground">{idx + 1}</span>
                        </div>
                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{session.sessionName}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {new Date(session.startTime).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                timeZone: 'UTC',
                              })}
                            </span>
                            {session.location && (
                              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                <Target className="w-3 h-3" />
                                {session.location}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Credits pill */}
                        <span className="flex-shrink-0 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold">
                          +{session.credits}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className={`text-center py-16 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] ${adminHoverCardClass}`}>
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">No Attendance Records Yet</h3>
                <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
                  Start attending sessions to build your history and earn credits.
                </p>
                <button
                  onClick={() => router.push('/student/events')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Browse Events <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════ ACHIEVEMENTS TAB ═══════════════ */}
        {activeTab === 'achievements' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Personal Best */}
              {attendanceData?.userPersonalBest?.credits > 0 && (
                <div className={`lg:col-span-2 relative overflow-hidden bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl ${adminHoverCardClass}`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-primary/5" />
                  <div className="relative p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-primary" />
                      Personal Best
                    </p>
                    <p className="text-4xl font-bold text-foreground mt-2 tracking-tight leading-none">
                      {attendanceData.userPersonalBest.credits}
                    </p>
                    <p className="text-sm font-medium text-muted-foreground mt-1">credits in one session</p>
                    <div className="mt-5 w-11 h-11 rounded-xl bg-primary/12 flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </div>
              )}

              {/* Progress summary */}
              <div className={`${attendanceData?.userPersonalBest?.credits > 0 ? 'lg:col-span-3' : 'lg:col-span-5'} bg-[var(--color-card)] border border-[var(--color-border)] rounded-xl p-7 ${adminHoverCardClass}`}>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">Milestone Progress</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {unlockedMilestones} of {milestones.length} milestones unlocked
                    </p>
                  </div>
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sm font-bold text-primary">
                    {milestoneProgressPercent}%
                  </span>
                </div>
                <div className="h-3 rounded-full bg-[var(--color-achievement-progress-bg)] overflow-hidden border border-[var(--color-border)]">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-700"
                    style={{ width: `${milestoneProgressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Milestones */}
            <div className={`bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] ${adminHoverCardClass}`}>
              <div className="px-6 pt-6 pb-4 flex items-center justify-between gap-3 border-b border-[var(--color-border-light)]">
                <h3 className="text-base font-semibold text-foreground">All Milestones</h3>
                <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {milestones.length - unlockedMilestones} remaining
                </span>
              </div>
              <div className="divide-y divide-[var(--color-border-light)]">
                {milestones.map((m) => {
                  const Icon = m.icon;
                  return (
                    <div
                      key={m.title}
                      className={`flex items-center gap-4 px-6 py-4 transition-colors ${m.done ? 'hover:bg-primary/5' : 'hover:bg-[var(--color-surface)]'
                        }`}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center border ${m.done ? 'bg-primary/10 border-primary/20' : 'bg-muted border-[var(--color-border)]'
                        }`}>
                        <Icon className={`w-5 h-5 ${m.done ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${m.done ? 'text-foreground' : 'text-muted-foreground'}`}>{m.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{m.desc}</p>
                      </div>
                      {m.done ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Done
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--color-surface)] text-muted-foreground border border-[var(--color-border)]">
                          Locked
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

/* ──────────────────── Bank-style stat card ──────────────────── */
interface BankStyleCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
  loading: boolean;
  maskValue?: boolean;
}

function BankStyleCard({ icon, label, value, accent, loading }: BankStyleCardProps) {
  if (loading) {
    return (
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 min-h-[185px] shadow-sm transition-shadow duration-200 flex flex-col items-center justify-center text-center gap-4">
        <Skeleton className="h-9 w-9 rounded-lg" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-16" />
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 min-h-[185px] shadow-sm hover:shadow-md transition-shadow duration-200 group flex flex-col items-center justify-center text-center gap-4">
      <div className={`p-2 rounded-xl bg-muted/60 ${accent}`}>{icon}</div>
      <p className="text-lg tracking-tight text-foreground font-medium">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}
