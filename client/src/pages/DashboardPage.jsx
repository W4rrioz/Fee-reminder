import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReminderModal from '../components/ReminderModal';
import MarkPaidModal from '../components/MarkPaidModal';
import UndoToast from '../components/UndoToast';

const CACHE_KEY = 'feereminder_dashboard_cache';

/**
 * Screen: Dashboard (Dues List) — per 03-app-flow.md:
 *  - Primary view: students with pending/overdue fees, most urgent first.
 *  - Quick actions per card: "💬 Remind" and "✓ Mark Paid".
 *  - Full core loop completed: Add student → Remind → Mark Paid → Undo.
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
    // Show Undo Toast
    setUndoToast({
      feeId: updatedFee.id,
      studentName: student.name,
      amount: updatedFee.amount,
    });

    // Update list dynamically
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

    // Refresh summary stats
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

  function renderStatusBadge(status) {
    if (status === 'paid') {
      return <span className="badge badge-paid">Paid</span>;
    }
    if (status === 'overdue') {
      return <span className="badge badge-overdue">Overdue</span>;
    }
    return <span className="badge badge-pending">Due Soon</span>;
  }

  const hasConfiguredPayment = Boolean(
    tenantSettings?.upi_id?.trim() || tenantSettings?.bank_details?.trim()
  );

  // Skeleton Loader View
  if (loading) {
    return (
      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
          <div>
            <div className="skeleton-line title" style={{ width: 140 }} />
            <div className="skeleton-line short" style={{ width: 100 }} />
          </div>
        </div>
        <div className="metrics-row">
          <div className="skeleton-card" style={{ height: 80, padding: 'var(--space-3)' }} />
          <div className="skeleton-card" style={{ height: 80, padding: 'var(--space-3)' }} />
        </div>
        <div className="skeleton-card">
          <div className="skeleton-line title" />
          <div className="skeleton-line medium" />
          <div className="skeleton-line short" />
        </div>
        <div className="skeleton-card">
          <div className="skeleton-line title" />
          <div className="skeleton-line medium" />
          <div className="skeleton-line short" />
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
        <div>
          <h1>Dashboard</h1>
          {tenantInfo && (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              {tenantInfo.tenant_name}
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link to="/settings" className="nav-btn" title="Institute Settings">
            ⚙️ Settings
          </Link>
          <button
            onClick={signOut}
            className="nav-btn"
            style={{ cursor: 'pointer' }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Cached / Offline Fallback Notice */}
      {isUsingCache && (
        <div className="alert alert-warning" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠️ Showing last known dues list (offline / network error)</span>
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
            <strong>Set up your payment details</strong>
            <p style={{ fontSize: 'var(--font-size-xs)', marginTop: '2px' }}>
              Add your UPI ID so WhatsApp fee reminders include how to pay.
            </p>
          </div>
          <Link
            to="/settings"
            className="btn btn-primary"
            style={{ width: 'auto', minHeight: '34px', padding: '6px 12px', fontSize: 'var(--font-size-xs)', flexShrink: 0 }}
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
              color: 'var(--color-danger)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Dues Summary Metrics */}
      {summary && summary.totalStudents > 0 && (
        <div className="metrics-row">
          <div className="metric-card">
            <div className="metric-label">Total Outstanding</div>
            <div className="metric-value" style={{ color: 'var(--color-primary)' }}>
              ₹{summary.totalDueAmount.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Overdue Students</div>
            <div className="metric-value" style={{ color: summary.overdueCount > 0 ? 'var(--color-danger)' : 'var(--color-text)' }}>
              {summary.overdueCount}
            </div>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Link to="/students/new" className="btn btn-primary">
          + Add Student
        </Link>
      </div>

      {/* Search & Tabs when students exist */}
      {students.length > 0 && (
        <>
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Search by student name or parent phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="tabs-container">
            <button
              className={`tab-button ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Dues ({summary ? summary.overdueCount + summary.pendingCount : 0})
            </button>
            <button
              className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Students ({students.length})
            </button>
            <button
              className={`tab-button ${activeTab === 'paid' ? 'active' : ''}`}
              onClick={() => setActiveTab('paid')}
            >
              Paid ({summary ? summary.paidCount : 0})
            </button>
          </div>
        </>
      )}

      {/* Dues / Students List */}
      {students.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-8) var(--space-4)' }}>
          <h3 style={{ marginBottom: 'var(--space-2)' }}>No students yet</h3>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)', fontSize: 'var(--font-size-sm)' }}>
            Add your first student to track fee dues and send one-tap WhatsApp reminders.
          </p>
          <Link to="/students/new" className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto' }}>
            Add Your First Student
          </Link>
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-6) var(--space-4)' }}>
          {activeTab === 'pending' && !searchQuery ? (
            <>
              <div style={{ fontSize: '32px', marginBottom: 'var(--space-2)' }}>🎉</div>
              <h3 style={{ marginBottom: 'var(--space-2)', color: 'var(--color-success)' }}>All caught up!</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-4)' }}>
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
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
              No students match your search or filter.
            </p>
          )}
        </div>
      ) : (
        <div>
          {filteredStudents.map((student) => (
            <div key={student.id} className="card">
              <Link
                to={`/students/${student.id}`}
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                  <div>
                    <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: '2px' }}>{student.name}</h3>
                    <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                      {student.parent_phone}
                    </p>
                  </div>
                  {student.fee && renderStatusBadge(student.fee.status)}
                </div>

                {student.fee && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-2)' }}>
                    <span style={{ fontSize: 'var(--font-size-sm)', color: student.fee.status === 'overdue' ? 'var(--color-danger)' : 'var(--color-text-secondary)', fontWeight: student.fee.status === 'overdue' ? 600 : 400 }}>
                      {student.fee.status === 'paid' ? `Paid` : `Due: ${student.fee.due_date}`}
                    </span>
                    <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-primary)' }}>
                      ₹{student.fee.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
              </Link>

              {/* Quick Actions per card */}
              {student.fee && student.fee.status !== 'paid' && (
                <div className="card-actions">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setReminderStudent(student);
                    }}
                    className="card-action-btn card-action-btn-remind"
                  >
                    💬 Remind
                  </button>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setMarkPaidStudent(student);
                    }}
                    className="card-action-btn card-action-btn-pay"
                  >
                    ✓ Mark as Paid
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* WhatsApp Reminder Modal */}
      <ReminderModal
        isOpen={Boolean(reminderStudent)}
        onClose={() => setReminderStudent(null)}
        student={reminderStudent}
        settings={tenantSettings}
        onReminderSent={() => {
          // Handled
        }}
      />

      {/* Mark as Paid Confirmation Modal */}
      <MarkPaidModal
        isOpen={Boolean(markPaidStudent)}
        onClose={() => setMarkPaidStudent(null)}
        student={markPaidStudent}
        onPaidConfirmed={handlePaidConfirmed}
      />

      {/* Floating Undo Toast */}
      <UndoToast
        toast={undoToast}
        onUndo={handleUndo}
        onDismiss={() => setUndoToast(null)}
      />
    </div>
  );
}
