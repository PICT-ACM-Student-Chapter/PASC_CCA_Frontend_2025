"use client";

import { useState } from "react";
import { User as UserIcon, BadgeCheck, Clock, Star, BookOpen } from "lucide-react";
import { ProfileCard } from "../../../../components/profile/ProfileCard";
import { Tabs } from "../../../../components/profile/Tabs";
import { StatCard } from "../../../../components/profile/StatCard";
import { ProgressStatCard } from "../../../../components/profile/ProgressStatCard";
import { RecentActivity } from "../../../../components/profile/RecentActivity";
import { User, Tab, Activity } from "../../../../.next/types/app/student/profile/types";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");

  const user: User = {
    name: "John Doe",
    email: "johndoe123@gmail.com",
    department: "CE",
    passOutYear: "2026",
    rollNo: "31103",
    year: "3rd Year",
  };

  const tabs: Tab[] = [
    { id: "dashboard", label: "Dashboard" },
    { id: "events", label: "My Events" },
  ];

  const activities: Activity[] = [
    {
      icon: <BadgeCheck className="w-6 h-6 text-success" />,
      title: "Web Dev SIG",
      date: "2/7/25 - 4h",
    },
    {
      icon: <BadgeCheck className="w-6 h-6 text-success" />,
      title: "ML Bootcamp",
      date: "8/7/25 - 6h",
    },
  ];

  return (
    <main className="bg-background p-2 md:p-6 text-primary">
      <div
        className="mx-auto flex flex-col gap-6"
        style={{ height: "calc(100vh - 80px)", overflowY: "auto" }}
      >
        {/* Top: Profile Card + Stat Cards */}
        <div className="flex flex-col lg:flex-row gap-6">
          <ProfileCard user={user} />

          {/* Stat Cards */}
          <div className="w-full lg:w-2/3 flex flex-col gap-6">
            <Tabs tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Stats Grid: 2x2 on desktop, stacked on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <StatCard
                icon={<BadgeCheck className="w-5 h-5 text-success" />}
                title="Events Attended"
                value="12"
                subtext="out of 15 Events"
                color="text-success"
              />
              <StatCard
                icon={<Clock className="w-5 h-5 text-info" />}
                title="Credit Hours"
                value="20"
                subtext="10 hours to goal"
                color="text-info"
              />
              <ProgressStatCard
                icon={<BookOpen className="w-5 h-5 text-progress" />}
                title="Completion Rate"
                progress={75}
                color="bg-progress"
              />
              <StatCard
                icon={<Star className="w-5 h-5 text-warning" />}
                title="Personal Best"
                value="10"
                subtext="hrs earned at Web Dev SIG"
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