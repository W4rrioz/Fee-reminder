import React, { useEffect, useState } from 'react';
import { useApp } from './context/AppContext';
import { OfflineBanner } from './components/OfflineBanner';
import { BottomNavigation } from './components/BottomNavigation';
import { DashboardScreen } from './screens/DashboardScreen';
import { AttendanceScreen } from './screens/AttendanceScreen';
import { FeesScreen } from './screens/FeesScreen';
import { StudentsScreen } from './screens/StudentsScreen';
import { DefaultersScreen } from './screens/DefaultersScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { WelcomeLandingScreen } from './screens/WelcomeLandingScreen';
import { SignUpScreen } from './screens/SignUpScreen';
import { OnboardingWizard } from './screens/OnboardingWizard';
import { AdminLoginScreen } from './screens/AdminLoginScreen';
import { AiChatbot } from './components/AiChatbot';
import { AppLoader } from './components/AppLoader';
import { GraduationCap, Shield, Bot, Sparkles, MessageSquare } from 'lucide-react';

export function MainApp() {
  const {
    activeTab,
    setActiveTab,
    attendanceEnabled,
    institute,
    user,
    isAuthenticated,
    isOnboarded,
    authView,
    setAuthView
  } = useApp();

  const [hasLoaded, setHasLoaded] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);

  // If attendance is disabled and activeTab is 'attendance', redirect to dashboard
  useEffect(() => {
    if (!attendanceEnabled && activeTab === 'attendance') {
      setActiveTab('dashboard');
    }
  }, [attendanceEnabled, activeTab, setActiveTab]);

  if (!hasLoaded) {
    return <AppLoader onComplete={() => setHasLoaded(true)} />;
  }

  // If not authenticated or currently onboarding, show landing/auth flows
  if (!isAuthenticated || !isOnboarded) {
    if (!isAuthenticated && authView === 'landing') {
      return (
        <div className="min-h-screen bg-[#FAF7F2] flex flex-col w-full relative">
          <OfflineBanner />
          <WelcomeLandingScreen onOpenAi={() => setIsAiOpen(true)} />
          <AiChatbot isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
        </div>
      );
    }

    if (!isAuthenticated && authView === 'login') {
      return (
        <div className="min-h-screen w-full relative">
          <OfflineBanner />
          <AdminLoginScreen />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center py-6 px-3">
        <div className="w-full max-w-lg bg-slate-900 min-h-[600px] rounded-3xl flex flex-col shadow-2xl relative border border-slate-800 overflow-hidden">
          <OfflineBanner />

          {/* Render selected auth view */}
          {(!isAuthenticated && authView === 'register') && <SignUpScreen />}
          {(isAuthenticated && !isOnboarded) && <OnboardingWizard />}
        </div>
      </div>
    );
  }

  // Main App for Authenticated & Onboarded user
  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 flex justify-center">
      {/* Responsive container - adapts from mobile (₹8,000 Android phones) to desktop */}
      <div className="w-full max-w-5xl bg-stone-50 dark:bg-stone-900 min-h-screen flex flex-col shadow-xl relative border-x border-stone-200 dark:border-stone-800">
        {/* Offline indicator banner */}
        <OfflineBanner />

        {/* Top App Bar */}
        <header className="sticky top-0 z-30 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#A82D24] text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black text-stone-900 dark:text-stone-100 leading-tight">
                  EduManage
                </h1>
                <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded-full bg-[#A82D24] text-white shadow-2xs">
                  Bharat
                </span>
              </div>
              <p className="text-[11px] text-stone-500 font-semibold truncate max-w-[200px]">
                {institute?.name || 'Fee & Attendance Platform'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Assistant Quick Trigger Button */}
            <button
              type="button"
              onClick={() => setIsAiOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-1.5 rounded-xl bg-[#8B261E] hover:bg-[#721C16] text-white shadow-xs transition-all active:scale-95 cursor-pointer ring-1 ring-[#8B261E]/40"
              title="Ask AI about student dues, defaulters and attendance"
            >
              <Bot size={14} className="text-amber-300" />
              <span>Ask AI</span>
            </button>

            {/* User Profile in Header */}
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>{user?.name || 'Account'}</span>
            </span>
          </div>
        </header>

        {/* Screen Content Container */}
        <main className="flex-1 px-3.5 py-3.5 overflow-y-auto pb-24">
          {activeTab === 'dashboard' && <DashboardScreen />}
          {activeTab === 'attendance' && attendanceEnabled && <AttendanceScreen />}
          {activeTab === 'fees' && <FeesScreen />}
          {activeTab === 'students' && <StudentsScreen />}
          {activeTab === 'defaulters' && <DefaultersScreen />}
          {activeTab === 'settings' && <SettingsScreen />}
        </main>

        {/* Floating AI Action Button */}
        <button
          type="button"
          onClick={() => setIsAiOpen(true)}
          className="fixed bottom-18 right-4 z-40 bg-[#8B261E] hover:bg-[#721C16] text-white font-bold text-xs py-2.5 px-4 rounded-full shadow-2xl flex items-center gap-2 border border-white/20 active:scale-95 transition-all cursor-pointer ring-4 ring-[#8B261E]/20"
        >
          <Sparkles size={14} className="text-amber-300 animate-spin" />
          <span>✦ Ask AI Copilot</span>
        </button>

        {/* Fixed Mobile Bottom Navigation */}
        <BottomNavigation />
      </div>

      {/* AI Chatbot Dialog */}
      <AiChatbot isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </div>
  );
}

export default function App() {
  return <MainApp />;
}

// EduManage Bharat · AI Genesis Challenge
