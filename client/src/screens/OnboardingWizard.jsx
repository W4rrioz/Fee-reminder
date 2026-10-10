import React, { useState } from 'react';
import {
  School,
  BookOpen,
  GraduationCap,
  Building2,
  MapPin,
  QrCode,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Info,
  Loader2,
  ShieldCheck,
  Plus,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const OnboardingWizard = () => {
  const { user, completeOnboarding, isOnline } = useApp();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  // Step 1: Institute Type
  const [instituteType, setInstituteType] = useState('coaching_center');

  // Step 2: Name & City
  const [instituteName, setInstituteName] = useState('');
  const [city, setCity] = useState('');

  // Step 3: Direct UPI Details
  const [upiId, setUpiId] = useState('');
  const [upiName, setUpiName] = useState('');

  // Step 4: Initial Classes / Batches
  const [batchTags, setBatchTags] = useState(['Batch 10A', 'Batch 10B', 'Batch 12th Science']);
  const [newTagInput, setNewTagInput] = useState('');

  // Handle Tag Addition
  const handleAddTag = () => {
    if (newTagInput.trim() && !batchTags.includes(newTagInput.trim())) {
      setBatchTags([...batchTags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setBatchTags(batchTags.filter((t) => t !== tagToRemove));
  };

  // Pre-fill institute type suggestions
  const handleTypeSelect = (type) => {
    setInstituteType(type);
    if (type === 'school') {
      setBatchTags(['Class 9A', 'Class 10A', 'Class 10B', 'Class 11 Science', 'Class 12 Science']);
    } else if (type === 'tutor') {
      setBatchTags(['Morning Batch (Math)', 'Evening Batch (Physics)']);
    } else {
      setBatchTags(['Batch 10A', 'Batch 10B', 'Batch 12th Science']);
    }
  };

  const handleNextStep = (e) => {
    if (e) e.preventDefault();
    setError('');

    if (step === 2) {
      if (!instituteName.trim()) {
        setError('Please provide your Institute / School name.');
        return;
      }
    }

    if (step === 3) {
      if (!upiId.trim()) {
        setError('Please provide a UPI ID for direct parent payments.');
        return;
      }
    }

    if (step < 4) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    setLoading(true);
    setError('');

    const payload = {
      userId: user?.id || `user_${Date.now()}`,
      instituteName: instituteName.trim() || 'My Academy',
      instituteType,
      city: city.trim() || 'Kanpur',
      upiId: upiId.trim(),
      upiName: upiName.trim() || instituteName.trim(),
      initialBatches: batchTags.length > 0 ? batchTags : ['Batch 10A', 'Batch 10B']
    };

    try {
      let createdInstitute = null;
      let createdClasses = null;

      if (isOnline) {
        try {
          const res = await fetch('http://localhost:5000/api/auth/onboarding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          const data = await res.json();
          if (res.ok && data.institute) {
            createdInstitute = data.institute;
            createdClasses = data.classes;
          }
        } catch (fetchErr) {
          console.warn('Backend onboarding API unavailable, using offline client setup:', fetchErr.message);
        }
      }

      // Offline fallback / local setup
      if (!createdInstitute) {
        createdInstitute = {
          id: `inst_loc_${Date.now()}`,
          name: payload.instituteName,
          type: payload.instituteType,
          city: payload.city,
          upi_id: payload.upiId,
          upi_name: payload.upiName
        };

        createdClasses = payload.initialBatches.map((bName, i) => ({
          id: `cb_loc_${Date.now()}_${i}`,
          name: bName,
          type: 'batch',
          fee_amount: 1500
        }));
      }

      completeOnboarding(createdInstitute, createdClasses);
    } catch (err) {
      setError(err.message || 'Error completing onboarding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Stepper */}
      <div className="relative z-10 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm">
              {step}/4
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-400">
                Setup Wizard
              </span>
              <h2 className="text-sm font-bold text-white">
                {step === 1 && 'Institute Type'}
                {step === 2 && 'Institute Profile'}
                {step === 3 && 'Direct UPI Setup'}
                {step === 4 && 'Initial Classes & Batches'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s === step
                    ? 'w-6 bg-blue-500'
                    : s < step
                    ? 'w-3 bg-emerald-500'
                    : 'w-3 bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="relative z-10 my-4 bg-slate-800/90 backdrop-blur-md border border-slate-700 rounded-2xl p-4 sm:p-5 shadow-xl">
        {error && (
          <div className="mb-4 bg-rose-500/15 border border-rose-500/40 rounded-xl p-3 flex items-start gap-2 text-rose-300 text-xs">
            <Info size={16} className="shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Institute Type Selector */}
        {step === 1 && (
          <div className="space-y-3.5">
            <div>
              <h3 className="text-lg font-bold text-white">
                What type of institute are you running?
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                EduManage adapts all labels (Classes, Batches, Terms) to suit your format.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {[
                {
                  id: 'school',
                  title: 'School / College',
                  desc: 'Uses Class & Sections (e.g. 10th A), term fees, roll numbers.',
                  icon: School,
                  badge: 'Standard K-12'
                },
                {
                  id: 'coaching_center',
                  title: 'Coaching Center / Institute',
                  desc: 'Uses Batches (e.g. JEE Crash, 10th Maths), monthly tuition cycles.',
                  icon: Building2,
                  badge: 'Most Popular'
                },
                {
                  id: 'tutor',
                  title: 'Independent Tutor / Educator',
                  desc: 'Uses small batches or 1-on-1 sessions, per-subject fees.',
                  icon: BookOpen,
                  badge: 'Flexible'
                }
              ].map((item) => {
                const Icon = item.icon;
                const isSelected = instituteType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleTypeSelect(item.id)}
                    className={`p-3.5 rounded-xl border text-left flex items-start gap-3 transition-all ${
                      isSelected
                        ? 'bg-blue-600/20 border-blue-500 ring-2 ring-blue-500/30'
                        : 'bg-slate-900/60 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white">
                          {item.title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-blue-500/30 text-blue-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: Institute Name & City */}
        {step === 2 && (
          <div className="space-y-3.5">
            <div>
              <h3 className="text-lg font-bold text-white">
                Institute Name & Location
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                This name will appear on student receipts, WhatsApp reminders, and reports.
              </p>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Institute / Academy Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <GraduationCap size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bright Academy Kanpur"
                    value={instituteName}
                    onChange={(e) => setInstituteName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  City / Town (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <MapPin size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Kanpur, Lucknow, Patna"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Direct UPI ID & Registered Name */}
        {step === 3 && (
          <div className="space-y-3.5">
            <div>
              <h3 className="text-lg font-bold text-white">
                Direct UPI ID Setup
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Parents pay fees directly to this UPI ID via Google Pay, PhonePe, Paytm, etc.
              </p>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3 flex items-start gap-2.5 text-emerald-300 text-xs">
              <ShieldCheck size={18} className="shrink-0 text-emerald-400 mt-0.5" />
              <div>
                <strong className="font-bold text-emerald-200">0% Gateway Commission</strong>
                <p className="text-[11px] text-emerald-300/90 mt-0.5">
                  100% of parents' payments go straight into your bank. No payment gateway aggregator or license required.
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  UPI ID (VPA) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <QrCode size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. bright@upi or academy@icici"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-sm font-mono font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Registered UPI Payee Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bright Academy Kanpur"
                  value={upiName}
                  onChange={(e) => setUpiName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Initial Classes / Batches */}
        {step === 4 && (
          <div className="space-y-3.5">
            <div>
              <h3 className="text-lg font-bold text-white">
                Initial Classes / Batches
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Set up your starting batches. You can always add or customize more later.
              </p>
            </div>

            {/* Quick Tag Display */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Batches to create ({batchTags.length})
              </label>
              <div className="flex flex-wrap gap-2 min-h-[44px] p-2 bg-slate-900/80 border border-slate-700 rounded-xl">
                {batchTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-600/30 text-blue-200 border border-blue-500/40"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-blue-300 hover:text-white"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Add tag input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add another batch (e.g. Batch 11 JEE)..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3.5 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Add</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="relative z-10 flex items-center gap-3 pb-2">
        {step > 1 && (
          <button
            type="button"
            disabled={loading}
            onClick={() => setStep(step - 1)}
            className="min-h-[50px] px-4 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={handleNextStep}
          className="flex-1 min-h-[50px] rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 disabled:opacity-60 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-98"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              <span>Setting up Institute...</span>
            </>
          ) : step === 4 ? (
            <>
              <Sparkles size={16} className="text-amber-300" />
              <span>Complete Setup & Enter EduManage</span>
            </>
          ) : (
            <>
              <span>Continue</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
