"use client";

interface ActivityItemProps {
  icon: React.ReactNode;
  title: string;
  date: string;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ icon, title, date }) => {
  return (
    <li className="flex items-center justify-between bg-[var(--color-profile)] rounded-lg p-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-medium">{title}</span>
      </div>
      <span className="text-secondary text-sm">{date}</span>
    </li>
  );
};