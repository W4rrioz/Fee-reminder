import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';
import BottomNav from '../components/BottomNav';

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function getTodayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export default function AttendancePage() {
  const { getToken } = useAuth();

  const [selectedDate, setSelectedDate] = useState(getTodayStr());
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState({
    totalStudents: 0,
    markedCount: 0,
    unmarkedCount: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unmarked' | 'present' | 'absent' | 'late'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveToast, setSaveToast] = useState(null);
  const [error, setError] = useState('');

  // Fetch attendance data for selected date
  const loadAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = getToken();

      const res = await fetch(`/api/attendance/today?date=${selectedDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to load attendance records.');
      }

      const data = await res.json();
      setStudents(data.students || []);
      setSummary(data.summary || {
        totalStudents: 0,
        markedCount: 0,
        unmarkedCount: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not load attendance.');
    } finally {
      setLoading(false);
    }
  }, [selectedDate, getToken]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  // Handle single student status toggle
  const handleToggleStatus = async (studentId, currentStatus, newStatus) => {
    // If clicking already selected status, toggle to null (unmarked)
    const nextStatus = currentStatus === newStatus ? null : newStatus;

    // Optimistic UI update
    setStudents((prev) =>
      prev.map((st) => (st.id === studentId ? { ...st, status: nextStatus } : st))
    );

    // Update summary locally
    setSummary((prev) => {
      let presentCount = prev.presentCount;
      let absentCount = prev.absentCount;
      let lateCount = prev.lateCount;
      let markedCount = prev.markedCount;

      if (currentStatus === 'present') presentCount--;
      if (currentStatus === 'absent') absentCount--;
      if (currentStatus === 'late') lateCount--;
      if (currentStatus) markedCount--;

      if (nextStatus === 'present') presentCount++;
      if (nextStatus === 'absent') absentCount++;
      if (nextStatus === 'late') lateCount++;
      if (nextStatus) markedCount++;

      return {
        ...prev,
        presentCount,
        absentCount,
        lateCount,
        markedCount,
        unmarkedCount: prev.totalStudents - markedCount,
      };
    });

    try {
      const token = getToken();
      await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId,
          date: selectedDate,
          status: nextStatus,
        }),
      });
    } catch (err) {
      console.error('Failed to update attendance:', err);
      // Revert on error
      loadAttendance();
    }
  };

  // Handle Mark All Present
  const handleMarkAllPresent = async () => {
    if (students.length === 0) return;

    // Optimistic update
    setStudents((prev) => prev.map((st) => ({ ...st, status: 'present' })));
    setSummary({
      totalStudents: students.length,
      markedCount: students.length,
      unmarkedCount: 0,
      presentCount: students.length,
      absentCount: 0,
      lateCount: 0,
    });

    try {
      setSaving(true);
      const token = getToken();
      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: selectedDate,
          markAll: 'present',
        }),
      });

      if (!res.ok) throw new Error('Failed to mark all present.');

      setSaveToast('All students marked present!');
      setTimeout(() => setSaveToast(null), 3000);
    } catch (err) {
      alert(err.message || 'Could not mark all present.');
      loadAttendance();
    } finally {
      setSaving(false);
    }
  };

  // Handle Save Button click (persist bulk changes or confirm)
  const handleSaveAttendance = async () => {
    try {
      setSaving(true);
      const token = getToken();
      const records = students.map((st) => ({
        studentId: st.id,
        status: st.status,
      }));

      const res = await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: selectedDate,
          records,
        }),
      });

      if (!res.ok) throw new Error('Failed to save attendance records.');

      setSaveToast("Today's attendance saved successfully!");
      setTimeout(() => setSaveToast(null), 3000);
      loadAttendance();
    } catch (err) {
      alert(err.message || 'Could not save attendance.');
    } finally {
      setSaving(false);
    }
  };

  // Filter students based on search and active filter tab
  const filteredStudents = useMemo(() => {
    return students.filter((st) => {
      // Tab filter
      if (activeFilter === 'unmarked' && st.status !== null) return false;
      if (activeFilter === 'present' && st.status !== 'present') return false;
      if (activeFilter === 'absent' && st.status !== 'absent') return false;
      if (activeFilter === 'late' && st.status !== 'late') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = st.name?.toLowerCase().includes(q);
        const matchesPhone = st.parent_phone?.includes(q);
        const matchesNote = st.note?.toLowerCase().includes(q);
        return matchesName || matchesPhone || matchesNote;
      }

      return true;
    });
  }, [students, activeFilter, searchQuery]);

  return (
    <div className="page-container">
      {/* App Header */}
      <header className="app-header">
        <div className="app-header-inner">
          <div>
            <h1 style={{ fontSize: 'var(--font-size-lg)', margin: 0, fontWeight: 800 }}>Attendance</h1>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-on-surface-variant)', marginTop: '2px', fontWeight: 600 }}>
              {formatDisplayDate(selectedDate)}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                backgroundColor: 'rgba(21, 128, 61, 0.1)',
                color: '#15803d',
                border: '1px solid rgba(21, 128, 61, 0.25)',
                padding: '4px 10px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              {summary.markedCount}/{summary.totalStudents} Marked
            </span>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Date Navigation Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '8px 12px',
          marginBottom: 'var(--space-3)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary-container)' }}>
            calendar_today
          </span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontFamily: 'inherit',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 700,
              color: 'var(--color-on-surface)',
              cursor: 'pointer',
              outline: 'none',
            }}
          />
        </div>
        {selectedDate !== getTodayStr() && (
          <button
            onClick={() => setSelectedDate(getTodayStr())}
            style={{
              background: 'var(--color-surface-low)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              padding: '4px 8px',
              cursor: 'pointer',
              color: 'var(--color-primary-container)',
            }}
          >
            Go to Today
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="search-container" style={{ marginBottom: 'var(--space-3)' }}>
        <span className="material-symbols-outlined search-icon">search</span>
        <input
          type="text"
          className="search-input"
          placeholder="Search students by name, roll or phone..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Filter Tabs & Mark All Present Action */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-3)',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
        }}
      >
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
          <button
            onClick={() => setActiveFilter('all')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeFilter === 'all' ? 'var(--color-primary-container)' : 'var(--color-surface-card)',
              color: activeFilter === 'all' ? '#ffffff' : 'var(--color-on-surface-variant)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            All ({summary.totalStudents})
          </button>
          <button
            onClick={() => setActiveFilter('unmarked')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeFilter === 'unmarked' ? 'var(--color-primary-container)' : 'var(--color-surface-card)',
              color: activeFilter === 'unmarked' ? '#ffffff' : 'var(--color-on-surface-variant)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            Unmarked ({summary.unmarkedCount})
          </button>
          <button
            onClick={() => setActiveFilter('present')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeFilter === 'present' ? '#15803d' : 'var(--color-surface-card)',
              color: activeFilter === 'present' ? '#ffffff' : 'var(--color-on-surface-variant)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            Present ({summary.presentCount})
          </button>
          <button
            onClick={() => setActiveFilter('absent')}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeFilter === 'absent' ? '#dc2626' : 'var(--color-surface-card)',
              color: activeFilter === 'absent' ? '#ffffff' : 'var(--color-on-surface-variant)',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            }}
          >
            Absent ({summary.absentCount})
          </button>
        </div>

        <button
          onClick={handleMarkAllPresent}
          disabled={saving || students.length === 0}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-primary-container)',
            fontWeight: 800,
            fontSize: 'var(--font-size-xs)',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>done_all</span>
          Mark All Present
        </button>
      </div>

      {/* Save Success Toast */}
      {saveToast && (
        <div className="alert alert-success" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
          <span>{saveToast}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && <div className="alert alert-error">{error}</div>}

      {/* Loading Skeleton */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div className="skeleton-card" style={{ height: 80 }} />
          <div className="skeleton-card" style={{ height: 80 }} />
          <div className="skeleton-card" style={{ height: 80 }} />
        </div>
      ) : students.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-surface-container)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-3)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-primary-container)' }}>
              group_add
            </span>
          </div>
          <h3 style={{ marginBottom: 'var(--space-2)' }}>No students enrolled</h3>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
            Add students to start tracking their daily attendance records.
          </p>
          <Link to="/students/new" className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person_add</span>
            <span>Add Student</span>
          </Link>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6) var(--space-4)' }}>
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--font-size-sm)' }}>
            No students match your filter criteria.
          </p>
        </div>
      ) : (
        /* Student Attendance Rows */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: 'var(--space-4)' }}>
          {filteredStudents.map((student) => {
            const isPresent = student.status === 'present';
            const isAbsent = student.status === 'absent';
            const isLate = student.status === 'late';

            return (
              <div
                key={student.id}
                style={{
                  backgroundColor: 'var(--color-surface-card)',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'var(--space-2)',
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <Link
                    to={`/attendance/student/${student.id}`}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'block',
                    }}
                    title="View Student Attendance Calendar"
                  >
                    <h3
                      style={{
                        fontSize: 'var(--font-size-sm)',
                        fontWeight: 700,
                        color: 'var(--color-on-surface)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <span>{student.name}</span>
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: '15px', color: 'var(--color-primary-container)' }}
                      >
                        calendar_month
                      </span>
                    </h3>
                  </Link>
                  <p
                    style={{
                      fontSize: '11px',
                      color: 'var(--color-on-surface-variant)',
                      marginTop: '2px',
                      fontWeight: 500,
                    }}
                  >
                    {student.note || student.parent_phone}
                  </p>
                </div>

                {/* 3 Toggle Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                  {/* Present */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(student.id, student.status, 'present')}
                    style={{
                      height: '38px',
                      padding: isPresent ? '0 12px' : '0 10px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: isPresent ? '#15803d' : 'var(--color-surface-low)',
                      color: isPresent ? '#ffffff' : 'var(--color-on-surface-variant)',
                      transition: 'all 0.15s ease',
                      boxShadow: isPresent ? '0 1px 3px rgba(21, 128, 61, 0.3)' : 'none',
                    }}
                  >
                    {isPresent && (
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        check
                      </span>
                    )}
                    Present
                  </button>

                  {/* Absent */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(student.id, student.status, 'absent')}
                    style={{
                      height: '38px',
                      padding: isAbsent ? '0 12px' : '0 10px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: isAbsent ? '#dc2626' : 'var(--color-surface-low)',
                      color: isAbsent ? '#ffffff' : 'var(--color-on-surface-variant)',
                      transition: 'all 0.15s ease',
                      boxShadow: isAbsent ? '0 1px 3px rgba(220, 38, 38, 0.3)' : 'none',
                    }}
                  >
                    {isAbsent && (
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        close
                      </span>
                    )}
                    Absent
                  </button>

                  {/* Late */}
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(student.id, student.status, 'late')}
                    style={{
                      height: '38px',
                      padding: isLate ? '0 12px' : '0 10px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 700,
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      backgroundColor: isLate ? '#d97706' : 'var(--color-surface-low)',
                      color: isLate ? '#ffffff' : 'var(--color-on-surface-variant)',
                      transition: 'all 0.15s ease',
                      boxShadow: isLate ? '0 1px 3px rgba(217, 119, 6, 0.3)' : 'none',
                    }}
                  >
                    {isLate && (
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        schedule
                      </span>
                    )}
                    Late
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Save Button */}
      {students.length > 0 && (
        <div style={{ marginTop: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
          <button
            type="button"
            onClick={handleSaveAttendance}
            disabled={saving}
            className="btn btn-primary"
            style={{
              width: '100%',
              minHeight: '48px',
              boxShadow: '0 2px 6px rgba(55, 48, 163, 0.2)',
            }}
          >
            {saving ? (
              <span className="spinner" />
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>save</span>
                <span>Save Today's Attendance</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Bottom Navigation Bar with Attendance Active */}
      <BottomNav active="attendance" />
    </div>
  );
}
