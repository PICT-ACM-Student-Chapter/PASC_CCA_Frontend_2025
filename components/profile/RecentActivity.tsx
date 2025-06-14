"use client";

import { Activity } from "./types";
import { ActivityItem } from "./ActivityItem";

interface RecentActivityProps {
  activities: Activity[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <div className="bg-card rounded-xl p-4 border border-card">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <ul className="flex flex-col gap-3">
        {activities.map((activity, index) => (
          <ActivityItem
            key={index}
            icon={activity.icon}
            title={activity.title}
            date={activity.date}
          />
        ))}
      </ul>
    </div>
  );
};