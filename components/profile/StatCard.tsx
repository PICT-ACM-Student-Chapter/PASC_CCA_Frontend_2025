"use client";

import { StatCardProps } from "./types";

export const StatCard: React.FC<StatCardProps> = ({
  icon,
  title,
  value,
  subtext,
  color,
}) => {
  return (
    <div className="bg-card rounded-xl p-4 flex flex-col gap-2 border border-card">
      <div className="flex items-center gap-2 text-secondary">
        {icon}
        {title}
      </div>
      <div className={`text-3xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-secondary">{subtext}</div>
    </div>
  );
};