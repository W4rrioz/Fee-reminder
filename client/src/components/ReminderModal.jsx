import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Screen: Send Reminder Action Modal
 * Ledger Calm design per mockups:
 *  - Modal sheet with amber accent rail
 *  - Recipient phone target chip
 *  - Structured WhatsApp message preview
 *  - Confirm & Open WhatsApp CTA
 */
export default function ReminderModal({
  isOpen,
  onClose,
  student,
  settings,
  onReminderSent,
}) {
  const { getToken } = useAuth();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !student) return null;

  const instituteName = settings?.name || 'our institute';
  const upiId = settings?.upi_id || '';
  const bankDetails = settings?.bank_details || '';
  const fee = student.fee;

  const hasPaymentInfo = Boolean(upiId.trim() || bankDetails.trim());
  const phone = student.parent_phone || '';

  // Format the WhatsApp reminder message text
  const messageText = `Dear Parent,

This is a reminder from ${instituteName} regarding the fee dues for ${student.name}.

• Amount Due: ₹${fee ? fee.amount.toLocaleString('en-IN') : '0'}
• Due Date: ${fee ? fee.due_date : 'N/A'}
• Status: ${fee?.status === 'overdue' ? 'Overdue' : 'Due Soon'}

Payment Details:
${upiId ? `• UPI ID: ${upiId}` : ''}
${bankDetails ? `• Bank Info: ${bankDetails}` : ''}

Please share a screenshot after completing the payment. Thank you!`;

  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

  async function handleConfirmSend() {
    if (!hasPaymentInfo || !phone) return;

    setSending(true);
    setError('');

    try {
      if (fee?.id) {
        const token = getToken();
        await fetch('/api/reminders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ feeId: fee.id }),
        });
      }

      window.open(waUrl, '_blank');

      if (onReminderSent) {
        onReminderSent();
      }

      onClose();
    } catch (err) {
      setError(err.message || 'Could not open WhatsApp.');
    } finally {
      setSending(false);
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
                backgroundColor: 'var(--color-secondary-fixed)',
                color: 'var(--color-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined fill" style={{ fontSize: '20px' }}>
                send_and_archive
              </span>
            </div>
            <h2 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>Send Fee Reminder</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Blocking Condition 1: Missing Payment Info */}
        {!hasPaymentInfo ? (
          <div className="alert alert-warning" style={{ marginBottom: 'var(--space-4)' }}>
            <p style={{ fontWeight: 700, marginBottom: '4px' }}>
              Institute payment info is not set!
            </p>
            <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>
              You must configure your UPI ID or Bank Details in Settings before sending reminders to parents.
            </p>
            <Link to="/settings" className="btn btn-primary" style={{ width: 'auto', display: 'inline-flex' }}>
              Go to Settings
            </Link>
          </div>
        ) : !phone ? (
          /* Blocking Condition 2: Missing Phone */
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
            <p style={{ fontWeight: 700 }}>Parent WhatsApp number is missing.</p>
            <p style={{ fontSize: 'var(--font-size-sm)' }}>
              Please edit the student record to add a valid phone number.
            </p>
          </div>
        ) : (
          <>
            {/* Recipient Target Card */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                backgroundColor: 'var(--color-surface-low)',
                padding: '10px 12px',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-sm)',
                color: 'var(--color-on-surface-variant)',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary-container)' }}>
                contact_phone
              </span>
              <p>
                Sending to parent of <strong style={{ color: 'var(--color-on-surface)' }}>{student.name}</strong> at{' '}
                <strong style={{ color: 'var(--color-primary-container)' }}>{student.parent_phone}</strong>:
              </p>
            </div>

            {/* Live Message Preview Box with Amber Rail */}
            <div className="message-preview-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-on-surface-variant)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--color-secondary)' }}>mark_chat_unread</span>
                  Message Preview
                </span>
                <span className="badge badge-due-soon" style={{ fontSize: '10px', padding: '2px 6px' }}>
                  Automated
                </span>
              </div>
              {messageText}
            </div>

            {/* Action CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <button
                onClick={handleConfirmSend}
                className="btn btn-whatsapp"
                disabled={sending}
                type="button"
              >
                {sending ? (
                  <span className="spinner" />
                ) : (
                  <>
                    <span className="material-symbols-outlined fill" style={{ fontSize: '20px' }}>chat</span>
                    <span>Confirm & Open WhatsApp</span>
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="btn btn-secondary"
                disabled={sending}
                type="button"
              >
                Cancel
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

