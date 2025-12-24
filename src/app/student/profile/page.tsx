"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  User as UserIcon, 
  BadgeCheck, 
  Clock, 
  Star, 
  BookOpen,
  Award,
  Calendar,
  MapPin,
  TrendingUp,
  Trophy
} from "lucide-react";
import { ProfileCard } from "../../../../components/profile/ProfileCard";
import { StatCard } from "../../../../components/profile/StatCard";
import { ProgressStatCard } from "../../../../components/profile/ProgressStatCard";
import { useAuthStore } from "@/lib/store";
import { Department } from "@/types/auth";
import axios from "axios";
import { UserAttendanceStats } from "@/types/attendance";
import { apiUrl, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Dummy data for zustand user
const dummyUser = {
  id: 1,
  name: "Jane Smith",
  email: "janesmith@example.com",
  password: "password123",
  department: Department.IT,
  year: 2,
  passoutYear: 2025,
  roll: 21045,
  hours: 18,
};

function useDashboardData(dummyDashboardData: UserAttendanceStats) {
  const [dashboardData, setDashboardData] = useState<UserAttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getData() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${apiUrl}/attendance/user-attendance-stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('Attendance stats:', response.data);
        setDashboardData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setDashboardData(dummyDashboardData);
        setLoading(false);
      }
    }
    getData();
  }, []);

  return { dashboardData, loading };
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Dummy dashboard data matching UserAttendanceStats
  const dummyDashboardData: UserAttendanceStats = {
    sessionsAttended: 0,
    sessions: [],
    totalCredits: 0,
    completionRate: 0,
    userPersonalBest: {
      sessionId: 0,
      userId: 0,
      credits: 0,
    },
  };

  // Set the dummy user in the zustand store (for demo purposes)
  const setAuth = useAuthStore((state) => state.setAuth);
  const userStore = useAuthStore((state) => state.user);
  if (!userStore) {
    setAuth({ user: dummyUser, admin: undefined, role: "student" });
  }

  // Map the zustand user to the UI User type
  const user = userStore
    ? {
        name: userStore.name || "",
        email: userStore.email,
        department: userStore.department,
        passOutYear: userStore.passoutYear?.toString() || "",
        rollNo: userStore.roll?.toString() || "",
        year: userStore.year?.toString() || "",
      }
    : undefined;

  // Use custom hook for dashboard data
  const { dashboardData, loading } = useDashboardData(dummyDashboardData);
  const stats = dashboardData || dummyDashboardData;

  // Generate activities from actual attended sessions
  const recentActivities = stats.sessions.slice(0, 5).map((session) => ({
    icon: <BookOpen className="w-4 h-4 text-blue-600" />,
    title: `Attended ${session.sessionName}`,
    date: session.startTime ? new Date(session.startTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    credits: session.credits,
  }));

  return (
    <main className="bg-gray-50 min-h-screen p-2 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <button 
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            onClick={() => router.push('/student/dashboard')}
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "overview"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <UserIcon className="w-4 h-4" />
                  Overview
                </div>
              </button>
              <button
                onClick={() => setActiveTab("attendance")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "attendance"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Attendance History
                </div>
              </button>
              <button
                onClick={() => setActiveTab("achievements")}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "achievements"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  Achievements
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Just Profile Info - Simple and Clean */}
                <div className="max-w-2xl mx-auto">
                  {user ? (
                    <ProfileCard user={user} />
                  ) : (
                    <div className="flex items-center justify-center h-64">
                      <span className="text-gray-500">No user data available.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ATTENDANCE HISTORY TAB */}
            {activeTab === "attendance" && (
              <div className="space-y-6">
                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Total Credits</p>
                          <p className="text-3xl font-bold text-blue-600">{stats.totalCredits}</p>
                        </div>
                        <Award className="w-12 h-12 text-blue-400 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-gradient-to-br from-green-50 to-green-100">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Sessions</p>
                          <p className="text-3xl font-bold text-green-600">{stats.sessionsAttended}</p>
                        </div>
                        <Calendar className="w-12 h-12 text-green-400 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Completion</p>
                          <p className="text-3xl font-bold text-purple-600">{Math.floor(stats.completionRate)}%</p>
                        </div>
                        <TrendingUp className="w-12 h-12 text-purple-400 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* All Attended Sessions */}
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-xl">All Attended Sessions</CardTitle>
                    <p className="text-sm text-gray-600">
                      {stats.sessions.length === 0
                        ? 'No sessions attended yet'
                        : `Complete history of ${stats.sessions.length} attended session${stats.sessions.length !== 1 ? 's' : ''}`}
                    </p>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="animate-pulse">
                            <div className="h-24 bg-gray-200 rounded-lg"></div>
                          </div>
                        ))}
                      </div>
                    ) : stats.sessions.length === 0 ? (
                      <div className="text-center py-12">
                        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">No sessions attended yet</p>
                        <p className="text-sm text-gray-400">Start attending events to earn credits!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {stats.sessions.map((session) => (
                          <div
                            key={session.id}
                            className="border rounded-lg p-4 hover:shadow-md transition-all bg-white hover:border-blue-300"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg text-gray-900">
                                  {session.sessionName}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                    ✓ Attended
                                  </Badge>
                                  <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                    {session.credits} {session.credits === 1 ? 'Credit' : 'Credits'}
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-gray-400" />
                                <span>{session.location}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-400" />
                                <span>{session.startTime ? formatDate(session.startTime) : 'N/A'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>
                                  {session.startTime && new Date(session.startTime).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                  {session.endTime &&
                                    ` - ${new Date(session.endTime).toLocaleTimeString('en-US', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}`}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* ACHIEVEMENTS TAB */}
            {activeTab === "achievements" && (
              <div className="space-y-6">
                {/* Personal Best */}
                {stats.userPersonalBest.credits > 0 ? (
                  <Card className="border-none shadow-md bg-gradient-to-r from-yellow-50 to-orange-50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-orange-700">
                        <Trophy className="w-6 h-6" />
                        Personal Best Session
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-2">Highest credits earned in a single session</p>
                          <p className="text-4xl font-bold text-orange-600 mb-2">
                            {stats.userPersonalBest.credits} credits
                          </p>
                          <p className="text-sm text-gray-700">
                            From: {stats.sessions.find(s => s.id === stats.userPersonalBest.sessionId)?.sessionName || 'Unknown Session'}
                          </p>
                        </div>
                        <Award className="w-20 h-20 text-orange-400 opacity-50" />
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="border-none shadow-sm">
                    <CardContent className="pt-6 text-center py-12">
                      <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No achievements yet</p>
                      <p className="text-sm text-gray-400 mt-2">Attend sessions to unlock achievements!</p>
                    </CardContent>
                  </Card>
                )}

                {/* Milestones */}
                <Card className="border-none shadow-sm">
                  <CardHeader>
                    <CardTitle>Milestones</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* First Session */}
                      <div className={`flex items-center gap-4 p-4 rounded-lg ${stats.sessionsAttended >= 1 ? 'bg-green-50 border border-green-200' : 'bg-gray-50'}`}>
                        <div className={`p-3 rounded-full ${stats.sessionsAttended >= 1 ? 'bg-green-100' : 'bg-gray-200'}`}>
                          <Star className={`w-6 h-6 ${stats.sessionsAttended >= 1 ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">First Steps</h4>
                          <p className="text-sm text-gray-600">Attend your first session</p>
                        </div>
                        {stats.sessionsAttended >= 1 && (
                          <Badge className="bg-green-600 text-white">Unlocked!</Badge>
                        )}
                      </div>

                      {/* 5 Sessions */}
                      <div className={`flex items-center gap-4 p-4 rounded-lg ${stats.sessionsAttended >= 5 ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
                        <div className={`p-3 rounded-full ${stats.sessionsAttended >= 5 ? 'bg-blue-100' : 'bg-gray-200'}`}>
                          <Award className={`w-6 h-6 ${stats.sessionsAttended >= 5 ? 'text-blue-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">Getting Started</h4>
                          <p className="text-sm text-gray-600">Attend 5 sessions ({stats.sessionsAttended}/5)</p>
                        </div>
                        {stats.sessionsAttended >= 5 && (
                          <Badge className="bg-blue-600 text-white">Unlocked!</Badge>
                        )}
                      </div>

                      {/* 10 Sessions */}
                      <div className={`flex items-center gap-4 p-4 rounded-lg ${stats.sessionsAttended >= 10 ? 'bg-purple-50 border border-purple-200' : 'bg-gray-50'}`}>
                        <div className={`p-3 rounded-full ${stats.sessionsAttended >= 10 ? 'bg-purple-100' : 'bg-gray-200'}`}>
                          <Trophy className={`w-6 h-6 ${stats.sessionsAttended >= 10 ? 'text-purple-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">Dedicated Learner</h4>
                          <p className="text-sm text-gray-600">Attend 10 sessions ({stats.sessionsAttended}/10)</p>
                        </div>
                        {stats.sessionsAttended >= 10 && (
                          <Badge className="bg-purple-600 text-white">Unlocked!</Badge>
                        )}
                      </div>

                      {/* 50 Credits */}
                      <div className={`flex items-center gap-4 p-4 rounded-lg ${stats.totalCredits >= 50 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                        <div className={`p-3 rounded-full ${stats.totalCredits >= 50 ? 'bg-yellow-100' : 'bg-gray-200'}`}>
                          <Award className={`w-6 h-6 ${stats.totalCredits >= 50 ? 'text-yellow-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">Credit Master</h4>
                          <p className="text-sm text-gray-600">Earn 50 credits ({stats.totalCredits}/50)</p>
                        </div>
                        {stats.totalCredits >= 50 && (
                          <Badge className="bg-yellow-600 text-white">Unlocked!</Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
