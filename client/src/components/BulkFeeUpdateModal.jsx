import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * BulkFeeUpdateModal — Apply bulk fee modifications to all or filtered students
 * Follows Ledger Calm design system from 04-ui-ux-brief.md
 */
export default function BulkFeeUpdateModal({
  isOpen,
  onClose,
  students = [],
  onSuccess,
}) {
  const { getToken } = useAuth();

  const [filterType, setFilterType] = useState('all'); // 'all' | 'tag' | 'overdue'
  const [tagValue, setTagValue] = useState('');
  const [actionType, setActionType] = useState('add'); // 'add' | 'set'
  const [amountValue, setAmountValue] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  // Available unique tags from students
  const availableTags = useMemo(() => {
    const tags = new Set();
    students.forEach((s) => {
      if (s.note && s.note.trim()) {
        tags.add(s.note.trim());
      }
    });
    return Array.from(tags);
  }, [students]);

  // Compute affected count dynamically
  const matchingStudents = useMemo(() => {
    return students.filter((s) => {
      if (filterType === 'all') return true;
      if (filterType === 'overdue') return s.fee?.status === 'overdue';
      if (filterType === 'tag') {
        if (!tagValue) return false;
        return s.note?.toLowerCase().includes(tagValue.toLowerCase());
      }
      return true;
    });
  }, [students, filterType, tagValue]);

  if (!isOpen) return null;

  async function handleApplyBulkUpdate() {
    setError('');
    const num = parseFloat(amountValue);
    if (!amountValue || isNaN(num) || (actionType === 'set' && num <= 0)) {
      setError('Please enter a valid amount.');
      setShowConfirm(false);
      return;
    }

    if (matchingStudents.length === 0) {
      setError('No students match the selected filter.');
      setShowConfirm(false);
      return;
    }

    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch('/api/fees/bulk-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          filterType: filterType === 'overdue' ? 'status' : filterType,
          tagValue: filterType === 'tag' ? tagValue : '',
          statusValue: filterType === 'overdue' ? 'overdue' : '',
          actionType,
          amountValue: num,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to apply bulk update.');
      }

      if (onSuccess) {
        onSuccess(data.message);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'An error occurred during bulk update.');
    } finally {
      setSaving(false);
      setShowConfirm(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={!saving ? onClose : undefined}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '440px',
          width: '92%',
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--radius-xl)',
          backgroundColor: 'var(--color-surface-card)',
          border: '1px solid var(--color-border)',
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
                backgroundColor: 'var(--color-primary-fixed)',
                color: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                price_change
              </span>
            </div>
            <h2 style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, margin: 0 }}>
              Bulk Fee Update
            </h2>
          </div>
          {!saving && (
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

        {/* Content */}
        <div style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {error && <div className="alert alert-error">{error}</div>}

          {/* Filter Selection */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700 }}>
              Select Target Students
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-2)' }}>
              <button
                type="button"
                className={`btn ${filterType === 'all' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 'var(--font-size-xs)', padding: '8px 4px', minHeight: '38px' }}
                onClick={() => setFilterType('all')}
              >
                All ({students.length})
              </button>
              <button
                type="button"
                className={`btn ${filterType === 'overdue' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 'var(--font-size-xs)', padding: '8px 4px', minHeight: '38px' }}
                onClick={() => setFilterType('overdue')}
              >
                Overdue
              </button>
              <button
                type="button"
                className={`btn ${filterType === 'tag' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 'var(--font-size-xs)', padding: '8px 4px', minHeight: '38px' }}
                onClick={() => setFilterType('tag')}
              >
                By Tag / Note
              </button>
            </div>
          </div>

          {/* Tag Selector if filterType === 'tag' */}
          {filterType === 'tag' && (
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 'var(--font-size-xs)' }}>
                Choose or Type Tag / Note
              </label>
              {availableTags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: 'var(--space-2)' }}>
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setTagValue(tag)}
                      style={{
                        fontSize: '11px',
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--color-border)',
                        backgroundColor: tagValue === tag ? 'var(--color-primary-fixed)' : 'var(--color-surface-low)',
                        color: tagValue === tag ? 'var(--color-primary)' : 'var(--color-on-surface)',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sibling discount, Scholarship..."
                value={tagValue}
                onChange={(e) => setTagValue(e.target.value)}
              />
            </div>
          )}

          {/* Action Type */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700 }}>
              Update Method
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
              <button
                type="button"
                className={`btn ${actionType === 'add' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 'var(--font-size-xs)', padding: '8px 4px', minHeight: '38px' }}
                onClick={() => setActionType('add')}
              >
                + Add / Deduct (±₹)
              </button>
              <button
                type="button"
                className={`btn ${actionType === 'set' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ fontSize: 'var(--font-size-xs)', padding: '8px 4px', minHeight: '38px' }}
                onClick={() => setActionType('set')}
              >
                = Set Exact Amount (₹)
              </button>
            </div>
          </div>

          {/* Amount Field */}
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700 }}>
              {actionType === 'add' ? 'Adjustment Amount (₹)' : 'New Fixed Fee Amount (₹)'}
            </label>
            <div style={{ position: 'relative' }}>
              <span
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontWeight: 700,
                  color: 'var(--color-outline)',
                }}
              >
                ₹
              </span>
              <input
                type="number"
                className="form-input"
                style={{ paddingLeft: '28px' }}
                placeholder={actionType === 'add' ? 'e.g. 200 or -100' : 'e.g. 1800'}
                value={amountValue}
                onChange={(e) => setAmountValue(e.target.value)}
              />
            </div>
          </div>

          {/* Impact Preview Box */}
          <div
            style={{
              backgroundColor: 'var(--color-surface-low)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-3)',
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
              <span style={{ color: 'var(--color-on-surface-variant)' }}>Target Records:</span>
              <span style={{ fontWeight: 800, color: 'var(--color-primary-container)' }}>
                {matchingStudents.length} Students Affected
              </span>
            </div>
            {amountValue && !isNaN(parseFloat(amountValue)) && (
              <div style={{ fontSize: '11px', color: 'var(--color-on-surface-variant)' }}>
                {actionType === 'add'
                  ? `Will adjust each fee by ${parseFloat(amountValue) >= 0 ? '+' : ''}₹${parseFloat(amountValue)}`
                  : `Will set each fee obligation directly to ₹${parseFloat(amountValue).toLocaleString('en-IN')}`}
              </div>
            )}
          </div>

          {/* Confirmation Warning step */}
          {showConfirm ? (
            <div
              style={{
                backgroundColor: 'var(--color-secondary-fixed)',
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-secondary-container)',
              }}
            >
              <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, margin: '0 0 var(--space-2) 0' }}>
                ⚠️ Are you sure you want to update {matchingStudents.length} student fees?
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={handleApplyBulkUpdate}
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ flex: 1, minHeight: '40px', fontSize: 'var(--font-size-xs)', fontWeight: 700 }}
                >
                  {saving ? 'Applying...' : 'Yes, Confirm & Update'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  disabled={saving}
                  className="btn btn-secondary"
                  style={{ minHeight: '40px', fontSize: 'var(--font-size-xs)' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 'var(--space-2)', paddingTop: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={() => setShowConfirm(true)}
                disabled={matchingStudents.length === 0 || !amountValue}
                className="btn btn-primary"
                style={{ flex: 1, height: '44px', fontWeight: 700 }}
              >
                Apply to {matchingStudents.length} Students
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ height: '44px' }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
