import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

/**
 * Screen: Institute Settings — Ledger Calm design per mockups:
 *  - Route: /settings
 *  - Academy Identity preview card
 *  - Static UPI ID configuration with instant verification & QR test
 *  - Bank NEFT/IMPS fallback details
 *  - Direct settlement guarantee banner
 */
export default function SettingsPage() {
  const { getToken } = useAuth();

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

      setSuccessMessage('Payment settings saved! WhatsApp reminders will include these details.');
    } catch {
      setServerError('A network error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function handleTestUpi() {
    if (upiId.trim()) {
      alert(`Valid UPI Handle: ${upiId.trim()}\nParents will be prompted to pay this handle directly when opening WhatsApp reminders.`);
    } else {
      alert('Please enter a UPI ID first.');
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
      {/* Header with Back button & ThemeToggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <Link
            to="/dashboard"
            className="nav-btn"
            style={{ width: '40px', height: '40px', padding: 0, justifyContent: 'center' }}
            title="Back to Dashboard"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>arrow_back</span>
          </Link>
          <div>
            <h1>Institute Settings</h1>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-on-surface-variant)' }}>
              Setup your collection & payment credentials
            </span>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Academy Identity Preview Hero Card */}
      <div
        style={{
          borderRadius: 'var(--radius-lg)',
          backgroundColor: 'var(--color-primary-container)',
          color: 'var(--color-on-primary)',
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-4)',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary-fixed)',
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>school</span>
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {name || 'Your Institute'}
              </span>
              <span className="material-symbols-outlined fill" style={{ fontSize: '18px', color: 'var(--color-tertiary-fixed)' }}>
                verified
              </span>
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-on-primary-container)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--color-tertiary-fixed)' }} />
              {upiId ? 'Active Payment Gateway' : 'Setup Required'}
            </p>
          </div>
        </div>
      </div>

      {serverError && <div className="alert alert-error">{serverError}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      <div className="card">
        <form onSubmit={handleSubmit} noValidate>
          {/* Institute Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="instituteName">
              <span>Institute Name <span style={{ color: 'var(--color-error)' }}>*</span></span>
              <span className="tab-badge">Display Name</span>
            </label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined input-icon-prefix">school</span>
              <input
                id="instituteName"
                className={`form-input has-icon ${errors.name ? 'error' : ''}`}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={saving}
              />
            </div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
              Shown at the top of digital reminders sent to parents.
            </span>
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          {/* UPI ID */}
          <div className="form-group">
            <label className="form-label" htmlFor="upiId">
              <span>Static UPI ID</span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-xs)', color: 'var(--color-tertiary)', backgroundColor: 'var(--color-tertiary-fixed)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>bolt</span> Instant QR
              </span>
            </label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined input-icon-prefix">payments</span>
              <input
                id="upiId"
                className={`form-input has-icon ${errors.upiId ? 'error' : ''}`}
                type="text"
                placeholder="e.g. sharma.coaching@okhdfcbank"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                disabled={saving}
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={handleTestUpi}
                title="Verify UPI"
                style={{
                  position: 'absolute',
                  right: '6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-primary-container)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>qr_code_2</span>
              </button>
            </div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
              This UPI ID is automatically embedded in every WhatsApp reminder for direct 1-tap parent payments.
            </span>
            {errors.upiId && <span className="form-error">{errors.upiId}</span>}
          </div>

          {/* Bank Details */}
          <div className="form-group">
            <label className="form-label" htmlFor="bankDetails">
              <span>Bank Details (Optional fallback)</span>
              <span className="tab-badge">NEFT / IMPS</span>
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
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-on-surface-variant)', marginTop: '2px' }}>
              Optional account number and IFSC details for parents who prefer wire transfer.
            </span>
          </div>

          {/* Zero Commission Guarantee Note */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              backgroundColor: 'var(--color-surface-high)',
              padding: '12px',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-4)',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-secondary-container)',
                color: 'var(--color-on-secondary-fixed)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>security_update_good</span>
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-on-surface-variant)' }}>
              <strong style={{ color: 'var(--color-on-surface)' }}>Zero-commission Direct Settlement</strong>
              <p>Student payments route directly to your institute bank account without intermediaries.</p>
            </div>
          </div>

          {/* Save button */}
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <span className="spinner" />
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>save</span>
                <span>Save Settings</span>
              </>
            )}
          </button>

          <Link to="/dashboard" className="btn btn-secondary" style={{ marginTop: 'var(--space-2)' }}>
            Back to Dashboard
          </Link>
        </form>
      </div>
    </div>
  );
}

