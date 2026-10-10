import React, { useState } from 'react';
import {
  Calendar,
  Check,
  X,
  Clock,
  CheckCheck,
  Save,
  Users,
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AttendanceScreen = () => {
  const {
    terms,
    classesBatches,
    students,
    attendance,
    markBulkAttendance,
    isOnline
  } = useApp();

  const [selectedBatchId, setSelectedBatchId] = useState(
    classesBatches[0]?.id || ''
  );
  const [selectedDate, setSelectedDate] = useState('2026-10-07');
  const [statusMap, setStatusMap] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Filter students by selected batch
  const batchStudents = students.filter(
    (s) => s.class_batch_id === selectedBatchId
  );

  // Load existing records on batch or date change
  React.useEffect(() => {
    const key = `${selectedDate}_${selectedBatchId}`;
    const existing = attendance[key] || {};

    const initial = {};
    batchStudents.forEach((st) => {
      // Default to existing record or 'present'
      initial[st.id] = existing[st.id] || 'present';
    });
    setStatusMap(initial);
    setHasChanges(false);
    setSavedSuccess(false);
  }, [selectedBatchId, selectedDate, attendance, students]);

  // Bulk action: Mark All Present
  const handleMarkAllPresent = () => {
    const next = {};
    batchStudents.forEach((st) => {
      next[st.id] = 'present';
    });
    setStatusMap(next);
    setHasChanges(true);
  };

  // Bulk action: Mark All Absent
  const handleMarkAllAbsent = () => {
    const next = {};
    batchStudents.forEach((st) => {
      next[st.id] = 'absent';
    });
    setStatusMap(next);
    setHasChanges(true);
  };

  // Single tap cycle status: present -> absent -> late -> present
  const toggleStudentStatus = (studentId) => {
    const current = statusMap[studentId] || 'present';
    let nextStatus = 'absent';
    if (current === 'present') nextStatus = 'absent';
    else if (current === 'absent') nextStatus = 'late';
    else if (current === 'late') nextStatus = 'present';

    setStatusMap((prev) => ({
      ...prev,
      [studentId]: nextStatus
    }));
    setHasChanges(true);
  };

  // Specific tap button
  const setSpecificStatus = (studentId, status, e) => {
    e.stopPropagation();
    setStatusMap((prev) => ({
      ...prev,
      [studentId]: status
    }));
    setHasChanges(true);
  };

  // Save attendance
  const handleSave = () => {
    markBulkAttendance(selectedBatchId, selectedDate, statusMap);
    setHasChanges(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Summary counts
  const presentCount = Object.values(statusMap).filter((s) => s === 'present').length;
  const absentCount = Object.values(statusMap).filter((s) => s === 'absent').length;
  const lateCount = Object.values(statusMap).filter((s) => s === 'late').length;

  return (
    <div className="space-y-4 pb-20">
      {/* Header and selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-black text-slate-900">
            Bulk Attendance
          </h2>
          <span className="text-xs bg-blue-50 text-blue-700 font-bold px-2 py-1 rounded-lg border border-blue-100">
            {batchStudents.length} Students
          </span>
        </div>

        {/* Batch & Date Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Select {terms.classOrBatch}
            </label>
            <div className="relative">
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {classesBatches.map((cb) => (
                  <option key={cb.id} value={cb.id}>
                    {cb.name} ({cb.code})
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-3 top-3.5 text-slate-500 pointer-events-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Quick Tally Chips */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2 text-center">
            <span className="text-[10px] font-bold uppercase text-emerald-700 block">
              Present
            </span>
            <span className="text-base font-black text-emerald-800">
              {presentCount}
            </span>
          </div>
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-2 text-center">
            <span className="text-[10px] font-bold uppercase text-rose-700 block">
              Absent
            </span>
            <span className="text-base font-black text-rose-800">
              {absentCount}
            </span>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-center">
            <span className="text-[10px] font-bold uppercase text-amber-700 block">
              Late
            </span>
            <span className="text-base font-black text-amber-800">
              {lateCount}
            </span>
          </div>
        </div>
      </div>

      {/* FAST ACTION BAR FOR MINIMAL TAPS */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleMarkAllPresent}
          className="flex-1 min-h-[48px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-98 transition-transform"
        >
          <CheckCheck size={16} />
          <span>Mark All Present</span>
        </button>

        <button
          onClick={handleMarkAllAbsent}
          className="px-3 min-h-[48px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1 border border-slate-200 active:scale-98"
        >
          <span>All Absent</span>
        </button>
      </div>

      {/* STUDENT ATTENDANCE LIST - SINGLE TAP TOGGLE DESIGN */}
      <div className="space-y-2">
        <div className="text-xs text-slate-500 font-medium px-1 flex items-center justify-between">
          <span>Tap row to cycle status (Present → Absent → Late)</span>
          <span className="text-slate-400">Minimal taps</span>
        </div>

        {batchStudents.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <Users size={32} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-600">
              No students found in this {terms.classOrBatch.toLowerCase()}
            </p>
          </div>
        ) : (
          batchStudents.map((st) => {
            const status = statusMap[st.id] || 'present';
            return (
              <div
                key={st.id}
                onClick={() => toggleStudentStatus(st.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 min-h-[64px] active:scale-[0.99] select-none ${
                  status === 'present'
                    ? 'bg-white border-emerald-300 shadow-xs ring-1 ring-emerald-500/10'
                    : status === 'absent'
                    ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-500/20'
                    : 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-500/20'
                }`}
              >
                {/* Roll No & Student Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      status === 'present'
                        ? 'bg-emerald-100 text-emerald-800'
                        : status === 'absent'
                        ? 'bg-rose-200 text-rose-800'
                        : 'bg-amber-200 text-amber-800'
                    }`}
                  >
                    #{st.roll_no}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {st.name}
                    </h4>
                    <p className="text-xs text-slate-500 truncate">
                      Parent: {st.guardian_name} ({st.guardian_phone})
                    </p>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => setSpecificStatus(st.id, 'present', e)}
                    className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center transition-all ${
                      status === 'present'
                        ? 'bg-emerald-600 text-white font-bold shadow-xs scale-105'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                    title="Present"
                  >
                    <Check size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => setSpecificStatus(st.id, 'absent', e)}
                    className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center transition-all ${
                      status === 'absent'
                        ? 'bg-rose-600 text-white font-bold shadow-xs scale-105'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                    title="Absent"
                  >
                    <X size={18} />
                  </button>

                  <button
                    type="button"
                    onClick={(e) => setSpecificStatus(st.id, 'late', e)}
                    className={`min-h-[44px] min-w-[44px] rounded-xl flex items-center justify-center transition-all ${
                      status === 'late'
                        ? 'bg-amber-500 text-white font-bold shadow-xs scale-105'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                    title="Late"
                  >
                    <Clock size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* FLOATING / STICKY SAVE BUTTON */}
      <div className="fixed bottom-16 left-0 right-0 p-3 max-w-lg mx-auto pointer-events-none z-20">
        <button
          onClick={handleSave}
          className={`pointer-events-auto w-full min-h-[52px] rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 ${
            savedSuccess
              ? 'bg-emerald-600 text-white'
              : hasChanges
              ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 animate-pulse'
              : 'bg-slate-900 hover:bg-black text-white'
          }`}
        >
          {savedSuccess ? (
            <>
              <CheckCheck size={18} />
              <span>Saved Successfully {!isOnline ? '(Saved Offline)' : ''}</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>
                {hasChanges ? 'Save Attendance Records' : 'Attendance Saved (Tap to re-save)'}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
