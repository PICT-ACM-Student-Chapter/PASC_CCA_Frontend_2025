// "use client";
// import React, { useState } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { RoleToggle } from "@/components/auth/RoleToggle";
// import { Eye, EyeOff } from "lucide-react";
// import axios from "axios";
// import { useAuthStore } from "@/lib/store";
// import { apiUrl } from "@/lib/utils";
// import { useRouter } from "next/navigation";

// export default function Login() {
//   const router=useRouter();

//   const [role, setRole] = useState<string>("student");
//   const [showPassword, setShowPassword] = useState<boolean>(false);
//   const [email, setEmail] = useState<string>("");
//   const [password, setPassword] = useState<string>("");
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string | null>(null);
//   const { setAuth } = useAuthStore();
//   const handleRoleChange = (selectedRole: string): void => {
//     setRole(selectedRole);
//   };

//   const togglePasswordVisibility = (): void => {
//     setShowPassword(!showPassword);
//   };

//   const isFormFilled: boolean = email.trim() !== "" && password.trim() !== "";

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     const endpoint =
//       role === "admin"
//         ? `${apiUrl}/auth/admin/login`
//         : `${apiUrl}/auth/user/login`;

//     try {
//       const res = await axios.post(endpoint, { email, password });
//       const data = res.data;
//       const authResponse = data.data;
//       setAuth({
//         user: role === "student" ? authResponse.user : undefined,
//         admin: role === "admin" ? authResponse.admin : undefined,
//         role: role as "student" | "admin",
//       });
//       localStorage.setItem("token", authResponse.token);
//       window.location.href =
//         role === "admin" ? "/admin/dashboard" : "/student/events";

//     } catch (err: any) {
//       console.log(err.response.data);
//       setError(err.response.data.error || "Login failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//         className="flex flex-col sm:flex-row w-full max-w-screen-xl min-h-[600px] rounded-2xl container-shadow overflow-hidden"
//       >
//         {/* Form Section */}
//         <div className="w-full sm:w-1/2 p-4 sm:p-6 lg:p-10 flex flex-col justify-center bg-faint-blue-feature dark:bg-card">
//           <div className="lg:max-w-sm mx-auto w-full">
//             <div className="mb-6">
//               <h2
//                 className="text-3xl sm:text-4xl font-bold"
//                 style={{ color: "var(--color-blue-500)" }}
//               >
//                 Login
//               </h2>
//               <p className="text-sm sm:text-base text-secondary mt-2">
//                 Sign in to access your account
//               </p>
//             </div>
//             <RoleToggle onRoleChange={handleRoleChange} />
//             <form className="space-y-4 sm:space-y-5" onSubmit={handleLogin}>
//               <input
//                 type="email"
//                 placeholder="Email"
//                 className="input-field text-sm sm:text-base w-full"
//                 value={email}
//                 onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                   setEmail(e.target.value)
//                 }
//                 required
//               />
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Password"
//                   className="input-field pr-10 text-sm sm:text-base w-full"
//                   value={password}
//                   onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
//                     setPassword(e.target.value)
//                   }
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={togglePasswordVisibility}
//                   className="absolute right-3 top-1/2 transform -translate-y-1/2"
//                   style={
//                     {
//                       color: "var(--color-gray-500)",
//                       "--hover-color": "var(--color-blue-500)",
//                     } as React.CSSProperties
//                   }
//                   tabIndex={-1}
//                 >
//                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                 </button>
//               </div>
//               {/* Password reset not yet implemented in backend */}
//               {error && (
//                 <div className="text-red-500 text-xs sm:text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
//                   {error}
//                 </div>
//               )}
//               <button
//                 type="submit"
//                 disabled={!isFormFilled || loading}
//                 className="auth-button w-full py-2 rounded-lg text-white font-medium text-sm sm:text-base"
//               >
//                 {loading ? "Logging in..." : "Login"}
//               </button>
//               <p className="text-center text-secondary text-xs sm:text-sm">
//                 Don't have an account?{" "}
//                 <Link href="/auth/signup" className="link-text">
//                   Sign Up
//                 </Link>
//               </p>
//             </form>
//           </div>
//         </div>
//         {/* Illustration Section */}
//         <div className="w-full sm:w-1/2 bg-pure-white-feature dark:bg-blue-light flex items-center justify-center p-4 sm:p-6 min-h-[200px] sm:min-h-full">
//           <Image
//             src="/login.png"
//             alt="Login Illustration"
//             width={300}
//             height={300}
//             className="object-contain max-h-[50vh] sm:max-h-full sm:h-full sm:w-full"
//             priority
//           />
//         </div>
//       </motion.div>
//     </div>
//   );
// }






