import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Screen: Mark as Paid Confirmation Modal
 * Ledger Calm design per mockups:
 *  - Payments icon & modal header
 *  - Ledger summary box with tabular amounts
 *  - Grace undo notification notice
 *  - Confirm Paid green CTA
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
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-tertiary-container)',
                color: 'var(--color-on-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                payments
              </span>
            </div>
            <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>Mark Fee as Paid</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <p style={{ fontSize: 'var(--font-size-base)', marginBottom: 'var(--space-3)', color: 'var(--color-on-surface)' }}>
          Confirm that you have received the fee payment for{' '}
          <strong style={{ color: 'var(--color-on-surface)' }}>{student.name}</strong>?
        </p>

        {/* Ledger Summary Box */}
        <div
          style={{
            backgroundColor: 'var(--color-surface-low)',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
              Amount Received:
            </span>
            <span className="tabular-nums" style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--color-tertiary-container)' }}>
              ₹{fee.amount.toLocaleString('en-IN')}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-on-surface-variant)', fontWeight: 600 }}>
              Due Date:
            </span>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>
              {fee.due_date}
            </span>
          </div>
        </div>

        {/* Grace Undo Callout Note */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            backgroundColor: 'var(--color-secondary-fixed)',
            padding: '10px 12px',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-4)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--color-on-secondary-fixed)', marginTop: '2px' }}>
            info
          </span>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-on-secondary-fixed)', fontWeight: 500 }}>
            An undo button will be available for a few seconds in case this was tapped by mistake.
          </p>
        </div>

        {/* Action CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <button
            onClick={handleConfirm}
            className="btn btn-success"
            disabled={submitting}
            type="button"
          >
            {submitting ? (
              <span className="spinner" />
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>check_circle</span>
                <span>Confirm Paid</span>
              </>
            )}
          </button>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            disabled={submitting}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

