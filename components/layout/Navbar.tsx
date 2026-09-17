"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Sun, Moon, User, LayoutDashboard, Calendar, Trophy, Bell, Menu, X, LogIn, Megaphone } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { apiUrl } from "@/lib/utils";

const Navbar = ({ adminSecretRoute = "" }: { adminSecretRoute?: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const role = useAuthStore((state) => state.role);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const { clearAuth } = useAuthStore();
  const user = useAuthStore((state) => state.user);
  const admin = useAuthStore((state) => state.admin);

  // Determine if user is actually logged in.
  // We use localStorage as the source of truth so the Navbar stays consistent
  // even when the Zustand store hasn't been hydrated yet (e.g. when the user
  // navigates to the landing page "/" directly without going through AuthGuard).
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [effectiveRole, setEffectiveRole] = useState<"student" | "admin" | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role") as "student" | "admin" | null;
    // Logged in if: there's a token AND (the Zustand store has user/admin data OR localStorage has a role)
    const loggedIn = !!(token && (user || admin || storedRole));
    setIsLoggedIn(loggedIn);
    // Role: prefer the live Zustand store value, fall back to localStorage
    setEffectiveRole(role ?? storedRole);
  }, [user, admin, role]);

  // Check if we're on the landing page or auth pages
  const isLandingPage = pathname === "/";
  const isAuthPage =
    pathname.startsWith("/auth") ||
    (!!adminSecretRoute && (pathname === `/${adminSecretRoute}` || pathname.startsWith(`/${adminSecretRoute}/`)));

  const clearAuthStorageAndCookies = () => {
    clearAuth();
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("userId");
    document.cookie =
      "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie =
      "role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;";
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"
        }/auth/user/logout`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (e) {
      // ignore error
    }
    clearAuthStorageAndCookies();
    router.push("/auth/login");
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showUserMenu) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      setTimeout(() => document.addEventListener("click", handleClickOutside), 0);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showUserMenu]);

  if (isAuthPage) {
    return (
      <div className="absolute top-0 left-0 w-full z-50 flex justify-between items-center px-6 py-4 pointer-events-none">
        <Link href="/" className="pointer-events-auto">
          <Image src="/logo.png" width={120} height={80} alt="logo" priority />
        </Link>
        <div className="flex items-center gap-4 pointer-events-auto">
          <div className="pointer-events-auto backdrop-blur-md rounded-full bg-slate-50/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center">
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    );
  }

  return (
    <nav className="w-full sticky top-0 z-50 bg-[var(--color-navbar)]/80 backdrop-blur-xl border-b border-[var(--color-border)]/50 transition-colors shadow-sm">
      <div className="flex justify-between items-center mx-auto px-5 py-3">
        {/* Logo */}
        <Link href={isLoggedIn ? (effectiveRole === "admin" ? "/admin/dashboard" : "/student/dashboard") : "/"} className="flex items-center cursor-pointer transition-transform hover:scale-105 duration-300">
          <Image src="/logo.png" width={120} height={80} alt="logo" priority />
        </Link>

        {/* Navigation Links - Only show for logged in users */}
        {isLoggedIn && effectiveRole === "student" && (
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/student/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${isActive("/student/dashboard")
                ? "bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active)] font-medium"
                : "text-[var(--color-nav-text)] hover:bg-[var(--color-nav-hover-bg)]"
                }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/student/events"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${isActive("/student/events")
                ? "bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active)] font-medium"
                : "text-[var(--color-nav-text)] hover:bg-[var(--color-nav-hover-bg)]"
                }`}
            >
              <Calendar className="w-4 h-4" />
              Events
            </Link>
            <Link
              href="/student/leaderboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${isActive("/student/leaderboard")
                ? "bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active)] font-medium"
                : "text-[var(--color-nav-text)] hover:bg-[var(--color-nav-hover-bg)]"
                }`}
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </Link>
            <Link
              href="/student/announcements"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${isActive("/student/announcements")
                ? "bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active)] font-medium"
                : "text-[var(--color-nav-text)] hover:bg-[var(--color-nav-hover-bg)]"
                }`}
            >
              <Bell className="w-4 h-4" />
              Announcements
            </Link>
          </div>
        )}

        {isLoggedIn && effectiveRole === "admin" && (
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${isActive("/admin/dashboard")
                ? "bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active)] font-medium"
                : "text-[var(--color-nav-text)] hover:bg-[var(--color-nav-hover-bg)]"
                }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/events"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${isActive("/admin/events")
                ? "bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active)] font-medium"
                : "text-[var(--color-nav-text)] hover:bg-[var(--color-nav-hover-bg)]"
                }`}
            >
              <Calendar className="w-4 h-4" />
              Events
            </Link>
            <Link
              href="/admin/announcements"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${isActive("/admin/announcements")
                ? "bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active)] font-medium"
                : "text-[var(--color-nav-text)] hover:bg-[var(--color-nav-hover-bg)]"
                }`}
            >
              <Megaphone className="w-4 h-4" />
              Announcements
            </Link>
          </div>
        )}

        {/* Right side icons */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button - only for logged in users */}
          {isLoggedIn && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-[var(--color-nav-hover-bg)] transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-[var(--color-text-secondary)]" />
              ) : (
                <Menu className="h-6 w-6 text-[var(--color-text-secondary)]" />
              )}
            </button>
          )}

          <ThemeSwitcher />

          {/* Notification Bell - show for both student and admin */}
          {isLoggedIn && <NotificationBell />}

          {/* Show Login/Signup for guests, Profile dropdown for logged in users */}
          {!isLoggedIn ? (
            // Guest view - Show only Login button
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="flex items-center gap-2 px-6 py-2.5 bg-[var(--color-button-primary)] text-white rounded-lg font-bold hover:bg-[var(--color-button-primary-hover)] hover:shadow-lg transition-all"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
            </div>
          ) : (
            // Logged in view - Show profile dropdown
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowUserMenu(!showUserMenu);
                }}
                className="bg-[var(--color-primary)] p-2 rounded-full cursor-pointer hover:bg-[var(--color-primary-hover)] hover:shadow-[0_0_15px_rgba(26,144,255,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 group border border-[var(--color-primary)]"
              >
                <User className="h-6 w-6 text-white transition-colors" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-[19rem] bg-[var(--color-card)] border border-[var(--color-border-light)] rounded-2xl shadow-[0_1px_3px_rgba(15,23,42,0.1),0_14px_30px_rgba(15,23,42,0.12)] z-50 transition-all duration-200 origin-top-right flex flex-col p-2">
                  {/* User Info Card */}
                  <div className="p-4 rounded-xl bg-[var(--color-surface)]/50 border border-[var(--color-border-light)] mb-2 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center shrink-0">
                        <User className="h-5 w-5 text-[var(--color-primary)]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[var(--color-text-primary)] truncate leading-tight">{user?.name || admin?.name || 'User'}</p>
                        <p className="text-xs text-[var(--color-text-muted)] truncate mt-0.5">{user?.email || admin?.email}</p>
                      </div>
                    </div>
                    {user && (
                      <div className="space-y-1.5 text-xs mt-4 pt-3 border-t border-[var(--color-border-light)]">
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--color-text-muted)] font-medium">Department:</span>
                          <span className="font-semibold text-[var(--color-text-primary)]">{user.department}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[var(--color-text-muted)] font-medium">Year:</span>
                          <span className="font-semibold text-[var(--color-text-primary)]">{user.year}</span>
                        </div>
                        {user.roll && (
                          <div className="flex justify-between items-center">
                            <span className="text-[var(--color-text-muted)] font-medium">Roll No:</span>
                            <span className="font-semibold text-[var(--color-text-primary)]">{user.roll}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push(effectiveRole === "admin" ? "/admin/dashboard" : "/student/dashboard");
                      }}
                      className="w-full text-left px-3 py-2.5 rounded-lg transition-colors duration-200 flex items-center gap-3 text-[var(--color-text-secondary)] font-medium text-sm hover:bg-[var(--color-primary)]/10 hover:text-[var(--color-primary)]"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2.5 rounded-lg transition-colors duration-200 flex items-center gap-3 text-red-600 dark:text-red-400 font-medium text-sm hover:bg-red-50 dark:hover:bg-red-500/15"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && isLoggedIn && effectiveRole === "student" && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-navbar)] text-[var(--color-text-primary)] transition-colors">
          <div className="flex flex-col p-4 space-y-2">
            <Link
              href="/student/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/student/dashboard")
                ? "bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active)] font-medium"
                : "text-[var(--color-nav-text)] hover:bg-[var(--color-nav-hover-bg)]"
                }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <Link
              href="/student/events"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/student/events")
                ? "bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active)] font-medium"
                : "text-[var(--color-nav-text)] hover:bg-[var(--color-nav-hover-bg)]"
                }`}
            >
              <Calendar className="w-5 h-5" />
              Events
            </Link>
            <Link
              href="/student/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/student/leaderboard")
                ? "bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active)] font-medium"
                : "text-[var(--color-nav-text)] hover:bg-[var(--color-nav-hover-bg)]"
                }`}
            >
              <Trophy className="w-5 h-5" />
              Leaderboard
            </Link>
            <Link
              href="/student/announcements"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/student/announcements")
                ? "bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active)] font-medium"
                : "text-[var(--color-nav-text)] hover:bg-[var(--color-nav-hover-bg)]"
                }`}
            >
              <Bell className="w-5 h-5" />
              Announcements
            </Link>
          </div>
        </div>
      )}

      {mobileMenuOpen && isLoggedIn && effectiveRole === "admin" && (
        <div className="md:hidden border-t border-[var(--color-border)] bg-[var(--color-navbar)] text-[var(--color-text-primary)] transition-colors">
          <div className="flex flex-col p-4 space-y-2">
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/admin/dashboard")
                ? "bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active)] font-medium"
                : "text-[var(--color-nav-text)] hover:bg-[var(--color-nav-hover-bg)]"
                }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <Link
              href="/admin/events"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/admin/events")
                ? "bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active)] font-medium"
                : "text-[var(--color-nav-text)] hover:bg-[var(--color-nav-hover-bg)]"
                }`}
            >
              <Calendar className="w-5 h-5" />
              Events
            </Link>
            <Link
              href="/admin/announcements"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/admin/announcements")
                ? "bg-[var(--color-nav-active-bg)] text-[var(--color-nav-active)] font-medium"
                : "text-[var(--color-nav-text)] hover:bg-[var(--color-nav-hover-bg)]"
                }`}
            >
              <Megaphone className="w-5 h-5" />
              Announcements
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