"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { authAPI } from "@/lib/api";
import { useToast } from "@/components/ui/toast";

const SLIDES = [
  {
    image: "/login.png",
    title: "Track & Achieve",
    desc: "Your one-stop platform for discovering events, tracking credits, and competing with peers."
  },
  {
    image: "/login.png",
    title: "Grow Your Network",
    desc: "Connect with industry professionals and ambitious peers to build your future."
  },
  {
    image: "/login.png",
    title: "Unlock Opportunities",
    desc: "Gain exclusive access to workshops, hackathons, and tech talks."
  },
  {
    image: "/login.png",
    title: "Unlock Opportunities",
    desc: "Gain exclusive access to workshops, hackathons, and tech talks."
  }
];

export default function Login() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  // Role is always student on the public login page.
  // Admin must use the private secret route.
  const role = "student";

  // Auto-slide effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState<boolean>(true);
  const { setAuth } = useAuthStore();
  const { success } = useToast();

  // Redirect already-authenticated students away from the login page
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    if (token && storedRole === 'student') {
      router.replace('/student/events');
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }


  const togglePasswordVisibility = (): void => {
    setShowPassword(!showPassword);
  };

  const isFormFilled: boolean = email.trim() !== "" && password.trim() !== "";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await authAPI.userLogin(email, password);

      const data = res.data;
      const authResponse = data.data;

      if (!data.success || !authResponse) {
        setError(data?.error || "Login failed");
        return;
      }

      setAuth({
        user: authResponse.user,
        admin: undefined,
        role: "student",
      });

      if (authResponse.token) {
        localStorage.setItem("token", authResponse.token);
        localStorage.setItem("role", "student");
        const userId = authResponse.user?.id;
        if (userId) {
          localStorage.setItem("userId", userId.toString());
        }

        // Also set cookies for middleware-based protection
        const expires = new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ).toUTCString();
        document.cookie = `token=${authResponse.token}; Path=/; Expires=${expires}; SameSite=Lax`;
        document.cookie = `role=${role}; Path=/; Expires=${expires}; SameSite=Lax`;
      } else {
        // Defensive: clear any stale auth if token is missing
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userId");
        document.cookie =
          "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;";
        document.cookie =
          "role=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      }

      const name = authResponse.user?.name;
      success('Welcome back!', name ? `Hello, ${name}!` : 'Logged in successfully.');
      router.push("/student/events");
    } catch (err: any) {
      const res = err.response;
      if (!res) {
        setError(
          "Cannot connect to server. Make sure the backend is running on http://localhost:4000"
        );
        return;
      }
      const msg = res.data?.error;
      const details = res.data?.details;
      const detailMsg = Array.isArray(details)
        ? details
          .map((d: { field?: string; message?: string }) => d.message || "")
          .join(". ")
        : "";
      setError(msg || detailMsg || `Login failed (${res.status})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 sm:p-8 bg-[var(--color-background)] overflow-hidden transition-colors duration-200">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60 dark:opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(43, 166, 223, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(43, 166, 223, 0.05) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
        <motion.div
          className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-[#2BA6DF]/15 dark:bg-[#2BA6DF]/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.1, 1], x: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 -right-40 w-[400px] h-[400px] bg-[#134467]/10 dark:bg-[#134467]/20 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], y: [0, -50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col sm:flex-row w-full max-w-[1100px] min-h-[600px] rounded-[2.5rem] bg-[var(--color-card)] shadow-[0_2px_8px_rgba(15,23,42,0.08),0_10px_24px_rgba(15,23,42,0.05)] overflow-hidden border border-[var(--color-border)] my-4"
      >
        {/* Form Section */}
        <div className="w-full sm:w-[50%] p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-[var(--color-surface)] border-r border-[var(--color-border)] relative z-20 transition-colors duration-200">
          <div className="w-full max-w-[420px] mx-auto">
            <div className="mb-8 text-center sm:text-left">
              <div className="inline-flex items-center justify-center p-3 mb-4 rounded-2xl text-[#2BA6DF] bg-[#2BA6DF]/10 border border-[#2BA6DF]/20 shadow-sm">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--color-text-primary)] tracking-tight lead">
                Welcome Back
              </h2>
              <p className="text-[var(--color-text-primary)] mt-2 text-sm font-medium">
                Sign in to continue your journey and unlock new achievements.
              </p>
            </div>

            <form className="space-y-5" onSubmit={handleLogin}>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--color-text-primary)] ml-1 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full px-4 py-3.5 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)] transition-all font-medium text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] placeholder:font-normal shadow-sm"
                  value={email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setEmail(e.target.value)
                  }
                  required
                />
              </div>

              <div className="space-y-1.5 relative">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold text-[var(--color-text-primary)] uppercase tracking-wider">Password</label>
                  <Link href="/auth/forgot-password" className="text-xs font-semibold text-[var(--color-primary)] hover:text-[var(--color-button-primary-hover)] transition-colors">Forgot?</Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full px-4 py-3.5 bg-[var(--color-background)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-input-focus)] transition-all font-medium text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] placeholder:font-normal pr-12 shadow-sm"
                    value={password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setPassword(e.target.value)
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-600 text-xs bg-red-50 dark:bg-red-900/20 px-4 py-3 rounded-xl border border-red-100 dark:border-red-900/50 flex items-center gap-2 font-medium">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  {error}
                </motion.div>
              )}

              <button
                type="submit"
                disabled={!isFormFilled || loading}
                className="w-full py-3.5 mt-4 text-sm font-bold bg-[#1A90FF] hover:bg-[#1A90FF]/90 text-white shadow-md hover:shadow-xl hover:-translate-y-0.5 rounded-xl transition-all flex items-center justify-center gap-2 border border-transparent disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  "Sign In Securely"
                )}
              </button>
              {/* Signup link removed for closed review */}
            </form>
          </div>
        </div>

        {/* Illustration Section - Slider */}
        <div className="w-full sm:w-[50%] bg-gradient-to-br from-[#134467] to-[#0A2540] flex flex-col items-center justify-center p-6 sm:p-10 relative overflow-hidden hidden sm:flex">
          {/* Subtle circle decorations behind image */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gradient-to-tr from-[#2BA6DF]/20 to-[#FDB811]/15 rounded-full blur-3xl" />

          <div className="relative z-10 w-full h-full max-w-[360px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="flex flex-col items-center justify-center w-full"
              >
                <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center mb-4">
                  <Image
                    src={SLIDES[currentSlide].image}
                    alt={SLIDES[currentSlide].title}
                    width={350}
                    height={350}
                    className="object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)] dark:drop-shadow-2xl"
                    priority
                  />
                </div>
                <div className="text-center h-20">
                  <h3 className="text-white font-extrabold text-xl mb-1">
                    {SLIDES[currentSlide].title}
                  </h3>
                  <p className="text-blue-100/70 text-[13px] max-w-xs mx-auto leading-relaxed font-medium">
                    {SLIDES[currentSlide].desc}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slider Dots */}
            <div className="flex gap-2.5 mt-6 z-10 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 shadow-sm">
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentSlide
                    ? "w-6 bg-[#2BA6DF] shadow-[0_0_10px_#2BA6DF]"
                    : "w-1.5 bg-white/30 hover:bg-white/50"
                    }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}