import React, { useState } from 'react';
import {
  Building2,
  QrCode,
  Save,
  Check,
  RefreshCw,
  Sliders,
  Sparkles,
  Smartphone,
  LogOut,
  Shield,
  User,
  CalendarCheck
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SettingsScreen = () => {
  const {
    institute,
    updateInstitute,
    terms,
    isOnline,
    user,
    logoutUser,
    attendanceEnabled,
    setAttendanceEnabled
  } = useApp();

  const [formData, setFormData] = useState({
    name: institute.name || '',
    type: institute.type || 'coaching_center',
    city: institute.city || '',
    upi_id: institute.upi_id || '',
    upi_name: institute.upi_name || '',
    phone: institute.phone || '',
    attendance_enabled: attendanceEnabled
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [toggleFeedback, setToggleFeedback] = useState(false);

  const handleToggleAttendance = async () => {
    const nextVal = !attendanceEnabled;
    setFormData((prev) => ({ ...prev, attendance_enabled: nextVal }));
    await setAttendanceEnabled(nextVal);
    setToggleFeedback(true);
    setTimeout(() => setToggleFeedback(false), 2000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateInstitute(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <h2 className="text-lg font-black text-slate-900">Institute Settings</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure institute profile, terminology adaptation, and UPI details for direct payments.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Institute Profile & Type Selection */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building2 size={16} className="text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Institute Profile & Type
            </h3>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Institute Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Institute Type Selector (Adaptive terminology) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Institute Category (Adapts App Labels)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'school', label: 'School', sub: 'Uses Class & Section' },
                { id: 'coaching_center', label: 'Coaching', sub: 'Uses Batches' },
                { id: 'tutor', label: 'Tutor', sub: 'Uses Batches / 1-on-1' }
              ].map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setFormData({ ...formData, type: cat.id })}
                  className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all min-h-[64px] ${
                    formData.type === cat.id
                      ? 'bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900">
                    {cat.label}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {cat.sub}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-2 text-xs bg-slate-100 text-slate-700 px-3 py-2 rounded-xl flex items-center gap-2">
              <Sparkles size={14} className="text-blue-600 shrink-0" />
              <span>
                Current Terminology: <b>{terms.classOrBatch}</b> & <b>{terms.studentOrLearner}</b>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                City / Location
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Attendance Feature (Enable / Disable) Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5 transition-all">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 ${
                  attendanceEnabled
                    ? 'bg-blue-50 text-blue-600 border border-blue-100'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}
              >
                <CalendarCheck size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Attendance Feature (Enable / Disable)
                </h3>
                <span
                  className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded uppercase mt-0.5 ${
                    attendanceEnabled
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}
                >
                  {attendanceEnabled ? 'Feature Enabled' : 'Feature Disabled'}
                </span>
              </div>
            </div>

            {/* Clean, Accessible Switch/Toggle Button with Instant Feedback */}
            <button
              type="button"
              role="switch"
              aria-checked={attendanceEnabled}
              onClick={handleToggleAttendance}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] min-w-[54px] items-center px-0.5 ${
                attendanceEnabled ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span className="sr-only">Toggle Attendance Feature</span>
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  attendanceEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Toggle to enable or disable daily student attendance marking and tracking across the application. When disabled, the attendance navigation and dashboards are hidden so you can focus solely on fee management.
          </p>

          <div
            className={`p-3 rounded-xl text-xs flex items-center justify-between border transition-all ${
              attendanceEnabled
                ? 'bg-blue-50/70 border-blue-100 text-blue-900'
                : 'bg-amber-50/70 border-amber-100 text-amber-900'
            }`}
          >
            <span className="font-medium text-[11px] leading-snug">
              {attendanceEnabled
                ? '✓ Attendance navigation, daily register & tracking enabled.'
                : '⚡ Attendance navigation & widgets hidden — 100% focused on fee collections.'}
            </span>
            {toggleFeedback && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 animate-pulse">
                <Check size={11} /> Saved
              </span>
            )}
          </div>
        </div>

        {/* Direct UPI Payments Configuration */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3.5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <QrCode size={16} className="text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Direct UPI Account (0% Commission)
            </h3>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            All parent payments go 100% directly to your own bank account via UPI. No aggregator cuts or RBI licensing required.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Institute UPI ID (VPA) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. yourname@okaxis or yourinstitute@icici"
              value={formData.upi_id}
              onChange={(e) => setFormData({ ...formData, upi_id: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Registered Payee Name
            </label>
            <input
              type="text"
              placeholder="e.g. Pratibha Coaching Classes"
              value={formData.upi_name}
              onChange={(e) => setFormData({ ...formData, upi_name: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Save button (min 48px target) */}
        <button
          type="submit"
          className={`w-full min-h-[50px] rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all ${
            savedSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-98'
          }`}
        >
          {savedSuccess ? (
            <>
              <Check size={18} />
              <span>Settings Saved!</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Save Institute Settings</span>
            </>
          )}
        </button>
      </form>

      {/* Account & Session Management */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <User size={16} className="text-slate-600" />
            <h3 className="font-bold text-slate-900 text-sm">Active Account</h3>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <Shield size={11} />
            {user?.role ? user.role.toUpperCase() : 'ADMIN'}
          </span>
        </div>

        <div className="text-xs text-slate-600 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">User:</span>
            <span className="font-semibold text-slate-800">{user?.name || 'Admin User'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Email:</span>
            <span className="font-mono text-slate-700">{user?.email || 'admin@edumanage.in'}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={logoutUser}
          className="w-full min-h-[46px] rounded-xl font-bold text-xs border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center gap-2 transition-colors active:scale-98"
        >
          <LogOut size={16} />
          <span>Sign Out from EduManage</span>
        </button>
      </div>
    </div>
  );
};
