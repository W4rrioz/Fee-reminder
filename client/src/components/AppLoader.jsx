import React, { useEffect, useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  ArrowRight
} from 'lucide-react';

export const AppLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(12);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  const loadingStages = [
    'Connecting to Real-time Calendar...',
    'Verifying Zero-Commission UPI Route...',
    'Loading Institute Dues & Students...',
    'Readying Dashboard & Analytics...'
  ];

  useEffect(() => {
    const textInterval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingStages.length);
    }, 450);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          clearInterval(textInterval);
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 300);
          return 100;
        }
        const increment = Math.floor(Math.random() * 20) + 12;
        return Math.min(100, prev + increment);
      });
    }, 180);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-white overflow-hidden animate-fade-in select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-600/25 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-700" />
      <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />

      <div className="relative z-10 max-w-sm w-full text-center flex flex-col items-center">
        {/* Animated Brand Emblem with glowing pulse rings */}
        <div className="relative mb-6">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-emerald-500 rounded-3xl blur-xl opacity-60 animate-pulse" />
          <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-2xl border border-white/20 animate-bounce">
            <GraduationCap size={40} className="text-white drop-shadow-md" />
          </div>

          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg border-2 border-slate-950 animate-ping" />
          <div className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5 shadow-lg border-2 border-slate-950">
            <Sparkles size={12} />
          </div>
        </div>

        {/* Brand Name & Version Tag */}
        <div className="space-y-1 mb-8">
          <h1 className="text-3xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            <span>EduManage</span>
            <span className="text-xs font-black px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
              v2.4
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">
            Smart UPI Fee Recovery & Attendance Operating System
          </p>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-slate-800/80 rounded-full h-2.5 p-0.5 border border-slate-700/80 shadow-inner mb-4 overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-300 ease-out shadow-sm"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Dynamic Status Text & Percentage */}
        <div className="w-full flex items-center justify-between text-xs text-slate-400 px-1 font-mono">
          <span className="text-slate-300 flex items-center gap-1.5 truncate mr-2">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-ping inline-block" />
            <span className="truncate">{loadingStages[loadingTextIndex]}</span>
          </span>
          <span className="font-bold text-emerald-400 shrink-0">{progress}%</span>
        </div>

        {/* Feature Pills */}
        <div className="mt-10 grid grid-cols-3 gap-2 w-full pt-4 border-t border-slate-800/80">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Gateway Cut</span>
            <span className="text-xs font-black text-emerald-400">0% Direct UPI</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Calendar Sync</span>
            <span className="text-xs font-black text-blue-400">Real-time</span>
          </div>
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 text-center">
            <span className="text-[10px] text-slate-500 uppercase font-bold block">Reminders</span>
            <span className="text-xs font-black text-amber-400">1-Tap WA</span>
          </div>
        </div>
      </div>
    </div>
  );
};
