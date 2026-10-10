import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReminderModal from '../components/ReminderModal';
import MarkPaidModal from '../components/MarkPaidModal';
import UndoToast from '../components/UndoToast';
import ThemeToggle from '../components/ThemeToggle';

/**
 * Student Detail screen — Ledger Calm design per mockups:
 *  - Route: /students/:id
 *  - Summary profile with phone link & status pill
 *  - Fee obligation card with tabular numbers & action buttons
 *  - Reminder audit trail with timestamps
 */
export default function StudentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [studentData, setStudentData] = useState(null);
  const [tenantSettings, setTenantSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal states
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isMarkPaidModalOpen, setIsMarkPaidModalOpen] = useState(false);
  const [reverting, setReverting] = useState(false);

  // Undo Toast state
  const [undoToast, setUndoToast] = useState(null);

  const fetchStudentAndSettings = useCallback(async () => {
    try {
      setError('');
      const token = getToken();

      const [studentRes, settingsRes] = await Promise.all([
        fetch(`/api/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/settings', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!studentRes.ok) {
        if (studentRes.status === 404) {
          throw new Error('Student not found or you do not have permission to view this record.');
        }
        throw new Error('Failed to load student details.');
      }

      const sData = await studentRes.json();
      const settsData = settingsRes.ok ? await settingsRes.json() : null;

      setStudentData(sData);
      if (settsData?.settings) {
        setTenantSettings(settsData.settings);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }, [id, getToken]);

  useEffect(() => {
    fetchStudentAndSettings();
  }, [fetchStudentAndSettings]);

  // Handle Mark as Paid confirmation
  function handlePaidConfirmed(updatedFee, student) {
    setUndoToast({
      feeId: updatedFee.id,
      studentName: student.name,
      amount: updatedFee.amount,
    });
    fetchStudentAndSettings();
  }

  // Handle Undo / Revert
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
        fetchStudentAndSettings();
      }
    } catch (err) {
      console.error('Failed to revert fee:', err);
    }
  }

  // Handle manual revert button on paid fee
  async function handleManualRevert(feeId) {
    const confirmed = window.confirm(
      'Revert this fee back to unpaid/pending status?'
    );
    if (!confirmed) return;

    setReverting(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/fees/${feeId}/revert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to revert fee status.');
      }

      fetchStudentAndSettings();
    } catch (err) {
      alert(err.message || 'Could not revert fee.');
    } finally {
      setReverting(false);
    }
  }

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
        <div className="spinner spinner-primary" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (error || !studentData) {
    return (
      <div className="page-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
          <Link to="/dashboard" className="nav-btn" style={{ width: '40px', height: '40px', padding: 0, justifyContent: 'center' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
          </Link>
          <h1>Student Detail</h1>
        </div>
        <div className="alert alert-error">{error || 'Student not found.'}</div>
        <button onClick={fetchStudentAndSettings} className="btn btn-secondary">
          Retry
        </button>
      </div>
    );
  }

  const { student, fees, reminders } = studentData;
  const currentFee = fees && fees.length > 0 ? fees[0] : null;
  const status = currentFee?.status || 'pending';
  const isOverdue = status === 'overdue';
  const isPaid = status === 'paid';

  const totalReminders = reminders?.length || 0;

  function formatReminderDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const formatted = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timeFormatted = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `Sent ${formatted} at ${timeFormatted}`;
  }

  function getRelativeTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 30) return `${diffDays}d ago`;
    return '';
  }

  return (
    <div className="page-container">
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <Link
            to="/dashboard"
            className="nav-btn"
            style={{ width: '40px', height: '40px', padding: 0, justifyContent: 'center' }}
            title="Back to Dashboard"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
          </Link>
          <h1 style={{ fontSize: 'var(--font-size-lg)', truncate: true }}>{student.name}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <ThemeToggle />
          <Link
            to={`/attendance/student/${student.id}`}
            className="nav-btn"
            title="View Attendance Calendar"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>calendar_month</span>
            <span>Attendance</span>
          </Link>
          <Link
            to={`/students/${student.id}/edit`}
            className="nav-btn"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
            <span>Edit</span>
          </Link>
        </div>
      </div>

      {/* Student Profile Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-3)' }}>
          <div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
              Parent Contact
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-outline)' }}>call</span>
              <a
                href={`tel:${student.parent_phone}`}
                style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-on-surface)', textDecoration: 'none' }}
              >
                {student.parent_phone}
              </a>
            </div>
          </div>

          {currentFee && (
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
          )}
        </div>

        {student.note && (
          <div style={{ marginTop: 'var(--space-2)', padding: '10px 12px', backgroundColor: 'var(--color-surface-low)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-on-surface-variant)', fontWeight: 700, textTransform: 'uppercase' }}>Note</span>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-on-surface)', marginTop: '2px' }}>{student.note}</p>
          </div>
        )}
      </div>

      {/* Fee Obligation & Action Card */}
      {currentFee ? (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-3)' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary-container)' }}>account_balance_wallet</span>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>Fee Schedule</h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            <div style={{ backgroundColor: 'var(--color-surface-low)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-on-surface-variant)', fontWeight: 600, textTransform: 'uppercase' }}>Amount Due</span>
              <p className="tabular-nums" style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: isOverdue ? 'var(--color-error)' : 'var(--color-primary-container)', marginTop: '2px' }}>
                ₹{currentFee.amount.toLocaleString('en-IN')}
              </p>
            </div>
            <div style={{ backgroundColor: 'var(--color-surface-low)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-on-surface-variant)', fontWeight: 600, textTransform: 'uppercase' }}>Due Date</span>
              <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, marginTop: '4px' }}>
                {currentFee.due_date}
              </p>
            </div>
          </div>

          {currentFee.paid_at ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--color-tertiary-fixed)',
                  color: 'var(--color-tertiary)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                <span>Settled on {new Date(currentFee.paid_at).toLocaleDateString()}</span>
              </div>
              <button
                onClick={() => handleManualRevert(currentFee.id)}
                className="btn btn-secondary"
                disabled={reverting}
              >
                {reverting ? <span className="spinner" /> : 'Revert to Unpaid'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <button
                onClick={() => setIsReminderModalOpen(true)}
                className="btn btn-whatsapp"
                type="button"
              >
                <span className="material-symbols-outlined fill" style={{ fontSize: '20px' }}>chat</span>
                <span>Send WhatsApp Reminder</span>
              </button>
              <button
                onClick={() => setIsMarkPaidModalOpen(true)}
                className="btn btn-success"
                type="button"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                <span>Mark as Paid</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', color: 'var(--color-on-surface-variant)' }}>
          <p>No active fee obligation assigned.</p>
        </div>
      )}

      {/* Reminder History Timeline Section */}
      <section className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-secondary-fixed)',
                color: 'var(--color-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>history</span>
            </div>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, margin: 0 }}>
              Reminder History
            </h3>
          </div>
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              color: 'var(--color-secondary)',
              backgroundColor: 'var(--color-secondary-fixed)',
              padding: '2px 10px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-outline-variant)',
            }}
          >
            {totalReminders} {totalReminders === 1 ? 'Reminder' : 'Reminders'} Sent
          </span>
        </div>

        {totalReminders > 0 ? (
          <div
            style={{
              position: 'relative',
              paddingLeft: '28px',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-3)',
              paddingTop: '4px',
            }}
          >
            {/* Vertical Connecting Line */}
            <div
              style={{
                position: 'absolute',
                left: '11px',
                top: '12px',
                bottom: '12px',
                width: '2px',
                backgroundColor: 'var(--color-border)',
              }}
            />

            {reminders.map((rem, idx) => {
              const reminderNum = totalReminders - idx;
              const isLatest = idx === 0;
              const relativeTime = getRelativeTime(rem.sent_at);

              return (
                <div key={rem.id} style={{ position: 'relative' }}>
                  {/* Timeline Node Dot */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '-28px',
                      top: '6px',
                      width: '24px',
                      height: '24px',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: isLatest ? 'var(--color-secondary-container)' : 'var(--color-surface-high)',
                      color: isLatest ? '#ffffff' : 'var(--color-on-surface-variant)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      zIndex: 1,
                    }}
                  >
                    <span className="material-symbols-outlined fill" style={{ fontSize: '13px' }}>
                      {isLatest ? 'chat' : 'mark_chat_read'}
                    </span>
                  </div>

                  {/* Timeline Card */}
                  <div
                    style={{
                      backgroundColor: 'var(--color-surface-low)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-lg)',
                      padding: '10px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--color-on-surface)' }}>
                          WhatsApp Reminder #{reminderNum}
                        </span>
                        {isLatest && (
                          <span style={{ fontSize: '10px', backgroundColor: 'var(--color-secondary-fixed)', color: 'var(--color-secondary)', padding: '1px 6px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                            Latest
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: isLatest && isOverdue ? 'var(--color-error)' : 'var(--color-tertiary-container)',
                        }}
                      >
                        {isLatest && isOverdue ? 'Overdue alert' : 'Delivered'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', color: 'var(--color-on-surface-variant)' }}>
                      <span>{formatReminderDate(rem.sent_at)}</span>
                      {relativeTime && (
                        <span style={{ fontStyle: 'normal', color: 'var(--color-outline)' }}>
                          {relativeTime}
                        </span>
                      )}
                    </div>

                    <p style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)', fontStyle: 'italic', margin: '2px 0 0 0', lineHeight: '1.4' }}>
                      &ldquo;Dear Parent, reminder from {tenantSettings?.name || 'our institute'} regarding fee dues for {student.name}...&rdquo;
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              textAlign: 'center',
              padding: 'var(--space-6) var(--space-4)',
              border: '1.5px dashed var(--color-outline-variant)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-surface-low)',
              marginTop: 'var(--space-2)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-outline)', marginBottom: '6px', display: 'block' }}>
              chat_bubble_outline
            </span>
            <p style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)', color: 'var(--color-on-surface)', margin: 0 }}>
              No reminders sent yet
            </p>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-on-surface-variant)', marginTop: '4px', marginBottom: 0 }}>
              When you send WhatsApp fee alerts, a chronological audit trail will appear here.
            </p>
          </div>
        )}
      </section>

      {/* Reminder Modal */}
      {currentFee && (
        <ReminderModal
          isOpen={isReminderModalOpen}
          onClose={() => setIsReminderModalOpen(false)}
          student={{
            ...student,
            fee: currentFee,
          }}
          settings={tenantSettings}
          onReminderSent={() => {
            fetchStudentAndSettings();
          }}
        />
      )}

      {/* Mark Paid Modal */}
      {currentFee && (
        <MarkPaidModal
          isOpen={isMarkPaidModalOpen}
          onClose={() => setIsMarkPaidModalOpen(false)}
          student={{
            ...student,
            fee: currentFee,
          }}
          onPaidConfirmed={handlePaidConfirmed}
        />
      )}

      {/* Undo Toast */}
      <UndoToast
        toast={undoToast}
        onUndo={handleUndo}
        onDismiss={() => setUndoToast(null)}
      />
    </div>
  );
}

