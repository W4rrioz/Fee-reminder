import React, { useEffect, useState } from 'react';
import { GraduationCap } from 'lucide-react';

export const AppLoader = ({ onComplete }) => {
  const [progress, setProgress] = useState(25);

  useEffect(() => {
    const timer1 = setTimeout(() => setProgress(80), 80);
    const timer2 = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 120);
    }, 220);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-[#fafaf9] flex flex-col items-center justify-center p-6 text-slate-900 select-none">
      <div className="relative z-10 max-w-xs w-full text-center flex flex-col items-center">
        {/* Clean Brand Icon */}
        <div className="w-14 h-14 rounded-2xl bg-indigo-700 text-white flex items-center justify-center shadow-md mb-4">
          <GraduationCap size={28} />
        </div>

        {/* Brand Name */}
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          EduManage
        </h1>
        <p className="text-xs text-slate-500 font-medium mt-1 mb-6">
          Fee Reminder & Operations
        </p>

        {/* Snappy Progress Bar */}
        <div className="w-48 bg-slate-200 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
