import React, { useState } from 'react';
import {
  Tag,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
  ShieldCheck,
  ChevronRight,
  QrCode,
  PieChart,
  Sliders,
  ExternalLink,
  Info,
  X
} from 'lucide-react';

export const VersionBadge = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const versionDetails = {
    version: 'v2.4 Pro',
    codename: 'Bharat Calendar & Analytics Release',
    buildDate: 'October 2026',
    status: 'Stable Release',
    highlights: [
      {
        title: 'Real-Time Server Calendar & Monthly Rollover',
        desc: 'Syncs automatically with server date/time. Past unpaid dues roll over seamlessly into overdue accounts with distinct multi-month counters.',
        badge: 'NEW',
        badgeColor: 'bg-emerald-100 text-emerald-800'
      },
      {
        title: 'Interactive SVG Pie Charts & Defaulters Analytics',
        desc: 'Interactive slices for Fee Collection Status, Unpaid Months Distribution, Batch-wise Dues, and Attendance Rates with tap tooltips.',
        badge: 'NEW',
        badgeColor: 'bg-blue-100 text-blue-800'
      },
      {
        title: 'Attendance Module Setting (Enable/Disable)',
        desc: 'Toggle attendance on/off in Institute Settings. When disabled, navigation and dashboards automatically adapt to 100% fee-collection focus.',
        badge: 'FEATURE',
        badgeColor: 'bg-purple-100 text-purple-800'
      },
      {
        title: 'Instant QR Photo Preview & Editable WhatsApp Reminders',
        desc: 'Generates exact-amount UPI QR photos on-device and provides custom message editing before sending reminders.',
        badge: 'UPDATED',
        badgeColor: 'bg-amber-100 text-amber-800'
      },
      {
        title: 'Instant Non-Admin Guest Explorer Mode',
        desc: 'Explore fee registers, pie charts, and student records with random details without administrative credentials.',
        badge: 'DEMO',
        badgeColor: 'bg-teal-100 text-teal-800'
      }
    ]
  };

  return (
    <>
      {/* Interactive Version Pill Button */}
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-emerald-600/10 hover:from-blue-600/20 hover:to-emerald-600/20 border border-blue-200/80 hover:border-blue-300 text-slate-800 transition-all shadow-2xs hover:shadow-xs active:scale-95"
        title="Click to view What's New in this Version"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>

        <span className="text-[11px] font-black tracking-tight bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
          {versionDetails.version}
        </span>

        <span className="text-[9px] font-bold uppercase tracking-wider bg-white/90 px-1.5 py-0.2 rounded-md text-slate-600 border border-slate-200/80 shadow-3xs group-hover:bg-blue-50 transition-colors">
          Changelog
        </span>
      </button>

      {/* Version & Release Notes Modal */}
      {modalOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white w-full max-w-md rounded-2xl max-h-[88vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-4.5 rounded-t-2xl flex items-center justify-between z-10 shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-600/80 border border-blue-400/40 flex items-center justify-center text-white shadow-md">
                  <Sparkles size={20} className="text-amber-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black tracking-tight leading-none text-white">
                      EduManage {versionDetails.version}
                    </h3>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      {versionDetails.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-1">
                    {versionDetails.codename} • {versionDetails.buildDate}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content List */}
            <div className="p-4.5 space-y-3.5">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
                🚀 What's New in this Release
              </div>

              <div className="space-y-2.5">
                {versionDetails.highlights.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 hover:bg-blue-50/20 hover:border-blue-200 transition-all space-y-1 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-extrabold text-slate-900 text-xs sm:text-sm">
                        {item.title}
                      </h4>
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Architecture & Specs */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-xl p-3.5 space-y-2 shadow-xs">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400 block">
                  System Architecture
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                    <span className="text-slate-400 text-[10px] block">Database:</span>
                    <span className="text-white font-bold">Supabase / SQLite</span>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                    <span className="text-slate-400 text-[10px] block">Engine:</span>
                    <span className="text-white font-bold">Vite 8 + React 19</span>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                    <span className="text-slate-400 text-[10px] block">Payment:</span>
                    <span className="text-emerald-400 font-bold">0% Direct UPI</span>
                  </div>
                  <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700">
                    <span className="text-slate-400 text-[10px] block">Offline Sync:</span>
                    <span className="text-blue-400 font-bold">PWA Storage Queue</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-center">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all active:scale-98"
              >
                Got It & Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
