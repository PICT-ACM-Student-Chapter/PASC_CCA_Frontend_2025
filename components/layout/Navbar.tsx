"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Sun, Moon, User, LayoutDashboard, Calendar, Trophy, Bell, Menu, X, LogIn, UserPlus } from "lucide-react";
import ThemeSwitcher from "./ThemeSwitcher";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { NotificationBell } from "@/components/notifications/NotificationBell";

const Navbar = () => {
  const router = useRouter();
  const pathname = usePathname();
  const role = useAuthStore((state) => state.role);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const { clearAuth } = useAuthStore();
  const user = useAuthStore((state) => state.user);
  const admin = useAuthStore((state) => state.admin);

  // Determine if user is actually logged in (has token and user/admin data)
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!(token && (user || admin)));
  }, [user, admin]);

  // Check if we're on the landing page or auth pages
  const isLandingPage = pathname === "/";
  const isAuthPage = pathname.startsWith("/auth");

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/auth/user/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      // ignore error
    }
    clearAuth();
    localStorage.removeItem("token");
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

  return (
    <nav className="w-full sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="flex justify-between items-center mx-auto px-5 py-3">
        {/* Logo */}
        <Link href={isLoggedIn ? (role === "admin" ? "/admin/dashboard" : "/student/dashboard") : "/"} className="flex items-center cursor-pointer">
          <Image src="/logo.png" width={120} height={80} alt="logo" priority />
        </Link>

        {/* Navigation Links - Only show for logged in users */}
        {isLoggedIn && role === "student" && (
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/student/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive("/student/dashboard")
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/student/events"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive("/student/events")
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              <Calendar className="w-4 h-4" />
              Events
            </Link>
            <Link
              href="/student/leaderboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive("/student/leaderboard")
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </Link>
            <Link
              href="/student/announcements"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive("/student/announcements")
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              <Bell className="w-4 h-4" />
              Announcements
            </Link>
          </div>
        )}

        {isLoggedIn && role === "admin" && (
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/admin/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive("/admin/dashboard")
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/events"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isActive("/admin/events")
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              <Calendar className="w-4 h-4" />
              Events
            </Link>
          </div>
        )}

        {/* Right side icons */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button - only for logged in users */}
          {isLoggedIn && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              )}
            </button>
          )}

          <ThemeSwitcher />

          {/* Notification Bell - show for both student and admin */}
          {isLoggedIn && <NotificationBell />}

          {/* Show Login/Signup for guests, Profile dropdown for logged in users */}
          {!isLoggedIn ? (
            // Guest view - Show Login and Sign Up buttons
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
              >
                <LogIn className="w-4 h-4" />
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Up</span>
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
                className="bg-gray-100 dark:bg-gray-800 p-2 rounded-full cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <User className="h-6 w-6 text-gray-700 dark:text-gray-300" />
              </button>

              {/* User Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  {/* User Info */}
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="bg-blue-100 dark:bg-blue-900/50 p-3 rounded-full">
                        <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-white">{user?.name || admin?.name || 'User'}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email || admin?.email}</p>
                      </div>
                    </div>
                    {user && (
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Department:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{user.department}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Year:</span>
                          <span className="font-medium text-gray-900 dark:text-white">{user.year}</span>
                        </div>
                        {user.roll && (
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Roll No:</span>
                            <span className="font-medium text-gray-900 dark:text-white">{user.roll}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Menu Items */}
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push(role === "admin" ? "/admin/dashboard" : "/student/dashboard");
                      }}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2 text-gray-700 dark:text-gray-300"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors flex items-center gap-2"
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
      {mobileMenuOpen && isLoggedIn && role === "student" && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex flex-col p-4 space-y-2">
            <Link
              href="/student/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/student/dashboard")
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <Link
              href="/student/events"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/student/events")
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              <Calendar className="w-5 h-5" />
              Events
            </Link>
            <Link
              href="/student/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/student/leaderboard")
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              <Trophy className="w-5 h-5" />
              Leaderboard
            </Link>
            <Link
              href="/student/announcements"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/student/announcements")
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              <Bell className="w-5 h-5" />
              Announcements
            </Link>
          </div>
        </div>
      )}

      {mobileMenuOpen && isLoggedIn && role === "admin" && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex flex-col p-4 space-y-2">
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/admin/dashboard")
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <Link
              href="/admin/events"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive("/admin/events")
                ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-medium"
                : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
            >
              <Calendar className="w-5 h-5" />
              Events
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
