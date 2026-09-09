import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReminderModal from '../components/ReminderModal';
import MarkPaidModal from '../components/MarkPaidModal';
import UndoToast from '../components/UndoToast';
import ThemeToggle from '../components/ThemeToggle';
import RemindAllModal from '../components/RemindAllModal';
import BulkFeeUpdateModal from '../components/BulkFeeUpdateModal';

const CACHE_KEY = 'feereminder_dashboard_cache';

/**
 * Screen: Dashboard (Ledger Calm design per mockups)
 *  - Primary view: students with pending/overdue fees, most urgent first.
 *  - Status indicator rails (6px left border on cards).
 *  - 2-column metrics cards with background iconography.
 *  - Quick actions per card: "💬 Remind" and "✓ Mark as Paid".
 *  - Bottom navigation bar with direct link triggers.
 */
export default function DashboardPage() {
  const { signOut, getToken } = useAuth();
  const [tenantInfo, setTenantInfo] = useState(null);
  const [tenantSettings, setTenantSettings] = useState(null);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isUsingCache, setIsUsingCache] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'all' | 'paid'

  // Modal states
  const [reminderStudent, setReminderStudent] = useState(null);
  const [markPaidStudent, setMarkPaidStudent] = useState(null);
  const [isRemindAllOpen, setIsRemindAllOpen] = useState(false);
  const [isBulkUpdateOpen, setIsBulkUpdateOpen] = useState(false);

  // Undo Toast state
  const [undoToast, setUndoToast] = useState(null);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      setIsUsingCache(false);
      const token = getToken();

      const [authRes, settingsRes, studentsRes] = await Promise.all([
        fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/settings', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/students', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!authRes.ok || !studentsRes.ok) {
        throw new Error('Could not connect to server.');
      }

      const authData = await authRes.json();
      const settingsData = settingsRes.ok ? await settingsRes.json() : null;
      const studentsData = await studentsRes.json();

      setTenantInfo(authData.admin);
      if (settingsData?.settings) {
        setTenantSettings(settingsData.settings);
      }
      setStudents(studentsData.students || []);
      setSummary(studentsData.summary || null);

      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            tenantInfo: authData.admin,
            tenantSettings: settingsData?.settings || null,
            students: studentsData.students || [],
            summary: studentsData.summary || null,
            cachedAt: new Date().toISOString(),
          })
        );
      } catch {
        // Ignore localStorage quota errors
      }
    } catch (err) {
      console.warn('Dashboard fetch failed, checking cache:', err);
      const rawCache = localStorage.getItem(CACHE_KEY);
      if (rawCache) {
        try {
          const cached = JSON.parse(rawCache);
          setTenantInfo(cached.tenantInfo);
          setTenantSettings(cached.tenantSettings || null);
          setStudents(cached.students || []);
          setSummary(cached.summary || null);
          setIsUsingCache(true);
        } catch {
          setError(err.message || 'Failed to load dues.');
        }
      } else {
        setError(err.message || 'Failed to load dues.');
      }
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Handle Mark as Paid confirmation
  function handlePaidConfirmed(updatedFee, student) {
    setUndoToast({
      feeId: updatedFee.id,
      studentName: student.name,
      amount: updatedFee.amount,
    });

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === student.id) {
          return {
            ...s,
            fee: {
              ...s.fee,
              status: 'paid',
              paid_at: updatedFee.paid_at,
            },
          };
        }
        return s;
      })
    );

    loadDashboardData();
  }

  // Handle Undo Revert
  async function handleUndo(feeId) {
    try {
      const token = getToken();
      const res = await fetch(`/api/fees/${feeId}/revert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        setUndoToast(null);
        loadDashboardData();
      }
    } catch (err) {
      console.error('Failed to revert fee:', err);
    }
  }

  // Filter students based on active tab and search query
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const status = student.fee?.status;
      if (activeTab === 'pending') {
        if (status !== 'overdue' && status !== 'pending') return false;
      } else if (activeTab === 'paid') {
        if (status !== 'paid') return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = student.name?.toLowerCase().includes(q);
        const matchesPhone = student.parent_phone?.includes(q);
        return matchesName || matchesPhone;
      }

      return true;
    });
  }, [students, activeTab, searchQuery]);

  const overdueStudents = useMemo(() => {
    return students.filter((s) => s.fee?.status === 'overdue');
  }, [students]);

  const hasConfiguredPayment = Boolean(
    tenantSettings?.upi_id?.trim() || tenantSettings?.bank_details?.trim()
  );

  // Skeleton Loader View
  if (loading) {
    return (
      <div className="page-container">
        <header className="app-header">
          <div className="app-header-inner">
            <div className="app-brand">
              <div className="app-logo-icon">
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>account_balance</span>
              </div>
              <span className="app-brand-title">FeeReminder</span>
            </div>
            <ThemeToggle />
          </div>
        </header>
        <div className="metrics-row">
          <div className="skeleton-card" style={{ height: 100 }} />
          <div className="skeleton-card" style={{ height: 100 }} />
        </div>
        <div className="skeleton-card" style={{ height: 140 }} />
        <div className="skeleton-card" style={{ height: 140 }} />
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* App Header Bar */}
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-brand">
            <div className="app-logo-icon">
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>account_balance</span>
            </div>
            <span className="app-brand-title">FeeReminder</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <ThemeToggle />
            <Link to="/settings" className="nav-btn" title="Institute Settings">
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>settings</span>
              <span style={{ fontSize: 'var(--font-size-xs)' }}>Settings</span>
            </Link>
            <button
              onClick={signOut}
              className="nav-btn"
              style={{ color: 'var(--color-error)' }}
              title="Sign Out"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Institute Context & Heading */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <h1 style={{ fontSize: 'var(--font-size-xl)' }}>Dashboard</h1>
        {tenantInfo && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px', color: 'var(--color-on-surface-variant)' }}>
            <span className="material-symbols-outlined fill" style={{ fontSize: '16px', color: 'var(--color-primary-container)' }}>
              school
            </span>
            <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
              {tenantInfo.tenant_name}
            </p>
          </div>
        )}
      </div>

      {/* Cached / Offline Fallback Notice */}
      {isUsingCache && (
        <div className="alert alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ Showing cached dues list (offline / network error)</span>
          <button
            onClick={loadDashboardData}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-warning)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Missing Payment Info Prompt Banner */}
      {!hasConfiguredPayment && !loading && (
        <div className="alert alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong style={{ fontSize: 'var(--font-size-sm)' }}>Set up your payment details</strong>
            <p style={{ fontSize: 'var(--font-size-xs)', marginTop: '2px' }}>
              Add your UPI ID so WhatsApp fee reminders include how to pay.
            </p>
          </div>
          <Link
            to="/settings"
            className="btn btn-primary"
            style={{ width: 'auto', minHeight: '36px', padding: '6px 12px', fontSize: 'var(--font-size-xs)', flexShrink: 0 }}
          >
            Setup UPI
          </Link>
        </div>
      )}

      {/* Error State */}
      {error && !isUsingCache && (
        <div className="alert alert-error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button
            onClick={loadDashboardData}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-error)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Metric Overview Cards (2-column tactile grid) */}
      <div className="metrics-row">
        {/* Card 1: Total Outstanding */}
        <div className="metric-card">
          <div className="metric-icon-bg" style={{ backgroundColor: 'var(--color-primary-fixed)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-primary)' }}>
              account_balance_wallet
            </span>
          </div>
          <span className="metric-label">Total Outstanding</span>
          <div className="metric-value tabular-nums">
            ₹{summary ? summary.totalDueAmount.toLocaleString('en-IN') : '0'}
          </div>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>priority_high</span>
            {summary ? summary.overdueCount + summary.pendingCount : 0} dues pending
          </span>
        </div>

        {/* Card 2: Overdue Count */}
        <div className="metric-card">
          <div className="metric-icon-bg" style={{ backgroundColor: 'var(--color-error-container)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-error)' }}>
              warning
            </span>
          </div>
          <span className="metric-label">Overdue Students</span>
          <div className="metric-value tabular-nums" style={{ color: (summary?.overdueCount || 0) > 0 ? 'var(--color-error)' : 'var(--color-on-surface)' }}>
            {summary ? summary.overdueCount : 0}
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500, color: 'var(--color-on-surface-variant)', marginLeft: '4px' }}>
              / {students.length} total
            </span>
          </div>
          <span style={{ fontSize: 'var(--font-size-xs)', color: (summary?.overdueCount || 0) > 0 ? 'var(--color-error)' : 'var(--color-tertiary-container)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              {(summary?.overdueCount || 0) > 0 ? 'event_busy' : 'check_circle'}
            </span>
            {(summary?.overdueCount || 0) > 0 ? 'Urgent action required' : 'All accounts healthy'}
          </span>
        </div>
      </div>

      {/* Primary CTAs: Add Student & Bulk Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
        <Link to="/students/new" className="btn btn-primary" id="btn-add-student" style={{ minHeight: '44px', padding: '8px 12px', fontSize: 'var(--font-size-sm)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>person_add</span>
          <span>Add Student</span>
        </Link>
        <button
          type="button"
          onClick={() => setIsBulkUpdateOpen(true)}
          className="btn btn-secondary"
          style={{ minHeight: '44px', padding: '8px 12px', fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>price_change</span>
          <span>Bulk Actions</span>
        </button>
      </div>

      {/* Remind All Overdue Banner */}
      {overdueStudents.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-secondary-fixed)',
            border: '1px solid var(--color-secondary-container)',
            padding: 'var(--space-3) var(--space-4)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: 'var(--space-4)',
            boxShadow: '0 2px 4px rgba(217, 119, 6, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'rgba(217, 119, 6, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-secondary-container)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                notifications_active
              </span>
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--color-on-secondary-fixed)' }}>
                {overdueStudents.length} Overdue Dues
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>
                Queue one-tap WhatsApp reminders
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsRemindAllOpen(true)}
            className="btn btn-secondary"
            style={{
              backgroundColor: 'var(--color-secondary-container)',
              color: '#ffffff',
              fontSize: 'var(--font-size-xs)',
              padding: '6px 12px',
              minHeight: '36px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: 'none',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>send</span>
            Remind All ({overdueStudents.length})
          </button>
        </div>
      )}

      {/* Search & Segmented Filter Tabs */}
      {students.length > 0 && (
        <div style={{ marginBottom: 'var(--space-3)' }}>
          {/* Search Bar */}
          <div className="search-container">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by student name or parent phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Segmented Filter Tabs */}
          <div className="tabs-container" role="tablist">
            <button
              className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
              role="tab"
              type="button"
            >
              <span>Pending Dues</span>
              <span className="tab-badge">{summary ? summary.overdueCount + summary.pendingCount : 0}</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
              role="tab"
              type="button"
            >
              <span>All Students</span>
              <span className="tab-badge">{students.length}</span>
            </button>
            <button
              className={`tab-button ${activeTab === 'paid' ? 'active' : ''}`}
              onClick={() => setActiveTab('paid')}
              role="tab"
              type="button"
            >
              <span>Paid</span>
              <span className="tab-badge">{summary ? summary.paidCount : 0}</span>
            </button>
          </div>
        </div>
      )}

      {/* Student Ledger Card List */}
      {students.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-surface-container)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-3)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-primary-container)' }}>group_add</span>
          </div>
          <h3 style={{ marginBottom: 'var(--space-2)' }}>No students enrolled yet</h3>
          <p style={{ color: 'var(--color-on-surface-variant)', marginBottom: 'var(--space-5)', fontSize: 'var(--font-size-sm)' }}>
            Add your first student to track fee dues and send one-tap WhatsApp reminders.
          </p>
          <Link to="/students/new" className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person_add</span>
            <span>Add Your First Student</span>
          </Link>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6) var(--space-4)' }}>
          {activeTab === 'paid' ? (
            <>
              <div style={{ width: '56px', height: '56px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-surface-container)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'var(--space-3)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-on-surface-variant)' }}>task_alt</span>
              </div>
              <h3 style={{ marginBottom: 'var(--space-1)' }}>No paid records this cycle</h3>
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--font-size-sm)' }}>
                Once students pay their fees, settled transactions will archive here.
              </p>
            </>
          ) : activeTab === 'pending' && !searchQuery ? (
            <>
              <div style={{ fontSize: '36px', marginBottom: 'var(--space-2)' }}>🎉</div>
              <h3 style={{ marginBottom: 'var(--space-1)', color: 'var(--color-tertiary-container)' }}>All caught up!</h3>
              <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
                No pending or overdue fees for any student.
              </p>
              <button
                onClick={() => setActiveTab('all')}
                className="btn btn-secondary"
                style={{ width: 'auto', display: 'inline-flex' }}
              >
                View All Students
              </button>
            </>
          ) : (
            <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--font-size-sm)' }}>
              No students match your search filter.
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {filteredStudents.map((student) => {
            const fee = student.fee;
            const status = fee?.status || 'pending';
            const isOverdue = status === 'overdue';
            const isPaid = status === 'paid';

            return (
              <div key={student.id} className="student-card">
                {/* 6px Status Rail */}
                <div
                  className={`status-rail ${
                    isPaid ? 'rail-paid' : isOverdue ? 'rail-overdue' : 'rail-due-soon'
                  }`}
                />

                <div className="student-card-content">
                  {/* Top Row: Name, Phone & Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-2)' }}>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <Link
                        to={`/students/${student.id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-on-surface)' }}>
                          {student.name}
                        </h3>
                      </Link>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px', color: 'var(--color-on-surface-variant)' }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '15px', color: 'var(--color-outline)' }}>call</span>
                        <a
                          href={`tel:${student.parent_phone}`}
                          style={{ fontSize: 'var(--font-size-sm)', color: 'inherit', textDecoration: 'none' }}
                        >
                          {student.parent_phone}
                        </a>
                      </div>
                    </div>

                    {/* Saturated Status Pill Badge */}
                    <span
                      className={`badge ${
                        isPaid ? 'badge-paid' : isOverdue ? 'badge-overdue' : 'badge-due-soon'
                      }`}
                    >
                      {isOverdue && (
                        <span style={{ width: '6px', height: '6px', borderRadius: 'var(--radius-full)', backgroundColor: '#ffffff' }} />
                      )}
                      {isPaid ? 'Paid' : isOverdue ? 'Overdue' : 'Due Soon'}
                    </span>
                  </div>

                  {/* Financial Info Box */}
                  {fee && (
                    <div className={`amount-due-box ${isOverdue ? 'overdue' : isPaid ? 'paid' : ''}`}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: isOverdue ? 'var(--color-error)' : 'var(--color-on-surface-variant)', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          {isPaid ? 'check_circle' : isOverdue ? 'calendar_clock' : 'calendar_today'}
                        </span>
                        <span>{isPaid ? 'Settled' : `Due: ${fee.due_date}`}</span>
                      </div>
                      <div className="tabular-nums" style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-primary-container)', marginRight: '2px' }}>₹</span>
                        <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: isOverdue ? 'var(--color-error)' : 'var(--color-primary-container)' }}>
                          {fee.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Quick Action Row */}
                  {fee && !isPaid && (
                    <div className="card-actions">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setReminderStudent(student);
                        }}
                        className="card-action-btn card-action-btn-remind"
                        type="button"
                      >
                        <span className="material-symbols-outlined fill" style={{ fontSize: '18px' }}>chat</span>
                        <span>Remind</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setMarkPaidStudent(student);
                        }}
                        className="card-action-btn card-action-btn-pay"
                        type="button"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>check_circle</span>
                        <span>Mark as Paid</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WhatsApp Reminder Modal */}
      <ReminderModal
        isOpen={Boolean(reminderStudent)}
        onClose={() => setReminderStudent(null)}
        student={reminderStudent}
        settings={tenantSettings}
        onReminderSent={() => {
          loadDashboardData();
        }}
      />

      {/* Mark as Paid Confirmation Modal */}
      <MarkPaidModal
        isOpen={Boolean(markPaidStudent)}
        onClose={() => setMarkPaidStudent(null)}
        student={markPaidStudent}
        onPaidConfirmed={handlePaidConfirmed}
      />

      {/* Remind All Overdue Modal (Stitch export design) */}
      <RemindAllModal
        isOpen={isRemindAllOpen}
        onClose={() => setIsRemindAllOpen(false)}
        overdueStudents={overdueStudents}
        tenantSettings={tenantSettings}
        onSuccess={() => {
          loadDashboardData();
        }}
      />

      {/* Bulk Fee Update Modal */}
      <BulkFeeUpdateModal
        isOpen={isBulkUpdateOpen}
        onClose={() => setIsBulkUpdateOpen(false)}
        students={students}
        onSuccess={(msg) => {
          setUndoToast({
            message: msg || 'Bulk fee update applied successfully.',
            type: 'success',
          });
          loadDashboardData();
        }}
      />

      {/* Floating Undo Toast */}
      <UndoToast
        toast={undoToast}
        onUndo={handleUndo}
        onDismiss={() => setUndoToast(null)}
      />

      {/* Fixed Bottom Navigation Bar */}
      <nav className="bottom-nav">
        <div className="bottom-nav-inner">
          <Link to="/dashboard" className="bottom-nav-item active">
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>dashboard</span>
            <span className="nav-label">Overview</span>
          </Link>
          <Link to="/dashboard" onClick={() => setActiveTab('all')} className="bottom-nav-item">
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>group</span>
            <span className="nav-label">Students</span>
          </Link>
          <Link to="/students/new" className="bottom-nav-item">
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>person_add</span>
            <span className="nav-label">Add</span>
          </Link>
          <Link to="/settings" className="bottom-nav-item">
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>settings</span>
            <span className="nav-label">Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

