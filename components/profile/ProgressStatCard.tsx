"use client";

import { ProgressStatCardProps} from "./types";

export const ProgressStatCard: React.FC<ProgressStatCardProps> = ({
  icon,
  title,
  progress,
  color,
}) => {
  const textColor = color.replace('bg-', 'text-')
  return (
    <div className="bg-card rounded-xl p-4 flex flex-col gap-4 border border-card">
      <div className="flex items-center gap-2 text-secondary">
        {icon}
        {title}
      </div>
      <div className="flex items-center gap-2">
        <div className="w-full h-2 bg-[var(--color-button-disabled)] rounded-full overflow-hidden">
          <div
            className={`h-2 rounded-full ${color}`} // Use barColor directly
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      <span className={`text-xl font-semibold ${textColor}`}>
        {progress}%
      </span>
    </div>
  );
};