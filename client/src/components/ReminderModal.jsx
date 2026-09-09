import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Screen: Send Reminder Action Modal / Bottom Sheet
 * per 03-app-flow.md:
 *  - Opens pre-filled WhatsApp message with amount, due date, institute UPI ID/bank info.
 *  - Blocks sending if phone number is invalid or institute payment info is missing.
 *  - Logs reminder in SQLite on confirm.
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

  // Generate clean wa.me URL
  // Phone must be numbers only (e.g. 919876543210)
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

  async function handleConfirmSend() {
    if (!hasPaymentInfo || !phone) return;

    setSending(true);
    setError('');

    try {
      // 1. Log reminder in the database
      if (fee?.id) {
        const token = getToken();
        const res = await fetch('/api/reminders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ feeId: fee.id }),
        });

        if (!res.ok) {
          console.warn('Failed to log reminder audit in DB, continuing to WhatsApp');
        }
      }

      // 2. Open WhatsApp click-to-chat
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
          <h3>Send Fee Reminder</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* Blocking Condition 1: Missing Payment Info */}
        {!hasPaymentInfo ? (
          <div className="alert alert-warning" style={{ marginBottom: 'var(--space-4)' }}>
            <p style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}>
              Institute payment info is not set!
            </p>
            <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-3)' }}>
              You must configure your UPI ID or Bank Details in Settings before sending reminders to parents.
            </p>
            <Link to="/settings" className="btn btn-primary" style={{ width: 'auto' }}>
              Go to Settings
            </Link>
          </div>
        ) : !phone ? (
          /* Blocking Condition 2: Missing Phone */
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-4)' }}>
            <p style={{ fontWeight: 600 }}>Parent WhatsApp number is missing.</p>
            <p style={{ fontSize: 'var(--font-size-sm)' }}>
              Please edit the student record to add a valid phone number.
            </p>
          </div>
        ) : (
          /* Confirmation Content */
          <>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
              Send WhatsApp reminder for <strong>{student.name}</strong> to parent at <strong>{student.parent_phone}</strong>:
            </p>

            {/* Live Message Preview */}
            <div className="message-preview-box">
              {messageText}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <button
                onClick={handleConfirmSend}
                className="btn btn-whatsapp"
                disabled={sending}
              >
                {sending ? <span className="spinner" /> : 'Confirm & Open WhatsApp'}
              </button>
              <button
                onClick={onClose}
                className="btn btn-secondary"
                disabled={sending}
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
