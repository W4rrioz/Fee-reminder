import React, { useState } from 'react';
import {
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  LogIn,
  Check,
  X,
  Building2,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  IndianRupee,
  Star,
  Laptop,
  CheckSquare,
  Play,
  Film,
  Video
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { VersionBadge } from '../components/VersionBadge';

export const WelcomeLandingScreen = () => {
  const { setAuthView } = useApp();

  // 1. Savings Calculator State
  const [studentCount, setStudentCount] = useState(150);
  const [monthlyFee, setMonthlyFee] = useState(1200);

  // Math for savings:
  // Traditional PG takes ~2.2% + 18% GST on PG charge (~2.5% effective)
  const annualFeeCollection = studentCount * monthlyFee * 12;
  const traditionalGatewayCost = Math.round(annualFeeCollection * 0.0236);
  // Manual reconciliation takes ~ 20 min per 10 students / month = 2 min/student/mo
  const staffHoursSaved = Math.round((studentCount * 2 * 12) / 60);

  // 2. Multi-tenant Mode Selector State
  const [tenantMode, setTenantMode] = useState('coaching'); // 'schools' | 'coaching' | 'tutors'

  // 3. FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(0);

  // 4. WhatsApp mock interactive state
  const [whatsappStudent, setWhatsappStudent] = useState({
    name: 'Aarav Sharma',
    batch: 'Class 10 - Batch A',
    month: 'October 2026',
    amount: 1500,
    parent: 'Mr. Rajesh Sharma'
  });
  const [copiedLink, setCopiedLink] = useState(false);

  // 4b. Launch Videos State (Rendered with Remotion)
  const [selectedVideo, setSelectedVideo] = useState('overview');
  const launchVideos = {
    overview: {
      id: 'overview',
      title: 'English Product Tour',
      tag: 'Full 36s Feature Walkthrough',
      language: 'English',
      src: '/videos/edumanage_english_overview.mp4',
      poster: '/videos/test_still.png',
      desc: 'Complete walkthrough: 0% direct UPI fees, 1-tap WhatsApp reminders, and 2G offline attendance tolerance.',
      highlights: ['0% Gateway Commission', '1-Tap WhatsApp Reminders', '3-Sec Offline Attendance']
    },
    promo: {
      id: 'promo',
      title: 'English High-Energy Reel',
      tag: '21s Kinetic Promo',
      language: 'English',
      src: '/videos/edumanage_english_promo.mp4',
      poster: '/videos/preview_english_promo.png',
      desc: 'Fast-paced kinetic typography and stat popups built for social media and quick pitch decks.',
      highlights: ['High Impact Typography', 'Instant UPI QR Code', 'Built for ₹8,000 Phones']
    },
    hinglish: {
      id: 'hinglish',
      title: 'Hinglish Coaching Pitch',
      tag: '35s Relatable Indian Launch',
      language: 'Hinglish (हिन्दी + English)',
      src: '/videos/edumanage_hinglish_launch.mp4',
      poster: '/videos/preview_hinglish_launch.png',
      desc: 'Desi coaching owners ke liye: "Register aur Excel sheet ki jhanjhat ko bolo bye-bye! Direct UPI fees seedhe aapke account mein."',
      highlights: ['100% Desi Relatable', 'Direct Bank Settlement', 'No GST Required']
    }
  };

  // 5. Attendance mock toggle state
  const [attendanceList, setAttendanceList] = useState([
    { id: 1, name: 'Priya Verma', roll: '101', status: 'present' },
    { id: 2, name: 'Aditya Gupta', roll: '102', status: 'present' },
    { id: 3, name: 'Rohit Kumar', roll: '103', status: 'absent' },
    { id: 4, name: 'Ananya Mishra', roll: '104', status: 'present' },
    { id: 5, name: 'Siddharth Sen', roll: '105', status: 'present' },
  ]);

  const toggleAttendance = (id) => {
    setAttendanceList(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, status: item.status === 'present' ? 'absent' : 'present' }
          : item
      )
    );
  };

  const markAllPresent = () => {
    setAttendanceList(prev => prev.map(item => ({ ...item, status: 'present' })));
  };

  const handleCopyLink = () => {
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const faqs = [
    {
      q: 'Do I need a GST number or a registered business bank account?',
      a: 'No! EduManage generates direct peer-to-peer or merchant UPI links (GPay, PhonePe, Paytm, BHIM) that deposit directly into your existing personal or current bank account. No GST certificate or payment gateway registration required.'
    },
    {
      q: 'Is it truly 0% commission on fee collections?',
      a: 'Yes, 100% zero commission. Standard payment gateways like Razorpay, Cashfree, or Easebuzz take 2% to 3% plus GST on every transaction and delay payout settlements by 2-3 days. EduManage routes parents directly to UPI, meaning instant 0-second settlement directly to your bank account with ₹0 gateway fee cut.'
    },
    {
      q: 'Does it work when internet connectivity is spotty or offline?',
      a: 'Yes! EduManage is engineered as a lightweight Progressive Web App (PWA) with local offline queues. Teachers can take roll calls in basement classrooms without internet. The moment the device reconnects to Wi-Fi or 4G, records automatically sync safely to Supabase cloud.'
    },
    {
      q: 'Can I import my existing students and batches from Excel / CSV?',
      a: 'Absolutely. We provide a 1-click Excel/CSV import template. You can upload 1,000+ students with phone numbers, roll numbers, and pending dues in under 60 seconds.'
    },
    {
      q: 'How does WhatsApp fee collection work without paying WhatsApp Cloud API fees?',
      a: 'EduManage creates deep-linked WhatsApp intents with pre-filled professional fee notices and your institute UPI payment URI (`upi://pay`). One tap opens your device\'s WhatsApp, directly addressing the parent without charging you per-message WhatsApp Business template fees.'
    }
  ];

  const tenantDetails = {
    schools: {
      title: 'K-12 Schools & Academies',
      tag: 'Academic Year & Section Management',
      features: [
        'Structured Classes, Divisions & Academic Terms (Quarterly / Annual)',
        'Custom Fee Heads: Tuition, Transport, Lab & Exam Fees',
        'Official Digital Fee Receipts with School Seal & Serial Numbers',
        'Staff multi-role access (Principal, Teachers, Accountant)'
      ],
      mockHeader: 'St. Xavier Public School — Class 8-B',
      mockMetric: '420 Students Active'
    },
    coaching: {
      title: 'Coaching & Test-Prep Centers',
      tag: 'Batch-wise Instalments & Defaulter Recovery',
      features: [
        'Dynamic Batches (JEE Morning, NEET Droppers, Foundation)',
        'Monthly instalment schedules with overdue auto-flagging',
        '1-Click WhatsApp defaulter broadcast with custom UPI QR',
        'Daily roll call with instant absent notifications to guardians'
      ],
      mockHeader: 'Apex Science Institute — Target JEE 2027',
      mockMetric: '18 Batches • ₹3.4L Monthly Dues'
    },
    tutors: {
      title: 'Independent Tutors & Group Classes',
      tag: 'Zero Hassle, Direct 1-on-1 & Micro-Batching',
      features: [
        'Simple roster without bureaucratic overhead',
        'Hourly / per-subject monthly billing setup',
        'Instant payment acknowledgement SMS/WhatsApp messages',
        'Works blazingly fast even on entry-level Android devices'
      ],
      mockHeader: 'Verma Physics Academy — Batch 12-Evening',
      mockMetric: '45 Students • Direct Bank UPI'
    }
  };

  return (
    <div className="w-full bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* =========================================================
          1. STICKY TOP NAVBAR
      ========================================================= */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & Bharat Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <GraduationCap size={22} className="stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-slate-900 tracking-tight">
                EduManage
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Bharat
              </span>
              <VersionBadge />
            </div>
          </div>

          {/* Nav links (Desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="#launch-videos" className="text-blue-600 font-bold hover:text-blue-700 transition-colors flex items-center gap-1.5">
              <Play size={12} className="fill-blue-600 text-blue-600" />
              <span>Launch Videos</span>
            </a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#fee-recovery" className="hover:text-blue-600 transition-colors">Fee Recovery</a>
            <a href="#attendance" className="hover:text-blue-600 transition-colors">Attendance</a>
            <a href="#calculator" className="hover:text-blue-600 transition-colors">Savings</a>
            <a href="#modes" className="hover:text-blue-600 transition-colors">Institutes</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">FAQ</a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAuthView('login')}
              className="text-xs sm:text-sm font-bold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5"
            >
              <LogIn size={16} />
              <span>Sign In</span>
            </button>

            <button
              type="button"
              onClick={() => setAuthView('register')}
              className="text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <span>Get Started Free</span>
              <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================
          2. HERO SECTION
      ========================================================= */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            {/* Tier-2/3 Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold shadow-2xs">
              <Sparkles size={14} className="text-blue-600" />
              <span>Built for Schools, Coaching Institutes & Tutors across Tier-2/3 India</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              The Operating System for Modern Indian Institutes —{' '}
              <span className="text-blue-600">Zero Gateway Cuts.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Automate fee recovery via direct UPI WhatsApp reminders, take 1-tap bulk attendance, and eliminate Excel headaches. Works offline even on ₹8,000 budget smartphones.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setAuthView('register')}
                className="w-full sm:w-auto min-h-[50px] px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-base font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Get Started Free</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                onClick={() => setAuthView('login')}
                className="w-full sm:w-auto min-h-[50px] px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-base font-bold transition-all flex items-center justify-center gap-2 border border-slate-200"
              >
                <span>Explore Live Demo</span>
                <Laptop size={18} className="text-slate-600" />
              </button>

              <a
                href="#launch-videos"
                className="w-full sm:w-auto min-h-[50px] px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-base font-bold transition-all flex items-center justify-center gap-2 border border-slate-700 shadow-sm"
              >
                <Play size={16} className="text-emerald-400 fill-emerald-400" />
                <span>Watch Launch Videos (3)</span>
              </a>
            </div>

            {/* Trust line */}
            <div className="pt-2 flex items-center justify-center gap-2 text-xs font-semibold text-slate-500">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>No credit card required • 100% Free setup in 2 minutes</span>
            </div>
          </div>

          {/* Social Proof & Key Metrics Strip */}
          <div className="mt-14 pt-10 border-t border-slate-100">
            <p className="text-center text-xs uppercase tracking-wider font-bold text-slate-500 mb-6">
              Trusted by 500+ Institutes in Kanpur, Lucknow, Patna, Kota, Jaipur & Indore
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black text-slate-900">₹1.2 Cr+</div>
                <div className="text-xs font-bold text-slate-600 mt-1">Direct Fees Recovered</div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black text-emerald-600">0%</div>
                <div className="text-xs font-bold text-slate-600 mt-1">Platform Commission</div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black text-slate-900">98.4%</div>
                <div className="text-xs font-bold text-slate-600 mt-1">On-time Attendance</div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-center">
                <div className="text-2xl sm:text-3xl font-black text-blue-600">1-Tap</div>
                <div className="text-xs font-bold text-slate-600 mt-1">WhatsApp Fee Reminders</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          2.5 OFFICIAL LAUNCH VIDEOS SHOWCASE (REMOTION ENGINE)
      ========================================================= */}
      <section id="launch-videos" className="py-16 md:py-24 bg-slate-900 text-white relative overflow-hidden border-b border-slate-800">
        {/* Glow ambient background */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold">
              <Film size={14} className="text-blue-400" />
              <span>Programmatically Rendered via Remotion</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
              Watch The Official Launch Videos
            </h2>
            <p className="text-sm sm:text-base text-slate-300">
              See how EduManage automates direct UPI fee collection, 1-tap WhatsApp reminders, and offline roll calls in action.
            </p>
          </div>

          {/* Video Selector Tabs */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
            {Object.values(launchVideos).map((vid) => {
              const active = selectedVideo === vid.id;
              return (
                <button
                  key={vid.id}
                  type="button"
                  onClick={() => setSelectedVideo(vid.id)}
                  className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 border ${
                    active
                      ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/30'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/80 hover:text-white'
                  }`}
                >
                  <Play size={14} className={active ? 'fill-white text-white' : 'text-slate-400'} />
                  <span>{vid.title}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    active ? 'bg-blue-700/90 text-blue-100' : 'bg-slate-700 text-slate-300'
                  }`}>
                    {vid.tag}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Video Player Card */}
          <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-4 sm:p-6 shadow-2xl backdrop-blur-sm">
            <div className="relative rounded-xl overflow-hidden bg-black shadow-inner">
              <video
                key={launchVideos[selectedVideo].src}
                controls
                playsInline
                poster={launchVideos[selectedVideo].poster}
                className="w-full aspect-video rounded-xl object-contain max-h-[520px]"
              >
                <source src={launchVideos[selectedVideo].src} type="video/mp4" />
                Your browser does not support HTML5 video playback.
              </video>
            </div>

            {/* Video Metadata & Feature Badges */}
            <div className="mt-6 pt-5 border-t border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-bold text-white">
                    {launchVideos[selectedVideo].title}
                  </h3>
                  <span className="text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {launchVideos[selectedVideo].language}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                  {launchVideos[selectedVideo].desc}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {launchVideos[selectedVideo].highlights.map((h, i) => (
                    <span key={i} className="text-[11px] font-semibold text-slate-300 bg-slate-700/60 px-2.5 py-1 rounded-md border border-slate-600/50">
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>

              {/* Direct Download Link */}
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={launchVideos[selectedVideo].src}
                  download
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-colors border border-slate-600 flex items-center gap-1.5"
                >
                  <span>Download MP4</span>
                </a>
                <button
                  type="button"
                  onClick={() => setAuthView('register')}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <span>Start Free Setup</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          3. INTERACTIVE FEE RECOVERY & UPI SHOWCASE
      ========================================================= */}
      <section id="fee-recovery" className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100/70 px-3 py-1 rounded-full border border-emerald-300">
              Direct UPI Payments
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              Say Goodbye to Gateway Cuts & Bank Delays
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Parents pay directly from GPay, PhonePe, or Paytm straight into your institute's bank account. You keep every single rupee.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Interactive WhatsApp Mockup */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-emerald-700 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-sm">
                    EM
                  </div>
                  <div>
                    <div className="font-bold text-sm leading-tight">EduManage Fee Notification</div>
                    <div className="text-[10px] text-emerald-200">Verified WhatsApp Notice</div>
                  </div>
                </div>
                <div className="text-[11px] bg-emerald-800 px-2.5 py-1 rounded-full font-medium">
                  Live Preview
                </div>
              </div>

              {/* Chat Bubble Body */}
              <div className="p-4 sm:p-5 bg-[#efeae2] min-h-[380px] flex flex-col justify-between">
                <div className="max-w-[92%] bg-white rounded-xl rounded-tl-xs p-3.5 shadow-sm text-xs sm:text-sm text-slate-800 space-y-2.5 border border-slate-200">
                  <p className="font-semibold text-slate-900">
                    Respected Parent ({whatsappStudent.parent}),
                  </p>
                  <p className="text-slate-700 text-xs leading-relaxed">
                    This is a gentle fee reminder from <strong>Gyan Ganga Academy</strong> for your ward <strong>{whatsappStudent.name}</strong> ({whatsappStudent.batch}).
                  </p>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Invoice Month:</span>
                      <span className="font-bold text-slate-800">{whatsappStudent.month}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pending Amount:</span>
                      <span className="font-extrabold text-emerald-600">₹{whatsappStudent.amount.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Due Date:</span>
                      <span className="font-medium text-slate-700">10th October 2026</span>
                    </div>
                  </div>

                  <p className="text-slate-600 text-xs leading-normal">
                    Please pay directly using UPI (PhonePe, GPay, Paytm) by clicking the secure instant link below:
                  </p>

                  {/* WhatsApp Action Button Mock */}
                  <div className="pt-1 space-y-2">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <IndianRupee size={15} />
                      <span>{copiedLink ? 'UPI Link Copied!' : `Pay ₹${whatsappStudent.amount} via Direct UPI`}</span>
                    </button>

                    <div className="text-[10px] text-center text-slate-400">
                      upi://pay?pa=gyanganga@upi&pn=GyanGanga&am={whatsappStudent.amount}
                    </div>
                  </div>
                </div>

                {/* Interactive Controls inside Card */}
                <div className="mt-4 pt-3 border-t border-slate-300 flex items-center justify-between text-xs text-slate-600">
                  <span>Simulate different student:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setWhatsappStudent({
                        name: 'Aarav Sharma',
                        batch: 'Class 10 - Batch A',
                        month: 'October 2026',
                        amount: 1500,
                        parent: 'Mr. Rajesh Sharma'
                      })}
                      className="px-2 py-1 rounded bg-white text-slate-700 border border-slate-300 font-medium hover:bg-slate-50 text-[11px]"
                    >
                      Aarav (₹1,500)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWhatsappStudent({
                        name: 'Rohan Gupta',
                        batch: 'Target JEE Dropper',
                        month: 'Instalment #2',
                        amount: 4500,
                        parent: 'Mrs. Sunita Gupta'
                      })}
                      className="px-2 py-1 rounded bg-white text-slate-700 border border-slate-300 font-medium hover:bg-slate-50 text-[11px]"
                    >
                      Rohan (₹4,500)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparison Table */}
            <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
              <h3 className="text-xl font-black text-slate-900">
                Direct UPI vs Traditional Payment Gateways
              </h3>
              <p className="text-sm text-slate-600">
                Payment gateways like Razorpay, Easebuzz, or Cashfree were built for e-commerce, not Indian coaching institutes. Here is how EduManage protects your revenue:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                      <th className="py-2.5">Feature</th>
                      <th className="py-2.5 text-slate-500">Other Gateways</th>
                      <th className="py-2.5 text-blue-700 font-extrabold">EduManage UPI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    <tr>
                      <td className="py-3 font-semibold text-slate-900">Transaction Fee</td>
                      <td className="py-3 text-red-600 font-bold">2.0% - 3.0% + GST</td>
                      <td className="py-3 text-emerald-600 font-black">0% (Zero Fee)</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-900">Settlement Time</td>
                      <td className="py-3 text-amber-700">T + 2 to 3 Days</td>
                      <td className="py-3 text-emerald-600 font-black">Instant (0 Seconds)</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-900">Bank Account</td>
                      <td className="py-3 text-slate-600">Merchant Account Req.</td>
                      <td className="py-3 text-blue-700 font-bold">Any Savings or Current</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-900">Payment Medium</td>
                      <td className="py-3 text-slate-600">External checkout webview</td>
                      <td className="py-3 text-blue-700 font-bold">Direct GPay / PhonePe / Paytm</td>
                    </tr>
                    <tr>
                      <td className="py-3 font-semibold text-slate-900">Documentation Required</td>
                      <td className="py-3 text-slate-600">GST, Company PAN, audited books</td>
                      <td className="py-3 text-emerald-600 font-black">None — Enter your UPI ID</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3 text-xs text-emerald-800">
                <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  For an institute collecting ₹10 Lakhs/month, traditional gateways pocket <strong>₹24,000+ each month</strong>. With EduManage, that money stays with you.
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          4. ATTENDANCE SYSTEM SHOWCASE
      ========================================================= */}
      <section id="attendance" className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full border border-blue-200">
              High-Speed Operations
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              Roll Call Done in 15 Seconds Flat
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Designed around how teachers actually work. "Mark All Present" by default, tap only the few absentees, and trigger automatic parental alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Interactive Attendance Simulator */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
                <div>
                  <div className="font-extrabold text-slate-900 text-sm">
                    Class 10 - Batch A (Physics)
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Today's Attendance Roll • {attendanceList.filter(s => s.status === 'present').length} Present, {attendanceList.filter(s => s.status === 'absent').length} Absent
                  </div>
                </div>

                <button
                  type="button"
                  onClick={markAllPresent}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <CheckSquare size={14} />
                  <span>Mark All Present</span>
                </button>
              </div>

              {/* Student Rows */}
              <div className="mt-4 space-y-2">
                {attendanceList.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => toggleAttendance(student.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      student.status === 'present'
                        ? 'bg-white border-slate-200 hover:border-emerald-300'
                        : 'bg-rose-50 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-700">
                        {student.roll}
                      </span>
                      <div>
                        <div className="font-bold text-sm text-slate-900">{student.name}</div>
                        <div className="text-[11px] text-slate-500">Tap to toggle status</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {student.status === 'present' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                          <Check size={13} className="stroke-[3]" />
                          Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-800">
                          <X size={13} className="stroke-[3]" />
                          Absent (SMS Alert)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
                <span>⚡ Try clicking any student to toggle attendance</span>
                <span className="font-semibold text-slate-700">Auto-saved to local memory</span>
              </div>
            </div>

            {/* Attendance Value Highlights */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  1
                </div>
                <h4 className="font-bold text-sm text-slate-900 pt-1">
                  Offline-First Local Storage Queue
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Basement classrooms and remote areas often lack internet. Attendance records save locally immediately and sync silently once connectivity returns.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  2
                </div>
                <h4 className="font-bold text-sm text-slate-900 pt-1">
                  Automatic Absentee Parent Alerts
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Parents appreciate instant notifications when their child misses a class. Builds trust and eliminates disputes during parent-teacher meetings.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  3
                </div>
                <h4 className="font-bold text-sm text-slate-900 pt-1">
                  Defaulter & Attendance Correlation
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Instantly see if chronic absentees also have pending fee instalments, giving institute directors early warning before dropouts occur.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          5. INTERACTIVE SAVINGS CALCULATOR
      ========================================================= */}
      <section id="calculator" className="py-16 md:py-24 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/30">
              ROI & Cost Savings
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
              Calculate Your Yearly Gateway Savings
            </h2>
            <p className="text-sm sm:text-base text-slate-400">
              See how much money you surrender to traditional payment processors every year.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-10 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Sliders Input Column */}
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Total Enrolled Students
                    </label>
                    <span className="text-base font-black text-blue-400 bg-blue-950/60 border border-blue-500/30 px-3 py-1 rounded-lg">
                      {studentCount} Students
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="1000"
                    step="10"
                    value={studentCount}
                    onChange={(e) => setStudentCount(Number(e.target.value))}
                    className="w-full accent-blue-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
                    <span>20 Students</span>
                    <span>500 Students</span>
                    <span>1,000+ Students</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Average Monthly Fee per Student
                    </label>
                    <span className="text-base font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-lg">
                      ₹{monthlyFee.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="8000"
                    step="100"
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-2 bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-semibold">
                    <span>₹300 / mo</span>
                    <span>₹3,000 / mo</span>
                    <span>₹8,000 / mo</span>
                  </div>
                </div>

                <div className="pt-2 text-xs text-slate-400 border-t border-slate-700">
                  <p>
                    *Based on standard 2% PG fee + 18% GST (2.36% effective rate) charged by traditional payment aggregators.
                  </p>
                </div>
              </div>

              {/* Calculated Outputs Column */}
              <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-700/80 space-y-6 text-center">
                <div className="space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Annual Payment Gateway Cut Saved
                  </div>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-400">
                    ₹{traditionalGatewayCost.toLocaleString('en-IN')}
                  </div>
                  <div className="text-xs text-slate-400">
                    Directly retained in your bank account every year
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Staff & Administration Time Saved
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-blue-400">
                    {staffHoursSaved} Hours / Year
                  </div>
                  <div className="text-xs text-slate-400">
                    No manual register tallying, no Excel reconciliation
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAuthView('register')}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Start Saving Today — Setup Free</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          6. MULTI-TENANT MODE SELECTOR (Schools vs Coaching vs Tutors)
      ========================================================= */}
      <section id="modes" className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full border border-blue-200">
              Adaptive Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              One Platform. Configured for Your Exact Workflow.
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Whether you manage an ICSE/CBSE school with terms, a fast-paced coaching center with batches, or an independent tutoring group, EduManage adapts instantly.
            </p>
          </div>

          {/* 3-Way Mode Tabs */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 max-w-full overflow-x-auto">
              <button
                type="button"
                onClick={() => setTenantMode('coaching')}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                  tenantMode === 'coaching'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap size={16} />
                <span>Coaching Institutes</span>
              </button>

              <button
                type="button"
                onClick={() => setTenantMode('schools')}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                  tenantMode === 'schools'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 size={16} />
                <span>K-12 Schools</span>
              </button>

              <button
                type="button"
                onClick={() => setTenantMode('tutors')}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center gap-2 whitespace-nowrap ${
                  tenantMode === 'tutors'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen size={16} />
                <span>Independent Tutors</span>
              </button>
            </div>
          </div>

          {/* Active Mode Display Card */}
          <div className="max-w-4xl mx-auto bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-4">
                <div className="inline-block px-3 py-1 rounded-md bg-blue-100 text-blue-800 text-xs font-bold">
                  {tenantDetails[tenantMode].tag}
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  {tenantDetails[tenantMode].title}
                </h3>

                <ul className="space-y-3 pt-2">
                  {tenantDetails[tenantMode].features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700">
                      <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="md:col-span-5 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Live Workflow Preset
                  </div>
                  <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                    {tenantDetails[tenantMode].mockHeader}
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Preset Capacity:</span>
                    <span className="font-bold text-slate-800">{tenantDetails[tenantMode].mockMetric}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Offline Sync:</span>
                    <span className="font-bold text-emerald-600">Enabled (PWA)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">WhatsApp Engine:</span>
                    <span className="font-bold text-blue-600">Instant UPI Deep-link</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAuthView('register')}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Select {tenantMode === 'schools' ? 'School' : tenantMode === 'coaching' ? 'Coaching' : 'Tutor'} Mode</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          7. SOCIAL PROOF & TESTIMONIALS
      ========================================================= */}
      <section className="py-16 md:py-24 bg-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full border border-blue-200">
              Verified Feedback
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              Trusted by 500+ Directors Across Bharat
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Real stories from educators who transformed their fee recovery and eliminated Excel registers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  "Earlier, we spent ₹22,000 every month on Razorpay fees, and funds took 3 days to settle. With EduManage, parents tap WhatsApp and pay directly to our SBI current account via UPI. Zero fees, instant settlement."
                </p>
              </div>
              <div className="border-t border-slate-100 pt-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                  SK
                </div>
                <div>
                  <div className="font-extrabold text-xs sm:text-sm text-slate-900">Suresh K. Trivedi</div>
                  <div className="text-[11px] text-slate-500">Director, Kanpur Coaching Association</div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  "Our teachers take roll calls on budget Redmi phones in basement classes where Jio network is weak. The offline sync works flawlessly. Attendance is done in 20 seconds for a 60-student batch."
                </p>
              </div>
              <div className="border-t border-slate-100 pt-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  PA
                </div>
                <div>
                  <div className="font-extrabold text-xs sm:text-sm text-slate-900">Prashant Agrawal</div>
                  <div className="text-[11px] text-slate-500">Founder, Patna Science Academy</div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                  "Fee defaulter recovery used to be an embarrassing manual chore of calling parents repeatedly. With 1-click WhatsApp reminders and pre-filled UPI buttons, 85% of parents pay on the first reminder itself."
                </p>
              </div>
              <div className="border-t border-slate-100 pt-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                  MS
                </div>
                <div>
                  <div className="font-extrabold text-xs sm:text-sm text-slate-900">Meenakshi Sharma</div>
                  <div className="text-[11px] text-slate-500">Principal, Cambridge Kids School, Lucknow</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          8. INTERACTIVE FAQ ACCORDION
      ========================================================= */}
      <section id="faq" className="py-16 md:py-24 bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100/70 px-3 py-1 rounded-full border border-blue-200">
              Frequently Asked Questions
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900">
              Everything You Need to Know
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Clear answers to the most common questions asked by institute directors and accountants.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="border border-slate-200 rounded-2xl overflow-hidden transition-colors bg-white hover:border-slate-300"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? -1 : index)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-blue-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <span className="p-1 rounded-full bg-slate-100 text-slate-500">
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
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
          9. HIGH-IMPACT FINAL CTA & FOOTER
      ========================================================= */}
      <section className="py-16 md:py-20 bg-blue-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/50 border border-blue-400 text-blue-100 text-xs font-bold">
            <Zap size={14} className="text-amber-300" />
            <span>Setup in 2 Minutes • Zero Tech Skills Needed</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Ready to Digitize Your Institute Today?
          </h2>

          <p className="text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            Join over 500+ Indian institutes saving lakhs in gateway fees and hours of administrative overhead every single week.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setAuthView('register')}
              className="w-full sm:w-auto min-h-[52px] px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-blue-700 text-base font-black shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>Get Started Free — Create Institute</span>
              <ArrowRight size={18} />
            </button>

            <button
              type="button"
              onClick={() => setAuthView('login')}
              className="w-full sm:w-auto min-h-[52px] px-7 py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-base font-bold transition-all border border-blue-500 flex items-center justify-center gap-2"
            >
              <span>Existing Member? Sign In</span>
              <LogIn size={18} />
            </button>
          </div>

          <div className="pt-4 flex items-center justify-center gap-4 text-xs font-medium text-blue-100">
            <span className="flex items-center gap-1">
              <CheckCircle2 size={15} /> 0% Commission Forever
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={15} /> Works on Low-Cost Phones
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle2 size={15} /> Instant Bank Settlement
            </span>
          </div>
        </div>
      </section>

      {/* Clean Professional Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
            <div className="space-y-3 md:col-span-1">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <GraduationCap size={18} />
                </div>
                <span className="text-lg font-black text-white">EduManage</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                India's mobile-first institute management software designed specifically for Tier-2 and Tier-3 educational institutions.
              </p>
              <div className="pt-1 flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                <ShieldCheck size={16} />
                <span>Supabase Cloud + Bank-Grade 256-bit Encryption</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#fee-recovery" className="hover:text-white transition-colors">Direct UPI Fees</a></li>
                <li><a href="#attendance" className="hover:text-white transition-colors">1-Tap Attendance</a></li>
                <li><a href="#calculator" className="hover:text-white transition-colors">Savings Calculator</a></li>
                <li><a href="#modes" className="hover:text-white transition-colors">Multi-Tenant Modes</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Audience</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#modes" className="hover:text-white transition-colors">K-12 State Board Schools</a></li>
                <li><a href="#modes" className="hover:text-white transition-colors">CBSE / ICSE Affiliated</a></li>
                <li><a href="#modes" className="hover:text-white transition-colors">Coaching & Test-Prep</a></li>
                <li><a href="#modes" className="hover:text-white transition-colors">Independent Tuition Centers</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">Support & Legal</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#faq" className="hover:text-white transition-colors">Help Center & FAQ</a></li>
                <li><span className="text-slate-500">support@edumanage.in</span></li>
                <li><span className="text-slate-500">Privacy Policy (DPDP Act Compliant)</span></li>
                <li><span className="text-slate-500">Terms of Service</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <div>
              © 2026 EduManage Bharat. Made with pride for Indian Educators. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Zero Commission Guarantee</span>
              <span>•</span>
              <span>Proudly Built for Bharat 🇮🇳</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
