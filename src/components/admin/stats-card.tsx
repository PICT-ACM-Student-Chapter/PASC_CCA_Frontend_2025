import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  Icon?: React.ComponentType<{ className?: string }>;
}

export const StatsCard = ({ title, value, Icon }: StatsCardProps) => (
  <div className="rounded-2xl sm:rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-7 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-300">
    <div className="flex flex-row items-center justify-between w-full mb-3 sm:mb-4">
      <span className="text-sm sm:text-base font-medium text-muted-foreground">{title}</span>
      {Icon && <Icon className="w-5 h-5 text-muted-foreground" />}
    </div>
    <div className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">{value}</div>
  </div>
);
