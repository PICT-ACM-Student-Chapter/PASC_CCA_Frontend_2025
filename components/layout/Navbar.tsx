"use client";
import React, { useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Sun, Moon, User, LayoutDashboard, Calendar, Trophy, Bell, Menu, X } from "lucide-react";
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

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/auth/user/logout`, {
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

  return (
    <nav className="w-full top-0 bg-white border-b">
      <div className="flex justify-between items-center mx-auto px-5 py-3">
        {/* Logo */}
        <Link href={role === "admin" ? "/admin/dashboard" : "/student/dashboard"} className="flex items-center cursor-pointer">
          <Image src="/logo.png" width={120} height={80} alt="logo" priority />
        </Link>

        {/* Navigation Links - Only show for logged in users */}
        {role === "student" && (
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/student/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive("/student/dashboard")
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/student/events"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive("/student/events")
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Events
            </Link>
            <Link
              href="/student/leaderboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive("/student/leaderboard")
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Trophy className="w-4 h-4" />
              Leaderboard
            </Link>
            <Link
              href="/student/announcements"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive("/student/announcements")
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Bell className="w-4 h-4" />
              Announcements
            </Link>
          </div>
        )}

        {role === "admin" && (
          <div className="hidden md:flex items-center gap-1">
            <Link
              href="/admin/dashboard"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive("/admin/dashboard")
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
            <Link
              href="/admin/events"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isActive("/admin/events")
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Calendar className="w-4 h-4" />
              Events
            </Link>
          </div>
        )}

        {/* Right side icons */}
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          {role && (
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          )}

          <ThemeSwitcher />
          
          {/* Notification Bell - only show when logged in */}
          {role && <NotificationBell />}

          {/* User Icon with dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="bg-gray-100 p-2 rounded-full cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <User className="h-6 w-6 text-gray-700" />
            </button>

            {/* User Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {/* User Info */}
                <div className="p-4 border-b">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{user?.name || 'User'}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  {user && (
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Department:</span>
                        <span className="font-medium text-gray-900">{user.department}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Year:</span>
                        <span className="font-medium text-gray-900">{user.year}</span>
                      </div>
                      {user.roll && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Roll No:</span>
                          <span className="font-medium text-gray-900">{user.roll}</span>
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
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4 text-gray-600" />
                    <span>Dashboard</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-red-50 text-red-600 transition-colors flex items-center gap-2"
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
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && role === "student" && (
        <div className="md:hidden border-t bg-white">
          <div className="flex flex-col p-4 space-y-2">
            <Link
              href="/student/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive("/student/dashboard")
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <Link
              href="/student/events"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive("/student/events")
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Calendar className="w-5 h-5" />
              Events
            </Link>
            <Link
              href="/student/leaderboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive("/student/leaderboard")
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Trophy className="w-5 h-5" />
              Leaderboard
            </Link>
            <Link
              href="/student/announcements"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive("/student/announcements")
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Bell className="w-5 h-5" />
              Announcements
            </Link>
          </div>
        </div>
      )}

      {mobileMenuOpen && role === "admin" && (
        <div className="md:hidden border-t bg-white">
          <div className="flex flex-col p-4 space-y-2">
            <Link
              href="/admin/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive("/admin/dashboard")
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </Link>
            <Link
              href="/admin/events"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive("/admin/events")
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
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
