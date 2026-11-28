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
    <div className="fixed inset-0 z-50 bg-[#FAF7F2] flex flex-col items-center justify-center p-6 text-stone-900 select-none">
      <div className="relative z-10 max-w-xs w-full text-center flex flex-col items-center">
        {/* Clean Brand Icon */}
        <div className="w-14 h-14 rounded-2xl bg-[#8B261E] text-white flex items-center justify-center shadow-md mb-4">
          <GraduationCap size={28} />
        </div>

        {/* Brand Name */}
        <div className="flex items-center gap-1.5 justify-center">
          <h1 className="text-xl font-serif font-bold tracking-tight text-stone-900">
            EduManage
          </h1>
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#8B261E] text-white tracking-wider">
            Bharat
          </span>
        </div>
        <p className="text-xs text-stone-500 font-medium mt-1 mb-6">
          0% Fee Engine · 2G Offline Attendance
        </p>

        {/* Snappy Progress Bar */}
        <div className="w-48 bg-[#E7E0D6] rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-[#8B261E] h-full rounded-full transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

// EduManage Bharat · AI Genesis Challenge
