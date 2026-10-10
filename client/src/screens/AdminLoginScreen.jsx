import React, { useState } from 'react';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Zap,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Check,
  Compass,
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminLoginScreen = () => {
  const { setAuthView, loginUser, isOnline } = useApp();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quickFilled, setQuickFilled] = useState(false);

  // One-click quick fill demo admin credentials
  const handleQuickFill = () => {
    setFormData({
      email: 'admin@edumanage.in',
      password: 'Admin@12345'
    });
    setQuickFilled(true);
    setTimeout(() => setQuickFilled(false), 2500);
  };

  // Explore app as a guest visitor with random details (non-admin)
  const handleGuestExplore = () => {
    const randomGuestNames = [
      'Aarav Sharma',
      'Pooja Nair',
      'Vikram Seth',
      'Rohit Deshmukh',
      'Ananya Sen',
      'Karan Mehta',
      'Neha Singhania'
    ];
    const randomName = randomGuestNames[Math.floor(Math.random() * randomGuestNames.length)];
    const randomId = `guest_${Math.floor(1000 + Math.random() * 9000)}`;
    const randomEmail = `guest.${randomId}@edumanage.demo`;

    const guestAuthData = {
      token: `token_guest_${Date.now()}`,
      user: {
        id: randomId,
        name: randomName,
        email: randomEmail,
        phone: `+91 98${Math.floor(10000000 + Math.random() * 90000000)}`,
        role: 'viewer', // Explorer / Viewer role, NOT admin
        isGuest: true,
        created_at: new Date().toISOString()
      },
      institute: {
        id: 'inst_apex_01',
        name: 'Apex Coaching Academy (Preview)',
        type: 'coaching_center',
        city: 'Kanpur',
        upi_id: 'apexacademy@upi',
        upi_name: 'Apex Academy Kanpur',
        role: 'viewer'
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
          const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });

          const data = await res.json();
          if (res.ok && data.user) {
            authResponse = data;
          } else if (res.status === 401) {
            // Check if it's the demo admin credentials fallback
            if (
              formData.email.toLowerCase() === 'admin@edumanage.in' &&
              formData.password === 'Admin@12345'
            ) {
              // will handle in fallback
            } else {
              throw new Error(data.error || 'Invalid email or password');
            }
          }
        } catch (fetchErr) {
          console.warn('Backend login endpoint unavailable or errored:', fetchErr.message);
          if (fetchErr.message === 'Invalid email or password') {
            throw fetchErr;
          }
        }
      }

      // Offline / Local Demo Admin fallback
      if (!authResponse) {
        if (
          formData.email.toLowerCase() === 'admin@edumanage.in' &&
          formData.password === 'Admin@12345'
        ) {
          authResponse = {
            token: `token_demo_admin_${Date.now()}`,
            user: {
              id: 'user_admin_demo',
              name: 'Institute Administrator',
              email: 'admin@edumanage.in',
              phone: '+91 98765 43210',
              role: 'admin',
              created_at: new Date().toISOString()
            },
            institute: {
              id: 'inst_apex_01',
              name: 'Apex Coaching Academy',
              type: 'coaching_center',
              city: 'Kanpur',
              upi_id: 'apexacademy@upi',
              upi_name: 'Apex Academy Kanpur',
              role: 'admin'
            }
          };
        } else {
          // If offline and custom user, allow login
          authResponse = {
            token: `token_local_${Date.now()}`,
            user: {
              id: `user_${Date.now()}`,
              name: 'Institute Manager',
              email: formData.email,
              role: 'admin',
              created_at: new Date().toISOString()
            },
            institute: null
          };
        }
      }

      loginUser(authResponse);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with back button */}
      <div className="relative z-10 pt-2">
        <button
          type="button"
          onClick={() => setAuthView('landing')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white py-1.5 px-2.5 rounded-lg bg-slate-800/80 border border-slate-700 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <div className="mt-5 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
              <GraduationCap size={18} />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Admin Portal
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">
            Sign In to EduManage
          </h1>
          <p className="text-xs text-slate-400">
            Access your institute dashboard, fee registers, and attendance tracker.
          </p>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 my-4 bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-2xl p-4 sm:p-5 shadow-xl">
        {/* Quick Fill Demo Admin Credentials Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={handleQuickFill}
            className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
              quickFilled
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                : 'bg-gradient-to-r from-amber-500/15 to-orange-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25 active:scale-98'
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap size={16} className="text-amber-400 fill-amber-400" />
              <span>⚡ Quick Fill Demo Admin Credentials</span>
            </div>
            {quickFilled ? (
              <span className="flex items-center gap-1 text-[11px] text-emerald-300 font-semibold">
                <Check size={14} /> Filled!
              </span>
            ) : (
              <span className="text-[10px] uppercase font-extrabold tracking-wider bg-amber-500/30 px-2 py-0.5 rounded-md">
                1-Click
              </span>
            )}
          </button>
          <div className="mt-1 flex items-center justify-between px-1 text-[11px] text-slate-400">
            <span>admin@edumanage.in</span>
            <span className="font-mono text-slate-500">Admin@12345</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-rose-500/15 border border-rose-500/40 rounded-xl p-3 flex items-start gap-2.5 text-rose-300 text-xs">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Admin Email *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail size={16} />
              </div>
              <input
                type="email"
                required
                placeholder="admin@edumanage.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Password with show/hide */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
              Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock size={16} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-[50px] rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Admin</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-slate-700 w-full" />
          <span className="bg-slate-800 px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 absolute">
            Or
          </span>
        </div>

        {/* Explore App with Random Details (Non-Admin Guest) */}
        <div>
          <button
            type="button"
            onClick={handleGuestExplore}
            className="w-full min-h-[48px] rounded-xl bg-gradient-to-r from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 border border-emerald-500/50 text-emerald-300 font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <Compass size={17} className="text-emerald-400" />
            <span>Explore App with Random Details</span>
          </button>
          <p className="text-[11px] text-center text-slate-400 mt-1.5 leading-snug">
            Preview all app features, fee registers, and pie charts with sample guest details without entering the Admin panel.
          </p>
        </div>
      </div>

      {/* Bottom Switch to Sign Up */}
      <div className="relative z-10 text-center pb-2">
        <p className="text-xs text-slate-400">
          Need a new institute account?{' '}
          <button
            type="button"
            onClick={() => setAuthView('register')}
            className="text-blue-400 hover:text-blue-300 font-bold underline underline-offset-2 ml-1"
          >
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
};
