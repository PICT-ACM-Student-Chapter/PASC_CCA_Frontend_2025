"use client";

import { useState, useEffect } from "react";
import { User as UserIcon, BadgeCheck, Clock, Star, BookOpen } from "lucide-react";
import { ProfileCard } from "../../../../components/profile/ProfileCard";
import { StatCard } from "../../../../components/profile/StatCard";
import { ProgressStatCard } from "../../../../components/profile/ProgressStatCard";
import { RecentActivity } from "../../../../components/profile/RecentActivity";
import { useAuthStore } from "@/lib/store";
import { Department } from "@/types/auth";
import axios from "axios";
import { UserAttendanceStats } from "@/types/attendance";

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

  useEffect(() => {
    async function getData() {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://localhost:4000/api/attendance/user-attendance-stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data);
        setDashboardData(response.data);
      } catch (err) {
        setDashboardData(dummyDashboardData);
      }
    }
    getData();
  }, [dummyDashboardData]);

  return dashboardData;
}

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  // Dummy dashboard data matching UserAttendanceStats
  const dummyDashboardData: UserAttendanceStats = {
    sessionsAttended: 8,
    sessions: [
      {
        id: 1,
        eventId: 101,
        startTime: "",
        endTime: "",
        isActive: false,
        sessionName: "Web Dev SIG",
        code: "WD2024",
        location: "Auditorium",
        credits: 2,
      },
      {
        id: 2,
        eventId: 102,
        startTime: "",
        endTime: "",
        isActive: false,
        sessionName: "Hackathon",
        code: "HACK2024",
        location: "Lab 1",
        credits: 5,
      },
    ],
    totalCredits: 18,
    completionRate: 60,
    userPersonalBest: {
      sessionId: 2,
      userId: 1,
      credits: 7,
    },
  };

  // Set the dummy user in the zustand store (for demo purposes)
  // In a real app, this would be set on login/signup
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

  const activities: any[] = [
    {
      icon: <BookOpen className="w-4 h-4 text-progress" />,
      title: "Attended Web Dev SIG",
      date: "2024-03-15",
    },
    {
      icon: <Star className="w-4 h-4 text-warning" />,
      title: "Won Hackathon",
      date: "2024-02-10",
    },
  ];

  // Use custom hook for dashboard data
  const dashboardData = useDashboardData(dummyDashboardData);
  const stats = dashboardData || dummyDashboardData;

  return (
    <main className="bg-background p-2 md:p-6 text-primary">
      <div
        className="mx-auto flex flex-col gap-6"
        style={{ height: "calc(100vh - 80px)", overflowY: "auto" }}
      >
        {/* Top: Profile Card + Stat Cards */}
        <div className="flex flex-col lg:flex-row gap-6">
          {user ? (
            <ProfileCard user={user} />
          ) : (
            <div className="w-full lg:w-1/3 flex items-center justify-center">
              <span className="text-muted">No user data available.</span>
            </div>
          )}

          {/* Stat Cards */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            {/* Stats Grid: 2x2 on desktop, stacked on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard
                icon={<BadgeCheck className="w-5 h-5 text-success" />}
                title="Events Attended"
                value={stats.sessionsAttended.toString()}
                subtext={`out of ${stats.sessions.length} Events`}
                color="text-success"
              />
              <StatCard
                icon={<Clock className="w-5 h-5 text-info" />}
                title="Credit Hours"
                value={stats.totalCredits.toString()}
                subtext={" "}
                color="text-info"
              />
              <ProgressStatCard
                icon={<BookOpen className="w-5 h-5 text-progress" />}
                title="Completion Rate"
                progress={Math.floor(stats.completionRate)}
                color="bg-progress"
              />
              <StatCard
                icon={<Star className="w-5 h-5 text-warning" />}
                title="Personal Best"
                value={stats.userPersonalBest.credits.toString()}
                subtext={`hrs earned at ${stats.sessions.find(s => s.id === stats.userPersonalBest.sessionId)?.sessionName || "-"}`}
                color="text-warning"
              />
            </div>
          </div>
        </div>

        {/* Bottom: Recent Activity (full width) */}
        <RecentActivity activities={activities} />
      </div>
    </main>
  );
}