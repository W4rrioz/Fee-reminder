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
  Bot,
  Sun,
  Moon,
  MessageSquare,
  HelpCircle,
  Clock,
  Compass,
  ArrowUpRight,
  TrendingUp,
  Calculator,
  QrCode,
  WifiOff,
  Users,
  FileText,
  Send,
  X,
  CreditCard,
  Share2,
  School,
  Award,
  Smartphone
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VersionBadge } from '../components/VersionBadge';

export const WelcomeLandingScreen = ({ onOpenAi }) => {
  const { setAuthView, loginUser } = useApp();
  const [darkMode, setDarkMode] = useState(false);
  const [activeModuleModal, setActiveModuleModal] = useState(null);
  const [showProductTour, setShowProductTour] = useState(false);
  const [showRoiModal, setShowRoiModal] = useState(false);
  const [activeAudienceTab, setActiveAudienceTab] = useState('coaching'); // 'coaching' | 'tutors' | 'schools'
  const [reminderSentToast, setReminderSentToast] = useState(false);

  // Interactive ROI Calculator State
  const [calcStudents, setCalcStudents] = useState(150);
  const [calcMonthlyFee, setCalcMonthlyFee] = useState(1200);

  const annualPool = calcStudents * calcMonthlyFee * 12;
  const pgLoss = Math.round(annualPool * 0.0236); // Standard 2.36% (2% + 18% GST) on Razorpay / Stripe
  const edumanageSavings = pgLoss;

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', next);
      }
      return next;
    });
  };

  // Quick 1-tap guest explorer for instant demo
  const handleQuickDemo = (role = 'ADMIN') => {
    loginUser({
      token: `token_guest_${Date.now()}`,
      user: {
        id: `edumanage_${role.toLowerCase()}_${Date.now()}`,
        name: role === 'ADMIN' ? 'Director Sharma' : 'Faculty Member',
        email: `${role.toLowerCase()}@edumanage.in`,
        phone: '+91 9876543210',
        role,
        isGuest: true,
        created_at: new Date().toISOString()
      },
      institute: {
        id: 'inst_apex_01',
        name: 'Apex Tutorials & Science Academy',
        type: 'coaching_center',
        city: 'Kanpur',
        upi_id: 'apextutorials@upi',
        upi_name: 'Apex Tutorials Kanpur',
        enable_attendance: true
      }
    });
  };

  const handleSimulateReminder = () => {
    setReminderSentToast(true);
    setTimeout(() => setReminderSentToast(false), 3500);
  };

  // 6 Core Modules matching the editorial grid from Screenshot 2
  const coreModules = [
    {
      id: 'mod-upi',
      category: '0% COMMISSION',
      moduleType: 'Fee Engine',
      title: 'Direct Bank UPI Fee Collection',
      tagline: 'Zero gateway cut. Instant credit to your bank account.',
      metric: '₹0 Gateway Fees',
      metricSub: 'Instant Bank Settlement',
      badge: 'Most Popular',
      accent: 'from-[#8B261E] to-[#A82D24]',
      thumbnail: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
      overview: 'Generate dynamic UPI QR codes per student. Parents scan and pay directly via PhonePe, Google Pay, Paytm, or BHIM. No payment gateway holds, no 2-3% commission cuts.',
      highlights: [
        'Dynamic QR with student roll number & exact fee prefilled',
        'Works with any Indian savings or current bank account',
        'Instant payment confirmation and automatic ledger update',
        'Zero setup fee and zero per-transaction deduction'
      ]
    },
    {
      id: 'mod-whatsapp',
      category: '3X FASTER RECOVERY',
      moduleType: 'Smart Messaging',
      title: '1-Tap WhatsApp Dues Reminders',
      tagline: 'Polite, personalized reminders with clickable UPI pay links.',
      metric: '94% Open Rate',
      metricSub: '3x Faster Collections',
      badge: 'High Impact',
      accent: 'from-emerald-700 to-teal-800',
      thumbnail: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=800&q=80',
      overview: 'Stop making awkward fee reminder phone calls. Send automated, courteous WhatsApp reminders in Hindi, English, or Hinglish with 1-click. Parents get a direct payment link and QR code.',
      highlights: [
        'Personalized student name, batch, and overdue month',
        'Direct UPI deep-link for instant payment on mobile',
        'Customizable polite templates in Hindi and English',
        'Scheduled reminders 3 days before and on the due date'
      ]
    },
    {
      id: 'mod-attendance',
      category: 'ZERO INTERNET NEEDED',
      moduleType: 'Classroom Operations',
      title: '3-Sec Offline Attendance Register',
      tagline: 'Mark 60 students in 60 seconds even with zero cell service.',
      metric: '100% Offline Safe',
      metricSub: 'Works on 2G & Basements',
      badge: 'Offline First',
      accent: 'from-amber-700 to-orange-800',
      thumbnail: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80',
      overview: 'Classrooms and coaching basements frequently have zero or spotty internet. EduManage logs student attendance locally with millisecond speed and auto-syncs when network returns.',
      highlights: [
        'Mark Present, Absent, or Late with 1-tap quick toggles',
        'Instant SMS or WhatsApp absent notification to parents',
        'Zero latency, local SQLite/IndexedDB caching',
        'Monthly percentage reports and low-attendance warnings'
      ]
    },
    {
      id: 'mod-defaulters',
      category: 'CASH FLOW RADAR',
      moduleType: 'Financial Recovery',
      title: 'Defaulter Aging & Recovery Radar',
      tagline: 'Know exactly who owes what, categorized by 15, 30 & 60+ days.',
      metric: '< 5% Defaulter Ratio',
      metricSub: 'Predictable Monthly Cashflow',
      badge: 'Cashflow Guard',
      accent: 'from-rose-800 to-red-900',
      thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      overview: 'Never let unpaid fees slip through the cracks. The defaulter radar automatically categorizes overdue fees by aging buckets, calculates total pending dues, and prioritizes recovery.',
      highlights: [
        'Smart filters for 1-month, 2-month, and 3+ month defaulters',
        'Bulk 1-tap WhatsApp reminder broadcast to all defaulters',
        'Total pending dues projection for rent and staff salaries',
        'Detailed payment history and fee concession tracking'
      ]
    },
    {
      id: 'mod-receipts',
      category: 'BILLING & COMPLIANCE',
      moduleType: 'Digital Documentation',
      title: 'Instant Branded Digital Receipts',
      tagline: 'Auto-generated PDF receipts sent directly to parent WhatsApp.',
      metric: 'Auto PDF & SMS',
      metricSub: 'Zero Paper Stationery',
      badge: 'Instant PDF',
      accent: 'from-stone-700 to-stone-900',
      thumbnail: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80',
      overview: 'Replace messy paper receipt books with professional, digital PDF receipts. Features your institute logo, student details, payment mode, transaction ID, and GST if applicable.',
      highlights: [
        'Automated PDF generation upon marking payment received',
        'Custom institute branding, stamp, and authorized signature',
        'Searchable receipt archive for year-end accounts & audits',
        'Parents can re-download receipts anytime from their phone'
      ]
    },
    {
      id: 'mod-ai-copilot',
      category: 'AI MANAGEMENT',
      moduleType: 'Gemini Pro Powered',
      title: 'Bilingual AI Institute Copilot',
      tagline: 'Ask questions in Hindi or English about fees, cashflow & batches.',
      metric: '24/7 Intelligence',
      metricSub: 'Voice & Text Query',
      badge: 'Gemini Pro',
      accent: 'from-indigo-800 to-purple-900',
      thumbnail: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
      overview: 'Your 24/7 smart assistant powered by Gemini. Ask natural questions like "Which batch has the highest pending fees?" or "Draft a polite reminder in Hindi for Class 10 science fees".',
      highlights: [
        'Full conversational understanding of your institute ledger',
        'Drafts customized WhatsApp messages and announcements',
        'Calculates expected cash flow and identifies at-risk students',
        'Works seamlessly in Hindi, English, and Hinglish'
      ]
    }
  ];

  // Audience Profiles
  const audienceData = {
    coaching: {
      title: 'For Coaching Centers & Batches',
      subtitle: 'Manage 100 to 2,000+ students across multiple batches and faculty members.',
      points: [
        'Batch-wise fee structures and installment tracking',
        'Multi-teacher access with role-based permissions',
        'Defaulter management before monthly faculty salary payouts',
        'Automated monthly attendance percentage reports'
      ]
    },
    tutors: {
      title: 'For Private Tutors & Home Coaching',
      subtitle: 'Perfect for independent educators managing 10 to 80 private students.',
      points: [
        'Zero setup cost — start in under 2 minutes',
        'Direct UPI QR on your phone — no card machines needed',
        'Gentle WhatsApp reminders so you never have to ask for money awkwardly',
        '100% offline attendance register on your smartphone'
      ]
    },
    schools: {
      title: 'For K-12 Private Schools & Academies',
      subtitle: 'Streamline term fees, bus charges, and parent communication without clunky legacy ERPs.',
      points: [
        'Term-wise & quarterly fee schedules with automated reminders',
        'Student roll number integration and division management',
        'Direct bank reconciliation with zero gateway transaction deductions',
        'Digital fee clearance certificates for exam hall tickets'
      ]
    }
  };

  const faqItems = [
    {
      q: 'How does EduManage collect fees with 0% gateway commission?',
      a: 'Unlike traditional platforms like Razorpay or payment gateways that deduct 2% to 3% on every payment, EduManage generates a direct UPI QR code linked to your own bank account (Savings or Current). When parents scan and pay via PhonePe, GPay, Paytm, or BHIM, the money moves bank-to-bank directly with zero intermediary fee.'
    },
    {
      q: 'Will EduManage work if my classroom has zero internet or poor signal?',
      a: 'Yes, 100%! EduManage is built offline-first. You can take attendance, check student details, and record cash or UPI payments even in a basement with zero internet. Everything automatically synchronizes safely as soon as you connect to Wi-Fi or mobile data.'
    },
    {
      q: 'How do 1-Tap WhatsApp reminders work?',
      a: 'With one tap, EduManage opens WhatsApp with a prefilled, polite reminder message in Hindi or English. It includes the student’s name, batch, due amount, and a direct UPI payment link. Parents can simply tap the link or scan the QR code to pay immediately.'
    },
    {
      q: 'Is my student and financial data secure?',
      a: 'Absolutely. EduManage uses enterprise-grade encryption. Your student records and fee data belong solely to your institute. We never sell data, never spam parents, and never take hidden cuts from your fees.'
    }
  ];

  const [expandedFaq, setExpandedFaq] = useState(null);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-[#121212] text-stone-100' : 'bg-[#FAF7F2] text-[#1C1917]'} font-body transition-colors duration-300 relative selection:bg-[#8B261E]/20 selection:text-[#8B261E]`}>
      
      {/* Toast Notification when simulating WhatsApp Reminder */}
      {reminderSentToast && (
        <div className="fixed top-20 right-6 z-50 bg-[#8B261E] text-white text-xs font-bold py-3 px-5 rounded-xl shadow-2xl flex items-center gap-2.5 animate-fade-in border border-white/20">
          <CheckCircle2 size={18} className="text-emerald-300" />
          <span>WhatsApp reminder with dynamic UPI QR generated successfully!</span>
        </div>
      )}

      {/* TOP NAVIGATION BAR - Editorial Aesthetic matching Swyam */}
      <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-[#E7E0D6] dark:border-stone-800 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* Brand Logo - EduManage Bharat in Serif */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#8B261E] text-white flex items-center justify-center font-bold shadow-sm">
              <GraduationCap size={22} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#1C1917] dark:text-stone-100">
                  EduManage
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#8B261E] text-white tracking-wider">
                  Bharat
                </span>
              </div>
              <span className="text-[10px] text-stone-500 dark:text-stone-400 font-medium">
                0% Fee Engine · Offline Attendance
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-stone-600 dark:text-stone-300">
            <a href="#fee-engine" className="hover:text-[#8B261E] dark:hover:text-rose-400 transition-colors">
              Fee Engine
            </a>
            <a href="#whatsapp-reminders" className="hover:text-[#8B261E] dark:hover:text-rose-400 transition-colors">
              WhatsApp Dues
            </a>
            <a href="#offline-attendance" className="hover:text-[#8B261E] dark:hover:text-rose-400 transition-colors">
              Offline Register
            </a>
            <a href="#roi-calculator" className="hover:text-[#8B261E] dark:hover:text-rose-400 transition-colors">
              Savings Math
            </a>
            <button
              type="button"
              onClick={onOpenAi}
              className="text-[#8B261E] dark:text-rose-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Sparkles size={14} />
              <span>AI Copilot</span>
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleDarkMode}
              className="p-2 rounded-xl border border-[#E7E0D6] dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer"
              title="Toggle theme"
            >
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            <button
              type="button"
              onClick={() => setAuthView('login')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold border border-[#E7E0D6] dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 hover:bg-stone-50 dark:hover:bg-stone-700 transition-colors cursor-pointer"
            >
              <LogIn size={14} />
              <span>Log in</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('ADMIN')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#8B261E] hover:bg-[#721C16] text-white shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>Instant Demo</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION - Inspired by Screenshot 1 (Editorial Layout & Color Palette) */}
      <section className="relative pt-10 sm:pt-16 pb-16 sm:pb-24 overflow-hidden">
        
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-100/50 dark:bg-rose-950/20 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-rose-100/40 dark:bg-stone-800/20 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            
            {/* Left Column: Editorial Value Proposition */}
            <div className="lg:col-span-7 flex flex-col items-start text-left">
              
              {/* Category Pill Badge matching Swyam */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F3ECE1] dark:bg-stone-800/90 border border-[#E5DACD] dark:border-stone-700 text-[#8B261E] dark:text-rose-400 text-xs font-semibold tracking-wide mb-6">
                <span className="w-2 h-2 rounded-full bg-[#8B261E] dark:bg-rose-500 animate-pulse" />
                <span>0% Commission · For Bharat's Coaching Centers, Tutors & Schools</span>
              </div>

              {/* Serif Display Headline matching Swyam typography */}
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-serif font-bold text-[#1C1917] dark:text-stone-100 tracking-tight leading-[1.12] mb-6">
                Bharat’s simplest fee engine.{' '}
                <span className="text-[#8B261E] dark:text-[#E05D52] italic block sm:inline">
                  Zero commission. Money straight to your bank.
                </span>
              </h1>

              {/* Subtitle paragraph */}
              <p className="text-base sm:text-lg text-stone-600 dark:text-stone-300 leading-relaxed max-w-xl mb-8 font-normal">
                Collect tuition and school fees directly via your own UPI ID with <strong>0% payment gateway deductions</strong>. Send 1-tap WhatsApp dues reminders with dynamic QR codes, track defaulters, and log 2G offline attendance with your AI Copilot.
              </p>

              {/* Dual CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 mb-12">
                <button
                  type="button"
                  onClick={() => handleQuickDemo('ADMIN')}
                  className="px-6 py-3.5 rounded-xl bg-[#8B261E] hover:bg-[#721C16] text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
                >
                  <span>Start Managing Free</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => setShowRoiModal(true)}
                  className="px-5 py-3.5 rounded-xl bg-white dark:bg-stone-800 border border-[#E7E0D6] dark:border-stone-700 text-stone-800 dark:text-stone-200 text-sm font-bold hover:bg-stone-50 dark:hover:bg-stone-700 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Calculator size={16} className="text-[#8B261E] dark:text-rose-400" />
                  <span>Calculate Savings</span>
                </button>
              </div>

              {/* Editorial Stat Counters matching Screenshot 1 (244 chapters, 5 classes, 3 languages, 0 always) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-[#E7E0D6] dark:border-stone-800 w-full">
                <div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917] dark:text-stone-100">
                    0%
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    gateway cut
                  </div>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917] dark:text-stone-100">
                    ₹0
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    setup cost
                  </div>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917] dark:text-stone-100">
                    1-Tap
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    WhatsApp dues
                  </div>
                </div>

                <div>
                  <div className="text-2xl sm:text-3xl font-serif font-bold text-[#1C1917] dark:text-stone-100">
                    100%
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                    offline sync
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column: Hero Feature Showcase Card (Visual Composition inspired by Screenshot 1) */}
            <div className="lg:col-span-5 flex flex-col gap-3.5 relative mt-6 lg:mt-0">
              
              {/* TOP: Floating Blackboard Math Card as an interactive hero header badge */}
              <div
                onClick={() => setShowRoiModal(true)}
                className="bg-[#16221A] text-amber-100 p-3.5 rounded-2xl border-2 border-amber-700/60 shadow-lg text-left cursor-pointer hover:scale-[1.02] transition-all flex items-center justify-between gap-4 animate-fade-in"
                title="Click to calculate your custom savings"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                    <Sparkles size={12} />
                    <span>Direct Bank UPI ROI Math</span>
                  </div>
                  <div className="text-xs font-mono text-stone-200 mt-0.5 truncate">
                    150 Students × ₹1,200/mo = ₹21.6L pool
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[11px] font-mono text-rose-300 line-through">
                    PG Cut: -₹50,976/yr
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1 justify-end">
                    <span>EduManage = ₹0 Cut</span>
                    <ArrowUpRight size={13} />
                  </div>
                </div>
              </div>

              {/* Outer Editorial Framed Card */}
              <div className="rounded-2xl overflow-hidden border border-[#E7E0D6] dark:border-stone-700 bg-white dark:bg-stone-900 shadow-xl transition-all text-left">
                
                {/* Header bar of preview */}
                <div className="bg-[#FAF7F2] dark:bg-stone-800 px-4 py-2.5 border-b border-[#E7E0D6] dark:border-stone-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-stone-700 dark:text-stone-200">
                      Apex Tutorials · Class 10 Foundation
                    </span>
                  </div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-[#8B261E] dark:text-rose-300 font-bold">
                    4 Overdue Dues
                  </span>
                </div>

                {/* Main Visual: Classroom Fee Recovery in Action */}
                <div className="p-4 sm:p-5 flex flex-col gap-3.5">
                  
                  {/* Student Fee Card Preview */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-[#FAF7F2] dark:bg-stone-800/80 border border-[#E7E0D6] dark:border-stone-700">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-semibold text-stone-500 dark:text-stone-400">
                          Student Roll #14 · Class 10 Mathematics
                        </div>
                        <div className="text-base font-bold text-stone-900 dark:text-stone-100 mt-0.5">
                          Rahul Sharma
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
                        ₹1,500 Due (Oct)
                      </span>
                    </div>

                    {/* Direct UPI Section with QR and Bank Verification */}
                    <div className="mt-3 pt-3 border-t border-[#E7E0D6] dark:border-stone-700 flex items-center gap-3">
                      <div className="w-13 h-13 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center p-1 shadow-2xs shrink-0">
                        <QrCode size={40} className="text-stone-900 dark:text-stone-100" />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="text-[11px] font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1 truncate">
                          <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <span>Direct HDFC Settlement: ••4091</span>
                        </div>
                        <div className="text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 truncate">
                          Supports PhonePe, Google Pay, Paytm, BHIM UPI
                        </div>
                        <div className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 mt-0.5">
                          0% Gateway Cut · Instant Bank Credit
                        </div>
                      </div>
                    </div>

                    {/* 1-Tap WhatsApp Reminder Action Button */}
                    <button
                      type="button"
                      onClick={handleSimulateReminder}
                      className="mt-3 w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all active:scale-98 cursor-pointer"
                    >
                      <Send size={14} />
                      <span>Send 1-Tap WhatsApp Reminder (with UPI QR)</span>
                    </button>
                  </div>

                  {/* Attendance & Ledger Quick Row */}
                  <div className="grid grid-cols-2 gap-2 text-left">
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                      <div className="text-[10px] font-medium text-stone-500">Offline Attendance</div>
                      <div className="text-xs font-bold text-stone-800 dark:text-stone-200 mt-0.5 flex items-center gap-1">
                        <WifiOff size={13} className="text-amber-600" />
                        <span>34 / 36 Present (2G)</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700">
                      <div className="text-[10px] font-medium text-stone-500">Net Fee Retained</div>
                      <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                        ₹48,000 (100% Retained)
                      </div>
                    </div>
                  </div>

                  {/* AI Copilot Speech Bubble Card */}
                  <div className="p-3 rounded-xl bg-[#FAF7F2] dark:bg-stone-800/90 border border-[#E7E0D6] dark:border-stone-700 flex items-start gap-2.5 text-left">
                    <div className="w-7 h-7 rounded-lg bg-[#8B261E] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <Sparkles size={14} className="text-amber-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-black uppercase text-[#8B261E] dark:text-rose-400">
                          AI Institute Copilot
                        </span>
                        <button
                          type="button"
                          onClick={onOpenAi}
                          className="text-[10px] font-bold text-[#8B261E] dark:text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                        >
                          <span>Chat</span>
                          <ArrowRight size={10} />
                        </button>
                      </div>
                      <p className="text-[11px] text-stone-700 dark:text-stone-300 mt-0.5 leading-snug">
                        "Rahul Sharma ki ₹1,500 fee 4 din overdue hai. 1-tap WhatsApp reminder with dynamic UPI QR ready hai!"
                      </p>
                    </div>
                  </div>

                  {/* Center Tour Button */}
                  <div className="pt-1 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setShowProductTour(true)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-[#8B261E] dark:text-rose-400 hover:underline cursor-pointer py-1"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#8B261E] text-white flex items-center justify-center animate-pulse-glow shadow-xs">
                        <Play size={10} className="ml-0.5 fill-current" />
                      </div>
                      <span>Watch 60s Product Tour</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* TRUST & TICKER BAR */}
      <section className="py-6 border-y border-[#E7E0D6] dark:border-stone-800 bg-[#F5EFE6]/60 dark:bg-stone-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 text-center mb-4">
            Trusted by 2,500+ Tuitions, Coaching Institutes & Private Schools across Bharat
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs font-bold text-stone-700 dark:text-stone-300">
            <span className="px-3 py-1.5 rounded-lg bg-white/80 dark:bg-stone-800 border border-[#E7E0D6] dark:border-stone-700">
              Kota Coaching Hub
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white/80 dark:bg-stone-800 border border-[#E7E0D6] dark:border-stone-700">
              Patna Science Centers
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white/80 dark:bg-stone-800 border border-[#E7E0D6] dark:border-stone-700">
              Delhi NCR Academies
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white/80 dark:bg-stone-800 border border-[#E7E0D6] dark:border-stone-700">
              Jaipur Commerce Classes
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white/80 dark:bg-stone-800 border border-[#E7E0D6] dark:border-stone-700">
              Lucknow Board Tutors
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-white/80 dark:bg-stone-800 border border-[#E7E0D6] dark:border-stone-700">
              Hyderabad Foundation Batches
            </span>
          </div>
        </div>
      </section>

      {/* 6-CARD CORE MODULES GRID - Inspired by Screenshot 2 ("Pick a subject, start in seconds") */}
      <section id="fee-engine" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Section Heading in Editorial Serif */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12">
          <div>
            <span className="text-xs font-black uppercase text-[#8B261E] dark:text-rose-400 tracking-wider">
              Core Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1C1917] dark:text-stone-100 tracking-tight mt-1">
              Pick a module, start in seconds
            </h2>
          </div>
          <button
            type="button"
            onClick={() => handleQuickDemo('ADMIN')}
            className="mt-4 sm:mt-0 text-sm font-bold text-[#8B261E] dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Explore all modules in Live Demo</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* 6 Cards Grid (3 columns on desktop, 2 on tablet, 1 on mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreModules.map((mod) => (
            <div
              key={mod.id}
              onClick={() => setActiveModuleModal(mod)}
              className="group rounded-2xl overflow-hidden bg-white dark:bg-stone-900 border border-[#E7E0D6] dark:border-stone-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer flex flex-col text-left"
            >
              {/* Card Image Banner */}
              <div className="relative h-44 overflow-hidden bg-stone-200 dark:bg-stone-800">
                <img
                  src={mod.thumbnail}
                  alt={mod.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Badge at top left */}
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/90 dark:bg-stone-900/90 text-stone-900 dark:text-stone-100 backdrop-blur-xs">
                    {mod.category}
                  </span>
                </div>

                {/* Highlight Badge at top right */}
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#8B261E] text-white">
                    {mod.badge}
                  </span>
                </div>

                {/* Subtitle at bottom of image */}
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="text-[11px] font-semibold text-stone-300">
                    {mod.moduleType}
                  </div>
                  <div className="text-base font-bold text-white leading-tight">
                    {mod.title}
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
                    {mod.tagline}
                  </p>
                </div>

                {/* Metric Footer */}
                <div className="pt-4 border-t border-[#E7E0D6] dark:border-stone-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#8B261E] dark:text-rose-400">
                      {mod.metric}
                    </div>
                    <div className="text-[10px] text-stone-500 dark:text-stone-400">
                      {mod.metricSub}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#FAF7F2] dark:bg-stone-800 border border-[#E7E0D6] dark:border-stone-700 flex items-center justify-center text-stone-700 dark:text-stone-300 group-hover:bg-[#8B261E] group-hover:text-white transition-colors">
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* INTERACTIVE DIRECT UPI SAVINGS CALCULATOR */}
      <section id="roi-calculator" className="py-16 bg-[#F5EFE6]/70 dark:bg-stone-900/60 border-y border-[#E7E0D6] dark:border-stone-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-black uppercase text-[#8B261E] dark:text-rose-400 tracking-wider">
              Transparency & Direct Bank ROI
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1C1917] dark:text-stone-100 tracking-tight mt-1">
              How much are you losing on payment gateways?
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-300 max-w-xl mx-auto mt-2">
              Razorpay, Stripe, and traditional ERPs deduct 2% to 2.5% + 18% GST. With EduManage Bharat’s direct UPI QR engine, you keep 100% of every rupee.
            </p>
          </div>

          <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-[#E7E0D6] dark:border-stone-700 shadow-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              
              {/* Sliders */}
              <div className="space-y-6 text-left">
                <div>
                  <div className="flex justify-between text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                    <span>Number of Students</span>
                    <span className="text-[#8B261E] dark:text-rose-400 font-mono text-sm">{calcStudents} Students</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="1000"
                    step="10"
                    value={calcStudents}
                    onChange={(e) => setCalcStudents(Number(e.target.value))}
                    className="w-full accent-[#8B261E] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                    <span>20 stds</span>
                    <span>500 stds</span>
                    <span>1,000 stds</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
                    <span>Average Monthly Fee per Student</span>
                    <span className="text-[#8B261E] dark:text-rose-400 font-mono text-sm">₹{calcMonthlyFee.toLocaleString('en-IN')}/mo</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="8000"
                    step="100"
                    value={calcMonthlyFee}
                    onChange={(e) => setCalcMonthlyFee(Number(e.target.value))}
                    className="w-full accent-[#8B261E] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-stone-400 mt-1">
                    <span>₹500</span>
                    <span>₹4,000</span>
                    <span>₹8,000</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 border border-[#E7E0D6] dark:border-stone-700 text-xs text-stone-600 dark:text-stone-300">
                  <div className="font-bold text-stone-900 dark:text-stone-100 mb-0.5">Annual Tuition Fee Volume:</div>
                  <div className="font-mono text-base font-bold text-stone-800 dark:text-stone-200">
                    ₹{annualPool.toLocaleString('en-IN')} / year
                  </div>
                </div>
              </div>

              {/* Savings Calculation Card */}
              <div className="bg-[#FAF7F2] dark:bg-stone-800/80 p-6 rounded-xl border-2 border-[#8B261E]/30 dark:border-rose-900/50 text-center flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    Traditional Payment Gateway Cut (2.36%)
                  </span>
                  <div className="text-2xl font-serif font-bold text-rose-700 dark:text-rose-400 line-through mt-1">
                    -₹{pgLoss.toLocaleString('en-IN')} / year
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Money deducted by payment gateways that you never get back.
                  </p>
                </div>

                <div className="my-5 pt-5 border-t border-[#E7E0D6] dark:border-stone-700">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Your Savings with EduManage Bharat
                  </span>
                  <div className="text-3xl sm:text-4xl font-serif font-bold text-emerald-700 dark:text-emerald-400 mt-1">
                    ₹{edumanageSavings.toLocaleString('en-IN')}
                  </div>
                  <p className="text-xs font-bold text-stone-700 dark:text-stone-300 mt-1">
                    Saved directly in your bank account every year!
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickDemo('ADMIN')}
                  className="w-full py-3 rounded-xl bg-[#8B261E] hover:bg-[#721C16] text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Claim Your Free Account</span>
                  <ArrowRight size={14} />
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* TAILORED AUDIENCE SECTION */}
      <section className="py-16 sm:py-24 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-black uppercase text-[#8B261E] dark:text-rose-400 tracking-wider">
            Tailored For You
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1C1917] dark:text-stone-100 tracking-tight mt-1">
            Built for Bharat's Education Leaders
          </h2>
        </div>

        {/* Audience Selector Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex p-1.5 rounded-xl bg-[#F0EAE1] dark:bg-stone-800 border border-[#E7E0D6] dark:border-stone-700">
            <button
              type="button"
              onClick={() => setActiveAudienceTab('coaching')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeAudienceTab === 'coaching'
                  ? 'bg-[#8B261E] text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              Coaching Centers
            </button>
            <button
              type="button"
              onClick={() => setActiveAudienceTab('tutors')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeAudienceTab === 'tutors'
                  ? 'bg-[#8B261E] text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              Private Tutors
            </button>
            <button
              type="button"
              onClick={() => setActiveAudienceTab('schools')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeAudienceTab === 'schools'
                  ? 'bg-[#8B261E] text-white shadow-xs'
                  : 'text-stone-600 dark:text-stone-300 hover:text-stone-900'
              }`}
            >
              K-12 Private Schools
            </button>
          </div>
        </div>

        {/* Selected Audience Card */}
        <div className="bg-white dark:bg-stone-900 rounded-2xl p-6 sm:p-8 border border-[#E7E0D6] dark:border-stone-700 shadow-sm text-left">
          <div className="max-w-2xl">
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-stone-100">
              {audienceData[activeAudienceTab].title}
            </h3>
            <p className="text-sm text-stone-600 dark:text-stone-300 mt-1 mb-6">
              {audienceData[activeAudienceTab].subtitle}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {audienceData[activeAudienceTab].points.map((pt, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Check size={12} />
                  </div>
                  <span className="text-xs text-stone-700 dark:text-stone-200 font-medium">
                    {pt}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-[#E7E0D6] dark:border-stone-800">
              <button
                type="button"
                onClick={() => handleQuickDemo('ADMIN')}
                className="px-5 py-2.5 rounded-xl bg-[#8B261E] hover:bg-[#721C16] text-white text-xs font-bold inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <span>Try Demo for {audienceData[activeAudienceTab].title.replace('For ', '')}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* FAQ ACCORDION SECTION */}
      <section className="py-16 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="text-xs font-black uppercase text-[#8B261E] dark:text-rose-400 tracking-wider">
            Common Questions
          </span>
          <h2 className="text-3xl font-serif font-bold text-[#1C1917] dark:text-stone-100 tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3 text-left">
          {faqItems.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-[#E7E0D6] dark:border-stone-800 bg-white dark:bg-stone-900 overflow-hidden"
            >
              <button
                type="button"
                onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                className="w-full px-5 py-4 text-left font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center justify-between gap-4 cursor-pointer"
              >
                <span>{item.q}</span>
                {expandedFaq === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {expandedFaq === idx && (
                <div className="px-5 pb-4 text-xs text-stone-600 dark:text-stone-300 leading-relaxed border-t border-[#FAF7F2] dark:border-stone-800/50 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-[#E7E0D6] dark:border-stone-800 bg-[#FAF7F2] dark:bg-[#121212] transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#8B261E] text-white flex items-center justify-center font-bold">
              <GraduationCap size={18} />
            </div>
            <div>
              <div className="text-sm font-serif font-bold text-stone-900 dark:text-stone-100">
                EduManage Bharat
              </div>
              <div className="text-[11px] text-stone-500">
                0% Gateway Fee · 1-Tap WhatsApp Dues · 2G Offline Attendance
              </div>
            </div>
          </div>

          <div className="text-xs text-stone-500 dark:text-stone-400 text-center sm:text-right">
            <div>Made with ❤️ for Bharat's Education Leaders.</div>
            <div className="mt-1 text-[11px]">
              Bank-grade security · Zero commission · 100% data ownership
            </div>
          </div>
        </div>
      </footer>

      {/* FLOATING CRIMSON "✦ ASK AI COPILOT" BUTTON (matching bottom-right "Ask Sarthi" in screenshots 1 & 2) */}
      <button
        type="button"
        onClick={onOpenAi}
        className="fixed bottom-6 right-6 z-40 bg-[#8B261E] hover:bg-[#721C16] text-white font-bold text-xs py-3 px-5 rounded-full shadow-2xl flex items-center gap-2 border border-white/20 active:scale-95 transition-all cursor-pointer ring-4 ring-[#8B261E]/20"
        title="Open Gemini AI Copilot"
      >
        <Sparkles size={16} className="text-amber-300 animate-spin" />
        <span>✦ Ask AI Copilot</span>
      </button>

      {/* MODULE DETAIL INTERACTIVE MODAL */}
      {activeModuleModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full overflow-hidden border border-[#E7E0D6] dark:border-stone-700 shadow-2xl text-left">
            <div className="relative h-40 overflow-hidden bg-stone-200 dark:bg-stone-800">
              <img
                src={activeModuleModal.thumbnail}
                alt={activeModuleModal.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />
              <button
                type="button"
                onClick={() => setActiveModuleModal(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
              <div className="absolute bottom-3 left-4 right-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-[#8B261E] text-white">
                  {activeModuleModal.category}
                </span>
                <h3 className="text-lg font-serif font-bold text-white mt-1">
                  {activeModuleModal.title}
                </h3>
              </div>
            </div>

            <div className="p-6">
              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed mb-4">
                {activeModuleModal.overview}
              </p>

              <div className="text-xs font-bold text-stone-900 dark:text-stone-100 mb-2">
                Key Highlights:
              </div>
              <div className="space-y-2 mb-6">
                {activeModuleModal.highlights.map((h, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-stone-700 dark:text-stone-300">
                    <CheckCircle2 size={14} className="text-emerald-600 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModuleModal(null);
                    handleQuickDemo('ADMIN');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-[#8B261E] hover:bg-[#721C16] text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Try in Live Admin Demo</span>
                  <ArrowRight size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveModuleModal(null)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT TOUR MODAL */}
      {showProductTour && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-xl w-full p-6 border border-[#E7E0D6] dark:border-stone-700 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E0D6] dark:border-stone-800 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#8B261E] text-white flex items-center justify-center font-bold">
                  <Play size={14} className="ml-0.5 fill-current" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                    EduManage Bharat: 60-Second Walkthrough
                  </h3>
                  <p className="text-[11px] text-stone-500">
                    How coaching centers recover fees 3x faster with 0% gateway deductions
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowProductTour(false)}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 my-6">
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 border border-[#E7E0D6] dark:border-stone-700 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#8B261E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  1
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    Direct UPI QR Setup (0% Commission)
                  </div>
                  <div className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">
                    Enter your UPI ID (Google Pay / PhonePe / BHIM). All fee collections land straight in your bank account with ₹0 deductions.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 border border-[#E7E0D6] dark:border-stone-700 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#8B261E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  2
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    1-Tap WhatsApp Dues Recovery
                  </div>
                  <div className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">
                    Click "Send Reminder". EduManage opens WhatsApp with prefilled polite Hindi/English text and dynamic payment link.
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 border border-[#E7E0D6] dark:border-stone-700 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#8B261E] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  3
                </div>
                <div>
                  <div className="text-xs font-bold text-stone-900 dark:text-stone-100">
                    3-Sec Offline Attendance Register
                  </div>
                  <div className="text-[11px] text-stone-600 dark:text-stone-300 mt-0.5">
                    Mark whole classes even with zero internet connectivity. Data auto-synchronizes as soon as network returns.
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowProductTour(false);
                handleQuickDemo('ADMIN');
              }}
              className="w-full py-3 rounded-xl bg-[#8B261E] hover:bg-[#721C16] text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
            >
              <span>Explore Everything in Live Admin Demo</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* ROI SAVINGS DETAIL MODAL */}
      {showRoiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full p-6 border border-[#E7E0D6] dark:border-stone-700 shadow-2xl text-left">
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E0D6] dark:border-stone-800 mb-4">
              <div className="flex items-center gap-2">
                <Calculator size={18} className="text-[#8B261E]" />
                <h3 className="text-base font-serif font-bold text-stone-900 dark:text-stone-100">
                  Direct Bank UPI vs Payment Gateway
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRoiModal(false)}
                className="text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs text-stone-600 dark:text-stone-300">
              <p>
                Standard payment gateways charge <strong>2.00% + 18% GST (effectively 2.36%)</strong> on every transaction.
              </p>
              
              <div className="p-4 rounded-xl bg-[#FAF7F2] dark:bg-stone-800 border border-[#E7E0D6] dark:border-stone-700 font-mono space-y-1.5">
                <div className="flex justify-between">
                  <span>Students:</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">{calcStudents}</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg Fee:</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">₹{calcMonthlyFee}/mo</span>
                </div>
                <div className="flex justify-between border-t border-stone-200 dark:border-stone-700 pt-1.5">
                  <span>Annual Collection:</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100">₹{annualPool.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-rose-600 dark:text-rose-400">
                  <span>Gateway Cut (2.36%):</span>
                  <span className="font-bold">-₹{pgLoss.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 border-t border-stone-200 dark:border-stone-700 pt-1.5 text-sm">
                  <span>EduManage Keeps:</span>
                  <span className="font-bold">100% (₹{annualPool.toLocaleString('en-IN')})</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
                ✦ You save <strong>₹{edumanageSavings.toLocaleString('en-IN')} every year</strong> by switching to direct UPI collection.
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowRoiModal(false);
                handleQuickDemo('ADMIN');
              }}
              className="mt-6 w-full py-2.5 rounded-xl bg-[#8B261E] hover:bg-[#721C16] text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Get Started & Save Fees Now</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
