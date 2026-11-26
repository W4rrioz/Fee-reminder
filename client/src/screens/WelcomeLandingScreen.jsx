import React, { useState } from 'react';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  LogIn,
  Check,
  Building2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  IndianRupee,
  Star,
  Play,
  Layers,
  Bot,
  Sun,
  Moon,
  MessageSquare,
  HelpCircle,
  Clock,
  Compass,
  ArrowUpRight,
  TrendingUp,
  Atom,
  Calculator,
  FlaskConical,
  Flame,
  Globe2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VersionBadge } from '../components/VersionBadge';
import GlassWorkspaceDemo from '@/components/ui/demo';

export const WelcomeLandingScreen = ({ onOpenAi }) => {
  const { setAuthView, loginUser } = useApp();
  const [darkMode, setDarkMode] = useState(false);
  const [activeCourseFilter, setActiveCourseFilter] = useState('All');
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [showWorkspace, setShowWorkspace] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', next);
      }
      return next;
    });
  };

  // Quick 1-tap guest explorer
  const handleQuickDemo = (role = 'ADMIN') => {
    loginUser({
      token: `token_guest_${Date.now()}`,
      user: {
        id: 'guest_explorer',
        name: 'Guest Explorer',
        email: 'guest@swyam.edu',
        phone: '+91 9876543210',
        role,
        isGuest: true,
        created_at: new Date().toISOString()
      },
      institute: {
        id: 'inst_swyam_01',
        name: 'Apex Academy / Swyam Classroom',
        type: 'coaching_center',
        city: 'Kanpur',
        upi_id: 'apexacademy@upi',
        upi_name: 'Apex Academy Kanpur',
        enable_attendance: true
      }
    });
  };

  // Popular courses matching Screenshot 2
  const popularCourses = [
    {
      id: 'c10-sci',
      classNum: 'CLASS 10',
      subject: 'Science',
      topic: 'Chemical Reactions & Equations',
      badge: 'One Shot',
      modules: '13 modules · Free',
      instructor: 'Ashu Sir · Science and Fun',
      accent: 'from-amber-500 to-rose-600',
      thumbnail: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=800&q=80',
      tag: 'Chemistry'
    },
    {
      id: 'c10-math',
      classNum: 'CLASS 10',
      subject: 'Mathematics',
      topic: 'Real Numbers One Shot',
      badge: 'Board Special',
      modules: '14 modules · Free',
      instructor: 'Shobhit Nirwan & Prashant Kirad',
      accent: 'from-blue-600 to-indigo-700',
      thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80',
      tag: 'Math'
    },
    {
      id: 'c12-phy',
      classNum: 'CLASS 12',
      subject: 'Physics',
      topic: 'Electric Charges and Fields in 1 Shot',
      badge: 'NEET / JEE',
      modules: '14 modules · Free',
      instructor: 'Physics Wallah',
      accent: 'from-purple-600 to-violet-800',
      thumbnail: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=80',
      tag: 'Physics'
    },
    {
      id: 'c9-sci',
      classNum: 'CLASS 9',
      subject: 'Science',
      topic: 'Matter in our Surroundings',
      badge: 'One Shot',
      modules: '12 modules · Free',
      instructor: 'Prashant Kirad',
      accent: 'from-emerald-500 to-teal-700',
      thumbnail: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80',
      tag: 'Science'
    },
    {
      id: 'c12-chem',
      classNum: 'CLASS 12',
      subject: 'Chemistry',
      topic: 'Solutions in 90 Minutes',
      badge: 'Board Revision',
      modules: '10 modules · Free',
      instructor: 'Prashant & Team',
      accent: 'from-rose-500 to-red-700',
      thumbnail: 'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=800&q=80',
      tag: 'Chemistry'
    },
    {
      id: 'c11-phy',
      classNum: 'CLASS 11',
      subject: 'Physics',
      topic: 'Units and Measurements One Shot',
      badge: 'Foundation',
      modules: '14 modules · Free',
      instructor: 'Science and Fun',
      accent: 'from-amber-600 to-orange-700',
      thumbnail: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?auto=format&fit=crop&w=800&q=80',
      tag: 'Physics'
    }
  ];

  // Savings calculator state
  const [studentCount, setStudentCount] = useState(150);
  const [monthlyFee, setMonthlyFee] = useState(1200);
  const annualFeeCollection = studentCount * monthlyFee * 12;
  const traditionalGatewayCost = Math.round(annualFeeCollection * 0.0236);
  const staffHoursSaved = Math.round((studentCount * 2 * 12) / 60);

  // FAQ Accordion
  const [openFaq, setOpenFaq] = useState(0);
  const faqs = [
    {
      q: 'Is Swyam classroom really 100% free forever for students?',
      a: 'Yes. All chapter lectures, notes, formulas, and AI tutoring via Sarthi are completely free for students in Hindi, English, and Hinglish without any paywall or ads.'
    },
    {
      q: 'How does Sarthi AI assist students and teachers?',
      a: 'Sarthi AI explains difficult physics, math, and chemistry concepts conversationally in Hinglish with real-world examples (like velocity in an auto or chemical bonds), quizzes students, and helps teachers track attendance and dues.'
    },
    {
      q: 'How does EduManage achieve 0% commission on fee collection?',
      a: 'EduManage connects directly from parent UPI apps (Google Pay, PhonePe, Paytm, BHIM) straight to your institute\'s bank account UPI ID. No intermediate payment gateway aggregator takes a 2.5% cut.'
    },
    {
      q: 'Does it work offline on slow 2G mobile internet in rural areas?',
      a: 'Yes! The attendance register, student roll calls, and offline SQLite cache are 100% tolerant to zero-connectivity. All records sync automatically as soon as internet resumes.'
    }
  ];

  return (
    <div className={`w-full min-h-screen ${darkMode ? 'dark bg-stone-950 text-stone-100' : 'bg-[#FAF7F2] text-stone-900'} font-body transition-colors duration-200 select-none`}>
      
      {/* =========================================================
          1. STICKY TOP NAVBAR (Matching Screenshot 1 & 2)
      ========================================================= */}
      <header className={`sticky top-0 z-40 ${darkMode ? 'bg-stone-950/90 border-stone-800' : 'bg-[#FAF7F2]/90 border-stone-200/80'} backdrop-blur-md border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-0.5 select-none cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <span className="text-2xl font-black text-[#A82D24] tracking-tight">स्व</span>
              <span className={`text-2xl font-black ${darkMode ? 'text-stone-100' : 'text-stone-900'} tracking-tight`}>YAM</span>
            </div>
            <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-stone-300 dark:border-stone-800">
              <span className="text-xs font-semibold text-stone-500">
                Classroom & EduManage
              </span>
              <VersionBadge />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className={`hidden md:flex items-center gap-7 text-xs font-semibold ${darkMode ? 'text-stone-300' : 'text-stone-600'}`}>
            <a href="#popular-courses" className="hover:text-[#A82D24] dark:hover:text-[#ff6b5e] transition-colors">Courses</a>
            <a href="#popular-courses" className="hover:text-[#A82D24] dark:hover:text-[#ff6b5e] transition-colors">Learn</a>
            <button
              type="button"
              onClick={onOpenAi}
              className="flex items-center gap-1.5 text-[#A82D24] dark:text-[#ff6b5e] hover:text-[#8B261E] font-bold cursor-pointer transition-colors"
            >
              <Sparkles size={13} className="text-[#A82D24] dark:text-[#ff6b5e]" />
              <span>Sarthi AI</span>
            </button>
            <a href="#glass-workspace" className="hover:text-[#A82D24] dark:hover:text-[#ff6b5e] transition-colors flex items-center gap-1">
              <Layers size={13} />
              <span>Glass Workspace</span>
            </a>
            <a href="#fee-platform" className="hover:text-[#A82D24] dark:hover:text-[#ff6b5e] transition-colors">Fees & Attendance</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleDarkMode}
              className={`p-2 rounded-xl border ${darkMode ? 'border-stone-800 text-stone-300 hover:bg-stone-900' : 'border-stone-200 text-stone-600 hover:bg-stone-100'} transition-colors cursor-pointer`}
              title="Toggle Dark/Light Mode"
            >
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>

            {/* Log in Button */}
            <button
              type="button"
              onClick={() => setAuthView('login')}
              className={`text-xs font-semibold px-3.5 py-2 rounded-xl transition-colors cursor-pointer ${
                darkMode ? 'text-stone-300 hover:text-white' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Log in
            </button>

            {/* Join Free Crimson Button */}
            <button
              type="button"
              onClick={() => setAuthView('login')}
              className="bg-[#A82D24] hover:bg-[#8B261E] text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              Join free
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          2. HERO SECTION (Exact Match with Screenshot 1)
      ========================================================= */}
      <section className="relative pt-10 sm:pt-16 pb-12 sm:pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-medium bg-[#F7EBEA] text-[#8B261E] border border-red-200/60 shadow-2xs">
                <span>Free forever · CBSE Class 8-12 · हिन्दी · English · Hinglish</span>
              </div>

              {/* Main Headline */}
              <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-bold font-editorial ${darkMode ? 'text-stone-100' : 'text-stone-900'} leading-[1.08] tracking-tight`}>
                India’s best<br />
                teachers.<br />
                <span className="text-[#8B261E]">One free<br />classroom.</span>
              </h1>

              {/* Subtitle */}
              <p className={`text-sm sm:text-base ${darkMode ? 'text-stone-300' : 'text-stone-600'} max-w-xl leading-relaxed`}>
                Full courses for every chapter — the most-watched lectures, clear notes, likely exam questions and quizzes — with Sarthi, an AI tutor you can talk to.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('popular-courses');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-[#A82D24] hover:bg-[#8B261E] active:scale-[0.98] text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md shadow-red-900/10 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Start learning free</span>
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('popular-courses');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl border ${
                    darkMode
                      ? 'border-stone-800 bg-stone-900/80 text-stone-200 hover:bg-stone-800'
                      : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                  } transition-all cursor-pointer`}
                >
                  Explore courses
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('ADMIN')}
                  className="text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl border border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 hover:bg-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={14} className="text-amber-500" />
                  <span>Admin / Fee Portal</span>
                </button>
              </div>

              {/* Stats Counters Row */}
              <div className="pt-6 grid grid-cols-4 gap-4 border-t border-stone-200/80 dark:border-stone-800/80 max-w-lg">
                <div>
                  <div className={`text-2xl sm:text-3xl font-black font-editorial ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>244</div>
                  <div className="text-[11px] font-medium text-stone-500">chapters</div>
                </div>
                <div>
                  <div className={`text-2xl sm:text-3xl font-black font-editorial ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>5</div>
                  <div className="text-[11px] font-medium text-stone-500">classes</div>
                </div>
                <div>
                  <div className={`text-2xl sm:text-3xl font-black font-editorial ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>3</div>
                  <div className="text-[11px] font-medium text-stone-500">languages</div>
                </div>
                <div>
                  <div className={`text-2xl sm:text-3xl font-black font-editorial ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>₹0</div>
                  <div className="text-[11px] font-medium text-stone-500">always</div>
                </div>
              </div>
            </div>

            {/* Right Column: High-Energy Video Lecture Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-2xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 bg-stone-900 group">
                
                {/* Video Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-950">
                  <img
                    src="https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80"
                    alt="Metals and Non-metals lecture"
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 pointer-events-none" />

                  {/* Header inside thumbnail: CLASS 10th */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="bg-[#A82D24] text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">
                      CLASS 10th
                    </span>
                  </div>

                  {/* Blackboard Formula Card in Top Right (Matching Screenshot 1) */}
                  <div className="absolute top-4 right-4 z-10 bg-stone-950/90 border border-stone-700/80 rounded-lg p-2.5 shadow-lg backdrop-blur-xs font-mono text-[11px] text-emerald-300 leading-tight">
                    <div className="text-stone-400 text-[9px] mb-0.5">KINETIC ENERGY</div>
                    <div>K = ½ mv²</div>
                    <div>= ½ × 5 × 4²</div>
                    <div className="text-amber-300 font-bold">K = 40 J</div>
                  </div>

                  {/* Center Play Button with Pulse Animation */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('STUDENT')}
                      className="w-16 h-16 rounded-full bg-white/95 text-stone-900 hover:bg-white flex items-center justify-center shadow-2xl shadow-black/80 hover:scale-110 active:scale-95 transition-all cursor-pointer ring-8 ring-white/20"
                    >
                      <Play size={24} className="fill-stone-900 text-stone-900 translate-x-0.5" />
                    </button>
                  </div>

                  {/* Lecture Title text */}
                  <div className="absolute bottom-12 left-4 right-4 z-10">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase drop-shadow-md">
                      METALS & NON METALS
                    </h3>
                    <p className="text-xs text-stone-300 font-medium">
                      CLASS 10 SCIENCE · MODULE 1
                    </p>
                  </div>

                  {/* Scrub Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-stone-700/60">
                    <div className="h-full bg-[#A82D24] w-2/3" />
                  </div>
                </div>

                {/* Sarthi AI Floating Speech Card (Exact Match with Screenshot 1) */}
                <div className="p-3.5 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-[#A82D24]">
                      <Sparkles size={11} />
                      <span>SARTHI</span>
                    </div>
                    <p className="text-xs text-stone-700 dark:text-stone-300 font-medium italic mt-0.5 leading-snug">
                      “Velocity mein direction bhi hoti hai — jaise auto North ki taraf 40 km/h...”
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAi}
                    className="text-[11px] font-bold text-[#A82D24] hover:underline shrink-0 cursor-pointer pt-1"
                  >
                    Ask Sarthi →
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Marquee Ticker Bar (Matching Screenshot 1) */}
          <div className="mt-14 pt-6 border-t border-stone-200/90 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-stone-500 dark:text-stone-400">
              LECTURES FROM
            </span>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
              <span>Prashant Kirad · Next Toppers</span>
              <span className="text-stone-300 dark:text-stone-700">|</span>
              <span>Shobhit Nirwan</span>
              <span className="text-stone-300 dark:text-stone-700">|</span>
              <span>Ashu Sir · Science and Fun</span>
              <span className="text-stone-300 dark:text-stone-700">|</span>
              <span>Physics Wallah</span>
              <span className="text-stone-300 dark:text-stone-700">|</span>
              <span>Digraj Sir · SST</span>
              <span className="text-stone-300 dark:text-stone-700">|</span>
              <span>Magnet Brains</span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          3. POPULAR COURSES SECTION (Matching Screenshot 2)
      ========================================================= */}
      <section id="popular-courses" className="py-16 sm:py-20 border-t border-stone-200 dark:border-stone-800 bg-[#FDFBF7] dark:bg-stone-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#A82D24]">
                POPULAR COURSES
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-editorial text-stone-900 dark:text-stone-100 mt-1">
                Pick a subject, start in seconds
              </h2>
            </div>
            
            <a
              href="#popular-courses"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#A82D24] hover:underline"
            >
              <span>All courses</span>
              <ArrowRight size={13} />
            </a>
          </div>

          {/* 6 Course Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {popularCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleQuickDemo('STUDENT')}
                className={`group rounded-2xl border ${
                  darkMode ? 'bg-stone-900 border-stone-800 hover:border-stone-700' : 'bg-white border-stone-200/90 hover:border-stone-300'
                } overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between`}
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-950">
                  <img
                    src={course.thumbnail}
                    alt={course.topic}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                  {/* Badges on Thumbnail */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-[#A82D24] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
                      {course.classNum}
                    </span>
                    <span className="bg-white/20 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md border border-white/20">
                      {course.badge}
                    </span>
                  </div>

                  {/* Play icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white text-stone-900 flex items-center justify-center shadow-lg">
                      <Play size={18} className="fill-stone-900 translate-x-0.5" />
                    </div>
                  </div>

                  {/* Bottom title inside thumbnail */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h4 className="text-base font-black text-white leading-tight uppercase drop-shadow-sm">
                      {course.topic}
                    </h4>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      {course.classNum}
                    </span>
                    <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                      {course.subject}
                    </h3>
                  </div>

                  <div className="pt-4 mt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                    <span className="font-medium">{course.modules}</span>
                    <span className="text-[#A82D24] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Start</span>
                      <ArrowRight size={13} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* =========================================================
          4. 21st.dev ADJUSTABLE GLASS WORKSPACE INTEGRATION
      ========================================================= */}
      <section id="glass-workspace" className="py-16 sm:py-24 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#A82D24]">
              21st.dev COMPONENT TEMPLATE
            </span>
            <h2 className="text-3xl sm:text-5xl font-bold font-editorial text-stone-900 dark:text-stone-100 mt-1">
              Adjustable Glass Dashboard
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2">
              Integrated in <code className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-[#A82D24] font-mono text-xs">/components/ui/adjustable-glass-dashboard.tsx</code> and <code className="px-1.5 py-0.5 rounded bg-stone-200 dark:bg-stone-800 text-[#A82D24] font-mono text-xs">demo.tsx</code> with full GSAP animations, cash flow analytics, and interactive glass controls.
            </p>
          </div>

          {/* Live Interactive Glass Workspace Demo */}
          <div className="rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden bg-stone-900/40">
            <GlassWorkspaceDemo />
          </div>

        </div>
      </section>

      {/* =========================================================
          5. DIRECT UPI FEE & EDUMANAGE PLATFORM
      ========================================================= */}
      <section id="fee-platform" className="py-16 sm:py-20 border-t border-stone-200 dark:border-stone-800 bg-[#FAF7F2] dark:bg-stone-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Direct UPI Philosophy */}
            <div className="lg:col-span-6 space-y-4">
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#A82D24]">
                DIRECT UPI REVOLUTION
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-editorial text-stone-900 dark:text-stone-100">
                0% Gateway Fees. Money straight to your Bank.
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Aggregators like Razorpay or Cashfree deduct ~2.36% on every payment. With EduManage, parents scan a dynamic UPI QR code that sends 100% of the tuition directly to your bank account without middlemen.
              </p>

              <div className="pt-3 space-y-2.5 text-xs text-stone-700 dark:text-stone-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Works with Google Pay, PhonePe, Paytm, BHIM, and Cred</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>1-Tap WhatsApp reminders with personalized student payment links</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>Works offline on 2G Android phones in rural coaching centers</span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('ADMIN')}
                  className="bg-[#A82D24] hover:bg-[#8B261E] text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Open Institutional Portal</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Savings Calculator */}
            <div className="lg:col-span-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
              <h3 className="text-base font-bold font-editorial text-stone-900 dark:text-stone-100 mb-4">
                Calculate Your Annual Gateway Savings
              </h3>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-stone-600 dark:text-stone-400">
                    <span>Number of Students</span>
                    <span className="text-[#A82D24] font-bold">{studentCount} Students</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="1000"
                    step="10"
                    value={studentCount}
                    onChange={(e) => setStudentCount(Number(e.target.value))}
                    className="w-full accent-[#A82D24]"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-stone-600 dark:text-stone-400">
                    <span>Average Monthly Fee</span>
                    <span className="text-[#A82D24] font-bold">₹{monthlyFee.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="100"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(Number(e.target.value))}
                    className="w-full accent-[#A82D24]"
                  />
                </div>

                <div className="p-4 rounded-xl bg-red-50/70 dark:bg-stone-800/80 border border-red-200/60 dark:border-stone-700 text-center">
                  <div className="text-[11px] font-semibold text-stone-500">SAVED ANNUALLY WITH DIRECT UPI</div>
                  <div className="text-3xl font-black text-[#A82D24] font-editorial my-1">
                    ₹{traditionalGatewayCost.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    + {staffHoursSaved} hours saved in manual ledger reconciliation
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================
          6. FAQ SECTION
      ========================================================= */}
      <section className="py-16 sm:py-20 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#A82D24]">
              QUESTIONS & ANSWERS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-editorial text-stone-900 dark:text-stone-100 mt-1">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden bg-white dark:bg-stone-900"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                    className="w-full text-left p-4 flex items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-stone-800 dark:text-stone-200 hover:text-[#A82D24] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <span className="text-stone-400">
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-stone-600 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800 pt-3 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================
          7. FOOTER
      ========================================================= */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-10 bg-white dark:bg-stone-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-[#A82D24]">स्व</span>
            <span className="text-lg font-black text-stone-900 dark:text-stone-100">YAM</span>
            <span className="text-stone-400 pl-2">· India's Best Teachers. One Free Classroom.</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleQuickDemo('STUDENT')}
              className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
            >
              Student Portal
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
            >
              Fee Admin
            </button>
            <button
              type="button"
              onClick={() => setAuthView('login')}
              className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </footer>

      {/* =========================================================
          8. FLOATING SARTHI AI BUTTON (Bottom Right - Matching Screenshot 1 & 2)
      ========================================================= */}
      <button
        type="button"
        id="floating-ask-sarthi"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onOpenAi();
        }}
        className="fixed bottom-6 right-6 z-[90] bg-[#A82D24] hover:bg-[#8B261E] active:scale-95 text-white font-bold text-xs py-2.5 px-4 rounded-full shadow-2xl hover:shadow-red-900/40 flex items-center gap-2 border border-white/20 transition-all cursor-pointer ring-4 ring-red-500/20"
        title="Ask Sarthi AI about courses or data"
      >
        <Sparkles size={15} className="text-amber-300 pointer-events-none" />
        <span className="pointer-events-none">Ask Sarthi</span>
      </button>

    </div>
  );
};
