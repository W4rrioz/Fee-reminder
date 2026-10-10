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
    <div className="min-h-screen bg-slate-100 flex justify-center">
      {/* Mobile container - optimized for ₹8,000 Android phones (max width 480px) */}
      <div className="w-full max-w-lg bg-slate-50 min-h-screen flex flex-col shadow-xl relative border-x border-slate-200">
        {/* Offline indicator banner */}
        <OfflineBanner />

        {/* Top App Bar */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <GraduationCap size={20} />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 leading-none">
                EduManage
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5 truncate max-w-[180px]">
                {institute.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
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
        <main className="flex-1 px-3 py-3 overflow-y-auto">
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

