"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Calendar, 
  Trophy, 
  Award, 
  ChevronRight, 
  GraduationCap,
  Megaphone,
  ArrowRight,
  QrCode,
  Star,
  BarChart3,
  ShieldCheck,
  Bell,
  Target,
  Clock,
  TrendingUp,
  Sparkles,
  Twitter,
  Instagram,
  Github,
  Mail,
  Users,
  CheckCircle2,
  Zap,
  Shield,
  Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Smooth Typewriter Hook Component
function Typewriter({ words, delay = 120, pause = 2200 }: { words: string[]; delay?: number; pause?: number }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [reverse, setReverse] = useState(false);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !reverse) {
      const timeout = setTimeout(() => setReverse(true), pause);
      return () => clearTimeout(timeout);
    }

    if (subIndex === 0 && reverse) {
      setReverse(false);
      setIndex((prev) => (prev + 1) % words.length);
      return;
    }

    const timeout = setTimeout(() => {
      setSubIndex((prev) => prev + (reverse ? -1 : 1));
    }, reverse ? delay / 2 : delay);

    return () => clearTimeout(timeout);
  }, [subIndex, index, reverse, words, delay, pause]);

  const currentText = words[index].substring(0, subIndex);

  return (
    <span className="inline-flex items-center text-[var(--color-primary)] min-h-[1.2em] leading-tight font-extrabold">
      <span>{currentText || "\u00A0"}</span>
      <span className="inline-block w-[3px] h-[0.85em] bg-[var(--color-primary)] ml-1 align-middle animate-pulse shrink-0 rounded-full" />
    </span>
  );
}

// Background Grid Pattern
function GridPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
      <div 
        className="absolute inset-0" 
        style={{ 
          backgroundImage: `linear-gradient(var(--color-primary) 1px, transparent 1px), linear-gradient(90deg, var(--color-primary) 1px, transparent 1px)`,
          backgroundSize: '60px 60px' 
        }} 
      />
    </div>
  );
}

