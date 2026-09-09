import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Add / Edit Student screen — per 03-app-flow.md:
 *  Routes: /students/new, /students/:id/edit
 *  Fields: Name, Parent WhatsApp Number, Fee Amount, Due Date, Note
 *  Validation: Strict phone number validation, positive fee amount, required fields
 */
export default function StudentFormPage() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [name, setName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  // Prepopulate in Edit mode
  useEffect(() => {
    if (!isEditMode) {
      // Default due date to today for convenience on new additions
      const todayStr = new Date().toISOString().split('T')[0];
      setDueDate(todayStr);
      return;
    }

    async function fetchStudent() {
      try {
        const token = getToken();
        const res = await fetch(`/api/students/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Student not found or unauthorized.');
        }

        const data = await res.json();
        setName(data.student.name || '');
        // Clean phone for display (e.g. remove +91 if present for cleaner input)
        let phoneDisplay = data.student.parent_phone || '';
        if (phoneDisplay.startsWith('+91')) {
          phoneDisplay = phoneDisplay.slice(3);
        }
        setParentPhone(phoneDisplay);
        setNote(data.student.note || '');

        if (data.fees && data.fees.length > 0) {
          setAmount(String(data.fees[0].amount || ''));
          setDueDate(data.fees[0].due_date || '');
        }
      } catch (err) {
        setServerError(err.message || 'Failed to load student details.');
      } finally {
        setLoading(false);
      }
    }

    fetchStudent();
  }, [id, isEditMode, getToken]);

  // Strict Indian mobile phone validation
  function validatePhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    let cleaned = phone.trim().replace(/[\s\-()]/g, '');
    if (cleaned.startsWith('+91')) cleaned = cleaned.slice(3);
    else if (cleaned.startsWith('91') && cleaned.length === 12) cleaned = cleaned.slice(2);
    else if (cleaned.startsWith('0') && cleaned.length === 11) cleaned = cleaned.slice(1);
    return /^[6-9]\d{9}$/.test(cleaned);
  }

  function validate() {
    const errs = {};
    if (!name.trim()) errs.name = 'Student name is required.';

    if (!parentPhone.trim()) {
      errs.parentPhone = 'Parent WhatsApp number is required.';
    } else if (!validatePhone(parentPhone)) {
      errs.parentPhone = 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
    }

    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      errs.amount = 'Please enter a valid fee amount greater than 0.';
    }

    if (!dueDate) {
      errs.dueDate = 'Due date is required.';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) {
      errs.dueDate = 'Please select a valid due date.';
    }

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSaving(true);
    try {
      const token = getToken();
      const payload = {
        name: name.trim(),
        parentPhone: parentPhone.trim(),
        amount: parseFloat(amount),
        dueDate,
        note: note.trim() || null,
      };

      const url = isEditMode ? `/api/students/${id}` : '/api/students';
      const method = isEditMode ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setServerError(data.error || 'Failed to save student.');
        return;
      }

      if (isEditMode) {
        navigate(`/students/${id}`, { replace: true });
      } else {
        navigate(`/students/${data.student.id}`, { replace: true });
      }
    } catch {
      setServerError('A network error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${name}? This will also delete their fee and reminder records.`
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      const token = getToken();
      const res = await fetch(`/api/students/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('Failed to delete student.');
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(err.message || 'Could not delete student.');
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
        <div className="spinner spinner-primary" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <Link to={isEditMode ? `/students/${id}` : '/dashboard'} style={{ fontSize: 'var(--font-size-lg)', textDecoration: 'none' }}>
          ←
        </Link>
        <h1>{isEditMode ? 'Edit Student' : 'Add Student'}</h1>
      </div>

      {serverError && <div className="alert alert-error">{serverError}</div>}

      <div className="card">
        <form onSubmit={handleSubmit} noValidate>
          {/* Student Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="studentName">
              Student Name *
            </label>
            <input
              id="studentName"
              className={`form-input ${errors.name ? 'error' : ''}`}
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving || deleting}
              autoComplete="name"
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          {/* Parent WhatsApp Number */}
          <div className="form-group">
            <label className="form-label" htmlFor="parentPhone">
              Parent WhatsApp Number *
            </label>
            <input
              id="parentPhone"
              className={`form-input ${errors.parentPhone ? 'error' : ''}`}
              type="tel"
              placeholder="e.g. 9876543210"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              disabled={saving || deleting}
              autoComplete="tel"
            />
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Used to send one-tap WhatsApp fee reminders.
            </span>
            {errors.parentPhone && <span className="form-error">{errors.parentPhone}</span>}
          </div>

          {/* Fee Amount */}
          <div className="form-group">
            <label className="form-label" htmlFor="feeAmount">
              Fee Amount (₹) *
            </label>
            <input
              id="feeAmount"
              className={`form-input ${errors.amount ? 'error' : ''}`}
              type="number"
              min="1"
              step="any"
              placeholder="e.g. 1500"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={saving || deleting}
            />
            {errors.amount && <span className="form-error">{errors.amount}</span>}
          </div>

          {/* Due Date */}
          <div className="form-group">
            <label className="form-label" htmlFor="dueDate">
              Due Date *
            </label>
            <input
              id="dueDate"
              className={`form-input ${errors.dueDate ? 'error' : ''}`}
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              disabled={saving || deleting}
            />
            {errors.dueDate && <span className="form-error">{errors.dueDate}</span>}
          </div>

          {/* Optional Note */}
          <div className="form-group">
            <label className="form-label" htmlFor="note">
              Note (Optional)
            </label>
            <input
              id="note"
              className="form-input"
              type="text"
              placeholder="e.g. Sibling discount, Class 10 Batch A"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={saving || deleting}
            />
          </div>

          {/* Save Button */}
          <button type="submit" className="btn btn-primary" disabled={saving || deleting} style={{ marginTop: 'var(--space-2)' }}>
            {saving ? <span className="spinner" /> : isEditMode ? 'Update Student' : 'Save Student'}
          </button>

          {/* Cancel */}
          <Link
            to={isEditMode ? `/students/${id}` : '/dashboard'}
            className="btn btn-secondary"
            style={{ marginTop: 'var(--space-3)' }}
          >
            Cancel
          </Link>

          {/* Delete in edit mode */}
          {isEditMode && (
            <div style={{ marginTop: 'var(--space-6)', borderTop: '1px solid var(--color-border)', paddingTop: 'var(--space-4)' }}>
              <button
                type="button"
                onClick={handleDelete}
                className="btn btn-danger"
                disabled={saving || deleting}
              >
                {deleting ? <span className="spinner spinner-primary" /> : 'Delete Student'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
