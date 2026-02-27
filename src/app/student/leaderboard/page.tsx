'use client';

import { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Crown, TrendingUp, Info } from 'lucide-react';
import { leaderboardAPI } from '@/lib/api';
import { LeaderboardEntry, LeaderboardPeriod } from '@/types/leaderboard';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const periods: { value: LeaderboardPeriod; label: string }[] = [
  { value: 'WEEKLY', label: 'This Week' },
  { value: 'MONTHLY', label: 'This Month' },
  { value: 'SEMESTER', label: 'This Semester' },
  { value: 'YEARLY', label: 'This Year' },
  { value: 'ALL_TIME', label: 'All Time' },
];

const TOTAL_DIVISIONS = 13;

type LeaderboardScope = 'global' | 'division';

interface MyDivisionInfo {
  isFirstYear: boolean;
  division: number | null;
  year: number;
  roll: number | null;
}

export default function LeaderboardPage() {
  const [scope, setScope] = useState<LeaderboardScope>('global');
  const [selectedDivision, setSelectedDivision] = useState<number>(1);
  const [selectedPeriod, setSelectedPeriod] = useState<LeaderboardPeriod>('SEMESTER');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [myInfo, setMyInfo] = useState<MyDivisionInfo | null>(null);
  const [myInfoLoading, setMyInfoLoading] = useState(true);
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null);

  useEffect(() => {
    const fetchMyInfo = async () => {
      setMyInfoLoading(true);
      try {
        const res = await leaderboardAPI.getMyDivision();
        if (res.data?.success && res.data.data) {
          const info = res.data.data as MyDivisionInfo;
          setMyInfo(info);
          if (info.isFirstYear && info.division != null) {
            setSelectedDivision(info.division);
          }
        }
      } catch {
        // Not logged in or error — myInfo stays null
      } finally {
        setMyInfoLoading(false);
      }
    };
    fetchMyInfo();
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, scope, selectedDivision]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const divisionParam = scope === 'division' ? selectedDivision : undefined;
      const response = await leaderboardAPI.get({
        period: selectedPeriod,
        division: divisionParam,
        limit: 50,
      });
      if (response.data?.success && response.data.data) {
        const data = response.data.data as LeaderboardEntry[];
        setLeaderboard(data);
        const userId = parseInt(localStorage.getItem('userId') || '0');
        const userEntry = data.find((entry) => entry.userId === userId);
        setUserRank(userEntry || null);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-orange-500" />;
      default: return <Award className="w-6 h-6 text-blue-500" />;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900';
      case 3: return 'bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900';
      default: return 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100';
    }
  };

  const currentUserId = typeof window !== 'undefined' ? parseInt(localStorage.getItem('userId') || '0') : 0;
  const isCurrentUserFirstYear = myInfo?.isFirstYear ?? false;

  const shouldHighlightUser = (entry: LeaderboardEntry) => {
    if (entry.userId !== currentUserId) return false;
    if (scope === 'global') return true;
    return isCurrentUserFirstYear;
  };

  const showMyRankCard = scope === 'division' && isCurrentUserFirstYear && userRank != null;
  const showDivisionBanner = scope === 'division' && !myInfoLoading && !isCurrentUserFirstYear;

  return (
    <main className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Trophy className="w-10 h-10 text-yellow-500" />
            <h1 className="text-4xl font-bold text-foreground">Leaderboard</h1>
          </div>
          <p className="text-muted-foreground">Compete with your peers and climb the ranks!</p>
        </div>

        {/* Scope Toggle */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <span className="text-sm text-muted-foreground font-medium">View:</span>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setScope('global')}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                scope === 'global' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-accent'
              }`}
            >
              Global
            </button>
            <button
              type="button"
              onClick={() => setScope('division')}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-l border-border ${
                scope === 'division' ? 'bg-primary text-primary-foreground' : 'bg-card text-foreground hover:bg-accent'
              }`}
            >
              Division
            </button>
          </div>

          {scope === 'division' && (
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(Number(e.target.value))}
              className="h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {Array.from({ length: TOTAL_DIVISIONS }, (_, i) => i + 1).map((div) => (
                <option key={div} value={div}>Division {div}</option>
              ))}
            </select>
          )}
        </div>

        {/* Period Selector */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => setSelectedPeriod(period.value)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedPeriod === period.value
                  ? 'bg-primary text-primary-foreground shadow-lg scale-105'
                  : 'bg-card text-foreground border border-border hover:bg-accent'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Non-first-year info banner (division view only) */}
        {showDivisionBanner && (
          <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-blue-800 dark:text-blue-200">
            <Info className="w-5 h-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Division Leaderboard – First-Year Students Only</p>
              <p className="text-sm mt-1 text-blue-700 dark:text-blue-300">
                The division leaderboard ranks <strong>first-year</strong> students by credits within their division (based on roll number).
                As a Year {myInfo?.year} student, you are not ranked here — this is view-only for you.
              </p>
            </div>
          </div>
        )}

        {/* Your Rank card – Global */}
        {scope === 'global' && userRank && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium">Your Global Rank</p>
                  <h2 className="text-4xl font-bold">#{userRank.rank}</h2>
                  <p className="text-blue-100 mt-1">{userRank.credits} credits • {userRank.eventsAttended} events</p>
                </div>
              </div>
              {getRankIcon(userRank.rank)}
            </div>
          </div>
        )}

        {/* Your Rank card – Division (first-year only) */}
        {showMyRankCard && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Your Rank in Division {selectedDivision}</p>
                  <h2 className="text-4xl font-bold">#{userRank.rank}</h2>
                  <p className="text-emerald-100 mt-1">{userRank.credits} credits • {userRank.eventsAttended} events</p>
                </div>
              </div>
              {getRankIcon(userRank.rank)}
            </div>
          </div>
        )}

        {/* Top 3 Podium */}
        {!loading && leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <div className="flex flex-col items-center pt-8">
              <Medal className="w-12 h-12 text-gray-400 mb-3" />
              <Avatar className="w-20 h-20 border-4 border-gray-400">
                <AvatarFallback className="bg-gray-200 text-gray-800 text-2xl font-bold">
                  {leaderboard[1].userName?.charAt(0) || '2'}
                </AvatarFallback>
              </Avatar>
              <div className="mt-3 text-center">
                <p className="font-bold text-lg">{leaderboard[1].userName || 'User'}</p>
                <p className="text-sm text-muted-foreground">{leaderboard[1].department}</p>
                <p className="text-2xl font-bold text-foreground mt-2">{leaderboard[1].credits}</p>
                <p className="text-xs text-muted-foreground">credits</p>
              </div>
            </div>
            {/* 1st Place */}
            <div className="flex flex-col items-center">
              <Crown className="w-16 h-16 text-yellow-500 mb-3 animate-bounce" />
              <Avatar className="w-24 h-24 border-4 border-yellow-500">
                <AvatarFallback className="bg-yellow-100 text-yellow-800 text-3xl font-bold">
                  {leaderboard[0].userName?.charAt(0) || '1'}
                </AvatarFallback>
              </Avatar>
              <div className="mt-3 text-center">
                <p className="font-bold text-xl">{leaderboard[0].userName || 'User'}</p>
                <p className="text-sm text-muted-foreground">{leaderboard[0].department}</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{leaderboard[0].credits}</p>
                <p className="text-xs text-muted-foreground">credits</p>
              </div>
            </div>
            {/* 3rd Place */}
            <div className="flex flex-col items-center pt-12">
              <Medal className="w-10 h-10 text-orange-500 mb-3" />
              <Avatar className="w-18 h-18 border-4 border-orange-500">
                <AvatarFallback className="bg-orange-100 text-orange-800 text-xl font-bold">
                  {leaderboard[2].userName?.charAt(0) || '3'}
                </AvatarFallback>
              </Avatar>
              <div className="mt-3 text-center">
                <p className="font-bold">{leaderboard[2].userName || 'User'}</p>
                <p className="text-sm text-muted-foreground">{leaderboard[2].department}</p>
                <p className="text-xl font-bold text-foreground mt-2">{leaderboard[2].credits}</p>
                <p className="text-xs text-muted-foreground">credits</p>
              </div>
            </div>
          </div>
        )}

        {/* Division subtitle */}
        {scope === 'division' && !loading && (
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-muted-foreground">
              Showing <strong>Division {selectedDivision}</strong> — first-year students only
            </p>
            <span className="text-xs bg-accent text-foreground px-2 py-1 rounded-full">
              {leaderboard.length} student{leaderboard.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Leaderboard Table */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-accent">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold">Department</th>
                  {scope === 'global' && <th className="px-6 py-4 text-left text-sm font-semibold">Year</th>}
                  <th className="px-6 py-4 text-right text-sm font-semibold">Events</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold">Credits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-8 w-8" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      {scope === 'global' && <td className="px-6 py-4"><Skeleton className="h-4 w-8" /></td>}
                      <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                    </tr>
                  ))
                ) : leaderboard.length === 0 ? (
                  <tr>
                    <td
                      colSpan={scope === 'global' ? 6 : 5}
                      className="px-6 py-12 text-center text-muted-foreground"
                    >
                      {scope === 'division'
                        ? `No first-year students found in Division ${selectedDivision} for this period.`
                        : 'No data available for this period'}
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry, index) => {
                    const isHighlighted = shouldHighlightUser(entry);
                    return (
                      <tr
                        key={`${entry.userId}-${index}`}
                        className={`hover:bg-accent transition-colors ${isHighlighted ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                      >
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold ${getRankBadgeColor(entry.rank)}`}>
                            {entry.rank}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10">
                              <AvatarFallback>{entry.userName?.charAt(0) || 'U'}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {entry.userName || 'Anonymous'}
                                {isHighlighted && (
                                  <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">You</span>
                                )}
                              </p>
                              <p className="text-sm text-muted-foreground">Year {entry.year}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-muted-foreground">{entry.department}</td>
                        {scope === 'global' && (
                          <td className="px-6 py-4 text-muted-foreground">Year {entry.year}</td>
                        )}
                        <td className="px-6 py-4 text-right font-medium">{entry.eventsAttended}</td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-lg font-bold text-foreground">{entry.credits}</span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}
