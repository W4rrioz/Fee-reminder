import { useEffect } from 'react';

/**
 * Floating snackbar with an Undo button for reverting manual status changes.
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
        <span>
          Marked <strong>{toast.studentName}</strong>'s fee (₹{toast.amount?.toLocaleString('en-IN')}) as paid ✓
        </span>
        <button
          onClick={() => {
            if (onUndo) onUndo(toast.feeId);
          }}
          className="toast-undo-btn"
        >
          Undo
        </button>
      </div>
    </div>
  );
}
