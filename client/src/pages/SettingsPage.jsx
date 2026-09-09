import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Screen: Institute Settings — per 03-app-flow.md:
 *  Route: /settings
 *  Purpose: Set the institute's static payment info (UPI ID and bank details)
 *           included in every reminder message.
 */
export default function SettingsPage() {
  const { getToken } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [bankDetails, setBankDetails] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    async function fetchSettings() {
      try {
        const token = getToken();
        const res = await fetch('/api/settings', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('Failed to load institute settings.');
        }

        const data = await res.json();
        setName(data.settings.name || '');
        setUpiId(data.settings.upi_id || '');
        setBankDetails(data.settings.bank_details || '');
      } catch (err) {
        setServerError(err.message || 'Could not load settings.');
      } finally {
        setLoading(false);
      }
    }

    fetchSettings();
  }, [getToken]);

  function validate() {
    const errs = {};
    if (!name.trim()) {
      errs.name = 'Institute name cannot be empty.';
    }

    if (upiId.trim()) {
      if (!/^[\w.\-]+@[\w.\-]+$/.test(upiId.trim())) {
        errs.upiId = 'Please enter a valid UPI ID (e.g. yourname@upi or coaching@okhdfcbank).';
      }
    }

    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    setSuccessMessage('');

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSaving(true);
    try {
      const token = getToken();
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          upiId: upiId.trim(),
          bankDetails: bankDetails.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setServerError(data.error || 'Failed to update settings.');
        return;
      }

      setSuccessMessage('Payment settings updated! Reminders will now include these details.');
    } catch {
      setServerError('A network error occurred. Please try again.');
    } finally {
      setSaving(false);
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
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <Link to="/dashboard" style={{ fontSize: 'var(--font-size-lg)', textDecoration: 'none' }}>
          ←
        </Link>
        <h1>Institute Settings</h1>
      </div>

      {serverError && <div className="alert alert-error">{serverError}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="card">
        <form onSubmit={handleSubmit} noValidate>
          {/* Institute Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="instituteName">
              Institute Name *
            </label>
            <input
              id="instituteName"
              className={`form-input ${errors.name ? 'error' : ''}`}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={saving}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          {/* UPI ID */}
          <div className="form-group">
            <label className="form-label" htmlFor="upiId">
              Static UPI ID
            </label>
            <input
              id="upiId"
              className={`form-input ${errors.upiId ? 'error' : ''}`}
              type="text"
              placeholder="e.g. sharma.coaching@okhdfcbank"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              disabled={saving}
            />
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              This UPI ID is automatically included in every WhatsApp reminder message so parents can pay directly.
            </span>
            {errors.upiId && <span className="form-error">{errors.upiId}</span>}
          </div>

          {/* Bank Details */}
          <div className="form-group">
            <label className="form-label" htmlFor="bankDetails">
              Bank Details (Optional fallback)
            </label>
            <textarea
              id="bankDetails"
              className="form-input"
              rows="3"
              placeholder="e.g. A/C No: 1234567890, IFSC: HDFC0001234, Name: Sharma Classes"
              value={bankDetails}
              onChange={(e) => setBankDetails(e.target.value)}
              disabled={saving}
            />
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
              Optional account number / IFSC details for parents paying via NEFT/IMPS.
            </span>
          </div>

          {/* Save button */}
          <button type="submit" className="btn btn-primary" disabled={saving} style={{ marginTop: 'var(--space-2)' }}>
            {saving ? <span className="spinner" /> : 'Save Settings'}
          </button>

          <Link to="/dashboard" className="btn btn-secondary" style={{ marginTop: 'var(--space-3)' }}>
            Back to Dashboard
          </Link>
        </form>
      </div>
    </div>
  );
}
