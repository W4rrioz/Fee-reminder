import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Sign Up screen — per 03-app-flow.md:
 *  Route: /signup
 *  Fields: Institute name, Email, Password
 *  Loading: Button spinner while creating account
 *  Error: Inline validation + server errors
 *  Success: Redirect to /dashboard
 */
export default function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [instituteName, setInstituteName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
        // Show field-level validation errors if the backend returned them
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
        <h1>Create Account</h1>
        <p className="subtitle">Set up your institute in under a minute.</p>

        {serverError && (
          <div className="alert alert-error">{serverError}</div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="instituteName">
              Institute Name
            </label>
            <input
              id="instituteName"
              className={`form-input ${errors.instituteName ? 'error' : ''}`}
              type="text"
              placeholder="e.g. Sharma Coaching Centre"
              value={instituteName}
              onChange={(e) => setInstituteName(e.target.value)}
              disabled={loading}
              autoComplete="organization"
            />
            {errors.instituteName && (
              <span className="form-error">{errors.instituteName}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && (
              <span className="form-error">{errors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              type="password"
              placeholder="At least 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              autoComplete="new-password"
            />
            {errors.password && (
              <span className="form-error">{errors.password}</span>
            )}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
