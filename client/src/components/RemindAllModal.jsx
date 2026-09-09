import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { formatReminderMessage, generateWhatsAppLink } from '../utils/reminderTemplate';

/**
 * RemindAllModal — Remind All Overdue Confirmation & In-Flight Progress Modal
 * Matches Stitch export: docs/UI/stitch_feereminder_mobile_app/remind_all_overdue_modal
 */
export default function RemindAllModal({
  isOpen,
  onClose,
  overdueStudents = [],
  tenantSettings,
  onSuccess,
}) {
  const { getToken } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [sentNames, setSentNames] = useState([]);
  const [isComplete, setIsComplete] = useState(false);

  if (!isOpen) return null;

  const totalRecipients = overdueStudents.length;
  const totalDuesOverdue = overdueStudents.reduce((sum, s) => sum + (s.fee?.amount || 0), 0);

  function generateWhatsAppUrl(student) {
    const message = formatReminderMessage({
      template: tenantSettings?.reminder_template,
      student,
      fee: student.fee,
      settings: tenantSettings,
    });
    return generateWhatsAppLink(student.parent_phone, message);
  }

  async function handleConfirmAndSend() {
    setIsSending(true);
    setProgressIndex(0);
    setSentNames([]);
    setIsComplete(false);

    const feeIdsSent = [];
    const namesAccumulator = [];

    for (let i = 0; i < overdueStudents.length; i++) {
      const student = overdueStudents[i];
      setProgressIndex(i + 1);
      namesAccumulator.push(student.name);
      setSentNames([...namesAccumulator]);

      if (student.fee?.id) {
        feeIdsSent.push(student.fee.id);
      }

      // Open WhatsApp click-to-chat link
      const waUrl = generateWhatsAppUrl(student);
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      // Brief delay between window opens to prevent browser popup block
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    // Log all reminders in bulk to backend audit trail
    try {
      const token = getToken();
      await fetch('/api/reminders/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ feeIds: feeIdsSent }),
      });
    } catch (err) {
      console.error('Failed to log bulk reminders:', err);
    }

    setIsSending(false);
    setIsComplete(true);
    if (onSuccess) onSuccess();
  }

  const percentage = totalRecipients > 0 ? Math.round((progressIndex / totalRecipients) * 100) : 0;

  return (
    <div className="modal-backdrop" onClick={!isSending ? onClose : undefined}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '400px',
          width: '92%',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: 'var(--space-4)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-secondary-fixed)',
                color: 'var(--color-secondary-container)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                notifications_active
              </span>
            </div>
            <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, margin: 0 }}>
              Remind All Overdue
            </h2>
          </div>
          {!isSending && (
            <button
              onClick={onClose}
              className="nav-btn"
              style={{ width: '32px', height: '32px', padding: 0, justifyContent: 'center' }}
              aria-label="Close"
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, margin: '0 0 var(--space-1) 0' }}>
              Send WhatsApp reminders to {totalRecipients} overdue parents?
            </p>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-on-surface-variant)', margin: 0 }}>
              Each parent receives their personalized fee breakdown and your direct UPI payment info.
            </p>
          </div>

          {/* Overdue Batch Summary Box */}
          <div
            style={{
              backgroundColor: 'var(--color-secondary-fixed)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-4)',
              border: '1px solid var(--color-secondary-container)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
              <span style={{ color: 'var(--color-on-surface-variant)' }}>Total Recipients:</span>
              <span style={{ fontWeight: 700 }}>{totalRecipients} Parents</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
              <span style={{ color: 'var(--color-on-surface-variant)' }}>Total Dues Overdue:</span>
              <span style={{ color: 'var(--color-error)', fontWeight: 800 }}>
                ₹{totalDuesOverdue.toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
              <span style={{ color: 'var(--color-on-surface-variant)' }}>Channel:</span>
              <span style={{ color: 'var(--color-whatsapp)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>chat</span>
                WhatsApp Direct
              </span>
            </div>
          </div>

          {/* In-Flight Progress State */}
          {(isSending || isComplete) && (
            <div
              style={{
                backgroundColor: 'var(--color-surface-low)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-3)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', fontWeight: 700 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isSending && <div className="spinner spinner-secondary" style={{ width: 14, height: 14 }} />}
                  {isComplete ? '✓ Completed sending all reminders!' : `Sending ${progressIndex} of ${totalRecipients}...`}
                </span>
                <span style={{ color: 'var(--color-primary-container)' }}>{percentage}%</span>
              </div>
              <div
                style={{
                  width: '100%',
                  backgroundColor: 'var(--color-surface-highest)',
                  height: '8px',
                  borderRadius: 'var(--radius-full)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    backgroundColor: 'var(--color-secondary-container)',
                    height: '100%',
                    width: `${percentage}%`,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--color-on-surface-variant)',
                  maxHeight: '40px',
                  overflowY: 'auto',
                }}
              >
                {sentNames.slice(-3).join(', ')}{sentNames.length > 3 ? '...' : ''}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', paddingTop: 'var(--space-2)' }}>
            {!isComplete ? (
              <>
                <button
                  type="button"
                  onClick={handleConfirmAndSend}
                  disabled={isSending || totalRecipients === 0}
                  className="btn btn-secondary"
                  style={{
                    backgroundColor: 'var(--color-secondary-container)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    height: '48px',
                    fontWeight: 700,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>send</span>
                  {isSending ? 'Sending Reminders...' : 'Confirm & Send All'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSending}
                  className="btn btn-secondary"
                  style={{ height: '44px' }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="btn btn-primary"
                style={{ height: '48px', fontWeight: 700 }}
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
