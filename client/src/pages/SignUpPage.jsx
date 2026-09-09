import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Sign Up screen — Ledger Calm design per mockups:
 *  - Route: /signup
 *  - Academy hero illustration
 *  - Inputs with Material Symbol icons (school, mail, key)
 *  - Password visibility toggle
 */
export default function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [instituteName, setInstituteName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');

  function validate() {
    const errs = {};
    if (!instituteName.trim()) errs.instituteName = 'Institute name is required.';
    if (!email.trim()) {
      errs.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }
    if (!password) {
      errs.password = 'Password is required.';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
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
      const { error } = await signUp({
        email: email.trim(),
        password,
        instituteName: instituteName.trim(),
      });

      if (error) {
        if (error.errors) {
          setErrors(error.errors);
        }
        setServerError(error.error || 'Something went wrong. Please try again.');
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
        {/* Header Illustration */}
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
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '32px', color: 'var(--color-primary)' }}>
              school
            </span>
          </div>
          <h1>Create Account</h1>
          <p className="subtitle">Set up your institute in under a minute.</p>
        </div>

        {serverError && (
          <div className="alert alert-error">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          {/* Institute Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="instituteName">
              <span>Institute Name</span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-on-surface-variant)', fontWeight: 400 }}>Required</span>
            </label>
            <div className="input-with-icon">
              <span className="material-symbols-outlined input-icon-prefix">school</span>
              <input
                id="instituteName"
                className={`form-input has-icon ${errors.instituteName ? 'error' : ''}`}
                type="text"
                placeholder="e.g. Sharma Coaching Centre"
                value={instituteName}
                onChange={(e) => setInstituteName(e.target.value)}
                disabled={loading}
                autoComplete="organization"
              />
            </div>
            {errors.instituteName && (
              <span className="form-error">{errors.instituteName}</span>
            )}
          </div>

          {/* Email */}
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

          {/* Password */}
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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
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
                <span>Create Account</span>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" style={{ fontWeight: 600, color: 'var(--color-primary-container)' }}>Sign In</Link>
        </p>
      </div>
    </div>
  );
}

