import React, { useEffect } from 'react';
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
import { AppLoader } from './components/AppLoader';
import { VersionBadge } from './components/VersionBadge';
import { GraduationCap, Shield } from 'lucide-react';

export function MainApp() {
  const {
    activeTab,
    setActiveTab,
    attendanceEnabled,
    institute,
    user,
    isAuthenticated,
    isOnboarded,
    authView
  } = useApp();

  const [hasLoaded, setHasLoaded] = React.useState(false);

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
        <div className="min-h-screen bg-slate-50 flex flex-col w-full">
          <OfflineBanner />
          <WelcomeLandingScreen />
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
    <div className="min-h-screen bg-stone-100 flex justify-center">
      {/* Mobile container - optimized for ₹8,000 Android phones (max width 480px) */}
      <div className="w-full max-w-lg bg-[#FAFAF9] min-h-screen flex flex-col border-x border-stone-200 relative shadow-sm">
        {/* Offline indicator banner */}
        <OfflineBanner />

        {/* Top App Bar - Ledger Calm */}
        <header className="sticky top-0 z-30 bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#3730A3] text-white flex items-center justify-center font-bold shadow-xs">
              <GraduationCap size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold text-stone-900 leading-tight">
                EduManage
              </h1>
              <p className="text-xs text-stone-500 font-medium truncate max-w-[190px]">
                {institute?.name || 'Fee & Ledger Manager'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <VersionBadge />

            {/* User Role Badge in Header */}
            <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-50 text-[#3730A3] border border-indigo-200">
              <Shield size={11} className="text-[#3730A3]" />
              {user?.role ? user.role : 'ADMIN'}
            </span>
          </div>
        </header>

        {/* Screen Content Container */}
        <main className="flex-1 px-3.5 py-3.5 overflow-y-auto pb-20">
          {activeTab === 'dashboard' && <DashboardScreen />}
          {activeTab === 'attendance' && attendanceEnabled && <AttendanceScreen />}
          {activeTab === 'fees' && <FeesScreen />}
          {activeTab === 'students' && <StudentsScreen />}
          {activeTab === 'defaulters' && <DefaultersScreen />}
          {activeTab === 'settings' && <SettingsScreen />}
        </main>

        {/* Fixed Mobile Bottom Navigation */}
        <BottomNavigation />
      </div>
    </div>
  );
}

export default function App() {
  return <MainApp />;
}

