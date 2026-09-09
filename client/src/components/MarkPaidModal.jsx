import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Screen: Mark as Paid Confirmation Modal / Bottom Sheet
 * per 03-app-flow.md:
 *  - Simple confirmation ("Mark [Student]'s fee as paid?")
 *  - Primary action: Confirm.
 *  - Note about undo availability.
 */
export default function MarkPaidModal({
  isOpen,
  onClose,
  student,
  onPaidConfirmed,
}) {
  const { getToken } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !student || !student.fee) return null;

  const fee = student.fee;

  async function handleConfirm() {
    setSubmitting(true);
    setError('');

    try {
      const token = getToken();
      const res = await fetch(`/api/fees/${fee.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update payment status.');
      }

      if (onPaidConfirmed) {
        onPaidConfirmed(data.fee, student);
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Could not update fee status.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Mark Fee as Paid</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <p style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-3)' }}>
          Confirm that you have received the fee payment for <strong>{student.name}</strong>?
        </p>

        <div className="card" style={{ backgroundColor: 'var(--color-bg)', padding: 'var(--space-3) var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Amount Received:</span>
            <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-success)' }}>
              ₹{fee.amount.toLocaleString('en-IN')}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-1)' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>Due Date:</span>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>
              {fee.due_date}
            </span>
          </div>
        </div>

        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          ℹ️ An undo button will be available for a few seconds in case this was tapped by mistake.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <button
            onClick={handleConfirm}
            className="btn btn-success"
            disabled={submitting}
          >
            {submitting ? <span className="spinner" /> : 'Confirm Paid'}
          </button>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
