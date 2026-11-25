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
import { MvpDemoScreen } from './screens/MvpDemoScreen';
import { AiChatbot } from './components/AiChatbot';
import { AppLoader } from './components/AppLoader';
import { VersionBadge } from './components/VersionBadge';
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

  // If user explicitly chose MVP Demo view mode
  if (authView === 'demo') {
    return (
      <div className="relative">
        <MvpDemoScreen />
        {/* Floating AI Trigger also on MVP screen */}
        <button
          type="button"
          onClick={() => setIsAiOpen(true)}
          className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-black text-xs py-2.5 px-4 rounded-full shadow-2xl hover:shadow-blue-500/30 flex items-center gap-2 border border-white/20 active:scale-95 transition-all cursor-pointer ring-4 ring-blue-500/20"
        >
          <Sparkles size={16} className="text-amber-300 animate-spin" />
          <span>Ask AI Copilot</span>
        </button>
        <AiChatbot isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
      </div>
    );
  }

  // If not authenticated or currently onboarding, show landing/auth flows
  if (!isAuthenticated || !isOnboarded) {
    if (!isAuthenticated && authView === 'landing') {
      return (
        <div className="min-h-screen bg-slate-50 flex flex-col w-full relative">
          <OfflineBanner />
          <WelcomeLandingScreen />
          {/* AI Copilot available on Landing Page as well! */}
          <button
            type="button"
            onClick={() => setIsAiOpen(true)}
            className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-black text-xs py-2.5 px-4 rounded-full shadow-2xl hover:shadow-blue-500/30 flex items-center gap-2 border border-white/20 active:scale-95 transition-all cursor-pointer ring-4 ring-blue-500/20 animate-bounce"
          >
            <Bot size={17} className="text-amber-300" />
            <span>Ask AI About Data</span>
          </button>
          <AiChatbot isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-slate-950 flex justify-center items-center py-6 px-3">
        <div className="w-full max-w-lg bg-slate-900 min-h-[600px] rounded-3xl flex flex-col shadow-2xl relative border border-slate-800 overflow-hidden">
          <OfflineBanner />

          {/* Render selected auth view */}
          {(!isAuthenticated && authView === 'register') && <SignUpScreen />}
          {(!isAuthenticated && authView === 'login') && <AdminLoginScreen />}
          {(isAuthenticated && !isOnboarded) && <OnboardingWizard />}
        </div>
      </div>
    );
  }

  // Main App for Authenticated & Onboarded user
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center">
      {/* Mobile container - optimized for ₹8,000 Android phones (max width 480px) */}
      <div className="w-full max-w-lg bg-slate-50 min-h-screen flex flex-col shadow-xl relative border-x border-slate-200">
        {/* Offline indicator banner */}
        <OfflineBanner />

        {/* Top App Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap size={20} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 leading-tight">
                EduManage
              </h1>
              <p className="text-[11px] text-slate-500 font-semibold truncate max-w-[150px]">
                {institute?.name || 'Fee & Attendance Platform'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Assistant Quick Trigger Button */}
            <button
              type="button"
              onClick={() => setIsAiOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xs transition-all active:scale-95 cursor-pointer ring-1 ring-blue-500/40"
              title="Ask AI about student dues, defaulters and attendance"
            >
              <Bot size={14} className="text-amber-300" />
              <span>Ask AI</span>
            </button>

            {/* Version Badge UI with animated changelog modal */}
            <VersionBadge />

            {/* User Role Badge in Header */}
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
              <Shield size={10} className="text-blue-600" />
              {user?.role ? user.role : 'ADMIN'}
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
          className="fixed bottom-18 right-4 z-40 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-extrabold text-xs py-2 px-3.5 rounded-full shadow-2xl hover:shadow-blue-500/40 flex items-center gap-2 border border-white/20 active:scale-95 transition-all cursor-pointer ring-4 ring-blue-500/20"
        >
          <Sparkles size={14} className="text-amber-300 animate-spin" />
          <span>AI Copilot</span>
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
