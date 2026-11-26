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
  Send,
  Users,
  Smartphone,
  WifiOff,
  FileSpreadsheet,
  QrCode,
  ShieldAlert,
  School
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VersionBadge } from '../components/VersionBadge';

export const WelcomeLandingScreen = ({ onOpenAi }) => {
  const { setAuthView, loginUser } = useApp();
  const [darkMode, setDarkMode] = useState(false);
  const [tenantMode, setTenantMode] = useState('coaching'); // 'coaching' | 'schools' | 'tutors'
  const [selectedVideo, setSelectedVideo] = useState('overview');

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
        id: 'guest_admin',
        name: 'Guest Director',
        email: 'director@edumanage.in',
        phone: '+91 9876543210',
        role,
        isGuest: true,
        created_at: new Date().toISOString()
      },
      institute: {
        id: 'inst_apex_01',
        name: 'Apex Coaching Academy',
        type: 'coaching_center',
        city: 'Kanpur',
        upi_id: 'apexacademy@upi',
        upi_name: 'Apex Academy Kanpur',
        enable_attendance: true
      }
    });
  };

  // EduManage Core Capabilities (in the 6-card high-energy editorial grid style)
  const coreModules = [
    {
      id: 'mod-upi',
      category: 'FEE ENGINE',
      badge: '0% Commission',
      title: 'Direct Bank UPI Collection',
      description: 'Tuition fees land straight in your institute bank account via PhonePe, GPay, Paytm, BHIM & Cred. Zero 2.5% gateway deductions.',
      metric: '₹0 Commission Deducted',
      thumbnail: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80',
      tag: 'Direct UPI'
    },
    {
      id: 'mod-whatsapp',
      category: 'COMMUNICATION',
      badge: '3x Faster Recovery',
      title: '1-Tap WhatsApp Dues Reminders',
      description: 'Pre-personalizes student name, batch, months overdue, and dynamic payment link directly in WhatsApp Web or mobile in 1 tap.',
      metric: '< 15 Secs per Reminder',
      thumbnail: 'https://images.unsplash.com/photo-1611746872915-64382b5c76da?auto=format&fit=crop&w=800&q=80',
      tag: 'WhatsApp API'
    },
    {
      id: 'mod-attendance',
      category: 'OPERATIONS',
      badge: 'Zero Internet Needed',
      title: '3-Sec Offline Attendance Register',
      description: 'Take full batch roll calls in under 3 seconds per class on ₹8,000 Android phones. Works 100% offline with zero data lag.',
      metric: '100% 2G Tolerant',
      thumbnail: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80',
      tag: 'Offline Engine'
    },
    {
      id: 'mod-defaulters',
      category: 'CASH FLOW',
      badge: 'Defaulter Health',
      title: 'Smart Defaulter Escalation',
      description: 'Multi-month unpaid tracking (30/60/90 days), drop-out risk prediction, and automated parent follow-up escalation triggers.',
      metric: 'Clear Overdue Balances',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      tag: 'Overdue Tracking'
    },
    {
      id: 'mod-receipts',
      category: 'BILLING & COMPLIANCE',
      badge: 'Instant PDF',
      title: 'Automated Digital Fee Receipts',
      description: 'Generate instant GST or non-GST digital tuition receipts with institute logo, student roll number, and UPI transaction UTR numbers.',
      metric: 'Zero Paper Stationery',
      thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      tag: 'Receipts'
    },
    {
      id: 'mod-ai',
      category: 'INTELLIGENCE',
      badge: 'Gemini AI',
      title: 'AI Institute Copilot',
      description: 'Ask questions in natural English/Hinglish like “Who owes fees in Batch 10?” or “Draft a polite reminder message for Rohit”.',
      metric: 'Real-time Intelligence',
      thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
      tag: 'AI Copilot'
    }
  ];

  // Savings Calculator Math
  const [studentCount, setStudentCount] = useState(150);
  const [monthlyFee, setMonthlyFee] = useState(1200);
  const annualFeeCollection = studentCount * monthlyFee * 12;
  const traditionalGatewayCost = Math.round(annualFeeCollection * 0.0236);
  const staffHoursSaved = Math.round((studentCount * 2 * 12) / 60);

  // Audience Profiles
  const audienceTabs = {
    coaching: {
      title: 'Coaching Centers & Institutes',
      highlight: 'Batch-wise monthly tuition collection with hourly roll calls',
      points: [
        'Organize by subjects, boards (CBSE/ICSE/State), and competitive batches (NEET/JEE)',
        'Track multi-month defaulters before exam revision cycles start',
        'Direct UPI payments eliminate card swipe machines and daily cash tallying',
        'Instant WhatsApp receipts build strong parent trust across Kanpur, Patna, Kota & Indore'
      ]
    },
    schools: {
      title: 'K-12 Schools & Academies',
      highlight: 'Term-wise, quarterly & bus transport fee tracking with high offline tolerance',
      points: [
        'Manage classes from Nursery to Grade 12 with section rosters (A, B, C)',
        'Automate quarterly and annual fee head reminders directly to parents',
        'Gate attendance tracking works even in basement computer rooms without WiFi',
        'Save ₹1,50,000+ per 500 students in bank gateway charges every academic year'
      ]
    },
    tutors: {
      title: 'Independent Tutors & Batch Teachers',
      highlight: 'Ultra-light, pocket-sized fee register running on any phone',
      points: [
        'Zero complex ERP bureaucracy — setup your batch in under 60 seconds',
        'Send professional payment requests with dynamic QR codes directly to parent WhatsApp',
        'Instant confirmation messages when student parents pay via UPI',
        'Works seamlessly on entry-level Android devices without expensive software fees'
      ]
    }
  };

  // Launch Videos (Remotion rendered)
  const launchVideos = {
    overview: {
      id: 'overview',
      title: 'English Product Tour',
      tag: 'Full 36s Feature Walkthrough',
      src: '/videos/edumanage_english_overview.mp4',
      poster: '/videos/test_still.png',
      desc: 'Complete walkthrough: 0% direct UPI fees, 1-tap WhatsApp reminders, and 2G offline attendance tolerance.'
    },
    promo: {
      id: 'promo',
      title: 'High-Energy Kinetic Reel',
      tag: '21s Promo Video',
      src: '/videos/edumanage_english_promo.mp4',
      poster: '/videos/preview_english_promo.png',
      desc: 'Fast-paced kinetic typography and stat popups built for social media and quick pitch decks.'
    }
  };

  // FAQs
  const [openFaq, setOpenFaq] = useState(0);
  const faqs = [
    {
      q: 'How does EduManage collect fees with 0% gateway commission?',
      a: 'Traditional payment gateways (like Razorpay or Cashfree) charge 2% to 2.5% + 18% GST on every fee transaction. EduManage utilizes India\'s Direct UPI Rail: payments made by parents via Google Pay, PhonePe, Paytm, or BHIM go 100% directly into your institute\'s bank UPI account with zero middleman deduction.'
    },
    {
      q: 'How do the 1-Tap WhatsApp reminders work?',
      a: 'EduManage generates a personalized WhatsApp reminder message for each student with their name, pending month, exact dues amount, and a clickable dynamic UPI payment link. With one tap, it opens WhatsApp Web or your phone\'s WhatsApp app ready to send.'
    },
    {
      q: 'Does EduManage work without internet connection?',
      a: 'Yes. Attendance roll calls, student directory lookup, and pending fee checks are cached locally on your device. Teachers can take roll calls in remote areas or basements with zero data. When internet resumes, records synchronize automatically.'
    },
    {
      q: 'Can I import my existing students from Excel or CSV?',
      a: 'Absolutely! You can upload an Excel or CSV file containing student names, roll numbers, guardian contact numbers, and batches with one click in the Students screen.'
    },
    {
      q: 'What is the AI Institute Copilot?',
      a: 'The AI Copilot is powered by Google Gemini and has full, secure access to your institute\'s dues, defaulters, and attendance numbers. You can ask questions in conversational English or Hinglish to analyze cash flow, identify at-risk students, or draft reminder messages.'
    }
  ];

  return (
    <div className={`w-full min-h-screen ${darkMode ? 'dark bg-stone-950 text-stone-100' : 'bg-[#FAF7F2] text-stone-900'} font-body transition-colors duration-200 select-none`}>
      
      {/* =========================================================
          1. STICKY TOP NAVBAR (Warm Editorial Aesthetic)
      ========================================================= */}
      <header className={`sticky top-0 z-40 ${darkMode ? 'bg-stone-950/90 border-stone-800' : 'bg-[#FAF7F2]/90 border-stone-200/80'} backdrop-blur-md border-b`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="w-9 h-9 rounded-xl bg-[#A82D24] text-white flex items-center justify-center shadow-xs">
                <GraduationCap size={20} className="stroke-[2.2]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-xl font-black ${darkMode ? 'text-stone-100' : 'text-stone-900'} tracking-tight`}>
                  EduManage
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#A82D24] text-white shadow-2xs">
                  Bharat
                </span>
              </div>
            </div>
            <div className="hidden sm:flex items-center pl-2">
              <VersionBadge />
            </div>
          </div>

          {/* Navigation Links */}
          <nav className={`hidden lg:flex items-center gap-7 text-xs font-semibold ${darkMode ? 'text-stone-300' : 'text-stone-600'}`}>
            <a href="#why-direct-upi" className="hover:text-[#A82D24] dark:hover:text-[#ff6b5e] transition-colors">Why Direct UPI</a>
            <a href="#core-capabilities" className="hover:text-[#A82D24] dark:hover:text-[#ff6b5e] transition-colors">Core Features</a>
            <a href="#calculator" className="hover:text-[#A82D24] dark:hover:text-[#ff6b5e] transition-colors">Savings Calculator</a>
            <a href="#institutes" className="hover:text-[#A82D24] dark:hover:text-[#ff6b5e] transition-colors">For Institutes</a>
            <a href="#launch-videos" className="hover:text-[#A82D24] dark:hover:text-[#ff6b5e] transition-colors">Launch Videos</a>
            <button
              type="button"
              onClick={onOpenAi}
              className="flex items-center gap-1.5 text-[#A82D24] dark:text-[#ff6b5e] hover:text-[#8B261E] font-bold cursor-pointer transition-colors"
            >
              <Sparkles size={13} className="text-[#A82D24] dark:text-[#ff6b5e]" />
              <span>AI Copilot</span>
            </button>
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

            {/* Sign In Button */}
            <button
              type="button"
              onClick={() => setAuthView('login')}
              className={`text-xs font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                darkMode ? 'text-stone-300 hover:text-white' : 'text-stone-700 hover:text-stone-900'
              }`}
            >
              Sign In
            </button>

            {/* Instant Demo Crimson CTA Button */}
            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              className="bg-[#A82D24] hover:bg-[#8B261E] active:scale-95 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={13} className="text-amber-300" />
              <span>Try Live Demo</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          2. HERO SECTION (Editorial Layout with EduManage Content)
      ========================================================= */}
      <section className="relative pt-10 sm:pt-16 pb-12 sm:pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column: Heading & CTAs */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-medium bg-[#F7EBEA] dark:bg-red-950/40 text-[#8B261E] dark:text-red-300 border border-red-200/60 dark:border-red-900/60 shadow-2xs">
                <span>0% Gateway Commission · Direct Bank UPI · 1-Tap WhatsApp · 2G Offline Attendance</span>
              </div>

              {/* Main Headline */}
              <h1 className={`text-4xl sm:text-6xl lg:text-7xl font-bold font-editorial ${darkMode ? 'text-stone-100' : 'text-stone-900'} leading-[1.08] tracking-tight`}>
                Bharat’s simplest<br />
                institute engine.<br />
                <span className="text-[#8B261E]">Zero commission<br />fees.</span>
              </h1>

              {/* Subtitle */}
              <p className={`text-sm sm:text-base ${darkMode ? 'text-stone-300' : 'text-stone-600'} max-w-xl leading-relaxed`}>
                Stop paying 2.5% to middleman payment gateways. EduManage collects tuition fees directly into your institute's bank account via UPI, sends automated 1-tap WhatsApp reminders with dynamic QR codes, and tracks offline attendance in 3 seconds — with an AI Copilot.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('ADMIN')}
                  className="bg-[#A82D24] hover:bg-[#8B261E] active:scale-[0.98] text-white font-semibold text-xs sm:text-sm px-5 py-3 rounded-xl shadow-md shadow-red-900/10 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <span>Explore Live Demo</span>
                  <ArrowRight size={15} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('calculator');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl border ${
                    darkMode
                      ? 'border-stone-800 bg-stone-900/80 text-stone-200 hover:bg-stone-800'
                      : 'border-stone-300 bg-white text-stone-700 hover:bg-stone-50'
                  } transition-all cursor-pointer`}
                >
                  Calculate Your Savings
                </button>

                <button
                  type="button"
                  onClick={() => setAuthView('login')}
                  className="text-xs sm:text-sm font-semibold px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 transition-all cursor-pointer"
                >
                  Sign In to Portal
                </button>
              </div>

              {/* Stats Counters Row (EduManage Value Metrics) */}
              <div className="pt-6 grid grid-cols-4 gap-4 border-t border-stone-200/80 dark:border-stone-800/80 max-w-lg">
                <div>
                  <div className={`text-2xl sm:text-3xl font-black font-editorial ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>0%</div>
                  <div className="text-[11px] font-medium text-stone-500">gateway cut</div>
                </div>
                <div>
                  <div className={`text-2xl sm:text-3xl font-black font-editorial ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>₹0</div>
                  <div className="text-[11px] font-medium text-stone-500">per transaction</div>
                </div>
                <div>
                  <div className={`text-2xl sm:text-3xl font-black font-editorial ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>1-Tap</div>
                  <div className="text-[11px] font-medium text-stone-500">WhatsApp dues</div>
                </div>
                <div>
                  <div className={`text-2xl sm:text-3xl font-black font-editorial ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>100%</div>
                  <div className="text-[11px] font-medium text-stone-500">offline sync</div>
                </div>
              </div>
            </div>

            {/* Right Column: High-Impact Video/Interactive Showcase Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md rounded-2xl overflow-hidden shadow-2xl border border-stone-200 dark:border-stone-800 bg-stone-900 group">
                
                {/* Visual Image */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-950">
                  <img
                    src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80"
                    alt="Classroom fee & attendance management"
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60 pointer-events-none" />

                  {/* Header Badge inside thumbnail */}
                  <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                    <span className="bg-[#A82D24] text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md shadow-xs">
                      DIRECT UPI RECOVERY
                    </span>
                  </div>

                  {/* Blackboard Formula Card in Top Right (Real ROI Math!) */}
                  <div className="absolute top-4 right-4 z-10 bg-stone-950/90 border border-stone-700/80 rounded-lg p-2.5 shadow-lg backdrop-blur-xs font-mono text-[10px] text-emerald-300 leading-tight">
                    <div className="text-stone-400 text-[9px] mb-0.5">DIRECT UPI RECOVERY</div>
                    <div>150 Students × ₹1,200</div>
                    <div>= ₹21.6L Annual Pool</div>
                    <div className="text-amber-300 font-bold">Saved: ₹50,976 / yr</div>
                  </div>

                  {/* Center Play / Demo Button with Pulse Animation */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('ADMIN')}
                      className="w-16 h-16 rounded-full bg-white/95 text-stone-900 hover:bg-white flex items-center justify-center shadow-2xl shadow-black/80 hover:scale-110 active:scale-95 transition-all cursor-pointer ring-8 ring-white/20"
                    >
                      <Play size={24} className="fill-stone-900 text-stone-900 translate-x-0.5" />
                    </button>
                  </div>

                  {/* Product Title inside thumbnail */}
                  <div className="absolute bottom-12 left-4 right-4 z-10">
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide uppercase drop-shadow-md">
                      EDUMANAGE BHARAT
                    </h3>
                    <p className="text-xs text-stone-300 font-medium">
                      0% COMMISSION · DIRECT UPI & ATTENDANCE
                    </p>
                  </div>

                  {/* Scrub Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-stone-700/60">
                    <div className="h-full bg-[#A82D24] w-4/5" />
                  </div>
                </div>

                {/* AI Copilot Speech Card */}
                <div className="p-3.5 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                    <Sparkles size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-[#A82D24]">
                      <Sparkles size={11} />
                      <span>AI COPILOT</span>
                    </div>
                    <p className="text-xs text-stone-700 dark:text-stone-300 font-medium italic mt-0.5 leading-snug">
                      “Rahul Sharma ki ₹1,500 October fee overdue hai. 1-tap WhatsApp reminder with dynamic UPI QR ready hai!”
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAi}
                    className="text-[11px] font-bold text-[#A82D24] hover:underline shrink-0 cursor-pointer pt-1"
                  >
                    Ask Copilot →
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* Marquee Ticker Bar (Educator & Institute Endorsement) */}
          <div className="mt-14 pt-6 border-t border-stone-200/90 dark:border-stone-800 flex flex-wrap items-center justify-between gap-4 text-xs">
            <span className="text-[11px] font-extrabold tracking-wider uppercase text-stone-500 dark:text-stone-400">
              TRUSTED BY INSTITUTES ACROSS BHARAT
            </span>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-stone-700 dark:text-stone-300">
              <span>Apex Coaching Academy</span>
              <span className="text-stone-300 dark:text-stone-700">|</span>
              <span>Verma Physics Classes</span>
              <span className="text-stone-300 dark:text-stone-700">|</span>
              <span>Prerna Public School</span>
              <span className="text-stone-300 dark:text-stone-700">|</span>
              <span>Sigma Commerce Academy</span>
              <span className="text-stone-300 dark:text-stone-700">|</span>
              <span>Gyan Gurukul</span>
              <span className="text-stone-300 dark:text-stone-700">|</span>
              <span>Chanakya Tutors</span>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          3. CORE CAPABILITIES (In the 6-Card Editorial Grid Style)
      ========================================================= */}
      <section id="core-capabilities" className="py-16 sm:py-20 border-t border-stone-200 dark:border-stone-800 bg-[#FDFBF7] dark:bg-stone-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#A82D24]">
                EDUMANAGE CORE CAPABILITIES
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-editorial text-stone-900 dark:text-stone-100 mt-1">
                Everything you need to run your institute in one place
              </h2>
            </div>
            
            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#A82D24] hover:underline cursor-pointer"
            >
              <span>Explore Admin Dashboard</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {/* 6 Module Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            {coreModules.map((module) => (
              <div
                key={module.id}
                onClick={() => handleQuickDemo('ADMIN')}
                className={`group rounded-2xl border ${
                  darkMode ? 'bg-stone-900 border-stone-800 hover:border-stone-700' : 'bg-white border-stone-200/90 hover:border-stone-300'
                } overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col justify-between`}
              >
                {/* Thumbnail Header */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-stone-950">
                  <img
                    src={module.thumbnail}
                    alt={module.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

                  {/* Badges on Thumbnail */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-[#A82D24] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
                      {module.category}
                    </span>
                    <span className="bg-white/20 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-md border border-white/20">
                      {module.badge}
                    </span>
                  </div>

                  {/* Play icon overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full bg-white text-stone-900 flex items-center justify-center shadow-lg">
                      <ArrowRight size={18} className="translate-x-0.5" />
                    </div>
                  </div>

                  {/* Bottom title inside thumbnail */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h4 className="text-base font-black text-white leading-tight uppercase drop-shadow-sm">
                      {module.title}
                    </h4>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                      {module.tag}
                    </span>
                    <p className="text-xs text-stone-600 dark:text-stone-300 mt-1 leading-relaxed">
                      {module.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{module.metric}</span>
                    <span className="text-[#A82D24] font-semibold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      <span>Launch</span>
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
          4. DIRECT BANK UPI & SAVINGS CALCULATOR
      ========================================================= */}
      <section id="why-direct-upi" className="py-16 sm:py-20 border-t border-stone-200 dark:border-stone-800 bg-[#FAF7F2] dark:bg-stone-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Direct UPI Philosophy */}
            <div className="lg:col-span-6 space-y-4">
              <span className="text-[11px] font-bold tracking-widest uppercase text-[#A82D24]">
                DIRECT UPI REVOLUTION
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold font-editorial text-stone-900 dark:text-stone-100">
                0% Gateway Cut. 100% of the Tuition Lands in your Bank.
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Aggregators like Razorpay or Cashfree deduct ~2.36% on every student fee payment. With EduManage, parents scan a dynamic UPI QR code that sends 100% of the tuition straight to your institute's bank account with zero middleman deductions.
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
                  <span>Works 100% offline on 2G Android phones in rural coaching centers</span>
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('ADMIN')}
                  className="bg-[#A82D24] hover:bg-[#8B261E] text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Open Admin Portal</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Savings Calculator */}
            <div id="calculator" className="lg:col-span-6 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 shadow-sm">
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
                  <div className="text-[11px] font-semibold text-stone-500">ANNUAL GATEWAY SAVINGS WITH DIRECT UPI</div>
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
          5. MULTI-TENANT AUDIENCE PROFILES (Coaching, Schools, Tutors)
      ========================================================= */}
      <section id="institutes" className="py-16 sm:py-20 border-t border-stone-200 dark:border-stone-800 bg-[#FDFBF7] dark:bg-stone-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#A82D24]">
              BUILT FOR YOUR OPERATIONAL SCALE
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold font-editorial text-stone-900 dark:text-stone-100 mt-1">
              Engineered for Coaching, Schools & Tutors
            </h2>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex justify-center gap-2 mb-8">
            {Object.keys(audienceTabs).map((key) => {
              const active = tenantMode === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTenantMode(key)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? 'bg-[#A82D24] text-white shadow-xs'
                      : darkMode
                        ? 'bg-stone-900 text-stone-400 hover:text-white'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {key === 'coaching' ? 'Coaching Institutes' : key === 'schools' ? 'K-12 Schools' : 'Batch Tutors'}
                </button>
              );
            })}
          </div>

          {/* Active Audience Card */}
          <div className="max-w-3xl mx-auto p-6 sm:p-8 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm">
            <h3 className="text-xl font-bold font-editorial text-stone-900 dark:text-stone-100 mb-1">
              {audienceTabs[tenantMode].title}
            </h3>
            <p className="text-xs text-[#A82D24] font-semibold mb-5">
              {audienceTabs[tenantMode].highlight}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs text-stone-700 dark:text-stone-300">
              {audienceTabs[tenantMode].points.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{pt}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-stone-100 dark:border-stone-800 flex justify-end">
              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className="bg-[#A82D24] hover:bg-[#8B261E] text-white font-semibold text-xs px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Launch {audienceTabs[tenantMode].title} Demo</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================
          6. LAUNCH VIDEOS (Remotion Rendered)
      ========================================================= */}
      <section id="launch-videos" className="py-16 sm:py-20 border-t border-stone-200 dark:border-stone-800 bg-[#FAF7F2] dark:bg-stone-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#A82D24]">
              PRODUCT DEMONSTRATIONS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold font-editorial text-stone-900 dark:text-stone-100 mt-1">
              See EduManage in Action
            </h2>
          </div>

          {/* Video Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {Object.values(launchVideos).map((vid) => {
              const active = selectedVideo === vid.id;
              return (
                <button
                  key={vid.id}
                  type="button"
                  onClick={() => setSelectedVideo(vid.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                    active
                      ? 'bg-[#A82D24] text-white shadow-xs'
                      : darkMode
                        ? 'bg-stone-900 text-stone-400 hover:text-white'
                        : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <Play size={12} className={active ? 'fill-white text-white' : 'text-stone-400'} />
                  <span>{vid.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                    active ? 'bg-red-800 text-red-100' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'
                  }`}>
                    {vid.tag}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Video Player Card */}
          <div className="bg-stone-900 rounded-2xl border border-stone-800 p-4 shadow-xl">
            <div className="relative rounded-xl overflow-hidden bg-black aspect-video max-h-[480px] mx-auto">
              <video
                key={launchVideos[selectedVideo].src}
                controls
                playsInline
                poster={launchVideos[selectedVideo].poster}
                className="w-full h-full object-contain"
              >
                <source src={launchVideos[selectedVideo].src} type="video/mp4" />
                Your browser does not support HTML5 video playback.
              </video>
            </div>
            <p className="text-xs text-stone-400 mt-3 text-center">
              {launchVideos[selectedVideo].desc}
            </p>
          </div>

        </div>
      </section>

      {/* =========================================================
          7. FAQ SECTION
      ========================================================= */}
      <section className="py-16 sm:py-20 border-t border-stone-200 dark:border-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#A82D24]">
              FREQUENTLY ASKED QUESTIONS
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
          8. FOOTER
      ========================================================= */}
      <footer className="border-t border-stone-200 dark:border-stone-800 py-10 bg-white dark:bg-stone-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#A82D24] text-white flex items-center justify-center font-bold text-xs">
              <GraduationCap size={14} />
            </div>
            <span className="text-base font-black text-stone-900 dark:text-stone-100">EduManage Bharat</span>
            <span className="text-stone-400 pl-2">· Direct UPI & Attendance Engine for Bharat</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer"
            >
              Admin Portal
            </button>
            <button
              type="button"
              onClick={() => setAuthView('login')}
              className="hover:text-stone-900 dark:hover:text-stone-200 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setAuthView('register')}
              className="text-[#A82D24] font-semibold hover:underline cursor-pointer"
            >
              Register Institute
            </button>
          </div>
        </div>
      </footer>

      {/* =========================================================
          9. FLOATING AI COPILOT BUTTON (Bottom Right)
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
        title="Ask AI Copilot about fee dues, defaulters or attendance"
      >
        <Sparkles size={15} className="text-amber-300 pointer-events-none" />
        <span className="pointer-events-none">Ask AI Copilot</span>
      </button>

    </div>
  );
};