// Soft floating glow background element
function GlowDecoration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute top-10 left-[12%] w-80 h-80 bg-[var(--color-primary)]/15 rounded-full blur-3xl"
        animate={{
          y: [0, 25, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-36 right-[12%] w-96 h-96 bg-[#134467]/15 dark:bg-[var(--color-primary)]/10 rounded-full blur-3xl"
        animate={{
          y: [0, -35, 0],
          scale: [1, 1.12, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Check login and role
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    if (token && role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  }, []);

  const benefits = [
    { icon: <QrCode className="w-4 h-4 text-[var(--color-primary)]" />, text: "QR-based attendance tracking" },
    { icon: <BarChart3 className="w-4 h-4 text-emerald-500" />, text: "Comprehensive analytics dashboard" },
    { icon: <Star className="w-4 h-4 text-amber-500" />, text: "Event reviews and ratings" },
    { icon: <ShieldCheck className="w-4 h-4 text-blue-500" />, text: "Secure and reliable platform" },
    { icon: <Bell className="w-4 h-4 text-purple-500" />, text: "Real-time push notifications" },
    { icon: <Target className="w-4 h-4 text-rose-500" />, text: "Goal setting and milestones" }
  ];

  const coreFeatures = [
    {
      icon: <QrCode className="w-6 h-6 text-[var(--color-primary)]" />,
      title: "QR Attendance & Verification",
      description: "Seamless check-ins for sessions with instant unique QR scanning and automated validation."
    },
    {
      icon: <Trophy className="w-6 h-6 text-amber-500" />,
      title: "Division & Semester Leaderboards",
      description: "Compete with peers across departments, track credit milestones, and earn top ranks."
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-emerald-500" />,
      title: "Credit & Progress Analytics",
      description: "Gain full visibility into earned credits, session history, and activity achievements."
    },
    {
      icon: <Bell className="w-6 h-6 text-purple-500" />,
      title: "Instant Alerts & Reminders",
      description: "Stay ahead with real-time push notifications for upcoming events, RSVPs, and updates."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-[var(--color-text-primary)] overflow-hidden flex flex-col justify-between transition-colors">
      <div>
        {/* Hero Section */}
        <section className="relative py-16 sm:py-20 lg:py-24">
          <GlowDecoration />
          <GridPattern />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              
              {/* Left Column - Headline & CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-6 sm:space-y-8 text-left"
              >
                {/* Main Headline with Typewriter Animation */}
                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-[var(--color-text-primary)] tracking-tight leading-[1.12]">
                    Where Learning Meets{" "}
                    <span className="block mt-2 sm:mt-3 text-2xl sm:text-4xl lg:text-5xl font-extrabold min-h-[3rem] sm:min-h-[4rem] flex items-center">
                      <Typewriter 
                        words={[
                          "Achievement & Growth", 
                          "Student Excellence", 
                          "Campus Leadership", 
                          "Co-Curricular Success"
                        ]} 
                      />
                    </span>
                  </h1>
                </div>

                {/* Subtitle */}
                <p className="text-base sm:text-lg text-[var(--color-text-muted)] max-w-xl leading-relaxed font-normal">
                  Your all-in-one platform for discovering campus events, automated QR attendance, tracking co-curricular credits, and competing on student leaderboards.
                </p>

                {/* Dual Primary Hero CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-2">
                  <Link
                    href={isLoggedIn ? (userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard') : '/auth/login'}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[var(--color-button-primary)] hover:bg-[var(--color-button-primary-hover)] text-white font-extrabold text-base shadow-lg shadow-[var(--color-primary)]/20 hover:shadow-xl hover:shadow-[var(--color-primary)]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    <span>{isLoggedIn ? "Go to Dashboard" : "Get Started Now"}</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  <Link
                    href="/student/events"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[var(--color-card)] border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 text-[var(--color-text-primary)] font-bold text-base hover:bg-[var(--color-surface)] shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    <Calendar className="w-5 h-5 text-[var(--color-primary)]" />
                    <span>Explore Events</span>
                  </Link>
                </div>

                {/* Micro trust indicators */}
                <div className="flex items-center gap-6 pt-2 text-xs font-semibold text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant QR Check-in
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" /> Verified Credits
                  </span>
                </div>
              </motion.div>

              {/* Right Column - Live App Feature Showcase Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative"
              >
                <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 sm:p-8 shadow-xl space-y-6 transition-colors">
                  {/* Card Header */}
                  <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 flex items-center justify-center">
                        <GraduationCap className="w-6 h-6 text-[var(--color-primary)]" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--color-text-primary)] text-base leading-tight">PASC CCA Student Portal</h3>
                        <p className="text-xs text-[var(--color-text-muted)]">Live Activity Hub</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      Live System
                    </span>
                  </div>

                  {/* Quick Stat Pill Overview */}
                  <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-[var(--color-surface)]/60 border border-[var(--color-border-light)] text-center">
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text-muted)]">Credits</p>
                      <p className="text-base font-extrabold text-[var(--color-primary)]">24 / 30</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text-muted)]">Rank</p>
                      <p className="text-base font-extrabold text-amber-500">#1 Division</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[var(--color-text-muted)]">Attendance</p>
                      <p className="text-base font-extrabold text-emerald-500">98%</p>
                    </div>
                  </div>

                  {/* Feature Preview Items */}
                  <div className="space-y-3.5">
                    <div className="p-3.5 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)]/40 flex items-center justify-between hover:border-[var(--color-primary)]/40 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-amber-500/10 rounded-lg">
                          <Trophy className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Semester Leaderboard</p>
                          <p className="text-xs text-[var(--color-text-muted)]">Real-time division rankings</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </div>

                    <div className="p-3.5 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)]/40 flex items-center justify-between hover:border-[var(--color-primary)]/40 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-[var(--color-primary)]/10 rounded-lg">
                          <QrCode className="w-5 h-5 text-[var(--color-primary)]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Automated Event RSVP</p>
                          <p className="text-xs text-[var(--color-text-muted)]">Unique QR verification</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </div>

                    <div className="p-3.5 rounded-xl border border-[var(--color-border-light)] bg-[var(--color-surface)]/40 flex items-center justify-between hover:border-[var(--color-primary)]/40 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/10 rounded-lg">
                          <Award className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text-primary)]">Credit Management</p>
                          <p className="text-xs text-[var(--color-text-muted)]">Verified activity logs</p>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[var(--color-text-muted)]" />
                    </div>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>


        {/* Why PASC CCA Section - Design Oriented UI Showcase */}
        <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            
            {/* Left Column: Title, Subtitle & Badges Grid */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--color-primary)]">
                  Why Choose PASC CCA?
                </span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[var(--color-text-primary)] leading-tight tracking-tight">
                Built for Students,{" "}
                <span className="block text-[var(--color-primary)]">
                  By Students
                </span>
              </h2>

              <p className="text-base sm:text-lg text-[var(--color-text-muted)] leading-relaxed">
                We simplify co-curricular activity tracking, event management, and credit allocation so you can focus on building skills and leadership on campus.
              </p>

              {/* 6 Value Badges Grid */}
              <div className="grid sm:grid-cols-2 gap-3.5 pt-2">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    transition={{ delay: index * 0.05 }}
                    className="group flex items-center gap-3 p-3.5 bg-[var(--color-card)] rounded-xl border border-[var(--color-border)] shadow-sm hover:border-[var(--color-primary)]/60 hover:shadow-md transition-all"
                  >
                    <div className="flex-shrink-0 w-9 h-9 bg-[var(--color-surface)] border border-[var(--color-border-light)] group-hover:border-[var(--color-primary)]/30 group-hover:bg-[var(--color-primary)]/10 rounded-lg flex items-center justify-center transition-colors">
                      {benefit.icon}
                    </div>
                    <span className="text-[var(--color-text-primary)] font-semibold text-xs sm:text-sm group-hover:text-[var(--color-primary)] transition-colors">
                      {benefit.text}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Column: 3 Showcase Feature Cards */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-5"
            >

              {/* Card 1: Real-time Updates */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-[var(--color-card)] rounded-2xl p-6 shadow-md border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-xl shrink-0">
                    <Clock className="w-6 h-6 text-[var(--color-primary)]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-extrabold text-[var(--color-text-primary)] text-lg">Real-time Updates</h4>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                        Live Sync
                      </span>
                    </div>
                    <p className="text-[var(--color-text-muted)] text-xs sm:text-sm leading-relaxed mb-3">
                      Instant notifications for session registrations, event alerts, and credit updates.
                    </p>
                    
                    {/* Widget Preview */}
                    <div className="p-3 rounded-xl bg-[var(--color-surface)]/60 border border-[var(--color-border-light)] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-[var(--color-primary)]/10 flex items-center justify-center">
                          <Bell className="w-3.5 h-3.5 text-[var(--color-primary)]" />
                        </div>
                        <div>
                          <p className="font-semibold text-[var(--color-text-primary)]">Event RSVP Confirmed</p>
                          <p className="text-[10px] text-[var(--color-text-muted)]">Automated alert system</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">Just now</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Progress Analytics */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-[var(--color-card)] rounded-2xl p-6 shadow-md border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl shrink-0">
                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-extrabold text-[var(--color-text-primary)] text-lg">Progress Analytics</h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                        80% Goal
                      </span>
                    </div>
                    <p className="text-[var(--color-text-muted)] text-xs sm:text-sm leading-relaxed mb-3">
                      Track your credit milestones with comprehensive charts and visual breakdown.
                    </p>

                    {/* Progress Bar & Metric Widget */}
                    <div className="p-3 rounded-xl bg-[var(--color-surface)]/60 border border-[var(--color-border-light)] space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-[var(--color-text-muted)]">Semester Target</span>
                        <span className="text-[var(--color-text-primary)]">24 / 30 Credits</span>
                      </div>
                      <div className="h-2.5 bg-[var(--color-surface-hover)] rounded-full overflow-hidden p-0.5 border border-[var(--color-border-light)]">
                        <motion.div 
                          className="h-full bg-gradient-to-r from-[var(--color-primary)] via-[#2BA6DF] to-[#134467] rounded-full"
                          initial={{ width: "0%" }}
                          whileInView={{ width: "80%" }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Card 3: Gamified Experience */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                className="bg-[var(--color-card)] rounded-2xl p-6 shadow-md border border-[var(--color-border)] hover:border-[var(--color-primary)]/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl shrink-0">
                    <Trophy className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-extrabold text-[var(--color-text-primary)] text-lg">Gamified Experience</h4>
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-bold">
                        #1 Rank
                      </span>
                    </div>
                    <p className="text-[var(--color-text-muted)] text-xs sm:text-sm leading-relaxed mb-3">
                      Earn badges, climb rankings, and celebrate your co-curricular achievements.
                    </p>

                    {/* Achievement Badges Gallery Widget */}
                    <div className="p-2.5 rounded-xl bg-[var(--color-surface)]/60 border border-[var(--color-border-light)] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {[
                          { title: "First Steps", src: "/first-steps.png" },
                          { title: "Getting Started", src: "/getting-started.png" },
                          { title: "Dedicated Learner", src: "/dedicated-learner.png" },
                          { title: "Credit Master", src: "/credit-master.png" }
                        ].map((b, i) => (
                          <div 
                            key={i} 
                            title={b.title}
                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--color-card)] border border-[var(--color-border-light)] p-1 flex items-center justify-center transition-transform hover:scale-115 cursor-pointer shadow-sm"
                          >
                            <img src={b.src} alt={b.title} className="w-full h-full object-contain" />
                          </div>
                        ))}
                      </div>
                      <span className="text-[11px] font-bold text-[var(--color-primary)]">
                        5 Unlocked
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>

            </motion.div>

          </div>
        </section>

        {/* Platform Core Capabilities Section */}
        <section className="py-16 bg-[var(--color-surface)]/30 border-y border-[var(--color-border)]/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text-primary)] tracking-tight">
                Everything You Need to Excel
              </h2>
              <p className="text-base text-[var(--color-text-muted)] leading-relaxed">
                Empowering students and administrators with intuitive tools built for campus activities.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {coreFeatures.map((feat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[var(--color-primary)]/50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border-light)] flex items-center justify-center">
                      {feat.icon}
                    </div>
                    <h3 className="font-extrabold text-lg text-[var(--color-text-primary)]">{feat.title}</h3>
                    <p className="text-xs sm:text-sm text-[var(--color-text-muted)] leading-relaxed">{feat.description}</p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-[var(--color-border-light)] text-xs font-bold text-[var(--color-primary)] flex items-center gap-1">
                    <span>Learn More</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Streamlined Call to Action Banner */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-gradient-to-r from-[#134467] via-[#1a6293] to-[var(--color-primary)] text-white p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                Ready to Join PASC CCA Activities?
              </h2>
              <p className="text-sm sm:text-base text-white/85 leading-relaxed">
                Log in with your college credentials to discover upcoming sessions, scan attendance QR codes, and level up your credit rank today.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 pt-2">
                <Link
                  href={isLoggedIn ? (userRole === 'admin' ? '/admin/dashboard' : '/student/dashboard') : '/auth/login'}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-[#134467] rounded-xl font-extrabold text-base hover:bg-slate-100 shadow-lg hover:shadow-xl transition-all"
                >
                  <span>{isLoggedIn ? "Go to Dashboard" : "Sign In Now"}</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/student/events"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-bold text-base transition-all"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Browse Events</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* UI Theme Matched Footer */}
      <footer className="bg-[var(--color-card)] border-t border-[var(--color-border)] py-16 text-[var(--color-text-primary)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-[var(--color-primary)]" />
                </div>
                <span className="text-xl font-extrabold text-[var(--color-text-primary)]">PASC CCA</span>
              </div>
              <p className="text-[var(--color-text-muted)] text-xs sm:text-sm leading-relaxed">
                Empowering students to excel in co-curricular activities through tech-driven tracking and rewards.
              </p>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-extrabold mb-4 text-[var(--color-text-primary)] text-xs uppercase tracking-wider">Platform</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-[var(--color-text-muted)]">
                <li><Link href="/auth/login" className="hover:text-[var(--color-primary)] transition-colors">Sign In</Link></li>
                <li><Link href="/student/events" className="hover:text-[var(--color-primary)] transition-colors">Events</Link></li>
                <li><Link href="/student/leaderboard" className="hover:text-[var(--color-primary)] transition-colors">Leaderboard</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-extrabold mb-4 text-[var(--color-text-primary)] text-xs uppercase tracking-wider">Resources</h4>
              <ul className="space-y-2.5 text-xs sm:text-sm font-medium text-[var(--color-text-muted)]">
                <li><Link href="#" className="hover:text-[var(--color-primary)] transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-[var(--color-primary)] transition-colors">Guidelines</Link></li>
                <li><Link href="#" className="hover:text-[var(--color-primary)] transition-colors">FAQs</Link></li>
                <li><Link href="#" className="hover:text-[var(--color-primary)] transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Connect */}
            <div>
              <h4 className="font-extrabold mb-4 text-[var(--color-text-primary)] text-xs uppercase tracking-wider">Connect</h4>
              <div className="flex gap-2.5">
                <a href="#" aria-label="Twitter" className="w-10 h-10 bg-[var(--color-surface)] border border-[var(--color-border-light)] hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] rounded-xl flex items-center justify-center text-[var(--color-text-primary)] transition-all">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" aria-label="Instagram" className="w-10 h-10 bg-[var(--color-surface)] border border-[var(--color-border-light)] hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] rounded-xl flex items-center justify-center text-[var(--color-text-primary)] transition-all">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" aria-label="Github" className="w-10 h-10 bg-[var(--color-surface)] border border-[var(--color-border-light)] hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] rounded-xl flex items-center justify-center text-[var(--color-text-primary)] transition-all">
                  <Github className="w-4 h-4" />
                </a>
                <a href="#" aria-label="Email" className="w-10 h-10 bg-[var(--color-surface)] border border-[var(--color-border-light)] hover:bg-[var(--color-primary)] hover:text-white hover:border-[var(--color-primary)] rounded-xl flex items-center justify-center text-[var(--color-text-primary)] transition-all">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[var(--color-border)] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs sm:text-sm text-[var(--color-text-muted)]">
            <p className="font-medium">
              © {new Date().getFullYear()} PASC CCA Platform. All rights reserved.
            </p>
            <div className="flex gap-6 font-medium">
              <Link href="#" className="hover:text-[var(--color-primary)] transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-[var(--color-primary)] transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
