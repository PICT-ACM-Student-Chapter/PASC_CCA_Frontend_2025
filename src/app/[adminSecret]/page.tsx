"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { authAPI } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

export default function AdminLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { setAuth } = useAuthStore();
  const { success } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedRole = localStorage.getItem("role");
    if (token && storedRole === "admin") {
      router.replace("/admin/dashboard");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-background)]">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--color-primary)]" />
      </div>
    );
  }

  const isFormFilled = email.trim() !== "" && password.trim() !== "";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authAPI.adminLogin(email, password);
      const data = res.data;
      const authResponse = data.data;

      if (!data.success || !authResponse) {
        setError(data?.error || "Login failed");
        return;
      }

      setAuth({ user: undefined, admin: authResponse.admin, role: "admin" });

      if (authResponse.token) {
        localStorage.setItem("token", authResponse.token);
        localStorage.setItem("role", "admin");
        const adminId = authResponse.admin?.id;
        if (adminId) localStorage.setItem("userId", adminId.toString());
        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toUTCString();
        document.cookie = `token=${authResponse.token}; Path=/; Expires=${expires}; SameSite=Lax`;
        document.cookie = `role=admin; Path=/; Expires=${expires}; SameSite=Lax`;
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;";
        document.cookie = "role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      }

      const name = authResponse.admin?.name;
      success("Welcome back!", name ? `Hello, ${name}!` : "Logged in successfully.");
      router.push("/admin/dashboard");
    } catch (err: any) {
      const res = err.response;
      if (!res) {
        setError("Cannot connect to server. Make sure the backend is running.");
        return;
      }
      const msg = res.data?.error;
      const details = res.data?.details;
      const detailMsg = Array.isArray(details)
        ? details.map((d: { message?: string }) => d.message || "").join(". ")
        : "";
      setError(msg || detailMsg || `Login failed (${res.status})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[440px] space-y-4"
      >

        {/* ── Header card — matches admin dashboard header pattern ── */}
        <div className="rounded-2xl sm:rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[var(--color-primary)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--color-text-primary)] tracking-tight leading-tight">
                Admin Sign In
              </h1>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                Restricted to authorised administrators
              </p>
            </div>
          </div>
        </div>

        {/* ── Form card — matches admin panel card pattern ── */}
        <div className="rounded-2xl sm:rounded-[1.5rem] border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-7 shadow-sm hover:shadow-md transition-shadow duration-300">
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Email Address
              </label>
              <input
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-3 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl text-sm font-medium text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus-ring)] focus:border-[var(--color-input-focus)] transition-all"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3.5 py-3 pr-11 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl text-sm font-medium text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus-ring)] focus:border-[var(--color-input-focus)] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors p-0.5"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 px-3.5 py-2.5 rounded-xl"
              >
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </motion.div>
            )}

            {/* Submit — matches admin "Create Event" primary button */}
            <button
              type="submit"
              disabled={!isFormFilled || loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold border border-transparent bg-[var(--color-button-primary)] text-white hover:bg-[var(--color-button-primary-hover)] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--color-text-muted)]">
          Unauthorised access is prohibited.
        </p>

      </motion.div>
    </div>
  );
}
