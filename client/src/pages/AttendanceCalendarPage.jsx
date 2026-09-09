import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getYearMonthStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function formatDateStr(year, monthIndex, day) {
  const y = year;
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatLongDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function AttendanceCalendarPage() {
  const { studentId } = useParams();
  const { getToken } = useAuth();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [student, setStudent] = useState(null);
  const [recordMap, setRecordMap] = useState({});
  const [allRecords, setAllRecords] = useState([]);
  const [summary, setSummary] = useState({
    totalDaysMarked: 0,
    presentCount: 0,
    absentCount: 0,
    lateCount: 0,
    presentPercentage: 0,
  });

  const [selectedDayStr, setSelectedDayStr] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const currentYear = currentDate.getFullYear();
  const currentMonthIndex = currentDate.getMonth();
  const monthKey = getYearMonthStr(currentDate);

  // Fetch student attendance records for current month
  const loadStudentAttendance = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const token = getToken();

      const res = await fetch(`/api/attendance/student/${studentId}?month=${monthKey}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error('Student not found.');
        throw new Error('Failed to load attendance records.');
      }

      const data = await res.json();
      setStudent(data.student || null);
      setRecordMap(data.recordMap || {});
      setAllRecords(data.records || []);
      setSummary(data.summary || {
        totalDaysMarked: 0,
        presentCount: 0,
        absentCount: 0,
        lateCount: 0,
        presentPercentage: 0,
      });

      // Default selected date: today or first of month
      const today = new Date();
      const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate());
      if (todayStr.startsWith(monthKey)) {
        setSelectedDayStr(todayStr);
      } else {
        setSelectedDayStr(formatDateStr(currentYear, currentMonthIndex, 1));
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Could not load student attendance.');
    } finally {
      setLoading(false);
    }
  }, [studentId, monthKey, currentYear, currentMonthIndex, getToken]);

  useEffect(() => {
    loadStudentAttendance();
  }, [loadStudentAttendance]);

  // Navigate months
  const handlePrevMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Update attendance for selected day
  const handleSetStatus = async (newStatus) => {
    if (!selectedDayStr || !student) return;

    const currentStatus = recordMap[selectedDayStr] || null;
    const finalStatus = currentStatus === newStatus ? null : newStatus;

    // Optimistic update
    const updatedMap = { ...recordMap };
    if (finalStatus) {
      updatedMap[selectedDayStr] = finalStatus;
    } else {
      delete updatedMap[selectedDayStr];
    }
    setRecordMap(updatedMap);

    // Recompute summary for this month
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let totalDaysMarked = 0;

    Object.entries(updatedMap).forEach(([date, st]) => {
      if (date.startsWith(monthKey)) {
        totalDaysMarked++;
        if (st === 'present') presentCount++;
        else if (st === 'absent') absentCount++;
        else if (st === 'late') lateCount++;
      }
    });

    const presentPercentage = totalDaysMarked > 0
      ? Math.round((presentCount / totalDaysMarked) * 100)
      : 0;

    setSummary({
      totalDaysMarked,
      presentCount,
      absentCount,
      lateCount,
      presentPercentage,
    });

    try {
      setUpdating(true);
      const token = getToken();
      await fetch('/api/attendance/mark', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: student.id,
          date: selectedDayStr,
          status: finalStatus,
        }),
      });
    } catch (err) {
      console.error('Failed to update status:', err);
      loadStudentAttendance();
    } finally {
      setUpdating(false);
    }
  };

  // Export attendance records as CSV
  const handleExportCSV = () => {
    if (!student) return;
    const records = Object.entries(recordMap)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, status]) => `"${date}","${status}"`);

    const csvContent = [
      `"Student Name","${student.name}"`,
      `"Parent Phone","${student.parent_phone}"`,
      `"Note","${student.note || ''}"`,
      `"Export Date","${new Date().toISOString()}"`,
      '',
      '"Date","Status"',
      ...records,
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${student.name.replace(/\s+/g, '_')}_Attendance.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Build calendar matrix (Mon - Sun)
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonthIndex, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonthIndex + 1, 0);

    const totalDaysInMonth = lastDayOfMonth.getDate();

    // Monday-indexed day of week: 0=Mon, 1=Tue, ..., 6=Sun
    let startDayOfWeek = firstDayOfMonth.getDay() - 1;
    if (startDayOfWeek === -1) startDayOfWeek = 6;

    // Previous month filler days
    const prevMonthLastDay = new Date(currentYear, currentMonthIndex, 0).getDate();
    const cells = [];

    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      cells.push({
        dayNumber: prevMonthLastDay - i,
        dateStr: null,
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateStr = formatDateStr(currentYear, currentMonthIndex, d);
      const status = recordMap[dateStr] || null;
      cells.push({
        dayNumber: d,
        dateStr,
        isCurrentMonth: true,
        status,
      });
    }

    // Next month filler days to complete 7-column rows
    const remainder = cells.length % 7;
    if (remainder !== 0) {
      const daysToAdd = 7 - remainder;
      for (let d = 1; d <= daysToAdd; d++) {
        cells.push({
          dayNumber: d,
          dateStr: null,
          isCurrentMonth: false,
        });
      }
    }

    return cells;
  }, [currentYear, currentMonthIndex, recordMap]);

  if (loading && !student) {
    return (
      <div className="page-container" style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
        <div className="spinner spinner-primary" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="page-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
          <Link to="/attendance" className="nav-btn" style={{ width: '40px', height: '40px', padding: 0, justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
          </Link>
          <h1>Student Attendance</h1>
        </div>
        <div className="alert alert-error">{error || 'Student not found.'}</div>
        <Link to="/attendance" className="btn btn-secondary">
          Back to Attendance
        </Link>
      </div>
    );
  }

  const selectedDayStatus = selectedDayStr ? (recordMap[selectedDayStr] || null) : null;

  return (
    <div className="page-container">
      {/* Top Header Bar */}
      <header className="app-header">
        <div className="app-header-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              to="/attendance"
              className="nav-btn"
              style={{ width: '38px', height: '38px', padding: 0, justifyContent: 'center' }}
              title="Back to Attendance"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
            </Link>
            <div>
              <h1 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                {student.name} — Attendance
              </h1>
              <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', fontWeight: 600, marginTop: '2px' }}>
                {student.note || student.parent_phone}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ThemeToggle />
            <button
              onClick={handleExportCSV}
              className="btn btn-secondary"
              style={{
                padding: '6px 12px',
                minHeight: '34px',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                color: 'var(--color-primary-container)',
                backgroundColor: 'rgba(55, 48, 163, 0.08)',
                border: '1px solid rgba(55, 48, 163, 0.2)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Export attendance records"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>download</span>
              Export
            </button>
          </div>
        </div>
      </header>

      {/* Stat Hero Banner */}
      <div
        style={{
          backgroundColor: 'var(--color-surface-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
        }}
      >
        <div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 800,
              color: 'var(--color-on-surface-variant)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Monthly Metric
          </span>
          <div
            style={{
              fontSize: 'var(--font-size-lg)',
              fontWeight: 900,
              color: summary.presentPercentage >= 75 ? '#15803d' : summary.presentPercentage >= 50 ? '#d97706' : '#dc2626',
              marginTop: '2px',
            }}
          >
            {summary.presentPercentage}% present this month
          </div>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-on-surface-variant)', marginTop: '4px', fontWeight: 600 }}>
            {summary.presentCount} Present · {summary.absentCount} Absent · {summary.lateCount} Late
          </p>
        </div>

        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'rgba(21, 128, 61, 0.12)',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span className="material-symbols-outlined fill" style={{ fontSize: '26px' }}>
            workspace_premium
          </span>
        </div>
      </div>

      {/* Calendar Container */}
      <div
        style={{
          backgroundColor: 'var(--color-surface-card)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-border)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-3)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
        }}
      >
        {/* Month Navigation Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
          <button
            type="button"
            onClick={handlePrevMonth}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-card)',
              color: 'var(--color-on-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Previous Month"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_left</span>
          </button>

          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--color-on-surface)' }}>
            {MONTH_NAMES[currentMonthIndex]} {currentYear}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface-card)',
              color: 'var(--color-on-surface)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Next Month"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>chevron_right</span>
          </button>
        </div>

        {/* Weekday Labels (Mon - Sun) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            textAlign: 'center',
            fontSize: '11px',
            fontWeight: 800,
            color: 'var(--color-outline)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            paddingBottom: '8px',
          }}
        >
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
          <span>Sun</span>
        </div>

        {/* Days Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            gap: '6px',
            textAlign: 'center',
          }}
        >
          {calendarCells.map((cell, idx) => {
            if (!cell.isCurrentMonth) {
              return (
                <div
                  key={`filler-${idx}`}
                  style={{
                    height: '40px',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-outline-variant)',
                  }}
                >
                  {cell.dayNumber}
                </div>
              );
            }

            const isSelected = cell.dateStr === selectedDayStr;
            const status = cell.status;
            let statusClass = 'day-future';
            if (status === 'present') statusClass = 'day-present';
            else if (status === 'absent') statusClass = 'day-absent';
            else if (status === 'late') statusClass = 'day-late';

            return (
              <button
                key={`day-${cell.dateStr}`}
                type="button"
                onClick={() => setSelectedDayStr(cell.dateStr)}
                className={statusClass}
                style={{
                  height: '40px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 700,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: isSelected ? '2.5px solid var(--color-primary-container)' : '1px solid transparent',
                  boxShadow: isSelected ? '0 0 0 2px rgba(55, 48, 163, 0.3)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                }}
              >
                {cell.dayNumber}
              </button>
            );
          })}
        </div>

        {/* Color Legend */}
        <div
          style={{
            marginTop: 'var(--space-4)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            fontWeight: 700,
            color: 'var(--color-on-surface-variant)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#15803d' }} />
            <span>Present</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#dc2626' }} />
            <span>Absent</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#d97706' }} />
            <span>Late</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: 'var(--color-surface-high)' }} />
            <span>Unmarked</span>
          </div>
        </div>
      </div>

      {/* Inline Edit Status Box for Selected Date */}
      {selectedDayStr && (
        <div
          style={{
            backgroundColor: 'rgba(55, 48, 163, 0.06)',
            border: '1px solid rgba(55, 48, 163, 0.2)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--color-on-surface)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-primary-container)' }}>
                edit_calendar
              </span>
              Edit Status for {formatLongDate(selectedDayStr)}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 800,
                color: selectedDayStatus === 'present' ? '#15803d' : selectedDayStatus === 'absent' ? '#dc2626' : selectedDayStatus === 'late' ? '#d97706' : 'var(--color-outline)',
                textTransform: 'uppercase',
              }}
            >
              Currently: {selectedDayStatus || 'Unmarked'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {/* Present Button */}
            <button
              type="button"
              disabled={updating}
              onClick={() => handleSetStatus('present')}
              style={{
                height: '42px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                backgroundColor: selectedDayStatus === 'present' ? '#15803d' : 'var(--color-surface-card)',
                color: selectedDayStatus === 'present' ? '#ffffff' : 'var(--color-on-surface)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: selectedDayStatus === 'present' ? '#15803d' : 'var(--color-border)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
              Present
            </button>

            {/* Absent Button */}
            <button
              type="button"
              disabled={updating}
              onClick={() => handleSetStatus('absent')}
              style={{
                height: '42px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                backgroundColor: selectedDayStatus === 'absent' ? '#dc2626' : 'var(--color-surface-card)',
                color: selectedDayStatus === 'absent' ? '#ffffff' : 'var(--color-on-surface)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: selectedDayStatus === 'absent' ? '#dc2626' : 'var(--color-border)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
              Absent
            </button>

            {/* Late Button */}
            <button
              type="button"
              disabled={updating}
              onClick={() => handleSetStatus('late')}
              style={{
                height: '42px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 800,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                backgroundColor: selectedDayStatus === 'late' ? '#d97706' : 'var(--color-surface-card)',
                color: selectedDayStatus === 'late' ? '#ffffff' : 'var(--color-on-surface)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: selectedDayStatus === 'late' ? '#d97706' : 'var(--color-border)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>schedule</span>
              Late
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
