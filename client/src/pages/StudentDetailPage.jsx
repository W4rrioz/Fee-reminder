import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ReminderModal from '../components/ReminderModal';
import MarkPaidModal from '../components/MarkPaidModal';
import UndoToast from '../components/UndoToast';

/**
 * Student Detail screen — per 03-app-flow.md:
 *  Route: /students/:id
 *  Displays: Student summary, fee schedule & status badge, reminder history
 *  Actions: Edit, Delete, Send WhatsApp Reminder, Mark as Paid, Revert Status
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
          <Link to="/dashboard" style={{ fontSize: 'var(--font-size-lg)', textDecoration: 'none' }}>
            ←
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

  function renderStatusBadge(status) {
    if (status === 'paid') {
      return <span className="badge badge-paid">Paid</span>;
    }
    if (status === 'overdue') {
      return <span className="badge badge-overdue">Overdue</span>;
    }
    return <span className="badge badge-pending">Due Soon</span>;
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link to="/dashboard" style={{ fontSize: 'var(--font-size-lg)', textDecoration: 'none' }}>
            ←
          </Link>
          <h1>{student.name}</h1>
        </div>
        <Link
          to={`/students/${student.id}/edit`}
          className="btn btn-secondary"
          style={{ width: 'auto', padding: '6px 14px', fontSize: 'var(--font-size-sm)' }}
        >
          Edit
        </Link>
      </div>

      {/* Student Overview Card */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
          <div>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Parent WhatsApp</span>
            <p style={{ fontSize: 'var(--font-size-lg)', fontWeight: 600 }}>{student.parent_phone}</p>
          </div>
          {currentFee && renderStatusBadge(currentFee.status)}
        </div>

        {student.note && (
          <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-3)', backgroundColor: 'var(--color-bg)', borderRadius: '8px' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', display: 'block' }}>Note:</span>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text)' }}>{student.note}</p>
          </div>
        )}
      </div>

      {/* Fee Obligation & Action Card */}
      {currentFee ? (
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-3)' }}>Fee Status</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Amount Due</span>
              <p style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, color: 'var(--color-primary)' }}>
                ₹{currentFee.amount.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Due Date</span>
              <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 600 }}>
                {currentFee.due_date}
              </p>
            </div>
          </div>

          {currentFee.paid_at ? (
            <div>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-success)', marginBottom: 'var(--space-3)', fontWeight: 600 }}>
                ✓ Paid on {new Date(currentFee.paid_at).toLocaleDateString()}
              </p>
              <button
                onClick={() => handleManualRevert(currentFee.id)}
                className="btn btn-secondary"
                disabled={reverting}
              >
                {reverting ? <span className="spinner" /> : 'Revert to Unpaid'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-3)' }}>
              <button
                onClick={() => setIsReminderModalOpen(true)}
                className="btn btn-whatsapp"
              >
                💬 Send WhatsApp Reminder
              </button>
              <button
                onClick={() => setIsMarkPaidModalOpen(true)}
                className="btn btn-success"
              >
                ✓ Mark as Paid
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="card">
          <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center' }}>
            No active fee obligation assigned.
          </p>
        </div>
      )}

      {/* Reminder & Contact History */}
      <div className="card">
        <h3 style={{ marginBottom: 'var(--space-3)' }}>Reminder History</h3>
        {reminders && reminders.length > 0 ? (
          <ul style={{ listStyle: 'none' }}>
            {reminders.map((rem) => (
              <li
                key={rem.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: 'var(--space-2) 0',
                  borderBottom: '1px solid var(--color-border)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                <span>WhatsApp reminder sent</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {new Date(rem.sent_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)', textAlign: 'center', padding: 'var(--space-3) 0' }}>
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
