import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  BookOpen,
  IndianRupee,
  Shield,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminLoginScreen = () => {
  const { setAuthView, loginUser, isOnline } = useApp();

  const [selectedRole, setSelectedRole] = useState('admin'); // 'admin' | 'teacher' | 'accountant' | 'student' | 'parent'
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  const roles = [
    { id: 'admin', label: 'Admin', icon: Shield },
    { id: 'teacher', label: 'Teacher', icon: BookOpen },
    { id: 'accountant', label: 'Accountant', icon: IndianRupee },
    { id: 'student', label: 'Student', icon: GraduationCap },
    { id: 'parent', label: 'Parent', icon: Users },
  ];

  // Quick guest exploration for any role
  const handleGuestExplore = () => {
    const roleCapitalized = selectedRole.toUpperCase();
    const guestAuthData = {
      token: `token_guest_${Date.now()}`,
      user: {
        id: `guest_${selectedRole}_${Math.floor(1000 + Math.random() * 9000)}`,
        name: selectedRole === 'admin' ? 'Dr. R. K. Sharma (Director)' : `${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Explorer`,
        email: `${selectedRole}@edumanage.demo`,
        phone: '+91 9876543210',
        role: roleCapitalized,
        isGuest: true,
        created_at: new Date().toISOString()
      },
      institute: {
        id: 'inst_apex_01',
        name: 'Apex Coaching Academy',
        type: 'coaching_center',
        city: 'Kanpur',
        upi_id: 'apexacademy@upi',
        upi_name: 'Apex Academy Kanpur',
        enable_attendance: true,
        role: roleCapitalized
      }
    };
    loginUser(guestAuthData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Please provide email and password.');
      return;
    }

    setLoading(true);

    try {
      let authResponse = null;

      if (isOnline) {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...formData,
              role: selectedRole
            })
          });

          const data = await res.json();
          if (res.ok && data.user) {
            authResponse = data;
          } else {
            throw new Error(data.error || 'Invalid email or password');
          }
        } catch (fetchErr) {
          if (fetchErr.message && !fetchErr.message.includes('Failed to fetch')) {
            throw fetchErr;
          }
          console.warn('Backend login endpoint unavailable or errored:', fetchErr.message);
        }
      }

      // If offline or dev fallback, create session
      if (!authResponse) {
        authResponse = {
          token: `token_${selectedRole}_${Date.now()}`,
          user: {
            id: `usr_${Date.now()}`,
            name: formData.email.split('@')[0],
            email: formData.email,
            role: selectedRole.toUpperCase()
          },
          institute: {
            id: 'inst_apex_01',
            name: 'Apex Coaching Academy',
            upi_id: 'apexacademy@upi',
            upi_name: 'Apex Academy Kanpur'
          }
        };
      }

      loginUser(authResponse);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-stone-950 text-stone-100' : 'bg-[#FAF7F2] text-stone-800'} flex flex-col justify-between p-4 sm:p-8 font-body transition-colors duration-200`}>
      {/* Top Header */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between py-2">
        <button
          type="button"
          onClick={() => setAuthView('landing')}
          className={`inline-flex items-center gap-2 text-xs font-medium ${darkMode ? 'text-stone-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'} transition-colors cursor-pointer`}
        >
          <ArrowLeft size={15} />
          <span>Back to home</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-lg border ${darkMode ? 'border-stone-800 text-stone-300 hover:bg-stone-900' : 'border-stone-200 text-stone-600 hover:bg-stone-100'} transition-colors cursor-pointer`}
            title="Toggle theme"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>

          <div className="flex items-center gap-2 select-none">
            <div className="w-7 h-7 rounded-lg bg-[#A82D24] text-white flex items-center justify-center font-bold text-xs shadow-xs">
              <GraduationCap size={15} />
            </div>
            <span className={`text-lg font-black ${darkMode ? 'text-stone-100' : 'text-stone-900'} tracking-tight`}>
              EduManage
            </span>
            <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded-md bg-[#A82D24] text-white">
              Bharat
            </span>
          </div>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        <div className={`${darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-200/90'} rounded-2xl border p-6 sm:p-8 shadow-sm transition-all`}>
          
          {/* Header */}
          <div className="text-left mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#A82D24]">
              WELCOME BACK
            </span>
            <h1 className={`text-2xl sm:text-3xl font-bold font-editorial mt-1 ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
              Sign In to EduManage
            </h1>
            <p className={`text-xs mt-1.5 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
              Access your institute dashboard, fee register, and attendance tracker.
            </p>
          </div>

          {/* Role Selection Tabs */}
          <div className="mb-5">
            <label className={`block text-[11px] font-semibold mb-2 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
              Sign in as
            </label>
            <div className="grid grid-cols-5 gap-1.5">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-[10px] font-medium transition-all cursor-pointer ${
                      isSelected
                        ? darkMode
                          ? 'border-[#A82D24] bg-[#A82D24]/20 text-red-300 ring-2 ring-[#A82D24]/30'
                          : 'border-red-300 bg-red-50/70 text-[#A82D24] font-semibold ring-2 ring-red-200'
                        : darkMode
                          ? 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                          : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900'
                    }`}
                  >
                    <Icon size={15} className={isSelected ? 'text-[#A82D24]' : 'text-stone-400'} />
                    <span className="mt-1">{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 text-red-700 text-xs">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                Email / Mobile
              </label>
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="director@institute.in"
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                  darkMode
                    ? 'bg-stone-950 border-stone-800 text-stone-100 placeholder-stone-600 focus:border-[#A82D24]'
                    : 'bg-white border-stone-200 text-stone-900 placeholder-stone-400 focus:border-[#A82D24]'
                } focus:outline-none focus:ring-2 focus:ring-[#A82D24]/20 transition-all`}
                required
              />
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${darkMode ? 'text-stone-300' : 'text-stone-700'}`}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••"
                  className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                    darkMode
                      ? 'bg-stone-950 border-stone-800 text-stone-100 placeholder-stone-600 focus:border-[#A82D24]'
                      : 'bg-white border-stone-200 text-stone-900 placeholder-stone-400 focus:border-[#A82D24]'
                  } focus:outline-none focus:ring-2 focus:ring-[#A82D24]/20 transition-all pr-10`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${darkMode ? 'text-stone-500 hover:text-stone-300' : 'text-stone-400 hover:text-stone-600'}`}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Login CTA */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#A82D24] hover:bg-[#8B261E] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in as {roles.find((r) => r.id === selectedRole)?.label || 'User'}</span>
              )}
            </button>
          </form>

          {/* Quick guest preview & Register link */}
          <div className="mt-5 space-y-2.5 text-center">
            <button
              type="button"
              onClick={handleGuestExplore}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                darkMode
                  ? 'border-stone-800 hover:bg-stone-800 text-stone-300'
                  : 'border-stone-200 hover:bg-stone-50 text-stone-700'
              }`}
            >
              <Sparkles size={13} className="text-amber-500" />
              <span>Instant Guest Preview ({roles.find((r) => r.id === selectedRole)?.label})</span>
            </button>

            <p className={`text-xs ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
              New institute?{' '}
              <button
                type="button"
                onClick={() => setAuthView('register')}
                className="text-[#A82D24] font-semibold hover:underline cursor-pointer"
              >
                Register your school or coaching
              </button>
            </p>
          </div>
        </div>

        {/* Footer note */}
        <p className={`text-[11px] text-center mt-5 ${darkMode ? 'text-stone-500' : 'text-stone-500'}`}>
          Secure direct bank UPI settlements. Zero transaction gateway fees.
        </p>
      </div>

      <div className="w-full text-center py-2 text-[10px] text-stone-400">
        EduManage Bharat · Direct UPI & Attendance Engine
      </div>
    </div>
  );
};
