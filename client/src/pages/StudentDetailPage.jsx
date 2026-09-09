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

      {/* Reminder History Audit Log */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 'var(--space-3)' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary)' }}>history</span>
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>Reminder History</h3>
        </div>

        {reminders && reminders.length > 0 ? (
          <ul style={{ listStyle: 'none' }}>
            {reminders.map((rem) => (
              <li
                key={rem.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px 0',
                  borderBottom: '1px solid var(--color-border)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-secondary-container)', color: 'var(--color-on-secondary-fixed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-outlined fill" style={{ fontSize: '14px' }}>chat</span>
                  </div>
                  <span style={{ fontWeight: 600 }}>WhatsApp Reminder sent</span>
                </div>
                <span style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--font-size-xs)' }}>
                  {new Date(rem.sent_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--color-on-surface-variant)', fontSize: 'var(--font-size-sm)', textAlign: 'center', padding: 'var(--space-3) 0' }}>
            No reminders sent yet.
          </p>
        )}
      </div>

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

