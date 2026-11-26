import React, { useState } from 'react';
import {
  GraduationCap,
  Users,
  BookOpen,
  Calculator,
  Shield,
  Eye,
  EyeOff,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Sparkles,
  Sun,
  Moon,
  Building2,
  ArrowRight,
  CheckCircle2
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
    { id: 'admin', label: 'Admin', sub: 'Director / Owner', icon: Shield },
    { id: 'teacher', label: 'Teacher', sub: 'Faculty & Batches', icon: BookOpen },
    { id: 'accountant', label: 'Accountant', sub: 'Fee Counter', icon: Calculator },
    { id: 'student', label: 'Student', sub: 'Attendance & Dues', icon: GraduationCap },
    { id: 'parent', label: 'Parent', sub: 'UPI Payments', icon: Users },
  ];

  // Quick guest exploration for any role
  const handleGuestExplore = () => {
    const roleCapitalized = selectedRole.toUpperCase();
    const roleNameMap = {
      admin: 'Director Sharma',
      teacher: 'Prof. Verma',
      accountant: 'Mr. Gupta (Accounts)',
      student: 'Rahul Sharma',
      parent: 'Sunil Sharma (Parent)'
    };

    const guestAuthData = {
      token: `token_guest_${Date.now()}`,
      user: {
        id: `edumanage_${selectedRole}_${Date.now()}`,
        name: roleNameMap[selectedRole] || 'EduManage Explorer',
        email: `${selectedRole}@edumanage.in`,
        phone: '+91 9876543210',
        role: roleCapitalized,
        isGuest: true,
        created_at: new Date().toISOString()
      },
      institute: {
        id: 'inst_apex_01',
        name: 'Apex Tutorials & Science Academy',
        type: 'coaching_center',
        city: 'Kanpur',
        upi_id: 'apextutorials@upi',
        upi_name: 'Apex Tutorials Kanpur',
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

      // If offline or local dev fallback, create session
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
            name: 'Apex Tutorials & Science Academy',
            type: 'coaching_center',
            city: 'Kanpur',
            upi_id: 'apextutorials@upi',
            upi_name: 'Apex Tutorials Kanpur',
            enable_attendance: true
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
    <div className={`min-h-screen ${darkMode ? 'bg-[#121212] text-stone-100' : 'bg-[#FAF7F2] text-[#1C1917]'} flex flex-col justify-between p-4 sm:p-8 font-body transition-colors duration-200 select-none`}>
      
      {/* Top Header */}
      <div className="w-full max-w-4xl mx-auto flex items-center justify-between py-2">
        <button
          type="button"
          onClick={() => setAuthView('landing')}
          className={`inline-flex items-center gap-2 text-xs font-semibold ${darkMode ? 'text-stone-400 hover:text-white' : 'text-stone-600 hover:text-stone-900'} transition-colors cursor-pointer`}
        >
          <ArrowLeft size={16} />
          <span>Back to home</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl border ${darkMode ? 'border-stone-800 text-stone-300 hover:bg-stone-900' : 'border-[#E7E0D6] text-stone-600 hover:bg-stone-100'} transition-colors cursor-pointer`}
            title="Toggle theme"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#8B261E] text-white flex items-center justify-center font-bold shadow-2xs">
              <GraduationCap size={18} />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-serif text-lg font-bold tracking-tight text-[#1C1917] dark:text-stone-100">
                EduManage
              </span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-full bg-[#8B261E] text-white">
                Bharat
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Login Card - Editorial Style matching Screenshot 3 */}
      <div className="w-full max-w-md mx-auto my-auto py-6">
        <div className={`${darkMode ? 'bg-stone-900 border-stone-800' : 'bg-white border-[#E7E0D6]'} rounded-2xl border p-6 sm:p-8 shadow-sm transition-all text-left`}>
          
          {/* Header */}
          <div className="mb-6">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#8B261E] dark:text-rose-400">
              WELCOME BACK
            </span>
            <h1 className={`text-2xl sm:text-3xl font-serif font-bold mt-1 ${darkMode ? 'text-stone-100' : 'text-stone-900'}`}>
              Log in to EduManage
            </h1>
            <p className={`text-xs mt-1.5 ${darkMode ? 'text-stone-400' : 'text-stone-500'}`}>
              Manage student fees, attendance registers, and automated reminders.
            </p>
          </div>

          {/* Role Selection Tabs matching Screenshot 3 */}
          <div className="mb-5">
            <label className={`block text-[11px] font-bold uppercase tracking-wider mb-2.5 ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
              I am a
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setSelectedRole(role.id)}
                    className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl border text-[11px] transition-all cursor-pointer ${
                      isSelected
                        ? darkMode
                          ? 'border-[#8B261E] bg-[#8B261E]/20 text-rose-300 ring-2 ring-[#8B261E]/40 font-bold'
                          : 'border-[#8B261E] bg-rose-50/80 text-[#8B261E] font-bold ring-2 ring-[#8B261E]/30'
                        : darkMode
                          ? 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                          : 'border-[#E7E0D6] bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900'
                    }`}
                  >
                    <Icon size={16} className={isSelected ? 'text-[#8B261E] dark:text-rose-400' : 'text-stone-400'} />
                    <span className="mt-1 font-semibold">{role.label}</span>
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
                Email or Mobile Number
              </label>
              <input
                type="text"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={selectedRole === 'admin' ? 'director@apexacademy.in' : `${selectedRole}@apexacademy.in`}
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border ${
                  darkMode
                    ? 'bg-stone-950 border-stone-800 text-stone-100 placeholder-stone-600 focus:border-[#8B261E]'
                    : 'bg-white border-[#E7E0D6] text-stone-900 placeholder-stone-400 focus:border-[#8B261E]'
                } focus:outline-none focus:ring-2 focus:ring-[#8B261E]/20 transition-all`}
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
                      ? 'bg-stone-950 border-stone-800 text-stone-100 placeholder-stone-600 focus:border-[#8B261E]'
                      : 'bg-white border-[#E7E0D6] text-stone-900 placeholder-stone-400 focus:border-[#8B261E]'
                  } focus:outline-none focus:ring-2 focus:ring-[#8B261E]/20 transition-all pr-10`}
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
              className="w-full mt-2 bg-[#8B261E] hover:bg-[#721C16] active:scale-[0.99] text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Log in as {roles.find(r => r.id === selectedRole)?.label}</span>
              )}
            </button>
          </form>

          {/* Quick guest preview & Register link */}
          <div className="mt-5 space-y-2.5 text-center">
            <button
              type="button"
              onClick={handleGuestExplore}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                darkMode
                  ? 'border-stone-800 hover:bg-stone-800 text-stone-300'
                  : 'border-[#E7E0D6] hover:bg-[#FAF7F2] text-stone-800'
              }`}
            >
              <Sparkles size={13} className="text-amber-500" />
              <span>Explore Live Demo ({roles.find(r => r.id === selectedRole)?.label})</span>
            </button>

            <p className={`text-xs ${darkMode ? 'text-stone-400' : 'text-stone-600'}`}>
              New to EduManage Bharat?{' '}
              <button
                type="button"
                onClick={() => setAuthView('register')}
                className="text-[#8B261E] dark:text-rose-400 font-bold hover:underline cursor-pointer"
              >
                Create a free account
              </button>
            </p>
          </div>
        </div>

        {/* Footer note matching screenshot 3 */}
        <p className={`text-[11px] text-center mt-5 ${darkMode ? 'text-stone-500' : 'text-stone-500'}`}>
          Your account lives on this device. EduManage keeps fee collection 100% direct with 0% gateway commission.
        </p>
      </div>

      <div className="w-full text-center py-2 text-[10px] text-stone-400">
        EduManage Bharat · Smart Fee Engine & 2G Offline Attendance Register
      </div>
    </div>
  );
};
