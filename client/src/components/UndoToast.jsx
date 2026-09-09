import { useEffect } from 'react';

/**
 * Floating snackbar with an Undo button for reverting manual status changes.
 * Ledger Calm design per mockups.
 */
export default function UndoToast({
  toast,
  onUndo,
  onDismiss,
  duration = 8000,
}) {
  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      if (onDismiss) onDismiss();
    }, duration);

    return () => clearTimeout(timer);
  }, [toast, onDismiss, duration]);

  if (!toast) return null;

  return (
    <div className="toast-container">
      <div className="toast-snackbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-tertiary-fixed)' }}>
            task_alt
          </span>
          <span>
            Marked <strong>{toast.studentName}</strong>'s fee (₹{toast.amount?.toLocaleString('en-IN')}) as paid
          </span>
        </div>
        <button
          onClick={() => {
            if (onUndo) onUndo(toast.feeId);
          }}
          className="toast-undo-btn"
          type="button"
        >
          Undo
        </button>
      </div>
    </div>
  );
}

