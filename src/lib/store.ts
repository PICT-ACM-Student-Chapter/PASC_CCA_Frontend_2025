import { create } from 'zustand';
import { IUser, IAdmin } from '@/types/auth';

interface AuthStore {
  user?: IUser;
  admin?: IAdmin;
  role : "student" | "admin";
  setAuth: (auth: { user?: IUser; admin?: IAdmin; role: "student" | "admin" }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: undefined,
  admin: undefined,
  role: "student",

  setAuth: ({ user, admin , role }) => set(() => ({
    user,
    admin,
    role,
  })),
  clearAuth: () => set(() => ({
    user: undefined,
    admin: undefined,
    role: "student",
  })),
}));

