import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Sign In screen — Ledger Calm design per mockups:
 *  - Route: /login
 *  - Lock hero illustration with status ping
 *  - Material Symbols icons for inputs and password visibility toggle
 *  - 256-bit encrypted ledger trust indicator
 */
export default function SignInPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  function validate() {
    const errs = {};
    if (!email.trim()) errs.email = 'Email is required.';
    if (!password) errs.password = 'Password is required.';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const { error } = await signIn({
        email: email.trim(),
        password,
      });

      if (error) {
        setServerError(error.error || 'Invalid email or password.');
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card card">
        {/* Header Illustration & Lock Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 'var(--space-4)' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'var(--color-primary-fixed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--space-3)',
              position: 'relative',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-primary)' }}>
              lock_open
            </span>
            <span
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                width: '14px',
                height: '14px',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-tertiary-container)',
                border: '2px solid #ffffff',
              }}
            />
          </div>
          <h1>Sign In</h1>
          <p className="subtitle">Welcome back to FeeReminder.</p>
        </div>

        {/* Peace of Mind Quick Status Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '8px 12px',
            backgroundColor: 'var(--color-surface-low)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-5)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--color-primary-container)' }}>
            verified_user
          </span>
          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--color-primary-container)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Fast & Secure Ledger Access
          </span>
        </div>

        {serverError && (
          <div className="alert alert-error">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Email Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              <span>Email address</span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-on-surface-variant)', fontWeight: 400 }}>Required</span>
            </label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined input-icon-prefix">mail</span>
              <input
                id="email"
                className={`form-input has-icon ${errors.email ? 'error' : ''}`}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <span className="form-error">{errors.email}</span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              <span>Password</span>
            </label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined input-icon-prefix">key</span>
              <input
                id="password"
                className={`form-input has-icon ${errors.password ? 'error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="current-password"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Toggle password visibility"
                style={{
                  position: 'absolute',
                  right: '6px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-on-surface-variant)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {errors.password && (
              <span className="form-error">{errors.password}</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ marginTop: 'var(--space-2)' }}
          >
            {loading ? (
              <span className="spinner" />
            ) : (
              <>
                <span>Sign In</span>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/signup" style={{ fontWeight: 600, color: 'var(--color-primary-container)' }}>Create one</Link>
        </p>

        {/* Trust Stamp */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: 'var(--space-4)',
            paddingTop: 'var(--space-3)',
            borderTop: '1px solid var(--color-outline-variant)',
            color: 'var(--color-on-surface-variant)',
            fontSize: 'var(--font-size-xs)',
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>lock</span>
          <span>256-bit encrypted tuition ledger</span>
        </div>
      </div>
    </div>
  );
}

