"use client";

import { User as UserIcon} from "lucide-react";
import { User } from "./types";

interface ProfileCardProps {
  user: User;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  return (
    <div className="w-full lg:w-1/3 flex flex-col">
      <div className="bg-card rounded-xl shadow-sm p-6 flex flex-col items-center gap-4 border border-card h-full">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 rounded-full bg-[var(--color-profile)] flex items-center justify-center">
            <UserIcon className="w-10 h-10 text-[var(--color-text-muted)]" />
          </div>
          <h2 className="text-xl font-semibold">{user.name}</h2>
          <p className="text-muted">{user.email}</p>
        </div>
        <div className="w-full mt-4 flex flex-col gap-2 text-sm text-secondary">
          <div className="flex justify-between"><span>Department :</span><span>{user.department}</span></div>
          <div className="flex justify-between"><span>Pass out Year :</span><span>{user.passOutYear}</span></div>
          <div className="flex justify-between"><span>Roll No :</span><span>{user.rollNo}</span></div>
          <div className="flex justify-between"><span>Year :</span><span>{user.year}</span></div>
        </div>
      </div>
    </div>
  );
};